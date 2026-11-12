export type ProjectStatus = 'Up to date' | 'Needs review' | 'New project'
export interface Project {
  id: string
  name: string
  description: string
  stack: string[]
  color: 'violet' | 'green' | 'blue' | 'amber'
  updatedAt: string
  status: ProjectStatus
  members: string[]
}
export type SourceType =
  | 'PDF'
  | 'TXT'
  | 'JSON'
  | 'Meeting notes'
  | 'GitHub'
  | 'Pull request'
  | 'Task record'
  | 'Markdown'
  | 'DOCX'
export type SourceStatus = 'Demo indexed' | 'Local only' | 'Indexed' | 'Processing' | 'Failed'
export interface Source {
  id: string
  name: string
  type: SourceType
  projectId: string
  date: string
  status: SourceStatus
  summary: string
  content: string
  size?: string
}
export type DecisionStatus = 'Accepted' | 'Proposed' | 'Superseded' | 'Under Review'
export interface Decision {
  id: string
  title: string
  description: string
  projectId: string
  date: string
  people: string[]
  status: DecisionStatus
  sourceIds: string[]
  rationale: string
  history: { date: string; text: string }[]
}
export type ConflictStatus = 'Unresolved' | 'Under Review' | 'Resolved'
export interface Conflict {
  id: string
  title: string
  description: string
  projectId: string
  date: string
  status: ConflictStatus
  evidence: {
    sourceId: string
    claim: string
    date: string
    author: string
    /** Present for real backend evidence, so every claim stays traceable to a page. */
    page?: number | null
  }[]
  resolution?: string
}
export type ReportStatus = 'Sample preview' | 'Reviewed' | 'Generated'
export interface Report {
  id: string
  title: string
  projectId: string
  date: string
  updatedAt: string
  status: ReportStatus
  sections: { title: string; content: string }[]
  sourceIds: string[]
  /** Markdown export from the backend; absent for demo reports. */
  markdown?: string
}
export interface Activity {
  id: string
  type: 'source' | 'decision' | 'conflict' | 'report' | 'project'
  title: string
  detail: string
  time: string
  projectId: string
}
export interface Preferences {
  name: string
  role: string
  compact: boolean
  reduceMotion: boolean
  defaultView: 'grid' | 'list'
  defaultProjectId: string
}
/** Verified next action / pending task / question extracted from a source chunk. */
export interface ActionItem {
  id: string
  projectId: string
  title: string
  detail: string
  owner: string
  epistemicType: 'confirmed' | 'assumption' | 'unknown'
  sourceIds: string[]
}
