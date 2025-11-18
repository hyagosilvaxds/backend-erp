# Mapeamento Completo: Dados do BD → NF-e

## 📋 Visão Geral

Este documento detalha **exatamente** como os dados cadastrados no banco de dados são mapeados para os campos da NF-e (Nota Fiscal Eletrônica).

**Princípio fundamental**: Todos os dados da NF-e vêm do cadastro real no banco de dados (empresa e cliente). Não há valores fixos hardcoded exceto os obrigatórios por lei (como cPais=1058 para Brasil).

---

## 🏢 Seção: Emitente (tagEmit)

### Campos da NF-e e suas origens

| Campo NF-e | Origem no BD | Campo na Tabela Company | Observações |
|------------|--------------|------------------------|-------------|
| `CNPJ` | `company.cnpj` | `cnpj` (String) | Remove formatação (/\D/g) |
| `xNome` | `company.razaoSocial` | `razaoSocial` (String) | Razão social completa |
| `xFant` | `company.nomeFantasia` | `nomeFantasia` (String?) | Se null, usa razaoSocial |
| `IE` | `company.inscricaoEstadual` | `inscricaoEstadual` (String?) | Remove formatação (/\D/g) |
| `CRT` | `company.regimeTributario` | `regimeTributario` (String?) | Convertido via obterCRT() |

### Exemplo Real:

```typescript
NFe.tagEmit({
    CNPJ: "28256010000101",              // de company.cnpj (sem formatação)
    xNome: "NR INDUSTRIA ALIMENTICIA LTDA", // de company.razaoSocial
    xFant: "NR INDUSTRIA ALIMENTICIA",    // de company.nomeFantasia
    IE: "118320540117",                   // de company.inscricaoEstadual (sem formatação)
    CRT: "1"                              // de company.regimeTributario (convertido)
});
```

### Conversão CRT (Código de Regime Tributário):

```typescript
private obterCRT(regimeTributario: string): string {
  const crtMap = {
    'SIMPLES_NACIONAL': '1',
    'SIMPLES NACIONAL': '1',
    'Simples Nacional': '1',
    'LUCRO_PRESUMIDO': '3',
    'LUCRO PRESUMIDO': '3',
    'Lucro Presumido': '3',
    'LUCRO_REAL': '3',
    'LUCRO REAL': '3',
    'Lucro Real': '3',
  };
  return crtMap[regimeTributario] || '3';
}
```

**Valores de CRT**:
- `"1"` = Simples Nacional
- `"2"` = Simples Nacional - excesso de sublimite de receita bruta
- `"3"` = Regime Normal (Lucro Presumido ou Lucro Real)

---

## 📍 Seção: Endereço do Emitente (tagEnderEmit)

### Campos da NF-e e suas origens

| Campo NF-e | Origem no BD | Campo na Tabela Company | Observações |
|------------|--------------|------------------------|-------------|
| `xLgr` | `company.logradouro` | `logradouro` (String?) | Rua, Avenida, etc. |
| `nro` | `company.numero` | `numero` (String?) | Se vazio, usa "S/N" |
| `xCpl` | `company.complemento` | `complemento` (String?) | Opcional (undefined se vazio) |
| `xBairro` | `company.bairro` | `bairro` (String?) | Bairro |
| `cMun` | `company.codigoMunicipioIBGE` | `codigoMunicipioIBGE` (String?) | Código IBGE de 7 dígitos |
| `xMun` | `company.cidade` | `cidade` (String?) | Nome do município |
| `UF` | `company.estado` | `estado` (String?) | Sigla: SP, RJ, MG, etc. |
| `CEP` | `company.cep` | `cep` (String?) | Remove formatação (/\D/g) |
| `cPais` | ❌ Fixo | - | **Sempre "1058"** (Brasil) |
| `xPais` | ❌ Fixo | - | **Sempre "BRASIL"** |
| `fone` | `company.telefone` ou `company.celular` | `telefone` (String?), `celular` (String?) | Prioriza telefone, fallback celular, remove formatação |

### Exemplo Real:

```typescript
NFe.tagEnderEmit({
    xLgr: "Rua Comendador Antunes dos Santos",  // de company.logradouro
    nro: "193",                                  // de company.numero
    xCpl: undefined,                             // de company.complemento (se vazio)
    xBairro: "Capao Redondo",                    // de company.bairro
    cMun: "3550308",                             // de company.codigoMunicipioIBGE
    xMun: "Sao Paulo",                           // de company.cidade
    UF: "SP",                                    // de company.estado
    CEP: "05861260",                             // de company.cep (sem formatação)
    cPais: "1058",                               // FIXO (Brasil)
    xPais: "BRASIL",                             // FIXO (Brasil)
    fone: "3123424243"                           // de company.telefone (sem formatação)
});
```

---

## � Seção: Destinatário (tagDest)

### Campos da NF-e e suas origens

#### Para Pessoa Jurídica (CNPJ):

| Campo NF-e | Origem no BD | Campo na Tabela Customer | Observações |
|------------|--------------|--------------------------|-------------|
| `CNPJ` | `customer.cnpj` | `cnpj` (String) | Remove formatação (/\D/g) |
| `xNome` | `customer.companyName` | `companyName` (String?) | Razão social; fallback para `name` |
| `indIEDest` | `customer.stateRegistrationExempt` | `stateRegistrationExempt` (Boolean) | 1=Contribuinte, 2=Isento |
| `IE` | `customer.stateRegistration` | `stateRegistration` (String?) | Só se não isento; remove formatação (/\D/g) |

#### Para Pessoa Física (CPF):

| Campo NF-e | Origem no BD | Campo na Tabela Customer | Observações |
|------------|--------------|--------------------------|-------------|
| `CPF` | `customer.cpf` | `cpf` (String) | Remove formatação (/\D/g) |
| `xNome` | `customer.name` | `name` (String?) | Nome completo |
| `indIEDest` | ❌ Fixo | - | Sempre "9" (Não contribuinte) |

### Exemplo Real (Pessoa Jurídica):

```typescript
NFe.tagDest({
    CNPJ: "57953546000184",              // de customer.cnpj (sem formatação)
    xNome: "COMPRADOR",                  // de customer.companyName
    indIEDest: "1",                      // "1" se não isento, "2" se isento
    IE: "0050328560022",                 // de customer.stateRegistration (se não isento)
});
```

### Valores de indIEDest:

- `"1"` = Contribuinte ICMS (empresa com IE válida)
- `"2"` = Contribuinte isento de IE (empresa isenta)
- `"9"` = Não contribuinte (pessoa física ou empresa sem IE)

---

## 📍 Seção: Endereço do Destinatário (tagEnderDest)

### Campos da NF-e e suas origens

| Campo NF-e | Origem no BD | Campo na Tabela CustomerAddress | Observações |
|------------|--------------|--------------------------------|-------------|
| `xLgr` | `address.street` | `street` (String) | Logradouro (rua, avenida, etc.) |
| `nro` | `address.number` | `number` (String) | Número do endereço |
| `xCpl` | `address.complement` | `complement` (String?) | Opcional (undefined se vazio) |
| `xBairro` | `address.neighborhood` | `neighborhood` (String) | Bairro |
| `cMun` | `address.ibgeCode` | `ibgeCode` (String?) | Código IBGE de 7 dígitos |
| `xMun` | `address.city` | `city` (String) | Nome do município |
| `UF` | `address.state` | `state` (String) | Sigla: SP, RJ, MG, etc. |
| `CEP` | `address.zipCode` | `zipCode` (String) | Remove formatação (/\D/g) |
| `cPais` | ❌ Fixo | - | **Sempre "1058"** (Brasil) |
| `xPais` | ❌ Fixo | - | **Sempre "BRASIL"** |
| `fone` | `customer.phone` ou `customer.mobile` | `phone` (String?), `mobile` (String?) | Prioriza phone, fallback mobile, remove formatação |

### Prioridade de Endereços:

1. **BILLING** (Cobrança) - prioridade máxima
2. **MAIN** (Principal) - segunda opção
3. **Primeiro disponível** - última opção

```typescript
const endereco = customer.addresses.find(a => a.type === 'BILLING') 
              || customer.addresses.find(a => a.type === 'MAIN') 
              || customer.addresses[0];
```

### Exemplo Real:

```typescript
NFe.tagEnderDest({
    xLgr: "Rua Marmelo",                 // de address.street
    nro: "140",                          // de address.number
    xCpl: undefined,                     // de address.complement (se vazio)
    xBairro: "Alto Floresta",            // de address.neighborhood
    cMun: "3143302",                     // de address.ibgeCode
    xMun: "Montes Claros",               // de address.city
    UF: "MG",                            // de address.state
    CEP: "39404076",                     // de address.zipCode (sem formatação)
    cPais: "1058",                       // FIXO (Brasil)
    xPais: "BRASIL",                     // FIXO (Brasil)
    fone: "11945669960"                  // de customer.phone (sem formatação)
});
```

---

## �🔧 Campos Calculados/Derivados da Empresa

### Campos usados em outras seções da NF-e:

| Campo NF-e | Seção | Origem no BD | Campo na Tabela Company | Lógica |
|------------|-------|--------------|------------------------|--------|
| `tpAmb` | IDE | `company.nfeAmbiente` | `nfeAmbiente` (String) | 1=Produção, 2=Homologação |
| `UF` | IDE | `company.estado` | `estado` (String?) | Usado no Tools e IDE |
| `cUF` | IDE | `company.estado` | `estado` (String?) | Convertido via tabela UF→código |
| `cMunFG` | IDE | `company.codigoMunicipioIBGE` | `codigoMunicipioIBGE` (String?) | Código IBGE do município |
| `serie` | IDE | `company.serieNFe` | `serieNFe` (String?) | Série da NF-e |
| `nNF` | IDE | `company.ultimoNumeroNFe + 1` | `ultimoNumeroNFe` (Int?) | Auto-incrementado por série |

---

## 📦 Estrutura Completa da Tabela Company

### Campos relevantes para NF-e:

```prisma
model Company {
  id String @id @default(uuid())

  // === DADOS PARA tagEmit ===
  razaoSocial       String   // xNome
  nomeFantasia      String?  // xFant
  cnpj              String   // CNPJ
  inscricaoEstadual String?  // IE
  regimeTributario  String?  // CRT (via conversão)

  // === DADOS PARA tagEnderEmit ===
  logradouro  String?  // xLgr
  numero      String?  // nro
  complemento String?  // xCpl
  bairro      String?  // xBairro
  cidade      String?  // xMun
  estado      String?  // UF
  cep         String?  // CEP
  telefone    String?  // fone
  celular     String?  // fone (fallback)

  // === DADOS PARA IDE e Tools ===
  codigoMunicipioIBGE String?  // cMun, cMunFG
  serieNFe            String?  // serie
  ultimoNumeroNFe     Int?     // nNF (incrementado)
  nfeAmbiente         String   // tpAmb (1 ou 2)

  // === CERTIFICADO DIGITAL ===
  certificadoDigitalPath      String?   // Caminho do .pfx
  certificadoDigitalSenha     String?   // Senha (criptografada AES-256)
  certificadoDigitalValidoAte DateTime? // Validade

  // ... outros campos
}
```

### Campos relevantes para NF-e (Destinatário):

```prisma
model Customer {
  id        String  @id @default(uuid())
  companyId String

  // === TIPO DE PESSOA ===
  personType String  // FISICA (CPF) ou JURIDICA (CNPJ)

  // === PESSOA FÍSICA - tagDest ===
  name     String?  // xNome
  cpf      String?  // CPF
  
  // === PESSOA JURÍDICA - tagDest ===
  companyName             String?  // xNome
  cnpj                    String?  // CNPJ
  stateRegistration       String?  // IE
  stateRegistrationExempt Boolean  // indIEDest (true=2, false=1)

  // === CONTATOS ===
  email  String?  // Email
  phone  String?  // fone (prioridade)
  mobile String?  // fone (fallback)

  // === RELACIONAMENTOS ===
  addresses CustomerAddress[]  // Endereços do cliente
}

model CustomerAddress {
  id         String @id @default(uuid())
  customerId String

  // === TIPO ===
  type  String  // BILLING (prioridade), MAIN, SHIPPING, OTHER

  // === ENDEREÇO - tagEnderDest ===
  zipCode      String  // CEP
  street       String  // xLgr
  number       String  // nro
  complement   String? // xCpl
  neighborhood String  // xBairro
  city         String  // xMun
  state        String  // UF
  ibgeCode     String? // cMun
  country      String  // Para detecção de operação internacional
}
```

---

## 🔄 Fluxo de Dados: Banco → NF-e

```
┌─────────────────────────────────────────────────────────────────┐
│                    BANCO DE DADOS (PostgreSQL)                   │
│                                                                   │
│  Tabela: Company                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ id: "uuid"                                               │   │
│  │ razaoSocial: "NR INDUSTRIA ALIMENTICIA LTDA"            │   │
│  │ nomeFantasia: "NR INDUSTRIA ALIMENTICIA"                │   │
│  │ cnpj: "28.256.010/0001-01"                              │   │
│  │ inscricaoEstadual: "118.320.540.117"                    │   │
│  │ regimeTributario: "SIMPLES_NACIONAL"                    │   │
│  │ logradouro: "Rua Comendador Antunes dos Santos"         │   │
│  │ numero: "193"                                           │   │
│  │ bairro: "Capao Redondo"                                 │   │
│  │ cidade: "Sao Paulo"                                     │   │
│  │ estado: "SP"                                            │   │
│  │ cep: "05861-260"                                        │   │
│  │ codigoMunicipioIBGE: "3550308"                          │   │
│  │ telefone: "(31) 2342-4243"                              │   │
│  │ serieNFe: "1"                                           │   │
│  │ ultimoNumeroNFe: 42                                     │   │
│  │ nfeAmbiente: "1"                                        │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              NFeGeneratorService.preencherEmitente()             │
│                                                                   │
│  1. Remove formatação: cnpj.replace(/\D/g, '')                  │
│  2. Converte CRT: obterCRT(regimeTributario)                    │
│  3. Monta tagEmit com dados reais                               │
│  4. Monta tagEnderEmit com dados reais                          │
└─────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         XML DA NF-e                              │
│                                                                   │
│  <emit>                                                          │
│    <CNPJ>28256010000101</CNPJ>                                  │
│    <xNome>NR INDUSTRIA ALIMENTICIA LTDA</xNome>                 │
│    <xFant>NR INDUSTRIA ALIMENTICIA</xFant>                      │
│    <enderEmit>                                                   │
│      <xLgr>Rua Comendador Antunes dos Santos</xLgr>            │
│      <nro>193</nro>                                             │
│      <xBairro>Capao Redondo</xBairro>                           │
│      <cMun>3550308</cMun>                                       │
│      <xMun>Sao Paulo</xMun>                                     │
│      <UF>SP</UF>                                                │
│      <CEP>05861260</CEP>                                        │
│      <cPais>1058</cPais>                                        │
│      <xPais>BRASIL</xPais>                                      │
│      <fone>3123424243</fone>                                    │
│    </enderEmit>                                                  │
│    <IE>118320540117</IE>                                        │
│    <CRT>1</CRT>                                                 │
│  </emit>                                                         │
│  <dest>                                                          │
│    <CNPJ>57953546000184</CNPJ>                                  │
│    <xNome>COMPRADOR</xNome>                                     │
│    <enderDest>                                                   │
│      <xLgr>Rua Marmelo</xLgr>                                  │
│      <nro>140</nro>                                             │
│      <xBairro>Alto Floresta</xBairro>                           │
│      <cMun>3143302</cMun>                                       │
│      <xMun>Montes Claros</xMun>                                 │
│      <UF>MG</UF>                                                │
│      <CEP>39404076</CEP>                                        │
│      <cPais>1058</cPais>                                        │
│      <xPais>BRASIL</xPais>                                      │
│      <fone>11945669960</fone>                                   │
│    </enderDest>                                                  │
│    <indIEDest>1</indIEDest>                                     │
│    <IE>0050328560022</IE>                                       │
│  </dest>                                                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✅ Checklist: Dados para NF-e

### Dados da Empresa (Emitente):

Antes de emitir uma NF-e, certifique-se que a empresa tem **TODOS** estes dados cadastrados:

### Obrigatórios:
- [ ] ✅ **razaoSocial** (xNome)
- [ ] ✅ **cnpj** (CNPJ) - formato: XX.XXX.XXX/XXXX-XX
- [ ] ✅ **inscricaoEstadual** (IE) - formato varia por estado
- [ ] ✅ **regimeTributario** (CRT) - valores: SIMPLES_NACIONAL, LUCRO_PRESUMIDO, LUCRO_REAL
- [ ] ✅ **logradouro** (xLgr) - Rua, Avenida, etc.
- [ ] ✅ **numero** (nro) - número do endereço
- [ ] ✅ **bairro** (xBairro)
- [ ] ✅ **cidade** (xMun)
- [ ] ✅ **estado** (UF) - sigla: SP, RJ, MG, etc.
- [ ] ✅ **cep** (CEP) - formato: XXXXX-XXX
- [ ] ✅ **codigoMunicipioIBGE** (cMun, cMunFG) - 7 dígitos
- [ ] ✅ **serieNFe** (serie) - exemplo: "1", "2", "10"
- [ ] ✅ **nfeAmbiente** (tpAmb) - "1" (Produção) ou "2" (Homologação)
- [ ] ✅ **certificadoDigitalPath** - caminho do arquivo .pfx
- [ ] ✅ **certificadoDigitalSenha** - senha do certificado (será criptografada)

### Opcionais (mas recomendados):
- [ ] 📱 **nomeFantasia** (xFant) - se não informado, usa razaoSocial
- [ ] 📱 **complemento** (xCpl) - apartamento, sala, bloco
- [ ] 📱 **telefone** ou **celular** (fone) - contato da empresa

### Dados do Cliente (Destinatário):

Antes de emitir uma NF-e para um cliente, certifique-se que o cliente tem **TODOS** estes dados cadastrados:

#### Para Pessoa Jurídica:
- [ ] ✅ **personType** = "JURIDICA"
- [ ] ✅ **companyName** (xNome) - Razão social
- [ ] ✅ **cnpj** (CNPJ) - formato: XX.XXX.XXX/XXXX-XX
- [ ] ✅ **stateRegistrationExempt** (indIEDest) - true/false
- [ ] ✅ **stateRegistration** (IE) - obrigatório se não isento
- [ ] ✅ **Pelo menos 1 endereço cadastrado** (preferência: BILLING)

#### Para Pessoa Física:
- [ ] ✅ **personType** = "FISICA"
- [ ] ✅ **name** (xNome) - Nome completo
- [ ] ✅ **cpf** (CPF) - formato: XXX.XXX.XXX-XX
- [ ] ✅ **Pelo menos 1 endereço cadastrado** (preferência: BILLING)

#### Endereço do Cliente (obrigatório):
- [ ] ✅ **street** (xLgr) - Rua, Avenida, etc.
- [ ] ✅ **number** (nro) - Número do endereço
- [ ] ✅ **neighborhood** (xBairro) - Bairro
- [ ] ✅ **city** (xMun) - Município
- [ ] ✅ **state** (UF) - Sigla: SP, RJ, MG, etc.
- [ ] ✅ **zipCode** (CEP) - formato: XXXXX-XXX
- [ ] ✅ **ibgeCode** (cMun) - Código IBGE de 7 dígitos

#### Contato do Cliente (opcional mas recomendado):
- [ ] 📱 **phone** ou **mobile** (fone) - Telefone de contato
- [ ] 📱 **complement** (xCpl) - Complemento do endereço

### Verificação via SQL (Empresa):

```sql
SELECT 
    razaoSocial,
    cnpj,
    inscricaoEstadual,
    regimeTributario,
    logradouro,
    numero,
    bairro,
    cidade,
    estado,
    cep,
    codigoMunicipioIBGE,
    serieNFe,
    nfeAmbiente,
    certificadoDigitalPath IS NOT NULL as tem_certificado
FROM "Company"
WHERE id = 'SEU_COMPANY_ID';
```

### Verificação via SQL (Cliente):

```sql
-- Verificar dados do cliente
SELECT 
    c.personType,
    c.name,
    c.cpf,
    c.companyName,
    c.cnpj,
    c.stateRegistration,
    c.stateRegistrationExempt,
    c.phone,
    c.mobile,
    COUNT(ca.id) as total_enderecos
FROM "customers" c
LEFT JOIN "customer_addresses" ca ON ca."customerId" = c.id
WHERE c.id = 'SEU_CUSTOMER_ID'
GROUP BY c.id;

-- Verificar endereços do cliente (prioridade: BILLING > MAIN)
SELECT 
    type,
    street,
    number,
    complement,
    neighborhood,
    city,
    state,
    "zipCode",
    "ibgeCode"
FROM "customer_addresses"
WHERE "customerId" = 'SEU_CUSTOMER_ID'
ORDER BY 
    CASE type 
        WHEN 'BILLING' THEN 1 
        WHEN 'MAIN' THEN 2 
        ELSE 3 
    END;
```

---

## 🛠️ Exemplos de Uso no Código

### 1. Buscar Empresa com Todos os Dados

```typescript
const company = await this.prisma.company.findUnique({
  where: { id: companyId },
  select: {
    // Dados para tagEmit
    razaoSocial: true,
    nomeFantasia: true,
    cnpj: true,
    inscricaoEstadual: true,
    regimeTributario: true,
    
    // Dados para tagEnderEmit
    logradouro: true,
    numero: true,
    complemento: true,
    bairro: true,
    cidade: true,
    estado: true,
    cep: true,
    telefone: true,
    celular: true,
    
    // Dados para IDE e Tools
    codigoMunicipioIBGE: true,
    serieNFe: true,
    ultimoNumeroNFe: true,
    nfeAmbiente: true,
    
    // Certificado
    certificadoDigitalPath: true,
    certificadoDigitalSenha: true,
  },
});
```

### 2. Buscar Cliente com Todos os Dados

```typescript
const customer = await this.prisma.customer.findUnique({
  where: { id: customerId },
  select: {
    // Tipo de pessoa
    personType: true,
    
    // Pessoa Física
    name: true,
    cpf: true,
    
    // Pessoa Jurídica
    companyName: true,
    cnpj: true,
    stateRegistration: true,
    stateRegistrationExempt: true,
    
    // Contatos
    phone: true,
    mobile: true,
    email: true,
    
    // Endereços (com prioridade)
    addresses: {
      select: {
        type: true,
        street: true,
        number: true,
        complement: true,
        neighborhood: true,
        city: true,
        state: true,
        zipCode: true,
        ibgeCode: true,
        country: true,
      },
      orderBy: [
        { type: 'asc' }, // BILLING vem primeiro
      ],
    },
  },
});
```

### 3. Validar Dados Antes de Emitir NF-e

```typescript
function validarDadosEmpresaParaNFe(company: Company): string[] {
  const erros: string[] = [];
  
  if (!company.razaoSocial) erros.push('Razão Social não cadastrada');
  if (!company.cnpj) erros.push('CNPJ não cadastrado');
  if (!company.inscricaoEstadual) erros.push('Inscrição Estadual não cadastrada');
  if (!company.regimeTributario) erros.push('Regime Tributário não cadastrado');
  if (!company.logradouro) erros.push('Logradouro não cadastrado');
  if (!company.numero) erros.push('Número do endereço não cadastrado');
  if (!company.bairro) erros.push('Bairro não cadastrado');
  if (!company.cidade) erros.push('Cidade não cadastrada');
  if (!company.estado) erros.push('Estado (UF) não cadastrado');
  if (!company.cep) erros.push('CEP não cadastrado');
  if (!company.codigoMunicipioIBGE) erros.push('Código IBGE do município não cadastrado');
  if (!company.serieNFe) erros.push('Série da NF-e não cadastrada');
  if (!company.nfeAmbiente) erros.push('Ambiente NF-e não cadastrado');
  if (!company.certificadoDigitalPath) erros.push('Certificado digital não enviado');
  if (!company.certificadoDigitalSenha) erros.push('Senha do certificado não cadastrada');
  
  return erros;
}

function validarDadosClienteParaNFe(customer: any): string[] {
  const erros: string[] = [];
  
  if (!customer.personType) erros.push('Tipo de pessoa não definido');
  
  if (customer.personType === 'JURIDICA') {
    if (!customer.cnpj) erros.push('CNPJ não cadastrado');
    if (!customer.companyName) erros.push('Razão Social não cadastrada');
    if (!customer.stateRegistrationExempt && !customer.stateRegistration) {
      erros.push('Inscrição Estadual obrigatória (cliente não é isento)');
    }
  } else if (customer.personType === 'FISICA') {
    if (!customer.cpf) erros.push('CPF não cadastrado');
    if (!customer.name) erros.push('Nome não cadastrado');
  }
  
  if (!customer.addresses || customer.addresses.length === 0) {
    erros.push('Nenhum endereço cadastrado');
  } else {
    const endereco = customer.addresses.find(a => a.type === 'BILLING') 
                  || customer.addresses.find(a => a.type === 'MAIN') 
                  || customer.addresses[0];
    
    if (!endereco.street) erros.push('Logradouro não cadastrado no endereço');
    if (!endereco.number) erros.push('Número não cadastrado no endereço');
    if (!endereco.neighborhood) erros.push('Bairro não cadastrado no endereço');
    if (!endereco.city) erros.push('Cidade não cadastrada no endereço');
    if (!endereco.state) erros.push('Estado (UF) não cadastrado no endereço');
    if (!endereco.zipCode) erros.push('CEP não cadastrado no endereço');
    if (!endereco.ibgeCode) erros.push('Código IBGE não cadastrado no endereço');
  }
  
  return erros;
}

// Uso:
const errosEmpresa = validarDadosEmpresaParaNFe(company);
const errosCliente = validarDadosClienteParaNFe(customer);
const todosErros = [...errosEmpresa, ...errosCliente];

if (todosErros.length > 0) {
  throw new BadRequestException({
    message: 'Dados incompletos para emissão de NF-e',
    erros: todosErros,
  });
}
```

### 4. Preencher Emitente na NF-e

```typescript
private preencherEmitente(NFe: Make, company: any): void {
  // tagEmit - Dados do emitente (todos do BD)
  NFe.tagEmit({
    CNPJ: company.cnpj.replace(/\D/g, ''),
    xNome: company.razaoSocial,
    xFant: company.nomeFantasia || company.razaoSocial,
    IE: company.inscricaoEstadual?.replace(/\D/g, ''),
    CRT: this.obterCRT(company.regimeTributario),
  });

  // tagEnderEmit - Endereço do emitente (todos do BD)
  NFe.tagEnderEmit({
    xLgr: company.logradouro || '',
    nro: company.numero || 'S/N',
    xCpl: company.complemento || undefined,
    xBairro: company.bairro || '',
    cMun: company.codigoMunicipioIBGE || this.obterCodigoMunicipio(company.cidade, company.estado),
    xMun: company.cidade || '',
    UF: company.estado || '',
    CEP: company.cep?.replace(/\D/g, '') || '',
    cPais: '1058', // FIXO (Brasil)
    xPais: 'BRASIL', // FIXO (Brasil)
    fone: company.telefone?.replace(/\D/g, '') || company.celular?.replace(/\D/g, '') || undefined,
  });
}
```

### 5. Preencher Destinatário na NF-e

```typescript
private preencherDestinatario(NFe: Make, customer: any): void {
  // Prioriza endereço: BILLING > MAIN > primeiro
  const endereco = customer.addresses.find(a => a.type === 'BILLING') 
                || customer.addresses.find(a => a.type === 'MAIN') 
                || customer.addresses[0];

  // tagDest - Dados do destinatário (todos do BD)
  const tagDest: any = {};

  if (customer.personType === 'JURIDICA' && customer.cnpj) {
    // Pessoa Jurídica
    tagDest.CNPJ = customer.cnpj.replace(/\D/g, '');
    tagDest.xNome = customer.companyName || customer.name;
    tagDest.indIEDest = customer.stateRegistrationExempt ? '2' : '1';
    if (!customer.stateRegistrationExempt && customer.stateRegistration) {
      tagDest.IE = customer.stateRegistration.replace(/\D/g, '');
    }
  } else if (customer.cpf) {
    // Pessoa Física
    tagDest.CPF = customer.cpf.replace(/\D/g, '');
    tagDest.xNome = customer.name;
    tagDest.indIEDest = '9'; // Não contribuinte
  }

  NFe.tagDest(tagDest);

  // tagEnderDest - Endereço do destinatário (todos do BD)
  NFe.tagEnderDest({
    xLgr: endereco.street,
    nro: endereco.number,
    xCpl: endereco.complement || undefined,
    xBairro: endereco.neighborhood,
    cMun: endereco.ibgeCode || this.obterCodigoMunicipio(endereco.city, endereco.state),
    xMun: endereco.city,
    UF: endereco.state,
    CEP: endereco.zipCode.replace(/\D/g, ''),
    cPais: '1058', // FIXO (Brasil)
    xPais: 'BRASIL', // FIXO (Brasil)
    fone: customer.phone?.replace(/\D/g, '') || customer.mobile?.replace(/\D/g, '') || undefined,
  });
}
```

---

## 🚨 Tratamento de Erros

### Erros Comuns e Soluções:

#### Erros da Empresa (Emitente):

| Erro | Causa | Solução |
|------|-------|---------|
| "CNPJ da empresa inválido" | CNPJ não cadastrado ou inválido | Cadastrar CNPJ válido no formato XX.XXX.XXX/XXXX-XX |
| "Inscrição Estadual da empresa inválida" | IE não cadastrada ou formato errado | Verificar formato correto para o estado |
| "Município da empresa não encontrado" | codigoMunicipioIBGE incorreto | Verificar código IBGE de 7 dígitos na tabela oficial |
| "UF da empresa inválida" | Estado não cadastrado ou sigla errada | Usar sigla correta (SP, RJ, MG, etc.) |
| "CRT inválido" | regimeTributario não reconhecido | Usar: SIMPLES_NACIONAL, LUCRO_PRESUMIDO ou LUCRO_REAL |
| "Certificado digital não encontrado" | certificadoDigitalPath vazio ou arquivo não existe | Upload do certificado A1 (.pfx) |
| "Senha do certificado incorreta" | certificadoDigitalSenha descriptografada não confere | Re-fazer upload com senha correta |

#### Erros do Cliente (Destinatário):

| Erro | Causa | Solução |
|------|-------|---------|
| "CNPJ do cliente inválido" | CNPJ não cadastrado ou formato errado | Cadastrar CNPJ válido do cliente |
| "CPF do cliente inválido" | CPF não cadastrado ou formato errado | Cadastrar CPF válido do cliente |
| "Cliente sem endereço" | Nenhum endereço cadastrado | Cadastrar pelo menos 1 endereço (preferência: BILLING) |
| "IE obrigatória para contribuinte" | stateRegistrationExempt=false mas IE vazia | Cadastrar IE ou marcar como isento |
| "Município do cliente não encontrado" | ibgeCode incorreto no endereço | Verificar código IBGE de 7 dígitos |
| "Razão Social não cadastrada" | companyName vazio para PJ | Preencher Razão Social do cliente |
| "Nome não cadastrado" | name vazio para PF | Preencher nome completo do cliente |

---

## � Seção: Transporte (tagTransp)

### Campos da NF-e e suas origens

| Campo NF-e | Origem no BD | Campo na Tabela Sale | Observações |
|------------|--------------|---------------------|-------------|
| `modFrete` | `sale.shippingModality` | `shippingModality` (Int) | Modalidade do frete cadastrada na venda |

### Valores de modFrete:

- `"0"` = Contratação do Frete por conta do Remetente (CIF)
- `"1"` = Contratação do Frete por conta do Destinatário (FOB)
- `"2"` = Contratação do Frete por conta de Terceiros
- `"3"` = Transporte Próprio por conta do Remetente
- `"4"` = Transporte Próprio por conta do Destinatário
- `"9"` = Sem Ocorrência de Transporte

### Exemplo Real:

```typescript
NFe.tagTransp({
    modFrete: "9"  // sale.shippingModality (Sem frete)
});
```

---

## 💳 Seção: Pagamento (tagDetPag)

### Campos da NF-e e suas origens

| Campo NF-e | Origem no BD | Campo na Tabela Sale | Observações |
|------------|--------------|---------------------|-------------|
| `indPag` | ❌ Calculado | - | 0=À vista (1 parcela), 1=A prazo (>1 parcela) |
| `tPag` | `sale.paymentMethod.type` | via relação `paymentMethod` | Tipo de pagamento (mapeado via tabela) |
| `vPag` | `sale.totalAmount` | `totalAmount` (Float) | Valor total da venda |

### Mapeamento de Formas de Pagamento:

| Tipo no Sistema | Código NF-e | Descrição |
|----------------|-------------|-----------|
| DINHEIRO | 01 | Dinheiro |
| CHEQUE | 02 | Cheque |
| CARTAO_CREDITO | 03 | Cartão de Crédito |
| CARTAO_DEBITO | 04 | Cartão de Débito |
| CREDITO_LOJA | 05 | Crédito Loja |
| VALE_ALIMENTACAO | 10 | Vale Alimentação |
| VALE_REFEICAO | 11 | Vale Refeição |
| VALE_PRESENTE | 12 | Vale Presente |
| VALE_COMBUSTIVEL | 13 | Vale Combustível |
| BOLETO | 15 | Boleto Bancário |
| PIX | 17 | PIX |
| TRANSFERENCIA | 18 | Transferência Bancária |
| CASHBACK | 19 | Programa de fidelidade |
| SEM_PAGAMENTO | 90 | Sem pagamento |
| OUTROS | 99 | Outros |

### Exemplo Real:

```typescript
NFe.tagDetPag([{
    indPag: "0",      // À vista (sale.installments === 1)
    tPag: "15",       // Boleto (sale.paymentMethod.type === "BOLETO")
    vPag: "1200.00"   // sale.totalAmount
}]);

NFe.tagTroco("0.00"); // Sempre 0.00
```

---

## 👨‍💻 Seção: Responsável Técnico (tagInfRespTec)

### Campos da NF-e e suas origens

| Campo NF-e | Origem no BD | Campo na Tabela Company | Observações |
|------------|--------------|------------------------|-------------|
| `CNPJ` | `company.respTecCNPJ` ou `company.cnpj` | `respTecCNPJ` (String?), `cnpj` (String) | CNPJ do responsável técnico; fallback para CNPJ da empresa |
| `xContato` | `company.respTecContato` ou `company.responsibleName` | `respTecContato` (String?), `responsibleName` (String?) | Nome do contato técnico; fallback "Suporte Técnico" |
| `email` | `company.respTecEmail` ou `company.responsibleEmail` ou `company.email` | `respTecEmail` (String?), `responsibleEmail` (String?), `email` (String?) | Email do responsável; múltiplos fallbacks |
| `fone` | `company.respTecFone` ou `company.responsiblePhone` ou `company.telefone` ou `company.celular` | `respTecFone` (String?), `responsiblePhone` (String?), `telefone` (String?), `celular` (String?) | Telefone; múltiplos fallbacks |

### Exemplo Real:

```typescript
NFe.tagInfRespTec({
    CNPJ: "28256010000101",              // company.respTecCNPJ (ou company.cnpj)
    xContato: "PP Programador Perfeito", // company.respTecContato
    email: "sac@darocabiscoitos.com",    // company.respTecEmail
    fone: "3123424243"                   // company.respTecFone (sem formatação)
});
```

---

## �📚 Referências

- **Tabela de Códigos IBGE de Municípios**: https://www.ibge.gov.br/explica/codigos-dos-municipios.php
- **Tabela de UF**: https://www.nfe.fazenda.gov.br/portal/listaConteudo.aspx?tipoConteudo=BMPFMBoln3w=
- **Manual da NF-e v4.00**: http://www.nfe.fazenda.gov.br/portal/listaConteudo.aspx?tipoConteudo=Iy/5Qol1YbE=
- **Regimes Tributários**: https://www8.receita.fazenda.gov.br/SimplesNacional/

---

## 📝 Notas Finais

1. **Todos os dados vêm do banco de dados** - não há valores fixos hardcoded para dados da empresa, cliente, venda ou produtos
2. **Únicos valores fixos permitidos**: `cPais="1058"`, `xPais="BRASIL"` e `vTroco="0.00"` (obrigatórios por lei ou padrão)
3. **Formatação automática**: CNPJ, CPF, IE, CEP e telefone têm formatação removida automaticamente
4. **Fallbacks inteligentes**: 
   - Empresa: nomeFantasia→razaoSocial, telefone→celular, numero→"S/N"
   - Cliente: companyName→name (PJ), phone→mobile
   - Endereço: BILLING→MAIN→primeiro
   - Resp. Técnico: respTecCNPJ→cnpj, respTecContato→responsibleName→"Suporte Técnico"
5. **Validação obrigatória**: Sempre validar dados completos da empresa E do cliente antes de emitir NF-e
6. **Ambiente de testes**: Sempre usar Homologação (nfeAmbiente="2") para testes
7. **Tipos de pessoa**: 
   - JURIDICA: usa CNPJ, companyName, stateRegistration, indIEDest (1 ou 2)
   - FISICA: usa CPF, name, indIEDest sempre "9"
8. **Prioridade de endereços**: BILLING (cobrança) > MAIN (principal) > primeiro disponível
9. **Pagamento**: 
   - indPag calculado automaticamente (0=à vista se 1 parcela, 1=a prazo se >1 parcela)
   - tPag mapeado da forma de pagamento cadastrada na venda
10. **Transporte**: Modalidade de frete vem do cadastro da venda (padrão: 9=Sem frete)
11. **Responsável Técnico**: Informações da empresa com fallbacks em cascata

---

**Última atualização**: 16 de novembro de 2025  
**Versão**: 3.0.0 (incluído transporte, pagamento e responsável técnico)
