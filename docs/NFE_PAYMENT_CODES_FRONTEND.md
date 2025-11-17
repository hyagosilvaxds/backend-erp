# Códigos de Pagamento SEFAZ - Guia Frontend

## 📋 Visão Geral

Ao criar ou editar **Formas de Pagamento**, é **obrigatório** selecionar um **Código SEFAZ** correspondente. Esse código será usado automaticamente na emissão de Notas Fiscais Eletrônicas (NFe).

---

## 🔑 Campo Obrigatório: `sefazCode`

### Quando criar uma forma de pagamento:
```json
{
  "name": "PIX Dinâmico",
  "code": "PIX_DYNAMIC",
  "sefazCode": "PIX_DINAMICO", // ⚠️ OBRIGATÓRIO
  "active": true
}
```

---

## 📊 Tabela Completa de Códigos SEFAZ

| Enum (Backend)                          | Código | Descrição                                          | Exemplo de Uso                    |
|-----------------------------------------|--------|---------------------------------------------------|-----------------------------------|
| `DINHEIRO`                              | 01     | Dinheiro                                          | Pagamento em espécie              |
| `CHEQUE`                                | 02     | Cheque                                            | Cheque bancário                   |
| `CARTAO_CREDITO`                        | 03     | Cartão de Crédito                                 | Visa, Mastercard, Amex            |
| `CARTAO_DEBITO`                         | 04     | Cartão de Débito                                  | Débito em conta                   |
| `CREDITO_LOJA`                          | 05     | Crédito Loja                                      | Crediário próprio                 |
| `VALE_ALIMENTACAO`                      | 10     | Vale Alimentação                                  | Sodexo, Alelo Alimentação         |
| `VALE_REFEICAO`                         | 11     | Vale Refeição                                     | Ticket, VR                        |
| `VALE_PRESENTE`                         | 12     | Vale Presente                                     | Gift card                         |
| `VALE_COMBUSTIVEL`                      | 13     | Vale Combustível                                  | Ticket Car, Goodcard              |
| `DUPLICATA_MERCANTIL`                   | 14     | Duplicata Mercantil                               | Boleto faturado                   |
| `BOLETO_BANCARIO`                       | 15     | Boleto Bancário                                   | Boleto padrão                     |
| `DEPOSITO_BANCARIO`                     | 16     | Depósito Bancário                                 | Depósito identificado             |
| `PIX_DINAMICO`                          | 17     | PIX Dinâmico                                      | QR Code gerado na hora            |
| `TRANSFERENCIA`                         | 18     | Transferência / Carteira Digital                  | TED, DOC, PicPay, Mercado Pago    |
| `PROGRAMA_FIDELIDADE`                   | 19     | Programa de Fidelidade / Cashback                 | Pontos, crédito virtual           |
| `PIX_ESTATICO`                          | 20     | PIX Estático                                      | QR Code fixo, chave PIX           |
| `CREDITO_EM_LOJA`                       | 21     | Crédito em Loja (Private Label)                   | Cartão próprio da loja            |
| `PAGAMENTO_ELETRONICO_NAO_INFORMADO`    | 22     | Pagamento Eletrônico não Informado                | Outros pagamentos eletrônicos     |
| `SEM_PAGAMENTO`                         | 90     | Sem pagamento                                     | Bonificação, amostra grátis       |
| `OUTROS`                                | 99     | Outros                                            | Outras formas não listadas        |

---

## 🎨 Sugestão de Mapeamento (Frontend → Backend)

### Tipos Comuns de Pagamento

| Nome da Forma de Pagamento | `code` (interno)    | `sefazCode` (obrigatório) |
|----------------------------|---------------------|---------------------------|
| Dinheiro                   | `CASH`              | `DINHEIRO`                |
| Cartão de Crédito          | `CREDIT_CARD`       | `CARTAO_CREDITO`          |
| Cartão de Débito           | `DEBIT_CARD`        | `CARTAO_DEBITO`           |
| PIX Dinâmico               | `PIX_DYNAMIC`       | `PIX_DINAMICO`            |
| PIX Estático (Chave)       | `PIX_STATIC`        | `PIX_ESTATICO`            |
| Boleto Bancário            | `BANK_SLIP`         | `BOLETO_BANCARIO`         |
| Transferência Bancária     | `BANK_TRANSFER`     | `TRANSFERENCIA`           |
| Cheque                     | `CHECK`             | `CHEQUE`                  |
| Vale Alimentação           | `FOOD_VOUCHER`      | `VALE_ALIMENTACAO`        |
| Vale Refeição              | `MEAL_VOUCHER`      | `VALE_REFEICAO`           |
| Crediário                  | `STORE_CREDIT`      | `CREDITO_LOJA`            |

---

## 🔄 Fluxo Completo

### 1. Cadastro de Forma de Pagamento
```
Frontend → API: POST /api/payment-methods
{
  "name": "PIX Dinâmico",
  "code": "PIX_DYNAMIC",
  "sefazCode": "PIX_DINAMICO", // ⚠️ Obrigatório!
  "allowInstallments": false,
  "active": true
}
```

### 2. Venda com Forma de Pagamento
```
Frontend → API: POST /api/sales
{
  "customerId": "...",
  "paymentMethodId": "id-do-pix-dinamico",
  "items": [...]
}
```

### 3. Emissão de NFe a partir da Venda
```
Frontend → API: POST /api/nfe/from-sale
{
  "saleId": "id-da-venda",
  "serie": "1",
  "naturezaOperacao": "VENDA DE MERCADORIA"
}
```

**✅ O sistema pega automaticamente o código SEFAZ da forma de pagamento e inclui na NFe!**

Resultado na NFe:
```xml
<detPag>
  <indPag>0</indPag> <!-- 0=À vista, 1=A prazo -->
  <tPag>17</tPag>    <!-- PIX Dinâmico -->
  <vPag>1500.00</vPag>
</detPag>
```

---

## 🚨 Validações Importantes

### ✅ Obrigatórios:
- `sefazCode` é **obrigatório** ao criar/editar forma de pagamento
- O código deve ser um dos valores da tabela acima

### ⚠️ Atenção:
- **PIX tem 2 códigos**: `PIX_DINAMICO` (17) para QR Code gerado na hora, `PIX_ESTATICO` (20) para chave PIX fixa
- **Boleto**: use `BOLETO_BANCARIO` (15) para boletos comuns, `DUPLICATA_MERCANTIL` (14) para duplicatas faturadas
- **Carteira Digital** (PicPay, Mercado Pago): use `TRANSFERENCIA` (18)

### ❌ Erros Comuns:
```json
// ❌ ERRADO - falta sefazCode
{
  "name": "PIX",
  "code": "PIX"
}

// ✅ CORRETO
{
  "name": "PIX Dinâmico",
  "code": "PIX_DYNAMIC",
  "sefazCode": "PIX_DINAMICO"
}
```

---

## 🖥️ Componente de Seleção (Exemplo React)

```tsx
import { Select } from '@/components/ui/select';

const SEFAZ_PAYMENT_OPTIONS = [
  { value: 'DINHEIRO', label: '01 - Dinheiro' },
  { value: 'CHEQUE', label: '02 - Cheque' },
  { value: 'CARTAO_CREDITO', label: '03 - Cartão de Crédito' },
  { value: 'CARTAO_DEBITO', label: '04 - Cartão de Débito' },
  { value: 'CREDITO_LOJA', label: '05 - Crédito Loja' },
  { value: 'VALE_ALIMENTACAO', label: '10 - Vale Alimentação' },
  { value: 'VALE_REFEICAO', label: '11 - Vale Refeição' },
  { value: 'VALE_PRESENTE', label: '12 - Vale Presente' },
  { value: 'VALE_COMBUSTIVEL', label: '13 - Vale Combustível' },
  { value: 'DUPLICATA_MERCANTIL', label: '14 - Duplicata Mercantil' },
  { value: 'BOLETO_BANCARIO', label: '15 - Boleto Bancário' },
  { value: 'DEPOSITO_BANCARIO', label: '16 - Depósito Bancário' },
  { value: 'PIX_DINAMICO', label: '17 - PIX Dinâmico' },
  { value: 'TRANSFERENCIA', label: '18 - Transferência / Carteira Digital' },
  { value: 'PROGRAMA_FIDELIDADE', label: '19 - Programa Fidelidade / Cashback' },
  { value: 'PIX_ESTATICO', label: '20 - PIX Estático (Chave PIX)' },
  { value: 'CREDITO_EM_LOJA', label: '21 - Crédito em Loja (Private Label)' },
  { value: 'PAGAMENTO_ELETRONICO_NAO_INFORMADO', label: '22 - Pag. Eletrônico não Informado' },
  { value: 'SEM_PAGAMENTO', label: '90 - Sem Pagamento' },
  { value: 'OUTROS', label: '99 - Outros' },
];

function PaymentMethodForm() {
  return (
    <form>
      {/* ... outros campos ... */}
      
      <Select 
        label="Código SEFAZ (obrigatório)" 
        name="sefazCode"
        options={SEFAZ_PAYMENT_OPTIONS}
        required
      />
      
      {/* Dica contextual */}
      <p className="text-sm text-gray-600">
        Este código será usado automaticamente na emissão de NFe
      </p>
    </form>
  );
}
```

---

## 📖 Referências

- **Tabela Oficial**: [Manual de Orientação NFe - Tabela 4.3.3.4.6.1](https://www.nfe.fazenda.gov.br/portal/exibirArquivo.aspx?conteudo=eRn/kZdQ+Ks=)
- **Campo na NFe**: `tPag` (Meio de Pagamento)
- **Tag XML**: `<detPag><tPag>`

---

## 💡 Dicas de UX

### Sugestões Inteligentes:
Ao usuário digitar "PIX", sugerir:
- PIX Dinâmico (17) - QR Code gerado
- PIX Estático (20) - Chave PIX fixa

Ao digitar "Boleto", sugerir:
- Boleto Bancário (15) - Uso geral
- Duplicata Mercantil (14) - Faturamento

### Agrupamento no Select:
```tsx
<optgroup label="💳 Cartões">
  <option value="CARTAO_CREDITO">03 - Cartão de Crédito</option>
  <option value="CARTAO_DEBITO">04 - Cartão de Débito</option>
</optgroup>

<optgroup label="🏦 PIX">
  <option value="PIX_DINAMICO">17 - PIX Dinâmico</option>
  <option value="PIX_ESTATICO">20 - PIX Estático</option>
</optgroup>

<optgroup label="🎟️ Vales">
  <option value="VALE_ALIMENTACAO">10 - Vale Alimentação</option>
  <option value="VALE_REFEICAO">11 - Vale Refeição</option>
  <option value="VALE_PRESENTE">12 - Vale Presente</option>
  <option value="VALE_COMBUSTIVEL">13 - Vale Combustível</option>
</optgroup>
```

---

## ✅ Checklist de Implementação

- [ ] Campo `sefazCode` adicionado no formulário de forma de pagamento
- [ ] Select com todos os 25 códigos disponíveis
- [ ] Validação obrigatória no frontend
- [ ] Tooltip explicando a diferença entre PIX_DINAMICO e PIX_ESTATICO
- [ ] Agrupamento visual dos códigos por categoria
- [ ] Mensagem de confirmação ao salvar
- [ ] Exibir código SEFAZ na listagem de formas de pagamento
- [ ] Permitir filtrar por código SEFAZ na busca
- [ ] Exibir na tela de detalhes da venda qual código será usado na NFe

---

**🚀 Com isso, todas as NFes terão o código de pagamento correto automaticamente!**
