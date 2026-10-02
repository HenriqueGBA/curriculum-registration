# Curriculum Registration

Aplicação full stack para cadastro de candidatos com preenchimento manual e importação opcional de currículo em PDF.

## Tecnologias e versões

### Backend

* .NET SDK 8
* ASP.NET Core 8 (`net8.0`)
* Entity Framework Core 8.0.31 (`SqlServer`, `Design`, `Tools`)
* PdfPig 0.1.16
* Swagger (Swashbuckle.AspNetCore 6.6.2)
* xUnit + ASP.NET Core TestServer

### Frontend

* Node.js 24 (mesma versão usada no CI)
* React 19.2.8
* TypeScript 6
* Vite 8
* React Router
* Vitest + Testing Library
* ESLint 10

## Funcionalidades entregues

* Cadastro manual de candidato.
* Importação opcional de currículo em PDF para extração de dados.
* Preenchimento automático dos campos encontrados no PDF, permitindo revisão e correção manual antes do cadastro.
* Em caso de falha de leitura do PDF, o cadastro manual continua disponível.
* Listagem de candidatos cadastrados.
* Visualização de detalhes de candidato.
* Navegação entre cadastro, listagem e detalhes.
* Validação frontend e backend para campos obrigatórios e formato de e-mail.
* Validação backend do arquivo PDF (extensão `.pdf`, cabeçalho e limite de 5 MB).
* Mensagens claras para sucesso, erros de cadastro, e-mail duplicado e falhas de leitura de PDF.

## Pré-requisitos

* .NET SDK 8
* Node.js 24 + npm
* SQL Server (ou SQL Server LocalDB)

## Configuração

### Backend

Arquivo de configuração:

* `backend/CurriculumRegistration.Api/appsettings.Development.json`

Exemplo sem credenciais reais:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost,1433;Database=CurriculumRegistration;User Id=curriculum_user;Password=*****;TrustServerCertificate=True"
  }
}
```

> Não commite credenciais reais.

### Frontend

Crie o arquivo `frontend/.env` usando o exemplo:

```bash
cp frontend/.env.example frontend/.env
```

Conteúdo padrão:

```env
VITE_API_BASE_URL=http://localhost:5000
```

## Banco de dados (SQL Server)

A estrutura está versionada com EF Core Migrations em:

* `backend/CurriculumRegistration.Api/Migrations`

Aplicar migrations:

```bash
dotnet ef database update \
  --project backend/CurriculumRegistration.Api \
  --startup-project backend/CurriculumRegistration.Api
```

## Como executar

### Backend

```bash
dotnet run --project backend/CurriculumRegistration.Api
```

### Frontend

```bash
cd frontend
npm ci
npm run dev
```

## Fluxo da aplicação

A aplicação possui três telas principais:

* `/cadastro` — cadastro manual ou importação de currículo em PDF;
* `/candidatos` — listagem dos candidatos cadastrados;
* `/candidatos/:id` — visualização dos detalhes de um candidato.

A navegação permite:

```text
Cadastro
   │
   ├── Salvar candidato
   │       ↓
   │    Listagem
   │
   └── Ver candidatos cadastrados
           ↓
        Listagem
           ↓
     Selecionar candidato
           ↓
        Detalhes
```

## Endpoints principais

* `POST /api/candidates` — cadastro de candidato
* `GET /api/candidates` — listagem
* `GET /api/candidates/{id}` — detalhes
* `POST /api/candidates/import-pdf` — importação de PDF (`multipart/form-data` com campo `file`)

## Testes e validações

### Backend

```bash
dotnet test backend/CurriculumRegistration.Api.Tests/CurriculumRegistration.Api.Tests.csproj
```

Cobertura inclui:

* cadastro válido;
* validações;
* e-mail duplicado;
* listagem;
* detalhes;
* PDF válido;
* PDF inválido;
* arquivo vazio;
* extensão inválida;
* cabeçalho inválido;
* arquivo acima de 5 MB;
* PDF corrompido.

### Frontend

```bash
cd frontend

npm test
npm run lint
npm run build
```

Cobertura inclui:

* validações do formulário;
* cadastro com sucesso;
* erro de e-mail duplicado;
* comportamento quando a leitura de PDF falha;
* listagem de candidatos;
* acesso aos detalhes;
* navegação entre as telas.

## Currículo fictício para teste

Arquivo disponível em:

* `frontend/public/exemplos/curriculo-ficticio.pdf`

Use este arquivo no botão de importação de PDF para testar o preenchimento automático.

## Limitações conhecidas da extração de PDF

A extração é textual (sem OCR). Pode falhar ou retornar dados parciais em:

* PDFs escaneados como imagem;
* layouts com múltiplas colunas ou tabelas complexas;
* informações em formatos muito incomuns.

Quando isso ocorre, o usuário pode corrigir ou completar os dados manualmente antes de salvar.

## Estrutura principal

```text
curriculum-registration/
├── backend/
│   ├── CurriculumRegistration.Api/
│   └── CurriculumRegistration.Api.Tests/
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       ├── types/
│       ├── App.tsx
│       ├── App.css
│       └── main.tsx
│
├── README.md
└── DESENVOLVIMENTO.md
```
