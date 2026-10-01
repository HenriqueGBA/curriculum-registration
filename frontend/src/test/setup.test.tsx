import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

function TestComponent() {
  return <h1>Ambiente de testes configurado</h1>
}

describe('configuração do frontend', () => {
  it('deve renderizar um componente React', () => {
    render(<TestComponent />)

    expect(
      screen.getByRole('heading', {
        name: 'Ambiente de testes configurado',
      }),
    ).toBeInTheDocument()
  })
})