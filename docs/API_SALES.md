# API de Vendas - Referência de Integração

## Sumário
- [Autenticação](#autenticação)
- [Criar Venda (Orçamento)](#criar-venda-orçamento)
- [Listar Vendas](#listar-vendas)
- [Buscar Venda Específica](#buscar-venda-específica)
- [Atualizar Venda](#atualizar-venda)
- [Aprovar Venda](#aprovar-venda)
- [Cancelar Venda](#cancelar-venda)
- [Concluir Venda](#concluir-venda)
- [Adicionar Item](#adicionar-item)
- [Atualizar Item](#atualizar-item)
- [Remover Item](#remover-item)
- [Buscar Estatísticas](#buscar-estatísticas)
- [Exportar PDF](#exportar-pdf)
- [Exportar Excel](#exportar-excel)

---

## Autenticação

Todos os endpoints requerem autenticação JWT.

**Header obrigatório:**
```
Authorization: Bearer {seu_token_jwt}
```

O token JWT deve conter o `companyId` no payload.

---

## Criar Venda (Orçamento)

Cria uma nova venda com status inicial de orçamento.

### Endpoint
```
POST /sales
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
  "customerId": "uuid",
  "paymentMethodId": "uuid",
  "items": [
    {
      "productId": "uuid",
      "quantity": "number (> 0)",
      "unitPrice": "number (> 0)"
    }
  ]
}
```

**Campos opcionais:**
```json
{
  "installments": "number (1-48, padrão: 1)",
  "discount": "number (>= 0)",
  "shipping": "number (>= 0)",
  "notes": "string",
  "deliveryDate": "string (ISO 8601 date)",
  "saleDate": "string (ISO 8601 date, padrão: hoje)"
}
```

### Exemplos de Request

**Exemplo 1: Venda à Vista**
```json
{
  "customerId": "123e4567-e89b-12d3-a456-426614174001",
  "paymentMethodId": "123e4567-e89b-12d3-a456-426614174002",
  "installments": 1,
  "discount": 50.00,
  "shipping": 25.00,
  "notes": "Cliente solicitou entrega rápida",
  "items": [
    {
      "productId": "123e4567-e89b-12d3-a456-426614174003",
      "quantity": 2,
      "unitPrice": 150.00
    },
    {
      "productId": "123e4567-e89b-12d3-a456-426614174004",
      "quantity": 1,
      "unitPrice": 99.90
    }
  ]
}
```

**Exemplo 2: Venda Parcelada**
```json
{
  "customerId": "123e4567-e89b-12d3-a456-426614174001",
  "paymentMethodId": "123e4567-e89b-12d3-a456-426614174002",
  "installments": 3,
  "saleDate": "2024-11-10",
  "deliveryDate": "2024-11-15",
  "items": [
    {
      "productId": "123e4567-e89b-12d3-a456-426614174003",
      "quantity": 5,
      "unitPrice": 200.00
    }
  ]
}
```

**Exemplo 3: Venda com Múltiplos Produtos**
```json
{
  "customerId": "123e4567-e89b-12d3-a456-426614174001",
  "paymentMethodId": "123e4567-e89b-12d3-a456-426614174002",
  "discount": 100.00,
  "items": [
    {
      "productId": "123e4567-e89b-12d3-a456-426614174003",
      "quantity": 10,
      "unitPrice": 50.00
    },
    {
      "productId": "123e4567-e89b-12d3-a456-426614174004",
      "quantity": 5,
      "unitPrice": 120.00
    },
    {
      "productId": "123e4567-e89b-12d3-a456-426614174005",
      "quantity": 2,
      "unitPrice": 300.00
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
  "customerId": "uuid",
  "paymentMethodId": "uuid",
  "saleNumber": "SALE-2024-00001",
  "status": "DRAFT",
  "saleDate": "2024-11-10T00:00:00.000Z",
  "deliveryDate": null,
  "subtotal": 399.90,
  "discount": 50.00,
  "shipping": 25.00,
  "totalAmount": 374.90,
  "installments": 1,
  "notes": "Cliente solicitou entrega rápida",
  "creditAnalysisStatus": null,
  "creditAnalysisNotes": null,
  "approvedAt": null,
  "approvedBy": null,
  "canceledAt": null,
  "canceledBy": null,
  "cancelReason": null,
  "completedAt": null,
  "createdAt": "2024-11-10T19:26:28.000Z",
  "updatedAt": "2024-11-10T19:26:28.000Z",
  "items": [
    {
      "id": "uuid",
      "saleId": "uuid",
      "productId": "123e4567-e89b-12d3-a456-426614174003",
      "quantity": 2,
      "unitPrice": 150.00,
      "subtotal": 300.00,
      "discount": 0,
      "totalPrice": 300.00,
      "createdAt": "2024-11-10T19:26:28.000Z",
      "updatedAt": "2024-11-10T19:26:28.000Z"
    },
    {
      "id": "uuid",
      "saleId": "uuid",
      "productId": "123e4567-e89b-12d3-a456-426614174004",
      "quantity": 1,
      "unitPrice": 99.90,
      "subtotal": 99.90,
      "discount": 0,
      "totalPrice": 99.90,
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
    "customerId must be a UUID",
    "paymentMethodId must be a UUID",
    "items must contain at least 1 element"
  ],
  "error": "Bad Request"
}
```

**Status:** `404 Not Found`
```json
{
  "statusCode": 404,
  "message": "Cliente não encontrado",
  "error": "Not Found"
}
```

```json
{
  "statusCode": 404,
  "message": "Método de pagamento não encontrado",
  "error": "Not Found"
}
```

```json
{
  "statusCode": 404,
  "message": "Produto não encontrado",
  "error": "Not Found"
}
```

**Status:** `409 Conflict`
```json
{
  "statusCode": 409,
  "message": "Estoque insuficiente para o produto 'Nome do Produto'. Disponível: 5, Solicitado: 10",
  "error": "Conflict"
}
```

```json
{
  "statusCode": 409,
  "message": "Número de parcelas (12) excede o máximo permitido pelo método de pagamento (10)",
  "error": "Conflict"
}
```

---

## Listar Vendas

Lista todas as vendas da empresa com paginação e filtros.

### Endpoint
```
GET /sales
```

### Headers
```
Authorization: Bearer {token}
```

### Query Parameters

| Parâmetro | Tipo | Descrição | Exemplo |
|-----------|------|-----------|---------|
| `page` | number | Página (padrão: 1) | `?page=2` |
| `limit` | number | Itens por página (padrão: 10, máx: 100) | `?limit=20` |
| `status` | string | Filtrar por status | `?status=APPROVED` |
| `customerId` | string (uuid) | Filtrar por cliente | `?customerId=uuid` |
| `startDate` | string (date) | Data inicial | `?startDate=2024-01-01` |
| `endDate` | string (date) | Data final | `?endDate=2024-12-31` |
| `minAmount` | number | Valor mínimo | `?minAmount=100` |
| `maxAmount` | number | Valor máximo | `?maxAmount=5000` |

### Status Disponíveis

- `DRAFT` - Orçamento (rascunho)
- `PENDING_APPROVAL` - Aguardando aprovação
- `APPROVED` - Aprovada
- `COMPLETED` - Concluída
- `CANCELED` - Cancelada

### Exemplos de Request

```
GET /sales
GET /sales?page=1&limit=20
GET /sales?status=APPROVED
GET /sales?customerId=123e4567-e89b-12d3-a456-426614174001
GET /sales?startDate=2024-01-01&endDate=2024-12-31
GET /sales?minAmount=1000&maxAmount=5000
GET /sales?status=APPROVED&startDate=2024-11-01
```

### Response

**Status:** `200 OK`

```json
{
  "data": [
    {
      "id": "uuid",
      "companyId": "uuid",
      "customerId": "uuid",
      "paymentMethodId": "uuid",
      "saleNumber": "SALE-2024-00001",
      "status": "DRAFT",
      "saleDate": "2024-11-10T00:00:00.000Z",
      "deliveryDate": null,
      "subtotal": 399.90,
      "discount": 50.00,
      "shipping": 25.00,
      "totalAmount": 374.90,
      "installments": 1,
      "notes": "Cliente solicitou entrega rápida",
      "creditAnalysisStatus": null,
      "creditAnalysisNotes": null,
      "approvedAt": null,
      "approvedBy": null,
      "canceledAt": null,
      "canceledBy": null,
      "cancelReason": null,
      "completedAt": null,
      "createdAt": "2024-11-10T19:26:28.000Z",
      "updatedAt": "2024-11-10T19:26:28.000Z",
      "customer": {
        "id": "uuid",
        "name": "João Silva",
        "email": "joao@example.com"
      },
      "paymentMethod": {
        "id": "uuid",
        "name": "PIX",
        "code": "PIX"
      },
      "items": [
        {
          "id": "uuid",
          "productId": "uuid",
          "quantity": 2,
          "unitPrice": 150.00,
          "totalPrice": 300.00,
          "product": {
            "id": "uuid",
            "name": "Produto A",
            "sku": "PROD-001"
          }
        }
      ]
    }
  ],
  "total": 45,
  "page": 1,
  "limit": 10,
  "totalPages": 5
}
```

---

## Buscar Venda Específica

Busca uma venda por ID com todos os detalhes.

### Endpoint
```
GET /sales/:id
```

### Headers
```
Authorization: Bearer {token}
```

### Path Parameters

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `id` | string (uuid) | ID da venda |

### Exemplo de Request

```
GET /sales/123e4567-e89b-12d3-a456-426614174000
```

### Response

**Status:** `200 OK`

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "companyId": "uuid",
  "customerId": "uuid",
  "paymentMethodId": "uuid",
  "saleNumber": "SALE-2024-00001",
  "status": "APPROVED",
  "saleDate": "2024-11-10T00:00:00.000Z",
  "deliveryDate": "2024-11-15T00:00:00.000Z",
  "subtotal": 1000.00,
  "discount": 100.00,
  "shipping": 50.00,
  "totalAmount": 950.00,
  "installments": 3,
  "notes": "Cliente preferencial",
  "creditAnalysisStatus": "APPROVED",
  "creditAnalysisNotes": "Crédito aprovado - Score 850",
  "approvedAt": "2024-11-10T20:00:00.000Z",
  "approvedBy": "uuid",
  "canceledAt": null,
  "canceledBy": null,
  "cancelReason": null,
  "completedAt": null,
  "createdAt": "2024-11-10T19:26:28.000Z",
  "updatedAt": "2024-11-10T20:00:00.000Z",
  "customer": {
    "id": "uuid",
    "name": "João Silva",
    "email": "joao@example.com",
    "cpfCnpj": "123.456.789-00",
    "phone": "(11) 98765-4321"
  },
  "paymentMethod": {
    "id": "uuid",
    "name": "Cartão de Crédito",
    "code": "CREDIT_CARD",
    "type": "CREDIT_CARD",
    "allowInstallments": true,
    "maxInstallments": 12
  },
  "items": [
    {
      "id": "uuid",
      "saleId": "uuid",
      "productId": "uuid",
      "quantity": 5,
      "unitPrice": 200.00,
      "subtotal": 1000.00,
      "discount": 0,
      "totalPrice": 1000.00,
      "createdAt": "2024-11-10T19:26:28.000Z",
      "updatedAt": "2024-11-10T19:26:28.000Z",
      "product": {
        "id": "uuid",
        "name": "Produto Premium",
        "sku": "PROD-PREMIUM-001",
        "price": 200.00,
        "stockQuantity": 95
      }
    }
  ]
}
```

### Erros

**Status:** `404 Not Found`
```json
{
  "statusCode": 404,
  "message": "Venda não encontrada",
  "error": "Not Found"
}
```

---

## Atualizar Venda

Atualiza uma venda em status de orçamento (DRAFT).

### Endpoint
```
PUT /sales/:id
```

### Headers
```
Authorization: Bearer {token}
Content-Type: application/json
```

### Path Parameters

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `id` | string (uuid) | ID da venda |

### Body (JSON)

Todos os campos são opcionais. Envie apenas os campos que deseja atualizar.

```json
{
  "customerId": "uuid",
  "paymentMethodId": "uuid",
  "installments": "number",
  "discount": "number",
  "shipping": "number",
  "notes": "string",
  "deliveryDate": "string (ISO 8601 date)",
  "saleDate": "string (ISO 8601 date)"
}
```

**Nota:** Itens devem ser gerenciados pelos endpoints específicos (adicionar/atualizar/remover).

### Exemplo de Request

```json
{
  "discount": 150.00,
  "shipping": 30.00,
  "notes": "Desconto adicional aplicado",
  "deliveryDate": "2024-11-20"
}
```

### Response

**Status:** `200 OK`

```json
{
  "id": "uuid",
  "companyId": "uuid",
  "customerId": "uuid",
  "paymentMethodId": "uuid",
  "saleNumber": "SALE-2024-00001",
  "status": "DRAFT",
  "saleDate": "2024-11-10T00:00:00.000Z",
  "deliveryDate": "2024-11-20T00:00:00.000Z",
  "subtotal": 1000.00,
  "discount": 150.00,
  "shipping": 30.00,
  "totalAmount": 880.00,
  "installments": 1,
  "notes": "Desconto adicional aplicado",
  "updatedAt": "2024-11-10T20:30:00.000Z"
}
```

### Erros

**Status:** `400 Bad Request`
```json
{
  "statusCode": 400,
  "message": "Apenas vendas com status DRAFT podem ser editadas",
  "error": "Bad Request"
}
```

---

## Aprovar Venda

Aprova uma venda, movendo do status DRAFT ou PENDING_APPROVAL para APPROVED.

### Endpoint
```
POST /sales/:id/approve
```

### Headers
```
Authorization: Bearer {token}
Content-Type: application/json
```

### Path Parameters

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `id` | string (uuid) | ID da venda |

### Body (JSON)

Se o método de pagamento requer análise de crédito, os campos são obrigatórios:

```json
{
  "creditAnalysisStatus": "APPROVED | REJECTED",
  "creditAnalysisNotes": "string (opcional)"
}
```

Se não requer análise de crédito, o body pode ser vazio:
```json
{}
```

### Exemplos de Request

**Aprovação com Análise de Crédito:**
```json
{
  "creditAnalysisStatus": "APPROVED",
  "creditAnalysisNotes": "Cliente com ótimo histórico. Score de crédito: 850"
}
```

**Reprovação de Crédito:**
```json
{
  "creditAnalysisStatus": "REJECTED",
  "creditAnalysisNotes": "Score de crédito abaixo do mínimo exigido (450 < 600)"
}
```

**Aprovação Simples (sem análise de crédito):**
```json
{}
```

### Response

**Status:** `200 OK`

**Aprovação bem-sucedida:**
```json
{
  "id": "uuid",
  "companyId": "uuid",
  "customerId": "uuid",
  "paymentMethodId": "uuid",
  "saleNumber": "SALE-2024-00001",
  "status": "APPROVED",
  "totalAmount": 950.00,
  "creditAnalysisStatus": "APPROVED",
  "creditAnalysisNotes": "Cliente com ótimo histórico. Score de crédito: 850",
  "approvedAt": "2024-11-10T20:00:00.000Z",
  "approvedBy": "uuid",
  "updatedAt": "2024-11-10T20:00:00.000Z"
}
```

**Reprovação de Crédito:**
```json
{
  "id": "uuid",
  "status": "CANCELED",
  "creditAnalysisStatus": "REJECTED",
  "creditAnalysisNotes": "Score de crédito abaixo do mínimo exigido",
  "cancelReason": "Crédito não aprovado",
  "canceledAt": "2024-11-10T20:00:00.000Z",
  "canceledBy": "uuid"
}
```

### Erros

**Status:** `400 Bad Request`
```json
{
  "statusCode": 400,
  "message": "Apenas vendas com status DRAFT ou PENDING_APPROVAL podem ser aprovadas",
  "error": "Bad Request"
}
```

```json
{
  "statusCode": 400,
  "message": [
    "creditAnalysisStatus must be APPROVED or REJECTED",
    "Este método de pagamento requer análise de crédito"
  ],
  "error": "Bad Request"
}
```

**Status:** `409 Conflict`
```json
{
  "statusCode": 409,
  "message": "Estoque insuficiente para o produto 'Produto A'. Disponível: 3, Necessário: 5",
  "error": "Conflict"
}
```

---

## Cancelar Venda

Cancela uma venda que não foi concluída.

### Endpoint
```
POST /sales/:id/cancel
```

### Headers
```
Authorization: Bearer {token}
Content-Type: application/json
```

### Path Parameters

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `id` | string (uuid) | ID da venda |

### Body (JSON)

```json
{
  "reason": "string (obrigatório)"
}
```

### Exemplo de Request

```json
{
  "reason": "Cliente desistiu da compra"
}
```

### Response

**Status:** `200 OK`

```json
{
  "id": "uuid",
  "companyId": "uuid",
  "customerId": "uuid",
  "paymentMethodId": "uuid",
  "saleNumber": "SALE-2024-00001",
  "status": "CANCELED",
  "totalAmount": 950.00,
  "cancelReason": "Cliente desistiu da compra",
  "canceledAt": "2024-11-10T21:00:00.000Z",
  "canceledBy": "uuid",
  "updatedAt": "2024-11-10T21:00:00.000Z"
}
```

### Erros

**Status:** `400 Bad Request`
```json
{
  "statusCode": 400,
  "message": "Vendas já concluídas não podem ser canceladas",
  "error": "Bad Request"
}
```

```json
{
  "statusCode": 400,
  "message": [
    "reason should not be empty",
    "reason must be a string"
  ],
  "error": "Bad Request"
}
```

---

## Concluir Venda

Marca uma venda como concluída.

### Endpoint
```
POST /sales/:id/complete
```

### Headers
```
Authorization: Bearer {token}
```

### Path Parameters

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `id` | string (uuid) | ID da venda |

### Exemplo de Request

```
POST /sales/123e4567-e89b-12d3-a456-426614174000/complete
```

### Response

**Status:** `200 OK`

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "companyId": "uuid",
  "customerId": "uuid",
  "paymentMethodId": "uuid",
  "saleNumber": "SALE-2024-00001",
  "status": "COMPLETED",
  "totalAmount": 950.00,
  "completedAt": "2024-11-10T22:00:00.000Z",
  "updatedAt": "2024-11-10T22:00:00.000Z"
}
```

### Erros

**Status:** `400 Bad Request`
```json
{
  "statusCode": 400,
  "message": "Apenas vendas aprovadas podem ser concluídas",
  "error": "Bad Request"
}
```

---

## Adicionar Item

Adiciona um novo item a uma venda em status DRAFT.

### Endpoint
```
POST /sales/:id/items
```

### Headers
```
Authorization: Bearer {token}
Content-Type: application/json
```

### Path Parameters

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `id` | string (uuid) | ID da venda |

### Body (JSON)

```json
{
  "productId": "uuid (obrigatório)",
  "quantity": "number (> 0, obrigatório)",
  "unitPrice": "number (> 0, obrigatório)",
  "discount": "number (>= 0, opcional)"
}
```

### Exemplo de Request

```json
{
  "productId": "123e4567-e89b-12d3-a456-426614174005",
  "quantity": 3,
  "unitPrice": 75.50,
  "discount": 10.00
}
```

### Response

**Status:** `201 Created`

```json
{
  "id": "uuid",
  "saleId": "uuid",
  "productId": "123e4567-e89b-12d3-a456-426614174005",
  "quantity": 3,
  "unitPrice": 75.50,
  "subtotal": 226.50,
  "discount": 10.00,
  "totalPrice": 216.50,
  "createdAt": "2024-11-10T19:30:00.000Z",
  "updatedAt": "2024-11-10T19:30:00.000Z"
}
```

### Erros

**Status:** `400 Bad Request`
```json
{
  "statusCode": 400,
  "message": "Apenas vendas com status DRAFT podem ter itens adicionados",
  "error": "Bad Request"
}
```

**Status:** `404 Not Found`
```json
{
  "statusCode": 404,
  "message": "Produto não encontrado",
  "error": "Not Found"
}
```

**Status:** `409 Conflict`
```json
{
  "statusCode": 409,
  "message": "Produto já adicionado a esta venda",
  "error": "Conflict"
}
```

---

## Atualizar Item

Atualiza um item existente em uma venda DRAFT.

### Endpoint
```
PUT /sales/:id/items/:itemId
```

### Headers
```
Authorization: Bearer {token}
Content-Type: application/json
```

### Path Parameters

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `id` | string (uuid) | ID da venda |
| `itemId` | string (uuid) | ID do item |

### Body (JSON)

Todos os campos são opcionais:

```json
{
  "quantity": "number (> 0)",
  "unitPrice": "number (> 0)",
  "discount": "number (>= 0)"
}
```

### Exemplo de Request

```json
{
  "quantity": 5,
  "discount": 25.00
}
```

### Response

**Status:** `200 OK`

```json
{
  "id": "uuid",
  "saleId": "uuid",
  "productId": "uuid",
  "quantity": 5,
  "unitPrice": 75.50,
  "subtotal": 377.50,
  "discount": 25.00,
  "totalPrice": 352.50,
  "updatedAt": "2024-11-10T20:00:00.000Z"
}
```

### Erros

**Status:** `400 Bad Request`
```json
{
  "statusCode": 400,
  "message": "Apenas vendas com status DRAFT podem ter itens atualizados",
  "error": "Bad Request"
}
```

**Status:** `404 Not Found`
```json
{
  "statusCode": 404,
  "message": "Item não encontrado",
  "error": "Not Found"
}
```

---

## Remover Item

Remove um item de uma venda em status DRAFT.

### Endpoint
```
DELETE /sales/:id/items/:itemId
```

### Headers
```
Authorization: Bearer {token}
```

### Path Parameters

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `id` | string (uuid) | ID da venda |
| `itemId` | string (uuid) | ID do item |

### Exemplo de Request

```
DELETE /sales/123e4567-e89b-12d3-a456-426614174000/items/123e4567-e89b-12d3-a456-426614174010
```

### Response

**Status:** `200 OK`

```json
{
  "message": "Item removido com sucesso"
}
```

### Erros

**Status:** `400 Bad Request`
```json
{
  "statusCode": 400,
  "message": "Apenas vendas com status DRAFT podem ter itens removidos",
  "error": "Bad Request"
}
```

```json
{
  "statusCode": 400,
  "message": "A venda deve ter pelo menos um item",
  "error": "Bad Request"
}
```

**Status:** `404 Not Found`
```json
{
  "statusCode": 404,
  "message": "Item não encontrado",
  "error": "Not Found"
}
```

---

## Buscar Estatísticas

Obtém estatísticas de vendas da empresa.

### Endpoint
```
GET /sales/statistics/summary
```

### Headers
```
Authorization: Bearer {token}
```

### Query Parameters

| Parâmetro | Tipo | Descrição | Exemplo |
|-----------|------|-----------|---------|
| `startDate` | string (date) | Data inicial (padrão: início do mês) | `?startDate=2024-01-01` |
| `endDate` | string (date) | Data final (padrão: hoje) | `?endDate=2024-12-31` |

### Exemplo de Request

```
GET /sales/statistics/summary
GET /sales/statistics/summary?startDate=2024-01-01&endDate=2024-12-31
GET /sales/statistics/summary?startDate=2024-11-01
```

### Response

**Status:** `200 OK`

```json
{
  "period": {
    "startDate": "2024-11-01",
    "endDate": "2024-11-10"
  },
  "totalSales": 45,
  "totalRevenue": 125750.00,
  "averageTicket": 2794.44,
  "salesByStatus": {
    "DRAFT": 5,
    "PENDING_APPROVAL": 3,
    "APPROVED": 25,
    "COMPLETED": 10,
    "CANCELED": 2
  },
  "topCustomers": [
    {
      "customerId": "uuid",
      "customerName": "João Silva",
      "totalPurchases": 15000.00,
      "salesCount": 8
    },
    {
      "customerId": "uuid",
      "customerName": "Maria Santos",
      "totalPurchases": 12500.00,
      "salesCount": 5
    }
  ],
  "topProducts": [
    {
      "productId": "uuid",
      "productName": "Produto Premium",
      "totalSold": 150,
      "revenue": 30000.00
    },
    {
      "productId": "uuid",
      "productName": "Produto Standard",
      "totalSold": 280,
      "revenue": 25200.00
    }
  ],
  "salesByPaymentMethod": {
    "PIX": {
      "count": 20,
      "total": 45000.00
    },
    "CREDIT_CARD": {
      "count": 15,
      "total": 60000.00
    },
    "BANK_SLIP": {
      "count": 10,
      "total": 20750.00
    }
  }
}
```

---

## Exportar PDF

Gera e baixa um PDF do orçamento ou venda confirmada, incluindo a logo da empresa.

### Endpoint
```
GET /sales/:id/pdf
```

### Headers
```
Authorization: Bearer {token}
```

### Path Parameters

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `id` | string (uuid) | ID da venda/orçamento |

### Exemplo de Request

```
GET /sales/123e4567-e89b-12d3-a456-426614174000/pdf
```

### Response

**Status:** `200 OK`

**Content-Type:** `application/pdf`

**Headers:**
```
Content-Disposition: attachment; filename="orcamento-SALE-2024-00001.pdf"
Content-Type: application/pdf
Content-Length: 125478
```

O PDF será baixado automaticamente com o nome:
- `orcamento-{código}.pdf` - Para vendas com status QUOTE
- `venda-{código}.pdf` - Para vendas confirmadas

### Características do PDF

✅ **Layout Profissional:**
- Logo da empresa (se configurada)
- Cabeçalho com dados da empresa
- Status visual da venda/orçamento
- Cores diferenciadas por status

✅ **Informações Incluídas:**
- Dados completos do cliente
- Lista de produtos com preços
- Valores (subtotal, descontos, frete)
- Método de pagamento e parcelas
- Datas (emissão, validade, confirmação)
- Observações
- Análise de crédito (quando aplicável)
- Motivo de cancelamento (se aplicável)

✅ **Recursos Visuais:**
- Marca d'água "ORÇAMENTO" para status QUOTE
- Tabela formatada de produtos
- Resumo de valores destacado
- Rodapé com data de geração

### Erros

**Status:** `404 Not Found`
```json
{
  "statusCode": 404,
  "message": "Venda não encontrada",
  "error": "Not Found"
}
```

---

## Exportar Excel

Gera e baixa uma planilha Excel com todas as vendas filtradas. A planilha contém 3 abas: vendas, itens detalhados e resumo.

### Endpoint
```
GET /sales/export/excel
```

### Headers
```
Authorization: Bearer {token}
```

### Query Parameters (Filtros)

| Parâmetro | Tipo | Descrição | Exemplo |
|-----------|------|-----------|---------|
| `status` | string | Filtrar por status | `?status=APPROVED` |
| `customerId` | string (uuid) | Filtrar por cliente | `?customerId=uuid` |
| `paymentMethodId` | string (uuid) | Filtrar por método de pagamento | `?paymentMethodId=uuid` |
| `startDate` | string (date) | Data inicial | `?startDate=2024-01-01` |
| `endDate` | string (date) | Data final | `?endDate=2024-12-31` |
| `minAmount` | number | Valor mínimo | `?minAmount=100` |
| `maxAmount` | number | Valor máximo | `?maxAmount=5000` |

### Exemplos de Request

```
GET /sales/export/excel
GET /sales/export/excel?status=APPROVED
GET /sales/export/excel?startDate=2024-01-01&endDate=2024-12-31
GET /sales/export/excel?status=COMPLETED&startDate=2024-11-01
GET /sales/export/excel?customerId=uuid&minAmount=1000
GET /sales/export/excel?status=QUOTE&paymentMethodId=uuid
```

### Response

**Status:** `200 OK`

**Content-Type:** `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

**Headers:**
```
Content-Disposition: attachment; filename="vendas-2024-11-10-APPROVED.xlsx"
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Length: 45678
```

O Excel será baixado automaticamente com nome baseado nos filtros:
- `vendas-{data}.xlsx` - Sem filtros
- `vendas-{data}-{status}.xlsx` - Com filtro de status
- `vendas-{data}-{startDate}_{endDate}.xlsx` - Com filtro de período

### Características do Excel

✅ **Aba 1 - Vendas:**
- Lista completa de todas as vendas
- Colunas: Código, Status, Data, Cliente, CPF/CNPJ, Método Pagamento, Parcelas, Subtotal, Desconto, Frete, Total, Qtd. Itens, Observações
- Cores por status (fundo colorido na coluna Status)
- Formatação monetária brasileira (R$)
- Formatação de datas (dd/mm/yyyy)
- Linha de totalizadores no final
- Bordas e cabeçalho estilizado

✅ **Aba 2 - Itens Detalhados:**
- Lista de todos os itens de todas as vendas
- Colunas: Código Venda, Cliente, SKU, Produto, Quantidade, Preço Unit., Desconto, Total
- Formatação monetária
- Bordas e cabeçalho estilizado

✅ **Aba 3 - Resumo:**
- Total de vendas
- Receita total
- Ticket médio
- Total de descontos
- Total de fretes
- Vendas por status (quantidade)
- Período dos filtros aplicados

### Recursos Visuais

- 📊 Cabeçalhos com fundo escuro e texto branco
- 🎨 Status com cores diferenciadas (Orçamento=laranja, Aprovada=verde, etc.)
- 💰 Valores formatados como moeda brasileira
- 📅 Datas formatadas (dd/mm/yyyy)
- 📐 Bordas em todas as células
- 📈 Fórmulas automáticas para totalizadores
- 📑 3 abas organizadas (Vendas, Itens, Resumo)

### Status Disponíveis para Filtro

- `QUOTE` - Orçamento
- `PENDING_APPROVAL` - Aguardando Aprovação
- `APPROVED` - Aprovada
- `CONFIRMED` - Confirmada
- `IN_PRODUCTION` - Em Produção
- `READY_TO_SHIP` - Pronto para Envio
- `SHIPPED` - Enviado
- `DELIVERED` - Entregue
- `COMPLETED` - Concluída
- `CANCELED` - Cancelada
- `REJECTED` - Rejeitada

### Casos de Uso

**1. Relatório Mensal:**
```
GET /sales/export/excel?startDate=2024-11-01&endDate=2024-11-30
```

**2. Vendas Aprovadas do Cliente:**
```
GET /sales/export/excel?status=APPROVED&customerId=uuid
```

**3. Vendas Acima de R$ 5.000:**
```
GET /sales/export/excel?minAmount=5000
```

**4. Orçamentos Pendentes:**
```
GET /sales/export/excel?status=QUOTE
```

**5. Vendas Concluídas do Ano:**
```
GET /sales/export/excel?status=COMPLETED&startDate=2024-01-01&endDate=2024-12-31
```

**6. Vendas por Método de Pagamento:**
```
GET /sales/export/excel?paymentMethodId=uuid&startDate=2024-01-01
```

### Erros

**Status:** `400 Bad Request`
```json
{
  "statusCode": 400,
  "message": "Data inválida",
  "error": "Bad Request"
}
```

---

## Status da Venda - Fluxo

```
DRAFT (Orçamento)
    ↓ [Aprovar]
PENDING_APPROVAL (Aguardando análise de crédito - se necessário)
    ↓ [Aprovar com análise]
APPROVED (Aprovada)
    ↓ [Concluir]
COMPLETED (Concluída)

Qualquer status pode ir para:
CANCELED (Cancelada) - exceto COMPLETED
```

## Status de Análise de Crédito

- `PENDING` - Aguardando análise
- `APPROVED` - Crédito aprovado
- `REJECTED` - Crédito rejeitado (venda é automaticamente cancelada)

---

## Cálculos Automáticos

### Subtotal do Item
```
subtotal = quantity × unitPrice
```

### Total do Item
```
totalPrice = subtotal - discount
```

### Subtotal da Venda
```
subtotal = soma de todos os items.totalPrice
```

### Total da Venda
```
totalAmount = subtotal - discount + shipping
```

---

## Notas Importantes

1. **Orçamento vs Venda**: Todas as vendas iniciam como orçamento (DRAFT) e podem ser editadas livremente neste status.

2. **Análise de Crédito**: Se o método de pagamento requer análise de crédito, a venda vai para PENDING_APPROVAL e requer aprovação com status de crédito.

3. **Estoque**: O estoque é reservado quando a venda é aprovada, não na criação do orçamento.

4. **Cancelamento**: Vendas canceladas liberam o estoque reservado.

5. **Parcelamento**: O número de parcelas não pode exceder o máximo permitido pelo método de pagamento.

6. **Edição**: Apenas vendas DRAFT podem ser editadas. Vendas aprovadas não podem ser modificadas.

7. **Itens**: Uma venda deve ter pelo menos 1 item. Não é possível remover o último item.
