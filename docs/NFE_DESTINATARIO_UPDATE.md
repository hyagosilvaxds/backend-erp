# Atualização: Dados do Destinatário na NF-e

## 📋 Resumo da Atualização

Atualizado o método `preencherDestinatario` no `NFeGeneratorService` para usar **SEMPRE** os dados reais cadastrados no banco de dados do cliente da venda.

**Data**: 16 de novembro de 2025  
**Arquivo**: `src/fiscal/services/nfe-generator.service.ts`  
**Método**: `preencherDestinatario()`

---

## ✅ O que foi implementado

### 1. Priorização de Endereços

Agora o sistema prioriza endereços na seguinte ordem:

```typescript
const endereco = customer.addresses.find(a => a.type === 'BILLING')  // 1º: Cobrança
              || customer.addresses.find(a => a.type === 'MAIN')     // 2º: Principal
              || customer.addresses[0];                              // 3º: Primeiro disponível
```

**Justificativa**: Para NF-e, o endereço de cobrança é mais relevante que o endereço principal ou de entrega.

### 2. Tag dest - Destinatário

#### Para Pessoa Jurídica (CNPJ):

```typescript
NFe.tagDest({
    CNPJ: "57953546000184",          // customer.cnpj (sem formatação)
    xNome: "COMPRADOR",              // customer.companyName (ou name como fallback)
    indIEDest: "1",                  // "1" se contribuinte, "2" se isento
    IE: "0050328560022",             // customer.stateRegistration (se não isento)
});
```

**Campos do BD**:
- `customer.cnpj` → CNPJ (remove formatação)
- `customer.companyName` → xNome (Razão Social)
- `customer.stateRegistrationExempt` → indIEDest (true="2", false="1")
- `customer.stateRegistration` → IE (só se não isento)

#### Para Pessoa Física (CPF):

```typescript
NFe.tagDest({
    CPF: "12345678900",              // customer.cpf (sem formatação)
    xNome: "João da Silva",          // customer.name
    indIEDest: "9",                  // Sempre "9" (Não contribuinte)
});
```

**Campos do BD**:
- `customer.cpf` → CPF (remove formatação)
- `customer.name` → xNome (Nome completo)
- indIEDest → Sempre "9" para pessoa física

### 3. Tag enderDest - Endereço do Destinatário

```typescript
NFe.tagEnderDest({
    xLgr: "Rua Marmelo",             // address.street
    nro: "140",                      // address.number
    xCpl: undefined,                 // address.complement (opcional)
    xBairro: "Alto Floresta",        // address.neighborhood
    cMun: "3143302",                 // address.ibgeCode
    xMun: "Montes Claros",           // address.city
    UF: "MG",                        // address.state
    CEP: "39404076",                 // address.zipCode (sem formatação)
    cPais: "1058",                   // FIXO (Brasil)
    xPais: "BRASIL",                 // FIXO (Brasil)
    fone: "11945669960"              // customer.phone ou mobile (sem formatação)
});
```

**Campos do BD (CustomerAddress)**:
- `address.street` → xLgr (Logradouro)
- `address.number` → nro (Número)
- `address.complement` → xCpl (Complemento - opcional)
- `address.neighborhood` → xBairro (Bairro)
- `address.ibgeCode` → cMun (Código IBGE)
- `address.city` → xMun (Município)
- `address.state` → UF (Estado)
- `address.zipCode` → CEP (sem formatação)
- `customer.phone` ou `customer.mobile` → fone (prioriza phone)

---

## 🔄 Comparação: Antes vs Depois

### ANTES:

```typescript
private preencherDestinatario(NFe: Make, customer: any): void {
  // Usava apenas endereço MAIN
  const endereco = customer.addresses.find(a => a.type === 'MAIN') 
                || customer.addresses[0];

  // Montava tagDest inline sem comentários
  const tagDest: any = {
    xNome: customer.personType === 'JURIDICA' 
      ? (customer.companyName || customer.name)
      : customer.name,
  };

  // Lógica de CPF/CNPJ sem comentários explicativos
  if (customer.personType === 'JURIDICA' && customer.cnpj) {
    tagDest.CNPJ = customer.cnpj.replace(/\D/g, '');
    tagDest.indIEDest = customer.stateRegistrationExempt ? '2' : '1';
    if (!customer.stateRegistrationExempt && customer.stateRegistration) {
      tagDest.IE = customer.stateRegistration.replace(/\D/g, '');
    }
  } else if (customer.cpf) {
    tagDest.CPF = customer.cpf.replace(/\D/g, '');
    tagDest.indIEDest = '9';
  }

  NFe.tagDest(tagDest);

  // Preenchia endereco sem comentários
  NFe.tagEnderDest({
    xLgr: endereco.street,
    nro: endereco.number,
    xCpl: endereco.complement || undefined,
    xBairro: endereco.neighborhood,
    cMun: endereco.ibgeCode || this.obterCodigoMunicipio(endereco.city, endereco.state),
    xMun: endereco.city,
    UF: endereco.state,
    CEP: endereco.zipCode.replace(/\D/g, ''),
    cPais: '1058',
    xPais: 'BRASIL',
    fone: customer.phone?.replace(/\D/g, '') || customer.mobile?.replace(/\D/g, '') || undefined,
  });
}
```

### DEPOIS:

```typescript
/**
 * Tag dest - Destinatário (usa dados reais cadastrados no BD)
 * Todos os dados vêm do cadastro do cliente da venda
 * Prioriza endereço BILLING > MAIN > primeiro disponível
 */
private preencherDestinatario(NFe: Make, customer: any): void {
  // Prioriza endereço de cobrança (BILLING), depois principal (MAIN), depois qualquer
  const endereco = customer.addresses.find(a => a.type === 'BILLING') 
                || customer.addresses.find(a => a.type === 'MAIN') 
                || customer.addresses[0];

  // Monta tagDest conforme tipo de pessoa
  const tagDest: any = {};

  // Pessoa Jurídica (CNPJ)
  if (customer.personType === 'JURIDICA' && customer.cnpj) {
    tagDest.CNPJ = customer.cnpj.replace(/\D/g, ''); // CNPJ do destinatário (cadastrado no cliente da venda)
    tagDest.xNome = customer.companyName || customer.name; // Razão social do destinatário (cadastrado no cliente da venda)
    tagDest.indIEDest = customer.stateRegistrationExempt ? '2' : '1'; // 1=Contribuinte ICMS, 2=Isento (cadastrado no cliente da venda)
    if (!customer.stateRegistrationExempt && customer.stateRegistration) {
      tagDest.IE = customer.stateRegistration.replace(/\D/g, ''); // Inscrição Estadual (cadastrado no cliente da venda)
    }
  } 
  // Pessoa Física (CPF)
  else if (customer.cpf) {
    tagDest.CPF = customer.cpf.replace(/\D/g, ''); // CPF do destinatário (cadastrado no cliente da venda)
    tagDest.xNome = customer.name; // Nome do destinatário (cadastrado no cliente da venda)
    tagDest.indIEDest = '9'; // Sempre "9" (Não contribuinte) para pessoa física
  }

  NFe.tagDest(tagDest);

  NFe.tagEnderDest({
    xLgr: endereco.street, // Logradouro (cadastrado no cliente da venda)
    nro: endereco.number, // Número (cadastrado no cliente da venda)
    xCpl: endereco.complement || undefined, // Complemento (cadastrado no cliente da venda)
    xBairro: endereco.neighborhood, // Bairro (cadastrado no cliente da venda)
    cMun: endereco.ibgeCode || this.obterCodigoMunicipio(endereco.city, endereco.state), // Código do município (Tabela IBGE) (cadastrado no cliente da venda)
    xMun: endereco.city, // Nome do município (cadastrado no cliente da venda)
    UF: endereco.state, // Sigla da UF (cadastrado no cliente da venda)
    CEP: endereco.zipCode.replace(/\D/g, ''), // CEP (cadastrado no cliente da venda)
    cPais: '1058', // Código do país (sempre 1058 para Brasil)
    xPais: 'BRASIL', // Nome do país (sempre "BRASIL")
    fone: customer.phone?.replace(/\D/g, '') || customer.mobile?.replace(/\D/g, '') || undefined, // Telefone (cadastrado no cliente da venda)
  });
}
```

---

## 🎯 Principais Melhorias

### 1. ✅ Priorização de Endereço BILLING
- **Antes**: Usava apenas MAIN ou primeiro
- **Depois**: BILLING → MAIN → primeiro
- **Benefício**: Endereço de cobrança é mais adequado para NF-e

### 2. ✅ Comentários Detalhados
- **Antes**: Sem comentários inline
- **Depois**: Cada campo tem comentário explicando origem no BD
- **Benefício**: Fácil manutenção e entendimento do código

### 3. ✅ JSDoc Melhorado
- **Antes**: Comentário simples
- **Depois**: JSDoc completo com descrição e prioridade de endereços
- **Benefício**: Melhor documentação para desenvolvedores

### 4. ✅ Estrutura Mais Clara
- **Antes**: tagDest montado inline
- **Depois**: tagDest montado separadamente, depois aplicado
- **Benefício**: Código mais legível e organizado

### 5. ✅ Lógica Explícita
- **Antes**: Ternário inline para xNome
- **Depois**: Separação clara entre PJ e PF com blocos if/else
- **Benefício**: Mais fácil entender e debugar

---

## 📊 Modelo de Dados

### Tabela Customer

```prisma
model Customer {
  id        String  @id @default(uuid())
  companyId String

  // Tipo de pessoa
  personType String  // "FISICA" ou "JURIDICA"

  // Pessoa Física
  name String?
  cpf  String?
  
  // Pessoa Jurídica
  companyName             String?
  cnpj                    String?
  stateRegistration       String?
  stateRegistrationExempt Boolean @default(false)

  // Contatos
  phone  String?
  mobile String?
  email  String?

  // Relacionamentos
  addresses CustomerAddress[]
  sales     Sale[]
  nfes      NFe[]
}
```

### Tabela CustomerAddress

```prisma
model CustomerAddress {
  id         String @id @default(uuid())
  customerId String

  type String  // "BILLING", "MAIN", "SHIPPING", "OTHER"

  zipCode      String
  street       String
  number       String
  complement   String?
  neighborhood String
  city         String
  state        String
  ibgeCode     String?
  country      String @default("Brasil")

  isDefault Boolean @default(false)
  active    Boolean @default(true)
}
```

---

## ✅ Checklist de Validação

Antes de emitir NF-e para um cliente, verificar:

### Pessoa Jurídica:
- [ ] ✅ `personType` = "JURIDICA"
- [ ] ✅ `cnpj` cadastrado (formato: XX.XXX.XXX/XXXX-XX)
- [ ] ✅ `companyName` cadastrado (Razão Social)
- [ ] ✅ `stateRegistrationExempt` definido (true/false)
- [ ] ✅ Se não isento: `stateRegistration` cadastrado
- [ ] ✅ Pelo menos 1 endereço cadastrado

### Pessoa Física:
- [ ] ✅ `personType` = "FISICA"
- [ ] ✅ `cpf` cadastrado (formato: XXX.XXX.XXX-XX)
- [ ] ✅ `name` cadastrado (Nome completo)
- [ ] ✅ Pelo menos 1 endereço cadastrado

### Endereço (qualquer tipo):
- [ ] ✅ `street` (Logradouro)
- [ ] ✅ `number` (Número)
- [ ] ✅ `neighborhood` (Bairro)
- [ ] ✅ `city` (Município)
- [ ] ✅ `state` (UF - 2 letras)
- [ ] ✅ `zipCode` (CEP - formato: XXXXX-XXX)
- [ ] ✅ `ibgeCode` (Código IBGE de 7 dígitos)

### Opcional mas recomendado:
- [ ] 📱 `phone` ou `mobile` (Telefone)
- [ ] 📱 `complement` (Complemento do endereço)
- [ ] 📱 Endereço tipo BILLING para prioridade

---

## 🧪 Testes Recomendados

### 1. Testar Pessoa Jurídica com IE

```http
POST http://localhost:3000/fiscal/nfe/emitir
Content-Type: application/json
Authorization: Bearer {{token}}

{
  "saleId": "uuid-da-venda",
  "enviarSefaz": false
}
```

**Resultado Esperado**:
```xml
<dest>
  <CNPJ>57953546000184</CNPJ>
  <xNome>COMPRADOR LTDA</xNome>
  <enderDest>
    <xLgr>Rua Marmelo</xLgr>
    <nro>140</nro>
    <!-- ... -->
  </enderDest>
  <indIEDest>1</indIEDest>
  <IE>0050328560022</IE>
</dest>
```

### 2. Testar Pessoa Jurídica Isenta de IE

**Resultado Esperado**:
```xml
<dest>
  <CNPJ>12345678000199</CNPJ>
  <xNome>EMPRESA ISENTA LTDA</xNome>
  <enderDest>...</enderDest>
  <indIEDest>2</indIEDest>
  <!-- Sem tag <IE> -->
</dest>
```

### 3. Testar Pessoa Física

**Resultado Esperado**:
```xml
<dest>
  <CPF>12345678900</CPF>
  <xNome>João da Silva</xNome>
  <enderDest>...</enderDest>
  <indIEDest>9</indIEDest>
  <!-- Sem tag <IE> -->
</dest>
```

### 4. Testar Prioridade de Endereços

**Cenário**: Cliente com 3 endereços:
1. SHIPPING (Entrega)
2. BILLING (Cobrança)
3. MAIN (Principal)

**Resultado Esperado**: Deve usar o endereço BILLING na NF-e.

---

## 📚 Documentação Atualizada

A documentação completa foi atualizada em:

- ✅ **NFE_MAPEAMENTO_DADOS_EMPRESA.md** - Incluído mapeamento completo do destinatário
  - Seção "Destinatário (tagDest)"
  - Seção "Endereço do Destinatário (tagEnderDest)"
  - Estrutura das tabelas Customer e CustomerAddress
  - Exemplos de validação para cliente
  - Queries SQL para verificação
  - Tratamento de erros específicos do cliente

---

## 🚀 Próximos Passos

1. ✅ Testar emissão com diferentes tipos de cliente (PJ contribuinte, PJ isenta, PF)
2. ✅ Testar priorização de endereços (BILLING, MAIN, primeiro)
3. ✅ Validar dados do cliente antes de emitir NF-e
4. ✅ Testar em ambiente de homologação da SEFAZ
5. ⏳ Implementar no frontend:
   - Formulário de cadastro de cliente com todos os campos
   - Cadastro de múltiplos endereços com tipos (BILLING, MAIN, etc.)
   - Validação de CNPJ/CPF no frontend
   - Consulta de CEP automática
   - Indicador visual de dados incompletos para NF-e

---

## 💡 Dicas Importantes

1. **Sempre valide os dados do cliente** antes de permitir emissão de NF-e
2. **Endereço BILLING é prioridade** para NF-e (cobrança)
3. **Pessoa Jurídica** sempre precisa indicar se é isenta de IE ou não
4. **Pessoa Física** sempre tem `indIEDest="9"` (Não contribuinte)
5. **Código IBGE** do município é obrigatório (7 dígitos)
6. **Formatação é automática**: CNPJ, CPF, CEP, telefone perdem formatação no XML
7. **Teste em homologação** antes de produção

---

**Autor**: Sistema de NF-e  
**Data**: 16 de novembro de 2025  
**Status**: ✅ Implementado e documentado  
**Compilação**: ✅ Sem erros
