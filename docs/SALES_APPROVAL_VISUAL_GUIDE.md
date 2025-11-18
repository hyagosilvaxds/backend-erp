# 📊 Aprovação de Vendas - Guia Visual

## 🔄 Fluxo de Aprovação (Diagrama)

```
┌─────────────────────────────────────────────────────────────┐
│                    CRIAR VENDA                              │
│  POST /api/sales                                            │
│  ┌──────────────────────────────────────────┐              │
│  │ • customerId                              │              │
│  │ • paymentMethodId                         │              │
│  │ • installments: 3                         │              │
│  │ • items: [produto A, B, C]                │              │
│  └──────────────────────────────────────────┘              │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│                 VENDA CRIADA                                │
│  Status: QUOTE                                              │
│  Code: VEN-2024-0001                                        │
│  Total: R$ 1.500,00                                         │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    │ POST /api/sales/{id}/approve
                    ▼
┌─────────────────────────────────────────────────────────────┐
│              VALIDAÇÕES                                     │
│  ✅ Tem método de pagamento?                                │
│  ✅ Estoque disponível?                                     │
│  ✅ Local de estoque definido?                              │
│  ✅ Análise de crédito OK?                                  │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│           MOVIMENTAR ESTOQUE                                │
│  ┌─────────────────────────────────────┐                   │
│  │ Produto A: 10 → 5 (EXIT -5)        │                   │
│  │ Produto B: 20 → 17 (EXIT -3)       │                   │
│  │ Produto C: 15 → 13 (EXIT -2)       │                   │
│  └─────────────────────────────────────┘                   │
│  • type: EXIT                                               │
│  • saleId: venda-uuid                                       │
│  • reference: VEN-2024-0001                                 │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│        CRIAR CONTAS A RECEBER                               │
│  ┌─────────────────────────────────────┐                   │
│  │ Parcela 1/3: R$ 500,00             │                   │
│  │ Vencimento: 16/12/2024             │                   │
│  │ Status: PENDENTE                   │                   │
│  │ Doc: VEN-2024-0001-1               │                   │
│  │ saleId: venda-uuid                 │                   │
│  └─────────────────────────────────────┘                   │
│  ┌─────────────────────────────────────┐                   │
│  │ Parcela 2/3: R$ 500,00             │                   │
│  │ Vencimento: 16/01/2025             │                   │
│  │ Status: PENDENTE                   │                   │
│  │ Doc: VEN-2024-0001-2               │                   │
│  │ saleId: venda-uuid                 │                   │
│  └─────────────────────────────────────┘                   │
│  ┌─────────────────────────────────────┐                   │
│  │ Parcela 3/3: R$ 500,00             │                   │
│  │ Vencimento: 16/02/2025             │                   │
│  │ Status: PENDENTE                   │                   │
│  │ Doc: VEN-2024-0001-3               │                   │
│  │ saleId: venda-uuid                 │                   │
│  └─────────────────────────────────────┘                   │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│            VENDA APROVADA                                   │
│  Status: APPROVED ✅                                        │
│  confirmedAt: 2024-11-16 15:30:00                          │
│  • 3 contas a receber criadas                               │
│  • 3 movimentações de estoque                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔙 Fluxo de Cancelamento (Diagrama)

```
┌─────────────────────────────────────────────────────────────┐
│            VENDA APROVADA                                   │
│  Status: APPROVED                                           │
│  • 3 contas a receber (PENDENTE)                            │
│  • 3 movimentações estoque (EXIT)                           │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    │ POST /api/sales/{id}/cancel
                    │ { "cancellationReason": "..." }
                    ▼
┌─────────────────────────────────────────────────────────────┐
│         CANCELAR CONTAS A RECEBER                           │
│  ┌─────────────────────────────────────┐                   │
│  │ Parcela 1/3: PENDENTE → CANCELADO  │                   │
│  │ Parcela 2/3: PENDENTE → CANCELADO  │                   │
│  │ Parcela 3/3: PENDENTE → CANCELADO  │                   │
│  └─────────────────────────────────────┘                   │
│  • Apenas parcelas PENDENTE/VENCIDO                         │
│  • Preserva parcelas RECEBIDAS                              │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│          DEVOLVER ESTOQUE                                   │
│  ┌─────────────────────────────────────┐                   │
│  │ Produto A: 5 → 10 (RETURN +5)      │                   │
│  │ Produto B: 17 → 20 (RETURN +3)     │                   │
│  │ Produto C: 13 → 15 (RETURN +2)     │                   │
│  └─────────────────────────────────────┘                   │
│  • type: RETURN                                             │
│  • saleId: venda-uuid                                       │
│  • reason: "Cancelamento de venda"                          │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│            VENDA CANCELADA                                  │
│  Status: CANCELED ❌                                        │
│  canceledAt: 2024-11-16 16:00:00                           │
│  cancellationReason: "Cliente desistiu"                     │
│  • Contas a receber canceladas                              │
│  • Estoque devolvido                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Estrutura de Relacionamentos

```
┌──────────────────────────────────────────────────┐
│                    SALE                          │
│  ┌────────────────────────────────────────┐     │
│  │ id: "sale-uuid"                        │     │
│  │ code: "VEN-2024-0001"                  │     │
│  │ status: "APPROVED"                     │     │
│  │ totalAmount: 1500.00                   │     │
│  │ installments: 3                        │     │
│  │ customerId: "customer-uuid"            │     │
│  │ paymentMethodId: "payment-uuid"        │     │
│  └────────────────────────────────────────┘     │
└───────────┬──────────────────────┬───────────────┘
            │                      │
            │                      │
      saleId│                      │saleId
            │                      │
            ▼                      ▼
┌─────────────────────┐  ┌─────────────────────┐
│ ACCOUNTS_RECEIVABLE │  │  STOCK_MOVEMENTS    │
│ ┌─────────────────┐ │  │ ┌─────────────────┐ │
│ │ id: "rec-1"     │ │  │ │ id: "mov-1"     │ │
│ │ saleId: "..."   │ │  │ │ saleId: "..."   │ │
│ │ doc: "...-1"    │ │  │ │ type: "EXIT"    │ │
│ │ amount: 500     │ │  │ │ qty: -5         │ │
│ │ parcela: 1/3    │ │  │ │ product: A      │ │
│ │ status: PENDENTE│ │  │ │ location: X     │ │
│ └─────────────────┘ │  │ └─────────────────┘ │
│ ┌─────────────────┐ │  │ ┌─────────────────┐ │
│ │ id: "rec-2"     │ │  │ │ id: "mov-2"     │ │
│ │ saleId: "..."   │ │  │ │ saleId: "..."   │ │
│ │ doc: "...-2"    │ │  │ │ type: "EXIT"    │ │
│ │ amount: 500     │ │  │ │ qty: -3         │ │
│ │ parcela: 2/3    │ │  │ │ product: B      │ │
│ │ status: PENDENTE│ │  │ │ location: X     │ │
│ └─────────────────┘ │  │ └─────────────────┘ │
│ ┌─────────────────┐ │  │ ┌─────────────────┐ │
│ │ id: "rec-3"     │ │  │ │ id: "mov-3"     │ │
│ │ saleId: "..."   │ │  │ │ saleId: "..."   │ │
│ │ doc: "...-3"    │ │  │ │ type: "EXIT"    │ │
│ │ amount: 500     │ │  │ │ qty: -2         │ │
│ │ parcela: 3/3    │ │  │ │ product: C      │ │
│ │ status: PENDENTE│ │  │ │ location: X     │ │
│ └─────────────────┘ │  │ └─────────────────┘ │
└─────────────────────┘  └─────────────────────┘
```

---

## 🎨 UI/UX - Página de Detalhes da Venda

```
┌──────────────────────────────────────────────────────────────┐
│  ← Voltar                         Venda #VEN-2024-0001       │
│                                                               │
│  Cliente: João Silva              Status: [QUOTE]    📝      │
│  Total: R$ 1.500,00               3x de R$ 500,00            │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  ⚠️  Esta venda ainda não foi aprovada                │   │
│  │                                                        │   │
│  │  Aprovar venda irá:                                   │   │
│  │  • Criar 3 contas a receber                           │   │
│  │  • Dar baixa no estoque                               │   │
│  │  • Alterar status para APROVADO                       │   │
│  │                                                        │   │
│  │  [Cancelar]  [✅ Aprovar Venda]                       │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌─────────┬─────────────┬────────────────┐                 │
│  │ Detalhes│ 💰 Contas │ 📦 Estoque     │                 │
│  └─────────┴─────────────┴────────────────┘                 │
│                                                               │
│  💰 Contas a Receber                                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  ℹ️  Nenhuma conta a receber vinculada.              │   │
│  │  Aprove a venda para criar automaticamente.           │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

**Após Aprovação:**

```
┌──────────────────────────────────────────────────────────────┐
│  ← Voltar                         Venda #VEN-2024-0001       │
│                                                               │
│  Cliente: João Silva              Status: [APPROVED] ✅      │
│  Total: R$ 1.500,00               3x de R$ 500,00            │
│  Aprovada em: 16/11/2024 15:30                               │
│                                                               │
│  ┌─────────┬─────────────┬────────────────┐                 │
│  │ Detalhes│ 💰 Contas │ 📦 Estoque     │                 │
│  └─────────┴─────────────┴────────────────┘                 │
│                                                               │
│  💰 Contas a Receber                                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Total Original    Total Recebido    Total Restante  │   │
│  │  R$ 1.500,00       R$ 0,00          R$ 1.500,00      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Parcela │ Documento      │ Vencimento │ Valor    │ ● │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │  1/3    │ VEN-2024-0001-1│ 16/12/2024 │ R$ 500,00│🟡│ │
│  │  2/3    │ VEN-2024-0001-2│ 16/01/2025 │ R$ 500,00│🟡│ │
│  │  3/3    │ VEN-2024-0001-3│ 16/02/2025 │ R$ 500,00│🟡│ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  🟡 Pendente  🟢 Recebido  🔴 Vencido  ⚫ Cancelado         │
│                                                               │
│  📦 Movimentações de Estoque                                 │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  3 movimentação(ões) registrada(s)                      │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ 📤 Saída  Produto A (SKU-001)                        │    │
│  │ Local: Depósito Central                              │    │
│  │ Quantidade: -5   Estoque: 100 → 95                   │    │
│  │ Motivo: Venda aprovada                               │    │
│  │ Ref: VEN-2024-0001 • 16/11/2024 15:30               │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ 📤 Saída  Produto B (SKU-002)                        │    │
│  │ Local: Depósito Central                              │    │
│  │ Quantidade: -3   Estoque: 20 → 17                    │    │
│  │ Motivo: Venda aprovada                               │    │
│  │ Ref: VEN-2024-0001 • 16/11/2024 15:30               │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  [📄 Gerar PDF]  [📧 Enviar Email]  [❌ Cancelar Venda]    │
└──────────────────────────────────────────────────────────────┘
```

---

## 📊 Dashboard - Cards de Resumo

```
┌─────────────────────────────────────────────────────────────┐
│               RESUMO DA VENDA #VEN-2024-0001                │
│                                                              │
│  ┌─────────────┬──────────────┬──────────────┬────────────┐│
│  │ 💰 Total    │ ✅ Recebido  │ ⏳ Pendente  │ 📦 Estoque││
│  │             │              │              │            ││
│  │ R$ 1.500,00 │  R$ 0,00     │ R$ 1.500,00  │     3      ││
│  │             │              │              │            ││
│  │  3x parcelas│  0 parcelas  │  3 parcelas  │ saídas     ││
│  └─────────────┴──────────────┴──────────────┴────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## 🔔 Notificações/Toasts

### Ao Aprovar
```
┌──────────────────────────────────────────────┐
│ ✅ Venda aprovada com sucesso!               │
│                                               │
│ • 3 contas a receber criadas                  │
│ • 3 movimentações de estoque registradas      │
│                                               │
│ Venda #VEN-2024-0001                         │
└──────────────────────────────────────────────┘
```

### Ao Cancelar
```
┌──────────────────────────────────────────────┐
│ ⚠️ Venda cancelada                           │
│                                               │
│ • 3 contas a receber canceladas               │
│ • Estoque devolvido aos locais originais      │
│                                               │
│ Venda #VEN-2024-0001                         │
└──────────────────────────────────────────────┘
```

### Erro - Estoque Insuficiente
```
┌──────────────────────────────────────────────┐
│ ❌ Erro ao aprovar venda                     │
│                                               │
│ Estoque insuficiente para Produto A no       │
│ Depósito Central.                             │
│                                               │
│ Disponível: 3                                 │
│ Solicitado: 5                                 │
└──────────────────────────────────────────────┘
```

---

## 📱 Modal de Confirmação

```
┌────────────────────────────────────────────────────────────┐
│  Confirmar Aprovação                            [X]        │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  Ao aprovar a venda VEN-2024-0001, as seguintes            │
│  ações serão executadas:                                   │
│                                                             │
│  ✅ 3 contas a receber serão criadas automaticamente       │
│     • Parcela 1/3: R$ 500,00 - Venc: 16/12/2024           │
│     • Parcela 2/3: R$ 500,00 - Venc: 16/01/2025           │
│     • Parcela 3/3: R$ 500,00 - Venc: 16/02/2025           │
│                                                             │
│  📦 Estoque será movimentado (baixa nos produtos)          │
│     • Produto A: 5 unidades                                │
│     • Produto B: 3 unidades                                │
│     • Produto C: 2 unidades                                │
│                                                             │
│  📊 Status da venda será alterado para APROVADO            │
│                                                             │
│  ┌────────────────────────────────────────────────────┐   │
│  │ ⚠️ Certifique-se de que há estoque disponível!    │   │
│  └────────────────────────────────────────────────────┘   │
│                                                             │
│  [Cancelar]                    [✅ Confirmar Aprovação]   │
└────────────────────────────────────────────────────────────┘
```

---

## 🎯 Estados do Botão

### Estado Inicial (Venda = QUOTE)
```
┌───────────────────────┐
│ ✅ Aprovar Venda      │
└───────────────────────┘
```

### Estado Loading
```
┌───────────────────────┐
│ ⏳ Aprovando...       │
└───────────────────────┘
```

### Estado Sucesso
```
┌───────────────────────┐
│ ✅ Aprovado           │
└───────────────────────┘
```

### Estado Desabilitado (Já aprovada)
```
┌───────────────────────┐
│ ✓ Já Aprovada         │
└───────────────────────┘
```

---

## 📈 Linha do Tempo da Venda

```
Criada          Aprovada         Em Produção      Enviada         Concluída
  ●──────────────●────────────────○───────────────○───────────────○
16/11 10:00   16/11 15:30      17/11 09:00     18/11 14:00     20/11 16:00
  │               │
  │               ├─ 3 contas a receber criadas
  │               ├─ 3 movimentações de estoque
  │               └─ Status: APPROVED
  │
  └─ Status: QUOTE
```

---

## 🔍 Filtros e Buscas

### Filtrar Contas a Receber por Venda
```
GET /api/financial/accounts-receivable?saleId={uuid}
```

### Filtrar Movimentações por Venda
```
GET /api/stock/movements?saleId={uuid}
```

### Filtrar Vendas Aprovadas
```
GET /api/sales?status=APPROVED
```

---

## 💡 Dicas de UX

1. **Badge de Status Visual**
   - QUOTE: 📝 Cinza
   - APPROVED: ✅ Verde
   - CANCELED: ❌ Vermelho

2. **Cores de Alerta**
   - Pendente: 🟡 Amarelo
   - Recebido: 🟢 Verde
   - Vencido: 🔴 Vermelho
   - Cancelado: ⚫ Cinza

3. **Ícones Intuitivos**
   - Contas a Receber: 💰
   - Movimentações: 📦
   - Saída: 📤
   - Devolução: 📥
   - Aprovado: ✅
   - Cancelado: ❌

4. **Loading States**
   - Sempre mostrar durante operações
   - Desabilitar botões durante processamento
   - Mostrar progresso se possível

5. **Confirmações**
   - Sempre pedir confirmação para ações críticas
   - Mostrar detalhes do que será feito
   - Permitir cancelamento fácil

---

**Data**: 16 de novembro de 2024  
**Versão**: 1.0  
**Status**: ✅ Guia Visual Completo
