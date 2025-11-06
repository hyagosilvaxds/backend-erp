# API Endpoints - Guia para Cliente

**Data**: 5 de novembro de 2025  
**Versão**: 1.0  
**Base URL**: `/api` (ajustar conforme ambiente)

## 📋 Índice

1. [Autenticação](#autenticação)
2. [Produtos](#produtos)
3. [Locais de Estoque](#locais-de-estoque)
4. [Movimentações de Estoque](#movimentações-de-estoque)
5. [Transferências de Estoque](#transferências-de-estoque)
6. [Documentos](#documentos)
7. [Categorias, Unidades e Marcas](#categorias-unidades-e-marcas)
8. [Códigos de Erro](#códigos-de-erro)

---

## 🔐 Autenticação

Todos os endpoints requerem autenticação JWT. Inclua o token no header:

```http
Authorization: Bearer {seu-token-jwt}
```

O token deve conter:
- `userId`: ID do usuário
- `companyId`: ID da empresa atual

---

## 📦 Produtos

### 1. Listar Produtos

```http
GET /products
```

**Query Parameters**:
```typescript
{
  search?: string;          // Busca por nome, código, SKU, EAN
  categoryId?: string;      // Filtrar por categoria
  brandId?: string;         // Filtrar por marca
  isActive?: boolean;       // true ou false
  manageStock?: boolean;    // Produtos que gerenciam estoque
  page?: number;            // Página (padrão: 1)
  limit?: number;           // Itens por página (padrão: 20)
}
```

**Exemplo**:
```javascript
const response = await fetch('/products?search=Notebook&page=1&limit=20', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { data, total, page, limit } = await response.json();
```

**Resposta**:
```json
{
  "data": [
    {
      "id": "abc-123",
      "name": "Notebook Dell",
      "sku": "NB-DELL-001",
      "ean": "7891234567890",
      "currentStock": 15,
      "salePrice": 3500.00,
      "category": { "id": "cat-1", "name": "Eletrônicos" },
      "brand": { "id": "brand-1", "name": "Dell" },
      "isActive": true
    }
  ],
  "total": 45,
  "page": 1,
  "limit": 20
}
```

---

### 2. Buscar Produto por ID

```http
GET /products/:id
```

**Retorna**: Produto completo com estoque por local

**Exemplo**:
```javascript
const response = await fetch('/products/abc-123', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const product = await response.json();
```

**Resposta**:
```json
{
  "id": "abc-123",
  "name": "Notebook Dell",
  "sku": "NB-DELL-001",
  "currentStock": 15,
  "salePrice": 3500.00,
  "costPrice": 2800.00,
  
  "stocksByLocation": [
    {
      "id": "stock-1",
      "quantity": 10,
      "location": {
        "id": "loc-1",
        "name": "Armazém Principal",
        "code": "ARM-01"
      }
    },
    {
      "id": "stock-2",
      "quantity": 5,
      "location": {
        "id": "loc-2",
        "name": "Loja Centro",
        "code": "LJ-CENTRO"
      }
    }
  ],
  
  "category": { "id": "cat-1", "name": "Eletrônicos" },
  "brand": { "id": "brand-1", "name": "Dell" },
  "unit": { "id": "unit-1", "symbol": "UN", "name": "Unidade" },
  
  "photos": [
    {
      "id": "photo-1",
      "isPrimary": true,
      "document": {
        "id": "doc-1",
        "fileName": "notebook.jpg",
        "fileUrl": "/uploads/products/notebook.jpg"
      }
    }
  ]
}
```

---

### 3. Criar Produto

```http
POST /products
```

**Permissão Necessária**: `products.create`

**Body**:
```json
{
  "name": "Notebook Dell Inspiron 15",
  "sku": "NB-DELL-INS15",
  "ean": "7891234567890",
  "description": "Notebook i5, 8GB RAM, SSD 256GB",
  
  "categoryId": "cat-1",
  "brandId": "brand-1",
  "unitId": "unit-1",
  
  "costPrice": 2800.00,
  "salePrice": 3500.00,
  "salePriceCash": 3300.00,
  "minPrice": 3000.00,
  
  "manageStock": true,
  "initialStockByLocations": [
    {
      "locationId": "loc-1",
      "quantity": 10
    },
    {
      "locationId": "loc-2",
      "quantity": 5
    }
  ],
  
  "cfopEstadual": "5102",
  "cfopInterestadual": "6102",
  "tipoItemSped": "00",
  "tipoProduto": "PRODUTO",
  
  "ncm": "84713012",
  "cest": "2100100",
  "origin": "0",
  
  "icmsCst": "00",
  "icmsRate": 18.00,
  "pisCst": "01",
  "pisRate": 1.65,
  "cofinsCst": "01",
  "cofinsRate": 7.6,
  
  "isActive": true
}
```

**Resposta**: Produto criado (status 201)

---

### 4. Atualizar Produto

```http
PATCH /products/:id
```

**Permissão Necessária**: `products.update`

**Body**: Mesmos campos do POST (todos opcionais)

---

### 5. Deletar Produto

```http
DELETE /products/:id
```

**Permissão Necessária**: `products.delete`

**Resposta**: Status 204 (sem conteúdo)

---

### 6. Estatísticas de Produtos

```http
GET /products/stats
```

**Resposta**:
```json
{
  "totalProducts": 245,
  "activeProducts": 230,
  "inactiveProducts": 15,
  "productsWithStock": 180,
  "productsWithoutStock": 50,
  "productsLowStock": 12,
  "totalStockValue": 485000.50
}
```

---

### 7. Produtos com Estoque Baixo

```http
GET /products/low-stock
```

**Resposta**:
```json
[
  {
    "id": "prod-1",
    "name": "Mouse Logitech",
    "sku": "MS-LOG-001",
    "currentStock": 3,
    "minStock": 10,
    "stocksByLocation": [
      {
        "location": { "name": "Armazém Principal" },
        "quantity": 3
      }
    ]
  }
]
```

---

### 8. Listagem Completa de Estoque

```http
GET /products/stock
```

**Query Parameters**:
```typescript
{
  locationId?: string;  // Filtrar por local específico
}
```

**Resposta**:
```json
[
  {
    "product": {
      "id": "prod-1",
      "name": "Notebook Dell",
      "sku": "NB-DELL-001"
    },
    "location": {
      "id": "loc-1",
      "name": "Armazém Principal",
      "code": "ARM-01"
    },
    "quantity": 10
  },
  {
    "product": {
      "id": "prod-1",
      "name": "Notebook Dell",
      "sku": "NB-DELL-001"
    },
    "location": {
      "id": "loc-2",
      "name": "Loja Centro",
      "code": "LJ-CENTRO"
    },
    "quantity": 5
  }
]
```

---

## 📍 Locais de Estoque

### 1. Listar Locais

```http
GET /products/stock-locations
```

**Query Parameters**:
```typescript
{
  active?: boolean;  // Filtrar por status ativo/inativo
}
```

**Resposta**:
```json
[
  {
    "id": "loc-1",
    "name": "Armazém Principal",
    "code": "ARM-01",
    "description": "Armazém central para produtos",
    "address": "Rua A, 123",
    "isDefault": true,
    "active": true,
    "productsCount": 45,
    "createdAt": "2025-01-15T10:00:00Z"
  }
]
```

---

### 2. Buscar Local por ID

```http
GET /products/stock-locations/:id
```

**Resposta**: Detalhes do local + produtos armazenados

```json
{
  "id": "loc-1",
  "name": "Armazém Principal",
  "code": "ARM-01",
  "active": true,
  "productStocks": [
    {
      "product": {
        "id": "prod-1",
        "name": "Notebook Dell",
        "sku": "NB-DELL-001"
      },
      "quantity": 10
    }
  ]
}
```

---

### 3. Criar Local de Estoque

```http
POST /products/stock-locations
```

**Permissão Necessária**: `products.manage_locations`

**Body**:
```json
{
  "name": "Armazém Principal",
  "code": "ARM-01",
  "description": "Armazém central",
  "address": "Rua A, 123 - Centro",
  "isDefault": true,
  "active": true
}
```

**Validações**:
- `code` deve ser único por empresa
- Apenas um local pode ser padrão (`isDefault: true`)

---

### 4. Atualizar Local

```http
PATCH /products/stock-locations/:id
```

**Permissão Necessária**: `products.manage_locations`

**Body**: Mesmos campos do POST (todos opcionais)

---

### 5. Deletar Local

```http
DELETE /products/stock-locations/:id
```

**Permissão Necessária**: `products.manage_locations`

**Restrições**:
- Não pode deletar local com estoque
- Não pode deletar local padrão

---

### 6. Estoque de um Produto por Local

```http
GET /products/:productId/stock-by-location
```

**Resposta**:
```json
[
  {
    "location": {
      "id": "loc-1",
      "name": "Armazém Principal",
      "code": "ARM-01"
    },
    "quantity": 10
  },
  {
    "location": {
      "id": "loc-2",
      "name": "Loja Centro",
      "code": "LJ-CENTRO"
    },
    "quantity": 5
  }
]
```

---

## 🔄 Movimentações de Estoque

### 1. Listar Movimentações de um Produto

```http
GET /products/:productId/stock-movements
```

**Query Parameters**:
```typescript
{
  type?: 'ENTRY' | 'EXIT' | 'ADJUSTMENT' | 'RETURN' | 'LOSS';
  locationId?: string;
  startDate?: string;  // ISO 8601
  endDate?: string;    // ISO 8601
}
```

**Resposta**:
```json
[
  {
    "id": "mov-1",
    "type": "ENTRY",
    "quantity": 50,
    "previousStock": 10,
    "newStock": 60,
    "location": {
      "id": "loc-1",
      "name": "Armazém Principal"
    },
    "document": {
      "id": "doc-1",
      "fileName": "nota_fiscal_001.pdf",
      "fileUrl": "/uploads/documents/estoque/movimentacoes/2025/novembro/nota_fiscal_001.pdf"
    },
    "user": {
      "id": "user-1",
      "name": "João Silva"
    },
    "reason": "Compra de fornecedor X",
    "notes": "NF 12345",
    "reference": "PEDIDO-001",
    "createdAt": "2025-11-05T14:30:00Z"
  }
]
```

---

### 2. Criar Movimentação de Estoque

```http
POST /products/:productId/stock-movement
```

**Permissão Necessária**: `products.manage_stock`

**Body**:
```json
{
  "type": "ENTRY",
  "quantity": 50,
  "locationId": "loc-1",
  "documentId": "doc-1",
  "reason": "Compra de fornecedor X",
  "notes": "Nota fiscal 12345",
  "reference": "PEDIDO-001"
}
```

**Tipos de Movimentação**:
- `ENTRY`: Entrada de estoque (compra, devolução de cliente)
- `EXIT`: Saída de estoque (venda, consumo)
- `ADJUSTMENT`: Ajuste (inventário, correção)
- `RETURN`: Retorno (devolução para fornecedor)
- `LOSS`: Perda (vencimento, dano, furto)

**Comportamento Automático com Documento**:
```javascript
// 1. Fazer upload do documento
const formData = new FormData();
formData.append('file', file);
formData.append('title', 'Nota Fiscal 12345');
formData.append('type', 'nota_fiscal_entrada');
formData.append('tags', JSON.stringify(['nf', 'compra']));

const uploadResponse = await fetch('/documents/upload', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
const { id: documentId } = await uploadResponse.json();

// 2. Criar movimentação com documento
// Sistema automaticamente:
// - Cria pasta "Estoque/Movimentações/2025/Novembro" (se não existir)
// - Move o documento para essa pasta
const movementResponse = await fetch(`/products/${productId}/stock-movement`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    type: 'ENTRY',
    quantity: 50,
    locationId: 'loc-1',
    documentId: documentId, // ← Sistema organiza automaticamente!
    reason: 'Compra de fornecedor X',
    notes: 'NF 12345'
  })
});
```

**Validações**:
- `locationId` é obrigatório
- `quantity` deve ser > 0
- Para EXIT e LOSS, verifica estoque disponível no local
- Se `documentId` fornecido, valida que documento existe

**Resposta**: Movimentação criada (status 201)

---

### 3. Fluxo Completo: Upload + Movimentação

**Componente React Exemplo**:
```typescript
const CreateStockEntry = () => {
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    quantity: 0,
    locationId: '',
    reason: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let documentId: string | undefined;
    
    // 1. Upload do documento (se houver)
    if (file) {
      const uploadForm = new FormData();
      uploadForm.append('file', file);
      uploadForm.append('title', `NF - ${formData.reason}`);
      uploadForm.append('type', 'nota_fiscal_entrada');
      
      const uploadRes = await fetch('/documents/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: uploadForm
      });
      
      const uploadData = await uploadRes.json();
      documentId = uploadData.id;
    }
    
    // 2. Criar movimentação
    const movementRes = await fetch(`/products/${productId}/stock-movement`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'ENTRY',
        quantity: formData.quantity,
        locationId: formData.locationId,
        documentId, // ← Sistema cria pastas automaticamente
        reason: formData.reason
      })
    });
    
    if (movementRes.ok) {
      alert('Entrada criada com sucesso!');
      // Sistema já organizou o documento em:
      // Estoque/Movimentações/2025/Novembro/
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="number"
        value={formData.quantity}
        onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
        placeholder="Quantidade"
      />
      
      <select
        value={formData.locationId}
        onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
      >
        <option value="">Selecione o local</option>
        {/* Carregar locais */}
      </select>
      
      <input
        type="text"
        value={formData.reason}
        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
        placeholder="Motivo"
      />
      
      <input
        type="file"
        accept=".pdf,.jpg,.png"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <small>Anexar nota fiscal (opcional)</small>
      
      <button type="submit">Criar Entrada</button>
    </form>
  );
};
```

---

## 🔀 Transferências de Estoque

### 1. Listar Transferências

```http
GET /products/stock-transfers
```

**Query Parameters**:
```typescript
{
  status?: 'PENDING' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED';
  fromLocationId?: string;
  toLocationId?: string;
  startDate?: string;
  endDate?: string;
}
```

**Resposta**:
```json
[
  {
    "id": "trans-1",
    "code": "TRANS-000001",
    "status": "IN_TRANSIT",
    "fromLocation": {
      "id": "loc-1",
      "name": "Armazém Principal",
      "code": "ARM-01"
    },
    "toLocation": {
      "id": "loc-2",
      "name": "Loja Centro",
      "code": "LJ-CENTRO"
    },
    "document": {
      "id": "doc-2",
      "fileName": "guia_transferencia_001.pdf"
    },
    "items": [
      {
        "id": "item-1",
        "product": {
          "id": "prod-1",
          "name": "Notebook Dell",
          "sku": "NB-DELL-001"
        },
        "quantity": 5
      }
    ],
    "requestedBy": { "name": "João Silva" },
    "approvedBy": { "name": "Maria Santos" },
    "createdAt": "2025-11-05T10:00:00Z",
    "approvedAt": "2025-11-05T10:30:00Z"
  }
]
```

---

### 2. Buscar Transferência por ID

```http
GET /products/stock-transfers/:id
```

**Resposta**: Transferência completa com todos os detalhes

---

### 3. Criar Transferência

```http
POST /products/stock-transfers
```

**Permissão Necessária**: `products.manage_transfers`

**Body**:
```json
{
  "fromLocationId": "loc-1",
  "toLocationId": "loc-2",
  "items": [
    {
      "productId": "prod-1",
      "quantity": 5,
      "notes": "Produto em bom estado"
    },
    {
      "productId": "prod-2",
      "quantity": 10
    }
  ],
  "documentId": "doc-2",
  "notes": "Transferência para reposição"
}
```

**Comportamento**:
- Status inicial: `PENDING`
- Gera código automático: `TRANS-XXXXXX`
- Valida estoque disponível no local de origem
- Se `documentId` fornecido:
  - Valida documento
  - Cria estrutura "Estoque/Transferências/YYYY/Mês" automaticamente
  - Move documento para pasta correta

**Resposta**: Transferência criada (status 201)

---

### 4. Aprovar Transferência

```http
PATCH /products/stock-transfers/:id/approve
```

**Permissão Necessária**: `products.approve_transfers`

**Body**: Vazio (sem body)

**Comportamento**:
- Muda status para `IN_TRANSIT`
- Registra quem aprovou e quando
- Bloqueia estoque no local de origem

**Resposta**: Transferência atualizada

---

### 5. Completar Transferência

```http
PATCH /products/stock-transfers/:id/complete
```

**Permissão Necessária**: `products.manage_transfers`

**Body**: Vazio (sem body)

**Comportamento**:
- Muda status para `COMPLETED`
- Remove estoque do local de origem
- Adiciona estoque no local de destino
- Cria movimentações de TRANSFER para cada item

**Resposta**: Transferência atualizada

---

### 6. Cancelar Transferência

```http
PATCH /products/stock-transfers/:id/cancel
```

**Permissão Necessária**: `products.manage_transfers`

**Body**:
```json
{
  "reason": "Motivo do cancelamento"
}
```

**Comportamento**:
- Muda status para `CANCELLED`
- Libera estoque bloqueado (se estava IN_TRANSIT)

**Resposta**: Transferência atualizada

---

### 7. Fluxo Completo de Transferência

```typescript
// 1. Upload da guia de transferência (opcional)
const guiaFile = /* arquivo PDF */;
const uploadForm = new FormData();
uploadForm.append('file', guiaFile);
uploadForm.append('title', 'Guia de Transferência ARM-01 → LJ-CENTRO');
uploadForm.append('type', 'guia_transferencia');

const uploadRes = await fetch('/documents/upload', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: uploadForm
});
const { id: documentId } = await uploadRes.json();

// 2. Criar transferência
const transferRes = await fetch('/products/stock-transfers', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    fromLocationId: 'loc-1',
    toLocationId: 'loc-2',
    items: [
      { productId: 'prod-1', quantity: 5 },
      { productId: 'prod-2', quantity: 10 }
    ],
    documentId, // ← Sistema organiza automaticamente
    notes: 'Reposição loja centro'
  })
});
const transfer = await transferRes.json();
// Status: PENDING
// Documento organizado em: Estoque/Transferências/2025/Novembro/

// 3. Aprovar transferência (usuário com permissão)
await fetch(`/products/stock-transfers/${transfer.id}/approve`, {
  method: 'PATCH',
  headers: { 'Authorization': `Bearer ${tokenManager}` }
});
// Status: IN_TRANSIT

// 4. Completar transferência (ao receber no destino)
await fetch(`/products/stock-transfers/${transfer.id}/complete`, {
  method: 'PATCH',
  headers: { 'Authorization': `Bearer ${token}` }
});
// Status: COMPLETED
// Estoque movido de ARM-01 para LJ-CENTRO
```

---

## 📄 Documentos

### 1. Upload de Documento

```http
POST /documents/upload
```

**Content-Type**: `multipart/form-data`

**Form Data**:
```typescript
{
  file: File;              // Arquivo (obrigatório)
  title: string;           // Título do documento
  description?: string;    // Descrição
  type?: string;           // Tipo (nota_fiscal_entrada, guia_transferencia, etc)
  tags?: string;           // JSON array de tags
  folderId?: string;       // Pasta destino (opcional)
}
```

**Exemplo**:
```javascript
const formData = new FormData();
formData.append('file', file);
formData.append('title', 'Nota Fiscal 12345');
formData.append('type', 'nota_fiscal_entrada');
formData.append('tags', JSON.stringify(['nf', 'compra', 'fornecedor-x']));

const response = await fetch('/documents/upload', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});

const document = await response.json();
// { id, fileName, fileUrl, title, type, ... }
```

**Tipos de Documentos Comuns para Estoque**:
- `nota_fiscal_entrada`: Nota fiscal de compra
- `nota_fiscal_saida`: Nota fiscal de venda
- `guia_transferencia`: Guia de transferência entre locais
- `recibo`: Recibo de recebimento
- `laudo_perda`: Laudo de perda/avaria
- `termo_ajuste`: Termo de ajuste de estoque

---

### 2. Listar Documentos

```http
GET /documents
```

**Query Parameters**:
```typescript
{
  folderId?: string;       // Filtrar por pasta
  type?: string;           // Filtrar por tipo
  search?: string;         // Buscar por título/nome
  tags?: string[];         // Filtrar por tags
  startDate?: string;      // Data inicial
  endDate?: string;        // Data final
}
```

---

### 3. Listar Pastas

```http
GET /documents/folders
```

**Query Parameters**:
```typescript
{
  parentId?: string;  // null ou 'null' para pastas raiz
}
```

**Resposta**:
```json
[
  {
    "id": "folder-1",
    "name": "Estoque",
    "isPublic": true,
    "subfoldersCount": 2,
    "documentsCount": 0,
    "createdBy": { "name": "Sistema" }
  }
]
```

---

### 4. Baixar Documento

```http
GET /documents/:id/download
```

**Resposta**: Stream do arquivo

**Exemplo**:
```javascript
const response = await fetch(`/documents/${documentId}/download`, {
  headers: { 'Authorization': `Bearer ${token}` }
});

const blob = await response.blob();
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'nota_fiscal.pdf';
a.click();
```

---

## 📊 Categorias, Unidades e Marcas

### Categorias

```http
GET    /products/categories
POST   /products/categories
GET    /products/categories/:id
PATCH  /products/categories/:id
DELETE /products/categories/:id
```

**Body (POST/PATCH)**:
```json
{
  "name": "Eletrônicos",
  "description": "Produtos eletrônicos",
  "parentId": null,
  "isActive": true
}
```

---

### Unidades de Medida

```http
GET    /products/units
POST   /products/units
GET    /products/units/:id
PATCH  /products/units/:id
DELETE /products/units/:id
```

**Body (POST/PATCH)**:
```json
{
  "name": "Unidade",
  "symbol": "UN",
  "abbreviation": "un",
  "isActive": true
}
```

---

### Marcas

```http
GET    /products/brands
POST   /products/brands
GET    /products/brands/:id
PATCH  /products/brands/:id
DELETE /products/brands/:id
```

**Body (POST/PATCH)**:
```json
{
  "name": "Dell",
  "description": "Dell Computadores",
  "isActive": true
}
```

---

## ⚠️ Códigos de Erro

### HTTP Status Codes

| Status | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 201 | Criado com sucesso |
| 204 | Deletado com sucesso (sem conteúdo) |
| 400 | Requisição inválida (validação) |
| 401 | Não autenticado |
| 403 | Sem permissão |
| 404 | Recurso não encontrado |
| 409 | Conflito (ex: código duplicado) |
| 500 | Erro interno do servidor |

---

### Erros Comuns

#### 1. Estoque Insuficiente

```json
{
  "statusCode": 400,
  "message": "Estoque insuficiente no local \"Armazém Principal\". Disponível: 3",
  "error": "Bad Request"
}
```

**Causa**: Tentativa de saída/transferência com quantidade maior que disponível

---

#### 2. Documento Não Encontrado

```json
{
  "statusCode": 404,
  "message": "Documento não encontrado",
  "error": "Not Found"
}
```

**Causa**: `documentId` fornecido não existe ou não pertence à empresa

---

#### 3. Local de Estoque Inativo

```json
{
  "statusCode": 400,
  "message": "Local de estoque não está ativo",
  "error": "Bad Request"
}
```

**Causa**: Tentativa de usar local de estoque desativado

---

#### 4. Código Duplicado

```json
{
  "statusCode": 409,
  "message": "Já existe um local com este código",
  "error": "Conflict"
}
```

**Causa**: Tentativa de criar local com código já existente

---

#### 5. Sem Permissão

```json
{
  "statusCode": 403,
  "message": "Sem permissão para executar esta ação",
  "error": "Forbidden"
}
```

**Causa**: Usuário não tem permissão necessária (ex: `products.manage_stock`)

---

#### 6. Transferência em Status Inválido

```json
{
  "statusCode": 400,
  "message": "Transferência já foi completada ou cancelada",
  "error": "Bad Request"
}
```

**Causa**: Tentativa de aprovar/completar transferência em status final

---

## 🔍 Exemplos de Integração

### Dashboard de Estoque

```typescript
const StockDashboard = () => {
  const [stats, setStats] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    // Carregar estatísticas
    fetch('/products/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setStats);

    // Produtos com estoque baixo
    fetch('/products/low-stock', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setLowStock);

    // Locais de estoque
    fetch('/products/stock-locations?active=true', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setLocations);
  }, []);

  return (
    <div>
      <h1>Dashboard de Estoque</h1>
      
      <div className="stats">
        <div>Total de Produtos: {stats?.totalProducts}</div>
        <div>Valor Total: R$ {stats?.totalStockValue}</div>
        <div>Alertas Baixo Estoque: {lowStock.length}</div>
      </div>

      <div className="alerts">
        <h2>Produtos com Estoque Baixo</h2>
        {lowStock.map(product => (
          <div key={product.id}>
            {product.name} - Estoque: {product.currentStock}
          </div>
        ))}
      </div>

      <div className="locations">
        <h2>Locais de Estoque</h2>
        {locations.map(location => (
          <div key={location.id}>
            {location.name} ({location.code}) - {location.productsCount} produtos
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

### Formulário de Entrada com Documento

```typescript
const StockEntryForm = ({ productId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState([]);
  const [formData, setFormData] = useState({
    quantity: 0,
    locationId: '',
    reason: '',
    notes: '',
    file: null as File | null
  });

  useEffect(() => {
    // Carregar locais
    fetch('/products/stock-locations?active=true', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setLocations);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let documentId: string | undefined;

      // 1. Upload do documento (se houver)
      if (formData.file) {
        const uploadForm = new FormData();
        uploadForm.append('file', formData.file);
        uploadForm.append('title', `NF - ${formData.reason}`);
        uploadForm.append('type', 'nota_fiscal_entrada');
        uploadForm.append('tags', JSON.stringify(['nf', 'entrada']));

        const uploadRes = await fetch('/documents/upload', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: uploadForm
        });

        if (!uploadRes.ok) throw new Error('Erro ao fazer upload');
        
        const uploadData = await uploadRes.json();
        documentId = uploadData.id;
      }

      // 2. Criar entrada
      const entryRes = await fetch(`/products/${productId}/stock-movement`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'ENTRY',
          quantity: formData.quantity,
          locationId: formData.locationId,
          documentId,
          reason: formData.reason,
          notes: formData.notes
        })
      });

      if (!entryRes.ok) throw new Error('Erro ao criar entrada');

      alert('Entrada criada com sucesso!');
      onSuccess();
    } catch (error) {
      console.error(error);
      alert('Erro ao processar entrada');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Quantidade *</label>
        <input
          type="number"
          required
          min="0.01"
          step="0.01"
          value={formData.quantity}
          onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
        />
      </div>

      <div>
        <label>Local *</label>
        <select
          required
          value={formData.locationId}
          onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
        >
          <option value="">Selecione...</option>
          {locations.map(loc => (
            <option key={loc.id} value={loc.id}>
              {loc.name} ({loc.code})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Motivo *</label>
        <input
          type="text"
          required
          value={formData.reason}
          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          placeholder="Ex: Compra fornecedor X"
        />
      </div>

      <div>
        <label>Observações</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Informações adicionais..."
        />
      </div>

      <div>
        <label>Nota Fiscal (opcional)</label>
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })}
        />
        <small>PDF, JPG ou PNG - Será organizado automaticamente em Estoque/Movimentações</small>
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Processando...' : 'Criar Entrada'}
      </button>
    </form>
  );
};
```

---

### Visualização de Transferência

```typescript
const TransferDetails = ({ transferId }) => {
  const [transfer, setTransfer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/products/stock-transfers/${transferId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setTransfer(data);
        setLoading(false);
      });
  }, [transferId]);

  const handleApprove = async () => {
    if (!confirm('Aprovar esta transferência?')) return;

    await fetch(`/products/stock-transfers/${transferId}/approve`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    // Recarregar
    window.location.reload();
  };

  const handleComplete = async () => {
    if (!confirm('Confirmar recebimento no destino?')) return;

    await fetch(`/products/stock-transfers/${transferId}/complete`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    window.location.reload();
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div>
      <h1>Transferência {transfer.code}</h1>
      
      <div className="status">
        Status: <span className={`badge ${transfer.status}`}>{transfer.status}</span>
      </div>

      <div className="locations">
        <div>
          <strong>Origem:</strong> {transfer.fromLocation.name} ({transfer.fromLocation.code})
        </div>
        <div>
          <strong>Destino:</strong> {transfer.toLocation.name} ({transfer.toLocation.code})
        </div>
      </div>

      <div className="items">
        <h2>Itens</h2>
        <table>
          <thead>
            <tr>
              <th>Produto</th>
              <th>SKU</th>
              <th>Quantidade</th>
            </tr>
          </thead>
          <tbody>
            {transfer.items.map(item => (
              <tr key={item.id}>
                <td>{item.product.name}</td>
                <td>{item.product.sku}</td>
                <td>{item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {transfer.document && (
        <div className="document">
          <h3>Documento Anexado</h3>
          <a href={`/documents/${transfer.document.id}/download`} target="_blank">
            📄 {transfer.document.fileName}
          </a>
          <small>Organizado em: Estoque/Transferências/{new Date().getFullYear()}/...</small>
        </div>
      )}

      <div className="actions">
        {transfer.status === 'PENDING' && (
          <button onClick={handleApprove}>Aprovar Transferência</button>
        )}
        {transfer.status === 'IN_TRANSIT' && (
          <button onClick={handleComplete}>Confirmar Recebimento</button>
        )}
      </div>
    </div>
  );
};
```

---

## 📚 Recursos Adicionais

- [Guia de Upload de Documentos](./STOCK_DOCUMENTS_UPLOAD_GUIDE.md)
- [Guia de Movimentações com Locais](./STOCK_MOVEMENTS_WITH_LOCATIONS_GUIDE.md)
- [Documentação Técnica - Criação Automática de Pastas](./AUTO_FOLDER_CREATION.md)

---

## 🎯 Checklist de Integração

### Setup Inicial
- [ ] Implementar autenticação JWT
- [ ] Criar interceptor para adicionar token nos headers
- [ ] Implementar tratamento de erros global
- [ ] Configurar base URL da API

### Produtos
- [ ] Listagem de produtos com paginação
- [ ] Formulário de criação com múltiplos locais
- [ ] Visualização de detalhes com estoque por local
- [ ] Dashboard de estatísticas

### Locais de Estoque
- [ ] Listagem de locais
- [ ] Formulário de criação/edição
- [ ] Validação de código único

### Movimentações
- [ ] Formulário de entrada com upload de NF
- [ ] Formulário de saída
- [ ] Histórico de movimentações
- [ ] Filtros por tipo, local e data

### Transferências
- [ ] Formulário de criação com múltiplos produtos
- [ ] Upload de guia de transferência
- [ ] Fluxo de aprovação (PENDING → IN_TRANSIT → COMPLETED)
- [ ] Listagem com filtros por status

### Documentos
- [ ] Upload de arquivos (drag & drop)
- [ ] Preview de documentos
- [ ] Download de arquivos
- [ ] Visualização da estrutura de pastas automática

---

**Última Atualização**: 5 de novembro de 2025  
**Versão da API**: 1.0  
**Contato**: Equipe de Desenvolvimento
