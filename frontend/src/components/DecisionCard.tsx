import { ArrowUpRight, CalendarDays, FileText, GitBranch, Users } from 'lucide-react'
import { useApp } from '../context/AppContext'
import type { Decision } from '../types'
import { Badge, formatDate, statusTone } from './UI'
export default function DecisionCard({
  decision,
  onOpen,
}: {
  decision: Decision
  onOpen: () => void
}) {
  const { projects } = useApp()
  return (
    <button className="decision-card panel" onClick={onOpen}>
      <div className="decision-card-top">
        <span className="decision-icon">
          <GitBranch size={18} strokeWidth={1.5} />
        </span>
        <span className="micro muted">
          {projects.find((project) => project.id === decision.projectId)?.name}
        </span>
        <Badge tone={statusTone(decision.status)} dot>
          {decision.status}
        </Badge>
      </div>
      <h3>{decision.title}</h3>
      <p>{decision.description}</p>
      <div className="decision-meta">
        <span>
          <CalendarDays size={13} />
          {formatDate(decision.date)}
        </span>
        <span>
          <Users size={13} />
          {decision.people.length} people
        </span>
      </div>
      <div className="decision-card-bottom">
        <span>
          <FileText size={14} />
          {decision.sourceIds.length} supporting sources
        </span>
        <span>
          View decision
          <ArrowUpRight size={14} />
        </span>
      </div>
    </button>
  )
}
