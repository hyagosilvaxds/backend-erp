# 👥 API - Módulo de Clientes

**Data**: 5 de novembro de 2025  
**Versão**: 1.0

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Modelos de Dados](#modelos-de-dados)
3. [Endpoints](#endpoints)
4. [Exemplos de Uso](#exemplos-de-uso)
5. [Validações](#validações)

---

## 🎯 Visão Geral

Módulo completo para gerenciamento de clientes (pessoa física e jurídica) com suporte a:
- ✅ Cadastro completo de dados pessoais e empresariais
- ✅ Múltiplos endereços (cobrança, entrega, principal)
- ✅ Múltiplos contatos (principal, financeiro, comercial)
- ✅ Limite de crédito
- ✅ Validação de duplicidade de CPF/CNPJ

---

## 📊 Modelos de Dados

### Customer (Cliente)

#### Campos Comuns

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `personType` | enum | ✅ | `FISICA` ou `JURIDICA` |
| `email` | string | ❌ | Email principal |
| `phone` | string | ❌ | Telefone principal |
| `mobile` | string | ❌ | Celular/WhatsApp |
| `website` | string | ❌ | Site |
| `creditLimit` | decimal | ❌ | Limite de crédito |
| `active` | boolean | ❌ | Status (default: true) |
| `notes` | text | ❌ | Observações |

#### Pessoa Física (personType = 'FISICA')

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `name` | string | ✅ | Nome completo |
| `cpf` | string | ✅ | CPF (somente números) |
| `rg` | string | ❌ | RG |
| `rgIssuer` | string | ❌ | Órgão emissor (ex: SSP) |
| `rgState` | string | ❌ | UF do órgão emissor |
| `birthDate` | date | ❌ | Data de nascimento |
| `gender` | enum | ❌ | `MALE`, `FEMALE`, `OTHER` |
| `maritalStatus` | enum | ❌ | `SINGLE`, `MARRIED`, `DIVORCED`, `WIDOWED`, `OTHER` |
| `motherName` | string | ❌ | Nome da mãe |
| `profession` | string | ❌ | Profissão |
| `nationality` | string | ❌ | Nacionalidade |

#### Pessoa Jurídica (personType = 'JURIDICA')

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `companyName` | string | ✅ | Razão Social |
| `tradeName` | string | ❌ | Nome Fantasia |
| `cnpj` | string | ✅ | CNPJ (somente números) |
| `stateRegistration` | string | ❌ | Inscrição Estadual |
| `stateRegistrationExempt` | boolean | ❌ | Isento de IE |
| `municipalRegistration` | string | ❌ | Inscrição Municipal |
| `cnae` | string | ❌ | CNAE principal |
| `taxRegime` | enum | ❌ | `SIMPLES_NACIONAL`, `LUCRO_PRESUMIDO`, `LUCRO_REAL`, `MEI` |
| `responsibleName` | string | ❌ | Nome do responsável |
| `responsibleCpf` | string | ❌ | CPF do responsável |
| `responsibleEmail` | string | ❌ | Email do responsável |
| `responsiblePhone` | string | ❌ | Telefone do responsável |

### CustomerAddress (Endereço)

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `type` | enum | ✅ | `BILLING`, `SHIPPING`, `MAIN`, `OTHER` |
| `label` | string | ❌ | Label personalizado |
| `zipCode` | string | ✅ | CEP |
| `street` | string | ✅ | Logradouro |
| `number` | string | ✅ | Número |
| `complement` | string | ❌ | Complemento |
| `neighborhood` | string | ✅ | Bairro |
| `city` | string | ✅ | Cidade |
| `state` | string | ✅ | UF (2 letras) |
| `country` | string | ❌ | País (default: "Brasil") |
| `reference` | string | ❌ | Ponto de referência |
| `isDefault` | boolean | ❌ | Endereço padrão |
| `active` | boolean | ❌ | Status |

### CustomerContact (Contato)

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `type` | enum | ✅ | `MAIN`, `FINANCIAL`, `COMMERCIAL`, `OTHER` |
| `name` | string | ✅ | Nome do contato |
| `position` | string | ❌ | Cargo/Função |
| `department` | string | ❌ | Departamento |
| `email` | string | ❌ | Email |
| `phone` | string | ❌ | Telefone fixo |
| `mobile` | string | ❌ | Celular/WhatsApp |
| `notes` | text | ❌ | Observações |
| `isPrimary` | boolean | ❌ | Contato principal do tipo |
| `active` | boolean | ❌ | Status |

---

## 🌐 Endpoints

### Headers Obrigatórios

```http
Authorization: Bearer {token}
x-company-id: {company-uuid}
```

---

### 1. Criar Cliente

**POST** `/customers`

**Permissão**: `customers.create`

**Observação**: É possível criar o cliente com endereços e contatos de uma só vez, enviando os arrays `addresses` e `contacts` no corpo da requisição.

#### Request Body - Pessoa Física

```json
{
  "personType": "FISICA",
  "name": "João Silva Santos",
  "cpf": "12345678900",
  "rg": "123456789",
  "rgIssuer": "SSP",
  "rgState": "SP",
  "birthDate": "1985-05-15",
  "gender": "MALE",
  "maritalStatus": "MARRIED",
  "motherName": "Maria Santos Silva",
  "profession": "Engenheiro",
  "nationality": "Brasileiro",
  "email": "joao.silva@email.com",
  "phone": "1133334444",
  "mobile": "11987654321",
  "creditLimit": 50000.00,
  "notes": "Cliente VIP",
  "addresses": [
    {
      "type": "MAIN",
      "zipCode": "01310100",
      "street": "Av Paulista",
      "number": "1000",
      "neighborhood": "Bela Vista",
      "city": "São Paulo",
      "state": "SP",
      "isDefault": true
    }
  ],
  "contacts": [
    {
      "type": "MAIN",
      "name": "João Silva Santos",
      "email": "joao.silva@email.com",
      "mobile": "11987654321",
      "isPrimary": true
    }
  ]
}
```

#### Request Body - Pessoa Jurídica

```json
{
  "personType": "JURIDICA",
  "companyName": "Empresa XYZ Ltda",
  "tradeName": "XYZ Comércio",
  "cnpj": "12345678000190",
  "stateRegistration": "123456789",
  "stateRegistrationExempt": false,
  "municipalRegistration": "987654321",
  "cnae": "4712100",
  "taxRegime": "SIMPLES_NACIONAL",
  "responsibleName": "Carlos Oliveira",
  "responsibleCpf": "98765432100",
  "responsibleEmail": "carlos@empresa.com",
  "responsiblePhone": "1133334444",
  "email": "contato@empresa.com",
  "phone": "1133334444",
  "mobile": "11987654321",
  "website": "https://www.empresa.com",
  "creditLimit": 100000.00,
  "notes": "Cliente desde 2020",
  "addresses": [
    {
      "type": "MAIN",
      "zipCode": "01310100",
      "street": "Av Paulista",
      "number": "1000",
      "complement": "Sala 10",
      "neighborhood": "Bela Vista",
      "city": "São Paulo",
      "state": "SP",
      "isDefault": true
    },
    {
      "type": "SHIPPING",
      "label": "Depósito",
      "zipCode": "02020200",
      "street": "Rua do Depósito",
      "number": "500",
      "neighborhood": "Centro",
      "city": "São Paulo",
      "state": "SP"
    }
  ],
  "contacts": [
    {
      "type": "COMMERCIAL",
      "name": "Carlos Oliveira",
      "position": "Gerente Comercial",
      "email": "carlos@empresa.com",
      "mobile": "11987654321",
      "isPrimary": true
    },
    {
      "type": "FINANCIAL",
      "name": "Ana Rodrigues",
      "position": "Gerente Financeiro",
      "email": "ana@empresa.com",
      "phone": "1133335555"
    }
  ]
}
```

#### Response (201 Created)

```json
{
  "id": "customer-uuid",
  "companyId": "company-uuid",
  "personType": "JURIDICA",
  "companyName": "Empresa XYZ Ltda",
  "tradeName": "XYZ Comércio",
  "cnpj": "12345678000190",
  "email": "contato@empresa.com",
  "active": true,
  "creditLimit": "100000.00",
  "addresses": [
    {
      "id": "address-uuid-1",
      "type": "MAIN",
      "zipCode": "01310100",
      "street": "Av Paulista",
      "number": "1000",
      "city": "São Paulo",
      "state": "SP",
      "isDefault": true,
      "active": true
    },
    {
      "id": "address-uuid-2",
      "type": "SHIPPING",
      "label": "Depósito",
      "zipCode": "02020200",
      "street": "Rua do Depósito",
      "number": "500",
      "city": "São Paulo",
      "state": "SP",
      "isDefault": false,
      "active": true
    }
  ],
  "contacts": [
    {
      "id": "contact-uuid-1",
      "type": "COMMERCIAL",
      "name": "Carlos Oliveira",
      "position": "Gerente Comercial",
      "email": "carlos@empresa.com",
      "mobile": "11987654321",
      "isPrimary": true,
      "active": true
    },
    {
      "id": "contact-uuid-2",
      "type": "FINANCIAL",
      "name": "Ana Rodrigues",
      "position": "Gerente Financeiro",
      "email": "ana@empresa.com",
      "phone": "1133335555",
      "isPrimary": false,
      "active": true
    }
  ],
  "createdAt": "2025-11-05T10:00:00Z",
  "updatedAt": "2025-11-05T10:00:00Z"
}
```

---

### 2. Listar Clientes

**GET** `/customers`

**Permissão**: `customers.read`

#### Query Parameters

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `personType` | string | Filtrar por tipo: `FISICA` ou `JURIDICA` |
| `active` | boolean | Filtrar por status |
| `search` | string | Buscar por nome, CPF, CNPJ, email |
| `page` | number | Página (default: 1) |
| `limit` | number | Itens por página (default: 50) |

#### Response (200 OK)

```json
{
  "data": [
    {
      "id": "customer-uuid-1",
      "personType": "FISICA",
      "name": "João Silva Santos",
      "cpf": "12345678900",
      "email": "joao.silva@email.com",
      "active": true,
      "addresses": [
        {
          "id": "address-uuid",
          "type": "MAIN",
          "city": "São Paulo",
          "state": "SP",
          "isDefault": true
        }
      ],
      "contacts": []
    }
  ],
  "total": 125,
  "page": 1,
  "limit": 50,
  "totalPages": 3
}
```

---

### 3. Buscar Cliente por ID

**GET** `/customers/:id`

**Permissão**: `customers.read`

#### Response (200 OK)

```json
{
  "id": "customer-uuid",
  "personType": "JURIDICA",
  "companyName": "Empresa XYZ Ltda",
  "tradeName": "XYZ Comércio",
  "cnpj": "12345678000190",
  "email": "contato@empresa.com",
  "creditLimit": "100000.00",
  "active": true,
  "addresses": [
    {
      "id": "address-uuid-1",
      "type": "MAIN",
      "zipCode": "01310100",
      "street": "Av Paulista",
      "number": "1000",
      "neighborhood": "Bela Vista",
      "city": "São Paulo",
      "state": "SP",
      "isDefault": true,
      "active": true
    }
  ],
  "contacts": [
    {
      "id": "contact-uuid-1",
      "type": "COMMERCIAL",
      "name": "Carlos Oliveira",
      "email": "carlos@empresa.com",
      "phone": "1133334444",
      "isPrimary": true,
      "active": true
    }
  ],
  "createdAt": "2025-11-05T10:00:00Z"
}
```

---

### 4. Atualizar Cliente

**PATCH** `/customers/:id`

**Permissão**: `customers.update`

#### Request Body

```json
{
  "creditLimit": 150000.00,
  "email": "novo-email@empresa.com",
  "notes": "Limite aumentado por bom histórico"
}
```

---

### 5. Deletar Cliente

**DELETE** `/customers/:id`

**Permissão**: `customers.delete`

---

### 6. Ativar/Desativar Cliente

**PATCH** `/customers/:id/toggle-active`

**Permissão**: `customers.update`

---

### 7. Adicionar Endereço

**POST** `/customers/:id/addresses`

**Permissão**: `customers.update`

#### Request Body

```json
{
  "type": "SHIPPING",
  "label": "Depósito Principal",
  "zipCode": "01310100",
  "street": "Av Paulista",
  "number": "1000",
  "complement": "Andar 10",
  "neighborhood": "Bela Vista",
  "city": "São Paulo",
  "state": "SP",
  "reference": "Próximo ao metrô",
  "isDefault": false
}
```

---

### 8. Atualizar Endereço

**PATCH** `/customers/:id/addresses/:addressId`

**Permissão**: `customers.update`

---

### 9. Remover Endereço

**DELETE** `/customers/:id/addresses/:addressId`

**Permissão**: `customers.update`

---

### 10. Adicionar Contato

**POST** `/customers/:id/contacts`

**Permissão**: `customers.update`

#### Request Body

```json
{
  "type": "FINANCIAL",
  "name": "Ana Rodrigues",
  "position": "Gerente Financeiro",
  "department": "Financeiro",
  "email": "ana.rodrigues@empresa.com",
  "phone": "1133335555",
  "mobile": "11987651234",
  "isPrimary": true
}
```

---

### 11. Atualizar Contato

**PATCH** `/customers/:id/contacts/:contactId`

**Permissão**: `customers.update`

---

### 12. Remover Contato

**DELETE** `/customers/:id/contacts/:contactId`

**Permissão**: `customers.update`

---

### 13. Estatísticas

**GET** `/customers/stats`

**Permissão**: `customers.read`

#### Response (200 OK)

```json
{
  "total": 125,
  "active": 120,
  "inactive": 5,
  "byType": {
    "fisica": 75,
    "juridica": 50
  }
}
```

---

## 💻 Exemplos de Uso

### JavaScript/TypeScript

```typescript
// Criar cliente pessoa física
async function createIndividualCustomer(companyId: string, token: string) {
  const response = await fetch('http://localhost:4000/customers', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-company-id': companyId,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      personType: 'FISICA',
      name: 'João Silva Santos',
      cpf: '12345678900',
      rg: '123456789',
      rgIssuer: 'SSP',
      rgState: 'SP',
      birthDate: '1985-05-15',
      gender: 'MALE',
      maritalStatus: 'MARRIED',
      email: 'joao.silva@email.com',
      mobile: '11987654321',
      creditLimit: 50000,
      // Adicionar endereços na criação
      addresses: [
        {
          type: 'MAIN',
          zipCode: '01310100',
          street: 'Av Paulista',
          number: '1000',
          neighborhood: 'Bela Vista',
          city: 'São Paulo',
          state: 'SP',
          isDefault: true
        }
      ],
      // Adicionar contatos na criação
      contacts: [
        {
          type: 'MAIN',
          name: 'João Silva Santos',
          email: 'joao.silva@email.com',
          mobile: '11987654321',
          isPrimary: true
        }
      ]
    })
  });

  return await response.json();
}

// Criar cliente pessoa jurídica
async function createCompanyCustomer(companyId: string, token: string) {
  const response = await fetch('http://localhost:4000/customers', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-company-id': companyId,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      personType: 'JURIDICA',
      companyName: 'Empresa XYZ Ltda',
      tradeName: 'XYZ Comércio',
      cnpj: '12345678000190',
      stateRegistration: '123456789',
      cnae: '4712100',
      taxRegime: 'SIMPLES_NACIONAL',
      responsibleName: 'Carlos Oliveira',
      responsibleCpf: '98765432100',
      email: 'contato@empresa.com',
      creditLimit: 100000,
      // Adicionar múltiplos endereços na criação
      addresses: [
        {
          type: 'MAIN',
          zipCode: '01310100',
          street: 'Av Paulista',
          number: '1000',
          neighborhood: 'Bela Vista',
          city: 'São Paulo',
          state: 'SP',
          isDefault: true
        },
        {
          type: 'SHIPPING',
          label: 'Depósito',
          zipCode: '02020200',
          street: 'Rua do Depósito',
          number: '500',
          neighborhood: 'Centro',
          city: 'São Paulo',
          state: 'SP'
        }
      ],
      // Adicionar múltiplos contatos na criação
      contacts: [
        {
          type: 'COMMERCIAL',
          name: 'Carlos Oliveira',
          position: 'Gerente Comercial',
          email: 'carlos@empresa.com',
          mobile: '11987654321',
          isPrimary: true
        },
        {
          type: 'FINANCIAL',
          name: 'Ana Rodrigues',
          position: 'Gerente Financeiro',
          email: 'ana@empresa.com',
          phone: '1133335555'
        }
      ]
    })
  });

  return await response.json();
}

// Adicionar endereço
async function addAddress(customerId: string, companyId: string, token: string) {
  const response = await fetch(`http://localhost:4000/customers/${customerId}/addresses`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-company-id': companyId,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      type: 'MAIN',
      zipCode: '01310100',
      street: 'Av Paulista',
      number: '1000',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
      isDefault: true
    })
  });

  return await response.json();
}

// Adicionar contato
async function addContact(customerId: string, companyId: string, token: string) {
  const response = await fetch(`http://localhost:4000/customers/${customerId}/contacts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-company-id': companyId,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      type: 'COMMERCIAL',
      name: 'Carlos Oliveira',
      position: 'Gerente Comercial',
      email: 'carlos@empresa.com',
      mobile: '11987654321',
      isPrimary: true
    })
  });

  return await response.json();
}
```

---

## ⚠️ Validações

### Validações Automáticas

1. **CPF único por empresa**: Não permite duplicidade de CPF
2. **CNPJ único por empresa**: Não permite duplicidade de CNPJ
3. **Pessoa Física**: CPF e nome são obrigatórios
4. **Pessoa Jurídica**: CNPJ e razão social são obrigatórios
5. **Endereço padrão**: Ao marcar um endereço como padrão, desmarca os outros
6. **Contato primário**: Ao marcar um contato como primário de um tipo, desmarca os outros do mesmo tipo

### Erros Comuns

```json
// CPF duplicado
{
  "statusCode": 400,
  "message": "Já existe um cliente com este CPF"
}

// CNPJ duplicado
{
  "statusCode": 400,
  "message": "Já existe um cliente com este CNPJ"
}

// Cliente não encontrado
{
  "statusCode": 404,
  "message": "Cliente não encontrado"
}
```

---

## 🚀 Próximos Passos

Para ativar o módulo:

1. **Rodar a migration**:
```bash
npx prisma migrate dev --name add_customers_module
```

2. **Gerar o Prisma Client**:
```bash
npx prisma generate
```

3. **Executar seed de permissões**:
```bash
npx ts-node prisma/seeds/customers-permissions.seed.ts
```

4. **Reiniciar o servidor**:
```bash
npm run start:dev
```

---

**Última Atualização**: 5 de novembro de 2025  
**Versão**: 1.0
