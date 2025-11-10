# 🚀 Vendas - Guia Rápido

## ⚡ Criação de Venda em 3 Passos

### 1️⃣ Obter IDs Necessários

```bash
# Listar clientes
GET /customers

# Listar produtos com estoque
GET /products?includeStock=true

# Listar locais de estoque
GET /stock-locations

# Listar métodos de pagamento
GET /sales/payment-methods
```

### 2️⃣ Criar Venda (Orçamento)

```json
POST /sales
{
  "customerId": "uuid-do-cliente",
  "status": "QUOTE",
  "paymentMethodId": "uuid-metodo-pagamento",
  "installments": 3,
  "items": [
    {
      "productId": "uuid-do-produto",
      "quantity": 10,
      "unitPrice": 120.00,
      "stockLocationId": "uuid-do-local-estoque"  // ⭐ IMPORTANTE!
    }
  ]
}
```

### 3️⃣ Confirmar Venda

```bash
POST /sales/{saleId}/confirm
```

**O que acontece automaticamente:**
- ✅ Valida estoque disponível
- ✅ Baixa estoque do local especificado
- ✅ Cria contas a receber (1 por parcela)
- ✅ Gera movimentações de estoque

---

## 📦 Seleção de Local de Estoque

### ⚠️ Campo Obrigatório: `stockLocationId`

**Por que é importante?**
```
Produto X pode estar em:
├── Depósito Principal: 50 unidades
├── Loja Shopping: 5 unidades
└── Loja Centro: 10 unidades

Ao criar a venda, você escolhe:
"Retirar 10 unidades do Depósito Principal"
```

### Exemplo Prático

```json
{
  "items": [
    {
      "productId": "prod-notebook",
      "quantity": 1,
      "stockLocationId": "loc-depot"  // Retira do depósito
    },
    {
      "productId": "prod-mouse",
      "quantity": 2,
      "stockLocationId": "loc-store"  // Retira da loja
    }
  ]
}
```

---

## 💰 Descontos e Valores

### Opção 1: Desconto Percentual
```json
{
  "discountPercent": 10,  // 10% de desconto
  "items": [...]
}
```

### Opção 2: Desconto Fixo
```json
{
  "discountAmount": 200.00,  // R$ 200 OFF
  "items": [...]
}
```

### Opção 3: Desconto por Item
```json
{
  "items": [
    {
      "productId": "prod-001",
      "quantity": 3,
      "unitPrice": 100.00,
      "discount": 30.00  // R$ 10 OFF por unidade
    }
  ]
}
```

### Frete e Outras Despesas
```json
{
  "shippingCost": 50.00,
  "otherCharges": 25.00,
  "otherChargesDesc": "Embalagem especial",
  "items": [...]
}
```

---

## ⚠️ Erros Comuns

### ❌ Erro 1: Campos com Nomes Errados
```json
{
  "discount": 100,      // ❌ ERRADO
  "shipping": 50,       // ❌ ERRADO
  "saleDate": "2025-11-10"  // ❌ ERRADO
}
```

**✅ Correto:**
```json
{
  "discountAmount": 100,  // ou discountPercent
  "shippingCost": 50,
  // saleDate é gerado automaticamente
}
```

### ❌ Erro 2: Estoque Insuficiente
```
Produto tem apenas 5 unidades no local
Tentou vender 10 unidades
→ Erro na confirmação: "Estoque insuficiente"
```

**✅ Solução:**
1. Verifique estoque antes: `GET /products/{id}`
2. Escolha outro local com estoque
3. Reduza a quantidade

### ❌ Erro 3: Local Não Especificado
```json
{
  "items": [
    {
      "productId": "prod-001",
      "quantity": 10,
      // stockLocationId não informado
    }
  ]
}
```

**⚠️ Ao confirmar:** Pode usar local padrão ou retornar erro

**✅ Melhor prática:** Sempre especificar o local

---

## 🔄 Fluxo Completo

```
1. Criar (QUOTE)
   └─ Status: QUOTE
   └─ Estoque: Não valida
   └─ Financeiro: Não cria
   
2. Confirmar
   └─ POST /sales/{id}/confirm
   └─ Status: CONFIRMED
   └─ Estoque: ✅ Valida e baixa
   └─ Financeiro: ✅ Cria contas a receber
   
3. Cancelar (se necessário)
   └─ POST /sales/{id}/cancel
   └─ Status: CANCELED
   └─ Estoque: ✅ Devolve ao local
   └─ Financeiro: ✅ Cancela contas pendentes
```

---

## 📊 Cálculo de Totais

```
Subtotal = Soma dos itens (qty × price - discount item)
Desconto Global = discountPercent ou discountAmount
Total Produtos = Subtotal - Desconto Global
Total Final = Total Produtos + shippingCost + otherCharges
```

**Exemplo:**
```
Item 1: 2 × R$ 500 = R$ 1.000,00
Item 2: 1 × R$ 300 = R$   300,00
─────────────────────────────────
Subtotal:           = R$ 1.300,00
Desconto (10%):     = R$   130,00
─────────────────────────────────
Total Produtos:     = R$ 1.170,00
Frete:              = R$    50,00
─────────────────────────────────
Total Final:        = R$ 1.220,00

Parcelamento: 3x de R$ 406,67
```

---

## 📚 Documentação Completa

- **[API_SALES_CREATE.md](./API_SALES_CREATE.md)** - Guia completo de criação
- **[API_SALES.md](./API_SALES.md)** - Todos os endpoints
- **[SALES_INTEGRATION_FINANCE_STOCK.md](./SALES_INTEGRATION_FINANCE_STOCK.md)** - Integração com financeiro e estoque
- **[sales-integration-tests.http](../sales-integration-tests.http)** - Exemplos de testes

---

## ✅ Checklist

Antes de criar uma venda:

- [ ] Cliente cadastrado
- [ ] Produtos cadastrados
- [ ] Locais de estoque configurados
- [ ] Estoque disponível nos locais
- [ ] Método de pagamento criado
- [ ] IDs corretos copiados
- [ ] `stockLocationId` especificado para cada item

---

## 🆘 Precisa de Ajuda?

1. **Erro de validação?** → Veja [Erros Comuns](#-erros-comuns)
2. **Dúvida sobre campos?** → Veja [API_SALES_CREATE.md](./API_SALES_CREATE.md)
3. **Problemas de integração?** → Veja [SALES_INTEGRATION_FINANCE_STOCK.md](./SALES_INTEGRATION_FINANCE_STOCK.md)
4. **Exemplos práticos?** → Abra [sales-integration-tests.http](../sales-integration-tests.http) no VS Code

---

**Última atualização:** 10 de novembro de 2025
