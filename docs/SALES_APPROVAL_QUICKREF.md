# 🚀 Aprovação de Vendas - Referência Rápida

## 📌 Resumo

Ao aprovar uma venda, o sistema automaticamente:
- ✅ Cria contas a receber (uma para cada parcela)
- ✅ Movimenta o estoque (baixa nos produtos)
- ✅ Vincula tudo à venda (via `saleId`)

Ao cancelar uma venda aprovada:
- ✅ Cancela todas as contas a receber pendentes
- ✅ Devolve o estoque aos locais originais
- ✅ Registra movimentações de RETURN

---

## 🔌 Endpoint Principal

### Aprovar Venda
```http
POST /api/sales/:id/approve
Authorization: Bearer {token}
```

**Requisitos**:
- Venda deve ter método de pagamento
- Produtos devem ter estoque disponível
- Produtos devem ter local de estoque definido

**Resultado**:
```json
{
  "id": "sale-uuid",
  "status": "APPROVED",
  "accountsReceivable": [
    {
      "saleId": "sale-uuid",
      "documentNumber": "VEN-2024-0001-1",
      "installmentNumber": 1,
      "status": "PENDENTE"
    }
  ],
  "stockMovements": [
    {
      "saleId": "sale-uuid",
      "type": "EXIT",
      "quantity": -5
    }
  ]
}
```

---

## 🔗 Consultar Vínculos

### Contas a Receber da Venda
```http
GET /api/financial/accounts-receivable?saleId={saleId}
```

### Movimentações de Estoque
```http
GET /api/stock/movements?saleId={saleId}
```

---

## 📊 Estrutura de Dados

### AccountReceivable
```typescript
{
  id: string;
  saleId: string;  // ← Vínculo com a venda
  documentNumber: string;  // Ex: "VEN-2024-0001-1"
  description: string;
  originalAmount: number;
  remainingAmount: number;
  dueDate: Date;
  status: 'PENDENTE' | 'RECEBIDO' | 'VENCIDO' | 'CANCELADO';
  installmentNumber: number | null;
  totalInstallments: number | null;
}
```

### ProductStockMovement
```typescript
{
  id: string;
  saleId: string;  // ← Vínculo com a venda
  productId: string;
  type: 'EXIT' | 'RETURN';
  quantity: number;  // Negativo para EXIT, positivo para RETURN
  previousStock: number;
  newStock: number;
  reason: string;
  reference: string;  // Código da venda
}
```

---

## 🎨 Frontend - Componentes Essenciais

### 1. Hook de Aprovação
```typescript
const { approveSale, loading, error } = useSaleApproval();

await approveSale(saleId);
```

### 2. Botão de Aprovação
```tsx
<SaleApprovalButton
  saleId={sale.id}
  saleCode={sale.code}
  currentStatus={sale.status}
  onApproved={() => reloadSale()}
/>
```

### 3. Painel de Contas a Receber
```tsx
<SaleReceivablesPanel saleId={sale.id} />
```

### 4. Painel de Movimentações
```tsx
<SaleStockMovementsPanel saleId={sale.id} />
```

---

## ⚠️ Validações

| Erro | Motivo | Solução |
|------|--------|---------|
| "Venda deve ter um método de pagamento" | `paymentMethodId` não definido | Adicionar método de pagamento |
| "Estoque insuficiente" | Quantidade solicitada > disponível | Reduzir quantidade ou repor estoque |
| "Venda já está aprovada" | Status já é APPROVED | Verificar se já foi aprovada |
| "Análise de crédito deve ser aprovada" | `creditAnalysisRequired = true` mas `creditAnalysisStatus ≠ APPROVED` | Aprovar análise de crédito primeiro |
| "Item não possui local de estoque" | `stockLocationId` não definido | Definir local de estoque para o item |

---

## 📈 Fluxo Completo

```
1. Criar Venda (QUOTE)
   ↓
2. POST /sales/:id/approve
   ↓
   ├── Cria Contas a Receber (3 parcelas)
   │   └── Status: PENDENTE
   ├── Movimenta Estoque (EXIT)
   │   └── Quantidade: -5
   └── Atualiza Venda (APPROVED)
   ↓
3. Cliente Cancela
   ↓
4. POST /sales/:id/cancel
   ↓
   ├── Cancela Contas a Receber
   │   └── Status: CANCELADO
   ├── Devolve Estoque (RETURN)
   │   └── Quantidade: +5
   └── Atualiza Venda (CANCELED)
```

---

## 🧪 Teste Rápido

```bash
# 1. Criar venda
curl -X POST /api/sales \
  -H "Authorization: Bearer {token}" \
  -d '{
    "customerId": "uuid",
    "paymentMethodId": "uuid",
    "installments": 2,
    "items": [{
      "productId": "uuid",
      "stockLocationId": "uuid",
      "quantity": 5,
      "unitPrice": 100
    }]
  }'

# 2. Aprovar (cria receivables + move stock)
curl -X POST /api/sales/{saleId}/approve \
  -H "Authorization: Bearer {token}"

# 3. Verificar contas a receber
curl /api/financial/accounts-receivable?saleId={saleId}

# 4. Verificar movimentações
curl /api/stock/movements?saleId={saleId}
```

---

## 💡 Dicas

- **Parcelamento**: O sistema cria automaticamente N contas a receber, onde N = `installments`
- **Datas de Vencimento**: Por padrão, cada parcela vence 30 dias após a anterior
- **Estoque**: Apenas produtos com `manageStock = true` têm movimentação registrada
- **Cancelamento**: Só cancela contas com status PENDENTE ou VENCIDO, preserva as já RECEBIDAS
- **Devolução**: Estoque é devolvido ao mesmo local (`stockLocationId`) de onde saiu

---

## 📁 Arquivos Relacionados

- `docs/SALES_APPROVAL_INTEGRATION.md` - Documentação completa
- `sales-approval-tests.http` - Testes de API prontos
- `src/sales/services/sales.service.ts` - Lógica de aprovação
- `src/sales/controllers/sales.controller.ts` - Endpoint `/approve`

---

**Versão**: 1.0  
**Data**: 16/11/2024  
**Status**: ✅ Pronto para uso
