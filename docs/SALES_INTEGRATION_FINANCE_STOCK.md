# Integração Automática - Vendas, Financeiro e Estoque

## Visão Geral

O módulo de vendas está integrado automaticamente com os módulos financeiro e de estoque. Quando uma venda é **confirmada** ou **cancelada**, o sistema realiza operações automáticas nos outros módulos.

---

## 🔄 Fluxo de Confirmação de Venda

Quando uma venda é confirmada (`POST /sales/:id/confirm`), o sistema executa automaticamente:

### 1. ✅ Movimentação de Estoque

**Ação:** Baixa automática de estoque para todos os produtos da venda

**Processo:**
1. Verifica disponibilidade de estoque de cada produto
2. Atualiza a quantidade em `ProductStockByLocation`
3. Cria registro de movimentação em `ProductStockMovement`:
   - **Tipo:** `EXIT` (saída)
   - **Quantidade:** quantidade vendida
   - **Motivo:** "Venda confirmada"
   - **Nota:** `"Venda #{código}"`

**Validação:**
- Se não houver estoque suficiente, a confirmação é bloqueada
- Erro: `"Estoque insuficiente para o produto {nome}. Disponível: {X}, Solicitado: {Y}"`

**Exemplo de Movimentação Criada:**
```json
{
  "type": "EXIT",
  "productId": "uuid-produto",
  "locationId": "uuid-local",
  "quantity": 10,
  "previousStock": 50,
  "newStock": 40,
  "reason": "Venda confirmada",
  "notes": "Venda #SALE-2024-00123"
}
```

---

### 2. 💰 Lançamento Financeiro

**Ação:** Cria contas a receber automaticamente

**Processo:**
1. Busca categoria "Vendas" (tipo RECEITA)
   - Se não existir, cria automaticamente
2. Calcula valor de cada parcela (total / número de parcelas)
3. Cria uma `AccountReceivable` para cada parcela:
   - **Status:** `PENDENTE`
   - **Data de vencimento:** Intervalo de 30 dias entre parcelas
   - **Descrição:** `"Venda #{código} - Parcela {X}/{Total}"`

**Exemplo de Conta a Receber:**
```json
{
  "customerName": "João Silva",
  "customerDocument": "123.456.789-00",
  "description": "Venda #SALE-2024-00123 - Parcela 1/3",
  "originalAmount": 333.33,
  "receivedAmount": 0,
  "remainingAmount": 333.33,
  "issueDate": "2024-11-10",
  "dueDate": "2024-11-10",
  "status": "PENDENTE",
  "installmentNumber": 1,
  "totalInstallments": 3
}
```

**Vencimentos das Parcelas:**
- Parcela 1: Data da confirmação
- Parcela 2: Data da confirmação + 30 dias
- Parcela 3: Data da confirmação + 60 dias
- E assim por diante...

---

## ❌ Fluxo de Cancelamento de Venda

Quando uma venda é cancelada (`POST /sales/:id/cancel`), o sistema executa automaticamente:

### 1. ↩️ Devolução de Estoque

**Ação:** Reverte a baixa de estoque (somente se a venda já estava confirmada)

**Processo:**
1. Verifica se a venda estava confirmada/em produção/enviada
2. Para cada produto:
   - Devolve a quantidade ao estoque
   - Atualiza `ProductStockByLocation`
   - Cria movimentação do tipo `RETURN` (devolução)

**Exemplo de Movimentação de Devolução:**
```json
{
  "type": "RETURN",
  "productId": "uuid-produto",
  "locationId": "uuid-local",
  "quantity": 10,
  "previousStock": 40,
  "newStock": 50,
  "reason": "Cancelamento de venda",
  "notes": "Venda cancelada #SALE-2024-00123: Cliente desistiu"
}
```

---

### 2. 🚫 Cancelamento Financeiro

**Ação:** Cancela todas as contas a receber pendentes da venda

**Processo:**
1. Busca todas as contas a receber com o código da venda
2. Atualiza status para `CANCELADO` (apenas pendentes e vencidas)
3. Adiciona observação com motivo do cancelamento

**Exemplo:**
```sql
UPDATE accounts_receivable 
SET status = 'CANCELADO', 
    notes = 'Venda cancelada: Cliente desistiu'
WHERE documentNumber = 'SALE-2024-00123'
  AND status IN ('PENDENTE', 'VENCIDO')
```

**Status Considerados:**
- ✅ Cancela: `PENDENTE`, `VENCIDO`
- ❌ Não cancela: `RECEBIDO`, `PARCIAL` (já houve pagamento)

---

## 📊 Exemplo Completo

### Cenário: Venda de R$ 1.200,00 em 3x

**1. Criação da Venda (QUOTE):**
```http
POST /sales
{
  "customerId": "uuid",
  "paymentMethodId": "uuid",
  "installments": 3,
  "items": [
    { "productId": "uuid", "quantity": 10, "unitPrice": 120.00 }
  ]
}
```

**2. Confirmação da Venda:**
```http
POST /sales/{id}/confirm
```

**Resultado Automático:**

**A) Estoque:**
```
Produto: Widget A
- Estoque antes: 50 unidades
- Baixa: 10 unidades
- Estoque depois: 40 unidades
- Movimentação: EXIT registrada
```

**B) Financeiro:**
```
Conta a Receber 1:
- Valor: R$ 400,00
- Vencimento: 10/11/2024
- Status: PENDENTE

Conta a Receber 2:
- Valor: R$ 400,00
- Vencimento: 10/12/2024
- Status: PENDENTE

Conta a Receber 3:
- Valor: R$ 400,00
- Vencimento: 09/01/2025
- Status: PENDENTE
```

**3. Cancelamento da Venda:**
```http
POST /sales/{id}/cancel
{
  "cancellationReason": "Cliente desistiu"
}
```

**Resultado Automático:**

**A) Estoque:**
```
Produto: Widget A
- Estoque antes: 40 unidades
- Devolução: 10 unidades
- Estoque depois: 50 unidades
- Movimentação: RETURN registrada
```

**B) Financeiro:**
```
Todas as 3 contas a receber:
- Status alterado para: CANCELADO
- Observação: "Venda cancelada: Cliente desistiu"
```

---

## 🔍 Consultas Úteis

### Ver Contas a Receber de uma Venda

```http
GET /financial/accounts-receivable?documentNumber=SALE-2024-00123
```

### Ver Movimentações de Estoque de uma Venda

```sql
SELECT * FROM product_stock_movements 
WHERE notes LIKE '%SALE-2024-00123%'
ORDER BY "createdAt" DESC;
```

### Ver Histórico Completo de uma Venda

```sql
-- Estoque
SELECT 
  psm.type,
  psm.quantity,
  psm."previousStock",
  psm."newStock",
  psm.reason,
  p.name as product_name
FROM product_stock_movements psm
JOIN products p ON p.id = psm."productId"
WHERE psm.notes LIKE '%SALE-2024-00123%';

-- Financeiro
SELECT 
  "customerName",
  "installmentNumber",
  "originalAmount",
  "dueDate",
  status
FROM accounts_receivable
WHERE "documentNumber" = 'SALE-2024-00123';
```

---

## ⚠️ Regras de Negócio

### Confirmação de Venda

1. ✅ **Permite confirmação:**
   - Venda em status `QUOTE` ou `PENDING_APPROVAL`
   - Análise de crédito aprovada (se necessário)
   - Estoque disponível para todos os produtos

2. ❌ **Bloqueia confirmação:**
   - Venda já confirmada/completada
   - Venda cancelada
   - Análise de crédito pendente
   - Análise de crédito rejeitada
   - Estoque insuficiente para qualquer produto

### Cancelamento de Venda

1. ✅ **Permite cancelamento:**
   - Qualquer status exceto `COMPLETED`
   - Sempre requer motivo do cancelamento

2. ❌ **Bloqueia cancelamento:**
   - Venda já concluída (`COMPLETED`)
   - Venda já cancelada

3. ✅ **Devolve estoque:**
   - Somente se status for: `CONFIRMED`, `IN_PRODUCTION`, `READY_TO_SHIP`, `SHIPPED`

4. ✅ **Cancela financeiro:**
   - Apenas contas com status `PENDENTE` ou `VENCIDO`
   - Contas já recebidas não são afetadas

---

## 🛡️ Tratamento de Erros

O sistema é resiliente a erros nos módulos integrados:

### Erro no Estoque
```
- Bloqueia a operação
- Retorna mensagem clara ao usuário
- Não cria lançamento financeiro
- Exemplo: "Estoque insuficiente..."
```

### Erro no Financeiro
```
- NÃO bloqueia a operação
- Loga erro no console
- Venda é confirmada/cancelada normalmente
- Pode corrigir manualmente depois
```

**Motivo:** Prioriza a operação de venda. O financeiro pode ser ajustado depois, mas a venda não deve ser perdida.

---

## 📝 Observações Importantes

1. **Categoria "Vendas":**
   - É criada automaticamente se não existir
   - Tipo: `RECEITA`
   - Usada em todas as contas a receber de vendas

2. **Intervalo de Parcelas:**
   - Padrão: 30 dias entre parcelas
   - Primeira parcela vence na data da confirmação
   - Personalização futura: usar templates de parcelas

3. **Conciliação:**
   - As contas a receber criadas ainda precisam ser conciliadas manualmente
   - Status muda de `PENDENTE` → `RECEBIDO` ao confirmar pagamento
   - Pode vincular com transação bancária real

4. **Auditoria:**
   - Todas as movimentações de estoque ficam registradas
   - Todas as alterações em contas a receber ficam registradas
   - Possível rastreamento completo

---

## 🚀 Próximos Passos (Futuro)

- [ ] Usar templates de parcelas customizadas (Boleto 7/21, etc)
- [ ] Integrar com NF-e (emissão automática)
- [ ] Webhook para notificações de vencimento
- [ ] Dashboard de contas a receber por venda
- [ ] Relatório de vendas x recebimentos
- [ ] Conciliação automática com banco
- [ ] Suporte a devoluções parciais
