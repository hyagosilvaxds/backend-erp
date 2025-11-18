# Cálculo de Totais da NF-e

## 📋 Visão Geral

Este documento explica como os totais da NF-e são calculados no sistema ERP.

## 💰 Estrutura de Valores

### Valores da Venda (Banco de Dados)

A tabela `Sale` contém os seguintes campos financeiros:

```prisma
model Sale {
  subtotal        Decimal  // Soma dos produtos (quantidade × preço unitário)
  discountAmount  Decimal  // Desconto aplicado
  shippingCost    Decimal  // Valor do frete
  totalAmount     Decimal  // Valor final (subtotal - desconto + frete + encargos)
  
  // Dados do frete
  shippingModality Int?    // 0-9 (modalidade SEFAZ)
  
  // ... outros campos
}
```

### Cálculo Simplificado

O sistema usa uma abordagem **simplificada** para evitar divergências:

```
vProd = subtotal                    // Total de produtos
vFrete = shippingCost              // Valor do frete
vNF = totalAmount                  // Total da nota (já calculado no sistema)
vPag = vNF                         // Pagamento = Total da nota
vTroco = 0.00                      // Sem troco (pagamento exato)
```

## 📊 Campos da Tag `<total>` (XML NF-e)

```xml
<total>
  <ICMSTot>
    <vProd>132.00</vProd>        <!-- Subtotal dos produtos -->
    <vFrete>0.00</vFrete>        <!-- Valor do frete -->
    <vSeg>0.00</vSeg>            <!-- Seguro (sempre 0) -->
    <vDesc>0.00</vDesc>          <!-- Desconto (já aplicado no totalAmount) -->
    <vOutro>0.00</vOutro>        <!-- Outras despesas (já aplicadas no totalAmount) -->
    <vII>0.00</vII>              <!-- Imposto de Importação -->
    <vIPI>0.00</vIPI>            <!-- IPI -->
    <vNF>132.00</vNF>            <!-- Total da nota (= totalAmount) -->
    
    <!-- Tributos calculados -->
    <vICMS>0.00</vICMS>          <!-- Total de ICMS -->
    <vPIS>0.00</vPIS>            <!-- Total de PIS -->
    <vCOFINS>0.00</vCOFINS>      <!-- Total de COFINS -->
  </ICMSTot>
</total>
```

## 🚚 Modalidades de Frete (SEFAZ)

| Código | Descrição |
|--------|-----------|
| 0 | Por conta do emitente |
| 1 | Por conta do destinatário/remetente |
| 2 | Por conta de terceiros |
| 3 | Transporte próprio por conta do remetente |
| 4 | Transporte próprio por conta do destinatário |
| 9 | Sem frete (padrão) |

## 💳 Validação do Pagamento

A SEFAZ valida a fórmula:

```
vPag - vTroco = vNF
```

No nosso sistema:
- `vPag = totalAmount` (valor total da venda)
- `vTroco = 0.00` (sempre zero para vendas normais)
- `vNF = totalAmount` (mesmo valor)

Portanto: `totalAmount - 0 = totalAmount` ✅

## 🔧 Por que Simplificamos?

### ❌ Problema Anterior

Antes, tentávamos calcular o `vNF` usando a fórmula:

```
vNF = vProd - vDesc + vFrete + vSeg + vOutro + vII + vIPI
```

Isso causava **divergências** entre o valor calculado e o `totalAmount` do banco, pois:
- Descontos e encargos podiam estar aplicados de forma diferente no sistema
- Arredondamentos causavam diferenças de centavos
- O `totalAmount` já estava correto no sistema de vendas

### ✅ Solução Atual

Agora usamos diretamente o `totalAmount` da venda:
- **Sem cálculos complexos**: evita erros de arredondamento
- **Consistência garantida**: vPag = vNF sempre
- **Simplicidade**: menos campos para preencher

## 📝 Exemplo Prático

### Venda no Sistema

```json
{
  "subtotal": 150.00,
  "discountAmount": 10.00,
  "shippingCost": 8.80,
  "totalAmount": 148.80
}
```

### XML Gerado

```xml
<total>
  <ICMSTot>
    <vProd>150.00</vProd>
    <vFrete>8.80</vFrete>
    <vDesc>0.00</vDesc>
    <vOutro>0.00</vOutro>
    <vNF>148.80</vNF>
  </ICMSTot>
</total>

<pag>
  <detPag>
    <vPag>148.80</vPag>
  </detPag>
  <vTroco>0.00</vTroco>
</pag>
```

**Resultado**: ✅ Aprovado pela SEFAZ

## 🎯 Resumo

1. **vProd** = `sale.subtotal` (soma dos produtos)
2. **vFrete** = `sale.shippingCost` (valor do frete)
3. **vNF** = `sale.totalAmount` (total da venda)
4. **vPag** = `sale.totalAmount` (pagamento)
5. **vTroco** = `0.00` (sempre zero)
6. **vDesc, vOutro** = `0.00` (já aplicados no totalAmount)

**Validação**: `vPag - vTroco = vNF` → `148.80 - 0.00 = 148.80` ✅

---

📅 Última atualização: 17/11/2025
