import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  FileText,
  Folder,
  HeartPulse,
  Layers3,
  LoaderCircle,
  Search,
  ShoppingBag,
  Terminal,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useId, useRef, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { Project } from '../types'

export function Badge({
  children,
  tone = 'neutral',
  dot = false,
}: {
  children: ReactNode
  tone?: string
  dot?: boolean
}) {
  return (
    <span className={`badge badge-${tone}`}>
      {dot && <span className="status-dot" />}
      {children}
    </span>
  )
}
export function statusTone(status: string) {
  if (
    ['Up to date', 'Accepted', 'Resolved', 'Reviewed', 'Demo indexed', 'Indexed', 'Generated'].includes(
      status,
    )
  )
    return 'green'
  if (
    ['Needs review', 'Under Review', 'Unresolved', 'Proposed', 'Processing', 'Failed'].includes(
      status,
    )
  )
    return 'amber'
  if (['New project', 'Sample preview', 'Local only'].includes(status)) return 'violet'
  return 'neutral'
}
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string
  title: string
  description: string
  actions?: ReactNode
}) {
  return (
    <div className="page-header">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {actions && <div className="header-actions">{actions}</div>}
    </div>
  )
}
export function SectionTitle({
  title,
  description,
  link,
  to,
  count,
}: {
  title: string
  description?: string
  link?: string
  to?: string
  count?: number
}) {
  return (
    <div className="section-title">
      <div>
        <h2>
          {title}
          {count !== undefined && <span className="count-pill">{count}</span>}
        </h2>
        {description && <p>{description}</p>}
      </div>
      {to && (
        <Link className="text-link" to={to}>
          {link || 'View all'}
          <ArrowRight size={14} />
        </Link>
      )}
    </div>
  )
}
export function EmptyState({
  icon: Icon = Search,
  title = 'No results found',
  description = 'Try a different search or adjust your filters.',
  action,
}: {
  icon?: LucideIcon
  title?: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <Icon size={24} strokeWidth={1.5} />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  )
}
export function SearchInput({
  value,
  onChange,
  placeholder = 'Search…',
  label,
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
}) {
  return (
    <div className="search-input">
      <Search size={17} />
      <input
        aria-label={label || placeholder}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {value && (
        <button
          className="icon-button small"
          aria-label="Clear search"
          onClick={() => onChange('')}
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}
export function Select({
  label,
  value,
  onChange,
  children,
  className = '',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`select-wrap ${className}`}>
      <select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)}>
        {children}
      </select>
      <ChevronDown size={14} />
    </div>
  )
}
export function FilterTabs({
  values,
  value,
  onChange,
  label = 'Filter',
}: {
  values: string[]
  value: string
  onChange: (value: string) => void
  label?: string
}) {
  return (
    <div className="filter-tabs" role="group" aria-label={label}>
      {values.map((item) => (
        <button
          key={item}
          aria-pressed={value === item}
          className={value === item ? 'active' : ''}
          onClick={() => onChange(item)}
        >
          {item}
        </button>
      ))}
    </div>
  )
}
export function ProjectIcon({ project, size = '' }: { project: Project; size?: string }) {
  const Icon =
    project.id === 'shopsphere'
      ? ShoppingBag
      : project.id === 'carebridge'
        ? HeartPulse
        : project.id === 'devflow'
          ? Terminal
          : Folder
  return (
    <span className={`project-icon ${project.color} ${size}`}>
      <Icon size={size === 'small' ? 17 : 21} strokeWidth={1.7} />
    </span>
  )
}
export function Avatars({ members }: { members: string[] }) {
  return (
    <div className="avatar-stack" aria-label={`${members.length} sample team members`}>
      {members.slice(0, 3).map((member, index) => (
        <span key={`${member}-${index}`} className={`mini-avatar avatar-${index}`}>
          {member}
        </span>
      ))}
      {members.length > 3 && <span className="mini-avatar">+{members.length - 3}</span>}
    </div>
  )
}
export function DemoNote({ children }: { children?: ReactNode }) {
  return (
    <div className="demo-note">
      <Layers3 size={13} />
      <span>
        {children || 'Demo workspace. All insights are sample data; changes stay in this session.'}
      </span>
    </div>
  )
}
export function SourceLink({ name, onClick }: { name: string; onClick: () => void }) {
  return (
    <button className="source-link" onClick={onClick}>
      <FileText size={15} />
      <span>{name}</span>
      <ArrowUpRight size={14} />
    </button>
  )
}
export function Modal({
  title,
  description,
  onClose,
  children,
  wide = false,
}: {
  title: string
  description?: string
  onClose: () => void
  children: ReactNode
  wide?: boolean
}) {
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef(onClose)
  closeRef.current = onClose
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const panel = panelRef.current!
    const focusable = () => [
      ...panel.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), select, textarea, a[href], [tabindex="0"]',
      ),
    ]
    const firstInput = panel.querySelector<HTMLElement>('input, textarea, select')
    ;(firstInput || focusable()[0] || panel).focus()
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeRef.current()
      if (event.key === 'Tab') {
        const elements = focusable()
        const first = elements[0]
        const last = elements[elements.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last?.focus()
        }
        if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first?.focus()
        }
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKey)
      previous?.focus()
    }
  }, [])
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        className={`modal ${wide ? 'modal-wide' : ''}`}
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <div className="modal-heading">
          <div>
            <h2 id={titleId}>{title}</h2>
            {description && <p>{description}</p>}
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close dialog">
            <X size={19} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
export function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
export function shortDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
export function LoadingState({ label = 'Loading your workspace…' }: { label?: string }) {
  return (
    <div className="loading-state panel" role="status" aria-live="polite">
      <LoaderCircle size={22} className="spin" />
      <p>{label}</p>
    </div>
  )
}
export function ErrorState({
  title = 'Something interrupted this view',
  description,
  action,
}: {
  title?: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="empty-state" role="alert">
      <span className="empty-icon">
        <AlertTriangle size={24} strokeWidth={1.5} />
      </span>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action}
    </div>
  )
}
export function CheckRow({
  children,
  checked = false,
}: {
  children: ReactNode
  checked?: boolean
}) {
  return (
    <div className="check-row">
      <span className={`check-box ${checked ? 'checked' : ''}`}>
        {checked && <Check size={12} />}
      </span>
      <span>{children}</span>
    </div>
  )
}
