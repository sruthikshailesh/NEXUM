import type {
  ActionItem,
  Conflict,
  ConflictStatus,
  Decision,
  DecisionStatus,
  Project,
  ProjectStatus,
  Report,
  ReportStatus,
  Source,
  SourceStatus,
  SourceType,
} from '../types'

/**
 * Typed client for the NEXUM FastAPI backend.
 * VITE_API_URL is public (never a secret); default is the local dev server.
 */
export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(
  /\/+$/,
  '',
)

export class ApiError extends Error {
  code: string
  status: number

  constructor(code: string, message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
  }

  get isOffline() {
    return this.status === 0
  }
}

type Json = Record<string, unknown>

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, init)
  } catch {
    throw new ApiError(
      'backend_unreachable',
      'The NEXUM backend is unreachable. Check that it is running, or explore the demo data.',
      0,
    )
  }

  if (!response.ok) {
    let code = 'request_failed'
    let message = `The server returned ${response.status}.`
    try {
      const body = (await response.json()) as { error?: { code?: string; message?: string } }
      if (body.error?.code) code = body.error.code
      if (body.error?.message) message = body.error.message
    } catch {
      // Non-JSON errors keep the generic message.
    }
    throw new ApiError(code, message, response.status)
  }

  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

// ------------------------------------------------------------- backend shapes
interface ProjectRaw {
  id: string
  name: string
  description: string
  stack: string[]
  color: string
  status: string
  members: string[]
  created_at: string
  updated_at: string
}

interface SourceRaw {
  id: string
  project_id: string
  name: string
  type: string
  date: string
  status: string
  summary: string
  content: string
  size: string
  size_bytes: number
  page_count: number
  chunk_count: number
}

interface EvidenceRaw {
  source_id: string
  source_name: string
  page: number | null
  quote: string
  verified: boolean
}

interface ClaimRaw {
  id: string
  project_id: string
  kind: string
  epistemic_type: string
  title: string
  detail: string
  rationale: string
  status: string
  people: string[]
  created_at: string
  evidence: EvidenceRaw[]
}

interface ConflictRaw {
  id: string
  project_id: string
  title: string
  description: string
  date: string
  status: string
  resolution: string | null
  evidence: {
    source_id: string
    source_name: string
    page: number | null
    claim: string
    quote: string
    date: string
    author: string
  }[]
}

interface ReportRaw {
  id: string
  title: string
  project_id: string
  date: string
  updated_at: string
  status: string
  sections: { title: string; content: string }[]
  source_ids: string[]
  markdown: string
}

interface WorkspaceRaw {
  projects: ProjectRaw[]
  sources: SourceRaw[]
  claims: ClaimRaw[]
  conflicts: ConflictRaw[]
  reports: ReportRaw[]
}

export interface UploadFailure {
  filename: string
  code: string
  message: string
}

interface UploadRaw {
  uploaded: SourceRaw[]
  failed: UploadFailure[]
}

// ---------------------------------------------------------------- mappers
const PROJECT_STATUSES: ProjectStatus[] = ['Up to date', 'Needs review', 'New project']
const SOURCE_TYPES: SourceType[] = [
  'PDF',
  'TXT',
  'JSON',
  'Meeting notes',
  'GitHub',
  'Pull request',
  'Task record',
  'Markdown',
  'DOCX',
]
const SOURCE_STATUSES: SourceStatus[] = [
  'Indexed',
  'Processing',
  'Failed',
  'Demo indexed',
  'Local only',
]
const DECISION_STATUSES: DecisionStatus[] = [
  'Accepted',
  'Proposed',
  'Superseded',
  'Under Review',
]
const CONFLICT_STATUSES: ConflictStatus[] = ['Unresolved', 'Under Review', 'Resolved']

function oneOf<T extends string>(values: T[], value: string, fallback: T): T {
  return values.includes(value as T) ? (value as T) : fallback
}

function projectFromRaw(raw: ProjectRaw): Project {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    stack: raw.stack ?? [],
    color: oneOf(['violet', 'green', 'blue', 'amber'], raw.color, 'violet'),
    updatedAt: raw.updated_at,
    status: oneOf(PROJECT_STATUSES, raw.status, 'New project'),
    members: raw.members ?? [],
  }
}

function sourceFromRaw(raw: SourceRaw): Source {
  return {
    id: raw.id,
    projectId: raw.project_id,
    name: raw.name,
    type: oneOf(SOURCE_TYPES, raw.type, 'TXT'),
    date: raw.date,
    status: oneOf(SOURCE_STATUSES, raw.status, 'Indexed'),
    summary: raw.summary,
    content: raw.content,
    size: raw.size,
  }
}

function evidenceText(evidence: EvidenceRaw): string {
  const page = evidence.page ? `, page ${evidence.page}` : ''
  return `Extracted from ${evidence.source_name}${page}: “${evidence.quote}”`
}

export function decisionFromClaim(raw: ClaimRaw): Decision {
  const sourceIds = [...new Set(raw.evidence.map((item) => item.source_id))]
  return {
    id: raw.id,
    title: raw.title,
    description: raw.detail || raw.title,
    projectId: raw.project_id,
    date: raw.created_at,
    people: raw.people ?? [],
    status: oneOf(DECISION_STATUSES, raw.status, 'Under Review'),
    sourceIds,
    rationale:
      raw.rationale || 'No explicit rationale was recorded in the source documents.',
    history: raw.evidence.map((item) => ({
      date: raw.created_at,
      text: evidenceText(item),
    })),
  }
}

export function actionFromClaim(raw: ClaimRaw): ActionItem {
  return {
    id: raw.id,
    projectId: raw.project_id,
    title: raw.title,
    detail: raw.detail,
    owner: 'Unassigned',
    epistemicType: oneOf(
      ['confirmed', 'assumption', 'unknown'] as const,
      raw.epistemic_type,
      'unknown',
    ),
    sourceIds: [...new Set(raw.evidence.map((item) => item.source_id))],
  }
}

function conflictFromRaw(raw: ConflictRaw): Conflict {
  return {
    id: raw.id,
    projectId: raw.project_id,
    title: raw.title,
    description: raw.description,
    date: raw.date,
    status: oneOf(CONFLICT_STATUSES, raw.status, 'Unresolved'),
    evidence: raw.evidence.map((item) => ({
      sourceId: item.source_id,
      claim: item.quote || item.claim,
      date: item.date,
      author: item.author || item.source_name,
      page: item.page,
    })),
    ...(raw.resolution ? { resolution: raw.resolution } : {}),
  }
}

function reportFromRaw(raw: ReportRaw): Report {
  return {
    id: raw.id,
    title: raw.title,
    projectId: raw.project_id,
    date: raw.date,
    updatedAt: raw.updated_at,
    status: oneOf(
      ['Sample preview', 'Reviewed', 'Generated'] as ReportStatus[],
      raw.status,
      'Generated',
    ),
    sections: raw.sections ?? [],
    sourceIds: raw.source_ids ?? [],
    markdown: raw.markdown,
  }
}

export interface WorkspaceData {
  projects: Project[]
  sources: Source[]
  decisions: Decision[]
  conflicts: Conflict[]
  reports: Report[]
  actions: ActionItem[]
  questions: ActionItem[]
}

export function mapWorkspace(raw: WorkspaceRaw): WorkspaceData {
  const claims = raw.claims ?? []
  return {
    projects: (raw.projects ?? []).map(projectFromRaw),
    sources: (raw.sources ?? []).map(sourceFromRaw),
    decisions: claims.filter((claim) => claim.kind === 'decision').map(decisionFromClaim),
    conflicts: (raw.conflicts ?? []).map(conflictFromRaw),
    reports: (raw.reports ?? []).map(reportFromRaw),
    actions: claims
      .filter((claim) => claim.kind === 'pending' || claim.kind === 'next_action')
      .map(actionFromClaim),
    questions: claims.filter((claim) => claim.kind === 'question').map(actionFromClaim),
  }
}

// ---------------------------------------------------------------- endpoints
export const api = {
  health: () => request<{ status: string }>('/api/health'),

  workspace: async () => mapWorkspace(await request<WorkspaceRaw>('/api/workspace')),

  createProject: async (input: {
    name: string
    description: string
    stack: string[]
  }): Promise<Project> =>
    projectFromRaw(
      await request<ProjectRaw>('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      }),
    ),

  uploadSources: async (
    projectId: string,
    files: File[],
  ): Promise<{ sources: Source[]; failed: UploadFailure[] }> => {
    const form = new FormData()
    for (const file of files) form.append('files', file)
    const raw = await request<UploadRaw>(`/api/projects/${projectId}/sources`, {
      method: 'POST',
      body: form,
    })
    return { sources: raw.uploaded.map(sourceFromRaw), failed: raw.failed }
  },

  analyze: (projectId: string, sourceIds: string[]) =>
    request<Json>(`/api/projects/${projectId}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source_ids: sourceIds }),
    }),

  updateConflict: async (
    conflictId: string,
    status: ConflictStatus,
    resolution?: string,
  ): Promise<Conflict> =>
    conflictFromRaw(
      await request<ConflictRaw>(`/api/conflicts/${conflictId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, ...(resolution ? { resolution } : {}) }),
      }),
    ),

  createReport: async (projectId: string): Promise<Report> =>
    reportFromRaw(
      await request<ReportRaw>(`/api/projects/${projectId}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      }),
    ),

  reviewReport: async (reportId: string): Promise<Report> =>
    reportFromRaw(
      await request<ReportRaw>(`/api/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Reviewed' }),
      }),
    ),
}
