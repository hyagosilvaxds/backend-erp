# 🎯 API de Gerenciamento de Vendas - Guia Completo

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Listar Vendas](#listar-vendas)
3. [Consultar Venda](#consultar-venda)
4. [Editar Venda](#editar-venda)
5. [Confirmar Venda](#confirmar-venda)
6. [Cancelar Venda](#cancelar-venda)
7. [Análise de Crédito](#análise-de-crédito)
8. [Alterar Status](#alterar-status)
9. [Excluir Venda](#excluir-venda)
10. [Fluxo de Estados](#fluxo-de-estados)
11. [Permissões](#permissões)

---

## 🎯 Visão Geral

O módulo de vendas oferece endpoints completos para gerenciar todo o ciclo de vida de vendas e orçamentos:

### Operações Disponíveis

| Operação | Endpoint | Método | Descrição |
|----------|----------|--------|-----------|
| **Listar** | `/sales` | GET | Lista vendas com filtros |
| **Consultar** | `/sales/:id` | GET | Detalhes de uma venda |
| **Editar** | `/sales/:id` | PUT | Atualiza dados da venda |
| **Confirmar** | `/sales/:id/confirm` | POST | Confirma venda (baixa estoque + cria financeiro) |
| **Cancelar** | `/sales/:id/cancel` | POST | Cancela venda (devolve estoque + cancela financeiro) |
| **Aprovar Crédito** | `/sales/:id/credit-analysis/approve` | POST | Aprova análise de crédito |
| **Rejeitar Crédito** | `/sales/:id/credit-analysis/reject` | POST | Rejeita análise de crédito |
| **Alterar Status** | `/sales/:id/status` | PATCH | Muda status manualmente |
| **Exportar PDF** | `/sales/:id/pdf` | GET | Gera PDF da venda |
| **Exportar Excel** | `/sales/export/excel` | GET | Exporta múltiplas vendas |

---

## 📋 Listar Vendas

### `GET /sales`

Lista todas as vendas da empresa com suporte a filtros e paginação.

### 🔌 Endpoint

```http
GET /sales?page=1&limit=20&status=CONFIRMED
Authorization: Bearer {seu_token_jwt}
```

### 📊 Query Parameters (Filtros)

| Parâmetro | Tipo | Descrição | Exemplo |
|-----------|------|-----------|---------|
| `status` | String | Filtrar por status | `CONFIRMED` |
| `customerId` | UUID | Filtrar por cliente | `550e8400-...` |
| `startDate` | Date | Data inicial (ISO 8601) | `2025-01-01` |
| `endDate` | Date | Data final (ISO 8601) | `2025-12-31` |
| `search` | String | Busca em código, nome do cliente | `João` |
| `page` | Number | Número da página | `1` |
| `limit` | Number | Itens por página | `20` |

### 📤 Response

**Status:** `200 OK`

```json
{
  "data": [
    {
      "id": "sale-uuid-123",
      "code": "ORC-2025-0001",
      "status": "QUOTE",
      "customerId": "customer-uuid",
      "customerName": "João da Silva",
      "subtotal": 1500.00,
      "discountAmount": 150.00,
      "shippingCost": 50.00,
      "totalAmount": 1400.00,
      "paymentMethod": {
        "id": "pay-123",
        "name": "Boleto Bancário"
      },
      "installments": 3,
      "items": [
        {
          "id": "item-1",
          "productCode": "PROD-001",
          "productName": "Mouse Gamer",
          "quantity": 2,
          "unitPrice": 150.00,
          "discount": 10.00,
          "total": 290.00
        }
      ],
      "quoteDate": "2025-11-10T10:30:00.000Z",
      "validUntil": "2025-12-10T23:59:59.999Z",
      "createdAt": "2025-11-10T10:30:00.000Z",
      "updatedAt": "2025-11-10T10:30:00.000Z"
    }
  ],
  "meta": {
    "total": 45,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

### 💡 Exemplos

#### Listar orçamentos pendentes
```bash
GET /sales?status=QUOTE&page=1&limit=10
```

#### Buscar vendas de um cliente
```bash
GET /sales?customerId=550e8400-e29b-41d4-a716-446655440000
```

#### Vendas confirmadas do mês
```bash
GET /sales?status=CONFIRMED&startDate=2025-11-01&endDate=2025-11-30
```

#### Busca por texto
```bash
GET /sales?search=João
# Busca em: código da venda, nome do cliente
```

---

## 🔍 Consultar Venda

### `GET /sales/:id`

Retorna detalhes completos de uma venda específica.

### 🔌 Endpoint

```http
GET /sales/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer {seu_token_jwt}
```

### 📤 Response

**Status:** `200 OK`

```json
{
  "id": "sale-uuid-123",
  "code": "VEN-2025-0001",
  "status": "CONFIRMED",
  "companyId": "company-uuid",
  "customerId": "customer-uuid",
  
  "customer": {
    "id": "customer-uuid",
    "name": "João da Silva",
    "cpf": "123.456.789-00",
    "email": "joao@email.com",
    "phone": "(11) 98765-4321"
  },
  
  "subtotal": 2500.00,
  "discountAmount": 250.00,
  "discountPercent": 0,
  "shippingCost": 100.00,
  "otherCharges": 50.00,
  "otherChargesDesc": "Seguro",
  "totalAmount": 2400.00,
  
  "paymentMethodId": "pay-123",
  "paymentMethod": {
    "id": "pay-123",
    "name": "Cartão de Crédito",
    "type": "CREDIT_CARD"
  },
  "installments": 6,
  "installmentValue": 400.00,
  
  "items": [
    {
      "id": "item-1",
      "productId": "prod-123",
      "productCode": "NB-DELL-001",
      "productName": "Notebook Dell Inspiron",
      "productUnit": "UN",
      "quantity": 1,
      "unitPrice": 2500.00,
      "discount": 0,
      "subtotal": 2500.00,
      "total": 2500.00,
      "stockLocation": {
        "id": "loc-123",
        "name": "Depósito Principal"
      },
      "notes": null
    }
  ],
  
  "creditAnalysisRequired": true,
  "creditAnalysisStatus": "APPROVED",
  "creditAnalysisDate": "2025-11-10T14:20:00.000Z",
  "creditAnalysisNotes": "Cliente com ótimo histórico",
  "creditScore": 850,
  
  "useCustomerAddress": true,
  "deliveryAddress": null,
  
  "notes": "Entregar entre 9h-12h",
  "internalNotes": "Cliente VIP - priorizar",
  
  "quoteDate": "2025-11-10T10:00:00.000Z",
  "validUntil": "2025-12-10T23:59:59.999Z",
  "confirmedAt": "2025-11-10T14:30:00.000Z",
  "canceledAt": null,
  "cancellationReason": null,
  
  "createdAt": "2025-11-10T10:00:00.000Z",
  "updatedAt": "2025-11-10T14:30:00.000Z"
}
```

### ⚠️ Erros

#### 404 - Venda não encontrada
```json
{
  "statusCode": 404,
  "message": "Venda não encontrada",
  "error": "Not Found"
}
```

---

## ✏️ Editar Venda

### `PUT /sales/:id`

Atualiza dados de uma venda. **Importante:** Não é possível alterar itens ou cliente após criação.

### 🔌 Endpoint

```http
PUT /sales/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer {seu_token_jwt}
Content-Type: application/json
```

### 📥 Request Body

```json
{
  "status": "PENDING_APPROVAL",
  "paymentMethodId": "pay-456",
  "installments": 3,
  "discountPercent": 15,
  "discountAmount": 0,
  "shippingCost": 75.00,
  "otherCharges": 30.00,
  "otherChargesDesc": "Embalagem especial",
  "useCustomerAddress": false,
  "deliveryAddress": {
    "street": "Rua Nova",
    "number": "500",
    "complement": "Sala 10",
    "neighborhood": "Centro",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01234-567"
  },
  "notes": "Observações atualizadas",
  "internalNotes": "Notas internas atualizadas",
  "validUntil": "2025-12-31T23:59:59.999Z"
}
```

### 📋 Campos Editáveis

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `status` | Enum | Novo status (use com cuidado) |
| `paymentMethodId` | UUID | Método de pagamento |
| `installments` | Number | Número de parcelas |
| `discountPercent` | Number | Desconto percentual |
| `discountAmount` | Number | Desconto em valor fixo |
| `shippingCost` | Number | Custo de frete |
| `otherCharges` | Number | Outras despesas |
| `otherChargesDesc` | String | Descrição das despesas |
| `useCustomerAddress` | Boolean | Usar endereço do cliente |
| `deliveryAddress` | Object | Endereço de entrega customizado |
| `notes` | String | Observações gerais |
| `internalNotes` | String | Notas internas |
| `validUntil` | DateTime | Validade (para orçamentos) |

### ❌ Campos NÃO Editáveis

- ❌ `customerId` - Cliente não pode ser alterado
- ❌ `items` - Itens não podem ser alterados (delete e recrie)
- ❌ `code` - Código é gerado automaticamente

### 📤 Response

**Status:** `200 OK`

Retorna a venda atualizada (mesmo formato do GET).

### ⚠️ Restrições

#### 1. Venda confirmada não pode ser editada
```json
{
  "statusCode": 400,
  "message": "Vendas confirmadas não podem ser editadas. Use o endpoint de cancelamento.",
  "error": "Bad Request"
}
```

#### 2. Venda cancelada não pode ser editada
```json
{
  "statusCode": 400,
  "message": "Vendas canceladas não podem ser editadas",
  "error": "Bad Request"
}
```

### 💡 Exemplo Completo

```typescript
async function updateSale(saleId: string, updates: Partial<Sale>) {
  const response = await fetch(`/sales/${saleId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updates)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  return response.json();
}

// Uso: Atualizar frete e observações
await updateSale('sale-123', {
  shippingCost: 100.00,
  notes: 'Entregar urgente'
});
```

---

## ✅ Confirmar Venda

### `POST /sales/:id/confirm`

Confirma a venda, realizando:
1. ✅ Validação de estoque
2. ✅ Baixa de estoque (movimentação tipo EXIT)
3. ✅ Criação de contas a receber no financeiro
4. ✅ Atualização de status para CONFIRMED

### 🔌 Endpoint

```http
POST /sales/550e8400-e29b-41d4-a716-446655440000/confirm
Authorization: Bearer {seu_token_jwt}
```

### 📥 Request Body

Nenhum corpo necessário.

### 📤 Response

**Status:** `200 OK`

```json
{
  "id": "sale-uuid-123",
  "code": "VEN-2025-0001",
  "status": "CONFIRMED",
  "confirmedAt": "2025-11-10T15:30:00.000Z",
  "totalAmount": 2400.00,
  "message": "Venda confirmada com sucesso",
  "stockMovements": [
    {
      "id": "mov-1",
      "productId": "prod-123",
      "locationId": "loc-123",
      "quantity": -1,
      "type": "EXIT",
      "referenceType": "SALE",
      "referenceId": "sale-uuid-123"
    }
  ],
  "accountsReceivable": [
    {
      "id": "acc-1",
      "documentNumber": "VEN-2025-0001",
      "customerName": "João da Silva",
      "installmentNumber": 1,
      "totalInstallments": 6,
      "originalAmount": 400.00,
      "dueDate": "2025-12-10",
      "status": "PENDENTE"
    },
    {
      "id": "acc-2",
      "documentNumber": "VEN-2025-0001",
      "installmentNumber": 2,
      "totalInstallments": 6,
      "originalAmount": 400.00,
      "dueDate": "2026-01-10",
      "status": "PENDENTE"
    }
    // ... mais 4 parcelas
  ]
}
```

### ⚠️ Erros Possíveis

#### 1. Estoque insuficiente
```json
{
  "statusCode": 400,
  "message": "Estoque insuficiente para o produto 'Notebook Dell' no local 'Depósito Principal'. Disponível: 5, Necessário: 10",
  "error": "Bad Request"
}
```

#### 2. Local de estoque não especificado
```json
{
  "statusCode": 400,
  "message": "Local de estoque não especificado para o item 'Notebook Dell'",
  "error": "Bad Request"
}
```

#### 3. Venda já confirmada
```json
{
  "statusCode": 400,
  "message": "Venda já está confirmada",
  "error": "Bad Request"
}
```

#### 4. Método de pagamento não informado
```json
{
  "statusCode": 400,
  "message": "Método de pagamento é obrigatório para confirmar a venda",
  "error": "Bad Request"
}
```

#### 5. Análise de crédito pendente
```json
{
  "statusCode": 400,
  "message": "Análise de crédito pendente. Aprove ou rejeite antes de confirmar.",
  "error": "Bad Request"
}
```

### 🔄 O que Acontece na Confirmação

#### 1️⃣ Validação de Estoque
```typescript
Para cada item:
  - Verifica se stockLocationId foi informado
  - Verifica se há estoque suficiente no local
  - Se produto.manageStock = false, pula validação
```

#### 2️⃣ Movimentação de Estoque
```typescript
Para cada item:
  - Cria ProductStockMovement (type: EXIT)
  - Atualiza ProductStockByLocation (reduz quantity)
  - Registra referência à venda
```

#### 3️⃣ Criação de Contas a Receber
```typescript
Para cada parcela (installments):
  - Cria AccountReceivable com status PENDENTE
  - documentNumber = sale.code
  - dueDate = hoje + (30 * parcela) dias
  - installmentValue = totalAmount / installments
```

#### 4️⃣ Atualização da Venda
```typescript
- status = CONFIRMED
- confirmedAt = now()
```

### 💡 Exemplo de Uso

```typescript
async function confirmSale(saleId: string) {
  try {
    const response = await fetch(`/sales/${saleId}/confirm`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      
      if (error.message.includes('Estoque insuficiente')) {
        alert('Estoque insuficiente! Verifique a disponibilidade.');
        return;
      }
      
      throw new Error(error.message);
    }
    
    const result = await response.json();
    
    alert(`Venda ${result.code} confirmada com sucesso!`);
    console.log('Movimentações de estoque:', result.stockMovements);
    console.log('Contas a receber criadas:', result.accountsReceivable);
    
    return result;
  } catch (error) {
    console.error('Erro ao confirmar venda:', error);
    throw error;
  }
}
```

---

## ❌ Cancelar Venda

### `POST /sales/:id/cancel`

Cancela a venda, realizando:
1. ✅ Devolução de estoque (se já confirmada)
2. ✅ Cancelamento de contas a receber pendentes
3. ✅ Atualização de status para CANCELED

### 🔌 Endpoint

```http
POST /sales/550e8400-e29b-41d4-a716-446655440000/cancel
Authorization: Bearer {seu_token_jwt}
Content-Type: application/json
```

### 📥 Request Body

```json
{
  "cancellationReason": "Cliente desistiu da compra"
}
```

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `cancellationReason` | String | ✅ Sim | Motivo do cancelamento |

### 📤 Response

**Status:** `200 OK`

```json
{
  "id": "sale-uuid-123",
  "code": "VEN-2025-0001",
  "status": "CANCELED",
  "canceledAt": "2025-11-10T16:45:00.000Z",
  "cancellationReason": "Cliente desistiu da compra",
  "message": "Venda cancelada com sucesso",
  "stockReturned": [
    {
      "id": "mov-2",
      "productId": "prod-123",
      "locationId": "loc-123",
      "quantity": 1,
      "type": "RETURN",
      "referenceType": "SALE_CANCEL",
      "referenceId": "sale-uuid-123"
    }
  ],
  "accountsReceivableCanceled": [
    {
      "id": "acc-1",
      "documentNumber": "VEN-2025-0001",
      "installmentNumber": 1,
      "status": "CANCELADO",
      "notes": "Venda cancelada: Cliente desistiu da compra"
    },
    {
      "id": "acc-2",
      "documentNumber": "VEN-2025-0001",
      "installmentNumber": 2,
      "status": "CANCELADO",
      "notes": "Venda cancelada: Cliente desistiu da compra"
    }
  ]
}
```

### 🔄 O que Acontece no Cancelamento

#### 1️⃣ Se Venda Estava CONFIRMED
```typescript
- Cria movimentações de estoque (type: RETURN)
- Devolve produtos aos locais originais
- Restaura quantidades no estoque
```

#### 2️⃣ Contas a Receber
```typescript
- Atualiza AccountReceivable com status IN ('PENDENTE', 'VENCIDO')
- Define status = CANCELADO
- Adiciona motivo nas notes
- Mantém parcelas já RECEBIDAS ou PARCIAIS
```

#### 3️⃣ Atualização da Venda
```typescript
- status = CANCELED
- canceledAt = now()
- cancellationReason = dto.cancellationReason
```

### ⚠️ Regras Importantes

#### ✅ Pode Cancelar
- Orçamentos (QUOTE)
- Vendas aprovadas mas não confirmadas
- Vendas confirmadas (devolve estoque)

#### ⚠️ Cancelamento Parcial
Se alguma parcela já foi recebida:
```json
{
  "message": "Venda cancelada. 2 parcelas foram canceladas, 1 parcela já recebida foi mantida.",
  "accountsReceivableCanceled": [...],
  "accountsReceivableKept": [
    {
      "id": "acc-1",
      "installmentNumber": 1,
      "status": "RECEBIDO",
      "receivedAmount": 400.00
    }
  ]
}
```

#### ❌ Não Pode Cancelar
- Vendas já canceladas
- Vendas completadas (status: COMPLETED)

### ⚠️ Erros

#### Venda já cancelada
```json
{
  "statusCode": 400,
  "message": "Venda já está cancelada",
  "error": "Bad Request"
}
```

#### Motivo não informado
```json
{
  "statusCode": 400,
  "message": [
    "cancellationReason should not be empty",
    "cancellationReason must be a string"
  ],
  "error": "Bad Request"
}
```

### 💡 Exemplo de Uso

```typescript
async function cancelSale(saleId: string, reason: string) {
  const confirmed = confirm(`Tem certeza que deseja cancelar esta venda?\n\nMotivo: ${reason}`);
  
  if (!confirmed) return;
  
  try {
    const response = await fetch(`/sales/${saleId}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        cancellationReason: reason
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
    
    const result = await response.json();
    
    alert(`Venda ${result.code} cancelada com sucesso!`);
    
    if (result.stockReturned && result.stockReturned.length > 0) {
      console.log('Estoque devolvido:', result.stockReturned);
    }
    
    if (result.accountsReceivableCanceled) {
      console.log('Parcelas canceladas:', result.accountsReceivableCanceled.length);
    }
    
    if (result.accountsReceivableKept) {
      console.warn('Parcelas mantidas (já recebidas):', result.accountsReceivableKept);
    }
    
    return result;
  } catch (error) {
    console.error('Erro ao cancelar venda:', error);
    alert('Erro ao cancelar: ' + error.message);
  }
}

// Uso
cancelSale('sale-123', 'Cliente solicitou cancelamento');
```

---

## 🔍 Análise de Crédito

### Aprovar Análise de Crédito

#### `POST /sales/:id/credit-analysis/approve`

Aprova a análise de crédito de uma venda.

### 🔌 Endpoint

```http
POST /sales/550e8400-e29b-41d4-a716-446655440000/credit-analysis/approve
Authorization: Bearer {seu_token_jwt}
Content-Type: application/json
```

### 📥 Request Body

```json
{
  "creditScore": 850,
  "notes": "Cliente com excelente histórico de pagamento"
}
```

| Campo | Tipo | Obrigatório | Validação | Descrição |
|-------|------|-------------|-----------|-----------|
| `creditScore` | Number | ✅ Sim | 0-1000 | Score de crédito |
| `notes` | String | ❌ Não | - | Observações sobre a análise |

### 📤 Response

**Status:** `200 OK`

```json
{
  "id": "sale-uuid-123",
  "code": "VEN-2025-0001",
  "creditAnalysisStatus": "APPROVED",
  "creditAnalysisDate": "2025-11-10T15:00:00.000Z",
  "creditScore": 850,
  "creditAnalysisNotes": "Cliente com excelente histórico de pagamento",
  "message": "Análise de crédito aprovada com sucesso"
}
```

### ⚠️ Erros

#### Análise não requerida
```json
{
  "statusCode": 400,
  "message": "Esta venda não requer análise de crédito",
  "error": "Bad Request"
}
```

#### Score inválido
```json
{
  "statusCode": 400,
  "message": [
    "creditScore must not be greater than 1000",
    "creditScore must not be less than 0"
  ],
  "error": "Bad Request"
}
```

---

### Rejeitar Análise de Crédito

#### `POST /sales/:id/credit-analysis/reject`

Rejeita a análise de crédito de uma venda.

### 🔌 Endpoint

```http
POST /sales/550e8400-e29b-41d4-a716-446655440000/credit-analysis/reject
Authorization: Bearer {seu_token_jwt}
Content-Type: application/json
```

### 📥 Request Body

```json
{
  "creditScore": 450,
  "notes": "Cliente possui pendências financeiras. Venda rejeitada."
}
```

| Campo | Tipo | Obrigatório | Validação | Descrição |
|-------|------|-------------|-----------|-----------|
| `creditScore` | Number | ❌ Não | 0-1000 | Score de crédito (opcional) |
| `notes` | String | ✅ Sim | - | **Obrigatório** - Motivo da rejeição |

### 📤 Response

**Status:** `200 OK`

```json
{
  "id": "sale-uuid-123",
  "code": "VEN-2025-0001",
  "status": "REJECTED",
  "creditAnalysisStatus": "REJECTED",
  "creditAnalysisDate": "2025-11-10T15:00:00.000Z",
  "creditScore": 450,
  "creditAnalysisNotes": "Cliente possui pendências financeiras. Venda rejeitada.",
  "message": "Análise de crédito rejeitada. Venda marcada como REJECTED."
}
```

### ⚠️ Erros

#### Motivo não informado
```json
{
  "statusCode": 400,
  "message": [
    "notes should not be empty",
    "notes must be a string"
  ],
  "error": "Bad Request"
}
```

### 💡 Exemplo de Uso

```typescript
// Aprovar
async function approveCreditAnalysis(saleId: string, score: number, notes: string) {
  const response = await fetch(`/sales/${saleId}/credit-analysis/approve`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ creditScore: score, notes })
  });
  
  if (!response.ok) throw new Error('Erro ao aprovar');
  
  return response.json();
}

// Rejeitar
async function rejectCreditAnalysis(saleId: string, reason: string, score?: number) {
  const response = await fetch(`/sales/${saleId}/credit-analysis/reject`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 
      creditScore: score,
      notes: reason 
    })
  });
  
  if (!response.ok) throw new Error('Erro ao rejeitar');
  
  return response.json();
}
```

---

## 🔄 Alterar Status

### `PATCH /sales/:id/status`

Altera manualmente o status da venda. **Use com cuidado!**

### 🔌 Endpoint

```http
PATCH /sales/550e8400-e29b-41d4-a716-446655440000/status
Authorization: Bearer {seu_token_jwt}
Content-Type: application/json
```

### 📥 Request Body

```json
{
  "status": "IN_PRODUCTION"
}
```

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `status` | Enum | ✅ Sim | Novo status |

### 📋 Status Permitidos

| Status | Quando Usar |
|--------|-------------|
| `QUOTE` | Orçamento inicial |
| `PENDING_APPROVAL` | Aguardando aprovação interna |
| `APPROVED` | Aprovado internamente |
| `CONFIRMED` | ⚠️ Use POST `/confirm` em vez disso |
| `IN_PRODUCTION` | Pedido em produção |
| `READY_TO_SHIP` | Pronto para envio |
| `SHIPPED` | Enviado ao cliente |
| `DELIVERED` | Entregue ao cliente |
| `COMPLETED` | Concluído (não pode mais alterar) |
| `CANCELED` | ⚠️ Use POST `/cancel` em vez disso |
| `REJECTED` | Rejeitado (crédito negado) |

### 📤 Response

**Status:** `200 OK`

```json
{
  "id": "sale-uuid-123",
  "code": "VEN-2025-0001",
  "status": "IN_PRODUCTION",
  "updatedAt": "2025-11-10T16:00:00.000Z",
  "message": "Status alterado com sucesso"
}
```

### ⚠️ Recomendações

#### ✅ Use este endpoint para:
- Alterar para `IN_PRODUCTION`
- Alterar para `READY_TO_SHIP`
- Alterar para `SHIPPED`
- Alterar para `DELIVERED`
- Alterar para `COMPLETED`

#### ❌ NÃO use este endpoint para:
- ❌ `CONFIRMED` → Use `POST /sales/:id/confirm`
- ❌ `CANCELED` → Use `POST /sales/:id/cancel`

**Por quê?** Os endpoints específicos fazem operações adicionais (estoque, financeiro).

### ⚠️ Erros

#### Status inválido
```json
{
  "statusCode": 400,
  "message": [
    "status must be one of the following values: QUOTE, PENDING_APPROVAL, APPROVED, CONFIRMED, IN_PRODUCTION, READY_TO_SHIP, SHIPPED, DELIVERED, COMPLETED, CANCELED, REJECTED"
  ],
  "error": "Bad Request"
}
```

### 💡 Exemplo de Fluxo

```typescript
// Fluxo típico de produção e envio
async function updateSaleProgress(saleId: string) {
  // 1. Pedido confirmado → Em produção
  await updateStatus(saleId, 'IN_PRODUCTION');
  
  // 2. Produção finalizada → Pronto para envio
  await updateStatus(saleId, 'READY_TO_SHIP');
  
  // 3. Enviado ao cliente
  await updateStatus(saleId, 'SHIPPED');
  
  // 4. Cliente recebeu
  await updateStatus(saleId, 'DELIVERED');
  
  // 5. Tudo finalizado
  await updateStatus(saleId, 'COMPLETED');
}

async function updateStatus(saleId: string, status: string) {
  const response = await fetch(`/sales/${saleId}/status`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ status })
  });
  
  if (!response.ok) {
    throw new Error('Erro ao alterar status');
  }
  
  return response.json();
}
```

---

## 🗑️ Excluir Venda

### `DELETE /sales/:id`

**⚠️ IMPORTANTE:** Este endpoint **NÃO está implementado** por questões de auditoria.

### Alternativas

#### Para Orçamentos (QUOTE)
```typescript
// Use o cancelamento
POST /sales/:id/cancel
{
  "cancellationReason": "Orçamento não aprovado"
}
```

#### Para Vendas Confirmadas
```typescript
// Use o cancelamento (devolve estoque e cancela financeiro)
POST /sales/:id/cancel
{
  "cancellationReason": "Venda cancelada pelo cliente"
}
```

### Por que não há DELETE?

1. **Auditoria:** Todas as vendas devem ser rastreáveis
2. **Financeiro:** Vendas confirmadas geram lançamentos financeiros
3. **Estoque:** Vendas confirmadas afetam o estoque
4. **Relatórios:** Histórico completo para análises

### Solução Recomendada

Use o status `CANCELED` em vez de excluir:

```json
POST /sales/{id}/cancel
{
  "cancellationReason": "Razão aqui"
}
```

**Benefícios:**
- ✅ Mantém histórico
- ✅ Permite auditoria
- ✅ Reverte operações (estoque/financeiro)
- ✅ Aparece em relatórios de cancelamentos

---

## 🔄 Fluxo de Estados

### Diagrama de Estados

```
┌─────────┐
│  QUOTE  │ ──────────────────────────────────┐
└────┬────┘                                    │
     │                                         │
     │ Enviar para aprovação                  │
     ▼                                         │
┌────────────────────┐                        │
│ PENDING_APPROVAL   │                        │
└──────┬──────────┬──┘                        │
       │          │                            │
       │          │ Rejeitar                   │
       │          ▼                            │
       │     ┌──────────┐                     │
       │     │ REJECTED │                     │
       │     └──────────┘                     │
       │                                       │
       │ Aprovar                               │
       ▼                                       │
  ┌──────────┐                                │
  │ APPROVED │                                │
  └────┬─────┘                                │
       │                                       │
       │ Confirmar (POST /confirm)            │
       │ - Valida estoque                     │
       │ - Baixa estoque                      │
       │ - Cria contas a receber              │
       ▼                                       │
  ┌───────────┐                               │
  │ CONFIRMED │                               │
  └────┬──────┘                               │
       │                                       │
       │ Iniciar produção                     │
       ▼                                       │
  ┌────────────────┐                          │
  │ IN_PRODUCTION  │                          │
  └────────┬───────┘                          │
           │                                   │
           │ Produção finalizada               │
           ▼                                   │
  ┌────────────────┐                          │
  │ READY_TO_SHIP  │                          │
  └────────┬───────┘                          │
           │                                   │
           │ Enviar ao cliente                 │
           ▼                                   │
  ┌────────────┐                              │
  │  SHIPPED   │                              │
  └──────┬─────┘                              │
         │                                     │
         │ Cliente recebeu                    │
         ▼                                     │
  ┌────────────┐                              │
  │ DELIVERED  │                              │
  └──────┬─────┘                              │
         │                                     │
         │ Tudo OK                             │
         ▼                                     │
  ┌────────────┐                              │
  │ COMPLETED  │ ◄────────────────────────────┘
  └────────────┘     (não pode mais alterar)

  
Qualquer status (exceto COMPLETED) pode ser:
         │
         │ POST /sales/:id/cancel
         ▼
  ┌────────────┐
  │ CANCELED   │
  └────────────┘
```

### Matriz de Transições

| De → Para | Endpoint | Validações |
|-----------|----------|------------|
| QUOTE → PENDING_APPROVAL | PATCH /status | - |
| QUOTE → CONFIRMED | POST /confirm | Valida estoque, método pagamento |
| PENDING_APPROVAL → APPROVED | PATCH /status | - |
| PENDING_APPROVAL → REJECTED | POST /credit-analysis/reject | Requer motivo |
| APPROVED → CONFIRMED | POST /confirm | Valida estoque, método pagamento |
| CONFIRMED → IN_PRODUCTION | PATCH /status | - |
| IN_PRODUCTION → READY_TO_SHIP | PATCH /status | - |
| READY_TO_SHIP → SHIPPED | PATCH /status | - |
| SHIPPED → DELIVERED | PATCH /status | - |
| DELIVERED → COMPLETED | PATCH /status | - |
| Qualquer → CANCELED | POST /cancel | Requer motivo, devolve estoque |

---

## 🔐 Permissões

### Matriz de Permissões

| Operação | Permissão Necessária | Descrição |
|----------|---------------------|-----------|
| Listar vendas | `sales:read` | Ver lista de vendas |
| Consultar venda | `sales:read` | Ver detalhes |
| Criar venda | `sales:create` | Criar orçamento/venda |
| Editar venda | `sales:update` | Alterar dados |
| Confirmar venda | `sales:confirm` | Confirmar (estoque + financeiro) |
| Cancelar venda | `sales:cancel` | Cancelar vendas |
| Aprovar crédito | `sales:credit-approve` | Aprovar análise |
| Rejeitar crédito | `sales:credit-reject` | Rejeitar análise |
| Alterar status | `sales:status-change` | Mudar status manualmente |
| Exportar PDF | `sales:read` | Gerar PDF |
| Exportar Excel | `sales:export` | Exportar relatórios |

### Perfis Sugeridos

#### 📊 Vendedor
```json
{
  "permissions": [
    "sales:read",
    "sales:create",
    "sales:update"
  ]
}
```
- ✅ Criar orçamentos
- ✅ Editar orçamentos
- ✅ Ver vendas
- ❌ Confirmar vendas
- ❌ Cancelar vendas

#### 👔 Gerente de Vendas
```json
{
  "permissions": [
    "sales:read",
    "sales:create",
    "sales:update",
    "sales:confirm",
    "sales:cancel",
    "sales:status-change",
    "sales:export"
  ]
}
```
- ✅ Todas as operações de vendas
- ✅ Confirmar vendas
- ✅ Cancelar vendas
- ✅ Exportar relatórios
- ❌ Aprovar crédito (depende do crédito)

#### 💰 Analista de Crédito
```json
{
  "permissions": [
    "sales:read",
    "sales:credit-approve",
    "sales:credit-reject"
  ]
}
```
- ✅ Ver vendas
- ✅ Aprovar/rejeitar crédito
- ❌ Criar ou editar vendas

#### 👨‍💼 Administrador
```json
{
  "permissions": [
    "sales:*"
  ]
}
```
- ✅ Todas as operações

---

## 📚 Documentos Relacionados

- [API_SALES_CREATE.md](./API_SALES_CREATE.md) - Como criar vendas
- [API_SALES_EXPORT.md](./API_SALES_EXPORT.md) - Exportação PDF e Excel
- [SALES_INTEGRATION_FINANCE_STOCK.md](./SALES_INTEGRATION_FINANCE_STOCK.md) - Integração Financeiro e Estoque

---

## ❓ Perguntas Frequentes

### Q: Posso editar uma venda confirmada?
**R:** Não. Vendas confirmadas já afetaram estoque e financeiro. Cancele e crie uma nova.

### Q: Como faço para alterar itens de uma venda?
**R:** Não é possível alterar itens. Cancele a venda e crie uma nova com os itens corretos.

### Q: O que acontece se eu cancelar uma venda com parcelas já pagas?
**R:** As parcelas pagas são mantidas. Apenas as pendentes são canceladas.

### Q: Posso confirmar uma venda sem método de pagamento?
**R:** Não. O método de pagamento é obrigatório para confirmação.

### Q: Como funciona a análise de crédito?
**R:** Se o método de pagamento requer análise, a venda fica `PENDING_APPROVAL` até aprovação/rejeição.

### Q: Posso desfazer um cancelamento?
**R:** Não. Cancelamentos são permanentes. Crie uma nova venda se necessário.

### Q: Qual a diferença entre COMPLETED e CONFIRMED?
**R:** CONFIRMED = venda confirmada, pode progredir (produção, envio). COMPLETED = tudo finalizado, não pode mais alterar.

---

**Última atualização:** 10 de novembro de 2025
