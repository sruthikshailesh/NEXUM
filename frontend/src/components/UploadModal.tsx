import { AlertCircle, FileText, LoaderCircle, UploadCloud, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { useApp } from '../context/AppContext'
import type { Source, SourceType } from '../types'
import { Modal, Select } from './UI'
export default function UploadModal({
  projectId,
  onClose,
}: {
  projectId?: string
  onClose: () => void
}) {
  const { projects, preferences, addSources } = useApp()
  const [selectedProject, setSelectedProject] = useState(
    projectId || preferences.defaultProjectId || projects[0]?.id || '',
  )
  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)
  const [reading, setReading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  function selectFiles(incoming: FileList | File[] | null) {
    if (!incoming) return
    const all = [...incoming]
    const valid = all.filter(
      (file) => /\.(pdf|txt|json|md)$/i.test(file.name) && file.size <= 5 * 1024 * 1024,
    )
    setError(
      valid.length < all.length
        ? 'Some files were not added. Use PDF, TXT, JSON, or Markdown files up to 5 MB each.'
        : '',
    )
    setFiles((current) =>
      [
        ...current,
        ...valid.filter(
          (file) => !current.some((item) => item.name === file.name && item.size === file.size),
        ),
      ].slice(0, 10),
    )
    if (files.length + valid.length > 10)
      setError('Add up to 10 files at a time. Only the first 10 were selected.')
  }
  async function submit() {
    if (!selectedProject || !files.length) {
      setError('Choose a project and at least one file.')
      return
    }
    setReading(true)
    try {
      const additions: Source[] = await Promise.all(
        files.map(async (file) => {
          const ext = file.name.split('.').pop()?.toLowerCase()
          const type: SourceType =
            ext === 'pdf' ? 'PDF' : ext === 'json' ? 'JSON' : ext === 'md' ? 'Meeting notes' : 'TXT'
          const content =
            ext === 'pdf'
              ? 'PDF content extraction is not available in Phase 1. Only this file’s name, size, and project association are retained in this session. Nothing was uploaded or processed.'
              : (await file.text()).slice(0, 60000)
          return {
            id: crypto.randomUUID(),
            name: file.name,
            projectId: selectedProject,
            type,
            date: new Date().toISOString(),
            status: 'Local only',
            summary:
              'Added locally by you. No automated summary or AI analysis has been performed.',
            content: content || 'This file is empty.',
            size: `${(file.size / 1024).toFixed(1)} KB`,
          }
        }),
      )
      addSources(additions)
      onClose()
    } catch {
      setError('This file could not be read. Please choose it again and retry.')
      setReading(false)
    }
  }
  return (
    <Modal
      title="Add sources"
      description="Bring the context into your workspace."
      onClose={() => {
        if (!reading) onClose()
      }}
    >
      <div className="modal-form">
        <label>
          Project
          <Select label="Destination project" value={selectedProject} onChange={setSelectedProject}>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </Select>
        </label>
        <input
          type="file"
          ref={inputRef}
          className="sr-only"
          accept=".pdf,.txt,.json,.md"
          multiple
          onChange={(event) => {
            selectFiles(event.target.files)
            event.target.value = ''
          }}
          tabIndex={-1}
        />
        <div
          className={`dropzone ${dragging ? 'dragging' : ''}`}
          onDragOver={(event) => {
            event.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault()
            setDragging(false)
            selectFiles(event.dataTransfer.files)
          }}
        >
          <span className="upload-icon">
            <UploadCloud size={25} strokeWidth={1.5} />
          </span>
          <h3>Drop your files here</h3>
          <p>
            or{' '}
            <button className="inline-link" onClick={() => inputRef.current?.click()}>
              browse files
            </button>{' '}
            to get started
          </p>
          <small>PDF, TXT, JSON, MD · Up to 5 MB each · 10 files</small>
        </div>
        {files.length > 0 && (
          <div className="selected-files">
            {files.map((file, index) => (
              <div key={`${file.name}-${index}`}>
                <FileText size={17} />
                <span>
                  {file.name}
                  <small>{(file.size / 1024).toFixed(1)} KB</small>
                </span>
                <button
                  className="icon-button small"
                  aria-label={`Remove ${file.name}`}
                  onClick={() => setFiles((items) => items.filter((_, i) => i !== index))}
                >
                  <X size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
        {error && (
          <div className="form-error" role="alert">
            <AlertCircle size={16} />
            {error}
          </div>
        )}
        <div className="info-box">
          <AlertCircle size={16} />
          <p>
            Frontend demo only. Files stay in memory for this session. No server upload, indexing,
            or AI processing occurs. Text previews are limited to 60,000 characters.
          </p>
        </div>
        <div className="modal-actions">
          <button className="button button-secondary" disabled={reading} onClick={onClose}>
            Cancel
          </button>
          <button
            className="button button-primary"
            disabled={!files.length || reading}
            onClick={submit}
          >
            {reading ? <LoaderCircle size={16} className="spin" /> : <UploadCloud size={16} />}
            {reading
              ? 'Reading local files…'
              : `Add ${files.length || ''} ${files.length === 1 ? 'source' : 'sources'}`}
          </button>
        </div>
      </div>
    </Modal>
  )
}
