# Desenvolvimento

## 1. Objetivo

Este projeto foi desenvolvido como parte do desafio técnico de cadastro de currículos.

A proposta é permitir que uma pessoa:

- cadastre um candidato manualmente;
- envie um currículo em PDF para extração automática de dados;
- revise ou complemente as informações extraídas;
- consulte a lista de candidatos;
- consulte os detalhes de um candidato.

O desenvolvimento foi realizado priorizando uma solução simples, organizada, testável e fácil de evoluir.

## 2. Organização do trabalho

O trabalho foi dividido em etapas pequenas, com validação após cada alteração:

1. Estruturação inicial do backend;
2. Criação do cadastro manual de candidatos;
3. Implementação da listagem e consulta por identificador;
4. Adição da validação dos campos obrigatórios;
5. Implementação da importação de PDF;
6. Criação da extração de nome, e-mail e telefone;
7. Adição dos testes de integração do PDF;
8. Tratamento de arquivos inválidos e PDFs corrompidos;
9. Validação do limite máximo de 5 MB;
10. Configuração da persistência com SQL Server e Entity Framework Core;
11. Organização da documentação do projeto;
12. Execução da suíte completa de testes.

O trabalho foi desenvolvido em branches específicas por funcionalidade, com commits pequenos e Pull Requests direcionados para a branch `dev`.

## 3. Decisões técnicas

### Backend

Foi escolhido o ASP.NET Core 8 por ser uma tecnologia adequada para construção de APIs REST, possuir boa integração com o Entity Framework Core e atender ao requisito do desafio.

A API foi organizada em:

- Controllers;
- DTOs;
- Entities;
- Data;
- Services;
- Migrations.

Essa separação mantém as responsabilidades mais claras e facilita a manutenção.

### Banco de dados

Foi utilizado SQL Server, conforme solicitado no desafio.

O acesso ao banco é realizado por meio do Entity Framework Core, utilizando:

- `AppDbContext`;
- configuração de entidade;
- migrations;
- connection string configurável por ambiente.

A entidade `Candidate` possui os seguintes dados:

- nome completo;
- e-mail;
- telefone;
- área de interesse;
- resumo profissional;
- data de criação;
- data de atualização.

Os testes de integração utilizam um banco em memória para permanecerem isolados do SQL Server local.

### Importação de PDF

A leitura do PDF é realizada no backend utilizando a biblioteca PdfPig.

A aplicação:

1. valida a extensão do arquivo;
2. valida o cabeçalho do PDF;
3. valida o tamanho máximo de 5 MB;
4. extrai o texto do documento;
5. tenta identificar nome, e-mail e telefone;
6. retorna os dados encontrados para preenchimento ou correção manual.

A extração não tenta resolver todos os formatos possíveis de currículo. A prioridade foi implementar uma solução simples e compreensível, deixando os campos disponíveis para correção manual quando necessário.

### Validação

As validações dos dados do candidato utilizam Data Annotations, incluindo:

- obrigatoriedade do nome;
- tamanho mínimo e máximo do nome;
- obrigatoriedade do e-mail;
- formato válido do e-mail;
- limites dos campos opcionais.

Também foram implementadas validações específicas para o arquivo PDF.

## 4. Testes

A solução foi desenvolvida com foco em testes automatizados.

A suíte atual possui 16 testes, cobrindo:

- candidato válido;
- nome obrigatório;
- nome com tamanho inválido;
- e-mail obrigatório;
- e-mail inválido;
- cadastro de candidato;
- normalização do e-mail;
- rejeição de e-mail duplicado;
- listagem de candidatos;
- consulta de candidato;
- candidato inexistente;
- PDF válido;
- arquivo vazio;
- extensão inválida;
- cabeçalho inválido;
- PDF corrompido;
- arquivo maior que 5 MB.

A execução foi realizada com:

```bash
dotnet test backend/CurriculumRegistration.Api.Tests/CurriculumRegistration.Api.Tests.csproj
```

Resultado validado em 1º de outubro de 2026:

```text
Total: 16
Falhas: 0
Sucesso: 16
Ignorados: 0
```

Além dos testes locais, o repositório possui workflow do GitHub Actions para executar os testes automaticamente.

## 5. Uso de inteligência artificial

Foi utilizada inteligência artificial como ferramenta de apoio durante o desenvolvimento.

A IA foi utilizada para:

- analisar mensagens de erro dos testes;
- sugerir cenários de teste;
- auxiliar na identificação da causa de falhas na leitura de PDF;
- propor melhorias no tratamento de erros;
- revisar a organização das etapas;
- auxiliar na criação da documentação;
- sugerir comandos Git e estrutura de Pull Requests.

A IA não foi utilizada como substituta da validação técnica. Todas as alterações foram revisadas, adaptadas e executadas localmente antes de serem consideradas concluídas.

## 6. Exemplos de solicitações feitas à IA

Alguns exemplos de solicitações utilizadas:

- análise da exceção do PdfPig relacionada ao trailer do PDF;
- criação de um PDF mínimo válido para uso em teste;
- sugestão de testes para arquivo PDF corrompido;
- validação do comportamento para arquivos maiores que 5 MB;
- revisão das mensagens retornadas pela API;
- organização do README e do registro de desenvolvimento.

As respostas foram utilizadas como sugestões iniciais. O código foi adaptado ao contexto real do projeto e validado com a execução dos testes.

## 7. Correções e adaptações realizadas

Durante o desenvolvimento, foi identificado que o PDF utilizado inicialmente no teste não possuía uma estrutura completa de PDF.

Embora o arquivo tivesse o cabeçalho `%PDF-`, ele não possuía um trailer válido com a chave `/Size`, exigida pelo PdfPig. Isso fazia com que a importação retornasse erro `500`.

A correção foi criar um PDF mínimo, porém estruturalmente válido, contendo:

- catálogo;
- página;
- conteúdo;
- fonte;
- tabela `xref`;
- trailer;
- referência `/Size`.

Também foi adicionado tratamento para PDFs corrompidos, fazendo a API retornar `400 Bad Request` com uma mensagem clara em vez de expor um erro interno `500`.

## 8. Limitações conhecidas

A extração de dados do PDF possui limitações, especialmente em documentos:

- digitalizados como imagem;
- com várias colunas;
- com tabelas complexas;
- com layouts pouco estruturados;
- com telefones ou e-mails em formatos incomuns.

A solução não utiliza OCR. Por isso, PDFs que não possuem texto selecionável podem não fornecer dados para extração.

Quando uma informação não é encontrada, o fluxo permite que o usuário preencha ou corrija os dados manualmente.

## 9. Pendências e próximos passos

O backend possui o fluxo principal de cadastro, consulta e importação de PDF.

A principal pendência é a implementação do frontend, que deverá fornecer:

- formulário único para cadastro manual e importação de PDF;
- preenchimento dos campos a partir dos dados extraídos;
- possibilidade de correção manual;
- listagem de candidatos;
- tela de detalhes;
- mensagens de sucesso e erro;
- integração com os endpoints da API.

Outras melhorias possíveis:

- substituir o tratamento genérico de exceções por exceções específicas;
- adicionar logs estruturados;
- adicionar testes com SQL Server real;
- adicionar paginação na listagem;
- melhorar a extração para diferentes padrões de currículo;
- adicionar OCR para PDFs escaneados;
- adicionar testes end-to-end do frontend.

## 10. Verificação da solução

A solução foi verificada por meio de:

- compilação do backend;
- execução dos testes automatizados;
- validação das respostas HTTP;
- verificação das mensagens de erro;
- validação do comportamento com banco em memória;
- revisão dos arquivos alterados;
- execução do fluxo de branches e Pull Requests;
- atualização da branch `dev` após os merges.

O resultado atual da suíte é de 16 testes aprovados.

## 11. Tempo aproximado

O tempo foi distribuído entre:

- análise dos requisitos;
- implementação do backend;
- criação e ajuste dos testes;
- investigação de erros na leitura de PDF;
- configuração das migrations;
- documentação;
- revisão e validação dos Pull Requests.


## 12. Conclusão

O projeto foi desenvolvido priorizando clareza, simplicidade e validação incremental.

A implementação atual possui um backend funcional para cadastro e consulta de candidatos, importação de currículos em PDF, validações, persistência preparada para SQL Server e uma suíte automatizada com 16 testes aprovados.

As limitações e pendências estão documentadas para facilitar a continuidade do desenvolvimento, principalmente a implementação do frontend e a evolução da extração de dados dos currículos.