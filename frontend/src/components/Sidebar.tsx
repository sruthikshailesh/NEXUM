import {
  BookOpen,
  ChevronRight,
  CircleHelp,
  FileClock,
  FolderOpen,
  GitBranch,
  LayoutDashboard,
  PanelLeftClose,
  PanelLeftOpen,
  Settings2,
  ShieldAlert,
  X,
} from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useApp } from '../context/AppContext'

const links = [
  { to: '/', label: 'Overview', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: FolderOpen },
  { to: '/knowledge', label: 'Knowledge Base', icon: BookOpen },
  { to: '/decisions', label: 'Decisions', icon: GitBranch },
  { to: '/conflicts', label: 'Evidence & Conflicts', icon: ShieldAlert },
  { to: '/handovers', label: 'Handover Reports', icon: FileClock },
]
export function Logo({ small = false }: { small?: boolean }) {
  return (
    <div className={`brand ${small ? 'brand-small' : ''}`}>
      <span className="brand-mark">
        <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <path
            d="M9 24V8l14 16V8M9 16h14"
            stroke="currentColor"
            strokeWidth="2.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {!small && (
        <div className="brand-text">
          <strong>NEXUM</strong>
          <span>Project Intelligence</span>
        </div>
      )}
    </div>
  )
}
export default function Sidebar({
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose,
}: {
  collapsed: boolean
  onToggle: () => void
  mobileOpen: boolean
  onMobileClose: () => void
}) {
  const { conflicts, preferences } = useApp()
  const location = useLocation()
  const openCount = conflicts.filter((item) => item.status !== 'Resolved').length
  useEffect(() => {
    onMobileClose()
  }, [location.pathname]) // Close the mobile navigation after route changes.
  useEffect(() => {
    if (!mobileOpen) return
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onMobileClose()
    }
    document.addEventListener('keydown', onEscape)
    return () => document.removeEventListener('keydown', onEscape)
  }, [mobileOpen, onMobileClose])
  return (
    <>
      {mobileOpen && (
        <button
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={onMobileClose}
        />
      )}
      <aside
        className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}
        aria-label="Main navigation"
      >
        <div className="sidebar-brand">
          <NavLink to="/" aria-label="NEXUM overview">
            <Logo small={collapsed} />
          </NavLink>
          <button
            className="icon-button mobile-close"
            onClick={onMobileClose}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>
        <div className="workspace-selector">
          <span className="workspace-monogram">N</span>
          <div>
            <strong>Nexum workspace</strong>
            <span>Personal workspace</span>
          </div>
          <span className="workspace-plan">Free</span>
        </div>
        <div className="nav-label">WORKSPACE</div>
        <nav className="primary-nav">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              aria-label={label}
              title={label}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} strokeWidth={1.65} />
              <span>{label}</span>
              {to === '/conflicts' && openCount > 0 && (
                <span className="nav-count">{openCount}</span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="preview-card">
            <div>
              <span className="preview-dot" />
              <strong>A little context goes a long way.</strong>
            </div>
            <p>
              Keep the knowledge.
              <br />
              Move the project forward.
            </p>
            <NavLink to="/help">
              Explore the demo
              <ChevronRight size={13} />
            </NavLink>
          </div>
          <nav>
            <NavLink
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              to="/settings"
              title="Settings"
            >
              <Settings2 size={18} strokeWidth={1.65} />
              <span>Settings</span>
            </NavLink>
            <NavLink
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              to="/help"
              title="Help & Documentation"
            >
              <CircleHelp size={18} strokeWidth={1.65} />
              <span>Help & Documentation</span>
            </NavLink>
          </nav>
          <div className="sidebar-user">
            <NavLink to="/settings" className="user-link" title="Profile settings">
              <span className="avatar">
                {preferences.name
                  .split(' ')
                  .map((word) => word[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </span>
              <span className="user-info">
                <strong>{preferences.name}</strong>
                <span>{preferences.role}</span>
              </span>
            </NavLink>
            <button
              className="icon-button collapse-button"
              onClick={onToggle}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
