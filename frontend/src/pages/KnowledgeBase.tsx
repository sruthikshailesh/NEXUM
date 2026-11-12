import {
  ArrowUpRight,
  BookOpen,
  Braces,
  FileText,
  GitPullRequest,
  Github,
  ListTodo,
  MessageSquareText,
  Plus,
  UploadCloud,
} from 'lucide-react'
import { useState } from 'react'
import { useApp } from '../context/AppContext'
import {
  Badge,
  DemoNote,
  EmptyState,
  FilterTabs,
  formatDate,
  PageHeader,
  SearchInput,
  Select,
  statusTone,
} from '../components/UI'
import UploadModal from '../components/UploadModal'
import type { SourceType } from '../types'
const sourceIcons = {
  PDF: FileText,
  TXT: FileText,
  Markdown: FileText,
  DOCX: FileText,
  JSON: Braces,
  'Meeting notes': MessageSquareText,
  GitHub: Github,
  'Pull request': GitPullRequest,
  'Task record': ListTodo,
}
const sourceTypes: SourceType[] = [
  'PDF',
  'TXT',
  'Markdown',
  'DOCX',
  'JSON',
  'Meeting notes',
  'GitHub',
  'Pull request',
  'Task record',
]
export function SourceTypeIcon({ type }: { type: SourceType }) {
  const Icon = sourceIcons[type]
  return (
    <span className={`file-icon file-${type.toLowerCase().replace(' ', '-')}`}>
      <Icon size={19} strokeWidth={1.5} />
    </span>
  )
}
export default function KnowledgeBase({
  projectId,
  embedded = false,
}: {
  projectId?: string
  embedded?: boolean
}) {
  const { sources, projects, setSelectedSource, demoMode } = useApp()
  const [query, setQuery] = useState('')
  const [type, setType] = useState('All sources')
  const [project, setProject] = useState(projectId || 'all')
  const [uploading, setUploading] = useState(false)
  const filtered = sources.filter(
    (source) =>
      (project === 'all' || source.projectId === project) &&
      (type === 'All sources' || source.type === type) &&
      `${source.name} ${source.summary}`.toLowerCase().includes(query.toLowerCase()),
  )
  return (
    <>
      {!embedded && (
        <PageHeader
          eyebrow="THE CONTEXT BEHIND THE CODE"
          title="Knowledge Base"
          description="One home for the documents, discussions, and details that matter."
          actions={
            <button className="button button-primary" onClick={() => setUploading(true)}>
              <Plus size={17} />
              Add sources
            </button>
          }
        />
      )}
      <div className="source-banner">
        <div className="source-banner-icon">
          <BookOpen size={23} strokeWidth={1.4} />
        </div>
        <div>
          <h3>Good knowledge starts with good sources.</h3>
          <p>Collect your documents today. Connect integrations in a future phase.</p>
        </div>
        <button className="button button-secondary" onClick={() => setUploading(true)}>
          <UploadCloud size={16} />
          Add local files
        </button>
      </div>
      <div className="toolbar">
        <SearchInput value={query} onChange={setQuery} placeholder="Search sources..." />
        {!projectId && (
          <Select label="Filter by project" value={project} onChange={setProject}>
            <option value="all">All projects</option>
            {projects.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </Select>
        )}
      </div>
      <FilterTabs
        values={['All sources', ...sourceTypes]}
        value={type}
        onChange={setType}
        label="Source type"
      />
      <div className="results-label">
        {filtered.length} {filtered.length === 1 ? 'source' : 'sources'}
        <span>Original context. Always traceable.</span>
      </div>
      <div className="source-table panel">
        <div className="source-table-head">
          <span>Source name</span>
          <span>Project</span>
          <span>Added</span>
          <span>Status</span>
          <span />
        </div>
        {filtered.length ? (
          filtered.map((source) => (
            <button
              className="source-table-row"
              key={source.id}
              onClick={() => setSelectedSource(source)}
            >
              <span className="source-name">
                <SourceTypeIcon type={source.type} />
                <span>
                  <strong>{source.name}</strong>
                  <small>
                    {source.type}
                    {source.size ? ` · ${source.size}` : ''}
                  </small>
                </span>
              </span>
              <span className="source-project">
                {projects.find((item) => item.id === source.projectId)?.name}
              </span>
              <span className="source-date">{formatDate(source.date)}</span>
              <span>
                <Badge tone={statusTone(source.status)} dot>
                  {source.status}
                </Badge>
              </span>
              <ArrowUpRight size={16} className="row-arrow" />
            </button>
          ))
        ) : (
          <EmptyState
            icon={BookOpen}
            title={
              sources.some((source) => !projectId || source.projectId === projectId)
                ? 'No matching sources'
                : 'Start with a little context'
            }
            description="Add local files or adjust the filters to explore your project knowledge."
            action={
              <button className="button button-secondary" onClick={() => setUploading(true)}>
                <Plus size={16} />
                Add sources
              </button>
            }
          />
        )}
      </div>
      <DemoNote>
        {demoMode
          ? '“Demo indexed” is a sample status, not live processing. GitHub, pull requests, and tasks are illustrative records, not connected integrations.'
          : '“Indexed” means the backend extracted text and stored page-aware chunks. GitHub, pull requests, and tasks are not connected integrations yet.'}
      </DemoNote>
      {uploading && <UploadModal projectId={projectId} onClose={() => setUploading(false)} />}
    </>
  )
}
