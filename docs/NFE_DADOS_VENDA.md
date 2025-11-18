# NFe - Uso de Dados da Venda

## Alterações Realizadas

### Objetivo
Adaptar a emissão de NFe para utilizar os dados salvos no banco de dados (da venda) em vez de recebê-los na requisição.

---

## Campos Utilizados da Venda

### Dados Fiscais da Venda (model Sale)

| Campo | Tipo | Descrição | Uso na NFe |
|-------|------|-----------|------------|
| `subtotal` | Float | Soma dos produtos | vProd (Valor dos produtos) |
| `discountAmount` | Float | Valor do desconto | vDesc (Valor do desconto) |
| `shippingCost` | Float | Valor do frete | vFrete (Valor do frete) |
| `shippingModality` | Int | Modalidade do frete (0-9) | modFrete na tagTransp |
| `otherCharges` | Float | Outras despesas acessórias | vOutro (Outras despesas) |
| `otherChargesDesc` | String? | Descrição das outras despesas | Informação complementar (logs) |
| `totalAmount` | Float | Valor total da venda | vNF (Valor total da NF) |

### Modalidades de Frete (shippingModality)

| Código | Descrição |
|--------|-----------|
| 0 | Por conta do emitente |
| 1 | Por conta do destinatário/remetente |
| 2 | Por conta de terceiros |
| 3 | Transporte próprio por conta do remetente |
| 4 | Transporte próprio por conta do destinatário |
| 9 | Sem ocorrência de transporte |

**Padrão:** 9 (Sem frete)

---

## Alterações no Código

### 1. DTO (emitir-nfe.dto.ts)

**Removido:**
```typescript
@IsOptional()
@IsEnum(['9', '0', '1', '2', '3', '4'])
modalidadeFrete?: string;
```

**Justificativa:** O campo `shippingModality` já existe na venda e será usado diretamente.

### 2. Service (nfe.service.ts)

#### Seção de Totais
```typescript
console.log('   💰 Valores para cálculo:');
console.log(`      - subtotal (vProd): ${subtotal.toFixed(2)}`);
console.log(`      - discountAmount (vDesc): ${discountAmount.toFixed(2)}`);
console.log(`      - shippingCost (vFrete): ${shippingCost.toFixed(2)}`);
console.log(`      - otherCharges (vOutro): ${otherCharges.toFixed(2)}`);
if (sale.otherChargesDesc) {
  console.log(`      - Descrição outras despesas: ${sale.otherChargesDesc}`);
}
console.log(`      - totalAmount (vNF): ${totalAmount.toFixed(2)}`);
```

#### Seção de Transporte
**Antes:**
```typescript
NFe.tagTransp({ modFrete: parseInt(dto.modalidadeFrete || '9') });
```

**Depois:**
```typescript
console.log('\n🚚 [NF-e] Processando transporte...');
const modalidadeFrete = sale.shippingModality || 9; // 9 = Sem frete (padrão)
console.log(`   🚚 Modalidade de frete: ${modalidadeFrete}`);
console.log(`   💰 Valor do frete: R$ ${shippingCost.toFixed(2)}`);

NFe.tagTransp({ modFrete: modalidadeFrete });
console.log('   ✅ Dados de transporte adicionados');
```

---

## Campos Já Salvos no Banco de Dados

✅ **Todos os campos necessários já existem no schema `Sale`:**

```prisma
model Sale {
  // ... outros campos
  
  // Valores
  subtotal         Float
  discountAmount   Float   @default(0)
  discountPercent  Float   @default(0)
  shippingCost     Float   @default(0)
  shippingModality Int     @default(9)
  otherCharges     Float   @default(0)
  otherChargesDesc String?
  totalAmount      Float
  
  // ... outros campos
}
```

**Não foi necessário adicionar novos campos ao schema.**

---

## Fluxo de Emissão de NFe

### 1. Criação da Venda (POST /sales)
```json
{
  "customerId": "...",
  "items": [...],
  "shippingCost": 20.00,
  "shippingModality": 9,
  "otherCharges": 15.00,
  "otherChargesDesc": "Taxa de serviço",
  "discountAmount": 10.00
}
```

### 2. Emissão da NFe (POST /fiscal/nfe/emitir)
```json
{
  "saleId": "...",
  "enviarSefaz": true
}
```

**Dados usados automaticamente da venda:**
- ✅ subtotal (calculado dos itens)
- ✅ discountAmount
- ✅ shippingCost
- ✅ shippingModality
- ✅ otherCharges
- ✅ otherChargesDesc
- ✅ totalAmount

---

## Exemplo de Log de Emissão

```
💰 [NF-e] Calculando totais da NF-e...
   💰 Valores para cálculo:
      - subtotal (vProd): 1000.00
      - discountAmount (vDesc): 50.00
      - shippingCost (vFrete): 20.00
      - otherCharges (vOutro): 15.00
      - Descrição outras despesas: Taxa de serviço
      - totalAmount (vNF): 985.00
   ✅ Totais calculados

🚚 [NF-e] Processando transporte...
   🚚 Modalidade de frete: 9
   💰 Valor do frete: R$ 20.00
   ✅ Dados de transporte adicionados
```

---

## Validações e Valores Padrão

### Modalidade de Frete
- **Padrão:** 9 (Sem frete)
- **Fonte:** `sale.shippingModality`
- **Fallback:** Se não informado, usa 9

### Valores Monetários
- **Todos garantidos com `garantirNumero()`**
- **Nunca retornam NaN**
- **Valores undefined/null são convertidos para 0**

### Descrição de Outras Despesas
- **Opcional:** `sale.otherChargesDesc`
- **Uso:** Informação complementar nos logs
- **Pode ser exibida no campo de informações adicionais da NFe (futuro)**

---

## Compatibilidade com API Anterior

### Requisição Antiga (ainda funciona)
```json
{
  "saleId": "...",
  "modalidadeFrete": "9",
  "enviarSefaz": true
}
```
❌ **Campo `modalidadeFrete` removido do DTO**

### Requisição Nova (recomendada)
```json
{
  "saleId": "...",
  "enviarSefaz": true
}
```
✅ **Usa automaticamente os dados da venda**

---

## Benefícios

✅ **Consistência:** Dados vêm de uma única fonte (venda)
✅ **Simplicidade:** DTO mais limpo, menos campos na requisição
✅ **Rastreabilidade:** Valores da NFe sempre correspondem à venda
✅ **Menos erros:** Não há risco de enviar valores diferentes
✅ **Histórico:** Dados preservados na venda para auditoria

---

## Próximos Passos (Sugestões)

### 1. Informações Complementares
Adicionar `otherChargesDesc` no campo de informações adicionais da NFe:
```typescript
if (sale.otherChargesDesc) {
  NFe.tagInfAdic({
    infCpl: `Outras despesas: ${sale.otherChargesDesc}`
  });
}
```

### 2. Dados da Transportadora
Se necessário, adicionar campos à venda:
```prisma
model Sale {
  // ... outros campos
  
  transportadoraId   String?
  transportadoraNome String?
  transportadoraCnpj String?
  veiculoPlaca       String?
  
  // ... outros campos
}
```

### 3. Volumes Transportados
Adicionar informações de volumes:
```prisma
model Sale {
  // ... outros campos
  
  volumeQuantidade  Int?
  volumeEspecie     String? // Ex: "Caixa", "Volume"
  volumePesoLiquido Float?
  volumePesoBruto   Float?
  
  // ... outros campos
}
```

---

## Migração Necessária

**Não é necessária migração**, pois todos os campos já existem no schema.

Caso futuramente seja necessário adicionar novos campos:
```bash
npx prisma migrate dev --name add_sale_transport_fields
```

---

## Testes

### Cenário 1: Venda com Frete
```json
POST /sales
{
  "shippingCost": 25.50,
  "shippingModality": 0,
  "otherCharges": 10.00,
  "otherChargesDesc": "Embalagem especial"
}
```
✅ NFe deve refletir exatamente esses valores

### Cenário 2: Venda Sem Frete
```json
POST /sales
{
  "shippingCost": 0,
  "shippingModality": 9
}
```
✅ NFe com modFrete = 9 e vFrete = 0

### Cenário 3: Venda com Desconto
```json
POST /sales
{
  "subtotal": 1000.00,
  "discountAmount": 100.00,
  "totalAmount": 900.00
}
```
✅ NFe com vDesc = 100.00 e vNF = 900.00
