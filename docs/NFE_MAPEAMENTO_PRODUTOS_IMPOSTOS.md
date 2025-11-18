# Mapeamento Completo: Produtos e Impostos na NF-e

## 📋 Visão Geral

Este documento detalha **exatamente** como os dados dos produtos e seus impostos cadastrados no banco de dados são mapeados para os campos da NF-e (Nota Fiscal Eletrônica).

**Princípio fundamental**: Todos os dados dos produtos e impostos da NF-e vêm do cadastro real no banco de dados. Cada produto tem seus impostos configurados individualmente.

**Data**: 16 de novembro de 2025  
**Versão**: 1.0.0

---

## 📦 Seção: Produtos (tagProd)

### Campos da NF-e e suas origens

| Campo NF-e | Origem no BD | Campo na Tabela Product | Observações |
|------------|--------------|------------------------|-------------|
| `cProd` | `product.sku` | `sku` (String?) | Código SKU; fallback para `id` (8 primeiros dígitos) |
| `cEAN` | `product.barcode` | `barcode` (String?) | Código de barras; se vazio usa "SEM GTIN" |
| `xProd` | `product.name` | `name` (String) | Descrição do produto; limite de 120 caracteres |
| `NCM` | `product.ncm` | `ncm` (String?) | Nomenclatura Comum do Mercosul (8 dígitos); remove formatação |
| `CFOP` | `product.cfopEstadual` ou `product.cfopInterestadual` | `cfopEstadual` (String?), `cfopInterestadual` (String?) | Se interestadual usa cfopInterestadual (ex: 6102), senão usa cfopEstadual (ex: 5102) |
| `uCom` | `product.unit.abbreviation` ou `product.unit.name` | via relação `unit` | Unidade comercial (UN, KG, PC, etc.); padrão "UNID" |
| `qCom` | `saleItem.quantity` | via relação `saleItems` | Quantidade comercial da venda; formato: X.XXXX (4 casas decimais) |
| `vUnCom` | `saleItem.unitPrice` | via relação `saleItems` | Valor unitário comercial; formato: X.XXXXXXXXXX (10 casas decimais) |
| `vProd` | `saleItem.total` | via relação `saleItems` | Valor total bruto (quantidade × valor unitário); formato: X.XX (2 casas decimais) |
| `cEANTrib` | `product.barcode` | `barcode` (String?) | Código de barras tributável (mesmo que cEAN) |
| `uTrib` | `product.unit.abbreviation` ou `product.unit.name` | via relação `unit` | Unidade tributável (mesmo que uCom) |
| `qTrib` | `saleItem.quantity` | via relação `saleItems` | Quantidade tributável (mesma que qCom) |
| `vUnTrib` | `saleItem.unitPrice` | via relação `saleItems` | Valor unitário tributável (mesmo que vUnCom) |
| `vDesc` | `saleItem.discount` | via relação `saleItems` | Valor do desconto (se houver); opcional |
| `indTot` | ❌ Fixo | - | Sempre "1" (item entra no total da NF-e) |

### Exemplo Real (2 produtos):

```typescript
NFe.tagProd([
    {
        cProd: "126",                                      // product.sku
        cEAN: "SEM GTIN",                                  // product.barcode (vazio)
        xProd: "CABOS MICROFONE DMX XR CANON BALANCEADO",  // product.name
        NCM: "85044010",                                   // product.ncm
        CFOP: "6102",                                      // product.cfopInterestadual (cliente de outro estado)
        uCom: "UNID",                                      // product.unit.abbreviation
        qCom: "3.0000",                                    // saleItem.quantity
        vUnCom: "132.0000000000",                          // saleItem.unitPrice
        vProd: "396.00",                                   // saleItem.total (3 × 132)
        cEANTrib: "SEM GTIN",                              // product.barcode
        uTrib: "UNID",                                     // product.unit.abbreviation
        qTrib: "3.0000",                                   // saleItem.quantity
        vUnTrib: "132.0000000000",                         // saleItem.unitPrice
        indTot: "1"                                        // Fixo
    },
    {
        cProd: "127",                                      // product.sku
        cEAN: "SEM GTIN",                                  // product.barcode (vazio)
        xProd: "CABO DE MICROFONE XLR FEMEA PARA P10",     // product.name
        NCM: "85044010",                                   // product.ncm
        CFOP: "6102",                                      // product.cfopInterestadual
        uCom: "UNID",                                      // product.unit.abbreviation
        qCom: "2.0000",                                    // saleItem.quantity
        vUnCom: "185.0000000000",                          // saleItem.unitPrice
        vProd: "370.00",                                   // saleItem.total (2 × 185)
        cEANTrib: "SEM GTIN",                              // product.barcode
        uTrib: "UNID",                                     // product.unit.abbreviation
        qTrib: "2.0000",                                   // saleItem.quantity
        vUnTrib: "185.0000000000",                         // saleItem.unitPrice
        vDesc: "38.00",                                    // saleItem.discount
        indTot: "1"                                        // Fixo
    }
]);
```

---

## 💰 Seção: Impostos dos Produtos

### ICMS - Imposto sobre Circulação de Mercadorias e Serviços

#### Para Simples Nacional (tagProdICMSSN):

| Campo NF-e | Origem no BD | Campo na Tabela Product | Observações |
|------------|--------------|------------------------|-------------|
| `orig` | `product.origin` ou `product.origem` | `origin` (String?), `origem` (String?) | Origem da mercadoria (0-8); padrão "0" (Nacional) |
| `CSOSN` | `product.csosn` | `csosn` (String?) | Código de Situação da Operação no Simples Nacional; padrão "102" |

**Valores comuns de CSOSN**:
- `"102"` = Tributada sem permissão de crédito
- `"103"` = Isenção do ICMS para faixa de receita bruta
- `"400"` = Não tributada pelo Simples Nacional
- `"500"` = ICMS cobrado anteriormente por substituição tributária

#### Para Regime Normal (tagProdICMS):

| Campo NF-e | Origem no BD | Campo na Tabela Product | Observações |
|------------|--------------|------------------------|-------------|
| `orig` | `product.origin` ou `product.origem` | `origin` (String?), `origem` (String?) | Origem da mercadoria (0-8); padrão "0" (Nacional) |
| `CST` | `product.icmsCst` ou `product.cstIcms` | `icmsCst` (String?), `cstIcms` (String?) | Código de Situação Tributária; padrão "00" |
| `modBC` | `product.icmsModBc` ou `product.modBcIcms` | `icmsModBc` (String?), `modBcIcms` (String?) | Modalidade da BC; padrão "3" (Valor da operação) |
| `vBC` | ❌ Calculado | - | Base de cálculo = total do item × (alíquota/100) |
| `pICMS` | `product.icmsRate` ou `product.aliqIcms` | `icmsRate` (Decimal?), `aliqIcms` (Decimal?) | Alíquota do ICMS em % |
| `vICMS` | ❌ Calculado | - | Valor do ICMS = vBC calculado |

### PIS - Programa de Integração Social (tagProdPIS):

| Campo NF-e | Origem no BD | Campo na Tabela Product | Observações |
|------------|--------------|------------------------|-------------|
| `CST` | `product.pisCst` ou `product.cstPis` | `pisCst` (String?), `cstPis` (String?) | Código de Situação Tributária; padrão "49" (Outras operações) |
| `vBC` | ❌ Calculado | - | Base de cálculo = total do item (se alíquota > 0) |
| `pPIS` | `product.pisRate` ou `product.aliqPis` | `pisRate` (Decimal?), `aliqPis` (Decimal?) | Alíquota do PIS em % |
| `vPIS` | ❌ Calculado | - | Valor do PIS = total × (alíquota/100) |
| `qBCProd` | ❌ Fixo | - | Sempre 0 (usado em casos específicos de alíquota por unidade) |
| `vAliqProd` | ❌ Fixo | - | Sempre 0 (usado em casos específicos de alíquota por unidade) |

**Valores comuns de CST PIS**:
- `"01"` = Operação tributável com alíquota básica
- `"04"` = Operação tributável - monofásica
- `"49"` = Outras operações de saída
- `"99"` = Outras operações

### COFINS - Contribuição para Financiamento da Seguridade Social (tagProdCOFINS):

| Campo NF-e | Origem no BD | Campo na Tabela Product | Observações |
|------------|--------------|------------------------|-------------|
| `CST` | `product.cofinsCst` ou `product.cstCofins` | `cofinsCst` (String?), `cstCofins` (String?) | Código de Situação Tributária; padrão "49" (Outras operações) |
| `vBC` | ❌ Calculado | - | Base de cálculo = total do item (se alíquota > 0) |
| `pCOFINS` | `product.cofinsRate` ou `product.aliqCofins` | `cofinsRate` (Decimal?), `aliqCofins` (Decimal?) | Alíquota do COFINS em % |
| `vCOFINS` | ❌ Calculado | - | Valor do COFINS = total × (alíquota/100) |
| `qBCProd` | ❌ Fixo | - | Sempre 0 (usado em casos específicos de alíquota por unidade) |
| `vAliqProd` | ❌ Fixo | - | Sempre 0 (usado em casos específicos de alíquota por unidade) |

**Valores comuns de CST COFINS**:
- `"01"` = Operação tributável com alíquota básica
- `"04"` = Operação tributável - monofásica
- `"49"` = Outras operações de saída
- `"99"` = Outras operações

### IPI - Imposto sobre Produtos Industrializados (Opcional):

| Campo NF-e | Origem no BD | Campo na Tabela Product | Observações |
|------------|--------------|------------------------|-------------|
| `CST` | `product.ipiCst` | `ipiCst` (String?) | Código de Situação Tributária do IPI |
| `vBC` | ❌ Calculado | - | Base de cálculo = total do item |
| `pIPI` | `product.ipiRate` | `ipiRate` (Decimal?) | Alíquota do IPI em % |
| `vIPI` | ❌ Calculado | - | Valor do IPI = total × (alíquota/100) |

**Nota**: IPI só é aplicado se o produto tiver `ipiCst` e `ipiRate` cadastrados.

### Exemplo Real de Impostos (Produto no Simples Nacional):

```typescript
// Produto 1 (índice 0)
NFe.tagProdICMSSN(0, {
    orig: "0",      // product.origin (Nacional)
    CSOSN: "400"    // product.csosn (Não tributada)
});

NFe.tagProdPIS(0, {
    CST: "49",      // product.pisCst (Outras operações)
    vBC: undefined, // Não há base de cálculo (alíquota zero)
    pPIS: undefined,// Sem alíquota
    vPIS: "0.00",   // Valor zero
    qBCProd: 0,
    vAliqProd: 0
});

NFe.tagProdCOFINS(0, {
    CST: "49",      // product.cofinsCst (Outras operações)
    vBC: undefined, // Não há base de cálculo (alíquota zero)
    pCOFINS: undefined, // Sem alíquota
    vCOFINS: "0.00",    // Valor zero
    qBCProd: 0,
    vAliqProd: 0
});

// Produto 2 (índice 1) - mesmos impostos
NFe.tagProdICMSSN(1, { orig: "0", CSOSN: "400" });
NFe.tagProdPIS(1, { CST: "49", qBCProd: 0, vAliqProd: 0, vPIS: "0.00" });
NFe.tagProdCOFINS(1, { CST: "49", qBCProd: 0, vAliqProd: 0, vCOFINS: "0.00" });
```

---

## 📊 Estrutura da Tabela Product (Campos Fiscais)

```prisma
model Product {
  id        String  @id @default(uuid())
  companyId String

  // ===== INFORMAÇÕES BÁSICAS =====
  name        String   // xProd
  description String?
  sku         String?  // cProd
  barcode     String?  // cEAN, cEANTrib

  // ===== UNIDADE =====
  unitId String?
  unit   ProductUnit? @relation(fields: [unitId], references: [id])
  // unit.abbreviation → uCom, uTrib

  // ===== INFORMAÇÕES FISCAIS =====
  ncm    String? // NCM (8 dígitos)
  cest   String? // CEST (7 dígitos)
  origin String? // Origem (0-8)
  origem String? // Alias para origin

  // ===== ICMS =====
  icmsCst   String?  // CST do ICMS
  icmsRate  Decimal? // Alíquota do ICMS (%)
  icmsModBc String?  // Modalidade da BC
  cstIcms   String?  // Alias
  aliqIcms  Decimal? // Alias
  modBcIcms String?  // Alias
  csosn     String?  // CSOSN (Simples Nacional)

  // ===== IPI =====
  ipiCst  String?  // CST do IPI
  ipiRate Decimal? // Alíquota do IPI (%)

  // ===== PIS =====
  pisCst  String?  // CST do PIS
  pisRate Decimal? // Alíquota do PIS (%)
  cstPis  String?  // Alias
  aliqPis Decimal? // Alias
  bcPis   Decimal? // Base de cálculo PIS

  // ===== COFINS =====
  cofinsCst  String?  // CST do COFINS
  cofinsRate Decimal? // Alíquota do COFINS (%)
  cstCofins  String?  // Alias
  aliqCofins Decimal? // Alias
  bcCofins   Decimal? // Base de cálculo COFINS

  // ===== CFOP =====
  cfop                     String? // CFOP padrão
  cfopEstadual             String? // CFOP para vendas dentro do estado (5xxx)
  cfopInterestadual        String? // CFOP para vendas fora do estado (6xxx)
  cfopEntradaEstadual      String? // CFOP para compras dentro do estado (1xxx)
  cfopEntradaInterestadual String? // CFOP para compras fora do estado (2xxx)

  // ===== ISS (Para Serviços) =====
  tipoProduto      String?  @default("PRODUTO") // "PRODUTO" ou "SERVICO"
  codigoServico    String?  // Código do serviço municipal
  issRate          Decimal? // Alíquota do ISS (%)
  itemListaServico String?  // Item da lista LC 116/2003

  // Relacionamentos
  saleItems SaleItem[]
  nfeItems  NFeItem[]
}
```

---

## 🔄 Fluxo de Dados: Produto → NF-e

```
┌─────────────────────────────────────────────────────────────────┐
│                    BANCO DE DADOS (PostgreSQL)                   │
│                                                                   │
│  Tabela: Product (Produto 1)                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ id: "uuid"                                               │   │
│  │ name: "CABOS MICROFONE DMX XR CANON BALANCEADO"         │   │
│  │ sku: "126"                                              │   │
│  │ barcode: null                                           │   │
│  │ ncm: "85044010"                                         │   │
│  │ cfopInterestadual: "6102"                               │   │
│  │ cfopEstadual: "5102"                                    │   │
│  │ unit: { abbreviation: "UNID" }                          │   │
│  │ origin: "0"                                             │   │
│  │ csosn: "400"                                            │   │
│  │ pisCst: "49"                                            │   │
│  │ pisRate: null                                           │   │
│  │ cofinsCst: "49"                                         │   │
│  │ cofinsRate: null                                        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  Tabela: SaleItem (Item da Venda 1)                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ productId: "uuid do produto 1"                          │   │
│  │ quantity: 3                                             │   │
│  │ unitPrice: 132.00                                       │   │
│  │ total: 396.00                                           │   │
│  │ discount: null                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│         NFeGeneratorService.preencherProdutos() +                │
│         NFeGeneratorService.preencherImpostos()                  │
│                                                                   │
│  1. Determina CFOP: interestadual? cfopInterestadual : cfopEstadual │
│  2. Monta tagProd com dados do produto e item da venda          │
│  3. Detecta se é Simples Nacional                               │
│  4. Aplica impostos cadastrados no produto:                     │
│     - ICMSSN (se Simples) ou ICMS (se Normal)                   │
│     - PIS (CST e alíquota do produto)                           │
│     - COFINS (CST e alíquota do produto)                        │
│     - IPI (se cadastrado)                                       │
└─────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         XML DA NF-e                              │
│                                                                   │
│  <det nItem="1">                                                 │
│    <prod>                                                        │
│      <cProd>126</cProd>                                          │
│      <cEAN>SEM GTIN</cEAN>                                       │
│      <xProd>CABOS MICROFONE DMX XR CANON BALANCEADO</xProd>    │
│      <NCM>85044010</NCM>                                         │
│      <CFOP>6102</CFOP>                                           │
│      <uCom>UNID</uCom>                                           │
│      <qCom>3.0000</qCom>                                         │
│      <vUnCom>132.0000000000</vUnCom>                            │
│      <vProd>396.00</vProd>                                       │
│      <cEANTrib>SEM GTIN</cEANTrib>                              │
│      <uTrib>UNID</uTrib>                                         │
│      <qTrib>3.0000</qTrib>                                       │
│      <vUnTrib>132.0000000000</vUnTrib>                          │
│      <indTot>1</indTot>                                          │
│    </prod>                                                       │
│    <imposto>                                                     │
│      <ICMS>                                                      │
│        <ICMSSN400>                                               │
│          <orig>0</orig>                                          │
│          <CSOSN>400</CSOSN>                                      │
│        </ICMSSN400>                                              │
│      </ICMS>                                                     │
│      <PIS>                                                       │
│        <PISOutr>                                                 │
│          <CST>49</CST>                                           │
│          <vPIS>0.00</vPIS>                                       │
│        </PISOutr>                                                │
│      </PIS>                                                      │
│      <COFINS>                                                    │
│        <COFINSOutr>                                              │
│          <CST>49</CST>                                           │
│          <vCOFINS>0.00</vCOFINS>                                 │
│        </COFINSOutr>                                             │
│      </COFINS>                                                   │
│    </imposto>                                                    │
│  </det>                                                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✅ Checklist: Dados do Produto para NF-e

### Informações Básicas (Obrigatórias):
- [ ] ✅ **name** (xProd) - Descrição do produto
- [ ] ✅ **sku** (cProd) - Código SKU (ou usa ID)
- [ ] ✅ **ncm** (NCM) - 8 dígitos (obrigatório para produtos)
- [ ] ✅ **unitId** (uCom/uTrib) - Unidade de medida (UNID, KG, PC, etc.)

### CFOP (Obrigatório):
- [ ] ✅ **cfopEstadual** (CFOP) - Para vendas dentro do estado (ex: 5102)
- [ ] ✅ **cfopInterestadual** (CFOP) - Para vendas fora do estado (ex: 6102)

### ICMS (Obrigatório):
- [ ] ✅ **origin** ou **origem** (orig) - Origem da mercadoria (0-8)
- [ ] ✅ **csosn** (CSOSN) - Se Simples Nacional (ex: 102, 400)
- [ ] ✅ **icmsCst** (CST) - Se Regime Normal (ex: 00, 20, 40)
- [ ] ⚠️ **icmsRate** (pICMS) - Alíquota (%) - se aplicável
- [ ] ⚠️ **icmsModBc** (modBC) - Modalidade da BC - se aplicável

### PIS (Obrigatório):
- [ ] ✅ **pisCst** (CST) - Código de Situação Tributária (ex: 01, 49, 99)
- [ ] ⚠️ **pisRate** (pPIS) - Alíquota (%) - se tributado

### COFINS (Obrigatório):
- [ ] ✅ **cofinsCst** (CST) - Código de Situação Tributária (ex: 01, 49, 99)
- [ ] ⚠️ **cofinsRate** (pCOFINS) - Alíquota (%) - se tributado

### IPI (Opcional):
- [ ] 📱 **ipiCst** (CST) - Se produto industrializado
- [ ] 📱 **ipiRate** (pIPI) - Alíquota do IPI

### Opcionais mas Recomendados:
- [ ] 📱 **barcode** (cEAN) - Código de barras (se não, usa "SEM GTIN")
- [ ] 📱 **cest** (CEST) - Para produtos com ST (7 dígitos)
- [ ] 📱 **description** - Descrição detalhada

---

## 🧪 Exemplos de Configuração de Produtos

### Exemplo 1: Produto no Simples Nacional (Não Tributado)

```sql
INSERT INTO "products" (
  id, "companyId", name, sku, barcode, ncm,
  "cfopEstadual", "cfopInterestadual",
  origin, csosn,
  "pisCst", "pisRate",
  "cofinsCst", "cofinsRate",
  "unitId"
) VALUES (
  gen_random_uuid(), 'company-uuid',
  'CABOS MICROFONE DMX XR CANON BALANCEADO 20 METROS',
  '126', NULL, '85044010',
  '5102', '6102',
  '0', '400',
  '49', NULL,
  '49', NULL,
  'unid-uuid'
);
```

**Resultado na NF-e**:
- ICMS: CSOSN 400 (Não tributada)
- PIS: CST 49, valor R$ 0,00
- COFINS: CST 49, valor R$ 0,00

### Exemplo 2: Produto no Regime Normal (Tributado)

```sql
INSERT INTO "products" (
  id, "companyId", name, sku, barcode, ncm,
  "cfopEstadual", "cfopInterestadual",
  origin, "icmsCst", "icmsRate", "icmsModBc",
  "pisCst", "pisRate",
  "cofinsCst", "cofinsRate",
  "unitId"
) VALUES (
  gen_random_uuid(), 'company-uuid',
  'NOTEBOOK DELL INSPIRON 15 I5 8GB 256GB SSD',
  'NB001', '7891234567890', '84713012',
  '5102', '6102',
  '0', '00', 18.00, '3',
  '01', 1.65,
  '01', 7.60,
  'unid-uuid'
);
```

**Resultado na NF-e**:
- ICMS: CST 00, BC R$ 1.000,00, alíquota 18%, valor R$ 180,00
- PIS: CST 01, BC R$ 1.000,00, alíquota 1,65%, valor R$ 16,50
- COFINS: CST 01, BC R$ 1.000,00, alíquota 7,60%, valor R$ 76,00

### Exemplo 3: Produto com IPI

```sql
INSERT INTO "products" (
  id, "companyId", name, sku, barcode, ncm,
  "cfopEstadual", "cfopInterestadual",
  origin, csosn,
  "pisCst", "pisRate",
  "cofinsCst", "cofinsRate",
  "ipiCst", "ipiRate",
  "unitId"
) VALUES (
  gen_random_uuid(), 'company-uuid',
  'CIGARRO MARCA X MAÇO',
  'CIG001', '7891234567891', '24022000',
  '5102', '6102',
  '0', '500',
  '01', 1.65,
  '01', 7.60,
  '50', 300.00,
  'unid-uuid'
);
```

**Resultado na NF-e**:
- ICMS: CSOSN 500 (ST anteriormente)
- PIS: CST 01, alíquota 1,65%
- COFINS: CST 01, alíquota 7,60%
- IPI: CST 50, alíquota 300% (produtos com IPI alto)

---

## 🚨 Tratamento de Erros

### Erros Comuns e Soluções:

| Erro | Causa | Solução |
|------|-------|---------|
| "NCM inválido" | NCM não cadastrado ou formato errado | Cadastrar NCM de 8 dígitos (sem pontos) |
| "CFOP inválido" | CFOP não cadastrado | Cadastrar cfopEstadual (5xxx) e cfopInterestadual (6xxx) |
| "Origem inválida" | origin/origem não cadastrado | Usar valores de 0 a 8 (0=Nacional, 1=Estrangeira, etc.) |
| "CSOSN inválido" | csosn incorreto para Simples | Usar: 101, 102, 103, 201, 202, 203, 300, 400, 500, 900 |
| "CST inválido" | CST do imposto incorreto | Verificar tabela de CST oficial (ICMS, PIS, COFINS) |
| "Unidade não encontrada" | unitId nulo ou inválido | Cadastrar unidade de medida (UN, KG, PC, etc.) |
| "Produto sem imposto" | Impostos não cadastrados | Cadastrar pelo menos origem, CSOSN/CST, PIS CST, COFINS CST |

---

## 📚 Tabelas de Referência

### Origem da Mercadoria (orig):

| Código | Descrição |
|--------|-----------|
| 0 | Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8 |
| 1 | Estrangeira - Importação direta, exceto a indicada no código 6 |
| 2 | Estrangeira - Adquirida no mercado interno, exceto a indicada no código 7 |
| 3 | Nacional, mercadoria ou bem com Conteúdo de Importação superior a 40% e inferior ou igual a 70% |
| 4 | Nacional, cuja produção tenha sido feita em conformidade com os processos produtivos básicos |
| 5 | Nacional, mercadoria ou bem com Conteúdo de Importação inferior ou igual a 40% |
| 6 | Estrangeira - Importação direta, sem similar nacional, constante em lista CAMEX |
| 7 | Estrangeira - Adquirida no mercado interno, sem similar nacional, constante em lista CAMEX |
| 8 | Nacional, mercadoria ou bem com Conteúdo de Importação superior a 70% |

### CSOSN - Simples Nacional:

| Código | Descrição |
|--------|-----------|
| 101 | Tributada pelo Simples Nacional com permissão de crédito |
| 102 | Tributada pelo Simples Nacional sem permissão de crédito |
| 103 | Isenção do ICMS no Simples Nacional para faixa de receita bruta |
| 201 | Tributada pelo Simples Nacional com permissão de crédito e com cobrança do ICMS por ST |
| 202 | Tributada pelo Simples Nacional sem permissão de crédito e com cobrança do ICMS por ST |
| 203 | Isenção do ICMS nos Simples Nacional para faixa de receita bruta e com cobrança do ICMS por ST |
| 300 | Imune |
| 400 | Não tributada pelo Simples Nacional |
| 500 | ICMS cobrado anteriormente por substituição tributária ou por antecipação |
| 900 | Outros |

### CST ICMS - Regime Normal (principais):

| Código | Descrição |
|--------|-----------|
| 00 | Tributada integralmente |
| 10 | Tributada e com cobrança do ICMS por substituição tributária |
| 20 | Com redução de base de cálculo |
| 30 | Isenta ou não tributada e com cobrança do ICMS por substituição tributária |
| 40 | Isenta |
| 41 | Não tributada |
| 50 | Suspensão |
| 51 | Diferimento |
| 60 | ICMS cobrado anteriormente por substituição tributária |
| 70 | Com redução de base de cálculo e cobrança do ICMS por ST |
| 90 | Outras |

### CST PIS/COFINS (principais):

| Código | Descrição |
|--------|-----------|
| 01 | Operação tributável com alíquota básica |
| 02 | Operação tributável com alíquota diferenciada |
| 03 | Operação tributável com alíquota por unidade de medida de produto |
| 04 | Operação tributável - monofásica - revenda a alíquota zero |
| 05 | Operação tributável - substituição tributária |
| 06 | Operação tributável - alíquota zero |
| 07 | Operação isenta da contribuição |
| 08 | Operação sem incidência da contribuição |
| 09 | Operação com suspensão da contribuição |
| 49 | Outras operações de saída |
| 99 | Outras operações |

---

## 📝 Notas Finais

1. **Todos os dados dos produtos vêm do banco de dados** - não há valores fixos hardcoded
2. **Cada produto tem seus impostos individuais** - configurados no cadastro
3. **CFOP automático**: sistema escolhe estadual (5xxx) ou interestadual (6xxx) baseado no cliente
4. **Cálculos automáticos**: Valores de impostos são calculados automaticamente baseados nas alíquotas
5. **Regime tributário**: Sistema detecta automaticamente se é Simples Nacional ou Regime Normal
6. **Validação obrigatória**: Sempre validar dados fiscais completos antes de emitir NF-e
7. **IPI opcional**: Só aplicado se produto tiver IPI cadastrado
8. **IBS/CBS**: Reforma Tributária ainda não implementada (aguardando vigência)

---

**Última atualização**: 16 de novembro de 2025  
**Versão**: 1.0.0  
**Status**: ✅ Implementado e documentado
