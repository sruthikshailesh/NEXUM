import {
  ArrowUpRight,
  CheckCheck,
  Download,
  FileClock,
  FileText,
  Plus,
  Sparkles,
} from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import {
  Badge,
  DemoNote,
  EmptyState,
  formatDate,
  Modal,
  PageHeader,
  SearchInput,
  Select,
  SourceLink,
  statusTone,
} from '../components/UI'
import type { Report } from '../types'
export default function HandoverReports({
  projectId,
  embedded = false,
}: {
  projectId?: string
  embedded?: boolean
}) {
  const {
    projects,
    reports,
    sources,
    preferences,
    generateReport,
    reviewReport,
    selectedSource,
    setSelectedSource,
    notify,
  } = useApp()
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [project, setProject] = useState(projectId || 'all')
  const [creating, setCreating] = useState(false)
  const [target, setTarget] = useState(
    projectId || preferences.defaultProjectId || projects[0]?.id || '',
  )
  const selected = reports.find((report) => report.id === params.get('report'))
  const selectReport = (id: string | null) => {
    const next = new URLSearchParams(params)
    if (id) next.set('report', id)
    else next.delete('report')
    setParams(next, { replace: true })
  }
  const filtered = reports.filter(
    (report) =>
      (project === 'all' || report.projectId === project) &&
      report.title.toLowerCase().includes(query.toLowerCase()),
  )
  function download(report: Report) {
    const text = `${report.title}\nSAMPLE REPORT — Prepared from frontend demo data. No AI processing.\nCreated: ${formatDate(report.date)}\nStatus: ${report.status}\n\n${report.sections.map((section, index) => `${index + 1}. ${section.title}\n${section.content}\n`).join('\n')}\nSupporting source records\n${report.sourceIds.map((id) => sources.find((source) => source.id === id)?.name || id).join('\n')}`
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `nexum-${report.projectId}-sample-handover.txt`
    anchor.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    notify('Sample report exported as a text file.')
  }
  return (
    <>
      {!embedded && (
        <PageHeader
          eyebrow="CONTINUITY, BY DESIGN"
          title="Handover Reports"
          description="Help the next person start with context, not questions."
          actions={
            <button className="button button-primary" onClick={() => setCreating(true)}>
              <Plus size={17} />
              Generate Handover
            </button>
          }
        />
      )}
      <div className="report-banner">
        <div className="report-banner-illustration">
          <FileText size={32} strokeWidth={1.2} />
          <span>
            <CheckCheck size={13} />
          </span>
        </div>
        <div>
          <Badge tone="violet">PHASE 1 PREVIEW</Badge>
          <h3>A thoughtful handover. Nothing left between the lines.</h3>
          <p>
            Nine structured sections connect the current state, decisions, risks, and next steps.
          </p>
        </div>
        <button className="button button-secondary" onClick={() => setCreating(true)}>
          <Sparkles size={16} />
          Create sample
        </button>
      </div>
      <div className="toolbar">
        <SearchInput value={query} onChange={setQuery} placeholder="Search reports..." />
        {!projectId && (
          <Select label="Filter reports by project" value={project} onChange={setProject}>
            <option value="all">All projects</option>
            {projects.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </Select>
        )}
      </div>
      <div className="results-label">
        {filtered.length} {filtered.length === 1 ? 'report' : 'reports'}
        <span>Prepared for the next chapter</span>
      </div>
      {filtered.length ? (
        <div className="reports-grid">
          {filtered.map((report) => (
            <button
              className="report-card panel"
              key={report.id}
              onClick={() => selectReport(report.id)}
            >
              <div className="report-card-top">
                <span className="report-icon">
                  <FileClock size={23} strokeWidth={1.5} />
                </span>
                <Badge tone={statusTone(report.status)} dot>
                  {report.status}
                </Badge>
              </div>
              <div className="report-project">
                {projects.find((item) => item.id === report.projectId)?.name}
              </div>
              <h3>{report.title}</h3>
              <p>Decisions, open questions, and the evidence that connects them.</p>
              <div className="report-dates">
                <span>
                  Created<strong>{formatDate(report.date)}</strong>
                </span>
                <span>
                  Last updated<strong>{formatDate(report.updatedAt)}</strong>
                </span>
              </div>
              <div className="report-card-footer">
                <span>
                  {report.sections.length} sections<span className="middle-dot">·</span>Sample
                  report
                </span>
                <span>
                  Read report
                  <ArrowUpRight size={14} />
                </span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FileClock}
          title="The next chapter starts here"
          description="Create a sample handover from your project's current local data."
          action={
            <button className="button button-secondary" onClick={() => setCreating(true)}>
              <Plus size={16} />
              Create sample report
            </button>
          }
        />
      )}
      <DemoNote>
        Reports are locally assembled sample previews. They are not generated by an AI model and
        must be verified before use.
      </DemoNote>
      {creating && (
        <Modal
          title="Generate a sample handover"
          description="A structured preview, built from the records in this session."
          onClose={() => setCreating(false)}
        >
          <div className="modal-form">
            <label>
              Choose a project
              <Select label="Handover project" value={target} onChange={setTarget}>
                {projects.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </Select>
            </label>
            <div className="info-box">
              <FileText size={18} />
              <p>
                This creates a clearly labeled, nine-section sample report using a local template.
                It does not analyze files or call an AI service. Missing information stays marked as
                unknown.
              </p>
            </div>
            <div className="modal-actions">
              <button className="button button-secondary" onClick={() => setCreating(false)}>
                Cancel
              </button>
              <button
                className="button button-primary"
                disabled={!target}
                onClick={() => {
                  const report = generateReport(target)
                  setCreating(false)
                  setProject(projectId || 'all')
                  setQuery('')
                  selectReport(report.id)
                }}
              >
                <Plus size={16} />
                Create sample report
              </button>
            </div>
          </div>
        </Modal>
      )}
      {selected && !selectedSource && (
        <Modal
          wide
          title={selected.title}
          description={`${projects.find((item) => item.id === selected.projectId)?.name} · Prepared ${formatDate(selected.date)}`}
          onClose={() => selectReport(null)}
        >
          <div className="report-detail">
            <div className="report-detail-actions">
              <Badge tone="violet">Sample report · No AI used</Badge>
              <div>
                <button
                  className="button button-secondary button-sm"
                  disabled={selected.status === 'Reviewed'}
                  onClick={() => reviewReport(selected.id)}
                >
                  <CheckCheck size={14} />
                  {selected.status === 'Reviewed' ? 'Reviewed' : 'Mark reviewed'}
                </button>
                <button
                  className="button button-secondary button-sm"
                  onClick={() => download(selected)}
                >
                  <Download size={14} />
                  Export .txt
                </button>
              </div>
            </div>
            <div className="report-contents">
              <span className="eyebrow">IN THIS REPORT</span>
              {selected.sections.map((section, index) => (
                <a key={section.title} href={`#report-section-${index}`}>
                  {String(index + 1).padStart(2, '0')}
                  <span>{section.title}</span>
                </a>
              ))}
            </div>
            {selected.sections.map((section, index) => (
              <section
                className="report-section"
                id={`report-section-${index}`}
                key={section.title}
              >
                <h3>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  {section.title}
                </h3>
                <p>{section.content}</p>
              </section>
            ))}
            <div className="detail-section">
              <h3>Open supporting sources</h3>
              {selected.sourceIds.length ? (
                selected.sourceIds.map((id) => {
                  const source = sources.find((item) => item.id === id)
                  return (
                    source && (
                      <SourceLink
                        key={id}
                        name={source.name}
                        onClick={() => {
                          selectReport(null)
                          setSelectedSource(source)
                        }}
                      />
                    )
                  )
                })
              ) : (
                <p className="muted">No supporting sources have been added to this project.</p>
              )}
            </div>
            <DemoNote>
              Review every claim with your team before relying on this sample handover.
            </DemoNote>
          </div>
        </Modal>
      )}
    </>
  )
}
