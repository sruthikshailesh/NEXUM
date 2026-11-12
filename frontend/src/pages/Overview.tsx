import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CircleCheck,
  FileClock,
  Files,
  FolderOpen,
  GitBranch,
  Plus,
  ShieldAlert,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import ActivityFeed from '../components/ActivityFeed'
import ProjectCard from '../components/ProjectCard'
import StatCard from '../components/StatCard'
import { Badge, DemoNote, PageHeader, SectionTitle } from '../components/UI'
export default function Overview() {
  const { projects, sources, decisions, conflicts, preferences, setNewProjectOpen, demoMode, actions } =
    useApp()
  const open = conflicts.filter((item) => item.status !== 'Resolved').length
  const review = decisions.filter((item) => item.status === 'Under Review').length
  return (
    <>
      <PageHeader
        eyebrow="YOUR WORKSPACE, AT A GLANCE"
        title={`Welcome back, ${preferences.name.split(' ')[0]}`}
        description="Your project's knowledge, connected."
        actions={
          <>
            <Link className="button button-secondary" to="/handovers">
              <FileClock size={16} />
              View reports
            </Link>
            <button className="button button-primary" onClick={() => setNewProjectOpen(true)}>
              <Plus size={17} />
              New Project
            </button>
          </>
        }
      />
      <div className="overview-meta">
        <span>
          <span className="status-dot" />A clearer picture. A smoother handover.
        </span>
        {demoMode ? <Badge>Demo data</Badge> : <Badge tone="green">Live workspace</Badge>}
      </div>
      <div className="stats-grid">
        <StatCard
          label="Total Projects"
          value={projects.length}
          note="Across your workspace"
          icon={FolderOpen}
          tone="violet"
          points="0,29 12,29 12,23 26,23 26,18 42,18 42,22 56,22 56,12 71,12 71,5 94,5"
          to="/projects"
        />
        <StatCard
          label="Sources Collected"
          value={sources.length}
          note="Every source, one place"
          icon={Files}
          tone="blue"
          points="0,29 10,25 20,28 30,19 40,23 50,14 60,17 70,8 80,11 94,3"
          to="/knowledge"
        />
        <StatCard
          label="Decisions Identified"
          value={decisions.length}
          note={`${decisions.filter((item) => item.status === 'Accepted').length} accepted decisions`}
          icon={GitBranch}
          tone="green"
          points="0,29 16,29 16,23 33,23 33,17 50,17 50,11 69,11 69,5 94,5"
          to="/decisions"
        />
        <StatCard
          label="Open Conflicts"
          value={open}
          note={open ? 'Ready for human review' : 'All conflicts resolved'}
          icon={ShieldAlert}
          tone="amber"
          points="0,7 12,12 24,8 36,17 48,12 60,23 72,20 83,27 94,27"
          to="/conflicts"
        />
      </div>
      <section className="recent-projects">
        <SectionTitle
          title="Recent projects"
          description="Pick up where you left off."
          link="All projects"
          to="/projects"
        />
        <div className="project-grid">
          {projects.slice(0, 3).map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </section>
      <div className="overview-bottom-grid">
        <section className="panel activity-panel">
          <div className="panel-heading">
            <SectionTitle title="Recent activity" />
            <span className="muted micro">Across all projects</span>
          </div>
          <ActivityFeed limit={4} />
          <Link className="panel-bottom-link" to="/knowledge">
            Explore your knowledge base
            <ArrowRight size={14} />
          </Link>
        </section>
        <section className="panel health-panel">
          <div className="panel-heading">
            <SectionTitle title="Knowledge health" />
            <Badge tone="green">{demoMode ? 'Demo insights' : 'Live counts'}</Badge>
          </div>
          <div className="coverage-heading">
            <span>Document coverage</span>
            <strong>{demoMode ? <>
              78<span>%</span>
            </> : '—'}</strong>
          </div>
          <div className="coverage-track">
            <span style={{ width: demoMode ? '78%' : '0%' }} />
          </div>
          <p className="coverage-description">
            {demoMode
              ? 'A strong foundation. A few gaps to close.'
              : 'Coverage scoring is not measured yet. The counts below are live.'}
          </p>
          <div className="health-metrics">
            <Link to="/conflicts">
              <span>
                <ShieldAlert size={15} />
                Unresolved conflicts
              </span>
              <span className="health-count amber-text">
                {open}
                <ArrowUpRight size={13} />
              </span>
            </Link>
            <Link
              to={
                projects.length
                  ? `/projects/${preferences.defaultProjectId || projects[0].id}/context`
                  : '/projects'
              }
            >
              <span>
                <CircleCheck size={15} />
                Pending tasks
              </span>
              <span className="health-count">
                {demoMode ? 2 : actions.length}
                <ArrowUpRight size={13} />
              </span>
            </Link>
            <Link to="/decisions?status=Under+Review">
              <span>
                <GitBranch size={15} />
                Decisions to review
              </span>
              <span className="health-count">
                {review}
                <ArrowUpRight size={13} />
              </span>
            </Link>
          </div>
          <div className="health-footnote">
            <BookOpen size={13} />
            {demoMode
              ? 'Coverage and task counts are illustrative.'
              : 'Task counts come from verified extracted claims.'}
          </div>
        </section>
      </div>
      <div className="overview-footer">
        <DemoNote>
          {demoMode
            ? 'Demo workspace. All insights are sample data; changes stay in this session.'
            : 'Claims are extracted only from your uploaded sources and verified against exact quotes.'}
        </DemoNote>
        <span>
          NEXUM<span className="middle-dot">·</span>Built for what comes next.
        </span>
      </div>
    </>
  )
}
