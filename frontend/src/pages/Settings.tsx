import { Check, FolderOpen, Info, Moon, Save, Settings2, UserRound } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/UI'
import { useApp } from '../context/AppContext'

export default function Settings() {
  const { preferences, setPreferences, projects, notify } = useApp()
  const [name, setName] = useState(preferences.name)
  const [role, setRole] = useState(preferences.role)
  const [error, setError] = useState('')

  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedName = name.trim()
    const trimmedRole = role.trim()
    if (!trimmedName || !trimmedRole || trimmedName.length > 80 || trimmedRole.length > 80) {
      const message = 'Enter a name and role, each between 1 and 80 characters.'
      setError(message)
      notify(message)
      return
    }
    setPreferences({ ...preferences, name: trimmedName, role: trimmedRole })
    setName(trimmedName)
    setRole(trimmedRole)
    setError('')
    notify('Profile updated for this session. Changes reset when you reload.')
  }

  return (
    <>
      <PageHeader
        eyebrow="MAKE YOURSELF AT HOME"
        title="Settings"
        description="A few preferences for the way you work."
      />
      <div className="info-box">
        <Info size={18} aria-hidden="true" />
        <p>
          Session only. Preferences and workspace changes live in memory, are not persisted, and
          reset when you reload or close this page.
        </p>
      </div>
      <div className="settings-layout">
        <nav className="settings-nav" aria-label="Settings sections">
          <a className="text-link" href="#general">
            <UserRound size={16} aria-hidden="true" />
            General
          </a>
          <a className="text-link" href="#appearance">
            <Moon size={16} aria-hidden="true" />
            Appearance
          </a>
          <a className="text-link" href="#project-preferences">
            <FolderOpen size={16} aria-hidden="true" />
            Project preferences
          </a>
          <a className="text-link" href="#about-nexum">
            <Info size={16} aria-hidden="true" />
            About NEXUM
          </a>
        </nav>
        <div>
          <section className="panel settings-section" id="general" aria-labelledby="general-title">
            <div className="settings-section-title">
              <UserRound size={20} aria-hidden="true" />
              <div>
                <h2 id="general-title">General</h2>
                <p className="muted">Your display profile in this demo workspace.</p>
              </div>
            </div>
            <form onSubmit={saveProfile} noValidate>
              <div className="settings-field">
                <label htmlFor="profile-name">Display name</label>
                <input
                  id="profile-name"
                  name="name"
                  autoComplete="name"
                  value={name}
                  maxLength={80}
                  required
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? 'profile-note profile-error' : 'profile-note'}
                  onChange={(event) => {
                    setName(event.target.value)
                    setError('')
                  }}
                />
              </div>
              <div className="settings-field">
                <label htmlFor="profile-role">Role</label>
                <input
                  id="profile-role"
                  name="role"
                  value={role}
                  maxLength={80}
                  required
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? 'profile-note profile-error' : 'profile-note'}
                  onChange={(event) => {
                    setRole(event.target.value)
                    setError('')
                  }}
                />
              </div>
              <p id="profile-note" className="muted micro">
                These are display labels, not an account. Changing your role does not grant
                permissions. Both fields are required.
              </p>
              {error && (
                <p id="profile-error" role="alert">
                  {error}
                </p>
              )}
              <button type="submit" className="button button-primary button-sm">
                <Save size={15} aria-hidden="true" />
                Save profile
              </button>
            </form>
          </section>

          <section
            className="panel settings-section"
            id="appearance"
            aria-labelledby="appearance-title"
          >
            <div className="settings-section-title">
              <Moon size={20} aria-hidden="true" />
              <div>
                <h2 id="appearance-title">Appearance</h2>
                <p className="muted">Keep the focus on your project knowledge.</p>
              </div>
            </div>
            <div className="settings-field">
              <h3>Workspace theme</h3>
              <div className="theme-option theme-option-selected">
                <div className="theme-preview" aria-hidden="true">
                  <Moon size={28} />
                </div>
                <strong>Dark</strong>
                <span>
                  <Check size={14} aria-hidden="true" />
                  Selected · Default
                </span>
              </div>
              <p className="muted micro">Dark is the only available theme in Phase 1.</p>
            </div>
            <div className="settings-row">
              <div className="settings-row-copy">
                <h3 id="compact-label">Compact layout</h3>
                <p id="compact-description" className="muted">
                  Use denser spacing to fit more context on screen.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={preferences.compact}
                aria-labelledby="compact-label"
                aria-describedby="compact-description"
                className={`toggle${preferences.compact ? ' on' : ''}`}
                onClick={() => setPreferences({ ...preferences, compact: !preferences.compact })}
              >
                <span aria-hidden="true" />
              </button>
            </div>
            <div className="settings-row">
              <div className="settings-row-copy">
                <h3 id="motion-label">Reduce motion</h3>
                <p id="motion-description" className="muted">
                  Reduce interface animations and transitions.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={preferences.reduceMotion}
                aria-labelledby="motion-label"
                aria-describedby="motion-description"
                className={`toggle${preferences.reduceMotion ? ' on' : ''}`}
                onClick={() =>
                  setPreferences({ ...preferences, reduceMotion: !preferences.reduceMotion })
                }
              >
                <span aria-hidden="true" />
              </button>
            </div>
            <p className="muted micro">
              Appearance preferences apply immediately for this session only.
            </p>
          </section>

          <section
            className="panel settings-section"
            id="project-preferences"
            aria-labelledby="project-preferences-title"
          >
            <div className="settings-section-title">
              <Settings2 size={20} aria-hidden="true" />
              <div>
                <h2 id="project-preferences-title">Project preferences</h2>
                <p className="muted">
                  Choose your starting point. Changes apply immediately for this session.
                </p>
              </div>
            </div>
            <div className="settings-field">
              <label htmlFor="default-view">Default project view</label>
              <select
                id="default-view"
                value={preferences.defaultView}
                onChange={(event) => {
                  const value = event.target.value
                  if (value === 'grid' || value === 'list')
                    setPreferences({ ...preferences, defaultView: value })
                }}
              >
                <option value="grid">Grid view</option>
                <option value="list">List view</option>
              </select>
            </div>
            <div className="settings-field">
              <label htmlFor="default-project">Default project</label>
              <select
                id="default-project"
                value={preferences.defaultProjectId}
                disabled={!projects.length}
                aria-describedby="default-project-note"
                onChange={(event) => {
                  const projectId = event.target.value
                  if (projects.some((project) => project.id === projectId))
                    setPreferences({ ...preferences, defaultProjectId: projectId })
                }}
              >
                {!projects.length && <option value="">Create a project first</option>}
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              <p id="default-project-note" className="muted micro">
                Preselected when adding sources outside a specific project. You can still choose a
                different destination.
              </p>
            </div>
          </section>

          <section
            className="panel settings-section settings-about"
            id="about-nexum"
            aria-labelledby="about-title"
          >
            <div className="settings-section-title">
              <Info size={20} aria-hidden="true" />
              <div>
                <h2 id="about-title">About NEXUM</h2>
                <p className="muted">Project knowledge, connected.</p>
              </div>
            </div>
            <div className="stack-tags">
              <span>Phase 1</span>
              <span>Frontend demo</span>
              <span>Session only</span>
            </div>
            <p>
              NEXUM brings sample sources, technical decisions, conflicting evidence, and
              nine-section handovers into one workspace for human review.
            </p>
            <p className="muted">
              This is a frontend-only prototype. No AI, backend, database, authentication, or live
              integrations are connected. Reports use local sample data, not AI analysis. Files are
              not uploaded to a server.
            </p>
            <Link className="text-link" to="/help">
              Explore the getting started guide
            </Link>
          </section>
        </div>
      </div>
    </>
  )
}
