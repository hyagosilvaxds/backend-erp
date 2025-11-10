# 💰 Módulo Financeiro - API Documentation

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Contas Bancárias](#contas-bancárias)
3. [Categorias Financeiras](#categorias-financeiras)
4. [Lançamentos Financeiros](#lançamentos-financeiros)
5. [Contas a Pagar](#contas-a-pagar)
6. [Contas a Receber](#contas-a-receber)
7. [Relatórios](#relatórios)
8. [Importação e Conciliação OFX](#importação-e-conciliação-ofx)
9. [Endpoints Auxiliares](#endpoints-auxiliares-centro-de-custo-e-plano-de-contas)
10. [Exemplos de Integração](#exemplos-de-integração)

---

## 🎯 Visão Geral

O Módulo Financeiro oferece funcionalidades completas para gestão financeira empresarial, incluindo:

- ✅ Cadastro e gestão de contas bancárias
- ✅ Categorização de receitas e despesas
- ✅ Lançamentos financeiros com controle de saldo
- ✅ Gestão de contas a pagar e receber
- ✅ Controle de vencimentos e inadimplência
- ✅ Relatórios financeiros em Excel
- ✅ Fluxo de caixa
- ✅ Dashboard financeiro
- ✅ **Importação e conciliação automática de extratos OFX**

**Base URL:** `http://localhost:3000/financial`

**Autenticação:** Todas as rotas requerem Bearer Token (JWT)

---

## 🏦 Contas Bancárias

### Listar Contas Bancárias

```http
GET /financial/bank-accounts?companyId={companyId}
```

**Response:**
```json
[
  {
    "id": "uuid",
    "companyId": "uuid",
    "bankName": "Banco do Brasil",
    "bankCode": "001",
    "agencyNumber": "1234",
    "agencyDigit": "5",
    "accountNumber": "12345",
    "accountDigit": "6",
    "accountType": "CORRENTE",
    "accountName": "Conta Principal",
    "pixKey": "12345678000190",
    "initialBalance": 10000.00,
    "currentBalance": 15000.00,
    "active": true,
    "isMainAccount": true,
    "notes": "Conta para recebimentos",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### Criar Conta Bancária

```http
POST /financial/bank-accounts
```

**Request Body:**
```json
{
  "companyId": "uuid",
  "bankName": "Banco do Brasil",
  "bankCode": "001",
  "agencyNumber": "1234",
  "agencyDigit": "5",
  "accountNumber": "12345",
  "accountDigit": "6",
  "accountType": "CORRENTE",
  "accountName": "Conta Principal",
  "pixKey": "12345678000190",
  "initialBalance": 10000.00,
  "active": true,
  "isMainAccount": true,
  "notes": "Conta para recebimentos"
}
```

**Tipos de Conta:**
- `CORRENTE`: Conta Corrente
- `POUPANCA`: Conta Poupança
- `SALARIO`: Conta Salário

### Obter Conta Bancária

```http
GET /financial/bank-accounts/:id?companyId={companyId}
```

### Obter Saldo da Conta

```http
GET /financial/bank-accounts/:id/balance?companyId={companyId}
```

**Response:**
```json
{
  "accountId": "uuid",
  "accountName": "Conta Principal",
  "currentBalance": 15000.00,
  "initialBalance": 10000.00
}
```

### Atualizar Conta Bancária

```http
PATCH /financial/bank-accounts/:id?companyId={companyId}
```

**Request Body:** (Campos opcionais)
```json
{
  "accountName": "Conta Secundária",
  "active": false,
  "notes": "Conta desativada"
}
```

### Deletar Conta Bancária

```http
DELETE /financial/bank-accounts/:id?companyId={companyId}
```

---

## 📁 Categorias Financeiras

### Listar Categorias

```http
GET /financial/categories?companyId={companyId}&type={type}
```

**Query Parameters:**
- `companyId` (obrigatório): ID da empresa
- `type` (opcional): `RECEITA` ou `DESPESA`

**Response:**
```json
[
  {
    "id": "uuid",
    "companyId": "uuid",
    "name": "Vendas",
    "description": "Receitas de vendas",
    "type": "RECEITA",
    "color": "#4CAF50",
    "icon": "attach_money",
    "parentId": null,
    "active": true,
    "parent": null,
    "children": [],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### Criar Categoria

```http
POST /financial/categories
```

**Request Body:**
```json
{
  "companyId": "uuid",
  "name": "Vendas",
  "description": "Receitas de vendas",
  "type": "RECEITA",
  "color": "#4CAF50",
  "icon": "attach_money",
  "parentId": null,
  "active": true
}
```

**Tipos de Categoria:**
- `RECEITA`: Categoria de receitas
- `DESPESA`: Categoria de despesas

### Atualizar Categoria

```http
PATCH /financial/categories/:id?companyId={companyId}
```

### Deletar Categoria

```http
DELETE /financial/categories/:id?companyId={companyId}
```

---

## 💸 Lançamentos Financeiros

### Listar Lançamentos

```http
GET /financial/transactions?companyId={companyId}&type={type}&bankAccountId={bankAccountId}&categoryId={categoryId}&startDate={startDate}&endDate={endDate}
```

**Query Parameters:**
- `companyId` (obrigatório): ID da empresa
- `type` (opcional): `RECEITA` ou `DESPESA`
- `bankAccountId` (opcional): Filtrar por conta bancária
- `categoryId` (opcional): Filtrar por categoria
- `startDate` (opcional): Data inicial (formato: YYYY-MM-DD)
- `endDate` (opcional): Data final (formato: YYYY-MM-DD)

**Response:**
```json
[
  {
    "id": "uuid",
    "companyId": "uuid",
    "bankAccountId": "uuid",
    "categoryId": "uuid",
    "type": "RECEITA",
    "transactionType": "PIX",
    "amount": 1000.00,
    "fees": 10.00,
    "netAmount": 990.00,
    "description": "Pagamento de cliente",
    "referenceNumber": "REF123",
    "documentNumber": "NF-001",
    "transactionDate": "2024-01-15T10:30:00.000Z",
    "competenceDate": "2024-01-15T00:00:00.000Z",
    "reconciled": false,
    "notes": "Recebimento via PIX",
    "attachments": [],
    "bankAccount": { ... },
    "category": { ... },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
]
```

### Criar Lançamento

```http
POST /financial/transactions
```

**Request Body:**
```json
{
  "companyId": "uuid",
  "bankAccountId": "uuid",
  "categoryId": "uuid",
  "centroCustoId": "uuid",
  "contaContabilId": "uuid",
  "type": "RECEITA",
  "transactionType": "PIX",
  "amount": 1000.00,
  "fees": 10.00,
  "description": "Pagamento de cliente",
  "referenceNumber": "REF123",
  "documentNumber": "NF-001",
  "transactionDate": "2024-01-15T10:30:00.000Z",
  "competenceDate": "2024-01-15T00:00:00.000Z",
  "notes": "Recebimento via PIX",
  "attachments": []
}
```

**Tipos de Transação:**
- `DINHEIRO`: Pagamento em dinheiro
- `TRANSFERENCIA`: Transferência bancária
- `BOLETO`: Boleto bancário
- `CARTAO_CREDITO`: Cartão de crédito
- `CARTAO_DEBITO`: Cartão de débito
- `PIX`: PIX
- `CHEQUE`: Cheque
- `OUTROS`: Outros

> **Nota:** O saldo da conta bancária é atualizado automaticamente ao criar um lançamento.

### Obter Lançamento

```http
GET /financial/transactions/:id?companyId={companyId}
```

### Atualizar Lançamento

```http
PATCH /financial/transactions/:id?companyId={companyId}
```

> **Nota:** O saldo da conta bancária é recalculado automaticamente ao atualizar um lançamento.

### Conciliar Lançamento

```http
PATCH /financial/transactions/:id/reconcile?companyId={companyId}
```

**Response:**
```json
{
  "id": "uuid",
  "reconciled": true,
  "reconciledAt": "2024-01-20T14:30:00.000Z",
  ...
}
```

### Deletar Lançamento

```http
DELETE /financial/transactions/:id?companyId={companyId}
```

> **Nota:** O saldo da conta bancária é revertido automaticamente ao deletar um lançamento.

---

## 📤 Contas a Pagar

### Listar Contas a Pagar

```http
GET /financial/accounts-payable?companyId={companyId}&status={status}&startDate={startDate}&endDate={endDate}&categoryId={categoryId}
```

**Query Parameters:**
- `companyId` (obrigatório): ID da empresa
- `status` (opcional): `PENDENTE`, `PAGO`, `VENCIDO`, `PARCIAL`, `CANCELADO`
- `startDate` (opcional): Data inicial de vencimento
- `endDate` (opcional): Data final de vencimento
- `categoryId` (opcional): Filtrar por categoria

**Response:**
```json
[
  {
    "id": "uuid",
    "companyId": "uuid",
    "categoryId": "uuid",
    "supplierName": "Fornecedor XYZ",
    "supplierDocument": "12345678000190",
    "description": "Compra de materiais",
    "documentNumber": "NF-12345",
    "originalAmount": 5000.00,
    "paidAmount": 0.00,
    "remainingAmount": 5000.00,
    "discountAmount": 0.00,
    "interestAmount": 0.00,
    "fineAmount": 0.00,
    "issueDate": "2024-01-10T00:00:00.000Z",
    "dueDate": "2024-02-10T00:00:00.000Z",
    "competenceDate": "2024-01-10T00:00:00.000Z",
    "paymentDate": null,
    "installmentNumber": 1,
    "totalInstallments": 3,
    "status": "PENDENTE",
    "paymentMethod": null,
    "bankAccountId": null,
    "centroCustoId": "uuid",
    "notes": "Pagamento em 3x",
    "attachments": [],
    "isRecurring": false,
    "recurringPattern": null,
    "category": { ... },
    "centroCusto": { ... },
    "createdAt": "2024-01-10T00:00:00.000Z",
    "updatedAt": "2024-01-10T00:00:00.000Z"
  }
]
```

### Criar Conta a Pagar

```http
POST /financial/accounts-payable
```

**Request Body:**
```json
{
  "companyId": "uuid",
  "categoryId": "uuid",
  "centroCustoId": "uuid",
  "contaContabilId": "uuid",
  "supplierName": "Fornecedor XYZ",
  "supplierDocument": "12345678000190",
  "description": "Compra de materiais",
  "documentNumber": "NF-12345",
  "originalAmount": 5000.00,
  "discountAmount": 0.00,
  "interestAmount": 0.00,
  "fineAmount": 0.00,
  "issueDate": "2024-01-10",
  "dueDate": "2024-02-10",
  "competenceDate": "2024-01-10",
  "installmentNumber": 1,
  "totalInstallments": 3,
  "status": "PENDENTE",
  "notes": "Pagamento em 3x",
  "isRecurring": false
}
```

**Status:**
- `PENDENTE`: Aguardando pagamento
- `PAGO`: Totalmente pago
- `VENCIDO`: Com vencimento expirado
- `PARCIAL`: Parcialmente pago
- `CANCELADO`: Cancelado

**Padrão de Recorrência:**
- `MENSAL`: Mensal
- `TRIMESTRAL`: Trimestral
- `SEMESTRAL`: Semestral
- `ANUAL`: Anual

### Obter Conta a Pagar

```http
GET /financial/accounts-payable/:id?companyId={companyId}
```

### Listar Contas Vencidas

```http
GET /financial/accounts-payable/overdue?companyId={companyId}
```

### Pagar Conta

```http
PATCH /financial/accounts-payable/:id/pay?companyId={companyId}
```

**Request Body:**
```json
{
  "amount": 5000.00,
  "paymentDate": "2024-02-05",
  "bankAccountId": "uuid"
}
```

> **Nota:** O status é atualizado automaticamente:
> - `PAGO`: Se o valor pago for igual ao restante
> - `PARCIAL`: Se o valor pago for menor que o restante

### Atualizar Conta a Pagar

```http
PATCH /financial/accounts-payable/:id?companyId={companyId}
```

### Deletar Conta a Pagar

```http
DELETE /financial/accounts-payable/:id?companyId={companyId}
```

---

## 📥 Contas a Receber

### Listar Contas a Receber

```http
GET /financial/accounts-receivable?companyId={companyId}&status={status}&startDate={startDate}&endDate={endDate}&categoryId={categoryId}&customerId={customerId}
```

**Query Parameters:**
- `companyId` (obrigatório): ID da empresa
- `status` (opcional): `PENDENTE`, `RECEBIDO`, `VENCIDO`, `PARCIAL`, `CANCELADO`
- `startDate` (opcional): Data inicial de vencimento
- `endDate` (opcional): Data final de vencimento
- `categoryId` (opcional): Filtrar por categoria
- `customerId` (opcional): Filtrar por cliente

**Response:**
```json
[
  {
    "id": "uuid",
    "companyId": "uuid",
    "categoryId": "uuid",
    "customerName": "Cliente ABC",
    "customerDocument": "12345678901",
    "customerId": "uuid",
    "description": "Venda de produtos",
    "documentNumber": "NF-54321",
    "originalAmount": 10000.00,
    "receivedAmount": 0.00,
    "remainingAmount": 10000.00,
    "discountAmount": 0.00,
    "interestAmount": 0.00,
    "fineAmount": 0.00,
    "issueDate": "2024-01-15T00:00:00.000Z",
    "dueDate": "2024-02-15T00:00:00.000Z",
    "competenceDate": "2024-01-15T00:00:00.000Z",
    "receiptDate": null,
    "installmentNumber": 1,
    "totalInstallments": 2,
    "status": "PENDENTE",
    "paymentMethod": null,
    "bankAccountId": null,
    "centroCustoId": "uuid",
    "notes": "Pagamento em 2x",
    "attachments": [],
    "isRecurring": false,
    "recurringPattern": null,
    "category": { ... },
    "centroCusto": { ... },
    "createdAt": "2024-01-15T00:00:00.000Z",
    "updatedAt": "2024-01-15T00:00:00.000Z"
  }
]
```

### Criar Conta a Receber

```http
POST /financial/accounts-receivable
```

**Request Body:**
```json
{
  "companyId": "uuid",
  "categoryId": "uuid",
  "centroCustoId": "uuid",
  "contaContabilId": "uuid",
  "customerName": "Cliente ABC",
  "customerDocument": "12345678901",
  "customerId": "uuid",
  "description": "Venda de produtos",
  "documentNumber": "NF-54321",
  "originalAmount": 10000.00,
  "discountAmount": 0.00,
  "interestAmount": 0.00,
  "fineAmount": 0.00,
  "issueDate": "2024-01-15",
  "dueDate": "2024-02-15",
  "competenceDate": "2024-01-15",
  "installmentNumber": 1,
  "totalInstallments": 2,
  "status": "PENDENTE",
  "notes": "Pagamento em 2x",
  "isRecurring": false
}
```

### Obter Conta a Receber

```http
GET /financial/accounts-receivable/:id?companyId={companyId}
```

### Listar Contas Vencidas

```http
GET /financial/accounts-receivable/overdue?companyId={companyId}
```

### Receber Pagamento

```http
PATCH /financial/accounts-receivable/:id/receive?companyId={companyId}
```

**Request Body:**
```json
{
  "amount": 10000.00,
  "receiptDate": "2024-02-10",
  "bankAccountId": "uuid"
}
```

> **Nota:** O status é atualizado automaticamente:
> - `RECEBIDO`: Se o valor recebido for igual ao restante
> - `PARCIAL`: Se o valor recebido for menor que o restante

### Atualizar Conta a Receber

```http
PATCH /financial/accounts-receivable/:id?companyId={companyId}
```

### Deletar Conta a Receber

```http
DELETE /financial/accounts-receivable/:id?companyId={companyId}
```

---

## 📊 Relatórios

### Dashboard Financeiro

```http
GET /financial/reports/dashboard?companyId={companyId}&startDate={startDate}&endDate={endDate}
```

**Response:**
```json
{
  "bankAccounts": {
    "accounts": [
      {
        "id": "uuid",
        "accountName": "Conta Principal",
        "currentBalance": 15000.00
      }
    ],
    "totalBalance": 15000.00
  },
  "accountsPayable": [
    {
      "status": "PENDENTE",
      "_sum": {
        "remainingAmount": 25000.00
      },
      "_count": 10
    }
  ],
  "accountsReceivable": [
    {
      "status": "PENDENTE",
      "_sum": {
        "remainingAmount": 35000.00
      },
      "_count": 15
    }
  ],
  "transactions": [
    {
      "type": "RECEITA",
      "_sum": {
        "netAmount": 50000.00
      },
      "_count": 25
    },
    {
      "type": "DESPESA",
      "_sum": {
        "netAmount": 30000.00
      },
      "_count": 20
    }
  ]
}
```

### Fluxo de Caixa

```http
GET /financial/reports/cash-flow?companyId={companyId}&startDate={startDate}&endDate={endDate}
```

**Response:**
```json
[
  {
    "date": "2024-01-15",
    "receitas": 5000.00,
    "despesas": 3000.00,
    "saldo": 2000.00
  },
  {
    "date": "2024-01-16",
    "receitas": 8000.00,
    "despesas": 4000.00,
    "saldo": 4000.00
  }
]
```

### Exportar Fluxo de Caixa (Excel)

```http
GET /financial/reports/cash-flow/export?companyId={companyId}&startDate={startDate}&endDate={endDate}
```

**Response:** Arquivo Excel (.xlsx)

### Exportar Contas a Pagar (Excel)

```http
GET /financial/reports/accounts-payable/export?companyId={companyId}&status={status}&startDate={startDate}&endDate={endDate}
```

**Response:** Arquivo Excel (.xlsx)

### Exportar Contas a Receber (Excel)

```http
GET /financial/reports/accounts-receivable/export?companyId={companyId}&status={status}&startDate={startDate}&endDate={endDate}
```

**Response:** Arquivo Excel (.xlsx)

### Exportar Transações por Centro de Custo (Excel)

```http
GET /financial/reports/transactions/by-centro-custo/export?companyId={companyId}&startDate={startDate}&endDate={endDate}
```

**Query Parameters:**
- `companyId` (obrigatório): ID da empresa
- `startDate` (opcional): Data inicial (formato: YYYY-MM-DD)
- `endDate` (opcional): Data final (formato: YYYY-MM-DD)

**Response:** Arquivo Excel (.xlsx) com transações agrupadas por centro de custo

**Colunas do Relatório:**
- Centro de Custo
- Receitas
- Despesas
- Saldo
- Qtd. Transações

### Exportar Transações por Conta Contábil (Excel)

```http
GET /financial/reports/transactions/by-conta-contabil/export?companyId={companyId}&startDate={startDate}&endDate={endDate}
```

**Query Parameters:**
- `companyId` (obrigatório): ID da empresa
- `startDate` (opcional): Data inicial (formato: YYYY-MM-DD)
- `endDate` (opcional): Data final (formato: YYYY-MM-DD)

**Response:** Arquivo Excel (.xlsx) com transações agrupadas por conta contábil

**Colunas do Relatório:**
- Conta Contábil (Código - Nome)
- Receitas
- Despesas
- Saldo
- Qtd. Transações

---

## � Importação e Conciliação OFX

### Importar Arquivo OFX

Importa um extrato bancário em formato OFX e retorna sugestões de lançamentos similares. **A conciliação é sempre manual** - o usuário escolhe qual lançamento conciliar.

```http
POST /financial/ofx/import?companyId={companyId}&bankAccountId={bankAccountId}
Content-Type: multipart/form-data
```

**Form Data:**
- `file`: Arquivo OFX (.ofx)

**Query Parameters:**
- `companyId` (obrigatório): ID da empresa
- `bankAccountId` (obrigatório): ID da conta bancária

**Response:**
```json
{
  "totalTransactions": 25,
  "autoMatched": 0,
  "needsReview": 23,
  "alreadyImported": 2,
  "matches": [
    {
      "ofxTransactionId": "20240105001",
      "systemTransactionId": "uuid-system-txn",
      "matchScore": 95,
      "matchReasons": [
        "Valor exato",
        "Mesma data",
        "Descrição muito similar (90%+)"
      ],
      "autoMatched": false
    },
    {
      "ofxTransactionId": "20240106002",
      "systemTransactionId": "uuid-system-txn-2",
      "matchScore": 75,
      "matchReasons": [
        "Valor próximo (diferença < 5%)",
        "Diferença de 2 dias",
        "Descrição similar (65%+)"
      ],
      "autoMatched": false
    },
    {
      "ofxTransactionId": "20240107003",
      "matchScore": 0,
      "matchReasons": [
        "Nenhuma transação similar encontrada"
      ],
      "autoMatched": false
    }
  ]
}
```

**Algoritmo de Matching:**

O sistema usa um algoritmo inteligente que compara e atribui uma pontuação de similaridade:

1. **Valor (40 pontos)**
   - Valor exato: 40 pontos
   - Diferença < 1%: 35 pontos
   - Diferença < 5%: 25 pontos
   - Diferença < 10%: 15 pontos

2. **Data (30 pontos)**
   - Mesma data: 30 pontos
   - Diferença de 1 dia: 25 pontos
   - Diferença até 3 dias: 20 pontos
   - Diferença até 7 dias: 10 pontos

3. **Descrição (30 pontos)**
   - Similaridade ≥ 80%: 30 pontos
   - Similaridade ≥ 60%: 20 pontos
   - Similaridade ≥ 40%: 10 pontos

4. **Bônus**
   - Palavras em comum: até 15 pontos

**Score Total:** 0 a 100 pontos

**Interpretação do Score:**
- 🟢 **85-100**: Alta confiança - muito provável que seja a mesma transação
- 🟡 **60-84**: Média confiança - possível match, revisar com atenção
- 🟠 **30-59**: Baixa confiança - pode não ser a mesma transação
- 🔴 **0-29**: Sem match - provavelmente não relacionadas

> ⚠️ **Importante**: O sistema NUNCA concilia automaticamente. Todas as transações, independente do score, precisam de confirmação manual do usuário.

### Buscar Transações Similares

Busca lançamentos no sistema que são similares a uma transação do extrato OFX.

```http
POST /financial/ofx/find-similar?companyId={companyId}&bankAccountId={bankAccountId}
```

**Request Body:**
```json
{
  "fitId": "20240105001",
  "type": "CREDIT",
  "datePosted": "2024-01-05T12:00:00.000Z",
  "amount": 1500.00,
  "name": "PAGAMENTO CLIENTE ABC",
  "memo": "PIX RECEBIDO"
}
```

**Response:**
```json
[
  {
    "transactionId": "uuid",
    "description": "Recebimento Cliente ABC - PIX",
    "amount": 1500.00,
    "transactionDate": "2024-01-05T10:00:00.000Z",
    "type": "RECEITA",
    "categoryName": "Vendas",
    "matchScore": 92,
    "matchReasons": [
      "Valor exato",
      "Diferença de 1 dia",
      "Descrição muito similar (85%+)",
      "3 palavra(s) em comum"
    ]
  },
  {
    "transactionId": "uuid2",
    "description": "Venda para ABC",
    "amount": 1500.00,
    "transactionDate": "2024-01-04T15:00:00.000Z",
    "type": "RECEITA",
    "categoryName": "Vendas",
    "matchScore": 78,
    "matchReasons": [
      "Valor exato",
      "Diferença de 2 dias",
      "Descrição similar (65%+)"
    ]
  }
]
```

> **Nota:** Retorna apenas transações não conciliadas com score ≥ 30 pontos.

### Conciliar Manualmente

Concilia manualmente uma transação OFX com um lançamento do sistema.

```http
PATCH /financial/ofx/reconcile/:systemTransactionId?companyId={companyId}
```

**Request Body:**
```json
{
  "ofxFitId": "20240105001"
}
```

**Response:**
```json
{
  "id": "uuid",
  "description": "Recebimento Cliente ABC",
  "amount": 1500.00,
  "netAmount": 1500.00,
  "reconciled": true,
  "reconciledAt": "2024-01-15T14:30:00.000Z",
  "referenceNumber": "20240105001",
  "bankAccount": { ... },
  "category": { ... }
}
```

### Listar Extratos OFX Importados

Lista todos os extratos OFX que foram importados, com paginação e filtros.

```http
GET /financial/ofx/imports?companyId={companyId}&bankAccountId={bankAccountId}&startDate={startDate}&endDate={endDate}&page={page}&limit={limit}
```

**Query Parameters:**
- `companyId` (obrigatório): ID da empresa
- `bankAccountId` (opcional): Filtrar por conta bancária
- `startDate` (opcional): Data inicial de importação (YYYY-MM-DD)
- `endDate` (opcional): Data final de importação (YYYY-MM-DD)
- `page` (opcional): Número da página (padrão: 1)
- `limit` (opcional): Itens por página (padrão: 20)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "companyId": "uuid",
      "bankAccountId": "uuid",
      "fileName": "extrato-janeiro-2024.ofx",
      "fileSize": 15432,
      "bankId": "001",
      "accountId": "12345-6",
      "accountType": "CHECKING",
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-01-31T23:59:59.000Z",
      "balance": 15000.00,
      "balanceDate": "2024-01-31T23:59:59.000Z",
      "totalTransactions": 45,
      "importedCount": 40,
      "duplicateCount": 5,
      "reconciledCount": 15,
      "status": "COMPLETED",
      "importedAt": "2024-02-01T10:30:00.000Z",
      "bankAccount": {
        "id": "uuid",
        "accountName": "Conta Principal",
        "bankName": "Banco do Brasil"
      }
    }
  ],
  "total": 10,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

### Buscar Detalhes de um Extrato OFX

Retorna todos os detalhes de um extrato importado, incluindo as transações.

```http
GET /financial/ofx/imports/:id?companyId={companyId}
```

**Response:**
```json
{
  "id": "uuid",
  "companyId": "uuid",
  "bankAccountId": "uuid",
  "fileName": "extrato-janeiro-2024.ofx",
  "fileSize": 15432,
  "bankId": "001",
  "accountId": "12345-6",
  "accountType": "CHECKING",
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-01-31T23:59:59.000Z",
  "balance": 15000.00,
  "balanceDate": "2024-01-31T23:59:59.000Z",
  "totalTransactions": 45,
  "importedCount": 40,
  "duplicateCount": 5,
  "reconciledCount": 15,
  "status": "COMPLETED",
  "importedAt": "2024-02-01T10:30:00.000Z",
  "transactions": [
    {
      "fitId": "20240105001",
      "type": "CREDIT",
      "datePosted": "2024-01-05T12:00:00.000Z",
      "amount": 1500.00,
      "name": "PAGAMENTO CLIENTE ABC",
      "memo": "PIX RECEBIDO"
    }
  ],
  "bankAccount": {
    "id": "uuid",
    "accountName": "Conta Principal",
    "bankName": "Banco do Brasil",
    "bankCode": "001",
    "accountNumber": "12345-6"
  }
}
```

### Deletar Extrato OFX

Deleta um extrato OFX importado do sistema. **Atenção**: Isso não desfaz as conciliações já realizadas.

```http
DELETE /financial/ofx/imports/:id?companyId={companyId}
```

**Response:**
```json
{
  "message": "Extrato OFX deletado com sucesso"
}
```

> ⚠️ **Importante**: Deletar um extrato OFX remove apenas o registro da importação. As transações que foram conciliadas permanecem conciliadas no sistema.

### Fluxo de Uso Recomendado

1. **Upload do OFX:**
   ```typescript
   const formData = new FormData();
   formData.append('file', ofxFile);
   
   const response = await fetch(
     `${API_URL}/financial/ofx/import?companyId=${companyId}&bankAccountId=${bankAccountId}`,
     {
       method: 'POST',
       headers: {
         'Authorization': `Bearer ${token}`,
       },
       body: formData,
     }
   );
   const result = await response.json();
   ```

2. **Exibir todas as transações para revisão:**
   ```typescript
   // TODAS as transações precisam de revisão manual
   const transactionsToReview = result.matches;
   
   // Ordenar por score (maiores primeiro)
   transactionsToReview.sort((a, b) => b.matchScore - a.matchScore);
   
   // Exibir para o usuário escolher qual conciliar
   for (const match of transactionsToReview) {
     if (match.systemTransactionId) {
       // Tem sugestão - buscar detalhes da transação do sistema
       const sysTransaction = await fetchTransaction(match.systemTransactionId);
       
       // Exibir lado a lado:
       // - Dados do OFX (do extrato bancário)
       // - Dados do Sistema (sugestão)
       // - Score e motivos
       
       // Usuário decide: "Conciliar" | "Ignorar" | "Buscar Outro"
     } else {
       // Sem sugestão - usuário pode:
       // - Criar novo lançamento
       // - Buscar manualmente outro lançamento
       // - Ignorar (não conciliar)
     }
   }
   ```

3. **Conciliar manualmente quando usuário confirmar:**
   ```typescript
   // Usuário clicou em "Conciliar" para um match específico
   await fetch(
     `${API_URL}/financial/ofx/reconcile/${systemTransactionId}?companyId=${companyId}`,
     {
       method: 'PATCH',
       headers: {
         'Authorization': `Bearer ${token}`,
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({
         ofxFitId: match.ofxTransactionId,
       }),
     }
   );
   ```

### Exemplo React - Componente de Importação OFX

```tsx
import React, { useState } from 'react';

export function OFXImportComponent({ companyId, bankAccountId }) {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(
        `${API_URL}/financial/ofx/import?companyId=${companyId}&bankAccountId=${bankAccountId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: formData,
        }
      );

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Erro ao importar OFX:', error);
      alert('Erro ao importar arquivo OFX');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="ofx-import">
      <h2>Importar Extrato OFX</h2>
      
      <div>
        <input
          type="file"
          accept=".ofx"
          onChange={handleFileChange}
          disabled={importing}
        />
        <button onClick={handleImport} disabled={!file || importing}>
          {importing ? 'Importando...' : 'Importar'}
        </button>
      </div>

      {result && (
        <div className="import-result">
          <h3>Resultado da Importação</h3>
          <div className="stats">
            <p>Total de transações: {result.totalTransactions}</p>
            <p>⚠️ Precisam revisão: {result.needsReview}</p>
            <p>🔄 Já importadas: {result.alreadyImported}</p>
          </div>

          {result.needsReview > 0 && (
            <div className="needs-review">
              <h4>Transações para Conciliar</h4>
              <p className="info">
                ℹ️ Todas as transações precisam de revisão manual. 
                Escolha qual lançamento do sistema corresponde a cada transação do extrato.
              </p>
              <ul>
                {result.matches
                  .sort((a, b) => b.matchScore - a.matchScore) // Ordenar por score
                  .map(match => (
                    <li key={match.ofxTransactionId} className="match-item">
                      <div className={`score-badge score-${getScoreClass(match.matchScore)}`}>
                        {match.matchScore}%
                      </div>
                      <div className="match-details">
                        <strong>OFX: {match.ofxTransactionId}</strong>
                        {match.systemTransactionId ? (
                          <>
                            <p>Sugestão: Transação {match.systemTransactionId}</p>
                            <p className="reasons">
                              Motivos: {match.matchReasons.join(', ')}
                            </p>
                            <div className="actions">
                              <button
                                className="btn-primary"
                                onClick={() => handleManualReconcile(
                                  match.systemTransactionId,
                                  match.ofxTransactionId
                                )}
                              >
                                ✓ Conciliar com Sugestão
                              </button>
                              <button
                                className="btn-secondary"
                                onClick={() => handleSearchOther(match.ofxTransactionId)}
                              >
                                🔍 Buscar Outro
                              </button>
                              <button
                                className="btn-tertiary"
                                onClick={() => handleCreateNew(match.ofxTransactionId)}
                              >
                                + Criar Novo
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <p className="no-match">Nenhuma transação similar encontrada</p>
                            <div className="actions">
                              <button
                                className="btn-secondary"
                                onClick={() => handleSearchManual(match.ofxTransactionId)}
                              >
                                🔍 Buscar Manualmente
                              </button>
                              <button
                                className="btn-primary"
                                onClick={() => handleCreateNew(match.ofxTransactionId)}
                              >
                                + Criar Novo Lançamento
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );

  function getScoreClass(score: number): string {
    if (score >= 85) return 'high';
    if (score >= 60) return 'medium';
    if (score >= 30) return 'low';
    return 'none';
  }

  async function handleManualReconcile(systemTxnId: string, ofxFitId: string) {
    try {
      await fetch(
        `${API_URL}/financial/ofx/reconcile/${systemTxnId}?companyId=${companyId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ofxFitId }),
        }
      );
      
      alert('Transação conciliada com sucesso!');
      // Recarregar resultado
      handleImport();
    } catch (error) {
      console.error('Erro ao conciliar:', error);
      alert('Erro ao conciliar transação');
    }
  }
}
```

---

## �💻 Exemplos de Integração

### React/Next.js

```typescript
// services/financial.service.ts
import axios from 'axios';

const API_URL = 'http://localhost:3000/financial';

// Configurar axios com token
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});

// Contas Bancárias
export const getBankAccounts = (companyId: string) => {
  return api.get(`/bank-accounts?companyId=${companyId}`);
};

export const createBankAccount = (data: any) => {
  return api.post('/bank-accounts', data);
};

export const getBankAccountBalance = (id: string, companyId: string) => {
  return api.get(`/bank-accounts/${id}/balance?companyId=${companyId}`);
};

// Categorias Financeiras
export const getFinancialCategories = (companyId: string, type?: string) => {
  const url = type 
    ? `/categories?companyId=${companyId}&type=${type}`
    : `/categories?companyId=${companyId}`;
  return api.get(url);
};

export const createFinancialCategory = (data: any) => {
  return api.post('/categories', data);
};

// Lançamentos Financeiros
export const getTransactions = (companyId: string, filters?: any) => {
  const params = new URLSearchParams({
    companyId,
    ...filters
  });
  return api.get(`/transactions?${params}`);
};

export const createTransaction = (data: any) => {
  return api.post('/transactions', data);
};

export const reconcileTransaction = (id: string, companyId: string) => {
  return api.patch(`/transactions/${id}/reconcile?companyId=${companyId}`);
};

// Contas a Pagar
export const getAccountsPayable = (companyId: string, filters?: any) => {
  const params = new URLSearchParams({
    companyId,
    ...filters
  });
  return api.get(`/accounts-payable?${params}`);
};

export const createAccountPayable = (data: any) => {
  return api.post('/accounts-payable', data);
};

export const payAccount = (id: string, companyId: string, paymentData: any) => {
  return api.patch(`/accounts-payable/${id}/pay?companyId=${companyId}`, paymentData);
};

export const getOverduePayables = (companyId: string) => {
  return api.get(`/accounts-payable/overdue?companyId=${companyId}`);
};

// Contas a Receber
export const getAccountsReceivable = (companyId: string, filters?: any) => {
  const params = new URLSearchParams({
    companyId,
    ...filters
  });
  return api.get(`/accounts-receivable?${params}`);
};

export const createAccountReceivable = (data: any) => {
  return api.post('/accounts-receivable', data);
};

export const receivePayment = (id: string, companyId: string, receiptData: any) => {
  return api.patch(`/accounts-receivable/${id}/receive?companyId=${companyId}`, receiptData);
};

export const getOverdueReceivables = (companyId: string) => {
  return api.get(`/accounts-receivable/overdue?companyId=${companyId}`);
};

// Relatórios
export const getDashboard = (companyId: string, startDate?: string, endDate?: string) => {
  const params = new URLSearchParams({ companyId });
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  return api.get(`/reports/dashboard?${params}`);
};

export const getCashFlow = (companyId: string, startDate: string, endDate: string) => {
  return api.get(`/reports/cash-flow?companyId=${companyId}&startDate=${startDate}&endDate=${endDate}`);
};

export const exportCashFlow = (companyId: string, startDate: string, endDate: string) => {
  return api.get(`/reports/cash-flow/export?companyId=${companyId}&startDate=${startDate}&endDate=${endDate}`, {
    responseType: 'blob'
  });
};

export const exportAccountsPayable = (companyId: string, filters?: any) => {
  const params = new URLSearchParams({
    companyId,
    ...filters
  });
  return api.get(`/reports/accounts-payable/export?${params}`, {
    responseType: 'blob'
  });
};

export const exportAccountsReceivable = (companyId: string, filters?: any) => {
  const params = new URLSearchParams({
    companyId,
    ...filters
  });
  return api.get(`/reports/accounts-receivable/export?${params}`, {
    responseType: 'blob'
  });
};

export const exportTransactionsByCentroCusto = (companyId: string, startDate?: string, endDate?: string) => {
  const params = new URLSearchParams({ companyId });
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  return api.get(`/reports/transactions/by-centro-custo/export?${params}`, {
    responseType: 'blob'
  });
};

export const exportTransactionsByContaContabil = (companyId: string, startDate?: string, endDate?: string) => {
  const params = new URLSearchParams({ companyId });
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  return api.get(`/reports/transactions/by-conta-contabil/export?${params}`, {
    responseType: 'blob'
  });
};

// Importação OFX
export const importOFXFile = (file: File, bankAccountId: string, companyId: string) => {
  const formData = new FormData();
  formData.append('file', file);
  
  return api.post(
    `/ofx/import?companyId=${companyId}&bankAccountId=${bankAccountId}`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
};

export const findSimilarTransactions = (ofxTransaction: any, bankAccountId: string, companyId: string) => {
  return api.post(
    `/ofx/find-similar?companyId=${companyId}&bankAccountId=${bankAccountId}`,
    ofxTransaction
  );
};

export const manualReconcileOFX = (systemTransactionId: string, ofxFitId: string, companyId: string) => {
  return api.patch(
    `/ofx/reconcile/${systemTransactionId}?companyId=${companyId}`,
    { ofxFitId }
  );
};

// Gerenciamento de Extratos OFX
export const listOFXImports = (companyId: string, filters?: {
  bankAccountId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) => {
  const params = new URLSearchParams({ companyId });
  if (filters?.bankAccountId) params.append('bankAccountId', filters.bankAccountId);
  if (filters?.startDate) params.append('startDate', filters.startDate);
  if (filters?.endDate) params.append('endDate', filters.endDate);
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());
  
  return api.get(`/ofx/imports?${params}`);
};

export const getOFXImportById = (importId: string, companyId: string) => {
  return api.get(`/ofx/imports/${importId}?companyId=${companyId}`);
};

export const deleteOFXImport = (importId: string, companyId: string) => {
  return api.delete(`/ofx/imports/${importId}?companyId=${companyId}`);
};
    `/ofx/reconcile/${systemTransactionId}?companyId=${companyId}`,
    { ofxFitId }
  );
};
```

### Exemplo de Componente React

```typescript
// components/FinancialDashboard.tsx
import React, { useEffect, useState } from 'react';
import { getDashboard, exportCashFlow } from '../services/financial.service';

export const FinancialDashboard = ({ companyId }: { companyId: string }) => {
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, [companyId]);

  const loadDashboard = async () => {
    try {
      const response = await getDashboard(companyId);
      setDashboard(response.data);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCashFlow = async () => {
    try {
      const startDate = '2024-01-01';
      const endDate = '2024-12-31';
      const response = await exportCashFlow(companyId, startDate, endDate);
      
      // Criar link de download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `fluxo-caixa-${startDate}-${endDate}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Erro ao exportar fluxo de caixa:', error);
    }
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="financial-dashboard">
      <h1>Dashboard Financeiro</h1>
      
      {/* Saldo Total */}
      <div className="card">
        <h2>Saldo em Contas</h2>
        <p className="amount">
          R$ {dashboard?.bankAccounts?.totalBalance?.toFixed(2)}
        </p>
      </div>

      {/* Contas a Pagar */}
      <div className="card">
        <h2>Contas a Pagar</h2>
        {dashboard?.accountsPayable?.map((item: any) => (
          <div key={item.status}>
            <span>{item.status}:</span>
            <span>R$ {item._sum.remainingAmount?.toFixed(2)}</span>
            <span>({item._count} contas)</span>
          </div>
        ))}
      </div>

      {/* Contas a Receber */}
      <div className="card">
        <h2>Contas a Receber</h2>
        {dashboard?.accountsReceivable?.map((item: any) => (
          <div key={item.status}>
            <span>{item.status}:</span>
            <span>R$ {item._sum.remainingAmount?.toFixed(2)}</span>
            <span>({item._count} contas)</span>
          </div>
        ))}
      </div>

      {/* Botão de Exportação */}
      <button onClick={handleExportCashFlow}>
        Exportar Fluxo de Caixa
      </button>
    </div>
  );
};
```

---

## 🔐 Segurança

- ✅ Todas as rotas requerem autenticação JWT
- ✅ Validação de permissões por empresa (isolamento de dados)
- ✅ Validação de entrada com class-validator
- ✅ Proteção contra SQL Injection (Prisma ORM)

## � Endpoints Auxiliares (Centro de Custo e Plano de Contas)

### Buscar Centros de Custo

Para vincular transações, contas a pagar e contas a receber a centros de custo, você precisa buscar os centros disponíveis:

#### Listar Centros de Custo por Empresa

```http
GET /api/centro-custo/company/:companyId
Authorization: Bearer {token}
```

**Resposta:**
```json
[
  {
    "id": "uuid",
    "codigo": "CC001",
    "nome": "Administrativo",
    "descricao": "Despesas administrativas",
    "ativo": true,
    "companyId": "uuid",
    "centroCustoPaiId": null,
    "nivel": 1,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### Listar com Hierarquia

```http
GET /api/centro-custo/company/:companyId/hierarquia?ativo=true
Authorization: Bearer {token}
```

#### Buscar Centro de Custo por ID

```http
GET /api/centro-custo/:id
Authorization: Bearer {token}
```

### Buscar Contas Contábeis

Para vincular transações a contas do plano de contas:

#### Obter Plano de Contas Padrão

```http
GET /api/plano-contas/padrao?companyId={companyId}
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "id": "uuid",
  "nome": "Plano de Contas Padrão",
  "descricao": "Plano de contas empresarial",
  "tipo": "EMPRESARIAL",
  "ativo": true,
  "companyId": "uuid",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

#### Listar Contas Contábeis de um Plano

```http
GET /api/plano-contas/:planoContasId/contas
Authorization: Bearer {token}
```

**Query Params:**
- `page`: Número da página (opcional)
- `limit`: Itens por página (opcional)
- `tipo`: Filtrar por tipo (`ATIVO`, `PASSIVO`, `RECEITA`, `DESPESA`, `PATRIMONIO_LIQUIDO`)
- `nivel`: Filtrar por nível (1, 2, 3, 4, 5)
- `search`: Busca por código ou nome

**Resposta:**
```json
{
  "data": [
    {
      "id": "uuid",
      "codigo": "1.1.01.001",
      "nome": "Caixa",
      "descricao": "Caixa geral",
      "tipo": "ATIVO",
      "nivel": 4,
      "aceitaLancamento": true,
      "planoContasId": "uuid",
      "contaPaiId": "uuid",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 20
}
```

#### Obter Hierarquia de Contas

```http
GET /api/plano-contas/:id/hierarquia?ativo=true
Authorization: Bearer {token}
```

**Resposta:** Árvore hierárquica completa de contas contábeis.

#### Buscar Conta Contábil por ID

```http
GET /api/plano-contas/contas/:id
Authorization: Bearer {token}
```

### Exemplo de Uso no Frontend

```typescript
class ContabilidadeService {
  // Buscar centros de custo para dropdown
  async getCentrosCusto(companyId: string) {
    const response = await fetch(
      `${API_URL}/centro-custo/company/${companyId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );
    return response.json();
  }

  // Buscar plano de contas e suas contas
  async getContasContabeis(companyId: string) {
    // 1. Buscar plano padrão
    const planoResponse = await fetch(
      `${API_URL}/plano-contas/padrao?companyId=${companyId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );
    const plano = await planoResponse.json();

    // 2. Buscar contas do plano
    const contasResponse = await fetch(
      `${API_URL}/plano-contas/${plano.id}/contas`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );
    const contas = await contasResponse.json();
    
    return contas.data;
  }

  // Buscar apenas contas que aceitam lançamento
  async getContasLancamento(planoContasId: string) {
    const response = await fetch(
      `${API_URL}/plano-contas/${planoContasId}/contas`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );
    const result = await response.json();
    
    // Filtrar apenas contas que aceitam lançamento
    return result.data.filter(conta => conta.aceitaLancamento);
  }
}
```

### Componente React de Exemplo

```tsx
import React, { useEffect, useState } from 'react';

interface CentroCusto {
  id: string;
  codigo: string;
  nome: string;
}

interface ContaContabil {
  id: string;
  codigo: string;
  nome: string;
  aceitaLancamento: boolean;
}

export function TransactionForm({ companyId }) {
  const [centrosCusto, setCentrosCusto] = useState<CentroCusto[]>([]);
  const [contasContabeis, setContasContabeis] = useState<ContaContabil[]>([]);
  const [selectedCentroCusto, setSelectedCentroCusto] = useState('');
  const [selectedConta, setSelectedConta] = useState('');

  useEffect(() => {
    loadCentrosCusto();
    loadContasContabeis();
  }, [companyId]);

  const loadCentrosCusto = async () => {
    const response = await fetch(
      `${API_URL}/centro-custo/company/${companyId}`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    const data = await response.json();
    setCentrosCusto(data);
  };

  const loadContasContabeis = async () => {
    // Buscar plano padrão
    const planoResponse = await fetch(
      `${API_URL}/plano-contas/padrao?companyId=${companyId}`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    const plano = await planoResponse.json();

    // Buscar contas
    const contasResponse = await fetch(
      `${API_URL}/plano-contas/${plano.id}/contas`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    const result = await contasResponse.json();
    
    // Filtrar apenas contas que aceitam lançamento
    const contasLancamento = result.data.filter(c => c.aceitaLancamento);
    setContasContabeis(contasLancamento);
  };

  return (
    <form>
      {/* Outros campos do formulário */}

      <div>
        <label>Centro de Custo</label>
        <select 
          value={selectedCentroCusto}
          onChange={(e) => setSelectedCentroCusto(e.target.value)}
        >
          <option value="">Selecione...</option>
          {centrosCusto.map(cc => (
            <option key={cc.id} value={cc.id}>
              {cc.codigo} - {cc.nome}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Conta Contábil</label>
        <select 
          value={selectedConta}
          onChange={(e) => setSelectedConta(e.target.value)}
        >
          <option value="">Selecione...</option>
          {contasContabeis.map(conta => (
            <option key={conta.id} value={conta.id}>
              {conta.codigo} - {conta.nome}
            </option>
          ))}
        </select>
      </div>
    </form>
  );
}
```

---

## �📝 Notas Importantes

1. **Saldo Automático**: O saldo das contas bancárias é atualizado automaticamente ao criar, atualizar ou deletar lançamentos financeiros.

2. **Parcelamento**: Para criar contas parceladas, crie múltiplas contas com o mesmo `parentId` e numeração sequencial de `installmentNumber`.

3. **Recorrência**: Contas recorrentes devem ser criadas manualmente no sistema ou através de um job agendado.

4. **Conciliação**: Use a rota de conciliação para marcar transações como conciliadas após confirmação bancária.

5. **Relatórios Excel**: Os relatórios são gerados com formatação profissional, incluindo totais e formatação de valores monetários.

6. **Vínculos Contábeis**: 
   - Todos os lançamentos financeiros (`FinancialTransaction`) podem ser vinculados a um **Centro de Custo** (`centroCustoId`) e a uma **Conta Contábil** (`contaContabilId`).
   - Contas a pagar (`AccountPayable`) e contas a receber (`AccountReceivable`) também suportam vínculos com centro de custo e plano de contas.
   - Esses vínculos são opcionais, mas recomendados para melhor controle e análise financeira.
   - Use os relatórios especializados para visualizar transações agrupadas por centro de custo ou por conta contábil.
   - **Importante**: Ao listar contas contábeis para lançamentos, filtre apenas as contas onde `aceitaLancamento = true`.

7. **Importação OFX**:
   - O sistema suporta importação de extratos bancários em formato OFX (Open Financial Exchange).
   - **A conciliação é SEMPRE manual** - o sistema apenas sugere lançamentos similares.
   - O algoritmo calcula um score de similaridade (0-100) baseado em valor, data e descrição.
   - Scores altos (85+) indicam alta probabilidade de match, mas sempre requerem confirmação do usuário.
   - O FITID do OFX é armazenado no campo `referenceNumber` para evitar importações duplicadas.
   - Apenas transações NÃO conciliadas são consideradas para sugestões de matching.
   - A busca por transações similares considera uma janela de ±7 dias.
   - O usuário pode: conciliar com a sugestão, buscar outro lançamento, criar novo, ou ignorar.

## 🐛 Troubleshooting

### Erro de Saldo Inconsistente
Se o saldo da conta bancária estiver inconsistente, você pode recalculá-lo somando todos os lançamentos da conta.

### Erro ao Exportar Excel
Certifique-se de que o cabeçalho `responseType: 'blob'` está configurado no axios ao fazer download de arquivos.

---

**Desenvolvido por:** Backend ERP Team  
**Versão:** 1.0.0  
**Data:** Novembro 2024
