import { FileClock, FilePlus2, FolderPlus, GitBranch, ShieldAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { EmptyState } from './UI'
const icons = {
  source: FilePlus2,
  decision: GitBranch,
  conflict: ShieldAlert,
  report: FileClock,
  project: FolderPlus,
}
export default function ActivityFeed({
  projectId,
  limit = 5,
}: {
  projectId?: string
  limit?: number
}) {
  const { activities, projects } = useApp()
  const items = activities
    .filter((item) => !projectId || item.projectId === projectId)
    .slice(0, limit)
  return (
    <div className="activity-feed">
      {items.length ? (
        items.map((item) => {
          const Icon = icons[item.type]
          const project = projects.find((project) => project.id === item.projectId)
          const tab = {
            source: 'sources',
            decision: 'decisions',
            conflict: 'conflicts',
            report: 'handover',
            project: 'overview',
          }[item.type]
          return (
            <Link className="activity-item" key={item.id} to={`/projects/${item.projectId}/${tab}`}>
              <span className={`activity-icon activity-${item.type}`}>
                <Icon size={16} strokeWidth={1.6} />
              </span>
              <div className="activity-description">
                <strong>{item.title}</strong>
                <p>
                  <span>{project?.name}</span>
                  <span className="middle-dot">·</span>
                  {item.detail}
                </p>
              </div>
              <time>{item.time}</time>
            </Link>
          )
        })
      ) : (
        <EmptyState
          icon={FileClock}
          title="A fresh start"
          description="Project updates will appear here as you add sources and review knowledge."
        />
      )}
    </div>
  )
}
