import type { Conflict, Decision, Project, Report, Source, SourceType } from '../types'

// Future backend contracts only. BackendApi is not instantiated in Phase1.
// There are no clients, endpoint implementations, network calls, or mock-success responses here.
// A future adapter must map backend records to the existing frontend types; demo indexing and
// sample-report labels must not be treated as proof of real processing or human review.

export type CreateProjectInput = Pick<
  Project,
  'name' | 'description' | 'stack' | 'color' | 'members'
>

export interface ProjectScope {
  projectId: Project['id']
}

export interface SourceUploadInput extends ProjectScope {
  name: Source['name']
  type: SourceType
  file: File
}

export interface SourceProcessingInput extends ProjectScope {
  sourceId: Source['id']
}

export interface SourceProcessingResult extends ProjectScope {
  jobId: string
  sourceId: Source['id']
  status: 'queued' | 'processing' | 'completed' | 'failed'
  error?: { code: string; message: string }
}

export interface SourceSelection extends ProjectScope {
  // Explicit selection; an empty array means no sources, never all project sources implicitly.
  // The future backend must authorize the project and validate that every source belongs to it.
  sourceIds: Source['id'][]
}

export interface ContextExtractionResult extends ProjectScope {
  id: string
  sourceIds: Source['id'][]
  summary: string
  decisions: Decision[]
  extractedAt: string
}

export type EntityKind = 'person' | 'component' | 'technology' | 'decision' | 'task' | 'document'

export interface KnowledgeEntity extends ProjectScope {
  id: string
  kind: EntityKind
  name: string
  description: string
  sourceIds: Source['id'][]
}

export interface KnowledgeRelationship extends ProjectScope {
  id: string
  fromEntityId: KnowledgeEntity['id']
  toEntityId: KnowledgeEntity['id']
  kind: 'depends_on' | 'owns' | 'implements' | 'supersedes' | 'related_to'
  sourceIds: Source['id'][]
}

export type EvidenceTarget =
  | { kind: 'decision'; id: Decision['id'] }
  | { kind: 'conflict'; id: Conflict['id'] }
  | { kind: 'entity'; id: KnowledgeEntity['id'] }
  | { kind: 'relationship'; id: KnowledgeRelationship['id'] }

export type EvidenceLocator =
  | { kind: 'page'; page: number }
  | { kind: 'lines'; startLine: number; endLine: number }
  | { kind: 'message'; messageId: string }
  | { kind: 'whole-source' }

export interface LinkEvidenceInput extends ProjectScope {
  sourceId: Source['id']
  target: EvidenceTarget
  quote: string
  locator: EvidenceLocator
}

export interface EvidenceLink extends LinkEvidenceInput {
  id: string
  createdAt: string
}

export interface DetectConflictsInput extends SourceSelection {
  decisionIds: Decision['id'][]
}

export interface GenerateReportInput extends SourceSelection {
  decisionIds: Decision['id'][]
  conflictIds: Conflict['id'][]
}

// Promise results describe future operations, not available Phase1 behavior.
// Transport, authorization, pagination, validation, and job polling remain backend design work.
// No generated report may be mapped to “Reviewed” without a separate, explicit human review.
export interface BackendApi {
  projects: {
    list(): Promise<Project[]>
    create(input: CreateProjectInput): Promise<Project>
  }
  sources: {
    upload(input: SourceUploadInput): Promise<Source>
    process(input: SourceProcessingInput): Promise<SourceProcessingResult>
  }
  context: {
    extract(input: SourceSelection): Promise<ContextExtractionResult>
  }
  entities: {
    list(input: ProjectScope): Promise<KnowledgeEntity[]>
  }
  relationships: {
    list(input: ProjectScope): Promise<KnowledgeRelationship[]>
  }
  evidence: {
    link(input: LinkEvidenceInput): Promise<EvidenceLink>
  }
  conflicts: {
    detect(input: DetectConflictsInput): Promise<Conflict[]>
  }
  reports: {
    generate(input: GenerateReportInput): Promise<Report>
  }
}
