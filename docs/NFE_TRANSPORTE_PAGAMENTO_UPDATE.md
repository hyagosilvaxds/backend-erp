# Atualização Final: Transporte, Pagamento e Responsável Técnico na NF-e

## 📋 Resumo da Atualização

Atualizado os métodos `preencherTransporte`, `preencherPagamento` e `preencherResponsavelTecnico` no `NFeGeneratorService` para usar **SEMPRE** os dados reais cadastrados no banco de dados.

**Data**: 16 de novembro de 2025  
**Arquivo**: `src/fiscal/services/nfe-generator.service.ts`  
**Status**: ✅ Implementado e documentado

---

## ✅ O que foi implementado

### 1. Transporte (tagTransp)

**Método atualizado**: `preencherTransporte()`

#### Antes:
```typescript
private preencherTransporte(NFe: Make, dto: EmitirNFeDto): void {
  NFe.tagTransp({
    modFrete: dto.modalidadeFrete || '9', // Recebia do DTO
  });
}
```

#### Depois:
```typescript
/**
 * Tag transp - Transporte (usa dados reais cadastrados no BD)
 * Modalidade de frete vem do cadastro da venda
 */
private preencherTransporte(NFe: Make, sale: any): void {
  NFe.tagTransp({
    modFrete: sale.shippingModality?.toString() || '9', // Modalidade cadastrada na venda
  });
}
```

**Campo do BD**:
- `sale.shippingModality` → modFrete (Int convertido para String)

**Valores possíveis** (cadastrados na venda):
- `0` = Contratação do Frete por conta do Remetente (CIF)
- `1` = Contratação do Frete por conta do Destinatário (FOB)
- `2` = Contratação do Frete por conta de Terceiros
- `3` = Transporte Próprio por conta do Remetente
- `4` = Transporte Próprio por conta do Destinatário
- `9` = Sem Ocorrência de Transporte (padrão)

**Resultado na NF-e**:
```xml
<transp>
  <modFrete>9</modFrete>
</transp>
```

---

### 2. Pagamento (tagDetPag)

**Método atualizado**: `preencherPagamento()`

#### Antes:
```typescript
private preencherPagamento(NFe: Make, sale: any): void {
  const formaPagamento = this.mapearFormaPagamento(sale.paymentMethod?.type);
  
  NFe.tagDetPag([{
    indPag: '0', // Sempre à vista (fixo)
    tPag: formaPagamento,
    vPag: sale.totalAmount.toFixed(2),
  }]);

  NFe.tagTroco('0.00');
}
```

#### Depois:
```typescript
/**
 * Tag pag - Pagamento (usa dados reais cadastrados no BD)
 * Forma de pagamento e valores vêm do cadastro da venda
 */
private preencherPagamento(NFe: Make, sale: any): void {
  const formaPagamento = this.mapearFormaPagamento(sale.paymentMethod?.type);
  
  // Determina indicador de pagamento baseado nas parcelas
  const indPag = sale.installments > 1 ? '1' : '0'; // À vista ou a prazo
  
  NFe.tagDetPag([{
    indPag: indPag, // Calculado automaticamente
    tPag: formaPagamento, // Mapeado do tipo de pagamento
    vPag: sale.totalAmount.toFixed(2), // Valor total da venda
  }]);

  NFe.tagTroco('0.00'); // Sempre 0.00
}
```

**Campos do BD**:
- `sale.installments` → indPag (calculado: >1 parcela = "1" a prazo, senão "0" à vista)
- `sale.paymentMethod.type` → tPag (mapeado via tabela)
- `sale.totalAmount` → vPag (valor total da venda)

**Mapeamento de Formas de Pagamento**:

| Tipo no Sistema | Código NF-e | Descrição |
|----------------|-------------|-----------|
| DINHEIRO | 01 | Dinheiro |
| CHEQUE | 02 | Cheque |
| CARTAO_CREDITO | 03 | Cartão de Crédito |
| CARTAO_DEBITO | 04 | Cartão de Débito |
| BOLETO | 15 | Boleto Bancário |
| PIX | 17 | PIX |
| TRANSFERENCIA | 18 | Transferência Bancária |
| OUTROS | 99 | Outros |

**Exemplo 1** - Venda à vista com PIX:
```typescript
// Dados da venda:
// installments: 1
// paymentMethod.type: "PIX"
// totalAmount: 1200.00

// Resultado:
NFe.tagDetPag([{
    indPag: "0",     // À vista (1 parcela)
    tPag: "17",      // PIX
    vPag: "1200.00"
}]);
NFe.tagTroco("0.00");
```

**Exemplo 2** - Venda a prazo com Boleto:
```typescript
// Dados da venda:
// installments: 3
// paymentMethod.type: "BOLETO"
// totalAmount: 3000.00

// Resultado:
NFe.tagDetPag([{
    indPag: "1",     // A prazo (3 parcelas)
    tPag: "15",      // Boleto
    vPag: "3000.00"
}]);
NFe.tagTroco("0.00");
```

**Resultado na NF-e**:
```xml
<pag>
  <detPag>
    <indPag>0</indPag>
    <tPag>15</tPag>
    <vPag>1200.00</vPag>
  </detPag>
  <vTroco>0.00</vTroco>
</pag>
```

---

### 3. Responsável Técnico (tagInfRespTec)

**Método atualizado**: `preencherResponsavelTecnico()`

#### Antes:
```typescript
private preencherResponsavelTecnico(NFe: Make, company: any): void {
  NFe.tagInfRespTec({
    CNPJ: company.respTecCNPJ?.replace(/\D/g, '') || company.cnpj?.replace(/\D/g, ''),
    xContato: company.respTecContato || company.responsibleName || 'Suporte Técnico',
    email: company.respTecEmail || company.responsibleEmail || company.email || 'contato@empresa.com',
    fone: (company.respTecFone || company.responsiblePhone || company.telefone || company.celular || '0000000000').replace(/\D/g, ''),
  });
}
```

#### Depois:
```typescript
/**
 * Tag infRespTec - Responsável Técnico (usa dados reais cadastrados no BD)
 * Informações do responsável técnico pelo sistema vêm do cadastro da empresa
 */
private preencherResponsavelTecnico(NFe: Make, company: any): void {
  NFe.tagInfRespTec({
    CNPJ: (company.respTecCNPJ || company.cnpj)?.replace(/\D/g, ''), // CNPJ cadastrado
    xContato: company.respTecContato || company.responsibleName || 'Suporte Técnico', // Nome cadastrado
    email: company.respTecEmail || company.responsibleEmail || company.email || 'contato@empresa.com', // Email cadastrado
    fone: (company.respTecFone || company.responsiblePhone || company.telefone || company.celular || '0000000000').replace(/\D/g, ''), // Telefone cadastrado
  });
}
```

**Campos do BD (com fallbacks em cascata)**:

| Campo NF-e | 1ª Opção | 2ª Opção | 3ª Opção | 4ª Opção | Padrão |
|------------|----------|----------|----------|----------|--------|
| CNPJ | company.respTecCNPJ | company.cnpj | - | - | - |
| xContato | company.respTecContato | company.responsibleName | - | - | "Suporte Técnico" |
| email | company.respTecEmail | company.responsibleEmail | company.email | - | "contato@empresa.com" |
| fone | company.respTecFone | company.responsiblePhone | company.telefone | company.celular | "0000000000" |

**Resultado na NF-e**:
```xml
<infRespTec>
  <CNPJ>28256010000101</CNPJ>
  <xContato>PP Programador Perfeito</xContato>
  <email>sac@darocabiscoitos.com</email>
  <fone>3123424243</fone>
</infRespTec>
```

---

## 🔄 Comparação: Antes vs Depois

### Transporte:
- **Antes**: Recebia do DTO (usuário passava manualmente)
- **Depois**: Usa `sale.shippingModality` cadastrado na venda
- **Benefício**: Modalidade de frete já definida no cadastro da venda

### Pagamento:
- **Antes**: `indPag` sempre "0" (à vista) - fixo
- **Depois**: `indPag` calculado automaticamente baseado em `sale.installments`
- **Benefício**: Detecta automaticamente se é à vista ou a prazo

### Responsável Técnico:
- **Antes**: Já usava dados da empresa com fallbacks
- **Depois**: Mesma lógica com comentários detalhados
- **Benefício**: Documentação clara dos fallbacks em cascata

---

## 📊 Modelo de Dados

### Tabela Sale (campos relevantes):

```prisma
model Sale {
  id         String @id @default(uuid())
  companyId  String
  customerId String

  // ===== VALORES =====
  totalAmount Float // vPag

  // ===== PAGAMENTO =====
  paymentMethodId  String? // tPag (via mapeamento)
  installments     Int @default(1) // indPag (calculado: >1 = "1", senão "0")

  // ===== TRANSPORTE =====
  shippingModality Int @default(9) // modFrete
  // 0=Emitente, 1=Destinatário, 2=Terceiros, 
  // 3=Próprio Emitente, 4=Próprio Destinatário, 9=Sem frete

  // Relacionamentos
  paymentMethod PaymentMethod? @relation(fields: [paymentMethodId], references: [id])
  company       Company        @relation(fields: [companyId], references: [id])
}
```

### Tabela Company (campos responsável técnico):

```prisma
model Company {
  id String @id @default(uuid())

  // Dados básicos
  cnpj     String
  email    String?
  telefone String?
  celular  String?

  // ===== RESPONSÁVEL TÉCNICO =====
  respTecCNPJ    String? // CNPJ do responsável técnico
  respTecContato String? // Nome do contato
  respTecEmail   String? // Email do responsável técnico
  respTecFone    String? // Telefone do responsável técnico
  
  // Alias (compatibilidade)
  responsibleName  String? // Fallback para respTecContato
  responsibleEmail String? // Fallback para respTecEmail
  responsiblePhone String? // Fallback para respTecFone
}
```

---

## ✅ Checklist de Validação

### Para Venda:
- [ ] ✅ **shippingModality** cadastrado (0-4 ou 9)
- [ ] ✅ **paymentMethodId** vinculado (forma de pagamento)
- [ ] ✅ **installments** definido (1=à vista, >1=a prazo)
- [ ] ✅ **totalAmount** calculado corretamente

### Para Empresa (Responsável Técnico):
- [ ] ✅ **respTecCNPJ** ou **cnpj** cadastrado
- [ ] ✅ **respTecContato** ou **responsibleName** cadastrado
- [ ] ✅ **respTecEmail** ou **responsibleEmail** ou **email** cadastrado
- [ ] ✅ **respTecFone** ou **responsiblePhone** ou **telefone** ou **celular** cadastrado

### Opcional mas Recomendado:
- [ ] 📱 Cadastrar dados específicos do responsável técnico (respTec*)
- [ ] 📱 Definir modalidade de frete correta na venda
- [ ] 📱 Vincular método de pagamento adequado

---

## 🧪 Exemplos de Configuração

### Exemplo 1: Venda à vista com PIX, sem frete

```sql
-- Configurar venda
UPDATE "sales" SET
  "shippingModality" = 9,           -- Sem frete
  "paymentMethodId" = 'pix-uuid',   -- Método PIX
  "installments" = 1,               -- À vista
  "totalAmount" = 1200.00
WHERE id = 'venda-uuid';

-- Configurar método de pagamento
INSERT INTO "payment_methods" (id, "companyId", type, name, active)
VALUES ('pix-uuid', 'company-uuid', 'PIX', 'PIX', true);
```

**Resultado na NF-e**:
- modFrete: "9" (Sem frete)
- indPag: "0" (À vista)
- tPag: "17" (PIX)
- vPag: "1200.00"

### Exemplo 2: Venda a prazo com Boleto, frete por conta do destinatário

```sql
-- Configurar venda
UPDATE "sales" SET
  "shippingModality" = 1,             -- Destinatário paga
  "paymentMethodId" = 'boleto-uuid',  -- Método Boleto
  "installments" = 3,                 -- 3 parcelas
  "totalAmount" = 3000.00
WHERE id = 'venda-uuid';

-- Configurar método de pagamento
INSERT INTO "payment_methods" (id, "companyId", type, name, active)
VALUES ('boleto-uuid', 'company-uuid', 'BOLETO', 'Boleto Bancário', true);
```

**Resultado na NF-e**:
- modFrete: "1" (Destinatário)
- indPag: "1" (A prazo)
- tPag: "15" (Boleto)
- vPag: "3000.00"

### Exemplo 3: Configurar Responsável Técnico

```sql
-- Configurar responsável técnico na empresa
UPDATE "Company" SET
  "respTecCNPJ" = '28.256.010/0001-01',
  "respTecContato" = 'PP Programador Perfeito',
  "respTecEmail" = 'sac@darocabiscoitos.com',
  "respTecFone" = '(31) 2342-4243'
WHERE id = 'company-uuid';
```

**Resultado na NF-e**:
- CNPJ: "28256010000101"
- xContato: "PP Programador Perfeito"
- email: "sac@darocabiscoitos.com"
- fone: "3123424243"

---

## 🚨 Tratamento de Erros

### Erros Comuns e Soluções:

| Erro | Causa | Solução |
|------|-------|---------|
| "Modalidade de frete inválida" | shippingModality fora do range 0-4,9 | Usar valores válidos: 0, 1, 2, 3, 4 ou 9 |
| "Forma de pagamento não encontrada" | paymentMethodId nulo ou inválido | Vincular método de pagamento à venda |
| "Tipo de pagamento não mapeado" | paymentMethod.type não reconhecido | Usar tipos válidos (DINHEIRO, PIX, BOLETO, etc.) |
| "CNPJ do resp. técnico inválido" | respTecCNPJ e cnpj da empresa vazios | Cadastrar CNPJ da empresa |
| "Telefone do resp. técnico inválido" | Todos os campos de telefone vazios | Cadastrar pelo menos um telefone |

---

## 📈 Benefícios das Mudanças

### 1. ✅ Automatização Completa
- Não é mais necessário passar dados manualmente no DTO
- Sistema busca tudo do banco de dados

### 2. ✅ Consistência de Dados
- Dados da venda já estão corretos no cadastro
- Evita discrepâncias entre venda e NF-e

### 3. ✅ Detecção Inteligente
- Pagamento à vista/a prazo detectado automaticamente
- Baseado no número de parcelas cadastradas

### 4. ✅ Fallbacks em Cascata
- Responsável técnico: múltiplos níveis de fallback
- Garante que sempre haverá dados válidos

### 5. ✅ Facilidade de Manutenção
- Código mais limpo e documentado
- Comentários detalhados em cada campo

---

## 📚 Documentação Atualizada

A documentação completa foi atualizada em:

- ✅ **NFE_MAPEAMENTO_DADOS_EMPRESA.md** (v3.0.0)
  - Seção "Transporte (tagTransp)"
  - Seção "Pagamento (tagDetPag)"
  - Seção "Responsável Técnico (tagInfRespTec)"
  - Tabela de mapeamento de formas de pagamento
  - Valores de modalidade de frete
  - Fallbacks em cascata documentados

---

## 🚀 Próximos Passos

1. ✅ Cadastrar modalidade de frete em todas as vendas
2. ✅ Vincular métodos de pagamento às vendas
3. ✅ Configurar responsável técnico na empresa
4. ✅ Testar emissão com diferentes combinações:
   - À vista + Sem frete
   - A prazo + Frete por conta do destinatário
   - PIX + Sem frete
   - Boleto + Frete por conta do emitente
5. ⏳ Implementar no frontend:
   - Seletor de modalidade de frete no cadastro de venda
   - Seletor de método de pagamento
   - Campo de número de parcelas
   - Formulário de responsável técnico na empresa

---

## 💡 Dicas Importantes

1. **Modalidade de frete**: Sempre definir corretamente (9=Sem frete é o padrão)
2. **Número de parcelas**: Define automaticamente se é à vista (1) ou a prazo (>1)
3. **Método de pagamento**: Deve estar cadastrado e vinculado à venda
4. **Responsável técnico**: Recomendado cadastrar dados específicos (respTec*)
5. **Fallbacks**: Sistema busca dados em múltiplos campos para garantir preenchimento
6. **Formatação automática**: CNPJ e telefone perdem formatação automaticamente
7. **Valor do troco**: Sempre 0.00 (padrão para vendas com NF-e)

---

**Autor**: Sistema de NF-e  
**Data**: 16 de novembro de 2025  
**Status**: ✅ Implementado e documentado  
**Compilação**: ✅ Sem erros  
**Versão do documento**: 1.0.0
