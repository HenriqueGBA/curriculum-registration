import {
  useCallback,
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react'
import './App.css'

type CandidateForm = {
  fullName: string
  email: string
  phone: string
  interestedArea: string
  professionalSummary: string
}

type FormErrors = Partial<Record<keyof CandidateForm, string>>

type CandidateSummary = {
  id: string
  fullName: string
  email: string
  phone?: string
  interestedArea?: string
  professionalSummary?: string
  createdAt: string
}

type CandidateDetails = CandidateSummary

type PdfImportResponse = {
  fullName?: string
  email?: string
  phone?: string
  interestedArea?: string
  professionalSummary?: string
  warnings: string[]
}

type MessageState = {
  type: 'success' | 'error' | 'warning'
  text: string
}

const initialForm: CandidateForm = {
  fullName: '',
  email: '',
  phone: '',
  interestedArea: '',
  professionalSummary: '',
}

const apiBaseUrl = (
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000'
).replace(/\/$/, '')

function getApiUrl(path: string): string {
  return `${apiBaseUrl}${path}`
}

async function readApiErrorMessage(response: Response): Promise<string> {
  const fallbackMessage = 'Ocorreu um erro ao processar a solicitação.'

  try {
    const body = (await response.json()) as { message?: string }

    if (typeof body?.message === 'string' && body.message.trim().length > 0) {
      return body.message
    }
  } catch {
    // Intencionalmente ignorado para retorno da mensagem padrão.
  }

  return fallbackMessage
}

function App() {
  const [form, setForm] = useState<CandidateForm>(initialForm)
  const [errors, setErrors] = useState<FormErrors>({})
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isImportingPdf, setIsImportingPdf] = useState(false)
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(false)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [formMessage, setFormMessage] = useState<MessageState | null>(null)
  const [pdfMessage, setPdfMessage] = useState<MessageState | null>(null)
  const [pdfWarnings, setPdfWarnings] = useState<string[]>([])
  const [candidates, setCandidates] = useState<CandidateSummary[]>([])
  const [selectedCandidate, setSelectedCandidate] =
    useState<CandidateDetails | null>(null)

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = event.target

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))

    if (name in errors) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        [name]: undefined,
      }))
    }
  }

  function validateForm(): FormErrors {
    const validationErrors: FormErrors = {}

    if (!form.fullName.trim()) {
      validationErrors.fullName = 'O nome completo é obrigatório.'
    }

    if (!form.email.trim()) {
      validationErrors.email = 'O e-mail é obrigatório.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      validationErrors.email = 'Informe um e-mail válido.'
    }

    return validationErrors
  }

  const loadCandidates = useCallback(async () => {
    setIsLoadingCandidates(true)

    try {
      const response = await fetch(getApiUrl('/api/candidates'))

      if (!response.ok) {
        throw new Error()
      }

      const items = (await response.json()) as CandidateSummary[]
      setCandidates(items)
    } catch {
      setFormMessage({
        type: 'error',
        text: 'Não foi possível carregar a listagem de candidatos.',
      })
    } finally {
      setIsLoadingCandidates(false)
    }
  }, [])

  const loadCandidateDetails = useCallback(async (candidateId: string) => {
    setIsLoadingDetails(true)

    try {
      const response = await fetch(getApiUrl(`/api/candidates/${candidateId}`))

      if (!response.ok) {
        const message = await readApiErrorMessage(response)
        throw new Error(message)
      }

      const candidate = (await response.json()) as CandidateDetails
      setSelectedCandidate(candidate)
    } catch (error) {
      setFormMessage({
        type: 'error',
        text:
          error instanceof Error
            ? error.message
            : 'Não foi possível carregar os detalhes do candidato.',
      })
    } finally {
      setIsLoadingDetails(false)
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadCandidates()
    }, 0)

    return () => {
      window.clearTimeout(timer)
    }
  }, [loadCandidates])

  async function handleImportPdf() {
    if (!selectedFile) {
      setPdfMessage({
        type: 'error',
        text: 'Selecione um arquivo PDF para importar.',
      })

      return
    }

    setIsImportingPdf(true)
    setPdfWarnings([])
    setPdfMessage(null)

    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      const response = await fetch(getApiUrl('/api/candidates/import-pdf'), {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const message = await readApiErrorMessage(response)
        throw new Error(message)
      }

      const data = (await response.json()) as PdfImportResponse

      setForm((currentForm) => ({
        ...currentForm,
        fullName: data.fullName || currentForm.fullName,
        email: data.email || currentForm.email,
        phone: data.phone || currentForm.phone,
        interestedArea: data.interestedArea || currentForm.interestedArea,
        professionalSummary:
          data.professionalSummary || currentForm.professionalSummary,
      }))

      setPdfWarnings(data.warnings ?? [])
      setPdfMessage({
        type: 'success',
        text: 'Leitura do PDF concluída. Revise os dados antes de salvar.',
      })
    } catch (error) {
      setPdfMessage({
        type: 'warning',
        text:
          error instanceof Error
            ? error.message
            : 'Não foi possível ler o conteúdo do arquivo PDF.',
      })
    } finally {
      setIsImportingPdf(false)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const validationErrors = validateForm()
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    setIsSaving(true)
    setFormMessage(null)

    try {
      const response = await fetch(getApiUrl('/api/candidates'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })

      if (!response.ok) {
        const message = await readApiErrorMessage(response)
        throw new Error(message)
      }

      const candidate = (await response.json()) as CandidateDetails

      setForm(initialForm)
      setSelectedFile(null)
      setErrors({})
      setSelectedCandidate(candidate)
      setPdfWarnings([])

      setFormMessage({
        type: 'success',
        text: 'Candidato cadastrado com sucesso.',
      })

      await loadCandidates()
    } catch (error) {
      setFormMessage({
        type: 'error',
        text:
          error instanceof Error
            ? error.message
            : 'Não foi possível salvar o candidato.',
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="app-container">
      <section className="candidate-card">
        <header className="page-header">
          <p className="eyebrow">Curriculum Registration</p>
          <h1>Cadastro de candidato</h1>
          <p className="page-description">
            Cadastre um candidato manualmente ou importe os dados a partir de
            um currículo em PDF.
          </p>
        </header>

        <form
          className="candidate-form"
          aria-label="Formulário de cadastro de candidato"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="form-grid">
            <label>
              Nome completo
              <input
                name="fullName"
                type="text"
                value={form.fullName}
                onChange={handleChange}
                aria-invalid={Boolean(errors.fullName)}
                aria-describedby={errors.fullName ? 'fullName-error' : undefined}
                placeholder="Digite o nome completo"
              />
              {errors.fullName && (
                <span id="fullName-error" className="error-message">
                  {errors.fullName}
                </span>
              )}
            </label>

            <label>
              E-mail
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'email-error' : undefined}
                placeholder="Digite o e-mail"
              />
              {errors.email && (
                <span id="email-error" className="error-message">
                  {errors.email}
                </span>
              )}
            </label>

            <label>
              Telefone
              <input
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="Digite o telefone"
              />
            </label>

            <label>
              Área de interesse
              <input
                name="interestedArea"
                type="text"
                value={form.interestedArea}
                onChange={handleChange}
                placeholder="Ex.: Desenvolvimento Backend"
              />
            </label>

            <label className="full-width">
              Resumo profissional
              <textarea
                name="professionalSummary"
                rows={5}
                value={form.professionalSummary}
                onChange={handleChange}
                placeholder="Descreva brevemente a experiência profissional"
              />
            </label>
          </div>

          <div className="pdf-upload">
            <label htmlFor="pdf-file">Currículo em PDF</label>
            <input
              id="pdf-file"
              name="file"
              type="file"
              accept=".pdf,application/pdf"
              onChange={(event) =>
                setSelectedFile(event.target.files?.[0] ?? null)
              }
            />

            <button type="button" onClick={handleImportPdf} disabled={isImportingPdf}>
              {isImportingPdf ? 'Importando PDF...' : 'Importar currículo em PDF'}
            </button>

            {pdfMessage && (
              <p className={`feedback-message ${pdfMessage.type}`} role="status">
                {pdfMessage.text}
              </p>
            )}

            {pdfWarnings.length > 0 && (
              <ul className="warning-list">
                {pdfWarnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" disabled={isSaving}>
              {isSaving ? 'Salvando...' : 'Salvar candidato'}
            </button>
          </div>

          {formMessage && (
            <p className={`feedback-message ${formMessage.type}`} role="alert">
              {formMessage.text}
            </p>
          )}
        </form>

        <section className="candidate-list-section">
          <h2>Candidatos cadastrados</h2>

          {isLoadingCandidates ? (
            <p>Carregando candidatos...</p>
          ) : candidates.length === 0 ? (
            <p>Nenhum candidato cadastrado até o momento.</p>
          ) : (
            <ul className="candidate-list">
              {candidates.map((candidate) => (
                <li key={candidate.id}>
                  <button
                    type="button"
                    className="list-item-button"
                    onClick={() => {
                      void loadCandidateDetails(candidate.id)
                    }}
                  >
                    <strong>{candidate.fullName}</strong>
                    <span>{candidate.email}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="candidate-details-section">
          <h2>Detalhes do candidato</h2>

          {isLoadingDetails ? (
            <p>Carregando detalhes...</p>
          ) : selectedCandidate ? (
            <dl>
              <div>
                <dt>Nome completo</dt>
                <dd>{selectedCandidate.fullName}</dd>
              </div>
              <div>
                <dt>E-mail</dt>
                <dd>{selectedCandidate.email}</dd>
              </div>
              <div>
                <dt>Telefone</dt>
                <dd>{selectedCandidate.phone || 'Não informado'}</dd>
              </div>
              <div>
                <dt>Área de interesse</dt>
                <dd>{selectedCandidate.interestedArea || 'Não informada'}</dd>
              </div>
              <div>
                <dt>Resumo profissional</dt>
                <dd>{selectedCandidate.professionalSummary || 'Não informado'}</dd>
              </div>
            </dl>
          ) : (
            <p>Selecione um candidato na lista para visualizar os detalhes.</p>
          )}
        </section>
      </section>
    </main>
  )
}

export default App