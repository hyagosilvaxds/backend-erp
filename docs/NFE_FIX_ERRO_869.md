# Correção: Erro 869 - Valor do Troco Incorreto

## Problema Identificado

**Erro SEFAZ 869:** "Rejeição: Valor do troco incorreto"

Este erro ocorre quando há inconsistência entre:
1. Os valores totais da NFe (vNF)
2. O valor do pagamento (vPag)
3. O valor do troco (vTroco)

### Regra da SEFAZ
```
vPag - vTroco = vNF
```

Se esta equação não for verdadeira, a SEFAZ rejeita a NFe.

---

## Causa Raiz

### 1. **tagTotal vazia**
```typescript
// ❌ ANTES - Objeto vazio
NFe.tagTotal({});
```

Isso causava valores indefinidos ou zero nos campos de totais.

### 2. **Impostos não calculados**
Os totais de ICMS, PIS, COFINS, IBS e CBS não estavam sendo somados e informados.

### 3. **Valor do pagamento inconsistente**
Usava `valorPagamento` que poderia ser diferente de `totalAmount`.

---

## Solução Implementada

### 1. **Cálculo Completo dos Totais**

```typescript
// Calcular totais de impostos
let totalICMS = 0;
let totalPIS = 0;
let totalCOFINS = 0;
let totalIBS = 0;
let totalCBS = 0;

for (let index = 0; index < sale.items.length; index++) {
  const item = sale.items[index];
  const produto = item.product;
  const itemTotal = this.garantirNumero(item.total);
  
  // ICMS (apenas se não for Simples Nacional)
  const crt = this.obterCRT(sale.company.regimeTributario || '');
  if (crt !== '1') {
    const icmsRate = this.garantirNumero(produto.icmsRate || produto.aliqIcms);
    if (icmsRate > 0) {
      totalICMS += itemTotal * (icmsRate / 100);
    }
  }
  
  // PIS
  const pisRate = this.garantirNumero(produto.pisRate || produto.aliqPis);
  if (pisRate > 0) {
    totalPIS += itemTotal * (pisRate / 100);
  }
  
  // COFINS
  const cofinsRate = this.garantirNumero(produto.cofinsRate || produto.aliqCofins);
  if (cofinsRate > 0) {
    totalCOFINS += itemTotal * (cofinsRate / 100);
  }
  
  // IBS/CBS
  const pIBSUF = sale.company.aliquotaIBS || 0.10;
  const pCBS = sale.company.aliquotaCBS || 0.90;
  totalIBS += itemTotal * (pIBSUF / 100);
  totalCBS += itemTotal * (pCBS / 100);
}
```

### 2. **Estrutura Completa de Totais**

```typescript
const totaisNFe = {
  // Total de produtos
  vProd: subtotal.toFixed(2),
  
  // Totais de tributos
  vICMS: totalICMS.toFixed(2),
  vPIS: totalPIS.toFixed(2),
  vCOFINS: totalCOFINS.toFixed(2),
  
  // Outros valores
  vFrete: shippingCost.toFixed(2),
  vSeg: '0.00', // Seguro
  vDesc: discountAmount.toFixed(2),
  vOutro: otherCharges.toFixed(2),
  vII: '0.00', // Imposto de Importação
  vIPI: '0.00', // IPI
  
  // Valor total da nota
  vNF: totalAmount.toFixed(2),
};

NFe.tagTotal(totaisNFe);
```

### 3. **Pagamento Consistente**

```typescript
const detPagamento: any = {
  indPag: sale.installments > 1 ? 1 : 0,
  tPag: codigoPagamentoSefaz,
  vPag: totalAmount.toFixed(2), // ✅ SEMPRE igual ao vNF
};

NFe.tagDetPag([detPagamento]);

// Troco sempre 0 em vendas normais
const valorTroco = 0;
NFe.tagTroco(valorTroco.toFixed(2));
```

---

## Estrutura de Valores na NFe

### Fórmula de Cálculo

```
vNF = vProd - vDesc + vFrete + vSeg + vOutro + vII + vIPI + vST + vFCP
```

**Onde:**
- `vProd` = Soma de todos os produtos (subtotal)
- `vDesc` = Desconto
- `vFrete` = Frete
- `vSeg` = Seguro (normalmente 0)
- `vOutro` = Outras despesas
- `vII` = Imposto de Importação (normalmente 0)
- `vIPI` = IPI (normalmente 0)
- `vST` = ICMS ST (normalmente 0)
- `vFCP` = Fundo de Combate à Pobreza (normalmente 0)

### Exemplo Prático

**Venda:**
```json
{
  "subtotal": 1000.00,
  "discountAmount": 50.00,
  "shippingCost": 20.00,
  "otherCharges": 15.00,
  "totalAmount": 985.00
}
```

**Cálculo:**
```
vNF = 1000.00 - 50.00 + 20.00 + 0.00 + 15.00
vNF = 985.00 ✅
```

**Pagamento:**
```
vPag = 985.00 ✅
vTroco = 0.00 ✅
```

**Validação:**
```
vPag - vTroco = vNF
985.00 - 0.00 = 985.00 ✅
```

---

## Logs de Debug Adicionados

### Totais de Impostos
```
💰 Totais de impostos calculados:
   - Total ICMS: R$ 0.00
   - Total PIS: R$ 16.50
   - Total COFINS: R$ 76.00
   - Total IBS: R$ 1.00
   - Total CBS: R$ 9.00
```

### Estrutura de Totais
```json
{
  "vProd": "1000.00",
  "vICMS": "0.00",
  "vPIS": "16.50",
  "vCOFINS": "76.00",
  "vFrete": "20.00",
  "vSeg": "0.00",
  "vDesc": "50.00",
  "vOutro": "15.00",
  "vII": "0.00",
  "vIPI": "0.00",
  "vNF": "985.00"
}
```

### Estrutura de Pagamento
```
💳 Estrutura de pagamento:
   - indPag: 0 (À vista)
   - tPag: 15
   - vPag: R$ 985.00
💳 Troco: R$ 0.00
```

---

## Casos Especiais

### 1. Venda com Troco (Dinheiro)

Quando o cliente paga em dinheiro com valor maior:

```typescript
// Exemplo: vNF = 985.00, cliente pagou 1000.00
const valorRecebido = 1000.00; // Valor dado pelo cliente
const valorTroco = valorRecebido - totalAmount; // 15.00

const detPagamento = {
  indPag: 0, // À vista
  tPag: '01', // Dinheiro
  vPag: valorRecebido.toFixed(2), // 1000.00
};

NFe.tagTroco(valorTroco.toFixed(2)); // 15.00
```

**Validação:**
```
vPag - vTroco = vNF
1000.00 - 15.00 = 985.00 ✅
```

### 2. Pagamento Parcelado

```typescript
const detPagamento = {
  indPag: 1, // A prazo
  tPag: '15', // Boleto
  vPag: totalAmount.toFixed(2), // Valor exato
};

NFe.tagTroco('0.00'); // Sem troco
```

### 3. Múltiplas Formas de Pagamento

Para pagamento dividido (ex: cartão + dinheiro):

```typescript
const pagamentos = [
  { tPag: '03', vPag: '500.00' }, // Cartão
  { tPag: '01', vPag: '485.00' }, // Dinheiro
];

// Soma deve ser igual a vNF
const somaPagamentos = 500.00 + 485.00; // 985.00 ✅

NFe.tagDetPag(pagamentos);
NFe.tagTroco('0.00');
```

---

## Checklist de Validação

Antes de enviar para SEFAZ, validar:

- [ ] `vNF` = `vProd` - `vDesc` + `vFrete` + `vSeg` + `vOutro`
- [ ] `vPag` ≥ `vNF` (valor pago deve ser maior ou igual ao total)
- [ ] `vPag` - `vTroco` = `vNF` (equação fundamental)
- [ ] Todos os valores com 2 casas decimais
- [ ] Nenhum valor negativo
- [ ] Soma dos impostos informada corretamente

---

## Resultado

✅ **Erro 869 corrigido**
✅ **Totais calculados corretamente**
✅ **Impostos somados e informados**
✅ **Pagamento sempre consistente com vNF**
✅ **Troco sempre 0.00 em vendas normais**
✅ **Logs detalhados para debug**

---

## Referências

- **Manual de Integração NFe v4.0** - Seção de Totalizadores
- **Erro 869 SEFAZ** - Valor do Troco Incorreto
- **Regra:** `vPag - vTroco = vNF`
