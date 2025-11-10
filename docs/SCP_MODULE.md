# Módulo SCP - Investidores e Projetos

## Visão Geral

O módulo SCP (Sociedade em Conta de Participação) é um sistema completo para gerenciamento de investidores, projetos, aportes de capital, políticas de distribuição e pagamento de rendimentos aos investidores.

## Autenticação e Headers

Todos os endpoints da API requerem autenticação via JWT (JSON Web Token).

### Headers Obrigatórios

```http
Authorization: Bearer <seu-token-jwt>
x-company-id: <uuid-da-empresa>
Content-Type: application/json
```

> **IMPORTANTE:** O header `x-company-id` é obrigatório em todas as requisições do módulo SCP. Ele identifica qual empresa está sendo acessada.

### Obtendo o Token

O token JWT é obtido através do endpoint de login da API:

```http
POST /auth/login
Content-Type: application/json

{
  "email": "usuario@empresa.com",
  "password": "senha123"
}
```

**Resposta:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "usuario@empresa.com",
    "companyId": "uuid"
  }
}
```

### Isolamento por Empresa

- Todos os dados são automaticamente filtrados pelo `companyId` enviado no header `x-company-id`
- Não é necessário (nem possível) especificar `companyId` no body das requisições
- Cada requisição acessa apenas os dados da empresa especificada no header
- Um usuário pode ter acesso a múltiplas empresas, use o header para alternar entre elas

### Exemplo de Requisição Completa

```http
POST /scp/investors
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
x-company-id: 16dfd69e-6903-4e51-81a4-662465b74cd4
Content-Type: application/json

{
  "type": "PESSOA_FISICA",
  "fullName": "João Silva",
  "cpf": "123.456.789-00",
  "email": "joao@email.com"
}
```

### Como Obter o Company ID

O `companyId` está disponível na resposta do login:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": "uuid",
    "email": "usuario@empresa.com",
    "companies": [
      {
        "companyId": "16dfd69e-6903-4e51-81a4-662465b74cd4",
        "companyName": "Minha Empresa Ltda",
        "companyCnpj": "12.345.678/0001-90",
        "role": { "name": "Admin" }
      }
    ]
  }
}
```

Use o `companyId` da empresa desejada no header `x-company-id`.

### Tratamento de Erros

A API retorna os seguintes códigos de status HTTP:

- **200 OK**: Requisição bem-sucedida (GET, PUT)
- **201 Created**: Recurso criado com sucesso (POST)
- **400 Bad Request**: Dados inválidos ou regra de negócio violada
- **401 Unauthorized**: Token ausente ou inválido
- **404 Not Found**: Recurso não encontrado
- **500 Internal Server Error**: Erro interno do servidor

**Formato de Erro:**
```json
{
  "statusCode": 400,
  "message": "Investidor com este CPF já existe nesta empresa",
  "error": "Bad Request"
}
```

## Entidades Principais

### 1. **Investidores (Investor)**
Cadastro completo de investidores que podem ser pessoas físicas ou jurídicas.

**Campos Básicos:**
- `type`: PESSOA_FISICA ou PESSOA_JURIDICA (obrigatório)
- `active`: Status ativo/inativo
- `status`: ATIVO, INATIVO, SUSPENSO, BLOQUEADO
- `statusReason`: Motivo do status atual
- `investorCode`: Código único do investidor
- `category`: Categoria do investidor
- `isAccreditedInvestor`: Se é investidor qualificado

**Pessoa Física (PF):**
- `fullName`: Nome completo (obrigatório para PF)
- `cpf`: CPF (obrigatório e único para PF)
- `rg`: RG
- `birthDate`: Data de nascimento
- `gender`: MASCULINO, FEMININO, OUTRO, PREFIRO_NAO_INFORMAR
- `maritalStatus`: SOLTEIRO, CASADO, DIVORCIADO, VIUVO, UNIAO_ESTAVEL, SEPARADO
- `nationality`: Nacionalidade
- `profession`: Profissão
- `motherName`: Nome da mãe
- `fatherName`: Nome do pai

**Pessoa Jurídica (PJ):**
- `companyName`: Razão social (obrigatório para PJ)
- `tradeName`: Nome fantasia
- `cnpj`: CNPJ (obrigatório e único para PJ)
- `stateRegistration`: Inscrição estadual
- `municipalRegistration`: Inscrição municipal
- `foundedDate`: Data de fundação
- `legalNature`: Natureza jurídica
- `mainActivity`: Atividade principal

**Representante Legal (para PJ):**
- `legalRepName`: Nome do representante
- `legalRepDocument`: CPF do representante
- `legalRepRole`: Cargo do representante

**Contatos:**
- `email`: Email principal (único)
- `alternativeEmail`: Email alternativo
- `phone`: Telefone fixo
- `mobilePhone`: Celular
- `whatsapp`: WhatsApp

**Endereço Principal:**
- `street`: Logradouro
- `number`: Número
- `complement`: Complemento
- `neighborhood`: Bairro
- `city`: Cidade
- `state`: Estado
- `zipCode`: CEP
- `country`: País (padrão: Brasil)
- `addressType`: RESIDENCIAL, COMERCIAL, CORRESPONDENCIA

**Endereço de Correspondência:**
- `mailingStreet`, `mailingNumber`, `mailingComplement`
- `mailingNeighborhood`, `mailingCity`, `mailingState`
- `mailingZipCode`, `mailingCountry`

**Dados Bancários:**
- `bankName`: Nome do banco
- `bankCode`: Código do banco
- `agencyNumber`: Número da agência
- `agencyDigit`: Dígito da agência
- `accountNumber`: Número da conta
- `accountDigit`: Dígito da conta
- `accountType`: CORRENTE, POUPANCA, PAGAMENTO, INVESTIMENTO
- `pixKeyType`: CPF, CNPJ, EMAIL, TELEFONE, CHAVE_ALEATORIA
- `pixKey`: Chave PIX

**Informações Financeiras:**
- `monthlyIncome`: Renda mensal
- `patrimony`: Patrimônio
- `investorProfile`: CONSERVADOR, MODERADO, ARROJADO, AGRESSIVO
- `investmentGoal`: Objetivo de investimento

**Documentos:**
- `identityDocUrl`: URL do documento de identidade
- `cpfDocUrl`: URL do CPF
- `addressProofUrl`: URL do comprovante de endereço
- `incomeProofUrl`: URL do comprovante de renda
- `socialContractUrl`: URL do contrato social (PJ)
- `cnpjDocUrl`: URL do cartão CNPJ (PJ)
- `attachments`: Array de URLs de documentos adicionais

**Conformidade:**
- `termsAcceptedAt`: Data de aceite dos termos
- `privacyPolicyAcceptedAt`: Data de aceite da política de privacidade
- `lastContactDate`: Data do último contato

**Observações:**
- `notes`: Observações gerais
- `internalNotes`: Notas internas (uso administrativo)

### 2. **Projetos SCP (ScpProject)**
Projetos de investimento que recebem aportes dos investidores.

**Campos:**
- `name`: Nome do projeto
- `code`: Código único do projeto
- `description`: Descrição detalhada
- `totalValue`: Valor total do projeto
- `investedValue`: Valor já investido (calculado automaticamente)
- `distributedValue`: Valor já distribuído aos investidores (calculado)
- `startDate`, `endDate`: Período do projeto
- `status`: ATIVO, CONCLUIDO, CANCELADO, SUSPENSO
- `attachments`: URLs de documentos

### 3. **Aportes/Investimentos (Investment)**
Registro dos aportes de capital feitos pelos investidores nos projetos.

**Campos:**
- `projectId`, `investorId`: Relações
- `amount`: Valor do aporte
- `investmentDate`: Data do aporte
- `referenceNumber`, `documentNumber`: Números de referência
- `paymentMethod`: Forma de pagamento
- `status`: PENDENTE, CONFIRMADO, CANCELADO
- `attachments`: Comprovantes

**Regras:**
- Quando um aporte é CONFIRMADO, o `investedValue` do projeto é incrementado
- Ao cancelar ou deletar, o valor é decrementado

### 4. **Políticas de Distribuição (DistributionPolicy)**
Define o percentual de participação de cada investidor nos lucros do projeto.

**Campos:**
- `projectId`, `investorId`: Relações
- `percentage`: Percentual (0-100)
- `type`: PROPORCIONAL, FIXO, PERSONALIZADO
- `active`: Se a política está ativa
- `startDate`, `endDate`: Período de vigência

**Regras:**
- A soma dos percentuais ativos de um projeto não pode exceder 100%
- Cada investidor pode ter apenas uma política ativa por projeto

### 5. **Distribuições (Distribution)**
Registro das distribuições de lucros aos investidores.

**Campos:**
- `projectId`, `investorId`: Relações
- `amount`: Valor bruto
- `percentage`: Percentual aplicado
- `baseValue`: Valor base do cálculo
- `distributionDate`: Data da distribuição
- `competenceDate`: Período de referência
- `paymentDate`: Data do pagamento efetivo
- `status`: PENDENTE, PAGO, CANCELADO
- `irrf`: Imposto de renda retido
- `otherDeductions`: Outras deduções
- `netAmount`: Valor líquido (calculado automaticamente)
- `attachments`: Comprovantes

**Regras:**
- `netAmount` = `amount` - `irrf` - `otherDeductions`
- Quando status muda para PAGO, o `distributedValue` do projeto é incrementado
- Quando status muda de PAGO para outro, o valor é decrementado

## Endpoints API

> ⚠️ **IMPORTANTES - Headers Obrigatórios**
> 
> **1. Authorization:** Token JWT obtido no login
> ```
> Authorization: Bearer <seu-token>
> ```
> 
> **2. x-company-id:** ID da empresa que será acessada
> ```
> x-company-id: <uuid-da-empresa>
> ```
> 
> **3. NÃO ENVIE** o campo `companyId` no body das requisições
> - O `companyId` é extraído do header `x-company-id`
> - Tentar enviar `companyId` no body resultará em erro 400
> - Todos os dados são automaticamente filtrados pela empresa do header

### Investidores

#### `POST /scp/investors`
Cria novo investidor.

**Body Pessoa Física:**
```json
{
  "type": "PESSOA_FISICA",
  "fullName": "João Silva Santos",
  "cpf": "123.456.789-00",
  "rg": "12.345.678-9",
  "birthDate": "1990-05-15T00:00:00.000Z",
  "gender": "MASCULINO",
  "maritalStatus": "CASADO",
  "nationality": "Brasileira",
  "profession": "Engenheiro Civil",
  "motherName": "Maria Silva Santos",
  "email": "joao.silva@email.com",
  "alternativeEmail": "joao.santos@email.com",
  "mobilePhone": "(11) 98765-4321",
  "whatsapp": "(11) 98765-4321",
  "street": "Rua das Flores",
  "number": "123",
  "complement": "Apto 45",
  "neighborhood": "Jardim Paulista",
  "city": "São Paulo",
  "state": "SP",
  "zipCode": "01234-567",
  "country": "Brasil",
  "addressType": "RESIDENCIAL",
  "bankName": "Banco do Brasil",
  "bankCode": "001",
  "agencyNumber": "1234",
  "agencyDigit": "5",
  "accountNumber": "56789",
  "accountDigit": "0",
  "accountType": "CORRENTE",
  "pixKeyType": "CPF",
  "pixKey": "12345678900",
  "monthlyIncome": 15000.00,
  "patrimony": 500000.00,
  "investorProfile": "MODERADO",
  "investmentGoal": "Crescimento patrimonial de médio prazo",
  "investorCode": "INV-PF-001",
  "category": "Pessoa Física",
  "isAccreditedInvestor": false,
  "termsAcceptedAt": "2024-11-10T10:00:00.000Z",
  "privacyPolicyAcceptedAt": "2024-11-10T10:00:00.000Z",
  "status": "ATIVO",
  "active": true
}
```

**Body Pessoa Jurídica:**
```json
{
  "type": "PESSOA_JURIDICA",
  "companyName": "Tech Solutions Ltda",
  "tradeName": "Tech Solutions",
  "cnpj": "12.345.678/0001-90",
  "stateRegistration": "123.456.789.012",
  "municipalRegistration": "98765432",
  "foundedDate": "2015-03-20T00:00:00.000Z",
  "legalNature": "Sociedade Limitada",
  "mainActivity": "Desenvolvimento de Software",
  "legalRepName": "Carlos Alberto Santos",
  "legalRepDocument": "987.654.321-00",
  "legalRepRole": "Sócio-Administrador",
  "email": "contato@techsolutions.com.br",
  "alternativeEmail": "financeiro@techsolutions.com.br",
  "phone": "(11) 3456-7890",
  "mobilePhone": "(11) 98765-4321",
  "whatsapp": "(11) 98765-4321",
  "street": "Av. Paulista",
  "number": "1000",
  "complement": "Conjunto 505",
  "neighborhood": "Bela Vista",
  "city": "São Paulo",
  "state": "SP",
  "zipCode": "01310-100",
  "country": "Brasil",
  "addressType": "COMERCIAL",
  "bankName": "Itaú",
  "bankCode": "341",
  "agencyNumber": "5678",
  "accountNumber": "12345",
  "accountDigit": "6",
  "accountType": "CORRENTE",
  "pixKeyType": "CNPJ",
  "pixKey": "12345678000190",
  "investorProfile": "ARROJADO",
  "investmentGoal": "Expansão empresarial",
  "investorCode": "INV-PJ-001",
  "category": "Pessoa Jurídica",
  "isAccreditedInvestor": true,
  "termsAcceptedAt": "2024-11-10T10:00:00.000Z",
  "privacyPolicyAcceptedAt": "2024-11-10T10:00:00.000Z",
  "status": "ATIVO",
  "active": true
}
```

**Validações:**
- Se `type` = PESSOA_FISICA, `fullName` e `cpf` são obrigatórios
- Se `type` = PESSOA_JURIDICA, `companyName` e `cnpj` são obrigatórios
- CPF deve ser único por empresa
- CNPJ deve ser único por empresa
- Email deve ser único por empresa

#### `GET /scp/investors`
Lista investidores com paginação e filtros.

**Query Params:**
- `page`: Página (padrão: 1)
- `limit`: Itens por página (padrão: 10)
- `search`: Busca por fullName, companyName, cpf, cnpj, email, investorCode
- `type`: Filtra por PESSOA_FISICA ou PESSOA_JURIDICA
- `active`: Filtra por ativo (true/false)
- `status`: Filtra por status (ATIVO, INATIVO, SUSPENSO, BLOQUEADO)

**Resposta:**
```json
{
  "data": [
    {
      "id": "uuid",
      "type": "PESSOA_FISICA",
      "fullName": "João Silva Santos",
      "companyName": null,
      "cpf": "123.456.789-00",
      "cnpj": null,
      "email": "joao.silva@email.com",
      "mobilePhone": "(11) 98765-4321",
      "investorCode": "INV-PF-001",
      "status": "ATIVO",
      "active": true,
      "_count": {
        "investments": 5,
        "distributions": 12
      }
    },
    {
      "id": "uuid",
      "type": "PESSOA_JURIDICA",
      "fullName": null,
      "companyName": "Tech Solutions Ltda",
      "cpf": null,
      "cnpj": "12.345.678/0001-90",
      "email": "contato@techsolutions.com.br",
      "mobilePhone": "(11) 98765-4321",
      "investorCode": "INV-PJ-001",
      "status": "ATIVO",
      "active": true,
      "_count": {
        "investments": 3,
        "distributions": 8
      }
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

#### `GET /scp/investors/:id`
Busca investidor por ID com detalhes completos.

**Parâmetros:**
- `id`: UUID do investidor

**Resposta:**
```json
{
  "id": "uuid",
  "type": "PESSOA_FISICA",
  "fullName": "João Silva Santos",
  "cpf": "123.456.789-00",
  "rg": "12.345.678-9",
  "birthDate": "1990-05-15T00:00:00.000Z",
  "gender": "MASCULINO",
  "maritalStatus": "CASADO",
  "nationality": "Brasileira",
  "profession": "Engenheiro Civil",
  "motherName": "Maria Silva Santos",
  "fatherName": null,
  "email": "joao.silva@email.com",
  "alternativeEmail": "joao.santos@email.com",
  "phone": null,
  "mobilePhone": "(11) 98765-4321",
  "whatsapp": "(11) 98765-4321",
  "street": "Rua das Flores",
  "number": "123",
  "complement": "Apto 45",
  "neighborhood": "Jardim Paulista",
  "city": "São Paulo",
  "state": "SP",
  "zipCode": "01234-567",
  "country": "Brasil",
  "addressType": "RESIDENCIAL",
  "bankName": "Banco do Brasil",
  "bankCode": "001",
  "agencyNumber": "1234",
  "agencyDigit": "5",
  "accountNumber": "56789",
  "accountDigit": "0",
  "accountType": "CORRENTE",
  "pixKeyType": "CPF",
  "pixKey": "12345678900",
  "monthlyIncome": 15000.00,
  "patrimony": 500000.00,
  "investorProfile": "MODERADO",
  "investmentGoal": "Crescimento patrimonial de médio prazo",
  "investorCode": "INV-PF-001",
  "category": "Pessoa Física",
  "isAccreditedInvestor": false,
  "status": "ATIVO",
  "statusReason": null,
  "active": true,
  "notes": null,
  "internalNotes": null,
  "termsAcceptedAt": "2024-11-10T10:00:00.000Z",
  "privacyPolicyAcceptedAt": "2024-11-10T10:00:00.000Z",
  "lastContactDate": null,
  "companyId": "uuid",
  "createdAt": "2024-11-10T10:00:00.000Z",
  "updatedAt": "2024-11-10T10:00:00.000Z",
  "investments": [
    {
      "id": "uuid",
      "amount": 100000.00,
      "investmentDate": "2024-11-10T10:00:00.000Z",
      "status": "CONFIRMADO",
      "project": {
        "id": "uuid",
        "name": "Solar ABC",
        "code": "SOLAR-001"
      }
    }
  ],
  "distributions": [
    {
      "id": "uuid",
      "amount": 15000.00,
      "netAmount": 14250.00,
      "distributionDate": "2024-11-10T00:00:00.000Z",
      "status": "PAGO",
      "project": {
        "id": "uuid",
        "name": "Solar ABC",
        "code": "SOLAR-001"
      }
    }
  ],
  "distributionPolicies": [
    {
      "id": "uuid",
      "percentage": 30.00,
      "type": "PROPORCIONAL",
      "active": true,
      "project": {
        "id": "uuid",
        "name": "Solar ABC",
        "code": "SOLAR-001"
      }
    }
  ],
  "totals": {
    "invested": 100000.00,
    "distributed": 14250.00
  }
}
```

#### `PUT /scp/investors/:id`
Atualiza investidor.

**Parâmetros:**
- `id`: UUID do investidor

**Body:** (mesma estrutura do POST, todos os campos opcionais)
```json
{
  "status": "INATIVO",
  "statusReason": "Cliente solicitou",
  "active": false,
  "mobilePhone": "(11) 99999-9999",
  "notes": "Cliente deseja pausar investimentos"
}
```

**Validações:**
- Se alterar `cpf`, verifica se já não existe outro investidor com mesmo CPF
- Se alterar `cnpj`, verifica se já não existe outro investidor com mesmo CNPJ

**Resposta:** Retorna o investidor atualizado (mesma estrutura do POST)

**Erros:**
- `404 Not Found`: Investidor não encontrado
- `400 Bad Request`: CPF/CNPJ já existe na empresa

#### `DELETE /scp/investors/:id`
Exclui investidor permanentemente.

**Parâmetros:**
- `id`: UUID do investidor

**Validações:**
- Investidor NÃO pode ter aportes (investments)
- Investidor NÃO pode ter distribuições

**Resposta:**
```json
{
  "message": "Investidor excluído com sucesso"
}
```

**Erros:**
- `404 Not Found`: Investidor não encontrado
- `400 Bad Request`: Investidor possui aportes ou distribuições vinculados (não pode ser excluído)

**Recomendação:** Considere desativar (`active: false`) ao invés de excluir para manter histórico.

---

### Projetos

#### `POST /scp/projects`
Cria novo projeto.

**Body:**
```json
{
  "name": "Empreendimento Solar ABC",
  "code": "SOLAR-001",
  "description": "Projeto de energia solar fotovoltaica com capacidade de 5MW",
  "totalValue": 5000000.00,
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2025-12-31T23:59:59.999Z",
  "status": "ATIVO",
  "active": true,
  "attachments": ["https://example.com/docs/contrato.pdf"]
}
```

**Validações:**
- `code` deve ser único por empresa
- `totalValue` deve ser positivo

**Resposta:**
```json
{
  "id": "uuid",
  "companyId": "uuid",
  "name": "Empreendimento Solar ABC",
  "code": "SOLAR-001",
  "description": "Projeto de energia solar fotovoltaica com capacidade de 5MW",
  "totalValue": 5000000.00,
  "investedValue": 0.00,
  "distributedValue": 0.00,
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2025-12-31T23:59:59.999Z",
  "status": "ATIVO",
  "active": true,
  "notes": null,
  "attachments": ["https://example.com/docs/contrato.pdf"],
  "createdAt": "2024-11-10T10:00:00.000Z",
  "updatedAt": "2024-11-10T10:00:00.000Z"
}
```

**Erros:**
- `400 Bad Request`: Código do projeto já existe na empresa

#### `GET /scp/projects`
Lista projetos com paginação e filtros.

**Query Params:**
- `page`: Página (padrão: 1)
- `limit`: Itens por página (padrão: 10)
- `search`: Busca por nome, código ou descrição
- `status`: ATIVO, CONCLUIDO, CANCELADO, SUSPENSO
- `active`: true/false

**Resposta:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Empreendimento Solar ABC",
      "code": "SOLAR-001",
      "totalValue": 5000000.00,
      "investedValue": 3000000.00,
      "distributedValue": 450000.00,
      "status": "ATIVO",
      "active": true,
      "startDate": "2024-01-01T00:00:00.000Z",
      "_count": {
        "investments": 15,
        "distributions": 8,
        "distributionPolicies": 3
      }
    }
  ],
  "meta": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

#### `GET /scp/projects/stats`
Retorna estatísticas consolidadas de todos os projetos.

**Resposta:**
```json
{
  "projects": [
    {
      "projectId": "uuid",
      "projectName": "Solar ABC",
      "projectCode": "SOLAR-001",
      "totalValue": 5000000.00,
      "totalInvested": 3000000.00,
      "totalDistributed": 450000.00,
      "pendingDistributions": 50000.00,
      "availableBalance": 2500000.00,
      "roi": "15.00"
    }
  ],
  "summary": {
    "totalProjects": 10,
    "totalInvested": 15000000.00,
    "totalDistributed": 2250000.00,
    "totalPending": 250000.00,
    "totalAvailable": 12500000.00,
    "averageROI": "15.00"
  }
}
```

#### `GET /scp/projects/:id`
Busca projeto por ID com detalhes completos.

**Parâmetros:**
- `id`: UUID do projeto

**Resposta:**
```json
{
  "id": "uuid",
  "companyId": "uuid",
  "name": "Empreendimento Solar ABC",
  "code": "SOLAR-001",
  "description": "Projeto de energia solar fotovoltaica com capacidade de 5MW",
  "totalValue": 5000000.00,
  "investedValue": 3000000.00,
  "distributedValue": 450000.00,
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2025-12-31T23:59:59.999Z",
  "status": "ATIVO",
  "active": true,
  "notes": null,
  "attachments": ["/documents/uuid-doc-1", "/documents/uuid-doc-2"],
  "createdAt": "2024-11-10T10:00:00.000Z",
  "updatedAt": "2024-11-10T10:00:00.000Z",
  "investments": [
    {
      "id": "uuid",
      "amount": 100000.00,
      "status": "CONFIRMADO",
      "investmentDate": "2024-02-15T00:00:00.000Z",
      "investor": {
        "id": "uuid",
        "type": "PESSOA_FISICA",
        "fullName": "João Silva Santos",
        "cpf": "123.456.789-00"
      }
    }
  ],
  "distributions": [
    {
      "id": "uuid",
      "amount": 15000.00,
      "netAmount": 14250.00,
      "status": "PAGO",
      "distributionDate": "2024-11-10T00:00:00.000Z",
      "investor": {
        "id": "uuid",
        "type": "PESSOA_FISICA",
        "fullName": "João Silva Santos"
      }
    }
  ],
  "distributionPolicies": [
    {
      "id": "uuid",
      "percentage": 30.00,
      "type": "PROPORCIONAL",
      "active": true,
      "investor": {
        "id": "uuid",
        "type": "PESSOA_FISICA",
        "fullName": "João Silva Santos"
      }
    }
  ],
  "documents": [
    {
      "id": "uuid-doc-1",
      "name": "Contrato de Investimento",
      "fileName": "contrato-investimento.pdf",
      "fileSize": 524288,
      "mimeType": "application/pdf",
      "fileExtension": ".pdf",
      "reference": "SCP-SOLAR-001",
      "documentType": "Contratos",
      "tags": ["SCP", "Projeto", "SOLAR-001", "Contratos"],
      "isPublic": false,
      "createdAt": "2024-11-10T10:00:00.000Z",
      "folder": {
        "id": "uuid-folder",
        "name": "SOLAR-001 - Empreendimento Solar ABC"
      },
      "uploadedBy": {
        "id": "uuid-user",
        "name": "Admin User",
        "email": "admin@example.com"
      }
    },
    {
      "id": "uuid-doc-2",
      "name": "Estudo de Viabilidade",
      "fileName": "estudo-viabilidade.pdf",
      "fileSize": 1048576,
      "mimeType": "application/pdf",
      "fileExtension": ".pdf",
      "reference": "SCP-SOLAR-001",
      "documentType": "Estudos e Análises",
      "tags": ["SCP", "Projeto", "SOLAR-001", "Estudos e Análises"],
      "isPublic": false,
      "createdAt": "2024-11-10T11:30:00.000Z",
      "folder": {
        "id": "uuid-folder-2",
        "name": "Estudos e Análises"
      },
      "uploadedBy": {
        "id": "uuid-user",
        "name": "Admin User",
        "email": "admin@example.com"
      }
    }
  ],
  "totals": {
    "totalInvested": 3000000.00,
    "totalDistributed": 450000.00,
    "pendingDistributions": 50000.00,
    "availableBalance": 2500000.00
  }
}
```

**Erros:**
- `404 Not Found`: Projeto não encontrado

#### `PUT /scp/projects/:id`
Atualiza projeto.

**Parâmetros:**
- `id`: UUID do projeto

**Body:** (campos opcionais)
```json
{
  "status": "CONCLUIDO",
  "endDate": "2024-12-31T23:59:59.999Z",
  "notes": "Projeto finalizado com sucesso"
}
```

**Resposta:** Retorna o projeto atualizado (mesma estrutura do GET)

#### `DELETE /scp/projects/:id`
Exclui projeto permanentemente.

**Parâmetros:**
- `id`: UUID do projeto

**Validações:**
- Projeto NÃO pode ter aportes (investments)
- Projeto NÃO pode ter distribuições

**Resposta:**
```json
{
  "message": "Projeto excluído com sucesso"
}
```

**Erros:**
- `404 Not Found`: Projeto não encontrado
- `400 Bad Request`: Projeto possui aportes ou distribuições vinculados

**Recomendação:** Considere desativar (`active: false`) ao invés de excluir.

---

### Aportes/Investimentos

#### `POST /scp/investments`
Registra novo aporte.

**Body:**
```json
{
  "projectId": "uuid",
  "investorId": "uuid",
  "amount": 100000.00,
  "investmentDate": "2024-11-10T10:00:00.000Z",
  "paymentMethod": "TRANSFERENCIA",
  "status": "CONFIRMADO",
  "referenceNumber": "AP-2024-001"
}
```

**Validações:**
- Projeto e investidor devem existir
- Projeto e investidor devem pertencer à mesma empresa

**Efeito:**
- Se status = CONFIRMADO, incrementa `investedValue` do projeto

#### `GET /scp/investments`
Lista aportes com paginação e filtros.

**Query Params:**
- `page`, `limit`: Paginação
- `projectId`: Filtra por projeto
- `investorId`: Filtra por investidor
- `status`: PENDENTE, CONFIRMADO, CANCELADO

#### `GET /scp/investments/by-investor/:investorId`
Lista todos os aportes de um investidor com totais.

**Parâmetros:**
- `investorId`: UUID do investidor

**Resposta:**
```json
{
  "investor": {
    "id": "uuid",
    "type": "PESSOA_FISICA",
    "name": "João Silva Santos",
    "document": "123.456.789-00"
  },
  "investments": [
    {
      "id": "uuid",
      "projectId": "uuid",
      "investorId": "uuid",
      "amount": 100000.00,
      "investmentDate": "2024-11-10T10:00:00.000Z",
      "referenceNumber": "AP-2024-001",
      "documentNumber": null,
      "paymentMethod": "TRANSFERENCIA",
      "status": "CONFIRMADO",
      "notes": null,
      "attachments": [],
      "companyId": "uuid",
      "createdAt": "2024-11-10T10:00:00.000Z",
      "updatedAt": "2024-11-10T10:00:00.000Z",
      "project": {
        "id": "uuid",
        "name": "Solar ABC",
        "code": "SOLAR-001"
      }
    }
  ],
  "summary": {
    "totalConfirmed": 500000.00,
    "totalPending": 50000.00
  }
}
```

#### `GET /scp/investments/by-project/:projectId`
Lista todos os aportes de um projeto com totais.

**Parâmetros:**
- `projectId`: UUID do projeto

**Resposta:** (mesma estrutura do by-investor, mas agrupado por projeto)
```json
{
  "project": {
    "id": "uuid",
    "name": "Solar ABC",
    "code": "SOLAR-001"
  },
  "investments": [...],
  "summary": {
    "totalConfirmed": 3000000.00,
    "totalPending": 200000.00
  }
}
```

#### `GET /scp/investments/:id`
Busca aporte por ID.

**Parâmetros:**
- `id`: UUID do aporte

**Resposta:**
```json
{
  "id": "uuid",
  "projectId": "uuid",
  "investorId": "uuid",
  "amount": 100000.00,
  "investmentDate": "2024-11-10T10:00:00.000Z",
  "referenceNumber": "AP-2024-001",
  "documentNumber": null,
  "paymentMethod": "TRANSFERENCIA",
  "status": "CONFIRMADO",
  "notes": null,
  "attachments": [],
  "companyId": "uuid",
  "createdAt": "2024-11-10T10:00:00.000Z",
  "updatedAt": "2024-11-10T10:00:00.000Z",
  "project": {
    "id": "uuid",
    "name": "Solar ABC",
    "code": "SOLAR-001",
    "totalValue": 5000000.00
  },
  "investor": {
    "id": "uuid",
    "type": "PESSOA_FISICA",
    "fullName": "João Silva Santos",
    "cpf": "123.456.789-00"
  }
}
```

#### `PUT /scp/investments/:id`
Atualiza aporte.

**Parâmetros:**
- `id`: UUID do aporte

**Body:** (campos opcionais)
```json
{
  "amount": 150000.00,
  "status": "CONFIRMADO",
  "notes": "Valor atualizado conforme comprovante"
}
```

**Importante:** 
- Se `status` ou `amount` mudarem, o `investedValue` do projeto é recalculado automaticamente
- Status CONFIRMADO incrementa o valor investido no projeto
- Status CANCELADO ou PENDENTE decrementam

**Resposta:** Retorna o aporte atualizado

#### `DELETE /scp/investments/:id`
Exclui aporte e ajusta automaticamente o `investedValue` do projeto.

**Parâmetros:**
- `id`: UUID do aporte

**Resposta:**
```json
{
  "message": "Aporte excluído com sucesso"
}
```

**Efeito:** Se o aporte estava CONFIRMADO, o valor é decrementado do `investedValue` do projeto.

---

### Políticas de Distribuição

#### `POST /scp/distribution-policies`
Cria política de distribuição.

**Body:**
```json
{
  "projectId": "uuid",
  "investorId": "uuid",
  "percentage": 30.00,
  "type": "PROPORCIONAL",
  "active": true,
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": null
}
```

**Validações:**
- Projeto e investidor devem existir e pertencer à mesma empresa
- Investidor não pode ter outra política ativa no mesmo projeto
- Soma dos percentuais ativos do projeto não pode exceder 100%
- `percentage` deve estar entre 0 e 100

**Resposta:**
```json
{
  "id": "uuid",
  "companyId": "uuid",
  "projectId": "uuid",
  "investorId": "uuid",
  "percentage": 30.00,
  "type": "PROPORCIONAL",
  "active": true,
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": null,
  "notes": null,
  "createdAt": "2024-11-10T10:00:00.000Z",
  "updatedAt": "2024-11-10T10:00:00.000Z"
}
```

**Erros:**
- `404 Not Found`: Projeto ou investidor não encontrado
- `400 Bad Request`: 
  - Investidor já tem política ativa neste projeto
  - Soma dos percentuais excede 100%
  - Percentual inválido

#### `GET /scp/distribution-policies`
Lista políticas com filtros.

**Query Params:**
- `page`: Página (padrão: 1)
- `limit`: Itens por página (padrão: 10)
- `projectId`: UUID do projeto (opcional)
- `investorId`: UUID do investidor (opcional)
- `active`: true/false (opcional)

**Resposta:**
```json
{
  "data": [
    {
      "id": "uuid",
      "percentage": 30.00,
      "type": "PROPORCIONAL",
      "active": true,
      "startDate": "2024-01-01T00:00:00.000Z",
      "project": {
        "id": "uuid",
        "name": "Solar ABC",
        "code": "SOLAR-001"
      },
      "investor": {
        "id": "uuid",
        "type": "PESSOA_FISICA",
        "fullName": "João Silva Santos",
        "cpf": "123.456.789-00"
      }
    }
  ],
  "meta": {
    "total": 12,
    "page": 1,
    "limit": 10,
    "totalPages": 2
  }
}
```

#### `GET /scp/distribution-policies/by-project/:projectId`
Lista políticas ativas de um projeto com resumo.

**Parâmetros:**
- `projectId`: UUID do projeto

**Resposta:**
```json
{
  "project": {
    "id": "uuid",
    "name": "Solar ABC",
    "code": "SOLAR-001"
  },
  "policies": [
    {
      "id": "uuid",
      "percentage": 40.00,
      "type": "PROPORCIONAL",
      "active": true,
      "investor": {
        "id": "uuid",
        "type": "PESSOA_FISICA",
        "fullName": "João Silva Santos",
        "cpf": "123.456.789-00"
      }
    },
    {
      "id": "uuid",
      "percentage": 35.00,
      "type": "PROPORCIONAL",
      "active": true,
      "investor": {
        "id": "uuid",
        "type": "PESSOA_JURIDICA",
        "companyName": "Tech Solutions Ltda",
        "cnpj": "12.345.678/0001-90"
      }
    },
    {
      "id": "uuid",
      "percentage": 25.00,
      "type": "PROPORCIONAL",
      "active": true,
      "investor": {
        "id": "uuid",
        "type": "PESSOA_FISICA",
        "fullName": "Maria Santos",
        "cpf": "987.654.321-00"
      }
    }
  ],
  "summary": {
    "totalPolicies": 3,
    "totalPercentage": 100.00,
    "remainingPercentage": 0.00,
    "isComplete": true
  }
}
```

**Erros:**
- `404 Not Found`: Projeto não encontrado

#### `POST /scp/distribution-policies/calculate-amounts/:projectId`
Calcula valores de distribuição (preview) com base nas políticas ativas.

**Parâmetros:**
- `projectId`: UUID do projeto

**Body:**
```json
{
  "baseValue": 50000.00
}
```

**Validações:**
- Deve haver políticas ativas no projeto
- Soma dos percentuais das políticas ativas deve ser 100%

**Resposta:**
```json
[
  {
    "policyId": "uuid",
    "investorId": "uuid",
    "investorName": "João Silva Santos",
    "percentage": 40.00,
    "amount": 20000.00
  },
  {
    "policyId": "uuid",
    "investorId": "uuid",
    "investorName": "Tech Solutions Ltda",
    "percentage": 35.00,
    "amount": 17500.00
  },
  {
    "policyId": "uuid",
    "investorId": "uuid",
    "investorName": "Maria Santos",
    "percentage": 25.00,
    "amount": 12500.00
  }
]
```

**Uso:** Use este endpoint para preview antes de criar distribuições com `bulk-create`

**Erros:**
- `404 Not Found`: Projeto não encontrado
- `400 Bad Request`: 
  - Não há políticas ativas
  - Soma dos percentuais ≠ 100%

#### `GET /scp/distribution-policies/:id`
Busca política por ID.

**Parâmetros:**
- `id`: UUID da política

**Resposta:**
```json
{
  "id": "uuid",
  "companyId": "uuid",
  "projectId": "uuid",
  "investorId": "uuid",
  "percentage": 30.00,
  "type": "PROPORCIONAL",
  "active": true,
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": null,
  "notes": null,
  "createdAt": "2024-11-10T10:00:00.000Z",
  "updatedAt": "2024-11-10T10:00:00.000Z",
  "project": {
    "id": "uuid",
    "name": "Solar ABC",
    "code": "SOLAR-001"
  },
  "investor": {
    "id": "uuid",
    "type": "PESSOA_FISICA",
    "fullName": "João Silva Santos",
    "cpf": "123.456.789-00"
  }
}
```

#### `PUT /scp/distribution-policies/:id`
Atualiza política.

**Parâmetros:**
- `id`: UUID da política

**Body:** (campos opcionais)
```json
{
  "percentage": 35.00,
  "active": false,
  "endDate": "2024-12-31T23:59:59.999Z",
  "notes": "Política ajustada conforme novo acordo"
}
```

**Validação:** 
- Se `percentage` mudar, valida que soma total do projeto não excede 100%

**Resposta:** Retorna a política atualizada (mesma estrutura do GET)

#### `DELETE /scp/distribution-policies/:id`
Exclui política permanentemente.

**Parâmetros:**
- `id`: UUID da política

**Resposta:**
```json
{
  "message": "Política de distribuição excluída com sucesso"
}
```

**Recomendação:** Considere desativar (`active: false`) ao invés de excluir para manter histórico.

---

### Distribuições

#### `POST /scp/distributions`
Cria distribuição manual para um único investidor.

**Body:**
```json
{
  "projectId": "uuid",
  "investorId": "uuid",
  "amount": 15000.00,
  "percentage": 30.00,
  "baseValue": 50000.00,
  "distributionDate": "2024-11-10T00:00:00.000Z",
  "competenceDate": "2024-10-31T23:59:59.999Z",
  "status": "PENDENTE",
  "irrf": 750.00,
  "otherDeductions": 0,
  "notes": "Distribuição de lucros do mês 10/2024"
}
```

**Cálculo automático:**
- `netAmount` = `amount` - `irrf` - `otherDeductions`
- Neste exemplo: 15000 - 750 - 0 = 14250

**Efeito:**
- Se `status` = PAGO, incrementa `distributedValue` do projeto

**Resposta:**

---

#### `POST /scp/distributions/bulk`
Cria distribuições para múltiplos investidores de uma vez. Útil para processar uma rodada de distribuição completa com um único request.

**Body:**
```json
{
  "projectId": "uuid",
  "baseValue": 100000.00,
  "referenceNumber": "DIST-2024-001",
  "distributionDate": "2024-11-10T00:00:00.000Z",
  "competenceDate": "2024-10-31T23:59:59.999Z",
  "paymentMethod": "TED",
  "paymentDate": "2024-11-10T00:00:00.000Z",
  "status": "PAGO",
  "attachments": ["comprovante-1.pdf", "comprovante-2.pdf"],
  "distributions": [
    {
      "investorId": "uuid-investor-1",
      "amount": 40000.00,
      "percentage": 40.0,
      "irrf": 6000.00,
      "otherDeductions": 0,
      "notes": "Maior participação"
    },
    {
      "investorId": "uuid-investor-2",
      "amount": 30000.00,
      "percentage": 30.0,
      "irrf": 4500.00,
      "otherDeductions": 0,
      "notes": "Participação média"
    },
    {
      "investorId": "uuid-investor-3",
      "amount": 30000.00,
      "percentage": 30.0,
      "irrf": 4500.00,
      "otherDeductions": 0,
      "notes": "Participação média"
    }
  ]
}
```

**Campos Compartilhados (aplicam a todas as distribuições):**
- `projectId`: ID do projeto (obrigatório)
- `baseValue`: Valor base da distribuição (obrigatório)
- `referenceNumber`: Número de referência (opcional)
- `distributionDate`: Data da distribuição (obrigatório)
- `competenceDate`: Data de competência (obrigatório)
- `paymentMethod`: Método de pagamento - "TED", "PIX", "DOC", "DINHEIRO", "CHEQUE" (opcional)
- `paymentDate`: Data do pagamento (opcional)
- `status`: Status - "PENDENTE", "PAGO", "CANCELADO" (opcional, padrão: "PENDENTE")
- `attachments`: Array de nomes de arquivos anexados (opcional)

**Campos Individuais (por investidor):**
- `investorId`: ID do investidor (obrigatório)
- `amount`: Valor bruto da distribuição (obrigatório)
- `percentage`: Percentual da distribuição (obrigatório)
- `irrf`: Valor do IRRF (opcional)
- `otherDeductions`: Outras deduções (opcional)
- `notes`: Observações específicas (opcional)

**Validações:**
- Verifica se o projeto existe
- Verifica se todos os investidores existem
- Calcula automaticamente `netAmount` para cada distribuição
- Executa todas as criações em uma transação (rollback em caso de erro)

**Cálculo automático (para cada distribuição):**
- `netAmount` = `amount` - `irrf` - `otherDeductions`

**Efeito:**
- Se `status` = PAGO, incrementa `distributedValue` do projeto com a soma de todas as distribuições
- Define `paidAt` automaticamente se status for PAGO

**Resposta:**
```json
{
  "message": "3 distribuições criadas com sucesso",
  "count": 3,
  "distributions": [
    {
      "id": "uuid",
      "projectId": "uuid",
      "investorId": "uuid-investor-1",
      "amount": 40000.00,
      "percentage": 40.0,
      "baseValue": 100000.00,
      "netAmount": 34000.00,
      "irrf": 6000.00,
      "otherDeductions": 0,
      "status": "PAGO",
      "distributionDate": "2024-11-10T00:00:00.000Z",
      "competenceDate": "2024-10-31T23:59:59.999Z",
      "paymentMethod": "TED",
      "paymentDate": "2024-11-10T00:00:00.000Z",
      "paidAt": "2024-11-10T14:30:00.000Z",
      "notes": "Maior participação",
      "attachments": ["comprovante-1.pdf", "comprovante-2.pdf"],
      "project": { ... },
      "investor": { ... },
      "createdAt": "2024-11-10T14:30:00.000Z",
      "updatedAt": "2024-11-10T14:30:00.000Z"
    },
    // ... mais 2 distribuições
  ]
}
```

**Casos de Uso:**
1. **Distribuição trimestral completa**: Criar todas as distribuições de uma vez com status PENDENTE, depois atualizar individualmente quando pagas
2. **Pagamento imediato**: Criar com status PAGO quando o pagamento já foi efetuado
3. **Valores proporcionais**: Distribuir lucros proporcionalmente à participação de cada investidor
4. **Auditoria**: Usar `referenceNumber` e `attachments` para vincular comprovantes

**Exemplo de Erro (investidor não encontrado):**
```json
{
  "statusCode": 404,
  "message": "Um ou mais investidores não encontrados",
  "error": "Not Found"
}
```

**Resposta:**
```json
{
  "id": "uuid",
  "projectId": "uuid",
  "investorId": "uuid",
  "amount": 15000.00,
  "percentage": 30.00,
  "baseValue": 50000.00,
  "distributionDate": "2024-11-10T00:00:00.000Z",
  "competenceDate": "2024-10-31T23:59:59.999Z",
  "paymentDate": null,
  "status": "PENDENTE",
  "irrf": 750.00,
  "otherDeductions": 0.00,
  "netAmount": 14250.00,
  "notes": "Distribuição de lucros do mês 10/2024",
  "attachments": [],
  "paidAt": null,
  "companyId": "uuid",
  "createdAt": "2024-11-10T10:00:00.000Z",
  "updatedAt": "2024-11-10T10:00:00.000Z"
}
```

#### `POST /scp/distributions/bulk-create`
Cria distribuições automaticamente com base nas políticas ativas.

**Body:**
```json
{
  "projectId": "uuid",
  "baseValue": 50000.00,
  "competenceDate": "2024-10-31T23:59:59.999Z",
  "distributionDate": "2024-11-10T00:00:00.000Z"
}
```

**Validações:**
- Deve haver políticas ativas no projeto
- Soma dos percentuais das políticas ativas deve ser 100%

**Resultado:**
Cria uma distribuição para cada política ativa, calculando o valor proporcionalmente.

**Resposta:**
```json
{
  "message": "3 distribuições criadas com sucesso",
  "distributions": [
    {
      "id": "uuid-1",
      "investorId": "uuid-inv-1",
      "amount": 20000.00,
      "percentage": 40.00,
      "netAmount": 20000.00,
      "status": "PENDENTE"
    },
    {
      "id": "uuid-2",
      "investorId": "uuid-inv-2",
      "amount": 17500.00,
      "percentage": 35.00,
      "netAmount": 17500.00,
      "status": "PENDENTE"
    },
    {
      "id": "uuid-3",
      "investorId": "uuid-inv-3",
      "amount": 12500.00,
      "percentage": 25.00,
      "netAmount": 12500.00,
      "status": "PENDENTE"
    }
  ]
}
```

**Erros:**
- `404 Not Found`: Projeto não encontrado
- `400 Bad Request`: Não há políticas ativas ou soma dos percentuais ≠ 100%

#### `GET /scp/distributions`
Lista distribuições com filtros.

**Query Params:**
- `page`: Página (padrão: 1)
- `limit`: Itens por página (padrão: 10)
- `projectId`: UUID do projeto (opcional)
- `investorId`: UUID do investidor (opcional)
- `status`: PENDENTE, PAGO, CANCELADO (opcional)

**Resposta:**
```json
{
  "data": [
    {
      "id": "uuid",
      "projectId": "uuid",
      "investorId": "uuid",
      "amount": 15000.00,
      "percentage": 30.00,
      "baseValue": 50000.00,
      "netAmount": 14250.00,
      "irrf": 750.00,
      "otherDeductions": 0.00,
      "distributionDate": "2024-11-10T00:00:00.000Z",
      "competenceDate": "2024-10-31T23:59:59.999Z",
      "paymentDate": "2024-11-15T10:30:00.000Z",
      "status": "PAGO",
      "paidAt": "2024-11-15T10:30:00.000Z",
      "project": {
        "id": "uuid",
        "name": "Solar ABC",
        "code": "SOLAR-001"
      },
      "investor": {
        "id": "uuid",
        "type": "PESSOA_FISICA",
        "fullName": "João Silva Santos",
        "cpf": "123.456.789-00"
      }
    }
  ],
  "meta": {
    "total": 45,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

#### `GET /scp/distributions/by-investor/:investorId`
Lista distribuições de um investidor com totais.

**Parâmetros:**
- `investorId`: UUID do investidor

**Resposta:**
```json
{
  "investor": {
    "id": "uuid",
    "type": "PESSOA_FISICA",
    "name": "João Silva Santos",
    "document": "123.456.789-00"
  },
  "distributions": [
    {
      "id": "uuid",
      "amount": 15000.00,
      "netAmount": 14250.00,
      "status": "PAGO",
      "distributionDate": "2024-11-10T00:00:00.000Z",
      "project": {
        "id": "uuid",
        "name": "Solar ABC",
        "code": "SOLAR-001"
      }
    }
  ],
  "summary": {
    "totalPaid": 142500.00,
    "totalPending": 15000.00
  }
}
```

#### `GET /scp/distributions/by-project/:projectId`
Lista distribuições de um projeto com totais.

**Parâmetros:**
- `projectId`: UUID do projeto

**Resposta:** (mesma estrutura do by-investor, mas agrupado por projeto)
```json
{
  "project": {
    "id": "uuid",
    "name": "Solar ABC",
    "code": "SOLAR-001"
  },
  "distributions": [...],
  "summary": {
    "totalPaid": 450000.00,
    "totalPending": 50000.00
  }
}
```

#### `GET /scp/distributions/:id`
Busca distribuição por ID.

**Parâmetros:**
- `id`: UUID da distribuição

**Resposta:**
```json
{
  "id": "uuid",
  "projectId": "uuid",
  "investorId": "uuid",
  "amount": 15000.00,
  "percentage": 30.00,
  "baseValue": 50000.00,
  "netAmount": 14250.00,
  "irrf": 750.00,
  "otherDeductions": 0.00,
  "distributionDate": "2024-11-10T00:00:00.000Z",
  "competenceDate": "2024-10-31T23:59:59.999Z",
  "paymentDate": "2024-11-15T10:30:00.000Z",
  "status": "PAGO",
  "notes": null,
  "attachments": [],
  "paidAt": "2024-11-15T10:30:00.000Z",
  "companyId": "uuid",
  "createdAt": "2024-11-10T10:00:00.000Z",
  "updatedAt": "2024-11-15T10:30:00.000Z",
  "project": {
    "id": "uuid",
    "name": "Solar ABC",
    "code": "SOLAR-001",
    "totalValue": 5000000.00
  },
  "investor": {
    "id": "uuid",
    "type": "PESSOA_FISICA",
    "fullName": "João Silva Santos",
    "cpf": "123.456.789-00",
    "email": "joao.silva@email.com"
  }
}
```

#### `POST /scp/distributions/:id/mark-as-paid`
Marca distribuição como PAGA.

**Parâmetros:**
- `id`: UUID da distribuição

**Body:** Não requer

**Efeito:**
- Atualiza `status` para PAGO
- Define `paidAt` para data/hora atual
- Incrementa `distributedValue` do projeto com o valor de `netAmount`

**Resposta:**
```json
{
  "id": "uuid",
  "status": "PAGO",
  "paidAt": "2024-11-15T10:30:00.000Z",
  "amount": 15000.00,
  "netAmount": 14250.00,
  "irrf": 750.00,
  "otherDeductions": 0.00
}
```

**Erros:**
- `404 Not Found`: Distribuição não encontrada
- `400 Bad Request`: Distribuição já está paga

#### `POST /scp/distributions/:id/mark-as-canceled`
Marca distribuição como CANCELADA.

**Parâmetros:**
- `id`: UUID da distribuição

**Body:** Não requer

**Efeito:**
- Atualiza `status` para CANCELADO
- Se estava PAGA, decrementa `distributedValue` do projeto

**Resposta:**
```json
{
  "id": "uuid",
  "status": "CANCELADO",
  "amount": 15000.00,
  "netAmount": 14250.00
}
```

**Erros:**
- `404 Not Found`: Distribuição não encontrada

#### `PUT /scp/distributions/:id`
Atualiza distribuição.

**Parâmetros:**
- `id`: UUID da distribuição

**Body:** (campos opcionais)
```json
{
  "amount": 16000.00,
  "irrf": 800.00,
  "otherDeductions": 100.00,
  "notes": "Valor ajustado conforme contrato"
}
```

**Importante:** 
- Recalcula automaticamente `netAmount` se `amount`, `irrf` ou `otherDeductions` mudarem
- Se `status` mudar de/para PAGO, ajusta `distributedValue` do projeto

**Resposta:** Retorna a distribuição atualizada (mesma estrutura do GET)

#### `DELETE /scp/distributions/:id`
Exclui distribuição e ajusta `distributedValue` do projeto.

**Parâmetros:**
- `id`: UUID da distribuição

**Efeito:** 
- Se estava PAGA, decrementa o valor do `distributedValue` do projeto

**Resposta:**
```json
{
  "message": "Distribuição excluída com sucesso"
}
```

**Erros:**
- `404 Not Found`: Distribuição não encontrada

---

## Fluxo de Trabalho Típico

### 1. Configuração Inicial
```
1. Cadastrar investidores
2. Criar projetos
3. Definir políticas de distribuição (percentuais)
4. Verificar que políticas totalizam 100%
```

### 2. Aportes de Capital
```
1. Registrar aportes dos investidores
2. Confirmar status dos aportes
3. Sistema atualiza automaticamente investedValue do projeto
```

### 3. Distribuição de Lucros
```
Opção A - Manual:
1. Criar distribuições manualmente para cada investidor
2. Definir valores, datas, deduções

Opção B - Automática (Recomendada):
1. Usar bulk-create com valor base
2. Sistema calcula distribuições conforme políticas
3. Todas criadas com status PENDENTE
```

### 4. Pagamento
```
1. Revisar distribuições pendentes
2. Marcar como PAGA quando efetuar pagamento
3. Sistema atualiza distributedValue do projeto
```

## Regras de Negócio

### Validações de Integridade
- Investidores e projetos devem pertencer à mesma empresa
- CPF é único por empresa (para Pessoa Física)
- CNPJ é único por empresa (para Pessoa Jurídica)
- Email é único por empresa
- Código do investidor é único por empresa (se fornecido)
- Código de projeto é único por empresa

### Cálculos Automáticos
- `investedValue` do projeto = soma dos aportes CONFIRMADOS
- `distributedValue` do projeto = soma das distribuições PAGAS
- `netAmount` da distribuição = amount - irrf - otherDeductions

### Restrições de Exclusão
- Investidor com aportes ou distribuições não pode ser excluído
- Projeto com aportes ou distribuições não pode ser excluído
- Considerar desativação ao invés de exclusão

### Políticas de Distribuição
- Percentual mínimo: 0
- Percentual máximo: 100
- Soma total por projeto: máximo 100%

---

## 6. Documentos de Projetos

O sistema permite upload, listagem, download e exclusão de documentos vinculados a projetos SCP. Os documentos são integrados ao hub de documentos da empresa e organizados em uma estrutura de pastas específica.

### 6.1. Upload de Documento

**Endpoint:** `POST /scp/projects/documents/upload`

**Descrição:** Faz upload de um documento para um projeto SCP. O documento é automaticamente organizado na estrutura de pastas `SCP > Projetos > [Código - Nome do Projeto] > [Categoria]`.

**Headers:**
```http
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Permissões Necessárias:**
- Usuário deve ter permissão para os recursos: `investidores`, `scp`, `projetos_scp` ou `documents`
- Ou ter role de `Admin`/`Administrador`

**Body (multipart/form-data):**
```
file: <arquivo>
projectId: uuid
name: Nome do Documento
description: Descrição detalhada (opcional)
category: CONTRATO | ESTATUTO | ATA | RELATORIO | COMPROVANTE | LICENCA | ALVARA | PROJETO_TECNICO | PLANILHA | OUTRO
tags: tag1,tag2,tag3 (opcional, separadas por vírgula)
```

**Categorias Disponíveis:**
- `CONTRATO` - Contratos diversos
- `ESTATUTO` - Estatutos sociais
- `ATA` - Atas de reuniões
- `RELATORIO` - Relatórios diversos
- `COMPROVANTE` - Comprovantes de pagamento
- `LICENCA` - Licenças necessárias
- `ALVARA` - Alvarás e autorizações
- `PROJETO_TECNICO` - Projetos técnicos
- `PLANILHA` - Planilhas financeiras
- `OUTRO` - Outros documentos

**Estrutura de Pastas Criada:**
```
SCP
└── Projetos
    └── SOLAR-001 - Usina Solar ABC
        ├── CONTRATO
        ├── ESTATUTO
        ├── ATA
        ├── RELATORIO
        └── ... (outras categorias conforme necessário)
```

**Exemplo com cURL:**
```bash
curl -X POST http://localhost:3000/scp/projects/documents/upload \
  -H "Authorization: Bearer SEU_TOKEN" \
  -F "file=@/path/to/contrato.pdf" \
  -F "projectId=550e8400-e29b-41d4-a716-446655440000" \
  -F "name=Contrato de Investimento" \
  -F "description=Contrato entre SCP e investidores" \
  -F "category=CONTRATO" \
  -F "tags=investimento,contrato,2024"
```

**Exemplo com JavaScript/Axios:**
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('projectId', '550e8400-e29b-41d4-a716-446655440000');
formData.append('name', 'Contrato de Investimento');
formData.append('description', 'Contrato entre SCP e investidores');
formData.append('category', 'CONTRATO');
formData.append('tags', 'investimento,contrato,2024');

const response = await axios.post('/scp/projects/documents/upload', formData, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'multipart/form-data'
  }
});
```

**Resposta de Sucesso (201):**
```json
{
  "id": "doc-uuid",
  "name": "Contrato de Investimento",
  "description": "Contrato entre SCP e investidores",
  "fileName": "1234567890-contrato.pdf",
  "filePath": "/uploads/company-id/documents/...",
  "fileSize": 245678,
  "mimeType": "application/pdf",
  "folderId": "folder-uuid",
  "tags": ["SCP", "Projeto", "SOLAR-001", "CONTRATO", "investimento", "contrato", "2024"],
  "reference": "SCP-SOLAR-001",
  "documentType": "CONTRATO",
  "companyId": "company-uuid",
  "uploadedById": "user-uuid",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Erros Possíveis:**
```json
// 400 - Arquivo não enviado
{
  "statusCode": 400,
  "message": "Arquivo é obrigatório",
  "error": "Bad Request"
}

// 404 - Projeto não encontrado
{
  "statusCode": 404,
  "message": "Projeto não encontrado",
  "error": "Not Found"
}

// 403 - Sem permissão
{
  "statusCode": 403,
  "message": "Usuário não tem permissões para acessar documentos de projetos SCP",
  "error": "Forbidden"
}
```

---

### 6.2. Listar Documentos do Projeto

**Endpoint:** `GET /scp/projects/documents/project/:projectId`

**Descrição:** Lista todos os documentos de um projeto específico com paginação.

**Headers:**
```http
Authorization: Bearer <token>
Content-Type: application/json
```

**Parâmetros de Rota:**
- `projectId` (uuid, obrigatório) - ID do projeto

**Query Parameters:**
- `page` (number, opcional, padrão: 1) - Página atual
- `limit` (number, opcional, padrão: 10) - Itens por página

**Exemplo de Requisição:**
```http
GET /scp/projects/documents/project/550e8400-e29b-41d4-a716-446655440000?page=1&limit=10
Authorization: Bearer SEU_TOKEN
```

**Resposta de Sucesso (200):**
```json
{
  "data": [
    {
      "id": "doc-uuid-1",
      "name": "Contrato de Investimento",
      "description": "Contrato entre SCP e investidores",
      "fileName": "1234567890-contrato.pdf",
      "filePath": "/uploads/company-id/documents/...",
      "fileSize": 245678,
      "mimeType": "application/pdf",
      "folderId": "folder-uuid",
      "tags": ["SCP", "Projeto", "SOLAR-001", "CONTRATO"],
      "reference": "SCP-SOLAR-001",
      "documentType": "CONTRATO",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "folder": {
        "id": "folder-uuid",
        "name": "CONTRATO"
      },
      "uploadedBy": {
        "id": "user-uuid",
        "name": "João Silva",
        "email": "joao@empresa.com"
      },
      "projectId": "550e8400-e29b-41d4-a716-446655440000",
      "projectCode": "SOLAR-001",
      "projectName": "Usina Solar ABC"
    },
    {
      "id": "doc-uuid-2",
      "name": "Estatuto Social",
      "description": "Estatuto da SCP",
      "fileName": "1234567891-estatuto.pdf",
      "filePath": "/uploads/company-id/documents/...",
      "fileSize": 189234,
      "mimeType": "application/pdf",
      "folderId": "folder-uuid-2",
      "tags": ["SCP", "Projeto", "SOLAR-001", "ESTATUTO"],
      "reference": "SCP-SOLAR-001",
      "documentType": "ESTATUTO",
      "createdAt": "2024-01-16T14:20:00.000Z",
      "updatedAt": "2024-01-16T14:20:00.000Z",
      "folder": {
        "id": "folder-uuid-2",
        "name": "ESTATUTO"
      },
      "uploadedBy": {
        "id": "user-uuid",
        "name": "João Silva",
        "email": "joao@empresa.com"
      },
      "projectId": "550e8400-e29b-41d4-a716-446655440000",
      "projectCode": "SOLAR-001",
      "projectName": "Usina Solar ABC"
    }
  ],
  "meta": {
    "total": 15,
    "page": 1,
    "limit": 10,
    "totalPages": 2
  }
}
```

**Erros Possíveis:**
```json
// 404 - Projeto não encontrado
{
  "statusCode": 404,
  "message": "Projeto não encontrado",
  "error": "Not Found"
}

// 403 - Sem permissão
{
  "statusCode": 403,
  "message": "Usuário não tem permissões para acessar documentos de projetos SCP",
  "error": "Forbidden"
}
```

---

### 6.3. Download de Documento

**Endpoint:** `GET /scp/projects/documents/:documentId/download`

**Descrição:** Faz download de um documento específico do projeto.

**Headers:**
```http
Authorization: Bearer <token>
```

**Parâmetros de Rota:**
- `documentId` (uuid, obrigatório) - ID do documento

**Exemplo de Requisição:**
```http
GET /scp/projects/documents/doc-uuid-1/download
Authorization: Bearer SEU_TOKEN
```

**Resposta de Sucesso (200):**
- Headers de resposta:
```http
Content-Type: application/pdf (ou outro mime type do arquivo)
Content-Disposition: attachment; filename="Contrato de Investimento.pdf"
```
- Body: Stream binário do arquivo

**Exemplo com JavaScript/Axios:**
```javascript
const response = await axios.get(
  `/scp/projects/documents/${documentId}/download`,
  {
    headers: { Authorization: `Bearer ${token}` },
    responseType: 'blob'
  }
);

// Criar link para download no navegador
const url = window.URL.createObjectURL(new Blob([response.data]));
const link = document.createElement('a');
link.href = url;
link.setAttribute('download', 'documento.pdf');
document.body.appendChild(link);
link.click();
link.remove();
```

**Erros Possíveis:**
```json
// 404 - Documento não encontrado
{
  "statusCode": 404,
  "message": "Documento não encontrado",
  "error": "Not Found"
}

// 403 - Documento não pertence ao módulo SCP
{
  "statusCode": 403,
  "message": "Documento não pertence ao módulo SCP",
  "error": "Forbidden"
}

// 403 - Sem permissão
{
  "statusCode": 403,
  "message": "Usuário não tem permissões para acessar documentos de projetos SCP",
  "error": "Forbidden"
}
```

---

### 6.4. Excluir Documento

**Endpoint:** `DELETE /scp/projects/documents/:documentId`

**Descrição:** Remove um documento do projeto e do sistema de arquivos.

**Headers:**
```http
Authorization: Bearer <token>
Content-Type: application/json
```

**Parâmetros de Rota:**
- `documentId` (uuid, obrigatório) - ID do documento

**Exemplo de Requisição:**
```http
DELETE /scp/projects/documents/doc-uuid-1
Authorization: Bearer SEU_TOKEN
```

**Resposta de Sucesso (200):**
```json
{
  "message": "Documento excluído com sucesso"
}
```

**Erros Possíveis:**
```json
// 404 - Documento não encontrado
{
  "statusCode": 404,
  "message": "Documento não encontrado",
  "error": "Not Found"
}

// 403 - Documento não pertence ao módulo SCP
{
  "statusCode": 403,
  "message": "Documento não pertence ao módulo SCP",
  "error": "Forbidden"
}

// 403 - Sem permissão
{
  "statusCode": 403,
  "message": "Usuário não tem permissões para acessar documentos de projetos SCP",
  "error": "Forbidden"
}
```

---

### 6.5. Integração com Projeto

Quando um documento é enviado:
1. O sistema cria automaticamente a estrutura de pastas: `SCP > Projetos > [Código - Nome] > [Categoria]`
2. O documento é adicionado à lista `attachments` do projeto
3. Tags automáticas são adicionadas: `SCP`, `Projeto`, código do projeto, categoria
4. Uma referência única é gerada: `SCP-[CÓDIGO_PROJETO]`

Quando um documento é excluído:
1. O arquivo é removido do sistema de arquivos
2. O registro é removido do banco de dados
3. A URL é removida da lista `attachments` do projeto

---

## 7. Documentos de Aportes

O módulo SCP permite gerenciar documentos vinculados a aportes/investimentos, incluindo comprovantes de pagamento, contratos, recibos e outros documentos relacionados.

### Estrutura de Pastas

Os documentos de aportes são organizados automaticamente em:

```
SCP/
└── Aportes/
    └── {PROJECT_CODE} - {PROJECT_NAME}/
        └── {INVESTOR_NAME}/
            ├── Comprovantes/      (padrão)
            ├── Contratos/
            ├── Recibos/
            ├── Termos/
            ├── Documentos Bancários/
            └── Outros/
```

**Exemplo:**
```
SCP/
└── Aportes/
    └── EOLICO-001 - Empreendimento Eólico XYZ/
        └── Maria Oliveira Costa/
            ├── Comprovantes/
            │   ├── ted-100k.pdf
            │   └── pix-50k.pdf
            ├── Contratos/
            │   └── contrato-aporte.pdf
            └── Recibos/
                └── recibo-assinado.pdf
```

### Categorias de Documentos

- **Comprovantes** (padrão): Comprovantes de TED, PIX, boletos pagos, etc.
- **Contratos**: Contratos de aporte assinados
- **Recibos**: Recibos de pagamento
- **Termos**: Termos de adesão, acordo, etc.
- **Documentos Bancários**: Extratos, DOCs, etc.
- **Outros**: Documentos diversos

---

### 7.1. Fazer Upload de Documento

**Endpoint:** `POST /scp/investments/documents/upload`

**Descrição:** Faz upload de um documento para um aporte específico.

**Headers:**
```http
Authorization: Bearer <token>
x-company-id: <company-uuid>
Content-Type: multipart/form-data
```

**Body (multipart/form-data):**
- `investmentId` (uuid, obrigatório) - ID do aporte
- `name` (string, opcional) - Nome/título do documento
- `description` (string, opcional) - Descrição do documento
- `category` (string, opcional) - Categoria do documento (padrão: "Comprovantes")
- `tags` (string, opcional) - Tags adicionais separadas por vírgula
- `file` (binary, obrigatório) - Arquivo a ser enviado

**Exemplo de Requisição:**
```http
POST /scp/investments/documents/upload
Authorization: Bearer SEU_TOKEN
x-company-id: sua-company-id
Content-Type: multipart/form-data

{
  "investmentId": "investment-uuid-123",
  "name": "Comprovante de TED R$ 100.000",
  "description": "Transferência bancária referente ao aporte",
  "category": "Comprovantes",
  "tags": "ted,transferencia,bancario",
  "file": <binary>
}
```

**Resposta de Sucesso (201):**
```json
{
  "id": "doc-uuid-1",
  "companyId": "company-uuid",
  "folderId": "folder-uuid",
  "name": "Comprovante de TED R$ 100.000",
  "description": "Transferência bancária referente ao aporte",
  "fileName": "ted-100k.pdf",
  "filePath": "/uploads/documents/company-uuid/1699632000-abc123.pdf",
  "fileSize": 245760,
  "mimeType": "application/pdf",
  "fileExtension": ".pdf",
  "reference": "SCP-APT-EOLICO-001-a1b2c3d4",
  "documentType": "Comprovantes",
  "tags": [
    "SCP",
    "Aporte",
    "Investimento",
    "EOLICO-001",
    "investment-uuid-123",
    "987.654.321-00",
    "Comprovantes",
    "ted",
    "transferencia",
    "bancario"
  ],
  "isPublic": false,
  "version": 1,
  "isLatest": true,
  "createdAt": "2024-11-10T15:30:00.000Z",
  "folder": {
    "id": "folder-uuid",
    "name": "Maria Oliveira Costa"
  },
  "uploadedBy": {
    "id": "user-uuid",
    "name": "Admin User",
    "email": "admin@example.com"
  },
  "investmentId": "investment-uuid-123",
  "projectCode": "EOLICO-001",
  "projectName": "Empreendimento Eólico XYZ",
  "investorName": "Maria Oliveira Costa",
  "amount": 100000,
  "investmentDate": "2024-11-10T00:00:00.000Z"
}
```

**Erros Possíveis:**
```json
// 400 - Arquivo não enviado
{
  "statusCode": 400,
  "message": "Nenhum arquivo foi enviado",
  "error": "Bad Request"
}

// 404 - Aporte não encontrado
{
  "statusCode": 404,
  "message": "Aporte não encontrado",
  "error": "Not Found"
}

// 403 - Sem permissão
{
  "statusCode": 403,
  "message": "Usuário não tem permissão para acessar o módulo SCP",
  "error": "Forbidden"
}
```

---

### 7.2. Listar Documentos de um Aporte

**Endpoint:** `GET /scp/investments/documents/:investmentId`

**Descrição:** Lista todos os documentos vinculados a um aporte específico, com paginação.

**Headers:**
```http
Authorization: Bearer <token>
x-company-id: <company-uuid>
```

**Parâmetros de Rota:**
- `investmentId` (uuid, obrigatório) - ID do aporte

**Query Parameters:**
- `page` (number, opcional, padrão: 1) - Página atual
- `limit` (number, opcional, padrão: 20) - Itens por página

**Exemplo de Requisição:**
```http
GET /scp/investments/documents/investment-uuid-123?page=1&limit=20
Authorization: Bearer SEU_TOKEN
x-company-id: sua-company-id
```

**Resposta de Sucesso (200):**
```json
{
  "data": [
    {
      "id": "doc-uuid-1",
      "name": "Comprovante de TED R$ 100.000",
      "fileName": "ted-100k.pdf",
      "fileSize": 245760,
      "mimeType": "application/pdf",
      "fileExtension": ".pdf",
      "reference": "SCP-APT-EOLICO-001-a1b2c3d4",
      "documentType": "Comprovantes",
      "tags": [
        "SCP",
        "Aporte",
        "EOLICO-001",
        "investment-uuid-123",
        "ted"
      ],
      "isPublic": false,
      "createdAt": "2024-11-10T15:30:00.000Z",
      "folder": {
        "id": "folder-uuid",
        "name": "Comprovantes"
      },
      "uploadedBy": {
        "id": "user-uuid",
        "name": "Admin User",
        "email": "admin@example.com"
      }
    },
    {
      "id": "doc-uuid-2",
      "name": "Contrato de Aporte",
      "fileName": "contrato.pdf",
      "fileSize": 524288,
      "mimeType": "application/pdf",
      "fileExtension": ".pdf",
      "reference": "SCP-APT-EOLICO-001-a1b2c3d4",
      "documentType": "Contratos",
      "tags": [
        "SCP",
        "Aporte",
        "EOLICO-001",
        "investment-uuid-123",
        "contrato"
      ],
      "isPublic": false,
      "createdAt": "2024-11-10T15:35:00.000Z",
      "folder": {
        "id": "folder-uuid-2",
        "name": "Maria Oliveira Costa"
      },
      "uploadedBy": {
        "id": "user-uuid",
        "name": "Admin User",
        "email": "admin@example.com"
      }
    }
  ],
  "meta": {
    "total": 5,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

**Erros Possíveis:**
```json
// 404 - Aporte não encontrado
{
  "statusCode": 404,
  "message": "Aporte não encontrado",
  "error": "Not Found"
}

// 403 - Sem permissão
{
  "statusCode": 403,
  "message": "Usuário não tem permissão para acessar o módulo SCP",
  "error": "Forbidden"
}
```

---

### 7.3. Download de Documento

**Endpoint:** `GET /scp/investments/documents/:documentId/download`

**Descrição:** Faz o download de um documento específico.

**Headers:**
```http
Authorization: Bearer <token>
x-company-id: <company-uuid>
```

**Parâmetros de Rota:**
- `documentId` (uuid, obrigatório) - ID do documento

**Exemplo de Requisição:**
```http
GET /scp/investments/documents/doc-uuid-1/download
Authorization: Bearer SEU_TOKEN
x-company-id: sua-company-id
```

**Resposta de Sucesso (200):**
- Arquivo binário com headers apropriados
- `Content-Type`: Tipo MIME do arquivo (ex: `application/pdf`)
- `Content-Disposition`: `attachment; filename="ted-100k.pdf"`

**Erros Possíveis:**
```json
// 404 - Documento não encontrado
{
  "statusCode": 404,
  "message": "Documento não encontrado",
  "error": "Not Found"
}

// 403 - Sem permissão
{
  "statusCode": 403,
  "message": "Usuário não tem permissão para acessar o módulo SCP",
  "error": "Forbidden"
}
```

---

### 7.4. Excluir Documento

**Endpoint:** `DELETE /scp/investments/documents/:documentId`

**Descrição:** Remove um documento do aporte e do sistema de arquivos.

**Headers:**
```http
Authorization: Bearer <token>
x-company-id: <company-uuid>
```

**Parâmetros de Rota:**
- `documentId` (uuid, obrigatório) - ID do documento

**Exemplo de Requisição:**
```http
DELETE /scp/investments/documents/doc-uuid-1
Authorization: Bearer SEU_TOKEN
x-company-id: sua-company-id
```

**Resposta de Sucesso (204):**
- Status: `204 No Content`
- Sem corpo de resposta

**Erros Possíveis:**
```json
// 404 - Documento não encontrado
{
  "statusCode": 404,
  "message": "Documento não encontrado",
  "error": "Not Found"
}

// 403 - Documento não pertence a um aporte
{
  "statusCode": 403,
  "message": "Este documento não pertence a um aporte",
  "error": "Forbidden"
}

// 403 - Sem permissão
{
  "statusCode": 403,
  "message": "Usuário não tem permissão para acessar o módulo SCP",
  "error": "Forbidden"
}
```

---

### 7.5. Integração com Aporte

Quando um documento é enviado:
1. O sistema cria automaticamente a estrutura de pastas: `SCP > Aportes > [Projeto] > [Investidor] > [Categoria]`
2. O documento é adicionado à lista `attachments` do aporte
3. Tags automáticas são adicionadas: `SCP`, `Aporte`, `Investimento`, código do projeto, ID do aporte, CPF/CNPJ do investidor
4. Uma referência única é gerada: `SCP-APT-[CÓDIGO_PROJETO]-[ID_CURTO]`

Quando um documento é excluído:
1. O arquivo é removido do sistema de arquivos
2. O registro é removido do banco de dados
3. A URL é removida da lista `attachments` do aporte

---

### 7.6. GET Investment por ID (Atualizado)

**Endpoint:** `GET /scp/investments/:id`

**Agora inclui documentos na resposta:**

```json
{
  "id": "investment-uuid-123",
  "companyId": "company-uuid",
  "projectId": "project-uuid",
  "investorId": "investor-uuid",
  "amount": 100000,
  "investmentDate": "2024-11-10T00:00:00.000Z",
  "referenceNumber": "TED-789456123",
  "documentNumber": "DOC-2024-001",
  "paymentMethod": "TED",
  "status": "CONFIRMADO",
  "notes": "Primeiro aporte da investidora",
  "attachments": [
    "/documents/doc-uuid-1",
    "/documents/doc-uuid-2"
  ],
  "createdAt": "2024-11-10T15:00:00.000Z",
  "updatedAt": "2024-11-10T15:00:00.000Z",
  "project": {
    "id": "project-uuid",
    "name": "Empreendimento Eólico XYZ",
    "code": "EOLICO-001"
  },
  "investor": {
    "id": "investor-uuid",
    "type": "PESSOA_FISICA",
    "fullName": "Maria Oliveira Costa",
    "cpf": "987.654.321-00"
  },
  "documents": [
    {
      "id": "doc-uuid-1",
      "name": "Comprovante de TED R$ 100.000",
      "fileName": "ted-100k.pdf",
      "fileSize": 245760,
      "mimeType": "application/pdf",
      "fileExtension": ".pdf",
      "reference": "SCP-APT-EOLICO-001-a1b2c3d4",
      "documentType": "Comprovantes",
      "tags": ["SCP", "Aporte", "EOLICO-001", "investment-uuid-123"],
      "createdAt": "2024-11-10T15:30:00.000Z",
      "folder": {
        "id": "folder-uuid",
        "name": "Comprovantes"
      },
      "uploadedBy": {
        "id": "user-uuid",
        "name": "Admin User",
        "email": "admin@example.com"
      }
    }
  ]
}
```

---

## Relatórios e Estatísticas

### Estatísticas de Projetos
`GET /scp/projects/stats`
- ROI (Return on Investment)
- Saldo disponível
- Valores investidos e distribuídos

### Totais por Investidor
`GET /scp/investors/:id`
- Total investido
- Total recebido em distribuições

### Totais por Projeto
`GET /scp/projects/:id`
- Valor total
- Valor investido
- Valor distribuído
- Distribuições pendentes
- Saldo disponível

## Exemplos de Uso

### Exemplo 1: Criar Projeto com Políticas
```bash
# 1. Criar projeto
POST /scp/projects
{
  "name": "Solar ABC",
  "code": "SOLAR-001",
  "totalValue": 1000000.00,
  "startDate": "2024-01-01"
}

# 2. Criar políticas (3 investidores)
POST /scp/distribution-policies
{
  "projectId": "proj-1",
  "investorId": "inv-1",
  "percentage": 40.00
}

POST /scp/distribution-policies
{
  "projectId": "proj-1",
  "investorId": "inv-2",
  "percentage": 35.00
}

POST /scp/distribution-policies
{
  "projectId": "proj-1",
  "investorId": "inv-3",
  "percentage": 25.00
}

# 3. Verificar políticas
GET /scp/distribution-policies/by-project/proj-1
# Deve retornar: totalPercentage: 100, isComplete: true
```

### Exemplo 2: Distribuir Lucros Automaticamente
```bash
# 1. Calcular valores (preview)
POST /scp/distribution-policies/calculate-amounts/proj-1
{
  "baseValue": 50000.00
}

# Resposta:
# - Investidor 1: R$ 20.000 (40%)
# - Investidor 2: R$ 17.500 (35%)
# - Investidor 3: R$ 12.500 (25%)

# 2. Criar distribuições
POST /scp/distributions/bulk-create
{
  "projectId": "proj-1",
  "baseValue": 50000.00,
  "competenceDate": "2024-10-31",
  "distributionDate": "2024-11-10"
}

# 3. Marcar como pagas após transferências
POST /scp/distributions/dist-1/mark-as-paid
POST /scp/distributions/dist-2/mark-as-paid
POST /scp/distributions/dist-3/mark-as-paid
```

## Segurança e Permissões

- Todos os endpoints requerem autenticação (JwtAuthGuard)
- Isolamento por empresa (companyId do token JWT)
- Validações de pertencimento à mesma empresa

## Auditoria

Campos de auditoria em todas as entidades:
- `createdAt`: Data de criação
- `updatedAt`: Data da última atualização
- `paidAt` (distribuições): Data do pagamento efetivo

## Considerações de Performance

### Índices
Todos os modelos possuem índices para:
- `companyId`
- Campos de data (investmentDate, distributionDate, etc.)
- Status
- Campos de busca frequente

### Queries Otimizadas
- Uso de `include` para evitar N+1 queries
- `_count` para contagens eficientes
- Paginação padrão (10 itens)

## Possíveis Integrações

### Módulo Financeiro
- Vincular aportes a transações financeiras
- Vincular distribuições a pagamentos
- Usar contas bancárias cadastradas

### Módulo de Documentos
- Anexar contratos de investimento
- Anexar comprovantes de aportes
- Anexar recibos de distribuições

## Enumerações (Enums)

### InvestorType
- `PESSOA_FISICA`: Pessoa Física
- `PESSOA_JURIDICA`: Pessoa Jurídica

### Gender
- `MASCULINO`: Masculino
- `FEMININO`: Feminino
- `OUTRO`: Outro
- `PREFIRO_NAO_INFORMAR`: Prefiro não informar

### MaritalStatus
- `SOLTEIRO`: Solteiro(a)
- `CASADO`: Casado(a)
- `DIVORCIADO`: Divorciado(a)
- `VIUVO`: Viúvo(a)
- `UNIAO_ESTAVEL`: União Estável
- `SEPARADO`: Separado(a)

### AddressType
- `RESIDENCIAL`: Residencial
- `COMERCIAL`: Comercial
- `CORRESPONDENCIA`: Correspondência

### AccountType
- `CORRENTE`: Conta Corrente
- `POUPANCA`: Conta Poupança
- `PAGAMENTO`: Conta Pagamento
- `INVESTIMENTO`: Conta Investimento

### PixKeyType
- `CPF`: CPF
- `CNPJ`: CNPJ
- `EMAIL`: Email
- `TELEFONE`: Telefone
- `CHAVE_ALEATORIA`: Chave Aleatória

### InvestorProfile
- `CONSERVADOR`: Conservador
- `MODERADO`: Moderado
- `ARROJADO`: Arrojado
- `AGRESSIVO`: Agressivo

### InvestorStatus
- `ATIVO`: Ativo
- `INATIVO`: Inativo
- `SUSPENSO`: Suspenso
- `BLOQUEADO`: Bloqueado

### ProjectStatus
- `ATIVO`: Ativo
- `CONCLUIDO`: Concluído
- `CANCELADO`: Cancelado
- `SUSPENSO`: Suspenso

### InvestmentStatus
- `PENDENTE`: Pendente
- `CONFIRMADO`: Confirmado
- `CANCELADO`: Cancelado

### DistributionStatus
- `PENDENTE`: Pendente
- `PAGO`: Pago
- `CANCELADO`: Cancelado

### DistributionType
- `PROPORCIONAL`: Proporcional
- `FIXO`: Fixo
- `PERSONALIZADO`: Personalizado

## Próximas Melhorias

1. **Validações Avançadas**
   - Validação de dígito verificador de CPF/CNPJ
   - Validação de CEP com integração ViaCEP
   - Validação de dados bancários
   - Validação de códigos de banco

2. **Upload de Documentos**
   - Integração com módulo de documentos
   - Upload direto de arquivos (identidade, CPF, comprovantes)
   - Gestão de anexos
   - Controle de versionamento

3. **Relatórios em PDF**
   - Extratos de investidores
   - Demonstrativos de distribuição
   - Relatórios gerenciais
   - Fichas cadastrais completas

4. **Dashboard Visual**
   - Gráficos de ROI
   - Evolução de investimentos
   - Status de distribuições
   - Perfil dos investidores

5. **Notificações**
   - Email ao criar distribuição
   - Alerta de distribuições pendentes
   - Resumo mensal para investidores
   - Notificações de vencimentos

6. **Importação/Exportação**
   - Exportar relatórios em Excel
   - Importar aportes em lote
   - Importar investidores de planilha
   - Exportar dados cadastrais

7. **Workflow de Aprovação**
   - Aprovar distribuições antes de pagar
   - Múltiplos níveis de aprovação
   - Histórico de aprovações
   - Aprovação de novos investidores

8. **Compliance e KYC**
   - Verificação automática de documentos
   - Análise de risco do investidor
   - Alertas de conformidade
   - Renovação periódica de cadastro

## Documentação Adicional

- **[SCP_QUICKSTART.md](./SCP_QUICKSTART.md)**: Guia rápido de uso
- **[SCP_IMPLEMENTATION_SUMMARY.md](./SCP_IMPLEMENTATION_SUMMARY.md)**: Resumo técnico da implementação
- **[SCP_INVESTOR_EXPANSION.md](./SCP_INVESTOR_EXPANSION.md)**: Detalhes da expansão do modelo de investidor
- **[SCP_BULK_DISTRIBUTIONS.md](./SCP_BULK_DISTRIBUTIONS.md)**: Guia completo de distribuições em lote
- **[SCP_INVESTMENT_DOCUMENTS.md](./SCP_INVESTMENT_DOCUMENTS.md)**: Sistema de documentos para aportes
- **[scp-api-tests.http](../scp-api-tests.http)**: Exemplos de requisições HTTP para testes
- **[bulk-distributions-tests.http](../bulk-distributions-tests.http)**: Exemplos de distribuições em lote
