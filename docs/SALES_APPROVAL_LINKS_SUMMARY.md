# 🔗 Vinculação de Vendas - Resumo das Alterações

## 📋 Visão Geral

Este documento resume as alterações implementadas para vincular **vendas** a **contas a receber** e **movimentações de estoque**, permitindo rastreabilidade completa das operações.

---

## 🗃️ Alterações no Banco de Dados

### 1. Tabela `accounts_receivable`

**Campo Adicionado**:
```sql
saleId String? // UUID da venda vinculada (opcional)
```

**Relacionamento**:
```prisma
sale Sale? @relation(fields: [saleId], references: [id], onDelete: SetNull)
```

**Índice Criado**:
```prisma
@@index([saleId])
```

---

### 2. Tabela `product_stock_movements`

**Campo Adicionado**:
```sql
saleId String? // UUID da venda vinculada (opcional)
```

**Relacionamento**:
```prisma
sale Sale? @relation(fields: [saleId], references: [id], onDelete: SetNull)
```

**Índice Criado**:
```prisma
@@index([saleId])
```

---

### 3. Tabela `sales`

**Relacionamentos Adicionados**:
```prisma
accountsReceivable AccountReceivable[] // Contas a receber vinculadas
stockMovements     ProductStockMovement[] // Movimentações de estoque vinculadas
```

---

### 4. Migration Aplicada

```bash
npx prisma migrate dev --name add_sale_relations_to_receivables_and_stock
```

**Arquivo**: `20251116224105_add_sale_relations_to_receivables_and_stock`

---

## 🔌 Alterações nos Endpoints da API

### 1. Contas a Receber

#### GET /financial/accounts-receivable

**Parâmetros Adicionados**:
- `saleId` (opcional): Filtra contas a receber de uma venda específica

**Resposta Atualizada**:
Agora inclui o objeto `sale` quando a conta está vinculada:

```typescript
{
  id: string;
  saleId: string | null;
  // ... outros campos
  sale?: {
    id: string;
    code: string;
    status: string;
    totalAmount: number;
    customer: {
      id: string;
      name: string;
      companyName: string | null;
      personType: string;
    };
  };
}
```

**Exemplo de Uso**:
```http
GET /financial/accounts-receivable?companyId=xxx&saleId=yyy
```

---

#### GET /financial/accounts-receivable/:id

**Resposta Atualizada**:
Agora inclui o objeto `sale` completo quando disponível.

---

### 2. Movimentações de Estoque

#### GET /products/stock-movements

**Parâmetros Adicionados**:
- `saleId` (opcional): Filtra movimentações de uma venda específica

**Resposta Atualizada**:
Agora inclui o objeto `sale` quando a movimentação está vinculada:

```typescript
{
  id: string;
  saleId: string | null;
  type: string;
  quantity: number;
  // ... outros campos
  product: { ... };
  location: { ... };
  sale?: {
    id: string;
    code: string;
    status: string;
    totalAmount: number;
    customer: {
      id: string;
      name: string;
      companyName: string | null;
      personType: string;
    };
  };
}
```

**Exemplo de Uso**:
```http
GET /products/stock-movements?companyId=xxx&saleId=yyy
```

---

#### GET /products/:id/stock-movements

**Parâmetros Adicionados**:
- `saleId` (opcional): Filtra movimentações de um produto e venda específicos

---

## 🛠️ Alterações no Código Backend

### 1. AccountsReceivableService

**Método `findAll()` Atualizado**:
```typescript
async findAll(companyId: string, filters?: {
  // ... filtros existentes
  saleId?: string; // NOVO
})
```

**Include Adicionado**:
```typescript
include: {
  category: true,
  centroCusto: true,
  sale: { // NOVO
    select: {
      id: true,
      code: true,
      status: true,
      totalAmount: true,
      customer: {
        select: {
          id: true,
          name: true,
          companyName: true,
          personType: true,
        },
      },
    },
  },
}
```

---

### 2. ProductsService

**Método `getStockMovements()` Atualizado**:
```typescript
async getStockMovements(
  productId: string | undefined,
  companyId: string,
  filters?: {
    // ... filtros existentes
    saleId?: string; // NOVO
  }
)
```

**Include Adicionado**:
```typescript
include: {
  product: { ... },
  location: { ... },
  sale: { // NOVO
    select: {
      id: true,
      code: true,
      status: true,
      totalAmount: number;
      customer: {
        select: {
          id: true,
          name: true,
          companyName: true,
          personType: true,
        },
      },
    },
  },
  document: { ... },
}
```

---

### 3. SalesService

**Método `approveSale()` Atualizado**:

Ao criar contas a receber:
```typescript
await this.prisma.accountReceivable.create({
  data: {
    // ... outros campos
    saleId: sale.id, // NOVO
  },
});
```

Ao criar movimentações de estoque:
```typescript
await this.prisma.productStockMovement.create({
  data: {
    // ... outros campos
    saleId: sale.id, // NOVO
  },
});
```

**Método `cancel()` Atualizado**:

Agora cancela contas a receber usando `saleId` em vez de `documentNumber`:
```typescript
await this.prisma.accountReceivable.updateMany({
  where: {
    companyId,
    saleId: sale.id, // ALTERADO de documentNumber
    status: {
      in: ['PENDENTE', 'VENCIDO'],
    },
  },
  data: {
    status: 'CANCELADO',
    notes: `Venda cancelada: ${dto.cancellationReason}`,
  },
});
```

---

## 📊 Benefícios da Implementação

### 1. Rastreabilidade Completa

✅ Qualquer conta a receber pode ser rastreada até a venda original  
✅ Qualquer movimentação de estoque pode ser rastreada até a venda que a gerou  
✅ A partir de uma venda, é possível ver todas as contas e movimentações vinculadas

### 2. Integridade de Dados

✅ Relacionamentos diretos no banco de dados (chave estrangeira)  
✅ Índices criados para performance em consultas  
✅ `onDelete: SetNull` garante que dados não sejam perdidos se a venda for excluída

### 3. Facilidade de Consulta

✅ Filtrar contas a receber por venda: `?saleId=xxx`  
✅ Filtrar movimentações por venda: `?saleId=xxx`  
✅ Buscar venda e ver todas as contas e movimentações: `GET /sales/:id`

### 4. UX Melhorada no Frontend

✅ Exibir badge clicável da venda em listagens de contas  
✅ Exibir badge clicável da venda em listagens de movimentações  
✅ Navegar facilmente entre venda, contas e estoque  
✅ Filtrar contas/movimentações por origem (venda ou manual)

---

## 🧪 Casos de Uso

### 1. Auditor Quer Ver Contas de uma Venda

```http
GET /financial/accounts-receivable?companyId=xxx&saleId=yyy
```

**Resultado**: Lista todas as parcelas geradas pela venda

---

### 2. Gerente Quer Ver Impacto no Estoque

```http
GET /products/stock-movements?companyId=xxx&saleId=yyy
```

**Resultado**: Lista todas as saídas de estoque da venda

---

### 3. Sistema Precisa Cancelar Venda

```http
POST /sales/:id/cancel
Body: { "cancellationReason": "..." }
```

**Resultado**: 
- Todas as contas da venda são canceladas automaticamente
- Estoque é devolvido com movimentação de RETURN vinculada à venda

---

### 4. Cliente Quer Ver Histórico Completo

```http
GET /sales/:id
```

**Resultado**: Venda com:
- `accountsReceivable[]`: Todas as parcelas
- `stockMovements[]`: Todas as movimentações de estoque

---

## 📝 Checklist de Verificação

- [x] Migration criada e aplicada
- [x] Campos `saleId` adicionados aos modelos
- [x] Relacionamentos configurados no Prisma
- [x] Índices criados para performance
- [x] Services atualizados com includes
- [x] Controllers atualizados com novos parâmetros
- [x] Método `approveSale()` vincula contas e movimentações
- [x] Método `cancel()` usa `saleId` para cancelar contas
- [x] Documentação atualizada
- [x] Testes HTTP criados
- [x] Componentes frontend documentados
- [x] Exemplos de uso adicionados

---

## 🔄 Compatibilidade

### Retrocompatibilidade

✅ **Contas a receber antigas**: Continuam funcionando (saleId = null)  
✅ **Movimentações antigas**: Continuam funcionando (saleId = null)  
✅ **Filtros**: Funcionam com ou sem saleId  
✅ **APIs existentes**: Nenhuma quebra de contrato

### Migração de Dados Existentes

Não é necessário migrar dados antigos, pois:
- `saleId` é opcional (nullable)
- Contas e movimentações sem venda continuam válidas
- Novas vendas aprovadas terão vinculação automática

---

## 📚 Arquivos Alterados

### Backend
- ✅ `prisma/schema.prisma`
- ✅ `src/financial/services/accounts-receivable.service.ts`
- ✅ `src/financial/controllers/accounts-receivable.controller.ts`
- ✅ `src/products/products.service.ts`
- ✅ `src/products/products.controller.ts`
- ✅ `src/sales/services/sales.service.ts`

### Documentação
- ✅ `docs/SALES_APPROVAL_INTEGRATION.md`
- ✅ `sales-approval-links-tests.http`
- ✅ `docs/SALES_APPROVAL_LINKS_SUMMARY.md` (este arquivo)

---

## 🎯 Próximos Passos Sugeridos

1. **Implementar no Frontend**:
   - Componente `SaleLinkBadge`
   - Componente `AccountsReceivableList` com filtros
   - Componente `StockMovementsList` com filtros

2. **Adicionar Relatórios**:
   - Relatório de contas a receber por venda
   - Relatório de movimentações por venda
   - Dashboard de vendas com financeiro e estoque

3. **Melhorias Futuras**:
   - Adicionar campo `purchaseId` para compras
   - Adicionar campo `nfeId` para notas fiscais
   - Criar view materializada para consultas rápidas

---

**Versão**: 1.0  
**Data**: 16 de novembro de 2024  
**Status**: ✅ Implementado e Testado
