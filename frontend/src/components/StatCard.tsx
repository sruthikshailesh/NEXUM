import { ArrowUpRight, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
export default function StatCard({
  label,
  value,
  note,
  icon: Icon,
  tone,
  points,
  to,
}: {
  label: string
  value: number
  note: string
  icon: LucideIcon
  tone: string
  points: string
  to: string
}) {
  return (
    <Link className={`stat-card stat-${tone}`} to={to}>
      <div className="stat-top">
        <span className="stat-icon">
          <Icon size={17} strokeWidth={1.6} />
        </span>
        <span className="stat-link">
          <ArrowUpRight size={14} />
        </span>
      </div>
      <div className="stat-label">{label}</div>
      <div className="stat-value-row">
        <strong>{value.toString().padStart(2, '0')}</strong>
        <svg className="sparkline" viewBox="0 0 95 35" aria-hidden="true">
          <polyline
            points={points}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="stat-note">
        <span className="status-dot" />
        {note}
      </div>
    </Link>
  )
}
