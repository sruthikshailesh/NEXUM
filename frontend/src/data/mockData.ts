import type { Activity, Conflict, Decision, Project, Report, Source, SourceType } from '../types'

// Fictional demo fixtures, not imported customer records, live integrations, or AI findings.
export const sourceTypes: SourceType[] = [
  'PDF',
  'TXT',
  'JSON',
  'Meeting notes',
  'GitHub',
  'Pull request',
  'Task record',
]

export const initialProjects: Project[] = [
  {
    id: 'shopsphere',
    name: 'ShopSphere',
    description: 'E-commerce platform for a better discovery-to-checkout experience.',
    stack: ['React', 'TypeScript', 'FastAPI', 'PostgreSQL'],
    color: 'violet',
    updatedAt: '2026-11-11T10:30:00.000Z',
    status: 'Needs review',
    members: ['AM', 'SK', 'JL'],
  },
  {
    id: 'carebridge',
    name: 'CareBridge',
    description: 'Healthcare companion connecting patients, referrals, and care teams.',
    stack: ['React', 'TypeScript', 'Django', 'PostgreSQL'],
    color: 'green',
    updatedAt: '2026-11-11T09:45:00.000Z',
    status: 'Up to date',
    members: ['NP', 'EC', 'AM'],
  },
  {
    id: 'devflow',
    name: 'DevFlow',
    description: 'Developer productivity platform for teams that build together.',
    stack: ['Next.js', 'TypeScript', 'Node.js', 'PostgreSQL'],
    color: 'blue',
    updatedAt: '2026-11-11T08:30:00.000Z',
    status: 'Needs review',
    members: ['JL', 'RD', 'SK'],
  },
]

export const initialSources: Source[] = [
  {
    id: 'ss-architecture-pdf',
    projectId: 'shopsphere',
    name: 'ShopSphere — architecture brief v0.3.pdf',
    type: 'PDF',
    date: '2026-11-06T14:00:00.000Z',
    status: 'Demo indexed',
    size: '184 KB',
    summary:
      'Sample historical architecture brief: React storefront, FastAPI services, and an early Elasticsearch search plan.',
    content: `Sample document — fictional architecture brief, revision 0.3, prepared by Aisha Mehta (AM). ShopSphere pairs a React and TypeScript storefront with a FastAPI application and PostgreSQL for products, orders, and customer records. The service boundary keeps payment-provider calls on the server and exposes a small catalog API to the storefront.

Historical plan: This November 6 draft selected Elasticsearch for product search and assumed an asynchronous catalog-indexing worker. That choice was provisional pending a catalog-discovery spike; this document is retained as historical evidence, not as the current search decision. Stripe was the preferred sandbox payment provider, with webhook delivery treated as at-least-once.

Dependency: Production payment rollout requires provider configuration, secret management, and an agreed reconciliation runbook; this brief is not release approval. Authentication should use short-lived JWT access tokens and a separately revocable refresh session. No credentials, customer records, or production endpoints are included in this sample.`,
  },
  {
    id: 'ss-search-spike-txt',
    projectId: 'shopsphere',
    name: 'Catalog search spike — findings.txt',
    type: 'TXT',
    date: '2026-11-09T16:20:00.000Z',
    status: 'Demo indexed',
    size: '4.2 KB',
    summary:
      'Sample discovery notes recommend PostgreSQL full-text search over a separate Elasticsearch cluster for the pilot.',
    content: `Sample engineering notes — Samir Khan (SK), November 9. The catalog spike used synthetic products and compared a PostgreSQL full-text query with the operational work needed for an Elasticsearch index. PostgreSQL covered the pilot's token search and category filters without introducing a second datastore or an indexing worker. These observations are fictional demo findings, not measured production benchmarks.

Completed: The synthetic-data search spike and query review are recorded as complete in this sample. The recommendation is a GIN-backed search vector with parameterized queries; typo tolerance and advanced relevance tuning remain outside the pilot scope.
Incomplete: Production-shaped load testing and storefront relevance acceptance are still pending.

Risk: Search behavior on synthetic catalog data does not establish production latency or result quality.
Next action: SK should run the agreed load profile and have JL review representative search results before the pilot search gate is signed off.`,
  },
  {
    id: 'ss-payment-slack-json',
    projectId: 'shopsphere',
    name: 'Slack export — checkout recovery.json',
    type: 'JSON',
    date: '2026-11-11T09:05:00.000Z',
    status: 'Demo indexed',
    size: '3.6 KB',
    summary:
      'Sample Slack export: payment retries approved in the meeting remain temporarily disabled behind a feature flag.',
    content: `{
  "sample": true,
  "channel": "demo-checkout",
  "exportedAt": "2026-11-11T09:05:00.000Z",
  "messages": [
    {
      "author": "Samir Khan (SK)",
      "date": "2026-11-11T08:40:00.000Z",
      "text": "Current state: Automatic payment retries are temporarily disabled in the sample staging environment; PAYMENT_RETRIES_ENABLED is false. Yesterday's meeting approved the retry policy, but the webhook replay check exposed an order-state reconciliation gap. This is a temporary operational hold, not a decision to remove Stripe."
    },

    {
      "author": "Aisha Mehta (AM)",
      "date": "2026-11-11T08:52:00.000Z",
      "text": "Risk: Turning retries back on before reconciliation is verified could repeat a payment attempt while an earlier provider result is still being reconciled. Do not mark checkout recovery as released. Existing idempotent webhook handling is useful, but it is not evidence that the retry workflow is safe end to end."
    },

    {
      "author": "Jordan Lee (JL)",
      "date": "2026-11-11T09:00:00.000Z",
      "text": "Next action: SK should attach the webhook replay results, and AM should record the re-enable gate in the checkout runbook. The November 10 meeting approval and today's disabled flag need one reconciled status before the handover is marked reviewed. This export contains fictional demo messages only."
    }
  ]
}`,
  },
  {
    id: 'ss-checkpoint-meeting',
    projectId: 'shopsphere',
    name: 'Pilot checkpoint — architecture and checkout',
    type: 'Meeting notes',
    date: '2026-11-10T15:00:00.000Z',
    status: 'Demo indexed',
    size: '5.1 KB',
    summary:
      'Sample meeting accepts PostgreSQL search and JWT sessions, and approves bounded Stripe payment retries subject to replay checks.',
    content: `Sample meeting notes — November 10, attended by Aisha Mehta (AM), Samir Khan (SK), and Jordan Lee (JL). The team accepted replacing the earlier Elasticsearch proposal with PostgreSQL full-text search for the ShopSphere pilot. The existing React/TypeScript storefront and FastAPI service remain unchanged; advanced relevance features will be reconsidered only after pilot feedback.

Decision record: Stripe remains the selected payment provider. The meeting approved bounded automatic payment retries with exponential backoff and an idempotency key per payment attempt, with rollout conditional on successful webhook replay and reconciliation checks. This records approval of the policy, not confirmation that retries were enabled. The team also accepted short-lived JWT access tokens with rotating, revocable refresh sessions after reviewing the authentication pull request.

Question: Who records the final retry re-enable sign-off after SK supplies replay evidence? AM will coordinate the runbook update, but the final approval entry is not present in these notes.
Next action: Reconcile the approved payment policy with the actual staging flag and publish the release gate before the checkout handover.`,
  },
  {
    id: 'ss-github-snapshot',
    projectId: 'shopsphere',
    name: 'GitHub — ShopSphere repository snapshot',
    type: 'GitHub',
    date: '2026-11-11T07:45:00.000Z',
    status: 'Demo indexed',
    size: '6.4 KB',
    summary:
      'Sample repository snapshot records merged authentication and PostgreSQL search wiring; it is not a live GitHub connection.',
    content: `Sample repository snapshot — a fictional, manually curated GitHub-style record, not a fetched repository. The storefront uses React and TypeScript, the API uses FastAPI, and PostgreSQL holds catalog and order data. The catalog search route now uses PostgreSQL full-text queries; the earlier Elasticsearch worker is not part of the pilot implementation.

Current state: The sample main-branch snapshot contains the PostgreSQL search integration and JWT session endpoints. These are repository observations, not deployment or production-readiness claims.
Completed: The PostgreSQL search migration and storefront API wiring are recorded as merged. Authentication changes are separately documented in the linked sample pull request.

Incomplete: Search performance sign-off and payment reconciliation release checks are not included in this snapshot.
Dependency: The checkout pilot depends on staging replay evidence and a reviewed operational runbook. A merged change alone does not satisfy either release gate.`,
  },
  {
    id: 'ss-auth-pr',
    projectId: 'shopsphere',
    name: 'PR #42 — JWT session lifecycle',
    type: 'Pull request',
    date: '2026-11-09T13:10:00.000Z',
    status: 'Demo indexed',
    size: '4.8 KB',
    summary:
      'Sample merged pull request adds short-lived JWT access tokens, refresh rotation, and session revocation tests.',
    content: `Sample pull request #42 — authored by Samir Khan (SK), reviewed by Aisha Mehta (AM), and recorded as merged on November 9. FastAPI issues a short-lived JWT access token; the browser keeps the access token in memory and receives a rotating refresh token through an HttpOnly, Secure cookie. The server stores a refresh-token digest and revokes the session on logout. Cookie-backed refresh requests check the allowed origin and CSRF token.

Completed: This sample pull request includes tests for expired access tokens, refresh-token reuse, logout revocation, and rejection of refresh requests without valid CSRF protection. Review comments were addressed before the recorded merge. These are fictional review records, not test results run against this workspace.

Dependency: Production rollout still requires secure cookie settings, signing-key provisioning and rotation, and an application security review. The accepted JWT design does not imply that a production security audit has been completed. No usable keys or token values are present in this sample.`,
  },
  {
    id: 'ss-checkout-tasks',
    projectId: 'shopsphere',
    name: 'Checkout pilot — delivery board snapshot',
    type: 'Task record',
    date: '2026-11-11T09:20:00.000Z',
    status: 'Demo indexed',
    size: '3.9 KB',
    summary:
      'Sample task snapshot separates completed sandbox checkout from blocked retry validation and pending reconciliation work.',
    content: `Sample delivery board — November 11, maintained by Jordan Lee (JL). This is a limited task snapshot rather than a complete backlog; it cannot establish total or unassigned-task counts. Statuses below describe only the explicitly listed fictional tasks.
Completed: SS-118, assigned to SK, records the sandbox checkout session and order-confirmation screen as done. SS-121, assigned to AM, records duplicate webhook-event handling as done with sample review evidence.

Incomplete: SS-126, assigned to SK, is blocked on replaying delayed and duplicate provider events before automatic retries can be re-enabled. SS-129, assigned to AM, is in progress for reconciliation recovery steps and the retry release gate. Neither item is recorded as released.
Current state: Checkout recovery is still in validation; successful sandbox checkout does not mean automatic payment retries are enabled.

Risk: Closing SS-126 on the basis of the meeting approval alone would conceal the temporary retry hold documented in the Slack export.
Next action: Attach replay results to SS-126, reconcile the flag status with the meeting record, and finish SS-129 before seeking release approval.`,
  },
  {
    id: 'cb-referral-requirements',
    projectId: 'carebridge',
    name: 'CareBridge — referral workflow requirements.pdf',
    type: 'PDF',
    date: '2026-11-08T10:00:00.000Z',
    status: 'Demo indexed',
    size: '216 KB',
    summary:
      'Sample healthcare requirements propose 30-day referral audit retention, pending privacy review; all patients are synthetic.',
    content: `Sample healthcare requirements — prepared by Nisha Patel (NP) for a fictional referral-coordination pilot. CareBridge helps clinic coordinators review incoming referrals, find appointment slots, and record consent acknowledgements. The prototype uses synthetic patients only; this document is not a clinical recommendation, compliance assessment, or authorization to handle real patient data.

Proposal: Revision 0.2 proposes retaining referral audit events for 30 days after referral closure, followed by deletion through a scheduled job. The period is a draft product assumption and has not been approved by a privacy or records-management owner. Access to the referral queue is intended to be role-scoped and audited.

Risk: Implementing the draft retention period without policy review could conflict with the clinic's recordkeeping obligations.
Question: Which event categories require retention, and which authorized owner can approve their retention and deletion rules?`,
  },
  {
    id: 'cb-privacy-meeting',
    projectId: 'carebridge',
    name: 'CareBridge — privacy and pilot readiness review',
    type: 'Meeting notes',
    date: '2026-11-10T11:30:00.000Z',
    status: 'Demo indexed',
    size: '4.5 KB',
    summary:
      'Sample review raises a competing 90-day audit-retention proposal and keeps deletion automation on hold.',
    content: `Sample review notes — November 10, attended by Nisha Patel (NP), Evan Chen (EC), and Aisha Mehta (AM). EC requested a 90-day referral audit window to support pilot troubleshooting, while the requirements draft still specifies 30 days. Neither duration was accepted as policy. The group agreed to retain the disagreement for an authorized privacy and records-management review.

Current state: The CareBridge pilot remains restricted to synthetic data, and audit deletion automation is on hold. The 90-day suggestion is a proposal, not a superseding approval of the 30-day draft.
Dependency: Real-data onboarding depends on an approved retention policy, consent wording, and a role-access review; this sample provides no compliance certification.

Question: Should referral audit events and appointment-history records have different retention schedules?
Next action: NP should obtain a documented policy decision, reconcile the 30-day and 90-day proposals, and update requirements before EC implements deletion automation.`,
  },
  {
    id: 'cb-pilot-tasks',
    projectId: 'carebridge',
    name: 'CareBridge — synthetic pilot task record',
    type: 'Task record',
    date: '2026-11-11T09:15:00.000Z',
    status: 'Demo indexed',
    size: '3.2 KB',
    summary:
      'Sample task record marks referral queue and slot browsing complete; privacy-dependent work remains blocked.',
    content: `Sample task record — November 11. CareBridge's pilot board covers a narrow synthetic-data prototype, not a complete implementation inventory. Owners are listed only where the source records them; no unassigned-work total is inferred.
Completed: CB-31, owned by EC, records the synthetic referral queue and appointment-slot browsing as done. CB-34, owned by NP, records a consent-copy walkthrough with sample coordinator personas as done; that walkthrough is not legal approval.

Incomplete: CB-38, owned by EC, is blocked on the approved audit-retention policy before a deletion job can be implemented. CB-41, owned by AM, is in progress for a role-access review. Real-patient-data onboarding is not marked complete.

Risk: The open retention disagreement blocks deletion acceptance criteria and real-data readiness.
Next action: Keep prototype demonstrations on synthetic records, finish the role-access review, and attach the authorized retention decision to CB-38 before unblocking it.`,
  },
  {
    id: 'df-flow-meeting',
    projectId: 'devflow',
    name: 'DevFlow — pilot workflow review',
    type: 'Meeting notes',
    date: '2026-11-10T16:00:00.000Z',
    status: 'Demo indexed',
    size: '4.1 KB',
    summary:
      'Sample pilot review calls for advisory work-in-progress warnings, not hard blocks on opening pull requests.',
    content: `Sample workflow review — November 10, attended by Jordan Lee (JL), Riley Das (RD), and Samir Khan (SK). DevFlow groups review queues and highlights overloaded work streams for a fictional engineering team. The pilot uses fixture pull requests; no GitHub installation, organization permissions, or live repository sync is active.

Current state: The review notes specify advisory work-in-progress warnings for the pilot, with no automatic block on opening a pull request. The team wants feedback on warning quality before considering enforcement.
Completed: RD's fixture-backed review-queue prototype and empty-state walkthrough are recorded as complete in this sample.

Risk: Onboarding copy that promises enforced limits would misrepresent the advisory pilot behavior.
Next action: JL and RD should align onboarding copy and acceptance criteria with the advisory approach, then record the reconciled policy before inviting pilot users.`,
  },
  {
    id: 'df-onboarding-txt',
    projectId: 'devflow',
    name: 'DevFlow — onboarding draft.txt',
    type: 'TXT',
    date: '2026-11-11T08:30:00.000Z',
    status: 'Local only',
    size: '2.7 KB',
    summary:
      'Sample unreconciled onboarding draft claims hard work-in-progress limits, contradicting the advisory pilot review.',
    content: `Sample onboarding copy — a local draft edited by Riley Das (RD) on November 11. The draft currently tells developers, “When your work-in-progress limit is reached, DevFlow blocks new pull requests until an existing item closes.” This statement has not been validated against the pilot review and is preserved here as conflicting evidence, not confirmed product behavior.

Incomplete: Onboarding acceptance criteria and warning copy remain in draft. The November 10 meeting describes advisory warnings instead of hard enforcement, so this newer text must not be treated as a policy change merely because it has a later timestamp.

Question: Should the pilot communicate an advisory warning only, and who signs off the corrected onboarding copy?
Next action: RD should replace or explicitly approve the hard-block wording after checking the meeting record with JL. Live integration permission design remains outside this fixture-backed preview.`,
  },
]

export const initialDecisions: Decision[] = [
  {
    id: 'ss-search-postgresql',
    projectId: 'shopsphere',
    title: 'Replace Elasticsearch with PostgreSQL full-text search',
    description:
      'Sample accepted decision: use PostgreSQL full-text search for the pilot catalog; defer a separate search cluster.',
    date: '2026-11-10T15:00:00.000Z',
    people: ['AM', 'SK', 'JL'],
    status: 'Accepted',
    sourceIds: ['ss-search-spike-txt', 'ss-checkpoint-meeting', 'ss-github-snapshot'],
    rationale:
      'The synthetic catalog spike covers pilot search needs while keeping one datastore. Production load and relevance checks remain open; acceptance is not a performance guarantee.',
    history: [
      { date: '2026-11-09T16:20:00.000Z', text: 'Proposed after the sample catalog search spike.' },
      {
        date: '2026-11-10T15:00:00.000Z',
        text: 'Accepted at the checkpoint; supersedes the Elasticsearch pilot plan.',
      },
      {
        date: '2026-11-11T07:45:00.000Z',
        text: 'Sample repository snapshot records the integration as merged; performance sign-off remains pending.',
      },
    ],
  },
  {
    id: 'ss-stripe-payments',
    projectId: 'shopsphere',
    title: 'Use Stripe for payment processing',
    description:
      'Sample selected provider: Stripe. The bounded automatic-retry rollout is under review because staging retries are temporarily disabled.',
    date: '2026-11-11T09:05:00.000Z',
    people: ['AM', 'SK'],
    status: 'Under Review',
    sourceIds: ['ss-checkpoint-meeting', 'ss-payment-slack-json', 'ss-checkout-tasks'],
    rationale:
      'Hosted checkout limits custom payment handling, while idempotent event processing addresses repeat webhook delivery. Provider selection remains intact; the retry release gate requires reconciliation evidence.',
    history: [
      {
        date: '2026-11-06T14:00:00.000Z',
        text: 'Stripe named as the preferred sandbox payment provider in the sample brief.',
      },
      {
        date: '2026-11-10T15:00:00.000Z',
        text: 'Meeting approved bounded retries, conditional on successful replay and reconciliation checks.',
      },
      {
        date: '2026-11-11T08:40:00.000Z',
        text: 'Slack records retries temporarily disabled; rollout moved under review without reversing provider selection.',
      },
    ],
  },
  {
    id: 'ss-jwt-auth',
    projectId: 'shopsphere',
    title: 'Use JWT-based authentication',
    description:
      'Sample accepted authentication design: memory-held access tokens, protected refresh cookies, and server-side session revocation.',
    date: '2026-11-10T15:00:00.000Z',
    people: ['AM', 'SK'],
    status: 'Accepted',
    sourceIds: ['ss-auth-pr', 'ss-checkpoint-meeting'],
    rationale:
      'Short access-token lifetimes limit exposure, and rotating refresh sessions allow logout and reuse detection. CSRF protection applies to cookie-backed refresh requests; production security review is still required.',
    history: [
      {
        date: '2026-11-06T14:00:00.000Z',
        text: 'The architecture brief proposed short-lived tokens and revocable refresh sessions.',
      },
      {
        date: '2026-11-09T13:10:00.000Z',
        text: 'Sample PR #42 recorded as merged with expiration, revocation, reuse, and CSRF tests.',
      },
      {
        date: '2026-11-10T15:00:00.000Z',
        text: 'Checkpoint accepted the session design; production security readiness was not certified.',
      },
    ],
  },
  {
    id: 'ss-search-elasticsearch',
    projectId: 'shopsphere',
    title: 'Operate a dedicated Elasticsearch catalog index',
    description:
      'Sample historical plan: maintain a separate search index and asynchronous catalog worker. Superseded by PostgreSQL search for the pilot.',
    date: '2026-11-10T15:00:00.000Z',
    people: ['AM', 'SK'],
    status: 'Superseded',
    sourceIds: ['ss-architecture-pdf', 'ss-search-spike-txt', 'ss-checkpoint-meeting'],
    rationale:
      'The early plan prioritized advanced relevance features. The pilot did not justify the additional indexing and operational work; retain this record to explain why older documents mention Elasticsearch.',
    history: [
      {
        date: '2026-11-06T14:00:00.000Z',
        text: 'Provisional Elasticsearch plan documented in architecture revision 0.3.',
      },
      {
        date: '2026-11-09T16:20:00.000Z',
        text: 'Search spike recommended consolidating the pilot on PostgreSQL.',
      },
      {
        date: '2026-11-10T15:00:00.000Z',
        text: 'Superseded by the accepted PostgreSQL full-text search decision.',
      },
    ],
  },
  {
    id: 'cb-audit-retention',
    projectId: 'carebridge',
    title: 'Define a referral audit-retention policy before deletion automation',
    description:
      'Sample proposal: approve event-specific retention rules before implementing deletion; competing 30-day and 90-day durations remain unapproved.',
    date: '2026-11-10T11:30:00.000Z',
    people: ['NP', 'EC', 'AM'],
    status: 'Proposed',
    sourceIds: ['cb-referral-requirements', 'cb-privacy-meeting', 'cb-pilot-tasks'],
    rationale:
      'Product assumptions and troubleshooting preferences are not authorized retention policy. An accountable privacy and records-management owner must approve the rules before real-data onboarding.',
    history: [
      {
        date: '2026-11-08T10:00:00.000Z',
        text: 'Requirements draft proposed a 30-day audit-event retention period.',
      },
      {
        date: '2026-11-10T11:30:00.000Z',
        text: 'Privacy review raised a competing 90-day proposal; no duration accepted.',
      },
      {
        date: '2026-11-11T09:15:00.000Z',
        text: 'Task record keeps deletion automation blocked pending authorized policy review.',
      },
    ],
  },
]

export const initialConflicts: Conflict[] = [
  {
    id: 'ss-payment-retry-conflict',
    projectId: 'shopsphere',
    title: 'Payment Retry Implementation',
    description:
      'Meeting approval and a later operational update describe different states. Confirm whether payment retries are ready to be re-enabled, and record the release gate.',
    date: '2026-11-11T09:05:00.000Z',
    status: 'Unresolved',
    evidence: [
      {
        sourceId: 'ss-checkpoint-meeting',
        claim:
          'Bounded automatic payment retries were approved, with rollout conditional on replay and reconciliation checks.',
        date: '2026-11-10T15:00:00.000Z',
        author: 'Aisha Mehta (AM), meeting chair',
      },
      {
        sourceId: 'ss-payment-slack-json',
        claim:
          'Automatic payment retries are temporarily disabled; PAYMENT_RETRIES_ENABLED is false while the reconciliation gap is investigated.',
        date: '2026-11-11T08:40:00.000Z',
        author: 'Samir Khan (SK)',
      },
    ],
  },
  {
    id: 'cb-retention-conflict',
    projectId: 'carebridge',
    title: 'Referral audit retention: 30 days or 90 days?',
    description:
      'Sample competing proposals: the requirements draft specifies 30 days, while the privacy review requests 90 days. Neither is approved policy; deletion automation remains on hold.',
    date: '2026-11-10T11:30:00.000Z',
    status: 'Under Review',
    evidence: [
      {
        sourceId: 'cb-referral-requirements',
        claim:
          'Draft revision 0.2 proposes deletion of referral audit events 30 days after referral closure.',
        date: '2026-11-08T10:00:00.000Z',
        author: 'Nisha Patel (NP)',
      },
      {
        sourceId: 'cb-privacy-meeting',
        claim:
          'A 90-day referral audit window was requested for troubleshooting; the review accepted neither proposed duration.',
        date: '2026-11-10T11:30:00.000Z',
        author: 'Evan Chen (EC)',
      },
    ],
  },
  {
    id: 'df-wip-policy-conflict',
    projectId: 'devflow',
    title: 'Work-in-progress limits: advisory warnings or hard blocks?',
    description:
      'Sample onboarding mismatch: pilot meeting notes call for advisory warnings, but a newer local draft promises to block new pull requests. Recency alone does not resolve the policy.',
    date: '2026-11-11T08:30:00.000Z',
    status: 'Under Review',
    evidence: [
      {
        sourceId: 'df-flow-meeting',
        claim:
          'The pilot should show advisory work-in-progress warnings without automatically blocking new pull requests.',
        date: '2026-11-10T16:00:00.000Z',
        author: 'Jordan Lee (JL), meeting facilitator',
      },
      {
        sourceId: 'df-onboarding-txt',
        claim:
          'The unvalidated onboarding draft says reaching the work-in-progress limit blocks new pull requests.',
        date: '2026-11-11T08:30:00.000Z',
        author: 'Riley Das (RD)',
      },
    ],
  },
]

export const initialActivity: Activity[] = [
  {
    id: 'activity-ss-meeting',
    type: 'source',
    title: 'New meeting notes added',
    detail: 'Architecture & checkout checkpoint',
    time: '2 hours ago',
    projectId: 'shopsphere',
  },
  {
    id: 'activity-ss-decision',
    type: 'decision',
    title: 'Technical decision identified',
    detail: 'PostgreSQL full-text search',
    time: '3 hours ago',
    projectId: 'shopsphere',
  },
  {
    id: 'activity-ss-conflict',
    type: 'conflict',
    title: 'Conflict detected in project records',
    detail: 'Payment retry implementation',
    time: '4 hours ago',
    projectId: 'shopsphere',
  },
  {
    id: 'activity-ss-handover',
    type: 'report',
    title: 'Handover report updated',
    detail: 'Pilot handover · sample preview',
    time: 'Yesterday',
    projectId: 'shopsphere',
  },
]

// Local formatting only: read explicit labels, never infer task state from arbitrary prose.
// JSON fixtures use Slack-style message text. Invalid/unrecognized JSON supplies no labeled facts.
function sourceText(source: Source): string {
  if (source.type !== 'JSON') return source.content
  try {
    const data: unknown = JSON.parse(source.content)
    if (typeof data !== 'object' || data === null || !('messages' in data)) return ''
    if (!Array.isArray(data.messages)) return ''
    return data.messages
      .map((message: unknown) => {
        if (typeof message !== 'object' || message === null || !('text' in message)) return ''
        return typeof message.text === 'string' ? message.text : ''
      })
      .filter(Boolean)
      .join('\n\n')
  } catch {
    return ''
  }
}

function labeledNotes(sources: Source[], labels: string[]): string[] {
  return sources.flatMap((source) =>
    sourceText(source)
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => labels.some((label) => line.startsWith(`${label}:`)))
      .map((line) => `${line} [${source.id}; ${source.date}]`),
  )
}

function listOrFallback(items: string[], fallback: string): string {
  return items.length ? items.map((item) => `- ${item}`).join('\n\n') : fallback
}

function assembleSampleReport(
  project: Project,
  sources: Source[],
  decisions: Decision[],
  conflicts: Conflict[],
  timestamp: string,
  id: string,
): Report {
  // Callers may provide the whole workspace. Never leak another project's records into a report.
  const projectSources = sources.filter((source) => source.projectId === project.id)
  const projectDecisions = decisions.filter((decision) => decision.projectId === project.id)
  const projectConflicts = conflicts.filter((conflict) => conflict.projectId === project.id)
  const sourceIds = [...new Set(projectSources.map((source) => source.id))]
  const availableIds = new Set(sourceIds)
  const openConflicts = projectConflicts.filter((conflict) => conflict.status !== 'Resolved')
  const pendingDecisions = projectDecisions.filter(
    (decision) => decision.status === 'Proposed' || decision.status === 'Under Review',
  )
  const empty = !projectSources.length && !projectDecisions.length && !projectConflicts.length
  const reference = (sourceId: string) =>
    availableIds.has(sourceId)
      ? `[${sourceId}]`
      : `[Supporting source unavailable in this preview: ${sourceId}]`
  const decisionReferences = (decision: Decision) =>
    decision.sourceIds.length
      ? decision.sourceIds.map(reference).join(', ')
      : 'No supporting sources linked.'
  const conflictEvidence = (conflict: Conflict) =>
    conflict.evidence.length
      ? conflict.evidence
          .map((item) => `${item.claim} — ${item.author}, ${item.date} ${reference(item.sourceId)}`)
          .join('\n')
      : 'No evidence linked; review the conflict record before relying on it.'
  const unavailableReferences = [
    ...new Set([
      ...projectDecisions.flatMap((decision) => decision.sourceIds),
      ...projectConflicts.flatMap((conflict) => conflict.evidence.map((item) => item.sourceId)),
    ]),
  ].filter((sourceId) => !availableIds.has(sourceId))
  const currentNotes = labeledNotes(projectSources, ['Current state'])
  const currentState = empty
    ? 'No sources, decisions, or conflicts have been supplied for this project. Implementation, delivery progress, and readiness are unknown; no project history or tasks have been invented.'
    : `Available local records: ${projectSources.length} sources, ${projectDecisions.length} decisions, and ${openConflicts.length} unresolved or under-review conflicts. These are record counts, not task totals.\n\n${listOrFallback(currentNotes, 'No explicitly labeled current-state notes were found. Review the source summaries and records before establishing delivery status.')}\n\nSource summaries (dated descriptions, not independently verified current state):\n${listOrFallback(
        projectSources.map(
          (source) => `${source.name} — ${source.summary} ${reference(source.id)} (${source.date})`,
        ),
        'No source content is available to verify the supplied decision or conflict records.',
      )}`
  const risks = [
    ...labeledNotes(projectSources, ['Risk', 'Dependency']),
    ...openConflicts.map(
      (conflict) =>
        `${conflict.title} (${conflict.status}). ${conflict.description}\nEvidence: ${conflictEvidence(conflict)}`,
    ),
    ...pendingDecisions.map(
      (decision) =>
        `Pending decision: ${decision.title} (${decision.status}). ${decision.description} ${decisionReferences(decision)}`,
    ),
    ...unavailableReferences.map(
      (sourceId) =>
        `Evidence gap: supporting source ${sourceId} is not in the supplied project sources.`,
    ),
  ]
  const questions = [
    ...labeledNotes(projectSources, ['Question']),
    ...openConflicts.map(
      (conflict) =>
        `What evidence and owner approval will reconcile “${conflict.title}”? Current status: ${conflict.status}. ${conflict.evidence.map((item) => reference(item.sourceId)).join(', ')}`,
    ),
    ...pendingDecisions.map(
      (decision) =>
        `What review is needed to settle “${decision.title}” (${decision.status})? ${decisionReferences(decision)}`,
    ),
  ]
  const actions = [
    ...labeledNotes(projectSources, ['Next action']),
    ...openConflicts.map(
      (conflict) =>
        `Review both sides of “${conflict.title}”, record the accountable owner and outcome, then update its status. Do not resolve it by timestamp alone.`,
    ),
    ...pendingDecisions.map(
      (decision) =>
        `Confirm the approval criteria and reviewer for “${decision.title}”; keep its ${decision.status.toLowerCase()} status until a review is recorded.`,
    ),
    ...unavailableReferences.map(
      (sourceId) =>
        `Add or correct missing evidence ${sourceId} before relying on the linked record.`,
    ),
  ]
  if (!projectSources.length)
    actions.unshift(
      'Add project sources or meeting notes before assessing implementation, completed work, or release readiness.',
    )
  if (!projectDecisions.length)
    actions.push(
      'Record technical decisions with their status, rationale, and supporting sources when known; do not invent decisions to fill this preview.',
    )
  actions.push(
    'Have a project member verify the dated records and explicitly review this sample preview before using it as a handover.',
  )

  return {
    id,
    title: `${project.name} — Handover`,
    projectId: project.id,
    date: timestamp,
    updatedAt: timestamp,
    status: 'Sample preview',
    sourceIds,
    sections: [
      {
        title: 'Project Overview',
        content: `Sample preview — assembled locally from supplied project records and explicitly labeled source notes. No AI analysis, backend processing, or independent verification has run. Seeded records are fictional; newly supplied content is not automatically validated.\n\n${project.name}: ${project.description.trim() || 'No description provided.'}\nDeclared stack: ${project.stack.length ? project.stack.join(', ') : 'Not specified.'}\nListed member initials: ${project.members.length ? project.members.join(', ') : 'No members listed.'}\nProject label: ${project.status}; metadata updated ${project.updatedAt}. This label is not a delivery or security assessment.`,
      },
      {
        title: 'Current Project State',
        content: `${currentState}\n\nThis preview preserves dated statements and disagreements; it does not automatically choose which source is authoritative.`,
      },
      {
        title: 'Technical Decisions',
        content: listOrFallback(
          projectDecisions.map(
            (decision) =>
              `${decision.title} — ${decision.status} (${decision.date})\n${decision.description}\nRationale: ${decision.rationale}\nPeople: ${decision.people.length ? decision.people.join(', ') : 'Not recorded.'}\nEvidence: ${decisionReferences(decision)}\nHistory: ${decision.history.length ? decision.history.map((entry) => `${entry.date}: ${entry.text}`).join(' → ') : 'No history recorded.'}`,
          ),
          'No technical decisions are recorded in the supplied project data. A declared technology stack alone does not establish a decision or its rationale.',
        ),
      },
      {
        title: 'Completed Work',
        content: `Only explicitly labeled “Completed:” source statements are reproduced below; they are not independently verified. An accepted decision or indexed source does not establish completed implementation.\n\n${listOrFallback(labeledNotes(projectSources, ['Completed']), 'No explicitly documented completed work is available in the supplied sources. This means completion is unknown, not that no work has been done.')}`,
      },
      {
        title: 'Incomplete Work',
        content: `Only explicitly labeled “Incomplete:” source statements are reproduced below. No total, remaining, or unassigned-task count is inferred from this partial evidence.\n\n${listOrFallback(labeledNotes(projectSources, ['Incomplete']), 'No explicitly documented incomplete work is available in the supplied sources. The backlog and delivery scope remain unverified; this is not a claim that all work is complete.')}`,
      },
      {
        title: 'Risks and Dependencies',
        content: listOrFallback(
          risks,
          'No explicit risks, dependencies, pending decisions, or open conflicts are recorded in the supplied data. This is an evidence gap, not confirmation that the project is risk-free.',
        ),
      },
      {
        title: 'Unresolved Questions',
        content: listOrFallback(
          questions,
          empty
            ? 'What is the intended scope, what work already exists, and which source records and owners can establish the current state? These are suggested onboarding questions, not discovered project issues.'
            : 'No explicit unresolved questions or pending reviews are recorded in the supplied data. Confirm unknowns with the project team; absence of a record is not evidence of resolution.',
        ),
      },
      {
        title: 'Recommended Next Actions',
        content: `Local checklist suggestions and labeled source actions, not assigned tasks or an AI-generated execution plan:\n\n${listOrFallback(actions, 'Add evidence and review this preview with the project team.')}`,
      },
      {
        title: 'Evidence and References',
        content: `${listOrFallback(
          projectSources.map(
            (source) =>
              `${reference(source.id)} ${source.name} — ${source.type}; ${source.date}; ${source.status}.`,
          ),
          'No project sources are available. No external references or supporting evidence have been fabricated.',
        )}\n\n${unavailableReferences.length ? `Missing linked evidence: ${unavailableReferences.join(', ')}. These IDs are not included in the report source list.\n\n` : ''}${listOrFallback(
          projectConflicts
            .filter((conflict) => conflict.status === 'Resolved')
            .map(
              (conflict) =>
                `Resolved record: ${conflict.title}. Recorded resolution: ${conflict.resolution || 'No resolution explanation provided.'}\nEvidence: ${conflictEvidence(conflict)}`,
            ),
          'No resolved-conflict records are included.',
        )}\n\nReferences identify only the supplied local records. “Demo indexed” is a sample UI label, not proof of backend ingestion or source authenticity.`,
      },
    ],
  }
}

let generatedReportSequence = 0

export function makeSampleReport(
  project: Project,
  sources: Source[],
  decisions: Decision[],
  conflicts: Conflict[],
): Report {
  const timestamp = new Date().toISOString()
  generatedReportSequence += 1
  return assembleSampleReport(
    project,
    sources,
    decisions,
    conflicts,
    timestamp,
    `report-${project.id}-${timestamp}-${generatedReportSequence}`,
  )
}

// Fixed timestamps keep the two seeded previews stable. User-created previews use the current ISO time.
export const initialReports: Report[] = initialProjects
  .filter((project) => project.id === 'shopsphere' || project.id === 'carebridge')
  .map((project) =>
    assembleSampleReport(
      project,
      initialSources,
      initialDecisions,
      initialConflicts,
      project.id === 'shopsphere' ? '2026-11-11T10:30:00.000Z' : '2026-11-11T09:45:00.000Z',
      `report-${project.id}-sample`,
    ),
  )
