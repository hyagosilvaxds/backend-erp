# Atualização de Produtos - Frontend v2

## Data: 30 de outubro de 2025

---

## 📋 Resumo das Alterações

Esta atualização corrige validações de campos e adiciona novos campos de preços ao módulo de produtos.

---

## ✨ Novos Campos Adicionados

### 1. **salePriceCash** (Preço à Vista)

Campo opcional para definir um preço específico para vendas à vista (diferente do preço padrão).

```typescript
{
  salePriceCash?: number; // Decimal(10,2)
}
```

**Uso no Frontend**:
```typescript
// Exemplo de formulário
{
  name: "Produto Exemplo",
  salePrice: 100.00,        // Preço padrão
  salePriceCash: 95.00,     // Preço à vista (5% desconto)
  salePriceInstallment: 110.00 // Preço parcelado
}
```

---

### 2. **minPrice** (Preço Mínimo - Alias)

Campo opcional para definir o preço mínimo de venda (funciona como alias de `minSalePrice`).

```typescript
{
  minPrice?: number; // Decimal(10,2)
}
```

**Uso no Frontend**:
```typescript
// Pode usar tanto minPrice quanto minSalePrice
{
  salePrice: 100.00,
  minPrice: 80.00,      // OU
  minSalePrice: 80.00   // Ambos funcionam
}
```

---

## 🔧 Correções de Validação

### 1. **Campo `type` agora aceito**

Anteriormente, o endpoint só aceitava `productType`. Agora você pode enviar `type` como alias.

**Antes** ❌:
```typescript
{
  "type": "SIMPLE" // Erro: property type should not exist
}
```

**Agora** ✅:
```typescript
{
  "type": "SIMPLE" // Aceito! Convertido automaticamente para productType
}
```

**ou**

```typescript
{
  "productType": "SIMPLE" // Também funciona
}
```

**Valores possíveis**:
- `SIMPLE`: Produto simples
- `COMPOSITE`: Produto composto
- `VARIABLE`: Produto com variações (use `VARIATION` também funciona)
- `COMBO`: Combo/kit

---

### 2. **DimensionType - Novos valores**

Adicionados valores `STANDARD` e `DETAILED` ao enum `DimensionType`.

**Antes** ❌:
```typescript
{
  "dimensionType": "STANDARD" // Erro: must be one of UNITS, CM, M, IN, FT
}
```

**Agora** ✅:
```typescript
{
  "dimensionType": "STANDARD" // Aceito!
}
```

**Valores possíveis**:
- `STANDARD`: Usar dimensões padrão da empresa
- `DETAILED`: Dimensões detalhadas
- `UNITS`: Unidades
- `CM`: Centímetros
- `M`: Metros
- `IN`: Polegadas
- `FT`: Pés

---

## 📝 Exemplo Completo de Payload

### Produto Físico Completo

```json
{
  "name": "Notebook Dell Inspiron 15",
  "description": "Notebook com Intel i7, 16GB RAM",
  "sku": "DELL-NB-001",
  "barcode": "7891234567890",
  "reference": "INS15-I7",
  
  "categoryId": "uuid-categoria",
  "brandId": "uuid-marca",
  "unitId": "uuid-unidade",
  
  "costPrice": 2500.00,
  "profitMargin": 30.00,
  "salePrice": 3250.00,
  "salePriceCash": 3100.00,
  "salePriceInstallment": 3400.00,
  "minPrice": 2800.00,
  "wholesalePrice": 2900.00,
  "minWholesaleQty": 5,
  
  "manageStock": true,
  "initialStock": 10,
  "minStock": 2,
  "maxStock": 50,
  
  "dimensionType": "DETAILED",
  "width": 35.8,
  "height": 2.3,
  "length": 24.5,
  "weight": 1.85,
  "grossWeight": 2.5,
  
  "expiryAlertDays": 0,
  "warrantyPeriod": 365,
  
  "type": "SIMPLE",
  "active": true,
  "availability": "AVAILABLE",
  
  "tipoProduto": "PRODUTO",
  "ncm": "84713012",
  "cfopEstadual": "5102",
  "cfopInterestadual": "6102",
  "icmsCst": "00",
  "icmsRate": 18.00
}
```

---

## 🎨 Sugestões de Interface

### Seção de Preços - Layout Recomendado

```
┌─────────────────────────────────────────┐
│ 💰 Preços                               │
├─────────────────────────────────────────┤
│ Preço de Custo: R$ [____]               │
│ Margem de Lucro: [___]%                 │
│                                         │
│ Preço de Venda: R$ [____]  (principal) │
│ Preço à Vista: R$ [____]   (opcional)  │
│ Preço Parcelado: R$ [____] (opcional)  │
│                                         │
│ Preço Mínimo: R$ [____]    (opcional)  │
│                                         │
│ Preço Atacado: R$ [____]   (opcional)  │
│ Qtd Mínima Atacado: [___]  (opcional)  │
└─────────────────────────────────────────┘
```

### Validações Sugeridas no Frontend

```typescript
// Validar que salePriceCash <= salePrice
if (salePriceCash && salePriceCash > salePrice) {
  error("Preço à vista não pode ser maior que preço padrão");
}

// Validar que salePriceInstallment >= salePrice
if (salePriceInstallment && salePriceInstallment < salePrice) {
  warning("Preço parcelado geralmente é maior que preço padrão");
}

// Validar que minPrice <= salePrice
if (minPrice && minPrice > salePrice) {
  error("Preço mínimo não pode ser maior que preço de venda");
}

// Validar que wholesalePrice >= costPrice
if (wholesalePrice && wholesalePrice < costPrice) {
  error("Preço de atacado não pode ser menor que custo");
}
```

---

## 🔄 Campos Opcionais vs Obrigatórios

### Obrigatórios ✅

- `name`: Nome do produto
- `salePrice`: Preço de venda padrão
- `costPrice`: Preço de custo

### Opcionais (podem ser null/undefined)

- `salePriceCash`: Preço à vista
- `salePriceInstallment`: Preço parcelado
- `minPrice`: Preço mínimo (alias)
- `minSalePrice`: Preço mínimo de venda
- `wholesalePrice`: Preço de atacado
- `minWholesaleQty`: Quantidade mínima para atacado
- `type`: Tipo do produto (aceito como alias de productType)
- `dimensionType`: Tipo de dimensão (agora aceita STANDARD e DETAILED)

---

## 📊 TypeScript Interfaces Atualizadas

```typescript
// Interface para criação de produto
interface CreateProductDto {
  // Básico
  name: string;
  description?: string;
  sku?: string;
  barcode?: string;
  reference?: string;
  
  // Relacionamentos
  categoryId?: string;
  brandId?: string;
  unitId?: string;
  
  // Preços (ATUALIZADO)
  costPrice: number;
  profitMargin?: number;
  salePrice: number;
  salePriceCash?: number;        // NOVO
  salePriceInstallment?: number;
  minPrice?: number;             // NOVO
  minSalePrice?: number;
  wholesalePrice?: number;
  minWholesaleQty?: number;
  
  // Estoque
  manageStock?: boolean;
  initialStock?: number;
  minStock?: number;
  maxStock?: number;
  
  // Dimensões (ATUALIZADO)
  dimensionType?: 'STANDARD' | 'DETAILED' | 'UNITS' | 'CM' | 'M' | 'IN' | 'FT';
  width?: number;
  height?: number;
  length?: number;
  weight?: number;
  grossWeight?: number;
  
  // Tipo (ATUALIZADO)
  type?: 'SIMPLE' | 'COMPOSITE' | 'VARIABLE' | 'COMBO';  // ACEITO AGORA
  productType?: 'SIMPLE' | 'COMPOSITE' | 'VARIABLE' | 'COMBO';
  
  // Status
  active?: boolean;
  availability?: 'AVAILABLE' | 'OUT_OF_STOCK' | 'PRE_ORDER' | 'DISCONTINUED';
  
  // Fiscal
  tipoProduto?: 'PRODUTO' | 'SERVICO';
  ncm?: string;
  cfopEstadual?: string;
  cfopInterestadual?: string;
  // ... outros campos fiscais
}

// Enum para DimensionType
enum DimensionType {
  STANDARD = 'STANDARD',   // NOVO
  DETAILED = 'DETAILED',   // NOVO
  UNITS = 'UNITS',
  CM = 'CM',
  M = 'M',
  IN = 'IN',
  FT = 'FT',
}
```

---

## 🧪 Testes Recomendados

### 1. Testar Campo `type`

```bash
curl -X POST http://localhost:4000/products \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Produto Teste",
    "salePrice": 100,
    "costPrice": 50,
    "type": "SIMPLE"
  }'
```

**Esperado**: ✅ 201 Created

---

### 2. Testar `salePriceCash`

```bash
curl -X POST http://localhost:4000/products \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Produto com Desconto à Vista",
    "costPrice": 50,
    "salePrice": 100,
    "salePriceCash": 95
  }'
```

**Esperado**: ✅ 201 Created

---

### 3. Testar `dimensionType: STANDARD`

```bash
curl -X POST http://localhost:4000/products \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Produto com Dimensão Padrão",
    "costPrice": 50,
    "salePrice": 100,
    "dimensionType": "STANDARD",
    "width": 10,
    "height": 5,
    "length": 20
  }'
```

**Esperado**: ✅ 201 Created

---

## 🚨 Breaking Changes

**Nenhuma quebra de compatibilidade!** 

Todas as alterações são **retrocompatíveis**:
- Campos antigos continuam funcionando
- Novos campos são opcionais
- `type` é aceito como alias (não substitui `productType`)

---

## 📞 Suporte

Dúvidas sobre a implementação? Entre em contato com a equipe de backend.

---

## 🔗 Referências

- [Documentação Completa da API](./API_PRODUCTS.md)
- [Atualização Fiscal v1](./FRONTEND_UPDATE_FISCAL_PRODUTOS.md)
