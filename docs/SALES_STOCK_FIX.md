# 🔧 Correção: Atualização de Estoque em Vendas

## Problema Identificado

Quando uma venda era confirmada, o sistema estava:
- ✅ Criando a movimentação de estoque (ProductStockMovement)
- ✅ Atualizando o estoque por local (ProductStockByLocation)
- ❌ **NÃO** atualizando o estoque geral do produto (Product.currentStock)

**Resultado**: O campo `currentStock` do produto permanecia com o valor inicial, mesmo após vendas confirmadas.

---

## Causa Raiz

O modelo `Product` no Prisma possui dois sistemas de controle de estoque:

1. **`currentStock`** (campo direto no Product)
   - Estoque geral/total do produto
   - Soma de todos os locais
   - Usado para consultas rápidas e listagens

2. **`ProductStockByLocation`** (tabela separada)
   - Estoque por local específico (Loja 1, Depósito, etc.)
   - Controle granular por localização
   - Usado para movimentações detalhadas

O código estava atualizando apenas o sistema 2, mas não o sistema 1.

---

## Solução Implementada

### 1. Método `confirm()` - Dar baixa no estoque

**Antes:**
```typescript
// Apenas atualizava ProductStockByLocation
await this.prisma.productStockByLocation.update({
  where: { /* ... */ },
  data: { quantity: newQuantity },
});
```

**Depois:**
```typescript
// 1. Atualiza ProductStockByLocation
await this.prisma.productStockByLocation.update({
  where: { /* ... */ },
  data: { quantity: newQuantity },
});

// 2. Busca estoque atual do produto
const product = await this.prisma.product.findUnique({
  where: { id: item.productId },
  select: { currentStock: true },
});

const currentProductStock = Number(product?.currentStock || 0);
const newProductStock = currentProductStock - item.quantity;

// 3. Atualiza currentStock do produto
await this.prisma.product.update({
  where: { id: item.productId },
  data: {
    currentStock: new Prisma.Decimal(newProductStock),
  },
});
```

---

### 2. Método `cancel()` - Devolver estoque

**Antes:**
```typescript
// Apenas devolvia para ProductStockByLocation
const newQuantity = currentQuantity + item.quantity;
await this.prisma.productStockByLocation.update({
  where: { /* ... */ },
  data: { quantity: newQuantity },
});
```

**Depois:**
```typescript
// 1. Devolve para ProductStockByLocation
const newQuantity = currentQuantity + item.quantity;
await this.prisma.productStockByLocation.update({
  where: { /* ... */ },
  data: { quantity: newQuantity },
});

// 2. Busca estoque atual do produto
const product = await this.prisma.product.findUnique({
  where: { id: item.productId },
  select: { currentStock: true },
});

const currentProductStock = Number(product?.currentStock || 0);
const newProductStock = currentProductStock + item.quantity;

// 3. Devolve para currentStock do produto
await this.prisma.product.update({
  where: { id: item.productId },
  data: {
    currentStock: new Prisma.Decimal(newProductStock),
  },
});
```

---

## Fluxo Correto Agora

### Confirmar Venda (POST /sales/:id/confirm)

```
1. Valida venda e estoque
   ↓
2. Para cada item da venda:
   
   a) Busca estoque do local
      ProductStockByLocation.quantity = 100
   
   b) Calcula novo estoque do local
      newQuantity = 100 - 5 = 95
   
   c) Atualiza estoque do local
      ProductStockByLocation.quantity = 95 ✅
   
   d) Busca estoque geral do produto
      Product.currentStock = 100
   
   e) Calcula novo estoque geral
      newProductStock = 100 - 5 = 95
   
   f) Atualiza estoque geral do produto
      Product.currentStock = 95 ✅
   
   g) Registra movimentação
      ProductStockMovement (type: EXIT) ✅
   
3. Cria contas a receber ✅
   
4. Confirma venda ✅
```

---

### Cancelar Venda (POST /sales/:id/cancel)

```
1. Valida venda
   ↓
2. Se venda foi confirmada, para cada item:
   
   a) Busca estoque atual do local
      ProductStockByLocation.quantity = 95
   
   b) Calcula devolução no local
      newQuantity = 95 + 5 = 100
   
   c) Devolve estoque ao local
      ProductStockByLocation.quantity = 100 ✅
   
   d) Busca estoque geral do produto
      Product.currentStock = 95
   
   e) Calcula devolução geral
      newProductStock = 95 + 5 = 100
   
   f) Devolve estoque geral
      Product.currentStock = 100 ✅
   
   g) Registra movimentação de devolução
      ProductStockMovement (type: RETURN) ✅
   
3. Cancela contas a receber ✅
   
4. Cancela venda ✅
```

---

## Exemplo Prático

### Cenário Inicial

**Produto: Notebook Dell**
- `currentStock`: 50 unidades
- Estoque no local "Loja Centro": 30 unidades
- Estoque no local "Depósito": 20 unidades

---

### Passo 1: Criar Venda

```http
POST /sales
{
  "customerId": "...",
  "items": [
    {
      "productId": "notebook-dell-id",
      "stockLocationId": "loja-centro-id",
      "quantity": 3,
      "unitPrice": 3000
    }
  ]
}
```

**Estado após criação:**
- `Product.currentStock`: 50 ✅ (sem mudança, venda ainda não confirmada)
- Local "Loja Centro": 30 ✅
- Status: QUOTE

---

### Passo 2: Confirmar Venda

```http
POST /sales/{id}/confirm
```

**Estado após confirmação (ANTES DA CORREÇÃO):**
- `Product.currentStock`: 50 ❌ (BUG - deveria ser 47)
- Local "Loja Centro": 27 ✅ (correto)
- Movimentação registrada: ✅
- Contas a receber criadas: ✅

**Estado após confirmação (DEPOIS DA CORREÇÃO):**
- `Product.currentStock`: 47 ✅ (CORRIGIDO)
- Local "Loja Centro": 27 ✅
- Movimentação registrada: ✅
- Contas a receber criadas: ✅

---

### Passo 3: Cancelar Venda

```http
POST /sales/{id}/cancel
{
  "cancellationReason": "Cliente desistiu"
}
```

**Estado após cancelamento (ANTES DA CORREÇÃO):**
- `Product.currentStock`: 50 ❌ (ficou congelado)
- Local "Loja Centro": 30 ✅ (devolvido)
- Movimentação RETURN registrada: ✅

**Estado após cancelamento (DEPOIS DA CORREÇÃO):**
- `Product.currentStock`: 50 ✅ (CORRIGIDO - devolvido)
- Local "Loja Centro": 30 ✅
- Movimentação RETURN registrada: ✅

---

## Impacto da Correção

### ✅ Benefícios

1. **Consistência de Dados**
   - Estoque geral (`currentStock`) sempre sincronizado
   - Evita divergências entre sistemas de estoque

2. **Relatórios Corretos**
   - Listagens de produtos mostram estoque real
   - Dashboards exibem valores precisos

3. **Prevenção de Vendas Duplicadas**
   - Validação de estoque agora funciona corretamente
   - Não permite vender mais do que tem

4. **Rastreabilidade**
   - Movimentações de estoque completas
   - Auditoria confiável

---

## Arquivos Modificados

| Arquivo | Modificação |
|---------|-------------|
| `src/sales/services/sales.service.ts` | Método `confirm()` - Adicionada atualização de `Product.currentStock` |
| `src/sales/services/sales.service.ts` | Método `cancel()` - Adicionada devolução para `Product.currentStock` |

---

## Testes Recomendados

### Teste 1: Confirmar Venda

```bash
# 1. Criar venda
SALE_ID=$(curl -s -X POST "http://localhost:4000/sales" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-company-id: $COMPANY_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "'$CUSTOMER_ID'",
    "items": [
      {
        "productId": "'$PRODUCT_ID'",
        "stockLocationId": "'$LOCATION_ID'",
        "quantity": 5,
        "unitPrice": 100
      }
    ]
  }' | jq -r '.id')

# 2. Verificar estoque ANTES de confirmar
curl -s "http://localhost:4000/products/$PRODUCT_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-company-id: $COMPANY_ID" | jq '.currentStock'
# Deve retornar valor inicial (ex: 100)

# 3. Confirmar venda
curl -X POST "http://localhost:4000/sales/$SALE_ID/confirm" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-company-id: $COMPANY_ID"

# 4. Verificar estoque DEPOIS de confirmar
curl -s "http://localhost:4000/products/$PRODUCT_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-company-id: $COMPANY_ID" | jq '.currentStock'
# Deve retornar valor atualizado (ex: 95)
```

**Resultado Esperado:**
- ✅ `currentStock` diminuiu em 5 unidades
- ✅ Movimentação de saída registrada
- ✅ Estoque por local também atualizado

---

### Teste 2: Cancelar Venda

```bash
# 1. Cancelar venda previamente confirmada
curl -X POST "http://localhost:4000/sales/$SALE_ID/cancel" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-company-id: $COMPANY_ID" \
  -H "Content-Type: application/json" \
  -d '{"cancellationReason": "Teste de cancelamento"}'

# 2. Verificar estoque após cancelamento
curl -s "http://localhost:4000/products/$PRODUCT_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-company-id: $COMPANY_ID" | jq '.currentStock'
# Deve retornar valor original (ex: 100)
```

**Resultado Esperado:**
- ✅ `currentStock` voltou ao valor original
- ✅ Movimentação de devolução (RETURN) registrada
- ✅ Estoque por local também restaurado

---

### Teste 3: Múltiplos Itens

```bash
# Venda com múltiplos produtos
curl -X POST "http://localhost:4000/sales" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-company-id: $COMPANY_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "'$CUSTOMER_ID'",
    "items": [
      {
        "productId": "'$PRODUCT_1_ID'",
        "stockLocationId": "'$LOCATION_ID'",
        "quantity": 2,
        "unitPrice": 50
      },
      {
        "productId": "'$PRODUCT_2_ID'",
        "stockLocationId": "'$LOCATION_ID'",
        "quantity": 3,
        "unitPrice": 75
      }
    ]
  }'

# Verificar que AMBOS os produtos tiveram estoque atualizado
```

---

## Considerações Futuras

### 1. Sincronização Automática

Considerar criar um job para validar periodicamente se:
```typescript
Product.currentStock === SUM(ProductStockByLocation.quantity)
```

### 2. Transações Atômicas

Envolver todas as operações de estoque em uma transação única:
```typescript
await this.prisma.$transaction(async (tx) => {
  // Atualizar ProductStockByLocation
  // Atualizar Product.currentStock
  // Criar movimentação
});
```

### 3. Trigger no Banco

Considerar criar trigger no PostgreSQL:
```sql
CREATE OR REPLACE FUNCTION update_product_current_stock()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE "Product"
  SET "currentStock" = (
    SELECT COALESCE(SUM(quantity), 0)
    FROM "ProductStockByLocation"
    WHERE "productId" = NEW."productId"
  )
  WHERE id = NEW."productId";
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER product_stock_by_location_update
AFTER INSERT OR UPDATE OR DELETE ON "ProductStockByLocation"
FOR EACH ROW
EXECUTE FUNCTION update_product_current_stock();
```

---

## Resumo

✅ **Problema Resolvido:** Estoque geral do produto agora é atualizado corretamente
✅ **Métodos Corrigidos:** `confirm()` e `cancel()`
✅ **Consistência:** Ambos os sistemas de estoque sincronizados
✅ **Zero Breaking Changes:** API pública não foi alterada

**Status:** Correção completa e pronta para produção
