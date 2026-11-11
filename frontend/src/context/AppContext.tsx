import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  initialActivity,
  initialConflicts,
  initialDecisions,
  initialProjects,
  initialReports,
  initialSources,
  makeSampleReport,
} from '../data/mockData'
import type {
  Activity,
  Conflict,
  ConflictStatus,
  Decision,
  Preferences,
  Project,
  Report,
  Source,
} from '../types'

type NewProject = Pick<Project, 'name' | 'description' | 'stack'>
interface AppState {
  projects: Project[]
  sources: Source[]
  decisions: Decision[]
  conflicts: Conflict[]
  reports: Report[]
  activities: Activity[]
  preferences: Preferences
  setPreferences: (value: Preferences) => void
  createProject: (value: NewProject) => Project
  addSources: (value: Source[]) => void
  updateConflict: (id: string, status: ConflictStatus, resolution?: string) => void
  generateReport: (projectId: string) => Report
  reviewReport: (id: string) => void
  newProjectOpen: boolean
  setNewProjectOpen: (open: boolean) => void
  searchOpen: boolean
  setSearchOpen: (open: boolean) => void
  selectedSource: Source | null
  setSelectedSource: (source: Source | null) => void
  toast: string | null
  notify: (message: string) => void
}
const AppContext = createContext<AppState | null>(null)
export function AppProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState(initialProjects)
  const [sources, setSources] = useState(initialSources)
  const [decisions] = useState(initialDecisions)
  const [conflicts, setConflicts] = useState(initialConflicts)
  const [reports, setReports] = useState(initialReports)
  const [activities, setActivities] = useState(initialActivity)
  const [preferences, setPreferences] = useState<Preferences>({
    name: 'Alex Morgan',
    role: 'Workspace admin',
    compact: false,
    reduceMotion: false,
    defaultView: 'grid',
    defaultProjectId: 'shopsphere',
  })
  const [newProjectOpen, setNewProjectOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [selectedSource, setSelectedSource] = useState<Source | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const notify = useCallback((message: string) => setToast(message), [])
  useEffect(() => {
    if (!toast) return
    const timeout = window.setTimeout(() => setToast(null), 4500)
    return () => window.clearTimeout(timeout)
  }, [toast])
  const addActivity = (activity: Omit<Activity, 'id' | 'time'>) =>
    setActivities((items) => [{ ...activity, id: crypto.randomUUID(), time: 'Just now' }, ...items])
  const createProject = (value: NewProject) => {
    const project: Project = {
      ...value,
      id: crypto.randomUUID(),
      status: 'New project',
      color: 'violet',
      updatedAt: new Date().toISOString(),
      members: ['AM'],
    }
    setProjects((items) => [project, ...items])
    addActivity({
      type: 'project',
      title: 'New project created',
      detail: project.name,
      projectId: project.id,
    })
    notify(`${project.name} created in this session.`)
    return project
  }
  const addSources = (value: Source[]) => {
    setSources((items) => [...value, ...items])
    for (const projectId of new Set(value.map((source) => source.projectId))) {
      const count = value.filter((source) => source.projectId === projectId).length
      const project = projects.find((item) => item.id === projectId)
      addActivity({
        type: 'source',
        title: `${count} local ${count === 1 ? 'source' : 'sources'} added`,
        detail: project?.name ?? 'Project',
        projectId,
      })
      setProjects((items) =>
        items.map((item) =>
          item.id === projectId
            ? { ...item, updatedAt: new Date().toISOString(), status: 'Needs review' }
            : item,
        ),
      )
    }
    notify(
      `${value.length} ${value.length === 1 ? 'file' : 'files'} added locally. No AI processing was performed.`,
    )
  }
  const updateConflict = (id: string, status: ConflictStatus, resolution?: string) => {
    const conflict = conflicts.find((item) => item.id === id)
    setConflicts((items) =>
      items.map((item) =>
        item.id === id ? { ...item, status, ...(resolution ? { resolution } : {}) } : item,
      ),
    )
    if (conflict)
      addActivity({
        type: 'conflict',
        title:
          status === 'Resolved' ? 'Conflict resolved by reviewer' : 'Conflict marked for review',
        detail: conflict.title,
        projectId: conflict.projectId,
      })
    notify(
      status === 'Resolved'
        ? 'Resolution saved for this session.'
        : 'Marked as reviewed. The conflict still needs a resolution.',
    )
  }
  const generateReport = (projectId: string) => {
    const project = projects.find((item) => item.id === projectId)!
    const report = makeSampleReport(
      project,
      sources.filter((item) => item.projectId === projectId),
      decisions.filter((item) => item.projectId === projectId),
      conflicts.filter((item) => item.projectId === projectId),
    )
    setReports((items) => [report, ...items])
    addActivity({
      type: 'report',
      title: 'Sample handover prepared',
      detail: project.name,
      projectId,
    })
    notify('Sample report prepared from local data. No AI was used.')
    return report
  }
  const reviewReport = (id: string) => {
    setReports((items) =>
      items.map((item) =>
        item.id === id
          ? { ...item, status: 'Reviewed', updatedAt: new Date().toISOString() }
          : item,
      ),
    )
    notify('Report marked as reviewed for this session.')
  }
  return (
    <AppContext.Provider
      value={{
        projects,
        sources,
        decisions,
        conflicts,
        reports,
        activities,
        preferences,
        setPreferences,
        createProject,
        addSources,
        updateConflict,
        generateReport,
        reviewReport,
        newProjectOpen,
        setNewProjectOpen,
        searchOpen,
        setSearchOpen,
        selectedSource,
        setSelectedSource,
        toast,
        notify,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used inside AppProvider')
  return context
}
