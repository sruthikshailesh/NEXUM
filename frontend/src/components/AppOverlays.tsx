import {
  ArrowRight,
  CheckCircle2,
  FileText,
  FolderOpen,
  GitBranch,
  Info,
  Plus,
  Search,
  ShieldCheck,
} from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Badge, EmptyState, formatDate, Modal, SearchInput, statusTone } from './UI'
function NewProjectModal() {
  const { projects, createProject, setNewProjectOpen, demoMode } = useApp()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [stack, setStack] = useState('')
  const [error, setError] = useState('')
  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!name.trim() || !description.trim()) {
      setError('Add a project name and a short description.')
      return
    }
    if (projects.some((project) => project.name.toLowerCase() === name.trim().toLowerCase())) {
      setError('A project with this name already exists. Choose another name.')
      return
    }
    try {
      const project = await createProject({
        name: name.trim(),
        description: description.trim(),
        stack: [
          ...new Set(
            stack
              .split(',')
              .map((item) => item.trim())
              .filter(Boolean),
          ),
        ],
      })
      setNewProjectOpen(false)
      navigate(`/projects/${project.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The project could not be created.')
    }
  }
  return (
    <Modal
      title="A new project, a connected beginning."
      description="Give your team's knowledge a place to live."
      onClose={() => setNewProjectOpen(false)}
    >
      <form onSubmit={submit} className="modal-form">
        <label>
          Project name<span className="required">*</span>
          <input
            value={name}
            onChange={(event) => {
              setName(event.target.value)
              setError('')
            }}
            placeholder="e.g. ShopSphere"
            maxLength={70}
            required
          />
        </label>
        <label>
          Description<span className="required">*</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="What are you building, and who is it for?"
            maxLength={350}
            rows={3}
            required
          />
        </label>
        <label>
          Technology stack
          <input
            value={stack}
            onChange={(event) => setStack(event.target.value)}
            placeholder="React, TypeScript, FastAPI, PostgreSQL"
            maxLength={200}
          />
          <span className="field-help">
            Separate technologies with commas. You can leave this blank.
          </span>
        </label>
        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}
        <div className="info-box">
          <Info size={16} />
          <p>
            {demoMode
              ? 'This project will live in the demo session. No account or backend is connected.'
              : 'This project is saved to the NEXUM backend and will still be here next time.'}
          </p>
        </div>
        <div className="modal-actions">
          <button
            type="button"
            className="button button-secondary"
            onClick={() => setNewProjectOpen(false)}
          >
            Cancel
          </button>
          <button className="button button-primary" type="submit">
            <Plus size={16} />
            Create project
          </button>
        </div>
      </form>
    </Modal>
  )
}
function WorkspaceSearch() {
  const { projects, sources, decisions, setSearchOpen, setSelectedSource } = useApp()
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const matches = (text: string) => text.toLowerCase().includes(query.toLowerCase().trim())
  const results = [
    ...projects
      .filter((project) => matches(`${project.name} ${project.description}`))
      .map((project) => ({
        id: project.id,
        title: project.name,
        detail: 'Project',
        icon: FolderOpen,
        action: () => navigate(`/projects/${project.id}`),
      })),
    ...sources
      .filter((source) => matches(`${source.name} ${source.summary}`))
      .map((source) => ({
        id: source.id,
        title: source.name,
        detail: `${source.type} · Source`,
        icon: FileText,
        action: () => setSelectedSource(source),
      })),
    ...decisions
      .filter((decision) => matches(`${decision.title} ${decision.description}`))
      .map((decision) => ({
        id: decision.id,
        title: decision.title,
        detail: 'Technical decision',
        icon: GitBranch,
        action: () => navigate(`/decisions?decision=${decision.id}`),
      })),
  ].slice(0, 12)
  return (
    <Modal
      title="Search your workspace"
      description="Find projects, sources, and the decisions behind your code."
      onClose={() => setSearchOpen(false)}
    >
      <div className="search-modal-body">
        <SearchInput value={query} onChange={setQuery} placeholder="Search anything..." />
        <div className="results-label">
          {query
            ? `${results.length} matches${results.length === 12 ? ' (showing up to 12)' : ''}`
            : 'Explore your workspace'}
        </div>
        <div className="search-results">
          {results.length ? (
            results.map((result) => (
              <button
                key={result.id}
                onClick={() => {
                  setSearchOpen(false)
                  result.action()
                }}
              >
                <span className="search-result-icon">
                  <result.icon size={18} />
                </span>
                <span>
                  <strong>{result.title}</strong>
                  <small>{result.detail}</small>
                </span>
                <ArrowRight size={16} />
              </button>
            ))
          ) : (
            <EmptyState
              icon={Search}
              description="Try a project name, technology, or decision keyword."
            />
          )}
        </div>
      </div>
    </Modal>
  )
}
export default function AppOverlays() {
  const { newProjectOpen, searchOpen, selectedSource, setSelectedSource, projects, toast } =
    useApp()
  return (
    <>
      {newProjectOpen && <NewProjectModal />}
      {searchOpen && <WorkspaceSearch />}
      {selectedSource && (
        <Modal
          wide
          title={selectedSource.name}
          description="Source viewer · original context, without the guesswork"
          onClose={() => setSelectedSource(null)}
        >
          <div className="source-preview">
            <div className="source-preview-meta">
              <Badge>{selectedSource.type}</Badge>
              <Badge tone={statusTone(selectedSource.status)}>{selectedSource.status}</Badge>
              <span>
                {projects.find((project) => project.id === selectedSource.projectId)?.name}
              </span>
              <span>{formatDate(selectedSource.date)}</span>
            </div>
            <div className="info-box">
              <ShieldCheck size={16} />
              <p>
                {selectedSource.status === 'Local only'
                  ? 'Local file preview only. This file has not been uploaded to a server or processed by AI.'
                  : 'This is a fictional source included in the demo. No external services are connected.'}
              </p>
            </div>
            <h3>Summary</h3>
            <p className="source-summary">{selectedSource.summary}</p>
            <h3>Document content</h3>
            <pre className="document-content">{selectedSource.content}</pre>
          </div>
        </Modal>
      )}
      {toast && (
        <div className="toast" role="status">
          <CheckCircle2 size={18} />
          <span>{toast}</span>
        </div>
      )}
    </>
  )
}
