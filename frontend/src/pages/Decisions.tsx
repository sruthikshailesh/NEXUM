import { GitBranch, History, Lightbulb, Users } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import DecisionCard from '../components/DecisionCard'
import {
  Badge,
  DemoNote,
  EmptyState,
  FilterTabs,
  formatDate,
  Modal,
  PageHeader,
  SearchInput,
  Select,
  SourceLink,
  statusTone,
} from '../components/UI'
export default function Decisions({
  projectId,
  embedded = false,
}: {
  projectId?: string
  embedded?: boolean
}) {
  const { decisions, projects, sources, selectedSource, setSelectedSource } = useApp()
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [project, setProject] = useState(projectId || 'all')
  const status = params.get('status') || 'All decisions'
  const selected = decisions.find((decision) => decision.id === params.get('decision'))
  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }
  const filtered = decisions.filter(
    (decision) =>
      (project === 'all' || decision.projectId === project) &&
      (status === 'All decisions' || decision.status === status) &&
      `${decision.title} ${decision.description}`.toLowerCase().includes(query.toLowerCase()),
  )
  return (
    <>
      {!embedded && (
        <PageHeader
          eyebrow="THE WHY BEHIND THE WHAT"
          title="Decisions"
          description="Track the choices that shaped your project—and the evidence behind them."
          actions={
            <Badge tone="violet">
              <GitBranch size={13} />
              {decisions.length} recorded decisions
            </Badge>
          }
        />
      )}
      <div className="toolbar">
        <SearchInput value={query} onChange={setQuery} placeholder="Search decisions..." />
        {!projectId && (
          <Select label="Filter by project" value={project} onChange={setProject}>
            <option value="all">All projects</option>
            {projects.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </Select>
        )}
      </div>
      <FilterTabs
        values={['All decisions', 'Accepted', 'Proposed', 'Superseded', 'Under Review']}
        value={status}
        onChange={(value) => setParam('status', value)}
        label="Decision status"
      />
      <div className="results-label">
        {filtered.length} {filtered.length === 1 ? 'decision' : 'decisions'}
        <span>Every choice deserves context.</span>
      </div>
      {filtered.length ? (
        <div className="decisions-grid">
          {filtered.map((decision) => (
            <DecisionCard
              key={decision.id}
              decision={decision}
              onOpen={() => setParam('decision', decision.id)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={GitBranch}
          title="No decisions to show"
          description="Try another filter. New projects begin without sample decisions."
        />
      )}
      <DemoNote>
        Decisions and their supporting evidence are curated demo records, not AI-extracted insights.
      </DemoNote>
      {selected && !selectedSource && (
        <Modal
          wide
          title={selected.title}
          description={`${projects.find((project) => project.id === selected.projectId)?.name} · Decision record`}
          onClose={() => setParam('decision', null)}
        >
          <div className="detail-body">
            <div className="detail-meta">
              <Badge tone={statusTone(selected.status)} dot>
                {selected.status}
              </Badge>
              <span>{formatDate(selected.date)}</span>
            </div>
            <p className="detail-lead">{selected.description}</p>
            <section className="detail-section">
              <h3>
                <Lightbulb size={16} />
                Rationale
              </h3>
              <p>{selected.rationale}</p>
            </section>
            <section className="detail-section">
              <h3>
                <Users size={16} />
                People involved
              </h3>
              <div className="people-chips">
                {selected.people.map((person) => (
                  <span key={person}>
                    <span className="person-dot">
                      {person
                        .split(' ')
                        .map((part) => part[0])
                        .join('')
                        .slice(0, 2)}
                    </span>
                    {person}
                  </span>
                ))}
              </div>
            </section>
            <section className="detail-section">
              <h3>
                <History size={16} />
                Decision history
              </h3>
              <div className="history-timeline">
                {selected.history.map((item, index) => (
                  <div key={index}>
                    <span className="timeline-dot" />
                    <time>{formatDate(item.date)}</time>
                    <p>{item.text}</p>
                  </div>
                ))}
              </div>
            </section>
            <section className="detail-section">
              <h3>Supporting evidence</h3>
              {selected.sourceIds.map((id) => {
                const source = sources.find((item) => item.id === id)
                return (
                  source && (
                    <SourceLink
                      key={id}
                      name={source.name}
                      onClick={() => {
                        setParam('decision', null)
                        setSelectedSource(source)
                      }}
                    />
                  )
                )
              })}
            </section>
            <DemoNote>This record is sample data and has not been independently verified.</DemoNote>
          </div>
        </Modal>
      )}
    </>
  )
}
