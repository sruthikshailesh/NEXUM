import { Component, useEffect, useState, type ErrorInfo, type ReactNode } from 'react'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import AppOverlays from './components/AppOverlays'
import { EmptyState } from './components/UI'
import Overview from './pages/Overview'
import Projects from './pages/Projects'
import ProjectWorkspace from './pages/ProjectWorkspace'
import KnowledgeBase from './pages/KnowledgeBase'
import Decisions from './pages/Decisions'
import Conflicts from './pages/Conflicts'
import HandoverReports from './pages/HandoverReports'
import Settings from './pages/Settings'
import Help from './pages/Help'
class ErrorBoundary extends Component<{ children: ReactNode }, { error: boolean }> {
  state = { error: false }
  static getDerivedStateFromError() {
    return { error: true }
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('NEXUM view error', error, info.componentStack)
  }
  render() {
    return this.state.error ? (
      <div className="main-content">
        <EmptyState
          title="This view couldn't be loaded"
          description="Try reloading the demo. Session-only changes will reset."
          action={
            <button className="button button-primary" onClick={() => window.location.reload()}>
              <RefreshCw size={16} />
              Reload demo
            </button>
          }
        />
      </div>
    ) : (
      this.props.children
    )
  }
}
function WorkspaceLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { preferences, searchOpen, setSearchOpen, newProjectOpen, selectedSource } = useApp()
  const location = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])
  useEffect(() => {
    document.documentElement.style.colorScheme = 'dark'
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        if (searchOpen) setSearchOpen(false)
        else if (!newProjectOpen && !selectedSource && !document.querySelector('[role="dialog"]'))
          setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [searchOpen, setSearchOpen, newProjectOpen, selectedSource])
  return (
    <div
      className={`app-shell ${collapsed ? 'is-collapsed' : ''} ${preferences.compact ? 'compact' : ''} ${preferences.reduceMotion ? 'reduce-motion' : ''}`}
    >
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="main-shell">
        <Header onMenu={() => setMobileOpen(true)} />
        <main className="main-content" id="main-content" tabIndex={-1}>
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/:projectId" element={<ProjectWorkspace />} />
              <Route path="/projects/:projectId/:tab" element={<ProjectWorkspace />} />
              <Route path="/knowledge" element={<KnowledgeBase />} />
              <Route path="/decisions" element={<Decisions />} />
              <Route path="/conflicts" element={<Conflicts />} />
              <Route path="/handovers" element={<HandoverReports />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/help" element={<Help />} />
              <Route
                path="*"
                element={
                  <EmptyState
                    title="A little off the map"
                    description="This page doesn't exist. Your workspace is one click away."
                    action={
                      <Link className="button button-primary" to="/">
                        <ArrowLeft size={16} />
                        Back to overview
                      </Link>
                    }
                  />
                }
              />
            </Routes>
          </ErrorBoundary>
        </main>
      </div>
      <AppOverlays />
    </div>
  )
}
export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppProvider>
          <WorkspaceLayout />
        </AppProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
