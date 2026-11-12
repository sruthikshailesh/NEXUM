import { ChevronRight, CircleHelp, Command, Menu, Search } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
const labels: Record<string, string> = {
  projects: 'Projects',
  knowledge: 'Knowledge Base',
  decisions: 'Decisions',
  conflicts: 'Evidence & Conflicts',
  handovers: 'Handover Reports',
  settings: 'Settings',
  help: 'Help & Documentation',
}
export default function Header({ onMenu }: { onMenu: () => void }) {
  const location = useLocation()
  const { projects, setSearchOpen, demoMode, offline, loadDemoData, exitDemo } = useApp()
  const parts = location.pathname.split('/').filter(Boolean)
  const project = parts[0] === 'projects' ? projects.find((item) => item.id === parts[1]) : null
  return (
    <header className="topbar">
      <div className="breadcrumb">
        <button className="icon-button mobile-menu" aria-label="Open navigation" onClick={onMenu}>
          <Menu size={19} />
        </button>
        <span className="breadcrumb-root">Workspace</span>
        <ChevronRight size={13} />
        <Link to={parts[0] === 'projects' && project ? '/projects' : location.pathname}>
          {labels[parts[0]] || 'Overview'}
        </Link>
        {project && (
          <>
            <ChevronRight size={13} />
            <span className="breadcrumb-project">{project.name}</span>
          </>
        )}
      </div>
      <div className="topbar-actions">
        <button
          className="global-search"
          onClick={() => setSearchOpen(true)}
          aria-label="Search workspace"
        >
          <Search size={16} />
          <span>Search anything...</span>
          <kbd>
            <Command size={10} />K
          </kbd>
        </button>
        <span className="topbar-divider" />
        <span className="demo-pill">
          <span />
          {demoMode ? 'Demo workspace' : 'Live workspace'}
        </span>
        {demoMode && (
          <button className="button button-secondary button-sm" onClick={exitDemo}>
            Exit demo mode
          </button>
        )}
        {!demoMode && !offline && (
          <button className="button button-secondary button-sm" onClick={loadDemoData}>
            Load demo data
          </button>
        )}
        <Link className="icon-button header-help" aria-label="Help and documentation" to="/help">
          <CircleHelp size={18} />
        </Link>
      </div>
    </header>
  )
}
