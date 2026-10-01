import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('tela de cadastro de candidato', () => {
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
    expect(screen.getByLabelText('Área de interesse')).toBeInTheDocument()
    expect(screen.getByLabelText('Resumo profissional')).toBeInTheDocument()
    expect(screen.getByLabelText('Currículo em PDF')).toBeInTheDocument()

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
})