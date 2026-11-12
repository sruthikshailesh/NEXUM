import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  FileClock,
  FileText,
  GitBranch,
  HelpCircle,
  Layers3,
  LoaderCircle,
  Plus,
  ShieldAlert,
  Sparkles,
} from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, useParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import ActivityFeed from '../components/ActivityFeed'
import {
  Avatars,
  Badge,
  DemoNote,
  EmptyState,
  ProjectIcon,
  SectionTitle,
  SourceLink,
  statusTone,
} from '../components/UI'
import UploadModal from '../components/UploadModal'
import KnowledgeBase from './KnowledgeBase'
import Decisions from './Decisions'
import Conflicts from './Conflicts'
import HandoverReports from './HandoverReports'
const tabs = ['Overview', 'Sources', 'Context', 'Decisions', 'Conflicts', 'Handover']
const sampleTasks: Record<string, { title: string; owner: string }[]> = {
  shopsphere: [
    { title: 'Replay delayed and duplicate payment events', owner: 'Samir Khan' },
    { title: 'Finish the reconciliation recovery runbook', owner: 'Aisha Mehta' },
    { title: 'Assign the final retry re-enable sign-off', owner: 'Unassigned' },
    { title: 'Plan the next handover walkthrough', owner: 'Unassigned' },
  ],
  carebridge: [
    { title: 'Approve an audit-retention policy', owner: 'Nisha Patel' },
    { title: 'Complete the role-access review', owner: 'Aisha Mehta' },
  ],
  devflow: [
    { title: 'Align onboarding copy with advisory warnings', owner: 'Riley Das' },
    { title: 'Review pilot acceptance criteria', owner: 'Jordan Lee' },
  ],
}
const sampleQuestions: Record<string, string[]> = {
  shopsphere: [
    'Who provides the final sign-off to re-enable payment retries?',
    'What load profile should the PostgreSQL search release gate use?',
    'When should the next developer handover walkthrough happen?',
  ],
  carebridge: [
    'Which retention period is approved by the privacy owner?',
    'Should referral audits and appointment history have different retention rules?',
  ],
  devflow: [
    'Who signs off the corrected onboarding copy?',
    'What pilot feedback would justify enforced work-in-progress limits?',
  ],
}
export default function ProjectWorkspace() {
  const { projectId = '', tab = 'overview' } = useParams()
  const {
    projects,
    sources,
    decisions,
    conflicts,
    setSelectedSource,
    demoMode,
    actions,
    questions: extractedQuestions,
    analyzeProject,
    analyzing,
    analysisError,
  } = useApp()
  const project = projects.find((item) => item.id === projectId)
  const [uploading, setUploading] = useState(false)
  const [completedTasks, setCompletedTasks] = useState<string[]>([])
  if (!project)
    return (
      <EmptyState
        title="Project not found"
        description={
          demoMode
            ? 'This project may have belonged to an earlier demo session. Load demo data again to explore, or exit demo mode to use the live workspace.'
            : 'This project does not exist in the backend. It may have been deleted, or the link may be out of date.'
        }
        action={
          <Link className="button button-primary" to="/projects">
            <ArrowLeft size={16} />
            Back to projects
          </Link>
        }
      />
    )
  const projectSources = sources.filter((item) => item.projectId === project.id)
  const projectDecisions = decisions.filter((item) => item.projectId === project.id)
  const projectConflicts = conflicts.filter(
    (item) => item.projectId === project.id && item.status !== 'Resolved',
  )
  const tasks = demoMode
    ? sampleTasks[project.id] || []
    : actions
        .filter((item) => item.projectId === project.id)
        .map((item) => ({ title: item.title, owner: item.owner }))
  const questions = demoMode
    ? sampleQuestions[project.id] || []
    : extractedQuestions.filter((item) => item.projectId === project.id).map((item) => item.title)
  const base = `/projects/${project.id}`
  const taskPanel = (
    <section className="panel workspace-task-panel">
      <SectionTitle
        title="Pending tasks"
        count={
          tasks.filter((task) => !completedTasks.includes(`${project.id}-${task.title}`)).length
        }
      />
      <p className="panel-description">
        {demoMode
          ? 'Illustrative checklist · changes stay in this session'
          : 'Extracted pending work · checked against source quotes'}
      </p>
      {tasks.length ? (
        tasks.map((task) => {
          const key = `${project.id}-${task.title}`
          const checked = completedTasks.includes(key)
          return (
            <label className={`task-item ${checked ? 'task-complete' : ''}`} key={key}>
              <input
                type="checkbox"
                checked={checked}
                onChange={() =>
                  setCompletedTasks((items) =>
                    checked ? items.filter((item) => item !== key) : [...items, key],
                  )
                }
              />
              <span className="task-check">{checked && <Check size={12} />}</span>
              <span>
                <strong>{task.title}</strong>
                <small>{task.owner}</small>
              </span>
            </label>
          )
        })
      ) : (
        <EmptyState
          icon={CheckCircle2}
          title="A clean slate"
          description="No tasks have been recorded for this new project."
        />
      )}
    </section>
  )
  const questionPanel = (
    <section className="panel workspace-questions">
      <SectionTitle title="Unresolved questions" count={questions.length} />
      {questions.length ? (
        questions.map((question) => (
          <div className="question-item" key={question}>
            <HelpCircle size={16} />
            <p>{question}</p>
          </div>
        ))
      ) : (
        <p className="muted">
          No questions recorded yet. Start by adding sources and discussing the project with your
          team.
        </p>
      )}
    </section>
  )
  return (
    <>
      <Link className="back-link" to="/projects">
        <ArrowLeft size={14} />
        All projects
      </Link>
      <div className="workspace-header">
        <ProjectIcon project={project} />
        <div>
          <div className="workspace-title">
            <h1>{project.name}</h1>
            <Badge tone={statusTone(project.status)} dot>
              {project.status}
            </Badge>
          </div>
          <p>{project.description}</p>
        </div>
        <div className="workspace-actions">
          <button
            className="button button-secondary"
            disabled={demoMode || analyzing || !projectSources.length}
            title={
              demoMode
                ? 'Load your own sources to run the AI pipeline.'
                : 'Analyze every uploaded source with evidence checking.'
            }
            onClick={() =>
              void analyzeProject(
                project.id,
                projectSources.map((source) => source.id),
              ).catch(() => undefined)
            }
          >
            {analyzing ? (
              <LoaderCircle size={16} className="spin" />
            ) : (
              <Sparkles size={16} />
            )}
            {analyzing ? 'Analyzing…' : 'Analyze sources'}
          </button>
          <button className="button button-primary" onClick={() => setUploading(true)}>
            <Plus size={16} />
            Add sources
          </button>
        </div>
      </div>
      {analysisError && !analyzing && (
        <div className="form-error" role="alert">
          <AlertCircle size={16} />
          {analysisError}
        </div>
      )}
      <div className="workspace-meta">
        <div className="stack-tags">
          {project.stack.map((tech) => (
            <span key={tech}>{tech}</span>
          ))}
        </div>
        <div className="workspace-members">
          <Avatars members={project.members} />
          <span>Project team · demo</span>
        </div>
      </div>
      <nav className="workspace-tabs" aria-label="Project navigation">
        {tabs.map((item) => (
          <NavLink
            to={`${base}/${item.toLowerCase()}`}
            key={item}
            className={({ isActive }) =>
              isActive || (item === 'Overview' && tab === 'overview') ? 'active' : ''
            }
          >
            {item}
            {item === 'Sources' && <span>{projectSources.length}</span>}
            {item === 'Conflicts' && projectConflicts.length > 0 && (
              <span className="tab-warning">{projectConflicts.length}</span>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="workspace-content">
        {tab === 'overview' && (
          <>
            <div className="workspace-stats">
              {[
                {
                  label: 'Collected sources',
                  value: projectSources.length,
                  icon: FileText,
                  path: 'sources',
                },
                {
                  label: 'Recorded decisions',
                  value: projectDecisions.length,
                  icon: GitBranch,
                  path: 'decisions',
                },
                {
                  label: 'Open conflicts',
                  value: projectConflicts.length,
                  icon: ShieldAlert,
                  path: 'conflicts',
                },
                {
                  label: 'Source types',
                  value: new Set(projectSources.map((source) => source.type)).size,
                  icon: Layers3,
                  path: 'sources',
                },
              ].map((item) => (
                <Link className="panel workspace-stat" key={item.label} to={`${base}/${item.path}`}>
                  <item.icon size={19} />
                  <div>
                    <strong>{item.value}</strong>
                    <span>{item.label}</span>
                  </div>
                  <ArrowRight size={15} />
                </Link>
              ))}
            </div>
            <div className="workspace-overview-grid">
              <section className="panel">
                <div className="panel-heading">
                  <SectionTitle title="Latest activity" />
                </div>
                <ActivityFeed projectId={project.id} limit={4} />
              </section>
              <section className="panel workspace-decision-panel">
                <SectionTitle title="Recent decisions" to={`${base}/decisions`} link="All" />
                {projectDecisions.length ? (
                  projectDecisions.slice(0, 3).map((decision) => (
                    <Link
                      className="mini-decision"
                      key={decision.id}
                      to={`${base}/decisions?decision=${decision.id}`}
                    >
                      <GitBranch size={16} />
                      <div>
                        <strong>{decision.title}</strong>
                        <Badge tone={statusTone(decision.status)}>{decision.status}</Badge>
                      </div>
                      <ArrowRight size={14} />
                    </Link>
                  ))
                ) : (
                  <EmptyState
                    icon={GitBranch}
                    title="Decisions start here"
                    description="This new project has no recorded technical decisions."
                  />
                )}
              </section>
              {taskPanel}
              {questionPanel}
            </div>
            <Link className="handover-callout" to={`${base}/handover`}>
              <span className="report-icon">
                <FileClock size={22} />
              </span>
              <div>
                <h3>Make the next handover a head start.</h3>
                <p>
                  {demoMode
                    ? 'Bring decisions, open work, and evidence into one sample report.'
                    : 'Bring decisions, open work, and verified evidence into one report.'}
                </p>
              </div>
              <span className="text-link">
                Explore handovers
                <ArrowRight size={16} />
              </span>
            </Link>
            <DemoNote>
              {demoMode
                ? 'Project insights, tasks, and questions are curated examples—not extracted from your files.'
                : 'Tasks and questions are extracted from your sources, and every claim points to a verified quote.'}
            </DemoNote>
          </>
        )}
        {tab === 'sources' && <KnowledgeBase key={project.id} projectId={project.id} embedded />}
        {tab === 'decisions' && <Decisions key={project.id} projectId={project.id} embedded />}
        {tab === 'conflicts' && <Conflicts key={project.id} projectId={project.id} embedded />}
        {tab === 'handover' && <HandoverReports key={project.id} projectId={project.id} embedded />}
        {tab === 'context' && (
          <>
            <div className="context-heading">
              <span className="context-icon">
                <BookOpen size={24} strokeWidth={1.5} />
              </span>
                              <div>
                  <h2>The bigger picture</h2>
                  <p>
                    {demoMode
                      ? `A curated starting point for understanding ${project.name}.`
                      : `Evidence-backed context for ${project.name}.`}
                  </p>
                </div>
                <Badge tone="violet">{demoMode ? 'Sample context' : 'Extracted context'}</Badge>
            </div>
            <div className="context-grid">
              <section className="panel context-summary">
                <SectionTitle title="Project context" />
                <p>{project.description}</p>
                <h3>Technology landscape</h3>
                <div className="stack-tags">
                  {project.stack.length ? (
                    project.stack.map((tech) => <span key={tech}>{tech}</span>)
                  ) : (
                    <span>No technologies specified</span>
                  )}
                </div>
                <h3>What the records tell us</h3>
                {projectSources.length ? (
                  projectSources.slice(0, 3).map((source) => (
                    <div className="context-source" key={source.id}>
                      <p>{source.summary}</p>
                      <SourceLink name={source.name} onClick={() => setSelectedSource(source)} />
                    </div>
                  ))
                ) : (
                  <p className="muted">
                    Add source documents to begin collecting context. No information has been
                    invented for this new project.
                  </p>
                )}
              </section>
              <div className="context-side">
                {questionPanel}
                {taskPanel}
              </div>
            </div>
            <DemoNote>
              {demoMode
                ? 'Context is curated demo content. No automated extraction ran for it.'
                : 'Context comes from uploaded sources. Run Analyze sources to extract decisions, risks, tasks and questions.'}
            </DemoNote>
          </>
        )}
        {!tabs.some((item) => item.toLowerCase() === tab) && (
          <EmptyState
            title="This workspace view doesn't exist"
            action={
              <Link className="button button-primary" to={base}>
                Project overview
              </Link>
            }
          />
        )}
      </div>
      {uploading && <UploadModal projectId={project.id} onClose={() => setUploading(false)} />}
    </>
  )
}
