import { useState, type ChangeEvent, type FormEvent } from 'react'
import './App.css'

type CandidateForm = {
  fullName: string
  email: string
  phone: string
  interestedArea: string
  professionalSummary: string
}

type FormErrors = Partial<Record<keyof CandidateForm, string>>

const initialForm: CandidateForm = {
  fullName: '',
  email: '',
  phone: '',
  interestedArea: '',
  professionalSummary: '',
}

function App() {
  const [form, setForm] = useState<CandidateForm>(initialForm)
  const [errors, setErrors] = useState<FormErrors>({})

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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const validationErrors = validateForm()
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    // A integração com a API será adicionada na próxima etapa.
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
            <input id="pdf-file" name="file" type="file" accept=".pdf" />

            <button type="button">Importar currículo em PDF</button>
          </div>

          <div className="form-actions">
            <button type="submit">Salvar candidato</button>
          </div>
        </form>
      </section>
    </main>
  )
}

export default App