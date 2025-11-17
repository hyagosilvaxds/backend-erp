# 📦 Modalidade de Frete - Referência Rápida

## 🎯 Códigos Disponíveis

| Código | Nome | Descrição | Quando Usar |
|--------|------|-----------|-------------|
| **0** | CIF - Emitente | Por conta do Emitente | Vendedor paga e organiza o transporte |
| **1** | FOB - Destinatário | Por conta do Destinatário | Comprador paga e organiza o transporte |
| **2** | Terceiros | Por conta de Terceiros | Outro responsável pelo frete |
| **3** | Próprio Emitente | Transporte Próprio - Emitente | Vendedor usa frota própria |
| **4** | Próprio Destinatário | Transporte Próprio - Destinatário | Comprador usa frota própria |
| **9** | Sem Frete | Sem ocorrência de transporte | Retirada no local, produto digital |

---

## 💻 Uso na API

### Campo no JSON
```json
{
  "shippingModality": 0
}
```

### Valor Padrão
Se não informado: **9** (Sem Frete)

### Endpoints Afetados
- ✅ `POST /api/sales` - Criar venda
- ✅ `PATCH /api/sales/:id` - Atualizar venda
- ✅ `POST /api/nfe/from-sale` - Criar NFe (herda da venda)

---

## 🔧 Implementação Frontend

### React/TypeScript
```typescript
const MODALITIES = [
  { value: 0, label: 'CIF - Emitente paga' },
  { value: 1, label: 'FOB - Destinatário paga' },
  { value: 2, label: 'Terceiros' },
  { value: 3, label: 'Transporte Próprio - Emitente' },
  { value: 4, label: 'Transporte Próprio - Destinatário' },
  { value: 9, label: 'Sem Frete' },
];

<select value={modality} onChange={e => setModality(Number(e.target.value))}>
  {MODALITIES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
</select>
```

### Vue.js
```vue
<select v-model.number="shippingModality">
  <option :value="0">CIF - Emitente paga</option>
  <option :value="1">FOB - Destinatário paga</option>
  <option :value="2">Terceiros</option>
  <option :value="3">Transporte Próprio - Emitente</option>
  <option :value="4">Transporte Próprio - Destinatário</option>
  <option :value="9">Sem Frete</option>
</select>
```

---

## 📋 Exemplos de Requisição

### Exemplo 1: Venda CIF
```bash
curl -X POST /api/sales \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "uuid",
    "shippingCost": 50.00,
    "shippingModality": 0,
    "items": [...]
  }'
```

### Exemplo 2: Venda FOB
```bash
curl -X POST /api/sales \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "uuid",
    "shippingCost": 75.00,
    "shippingModality": 1,
    "items": [...]
  }'
```

### Exemplo 3: Sem Frete
```bash
curl -X POST /api/sales \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "uuid",
    "shippingCost": 0,
    "shippingModality": 9,
    "items": [...]
  }'
```

---

## ⚡ Regras de Negócio

### ✅ Validações
- Valor deve ser: **0, 1, 2, 3, 4 ou 9**
- É um campo **opcional** (padrão: 9)
- Aceita apenas **números inteiros**

### 🔄 Integração NFe
- Modalidade é **copiada automaticamente** da venda para a NFe
- Pode ser **sobrescrita** ao criar a NFe manualmente
- Campo obrigatório para **emissão de NFe**

### 💡 Dicas
- **Modalidade 9**: Zere o `shippingCost` quando usar "Sem Frete"
- **Modalidade 1**: Cliente paga o frete, mas pode incluir valor para referência
- **Modalidade 0**: Inclua o valor do frete no total da venda

---

## 🧪 Testando

### Testar Criação
```http
POST /api/sales
{
  "customerId": "uuid",
  "shippingModality": 0,
  "shippingCost": 50.00,
  "items": [{"productId": "uuid", "quantity": 1, "unitPrice": 100}]
}
```

### Verificar na NFe
```http
POST /api/nfe/from-sale
{
  "saleId": "sale-uuid",
  "serie": "1",
  "naturezaOperacao": "Venda"
}
```

### Validar Resposta
```json
{
  "id": "nfe-uuid",
  "modalidadeFrete": 0,  // ✅ Copiado da venda
  ...
}
```

---

## 📚 Documentação Completa

Para mais detalhes, veja:
- 📖 `docs/SALES_SHIPPING_MODALITY.md` - Guia completo de implementação
- 🧪 `sales-shipping-modality-tests.http` - Testes de API prontos

---

## ❓ FAQ

**Q: O que acontece se eu não informar a modalidade?**  
A: Sistema usa modalidade **9** (Sem Frete) como padrão.

**Q: Posso mudar a modalidade depois de criar a venda?**  
A: Sim, use `PATCH /api/sales/:id` com o novo valor.

**Q: A modalidade afeta o cálculo do total?**  
A: Não diretamente. O total é calculado com base no `shippingCost`, independente da modalidade.

**Q: Posso usar modalidade diferente na NFe?**  
A: Sim, ao criar NFe via `POST /api/nfe/from-sale`, você pode passar `modalidadeFrete` para sobrescrever.

---

**Versão**: 1.0  
**Data**: 16/11/2024  
**Status**: ✅ Implementado
