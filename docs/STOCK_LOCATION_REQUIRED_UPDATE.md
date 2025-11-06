# Atualização Obrigatória - Locais de Estoque com Múltiplos Locais

**Data**: 4 de novembro de 2025  
**Versão da API**: 1.3.0  
**Breaking Change**: ⚠️ SIM

## 📋 Resumo das Mudanças

### Mudanças Obrigatórias

1. **Todo estoque deve estar vinculado a um local**
2. **Criação de produtos aceita MÚLTIPLOS locais com quantidades diferentes**
3. **Movimentações de estoque DEVEM informar `locationId` (obrigatório)**

---

## 🚨 Breaking Changes

### 1. Criação de Produtos (NOVO - Múltiplos Locais)

**ANTES** (versão antiga):
```json
POST /products
{
  "name": "Produto X",
  "salePrice": 100,
  "manageStock": true,
  "initialStock": 10
}
```

**AGORA** (com múltiplos locais):
```json
POST /products
{
  "name": "Produto X",
  "salePrice": 100,
  "manageStock": true,
  "initialStockByLocations": [
    {
      "locationId": "uuid-deposito",
      "quantity": 50
    },
    {
      "locationId": "uuid-loja-1",
      "quantity": 30
    },
    {
      "locationId": "uuid-loja-2",
      "quantity": 20
    }
  ]
}
```

**Estoque Total**: 100 unidades (50 + 30 + 20)

**Validações**:
- ✅ Aceita array vazio (produto sem estoque inicial)
- ✅ Valida se todos os `locationId` existem e estão ativos
- ✅ Calcula estoque total automaticamente (soma de todas as quantidades)
- ✅ Cria registros de estoque separados para cada local
- ✅ Cria movimentações de estoque separadas para cada local
- ❌ Se algum `locationId` não existir, retorna erro
- ❌ Se algum local estiver inativo, retorna erro

---

### 2. Movimentações de Estoque (OBRIGATÓRIO - Sem Mudanças)

**ANTES** (não funcionará mais):
```json
POST /products/:id/stock-movement
{
  "type": "ENTRY",
  "quantity": 50,
  "reason": "Compra"
  // ❌ Sem locationId
}
```

**AGORA** (obrigatório):
```json
POST /products/:id/stock-movement
{
  "type": "ENTRY",
  "quantity": 50,
  "locationId": "uuid-do-local",  // ✅ OBRIGATÓRIO
  "reason": "Compra"
}
```

---

## 📝 Fluxos de Uso

### Fluxo 1: Criar Produto em Múltiplos Locais

```typescript
// 1. Criar locais de estoque
const deposito = await api.post('/products/stock-locations', {
  name: 'Depósito Central',
  code: 'DEP-01',
  isDefault: true,
  active: true
});

const loja1 = await api.post('/products/stock-locations', {
  name: 'Loja Shopping',
  code: 'LOJA-01',
  active: true
});

const loja2 = await api.post('/products/stock-locations', {
  name: 'Loja Centro',
  code: 'LOJA-02',
  active: true
});

// 2. Criar produto com estoque em múltiplos locais
const product = await api.post('/products', {
  name: 'Notebook Dell Inspiron 15',
  sku: 'DELL-NB-001',
  salePrice: 3500,
  costPrice: 2500,
  manageStock: true,
  unitId: unitId,
  categoryId: categoryId,
  
  // ✅ Array com estoque em cada local
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
console.log('Estoque total:', product.data.currentStock); // 135 unidades
```

---

### Fluxo 2: Consultar Estoque por Local

```typescript
// Ver estoque do produto em todos os locais
const stockData = await api.get(`/products/${productId}/stock-by-location`);

console.log(`${stockData.product.name}`);
console.log(`Estoque Total: ${stockData.product.totalStock} unidades\n`);

console.log('Por Local:');
stockData.stocksByLocation.forEach(stock => {
  console.log(`  ${stock.location.name} (${stock.location.code}): ${stock.quantity} un`);
});

// Output:
// Notebook Dell Inspiron 15
// Estoque Total: 135 unidades
//
// Por Local:
//   Depósito Central (DEP-01): 100 un
//   Loja Shopping (LOJA-01): 20 un
//   Loja Centro (LOJA-02): 15 un
```

---

### Fluxo 3: Criar Produto SEM Estoque Inicial

```typescript
// Produto sem estoque inicial (será adicionado depois)
const product = await api.post('/products', {
  name: 'Mouse Logitech',
  salePrice: 150,
  manageStock: true,
  unitId: unitId,
  // initialStockByLocations não informado ou array vazio
  initialStockByLocations: []
});

// Adicionar estoque depois via movimentação
await api.post(`/products/${product.data.id}/stock-movement`, {
  type: 'ENTRY',
  quantity: 50,
  locationId: depositoId,
  reason: 'Compra fornecedor XYZ',
  reference: 'NF-12345'
});
```

---

## 💻 Exemplos Completos

### Exemplo 1: E-commerce com Múltiplos Centros de Distribuição

```typescript
// Cenário: Loja online com 3 centros de distribuição

const product = await api.post('/products', {
  name: 'Smart TV Samsung 55"',
  sku: 'TV-SAM-55-001',
  salePrice: 2499,
  costPrice: 1800,
  manageStock: true,
  unitId: unidadeId,
  
  initialStockByLocations: [
    {
      locationId: cdSudeste,
      quantity: 200  // CD Sudeste (maior demanda)
    },
    {
      locationId: cdSul,
      quantity: 80   // CD Sul
    },
    {
      locationId: cdNordeste,
      quantity: 120  // CD Nordeste
    }
  ]
});

// Estoque total: 400 unidades distribuídas estrategicamente
```

---

### Exemplo 2: Rede de Lojas Físicas

```typescript
// Cenário: Rede com 1 depósito e 5 lojas

const product = await api.post('/products', {
  name: 'Tênis Nike Air Max',
  sku: 'NIKE-AM-001',
  salePrice: 699,
  manageStock: true,
  unitId: unidadeId,
  
  initialStockByLocations: [
    {
      locationId: depositoCentral,
      quantity: 500  // Estoque principal no depósito
    },
    {
      locationId: lojaShoppingIguatemi,
      quantity: 50   // Loja premium
    },
    {
      locationId: lojaShoppingMorumbi,
      quantity: 40
    },
    {
      locationId: lojaAvenidaPaulista,
      quantity: 35
    },
    {
      locationId: lojaShoppingEldorado,
      quantity: 30
    },
    {
      locationId: lojaRuaOscarFreire,
      quantity: 25
    }
  ]
});

// Estoque total: 680 unidades
// Depósito: 500 un
// Lojas: 180 un (distribuídas)
```

---

### Exemplo 3: Produto com Variação de Tamanho

```typescript
// Cenário: Camiseta disponível em múltiplos tamanhos e locais

// Camiseta P
const camisetaP = await api.post('/products', {
  name: 'Camiseta Polo - Tamanho P',
  sku: 'CAM-POLO-P',
  salePrice: 89.90,
  manageStock: true,
  
  initialStockByLocations: [
    { locationId: deposito, quantity: 100 },
    { locationId: loja1, quantity: 20 },
    { locationId: loja2, quantity: 15 }
  ]
});

// Camiseta M
const camisetaM = await api.post('/products', {
  name: 'Camiseta Polo - Tamanho M',
  sku: 'CAM-POLO-M',
  salePrice: 89.90,
  manageStock: true,
  
  initialStockByLocations: [
    { locationId: deposito, quantity: 150 },  // M tem mais demanda
    { locationId: loja1, quantity: 30 },
    { locationId: loja2, quantity: 25 }
  ]
});

// Camiseta G
const camisetaG = await api.post('/products', {
  name: 'Camiseta Polo - Tamanho G',
  sku: 'CAM-POLO-G',
  salePrice: 89.90,
  manageStock: true,
  
  initialStockByLocations: [
    { locationId: deposito, quantity: 120 },
    { locationId: loja1, quantity: 25 },
    { locationId: loja2, quantity: 20 }
  ]
});
```

---

## 🔍 Validações Implementadas

### Criação de Produto com Múltiplos Locais

| Cenário | Comportamento |
|---------|---------------|
| ✅ Array com múltiplos locais válidos | Cria estoque em todos os locais |
| ✅ Array vazio | Cria produto sem estoque inicial |
| ✅ `initialStockByLocations` não informado | Cria produto sem estoque inicial |
| ❌ `locationId` não existe | Erro: "Local de estoque {id} não encontrado" |
| ❌ `locationId` de outra empresa | Erro: "Local de estoque {id} não encontrado" |
| ❌ Local inativo | Erro: "Local de estoque '{nome}' está inativo" |
| ❌ Quantidade negativa | Erro de validação do DTO |
| ❌ `locationId` duplicado no array | Cria apenas uma entrada (último valor) |

---

## 📊 Novos DTOs

### InitialStockByLocationDto (NOVO)

```typescript
{
  locationId: string;  // UUID do local
  quantity: number;    // Quantidade no local (>= 0)
}
```

---

### CreateProductDto (Atualizado)

```typescript
{
  name: string;                           // Obrigatório
  salePrice: number;                      // Obrigatório
  manageStock?: boolean;                  // Opcional, default: true
  
  // ✅ NOVO - Array de estoques por local
  initialStockByLocations?: [
    {
      locationId: string;
      quantity: number;
    }
  ];
  
  minStock?: number;
  maxStock?: number;
  unitId?: string;
  // ... outros campos
}
```

---

### O que acontece internamente

Quando você cria um produto com:
```json
{
  "name": "Produto X",
  "initialStockByLocations": [
    { "locationId": "loc-1", "quantity": 50 },
    { "locationId": "loc-2", "quantity": 30 }
  ]
}
```

O sistema faz:

1. **Valida todos os locais** antes de criar o produto
2. **Calcula estoque total**: 50 + 30 = 80
3. **Cria o produto** com `currentStock: 80`
4. **Cria 2 registros em `ProductStockByLocation`**:
   - Produto X no loc-1: 50 unidades
   - Produto X no loc-2: 30 unidades
5. **Cria 2 movimentações** em `ProductStockMovement`:
   - ENTRY de 50 unidades no loc-1 (motivo: "Estoque inicial")
   - ENTRY de 30 unidades no loc-2 (motivo: "Estoque inicial")

---

## ✅ Checklist de Atualização Frontend

### Obrigatório
- [ ] **Atualizar formulário de criação de produtos** ⚠️
  - [ ] Remover campo simples `initialStock` e `locationId`
  - [ ] Adicionar componente para múltiplos locais
  - [ ] Permitir adicionar/remover linhas de locais
  - [ ] Validar quantidade >= 0
  - [ ] Mostrar estoque total calculado
- [ ] **Campo `locationId` obrigatório em movimentações** ⚠️

### Recomendado
- [ ] Criar componente reutilizável `StockByLocationInput`
- [ ] Adicionar preview do estoque total antes de salvar
- [ ] Permitir copiar distribuição de estoque de outro produto
- [ ] Sugerir locais padrão baseado em histórico
- [ ] Validar se soma das quantidades == estoque total desejado

---

## 🎯 Componente React Sugerido

### MultiLocationStockInput.tsx

```tsx
import React, { useState } from 'react';

interface StockByLocation {
  locationId: string;
  quantity: number;
}

interface Props {
  value: StockByLocation[];
  onChange: (value: StockByLocation[]) => void;
  locations: Array<{ id: string; name: string; code: string }>;
}

export function MultiLocationStockInput({ value, onChange, locations }: Props) {
  const addLocation = () => {
    onChange([...value, { locationId: '', quantity: 0 }]);
  };

  const removeLocation = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const updateLocation = (index: number, field: keyof StockByLocation, newValue: any) => {
    const updated = value.map((item, i) =>
      i === index ? { ...item, [field]: newValue } : item
    );
    onChange(updated);
  };

  const totalStock = value.reduce((sum, item) => sum + (item.quantity || 0), 0);

  return (
    <div className="multi-location-stock">
      <h4>Estoque Inicial por Local</h4>
      
      {value.map((item, index) => (
        <div key={index} className="stock-location-row">
          <select
            value={item.locationId}
            onChange={(e) => updateLocation(index, 'locationId', e.target.value)}
            required
          >
            <option value="">Selecione o local...</option>
            {locations.map(loc => (
              <option key={loc.id} value={loc.id}>
                {loc.code} - {loc.name}
              </option>
            ))}
          </select>

          <input
            type="number"
            min="0"
            step="1"
            value={item.quantity}
            onChange={(e) => updateLocation(index, 'quantity', parseFloat(e.target.value) || 0)}
            placeholder="Quantidade"
            required
          />

          {value.length > 1 && (
            <button type="button" onClick={() => removeLocation(index)}>
              ✕ Remover
            </button>
          )}
        </div>
      ))}

      <button type="button" onClick={addLocation}>
        + Adicionar Local
      </button>

      <div className="total-stock">
        <strong>Estoque Total:</strong> {totalStock} unidades
      </div>
    </div>
  );
}
```

### Uso:

```tsx
function CreateProductForm() {
  const [formData, setFormData] = useState({
    name: '',
    salePrice: 0,
    initialStockByLocations: [
      { locationId: '', quantity: 0 }
    ]
  });

  return (
    <form>
      {/* Outros campos... */}
      
      <MultiLocationStockInput
        value={formData.initialStockByLocations}
        onChange={(locations) => 
          setFormData({ ...formData, initialStockByLocations: locations })
        }
        locations={availableLocations}
      />
      
      <button type="submit">Criar Produto</button>
    </form>
  );
}
```

---

## 🔄 Migração de Código Existente

### ANTES:
```typescript
const product = await api.post('/products', {
  name: 'Produto',
  salePrice: 100,
  locationId: depositoId,     // ❌ Campo removido
  initialStock: 50            // ❌ Campo removido
});
```

### DEPOIS:
```typescript
const product = await api.post('/products', {
  name: 'Produto',
  salePrice: 100,
  initialStockByLocations: [  // ✅ Novo formato
    {
      locationId: depositoId,
      quantity: 50
    }
  ]
});
```

---

## 🆘 Tratamento de Erros

### Erro: Local não encontrado

```json
{
  "message": "Local de estoque abc123 não encontrado",
  "error": "Not Found",
  "statusCode": 404
}
```

**Solução**: Verificar se o `locationId` está correto e pertence à empresa

---

### Erro: Local inativo

```json
{
  "message": "Local de estoque 'Loja Antiga' está inativo",
  "error": "Bad Request",
  "statusCode": 400
}
```

**Solução**: Ativar o local ou usar outro local ativo

---

## 📞 Suporte

Para dúvidas ou problemas:
- Consulte `/docs/STOCK_LOCATIONS_FRONTEND_UPDATE.md` para documentação completa
- Consulte `/docs/API_PRODUCTS.md` para referência da API

**Versão do Documento**: 2.0  
**Última Atualização**: 04/11/2025

---

## 📝 Fluxo Recomendado

### Passo 1: Criar Local de Estoque (Recomendado)

Antes de criar produtos, **crie pelo menos um local de estoque e marque como padrão**:

```bash
POST /products/stock-locations
{
  "name": "Estoque Principal",
  "code": "EST-01",
  "isDefault": true,
  "active": true
}
```

**Resposta**:
```json
{
  "id": "uuid-do-local",
  "name": "Estoque Principal",
  "code": "EST-01",
  "isDefault": true,
  "active": true
}
```

---

### Passo 2: Criar Produto

**Opção A - Com `locationId` específico**:
```bash
POST /products
{
  "name": "Notebook Dell",
  "sku": "DELL-001",
  "salePrice": 3500,
  "manageStock": true,
  "locationId": "uuid-do-local",  // ✅ Específico
  "initialStock": 10,
  "unitId": "uuid-unidade"
}
```

**Opção B - Sem `locationId` (usa local padrão)**:
```bash
POST /products
{
  "name": "Notebook Dell",
  "sku": "DELL-001",
  "salePrice": 3500,
  "manageStock": true,
  // locationId não informado - usará local padrão
  "initialStock": 10,
  "unitId": "uuid-unidade"
}
```

---

### Passo 3: Movimentar Estoque (locationId OBRIGATÓRIO)

Todas as movimentações devem informar o local:

```bash
POST /products/:id/stock-movement
{
  "type": "ENTRY",
  "quantity": 50,
  "locationId": "uuid-do-local",  // ✅ Obrigatório
  "reason": "Compra do fornecedor XYZ",
  "reference": "NF-12345"
}
```

---

## 🔍 Validações Implementadas

### Criação de Produto

| Cenário | Comportamento |
|---------|---------------|
| ✅ `locationId` informado e válido | Cria estoque no local especificado |
| ✅ `locationId` não informado | Busca local padrão (`isDefault: true`) |
| ❌ `locationId` informado mas não existe | Erro: "Local de estoque não encontrado" |
| ❌ `locationId` de outra empresa | Erro: "Local de estoque não encontrado" |
| ❌ `locationId` de local inativo | Erro: "Local de estoque está inativo" |
| ❌ Sem `locationId` e sem local padrão | Erro: "Nenhum local de estoque encontrado. Crie um local..." |

---

### Movimentação de Estoque

| Validação | Mensagem de Erro |
|-----------|------------------|
| ❌ `locationId` não informado | "locationId must be a UUID" |
| ❌ `locationId` não existe | "Local de estoque não encontrado" |
| ❌ `locationId` de outra empresa | "Local de estoque não encontrado" |
| ❌ Local inativo | "Local de estoque está inativo" |
| ❌ Estoque insuficiente (EXIT/LOSS) | "Estoque insuficiente no local" |

---

## 💻 Exemplos Completos

### Exemplo 1: Setup Inicial Completo

```typescript
// 1. Criar local de estoque padrão
const location = await api.post('/products/stock-locations', {
  name: 'Depósito Central',
  code: 'DEP-01',
  description: 'Depósito principal da empresa',
  isDefault: true,
  active: true
});
console.log('Local criado:', location.data.id);

// 2. Criar unidade
const unit = await api.post('/products/units', {
  name: 'Unidade',
  abbreviation: 'UN',
  active: true
});

// 3. Criar produto SEM especificar locationId (usará local padrão)
const product = await api.post('/products', {
  name: 'Mouse Logitech',
  sku: 'LOG-MS-001',
  salePrice: 150,
  costPrice: 100,
  manageStock: true,
  // locationId não informado - usará "Depósito Central" automaticamente
  initialStock: 50,
  minStock: 10,
  unitId: unit.data.id,
  active: true
});

console.log('Produto criado com estoque de 50 unidades no local padrão');
```

---

### Exemplo 2: Múltiplos Locais

```typescript
// 1. Criar locais
const deposito = await api.post('/products/stock-locations', {
  name: 'Depósito Central',
  code: 'DEP-01',
  isDefault: true,
  active: true
});

const loja1 = await api.post('/products/stock-locations', {
  name: 'Loja Shopping',
  code: 'LOJA-01',
  active: true
});

// 2. Criar produto no depósito (especificando locationId)
const product = await api.post('/products', {
  name: 'Teclado Mecânico',
  salePrice: 450,
  manageStock: true,
  locationId: deposito.data.id,  // ✅ Explicitamente no depósito
  initialStock: 100,
  unitId: unitId
});

// 3. Adicionar estoque na loja via movimentação
await api.post(`/products/${product.data.id}/stock-movement`, {
  type: 'ENTRY',
  quantity: 20,
  locationId: loja1.data.id,  // ✅ Obrigatório
  reason: 'Entrada inicial na loja',
  reference: 'MOV-001'
});

// Ou usar transferência
const transfer = await api.post('/products/stock-transfers', {
  fromLocationId: deposito.data.id,
  toLocationId: loja1.data.id,
  items: [{
    productId: product.data.id,
    quantity: 20
  }],
  notes: 'Transferência inicial para loja'
});

await api.patch(`/products/stock-transfers/${transfer.data.id}/approve`);
await api.patch(`/products/stock-transfers/${transfer.data.id}/complete`);
```

---

### Exemplo 3: Consultar Estoque por Local

```typescript
// Ver estoque de um produto em todos os locais
const stockByLocation = await api.get(`/products/${productId}/stock-by-location`);

console.log('Estoque Total:', stockByLocation.data.product.totalStock);
stockByLocation.data.stocksByLocation.forEach(stock => {
  console.log(`  ${stock.location.name}: ${stock.quantity} un`);
});

// Output:
// Estoque Total: 120
//   Depósito Central: 100 un
//   Loja Shopping: 20 un
```

---

## 🔄 Migração de Dados Existentes

### Se você já tem produtos cadastrados

Você precisará:

1. **Criar pelo menos um local de estoque padrão**
2. **Vincular produtos existentes a este local**

```typescript
// 1. Criar local padrão
const location = await api.post('/products/stock-locations', {
  name: 'Estoque Principal',
  code: 'EST-01',
  isDefault: true,
  active: true
});

// 2. Script de migração (executar no backend/Prisma)
const products = await prisma.product.findMany({
  where: {
    companyId: 'your-company-id',
    manageStock: true,
    currentStock: { gt: 0 }
  }
});

for (const product of products) {
  // Criar registro de estoque no local
  await prisma.productStockByLocation.create({
    data: {
      companyId: product.companyId,
      productId: product.id,
      locationId: location.data.id,
      quantity: product.currentStock
    }
  });

  // Criar movimentação histórica
  await prisma.productStockMovement.create({
    data: {
      companyId: product.companyId,
      productId: product.id,
      type: 'ADJUSTMENT',
      quantity: product.currentStock,
      previousStock: 0,
      newStock: product.currentStock,
      locationId: location.data.id,
      reason: 'Migração para sistema de locais',
      userId: adminUserId
    }
  });
}
```

---

## 📊 Novos DTOs

### CreateProductDto (Atualizado)

```typescript
{
  name: string;                    // Obrigatório
  salePrice: number;               // Obrigatório
  manageStock?: boolean;           // Opcional, default: true
  locationId?: string;             // ✅ OPCIONAL - usa local padrão se não informado
  initialStock?: number;           // Quantidade inicial no local
  minStock?: number;
  maxStock?: number;
  unitId?: string;
  // ... outros campos
}
```

**Lógica**:
- Se `locationId` for informado: valida e usa esse local
- Se `locationId` NÃO for informado: busca local com `isDefault: true`
- Se não houver local padrão: retorna erro

---

### CreateStockMovementDto (Atualizado)

```typescript
{
  type: 'ENTRY' | 'EXIT' | 'ADJUSTMENT' | 'RETURN' | 'LOSS' | 'TRANSFER';
  quantity: number;                // Obrigatório
  locationId: string;              // ✅ OBRIGATÓRIO
  reason?: string;
  notes?: string;
  reference?: string;
}
```

---

## ✅ Checklist de Atualização Frontend

### Obrigatório
- [x] Backend atualizado para validar `locationId` em movimentações
- [ ] **Adicionar campo `locationId` no formulário de movimentação de estoque** ⚠️
- [ ] **Criar combo/select para selecionar local na movimentação** ⚠️
- [ ] **Atualizar validações para tornar `locationId` obrigatório em movimentações** ⚠️

### Recomendado
- [ ] Adicionar campo `locationId` OPCIONAL no formulário de criação de produtos
- [ ] Criar página de gestão de locais de estoque
- [ ] Exibir local do estoque na listagem de produtos
- [ ] Mostrar estoque por local nos detalhes do produto
- [ ] Implementar fluxo de setup inicial (criar primeiro local)
- [ ] Adicionar mensagens de erro amigáveis
- [ ] Criar wizard de configuração inicial para novos usuários

---

## 🎯 Benefícios

### Antes (Estoque Global)
```
Produto X: 100 unidades
❌ Não sabe onde estão as 100 unidades
❌ Difícil rastrear movimentações
❌ Impossível fazer transferências
```

### Depois (Estoque por Local)
```
Produto X: 100 unidades
  ✅ Depósito Central: 70 un
  ✅ Loja Shopping: 20 un
  ✅ Loja Centro: 10 un
✅ Rastreabilidade completa
✅ Transferências entre locais
✅ Relatórios por local
```

---

## 🆘 Tratamento de Erros

### Erro ao criar produto sem local padrão

```json
{
  "message": "Nenhum local de estoque encontrado. Crie um local de estoque antes de adicionar produtos com estoque inicial.",
  "error": "Bad Request",
  "statusCode": 400
}
```

**Solução**: Criar um local de estoque com `isDefault: true`

---

### Erro ao movimentar sem locationId

```json
{
  "message": [
    "locationId must be a UUID"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

**Solução**: Informar `locationId` válido na requisição

---

### Erro ao usar local inativo

```json
{
  "message": "Local de estoque está inativo",
  "error": "Bad Request",
  "statusCode": 400
}
```

**Solução**: Ativar o local ou usar outro local ativo

---

## 📞 Suporte

Para dúvidas ou problemas na implementação:
- Consulte `/docs/STOCK_LOCATIONS_FRONTEND_UPDATE.md` para documentação completa de locais
- Consulte `/docs/API_PRODUCTS.md` para referência da API

**Versão do Documento**: 1.0  
**Última Atualização**: 30/10/2025
