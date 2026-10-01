import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import CandidateList from '../components/CandidateList'
import { getCandidates } from '../services/candidateService'
import type {
  CandidateSummary,
  MessageState,
} from '../types/candidate'

function CandidatesPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const [candidates, setCandidates] = useState<CandidateSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const navigationState = location.state as
    | { message?: MessageState }
    | null

  useEffect(() => {
    async function loadCandidates() {
      setIsLoading(true)
      setErrorMessage(null)

      try {
        const data = await getCandidates()
        setCandidates(data)
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Não foi possível carregar os candidatos.',
        )
      } finally {
        setIsLoading(false)
      }
    }

    void loadCandidates()
  }, [])

  return (
    <main className="app-container">
      <section className="candidate-card">
        <header className="page-header">
          <p className="eyebrow">Curriculum Registration</p>

          <h1>Candidatos cadastrados</h1>

          <p className="page-description">
            Consulte os candidatos cadastrados e acesse seus detalhes.
          </p>

          <div className="form-actions">
            <Link to="/cadastro" className="primary-button">
              Cadastrar novo candidato
            </Link>
          </div>
        </header>

        {navigationState?.message && (
          <p
            className={`feedback-message ${navigationState.message.type}`}
            role="status"
          >
            {navigationState.message.text}
          </p>
        )}

        {errorMessage && (
          <p className="feedback-message error" role="alert">
            {errorMessage}
          </p>
        )}

        <section className="candidate-list-section">
          <CandidateList
            candidates={candidates}
            isLoading={isLoading}
            onSelect={(candidateId) =>
              navigate(`/candidatos/${candidateId}`)
            }
          />
        </section>
      </section>
    </main>
  )
}

export default CandidatesPage