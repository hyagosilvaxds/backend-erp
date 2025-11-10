# API de Produtos - Documentação

## Índice

1. [Visão Geral](#visão-geral)
2. [Autenticação](#autenticação)
3. [Permissões](#permissões)
4. [Endpoints de Categorias](#endpoints-de-categorias)
5. [Endpoints de Unidades](#endpoints-de-unidades)
6. [Endpoints de Marcas](#endpoints-de-marcas)
7. [Endpoints de Produtos](#endpoints-de-produtos)
8. [Endpoints de Estoque](#endpoints-de-estoque)
9. [Endpoints de Locais de Estoque](#endpoints-de-locais-de-estoque)
10. [Endpoints de Transferências](#endpoints-de-transferências)
11. [Endpoints de Fotos](#endpoints-de-fotos)
12. [Códigos de Status](#códigos-de-status)
13. [Exemplos Completos](#exemplos-completos)

---

## Visão Geral

A API de Produtos fornece endpoints completos para gerenciar:
- **Categorias** (com suporte a hierarquia)
- **Unidades de medida** (UN, KG, L, etc)
- **Marcas**
- **Produtos** (com informações fiscais brasileiras)
- **Estoque** (movimentações e histórico)
- **Fotos** (integração com hub de documentos)

**Base URL**: `/products`

**Formato**: JSON

**Auditoria**: Todas as operações são registradas automaticamente no sistema de auditoria.

---

## Autenticação

Todos os endpoints requerem autenticação via JWT Bearer Token:

```http
Authorization: Bearer {seu_token_jwt}
```

---

## Permissões

| Permissão | Descrição |
|-----------|-----------|
| `products.read` | Visualizar produtos, categorias, marcas e unidades |
| `products.create` | Criar produtos, categorias, marcas e unidades |
| `products.update` | Atualizar produtos, categorias, marcas e unidades |
| `products.delete` | Deletar produtos, categorias, marcas e unidades |
| `products.manage_stock` | Gerenciar estoque (adicionar movimentações) |
| `products.view_stock_history` | Visualizar histórico de movimentações |

---

## Endpoints de Categorias

### 1. Criar Categoria

Cria uma nova categoria de produtos (pode ser categoria ou subcategoria).

**Endpoint**: `POST /products/categories`

**Permissão**: `products.create`

**Body**:
```json
{
  "name": "Eletrônicos",
  "description": "Produtos eletrônicos em geral",
  "parentId": null,
  "active": true
}
```

**Campos**:
- `name` (string, obrigatório): Nome da categoria (2-100 caracteres)
- `description` (string, opcional): Descrição da categoria
- `parentId` (string UUID, opcional): ID da categoria pai (para criar subcategoria)
- `active` (boolean, opcional): Se a categoria está ativa (padrão: true)

**Resposta** (201 Created):
```json
{
  "id": "uuid",
  "name": "Eletrônicos",
  "description": "Produtos eletrônicos em geral",
  "parentId": null,
  "active": true,
  "companyId": "uuid",
  "createdAt": "2025-10-29T12:00:00.000Z",
  "updatedAt": "2025-10-29T12:00:00.000Z",
  "parent": null,
  "subcategories": []
}
```

---

### 2. Listar Categorias

Lista todas as categorias da empresa.

**Endpoint**: `GET /products/categories`

**Permissão**: `products.read`

**Query Params**:
- `parentId` (string UUID, opcional): Filtrar por categoria pai

**Exemplos**:
```bash
# Listar todas as categorias
GET /products/categories

# Listar apenas categorias raiz (sem pai)
GET /products/categories?parentId=null

# Listar subcategorias de uma categoria específica
GET /products/categories?parentId=uuid-da-categoria-pai
```

**Resposta** (200 OK):
```json
[
  {
    "id": "uuid",
    "name": "Eletrônicos",
    "description": "Produtos eletrônicos em geral",
    "parentId": null,
    "active": true,
    "companyId": "uuid",
    "createdAt": "2025-10-29T12:00:00.000Z",
    "updatedAt": "2025-10-29T12:00:00.000Z",
    "_count": {
      "subcategories": 3,
      "products": 15
    }
  }
]
```

---

### 3. Buscar Categoria por ID

Obtém detalhes de uma categoria específica.

**Endpoint**: `GET /products/categories/:id`

**Permissão**: `products.read`

**Resposta** (200 OK):
```json
{
  "id": "uuid",
  "name": "Eletrônicos",
  "description": "Produtos eletrônicos em geral",
  "parentId": null,
  "active": true,
  "companyId": "uuid",
  "createdAt": "2025-10-29T12:00:00.000Z",
  "updatedAt": "2025-10-29T12:00:00.000Z",
  "parent": null,
  "subcategories": [
    {
      "id": "uuid",
      "name": "Computadores",
      "_count": { "products": 8 }
    }
  ],
  "_count": {
    "products": 15
  }
}
```

---

### 4. Atualizar Categoria

Atualiza informações de uma categoria.

**Endpoint**: `PATCH /products/categories/:id`

**Permissão**: `products.update`

**Body** (todos os campos são opcionais):
```json
{
  "name": "Eletrônicos e Tecnologia",
  "description": "Nova descrição",
  "active": false
}
```

**Resposta** (200 OK): Retorna a categoria atualizada.

---

### 5. Deletar Categoria

Deleta uma categoria (não permite se houver produtos ou subcategorias).

**Endpoint**: `DELETE /products/categories/:id`

**Permissão**: `products.delete`

**Resposta** (200 OK):
```json
{
  "message": "Categoria deletada com sucesso"
}
```

**Erros**:
- `400 Bad Request`: Categoria possui produtos ou subcategorias vinculadas

---

## Endpoints de Unidades

### 1. Criar Unidade

Cria uma nova unidade de medida.

**Endpoint**: `POST /products/units`

**Permissão**: `products.create`

**Body**:
```json
{
  "name": "Quilograma",
  "abbreviation": "KG",
  "fractionable": true,
  "active": true
}
```

**Campos**:
- `name` (string, obrigatório): Nome da unidade (2-50 caracteres)
- `abbreviation` (string, obrigatório): Abreviação (1-10 caracteres, única por empresa)
- `fractionable` (boolean, opcional): Permite quantidades decimais (padrão: false)
- `active` (boolean, opcional): Se a unidade está ativa (padrão: true)

**Resposta** (201 Created):
```json
{
  "id": "uuid",
  "name": "Quilograma",
  "abbreviation": "KG",
  "fractionable": true,
  "active": true,
  "companyId": "uuid",
  "createdAt": "2025-10-29T12:00:00.000Z",
  "updatedAt": "2025-10-29T12:00:00.000Z"
}
```

---

### 2. Listar Unidades

Lista todas as unidades da empresa.

**Endpoint**: `GET /products/units`

**Permissão**: `products.read`

**Resposta** (200 OK):
```json
[
  {
    "id": "uuid",
    "name": "Quilograma",
    "abbreviation": "KG",
    "fractionable": true,
    "active": true,
    "_count": {
      "products": 25
    }
  }
]
```

---

### 3. Buscar Unidade por ID

**Endpoint**: `GET /products/units/:id`

**Permissão**: `products.read`

---

### 4. Atualizar Unidade

**Endpoint**: `PATCH /products/units/:id`

**Permissão**: `products.update`

---

### 5. Deletar Unidade

**Endpoint**: `DELETE /products/units/:id`

**Permissão**: `products.delete`

**Erros**:
- `400 Bad Request`: Unidade possui produtos vinculados

---

## Endpoints de Marcas

### 1. Criar Marca

**Endpoint**: `POST /products/brands`

**Permissão**: `products.create`

**Body**:
```json
{
  "name": "Samsung",
  "description": "Eletrônicos Samsung",
  "active": true
}
```

---

### 2. Listar Marcas

**Endpoint**: `GET /products/brands`

**Permissão**: `products.read`

---

### 3. Buscar Marca por ID

**Endpoint**: `GET /products/brands/:id`

**Permissão**: `products.read`

---

### 4. Atualizar Marca

**Endpoint**: `PATCH /products/brands/:id`

**Permissão**: `products.update`

---

### 5. Deletar Marca

**Endpoint**: `DELETE /products/brands/:id`

**Permissão**: `products.delete`

---

## Endpoints de Produtos

### 1. Criar Produto

Cria um novo produto com todas as informações fiscais brasileiras.

**Endpoint**: `POST /products`

**Permissão**: `products.create`

**Body**:
```json
{
  "name": "Notebook Dell Inspiron 15",
  "description": "Notebook com processador Intel i7, 16GB RAM, 512GB SSD",
  "sku": "DELL-NB-I15-001",
  "barcode": "7891234567890",
  "reference": "INS15-I7-16-512",
  
  "categoryId": "uuid",
  "subcategoryId": "uuid",
  "brandId": "uuid",
  "unitId": "uuid",
  
  "costPrice": "2500.00",
  "profitMargin": "30",
  "salePrice": "3250.00",
  "salePriceCash": "3100.00",
  "salePriceInstallment": "3400.00",
  "minPrice": "2800.00",
  "wholesalePrice": "2900.00",
  "minWholesaleQty": 5,
  
  "manageStock": true,
  "initialStock": 10,
  "minStock": 2,
  "maxStock": 50,
  
  "dimensionType": "DETAILED",
  "width": "35.8",
  "height": "2.3",
  "length": "24.5",
  "weight": "1.85",
  "grossWeight": "2.5",
  
  "expiryAlertDays": 0,
  "warrantyDays": 365,
  
  "type": "SIMPLE",
  "active": true,
  "availability": "AVAILABLE",
  
  "ncm": "84713012",
  "cest": "1234567",
  "origin": "0",
  "icmsCst": "00",
  "icmsRate": "18",
  "icmsModBc": "3",
  "ipiCst": "50",
  "ipiRate": "5",
  "pisCst": "01",
  "pisRate": "1.65",
  "cofinsCst": "01",
  "cofinsRate": "7.6",
  
  "cfopEstadual": "5102",
  "cfopInterestadual": "6102",
  "cfopEntradaEstadual": "1102",
  "cfopEntradaInterestadual": "2102",
  "tipoItemSped": "00",
  "tipoProduto": "PRODUTO",
  
  "notes": "Produto com garantia estendida disponível"
}
```

**Campos Obrigatórios**:
- `name`: Nome do produto
- `salePrice`: Preço de venda

**Campos de Informações Fiscais** (Opcionais):
- `ncm`: Código NCM (8 dígitos)
- `cest`: Código CEST (7 dígitos)
- `origin`: Origem da mercadoria (0-8)
- `icmsCst`, `icmsRate`, `icmsModBc`: Informações de ICMS
- `ipiCst`, `ipiRate`: Informações de IPI
- `pisCst`, `pisRate`: Informações de PIS
- `cofinsCst`, `cofinsRate`: Informações de COFINS
- `cfopEstadual`: CFOP para vendas dentro do estado (ex: 5102)
- `cfopInterestadual`: CFOP para vendas fora do estado (ex: 6102)
- `cfopEntradaEstadual`: CFOP para compras dentro do estado (ex: 1102)
- `cfopEntradaInterestadual`: CFOP para compras fora do estado (ex: 2102)
- `tipoItemSped`: Tipo do item para SPED (00-99)
- `tipoProduto`: PRODUTO (usa ICMS) ou SERVICO (usa ISS)

**Campos ISS** (quando `tipoProduto = 'SERVICO'`):
- `codigoServico`: Código do serviço municipal
- `issRate`: Alíquota do ISS (%)
- `itemListaServico`: Item da lista de serviços LC 116/2003

**Tipos de Produto** (`type`):
- `SIMPLE`: Produto simples
- `COMPOSITE`: Produto composto (kit de montagem)
- `VARIATION`: Produto com variações
- `COMBO`: Combo/kit promocional

**Disponibilidade** (`availability`):
- `AVAILABLE`: Disponível
- `OUT_OF_STOCK`: Fora de estoque
- `PRE_ORDER`: Pré-venda
- `DISCONTINUED`: Descontinuado

**Resposta** (201 Created):
```json
{
  "id": "uuid",
  "name": "Notebook Dell Inspiron 15",
  "sku": "DELL-NB-I15-001",
  "salePrice": "3250.00",
  "currentStock": 10,
  "category": { "id": "uuid", "name": "Eletrônicos" },
  "brand": { "id": "uuid", "name": "Dell" },
  "unit": { "id": "uuid", "name": "Unidade", "abbreviation": "UN" },
  "createdAt": "2025-10-29T12:00:00.000Z"
}
```

---

### 2. Listar Produtos

Lista produtos com filtros e paginação.

**Endpoint**: `GET /products`

**Permissão**: `products.read`

**Query Params**:
- `page` (number, padrão: 1): Página atual
- `limit` (number, padrão: 20, max: 100): Itens por página
- `search` (string): Busca em nome, SKU, código de barras, referência
- `categoryId` (UUID): Filtrar por categoria
- `brandId` (UUID): Filtrar por marca
- `active` (boolean): Filtrar por status ativo/inativo
- `availability` (enum): Filtrar por disponibilidade
- `type` (enum): Filtrar por tipo de produto
- `lowStock` (boolean): Apenas produtos com estoque baixo
- `outOfStock` (boolean): Apenas produtos sem estoque
- `sortBy` (enum): Campo para ordenação (name, sku, salePrice, currentStock, createdAt)
- `sortOrder` (enum): Ordem (asc, desc)

**Exemplos**:
```bash
# Listar todos os produtos (paginado)
GET /products?page=1&limit=20

# Buscar produtos
GET /products?search=notebook

# Filtrar por categoria e marca
GET /products?categoryId=uuid&brandId=uuid

# Produtos com estoque baixo
GET /products?lowStock=true

# Produtos ativos, ordenados por nome
GET /products?active=true&sortBy=name&sortOrder=asc
```

**Resposta** (200 OK):
```json
{
  "products": [
    {
      "id": "uuid",
      "name": "Notebook Dell Inspiron 15",
      "sku": "DELL-NB-I15-001",
      "barcode": "7891234567890",
      "salePrice": "3250.00",
      "currentStock": 10,
      "minStock": 2,
      "active": true,
      "availability": "AVAILABLE",
      "category": {
        "id": "uuid",
        "name": "Eletrônicos"
      },
      "brand": {
        "id": "uuid",
        "name": "Dell"
      },
      "unit": {
        "id": "uuid",
        "abbreviation": "UN"
      },
      "_count": {
        "photos": 3
      },
      "createdAt": "2025-10-29T12:00:00.000Z"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 20,
  "totalPages": 5
}
```

---

### 3. Buscar Produto por ID

Obtém detalhes completos de um produto, incluindo estoque detalhado por local.

**Endpoint**: `GET /products/:id`

**Permissão**: `products.read`

**Resposta** (200 OK):
```json
{
  "id": "uuid",
  "name": "Notebook Dell Inspiron 15",
  "description": "Notebook com processador Intel i7...",
  "sku": "DELL-NB-I15-001",
  "barcode": "7891234567890",
  "reference": "INS15-I7-16-512",
  
  "costPrice": "2500.00",
  "profitMargin": "30",
  "salePrice": "3250.00",
  "salePriceCash": "3100.00",
  "currentStock": 100,
  "minStock": 10,
  "maxStock": 500,
  
  "ncm": "84713012",
  "icmsRate": "18",
  
  "category": {
    "id": "uuid",
    "name": "Eletrônicos"
  },
  "brand": {
    "id": "uuid",
    "name": "Dell"
  },
  "unit": {
    "id": "uuid",
    "name": "Unidade",
    "abbreviation": "UN"
  },
  "photos": [
    {
      "id": "uuid",
      "documentId": "uuid",
      "order": 0,
      "isPrimary": true
    }
  ],
  "variations": [],
  "compositeItems": [],
  "comboItems": [],
  
  "stocksByLocation": [
    {
      "id": "uuid",
      "productId": "uuid",
      "locationId": "uuid",
      "quantity": 70,
      "location": {
        "id": "uuid",
        "name": "Depósito Central",
        "code": "DEP-01",
        "description": "Depósito principal",
        "address": "Rua Principal, 123",
        "isDefault": true,
        "active": true
      },
      "updatedAt": "2025-11-04T10:30:00.000Z"
    },
    {
      "id": "uuid",
      "productId": "uuid",
      "locationId": "uuid",
      "quantity": 20,
      "location": {
        "id": "uuid",
        "name": "Loja Shopping Center",
        "code": "LOJA-01",
        "description": "Loja no shopping",
        "address": "Shopping Center, Loja 234",
        "isDefault": false,
        "active": true
      },
      "updatedAt": "2025-11-04T11:00:00.000Z"
    },
    {
      "id": "uuid",
      "productId": "uuid",
      "locationId": "uuid",
      "quantity": 10,
      "location": {
        "id": "uuid",
        "name": "Loja Centro",
        "code": "LOJA-02",
        "description": "Loja no centro da cidade",
        "address": "Av. Principal, 456",
        "isDefault": false,
        "active": true
      },
      "updatedAt": "2025-11-04T09:45:00.000Z"
    }
  ],
  
  "stockSummary": {
    "totalStock": 100,
    "stockByLocations": [
      {
        "locationId": "uuid",
        "locationName": "Depósito Central",
        "locationCode": "DEP-01",
        "quantity": 70,
        "isDefault": true,
        "active": true,
        "address": "Rua Principal, 123",
        "updatedAt": "2025-11-04T10:30:00.000Z"
      },
      {
        "locationId": "uuid",
        "locationName": "Loja Shopping Center",
        "locationCode": "LOJA-01",
        "quantity": 20,
        "isDefault": false,
        "active": true,
        "address": "Shopping Center, Loja 234",
        "updatedAt": "2025-11-04T11:00:00.000Z"
      },
      {
        "locationId": "uuid",
        "locationName": "Loja Centro",
        "locationCode": "LOJA-02",
        "quantity": 10,
        "isDefault": false,
        "active": true,
        "address": "Av. Principal, 456",
        "updatedAt": "2025-11-04T09:45:00.000Z"
      }
    ],
    "locationsCount": 3,
    "locationsWithStock": 3,
    "locationsOutOfStock": 0
  },
  
  "createdAt": "2025-10-29T12:00:00.000Z",
  "updatedAt": "2025-10-29T12:00:00.000Z"
}
```

**Campos Adicionais**:

- `stocksByLocation[]`: Array com estoque detalhado em cada local
  - Inclui dados completos do local (nome, código, endereço, etc)
  - Mostra quantidade em cada local
  - Indica se é local padrão e se está ativo

- `stockSummary`: Resumo consolidado do estoque
  - `totalStock`: Estoque total somado de todos os locais
  - `stockByLocations[]`: Array simplificado com resumo por local
  - `locationsCount`: Total de locais cadastrados para este produto
  - `locationsWithStock`: Quantidade de locais com estoque > 0
  - `locationsOutOfStock`: Quantidade de locais sem estoque

---

### 4. Atualizar Produto

**Endpoint**: `PATCH /products/:id`

**Permissão**: `products.update`

**Body** (todos os campos são opcionais):
```json
{
  "name": "Notebook Dell Inspiron 15 - Novo Modelo",
  "salePrice": "3400.00",
  "active": true
}
```

---

### 5. Deletar Produto

**Endpoint**: `DELETE /products/:id`

**Permissão**: `products.delete`

**Validações**:
- Não permite deletar se o produto tem variações
- Não permite deletar se está sendo usado em produtos compostos
- Não permite deletar se está em combos

---

### 6. Produtos com Estoque Baixo

Lista produtos onde `currentStock <= minStock`.

**Endpoint**: `GET /products/low-stock`

**Permissão**: `products.read`

**Resposta** (200 OK):
```json
[
  {
    "id": "uuid",
    "name": "Notebook Dell",
    "sku": "DELL-NB-001",
    "currentStock": 2,
    "minStock": 5,
    "category": { "name": "Eletrônicos" },
    "unit": { "abbreviation": "UN" }
  }
]
```

---

### 7. Estatísticas de Produtos

Obtém estatísticas gerais dos produtos.

**Endpoint**: `GET /products/stats`

**Permissão**: `products.read`

**Resposta** (200 OK):
```json
{
  "totalProducts": 150,
  "activeProducts": 145,
  "inactiveProducts": 5,
  "lowStockProducts": 12,
  "outOfStockProducts": 3,
  "productsByCategory": 15,
  "productsByBrand": 25,
  "totalStockValue": 45000
}
```

---

## Endpoints de Estoque

### 1. Listar Estoque de Produtos

Lista o estoque atual de todos os produtos com filtros e resumo.

**Endpoint**: `GET /products/stock`

**Permissão**: `products.read`

**Query Params**:
- `search` (string): Busca por nome, SKU ou código de barras
- `categoryId` (UUID): Filtrar por categoria
- `brandId` (UUID): Filtrar por marca
- `lowStock` (boolean): Apenas produtos com estoque baixo
- `outOfStock` (boolean): Apenas produtos sem estoque

**Exemplos**:
```bash
# Listar todo o estoque
GET /products/stock

# Produtos com estoque baixo
GET /products/stock?lowStock=true

# Produtos sem estoque
GET /products/stock?outOfStock=true

# Estoque de uma categoria específica
GET /products/stock?categoryId=uuid

# Buscar produto no estoque
GET /products/stock?search=notebook
```

**Resposta** (200 OK):
```json
{
  "products": [
    {
      "id": "uuid",
      "name": "Notebook Dell Inspiron 15",
      "sku": "DELL-NB-I15-001",
      "barcode": "7891234567890",
      "currentStock": 10,
      "minStock": 2,
      "maxStock": 50,
      "costPrice": "2500.00",
      "salePrice": "3250.00",
      "stockValue": 25000.00,
      "saleValue": 32500.00,
      "status": "NORMAL",
      "category": {
        "id": "uuid",
        "name": "Eletrônicos"
      },
      "brand": {
        "id": "uuid",
        "name": "Dell"
      },
      "unit": {
        "id": "uuid",
        "name": "Unidade",
        "abbreviation": "UN"
      }
    },
    {
      "id": "uuid",
      "name": "Mouse Logitech MX Master",
      "sku": "LOG-MS-001",
      "barcode": "7891234567891",
      "currentStock": 2,
      "minStock": 5,
      "maxStock": 30,
      "costPrice": "150.00",
      "salePrice": "280.00",
      "stockValue": 300.00,
      "saleValue": 560.00,
      "status": "LOW_STOCK",
      "category": {
        "id": "uuid",
        "name": "Periféricos"
      },
      "brand": {
        "id": "uuid",
        "name": "Logitech"
      },
      "unit": {
        "id": "uuid",
        "name": "Unidade",
        "abbreviation": "UN"
      }
    }
  ],
  "summary": {
    "totalProducts": 150,
    "lowStockCount": 12,
    "outOfStockCount": 3,
    "totalStockValue": "125450.00",
    "totalSaleValue": "198750.00"
  }
}
```

**Status do Estoque**:
- `NORMAL`: Estoque acima do mínimo
- `LOW_STOCK`: Estoque <= mínimo
- `OUT_OF_STOCK`: Estoque zerado

---

### 2. Adicionar Movimentação de Estoque

Registra uma movimentação de estoque (entrada, saída, ajuste, etc).

**Endpoint**: `POST /products/:id/stock-movement`

**Permissão**: `products.manage_stock`

**Body**:
```json
{
  "type": "ENTRY",
  "quantity": 50,
  "reason": "Compra do fornecedor XYZ",
  "notes": "Nota fiscal 12345",
  "reference": "NF-12345"
}
```

**Tipos de Movimentação** (`type`):
- `ENTRY`: Entrada de estoque (compra, devolução de venda)
- `EXIT`: Saída de estoque (venda, transferência)
- `ADJUSTMENT`: Ajuste manual
- `RETURN`: Devolução (cliente devolveu produto)
- `LOSS`: Perda (dano, roubo, vencimento)
- `TRANSFER`: Transferência entre unidades

**Campos**:
- `type` (enum, obrigatório): Tipo da movimentação
- `quantity` (number, obrigatório): Quantidade movimentada
- `reason` (string, opcional): Motivo da movimentação
- `notes` (string, opcional): Observações adicionais
- `reference` (string, opcional): Referência externa (NF, pedido, etc)

**Resposta** (201 Created):
```json
{
  "id": "uuid",
  "productId": "uuid",
  "type": "ENTRY",
  "quantity": 50,
  "previousStock": 10,
  "newStock": 60,
  "reason": "Compra do fornecedor XYZ",
  "notes": "Nota fiscal 12345",
  "reference": "NF-12345",
  "userId": "uuid",
  "createdAt": "2025-10-29T12:00:00.000Z"
}
```

**Regras**:
- `ENTRY`, `RETURN`, `ADJUSTMENT`: Adiciona ao estoque
- `EXIT`, `LOSS`: Subtrai do estoque
- Não permite estoque negativo

---

### 3. Histórico de Movimentações

Lista o histórico de movimentações de um produto.

**Endpoint**: `GET /products/:id/stock-history`

**Permissão**: `products.read`

**Query Params**:
- `limit` (number, padrão: 50): Quantidade de registros

**Resposta** (200 OK):
```json
[
  {
    "id": "uuid",
    "type": "ENTRY",
    "quantity": 50,
    "previousStock": 10,
    "newStock": 60,
    "reason": "Compra do fornecedor XYZ",
    "reference": "NF-12345",
    "userId": "uuid",
    "createdAt": "2025-10-29T12:00:00.000Z"
  },
  {
    "id": "uuid",
    "type": "EXIT",
    "quantity": 5,
    "previousStock": 60,
    "newStock": 55,
    "reason": "Venda pedido #123",
    "createdAt": "2025-10-29T11:00:00.000Z"
  }
]
```

---

## Endpoints de Locais de Estoque

### 1. Criar Local de Estoque

Cria um novo local de estoque (depósito, loja, armazém, etc).

**Endpoint**: `POST /products/stock-locations`

**Permissão**: `products.create`

**Body**:
```json
{
  "name": "Depósito Central",
  "code": "DEP-01",
  "description": "Depósito principal da empresa",
  "address": "Rua Principal, 123 - Centro",
  "isDefault": true,
  "active": true
}
```

**Campos**:
- `name` (string, obrigatório): Nome do local
- `code` (string, obrigatório): Código único por empresa (ex: DEP-01, LOJA-01)
- `description` (string, opcional): Descrição do local
- `address` (string, opcional): Endereço completo
- `isDefault` (boolean, opcional): Se é o local padrão para movimentações
- `active` (boolean, opcional): Se está ativo

**Resposta** (201 Created):
```json
{
  "id": "uuid",
  "companyId": "uuid",
  "name": "Depósito Central",
  "code": "DEP-01",
  "description": "Depósito principal da empresa",
  "address": "Rua Principal, 123 - Centro",
  "isDefault": true,
  "active": true,
  "createdAt": "2025-10-30T10:00:00.000Z",
  "updatedAt": "2025-10-30T10:00:00.000Z"
}
```

**Regras**:
- Código deve ser único por empresa
- Se marcar `isDefault: true`, desmarca outros locais
- Código não pode ser alterado após criação

---

### 2. Listar Locais de Estoque

Lista todos os locais de estoque da empresa.

**Endpoint**: `GET /products/stock-locations`

**Permissão**: `products.read`

**Resposta** (200 OK):
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
    "createdAt": "2025-10-30T10:00:00.000Z",
    "updatedAt": "2025-10-30T10:00:00.000Z"
  }
]
```

---

### 3. Buscar Local por ID

**Endpoint**: `GET /products/stock-locations/:id`

**Permissão**: `products.read`

**Resposta**: Igual ao item 2

---

### 4. Atualizar Local

**Endpoint**: `PATCH /products/stock-locations/:id`

**Permissão**: `products.update`

**Body** (todos os campos opcionais):
```json
{
  "name": "Depósito Central - Matriz",
  "description": "Nova descrição",
  "active": false
}
```

---

### 5. Deletar Local

**Endpoint**: `DELETE /products/stock-locations/:id`

**Permissão**: `products.delete`

**Resposta** (200 OK):
```json
{
  "message": "Local de estoque deletado com sucesso"
}
```

**Validações**:
- Não permite deletar se houver estoque no local
- Não permite deletar se houver transferências pendentes/em trânsito

---

### 6. Ver Estoque de um Produto por Local

Mostra o estoque de um produto específico em cada local.

**Endpoint**: `GET /products/:productId/stock-by-location`

**Permissão**: `products.read`

**Resposta** (200 OK):
```json
{
  "product": {
    "id": "uuid",
    "name": "Notebook Dell Inspiron 15",
    "sku": "DELL-NB-001",
    "totalStock": 35
  },
  "stocksByLocation": [
    {
      "id": "uuid",
      "productId": "uuid",
      "locationId": "uuid",
      "quantity": 25,
      "location": {
        "id": "uuid",
        "name": "Depósito Central",
        "code": "DEP-01",
        "active": true
      },
      "updatedAt": "2025-10-30T12:00:00.000Z"
    },
    {
      "id": "uuid",
      "productId": "uuid",
      "locationId": "uuid",
      "quantity": 10,
      "location": {
        "id": "uuid",
        "name": "Loja Shopping Center",
        "code": "LOJA-01",
        "active": true
      },
      "updatedAt": "2025-10-30T12:00:00.000Z"
    }
  ]
}
```

---

### 7. Ver Todo o Estoque Agrupado por Local

Lista todo o estoque da empresa agrupado por local.

**Endpoint**: `GET /products/stock/by-location`

**Permissão**: `products.read`

**Query Params**:
- `locationId` (UUID, opcional): Filtrar por local específico

**Exemplos**:
```bash
# Todo o estoque agrupado por local
GET /products/stock/by-location

# Estoque apenas de um local específico
GET /products/stock/by-location?locationId=uuid
```

**Resposta** (200 OK):
```json
[
  {
    "id": "uuid",
    "productId": "uuid",
    "locationId": "uuid",
    "quantity": 25,
    "product": {
      "id": "uuid",
      "name": "Notebook Dell",
      "sku": "DELL-NB-001",
      "barcode": "7891234567890",
      "unit": {
        "abbreviation": "UN"
      }
    },
    "location": {
      "id": "uuid",
      "name": "Depósito Central",
      "code": "DEP-01"
    },
    "updatedAt": "2025-10-30T12:00:00.000Z"
  }
]
```

---

## Endpoints de Transferências

### 1. Criar Transferência

Cria uma nova transferência de estoque entre locais.

**Endpoint**: `POST /products/stock-transfers`

**Permissão**: `products.manage_stock`

**Body**:
```json
{
  "fromLocationId": "uuid-deposito",
  "toLocationId": "uuid-loja",
  "items": [
    {
      "productId": "uuid-produto-1",
      "quantity": 10,
      "notes": "Reposição de estoque da loja"
    },
    {
      "productId": "uuid-produto-2",
      "quantity": 5
    }
  ],
  "notes": "Transferência semanal para reposição"
}
```

**Campos**:
- `fromLocationId` (UUID, obrigatório): Local de origem
- `toLocationId` (UUID, obrigatório): Local de destino
- `items` (array, obrigatório): Lista de produtos
  - `productId` (UUID): ID do produto
  - `quantity` (number): Quantidade a transferir
  - `notes` (string, opcional): Observações do item
- `notes` (string, opcional): Observações gerais

**Resposta** (201 Created):
```json
{
  "id": "uuid",
  "companyId": "uuid",
  "code": "TRANS-000001",
  "fromLocationId": "uuid",
  "toLocationId": "uuid",
  "status": "PENDING",
  "notes": "Transferência semanal",
  "requestedBy": "user-uuid",
  "requestedAt": "2025-10-30T13:00:00.000Z",
  "fromLocation": {
    "id": "uuid",
    "name": "Depósito Central",
    "code": "DEP-01"
  },
  "toLocation": {
    "id": "uuid",
    "name": "Loja Shopping Center",
    "code": "LOJA-01"
  },
  "items": [
    {
      "id": "uuid",
      "transferId": "uuid",
      "productId": "uuid",
      "quantity": 10,
      "notes": "Reposição",
      "product": {
        "id": "uuid",
        "name": "Notebook Dell",
        "sku": "DELL-NB-001"
      }
    }
  ],
  "createdAt": "2025-10-30T13:00:00.000Z"
}
```

**Status da Transferência**:
- `PENDING`: Aguardando aprovação
- `IN_TRANSIT`: Aprovada, em trânsito
- `COMPLETED`: Completada (estoque movimentado)
- `CANCELLED`: Cancelada

**Validações**:
- Local de origem e destino não podem ser iguais
- Valida se há estoque suficiente no local de origem
- Código da transferência é gerado automaticamente (TRANS-000001, etc)

---

### 2. Listar Transferências

Lista todas as transferências da empresa.

**Endpoint**: `GET /products/stock-transfers`

**Permissão**: `products.read`

**Query Params**:
- `status` (string, opcional): Filtrar por status

**Exemplos**:
```bash
# Todas as transferências
GET /products/stock-transfers

# Apenas pendentes
GET /products/stock-transfers?status=PENDING

# Apenas completadas
GET /products/stock-transfers?status=COMPLETED
```

**Resposta** (200 OK):
```json
[
  {
    "id": "uuid",
    "code": "TRANS-000001",
    "status": "PENDING",
    "fromLocation": {
      "id": "uuid",
      "name": "Depósito Central",
      "code": "DEP-01"
    },
    "toLocation": {
      "id": "uuid",
      "name": "Loja Shopping",
      "code": "LOJA-01"
    },
    "items": [
      {
        "id": "uuid",
        "quantity": 10,
        "product": {
          "id": "uuid",
          "name": "Notebook Dell",
          "sku": "DELL-NB-001"
        }
      }
    ],
    "requestedAt": "2025-10-30T13:00:00.000Z",
    "createdAt": "2025-10-30T13:00:00.000Z"
  }
]
```

---

### 3. Buscar Transferência por ID

**Endpoint**: `GET /products/stock-transfers/:id`

**Permissão**: `products.read`

**Resposta**: Similar ao item 1

---

### 4. Aprovar Transferência

Aprova uma transferência pendente (muda status de PENDING para IN_TRANSIT).

**Endpoint**: `PATCH /products/stock-transfers/:id/approve`

**Permissão**: `products.manage_stock`

**Resposta** (200 OK):
```json
{
  "id": "uuid",
  "code": "TRANS-000001",
  "status": "IN_TRANSIT",
  "approvedBy": "user-uuid",
  "approvedAt": "2025-10-30T14:00:00.000Z",
  ...
}
```

**Validações**:
- Apenas transferências com status `PENDING` podem ser aprovadas
- Valida novamente o estoque disponível

---

### 5. Completar Transferência

Completa a transferência, movimentando o estoque entre locais.

**Endpoint**: `PATCH /products/stock-transfers/:id/complete`

**Permissão**: `products.manage_stock`

**Resposta** (200 OK):
```json
{
  "id": "uuid",
  "code": "TRANS-000001",
  "status": "COMPLETED",
  "completedBy": "user-uuid",
  "completedAt": "2025-10-30T15:00:00.000Z",
  ...
}
```

**O que acontece**:
1. Subtrai quantidades do local de origem
2. Adiciona quantidades no local de destino
3. Cria movimentações de estoque (tipo `TRANSFER`)
4. Atualiza status para `COMPLETED`

**Validações**:
- Apenas transferências `IN_TRANSIT` ou `PENDING` podem ser completadas

---

### 6. Cancelar Transferência

Cancela uma transferência.

**Endpoint**: `PATCH /products/stock-transfers/:id/cancel`

**Permissão**: `products.manage_stock`

**Resposta** (200 OK):
```json
{
  "id": "uuid",
  "code": "TRANS-000001",
  "status": "CANCELLED",
  ...
}
```

**Validações**:
- Não é possível cancelar transferências já completadas

---

## Endpoints de Fotos

### 1. Adicionar Foto ao Produto

Vincula uma foto (documento) a um produto.

**Endpoint**: `POST /products/:id/photos`

**Permissão**: `products.update`

**Body**:
```json
{
  "documentId": "uuid-do-documento",
  "order": 0,
  "isPrimary": true
}
```

**Campos**:
- `documentId` (UUID, obrigatório): ID do documento (imagem já enviada no hub)
- `order` (number, opcional): Ordem de exibição (padrão: próxima ordem)
- `isPrimary` (boolean, opcional): Se é a foto principal (padrão: false)

**Resposta** (201 Created):
```json
{
  "id": "uuid",
  "productId": "uuid",
  "documentId": "uuid",
  "order": 0,
  "isPrimary": true,
  "createdAt": "2025-10-29T12:00:00.000Z"
}
```

**Regras**:
- Se marcar `isPrimary: true`, todas as outras fotos são desmarcadas
- A ordem é gerenciada automaticamente se não informada

---

### 2. Remover Foto do Produto

Remove uma foto de um produto.

**Endpoint**: `DELETE /products/:id/photos/:photoId`

**Permissão**: `products.update`

**Resposta** (200 OK):
```json
{
  "message": "Foto removida com sucesso"
}
```

---

### 3. Definir Foto Principal

Define qual foto é a principal do produto.

**Endpoint**: `PATCH /products/:id/photos/:photoId/primary`

**Permissão**: `products.update`

**Resposta** (200 OK):
```json
{
  "id": "uuid",
  "productId": "uuid",
  "documentId": "uuid",
  "order": 0,
  "isPrimary": true
}
```

---

### 4. Reordenar Fotos

Reordena as fotos de um produto.

**Endpoint**: `PATCH /products/:id/photos/reorder`

**Permissão**: `products.update`

**Body**:
```json
{
  "photoOrders": [
    { "id": "uuid-foto-1", "order": 0 },
    { "id": "uuid-foto-2", "order": 1 },
    { "id": "uuid-foto-3", "order": 2 }
  ]
}
```

**Resposta** (200 OK):
```json
[
  {
    "id": "uuid-foto-1",
    "order": 0,
    "isPrimary": true
  },
  {
    "id": "uuid-foto-2",
    "order": 1,
    "isPrimary": false
  }
]
```

---

## Códigos de Status

| Código | Descrição |
|--------|-----------|
| 200 | OK - Operação bem-sucedida |
| 201 | Created - Recurso criado com sucesso |
| 400 | Bad Request - Dados inválidos ou regra de negócio violada |
| 401 | Unauthorized - Token inválido ou expirado |
| 403 | Forbidden - Sem permissão para acessar o recurso |
| 404 | Not Found - Recurso não encontrado |
| 409 | Conflict - Conflito (ex: SKU duplicado) |
| 500 | Internal Server Error - Erro interno do servidor |

---

## Exemplos Completos

### Fluxo Completo: Cadastrar Produto com Foto

```bash
# 1. Criar categoria
curl -X POST http://localhost:3000/products/categories \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Eletrônicos",
    "description": "Produtos eletrônicos"
  }'
# Resposta: { "id": "cat-uuid", ... }

# 2. Criar marca
curl -X POST http://localhost:3000/products/brands \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Samsung"
  }'
# Resposta: { "id": "brand-uuid", ... }

# 3. Criar unidade
curl -X POST http://localhost:3000/products/units \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Unidade",
    "abbreviation": "UN",
    "fractionable": false
  }'
# Resposta: { "id": "unit-uuid", ... }

# 4. Criar produto
curl -X POST http://localhost:3000/products \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Smartphone Samsung Galaxy S23",
    "sku": "SAM-S23-001",
    "barcode": "7891234567890",
    "categoryId": "cat-uuid",
    "brandId": "brand-uuid",
    "unitId": "unit-uuid",
    "costPrice": "2000.00",
    "salePrice": "3500.00",
    "manageStock": true,
    "initialStock": 20,
    "minStock": 5,
    "ncm": "85171231",
    "active": true
  }'
# Resposta: { "id": "prod-uuid", ... }

# 5. Upload de foto (primeiro no hub de documentos)
curl -X POST http://localhost:3000/documents/upload \
  -H "Authorization: Bearer {token}" \
  -F "file=@galaxy-s23.jpg" \
  -F "folderId=product-photos-folder-uuid"
# Resposta: { "id": "doc-uuid", ... }

# 6. Vincular foto ao produto
curl -X POST http://localhost:3000/products/prod-uuid/photos \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "documentId": "doc-uuid",
    "isPrimary": true
  }'
# Resposta: { "id": "photo-uuid", ... }

# 7. Adicionar estoque
curl -X POST http://localhost:3000/products/prod-uuid/stock-movement \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "ENTRY",
    "quantity": 30,
    "reason": "Compra fornecedor",
    "reference": "NF-123456"
  }'
# Resposta: { "newStock": 50, ... }
```

---

### Exemplo: Cadastrar Produto Físico

```bash
curl -X POST http://localhost:3000/products \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Notebook Dell Inspiron 15",
    "sku": "DELL-NB-001",
    "barcode": "7891234567890",
    "categoryId": "cat-uuid",
    "brandId": "brand-uuid",
    "unitId": "unit-uuid",
    "costPrice": 2500.00,
    "salePrice": 3500.00,
    "manageStock": true,
    "initialStock": 10,
    "minStock": 2,
    
    "tipoProduto": "PRODUTO",
    "tipoItemSped": "00",
    "ncm": "84713012",
    "cest": "1234567",
    "origin": "0",
    
    "cfopEstadual": "5102",
    "cfopInterestadual": "6102",
    "cfopEntradaEstadual": "1102",
    "cfopEntradaInterestadual": "2102",
    
    "icmsCst": "00",
    "icmsRate": 18.00,
    "ipiRate": 5.00,
    "pisCst": "01",
    "pisRate": 1.65,
    "cofinsCst": "01",
    "cofinsRate": 7.60,
    
    "active": true
  }'
```

---

### Exemplo: Cadastrar Serviço

```bash
curl -X POST http://localhost:3000/products \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Desenvolvimento de Sistema Web",
    "sku": "SERV-DEV-001",
    "unitId": "hora-uuid",
    "costPrice": 80.00,
    "salePrice": 150.00,
    "manageStock": false,
    
    "tipoProduto": "SERVICO",
    "tipoItemSped": "09",
    
    "cfopEstadual": "5933",
    "cfopInterestadual": "6933",
    
    "codigoServico": "01.01",
    "issRate": 3.00,
    "itemListaServico": "1.01",
    
    "pisCst": "01",
    "pisRate": 1.65,
    "cofinsCst": "01",
    "cofinsRate": 7.60,
    
    "active": true,
    "notes": "Serviço de desenvolvimento de sistemas sob demanda"
  }'
```

**Nota**: Para serviços, use `tipoProduto: "SERVICO"` e preencha os campos ISS ao invés de ICMS/IPI.

---

### Buscar Produtos com Filtros

```bash
# Buscar notebooks Samsung com estoque baixo
curl -X GET "http://localhost:3000/products?search=notebook&brandId=samsung-uuid&lowStock=true" \
  -H "Authorization: Bearer {token}"

# Listar produtos de uma categoria, ordenados por preço
curl -X GET "http://localhost:3000/products?categoryId=eletronicos-uuid&sortBy=salePrice&sortOrder=asc&page=1&limit=50" \
  -H "Authorization: Bearer {token}"

# Produtos ativos disponíveis
curl -X GET "http://localhost:3000/products?active=true&availability=AVAILABLE" \
  -H "Authorization: Bearer {token}"
```

---

### Consultar Histórico de Estoque

```bash
curl -X GET "http://localhost:3000/products/prod-uuid/stock-history?limit=100" \
  -H "Authorization: Bearer {token}"
```

---

## Auditoria

Todas as operações abaixo são registradas automaticamente no sistema de auditoria:

### Ações Auditadas:

**Categorias**:
- `CREATE_PRODUCT_CATEGORY`
- `UPDATE_PRODUCT_CATEGORY`
- `DELETE_PRODUCT_CATEGORY`

**Produtos**:
- `CREATE_PRODUCT`
- `UPDATE_PRODUCT`
- `DELETE_PRODUCT`

**Estoque**:
- `STOCK_MOVEMENT`

**Fotos**:
- `ADD_PRODUCT_PHOTO`
- `REMOVE_PRODUCT_PHOTO`
- `SET_PRIMARY_PHOTO`
- `REORDER_PRODUCT_PHOTOS`

### Campos Registrados:
- `companyId`: ID da empresa
- `userId`: ID do usuário que executou a ação
- `action`: Tipo da ação
- `entityType`: Tipo da entidade (Product, ProductCategory, etc)
- `description`: Descrição legível da ação
- `oldValue`: Valor antigo (JSON)
- `newValue`: Valor novo (JSON)
- `createdAt`: Data/hora da ação

---

## Informações Fiscais Brasileiras

### NCM (Nomenclatura Comum do Mercosul)
Código de 8 dígitos que classifica mercadorias. Obrigatório para emissão de notas fiscais.

Exemplo: `85171231` (Smartphones)

### CEST (Código Especificador da Substituição Tributária)
Código de 7 dígitos usado para produtos sujeitos à substituição tributária.

Exemplo: `2100100` (Cerveja)

### Origem da Mercadoria
Código que indica a origem:
- `0`: Nacional
- `1`: Estrangeira - Importação direta
- `2`: Estrangeira - Adquirida no mercado interno
- `3-8`: Outras situações

### ICMS (Imposto sobre Circulação de Mercadorias)
- `icmsCst`: Código da Situação Tributária (00-90)
- `icmsRate`: Alíquota do ICMS (%)
- `icmsModBc`: Modalidade de base de cálculo

### IPI (Imposto sobre Produtos Industrializados)
- `ipiCst`: Código da Situação Tributária
- `ipiRate`: Alíquota do IPI (%)

### PIS (Programa de Integração Social)
- `pisCst`: Código da Situação Tributária
- `pisRate`: Alíquota do PIS (%)

### COFINS (Contribuição para Financiamento da Seguridade Social)
- `cofinsCst`: Código da Situação Tributária
- `cofinsRate`: Alíquota do COFINS (%)

### CFOP (Código Fiscal de Operações e Prestações)
Códigos de 4 dígitos que identificam a natureza da operação:
- `cfopEstadual`: Para vendas dentro do estado (ex: 5102)
- `cfopInterestadual`: Para vendas fora do estado (ex: 6102)
- `cfopEntradaEstadual`: Para compras dentro do estado (ex: 1102)
- `cfopEntradaInterestadual`: Para compras fora do estado (ex: 2102)

### Tipo do Item SPED
- `tipoItemSped`: Classificação do item para escrituração fiscal (00 a 99)
  - `00`: Mercadoria para Revenda
  - `01`: Matéria-Prima
  - `04`: Produto Acabado
  - `07`: Material de Uso e Consumo
  - `09`: Serviços
  - (Outros códigos conforme necessidade)

### Tipo do Produto
- `tipoProduto`: Define a natureza tributária
  - `PRODUTO`: Item físico (usa ICMS, IPI, PIS, COFINS)
  - `SERVICO`: Serviço (usa ISS ao invés de ICMS)

### ISS (Imposto Sobre Serviços) - Apenas para Serviços
Aplicável quando `tipoProduto = 'SERVICO'`:
- `codigoServico`: Código do serviço no município
- `issRate`: Alíquota do ISS (%)
- `itemListaServico`: Item da lista de serviços conforme LC 116/2003

**Importante**: Se o produto for um serviço, use os campos ISS ao invés dos campos ICMS/IPI.

---

## Suporte

Para dúvidas ou problemas, entre em contato com a equipe de desenvolvimento.