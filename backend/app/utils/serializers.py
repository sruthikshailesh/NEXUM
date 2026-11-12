"""Map ORM rows to API schemas in one place so every route stays consistent."""

from ..models.claim import Claim
from ..models.conflict import Conflict
from ..models.project import Project
from ..models.report import Report
from ..models.source import Source
from ..schemas.analysis import ClaimOut, EvidenceOut
from ..schemas.conflict import ConflictEvidenceOut, ConflictOut
from ..schemas.project import ProjectOut
from ..schemas.report import ReportOut, ReportSection
from ..schemas.source import SourceOut
from ..utils.text import human_size


def project_out(project: Project) -> ProjectOut:
    return ProjectOut.model_validate(project)


def source_out(source: Source, include_content: bool = True) -> SourceOut:
    return SourceOut(
        id=source.id,
        project_id=source.project_id,
        name=source.name,
        type=source.file_type,
        date=source.created_at,
        status=source.status,
        summary=source.summary,
        content=(source.extracted_text or "")[:60000] if include_content else "",
        size=human_size(source.size_bytes),
        size_bytes=source.size_bytes,
        page_count=source.page_count,
        chunk_count=len(source.chunks),
    )


def source_name_map(sources: list[Source]) -> dict[str, str]:
    return {source.id: source.name for source in sources}


def claim_out(claim: Claim, names: dict[str, str]) -> ClaimOut:
    return ClaimOut(
        id=claim.id,
        project_id=claim.project_id,
        kind=claim.kind,
        epistemic_type=claim.epistemic_type,
        title=claim.title,
        detail=claim.detail,
        rationale=claim.rationale,
        status=claim.status,
        people=list(claim.people or []),
        created_at=claim.created_at,
        evidence=[
            EvidenceOut(
                source_id=item.source_id,
                source_name=names.get(item.source_id, "Unknown source"),
                page=item.page,
                quote=item.quote,
                verified=item.verified,
            )
            for item in claim.evidence
            if item.verified
        ],
    )


def conflict_out(conflict: Conflict, names: dict[str, str]) -> ConflictOut:
    return ConflictOut(
        id=conflict.id,
        project_id=conflict.project_id,
        title=conflict.title,
        description=conflict.description,
        date=conflict.created_at,
        status=conflict.status,
        resolution=conflict.resolution,
        evidence=[
            ConflictEvidenceOut(
                source_id=item.source_id,
                source_name=names.get(item.source_id, "Unknown source"),
                page=item.page,
                claim=item.quote,
                quote=item.quote,
                date=conflict.created_at,
                author=names.get(item.source_id, "Source document"),
            )
            for item in conflict.evidence
            if item.verified
        ],
    )


def report_out(report: Report) -> ReportOut:
    return ReportOut(
        id=report.id,
        title=report.title,
        project_id=report.project_id,
        date=report.created_at,
        updated_at=report.updated_at,
        status=report.status,
        sections=[ReportSection(**section) for section in report.sections],
        source_ids=list(report.source_ids or []),
        markdown=report.markdown,
    )
