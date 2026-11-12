import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  initialActivity,
  initialConflicts,
  initialDecisions,
  initialProjects,
  initialReports,
  initialSources,
  makeSampleReport,
} from '../data/mockData'
import { ApiError, api } from '../services/api'
import type {
  ActionItem,
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

export interface UploadFeedback {
  added: number
  failed: { filename: string; message: string }[]
}

interface AppState {
  projects: Project[]
  sources: Source[]
  decisions: Decision[]
  conflicts: Conflict[]
  reports: Report[]
  activities: Activity[]
  actions: ActionItem[]
  questions: ActionItem[]
  preferences: Preferences
  setPreferences: (value: Preferences) => void
  loading: boolean
  loadError: string | null
  offline: boolean
  demoMode: boolean
  analyzing: boolean
  analysisError: string | null
  reload: () => Promise<void>
  createProject: (value: NewProject) => Promise<Project>
  addSources: (value: Source[]) => void
  uploadSources: (projectId: string, files: File[]) => Promise<UploadFeedback>
  analyzeProject: (projectId: string, sourceIds: string[]) => Promise<void>
  updateConflict: (id: string, status: ConflictStatus, resolution?: string) => Promise<void>
  generateReport: (projectId: string) => Promise<Report>
  reviewReport: (id: string) => Promise<void>
  loadDemoData: () => void
  exitDemo: () => void
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
const DEMO_KEY = 'nexum-demo-mode'

function demoWasLoaded() {
  try {
    return sessionStorage.getItem(DEMO_KEY) === '1'
  } catch {
    return false
  }
}

function timeAgo(iso: string) {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ''
  const minutes = Math.max(0, Math.round((Date.now() - then) / 60000))
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function errorMessage(error: unknown) {
  if (error instanceof ApiError) return error.message
  if (error instanceof Error) return error.message
  return 'Something went wrong. Please try again.'
}

export function AppProvider({ children }: { children: ReactNode }) {
  const initialDemo = demoWasLoaded()
  const [projects, setProjects] = useState<Project[]>(() =>
    initialDemo ? initialProjects : [],
  )
  const [sources, setSources] = useState<Source[]>(() => (initialDemo ? initialSources : []))
  const [decisions, setDecisions] = useState<Decision[]>(() =>
    initialDemo ? initialDecisions : [],
  )
  const [conflicts, setConflicts] = useState<Conflict[]>(() =>
    initialDemo ? initialConflicts : [],
  )
  const [reports, setReports] = useState<Report[]>(() => (initialDemo ? initialReports : []))
  const [actions, setActions] = useState<ActionItem[]>([])
  const [questions, setQuestions] = useState<ActionItem[]>([])
  const [loading, setLoading] = useState(!initialDemo)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [offline, setOffline] = useState(false)
  const [demoMode, setDemoMode] = useState(initialDemo)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [preferences, setPreferences] = useState<Preferences>({
    name: 'Alex Morgan',
    role: 'Workspace admin',
    compact: false,
    reduceMotion: false,
    defaultView: 'grid',
    defaultProjectId: '',
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

  const reload = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.workspace()
      setProjects(data.projects)
      setSources(data.sources)
      setDecisions(data.decisions)
      setConflicts(data.conflicts)
      setReports(data.reports)
      setActions(data.actions)
      setQuestions(data.questions)
      setOffline(false)
      setLoadError(null)
      setPreferences((current) =>
        current.defaultProjectId || !data.projects.length
          ? current
          : { ...current, defaultProjectId: data.projects[0].id },
      )
    } catch (error) {
      setLoadError(errorMessage(error))
      setOffline(error instanceof ApiError && error.isOffline)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!demoMode) void reload()
  }, [demoMode, reload])

  const activities = useMemo<Activity[]>(() => {
    if (demoMode) return initialActivity
    const items: (Activity & { at: string })[] = [
      ...projects.map((project) => ({
        id: `project-${project.id}`,
        type: 'project' as const,
        title: 'Project created',
        detail: 'Added to the workspace',
        time: timeAgo(project.updatedAt),
        projectId: project.id,
        at: project.updatedAt,
      })),
      ...sources.map((source) => ({
        id: `source-${source.id}`,
        type: 'source' as const,
        title: 'Source indexed',
        detail: source.name,
        time: timeAgo(source.date),
        projectId: source.projectId,
        at: source.date,
      })),
      ...decisions.map((decision) => ({
        id: `decision-${decision.id}`,
        type: 'decision' as const,
        title: 'Decision extracted',
        detail: decision.title,
        time: timeAgo(decision.date),
        projectId: decision.projectId,
        at: decision.date,
      })),
      ...reports.map((report) => ({
        id: `report-${report.id}`,
        type: 'report' as const,
        title: 'Handover generated',
        detail: report.title,
        time: timeAgo(report.date),
        projectId: report.projectId,
        at: report.date,
      })),
    ]
    return items
      .sort((a, b) => Date.parse(b.at) - Date.parse(a.at))
      .slice(0, 40)
      .map((activity) => ({
        id: activity.id,
        type: activity.type,
        title: activity.title,
        detail: activity.detail,
        time: activity.time,
        projectId: activity.projectId,
      }))
  }, [demoMode, projects, sources, decisions, reports])

  const loadDemoData = useCallback(() => {
    setProjects(initialProjects)
    setSources(initialSources)
    setDecisions(initialDecisions)
    setConflicts(initialConflicts)
    setReports(initialReports)
    setActions([])
    setQuestions([])
    setDemoMode(true)
    try {
      sessionStorage.setItem(DEMO_KEY, '1')
    } catch {
      // Private mode: demo still works for this page, it just won't survive a reload.
    }
    setLoading(false)
    setLoadError(null)
    setOffline(false)
    setPreferences((current) => ({
      ...current,
      defaultProjectId: current.defaultProjectId || 'shopsphere',
    }))
    setToast('ShopSphere demo data loaded. These are fictional examples, not AI output.')
  }, [])

  const exitDemo = useCallback(() => {
    try {
      sessionStorage.removeItem(DEMO_KEY)
    } catch {
      // Nothing to clear when storage is unavailable.
    }
    // Changing demoMode back to false makes the effect above reload the live workspace.
    setDemoMode(false)
    setProjects([])
    setSources([])
    setDecisions([])
    setConflicts([])
    setReports([])
    setActions([])
    setQuestions([])
    setSelectedSource(null)
    setLoadError(null)
    setOffline(false)
    setLoading(true)
    notify('Demo mode closed. Loading the live workspace…')
  }, [notify])

  const createProject = useCallback(
    async (value: NewProject) => {
      if (demoMode) {
        const project: Project = {
          ...value,
          id: crypto.randomUUID(),
          status: 'New project',
          color: 'violet',
          updatedAt: new Date().toISOString(),
          members: ['AM'],
        }
        setProjects((items) => [project, ...items])
        notify(`${project.name} created in the demo session.`)
        return project
      }
      const project = await api.createProject(value)
      setProjects((items) => [project, ...items])
      notify(`${project.name} created.`)
      return project
    },
    [demoMode, notify],
  )

  const addSources = useCallback(
    (value: Source[]) => {
      setSources((items) => [...value, ...items])
      notify(
        `${value.length} ${value.length === 1 ? 'file' : 'files'} added to the demo workspace. No AI processing was performed.`,
      )
    },
    [notify],
  )

  const uploadSources = useCallback(
    async (projectId: string, files: File[]): Promise<UploadFeedback> => {
      const { sources: uploaded, failed } = await api.uploadSources(projectId, files)
      if (uploaded.length) {
        setSources((items) => [...uploaded, ...items])
        setProjects((items) =>
          items.map((project) =>
            project.id === projectId
              ? { ...project, updatedAt: new Date().toISOString(), status: 'Needs review' }
              : project,
          ),
        )
      }
      notify(
        uploaded.length
          ? `${uploaded.length} ${uploaded.length === 1 ? 'source' : 'sources'} uploaded and indexed.`
          : 'No files were uploaded.',
      )
      return {
        added: uploaded.length,
        failed: failed.map((item) => ({ filename: item.filename, message: item.message })),
      }
    },
    [notify],
  )

  const analyzeProject = useCallback(
    async (projectId: string, sourceIds: string[]) => {
      if (demoMode) {
        notify('Demo data cannot be analyzed. Upload your own sources to run the AI pipeline.')
        return
      }
      setAnalyzing(true)
      setAnalysisError(null)
      try {
        await api.analyze(projectId, sourceIds)
        await reload()
        notify('Analysis complete. Every stored claim now points to a verified quote.')
      } catch (error) {
        const message = errorMessage(error)
        setAnalysisError(message)
        notify(message)
        throw error
      } finally {
        setAnalyzing(false)
      }
    },
    [demoMode, notify, reload],
  )

  const updateConflict = useCallback(
    async (id: string, status: ConflictStatus, resolution?: string) => {
      if (demoMode) {
        setConflicts((items) =>
          items.map((item) =>
            item.id === id ? { ...item, status, ...(resolution ? { resolution } : {}) } : item,
          ),
        )
        notify(
          status === 'Resolved'
            ? 'Resolution saved for this demo session.'
            : 'Marked as reviewed. The conflict still needs a resolution.',
        )
        return
      }
      const updated = await api.updateConflict(id, status, resolution)
      setConflicts((items) => items.map((item) => (item.id === id ? updated : item)))
      notify(
        status === 'Resolved'
          ? 'Human resolution saved.'
          : 'Marked as reviewed. The conflict still needs a resolution.',
      )
    },
    [demoMode, notify],
  )

  const generateReport = useCallback(
    async (projectId: string) => {
      if (demoMode) {
        const project = projects.find((item) => item.id === projectId)!
        const report = makeSampleReport(
          project,
          sources.filter((item) => item.projectId === projectId),
          decisions.filter((item) => item.projectId === projectId),
          conflicts.filter((item) => item.projectId === projectId),
        )
        setReports((items) => [report, ...items])
        notify('Sample report prepared from demo data. No AI was used.')
        return report
      }
      const report = await api.createReport(projectId)
      setReports((items) => [report, ...items])
      notify('Handover report generated from verified claims.')
      return report
    },
    [demoMode, projects, sources, decisions, conflicts, notify],
  )

  const reviewReport = useCallback(
    async (id: string) => {
      if (demoMode) {
        setReports((items) =>
          items.map((item) =>
            item.id === id
              ? { ...item, status: 'Reviewed', updatedAt: new Date().toISOString() }
              : item,
          ),
        )
        notify('Report marked as reviewed for this demo session.')
        return
      }
      const updated = await api.reviewReport(id)
      setReports((items) => items.map((item) => (item.id === id ? updated : item)))
      notify('Report marked as reviewed.')
    },
    [demoMode, notify],
  )

  return (
    <AppContext.Provider
      value={{
        projects,
        sources,
        decisions,
        conflicts,
        reports,
        activities,
        actions,
        questions,
        preferences,
        setPreferences,
        loading,
        loadError,
        offline,
        demoMode,
        analyzing,
        analysisError,
        reload,
        createProject,
        addSources,
        uploadSources,
        analyzeProject,
        updateConflict,
        generateReport,
        reviewReport,
        loadDemoData,
        exitDemo,
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
