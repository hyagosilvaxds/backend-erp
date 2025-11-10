# 📝 API de Criação de Vendas - Guia Completo

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Endpoint de Criação](#endpoint-de-criação)
3. [Estrutura de Dados](#estrutura-de-dados)
4. [Campos Obrigatórios vs Opcionais](#campos-obrigatórios-vs-opcionais)
5. [Seleção de Local de Estoque](#seleção-de-local-de-estoque)
6. [Exemplos Práticos](#exemplos-práticos)
7. [Validações e Regras de Negócio](#validações-e-regras-de-negócio)
8. [Tratamento de Erros](#tratamento-de-erros)
9. [Fluxo Completo](#fluxo-completo)

---

## 🎯 Visão Geral

A API de criação de vendas permite registrar:
- **Orçamentos** (QUOTE) - Propostas para clientes
- **Vendas Confirmadas** - Transações aprovadas
- **Pedidos** - Com diversos status de acompanhamento

### Status Disponíveis
```typescript
enum SaleStatus {
  QUOTE               // Orçamento/Proposta
  PENDING_APPROVAL    // Aguardando aprovação
  APPROVED            // Aprovado
  CONFIRMED           // Confirmado (baixa estoque + cria financeiro)
  IN_PRODUCTION       // Em produção
  READY_TO_SHIP       // Pronto para envio
  SHIPPED             // Enviado
  DELIVERED           // Entregue
  COMPLETED           // Concluído
  CANCELED            // Cancelado (devolve estoque + cancela financeiro)
  REJECTED            // Rejeitado
}
```

---

## 🔌 Endpoint de Criação

### `POST /sales`

**Headers:**
```http
Authorization: Bearer {seu_token_jwt}
Content-Type: application/json
```

**Response:**
- **201 Created** - Venda criada com sucesso
- **400 Bad Request** - Erro de validação
- **401 Unauthorized** - Token inválido
- **404 Not Found** - Cliente/Produto não encontrado

---

## 📊 Estrutura de Dados

### 1️⃣ Objeto Principal: `CreateSaleDto`

```typescript
{
  // ========== OBRIGATÓRIOS ==========
  "customerId": "uuid",           // ID do cliente
  "items": [...]                  // Array de produtos (mínimo 1)
  
  // ========== OPCIONAIS ==========
  "status": "QUOTE",              // Status inicial (default: QUOTE)
  "paymentMethodId": "uuid",      // Método de pagamento
  "installments": 1,              // Número de parcelas (mínimo 1)
  
  // Descontos
  "discountPercent": 10.5,        // Desconto em % sobre total
  "discountAmount": 100.00,       // Desconto em valor fixo
  
  // Valores adicionais
  "shippingCost": 50.00,          // Custo de frete
  "otherCharges": 25.00,          // Outras despesas
  "otherChargesDesc": "Embalagem especial",  // Descrição das despesas
  
  // Endereço de entrega
  "useCustomerAddress": true,     // Usar endereço do cliente?
  "deliveryAddress": {...},       // Endereço customizado (opcional)
  
  // Observações
  "notes": "Entregar pela manhã", // Obs. visível ao cliente
  "internalNotes": "Cliente VIP", // Obs. interna (não visível)
  
  // Validade (para orçamentos)
  "validUntil": "2025-12-31"      // Data ISO 8601 (aceita: "2025-12-31" ou "2025-12-31T23:59:59.999Z")
}
```

### 2️⃣ Item de Venda: `CreateSaleItemDto`

```typescript
{
  // ========== OBRIGATÓRIOS ==========
  "productId": "uuid",            // ID do produto
  "quantity": 10.5,               // Quantidade (mínimo 0.001)
  "unitPrice": 120.00,            // Preço unitário (mínimo 0)
  
  // ========== OPCIONAIS ==========
  "stockLocationId": "uuid",      // ⭐ Local de estoque de onde retirar
  "discount": 5.00,               // Desconto específico do item
  "notes": "Sem cebola"           // Observação do item
}
```

### 3️⃣ Endereço de Entrega: `DeliveryAddressDto`

```typescript
{
  "street": "Rua das Flores",
  "number": "123",
  "complement": "Apto 45",        // Opcional
  "neighborhood": "Centro",
  "city": "São Paulo",
  "state": "SP",
  "zipCode": "01234-567"
}
```

---

## ✅ Campos Obrigatórios vs Opcionais

### 📌 Sempre Obrigatórios
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `customerId` | UUID | ID do cliente cadastrado |
| `items` | Array | Lista de produtos (mínimo 1 item) |
| `items[].productId` | UUID | ID do produto |
| `items[].quantity` | Number | Quantidade (> 0.001) |
| `items[].unitPrice` | Number | Preço unitário (≥ 0) |

### 🔧 Opcionais (com defaults)
| Campo | Tipo | Default | Descrição |
|-------|------|---------|-----------|
| `status` | Enum | `QUOTE` | Status inicial da venda |
| `installments` | Number | `1` | Número de parcelas |
| `discountPercent` | Number | `0` | Desconto percentual |
| `discountAmount` | Number | `0` | Desconto em valor fixo |
| `shippingCost` | Number | `0` | Custo de frete |
| `otherCharges` | Number | `0` | Outras despesas |
| `useCustomerAddress` | Boolean | `false` | Usar endereço do cliente |

### ⚠️ Opcionais (sem default)
| Campo | Descrição |
|-------|-----------|
| `paymentMethodId` | Método de pagamento (necessário para confirmar) |
| `items[].stockLocationId` | Local de estoque (obrigatório na confirmação) |
| `items[].discount` | Desconto individual do item |
| `items[].notes` | Observação do item |
| `deliveryAddress` | Endereço de entrega customizado |
| `notes` | Observações gerais |
| `internalNotes` | Notas internas |
| `validUntil` | Data de validade do orçamento |
| `otherChargesDesc` | Descrição das outras despesas |

---

## 📦 Seleção de Local de Estoque

### ⭐ Campo Crítico: `stockLocationId`

**Por que é importante?**
- Cada produto pode estar em **múltiplos locais** (depósito A, loja B, etc.)
- Ao criar a venda, você **seleciona de qual local o produto será retirado**
- Na **confirmação**, o sistema valida se há estoque suficiente naquele local

### 📍 Como Funciona

#### 1. Listar Locais de Estoque Disponíveis
```http
GET /stock-locations
```

**Response:**
```json
[
  {
    "id": "loc-123",
    "name": "Depósito Principal",
    "code": "DEP-01",
    "isDefault": true
  },
  {
    "id": "loc-456",
    "name": "Loja Shopping",
    "code": "LOJA-SP",
    "isDefault": false
  }
]
```

#### 2. Verificar Estoque do Produto por Local
```http
GET /products/{productId}
```

**Response:**
```json
{
  "id": "prod-789",
  "name": "Notebook Dell",
  "sku": "DELL-5490",
  "stockByLocation": [
    {
      "locationId": "loc-123",
      "locationName": "Depósito Principal",
      "quantity": 50        // ✅ 50 unidades disponíveis
    },
    {
      "locationId": "loc-456",
      "locationName": "Loja Shopping",
      "quantity": 5         // ⚠️ Apenas 5 unidades
    }
  ]
}
```

#### 3. Criar Venda Especificando o Local
```json
{
  "customerId": "cust-001",
  "items": [
    {
      "productId": "prod-789",
      "quantity": 10,
      "unitPrice": 3500.00,
      "stockLocationId": "loc-123"  // 🎯 Retira do Depósito Principal
    }
  ]
}
```

### 🔍 Regras Importantes

| Momento | `stockLocationId` | Validação |
|---------|-------------------|-----------|
| **Criar (QUOTE)** | Opcional | Não valida estoque |
| **Confirmar** | **Obrigatório** | ✅ Valida estoque disponível |
| **Cancelar** | Usa o definido | Devolve ao mesmo local |

### ⚠️ Cenários Importantes

#### ✅ Cenário 1: Local Padrão
Se você **não informar** `stockLocationId`, o sistema pode:
- Usar o local padrão (`isDefault: true`)
- Ou retornar erro na confirmação (dependendo da configuração)

#### ✅ Cenário 2: Múltiplos Produtos, Múltiplos Locais
```json
{
  "customerId": "cust-001",
  "items": [
    {
      "productId": "prod-A",
      "quantity": 5,
      "unitPrice": 100.00,
      "stockLocationId": "loc-123"  // Retira do Depósito
    },
    {
      "productId": "prod-B",
      "quantity": 2,
      "unitPrice": 200.00,
      "stockLocationId": "loc-456"  // Retira da Loja
    }
  ]
}
```

#### ❌ Cenário 3: Estoque Insuficiente
```json
// Produto tem apenas 5 unidades no local
{
  "items": [
    {
      "productId": "prod-789",
      "quantity": 10,              // ❌ Quer 10
      "stockLocationId": "loc-456" // Mas só tem 5
    }
  ]
}
```

**Resultado na Confirmação:**
```json
{
  "error": "Bad Request",
  "message": "Estoque insuficiente para o produto 'Notebook Dell' no local 'Loja Shopping'. Disponível: 5, Necessário: 10"
}
```

---

## 💡 Exemplos Práticos

### 📋 Exemplo 1: Orçamento Simples

```json
POST /sales
{
  "customerId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "QUOTE",
  "validUntil": "2025-12-31",
  "items": [
    {
      "productId": "123e4567-e89b-12d3-a456-426614174000",
      "quantity": 5,
      "unitPrice": 250.00
    }
  ],
  "notes": "Orçamento válido por 30 dias"
}
```

**Response 201:**
```json
{
  "id": "sale-abc-123",
  "code": "ORC-2025-001",
  "status": "QUOTE",
  "customerId": "550e8400-e29b-41d4-a716-446655440000",
  "customerName": "João Silva",
  "subtotal": 1250.00,
  "discountAmount": 0,
  "shippingCost": 0,
  "totalAmount": 1250.00,
  "items": [
    {
      "productId": "123e4567-e89b-12d3-a456-426614174000",
      "productName": "Mouse Gamer",
      "quantity": 5,
      "unitPrice": 250.00,
      "totalPrice": 1250.00
    }
  ],
  "createdAt": "2025-11-10T10:30:00Z"
}
```

---

### 🛒 Exemplo 2: Venda com Desconto e Frete

```json
POST /sales
{
  "customerId": "550e8400-e29b-41d4-a716-446655440000",
  "paymentMethodId": "pay-123",
  "installments": 3,
  "discountPercent": 10,
  "shippingCost": 50.00,
  "items": [
    {
      "productId": "prod-001",
      "quantity": 2,
      "unitPrice": 500.00,
      "stockLocationId": "loc-depot-01"
    },
    {
      "productId": "prod-002",
      "quantity": 1,
      "unitPrice": 300.00,
      "stockLocationId": "loc-depot-01"
    }
  ]
}
```

**Cálculo:**
```
Subtotal:  (2 × 500) + (1 × 300) = R$ 1.300,00
Desconto:  10% de 1.300           = R$   130,00
Frete:                             = R$    50,00
──────────────────────────────────────────────────
Total:                             = R$ 1.220,00
```

---

### 📍 Exemplo 3: Múltiplos Produtos de Diferentes Locais

```json
POST /sales
{
  "customerId": "cust-vip-001",
  "paymentMethodId": "pay-credit-card",
  "installments": 6,
  "useCustomerAddress": false,
  "deliveryAddress": {
    "street": "Av. Paulista",
    "number": "1000",
    "complement": "Conjunto 25",
    "neighborhood": "Bela Vista",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01310-100"
  },
  "items": [
    {
      "productId": "prod-notebook",
      "quantity": 1,
      "unitPrice": 4500.00,
      "stockLocationId": "loc-deposito-sp",
      "notes": "Versão com 16GB RAM"
    },
    {
      "productId": "prod-mouse",
      "quantity": 2,
      "unitPrice": 150.00,
      "stockLocationId": "loc-loja-shopping",
      "discount": 20.00
    },
    {
      "productId": "prod-teclado",
      "quantity": 1,
      "unitPrice": 350.00,
      "stockLocationId": "loc-deposito-rj"
    }
  ],
  "shippingCost": 80.00,
  "otherCharges": 30.00,
  "otherChargesDesc": "Seguro do transporte",
  "notes": "Entregar entre 9h-12h",
  "internalNotes": "Cliente preferencial - priorizar entrega"
}
```

**Cálculo:**
```
Item 1: 1 × 4500.00           = R$ 4.500,00
Item 2: 2 × 150.00 - 20.00    = R$   280,00
Item 3: 1 × 350.00            = R$   350,00
────────────────────────────────────────────
Subtotal:                     = R$ 5.130,00
Frete:                        = R$    80,00
Outras despesas:              = R$    30,00
────────────────────────────────────────────
Total:                        = R$ 5.240,00

Parcelamento: 6x de R$ 873,33
```

---

### 💳 Exemplo 4: Orçamento com Desconto Fixo

```json
POST /sales
{
  "customerId": "cust-002",
  "status": "QUOTE",
  "discountAmount": 200.00,
  "validUntil": "2025-11-30",
  "items": [
    {
      "productId": "prod-tv-55",
      "quantity": 1,
      "unitPrice": 2800.00,
      "stockLocationId": "loc-loja-01"
    }
  ],
  "notes": "Promoção Black Friday"
}
```

**Cálculo:**
```
Subtotal:     R$ 2.800,00
Desconto:   - R$   200,00
──────────────────────────
Total:        R$ 2.600,00
```

---

### 🎯 Exemplo 5: Venda com Item com Desconto Individual

```json
POST /sales
{
  "customerId": "cust-003",
  "paymentMethodId": "pay-pix",
  "discountPercent": 5,
  "items": [
    {
      "productId": "prod-A",
      "quantity": 3,
      "unitPrice": 100.00,
      "stockLocationId": "loc-001",
      "discount": 30.00  // R$ 10,00 de desconto por unidade
    },
    {
      "productId": "prod-B",
      "quantity": 2,
      "unitPrice": 200.00,
      "stockLocationId": "loc-001"
    }
  ]
}
```

**Cálculo:**
```
Item A: (3 × 100) - 30        = R$   270,00
Item B: (2 × 200)             = R$   400,00
────────────────────────────────────────────
Subtotal:                     = R$   670,00
Desconto global (5%):         = R$    33,50
────────────────────────────────────────────
Total:                        = R$   636,50
```

---

## ⚠️ Validações e Regras de Negócio

### 1️⃣ Validações de Campos

| Campo | Regra | Erro |
|-------|-------|------|
| `customerId` | Deve existir no banco | "Cliente não encontrado" |
| `items` | Array não pode estar vazio | "Venda deve ter pelo menos 1 item" |
| `items[].productId` | Deve existir no banco | "Produto não encontrado" |
| `items[].quantity` | Mínimo 0.001 | "Quantidade deve ser maior que 0" |
| `items[].unitPrice` | Mínimo 0 | "Preço unitário não pode ser negativo" |
| `installments` | Mínimo 1 | "Número de parcelas deve ser pelo menos 1" |
| `discountPercent` | 0 a 100 | "Desconto percentual deve estar entre 0 e 100" |
| `validUntil` | ISO 8601 | "Data inválida" |

**Formatos de Data Aceitos para `validUntil`:**
```json
✅ "2025-12-31"                    // Data simples (YYYY-MM-DD)
✅ "2025-12-31T23:59:59.999Z"      // Timestamp completo (ISO 8601)
✅ "2025-12"                        // Apenas ano e mês (adiciona dia 01)
❌ "31/12/2025"                     // Formato brasileiro (NÃO aceito)
❌ "2025-12-31 23:59:59"            // Espaço no lugar de T (NÃO aceito)
```

### 2️⃣ Regras de Status

| Status | Pode Criar? | Valida Estoque? | Baixa Estoque? | Cria Financeiro? |
|--------|-------------|-----------------|----------------|------------------|
| `QUOTE` | ✅ Sim | ❌ Não | ❌ Não | ❌ Não |
| `PENDING_APPROVAL` | ✅ Sim | ❌ Não | ❌ Não | ❌ Não |
| `APPROVED` | ✅ Sim | ⚠️ Sim | ❌ Não | ❌ Não |
| `CONFIRMED` | ❌ Use `/confirm` | ✅ Sim | ✅ Sim | ✅ Sim |
| `CANCELED` | ❌ Use `/cancel` | - | - | - |

### 3️⃣ Regras de Estoque

**Ao criar com status QUOTE ou PENDING_APPROVAL:**
- ✅ NÃO valida estoque
- ✅ `stockLocationId` é opcional
- ✅ Permite criar orçamentos sem se preocupar com estoque

**Ao confirmar (POST /sales/:id/confirm):**
- ✅ VALIDA estoque no local especificado
- ✅ `stockLocationId` é obrigatório
- ✅ Cria movimentação de estoque (tipo EXIT)
- ✅ Reduz quantidade no local

**Regras:**
```typescript
// Produto com manageStock = true
if (product.manageStock) {
  const available = stockByLocation[locationId].quantity;
  if (available < item.quantity) {
    throw new Error('Estoque insuficiente');
  }
}

// Produto com manageStock = false
// Não valida estoque (serviços, produtos sob encomenda, etc.)
```

### 4️⃣ Regras de Pagamento

| Campo | Quando é Obrigatório? |
|-------|----------------------|
| `paymentMethodId` | Para confirmar a venda |
| `installments` | Depende do método de pagamento |

**Validação de Parcelas:**
```typescript
const paymentMethod = await PaymentMethod.findById(paymentMethodId);

if (!paymentMethod.allowInstallments && installments > 1) {
  throw new Error('Método de pagamento não permite parcelamento');
}

if (installments > paymentMethod.maxInstallments) {
  throw new Error(`Máximo de ${paymentMethod.maxInstallments} parcelas`);
}
```

### 5️⃣ Cálculo de Totais

**Ordem de Aplicação:**
```typescript
1. Subtotal = ∑ (item.quantity × item.unitPrice - item.discount)
2. Desconto Global:
   - Se discountPercent: subtotal × (discountPercent / 100)
   - Se discountAmount: valor fixo
3. Total Produtos = Subtotal - Desconto Global
4. Total Geral = Total Produtos + shippingCost + otherCharges
```

**Exemplo:**
```json
{
  "items": [
    { "qty": 2, "price": 100, "discount": 10 },  // = 190
    { "qty": 3, "price": 50 }                    // = 150
  ],
  "discountPercent": 10,  // 10% de 340 = 34
  "shippingCost": 50,
  "otherCharges": 20
}
```

```
Subtotal:       190 + 150 = R$ 340,00
Desc. Global:   10% de 340 = R$  34,00
Total Produtos: 340 - 34   = R$ 306,00
Frete:                     = R$  50,00
Outras:                    = R$  20,00
────────────────────────────────────────
Total:                     = R$ 376,00
```

---

## 🚨 Tratamento de Erros

### Erros Comuns

#### 1. Cliente não encontrado
```json
{
  "statusCode": 404,
  "message": "Cliente não encontrado",
  "error": "Not Found"
}
```

#### 2. Produto não encontrado
```json
{
  "statusCode": 404,
  "message": "Produto com ID 'abc-123' não encontrado",
  "error": "Not Found"
}
```

#### 3. Validação de campos
```json
{
  "statusCode": 400,
  "message": [
    "customerId must be a UUID",
    "items must be an array",
    "items[0].quantity must be at least 0.001",
    "discountPercent must not be greater than 100"
  ],
  "error": "Bad Request"
}
```

#### 4. Campos não reconhecidos
```json
{
  "statusCode": 400,
  "message": [
    "property discount should not exist",
    "property shipping should not exist",
    "property saleDate should not exist",
    "property deliveryDate should not exist"
  ],
  "error": "Bad Request"
}
```

**Solução:** Use os nomes corretos:
- ❌ `discount` → ✅ `discountAmount` ou `discountPercent`
- ❌ `shipping` → ✅ `shippingCost`
- ❌ `saleDate` → Gerado automaticamente
- ❌ `deliveryDate` → Use `validUntil` para orçamentos

#### 5. Data inválida
```json
{
  "statusCode": 400,
  "message": [
    "validUntil must be a valid ISO 8601 date string"
  ],
  "error": "Bad Request"
}
```

**Solução:** Use formatos de data corretos:
- ✅ `"2025-12-31"` - Data simples
- ✅ `"2025-12-31T23:59:59.999Z"` - Timestamp completo
- ✅ `"2025-12"` - Apenas ano e mês (adiciona dia 01)
- ❌ `"31/12/2025"` - Formato brasileiro (não aceito)
- ❌ `"2025-12-31 23:59:59"` - Espaço no lugar do T

#### 6. Local de estoque não encontrado
```json
{
  "statusCode": 404,
  "message": "Local de estoque não encontrado",
  "error": "Not Found"
}
```

#### 7. Método de pagamento inválido
```json
{
  "statusCode": 400,
  "message": "Método de pagamento não permite 6 parcelas. Máximo: 3",
  "error": "Bad Request"
}
```

---

## 🔄 Fluxo Completo

### Passo 1: Listar Clientes
```http
GET /customers
```

### Passo 2: Listar Produtos com Estoque
```http
GET /products?includeStock=true
```

### Passo 3: Verificar Locais de Estoque
```http
GET /stock-locations
```

### Passo 4: Criar Venda (Orçamento)
```http
POST /sales
{
  "customerId": "...",
  "status": "QUOTE",
  "items": [
    {
      "productId": "...",
      "quantity": 10,
      "unitPrice": 100.00,
      "stockLocationId": "loc-001"
    }
  ]
}
```

### Passo 5: Confirmar Venda
```http
POST /sales/{saleId}/confirm
```

**O que acontece:**
- ✅ Valida estoque nos locais especificados
- ✅ Cria movimentações de estoque (tipo EXIT)
- ✅ Reduz quantidade nos locais
- ✅ Cria contas a receber no financeiro (1 por parcela)
- ✅ Atualiza status para CONFIRMED

### Passo 6: Consultar Venda
```http
GET /sales/{saleId}
```

### Passo 7: Exportar PDF
```http
GET /sales/{saleId}/pdf
```

### Passo 8: Consultar Financeiro
```http
GET /financial/accounts-receivable?documentNumber={saleCode}
```

### Passo 9 (Se necessário): Cancelar
```http
POST /sales/{saleId}/cancel
{
  "cancellationReason": "Cliente desistiu"
}
```

**O que acontece:**
- ✅ Cria movimentações de estoque (tipo RETURN)
- ✅ Devolve quantidade aos locais originais
- ✅ Cancela contas a receber pendentes
- ✅ Atualiza status para CANCELED

---

## 📚 Documentos Relacionados

- [API_SALES.md](./API_SALES.md) - Documentação completa da API
- [SALES_INTEGRATION_FINANCE_STOCK.md](./SALES_INTEGRATION_FINANCE_STOCK.md) - Integração com Financeiro e Estoque
- [API_PRODUCTS.md](./API_PRODUCTS.md) - Gestão de Produtos
- [API_CUSTOMERS.md](./API_CUSTOMERS.md) - Gestão de Clientes

---

## ❓ Perguntas Frequentes

### Q: Posso criar uma venda sem especificar `stockLocationId`?
**R:** Sim, para orçamentos (QUOTE). Mas ao confirmar, será necessário.

### Q: O que acontece se eu não informar o local e o produto tiver múltiplos locais?
**R:** O sistema pode usar o local padrão ou retornar erro, dependendo da configuração.

### Q: Posso usar `discountPercent` e `discountAmount` juntos?
**R:** Sim, mas normalmente usa-se apenas um. Se usar ambos, o percentual é aplicado primeiro.

### Q: Como faço para saber se um produto tem estoque suficiente?
**R:** Consulte `GET /products/{id}` e veja o array `stockByLocation`.

### Q: Posso criar uma venda direto com status CONFIRMED?
**R:** Não recomendado. Use o endpoint `POST /sales/:id/confirm` após criar.

### Q: O que é a diferença entre `notes` e `internalNotes`?
**R:** `notes` aparece em PDFs e para o cliente. `internalNotes` é apenas interno.

### Q: Como funciona o cálculo de parcelas?
**R:** `valorParcela = totalAmount / installments`, com vencimentos de 30 em 30 dias.

---

## ✅ Checklist de Criação

Antes de criar uma venda, verifique:

- [ ] Cliente cadastrado e ID disponível
- [ ] Produtos cadastrados com preços atualizados
- [ ] Locais de estoque configurados
- [ ] Estoque suficiente nos locais desejados (se for confirmar)
- [ ] Método de pagamento criado (se for confirmar)
- [ ] Todos os campos obrigatórios preenchidos
- [ ] Nomes dos campos corretos (sem typos)
- [ ] Valores numéricos válidos (não negativos)
- [ ] Endereço de entrega completo (se usar)

---

**Última atualização:** 10 de novembro de 2025
