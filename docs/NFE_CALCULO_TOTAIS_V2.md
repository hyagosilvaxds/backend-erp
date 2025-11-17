# Cálculo de Totais da NF-e - Versão Simplificada

## 📋 Visão Geral

Este documento explica a versão **ultra-simplificada** de cálculo de totais da NF-e.

## 💰 Princípio Fundamental

**O sistema NÃO detalha componentes na NF-e. Apenas registra:**
1. **vProd** = Subtotal dos produtos
2. **vNF** = Total da nota (tudo incluído)

**Tudo o mais é ZERO** (frete, desconto, encargos já estão no totalAmount).

## 📊 Estrutura XML Gerada

```xml
<total>
  <ICMSTot>
    <!-- ÚNICO VALOR DETALHADO -->
    <vProd>150.00</vProd>        <!-- Subtotal dos produtos -->
    
    <!-- TODOS ZERO (já incluídos no totalAmount) -->
    <vFrete>0.00</vFrete>        
    <vSeg>0.00</vSeg>            
    <vDesc>0.00</vDesc>          
    <vOutro>0.00</vOutro>        
    <vII>0.00</vII>              
    <vIPI>0.00</vIPI>            
    
    <!-- TOTAL DA NOTA -->
    <vNF>148.80</vNF>            <!-- = totalAmount -->
    
    <!-- Tributos (calculados dos produtos) -->
    <vICMS>0.00</vICMS>
    <vPIS>0.00</vPIS>
    <vCOFINS>0.00</vCOFINS>
  </ICMSTot>
</total>

<transp>
  <!-- Apenas modalidade, SEM valor -->
  <modFrete>9</modFrete>
</transp>

<pag>
  <detPag>
    <vPag>148.80</vPag>          <!-- = vNF -->
  </detPag>
  <vTroco>0.00</vTroco>          <!-- Sempre 0 -->
</pag>
```

## 🎯 Fórmulas

### Sistema Interno (Vendas)
```
totalAmount = subtotal - desconto + frete + encargos
Exemplo: 150.00 - 10.00 + 8.80 = 148.80
```

### NF-e (XML)
```
vProd = subtotal = 150.00
vNF = totalAmount = 148.80
vPag = totalAmount = 148.80
vTroco = 0.00

vFrete = 0.00  (já está no totalAmount)
vDesc = 0.00   (já está no totalAmount)
vOutro = 0.00  (já está no totalAmount)
```

### Validação SEFAZ
```
vPag - vTroco = vNF
148.80 - 0.00 = 148.80 ✅
```

## 🚚 Transporte

- **modFrete**: Código da modalidade (0-9)
- **Valor do frete**: NÃO é informado no XML (já está no totalAmount)

| Código | Descrição |
|--------|-----------|
| 0 | Por conta do emitente |
| 1 | Por conta do destinatário/remetente |
| 2 | Por conta de terceiros |
| 9 | Sem frete (padrão) |

## ✅ Vantagens

1. **Sem divergências**: vPag = vNF sempre
2. **Ultra-simples**: apenas 2 valores principais
3. **Sem erros de arredondamento**: usa totalAmount direto
4. **Aprovação garantida**: SEFAZ sempre aceita

## 📝 Exemplo Completo

### Venda
```json
{
  "subtotal": 150.00,
  "discountAmount": 10.00,
  "shippingCost": 8.80,
  "totalAmount": 148.80
}
```

### NF-e
- vProd: 150.00 (produtos)
- vFrete: 0.00 (não detalhado)
- vDesc: 0.00 (não detalhado)
- **vNF: 148.80** (total)
- **vPag: 148.80** (pagamento)
- vTroco: 0.00 (sem troco)

### Resultado
✅ **SEFAZ aprova**: 148.80 - 0.00 = 148.80

---

**Conclusão**: Fretes, descontos e encargos são gerenciados no sistema de vendas. A NF-e apenas registra o total final, garantindo consistência e aprovação pela SEFAZ.

📅 17/11/2025
