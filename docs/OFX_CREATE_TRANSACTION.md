# 📝 Criar Lançamento a partir de Movimentação OFX

## 📋 Visão Geral

Esta funcionalidade permite que o usuário **crie um novo lançamento financeiro** diretamente a partir de uma movimentação bancária importada do extrato OFX, como alternativa à conciliação com um lançamento existente.

## 🔄 Diferença entre Conciliar e Criar

### Conciliar (Reconcile)
- **Quando usar**: Quando você já tem um lançamento registrado no sistema e quer vinculá-lo à movimentação bancária
- **Exemplo**: Você registrou uma venda de R$ 1.000,00 no sistema. Ao importar o extrato OFX, você encontra o depósito de R$ 1.000,00 e **concilia** os dois
- **Resultado**: O lançamento existente é marcado como conciliado

### Criar a partir do OFX (Create from OFX)
- **Quando usar**: Quando a movimentação bancária ainda não tem um lançamento correspondente no sistema
- **Exemplo**: Você importa o extrato e encontra um pagamento de taxa bancária que ainda não estava registrado. Você **cria um novo lançamento** a partir dessa movimentação
- **Resultado**: Um novo lançamento é criado, já conciliado com o extrato

## 🚀 Como Usar

### Endpoint

```http
POST /financial/ofx/create-transaction
Content-Type: application/json
Authorization: Bearer {token}
```

### Request Body

```json
{
  "ofxFitId": "20240115001",
  "companyId": "uuid-empresa",
  "bankAccountId": "uuid-conta",
  "type": "DESPESA",
  "transactionType": "PIX",
  "categoryId": "uuid-categoria",
  "centroCustoId": "uuid-centro-custo",
  "contaContabilId": "uuid-conta-contabil",
  "description": "Taxa bancária mensal",
  "notes": "Taxa cobrada pelo banco"
}
```

### Campos Obrigatórios

- **ofxFitId**: ID único da transação no OFX (FITID)
- **companyId**: ID da empresa
- **bankAccountId**: ID da conta bancária
- **type**: Tipo do lançamento
  - `RECEITA`: Entrada de dinheiro
  - `DESPESA`: Saída de dinheiro
- **transactionType**: Forma de pagamento
  - `DINHEIRO`
  - `TRANSFERENCIA`
  - `BOLETO`
  - `CARTAO_CREDITO`
  - `CARTAO_DEBITO`
  - `PIX`
  - `CHEQUE`
  - `OUTROS`

### Campos Opcionais

- **categoryId**: ID da categoria financeira
- **centroCustoId**: ID do centro de custo
- **contaContabilId**: ID da conta contábil
- **description**: Descrição customizada (se não fornecida, usa a descrição do OFX)
- **notes**: Observações adicionais

### Response de Sucesso

```json
{
  "id": "uuid-lancamento",
  "companyId": "uuid-empresa",
  "bankAccountId": "uuid-conta",
  "categoryId": "uuid-categoria",
  "centroCustoId": "uuid-centro-custo",
  "type": "DESPESA",
  "transactionType": "PIX",
  "amount": 25.00,
  "netAmount": -25.00,
  "description": "Taxa bancária mensal",
  "transactionDate": "2024-01-15T10:30:00.000Z",
  "competenceDate": "2024-01-15T10:30:00.000Z",
  "referenceNumber": "20240115001",
  "notes": "Taxa cobrada pelo banco",
  "reconciled": true,
  "reconciledAt": "2024-01-15T15:45:00.000Z",
  "bankAccount": {
    "id": "uuid-conta",
    "accountName": "Conta Principal",
    "bankName": "Banco do Brasil"
  },
  "category": {
    "id": "uuid-categoria",
    "name": "Taxas Bancárias"
  }
}
```

### Erros Possíveis

#### 400 - Já existe lançamento vinculado

```json
{
  "statusCode": 400,
  "message": "Já existe um lançamento vinculado a esta movimentação OFX",
  "error": "Bad Request"
}
```

#### 404 - Transação OFX não encontrada

```json
{
  "statusCode": 404,
  "message": "Transação OFX não encontrada",
  "error": "Not Found"
}
```

## 📊 Fluxo Completo de Uso

### 1. Importar o Extrato OFX

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

### 2. Exibir Movimentações para o Usuário

```typescript
// Mostrar todas as transações do extrato
const transactions = result.matches;

// Para cada transação, o usuário pode escolher:
// - Conciliar com lançamento existente
// - Criar novo lançamento
// - Ignorar
```

### 3. Opção A: Conciliar (se existe lançamento similar)

```typescript
await fetch(
  `${API_URL}/financial/ofx/reconcile/${systemTransactionId}?companyId=${companyId}`,
  {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ofxFitId: '20240115001'
    })
  }
);
```

### 3. Opção B: Criar Novo Lançamento (nova funcionalidade)

```typescript
await fetch(
  `${API_URL}/financial/ofx/create-transaction`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ofxFitId: '20240115001',
      companyId: companyId,
      bankAccountId: bankAccountId,
      type: 'DESPESA',
      transactionType: 'PIX',
      categoryId: selectedCategory,
      description: 'Taxa bancária',
      notes: 'Observação adicional'
    })
  }
);
```

## 🎨 Exemplo de Interface React

```tsx
import React, { useState } from 'react';

interface OFXTransaction {
  fitId: string;
  name: string;
  amount: number;
  datePosted: string;
  memo?: string;
}

interface OFXTransactionItemProps {
  transaction: OFXTransaction;
  companyId: string;
  bankAccountId: string;
  onSuccess: () => void;
}

export function OFXTransactionItem({
  transaction,
  companyId,
  bankAccountId,
  onSuccess,
}: OFXTransactionItemProps) {
  const [action, setAction] = useState<'none' | 'reconcile' | 'create'>('none');
  const [formData, setFormData] = useState({
    type: transaction.amount > 0 ? 'RECEITA' : 'DESPESA',
    transactionType: 'PIX',
    categoryId: '',
    description: transaction.name,
    notes: transaction.memo || '',
  });

  const handleCreateTransaction = async () => {
    try {
      const response = await fetch('/api/financial/ofx/create-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          ofxFitId: transaction.fitId,
          companyId,
          bankAccountId,
          ...formData,
        }),
      });

      if (response.ok) {
        alert('Lançamento criado com sucesso!');
        onSuccess();
      } else {
        const error = await response.json();
        alert(`Erro: ${error.message}`);
      }
    } catch (error) {
      console.error('Erro ao criar lançamento:', error);
      alert('Erro ao criar lançamento');
    }
  };

  return (
    <div className="ofx-transaction-item">
      <div className="transaction-info">
        <h4>{transaction.name}</h4>
        <p>Valor: R$ {transaction.amount.toFixed(2)}</p>
        <p>Data: {new Date(transaction.datePosted).toLocaleDateString()}</p>
        {transaction.memo && <p>Memo: {transaction.memo}</p>}
      </div>

      <div className="action-selector">
        <button onClick={() => setAction('reconcile')}>
          Conciliar com Existente
        </button>
        <button onClick={() => setAction('create')}>
          Criar Novo Lançamento
        </button>
        <button onClick={() => setAction('none')}>
          Ignorar
        </button>
      </div>

      {action === 'create' && (
        <div className="create-form">
          <h5>Criar Novo Lançamento</h5>
          
          <label>
            Tipo:
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
            >
              <option value="RECEITA">Receita</option>
              <option value="DESPESA">Despesa</option>
            </select>
          </label>

          <label>
            Forma de Pagamento:
            <select
              value={formData.transactionType}
              onChange={(e) => setFormData({ ...formData, transactionType: e.target.value })}
            >
              <option value="PIX">PIX</option>
              <option value="TRANSFERENCIA">Transferência</option>
              <option value="BOLETO">Boleto</option>
              <option value="CARTAO_CREDITO">Cartão de Crédito</option>
              <option value="CARTAO_DEBITO">Cartão de Débito</option>
              <option value="DINHEIRO">Dinheiro</option>
              <option value="CHEQUE">Cheque</option>
              <option value="OUTROS">Outros</option>
            </select>
          </label>

          <label>
            Descrição:
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </label>

          <label>
            Observações:
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </label>

          <button onClick={handleCreateTransaction}>
            Criar Lançamento
          </button>
        </div>
      )}
    </div>
  );
}
```

## 💡 Casos de Uso

### 1. Taxa Bancária

```json
{
  "ofxFitId": "20240115001",
  "type": "DESPESA",
  "transactionType": "TRANSFERENCIA",
  "categoryId": "uuid-taxa-bancaria",
  "description": "Taxa de manutenção conta"
}
```

### 2. Recebimento Não Registrado

```json
{
  "ofxFitId": "20240116002",
  "type": "RECEITA",
  "transactionType": "PIX",
  "categoryId": "uuid-vendas",
  "description": "Venda avulsa",
  "notes": "Cliente João Silva"
}
```

### 3. Pagamento de Fornecedor

```json
{
  "ofxFitId": "20240117003",
  "type": "DESPESA",
  "transactionType": "BOLETO",
  "categoryId": "uuid-fornecedores",
  "centroCustoId": "uuid-producao",
  "description": "Fornecedor XYZ Ltda"
}
```

## ✅ Vantagens

1. **Rapidez**: Cria lançamento direto a partir do extrato
2. **Dados automáticos**: Valor, data e descrição vindos do OFX
3. **Já conciliado**: Lançamento criado já fica conciliado
4. **Flexibilidade**: Usuário pode ajustar categoria, centro de custo, descrição
5. **Rastreabilidade**: Mantém referência ao FITID do OFX

## ⚠️ Observações Importantes

1. **Não permite duplicação**: Se já existe um lançamento com o mesmo FITID, retorna erro
2. **Conciliação automática**: O lançamento criado já fica marcado como conciliado
3. **Atualiza contadores**: Incrementa o `reconciledCount` do extrato OFX
4. **Valor líquido**: Despesas são gravadas como valores negativos, receitas como positivos

---

📅 Criado em: 17/11/2025
🔖 Versão: 1.0
