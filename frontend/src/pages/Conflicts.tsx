import { ShieldAlert, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { useApp } from '../context/AppContext'
import ConflictCard from '../components/ConflictCard'
import {
  Badge,
  DemoNote,
  EmptyState,
  FilterTabs,
  PageHeader,
  SearchInput,
  Select,
} from '../components/UI'
export default function Conflicts({
  projectId,
  embedded = false,
}: {
  projectId?: string
  embedded?: boolean
}) {
  const { conflicts, projects, demoMode } = useApp()
  const [status, setStatus] = useState('All')
  const [project, setProject] = useState(projectId || 'all')
  const [query, setQuery] = useState('')
  const filtered = conflicts.filter(
    (conflict) =>
      (project === 'all' || conflict.projectId === project) &&
      (status === 'All' || conflict.status === status) &&
      `${conflict.title} ${conflict.description}`.toLowerCase().includes(query.toLowerCase()),
  )
  return (
    <>
      {!embedded && (
        <PageHeader
          eyebrow="CLARITY THROUGH EVIDENCE"
          title="Evidence & Conflicts"
          description="When the records disagree, put the context side by side."
          actions={
            <Badge tone="amber">
              <ShieldAlert size={13} />
              {conflicts.filter((item) => item.status !== 'Resolved').length} need attention
            </Badge>
          }
        />
      )}
      <div className="info-banner">
        <ShieldCheck size={20} />
        <div>
          <strong>The evidence is here. The judgment is yours.</strong>
          <p>
            {demoMode
              ? 'Sample conflicts highlight contradictory records. Review the original sources and record a human resolution.'
              : 'Conflicts are detected across sources. Review both quotes and record a human resolution; NEXUM never picks a winner.'}
          </p>
        </div>
      </div>
      <div className="toolbar">
        <SearchInput value={query} onChange={setQuery} placeholder="Search conflicts..." />
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
        values={['All', 'Unresolved', 'Under Review', 'Resolved']}
        value={status}
        onChange={setStatus}
        label="Conflict status"
      />
      <div className="results-label">
        {filtered.length} {filtered.length === 1 ? 'conflict' : 'conflicts'}
        <span>No automated resolutions</span>
      </div>
      <div className="conflicts-list">
        {filtered.length ? (
          filtered.map((conflict) => <ConflictCard key={conflict.id} conflict={conflict} />)
        ) : (
          <EmptyState
            icon={ShieldCheck}
            title="No conflicts in this view"
            description="Adjust the filters or keep exploring your project's knowledge."
          />
        )}
      </div>
      <DemoNote>
        {demoMode
          ? 'Confidence scores are intentionally omitted: these are fictional examples, not measured AI predictions.'
          : 'Confidence scores are intentionally omitted. Both sides are shown with their source and page; no automated resolution is applied.'}
      </DemoNote>
    </>
  )
}
