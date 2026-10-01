import {
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react'
import { useNavigate } from 'react-router-dom'
import CandidateForm from '../components/CandidateForm'
import {
  createCandidate,
  importCandidatePdf,
} from '../services/candidateService'
import type {
  CandidateForm as CandidateFormData,
  FormErrors,
  MessageState,
} from '../types/candidate'

const initialForm: CandidateFormData = {
  fullName: '',
  email: '',
  phone: '',
  interestedArea: '',
  professionalSummary: '',
}

function CandidateRegistrationPage() {
  const navigate = useNavigate()

  const [form, setForm] = useState<CandidateFormData>(initialForm)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSaving, setIsSaving] = useState(false)
  const [isImportingPdf, setIsImportingPdf] = useState(false)

  const [formMessage, setFormMessage] =
    useState<MessageState | null>(null)

  const [pdfMessage, setPdfMessage] =
    useState<MessageState | null>(null)

  const [pdfWarnings, setPdfWarnings] = useState<string[]>([])

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
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
    ) {
      validationErrors.email = 'Informe um e-mail válido.'
    }

    return validationErrors
  }

  async function handleImportPdf(file: File) {
    setIsImportingPdf(true)
    setPdfWarnings([])
    setPdfMessage(null)

    try {
      const data = await importCandidatePdf(file)

      setForm((currentForm) => ({
        ...currentForm,
        fullName: data.fullName || currentForm.fullName,
        email: data.email || currentForm.email,
        phone: data.phone || currentForm.phone,
        interestedArea:
          data.interestedArea || currentForm.interestedArea,
        professionalSummary:
          data.professionalSummary ||
          currentForm.professionalSummary,
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
      const candidate = await createCandidate(form)

      navigate('/candidatos', {
        state: {
          message: {
            type: 'success',
            text: `Candidato ${candidate.fullName} cadastrado com sucesso.`,
          },
        },
      })
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
            Cadastre um candidato manualmente ou importe os dados a
            partir de um currículo em PDF.
          </p>
        </header>

        <CandidateForm
          form={form}
          errors={errors}
          formMessage={formMessage}
          pdfMessage={pdfMessage}
          pdfWarnings={pdfWarnings}
          isSaving={isSaving}
          isImportingPdf={isImportingPdf}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onImportPdf={handleImportPdf}
          onViewCandidates={() => navigate('/candidatos')}
        />
      </section>
    </main>
  )
}

export default CandidateRegistrationPage