# Guia de Migração: Códigos SEFAZ em Formas de Pagamento

## ✅ Alterações Implementadas

### 1. **Banco de Dados**
- ✅ Campo `sefazCode` adicionado ao modelo `PaymentMethod`
- ✅ Enum `PaymentCodeSefaz` criado com 25 códigos oficiais
- ✅ Migration aplicada: `20251116201209_add_sefaz_payment_codes`

### 2. **Backend**
- ✅ DTO de criação/edição de formas de pagamento atualizado (campo obrigatório)
- ✅ Utilitário de conversão enum → código numérico criado
- ✅ Serviço NFe adaptado para usar código SEFAZ automaticamente
- ✅ DTO da NFe com campos de pagamento

### 3. **Documentação**
- ✅ Guia frontend completo (`NFE_PAYMENT_CODES_FRONTEND.md`)
- ✅ Resumo técnico (`NFE_PAYMENT_CODES_SUMMARY.md`)
- ✅ Script SQL de migração de dados (`migrate-payment-sefaz-codes.sql`)

---

## 🔄 Passos para Migração de Dados Existentes

### Opção 1: Script SQL Automático (Recomendado)

```bash
# 1. Conectar ao banco de dados
psql -U seu_usuario -d erp_db

# 2. Executar o script (em modo ROLLBACK para revisão)
\i scripts/migrate-payment-sefaz-codes.sql

# 3. Revisar as alterações mostradas

# 4. Se tudo estiver OK, editar o script e trocar ROLLBACK por COMMIT
# Depois executar novamente:
\i scripts/migrate-payment-sefaz-codes.sql
```

### Opção 2: Migração Manual via Prisma

```typescript
// scripts/migrate-sefaz-codes.ts
import { PrismaClient, PaymentCodeSefaz } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateSefazCodes() {
  // Mapear tipos básicos
  await prisma.paymentMethod.updateMany({
    where: { type: 'CASH' },
    data: { sefazCode: PaymentCodeSefaz.DINHEIRO }
  });

  await prisma.paymentMethod.updateMany({
    where: { type: 'CREDIT_CARD' },
    data: { sefazCode: PaymentCodeSefaz.CARTAO_CREDITO }
  });

  await prisma.paymentMethod.updateMany({
    where: { type: 'DEBIT_CARD' },
    data: { sefazCode: PaymentCodeSefaz.CARTAO_DEBITO }
  });

  await prisma.paymentMethod.updateMany({
    where: { type: 'PIX' },
    data: { sefazCode: PaymentCodeSefaz.PIX_DINAMICO }
  });

  await prisma.paymentMethod.updateMany({
    where: { type: 'BANK_SLIP' },
    data: { sefazCode: PaymentCodeSefaz.BOLETO_BANCARIO }
  });

  await prisma.paymentMethod.updateMany({
    where: { type: 'BANK_TRANSFER' },
    data: { sefazCode: PaymentCodeSefaz.TRANSFERENCIA }
  });

  await prisma.paymentMethod.updateMany({
    where: { type: 'CHECK' },
    data: { sefazCode: PaymentCodeSefaz.CHEQUE }
  });

  // Qualquer outro = OUTROS
  await prisma.paymentMethod.updateMany({
    where: { sefazCode: null },
    data: { sefazCode: PaymentCodeSefaz.OUTROS }
  });

  console.log('Migração concluída!');
}

migrateSefazCodes()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

```bash
# Executar
npx ts-node scripts/migrate-sefaz-codes.ts
```

### Opção 3: Atualização Forçada pelo Frontend

Se não houver muitas formas de pagamento cadastradas, pode ser mais simples:

1. Adicionar validação no frontend que **bloqueia** criação de vendas se `sefazCode` for `null`
2. Usuário precisa editar cada forma de pagamento e escolher o código manualmente
3. Garante que cada empresa escolhe o código mais adequado

---

## 🧪 Testes Após Migração

### 1. Verificar Dados Migrados
```sql
-- Ver todas as formas de pagamento com seus códigos SEFAZ
SELECT 
  name,
  type,
  "sefazCode"
FROM payment_methods
ORDER BY "sefazCode";

-- Verificar se alguma ficou sem código (não deveria ter nenhuma)
SELECT COUNT(*) FROM payment_methods WHERE "sefazCode" IS NULL;
```

### 2. Testar Criação de Forma de Pagamento
```bash
curl -X POST http://localhost:3000/api/payment-methods \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "name": "PIX Teste",
    "code": "PIX_TEST",
    "type": "PIX",
    "sefazCode": "PIX_DINAMICO"
  }'
```

### 3. Testar Geração de NFe com Código SEFAZ
```bash
# 1. Criar venda com forma de pagamento
curl -X POST http://localhost:3000/api/sales \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "customerId": "...",
    "paymentMethodId": "id-do-pix",
    "items": [...]
  }'

# 2. Gerar NFe da venda
curl -X POST http://localhost:3000/api/nfe/from-sale \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "saleId": "id-da-venda",
    "serie": "1",
    "naturezaOperacao": "VENDA"
  }'

# 3. Verificar se o campo meioPagamento foi preenchido
curl http://localhost:3000/api/nfe/:id \
  -H "Authorization: Bearer SEU_TOKEN"
# Esperar: "meioPagamento": "17" (para PIX_DINAMICO)
```

---

## ⚠️ Possíveis Problemas e Soluções

### Problema 1: "sefazCode is required"
**Causa**: Tentando criar forma de pagamento sem o campo obrigatório

**Solução**: Adicionar campo no formulário frontend:
```tsx
<Select 
  label="Código SEFAZ" 
  name="sefazCode" 
  required
  options={SEFAZ_CODES}
/>
```

---

### Problema 2: Formas de pagamento antigas sem código
**Causa**: Dados existentes antes da migração

**Solução**: Executar script de migração ou atualizar manualmente:
```sql
UPDATE payment_methods 
SET "sefazCode" = 'PIX_DINAMICO' 
WHERE id = 'id-da-forma-de-pagamento';
```

---

### Problema 3: NFe sem código de pagamento
**Causa**: Venda criada com forma de pagamento sem `sefazCode`

**Solução**: 
1. Atualizar a forma de pagamento com o código correto
2. Recriar a NFe ou adicionar o código manualmente:
```sql
UPDATE nfes 
SET "meioPagamento" = '17' 
WHERE id = 'id-da-nfe';
```

---

### Problema 4: Código SEFAZ errado
**Causa**: Mapeamento automático incorreto

**Solução**:
```sql
-- Corrigir manualmente
UPDATE payment_methods 
SET "sefazCode" = 'PIX_ESTATICO' 
WHERE name = 'PIX via Chave';
```

---

## 📋 Checklist de Validação

### Backend
- [ ] Migration aplicada com sucesso
- [ ] Prisma Client regenerado (`npx prisma generate`)
- [ ] Nenhum erro de TypeScript
- [ ] Todas as formas de pagamento têm `sefazCode`
- [ ] Endpoint de criação exige campo obrigatório
- [ ] Serviço NFe popula `meioPagamento` automaticamente

### Frontend
- [ ] Campo `sefazCode` adicionado ao formulário
- [ ] Select com todos os 25 códigos disponíveis
- [ ] Validação obrigatória funcionando
- [ ] Tooltip/descrição explicativa
- [ ] Código SEFAZ visível na listagem
- [ ] Edição de formas existentes permite escolher código

### Testes End-to-End
- [ ] Criar nova forma de pagamento → Sucesso
- [ ] Criar venda com forma de pagamento → Sucesso
- [ ] Gerar NFe da venda → `meioPagamento` preenchido
- [ ] Código corresponde à tabela SEFAZ → Validado

---

## 📞 Suporte

### Dúvidas Comuns

**P: PIX Dinâmico ou Estático?**
- **Dinâmico (17)**: QR Code gerado na hora da venda
- **Estático (20)**: Chave PIX fixa (email, telefone, CPF/CNPJ)

**P: Boleto ou Duplicata?**
- **Boleto (15)**: Uso geral, boleto bancário comum
- **Duplicata (14)**: Duplicata mercantil, título de crédito

**P: Carteira Digital (PicPay, Mercado Pago)?**
- Use **TRANSFERENCIA (18)** - cobre carteiras digitais e transferências

**P: E se não souber qual código usar?**
- Use **OUTROS (99)** temporariamente
- Consulte a tabela oficial SEFAZ para o código correto

---

## 🔗 Links Úteis

- **Tabela Oficial SEFAZ**: https://www.nfe.fazenda.gov.br/portal/exibirArquivo.aspx?conteudo=eRn/kZdQ+Ks=
- **Documentação Frontend**: `docs/NFE_PAYMENT_CODES_FRONTEND.md`
- **Resumo Técnico**: `docs/NFE_PAYMENT_CODES_SUMMARY.md`
- **Script SQL**: `scripts/migrate-payment-sefaz-codes.sql`

---

**✅ Migração concluída! Sistema pronto para emitir NFes com códigos de pagamento corretos.**
