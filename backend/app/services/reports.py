"""Handover reports assembled only from stored, verified claims and chunks."""

from sqlalchemy.orm import Session

from ..models.claim import Claim
from ..models.conflict import Conflict
from ..models.project import Project
from ..models.report import Report
from ..schemas.report import ReportCreate
from ..utils.errors import AppError
from .analysis import latest_analysis

SECTION_TITLES = [
    "Project Overview",
    "Current Project State",
    "Technical Decisions",
    "Completed Work",
    "Incomplete Work",
    "Risks and Dependencies",
    "Unresolved Questions",
    "Recommended Next Actions",
    "Evidence and References",
]

TYPE_LABEL = {"confirmed": "Confirmed", "assumption": "Assumption", "unknown": "Unknown"}


def _reference(evidence, names: dict[str, str]) -> str:
    name = names.get(evidence.source_id, "Unknown source")
    page = f", p.{evidence.page}" if evidence.page else ""
    return f'[{name}{page}] "{evidence.quote.strip()}"'


def _claim_lines(
    claims: list[Claim],
    names: dict[str, str],
    allowed_source_ids: set[str],
    show_rationale: bool = False,
) -> list[str]:
    lines: list[str] = []
    for claim in claims:
        evidence = [
            _reference(item, names)
            for item in claim.evidence
            if item.verified and item.source_id in allowed_source_ids
        ]
        if not evidence:
            continue
        line = f"- {claim.title} ({TYPE_LABEL.get(claim.epistemic_type, claim.epistemic_type)})."
        if claim.detail:
            line += f" {claim.detail}"
        if show_rationale and claim.rationale:
            line += f" Reasoning: {claim.rationale}"
        line += f"\n  Evidence: {'; '.join(evidence)}"
        lines.append(line)
    return lines


def _conflict_lines(
    conflicts: list[Conflict],
    names: dict[str, str],
    include_resolution: bool,
    allowed_source_ids: set[str],
) -> list[str]:
    lines: list[str] = []
    for conflict in conflicts:
        sides = [
            f"{names.get(item.source_id, 'Unknown source')}"
            f"{f', p.{item.page}' if item.page else ''}: \"{item.quote}\""
            for item in conflict.evidence
            if item.verified and item.source_id in allowed_source_ids
        ]
        if not sides:
            continue
        line = f"- {conflict.title} — {conflict.status}. {conflict.description}"
        if sides:
            line += f"\n  Sides: {' | '.join(sides)}"
        if include_resolution and conflict.resolution:
            line += f"\n  Human resolution: {conflict.resolution}"
        lines.append(line)
    return lines


def _join(lines: list[str], fallback: str) -> str:
    return "\n".join(lines) if lines else fallback


def build_report(db: Session, project: Project, payload: ReportCreate) -> Report:
    sources = list(project.sources)
    if payload.source_ids is not None:
        wanted = set(payload.source_ids)
        sources = [source for source in sources if source.id in wanted]
        if len(sources) != len(wanted):
            raise AppError("source_not_in_project", "A selected source does not belong to this project.", 400)
    names = {source.id: source.name for source in sources}
    source_ids = [source.id for source in sources]

    claims = (
        db.query(Claim)
        .filter(Claim.project_id == project.id)
        .order_by(Claim.created_at.asc())
        .all()
    )
    if payload.decision_ids is not None:
        wanted_decisions = set(payload.decision_ids)
        claims = [claim for claim in claims if claim.id in wanted_decisions]
    allowed_source_ids = set(source_ids)
    # Only claims supported by at least one selected source may appear in the report.
    claims = [
        claim
        for claim in claims
        if any(
            item.verified and item.source_id in allowed_source_ids for item in claim.evidence
        )
    ]

    conflicts = db.query(Conflict).filter(Conflict.project_id == project.id).all()
    if payload.conflict_ids is not None:
        wanted_conflicts = set(payload.conflict_ids)
        conflicts = [conflict for conflict in conflicts if conflict.id in wanted_conflicts]
    # A scoped report only shows a conflict when every side comes from a selected source.
    conflicts = [
        conflict
        for conflict in conflicts
        if (verified_sides := [item for item in conflict.evidence if item.verified])
        and all(item.source_id in allowed_source_ids for item in verified_sides)
    ]

    by_kind: dict[str, list[Claim]] = {}
    for claim in claims:
        by_kind.setdefault(claim.kind, []).append(claim)

    run = latest_analysis(db, project.id)
    open_conflicts = [conflict for conflict in conflicts if conflict.status != "Resolved"]
    resolved_conflicts = [conflict for conflict in conflicts if conflict.status == "Resolved"]
    chunk_total = sum(len(source.chunks) for source in sources)

    summary = (
        run.summary
        if run and run.summary
        else "No AI summary is stored for this project yet. The sections below list only explicitly "
        "recorded claims and their source references."
    )

    overview = (
        f"{project.name}: {project.description or 'No description provided.'}\n"
        f"Declared stack: {', '.join(project.stack) if project.stack else 'Not specified.'}\n"
        f"Sources in this report: {len(sources)} ({chunk_total} searchable chunks).\n"
        f"Claims with verified evidence: {len(claims)}.\n"
        f"Report generated {project.updated_at.strftime('%Y-%m-%d %H:%M UTC')}."
    )

    state = (
        f"{summary}\n\n"
        f"Recorded: {len(claims)} claims with verified citations, {len(open_conflicts)} open "
        f"conflicts and {len(resolved_conflicts)} human-resolved conflicts. "
        "Where sources disagree, both sides are shown and no source is chosen automatically."
    )

    decisions = _claim_lines(
        by_kind.get("decision", []), names, allowed_source_ids, show_rationale=True
    )
    completed = _claim_lines(by_kind.get("completed", []), names, allowed_source_ids)
    pending = _claim_lines(by_kind.get("pending", []), names, allowed_source_ids)
    risks = _claim_lines(
        by_kind.get("risk", []), names, allowed_source_ids
    ) + _claim_lines(by_kind.get("dependency", []), names, allowed_source_ids)
    questions = _claim_lines(by_kind.get("question", []), names, allowed_source_ids)
    actions = _claim_lines(by_kind.get("next_action", []), names, allowed_source_ids)

    if open_conflicts:
        pending.extend(
            _conflict_lines(
                open_conflicts, names, include_resolution=False,
                allowed_source_ids=allowed_source_ids,
            )
        )
        questions.extend(
            f"- Which evidence and owner sign-off will settle \"{conflict.title}\"?"
            for conflict in open_conflicts
        )
        actions.append(
            "- Review both sides of every open conflict with the source documents, record an owner, "
            "then mark it reviewed or resolved. Do not decide by timestamp alone."
        )

    evidence_lines: list[str] = []
    for source in sources:
        pages = f", {source.page_count} pages" if source.page_count else ""
        evidence_lines.append(
            f"- {source.name} — {source.file_type}{pages}, {len(source.chunks)} chunks, "
            f"uploaded {source.created_at.strftime('%Y-%m-%d')}."
        )
    for claim in claims:
        evidence_lines.extend(
            f"- {claim.title}: {_reference(item, names)}"
            for item in claim.evidence
            if item.verified
        )
    if resolved_conflicts:
        evidence_lines.extend(
            _conflict_lines(
                resolved_conflicts, names, include_resolution=True,
                allowed_source_ids=allowed_source_ids,
            )
        )

    sections = [
        {"title": SECTION_TITLES[0], "content": overview},
        {"title": SECTION_TITLES[1], "content": state},
        {
            "title": SECTION_TITLES[2],
            "content": _join(
                decisions,
                "No technical decisions with verified evidence are stored. Run analysis after "
                "uploading sources; a declared stack alone is not a decision record.",
            ),
        },
        {
            "title": SECTION_TITLES[3],
            "content": _join(
                completed,
                "No explicitly documented completed work is stored. Absence of a record means "
                "completion is unknown, not that no work was done.",
            ),
        },
        {
            "title": SECTION_TITLES[4],
            "content": _join(
                pending,
                "No explicitly documented incomplete work or pending tasks are stored. The backlog "
                "remains unverified.",
            ),
        },
        {
            "title": SECTION_TITLES[5],
            "content": _join(
                risks,
                "No verified risks or dependencies are stored. This is an evidence gap, not "
                "confirmation that none exist.",
            ),
        },
        {
            "title": SECTION_TITLES[6],
            "content": _join(
                questions,
                "No unresolved questions are stored. Confirm unknowns with the project team.",
            ),
        },
        {
            "title": SECTION_TITLES[7],
            "content": _join(
                actions,
                "No next actions with verified evidence are stored. Review the sources and agree "
                "owners before treating any task list as complete.",
            ),
        },
        {
            "title": SECTION_TITLES[8],
            "content": _join(
                evidence_lines,
                "No sources or verified evidence are available. Nothing has been fabricated.",
            ),
        },
    ]

    title = (payload.title or f"{project.name} — Handover").strip()
    markdown_lines = [
        f"# {title}",
        "",
        "> Generated from stored sources and verified quotes. No claim is invented; "
        "review with the project team before relying on it.",
        "",
    ]
    for index, section in enumerate(sections, start=1):
        markdown_lines += [f"## {index}. {section['title']}", "", section["content"], ""]

    report = Report(
        project_id=project.id,
        title=title[:240],
        status="Generated",
        sections=sections,
        source_ids=source_ids,
        markdown="\n".join(markdown_lines).strip() + "\n",
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report
