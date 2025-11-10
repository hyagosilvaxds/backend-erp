# API de Proventos e Descontos de Colaboradores

## Sumário
- [Proventos (Earnings)](#proventos-earnings)
- [Descontos (Deductions)](#descontos-deductions)

---

## Proventos (Earnings)

Proventos são valores adicionais que o colaborador recebe além do salário base (ex: horas extras, comissões, bônus, adicional noturno, etc).

### Endpoints

#### 1. Listar Proventos do Colaborador

```http
GET /employees/:id/earnings
```

**Query Parameters:**

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `month` | number | Não | Mês (1-12) para filtrar proventos ativos naquele período |
| `year` | number | Não | Ano para filtrar proventos ativos naquele período |
| `active` | boolean | Não | Filtrar apenas proventos ativos (`true`) ou inativos (`false`) |
| `isRecurrent` | boolean | Não | Filtrar apenas proventos recorrentes |

**Exemplos de Uso:**

```bash
# Listar todos os proventos
GET /employees/uuid-do-colaborador/earnings

# Proventos do mês atual (novembro/2025)
GET /employees/uuid-do-colaborador/earnings?month=11&year=2025

# Proventos ativos e recorrentes
GET /employees/uuid-do-colaborador/earnings?active=true&isRecurrent=true

# Proventos de 2025
GET /employees/uuid-do-colaborador/earnings?year=2025
```

**Resposta (200 OK):**

```json
[
  {
    "id": "uuid",
    "employeeId": "uuid-do-colaborador",
    "earningTypeId": "uuid-do-tipo",
    "value": "500.00",
    "percentage": null,
    "isRecurrent": true,
    "active": true,
    "startDate": "2025-01-01T00:00:00.000Z",
    "endDate": null,
    "createdAt": "2025-01-01T10:00:00.000Z",
    "updatedAt": "2025-01-01T10:00:00.000Z",
    "earningType": {
      "id": "uuid",
      "code": "HE50",
      "name": "Hora Extra 50%",
      "description": "Hora extra com acréscimo de 50%",
      "isRecurrent": false,
      "isPercentage": false
    }
  }
]
```

#### 2. Adicionar Provento ao Colaborador

```http
POST /employees/:id/earnings
```

**Body:**

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `earningTypeId` | string | Sim | ID do tipo de provento (EarningType) |
| `value` | number | Não* | Valor fixo do provento |
| `percentage` | number | Não* | Percentual sobre o salário (0-100) |
| `isRecurrent` | boolean | Não | Se o provento se repete todo mês (padrão: `false`) |
| `active` | boolean | Não | Se o provento está ativo (padrão: `true`) |
| `startDate` | string (ISO) | Não | Data de início (padrão: data atual) |
| `endDate` | string (ISO) | Não | Data de fim (null = indeterminado) |

_*Ao menos `value` OU `percentage` deve ser fornecido_

**Exemplos:**

**Provento com valor fixo:**
```json
{
  "earningTypeId": "uuid-do-tipo",
  "value": 400,
  "isRecurrent": false,
  "startDate": "2025-11-09"
}
```

**Provento com percentual:**
```json
{
  "earningTypeId": "uuid-do-tipo",
  "percentage": 20,
  "isRecurrent": true,
  "startDate": "2025-11-01",
  "endDate": "2025-12-31"
}
```

**Resposta (201 Created):**

```json
{
  "id": "uuid",
  "employeeId": "uuid-do-colaborador",
  "earningTypeId": "uuid-do-tipo",
  "value": "400.00",
  "percentage": null,
  "isRecurrent": false,
  "active": true,
  "startDate": "2025-11-09T00:00:00.000Z",
  "endDate": null,
  "createdAt": "2025-11-09T19:30:00.000Z",
  "updatedAt": "2025-11-09T19:30:00.000Z",
  "earningType": {
    "id": "uuid",
    "code": "COMISSAO",
    "name": "Comissão",
    "description": "Comissão sobre vendas",
    "isRecurrent": false,
    "isPercentage": false
  }
}
```

#### 3. Atualizar Provento

```http
PATCH /employees/:id/earnings/:earningId
```

**Body (todos os campos são opcionais):**

```json
{
  "value": 500,
  "percentage": 25,
  "active": false,
  "startDate": "2025-11-01",
  "endDate": "2025-12-31"
}
```

**Resposta (200 OK):**

```json
{
  "id": "uuid",
  "employeeId": "uuid-do-colaborador",
  "earningTypeId": "uuid-do-tipo",
  "value": "500.00",
  "percentage": "25.00",
  "isRecurrent": false,
  "active": false,
  "startDate": "2025-11-01T00:00:00.000Z",
  "endDate": "2025-12-31T23:59:59.999Z",
  "earningType": { /* ... */ }
}
```

#### 4. Remover Provento

```http
DELETE /employees/:id/earnings/:earningId
```

**Resposta (200 OK):**

```json
{
  "message": "Provento removido com sucesso"
}
```

---

## Descontos (Deductions)

Descontos são valores que são subtraídos do salário do colaborador (ex: vale transporte, vale refeição, plano de saúde, empréstimos, etc).

> ⚠️ **Nota**: Descontos legais como INSS, IRRF e FGTS são calculados automaticamente pelo sistema e não precisam ser cadastrados manualmente.

### Endpoints

#### 1. Listar Descontos do Colaborador

```http
GET /employees/:id/deductions
```

**Query Parameters:**

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `month` | number | Não | Mês (1-12) para filtrar descontos ativos naquele período |
| `year` | number | Não | Ano para filtrar descontos ativos naquele período |
| `active` | boolean | Não | Filtrar apenas descontos ativos (`true`) ou inativos (`false`) |
| `isRecurrent` | boolean | Não | Filtrar apenas descontos recorrentes |

**Exemplos:**

```bash
# Listar todos os descontos
GET /employees/uuid-do-colaborador/deductions

# Descontos deste mês
GET /employees/uuid-do-colaborador/deductions?month=11&year=2025

# Apenas descontos recorrentes ativos
GET /employees/uuid-do-colaborador/deductions?active=true&isRecurrent=true
```

**Resposta (200 OK):**

```json
[
  {
    "id": "uuid",
    "employeeId": "uuid-do-colaborador",
    "deductionTypeId": "uuid-do-tipo",
    "value": "200.00",
    "percentage": null,
    "isRecurrent": true,
    "active": true,
    "startDate": "2025-01-01T00:00:00.000Z",
    "endDate": null,
    "createdAt": "2025-01-01T10:00:00.000Z",
    "updatedAt": "2025-01-01T10:00:00.000Z",
    "deductionType": {
      "id": "uuid",
      "code": "VT",
      "name": "Vale Transporte",
      "description": "Desconto de vale transporte",
      "isRecurrent": true,
      "isPercentage": false
    }
  }
]
```

#### 2. Adicionar Desconto ao Colaborador

```http
POST /employees/:id/deductions
```

**Body:**

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `deductionTypeId` | string | Sim | ID do tipo de desconto (DeductionType) |
| `value` | number | Não* | Valor fixo do desconto |
| `percentage` | number | Não* | Percentual sobre o salário (0-100) |
| `isRecurrent` | boolean | Não | Se o desconto se repete todo mês (padrão: `false`) |
| `active` | boolean | Não | Se o desconto está ativo (padrão: `true`) |
| `startDate` | string (ISO) | Não | Data de início (padrão: data atual) |
| `endDate` | string (ISO) | Não | Data de fim (null = indeterminado) |

_*Ao menos `value` OU `percentage` deve ser fornecido_

**Exemplos:**

**Desconto com valor fixo:**
```json
{
  "deductionTypeId": "uuid-do-tipo",
  "value": 150,
  "isRecurrent": true,
  "startDate": "2025-11-01"
}
```

**Desconto com percentual:**
```json
{
  "deductionTypeId": "uuid-do-tipo",
  "percentage": 6,
  "isRecurrent": true,
  "startDate": "2025-11-01"
}
```

**Resposta (201 Created):**

```json
{
  "id": "uuid",
  "employeeId": "uuid-do-colaborador",
  "deductionTypeId": "uuid-do-tipo",
  "value": "150.00",
  "percentage": null,
  "isRecurrent": true,
  "active": true,
  "startDate": "2025-11-01T00:00:00.000Z",
  "endDate": null,
  "createdAt": "2025-11-09T20:00:00.000Z",
  "updatedAt": "2025-11-09T20:00:00.000Z",
  "deductionType": {
    "id": "uuid",
    "code": "VT",
    "name": "Vale Transporte",
    "description": "Desconto de vale transporte",
    "isRecurrent": true,
    "isPercentage": false
  }
}
```

#### 3. Atualizar Desconto

```http
PATCH /employees/:id/deductions/:deductionId
```

**Body (todos os campos são opcionais):**

```json
{
  "value": 200,
  "active": true,
  "endDate": "2025-12-31"
}
```

**Resposta (200 OK):**

```json
{
  "id": "uuid",
  "employeeId": "uuid-do-colaborador",
  "deductionTypeId": "uuid-do-tipo",
  "value": "200.00",
  "percentage": null,
  "isRecurrent": true,
  "active": true,
  "startDate": "2025-11-01T00:00:00.000Z",
  "endDate": "2025-12-31T23:59:59.999Z",
  "deductionType": { /* ... */ }
}
```

#### 4. Remover Desconto

```http
DELETE /employees/:id/deductions/:deductionId
```

**Resposta (200 OK):**

```json
{
  "message": "Desconto removido com sucesso"
}
```

---

## Conceitos Importantes

### Período de Validade

Tanto proventos quanto descontos possuem período de validade (`startDate` e `endDate`):

- **startDate**: Data a partir da qual o provento/desconto começa a ser aplicado
- **endDate**: Data até a qual o provento/desconto será aplicado
  - Se `null`: o provento/desconto não tem data de fim (ativo indefinidamente)
  - Se preenchido: o provento/desconto é aplicado apenas até essa data

### Filtros por Mês/Ano

Quando você filtra por mês/ano, o sistema retorna proventos/descontos que estavam **ativos naquele período**:

- Um item é considerado "ativo no período" se:
  - Começou antes ou durante o período (`startDate <= fim_do_periodo`)
  - E não tem data de fim OU termina depois ou durante o período (`endDate = null` OU `endDate >= inicio_do_periodo`)

**Exemplo prático:**

Se você tem um provento com:
- `startDate`: 2025-10-01
- `endDate`: 2025-12-31

Ele aparecerá nos filtros:
- ✅ `?month=10&year=2025` (outubro)
- ✅ `?month=11&year=2025` (novembro)
- ✅ `?month=12&year=2025` (dezembro)
- ❌ `?month=9&year=2025` (setembro - não estava ativo ainda)
- ❌ `?month=1&year=2026` (janeiro/2026 - já terminou)

### Value vs Percentage

Você pode configurar um provento/desconto de duas formas:

1. **Valor Fixo (`value`)**: Um valor em reais que será aplicado
   - Exemplo: R$ 500,00 de comissão

2. **Percentual (`percentage`)**: Um percentual sobre o salário base
   - Exemplo: 10% de bônus = Se salário é R$ 3.000, o provento será R$ 300

Você pode fornecer **ambos** `value` e `percentage`, mas **ao menos um** deve ser fornecido.

### Recorrente (isRecurrent)

- **true**: O provento/desconto se repete todo mês automaticamente
- **false**: O provento/desconto é pontual (aplicado apenas uma vez ou em meses específicos)

### Status Ativo/Inativo

- **active = true**: O provento/desconto está ativo e será aplicado na folha
- **active = false**: O provento/desconto está inativo (pode ser reativado depois)

---

## Fluxo Completo de Uso

### 1. Cadastrar Tipos de Proventos/Descontos

Primeiro, cadastre os tipos usando as APIs de `earning-types` e `deduction-types`:

```http
POST /earning-types
POST /deduction-types
```

### 2. Atribuir ao Colaborador

Depois, atribua proventos/descontos específicos ao colaborador:

```http
POST /employees/:id/earnings
POST /employees/:id/deductions
```

### 3. Consultar para Folha de Pagamento

Para calcular a folha de um mês específico, busque os proventos/descontos ativos naquele período:

```http
GET /employees/:id/earnings?month=11&year=2025&active=true
GET /employees/:id/deductions?month=11&year=2025&active=true
```

### 4. Gerenciar ao Longo do Tempo

- Desativar temporariamente: `PATCH` com `active: false`
- Atualizar valores: `PATCH` com novos `value` ou `percentage`
- Encerrar: `PATCH` com `endDate`
- Remover permanentemente: `DELETE`

---

## Exemplos Práticos

### Exemplo 1: Hora Extra de Novembro

```bash
# 1. Adicionar hora extra para novembro
POST /employees/uuid/earnings
{
  "earningTypeId": "uuid-hora-extra-50",
  "value": 800,
  "isRecurrent": false,
  "startDate": "2025-11-01",
  "endDate": "2025-11-30"
}

# 2. Consultar proventos de novembro
GET /employees/uuid/earnings?month=11&year=2025
```

### Exemplo 2: Plano de Saúde Recorrente

```bash
# 1. Adicionar desconto de plano de saúde
POST /employees/uuid/deductions
{
  "deductionTypeId": "uuid-plano-saude",
  "value": 250,
  "isRecurrent": true,
  "startDate": "2025-01-01"
}

# 2. Listar descontos recorrentes
GET /employees/uuid/deductions?isRecurrent=true&active=true
```

### Exemplo 3: Comissão Percentual

```bash
# Adicionar comissão de 5% sobre vendas
POST /employees/uuid/earnings
{
  "earningTypeId": "uuid-comissao",
  "percentage": 5,
  "isRecurrent": true,
  "startDate": "2025-11-01"
}
```

---

## Erros Comuns

### 400 Bad Request
- Não forneceu nem `value` nem `percentage`
- Valores negativos
- Datas inválidas

### 404 Not Found
- Colaborador não encontrado
- Tipo de provento/desconto não encontrado
- Provento/desconto não encontrado

### 403 Forbidden
- Sem permissão para gerenciar proventos/descontos do colaborador

---

## Permissões Necessárias

- **Listar**: `employees.read`
- **Criar**: `employees.update`
- **Atualizar**: `employees.update`
- **Remover**: `employees.update`
