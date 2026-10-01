import type { CandidateSummary } from '../types/candidate'

type CandidateListProps = {
  candidates: CandidateSummary[]
  isLoading: boolean
  onSelect: (candidateId: string) => void
}

function CandidateList({
  candidates,
  isLoading,
  onSelect,
}: CandidateListProps) {
  if (isLoading) {
    return <p>Carregando candidatos...</p>
  }

  if (candidates.length === 0) {
    return <p>Nenhum candidato cadastrado até o momento.</p>
  }

  return (
    <ul className="candidate-list">
      {candidates.map((candidate) => (
        <li key={candidate.id}>
          <button
            type="button"
            className="list-item-button"
            onClick={() => onSelect(candidate.id)}
          >
            <strong>{candidate.fullName}</strong>
            <span>{candidate.email}</span>
          </button>
        </li>
      ))}
    </ul>
  )
}

export default CandidateList