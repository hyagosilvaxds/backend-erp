# API de Métodos de Pagamento - Referência de Integração

## Sumário
- [Autenticação](#autenticação)
- [Criar Método de Pagamento](#criar-método-de-pagamento)
- [Listar Métodos de Pagamento](#listar-métodos-de-pagamento)
- [Buscar Método Específico](#buscar-método-específico)
- [Atualizar Método de Pagamento](#atualizar-método-de-pagamento)
- [Excluir Método de Pagamento](#excluir-método-de-pagamento)
- [Ativar/Desativar Método](#ativardesativar-método)
- [Gerenciar Templates de Parcelas](#gerenciar-templates-de-parcelas)

---

## Autenticação

Todos os endpoints requerem autenticação JWT.

**Header obrigatório:**
```
Authorization: Bearer {seu_token_jwt}
```

O token JWT deve conter o `companyId` no payload.

---

## Criar Método de Pagamento

Cria um novo método de pagamento.

### Endpoint
```
POST /sales/payment-methods
```

### Headers
```
Authorization: Bearer {token}
Content-Type: application/json
```

### Body (JSON)

**Campos obrigatórios:**
```json
{
  "name": "string",
  "code": "string",
  "type": "CASH | CREDIT_CARD | DEBIT_CARD | PIX | BANK_SLIP | BANK_TRANSFER | CHECK | OTHER"
}
```

**Campos opcionais:**
```json
{
  "active": "boolean (padrão: true)",
  "allowInstallments": "boolean (padrão: false)",
  "maxInstallments": "number (1-48, padrão: 1)",
  "installmentFee": "number (0-100, taxa por parcela em %)",
  "requiresCreditAnalysis": "boolean (padrão: false)",
  "minCreditScore": "number (0-1000)",
  "daysToReceive": "number (dias para receber)",
  "transactionFee": "number (0-100, taxa da transação em %)",
  "installmentTemplates": [
    {
      "installmentNumber": "number (1, 2, 3...)",
      "daysToPayment": "number (dias após venda)",
      "percentageOfTotal": "number (0-100, opcional)",
      "fixedAmount": "number (opcional)"
    }
  ]
}
```

### Exemplos de Request

**Exemplo 1: PIX simples**
```json
{
  "name": "PIX",
  "code": "PIX",
  "type": "PIX",
  "daysToReceive": 0,
  "transactionFee": 0.5
}
```

**Exemplo 2: Cartão de Crédito com Parcelamento**
```json
{
  "name": "Cartão de Crédito",
  "code": "CREDIT_CARD",
  "type": "CREDIT_CARD",
  "allowInstallments": true,
  "maxInstallments": 12,
  "installmentFee": 2.5,
  "requiresCreditAnalysis": true,
  "minCreditScore": 600,
  "transactionFee": 3.5
}
```

**Exemplo 3: Boleto 7/21 (Parcelas Customizadas)**
```json
{
  "name": "Boleto 7/21",
  "code": "BOLETO_7_21",
  "type": "BANK_SLIP",
  "allowInstallments": true,
  "maxInstallments": 2,
  "installmentTemplates": [
    {
      "installmentNumber": 1,
      "daysToPayment": 7,
      "percentageOfTotal": 50
    },
    {
      "installmentNumber": 2,
      "daysToPayment": 21,
      "percentageOfTotal": 50
    }
  ]
}
```

**Exemplo 4: Entrada + 2 Parcelas**
```json
{
  "name": "Entrada + 2x",
  "code": "ENTRADA_2X",
  "type": "BANK_SLIP",
  "allowInstallments": true,
  "maxInstallments": 3,
  "installmentTemplates": [
    {
      "installmentNumber": 1,
      "daysToPayment": 0,
      "percentageOfTotal": 30
    },
    {
      "installmentNumber": 2,
      "daysToPayment": 30,
      "percentageOfTotal": 35
    },
    {
      "installmentNumber": 3,
      "daysToPayment": 60,
      "percentageOfTotal": 35
    }
  ]
}
```

### Response

**Status:** `201 Created`

```json
{
  "id": "uuid",
  "companyId": "uuid",
  "name": "PIX",
  "code": "PIX",
  "type": "PIX",
  "active": true,
  "allowInstallments": false,
  "maxInstallments": 1,
  "installmentFee": 0,
  "requiresCreditAnalysis": false,
  "minCreditScore": null,
  "daysToReceive": 0,
  "transactionFee": 0.5,
  "createdAt": "2024-11-10T19:26:28.000Z",
  "updatedAt": "2024-11-10T19:26:28.000Z",
  "installmentTemplates": []
}
```

**Com templates:**
```json
{
  "id": "uuid",
  "name": "Boleto 7/21",
  "code": "BOLETO_7_21",
  "type": "BANK_SLIP",
  "active": true,
  "allowInstallments": true,
  "maxInstallments": 2,
  "installmentTemplates": [
    {
      "id": "uuid",
      "paymentMethodId": "uuid",
      "installmentNumber": 1,
      "daysToPayment": 7,
      "percentageOfTotal": 50,
      "fixedAmount": null,
      "createdAt": "2024-11-10T19:26:28.000Z",
      "updatedAt": "2024-11-10T19:26:28.000Z"
    },
    {
      "id": "uuid",
      "paymentMethodId": "uuid",
      "installmentNumber": 2,
      "daysToPayment": 21,
      "percentageOfTotal": 50,
      "fixedAmount": null,
      "createdAt": "2024-11-10T19:26:28.000Z",
      "updatedAt": "2024-11-10T19:26:28.000Z"
    }
  ]
}
```

### Erros

**Status:** `400 Bad Request`
```json
{
  "statusCode": 400,
  "message": [
    "name must be a string",
    "code must be a string",
    "type must be a valid enum value"
  ],
  "error": "Bad Request"
}
```

**Status:** `409 Conflict`
```json
{
  "statusCode": 409,
  "message": "Já existe um método de pagamento com este código",
  "error": "Conflict"
}
```

```json
{
  "statusCode": 409,
  "message": "A soma das porcentagens dos templates deve ser 100%",
  "error": "Conflict"
}
```

---

## Listar Métodos de Pagamento

Lista todos os métodos de pagamento da empresa.

### Endpoint
```
GET /sales/payment-methods
```

### Headers
```
Authorization: Bearer {token}
```

### Query Parameters (Filtros)

| Parâmetro | Tipo | Descrição | Exemplo |
|-----------|------|-----------|---------|
| `active` | boolean | Filtrar por status | `?active=true` |
| `type` | string | Filtrar por tipo | `?type=PIX` |

### Exemplos de Request

```
GET /sales/payment-methods
GET /sales/payment-methods?active=true
GET /sales/payment-methods?type=BANK_SLIP
GET /sales/payment-methods?active=true&type=PIX
```

### Response

**Status:** `200 OK`

```json
[
  {
    "id": "uuid",
    "companyId": "uuid",
    "name": "PIX",
    "code": "PIX",
    "type": "PIX",
    "active": true,
    "allowInstallments": false,
    "maxInstallments": 1,
    "installmentFee": 0,
    "requiresCreditAnalysis": false,
    "minCreditScore": null,
    "daysToReceive": 0,
    "transactionFee": 0.5,
    "createdAt": "2024-11-10T19:26:28.000Z",
    "updatedAt": "2024-11-10T19:26:28.000Z",
    "installmentTemplates": []
  },
  {
    "id": "uuid",
    "companyId": "uuid",
    "name": "Boleto 7/21",
    "code": "BOLETO_7_21",
    "type": "BANK_SLIP",
    "active": true,
    "allowInstallments": true,
    "maxInstallments": 2,
    "installmentFee": 0,
    "requiresCreditAnalysis": false,
    "minCreditScore": null,
    "daysToReceive": 3,
    "transactionFee": 2,
    "createdAt": "2024-11-10T19:26:28.000Z",
    "updatedAt": "2024-11-10T19:26:28.000Z",
    "installmentTemplates": [
      {
        "id": "uuid",
        "paymentMethodId": "uuid",
        "installmentNumber": 1,
        "daysToPayment": 7,
        "percentageOfTotal": 50,
        "fixedAmount": null,
        "createdAt": "2024-11-10T19:26:28.000Z",
        "updatedAt": "2024-11-10T19:26:28.000Z"
      },
      {
        "id": "uuid",
        "paymentMethodId": "uuid",
        "installmentNumber": 2,
        "daysToPayment": 21,
        "percentageOfTotal": 50,
        "fixedAmount": null,
        "createdAt": "2024-11-10T19:26:28.000Z",
        "updatedAt": "2024-11-10T19:26:28.000Z"
      }
    ]
  }
]
```

---

## Buscar Método Específico

Busca um método de pagamento por ID.

### Endpoint
```
GET /sales/payment-methods/:id
```

### Headers
```
Authorization: Bearer {token}
```

### Path Parameters

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `id` | string (uuid) | ID do método de pagamento |

### Exemplo de Request

```
GET /sales/payment-methods/123e4567-e89b-12d3-a456-426614174000
```

### Response

**Status:** `200 OK`

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "companyId": "uuid",
  "name": "Boleto 7/21",
  "code": "BOLETO_7_21",
  "type": "BANK_SLIP",
  "active": true,
  "allowInstallments": true,
  "maxInstallments": 2,
  "installmentFee": 0,
  "requiresCreditAnalysis": false,
  "minCreditScore": null,
  "daysToReceive": 3,
  "transactionFee": 2,
  "createdAt": "2024-11-10T19:26:28.000Z",
  "updatedAt": "2024-11-10T19:26:28.000Z",
  "installmentTemplates": [
    {
      "id": "uuid",
      "paymentMethodId": "123e4567-e89b-12d3-a456-426614174000",
      "installmentNumber": 1,
      "daysToPayment": 7,
      "percentageOfTotal": 50,
      "fixedAmount": null,
      "createdAt": "2024-11-10T19:26:28.000Z",
      "updatedAt": "2024-11-10T19:26:28.000Z"
    },
    {
      "id": "uuid",
      "paymentMethodId": "123e4567-e89b-12d3-a456-426614174000",
      "installmentNumber": 2,
      "daysToPayment": 21,
      "percentageOfTotal": 50,
      "fixedAmount": null,
      "createdAt": "2024-11-10T19:26:28.000Z",
      "updatedAt": "2024-11-10T19:26:28.000Z"
    }
  ]
}
```

### Erros

**Status:** `404 Not Found`
```json
{
  "statusCode": 404,
  "message": "Método de pagamento não encontrado",
  "error": "Not Found"
}
```

---

## Atualizar Método de Pagamento

Atualiza um método de pagamento existente.

### Endpoint
```
PUT /sales/payment-methods/:id
```

### Headers
```
Authorization: Bearer {token}
Content-Type: application/json
```

### Path Parameters

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `id` | string (uuid) | ID do método de pagamento |

### Body (JSON)

Todos os campos são opcionais. Envie apenas os campos que deseja atualizar.

```json
{
  "name": "string",
  "code": "string",
  "type": "string",
  "active": "boolean",
  "allowInstallments": "boolean",
  "maxInstallments": "number",
  "installmentFee": "number",
  "requiresCreditAnalysis": "boolean",
  "minCreditScore": "number",
  "daysToReceive": "number",
  "transactionFee": "number"
}
```

**Nota:** Templates de parcelas não podem ser atualizados por este endpoint. Use os endpoints específicos de templates.

### Exemplo de Request

```json
{
  "transactionFee": 1.5,
  "maxInstallments": 10
}
```

### Response

**Status:** `200 OK`

```json
{
  "id": "uuid",
  "companyId": "uuid",
  "name": "Cartão de Crédito",
  "code": "CREDIT_CARD",
  "type": "CREDIT_CARD",
  "active": true,
  "allowInstallments": true,
  "maxInstallments": 10,
  "installmentFee": 2.5,
  "requiresCreditAnalysis": true,
  "minCreditScore": 600,
  "daysToReceive": 30,
  "transactionFee": 1.5,
  "createdAt": "2024-11-10T19:26:28.000Z",
  "updatedAt": "2024-11-10T20:30:00.000Z"
}
```

### Erros

**Status:** `404 Not Found`
```json
{
  "statusCode": 404,
  "message": "Método de pagamento não encontrado",
  "error": "Not Found"
}
```

**Status:** `409 Conflict`
```json
{
  "statusCode": 409,
  "message": "Já existe um método de pagamento com este código",
  "error": "Conflict"
}
```

---

## Excluir Método de Pagamento

Exclui um método de pagamento.

### Endpoint
```
DELETE /sales/payment-methods/:id
```

### Headers
```
Authorization: Bearer {token}
```

### Path Parameters

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `id` | string (uuid) | ID do método de pagamento |

### Exemplo de Request

```
DELETE /sales/payment-methods/123e4567-e89b-12d3-a456-426614174000
```

### Response

**Status:** `200 OK`

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "companyId": "uuid",
  "name": "PIX",
  "code": "PIX",
  "type": "PIX",
  "active": true,
  "createdAt": "2024-11-10T19:26:28.000Z",
  "updatedAt": "2024-11-10T19:26:28.000Z"
}
```

### Erros

**Status:** `404 Not Found`
```json
{
  "statusCode": 404,
  "message": "Método de pagamento não encontrado",
  "error": "Not Found"
}
```

**Status:** `409 Conflict`
```json
{
  "statusCode": 409,
  "message": "Não é possível excluir este método de pagamento pois existem 15 venda(s) associada(s)",
  "error": "Conflict"
}
```

---

## Ativar/Desativar Método

Alterna o status ativo/inativo de um método de pagamento.

### Endpoint
```
PATCH /sales/payment-methods/:id/toggle-active
```

### Headers
```
Authorization: Bearer {token}
```

### Path Parameters

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `id` | string (uuid) | ID do método de pagamento |

### Exemplo de Request

```
PATCH /sales/payment-methods/123e4567-e89b-12d3-a456-426614174000/toggle-active
```

### Response

**Status:** `200 OK`

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "companyId": "uuid",
  "name": "PIX",
  "code": "PIX",
  "type": "PIX",
  "active": false,
  "createdAt": "2024-11-10T19:26:28.000Z",
  "updatedAt": "2024-11-10T20:30:00.000Z"
}
```

---

## Gerenciar Templates de Parcelas

### Listar Templates

```
GET /sales/payment-methods/:id/installment-templates
```

**Response:**
```json
[
  {
    "id": "uuid",
    "paymentMethodId": "uuid",
    "installmentNumber": 1,
    "daysToPayment": 7,
    "percentageOfTotal": 50,
    "fixedAmount": null,
    "createdAt": "2024-11-10T19:26:28.000Z",
    "updatedAt": "2024-11-10T19:26:28.000Z"
  }
]
```

### Adicionar Template

```
POST /sales/payment-methods/:id/installment-templates
Content-Type: application/json

{
  "installmentNumber": 3,
  "daysToPayment": 30,
  "percentageOfTotal": 25
}
```

### Atualizar Template

```
PATCH /sales/payment-methods/:id/installment-templates/:installmentNumber
Content-Type: application/json

{
  "daysToPayment": 15,
  "percentageOfTotal": 40
}
```

### Substituir Todos os Templates

```
PUT /sales/payment-methods/:id/installment-templates
Content-Type: application/json

{
  "templates": [
    {
      "installmentNumber": 1,
      "daysToPayment": 5,
      "percentageOfTotal": 50
    },
    {
      "installmentNumber": 2,
      "daysToPayment": 15,
      "percentageOfTotal": 50
    }
  ]
}
```

### Excluir Template

```
DELETE /sales/payment-methods/:id/installment-templates/:installmentNumber
```

---

## Tipos de Pagamento Disponíveis

| Tipo | Código | Descrição |
|------|--------|-----------|
| Dinheiro | `CASH` | Pagamento em dinheiro |
| Cartão de Crédito | `CREDIT_CARD` | Cartão de crédito |
| Cartão de Débito | `DEBIT_CARD` | Cartão de débito |
| PIX | `PIX` | Pagamento instantâneo |
| Boleto | `BANK_SLIP` | Boleto bancário |
| Transferência | `BANK_TRANSFER` | Transferência bancária |
| Cheque | `CHECK` | Pagamento em cheque |
| Outro | `OTHER` | Outros métodos |
