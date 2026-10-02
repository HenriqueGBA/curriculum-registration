# DESENVOLVIMENTO

## 1. Organização da solução

### Backend (`backend/CurriculumRegistration.Api`)

* `Controllers`: endpoints HTTP (`CandidatesController`, `HealthController`);
* `DTOs`: contratos de entrada/saída e validações (`CreateCandidateRequest`, `CandidateResponse`, `PdfImportResponse`);
* `Services`: extração de texto de PDF (`IPdfImportService` / `PdfImportService`);
* `Data`: `AppDbContext` e configuração do Entity Framework Core;
* `Entities`: entidade `Candidate`;
* `Migrations`: versionamento do banco SQL Server.

### Frontend (`frontend/src`)

A estrutura do frontend foi separada por responsabilidade para evitar concentrar toda a aplicação em `App.tsx`.

* `App.tsx`: configuração das rotas da aplicação;
* `pages/`: telas principais da aplicação;

  * `CandidateRegistrationPage.tsx`: cadastro manual e importação de PDF;
  * `CandidatesPage.tsx`: listagem de candidatos;
  * `CandidateDetailsPage.tsx`: detalhes de um candidato;
* `components/`: componentes reutilizáveis da interface;

  * `CandidateForm.tsx`: formulário de cadastro;
  * `CandidateList.tsx`: listagem visual dos candidatos;
  * `PdfImport.tsx`: seleção e importação de currículo em PDF;
* `services/`: comunicação com a API;

  * `candidateService.ts`: funções para cadastro, importação, listagem e consulta de candidatos;
* `types/`: tipos compartilhados do frontend;

  * `candidate.ts`: tipos de formulário, candidatos, resposta de PDF e mensagens;
* `App.css`: estilos globais da aplicação;
* `main.tsx`: ponto de entrada do React e carregamento dos estilos globais.

## 2. Decisões técnicas

1. **Separação do frontend por responsabilidade**

   O frontend inicialmente concentrava cadastro, importação de PDF, listagem e detalhes em um único `App.tsx`.

   Durante a implementação, essa estrutura foi refatorada para separar páginas, componentes, serviços e tipos, facilitando manutenção, leitura e evolução da aplicação.

2. **React Router para navegação**

   Foi utilizado React Router para separar as principais telas da aplicação em rotas distintas:

   * `/cadastro`
   * `/candidatos`
   * `/candidatos/:id`

   A rota `/` redireciona para `/cadastro`.

3. **Leitura de PDF no backend**

   A extração foi implementada no backend utilizando PdfPig, mantendo o processamento do arquivo fora do frontend e centralizando as regras de validação e extração.

4. **Formulário único para cadastro**

   O cadastro manual e a importação de PDF utilizam o mesmo formulário. A importação apenas preenche os campos encontrados, permitindo que o usuário revise e complete os dados antes de salvar.

5. **Persistência SQL Server**

   A persistência utiliza Entity Framework Core com SQL Server, com migrations versionadas no repositório.

6. **Serviço dedicado para comunicação com a API**

   As chamadas HTTP foram removidas das páginas e centralizadas em `candidateService.ts`, evitando duplicação e mantendo a responsabilidade de comunicação com o backend separada da apresentação.

7. **Tipos compartilhados**

   Os modelos utilizados pelo frontend foram centralizados em `types/candidate.ts`, reduzindo duplicação de definições e facilitando alterações futuras.

8. **Testes de integração do backend**

   Os testes utilizam banco em memória (`UseInMemoryDatabase`) para manter isolamento entre os cenários.

9. **Mensagens explícitas para o usuário**

   O frontend apresenta mensagens de sucesso, erro e aviso de acordo com o resultado retornado pela API.

10. **CORS local**

    O backend possui configuração de CORS para permitir o desenvolvimento local utilizando as portas comuns do Vite (`5173` e `4173`).

## 3. Fluxo funcional implementado

1. O usuário acessa `/cadastro`.
2. Pode preencher os dados manualmente ou selecionar um currículo em PDF.
3. Ao importar o PDF, o backend valida o arquivo e extrai o texto.
4. O serviço tenta identificar nome, e-mail, telefone e outras informações disponíveis.
5. Os dados encontrados são enviados ao frontend e preenchidos no formulário.
6. O usuário pode revisar e corrigir os dados antes de salvar.
7. Caso a extração falhe ou seja parcial, o usuário pode continuar o cadastro manualmente.
8. Ao salvar com sucesso, o usuário é direcionado para `/candidatos`.
9. A listagem apresenta os candidatos cadastrados.
10. Ao selecionar um candidato, o frontend acessa `/candidatos/:id` e carrega seus detalhes.
11. O usuário pode retornar à listagem ou iniciar um novo cadastro.

## 4. Validações e tratamento de erros

### Backend

* `CreateCandidateRequest`: nome obrigatório, com tamanho mínimo definido, e-mail obrigatório e válido e limites de tamanho dos campos;
* `PdfImportService`: arquivo obrigatório, extensão `.pdf`, tamanho máximo de 5 MB e cabeçalho `%PDF-`;
* duplicidade de e-mail tratada no endpoint de criação com retorno `409 Conflict`;
* falhas de leitura ou extração do PDF retornam mensagens que podem ser apresentadas ao usuário.

### Frontend

* validação local de nome e e-mail antes do envio;
* tratamento de erros retornados pela API;
* mensagens de sucesso após cadastro;
* aviso quando a extração do PDF é parcial;
* mensagem quando a importação do PDF falha;
* tratamento de falha no carregamento da listagem;
* tratamento de falha no carregamento dos detalhes;
* navegação explícita entre cadastro, listagem e detalhes.

## 5. Uso de IA/modelos no processo

A IA foi utilizada como ferramenta de apoio durante o desenvolvimento, principalmente para:

* revisar aderência aos requisitos do desafio;
* sugerir organização e separação de responsabilidades no frontend;
* identificar lacunas de cobertura de testes;
* sugerir cenários de erro e edge cases;
* revisar mensagens de erro e feedback da interface;
* auxiliar na atualização da documentação técnica;
* auxiliar na análise e correção de problemas encontrados durante o desenvolvimento.

As sugestões geradas pela IA foram revisadas e adaptadas ao código existente antes da implementação.

### Exemplos de pedidos feitos à IA

* “Mapear requisitos funcionais contra endpoints e UI já existentes.”
* “Sugerir uma estrutura de frontend separando páginas, componentes, serviços e tipos.”
* “Sugerir cenários mínimos de teste para falha de leitura de PDF sem bloquear cadastro manual.”
* “Revisar README para incluir setup full stack e limitações reais da extração.”
* “Revisar a navegação entre cadastro, listagem e detalhes sem alterar o backend.”

## 6. Adaptações e correções relevantes

* O frontend inicial concentrava grande parte da lógica em `App.tsx`.
* A estrutura foi refatorada para separar páginas, componentes, serviços e tipos.
* Foi adicionada navegação com React Router entre cadastro, listagem e detalhes.
* A comunicação com a API foi centralizada em `candidateService.ts`.
* Os tipos utilizados pelo frontend foram centralizados em `types/candidate.ts`.
* A importação de PDF foi isolada no componente `PdfImport`.
* O formulário de candidato foi separado em `CandidateForm`.
* A listagem de candidatos foi separada em `CandidateList`.
* A apresentação de mensagens de erro no CSS foi corrigida com a classe `.error-message`.
* Foi adicionada configuração de CORS no backend para uso local com Vite.
* Foi adicionado `frontend/.env.example` para configuração da URL da API sem credenciais.
* Foi adicionado PDF fictício versionado em `frontend/public/exemplos/curriculo-ficticio.pdf`.
* Foram realizados ajustes de layout e navegação para manter as ações de cadastro e consulta organizadas.

## 7. Verificação executada

### Backend

```bash
dotnet test backend/CurriculumRegistration.Api.Tests/CurriculumRegistration.Api.Tests.csproj
```

### Frontend

```bash
cd frontend

npm test
npm run lint
npm run build
```

Também foi verificada a execução do fluxo principal do frontend, incluindo:

* acesso à tela de cadastro;
* preenchimento manual;
* importação de PDF;
* validação de campos;
* cadastro;
* redirecionamento para a listagem;
* seleção de candidato;
* carregamento dos detalhes;
* navegação de volta para a listagem;
* retorno para o cadastro.

A suíte de CI/workflows existente no repositório também foi verificada e mantida sem alteração estrutural.

## 8. Tempo aproximado

* Levantamento e mapeamento de lacunas: ~35 min
* Implementação e integração frontend: ~90 min
* Refatoração da estrutura do frontend: ~45 min
* Ajustes backend mínimos (CORS): ~10 min
* Testes e depuração: ~45 min
* Ajustes visuais e navegação: ~20 min
* Documentação (`README.md` e `DESENVOLVIMENTO.md`): ~35 min

**Total aproximado: ~4h40**

## 9. Dificuldades e limitações

### Dificuldades

* Garantir testes de interface estáveis com múltiplas chamadas `fetch` em sequência.
* Manter as alterações compatíveis com a estrutura existente do projeto.
* Separar o frontend em responsabilidades menores sem alterar o comportamento existente.
* Garantir que a navegação entre cadastro, listagem e detalhes continuasse funcionando após a refatoração.

### Limitações atuais

* A extração de PDF depende de texto selecionável e não possui OCR.
* A identificação de informações do currículo utiliza regras heurísticas e pode apresentar resultados parciais em layouts incomuns.
* A aplicação ainda não armazena o arquivo PDF original associado ao candidato.
* Não há paginação, filtro ou busca na listagem.
* Não há testes end-to-end cobrindo o fluxo completo no navegador.

## 10. Melhorias futuras

* Armazenar o currículo PDF original associado ao candidato.
* Disponibilizar uma ação para visualizar o currículo PDF a partir da tela de detalhes.
* Adicionar OCR opcional para PDFs escaneados.
* Tornar a extração de nome e demais campos mais robusta com heurísticas adicionais.
* Adicionar paginação, busca e ordenação na listagem.
* Incluir testes end-to-end, por exemplo utilizando Playwright.
* Melhorar a experiência visual da listagem e da tela de detalhes.
