# Curriculum Registration

Desafio técnico para cadastro e consulta de currículos.

## Tecnologias utilizadas

- Backend: ASP.NET Core 8 / .NET 8
- Banco de dados: SQL Server
- ORM: Entity Framework Core 8
- Leitura de PDF: PdfPig
- Testes: xUnit e ASP.NET Core TestServer
- Documentação da API: Swagger

> O frontend ainda será implementado. O backend já possui os endpoints de cadastro, consulta e importação de PDF.

## Funcionalidades

- Cadastro manual de candidatos;
- Consulta da lista de candidatos;
- Consulta dos detalhes de um candidato;
- Importação de currículo em PDF;
- Extração automática de nome, e-mail e telefone;
- Validação dos campos obrigatórios;
- Validação do formato do e-mail;
- Validação de arquivos PDF;
- Limite máximo de 5 MB para arquivos PDF;
- Tratamento de PDF inválido ou corrompido;
- Persistência em SQL Server;
- Testes automatizados da API.

## Pré-requisitos

Instale:

- .NET 8 SDK;
- SQL Server ou SQL Server LocalDB;
- Git.

Opcionalmente, instale a ferramenta do Entity Framework:

```bash
dotnet tool install --global dotnet-ef
```

## Configuração do banco de dados

A aplicação utiliza a connection string chamada `DefaultConnection`.

A configuração atual de desenvolvimento está em:

```text
backend/CurriculumRegistration.Api/appsettings.Development.json
```

Exemplo usando SQL Server LocalDB:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\MSSQLLocalDB;Database=CurriculumRegistration;Trusted_Connection=True;TrustServerCertificate=True"
  }
}
```

Exemplo usando SQL Server com usuário e senha:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost,1433;Database=CurriculumRegistration;User Id=sa;Password=SuaSenhaAqui;TrustServerCertificate=True"
  }
}
```

Não utilize credenciais reais em arquivos versionados.

## Criar ou atualizar o banco

A partir da raiz do repositório, execute:

```bash
dotnet ef database update ^
  --project backend/CurriculumRegistration.Api ^
  --startup-project backend/CurriculumRegistration.Api
```

No PowerShell ou Linux, utilize:

```bash
dotnet ef database update \
  --project backend/CurriculumRegistration.Api \
  --startup-project backend/CurriculumRegistration.Api
```

A migration inicial está localizada em:

```text
backend/CurriculumRegistration.Api/Migrations/
```

Ela cria a tabela `Candidates` com os campos:

- `Id`;
- `FullName`;
- `Email`;
- `Phone`;
- `InterestedArea`;
- `ProfessionalSummary`;
- `CreatedAt`;
- `UpdatedAt`.

## Executar a API

Na raiz do projeto:

```bash
dotnet run --project backend/CurriculumRegistration.Api
```

Durante o desenvolvimento, a API disponibiliza:

```text
http://localhost:5000
```

O Swagger pode ser acessado em:

```text
http://localhost:5000/swagger
```

A porta pode variar conforme o ambiente configurado em `launchSettings.json`.

## Endpoints

### Cadastrar candidato

```http
POST /api/candidates
```

Exemplo:

```json
{
  "fullName": "Maria Silva Oliveira",
  "email": "maria.oliveira@example.com",
  "phone": "(11) 98888-7777",
  "interestedArea": "Desenvolvimento Backend",
  "professionalSummary": "Desenvolvedora .NET"
}
```

### Listar candidatos

```http
GET /api/candidates
```

### Consultar candidato por identificador

```http
GET /api/candidates/{id}
```

### Importar currículo em PDF

```http
POST /api/candidates/import-pdf
```

O campo do formulário multipart deve se chamar:

```text
file
```

O arquivo deve:

- possuir extensão `.pdf`;
- possuir cabeçalho PDF válido;
- ter no máximo 5 MB.

A importação tenta identificar:

- nome completo;
- e-mail;
- telefone.

A extração pode retornar informações incompletas. Nesse caso, os dados podem ser preenchidos ou corrigidos manualmente antes do cadastro.

## Limitações da leitura de PDF

A solução utiliza extração de texto e funciona melhor com PDFs que possuem texto selecionável.

A identificação pode ser incompleta em casos como:

- currículos digitalizados como imagem;
- documentos com várias colunas;
- layouts muito complexos;
- informações divididas entre tabelas;
- telefones ou e-mails formatados de maneira incomum.

Quando uma informação não for identificada, o cadastro manual continua disponível.

## Executar os testes

Execute:

```bash
dotnet test backend/CurriculumRegistration.Api.Tests/CurriculumRegistration.Api.Tests.csproj
```

A suíte cobre:

- validação de nome;
- validação de e-mail;
- cadastro de candidato;
- rejeição de e-mail duplicado;
- consulta de candidato;
- listagem de candidatos;
- importação de PDF válido;
- arquivo vazio;
- extensão inválida;
- cabeçalho inválido;
- PDF corrompido;
- arquivo maior que 5 MB.

Os testes de integração utilizam banco de dados em memória para permanecerem isolados do SQL Server local.

## Estrutura principal

```text
backend/
├── CurriculumRegistration.Api/
│   ├── Controllers/
│   ├── Data/
│   ├── DTOs/
│   ├── Entities/
│   ├── Migrations/
│   └── Services/
└── CurriculumRegistration.Api.Tests/
```

## Uso de inteligência artificial

O desenvolvimento utiliza assistência de inteligência artificial para:

- sugerir testes;
- revisar mensagens de erro;
- auxiliar na organização das etapas;
- analisar falhas de testes;
- apoiar a documentação.

As decisões finais, adaptações, execução dos comandos e validação dos resultados são realizadas pelo desenvolvedor.

Mais detalhes estão disponíveis em:

```text
DESENVOLVIMENTO.md
```