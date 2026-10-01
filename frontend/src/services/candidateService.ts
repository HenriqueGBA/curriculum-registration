import type {
  CandidateDetails,
  CandidateForm,
  CandidateSummary,
  PdfImportResponse,
} from '../types/candidate'

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
    // Retorna a mensagem padrão quando a API não retorna JSON.
  }

  return fallbackMessage
}

export async function getCandidates(): Promise<CandidateSummary[]> {
  const response = await fetch(getApiUrl('/api/candidates'))

  if (!response.ok) {
    throw new Error('Não foi possível carregar a listagem de candidatos.')
  }

  return (await response.json()) as CandidateSummary[]
}

export async function getCandidateById(
  candidateId: string,
): Promise<CandidateDetails> {
  const response = await fetch(
    getApiUrl(`/api/candidates/${candidateId}`),
  )

  if (!response.ok) {
    throw new Error(await readApiErrorMessage(response))
  }

  return (await response.json()) as CandidateDetails
}

export async function createCandidate(
  candidate: CandidateForm,
): Promise<CandidateDetails> {
  const response = await fetch(getApiUrl('/api/candidates'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(candidate),
  })

  if (!response.ok) {
    throw new Error(await readApiErrorMessage(response))
  }

  return (await response.json()) as CandidateDetails
}

export async function importCandidatePdf(
  file: File,
): Promise<PdfImportResponse> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(getApiUrl('/api/candidates/import-pdf'), {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error(await readApiErrorMessage(response))
  }

  return (await response.json()) as PdfImportResponse
}