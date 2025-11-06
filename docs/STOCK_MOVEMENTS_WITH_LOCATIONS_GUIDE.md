# Guia Completo - Movimentações de Estoque com Locais

**Data**: 4 de novembro de 2025  
**Versão da API**: 1.4.0  
**Para**: Desenvolvimento Frontend

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Fluxo Completo](#fluxo-completo)
3. [Endpoints](#endpoints)
4. [Exemplos Práticos](#exemplos-práticos)
5. [Componentes React Sugeridos](#componentes-react-sugeridos)
6. [Tratamento de Erros](#tratamento-de-erros)

---

## 🎯 Visão Geral

### Como Funciona o Sistema de Estoque

```
┌─────────────────────────────────────────────────┐
│  PRODUTO                                        │
│  ├─ currentStock: 100 (estoque total)          │
│  └─ Estoque por Local:                         │
│     ├─ Depósito Central: 70 un                 │
│     ├─ Loja Shopping: 20 un                    │
│     └─ Loja Centro: 10 un                      │
└─────────────────────────────────────────────────┘
```

### Conceitos Importantes

- **Estoque Total**: Soma de todos os estoques nos locais
- **Estoque por Local**: Quantidade específica em cada local
- **Movimentação**: SEMPRE vinculada a um local específico
- **Transferência**: Move estoque ENTRE locais
- **Documento**: Pode ser vinculado para comprovação (NF, recibo, etc)

---

## 🔄 Fluxo Completo

### 1️⃣ Setup Inicial (Primeira vez)

```typescript
// Passo 1: Criar locais de estoque
const deposito = await api.post('/products/stock-locations', {
  name: 'Depósito Central',
  code: 'DEP-01',
  description: 'Depósito principal da empresa',
  address: 'Rua Principal, 123 - Centro',
  isDefault: true,  // ✅ Local padrão
  active: true
});

const loja1 = await api.post('/products/stock-locations', {
  name: 'Loja Shopping Center',
  code: 'LOJA-01',
  address: 'Shopping Center, Loja 234',
  active: true
});

const loja2 = await api.post('/products/stock-locations', {
  name: 'Loja Centro',
  code: 'LOJA-02',
  address: 'Av. Central, 567',
  active: true
});

console.log('✅ Locais criados com sucesso!');
```

---

### 2️⃣ Criar Produto com Estoque em Múltiplos Locais

```typescript
const product = await api.post('/products', {
  name: 'Notebook Dell Inspiron 15',
  sku: 'DELL-NB-001',
  barcode: '7891234567890',
  salePrice: 3500,
  costPrice: 2500,
  manageStock: true,
  unitId: unitId,
  categoryId: categoryId,
  
  // ✅ Estoque inicial em múltiplos locais
  initialStockByLocations: [
    {
      locationId: deposito.data.id,
      quantity: 100  // 100 unidades no depósito
    },
    {
      locationId: loja1.data.id,
      quantity: 20   // 20 unidades na loja shopping
    },
    {
      locationId: loja2.data.id,
      quantity: 15   // 15 unidades na loja centro
    }
  ]
});

console.log('Produto criado!');
console.log('Estoque Total:', product.data.currentStock); // 135
```

---

### 3️⃣ Adicionar Estoque (Entrada)

```typescript
// Exemplo: Compra de fornecedor chegou no depósito

// Opção A: Com documento (nota fiscal)
const nf = await api.post('/documents/upload', {
  file: arquivoNotaFiscal,
  folderId: folderId
});

const movement = await api.post(`/products/${productId}/stock-movement`, {
  type: 'ENTRY',
  quantity: 50,
  locationId: deposito.data.id,  // ✅ OBRIGATÓRIO
  reason: 'Compra do fornecedor XYZ',
  reference: 'NF-12345',
  documentId: nf.data.id,  // ✅ Vincula nota fiscal
  notes: 'Chegada prevista estava correta'
});

// Opção B: Sem documento
const movement2 = await api.post(`/products/${productId}/stock-movement`, {
  type: 'ENTRY',
  quantity: 30,
  locationId: loja1.data.id,
  reason: 'Reposição manual',
  reference: 'REP-001'
});

console.log('✅ Estoque adicionado!');
console.log('Novo estoque no local:', movement.data.newStock);
```

---

### 4️⃣ Remover Estoque (Saída)

```typescript
// Exemplo: Venda de produto na loja

const sale = await api.post(`/products/${productId}/stock-movement`, {
  type: 'EXIT',
  quantity: 2,
  locationId: loja1.data.id,  // Saída da loja shopping
  reason: 'Venda - Pedido #12345',
  reference: 'PEDIDO-12345'
});

console.log('✅ Estoque removido!');
console.log('Estoque anterior:', sale.data.previousStock);
console.log('Novo estoque:', sale.data.newStock);
```

---

### 5️⃣ Transferir Entre Locais

```typescript
// Passo 1: Criar solicitação de transferência
const transfer = await api.post('/products/stock-transfers', {
  fromLocationId: deposito.data.id,  // Do depósito
  toLocationId: loja1.data.id,       // Para loja shopping
  items: [
    {
      productId: product1.id,
      quantity: 10,
      notes: 'Reposição semanal'
    },
    {
      productId: product2.id,
      quantity: 5
    }
  ],
  notes: 'Transferência semanal programada',
  documentId: guiaTransferenciaId  // ✅ Opcional
});

console.log('Transferência criada:', transfer.data.code); // TRANS-000001
console.log('Status:', transfer.data.status); // PENDING

// Passo 2: Aprovar transferência
await api.patch(`/products/stock-transfers/${transfer.data.id}/approve`);
console.log('Status: IN_TRANSIT');

// Passo 3: Completar transferência (movimenta estoque)
await api.patch(`/products/stock-transfers/${transfer.data.id}/complete`);
console.log('Status: COMPLETED');
console.log('✅ Estoque transferido!');
```

---

### 6️⃣ Consultar Estoque

```typescript
// Ver estoque de um produto em todos os locais
const stockData = await api.get(`/products/${productId}/stock-by-location`);

console.log(`${stockData.data.product.name}`);
console.log(`Estoque Total: ${stockData.data.product.totalStock} unidades\n`);

console.log('Por Local:');
stockData.data.stocksByLocation.forEach(stock => {
  console.log(`  ${stock.location.name} (${stock.location.code}): ${stock.quantity} un`);
});

// Output:
// Notebook Dell Inspiron 15
// Estoque Total: 173 unidades
//
// Por Local:
//   Depósito Central (DEP-01): 140 un
//   Loja Shopping (LOJA-01): 23 un
//   Loja Centro (LOJA-02): 10 un
```

---

## 🔌 Endpoints

### Movimentações de Estoque

#### Adicionar Movimentação

```http
POST /products/:productId/stock-movement
```

**Body**:
```json
{
  "type": "ENTRY" | "EXIT" | "ADJUSTMENT" | "RETURN" | "LOSS",
  "quantity": 50,
  "locationId": "uuid",  // ✅ OBRIGATÓRIO
  "reason": "Motivo da movimentação",
  "notes": "Observações adicionais",
  "reference": "NF-12345",
  "documentId": "uuid"   // ✅ OPCIONAL - Vincula documento
}
```

**Tipos de Movimentação**:
- `ENTRY`: Entrada (compra, devolução de venda)
- `EXIT`: Saída (venda, transferência)
- `ADJUSTMENT`: Ajuste manual de estoque
- `RETURN`: Devolução (cliente devolveu)
- `LOSS`: Perda (dano, roubo, vencimento)

**Resposta** (201 Created):
```json
{
  "id": "uuid",
  "productId": "uuid",
  "type": "ENTRY",
  "quantity": 50,
  "previousStock": 100,
  "newStock": 150,
  "locationId": "uuid",
  "location": {
    "id": "uuid",
    "name": "Depósito Central",
    "code": "DEP-01"
  },
  "reason": "Compra do fornecedor XYZ",
  "reference": "NF-12345",
  "documentId": "uuid",
  "document": {
    "id": "uuid",
    "name": "nota-fiscal-12345.pdf",
    "documentType": "nota_fiscal"
  },
  "userId": "uuid",
  "createdAt": "2025-11-04T10:00:00.000Z"
}
```

---

#### Histórico de Movimentações

```http
GET /products/:productId/stock-history?limit=50
```

**Resposta**:
```json
[
  {
    "id": "uuid",
    "type": "ENTRY",
    "quantity": 50,
    "previousStock": 100,
    "newStock": 150,
    "location": {
      "name": "Depósito Central",
      "code": "DEP-01"
    },
    "reason": "Compra fornecedor",
    "reference": "NF-12345",
    "documentId": "uuid",
    "createdAt": "2025-11-04T10:00:00.000Z"
  }
]
```

---

### Transferências

#### Criar Transferência

```http
POST /products/stock-transfers
```

**Body**:
```json
{
  "fromLocationId": "uuid",
  "toLocationId": "uuid",
  "items": [
    {
      "productId": "uuid",
      "quantity": 10,
      "notes": "Observação do item"
    }
  ],
  "notes": "Observações gerais",
  "documentId": "uuid"  // ✅ OPCIONAL - Guia de transferência
}
```

---

#### Listar Transferências

```http
GET /products/stock-transfers
GET /products/stock-transfers?status=PENDING
```

**Status**:
- `PENDING`: Aguardando aprovação
- `IN_TRANSIT`: Aprovada, em trânsito
- `COMPLETED`: Completada (estoque movimentado)
- `CANCELLED`: Cancelada

---

#### Aprovar Transferência

```http
PATCH /products/stock-transfers/:id/approve
```

---

#### Completar Transferência

```http
PATCH /products/stock-transfers/:id/complete
```

---

#### Cancelar Transferência

```http
PATCH /products/stock-transfers/:id/cancel
```

---

### Locais de Estoque

#### Criar Local

```http
POST /products/stock-locations
```

**Body**:
```json
{
  "name": "Depósito Central",
  "code": "DEP-01",
  "description": "Depósito principal",
  "address": "Rua Principal, 123",
  "isDefault": true,
  "active": true
}
```

---

#### Listar Locais

```http
GET /products/stock-locations
```

**Resposta**:
```json
[
  {
    "id": "uuid",
    "name": "Depósito Central",
    "code": "DEP-01",
    "description": "Depósito principal",
    "address": "Rua Principal, 123",
    "isDefault": true,
    "active": true,
    "_count": {
      "productStocks": 150,
      "stockMovements": 542
    },
    "createdAt": "2025-11-04T10:00:00.000Z"
  }
]
```

---

## 💻 Componentes React Sugeridos

### StockMovementForm.tsx

```tsx
import React, { useState, useEffect } from 'react';
import { api } from './api';

interface Props {
  productId: string;
  onSuccess?: () => void;
}

export function StockMovementForm({ productId, onSuccess }: Props) {
  const [locations, setLocations] = useState([]);
  const [formData, setFormData] = useState({
    type: 'ENTRY',
    quantity: 0,
    locationId: '',
    reason: '',
    notes: '',
    reference: '',
    documentId: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadLocations();
  }, []);

  async function loadLocations() {
    const response = await api.get('/products/stock-locations');
    setLocations(response.data);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post(`/products/${productId}/stock-movement`, formData);
      alert('Movimentação registrada com sucesso!');
      onSuccess?.();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao registrar movimentação');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3>Nova Movimentação de Estoque</h3>

      <div>
        <label>Tipo de Movimentação:</label>
        <select
          value={formData.type}
          onChange={e => setFormData({ ...formData, type: e.target.value })}
          required
        >
          <option value="ENTRY">Entrada</option>
          <option value="EXIT">Saída</option>
          <option value="ADJUSTMENT">Ajuste</option>
          <option value="RETURN">Devolução</option>
          <option value="LOSS">Perda</option>
        </select>
      </div>

      <div>
        <label>Local de Estoque: *</label>
        <select
          value={formData.locationId}
          onChange={e => setFormData({ ...formData, locationId: e.target.value })}
          required
        >
          <option value="">Selecione o local...</option>
          {locations.map((loc: any) => (
            <option key={loc.id} value={loc.id}>
              {loc.code} - {loc.name}
              {loc.isDefault && ' (Padrão)'}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Quantidade: *</label>
        <input
          type="number"
          min="0.001"
          step="0.001"
          value={formData.quantity}
          onChange={e => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
          required
        />
      </div>

      <div>
        <label>Motivo: *</label>
        <input
          type="text"
          value={formData.reason}
          onChange={e => setFormData({ ...formData, reason: e.target.value })}
          placeholder="Ex: Compra do fornecedor XYZ"
          required
        />
      </div>

      <div>
        <label>Referência:</label>
        <input
          type="text"
          value={formData.reference}
          onChange={e => setFormData({ ...formData, reference: e.target.value })}
          placeholder="Ex: NF-12345"
        />
      </div>

      <div>
        <label>Observações:</label>
        <textarea
          value={formData.notes}
          onChange={e => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
        />
      </div>

      <div>
        <label>Documento (Opcional):</label>
        <input
          type="text"
          value={formData.documentId}
          onChange={e => setFormData({ ...formData, documentId: e.target.value })}
          placeholder="ID do documento (nota fiscal, recibo, etc)"
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Registrando...' : 'Registrar Movimentação'}
      </button>
    </form>
  );
}
```

---

### StockByLocationCard.tsx

```tsx
interface Props {
  productId: string;
}

export function StockByLocationCard({ productId }: Props) {
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStockData();
  }, [productId]);

  async function loadStockData() {
    try {
      const response = await api.get(`/products/${productId}/stock-by-location`);
      setStockData(response.data);
    } catch (error) {
      console.error('Erro ao carregar estoque:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div>Carregando...</div>;
  if (!stockData) return <div>Sem dados</div>;

  return (
    <div className="stock-card">
      <h3>{stockData.product.name}</h3>
      <div className="total-stock">
        <strong>Estoque Total:</strong> {stockData.product.totalStock} unidades
      </div>

      <h4>Por Local:</h4>
      <table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Local</th>
            <th>Quantidade</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {stockData.stocksByLocation.map((stock: any) => (
            <tr key={stock.id}>
              <td>{stock.location.code}</td>
              <td>{stock.location.name}</td>
              <td>{stock.quantity} un</td>
              <td>
                {stock.location.active ? (
                  <span className="badge badge-success">Ativo</span>
                ) : (
                  <span className="badge badge-secondary">Inativo</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={loadStockData}>Atualizar</button>
    </div>
  );
}
```

---

### TransferForm.tsx

```tsx
export function TransferForm() {
  const [locations, setLocations] = useState([]);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    fromLocationId: '',
    toLocationId: '',
    items: [{ productId: '', quantity: 0, notes: '' }],
    notes: '',
    documentId: ''
  });

  useEffect(() => {
    loadLocations();
    loadProducts();
  }, []);

  async function loadLocations() {
    const response = await api.get('/products/stock-locations');
    setLocations(response.data);
  }

  async function loadProducts() {
    const response = await api.get('/products?active=true&manageStock=true');
    setProducts(response.data.products);
  }

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { productId: '', quantity: 0, notes: '' }]
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItem = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (formData.fromLocationId === formData.toLocationId) {
      alert('Local de origem e destino não podem ser iguais');
      return;
    }

    try {
      const response = await api.post('/products/stock-transfers', formData);
      alert(`Transferência ${response.data.code} criada com sucesso!`);
      // Redirecionar ou limpar form
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao criar transferência');
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Nova Transferência de Estoque</h2>

      <div>
        <label>De (Origem): *</label>
        <select
          value={formData.fromLocationId}
          onChange={e => setFormData({ ...formData, fromLocationId: e.target.value })}
          required
        >
          <option value="">Selecione...</option>
          {locations.map((loc: any) => (
            <option key={loc.id} value={loc.id}>
              {loc.code} - {loc.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Para (Destino): *</label>
        <select
          value={formData.toLocationId}
          onChange={e => setFormData({ ...formData, toLocationId: e.target.value })}
          required
        >
          <option value="">Selecione...</option>
          {locations.map((loc: any) => (
            <option key={loc.id} value={loc.id}>
              {loc.code} - {loc.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <h3>Produtos</h3>
        {formData.items.map((item, index) => (
          <div key={index} className="transfer-item">
            <select
              value={item.productId}
              onChange={e => updateItem(index, 'productId', e.target.value)}
              required
            >
              <option value="">Selecione o produto...</option>
              {products.map((prod: any) => (
                <option key={prod.id} value={prod.id}>
                  {prod.sku} - {prod.name}
                </option>
              ))}
            </select>

            <input
              type="number"
              min="0.001"
              step="0.001"
              value={item.quantity}
              onChange={e => updateItem(index, 'quantity', parseFloat(e.target.value))}
              placeholder="Quantidade"
              required
            />

            <input
              type="text"
              value={item.notes}
              onChange={e => updateItem(index, 'notes', e.target.value)}
              placeholder="Observações"
            />

            {formData.items.length > 1 && (
              <button type="button" onClick={() => removeItem(index)}>
                ✕ Remover
              </button>
            )}
          </div>
        ))}

        <button type="button" onClick={addItem}>
          + Adicionar Produto
        </button>
      </div>

      <div>
        <label>Observações:</label>
        <textarea
          value={formData.notes}
          onChange={e => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
        />
      </div>

      <div>
        <label>Documento (Guia de Transferência):</label>
        <input
          type="text"
          value={formData.documentId}
          onChange={e => setFormData({ ...formData, documentId: e.target.value })}
          placeholder="ID do documento"
        />
      </div>

      <button type="submit">Criar Transferência</button>
    </form>
  );
}
```

---

## 🆘 Tratamento de Erros

### Erro: Local não informado

```json
{
  "message": ["locationId must be a UUID"],
  "error": "Bad Request",
  "statusCode": 400
}
```

**Solução**: Sempre informar `locationId` nas movimentações.

---

### Erro: Estoque insuficiente

```json
{
  "message": "Estoque insuficiente no local \"Loja Shopping\". Disponível: 5",
  "error": "Bad Request",
  "statusCode": 400
}
```

**Solução**: Verificar estoque disponível antes de criar movimentação de saída.

---

### Erro: Documento não encontrado

```json
{
  "message": "Documento não encontrado",
  "error": "Not Found",
  "statusCode": 404
}
```

**Solução**: Verificar se o `documentId` está correto e pertence à empresa.

---

## 📎 Upload de Documentos

### Visão Geral

Movimentações e transferências podem ter documentos anexados (notas fiscais, guias, etc).

### Estrutura de Pastas Recomendada

```
📁 Documentos
  └─ 📁 Estoque
      ├─ 📁 Movimentações
      │   └─ 📁 2025
      │       ├─ 📁 Janeiro
      │       ├─ 📁 Fevereiro
      │       └─ ...
      └─ 📁 Transferências
          └─ 📁 2025
              ├─ 📁 Janeiro
              ├─ 📁 Fevereiro
              └─ ...
```

### Fluxo de Upload

1. **Upload do documento** no hub de documentos
2. **Receber documentId** na resposta
3. **Criar movimentação/transferência** com o `documentId`

### Exemplo Completo: Entrada com Nota Fiscal

```typescript
async function createEntryWithInvoice(productId: string, file: File) {
  try {
    // 1. Buscar pasta de movimentações do mês atual
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.toLocaleString('pt-BR', { month: 'long' });
    
    const folder = await api.get('/documents/folders', {
      params: {
        path: `Estoque/Movimentações/${year}/${month}`
      }
    });

    // 2. Upload da nota fiscal
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folderId', folder.data[0].id);
    formData.append('documentType', 'nota_fiscal_entrada');
    formData.append('description', 'Nota fiscal de compra');

    const uploadResponse = await api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    const documentId = uploadResponse.data.id;

    // 3. Criar movimentação com documento vinculado
    const movement = await api.post(`/products/${productId}/stock-movement`, {
      type: 'ENTRY',
      quantity: 50,
      locationId: depositoId,
      reason: 'Compra do fornecedor XYZ',
      reference: 'NF-12345',
      documentId // ✅ Vincula o documento
    });

    console.log('✅ Entrada registrada com nota fiscal!');
    return movement.data;

  } catch (error) {
    console.error('Erro:', error);
    throw error;
  }
}
```

### Exemplo: Transferência com Guia de Remessa

```typescript
async function createTransferWithGuide(file: File, transferData: any) {
  try {
    // 1. Buscar pasta de transferências
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.toLocaleString('pt-BR', { month: 'long' });
    
    const folder = await api.get('/documents/folders', {
      params: {
        path: `Estoque/Transferências/${year}/${month}`
      }
    });

    // 2. Upload da guia
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folderId', folder.data[0].id);
    formData.append('documentType', 'guia_transferencia');
    formData.append('description', 'Guia de transferência entre locais');

    const uploadResponse = await api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    // 3. Criar transferência com documento
    const transfer = await api.post('/products/stock-transfers', {
      ...transferData,
      documentId: uploadResponse.data.id
    });

    console.log('✅ Transferência criada com guia!');
    return transfer.data;

  } catch (error) {
    console.error('Erro:', error);
    throw error;
  }
}
```

### Visualizar Documento da Movimentação

```typescript
function MovementWithDocument({ movement }) {
  async function viewDocument() {
    if (!movement.documentId) return;

    const doc = await api.get(`/documents/${movement.documentId}`);
    
    // Abrir em nova aba
    window.open(doc.data.fileUrl, '_blank');
  }

  return (
    <div>
      <h3>Movimentação #{movement.id}</h3>
      <p>Tipo: {movement.type}</p>
      <p>Quantidade: {movement.quantity}</p>
      
      {movement.documentId && (
        <div>
          <h4>📎 Documento Anexado</h4>
          <p>{movement.document.name}</p>
          <button onClick={viewDocument}>
            📥 Visualizar Documento
          </button>
        </div>
      )}
    </div>
  );
}
```

### Componente de Upload

```tsx
function StockMovementForm() {
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    type: 'ENTRY',
    quantity: 0,
    locationId: '',
    reason: '',
    reference: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (file) {
      await createEntryWithInvoice(productId, file);
    } else {
      // Criar sem documento
      await api.post(`/products/${productId}/stock-movement`, formData);
    }

    alert('Movimentação registrada!');
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Campos do formulário... */}
      
      <div>
        <label>📎 Anexar Documento (Opcional):</label>
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => e.target.files && setFile(e.target.files[0])}
        />
        {file && <p>✅ {file.name}</p>}
      </div>

      <button type="submit">Registrar</button>
    </form>
  );
}
```

### Tipos de Documentos Recomendados

| Movimentação | Documento | documentType |
|--------------|-----------|--------------|
| ENTRY | Nota Fiscal de Compra | `nota_fiscal_entrada` |
| EXIT | Nota Fiscal de Venda | `nota_fiscal_saida` |
| ADJUSTMENT | Termo de Ajuste | `termo_ajuste` |
| RETURN | Nota de Devolução | `nota_devolucao` |
| LOSS | Laudo de Perda | `laudo_perda` |
| TRANSFER | Guia de Remessa | `guia_transferencia` |

### Documentação Completa

Para detalhes sobre estrutura de pastas e melhores práticas, consulte:
📚 `/docs/STOCK_DOCUMENTS_UPLOAD_GUIDE.md`

---

## ✅ Checklist de Implementação Frontend

### Obrigatório
- [ ] Criar formulário de movimentação com campo `locationId`
- [ ] Listar locais disponíveis no select
- [ ] Validar quantidade antes de enviar
- [ ] Mostrar mensagens de erro amigáveis
- [ ] Atualizar visualização após movimentação

### Recomendado
- [ ] Upload de documento no formulário de movimentação
- [ ] Visualização de documento vinculado no histórico
- [ ] Filtro de histórico por local
- [ ] Dashboard com estoque por local
- [ ] Alertas de estoque baixo por local
- [ ] Gráficos de movimentações por local
- [ ] Estrutura de pastas automática para documentos
- [ ] Preview de documentos PDF
- [ ] Download em lote de documentos

---

## 📞 Suporte

Para dúvidas:
- Consulte `/docs/API_PRODUCTS.md` para referência completa da API
- Consulte `/docs/STOCK_LOCATIONS_FRONTEND_UPDATE.md` para detalhes de locais
- Consulte `/docs/STOCK_DOCUMENTS_UPLOAD_GUIDE.md` para upload de documentos

**Última Atualização**: 04/11/2025
