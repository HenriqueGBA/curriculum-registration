import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getCandidateById } from '../services/candidateService'
import type { CandidateDetails } from '../types/candidate'

function CandidateDetailsPage() {
  const { id } = useParams<{ id: string }>()

  const [candidate, setCandidate] =
    useState<CandidateDetails | null>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    async function loadCandidate() {
      if (!id) {
        setErrorMessage('Candidato não informado.')
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setErrorMessage(null)

      try {
        const data = await getCandidateById(id)
        setCandidate(data)
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Não foi possível carregar os detalhes do candidato.',
        )
      } finally {
        setIsLoading(false)
      }
    }

    void loadCandidate()
  }, [id])

  return (
    <main className="app-container">
      <section className="candidate-card">
        <header className="page-header">
          <p className="eyebrow">Curriculum Registration</p>

          <h1>Detalhes do candidato</h1>

          <div className="form-actions">
            <Link to="/candidatos" className="secondary-button">
              Voltar para candidatos
            </Link>
          </div>
        </header>

        {isLoading && <p>Carregando detalhes...</p>}

        {errorMessage && (
          <p className="feedback-message error" role="alert">
            {errorMessage}
          </p>
        )}

        {candidate && (
          <section className="candidate-details-section">
            <dl>
              <div>
                <dt>Nome completo</dt>
                <dd>{candidate.fullName}</dd>
              </div>

              <div>
                <dt>E-mail</dt>
                <dd>{candidate.email}</dd>
              </div>

              <div>
                <dt>Telefone</dt>
                <dd>
                  {candidate.phone || 'Não informado'}
                </dd>
              </div>

              <div>
                <dt>Área de interesse</dt>
                <dd>
                  {candidate.interestedArea || 'Não informada'}
                </dd>
              </div>

              <div>
                <dt>Resumo profissional</dt>
                <dd>
                  {candidate.professionalSummary ||
                    'Não informado'}
                </dd>
              </div>
            </dl>
          </section>
        )}
      </section>
    </main>
  )
}

export default CandidateDetailsPage