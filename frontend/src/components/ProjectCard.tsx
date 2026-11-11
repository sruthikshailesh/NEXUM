import { ArrowUpRight, Clock3, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import type { Project } from '../types'
import { Avatars, Badge, ProjectIcon, shortDate, statusTone } from './UI'
export default function ProjectCard({
  project,
  detailed = false,
  list = false,
}: {
  project: Project
  detailed?: boolean
  list?: boolean
}) {
  const { sources } = useApp()
  const count = sources.filter((source) => source.projectId === project.id).length
  return (
    <Link
      to={`/projects/${project.id}`}
      className={`project-card ${list ? 'project-list-card' : ''}`}
    >
      <div className="project-card-top">
        <ProjectIcon project={project} />
        <span className="project-card-arrow">
          <ArrowUpRight size={18} />
        </span>
      </div>
      <div className="project-card-main">
        <h3>{project.name}</h3>
        <p>{project.description}</p>
        {detailed && (
          <div className="stack-tags">
            {project.stack.slice(0, 4).map((tech) => (
              <span key={tech}>{tech}</span>
            ))}
            {project.stack.length === 0 && <span>No technologies added</span>}
          </div>
        )}
      </div>
      <div className="project-card-meta">
        <span>
          <FileText size={13} />
          {count} sources
        </span>
        <span>
          <Clock3 size={13} />
          {shortDate(project.updatedAt)}
        </span>
      </div>
      <div className="project-card-footer">
        <Badge tone={statusTone(project.status)} dot>
          {project.status}
        </Badge>
        <Avatars members={project.members} />
      </div>
    </Link>
  )
}
