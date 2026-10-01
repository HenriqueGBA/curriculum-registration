# DESENVOLVIMENTO

## 1. Organização da solução

### Backend (`backend/CurriculumRegistration.Api`)
- `Controllers`: endpoints HTTP (`CandidatesController`, `HealthController`);
- `DTOs`: contratos de entrada/saída e validações (`CreateCandidateRequest`, `CandidateResponse`, `PdfImportResponse`);
- `Services`: extração de texto de PDF (`IPdfImportService` / `PdfImportService`);
- `Data`: `AppDbContext` e mapeamento EF Core;
- `Entities`: entidade `Candidate`;
- `Migrations`: versionamento do banco SQL Server.

### Frontend (`frontend/src`)
- `App.tsx`: formulário único para cadastro manual + importação de PDF, listagem e detalhes;
- `App.css`: estilos da página e feedback visual;
- `App.test.tsx`: testes de comportamento da interface.

## 2. Decisões técnicas

1. **Manter arquitetura existente** em vez de reescrever backend/frontend.
2. **Leitura de PDF no backend** com PdfPig (compatível com .NET 8 e adequada ao desafio).
3. **Formulário único** para os dois fluxos (manual e com PDF), como exigido.
4. **Persistência SQL Server** na configuração padrão do backend.
5. **Testes de integração backend com banco em memória** (`UseInMemoryDatabase`) para isolamento.
6. **Mensagens de erro/sucesso explícitas** no frontend, consumindo mensagens retornadas pela API.
7. **CORS local** configurado no backend para portas comuns do Vite (`5173` e `4173`).

## 3. Fluxo funcional implementado

1. Usuário pode preencher manualmente e salvar sem depender de PDF.
2. Usuário pode selecionar PDF e clicar em importação.
3. Backend valida extensão/cabeçalho/tamanho (máx. 5 MB), extrai texto e tenta identificar nome/e-mail/telefone.
4. Frontend preenche os campos encontrados e exibe warnings quando extração é parcial.
5. Falha na leitura de PDF não bloqueia cadastro manual.
6. Após salvar, frontend recarrega listagem e permite abrir detalhes por candidato.

## 4. Validações e tratamento de erros

### Backend
- `CreateCandidateRequest`: nome obrigatório (mín. 3), e-mail obrigatório e válido, limites de tamanho.
- `PdfImportService`: arquivo obrigatório, extensão `.pdf`, tamanho até 5 MB, cabeçalho `%PDF-`.
- Duplicidade de e-mail tratada no endpoint de criação com retorno `409 Conflict`.

### Frontend
- Validação local de obrigatoriedade e formato de e-mail antes do POST.
- Mensagens para:
  - sucesso de cadastro;
  - erro de e-mail duplicado;
  - erro de importação/leitura de PDF;
  - falha de carregamento de lista/detalhes.

## 5. Uso de IA/modelos no processo

A IA foi usada como apoio para:
- revisar aderência dos requisitos;
- identificar lacunas de cobertura de testes;
- validar mensagens de erro e edge cases;
- organizar atualização de documentação técnica.

### Exemplos de pedidos feitos à IA
- “Mapear requisitos funcionais contra endpoints e UI já existentes.”
- “Sugerir cenários mínimos de teste para falha de leitura de PDF sem bloquear cadastro manual.”
- “Revisar README para incluir setup full stack e limitações reais da extração.”

## 6. Adaptações/correções relevantes

- Frontend inicial tinha apenas formulário local sem integração com API.
- Foi adicionada integração real com endpoints de cadastro, importação, listagem e detalhes.
- Foi corrigida a apresentação de mensagens de erro no CSS (`.error-message` fora de media query).
- Foi adicionada configuração de CORS no backend para uso local com Vite.
- Foi adicionado `frontend/.env.example` para configuração sem segredo.
- Foi adicionado PDF fictício versionado (`frontend/public/exemplos/curriculo-ficticio.pdf`).

## 7. Verificação executada

Comandos de validação executados:

- `dotnet test backend/CurriculumRegistration.Api.Tests/CurriculumRegistration.Api.Tests.csproj`
- `npm test` (em `frontend`)
- `npm run lint` (em `frontend`)
- `npm run build` (em `frontend`)

Também foi verificada a suíte de CI/workflows existente no repositório e mantida sem mudança estrutural.

## 8. Tempo aproximado

- Levantamento e mapeamento de lacunas: ~35 min
- Implementação frontend (integração + UI listagem/detalhes): ~90 min
- Ajustes backend mínimos (CORS): ~10 min
- Testes/depuração: ~45 min
- Documentação (`README.md` e `DESENVOLVIMENTO.md`): ~35 min

**Total aproximado:** ~3h35

## 9. Dificuldades e limitações

### Dificuldades
- Garantir testes de interface estáveis com múltiplas chamadas `fetch` em sequência.
- Manter mudanças pequenas sem quebrar estrutura existente.

### Limitações atuais
- Extração de PDF ainda depende de texto selecionável (sem OCR).
- Regra de extração de nome é heurística e pode errar em layouts incomuns.
- Não há paginação/filtro na listagem.

## 10. Melhorias futuras

- Adicionar OCR opcional para PDFs escaneados.
- Tornar extração de nome mais robusta com heurísticas adicionais.
- Adicionar paginação, busca e ordenação na listagem.
- Incluir testes end-to-end (ex.: Playwright) cobrindo fluxo completo.
