import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

type MockResponse = {
  ok: boolean
  status: number
  json: () => Promise<unknown>
}

const fetchMock = vi.fn<
  (
    input: RequestInfo | URL,
    init?: RequestInit,
  ) => Promise<MockResponse>

>()

function createJsonResponse(
  status: number,
  body: unknown,
): MockResponse {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  }
}

describe('tela de cadastro de candidato', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
    window.history.pushState({}, '', '/cadastro')
  })

  it('deve exibir os campos principais do cadastro', () => {
    render(<App />)


    expect(
      screen.getByRole('heading', {
        name: 'Cadastro de candidato',
      }),
    ).toBeInTheDocument()

    expect(screen.getByLabelText('Nome completo')).toBeInTheDocument()
    expect(screen.getByLabelText('E-mail')).toBeInTheDocument()
    expect(screen.getByLabelText('Telefone')).toBeInTheDocument()
    expect(
      screen.getByLabelText('Área de interesse'),
    ).toBeInTheDocument()
    expect(
      screen.getByLabelText('Resumo profissional'),
    ).toBeInTheDocument()
    expect(
      screen.getByLabelText('Currículo em PDF'),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('button', {
        name: 'Importar currículo em PDF',
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('button', {
        name: 'Salvar candidato',
      }),
    ).toBeInTheDocument()

  })

  it('deve exibir erros ao tentar salvar sem preencher os campos obrigatórios', () => {
    render(<App />)

    fireEvent.submit(
      screen.getByRole('form', {
        name: 'Formulário de cadastro de candidato',
      }),
    )

    expect(
      screen.getByText('O nome completo é obrigatório.'),
    ).toBeInTheDocument()

    expect(
      screen.getByText('O e-mail é obrigatório.'),
    ).toBeInTheDocument()

  })

  it('deve cadastrar candidato e carregar listagem e detalhes', async () => {
    fetchMock
      .mockResolvedValueOnce(
        createJsonResponse(201, {
          id: '8f953f66-bd39-4dae-a54d-5a37b6d631f1',
          fullName: 'Maria Silva',
          email: '[maria.silva@example.com](mailto:maria.silva@example.com)',
          phone: '(11) 98888-7777',
          interestedArea: 'Backend',
          professionalSummary: 'Desenvolvedora .NET',
          createdAt: '2026-10-01T00:00:00Z',
        }),
      )
      .mockResolvedValueOnce(
        createJsonResponse(200, [
          {
            id: '8f953f66-bd39-4dae-a54d-5a37b6d631f1',
            fullName: 'Maria Silva',
            email: '[maria.silva@example.com](mailto:maria.silva@example.com)',
            createdAt: '2026-10-01T00:00:00Z',
          },
        ]),
      )
      .mockResolvedValueOnce(
        createJsonResponse(200, {
          id: '8f953f66-bd39-4dae-a54d-5a37b6d631f1',
          fullName: 'Maria Silva',
          email: '[maria.silva@example.com](mailto:maria.silva@example.com)',
          phone: '(11) 98888-7777',
          interestedArea: 'Backend',
          professionalSummary: 'Desenvolvedora .NET',
          createdAt: '2026-10-01T00:00:00Z',
        }),
      )

    render(<App />)

    await userEvent.type(
      screen.getByLabelText('Nome completo'),
      'Maria Silva',
    )

    await userEvent.type(
      screen.getByLabelText('E-mail'),
      'maria.silva@example.com',
    )

    fireEvent.submit(
      screen.getByRole('form', {
        name: 'Formulário de cadastro de candidato',
      }),
    )

    expect(
      await screen.findByText(
        'Candidato Maria Silva cadastrado com sucesso.',
      ),
    ).toBeInTheDocument()

    const candidateButton = await screen.findByRole('button', {
      name: /Maria Silva/i,
    })

    await userEvent.click(candidateButton)

    expect(
      await screen.findByText('Desenvolvedora .NET'),
    ).toBeInTheDocument()

  })

  it('deve exibir erro de e-mail duplicado no cadastro', async () => {
    fetchMock.mockResolvedValueOnce(
      createJsonResponse(409, {
        message:
          'Já existe um candidato cadastrado com este e-mail.',
      }),
    )

    render(<App />)

    await userEvent.type(
      screen.getByLabelText('Nome completo'),
      'Maria Silva',
    )

    await userEvent.type(
      screen.getByLabelText('E-mail'),
      'duplicado@example.com',
    )

    fireEvent.submit(
      screen.getByRole('form', {
        name: 'Formulário de cadastro de candidato',
      }),
    )

    expect(
      await screen.findByText(
        'Já existe um candidato cadastrado com este e-mail.',
      ),
    ).toBeInTheDocument()

  })

  it('deve exibir falha de leitura do pdf e ainda permitir cadastro manual', async () => {
    fetchMock
      .mockResolvedValueOnce(
        createJsonResponse(400, {
          message:
            'Não foi possível ler o conteúdo do arquivo PDF.',
        }),
      )
      .mockResolvedValueOnce(
        createJsonResponse(201, {
          id: '8f953f66-bd39-4dae-a54d-5a37b6d631f1',
          fullName: 'Maria Silva',
          email: '[maria.silva@example.com](mailto:maria.silva@example.com)',
          createdAt: '2026-10-01T00:00:00Z',
        }),
      )
      .mockResolvedValueOnce(
        createJsonResponse(200, [
          {
            id: '8f953f66-bd39-4dae-a54d-5a37b6d631f1',
            fullName: 'Maria Silva',
            email: '[maria.silva@example.com](mailto:maria.silva@example.com)',
            createdAt: '2026-10-01T00:00:00Z',
          },
        ]),
      )


    render(<App />)

    const fileInput = screen.getByLabelText('Currículo em PDF')

    const file = new File(['invalid'], 'curriculo.pdf', {
      type: 'application/pdf',
    })

    await userEvent.upload(fileInput, file)

    await userEvent.click(
      screen.getByRole('button', {
        name: 'Importar currículo em PDF',
      }),
    )

    expect(
      await screen.findByText(
        'Não foi possível ler o conteúdo do arquivo PDF.',
      ),
    ).toBeInTheDocument()

    await userEvent.type(
      screen.getByLabelText('Nome completo'),
      'Maria Silva',
    )

    await userEvent.type(
      screen.getByLabelText('E-mail'),
      'maria.silva@example.com',
    )

    fireEvent.submit(
      screen.getByRole('form', {
        name: 'Formulário de cadastro de candidato',
      }),
    )

    await waitFor(() => {
      expect(
        screen.getByText(
          'Candidato Maria Silva cadastrado com sucesso.',
        ),
      ).toBeInTheDocument()
    })

  })
})
