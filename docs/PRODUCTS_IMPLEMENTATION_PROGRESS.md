# 📦 Módulo de Produtos - Implementação

## Status: EM PROGRESSO 🔄

---

## ✅ O Que Foi Feito

### 1. **Database Schema (Prisma)**

#### Modelos Criados:

**ProductCategory** - Categorias e Subcategorias
- ✅ name, description, parentId (hierarquia)
- ✅ Relação recursiva para subcategorias
- ✅ Unique constraint: companyId + name + parentId

**ProductUnit** - Unidades de Medida
- ✅ name, abbreviation (ex: Unidade/UN, Litro/L)
- ✅ Unique constraint: companyId + abbreviation

**ProductBrand** - Marcas
- ✅ name, description
- ✅ Unique constraint: companyId + name

**Product** - Produto Principal
- ✅ **Informações Básicas**: name, description, sku, barcode, reference
- ✅ **Preços**: costPrice, profitMargin, salePrice, salePriceInstallment, minSalePrice, wholesalePrice, minWholesaleQty
- ✅ **Estoque**: manageStock, currentStock, initialStock, minStock, maxStock
- ✅ **Dimensões**: dimensionType, width, height, length, weight, grossWeight
- ✅ **Validade**: expiryAlertDays, warrantyPeriod
- ✅ **Tipo**: productType (SIMPLE, COMPOSITE, VARIABLE, COMBO)
- ✅ **Status**: active, availability (AVAILABLE, OUT_OF_STOCK, PRE_ORDER, DISCONTINUED)
- ✅ **Observações**: notes
- ✅ **Fiscal**: ncm, cest, origin, icmsCst, icmsRate, icmsModBc, ipiCst, ipiRate, pisCst, pisRate, cofinsCst, cofinsRate

**ProductPhoto** - Fotos do Produto
- ✅ documentId (referência ao hub de documentos)
- ✅ isPrimary, order

**ProductVariation** - Variações (Tamanho, Cor, etc)
- ✅ name, sku, barcode
- ✅ Preços e estoque específicos
- ✅ attributes (JSON)

**ProductComposite** - Produtos Compostos (Receita)
- ✅ compositeId, componentId, quantity

**ProductCombo** - Combos/Kits
- ✅ comboId, itemId, quantity

**ProductStockMovement** - Movimentação de Estoque
- ✅ type (ENTRY, EXIT, ADJUSTMENT, RETURN, LOSS, TRANSFER)
- ✅ quantity, previousStock, newStock
- ✅ reason, notes, reference

#### Migration:
- ✅ **20251029213111_add_products_module** - Aplicada com sucesso

---

### 2. **DTOs Criados**

#### Categoria:
- ✅ `CreateProductCategoryDto`
- ✅ `UpdateProductCategoryDto`

#### Unidade:
- ✅ `CreateProductUnitDto`
- ✅ `UpdateProductUnitDto`

#### Marca:
- ✅ `CreateProductBrandDto`
- ✅ `UpdateProductBrandDto`

#### Produto:
- ✅ `CreateProductDto` (completo com todas as validações)
- ✅ `UpdateProductDto`
- ✅ `QueryProductsDto` (busca e filtros)

#### Validações Incluídas:
- ✅ class-validator decorators
- ✅ Transform para conversão de tipos
- ✅ Enums: ProductType, ProductAvailability, DimensionType
- ✅ Min/Max values
- ✅ Optional fields

---

### 3. **Módulo NestJS**

- ✅ `products.module.ts` - Criado
- ✅ `products.controller.ts` - Criado
- ✅ `products.service.ts` - Criado

---

## ⏳ Próximos Passos

### 4. **Service Implementation**

**Métodos Necessários:**

**Categorias:**
- [ ] createCategory()
- [ ] updateCategory()
- [ ] deleteCategory()
- [ ] findAllCategories()
- [ ] findCategoryById()

**Unidades:**
- [ ] createUnit()
- [ ] updateUnit()
- [ ] deleteUnit()
- [ ] findAllUnits()

**Marcas:**
- [ ] createBrand()
- [ ] updateBrand()
- [ ] deleteBrand()
- [ ] findAllBrands()

**Produtos:**
- [ ] createProduct()
- [ ] updateProduct()
- [ ] deleteProduct()
- [ ] findAllProducts() (com filtros)
- [ ] findProductById()
- [ ] updateStock()
- [ ] getLowStockProducts()
- [ ] addProductPhoto()
- [ ] removeProductPhoto()
- [ ] setPrimaryPhoto()

**Variações:**
- [ ] addVariation()
- [ ] updateVariation()
- [ ] deleteVariation()

**Compostos:**
- [ ] addComponent()
- [ ] removeComponent()
- [ ] updateComponentQuantity()

**Combos:**
- [ ] addComboItem()
- [ ] removeComboItem()
- [ ] updateComboItemQuantity()

**Estoque:**
- [ ] addStockMovement()
- [ ] getStockHistory()

---

### 5. **Controller Implementation**

**Endpoints a Criar:**

**Categorias:**
- [ ] `POST /products/categories`
- [ ] `GET /products/categories`
- [ ] `GET /products/categories/:id`
- [ ] `PATCH /products/categories/:id`
- [ ] `DELETE /products/categories/:id`

**Unidades:**
- [ ] `POST /products/units`
- [ ] `GET /products/units`
- [ ] `PATCH /products/units/:id`
- [ ] `DELETE /products/units/:id`

**Marcas:**
- [ ] `POST /products/brands`
- [ ] `GET /products/brands`
- [ ] `PATCH /products/brands/:id`
- [ ] `DELETE /products/brands/:id`

**Produtos:**
- [ ] `POST /products`
- [ ] `GET /products`
- [ ] `GET /products/:id`
- [ ] `PATCH /products/:id`
- [ ] `DELETE /products/:id`
- [ ] `GET /products/low-stock`
- [ ] `POST /products/:id/photos`
- [ ] `DELETE /products/:id/photos/:photoId`
- [ ] `PATCH /products/:id/photos/:photoId/primary`

**Variações:**
- [ ] `POST /products/:id/variations`
- [ ] `PATCH /products/:id/variations/:variationId`
- [ ] `DELETE /products/:id/variations/:variationId`

**Compostos:**
- [ ] `POST /products/:id/components`
- [ ] `DELETE /products/:id/components/:componentId`

**Combos:**
- [ ] `POST /products/:id/combo-items`
- [ ] `DELETE /products/:id/combo-items/:itemId`

**Estoque:**
- [ ] `POST /products/:id/stock-movement`
- [ ] `GET /products/:id/stock-history`

---

### 6. **Integração com Documentos**

- [ ] Criar pasta "Fotos de Produtos" no hub de documentos
- [ ] Implementar upload de fotos via DocumentsService
- [ ] Vincular fotos via ProductPhoto model

---

### 7. **Permissões**

**Criar Permissões:**
- [ ] `products.read` - Visualizar produtos
- [ ] `products.create` - Criar produtos
- [ ] `products.update` - Editar produtos
- [ ] `products.delete` - Deletar produtos
- [ ] `products.manage_stock` - Gerenciar estoque

**Seeds:**
- [ ] Criar seed de permissões de produtos
- [ ] Atribuir permissões à role admin

---

### 8. **Auditoria**

**Ações para Auditar:**
- [ ] CREATE_PRODUCT
- [ ] UPDATE_PRODUCT
- [ ] DELETE_PRODUCT
- [ ] ADD_STOCK
- [ ] REMOVE_STOCK
- [ ] ADJUST_STOCK
- [ ] ADD_PHOTO
- [ ] REMOVE_PHOTO

---

### 9. **Documentação**

- [ ] Criar `docs/API_PRODUCTS.md`
- [ ] Documentar todos os endpoints
- [ ] Exemplos de uso
- [ ] Guia de integração

---

### 10. **Testes**

- [ ] Unit tests para service
- [ ] E2E tests para endpoints
- [ ] Testar validações
- [ ] Testar cálculos de estoque

---

## 📊 Estrutura de Dados Criada

### Product (Completo)

```typescript
{
  // Básico
  id: UUID
  name: string
  description?: string
  sku?: string
  barcode?: string
  reference?: string
  
  // Categoria
  categoryId?: UUID
  brandId?: UUID
  
  // Preços
  costPrice: Decimal(10,2)
  profitMargin: Decimal(5,2)
  salePrice: Decimal(10,2)
  salePriceInstallment: Decimal(10,2)
  minSalePrice: Decimal(10,2)
  wholesalePrice?: Decimal(10,2)
  minWholesaleQty?: int
  
  // Estoque
  manageStock: boolean
  currentStock: Decimal(10,3)
  initialStock: Decimal(10,3)
  minStock: Decimal(10,3)
  maxStock?: Decimal(10,3)
  
  // Unidade
  unitId?: UUID
  
  // Dimensões
  dimensionType?: string
  width?: Decimal(10,2)
  height?: Decimal(10,2)
  length?: Decimal(10,2)
  weight?: Decimal(10,3)
  grossWeight?: Decimal(10,3)
  
  // Validade
  expiryAlertDays?: int
  warrantyPeriod?: int
  
  // Tipo
  productType: 'SIMPLE' | 'COMPOSITE' | 'VARIABLE' | 'COMBO'
  isComposite: boolean
  hasVariations: boolean
  isCombo: boolean
  
  // Status
  active: boolean
  availability: 'AVAILABLE' | 'OUT_OF_STOCK' | 'PRE_ORDER' | 'DISCONTINUED'
  
  // Observações
  notes?: string
  
  // Fiscal
  ncm?: string (8 chars)
  cest?: string (7 chars)
  origin?: string (1 char)
  icmsCst?: string (3 chars)
  icmsRate?: Decimal(5,2)
  icmsModBc?: string (1 char)
  ipiCst?: string (2 chars)
  ipiRate?: Decimal(5,2)
  pisCst?: string (2 chars)
  pisRate?: Decimal(5,2)
  cofinsCst?: string (2 chars)
  cofinsRate?: Decimal(5,2)
  
  // Auditoria
  createdById?: UUID
  createdAt: DateTime
  updatedAt: DateTime
}
```

---

## 🔑 Campos Únicos e Índices

### Unique Constraints:
- ✅ `[companyId, barcode]` - Código de barras único por empresa
- ✅ `[companyId, sku]` - SKU único por empresa
- ✅ `[companyId, name, parentId]` - Categoria única (nome + pai)
- ✅ `[companyId, abbreviation]` - Abreviação de unidade única
- ✅ `[companyId, name]` - Nome de marca único

### Índices:
- ✅ companyId (todos os modelos)
- ✅ categoryId, brandId, unitId (Product)
- ✅ barcode, sku (Product)
- ✅ active, productType (Product)
- ✅ productId (fotos, variações, compostos, combos, movimentações)

---

## 📁 Arquivos Criados

```
src/products/
├── dto/
│   ├── create-product-category.dto.ts  ✅
│   ├── update-product-category.dto.ts  ✅
│   ├── create-product-unit.dto.ts      ✅
│   ├── update-product-unit.dto.ts      ✅
│   ├── create-product-brand.dto.ts     ✅
│   ├── update-product-brand.dto.ts     ✅
│   ├── create-product.dto.ts           ✅
│   ├── update-product.dto.ts           ✅
│   └── query-products.dto.ts           ✅
├── products.controller.ts               ✅ (vazio)
├── products.service.ts                  ✅ (vazio)
└── products.module.ts                   ✅

prisma/
├── schema.prisma                        ✅ (atualizado)
└── migrations/
    └── 20251029213111_add_products_module/
        └── migration.sql                ✅
```

---

## 🎯 Próxima Ação Recomendada

**Implementar ProductsService com os métodos principais:**
1. CRUD de Categorias
2. CRUD de Unidades
3. CRUD de Marcas
4. CRUD de Produtos
5. Gestão de Fotos
6. Gestão de Estoque

Após implementar o service, criar o controller com todos os endpoints e finalmente a documentação.

---

**Documentação gerada em:** 29 de outubro de 2025  
**Status:** 30% completo
