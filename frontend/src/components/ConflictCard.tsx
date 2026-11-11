import { Check, CheckCheck, ChevronDown, FileSearch, ShieldAlert } from 'lucide-react'
import { useState } from 'react'
import { useApp } from '../context/AppContext'
import type { Conflict } from '../types'
import { Badge, formatDate, Modal, statusTone } from './UI'
export default function ConflictCard({ conflict }: { conflict: Conflict }) {
  const { projects, sources, setSelectedSource, updateConflict } = useApp()
  const [expanded, setExpanded] = useState(false)
  const [resolving, setResolving] = useState(false)
  const [resolution, setResolution] = useState('')
  const [error, setError] = useState('')
  return (
    <article
      className={`conflict-card panel ${conflict.status === 'Resolved' ? 'conflict-resolved' : ''}`}
    >
      <div className="conflict-heading">
        <span className={`conflict-icon ${conflict.status === 'Resolved' ? 'resolved' : ''}`}>
          {conflict.status === 'Resolved' ? (
            <CheckCheck size={21} />
          ) : (
            <ShieldAlert size={21} strokeWidth={1.6} />
          )}
        </span>
        <div>
          <div className="conflict-kicker">
            {projects.find((project) => project.id === conflict.projectId)?.name}
            <span>·</span>
            {formatDate(conflict.date)}
          </div>
          <h3>{conflict.title}</h3>
        </div>
        <Badge tone={statusTone(conflict.status)} dot>
          {conflict.status}
        </Badge>
      </div>
      <p className="conflict-description">{conflict.description}</p>
      <div className="evidence-comparison">
        {conflict.evidence.map((evidence, index) => {
          const source = sources.find((item) => item.id === evidence.sourceId)
          return (
            <div className="evidence-card" key={`${evidence.sourceId}-${index}`}>
              <div className="evidence-label">
                <span className={index === 0 ? 'evidence-a' : 'evidence-b'}>
                  SOURCE {String.fromCharCode(65 + index)}
                </span>
                <span>{source?.type}</span>
              </div>
              <blockquote>“{evidence.claim}”</blockquote>
              <div className="evidence-source">
                <strong>{source?.name || 'Source unavailable'}</strong>
                <span>
                  {evidence.author}
                  <span className="middle-dot">·</span>
                  {formatDate(evidence.date)}
                </span>
              </div>
              {expanded && (
                <div className="evidence-extra">
                  <strong>Source context</strong>
                  <p>{source?.summary || 'No additional source context is available.'}</p>
                </div>
              )}
              <button
                className="text-link"
                onClick={() => source && setSelectedSource(source)}
                disabled={!source}
              >
                <FileSearch size={14} />
                View Source
              </button>
            </div>
          )
        })}
      </div>
      {conflict.resolution && (
        <div className="resolution-box">
          <CheckCheck size={17} />
          <div>
            <strong>Human resolution</strong>
            <p>{conflict.resolution}</p>
          </div>
        </div>
      )}
      <div className="conflict-footer">
        <button
          className="text-link evidence-expand"
          aria-expanded={expanded}
          onClick={() => setExpanded(!expanded)}
        >
          <ChevronDown size={15} className={expanded ? 'rotated' : ''} />
          {expanded ? 'Less evidence detail' : 'More evidence detail'}
        </button>
        <div className="conflict-actions">
          {conflict.status !== 'Resolved' ? (
            <>
              <span className="review-note">Requires human review</span>
              <button
                className="button button-secondary button-sm"
                disabled={conflict.status === 'Under Review'}
                onClick={() => updateConflict(conflict.id, 'Under Review')}
              >
                <Check size={14} />
                {conflict.status === 'Under Review' ? 'Reviewed' : 'Mark as Reviewed'}
              </button>
              <button
                className="button button-primary button-sm"
                onClick={() => setResolving(true)}
              >
                Resolve Conflict
              </button>
            </>
          ) : (
            <Badge tone="green">
              <Check size={12} />
              Resolution recorded
            </Badge>
          )}
        </div>
      </div>
      {resolving && (
        <Modal
          title="Record a human resolution"
          description={conflict.title}
          onClose={() => setResolving(false)}
        >
          <form
            className="modal-form"
            onSubmit={(event) => {
              event.preventDefault()
              if (resolution.trim().length < 15) {
                setError('Please add at least 15 characters explaining your decision.')
                return
              }
              updateConflict(conflict.id, 'Resolved', resolution.trim())
              setResolving(false)
            }}
          >
            <div className="info-box">
              <ShieldAlert size={17} />
              <p>
                Review both sources before resolving. NEXUM does not choose which claim is correct.
                This records your decision in the current session.
              </p>
            </div>
            <label>
              Resolution and rationale
              <textarea
                rows={5}
                placeholder="Explain the current source of truth, what changed, and any follow-up needed..."
                value={resolution}
                onChange={(event) => {
                  setResolution(event.target.value)
                  setError('')
                }}
                maxLength={2500}
                required
              />
            </label>
            {error && (
              <p role="alert" className="form-error">
                {error}
              </p>
            )}
            <div className="modal-actions">
              <button
                type="button"
                className="button button-secondary"
                onClick={() => setResolving(false)}
              >
                Cancel
              </button>
              <button type="submit" className="button button-primary">
                <CheckCheck size={16} />
                Save resolution
              </button>
            </div>
          </form>
        </Modal>
      )}
    </article>
  )
}
