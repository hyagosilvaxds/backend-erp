# API de Vendas - Guia Rápido de Integração

## Índice

1. [Visão Geral](#visão-geral)
2. [Fluxo Básico](#fluxo-básico)
3. [Endpoints Disponíveis](#endpoints-disponíveis)
4. [Exemplos de Integração](#exemplos-de-integração)

---

## Visão Geral

O módulo de vendas permite:
- ✅ Criar e gerenciar métodos de pagamento
- ✅ Criar vendas (iniciam como orçamento)
- ✅ Adicionar/editar/remover itens
- ✅ Aprovar vendas (com análise de crédito opcional)
- ✅ Cancelar vendas
- ✅ Concluir vendas
- ✅ Consultar estatísticas

**Base URL**: `http://seu-dominio.com/api`

**Autenticação**: Todas as requisições precisam do header:
```
Authorization: Bearer {seu_token_jwt}
```

---

## Fluxo Básico

### 1️⃣ Criar Método de Pagamento
```http
POST /sales/payment-methods
Content-Type: application/json

{
  "name": "PIX",
  "code": "PIX",
  "type": "PIX"
}
```

### 2️⃣ Criar Venda (Orçamento)
```http
POST /sales
Content-Type: application/json

{
  "customerId": "uuid-do-cliente",
  "paymentMethodId": "uuid-do-metodo",
  "items": [
    {
      "productId": "uuid-do-produto",
      "quantity": 2,
      "unitPrice": 150.00
    }
  ]
}
```

### 3️⃣ Aprovar Venda
```http
POST /sales/{id}/approve
Content-Type: application/json

{}
```

### 4️⃣ Concluir Venda
```http
POST /sales/{id}/complete
```

---

## Endpoints Disponíveis

### Métodos de Pagamento

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/sales/payment-methods` | Criar método |
| GET | `/sales/payment-methods` | Listar métodos |
| GET | `/sales/payment-methods/:id` | Buscar método |
| PUT | `/sales/payment-methods/:id` | Atualizar método |
| DELETE | `/sales/payment-methods/:id` | Excluir método |
| PATCH | `/sales/payment-methods/:id/toggle-active` | Ativar/Desativar |

**Templates de Parcelas:**
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/sales/payment-methods/:id/installment-templates` | Listar templates |
| POST | `/sales/payment-methods/:id/installment-templates` | Adicionar template |
| PUT | `/sales/payment-methods/:id/installment-templates` | Substituir todos |
| PATCH | `/sales/payment-methods/:id/installment-templates/:number` | Atualizar template |
| DELETE | `/sales/payment-methods/:id/installment-templates/:number` | Remover template |

### Vendas

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/sales` | Criar venda (orçamento) |
| GET | `/sales` | Listar vendas |
| GET | `/sales/:id` | Buscar venda |
| PUT | `/sales/:id` | Atualizar venda (DRAFT) |
| POST | `/sales/:id/approve` | Aprovar venda |
| POST | `/sales/:id/cancel` | Cancelar venda |
| POST | `/sales/:id/complete` | Concluir venda |
| GET | `/sales/:id/pdf` | **Exportar PDF** |

**Itens da Venda:**
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/sales/:id/items` | Adicionar item |
| PUT | `/sales/:id/items/:itemId` | Atualizar item |
| DELETE | `/sales/:id/items/:itemId` | Remover item |

**Estatísticas:**
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/sales/statistics/summary` | Obter estatísticas |

---

## Exemplos de Integração

### Exemplo 1: Venda à Vista com PIX

```javascript
// 1. Criar método PIX (fazer uma vez)
const paymentMethod = await fetch('http://api.com/sales/payment-methods', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'PIX',
    code: 'PIX',
    type: 'PIX',
    daysToReceive: 0,
    transactionFee: 0.5
  })
});

// 2. Criar venda
const sale = await fetch('http://api.com/sales', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    customerId: 'uuid-cliente',
    paymentMethodId: paymentMethod.id,
    items: [
      {
        productId: 'uuid-produto-1',
        quantity: 2,
        unitPrice: 150.00
      },
      {
        productId: 'uuid-produto-2',
        quantity: 1,
        unitPrice: 99.90
      }
    ],
    discount: 50.00,
    shipping: 25.00
  })
});

// 3. Aprovar venda
const approved = await fetch(`http://api.com/sales/${sale.id}/approve`, {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({})
});

// 4. Concluir venda
const completed = await fetch(`http://api.com/sales/${sale.id}/complete`, {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer TOKEN'
  }
});
```

---

### Exemplo 2: Venda Parcelada com Análise de Crédito

```javascript
// 1. Criar método com análise de crédito
const creditCard = await fetch('http://api.com/sales/payment-methods', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Cartão de Crédito',
    code: 'CREDIT_CARD',
    type: 'CREDIT_CARD',
    allowInstallments: true,
    maxInstallments: 12,
    installmentFee: 2.5,
    requiresCreditAnalysis: true,
    minCreditScore: 600,
    transactionFee: 3.5
  })
});

// 2. Criar venda parcelada
const sale = await fetch('http://api.com/sales', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    customerId: 'uuid-cliente',
    paymentMethodId: creditCard.id,
    installments: 6,
    items: [
      {
        productId: 'uuid-produto',
        quantity: 1,
        unitPrice: 1200.00
      }
    ]
  })
});

// 3. Aprovar com análise de crédito
const approved = await fetch(`http://api.com/sales/${sale.id}/approve`, {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    creditAnalysisStatus: 'APPROVED',
    creditAnalysisNotes: 'Cliente com score 750 - Aprovado'
  })
});

// 4. Concluir venda
await fetch(`http://api.com/sales/${sale.id}/complete`, {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer TOKEN'
  }
});
```

---

### Exemplo 3: Boleto 7/21 (Parcelas Customizadas)

```javascript
// 1. Criar método com templates de parcelas
const boleto = await fetch('http://api.com/sales/payment-methods', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Boleto 7/21',
    code: 'BOLETO_7_21',
    type: 'BANK_SLIP',
    allowInstallments: true,
    maxInstallments: 2,
    daysToReceive: 3,
    transactionFee: 2.0,
    installmentTemplates: [
      {
        installmentNumber: 1,
        daysToPayment: 7,
        percentageOfTotal: 50
      },
      {
        installmentNumber: 2,
        daysToPayment: 21,
        percentageOfTotal: 50
      }
    ]
  })
});

// 2. Criar venda com Boleto 7/21
const sale = await fetch('http://api.com/sales', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    customerId: 'uuid-cliente',
    paymentMethodId: boleto.id,
    installments: 2,
    items: [
      {
        productId: 'uuid-produto',
        quantity: 10,
        unitPrice: 200.00
      }
    ]
  })
});
// Total: R$ 2.000,00
// 1ª parcela (7 dias): R$ 1.000,00
// 2ª parcela (21 dias): R$ 1.000,00

// 3. Aprovar e concluir
await fetch(`http://api.com/sales/${sale.id}/approve`, {
  method: 'POST',
  headers: { 'Authorization': 'Bearer TOKEN' },
  body: JSON.stringify({})
});

await fetch(`http://api.com/sales/${sale.id}/complete`, {
  method: 'POST',
  headers: { 'Authorization': 'Bearer TOKEN' }
});
```

---

### Exemplo 4: Criar Orçamento e Editar Antes de Aprovar

```javascript
// 1. Criar orçamento inicial
const draft = await fetch('http://api.com/sales', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    customerId: 'uuid-cliente',
    paymentMethodId: 'uuid-metodo',
    items: [
      {
        productId: 'uuid-produto-1',
        quantity: 5,
        unitPrice: 100.00
      }
    ]
  })
});
// Status: DRAFT
// Total: R$ 500,00

// 2. Adicionar outro item
await fetch(`http://api.com/sales/${draft.id}/items`, {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    productId: 'uuid-produto-2',
    quantity: 3,
    unitPrice: 50.00
  })
});
// Total agora: R$ 650,00

// 3. Aplicar desconto
await fetch(`http://api.com/sales/${draft.id}`, {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    discount: 50.00,
    notes: 'Desconto de fidelidade'
  })
});
// Total final: R$ 600,00

// 4. Aprovar orçamento
await fetch(`http://api.com/sales/${draft.id}/approve`, {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({})
});
```

---

### Exemplo 5: Consultar Vendas com Filtros

```javascript
// Listar todas as vendas aprovadas
const approved = await fetch('http://api.com/sales?status=APPROVED', {
  headers: { 'Authorization': 'Bearer TOKEN' }
});

// Listar vendas de um cliente específico
const customerSales = await fetch(
  `http://api.com/sales?customerId=uuid-cliente&page=1&limit=20`,
  { headers: { 'Authorization': 'Bearer TOKEN' } }
);

// Listar vendas por período
const periodSales = await fetch(
  'http://api.com/sales?startDate=2024-01-01&endDate=2024-12-31',
  { headers: { 'Authorization': 'Bearer TOKEN' } }
);

// Listar vendas por valor
const highValueSales = await fetch(
  'http://api.com/sales?minAmount=5000&maxAmount=50000',
  { headers: { 'Authorization': 'Bearer TOKEN' } }
);

// Combinar filtros
const filtered = await fetch(
  'http://api.com/sales?status=COMPLETED&startDate=2024-11-01&minAmount=1000',
  { headers: { 'Authorization': 'Bearer TOKEN' } }
);
```

---

### Exemplo 6: Obter Estatísticas

```javascript
// Estatísticas do mês atual
const monthStats = await fetch('http://api.com/sales/statistics/summary', {
  headers: { 'Authorization': 'Bearer TOKEN' }
});

// Estatísticas de um período específico
const yearStats = await fetch(
  'http://api.com/sales/statistics/summary?startDate=2024-01-01&endDate=2024-12-31',
  { headers: { 'Authorization': 'Bearer TOKEN' }
);

// Resposta exemplo:
// {
//   "totalSales": 450,
//   "totalRevenue": 1250000.00,
//   "averageTicket": 2777.78,
//   "salesByStatus": { ... },
//   "topCustomers": [ ... ],
//   "topProducts": [ ... ]
// }
```

---

### Exemplo 7: Cancelar Venda

```javascript
// Cancelar venda com motivo
const canceled = await fetch(`http://api.com/sales/${saleId}/cancel`, {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    reason: 'Cliente desistiu da compra'
  })
});

// O estoque é liberado automaticamente
```

---

### Exemplo 8: Exportar Orçamento ou Venda em PDF

```javascript
// Baixar PDF de um orçamento
const downloadPdf = async (saleId) => {
  const response = await fetch(`http://api.com/sales/${saleId}/pdf`, {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer TOKEN'
    }
  });

  // Obter o blob do PDF
  const blob = await response.blob();
  
  // Criar URL temporária e fazer download
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `documento-${saleId}.pdf`; // Será sobrescrito pelo nome do servidor
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

// Usar
await downloadPdf('uuid-da-venda');

// OU em HTML simples:
// <a href="http://api.com/sales/uuid-da-venda/pdf" 
//    download 
//    target="_blank">
//   Baixar PDF
// </a>
```

**Características do PDF:**
- ✅ Logo da empresa automaticamente incluída
- ✅ Marca d'água "ORÇAMENTO" para vendas não confirmadas
- ✅ Layout profissional com cores
- ✅ Todos os dados da venda formatados
- ✅ Nome do arquivo: `orcamento-CODIGO.pdf` ou `venda-CODIGO.pdf`

---

### Exemplo 9: Gerenciar Templates de Parcelas

```javascript
// Adicionar novo template ao método existente
await fetch(`http://api.com/sales/payment-methods/${methodId}/installment-templates`, {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    installmentNumber: 3,
    daysToPayment: 45,
    percentageOfTotal: 33.33
  })
});

// Atualizar template específico
await fetch(
  `http://api.com/sales/payment-methods/${methodId}/installment-templates/2`,
  {
    method: 'PATCH',
    headers: {
      'Authorization': 'Bearer TOKEN',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      daysToPayment: 30,
      percentageOfTotal: 50
    })
  }
);

// Substituir todos os templates
await fetch(`http://api.com/sales/payment-methods/${methodId}/installment-templates`, {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    templates: [
      { installmentNumber: 1, daysToPayment: 0, percentageOfTotal: 30 },
      { installmentNumber: 2, daysToPayment: 30, percentageOfTotal: 35 },
      { installmentNumber: 3, daysToPayment: 60, percentageOfTotal: 35 }
    ]
  })
});

// Listar templates
const templates = await fetch(
  `http://api.com/sales/payment-methods/${methodId}/installment-templates`,
  { headers: { 'Authorization': 'Bearer TOKEN' } }
);

// Remover template
await fetch(
  `http://api.com/sales/payment-methods/${methodId}/installment-templates/2`,
  {
    method: 'DELETE',
    headers: { 'Authorization': 'Bearer TOKEN' }
  }
);
```

---

## Códigos de Status HTTP

| Código | Descrição |
|--------|-----------|
| 200 | OK - Requisição bem-sucedida |
| 201 | Created - Recurso criado com sucesso |
| 400 | Bad Request - Dados inválidos |
| 401 | Unauthorized - Token inválido ou ausente |
| 404 | Not Found - Recurso não encontrado |
| 409 | Conflict - Conflito (ex: estoque insuficiente) |
| 500 | Internal Server Error - Erro no servidor |

---

## Tipos de Pagamento

- `CASH` - Dinheiro
- `CREDIT_CARD` - Cartão de Crédito
- `DEBIT_CARD` - Cartão de Débito
- `PIX` - PIX
- `BANK_SLIP` - Boleto Bancário
- `BANK_TRANSFER` - Transferência Bancária
- `CHECK` - Cheque
- `OTHER` - Outro

---

## Status das Vendas

- `DRAFT` - Orçamento (pode editar)
- `PENDING_APPROVAL` - Aguardando análise
- `APPROVED` - Aprovada (estoque reservado)
- `COMPLETED` - Concluída
- `CANCELED` - Cancelada

---

## Regras de Negócio

1. ✅ Vendas iniciam como **DRAFT** (orçamento)
2. ✅ Apenas vendas DRAFT podem ser editadas
3. ✅ Estoque é reservado ao aprovar, não ao criar
4. ✅ Vendas canceladas liberam o estoque
5. ✅ Análise de crédito rejeitada cancela automaticamente
6. ✅ Vendas concluídas não podem ser canceladas
7. ✅ Soma de percentagens de templates deve ser 100%
8. ✅ Uma venda deve ter pelo menos 1 item

---

## Links para Documentação Completa

- 📘 [API de Métodos de Pagamento](./API_PAYMENT_METHODS.md) - Referência completa
- 📗 [API de Vendas](./API_SALES.md) - Referência completa

---

## Suporte

Para dúvidas ou problemas, consulte a documentação completa ou entre em contato com o time de desenvolvimento.
