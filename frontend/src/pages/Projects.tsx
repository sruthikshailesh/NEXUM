import { FolderOpen, LayoutGrid, List, Plus } from 'lucide-react'
import { useState } from 'react'
import { useApp } from '../context/AppContext'
import ProjectCard from '../components/ProjectCard'
import { DemoNote, EmptyState, PageHeader, SearchInput, Select } from '../components/UI'
export default function Projects() {
  const { projects, preferences, setNewProjectOpen } = useApp()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('All statuses')
  const [view, setView] = useState(preferences.defaultView)
  const filtered = projects.filter(
    (project) =>
      `${project.name} ${project.description} ${project.stack.join(' ')}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (status === 'All statuses' || project.status === status),
  )
  return (
    <>
      <PageHeader
        eyebrow="PROJECT INTELLIGENCE"
        title="Projects"
        description="Every project has a story. Keep yours connected."
        actions={
          <button className="button button-primary" onClick={() => setNewProjectOpen(true)}>
            <Plus size={17} />
            New Project
          </button>
        }
      />
      <div className="toolbar">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search projects or technologies..."
        />
        <div className="toolbar-end">
          <Select label="Project status" value={status} onChange={setStatus}>
            {['All statuses', 'Up to date', 'Needs review', 'New project'].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </Select>
          <div className="view-toggle">
            <button
              className={view === 'grid' ? 'active' : ''}
              aria-label="Grid view"
              aria-pressed={view === 'grid'}
              onClick={() => setView('grid')}
            >
              <LayoutGrid size={17} />
            </button>
            <button
              className={view === 'list' ? 'active' : ''}
              aria-label="List view"
              aria-pressed={view === 'list'}
              onClick={() => setView('list')}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>
      <div className="results-label">
        {filtered.length} {filtered.length === 1 ? 'project' : 'projects'}
        <span>Sorted by latest activity</span>
      </div>
      {filtered.length ? (
        <div className={view === 'grid' ? 'project-grid projects-page-grid' : 'project-list'}>
          {[...filtered]
            .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
            .map((project) => (
              <ProjectCard key={project.id} project={project} detailed list={view === 'list'} />
            ))}
          {view === 'grid' && !query && status === 'All statuses' && (
            <button className="new-project-card" onClick={() => setNewProjectOpen(true)}>
              <span>
                <Plus size={23} />
              </span>
              <h3>Make room for your next project</h3>
              <p>Bring the context together from day one.</p>
              <span className="text-link">
                Create a project
                <Plus size={14} />
              </span>
            </button>
          )}
        </div>
      ) : (
        <EmptyState
          icon={FolderOpen}
          title="No projects match your search"
          action={
            <button
              className="button button-secondary"
              onClick={() => {
                setQuery('')
                setStatus('All statuses')
              }}
            >
              Clear filters
            </button>
          }
        />
      )}
      <DemoNote>
        Projects are stored in frontend state. Refreshing restores the demo workspace.
      </DemoNote>
    </>
  )
}
