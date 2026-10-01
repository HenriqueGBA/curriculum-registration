export type CandidateForm = {
  fullName: string
  email: string
  phone: string
  interestedArea: string
  professionalSummary: string
}

export type FormErrors = Partial<Record<keyof CandidateForm, string>>

export type CandidateSummary = {
  id: string
  fullName: string
  email: string
  phone?: string
  interestedArea?: string
  professionalSummary?: string
  createdAt: string
}

export type CandidateDetails = CandidateSummary

export type PdfImportResponse = {
  fullName?: string
  email?: string
  phone?: string
  interestedArea?: string
  professionalSummary?: string
  warnings: string[]
}

export type MessageState = {
  type: 'success' | 'error' | 'warning'
  text: string
}