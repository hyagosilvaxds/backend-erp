# 👥 API - Módulo de RH (Recursos Humanos)

**Data**: 8 de novembro de 2025  
**Versão**: 1.0

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Headers Obrigatórios](#headers-obrigatórios)
3. [Cargos (Positions)](#cargos-positions)
4. [Departamentos (Departments)](#departamentos-departments)
5. [Colaboradores](#colaboradores)
6. [Documentos de Colaboradores](#documentos-de-colaboradores)
7. [Centros de Custo](#centros-de-custo)
8. [Tipos de Proventos](#tipos-de-proventos)
9. [Tipos de Descontos](#tipos-de-descontos)
10. [Proventos de Colaboradores](#proventos-de-colaboradores)
11. [Tabelas Fiscais (INSS, FGTS, IRRF)](#tabelas-fiscais-inss-fgts-irrf)
12. [Folha de Pagamento](#folha-de-pagamento)
13. [Exemplos de Uso](#exemplos-de-uso)
14. [Validações e Erros](#validações-e-erros)

---

## 🎯 Visão Geral

Módulo completo para gerenciamento de Recursos Humanos com:
- ✅ Cadastro de cargos e faixas salariais
- ✅ Gestão de departamentos com hierarquia
- ✅ Cadastro de colaboradores (CLT, PJ, Estágio, etc)
- ✅ Vinculação de colaboradores a cargos e departamentos
- ✅ Informações de empresa para colaboradores PJ
- ✅ Gestão de documentos (RG, CPF, CTPS, Contratos, etc)
- ✅ Gestão de centros de custo
- ✅ Configuração de proventos e descontos
- ✅ Tabelas fiscais configuráveis (INSS, FGTS, IRRF)
- ✅ Folha de pagamento (mensal, diária, semanal)
- ✅ Cálculo automático de folha com encargos reais
- ✅ Workflow de aprovação

---

## 🔑 Headers Obrigatórios

Todos os endpoints requerem autenticação e identificação da empresa:

```http
Authorization: Bearer {token}
x-company-id: {company-uuid}
Content-Type: application/json
```

---

## � Cargos (Positions)

### 1. Criar Cargo

**POST** `/positions`

**Permissão**: `positions.create`

#### Request Body

```json
{
  "code": "DEV-SR",
  "name": "Desenvolvedor Sênior",
  "description": "Desenvolvedor com mais de 5 anos de experiência em desenvolvimento full stack",
  "minSalary": 8000.00,
  "maxSalary": 15000.00,
  "cbo": "2124-05",
  "active": true
}
```

#### Campos

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|------------|-----------|
| code | string | ✅ | Código único do cargo na empresa |
| name | string | ✅ | Nome do cargo |
| description | string | ❌ | Descrição detalhada do cargo |
| minSalary | number | ❌ | Salário mínimo da faixa salarial |
| maxSalary | number | ❌ | Salário máximo da faixa salarial |
| cbo | string | ❌ | Código Brasileiro de Ocupações |
| active | boolean | ❌ | Status do cargo (padrão: true) |

#### Response (201 Created)

```json
{
  "id": "position-uuid",
  "companyId": "company-uuid",
  "code": "DEV-SR",
  "name": "Desenvolvedor Sênior",
  "description": "Desenvolvedor com mais de 5 anos de experiência em desenvolvimento full stack",
  "minSalary": 8000.00,
  "maxSalary": 15000.00,
  "cbo": "2124-05",
  "active": true,
  "_count": {
    "employees": 0
  },
  "createdAt": "2025-11-08T10:00:00.000Z",
  "updatedAt": "2025-11-08T10:00:00.000Z"
}
```

---

### 2. Listar Cargos

**GET** `/positions?active=true`

**Permissão**: `positions.read`

#### Query Parameters

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| active | boolean | Filtrar por status (true/false) |

#### Response (200 OK)

```json
[
  {
    "id": "position-uuid-1",
    "code": "DEV-SR",
    "name": "Desenvolvedor Sênior",
    "description": "Desenvolvedor com mais de 5 anos de experiência",
    "minSalary": 8000.00,
    "maxSalary": 15000.00,
    "cbo": "2124-05",
    "active": true,
    "_count": {
      "employees": 5
    },
    "createdAt": "2025-11-08T10:00:00.000Z",
    "updatedAt": "2025-11-08T10:00:00.000Z"
  },
  {
    "id": "position-uuid-2",
    "code": "DEV-PL",
    "name": "Desenvolvedor Pleno",
    "minSalary": 5000.00,
    "maxSalary": 8000.00,
    "active": true,
    "_count": {
      "employees": 8
    }
  }
]
```

---

### 3. Buscar Cargo por ID

**GET** `/positions/{id}`

**Permissão**: `positions.read`

#### Response (200 OK)

```json
{
  "id": "position-uuid",
  "companyId": "company-uuid",
  "code": "DEV-SR",
  "name": "Desenvolvedor Sênior",
  "description": "Desenvolvedor com mais de 5 anos de experiência",
  "minSalary": 8000.00,
  "maxSalary": 15000.00,
  "cbo": "2124-05",
  "active": true,
  "employees": [
    {
      "id": "employee-uuid-1",
      "name": "João Silva",
      "email": "joao@empresa.com",
      "salary": 10000.00,
      "admissionDate": "2023-01-15T00:00:00.000Z",
      "active": true
    },
    {
      "id": "employee-uuid-2",
      "name": "Maria Santos",
      "email": "maria@empresa.com",
      "salary": 12000.00,
      "admissionDate": "2022-06-10T00:00:00.000Z",
      "active": true
    }
  ],
  "_count": {
    "employees": 5
  },
  "createdAt": "2025-11-08T10:00:00.000Z",
  "updatedAt": "2025-11-08T10:00:00.000Z"
}
```

---

### 4. Atualizar Cargo

**PATCH** `/positions/{id}`

**Permissão**: `positions.update`

#### Request Body

```json
{
  "name": "Desenvolvedor Sênior Full Stack",
  "maxSalary": 18000.00,
  "description": "Desenvolvedor experiente em frontend e backend"
}
```

#### Response (200 OK)

```json
{
  "id": "position-uuid",
  "code": "DEV-SR",
  "name": "Desenvolvedor Sênior Full Stack",
  "maxSalary": 18000.00,
  "description": "Desenvolvedor experiente em frontend e backend",
  "updatedAt": "2025-11-08T11:30:00.000Z"
}
```

---

### 5. Excluir Cargo

**DELETE** `/positions/{id}`

**Permissão**: `positions.delete`

#### Response (200 OK)

```json
{
  "message": "Position deleted successfully"
}
```

#### Erro (400 Bad Request)

```json
{
  "statusCode": 400,
  "message": "Cannot delete position with 5 employees. Please reassign employees first."
}
```

---

## 🏢 Departamentos (Departments)

### 1. Criar Departamento

**POST** `/departments`

**Permissão**: `departments.create`

#### Request Body (Departamento Principal)

```json
{
  "code": "TI",
  "name": "Tecnologia da Informação",
  "description": "Departamento responsável por toda infraestrutura tecnológica",
  "managerId": "employee-uuid",
  "active": true
}
```

#### Request Body (Sub-Departamento)

```json
{
  "code": "TI-DEV",
  "name": "Desenvolvimento",
  "description": "Equipe de desenvolvimento de software",
  "parentId": "ti-department-uuid",
  "managerId": "manager-uuid",
  "active": true
}
```

#### Campos

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|------------|-----------|
| code | string | ✅ | Código único do departamento |
| name | string | ✅ | Nome do departamento |
| description | string | ❌ | Descrição do departamento |
| parentId | string | ❌ | ID do departamento pai (para hierarquia) |
| managerId | string | ❌ | ID do colaborador gestor do departamento |
| active | boolean | ❌ | Status (padrão: true) |

#### Response (201 Created)

```json
{
  "id": "department-uuid",
  "companyId": "company-uuid",
  "code": "TI-DEV",
  "name": "Desenvolvimento",
  "description": "Equipe de desenvolvimento de software",
  "parentId": "ti-department-uuid",
  "managerId": "manager-uuid",
  "active": true,
  "_count": {
    "employees": 0,
    "children": 0
  },
  "createdAt": "2025-11-08T10:00:00.000Z",
  "updatedAt": "2025-11-08T10:00:00.000Z"
}
```

---

### 2. Listar Departamentos

**GET** `/departments?active=true`

**Permissão**: `departments.read`

#### Query Parameters

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| active | boolean | Filtrar por status (true/false) |

#### Response (200 OK)

```json
[
  {
    "id": "dept-uuid-1",
    "code": "TI",
    "name": "Tecnologia da Informação",
    "description": "Departamento de TI",
    "parentId": null,
    "parent": null,
    "managerId": "manager-uuid",
    "manager": {
      "id": "manager-uuid",
      "name": "Carlos Alberto",
      "email": "carlos@empresa.com"
    },
    "active": true,
    "_count": {
      "employees": 15,
      "children": 3
    }
  },
  {
    "id": "dept-uuid-2",
    "code": "TI-DEV",
    "name": "Desenvolvimento",
    "parentId": "dept-uuid-1",
    "parent": {
      "id": "dept-uuid-1",
      "code": "TI",
      "name": "Tecnologia da Informação"
    },
    "active": true,
    "_count": {
      "employees": 10,
      "children": 2
    }
  }
]
```

---

### 3. Buscar Departamento por ID

**GET** `/departments/{id}`

**Permissão**: `departments.read`

#### Response (200 OK)

```json
{
  "id": "department-uuid",
  "companyId": "company-uuid",
  "code": "TI",
  "name": "Tecnologia da Informação",
  "description": "Departamento de TI",
  "parentId": null,
  "parent": null,
  "managerId": "manager-uuid",
  "manager": {
    "id": "manager-uuid",
    "name": "Carlos Alberto",
    "email": "carlos@empresa.com",
    "position": {
      "name": "Gerente de TI"
    }
  },
  "children": [
    {
      "id": "child-uuid-1",
      "code": "TI-DEV",
      "name": "Desenvolvimento",
      "_count": {
        "employees": 10
      }
    },
    {
      "id": "child-uuid-2",
      "code": "TI-INF",
      "name": "Infraestrutura",
      "_count": {
        "employees": 3
      }
    }
  ],
  "employees": [
    {
      "id": "employee-uuid",
      "name": "João Silva",
      "email": "joao@empresa.com",
      "active": true,
      "position": {
        "id": "position-uuid",
        "code": "DEV-SR",
        "name": "Desenvolvedor Sênior"
      }
    }
  ],
  "_count": {
    "employees": 15,
    "children": 3
  },
  "active": true,
  "createdAt": "2025-11-08T10:00:00.000Z",
  "updatedAt": "2025-11-08T10:00:00.000Z"
}
```

---

### 4. Atualizar Departamento

**PATCH** `/departments/{id}`

**Permissão**: `departments.update`

#### Request Body

```json
{
  "name": "Tecnologia e Inovação",
  "managerId": "new-manager-uuid",
  "description": "Departamento responsável por TI e inovação"
}
```

#### Response (200 OK)

```json
{
  "id": "department-uuid",
  "code": "TI",
  "name": "Tecnologia e Inovação",
  "managerId": "new-manager-uuid",
  "updatedAt": "2025-11-08T11:30:00.000Z"
}
```

#### Erro (400 Bad Request - Referência Circular)

```json
{
  "statusCode": 400,
  "message": "Circular reference detected: parent department cannot be a child of this department"
}
```

---

### 5. Excluir Departamento

**DELETE** `/departments/{id}`

**Permissão**: `departments.delete`

#### Response (200 OK)

```json
{
  "message": "Department deleted successfully"
}
```

#### Erro (400 Bad Request - Colaboradores Vinculados)

```json
{
  "statusCode": 400,
  "message": "Cannot delete department with 15 employees. Please reassign employees first."
}
```

#### Erro (400 Bad Request - Sub-Departamentos)

```json
{
  "statusCode": 400,
  "message": "Cannot delete department with 3 sub-departments. Please reassign or delete sub-departments first."
}
```

---

## �👤 Colaboradores

### 1. Criar Colaborador

**POST** `/employees`

**Permissão**: `employees.create`

#### Request Body

```json
{
  "costCenterId": "uuid-do-centro-custo",
  "positionId": "uuid-do-cargo",
  "departmentId": "uuid-do-departamento",
  "name": "João Silva Santos",
  "cpf": "12345678900",
  "rg": "123456789",
  "birthDate": "1990-05-15",
  "gender": "MALE",
  "maritalStatus": "MARRIED",
  "email": "joao.silva@empresa.com",
  "phone": "1133334444",
  "mobile": "11987654321",
  "zipCode": "01310100",
  "street": "Av Paulista",
  "number": "1000",
  "complement": "Apto 101",
  "neighborhood": "Bela Vista",
  "city": "São Paulo",
  "state": "SP",
  "admissionDate": "2023-01-15",
  "contractType": "CLT",
  "workSchedule": {
    "monday": {
      "isWorkDay": true,
      "startTime": "08:00",
      "endTime": "18:00",
      "breakStartTime": "12:00",
      "breakEndTime": "13:00"
    },
    "tuesday": {
      "isWorkDay": true,
      "startTime": "08:00",
      "endTime": "18:00",
      "breakStartTime": "12:00",
      "breakEndTime": "13:00"
    },
    "wednesday": {
      "isWorkDay": true,
      "startTime": "08:00",
      "endTime": "18:00",
      "breakStartTime": "12:00",
      "breakEndTime": "13:00"
    },
    "thursday": {
      "isWorkDay": true,
      "startTime": "08:00",
      "endTime": "18:00",
      "breakStartTime": "12:00",
      "breakEndTime": "13:00"
    },
    "friday": {
      "isWorkDay": true,
      "startTime": "08:00",
      "endTime": "18:00",
      "breakStartTime": "12:00",
      "breakEndTime": "13:00"
    },
    "saturday": {
      "isWorkDay": false
    },
    "sunday": {
      "isWorkDay": false
    },
    "weeklyHours": 44,
    "generalNotes": "Jornada comercial padrão"
  },
  "salary": 8500.00,
  "bankCode": "001",
  "bankName": "Banco do Brasil",
  "agency": "1234",
  "account": "123456-7",
  "accountType": "CORRENTE",
  "pixKey": "joao.silva@empresa.com",
  "notes": "Colaborador experiente em Node.js e React"
}
```

#### Response (201 Created)

```json
{
  "id": "employee-uuid",
  "companyId": "company-uuid",
  "costCenterId": "cost-center-uuid",
  "costCenter": {
    "id": "cost-center-uuid",
    "code": "001.001",
    "name": "TI - Desenvolvimento"
  },
  "name": "João Silva Santos",
  "cpf": "12345678900",
  "position": "Desenvolvedor Sênior",
  "department": "TI",
  "admissionDate": "2023-01-15T00:00:00Z",
  "salary": "8500.00",
  "contractType": "CLT",
  "active": true,
  "createdAt": "2025-11-08T10:00:00Z",
  "updatedAt": "2025-11-08T10:00:00Z"
}
```

---

### 2. Listar Colaboradores

**GET** `/employees`

**Permissão**: `employees.read`

#### Query Parameters

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `active` | boolean | Filtrar por status (true/false) |
| `costCenterId` | string | Filtrar por centro de custo |
| `department` | string | Filtrar por departamento |
| `contractType` | string | CLT, PJ, ESTAGIO, TEMPORARIO, AUTONOMO |
| `search` | string | Buscar por nome, CPF, cargo |
| `page` | number | Página (default: 1) |
| `limit` | number | Itens por página (default: 50) |

#### Response (200 OK)

```json
{
  "data": [
    {
      "id": "employee-uuid-1",
      "name": "João Silva Santos",
      "cpf": "12345678900",
      "position": "Desenvolvedor Sênior",
      "department": "TI",
      "admissionDate": "2023-01-15",
      "salary": "8500.00",
      "contractType": "CLT",
      "active": true,
      "costCenter": {
        "id": "cost-center-uuid",
        "code": "001.001",
        "name": "TI - Desenvolvimento"
      }
    },
    {
      "id": "employee-uuid-2",
      "name": "Maria Oliveira Costa",
      "cpf": "98765432100",
      "position": "Analista Financeiro",
      "department": "Financeiro",
      "admissionDate": "2022-06-10",
      "salary": "6500.00",
      "contractType": "CLT",
      "active": true,
      "costCenter": {
        "id": "cost-center-uuid-2",
        "code": "001.002",
        "name": "Financeiro"
      }
    }
  ],
  "total": 45,
  "page": 1,
  "limit": 50,
  "totalPages": 1
}
```

---

### 3. Estatísticas de Colaboradores

**GET** `/employees/stats`

**Permissão**: `employees.read`

#### Response (200 OK)

```json
{
  "total": 45,
  "active": 42,
  "inactive": 3,
  "byContractType": {
    "CLT": 35,
    "PJ": 8,
    "ESTAGIO": 2,
    "TEMPORARIO": 0,
    "AUTONOMO": 0
  },
  "byDepartment": {
    "TI": 12,
    "Financeiro": 8,
    "RH": 5,
    "Comercial": 10,
    "Operacional": 10
  },
  "totalPayroll": "287500.00",
  "averageSalary": "6388.89"
}
```

---

### 4. Buscar Colaborador por ID

**GET** `/employees/:id`

**Permissão**: `employees.read`

#### Response (200 OK)

```json
{
  "id": "employee-uuid",
  "companyId": "company-uuid",
  "costCenterId": "cost-center-uuid",
  "costCenter": {
    "id": "cost-center-uuid",
    "code": "001.001",
    "name": "TI - Desenvolvimento"
  },
  "name": "João Silva Santos",
  "cpf": "12345678900",
  "rg": "123456789",
  "birthDate": "1990-05-15",
  "gender": "MALE",
  "maritalStatus": "MARRIED",
  "email": "joao.silva@empresa.com",
  "phone": "1133334444",
  "mobile": "11987654321",
  "zipCode": "01310100",
  "street": "Av Paulista",
  "number": "1000",
  "complement": "Apto 101",
  "neighborhood": "Bela Vista",
  "city": "São Paulo",
  "state": "SP",
  "position": "Desenvolvedor Sênior",
  "department": "TI",
  "admissionDate": "2023-01-15",
  "contractType": "CLT",
  "workSchedule": "08:00-17:00 (Seg-Sex)",
  "salary": "8500.00",
  "bankCode": "001",
  "bankName": "Banco do Brasil",
  "agency": "1234",
  "account": "123456-7",
  "accountType": "CORRENTE",
  "pixKey": "joao.silva@empresa.com",
  "active": true,
  "notes": "Colaborador experiente",
  "earnings": [
    {
      "id": "earning-uuid",
      "earningTypeId": "earning-type-uuid",
      "earningType": {
        "code": "HE50",
        "name": "Hora Extra 50%"
      },
      "isRecurrent": true,
      "value": null,
      "percentage": "50.00",
      "startDate": "2023-01-15",
      "active": true
    }
  ],
  "createdAt": "2023-01-15T10:00:00Z",
  "updatedAt": "2025-11-08T10:00:00Z"
}
```

---

### 5. Atualizar Colaborador

**PATCH** `/employees/:id`

**Permissão**: `employees.update`

#### Request Body

```json
{
  "position": "Desenvolvedor Pleno",
  "salary": 9000.00,
  "mobile": "11999887766",
  "notes": "Promovido em novembro/2025"
}
```

#### Response (200 OK)

```json
{
  "id": "employee-uuid",
  "name": "João Silva Santos",
  "position": "Desenvolvedor Pleno",
  "salary": "9000.00",
  "mobile": "11999887766",
  "updatedAt": "2025-11-08T10:30:00Z"
}
```

---

### 6. Deletar Colaborador

**DELETE** `/employees/:id`

**Permissão**: `employees.delete`

#### Response (200 OK)

```json
{
  "message": "Colaborador deletado com sucesso"
}
```

---

### 7. Ativar/Desativar Colaborador

**PATCH** `/employees/:id/toggle-active`

**Permissão**: `employees.update`

#### Response (200 OK)

```json
{
  "id": "employee-uuid",
  "name": "João Silva Santos",
  "active": false,
  "updatedAt": "2025-11-08T10:45:00Z"
}
```

---

### 8. Demitir Colaborador

**PATCH** `/employees/:id/dismiss`

**Permissão**: `employees.update`

#### Request Body

```json
{
  "dismissalDate": "2025-11-30",
  "notes": "Pedido de demissão"
}
```

#### Response (200 OK)

```json
{
  "id": "employee-uuid",
  "name": "João Silva Santos",
  "dismissalDate": "2025-11-30",
  "active": false,
  "updatedAt": "2025-11-08T11:00:00Z"
}
```

---

### 9. Criar Colaborador PJ

**POST** `/employees`

**Permissão**: `employees.create`

Para colaboradores PJ, além dos campos básicos, você pode incluir informações da empresa:

#### Request Body

```json
{
  "costCenterId": "uuid-do-centro-custo",
  "name": "Maria Consultoria LTDA",
  "cpf": "98765432100",
  "position": "Consultor Senior",
  "department": "Consultoria",
  "admissionDate": "2023-01-15",
  "contractType": "PJ",
  "salary": 15000.00,
  "companyDocument": "12345678000190",
  "companyName": "Maria Consultoria LTDA",
  "companyTradeName": "Maria Consulting",
  "companyStateRegistration": "123456789",
  "companyMunicipalRegistration": "987654",
  "companyEmail": "contato@mariaconsulting.com",
  "companyPhone": "1133334444",
  "companyZipCode": "01310100",
  "companyStreet": "Av Paulista",
  "companyNumber": "2000",
  "companyComplement": "Sala 501",
  "companyNeighborhood": "Bela Vista",
  "companyCity": "São Paulo",
  "companyState": "SP",
  "bankCode": "001",
  "bankName": "Banco do Brasil",
  "agency": "1234",
  "account": "123456-7",
  "accountType": "CORRENTE",
  "pixKey": "12345678000190",
  "notes": "Empresa especializada em consultoria de TI"
}
```

#### Response (201 Created)

```json
{
  "id": "employee-uuid",
  "name": "Maria Consultoria LTDA",
  "cpf": "98765432100",
  "position": "Consultor Senior",
  "contractType": "PJ",
  "salary": "15000.00",
  "companyDocument": "12345678000190",
  "companyName": "Maria Consultoria LTDA",
  "companyTradeName": "Maria Consulting",
  "active": true,
  "createdAt": "2025-11-08T10:00:00Z"
}
```

---

## 📄 Documentos de Colaboradores

### 1. Upload de Documento

**POST** `/employees/:employeeId/documents`

**Permissão**: `employees.update`

**Content-Type**: `multipart/form-data`

#### Form Data

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `file` | File | Arquivo (PDF, JPG, PNG, DOC, DOCX) |
| `documentType` | string | Tipo do documento |
| `description` | string | Descrição opcional |
| `documentNumber` | string | Número do documento (se aplicável) |
| `issueDate` | date | Data de emissão |
| `expiryDate` | date | Data de validade |

#### Tipos de Documento

- `RG` - Registro Geral
- `CPF` - Cadastro de Pessoa Física
- `CNH` - Carteira Nacional de Habilitação
- `CTPS` - Carteira de Trabalho
- `TITULO_ELEITOR` - Título de Eleitor
- `CERTIFICADO_RESERVISTA` - Certificado de Reservista
- `COMPROVANTE_RESIDENCIA` - Comprovante de Residência
- `DIPLOMA` - Diploma
- `CERTIFICADO` - Certificado
- `CONTRATO` - Contrato de Trabalho
- `EXAME_ADMISSIONAL` - Exame Admissional
- `ASO` - Atestado de Saúde Ocupacional
- `ATESTADO` - Atestado Médico
- `CONTRATO_SOCIAL` - Contrato Social (para PJ)
- `CNPJ` - Cartão CNPJ (para PJ)
- `ALVARA` - Alvará de Funcionamento (para PJ)
- `OUTROS` - Outros documentos

#### Response (201 Created)

```json
{
  "id": "document-uuid",
  "employeeId": "employee-uuid",
  "documentType": "RG",
  "name": "RG - João Silva Santos",
  "description": "Documento de identidade",
  "documentNumber": "12.345.678-9",
  "issueDate": "2015-05-10",
  "expiryDate": null,
  "fileUrl": "https://storage.example.com/documents/rg-joao-silva.pdf",
  "fileName": "rg-joao-silva.pdf",
  "fileSize": 1024000,
  "mimeType": "application/pdf",
  "verified": false,
  "active": true,
  "uploadedBy": {
    "id": "user-uuid",
    "name": "Admin User"
  },
  "createdAt": "2025-11-08T10:00:00Z"
}
```

---

### 2. Listar Documentos do Colaborador

**GET** `/employees/:employeeId/documents`

**Permissão**: `employees.read`

#### Query Parameters

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `documentType` | string | Filtrar por tipo |
| `verified` | boolean | Filtrar por verificados |
| `active` | boolean | Filtrar por ativos |

#### Response (200 OK)

```json
{
  "data": [
    {
      "id": "document-uuid-1",
      "documentType": "RG",
      "name": "RG - João Silva Santos",
      "documentNumber": "12.345.678-9",
      "issueDate": "2015-05-10",
      "fileUrl": "https://storage.example.com/documents/rg-joao-silva.pdf",
      "fileName": "rg-joao-silva.pdf",
      "verified": true,
      "createdAt": "2025-11-08T10:00:00Z"
    },
    {
      "id": "document-uuid-2",
      "documentType": "CTPS",
      "name": "Carteira de Trabalho",
      "documentNumber": "1234567",
      "issueDate": "2010-03-15",
      "fileUrl": "https://storage.example.com/documents/ctps-joao-silva.pdf",
      "fileName": "ctps-joao-silva.pdf",
      "verified": true,
      "createdAt": "2025-11-08T10:00:00Z"
    }
  ],
  "total": 8
}
```

---

### 3. Buscar Documento por ID

**GET** `/employees/:employeeId/documents/:documentId`

**Permissão**: `employees.read`

#### Response (200 OK)

```json
{
  "id": "document-uuid",
  "employeeId": "employee-uuid",
  "employee": {
    "id": "employee-uuid",
    "name": "João Silva Santos",
    "cpf": "12345678900"
  },
  "documentType": "RG",
  "name": "RG - João Silva Santos",
  "description": "Documento de identidade",
  "documentNumber": "12.345.678-9",
  "issueDate": "2015-05-10",
  "expiryDate": null,
  "fileUrl": "https://storage.example.com/documents/rg-joao-silva.pdf",
  "fileName": "rg-joao-silva.pdf",
  "fileSize": 1024000,
  "mimeType": "application/pdf",
  "verified": true,
  "active": true,
  "notes": "Documento verificado em 08/11/2025",
  "uploadedBy": {
    "id": "user-uuid",
    "name": "Admin User"
  },
  "createdAt": "2025-11-08T10:00:00Z",
  "updatedAt": "2025-11-08T10:30:00Z"
}
```

---

### 4. Atualizar Documento

**PATCH** `/employees/:employeeId/documents/:documentId`

**Permissão**: `employees.update`

#### Request Body

```json
{
  "description": "Documento atualizado",
  "documentNumber": "12.345.678-9",
  "expiryDate": "2030-12-31",
  "verified": true,
  "notes": "Documento verificado e aprovado"
}
```

#### Response (200 OK)

```json
{
  "id": "document-uuid",
  "verified": true,
  "notes": "Documento verificado e aprovado",
  "updatedAt": "2025-11-08T11:00:00Z"
}
```

---

### 5. Marcar Documento como Verificado

**PATCH** `/employees/:employeeId/documents/:documentId/verify`

**Permissão**: `employees.update`

#### Response (200 OK)

```json
{
  "id": "document-uuid",
  "verified": true,
  "updatedAt": "2025-11-08T11:00:00Z"
}
```

---

### 6. Deletar Documento

**DELETE** `/employees/:employeeId/documents/:documentId`

**Permissão**: `employees.delete`

#### Response (200 OK)

```json
{
  "message": "Documento deletado com sucesso"
}
```

---

### 7. Download de Documento

**GET** `/employees/:employeeId/documents/:documentId/download`

**Permissão**: `employees.read`

Retorna o arquivo do documento para download.

---

## 🏢 Centros de Custo

### 1. Criar Centro de Custo

**POST** `/cost-centers`

**Permissão**: `cost_centers.create`

#### Request Body

```json
{
  "parentId": "parent-uuid",
  "code": "001.001",
  "name": "TI - Desenvolvimento",
  "description": "Setor de desenvolvimento de software",
  "type": "EXPENSE"
}
```

#### Response (201 Created)

```json
{
  "id": "cost-center-uuid",
  "companyId": "company-uuid",
  "parentId": "parent-uuid",
  "parent": {
    "id": "parent-uuid",
    "code": "001",
    "name": "TI"
  },
  "code": "001.001",
  "name": "TI - Desenvolvimento",
  "description": "Setor de desenvolvimento de software",
  "type": "EXPENSE",
  "active": true,
  "createdAt": "2025-11-08T10:00:00Z"
}
```

---

### 2. Listar Centros de Custo

**GET** `/cost-centers`

**Permissão**: `cost_centers.read`

#### Query Parameters

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `active` | boolean | Filtrar por status |
| `type` | string | REVENUE, EXPENSE, INVESTMENT |
| `parentId` | string | Filtrar por centro pai |
| `search` | string | Buscar por código ou nome |

#### Response (200 OK)

```json
{
  "data": [
    {
      "id": "cost-center-uuid-1",
      "code": "001",
      "name": "Administrativo",
      "type": "EXPENSE",
      "active": true,
      "childrenCount": 3,
      "employeesCount": 15
    },
    {
      "id": "cost-center-uuid-2",
      "code": "001.001",
      "name": "TI - Desenvolvimento",
      "type": "EXPENSE",
      "active": true,
      "parent": {
        "code": "001",
        "name": "Administrativo"
      },
      "childrenCount": 0,
      "employeesCount": 12
    }
  ],
  "total": 8
}
```

---

### 3. Hierarquia de Centros de Custo

**GET** `/cost-centers/hierarchy`

**Permissão**: `cost_centers.read`

#### Response (200 OK)

```json
{
  "data": [
    {
      "id": "cost-center-uuid-1",
      "code": "001",
      "name": "Administrativo",
      "type": "EXPENSE",
      "employeesCount": 3,
      "children": [
        {
          "id": "cost-center-uuid-2",
          "code": "001.001",
          "name": "TI - Desenvolvimento",
          "type": "EXPENSE",
          "employeesCount": 12,
          "children": []
        },
        {
          "id": "cost-center-uuid-3",
          "code": "001.002",
          "name": "Financeiro",
          "type": "EXPENSE",
          "employeesCount": 8,
          "children": []
        }
      ]
    },
    {
      "id": "cost-center-uuid-4",
      "code": "002",
      "name": "Operacional",
      "type": "EXPENSE",
      "employeesCount": 22,
      "children": []
    }
  ]
}
```

---

### 4. Buscar Centro de Custo por ID

**GET** `/cost-centers/:id`

**Permissão**: `cost_centers.read`

#### Response (200 OK)

```json
{
  "id": "cost-center-uuid",
  "companyId": "company-uuid",
  "parentId": "parent-uuid",
  "parent": {
    "id": "parent-uuid",
    "code": "001",
    "name": "Administrativo"
  },
  "code": "001.001",
  "name": "TI - Desenvolvimento",
  "description": "Setor de desenvolvimento de software",
  "type": "EXPENSE",
  "active": true,
  "children": [],
  "employees": [
    {
      "id": "employee-uuid",
      "name": "João Silva Santos",
      "position": "Desenvolvedor Sênior"
    }
  ],
  "createdAt": "2025-01-15T10:00:00Z",
  "updatedAt": "2025-11-08T10:00:00Z"
}
```

---

### 5. Atualizar Centro de Custo

**PATCH** `/cost-centers/:id`

**Permissão**: `cost_centers.update`

---

### 6. Deletar Centro de Custo

**DELETE** `/cost-centers/:id`

**Permissão**: `cost_centers.delete`

**Observação**: Só pode deletar se não houver colaboradores vinculados

---

## 💰 Tipos de Proventos

### 1. Criar Tipo de Provento

**POST** `/earning-types`

**Permissão**: `earning_types.create`

#### Request Body

```json
{
  "code": "HE50",
  "name": "Hora Extra 50%",
  "description": "Adicional de 50% sobre hora normal",
  "isRecurrent": false,
  "isPercentage": true,
  "baseValue": null,
  "hasINSS": true,
  "hasFGTS": true,
  "hasIRRF": true
}
```

#### Response (201 Created)

```json
{
  "id": "earning-type-uuid",
  "companyId": "company-uuid",
  "code": "HE50",
  "name": "Hora Extra 50%",
  "description": "Adicional de 50% sobre hora normal",
  "isRecurrent": false,
  "isPercentage": true,
  "baseValue": null,
  "hasINSS": true,
  "hasFGTS": true,
  "hasIRRF": true,
  "active": true,
  "createdAt": "2025-11-08T10:00:00Z"
}
```

---

### 2. Listar Tipos de Proventos

**GET** `/earning-types`

**Permissão**: `earning_types.read`

#### Query Parameters

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `active` | boolean | Filtrar por status |
| `isRecurrent` | boolean | Filtrar recorrentes |
| `search` | string | Buscar por código ou nome |

#### Response (200 OK)

```json
{
  "data": [
    {
      "id": "earning-type-uuid-1",
      "code": "SALARY",
      "name": "Salário Base",
      "isRecurrent": true,
      "isPercentage": false,
      "active": true
    },
    {
      "id": "earning-type-uuid-2",
      "code": "HE50",
      "name": "Hora Extra 50%",
      "isRecurrent": false,
      "isPercentage": true,
      "active": true
    },
    {
      "id": "earning-type-uuid-3",
      "code": "NIGHT",
      "name": "Adicional Noturno",
      "isRecurrent": true,
      "isPercentage": false,
      "baseValue": "500.00",
      "active": true
    }
  ],
  "total": 15
}
```

---

### 3. Buscar Tipo de Provento por ID

**GET** `/earning-types/:id`

**Permissão**: `earning_types.read`

---

### 4. Atualizar Tipo de Provento

**PATCH** `/earning-types/:id`

**Permissão**: `earning_types.update`

---

### 5. Deletar Tipo de Provento

**DELETE** `/earning-types/:id`

**Permissão**: `earning_types.delete`

**Observação**: Só pode deletar se não houver colaboradores com este provento

---

## 📉 Tipos de Descontos

### 1. Criar Tipo de Desconto

**POST** `/deduction-types`

**Permissão**: `deduction_types.create`

#### Request Body

```json
{
  "code": "VT",
  "name": "Vale Transporte",
  "description": "Desconto de 6% para vale transporte",
  "isRecurrent": true,
  "isPercentage": true,
  "baseValue": 6.00
}
```

#### Response (201 Created)

```json
{
  "id": "deduction-type-uuid",
  "companyId": "company-uuid",
  "code": "VT",
  "name": "Vale Transporte",
  "description": "Desconto de 6% para vale transporte",
  "isRecurrent": true,
  "isPercentage": true,
  "baseValue": "6.00",
  "active": true,
  "createdAt": "2025-11-08T10:00:00Z"
}
```

---

### 2. Listar Tipos de Descontos

**GET** `/deduction-types`

**Permissão**: `deduction_types.read`

#### Response (200 OK)

```json
{
  "data": [
    {
      "id": "deduction-type-uuid-1",
      "code": "INSS",
      "name": "INSS",
      "isRecurrent": true,
      "isPercentage": true,
      "active": true
    },
    {
      "id": "deduction-type-uuid-2",
      "code": "VT",
      "name": "Vale Transporte",
      "isRecurrent": true,
      "isPercentage": true,
      "baseValue": "6.00",
      "active": true
    }
  ],
  "total": 8
}
```

---

### 3. Buscar, Atualizar e Deletar

Similares aos endpoints de Tipos de Proventos.

---

## 💵 Proventos de Colaboradores

### 1. Adicionar Provento ao Colaborador

**POST** `/employees/:employeeId/earnings`

**Permissão**: `employee_earnings.create`

#### Request Body

```json
{
  "earningTypeId": "earning-type-uuid",
  "isRecurrent": true,
  "value": 500.00,
  "percentage": null,
  "startDate": "2025-11-01",
  "endDate": null
}
```

#### Response (201 Created)

```json
{
  "id": "employee-earning-uuid",
  "employeeId": "employee-uuid",
  "earningTypeId": "earning-type-uuid",
  "earningType": {
    "code": "NIGHT",
    "name": "Adicional Noturno"
  },
  "isRecurrent": true,
  "value": "500.00",
  "percentage": null,
  "startDate": "2025-11-01",
  "endDate": null,
  "active": true,
  "createdAt": "2025-11-08T10:00:00Z"
}
```

---

### 2. Listar Proventos do Colaborador

**GET** `/employees/:employeeId/earnings`

**Permissão**: `employee_earnings.read`

#### Response (200 OK)

```json
{
  "data": [
    {
      "id": "employee-earning-uuid-1",
      "earningType": {
        "code": "NIGHT",
        "name": "Adicional Noturno"
      },
      "isRecurrent": true,
      "value": "500.00",
      "startDate": "2025-11-01",
      "active": true
    },
    {
      "id": "employee-earning-uuid-2",
      "earningType": {
        "code": "HE50",
        "name": "Hora Extra 50%"
      },
      "isRecurrent": false,
      "percentage": "50.00",
      "startDate": "2023-01-15",
      "active": true
    }
  ],
  "total": 2
}
```

---

### 3. Atualizar Provento do Colaborador

**PATCH** `/employees/:employeeId/earnings/:earningId`

**Permissão**: `employee_earnings.update`

---

### 4. Remover Provento do Colaborador

**DELETE** `/employees/:employeeId/earnings/:earningId`

**Permissão**: `employee_earnings.delete`

---

## � Tabelas Fiscais (INSS, FGTS, IRRF)

As tabelas fiscais permitem configurar as alíquotas e faixas de INSS, FGTS e IRRF para cada ano/mês, garantindo que os cálculos da folha de pagamento estejam sempre atualizados conforme a legislação.

### 1. Criar Tabela de INSS

**POST** `/tax-tables/inss`

**Permissão**: `tax_tables.create`

#### Request Body

```json
{
  "referenceYear": 2025,
  "referenceMonth": 1,
  "active": true,
  "brackets": [
    {
      "upTo": 1412.00,
      "employeeRate": 7.5,
      "employerRate": 20.0
    },
    {
      "upTo": 2666.68,
      "employeeRate": 9.0,
      "employerRate": 20.0
    },
    {
      "upTo": 4000.03,
      "employeeRate": 12.0,
      "employerRate": 20.0
    },
    {
      "upTo": 7786.02,
      "employeeRate": 14.0,
      "employerRate": 20.0
    }
  ]
}
```

#### Campos

| Campo | Tipo | Descrição |
|-------|------|-----------|
| referenceYear | number | Ano de referência |
| referenceMonth | number | Mês de referência (1-12) |
| active | boolean | Se está ativa |
| brackets | array | Faixas progressivas do INSS |
| brackets[].upTo | number | Valor máximo da faixa |
| brackets[].employeeRate | number | Alíquota do empregado (%) |
| brackets[].employerRate | number | Alíquota do empregador (%) |

#### Response (201 Created)

```json
{
  "id": "inss-table-uuid",
  "companyId": "company-uuid",
  "referenceYear": 2025,
  "referenceMonth": 1,
  "active": true,
  "brackets": [...],
  "createdAt": "2025-11-08T10:00:00.000Z",
  "updatedAt": "2025-11-08T10:00:00.000Z"
}
```

---

### 2. Criar Tabela de FGTS

**POST** `/tax-tables/fgts`

**Permissão**: `tax_tables.create`

#### Request Body

```json
{
  "year": 2025,
  "active": true,
  "rates": [
    {
      "positionId": "cm3pos123456",
      "monthlyRate": 8.0,
      "terminationRate": 40.0
    },
    {
      "positionId": "cm3pos789012",
      "monthlyRate": 2.0,
      "terminationRate": 40.0
    },
    {
      "positionId": "cm3pos345678",
      "monthlyRate": 0.0,
      "terminationRate": 0.0
    }
  ]
}
```

#### Campos

| Campo | Tipo | Descrição |
|-------|------|-----------|
| year | number | Ano de referência |
| active | boolean | Se está ativa |
| rates | array | Alíquotas por cargo |
| rates[].positionId | string | ID do cargo cadastrado |
| rates[].monthlyRate | number | Alíquota mensal (%) |
| rates[].terminationRate | number | Alíquota de rescisão (%) |

**⚠️ Nota**: A tabela FGTS agora é baseada em **cargos** da empresa. Você deve primeiro criar os cargos através de `/positions` antes de configurar as alíquotas do FGTS.

#### Response (201 Created)

```json
{
  "id": "fgts-table-uuid",
  "companyId": "company-uuid",
  "year": 2025,
  "active": true,
  "rates": [
    {
      "positionId": "cm3pos123456",
      "positionName": "Desenvolvedor Sênior",
      "positionCode": "DEV-SR",
      "monthlyRate": 8.0,
      "terminationRate": 40.0
    }
  ],
  "createdAt": "2025-11-08T10:00:00.000Z"
}
```

---

### 3. Criar Tabela de IRRF

**POST** `/tax-tables/irrf`

**Permissão**: `tax_tables.create`

#### Request Body

```json
{
  "referenceYear": 2025,
  "referenceMonth": 1,
  "active": true,
  "brackets": [
    {
      "upTo": 2259.20,
      "rate": 0.0,
      "deduction": 0.0
    },
    {
      "upTo": 2826.65,
      "rate": 7.5,
      "deduction": 169.44
    },
    {
      "upTo": 3751.05,
      "rate": 15.0,
      "deduction": 381.44
    },
    {
      "upTo": 4664.68,
      "rate": 22.5,
      "deduction": 662.77
    },
    {
      "upTo": null,
      "rate": 27.5,
      "deduction": 896.00
    }
  ],
  "dependentDeduction": 189.59
}
```

#### Campos

| Campo | Tipo | Descrição |
|-------|------|-----------|
| referenceYear | number | Ano de referência |
| referenceMonth | number | Mês de referência (1-12) |
| active | boolean | Se está ativa |
| brackets | array | Faixas progressivas do IRRF |
| brackets[].upTo | number\|null | Valor máximo da faixa (null = sem limite) |
| brackets[].rate | number | Alíquota (%) |
| brackets[].deduction | number | Dedução em R$ |
| dependentDeduction | number | Dedução por dependente (R$) |

#### Response (201 Created)

```json
{
  "id": "irrf-table-uuid",
  "companyId": "company-uuid",
  "referenceYear": 2025,
  "referenceMonth": 1,
  "active": true,
  "brackets": [...],
  "dependentDeduction": 189.59,
  "createdAt": "2025-11-08T10:00:00.000Z"
}
```

---

### 4. Listar Tabelas Fiscais

#### Listar Tabelas de INSS

**GET** `/tax-tables/inss?active=true&year=2025`

**Permissão**: `tax_tables.read`

#### Listar Tabelas de FGTS

**GET** `/tax-tables/fgts?active=true&year=2025`

**Permissão**: `tax_tables.read`

#### Listar Tabelas de IRRF

**GET** `/tax-tables/irrf?active=true&year=2025`

**Permissão**: `tax_tables.read`

#### Query Parameters

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| active | boolean | Filtrar por status |
| year | number | Filtrar por ano |
| month | number | Filtrar por mês |

---

### 5. Buscar Tabela Ativa

#### INSS Ativa

**GET** `/tax-tables/inss/active?year=2025&month=11`

**Permissão**: `tax_tables.read`

Retorna a tabela de INSS ativa para o ano/mês especificado.

#### FGTS Ativa

**GET** `/tax-tables/fgts/active?year=2025&month=11`

**Permissão**: `tax_tables.read`

#### IRRF Ativa

**GET** `/tax-tables/irrf/active?year=2025&month=11`

**Permissão**: `tax_tables.read`

---

### 6. Atualizar Tabela Fiscal

**PATCH** `/tax-tables/inss/{id}`  
**PATCH** `/tax-tables/fgts/{id}`  
**PATCH** `/tax-tables/irrf/{id}`

**Permissão**: `tax_tables.update`

#### Request Body (Exemplo INSS)

```json
{
  "active": false,
  "brackets": [...]
}
```

---

### 7. Excluir Tabela Fiscal

**DELETE** `/tax-tables/inss/{id}`  
**DELETE** `/tax-tables/fgts/{id}`  
**DELETE** `/tax-tables/irrf/{id}`

**Permissão**: `tax_tables.delete`

#### Response (200 OK)

```json
{
  "message": "Tax table deleted successfully"
}
```

---

### 💡 Como o Cálculo Funciona

#### INSS Progressivo

O INSS é calculado de forma **progressiva** (por faixas):

```
Salário: R$ 3.000,00

Faixa 1 (até R$ 1.412,00): R$ 1.412,00 × 7,5% = R$ 105,90
Faixa 2 (até R$ 2.666,68): R$ 1.254,68 × 9,0% = R$ 112,92
Faixa 3 (até R$ 4.000,03): R$ 333,32 × 12,0% = R$ 39,99

Total INSS Empregado: R$ 258,81
```

#### FGTS

O FGTS é calculado sobre o salário bruto:

```
Salário: R$ 3.000,00
FGTS (8%): R$ 3.000,00 × 8% = R$ 240,00
```

#### IRRF Progressivo

O IRRF é calculado após deduzir INSS e dependentes:

```
Salário: R$ 3.000,00
(-) INSS: R$ 258,81
(-) Dependentes (2 × R$ 189,59): R$ 379,18
Base de Cálculo: R$ 2.362,01

Aplica-se a alíquota da faixa: 7,5%
IRRF = (R$ 2.362,01 × 7,5%) - R$ 169,44 = R$ 7,71
```

---

## �📊 Folha de Pagamento

### 1. Criar Folha de Pagamento

**POST** `/payroll`

**Permissão**: `payroll.create`

#### Request Body

```json
{
  "referenceMonth": 11,
  "referenceYear": 2025,
  "type": "MONTHLY",
  "startDate": "2025-11-01",
  "endDate": "2025-11-30",
  "paymentDate": "2025-12-05"
}
```

#### Response (201 Created)

```json
{
  "id": "payroll-uuid",
  "companyId": "company-uuid",
  "referenceMonth": 11,
  "referenceYear": 2025,
  "type": "MONTHLY",
  "startDate": "2025-11-01",
  "endDate": "2025-11-30",
  "paymentDate": "2025-12-05",
  "status": "DRAFT",
  "totalEarnings": "0.00",
  "totalDeductions": "0.00",
  "netAmount": "0.00",
  "createdAt": "2025-11-08T10:00:00Z"
}
```

---

### 2. Listar Folhas de Pagamento

**GET** `/payroll`

**Permissão**: `payroll.read`

#### Query Parameters

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `status` | string | DRAFT, CALCULATED, APPROVED, PAID |
| `type` | string | MONTHLY, DAILY, WEEKLY, ADVANCE |
| `referenceMonth` | number | Mês (1-12) |
| `referenceYear` | number | Ano |
| `page` | number | Página |
| `limit` | number | Itens por página |

#### Response (200 OK)

```json
{
  "data": [
    {
      "id": "payroll-uuid-1",
      "referenceMonth": 11,
      "referenceYear": 2025,
      "type": "MONTHLY",
      "status": "APPROVED",
      "paymentDate": "2025-12-05",
      "totalEarnings": "287500.00",
      "totalDeductions": "58750.00",
      "netAmount": "228750.00",
      "itemsCount": 42,
      "createdAt": "2025-11-01T10:00:00Z"
    },
    {
      "id": "payroll-uuid-2",
      "referenceMonth": 10,
      "referenceYear": 2025,
      "type": "MONTHLY",
      "status": "PAID",
      "paymentDate": "2025-11-05",
      "totalEarnings": "285000.00",
      "totalDeductions": "57500.00",
      "netAmount": "227500.00",
      "itemsCount": 42,
      "createdAt": "2025-10-01T10:00:00Z"
    }
  ],
  "total": 12,
  "page": 1,
  "limit": 50,
  "totalPages": 1
}
```

---

### 3. Buscar Folha de Pagamento por ID

**GET** `/payroll/:id`

**Permissão**: `payroll.read`

#### Response (200 OK)

```json
{
  "id": "payroll-uuid",
  "companyId": "company-uuid",
  "referenceMonth": 11,
  "referenceYear": 2025,
  "type": "MONTHLY",
  "startDate": "2025-11-01",
  "endDate": "2025-11-30",
  "paymentDate": "2025-12-05",
  "status": "CALCULATED",
  "totalEarnings": "287500.00",
  "totalDeductions": "58750.00",
  "netAmount": "228750.00",
  "items": [
    {
      "id": "item-uuid-1",
      "employee": {
        "id": "employee-uuid-1",
        "name": "João Silva Santos",
        "cpf": "12345678900",
        "position": "Desenvolvedor Sênior"
      },
      "baseSalary": "8500.00",
      "workDays": 30,
      "earnings": [
        {
          "typeId": "earning-type-uuid-1",
          "code": "SALARY",
          "name": "Salário Base",
          "value": 8500.00
        },
        {
          "typeId": "earning-type-uuid-2",
          "code": "NIGHT",
          "name": "Adicional Noturno",
          "value": 500.00
        }
      ],
      "totalEarnings": "9000.00",
      "deductions": [
        {
          "typeId": "deduction-type-uuid-1",
          "code": "INSS",
          "name": "INSS",
          "value": 900.00
        },
        {
          "typeId": "deduction-type-uuid-2",
          "code": "IRRF",
          "name": "IRRF",
          "value": 450.00
        },
        {
          "typeId": "deduction-type-uuid-3",
          "code": "VT",
          "name": "Vale Transporte",
          "value": 540.00
        }
      ],
      "totalDeductions": "1890.00",
      "netAmount": "7110.00"
    }
  ],
  "createdBy": {
    "id": "user-uuid",
    "name": "Admin User"
  },
  "createdAt": "2025-11-01T10:00:00Z",
  "updatedAt": "2025-11-08T10:00:00Z"
}
```

---

### 4. Calcular Folha de Pagamento

**POST** `/payroll/:id/calculate`

**Permissão**: `payroll.calculate`

Este endpoint calcula automaticamente a folha para todos os colaboradores ativos:
- Busca salário base de cada colaborador
- Adiciona proventos recorrentes configurados
- Calcula descontos (INSS, IRRF baseado em tabelas)
- Adiciona descontos recorrentes
- Atualiza totais da folha

#### Response (200 OK)

```json
{
  "id": "payroll-uuid",
  "status": "CALCULATED",
  "totalEarnings": "287500.00",
  "totalDeductions": "58750.00",
  "netAmount": "228750.00",
  "itemsCount": 42,
  "message": "Folha calculada com sucesso para 42 colaboradores"
}
```

---

### 5. Adicionar/Editar Item Manualmente

**POST** `/payroll/:id/items`

**Permissão**: `payroll.update`

Permite adicionar ou editar manualmente itens de um colaborador específico:

#### Request Body

```json
{
  "employeeId": "employee-uuid",
  "baseSalary": 8500.00,
  "workDays": 28,
  "earnings": [
    {
      "typeId": "earning-type-uuid-1",
      "code": "SALARY",
      "name": "Salário Base",
      "value": 8500.00
    },
    {
      "typeId": "earning-type-uuid-2",
      "code": "NIGHT",
      "name": "Adicional Noturno",
      "value": 500.00
    },
    {
      "typeId": "earning-type-uuid-3",
      "code": "HE50",
      "name": "Hora Extra 50%",
      "value": 750.00
    }
  ],
  "deductions": [
    {
      "typeId": "deduction-type-uuid-1",
      "code": "INSS",
      "name": "INSS",
      "value": 950.00
    },
    {
      "typeId": "deduction-type-uuid-2",
      "code": "IRRF",
      "name": "IRRF",
      "value": 480.00
    }
  ],
  "notes": "Ajuste manual: falta de 2 dias"
}
```

#### Response (200 OK)

```json
{
  "id": "item-uuid",
  "payrollId": "payroll-uuid",
  "employeeId": "employee-uuid",
  "baseSalary": "8500.00",
  "workDays": 28,
  "totalEarnings": "9750.00",
  "totalDeductions": "1430.00",
  "netAmount": "8320.00",
  "notes": "Ajuste manual: falta de 2 dias",
  "updatedAt": "2025-11-08T11:00:00Z"
}
```

---

### 6. Aprovar Folha de Pagamento

**POST** `/payroll/:id/approve`

**Permissão**: `payroll.approve`

Aprova a folha de pagamento, impedindo alterações:

#### Response (200 OK)

```json
{
  "id": "payroll-uuid",
  "status": "APPROVED",
  "approvedBy": {
    "id": "user-uuid",
    "name": "Manager User"
  },
  "approvedAt": "2025-11-08T11:30:00Z",
  "message": "Folha de pagamento aprovada com sucesso"
}
```

---

### 7. Marcar como Paga

**POST** `/payroll/:id/pay`

**Permissão**: `payroll.approve`

Marca a folha como paga após o pagamento ser realizado:

#### Response (200 OK)

```json
{
  "id": "payroll-uuid",
  "status": "PAID",
  "message": "Folha de pagamento marcada como paga"
}
```

---

### 8. Atualizar Folha de Pagamento

**PATCH** `/payroll/:id`

**Permissão**: `payroll.update`

**Observação**: Só pode atualizar se status = DRAFT

---

### 9. Deletar Folha de Pagamento

**DELETE** `/payroll/:id`

**Permissão**: `payroll.delete`

**Observação**: Só pode deletar se status = DRAFT

---

### 10. Estatísticas de Folha

**GET** `/payroll/stats`

**Permissão**: `payroll.read`

#### Query Parameters

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `year` | number | Ano para estatísticas |

#### Response (200 OK)

```json
{
  "year": 2025,
  "totalPaid": "2735000.00",
  "averageMonthly": "227916.67",
  "byMonth": [
    {
      "month": 1,
      "monthName": "Janeiro",
      "totalEarnings": "285000.00",
      "totalDeductions": "57000.00",
      "netAmount": "228000.00",
      "employeesCount": 42
    },
    {
      "month": 2,
      "monthName": "Fevereiro",
      "totalEarnings": "285000.00",
      "totalDeductions": "57000.00",
      "netAmount": "228000.00",
      "employeesCount": 42
    }
  ],
  "byStatus": {
    "DRAFT": 1,
    "CALCULATED": 0,
    "APPROVED": 1,
    "PAID": 10
  }
}
```

---

### 11. Dashboard de RH

**GET** `/employees/dashboard`

**Permissão**: `employees.read`

Retorna estatísticas consolidadas de RH para dashboard gerencial:

#### Response (200 OK)

```json
{
  "employees": {
    "total": 42,
    "active": 40,
    "inactive": 2
  },
  "payroll": {
    "monthlyTotal": "287500.00",
    "totalCost": "431250.00",
    "averageSalary": "6840.91"
  },
  "charges": {
    "inss": "31625.00",
    "fgts": "23000.00",
    "thirteenthSalary": "23958.33",
    "vacation": "23958.33",
    "others": "41208.34",
    "total": "143750.00",
    "percentage": "50.00"
  },
  "recentHires": [
    {
      "id": "employee-uuid-1",
      "name": "João Silva Santos",
      "position": "Desenvolvedor Sênior",
      "department": "TI",
      "admissionDate": "2025-10-15",
      "salary": "8500.00",
      "contractType": "CLT",
      "daysInCompany": 24
    },
    {
      "id": "employee-uuid-2",
      "name": "Maria Oliveira Costa",
      "position": "Analista Financeiro",
      "department": "Financeiro",
      "admissionDate": "2025-10-20",
      "salary": "6500.00",
      "contractType": "CLT",
      "daysInCompany": 19
    }
  ],
  "byCostCenter": [
    {
      "costCenterId": "cost-center-uuid-1",
      "code": "001.001",
      "name": "TI - Desenvolvimento",
      "employeesCount": 12,
      "totalSalaries": "102000.00",
      "totalCost": "153000.00",
      "averageSalary": "8500.00",
      "percentageOfTotal": "35.46"
    },
    {
      "costCenterId": "cost-center-uuid-2",
      "code": "001.002",
      "name": "Financeiro",
      "employeesCount": 8,
      "totalSalaries": "52000.00",
      "totalCost": "78000.00",
      "averageSalary": "6500.00",
      "percentageOfTotal": "18.09"
    }
  ]
}
```

#### Detalhes dos Campos

**employees**: Totalizadores de colaboradores
- `total`: Total de colaboradores cadastrados
- `active`: Colaboradores ativos
- `inactive`: Colaboradores inativos/demitidos

**payroll**: Folha de pagamento mensal
- `monthlyTotal`: Soma de todos os salários base (CLT + PJ)
- `totalCost`: Custo total incluindo salários + encargos
- `averageSalary`: Média salarial (monthlyTotal / total de ativos)

**charges**: Encargos trabalhistas estimados
- `inss`: 11% sobre folha total (contribuição patronal)
- `fgts`: 8% sobre folha total
- `thirteenthSalary`: 1/12 da folha mensal (provisão 13º salário)
- `vacation`: 1/12 da folha mensal + 1/3 (provisão férias)
- `others`: Outros encargos (RAT, Sistema S, etc) - 14.35% sobre folha
- `total`: Soma de todos os encargos
- `percentage`: Percentual de encargos sobre folha (total / monthlyTotal * 100)

**recentHires**: Últimas 5 admissões (90 dias)
- Ordenado por data de admissão (mais recente primeiro)
- `daysInCompany`: Dias desde a admissão

**byCostCenter**: Análise de custo por centro de custo
- Ordenado por total de custos (maior primeiro)
- `totalSalaries`: Soma dos salários do centro de custo
- `totalCost`: Salários + encargos proporcionais (50%)
- `averageSalary`: Média salarial do centro de custo
- `percentageOfTotal`: Percentual do custo deste centro sobre custo total

---

### 12. Exportar Folha (PDF)

**GET** `/payroll/:id/export/pdf`

**Permissão**: `payroll.read`

Retorna arquivo PDF com a folha de pagamento completa.

---

### 12. Exportar Folha (Excel)

**GET** `/payroll/:id/export/excel`

**Permissão**: `payroll.read`

Retorna arquivo Excel (.xlsx) com a folha de pagamento.

---

### 13. Gerar Holerite (PDF)

**GET** `/payroll/:id/employees/:employeeId/payslip`

**Permissão**: `payroll.read`

Retorna PDF do holerite individual do colaborador.

---

## 💻 Exemplos de Uso

### JavaScript/TypeScript

```typescript
// 1. Criar cargo
async function createPosition(companyId: string, token: string) {
  const response = await fetch('http://localhost:4000/positions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-company-id': companyId,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      code: 'DEV-SR',
      name: 'Desenvolvedor Sênior',
      description: 'Desenvolvedor com mais de 5 anos de experiência',
      minSalary: 8000.00,
      maxSalary: 15000.00,
      cbo: '2124-05',
      active: true
    })
  });
  
  return await response.json();
}

// 2. Criar departamento
async function createDepartment(companyId: string, token: string) {
  const response = await fetch('http://localhost:4000/departments', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-company-id': companyId,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      code: 'TI',
      name: 'Tecnologia da Informação',
      description: 'Departamento de TI',
      active: true
    })
  });
  
  return await response.json();
}

// 3. Criar sub-departamento
async function createSubDepartment(
  parentId: string,
  companyId: string, 
  token: string
) {
  const response = await fetch('http://localhost:4000/departments', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-company-id': companyId,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      code: 'TI-DEV',
      name: 'Desenvolvimento',
      description: 'Equipe de desenvolvimento',
      parentId: parentId,
      active: true
    })
  });
  
  return await response.json();
}

// 4. Criar tabela de INSS
async function createInssTable(companyId: string, token: string) {
  const response = await fetch('http://localhost:4000/tax-tables/inss', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-company-id': companyId,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      referenceYear: 2025,
      referenceMonth: 1,
      active: true,
      brackets: [
        { upTo: 1412.00, employeeRate: 7.5, employerRate: 20.0 },
        { upTo: 2666.68, employeeRate: 9.0, employerRate: 20.0 },
        { upTo: 4000.03, employeeRate: 12.0, employerRate: 20.0 },
        { upTo: 7786.02, employeeRate: 14.0, employerRate: 20.0 }
      ]
    })
  });
  
  return await response.json();
}

// 5. Criar colaborador com cargo e departamento
async function createEmployee(companyId: string, token: string) {
  const response = await fetch('http://localhost:4000/employees', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-company-id': companyId,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: 'João Silva Santos',
      cpf: '12345678900',
      positionId: 'position-uuid',
      departmentId: 'department-uuid',
      admissionDate: '2023-01-15',
      contractType: 'CLT',
      salary: 8500.00,
      costCenterId: 'cost-center-uuid'
    })
  });
  
  return await response.json();
}

// 6. Criar folha de pagamento
async function createPayroll(companyId: string, token: string) {
  const response = await fetch('http://localhost:4000/payroll', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-company-id': companyId,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      referenceMonth: 11,
      referenceYear: 2025,
      type: 'MONTHLY',
      startDate: '2025-11-01',
      endDate: '2025-11-30',
      paymentDate: '2025-12-05'
    })
  });
  
  return await response.json();
}

// 3. Calcular folha automaticamente
async function calculatePayroll(
  payrollId: string, 
  companyId: string, 
  token: string
) {
  const response = await fetch(
    `http://localhost:4000/payroll/${payrollId}/calculate`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-company-id': companyId,
        'Content-Type': 'application/json'
      }
    }
  );
  
  return await response.json();
}

// 4. Aprovar folha
async function approvePayroll(
  payrollId: string, 
  companyId: string, 
  token: string
) {
  const response = await fetch(
    `http://localhost:4000/payroll/${payrollId}/approve`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-company-id': companyId,
        'Content-Type': 'application/json'
      }
    }
  );
  
  return await response.json();
}

// 5. Adicionar provento a colaborador
async function addEarningToEmployee(
  employeeId: string,
  companyId: string,
  token: string
) {
  const response = await fetch(
    `http://localhost:4000/employees/${employeeId}/earnings`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-company-id': companyId,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        earningTypeId: 'earning-type-uuid',
        isRecurrent: true,
        value: 500.00,
        startDate: '2025-11-01'
      })
    }
  );
  
  return await response.json();
}
```

---

## ⚠️ Validações e Erros

### Validações Automáticas

#### Cargos (Positions)
1. **Código único por empresa**: Não permite duplicidade de código
2. **Faixa salarial**: MinSalary deve ser menor que MaxSalary (validação frontend)
3. **Deletar**: Não permite excluir cargo com colaboradores vinculados
4. **CBO**: Código Brasileiro de Ocupações para conformidade legal

#### Departamentos (Departments)
1. **Código único por empresa**: Não permite duplicidade de código
2. **Hierarquia válida**: Previne referências circulares (A → B → C → A)
3. **Departamento pai**: Não pode ser pai de si mesmo
4. **Deletar**: Não permite excluir com colaboradores vinculados
5. **Deletar**: Não permite excluir com sub-departamentos existentes
6. **Parent/Manager**: Devem existir e pertencer à mesma empresa

#### Colaboradores
1. **CPF único por empresa**: Não permite duplicidade
2. **Data de admissão**: Deve ser anterior ou igual à data atual
3. **Data de demissão**: Deve ser posterior à admissão
4. **Salário**: Deve ser maior que zero
5. **Cargo e Departamento**: Devem existir e estar ativos
6. **Centro de custo**: Deve existir e estar ativo

#### Centros de Custo
1. **Código único por empresa**: Não permite duplicidade
2. **Hierarquia válida**: Não permite criar loops (A → B → A)
3. **Deletar**: Só permite se não houver colaboradores vinculados

#### Proventos/Descontos
1. **Código único por empresa**: Não permite duplicidade
2. **Valor ou percentual**: Deve ter pelo menos um configurado
3. **Deletar**: Só permite se não houver colaboradores usando

#### Tabelas Fiscais (INSS, FGTS, IRRF)
1. **Período único ativo**: Apenas uma tabela ativa por tipo/ano
2. **Faixas INSS**: Devem estar em ordem crescente
3. **Faixas IRRF**: Devem estar em ordem crescente
4. **Alíquotas**: Devem ser maiores ou iguais a zero
5. **FGTS por cargo**: Configurar alíquotas específicas para cada cargo da empresa

#### Folha de Pagamento
1. **Período único**: Não permite duas folhas do mesmo tipo/mês/ano
2. **Status**: Workflow DRAFT → CALCULATED → APPROVED → PAID (não pode voltar)
3. **Alterar/Deletar**: Só permite em status DRAFT
4. **Aprovar**: Só pode aprovar se status = CALCULATED
5. **Datas**: PaymentDate deve ser posterior ao endDate
6. **Tabelas fiscais**: Usa automaticamente as tabelas ativas do período

### Erros Comuns

```json
// Código de cargo duplicado
{
  "statusCode": 400,
  "message": "A position with this code already exists in this company"
}

// Tentativa de deletar cargo com colaboradores
{
  "statusCode": 400,
  "message": "Cannot delete position with 5 employees. Please reassign employees first."
}

// Código de departamento duplicado
{
  "statusCode": 400,
  "message": "A department with this code already exists in this company"
}

// Referência circular em departamento
{
  "statusCode": 400,
  "message": "Circular reference detected: parent department cannot be a child of this department"
}

// Tentativa de deletar departamento com colaboradores
{
  "statusCode": 400,
  "message": "Cannot delete department with 15 employees. Please reassign employees first."
}

// Tentativa de deletar departamento com sub-departamentos
{
  "statusCode": 400,
  "message": "Cannot delete department with 3 sub-departments. Please reassign or delete sub-departments first."
}

// CPF duplicado
{
  "statusCode": 400,
  "message": "Já existe um colaborador com este CPF nesta empresa"
}

// Centro de custo não encontrado
{
  "statusCode": 404,
  "message": "Centro de custo não encontrado"
}

// Tentativa de alterar folha aprovada
{
  "statusCode": 400,
  "message": "Não é possível alterar uma folha de pagamento aprovada"
}

// Folha não calculada
{
  "statusCode": 400,
  "message": "A folha precisa ser calculada antes de ser aprovada"
}

// Sem permissão
{
  "statusCode": 403,
  "message": "Você não tem permissão para aprovar folhas de pagamento"
}

// Período de folha duplicado
{
  "statusCode": 400,
  "message": "Já existe uma folha de pagamento MENSAL para Novembro/2025"
}
```

---

## 🔄 Workflow de Folha de Pagamento

### Fluxo Completo

```
1. CRIAR FOLHA (DRAFT)
   ↓
2. CALCULAR AUTOMATICAMENTE ou ADICIONAR ITENS MANUALMENTE
   ↓
3. REVISAR CÁLCULOS (status: CALCULATED)
   ↓
4. APROVAR (status: APPROVED)
   ↓
5. REALIZAR PAGAMENTOS
   ↓
6. MARCAR COMO PAGA (status: PAID)
```

### Permissões por Módulo

#### Cargos (Positions)
| Ação | Permissão |
|------|-----------|
| Criar cargo | `positions.create` |
| Visualizar cargos | `positions.read` |
| Editar cargo | `positions.update` |
| Deletar cargo | `positions.delete` |

#### Departamentos (Departments)
| Ação | Permissão |
|------|-----------|
| Criar departamento | `departments.create` |
| Visualizar departamentos | `departments.read` |
| Editar departamento | `departments.update` |
| Deletar departamento | `departments.delete` |

#### Tabelas Fiscais (Tax Tables)
| Ação | Permissão |
|------|-----------|
| Criar tabela fiscal | `tax_tables.create` |
| Visualizar tabelas | `tax_tables.read` |
| Editar tabela | `tax_tables.update` |
| Deletar tabela | `tax_tables.delete` |

#### Folha de Pagamento (Payroll)
| Etapa | Permissão Necessária |
|-------|---------------------|
| Criar | `payroll.create` |
| Calcular | `payroll.calculate` |
| Editar (DRAFT) | `payroll.update` |
| Aprovar | `payroll.approve` |
| Marcar como Paga | `payroll.approve` |
| Visualizar | `payroll.read` |
| Deletar (DRAFT) | `payroll.delete` |

---

## 📌 Notas Importantes

### Segurança
- Dados de salário são sensíveis - controle bem as permissões
- Apenas usuários com permissão `payroll.approve` podem aprovar folhas
- Logs de auditoria registram todas as alterações em folhas
- Permissões de cargos e departamentos devem ser restritas a gestores de RH
- Permissões de tabelas fiscais devem ser restritas ao departamento contábil/fiscal

### Performance
- Use paginação ao listar colaboradores em empresas grandes
- O cálculo automático pode demorar para muitos colaboradores
- Considere processar cálculos em background para +100 funcionários
- Cache de tabelas fiscais ativas melhora performance dos cálculos

### Cálculos da Folha de Pagamento
- **INSS**: Calculado de forma progressiva por faixas (conforme legislação)
- **FGTS**: Calculado sobre salário bruto por **cargo do empregado** (taxas configuráveis por cargo)
- **IRRF**: Calculado progressivamente após dedução de INSS e dependentes
- **Encargos**: Dashboard mostra breakdown detalhado de todos encargos
- **Tabelas**: Sistema usa automaticamente a tabela fiscal ativa do período
- **FGTS padrão**: Se um cargo não tiver taxa configurada, usa-se 8% mensal e 40% rescisão

### Hierarquia Organizacional
- **Departamentos**: Suportam estrutura hierárquica ilimitada (pai → filho → neto)
- **Gestores**: Cada departamento pode ter um gestor (colaborador)
- **Cargos**: Definem faixa salarial e CBO para conformidade legal
- **Organograma**: Use endpoints de departamentos para construir organograma visual

### Integrações Futuras
- eSocial (envio de eventos)
- Bancos (arquivo CNAB para pagamento)
- Contabilidade (exportar lançamentos)
- Ponto eletrônico (importar horas trabalhadas)
- BI/Dashboards (métricas de RH)

---

**Última Atualização**: 8 de novembro de 2025  
**Versão**: 2.0
