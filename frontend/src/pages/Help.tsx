import {
  ArrowRight,
  BookOpen,
  FileClock,
  FolderPlus,
  Info,
  ShieldCheck,
  UploadCloud,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/UI'
import { useApp } from '../context/AppContext'

const handoverSections = [
  'Project Overview',
  'Current Project State',
  'Technical Decisions',
  'Completed Work',
  'Incomplete Work',
  'Risks and Dependencies',
  'Unresolved Questions',
  'Recommended Next Actions',
  'Evidence and References',
]

export default function Help() {
  const { setNewProjectOpen, demoMode } = useApp()

  return (
    <>
      <PageHeader
        eyebrow="A LITTLE CONTEXT GOES A LONG WAY"
        title="Help & getting started"
        description="From scattered records to a handover someone can actually use."
      />
      <div className="info-box">
        <Info size={18} aria-hidden="true" />
        <p>
          {demoMode
            ? 'You are exploring fictional ShopSphere demo data. Changes stay in this session; no AI or backend is used for demo records.'
            : 'You are connected to the NEXUM backend. Upload sources to a project, run analysis, review evidence, then generate a handover. Your data is stored in the local SQLite database.'}
        </p>
      </div>

      <section aria-labelledby="getting-started-title">
        <div className="settings-section-title">
          <BookOpen size={20} aria-hidden="true" />
          <h2 id="getting-started-title">Start with the essentials</h2>
        </div>
        <div className="help-grid">
          <button type="button" className="panel help-card" onClick={() => setNewProjectOpen(true)}>
            <FolderPlus size={24} aria-hidden="true" />
            <span className="micro muted">01 · YOUR WORKSPACE</span>
            <strong>Create a project</strong>
            <span className="muted">
              Give your project a name, describe its purpose, and add its technology stack.
            </span>
            <span className="text-link">
              New project
              <ArrowRight size={15} aria-hidden="true" />
            </span>
          </button>
          <Link className="panel help-card" to="/knowledge">
            <UploadCloud size={24} aria-hidden="true" />
            <span className="micro muted">02 · YOUR SOURCES</span>
            <strong>Add your sources</strong>
            <span className="muted">
              Open the knowledge base, choose Add sources, and select files for a project.
            </span>
            <span className="text-link">
              Open knowledge base
              <ArrowRight size={15} aria-hidden="true" />
            </span>
          </Link>
          <Link className="panel help-card" to="/conflicts">
            <ShieldCheck size={24} aria-hidden="true" />
            <span className="micro muted">03 · YOUR JUDGMENT</span>
            <strong>Review the evidence</strong>
            <span className="muted">
              Compare sample claims with their original sources and record a human resolution.
            </span>
            <span className="text-link">
              Review conflicts
              <ArrowRight size={15} aria-hidden="true" />
            </span>
          </Link>
        </div>
      </section>

      <section className="panel settings-section" aria-labelledby="conflict-guide-title">
        <div className="settings-section-title">
          <ShieldCheck size={20} aria-hidden="true" />
          <div>
            <h2 id="conflict-guide-title">When the records disagree</h2>
            <p className="muted">Manual conflict review keeps the decision with you.</p>
          </div>
        </div>
        <ol className="help-steps">
          <li className="help-step">
            <div>
              <h3>Compare both claims</h3>
              <p className="muted">
                In Evidence & Conflicts, filter by project or status. Read the claims side by side,
                including their dates and authors. A newer timestamp alone does not establish the
                truth.
              </p>
            </div>
          </li>
          <li className="help-step">
            <div>
              <h3>Open the underlying sources</h3>
              <p className="muted">
                Use View Source for each claim and More evidence detail for additional context.
                Check what was proposed, what was approved, and what was actually implemented.
              </p>
            </div>
          </li>
          <li className="help-step">
            <div>
              <h3>Record the human decision</h3>
              <p className="muted">
                Mark as Reviewed moves a conflict to Under Review; it does not resolve it. Choose
                Resolve Conflict when ready, write a rationale of at least 15 characters, and save
                the resolution. Include the current source of truth and any follow-up needed.
              </p>
            </div>
          </li>
        </ol>
        <p className="muted micro">
          NEXUM does not decide which claim is correct or detect new conflicts from your files.
          Review status and resolutions reset on reload.
        </p>
        <Link className="button button-secondary button-sm" to="/conflicts">
          Open evidence & conflicts
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </section>

      <section className="panel settings-section" aria-labelledby="handover-guide-title">
        <div className="settings-section-title">
          <FileClock size={20} aria-hidden="true" />
          <div>
            <h2 id="handover-guide-title">A handover with nine clear sections</h2>
            <p className="muted">A structured starting point, not an AI-generated assessment.</p>
          </div>
        </div>
        <p>
          {demoMode
            ? 'Open Handover Reports to explore a sample report. Reports are assembled from demo records and predefined content; adding a file does not analyze it.'
            : 'Open Handover Reports and generate one for a project. Reports are assembled from stored claims whose quotes were verified against your uploaded sources.'}
        </p>
        <ol className="help-steps">
          {handoverSections.map((title) => (
            <li className="help-step" key={title}>
              {title}
            </li>
          ))}
        </ol>
        <p className="muted">
          Check each section against its references, distinguish incomplete work from completed
          work, and keep unresolved questions visible. Marking a report as reviewed records your
          human review; it does not verify its claims.
        </p>
        <Link className="button button-secondary button-sm" to="/handovers">
          Explore handover reports
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </section>

      <section className="panel settings-section" aria-labelledby="faq-title">
        <div className="settings-section-title">
          <BookOpen size={20} aria-hidden="true" />
          <h2 id="faq-title">Frequently asked questions</h2>
        </div>
        <div className="faq-list">
          <details className="faq-item">
            <summary>Will my changes be here when I come back?</summary>
            <p>
              {demoMode
                ? 'No. Demo records and profile preferences are held only in memory while this page is open. Reloading or closing the page resets the demo workspace. There is no account or server save for demo data.'
                : 'Yes for projects, sources, claims, conflicts and reports: they are stored by the NEXUM backend. Profile and appearance preferences are display-only and reset with this browser session. There is no authentication yet.'}
            </p>
          </details>
          <details className="faq-item">
            <summary>Which files can I add, and what are the limits?</summary>
            <p>
              Use PDF (.pdf), DOCX (.docx), plain text (.txt), or Markdown (.md) files. Each file
              can be up to 10 MB, with up to 10 files per batch. In the{' '}
              <Link className="text-link" to="/knowledge">
                knowledge base
              </Link>
              , choose Add sources, select a destination project, then browse or drop files and
              confirm.
            </p>
            <p>
              {demoMode
                ? 'In demo mode, text previews are limited to 60,000 characters and PDF/DOCX content is not extracted. Nothing is uploaded or analyzed.'
                : 'The backend extracts text, keeps PDF page numbers, and splits text into overlapping chunks. Scanned, empty, corrupt and password-protected files are rejected with a clear message. AI runs only when you press Analyze sources.'}
            </p>
          </details>
          <details className="faq-item">
            <summary>Is AI connected? Will adding files find decisions or conflicts?</summary>
            <p>
              {demoMode
                ? 'Not for demo records. They are fictional examples and no AI runs on them.'
                : 'Yes, when you press Analyze sources. The backend sends small per-source batches to Groq, validates the JSON, and keeps a claim only if its quote exists in a stored chunk. Conflicts are shown for human review and are never auto-resolved.'}
            </p>
          </details>
          <details className="faq-item">
            <summary>What does preparing a sample report do?</summary>
            <p>
              {demoMode
                ? 'It creates a nine-section sample handover from demo records and predefined content. No AI is used and nothing is sent anywhere.'
                : 'It assembles a nine-section handover from stored verified claims and sources. It does not invent missing information; gaps stay explicit.'}{' '}
              Explore{' '}
              <Link className="text-link" to="/handovers">
                Handover Reports
              </Link>
              , check the evidence, and treat the report as a demo draft rather than a verified
              project assessment.
            </p>
          </details>
          <details className="faq-item">
            <summary>Does Mark as Reviewed resolve a conflict?</summary>
            <p>
              No. It moves the conflict to Under Review. To resolve it, read both sources, choose
              Resolve Conflict, and enter a rationale of at least 15 characters before saving. The
              rationale should explain what you accepted, why, and what still needs follow-up.
              {demoMode ? ' Both actions last only for this session.' : ' Both actions are saved to the backend.'}
            </p>
          </details>
          <details className="faq-item">
            <summary>Can I connect GitHub or import pull requests and tasks?</summary>
            <p>
              Not yet. GitHub repository records, pull requests, and task records appear as sample
              source types only. Live GitHub connections and importing those source types are future
              capabilities, not active integrations. No repository is fetched, synchronized, or
              authenticated.
            </p>
          </details>
          <details className="faq-item">
            <summary>Where do I change my profile or project defaults?</summary>
            <p>
              Open{' '}
              <Link className="text-link" to="/settings">
                Settings
              </Link>
              . Edit your display name and role, then choose Save profile. Appearance switches and
              project defaults apply immediately for the session. The role is a display label, not
              an access permission, and dark is the only available theme.
            </p>
          </details>
        </div>
      </section>
    </>
  )
}
