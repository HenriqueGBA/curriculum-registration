import type { ChangeEvent, FormEvent } from 'react'
import type {
  CandidateForm as CandidateFormData,
  FormErrors,
  MessageState,
} from '../types/candidate'
import PdfImport from './PdfImport'

type CandidateFormProps = {
  form: CandidateFormData
  errors: FormErrors
  formMessage: MessageState | null
  pdfMessage: MessageState | null
  pdfWarnings: string[]
  isSaving: boolean
  isImportingPdf: boolean
  onChange: (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onImportPdf: (file: File) => Promise<void>
  onViewCandidates: () => void
}

function CandidateForm({
  form,
  errors,
  formMessage,
  pdfMessage,
  pdfWarnings,
  isSaving,
  isImportingPdf,
  onChange,
  onSubmit,
  onImportPdf,
  onViewCandidates,
}: CandidateFormProps) {
  return (
    <form
      className="candidate-form"
      aria-label="Formulário de cadastro de candidato"
      onSubmit={onSubmit}
      noValidate
    >
      <div className="form-grid">
        <label>
          Nome completo

          <input
            name="fullName"
            type="text"
            value={form.fullName}
            onChange={onChange}
            aria-invalid={Boolean(errors.fullName)}
            aria-describedby={
              errors.fullName ? 'fullName-error' : undefined
            }
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
            onChange={onChange}
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
            onChange={onChange}
            placeholder="Digite o telefone"
          />
        </label>

        <label>
          Área de interesse

          <input
            name="interestedArea"
            type="text"
            value={form.interestedArea}
            onChange={onChange}
            placeholder="Ex.: Desenvolvimento Backend"
          />
        </label>

        <label className="full-width">
          Resumo profissional

          <textarea
            name="professionalSummary"
            rows={5}
            value={form.professionalSummary}
            onChange={onChange}
            placeholder="Descreva brevemente a experiência profissional"
          />
        </label>
      </div>

      <PdfImport
        onImport={onImportPdf}
        isImporting={isImportingPdf}
        message={pdfMessage}
        warnings={pdfWarnings}
      />

    <div className="form-actions">
        <button
            type="button"
            className="secondary-button"
            onClick={onViewCandidates}
        >
            Ver candidatos cadastrados
        </button>

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
  )
}

export default CandidateForm