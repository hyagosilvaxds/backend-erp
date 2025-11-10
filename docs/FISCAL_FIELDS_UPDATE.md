# Atualização de Campos Fiscais - Produtos

## 📋 Resumo das Alterações

Foi realizada uma atualização no módulo de produtos para adicionar novos campos fiscais essenciais para conformidade fiscal brasileira, incluindo:

- **CFOP** (Código Fiscal de Operações e Prestações) para diferentes cenários
- **ISS** (Imposto Sobre Serviços) para produtos do tipo serviço
- **Tipo Item SPED** para escrituração fiscal
- **Diferenciação entre Produto e Serviço** para aplicação correta de impostos

**Data**: 30 de outubro de 2025  
**Migration**: `20251030032413_add_fiscal_fields_cfop_iss_sped`

---

## 🆕 Novos Campos Adicionados

### 1. CFOP - Código Fiscal de Operações e Prestações

Os CFOPs são códigos de 4 dígitos que identificam a natureza de circulação de mercadorias ou prestação de serviços.

| Campo | Tipo | Descrição | Exemplo |
|-------|------|-----------|---------|
| `cfopEstadual` | `string` (4 caracteres) | CFOP para vendas dentro do estado | `5102` |
| `cfopInterestadual` | `string` (4 caracteres) | CFOP para vendas fora do estado | `6102` |
| `cfopEntradaEstadual` | `string` (4 caracteres) | CFOP para compras dentro do estado | `1102` |
| `cfopEntradaInterestadual` | `string` (4 caracteres) | CFOP para compras fora do estado | `2102` |

**CFOPs mais comuns**:

- **Vendas Estaduais**: 5102 (venda de mercadoria adquirida ou recebida de terceiros)
- **Vendas Interestaduais**: 6102 (venda de mercadoria adquirida ou recebida de terceiros)
- **Compras Estaduais**: 1102 (compra para comercialização)
- **Compras Interestaduais**: 2102 (compra para comercialização)

### 2. Tipo do Item SPED

Campo usado na escrituração fiscal digital (EFD ICMS/IPI).

| Campo | Tipo | Enum | Descrição |
|-------|------|------|-----------|
| `tipoItemSped` | `string` (2 dígitos) | `TipoItemSped` | Classificação do item para fins fiscais |

**Valores possíveis**:

| Código | Descrição |
|--------|-----------|
| `00` | Mercadoria para Revenda |
| `01` | Matéria-Prima |
| `02` | Embalagem |
| `03` | Produto em Processo |
| `04` | Produto Acabado |
| `05` | Subproduto |
| `06` | Produto Intermediário |
| `07` | Material de Uso e Consumo |
| `08` | Ativo Imobilizado |
| `09` | Serviços |
| `10` | Outros Insumos |
| `99` | Outras |

### 3. Tipo do Produto (Produto ou Serviço)

Define se o item é um produto físico (usa ICMS) ou um serviço (usa ISS).

| Campo | Tipo | Enum | Descrição | Default |
|-------|------|------|-----------|---------|
| `tipoProduto` | `string` | `TipoProduto` | Define a natureza tributária | `PRODUTO` |

**Valores possíveis**:
- `PRODUTO`: Item físico (usa ICMS, IPI, PIS, COFINS)
- `SERVICO`: Serviço (usa ISS ao invés de ICMS)

### 4. Campos ISS (Imposto Sobre Serviços)

Aplicáveis apenas quando `tipoProduto = 'SERVICO'`.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `codigoServico` | `string` (20 caracteres) | Código do serviço no município |
| `issRate` | `number` (Decimal 5,2) | Alíquota do ISS (%) |
| `itemListaServico` | `string` (20 caracteres) | Item da lista de serviços LC 116/2003 |

**Exemplo de ISS**:
- Código do Serviço: `01.01` (Análise e desenvolvimento de sistemas)
- Alíquota: `2.00` a `5.00`% (varia por município)
- Item da Lista: `1.01` conforme LC 116/2003

---

## 📊 Estrutura do DTO Atualizado

### CreateProductDto

```typescript
{
  // ... campos existentes ...

  // Novos campos CFOP
  "cfopEstadual": "5102",
  "cfopInterestadual": "6102",
  "cfopEntradaEstadual": "1102",
  "cfopEntradaInterestadual": "2102",

  // Tipo do Item SPED
  "tipoItemSped": "00",  // Enum: '00' a '99'

  // Tipo do Produto
  "tipoProduto": "PRODUTO",  // 'PRODUTO' ou 'SERVICO'

  // Campos ISS (apenas se tipoProduto = 'SERVICO')
  "codigoServico": "01.01",
  "issRate": 3.00,
  "itemListaServico": "1.01"
}
```

---

## 🎨 Implementação no Frontend

### 1. Formulário de Cadastro/Edição de Produtos

#### Seção: Informações Fiscais

```jsx
// Tipo do Produto (condiciona os campos seguintes)
<Select name="tipoProduto" label="Tipo do Produto" required>
  <option value="PRODUTO">Produto Físico (usa ICMS)</option>
  <option value="SERVICO">Serviço (usa ISS)</option>
</Select>

// CFOP (sempre visível)
<Grid cols={2}>
  <Input 
    name="cfopEstadual" 
    label="CFOP Estadual (Venda)" 
    maxLength={4}
    placeholder="5102"
    helperText="CFOP para vendas dentro do estado"
  />
  <Input 
    name="cfopInterestadual" 
    label="CFOP Interestadual (Venda)" 
    maxLength={4}
    placeholder="6102"
    helperText="CFOP para vendas fora do estado"
  />
</Grid>

<Grid cols={2}>
  <Input 
    name="cfopEntradaEstadual" 
    label="CFOP Entrada Estadual" 
    maxLength={4}
    placeholder="1102"
    helperText="CFOP para compras dentro do estado"
  />
  <Input 
    name="cfopEntradaInterestadual" 
    label="CFOP Entrada Interestadual" 
    maxLength={4}
    placeholder="2102"
    helperText="CFOP para compras fora do estado"
  />
</Grid>

// Tipo do Item SPED
<Select name="tipoItemSped" label="Tipo do Item (SPED)">
  <option value="">Selecione...</option>
  <option value="00">00 - Mercadoria para Revenda</option>
  <option value="01">01 - Matéria-Prima</option>
  <option value="02">02 - Embalagem</option>
  <option value="03">03 - Produto em Processo</option>
  <option value="04">04 - Produto Acabado</option>
  <option value="05">05 - Subproduto</option>
  <option value="06">06 - Produto Intermediário</option>
  <option value="07">07 - Material de Uso e Consumo</option>
  <option value="08">08 - Ativo Imobilizado</option>
  <option value="09">09 - Serviços</option>
  <option value="10">10 - Outros Insumos</option>
  <option value="99">99 - Outras</option>
</Select>

// Campos condicionais baseados em tipoProduto
{tipoProduto === 'PRODUTO' && (
  <>
    {/* Campos ICMS, IPI, PIS, COFINS existentes */}
    <Input name="ncm" label="NCM" maxLength={8} />
    <Input name="cest" label="CEST" maxLength={7} />
    <Input name="icmsCst" label="CST ICMS" maxLength={3} />
    <Input name="icmsRate" label="Alíquota ICMS (%)" type="number" />
    {/* ... outros campos ICMS, IPI, PIS, COFINS ... */}
  </>
)}

{tipoProduto === 'SERVICO' && (
  <>
    {/* Campos ISS */}
    <Input 
      name="codigoServico" 
      label="Código do Serviço" 
      maxLength={20}
      placeholder="01.01"
      helperText="Código municipal do serviço"
    />
    <Input 
      name="issRate" 
      label="Alíquota ISS (%)" 
      type="number"
      min={0}
      max={100}
      step={0.01}
      placeholder="3.00"
    />
    <Input 
      name="itemListaServico" 
      label="Item da Lista de Serviços" 
      maxLength={20}
      placeholder="1.01"
      helperText="Conforme LC 116/2003"
    />
  </>
)}
```

### 2. Validações no Frontend

```typescript
// Validação do CFOP (4 dígitos numéricos)
const validateCFOP = (value: string) => {
  if (!value) return true; // Opcional
  const cfopRegex = /^\d{4}$/;
  if (!cfopRegex.test(value)) {
    return 'CFOP deve ter 4 dígitos';
  }
  return true;
};

// Validação do Tipo Item SPED
const validateTipoItemSped = (value: string) => {
  if (!value) return true; // Opcional
  const validCodes = [
    '00', '01', '02', '03', '04', '05', '06', '07', 
    '08', '09', '10', '99'
  ];
  if (!validCodes.includes(value)) {
    return 'Código inválido';
  }
  return true;
};

// Validação condicional ISS
const validateISS = (values: FormValues) => {
  const errors: any = {};
  
  if (values.tipoProduto === 'SERVICO') {
    if (!values.issRate) {
      errors.issRate = 'Alíquota ISS é obrigatória para serviços';
    }
    if (values.issRate && (values.issRate < 0 || values.issRate > 100)) {
      errors.issRate = 'Alíquota deve estar entre 0 e 100';
    }
  }
  
  return errors;
};
```

### 3. Valores Padrão Sugeridos

```typescript
const defaultFiscalValues = {
  tipoProduto: 'PRODUTO',
  tipoItemSped: '00', // Mercadoria para Revenda
  
  // CFOPs padrão para comércio
  cfopEstadual: '5102',          // Venda interna
  cfopInterestadual: '6102',     // Venda interestadual
  cfopEntradaEstadual: '1102',   // Compra interna
  cfopEntradaInterestadual: '2102', // Compra interestadual
};
```

---

## 🔄 Migração de Dados Existentes

### Produtos Existentes

Todos os novos campos são **opcionais** (`NULL` permitido), portanto:

- ✅ **Nenhuma ação necessária** para produtos já cadastrados
- ✅ Os produtos continuarão funcionando normalmente
- ⚠️ **Recomendação**: Atualizar produtos existentes com os novos campos para compliance fiscal

### Script de Atualização em Massa (Opcional)

Se você quiser atualizar todos os produtos com valores padrão:

```sql
-- Definir valores padrão para produtos existentes
UPDATE products 
SET 
  tipo_produto = 'PRODUTO',
  tipo_item_sped = '00',
  cfop_estadual = '5102',
  cfop_interestadual = '6102',
  cfop_entrada_estadual = '1102',
  cfop_entrada_interestadual = '2102'
WHERE tipo_produto IS NULL;
```

---

## 📖 Tabelas de Referência

### Tabela CFOP - Códigos Mais Comuns

#### Saídas (Vendas) - Estaduais (5.xxx)

| CFOP | Descrição |
|------|-----------|
| 5101 | Venda de produção do estabelecimento |
| 5102 | Venda de mercadoria adquirida ou recebida de terceiros |
| 5103 | Venda de produção do estabelecimento efetuada fora do estabelecimento |
| 5104 | Venda de mercadoria adquirida ou recebida de terceiros, efetuada fora do estabelecimento |
| 5405 | Venda de mercadoria adquirida ou recebida de terceiros em operação com mercadoria sujeita ao regime de substituição tributária, na condição de contribuinte substituído |

#### Saídas (Vendas) - Interestaduais (6.xxx)

| CFOP | Descrição |
|------|-----------|
| 6101 | Venda de produção do estabelecimento |
| 6102 | Venda de mercadoria adquirida ou recebida de terceiros |
| 6103 | Venda de produção do estabelecimento efetuada fora do estabelecimento |
| 6104 | Venda de mercadoria adquirida ou recebida de terceiros, efetuada fora do estabelecimento |

#### Entradas (Compras) - Estaduais (1.xxx)

| CFOP | Descrição |
|------|-----------|
| 1101 | Compra para industrialização |
| 1102 | Compra para comercialização |
| 1111 | Compra para industrialização de mercadoria recebida anteriormente em consignação industrial |
| 1113 | Compra para comercialização, de mercadoria recebida anteriormente em consignação mercantil |

#### Entradas (Compras) - Interestaduais (2.xxx)

| CFOP | Descrição |
|------|-----------|
| 2101 | Compra para industrialização |
| 2102 | Compra para comercialização |
| 2111 | Compra para industrialização de mercadoria recebida anteriormente em consignação industrial |
| 2113 | Compra para comercialização, de mercadoria recebida anteriormente em consignação mercantil |

### Tabela ISS - Lista de Serviços LC 116/2003

#### Serviços Mais Comuns

| Item | Descrição |
|------|-----------|
| 1.01 | Análise e desenvolvimento de sistemas |
| 1.02 | Programação |
| 1.03 | Processamento de dados |
| 1.04 | Elaboração de programas de computadores |
| 1.05 | Licenciamento ou cessão de direito de uso de programas de computação |
| 7.02 | Execução, por administração, empreitada ou subempreitada, de obras de construção civil |
| 10.01 | Agenciamento, corretagem ou intermediação de câmbio, de seguros, de cartões de crédito |
| 17.01 | Assessoria ou consultoria de qualquer natureza |
| 17.02 | Datilografia, digitação, estenografia, expediente, secretaria em geral |

---

## 🚨 Regras de Negócio Importantes

### 1. Diferenciação Produto vs Serviço

| Característica | PRODUTO | SERVICO |
|----------------|---------|---------|
| Imposto Principal | ICMS | ISS |
| NCM Obrigatório | ✅ Sim | ❌ Não |
| CFOP | ✅ Usa | ✅ Usa (CFOPs de serviço) |
| IPI | ✅ Pode usar | ❌ Não se aplica |
| ISS | ❌ Não se aplica | ✅ Obrigatório |

### 2. Validações no Backend

O backend já valida:
- ✅ CFOP com 4 dígitos
- ✅ Tipo Item SPED entre 00 e 99
- ✅ Tipo Produto entre PRODUTO e SERVICO
- ✅ ISS Rate entre 0 e 100

### 3. Campos Condicionais

**Quando `tipoProduto = 'PRODUTO'`**:
- Obrigatório: NCM, ICMS CST
- Opcional: CEST, IPI, PIS, COFINS
- Não usar: Campos ISS

**Quando `tipoProduto = 'SERVICO'`**:
- Obrigatório: ISS Rate
- Recomendado: Código Serviço, Item Lista Serviço
- Não usar: NCM, CEST, ICMS, IPI

---

## 🧪 Exemplos de Payload

### Exemplo 1: Produto Físico para Revenda

```json
{
  "name": "Notebook Dell Inspiron 15",
  "sku": "DELL-NB-001",
  "salePrice": 3500.00,
  
  "tipoProduto": "PRODUTO",
  "tipoItemSped": "00",
  
  "cfopEstadual": "5102",
  "cfopInterestadual": "6102",
  "cfopEntradaEstadual": "1102",
  "cfopEntradaInterestadual": "2102",
  
  "ncm": "84713012",
  "cest": "2100100",
  "origin": "0",
  "icmsCst": "00",
  "icmsRate": 18.00,
  "ipiRate": 5.00,
  "pisCst": "01",
  "pisRate": 1.65,
  "cofinsCst": "01",
  "cofinsRate": 7.60
}
```

### Exemplo 2: Produto Acabado (Industrialização)

```json
{
  "name": "Móvel Planejado Personalizado",
  "sku": "MOV-PLAN-001",
  "salePrice": 5000.00,
  
  "tipoProduto": "PRODUTO",
  "tipoItemSped": "04",
  
  "cfopEstadual": "5101",
  "cfopInterestadual": "6101",
  "cfopEntradaEstadual": "1101",
  "cfopEntradaInterestadual": "2101",
  
  "ncm": "94036000",
  "icmsCst": "00",
  "icmsRate": 18.00
}
```

### Exemplo 3: Serviço de TI

```json
{
  "name": "Desenvolvimento de Sistema Web",
  "sku": "SERV-DEV-001",
  "salePrice": 10000.00,
  
  "tipoProduto": "SERVICO",
  "tipoItemSped": "09",
  
  "cfopEstadual": "5933",
  "cfopInterestadual": "6933",
  
  "codigoServico": "01.01",
  "issRate": 3.00,
  "itemListaServico": "1.01"
}
```

### Exemplo 4: Material de Uso e Consumo

```json
{
  "name": "Papel A4 Sulfite",
  "sku": "PAP-A4-001",
  "salePrice": 25.00,
  
  "tipoProduto": "PRODUTO",
  "tipoItemSped": "07",
  
  "cfopEstadual": "5102",
  "cfopInterestadual": "6102",
  "cfopEntradaEstadual": "1102",
  "cfopEntradaInterestadual": "2102",
  
  "ncm": "48025610",
  "icmsCst": "00",
  "icmsRate": 18.00
}
```

---

## 🔗 Endpoints da API

Nenhuma alteração nos endpoints. Todos os campos adicionados são opcionais e funcionam com os endpoints existentes:

- `POST /products` - Criar produto (aceita novos campos)
- `PATCH /products/:id` - Atualizar produto (aceita novos campos)
- `GET /products` - Listar produtos (retorna novos campos se preenchidos)
- `GET /products/:id` - Buscar produto (retorna novos campos se preenchidos)

---

## ✅ Checklist de Implementação Frontend

### Fase 1: UI/UX
- [ ] Adicionar campo `tipoProduto` (Select: PRODUTO/SERVICO)
- [ ] Adicionar campo `tipoItemSped` (Select com todos os códigos)
- [ ] Adicionar 4 campos CFOP (Inputs numéricos de 4 dígitos)
- [ ] Adicionar seção ISS condicional (3 campos)
- [ ] Adicionar helpers/tooltips explicativos
- [ ] Criar visual indicator para diferenciar Produto vs Serviço

### Fase 2: Validação
- [ ] Validar formato CFOP (4 dígitos)
- [ ] Validar Tipo Item SPED (00-99)
- [ ] Validar ISS obrigatório quando tipoProduto = SERVICO
- [ ] Validar NCM obrigatório quando tipoProduto = PRODUTO
- [ ] Validar faixas de alíquotas

### Fase 3: Lógica de Negócio
- [ ] Implementar lógica condicional (mostrar/ocultar campos)
- [ ] Implementar auto-preenchimento de CFOPs comuns
- [ ] Implementar busca/autocomplete para códigos de serviço
- [ ] Adicionar cálculos automáticos de impostos

### Fase 4: Testes
- [ ] Testar cadastro de produto físico
- [ ] Testar cadastro de serviço
- [ ] Testar edição de produtos existentes
- [ ] Testar validações de campos
- [ ] Testar integração com backend

### Fase 5: Documentação
- [ ] Atualizar manual do usuário
- [ ] Criar guia de preenchimento de campos fiscais
- [ ] Documentar exemplos por tipo de negócio
- [ ] Criar FAQ sobre campos fiscais

---

## 🆕 Novo Endpoint: Listagem de Estoque

### Endpoint Adicionado

Foi implementado um novo endpoint para consultar o estoque de todos os produtos de forma consolidada.

**Endpoint**: `GET /products/stock`

**Permissão**: `products.read`

**Query Params**:
- `search`: Busca por nome, SKU ou código de barras
- `categoryId`: Filtrar por categoria
- `brandId`: Filtrar por marca
- `lowStock`: Apenas produtos com estoque baixo (true/false)
- `outOfStock`: Apenas produtos sem estoque (true/false)

**Exemplo de Requisição**:
```typescript
// Listar todo o estoque
const response = await api.get('/products/stock');

// Produtos com estoque baixo de uma categoria
const response = await api.get('/products/stock', {
  params: {
    categoryId: 'uuid-categoria',
    lowStock: true
  }
});

// Buscar produto específico no estoque
const response = await api.get('/products/stock', {
  params: {
    search: 'notebook'
  }
});
```

**Resposta**:
```typescript
interface StockResponse {
  products: Array<{
    id: string;
    name: string;
    sku: string;
    barcode?: string;
    currentStock: number;
    minStock?: number;
    maxStock?: number;
    costPrice: string;
    salePrice: string;
    stockValue: number;      // currentStock * costPrice
    saleValue: number;       // currentStock * salePrice
    status: 'NORMAL' | 'LOW_STOCK' | 'OUT_OF_STOCK';
    category: {
      id: string;
      name: string;
    };
    brand?: {
      id: string;
      name: string;
    };
    unit: {
      id: string;
      name: string;
      abbreviation: string;
    };
  }>;
  summary: {
    totalProducts: number;
    lowStockCount: number;
    outOfStockCount: number;
    totalStockValue: string;  // Valor total em custo
    totalSaleValue: string;   // Valor total em venda
  };
}
```

### Casos de Uso no Frontend

#### 1. Tela de Gestão de Estoque
```typescript
// Listar todos os produtos com estoque
const { data } = await api.get('/products/stock');

// Exibir resumo
console.log(`Total de produtos: ${data.summary.totalProducts}`);
console.log(`Valor do estoque: R$ ${data.summary.totalStockValue}`);
console.log(`Produtos em falta: ${data.summary.outOfStockCount}`);

// Exibir tabela de produtos
data.products.forEach(product => {
  // Aplicar badge de status
  const badge = {
    'NORMAL': 'success',
    'LOW_STOCK': 'warning',
    'OUT_OF_STOCK': 'danger'
  }[product.status];
  
  // Renderizar linha da tabela
  renderRow(product, badge);
});
```

#### 2. Alertas de Estoque Baixo
```typescript
// Dashboard: mostrar produtos com estoque baixo
const { data } = await api.get('/products/stock', {
  params: { lowStock: true }
});

if (data.summary.lowStockCount > 0) {
  showAlert(`${data.summary.lowStockCount} produtos com estoque baixo`, 'warning');
}
```

#### 3. Relatório de Valor em Estoque
```typescript
// Calcular valor do estoque por categoria
const stockByCategory = {};

data.products.forEach(product => {
  const category = product.category.name;
  if (!stockByCategory[category]) {
    stockByCategory[category] = {
      costValue: 0,
      saleValue: 0,
      count: 0
    };
  }
  
  stockByCategory[category].costValue += product.stockValue;
  stockByCategory[category].saleValue += product.saleValue;
  stockByCategory[category].count++;
});
```

---

## 📚 Recursos Adicionais

### Links Úteis

- [Tabela CFOP Completa - Receita Federal](http://www.nfe.fazenda.gov.br/portal/listaConteudo.aspx?tipoConteudo=/fhS9hVa5IA=)
- [Lista de Serviços LC 116/2003](http://www.planalto.gov.br/ccivil_03/leis/lcp/lcp116.htm)
- [Tabela NCM - Receita Federal](https://www.gov.br/receitafederal/pt-br/assuntos/aduana-e-comercio-exterior/manuais/classificacao-fiscal-de-mercadorias)
- [Guia SPED Fiscal](https://www.gov.br/receitafederal/pt-br/assuntos/orientacao-tributaria/declaracoes-e-demonstrativos/sped-sistema-publico-de-escrituracao-digital)

### Suporte Técnico

Para dúvidas sobre a implementação:
- **Backend**: Campos já implementados e testados
- **Frontend**: Seguir os exemplos desta documentação
- **Fiscal**: Consultar contador da empresa

---

## 📝 Notas Finais

1. **Todos os campos são opcionais** - produtos existentes continuam funcionando
2. **Recomenda-se preencher** - para compliance fiscal completo
3. **Validação leve no backend** - permite flexibilidade
4. **Validação forte no frontend** - ajuda o usuário a preencher corretamente
5. **Campos condicionais** - simplifica UX baseado no tipo do produto

---

**Documentação criada em**: 30/10/2025  
**Versão**: 1.0  
**Migration**: `20251030032413_add_fiscal_fields_cfop_iss_sped`
