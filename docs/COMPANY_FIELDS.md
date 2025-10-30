# 🏢 Campos Fiscais e Cadastrais das Empresas

## 📋 Visão Geral

O sistema suporta todos os campos necessários para cadastro fiscal brasileiro, incluindo informações cadastrais, tributárias, endereço completo e contatos.

## 🧩 1. Informações Cadastrais Básicas

### Campos Obrigatórios

| Campo | Tipo | Descrição | Exemplo |
|-------|------|-----------|---------|
| `razaoSocial` | String | Nome jurídico da empresa | "Comercial Alfa Ltda." |
| `cnpj` | String (14 dígitos) | Cadastro Nacional de Pessoa Jurídica | "12345678901234" |

### Campos Opcionais

| Campo | Tipo | Descrição | Exemplo |
|-------|------|-----------|---------|
| `nomeFantasia` | String | Nome comercial usado no dia a dia | "Alfa Distribuidora" |
| `inscricaoEstadual` | String | Cadastro na SEFAZ | "123456789" |
| `inscricaoMunicipal` | String | Para emissão de NFS-e | "998877" |
| `regimeTributario` | String | Define regras fiscais | "Simples Nacional", "Lucro Presumido", "Lucro Real" |
| `cnaePrincipal` | String | Atividade econômica principal | "4751-2/01" |
| `cnaeSecundarios` | String[] | Outras atividades | ["4752-1/00", "4753-9/00"] |
| `dataAbertura` | Date | Data de fundação | "2018-06-15" |
| `situacaoCadastral` | String | Situação da empresa | "Ativa", "Inativa", "Suspensa" |

## 🏢 2. Endereço Completo

| Campo | Tipo | Descrição | Exemplo |
|-------|------|-----------|---------|
| `logradouro` | String | Rua, Avenida, etc. | "Rua das Flores" |
| `numero` | String | Número do endereço | "100" |
| `complemento` | String | Apto, sala, bloco, etc. | "Sala 201" |
| `bairro` | String | Bairro | "Centro" |
| `cidade` | String | Município | "São Paulo" |
| `estado` | String (2 caracteres) | UF (sigla do estado) | "SP" |
| `cep` | String (8 dígitos) | CEP | "01310100" |
| `pais` | String | País | "Brasil" (padrão) |

## 📞 3. Contatos

| Campo | Tipo | Descrição | Exemplo |
|-------|------|-----------|---------|
| `telefone` | String | Telefone fixo | "(11) 3000-1000" |
| `celular` | String | Celular / WhatsApp | "(11) 99000-1000" |
| `email` | String | E-mail principal | "contato@empresa.com.br" |
| `site` | String (URL) | Site da empresa | "https://www.empresa.com.br" |

## 💰 4. Configurações Fiscais e Tributárias

Essas informações são essenciais para emissão de NF-e, NFC-e, NFS-e ou integração com sistemas fiscais.

### Tipo de Contribuinte e Regime

| Campo | Tipo | Descrição | Exemplos |
|-------|------|-----------|----------|
| `tipoContribuinte` | String | Tipo de contribuinte | "Contribuinte ICMS", "Contribuinte ISS", "Isento", "Não Contribuinte" |
| `regimeApuracao` | String | Regime de apuração fiscal | "Simples Nacional", "Lucro Presumido", "Lucro Real", "MEI" |

### Códigos IBGE

| Campo | Tipo | Descrição | Exemplo |
|-------|------|-----------|---------|
| `codigoMunicipioIBGE` | String (7 dígitos) | Código IBGE do município | "3550308" (São Paulo) |
| `codigoEstadoIBGE` | String (2 dígitos) | Código IBGE do estado | "35" (SP) |

**Links úteis:**
- [Tabela de Códigos de Municípios IBGE](https://www.ibge.gov.br/explica/codigos-dos-municipios.php)
- [Códigos UF IBGE](https://www.ibge.gov.br/explica/codigos-dos-estados.php)

### CFOP e Operações Fiscais

| Campo | Tipo | Descrição | Exemplo |
|-------|------|-----------|---------|
| `cfopPadrao` | String (4 dígitos) | CFOP padrão para operações | "5102" (Venda de mercadoria dentro do estado) |

**CFOPs Comuns:**
- `5101` - Venda de produção do estabelecimento
- `5102` - Venda de mercadoria adquirida de terceiros
- `5405` - Venda de mercadoria sujeita ao regime de substituição tributária
- `6102` - Venda de mercadoria adquirida para outros estados

### Certificado Digital

| Campo | Tipo | Descrição | Exemplo |
|-------|------|-----------|---------|
| `certificadoDigitalPath` | String | Caminho do arquivo do certificado A1 | "/certificates/empresa.pfx" |
| `certificadoDigitalSenha` | String | Senha do certificado (deve ser criptografada) | "******" |

**⚠️ Importante:**
- A senha deve ser criptografada antes de salvar no banco
- Certificado A1 é um arquivo .pfx ou .p12
- Validade típica: 1 ano
- Necessário para emissão de NF-e e NFC-e

### Numeração de Notas Fiscais

| Campo | Tipo | Descrição | Valor Inicial |
|-------|------|-----------|---------------|
| `serieNFe` | String | Série da NF-e | "1" |
| `ultimoNumeroNFe` | Integer | Último número de NF-e emitido | 0 |
| `serieNFCe` | String | Série da NFC-e | "1" |
| `ultimoNumeroNFCe` | Integer | Último número de NFC-e emitido | 0 |
| `serieNFSe` | String | Série da NFS-e | "1" |
| `ultimoNumeroNFSe` | Integer | Último número de NFS-e emitido | 0 |

**Notas:**
- A série é definida pela empresa (geralmente "1")
- O número é sequencial e incrementado a cada emissão
- Não pode haver números duplicados na mesma série

### Ambiente Fiscal

| Campo | Tipo | Descrição | Valores |
|-------|------|-----------|---------|
| `ambienteFiscal` | String | Ambiente de emissão | "Homologacao" ou "Producao" |

**⚠️ Importante:**
- Começar sempre em "Homologacao" para testes
- Mudar para "Producao" apenas após validações
- Notas em homologação não têm validade jurídica

## 📝 Exemplo Completo de Cadastro

### Request

```http
POST http://localhost:3000/companies
Authorization: Bearer {token}
Content-Type: application/json

{
  "razaoSocial": "Empresa Delta Comércio e Serviços Ltda",
  "nomeFantasia": "Empresa Delta",
  "cnpj": "12345678901234",
  "inscricaoEstadual": "123456789",
  "inscricaoMunicipal": "998877",
  "regimeTributario": "Simples Nacional",
  "cnaePrincipal": "4751-2/01",
  "cnaeSecundarios": ["4752-1/00", "4753-9/00"],
  "dataAbertura": "2020-01-15",
  "situacaoCadastral": "Ativa",
  "logradouro": "Rua das Flores",
  "numero": "100",
  "complemento": "Sala 201",
  "bairro": "Centro",
  "cidade": "São Paulo",
  "estado": "SP",
  "cep": "01310100",
  "pais": "Brasil",
  "telefone": "(11) 3000-1000",
  "celular": "(11) 99000-1000",
  "email": "contato@delta.com.br",
  "site": "https://www.delta.com.br",
  "tipoContribuinte": "Contribuinte ICMS",
  "regimeApuracao": "Simples Nacional",
  "codigoMunicipioIBGE": "3550308",
  "codigoEstadoIBGE": "35",
  "cfopPadrao": "5102",
  "serieNFe": "1",
  "serieNFCe": "1",
  "serieNFSe": "1",
  "ambienteFiscal": "Homologacao",
  "active": true
}
```

### Response

```json
{
  "id": "uuid",
  "razaoSocial": "Empresa Delta Comércio e Serviços Ltda",
  "nomeFantasia": "Empresa Delta",
  "cnpj": "12345678901234",
  "inscricaoEstadual": "123456789",
  "inscricaoMunicipal": "998877",
  "regimeTributario": "Simples Nacional",
  "cnaePrincipal": "4751-2/01",
  "cnaeSecundarios": ["4752-1/00", "4753-9/00"],
  "dataAbertura": "2020-01-15T00:00:00.000Z",
  "situacaoCadastral": "Ativa",
  "logradouro": "Rua das Flores",
  "numero": "100",
  "complemento": "Sala 201",
  "bairro": "Centro",
  "cidade": "São Paulo",
  "estado": "SP",
  "cep": "01310100",
  "pais": "Brasil",
  "telefone": "(11) 3000-1000",
  "celular": "(11) 99000-1000",
  "email": "contato@delta.com.br",
  "site": "https://www.delta.com.br",
  "tipoContribuinte": "Contribuinte ICMS",
  "regimeApuracao": "Simples Nacional",
  "codigoMunicipioIBGE": "3550308",
  "codigoEstadoIBGE": "35",
  "cfopPadrao": "5102",
  "certificadoDigitalPath": null,
  "certificadoDigitalSenha": null,
  "serieNFe": "1",
  "ultimoNumeroNFe": 0,
  "serieNFCe": "1",
  "ultimoNumeroNFCe": 0,
  "serieNFSe": "1",
  "ultimoNumeroNFSe": 0,
  "ambienteFiscal": "Homologacao",
  "active": true,
  "createdAt": "2025-10-24T10:00:00.000Z",
  "updatedAt": "2025-10-24T10:00:00.000Z"
}
```

## ✅ Validações Aplicadas

### CNPJ
- ✅ Deve ter exatamente 14 dígitos
- ✅ Deve conter apenas números
- ✅ Deve ser único no sistema
- ⚠️ **Nota**: Validação do dígito verificador não implementada (recomendada para produção)

### Inscrições
- Formato livre (cada estado tem seu padrão)
- Validação específica pode ser adicionada conforme necessidade

### CEP
- ✅ Deve ter exatamente 8 dígitos
- ✅ Apenas números

### Estado (UF)
- ✅ Deve ter exatamente 2 caracteres
- Exemplos: SP, RJ, MG, etc.

### Email
- ✅ Validação de formato de email

### Site
- ✅ Validação de formato de URL

### Códigos IBGE
- ✅ Município: 7 dígitos numéricos
- ✅ Estado: 2 dígitos numéricos

### CFOP
- ✅ 4 dígitos numéricos
- Exemplos válidos: 5102, 6102, 5405

### Séries de Notas Fiscais
- Formato livre (geralmente números: "1", "2", "3")
- Último número é auto-incrementado pelo sistema

### Regime Tributário
Valores sugeridos:
- "Simples Nacional"
- "Lucro Presumido"
- "Lucro Real"
- "MEI"

### Situação Cadastral
Valores sugeridos:
- "Ativa" (padrão)
- "Inativa"
- "Suspensa"
- "Baixada"
- "Inapta"

## 🔄 Atualização de Dados

Todos os campos são opcionais na atualização, exceto quando houver validação de unicidade (CNPJ):

```http
PATCH http://localhost:3000/companies/{id}
Authorization: Bearer {token}
x-company-id: {companyId}
Content-Type: application/json

{
  "nomeFantasia": "Nova Fantasia",
  "telefone": "(11) 3000-2000",
  "email": "novoemail@empresa.com.br"
}
```

## 📊 Empresas Criadas no Seed

O seed cria 3 empresas completas com todos os campos preenchidos:

### 1. Empresa Alpha
- **Razão Social**: Empresa Alpha Comércio Ltda
- **Nome Fantasia**: Empresa Alpha
- **CNPJ**: 11222333000144
- **Regime**: Simples Nacional
- **Cidade**: São Paulo/SP

### 2. Empresa Beta
- **Razão Social**: Empresa Beta Serviços e Comércio Ltda
- **Nome Fantasia**: Empresa Beta
- **CNPJ**: 55666777000188
- **Regime**: Lucro Presumido
- **Cidade**: São Paulo/SP

### 3. Empresa Gamma
- **Razão Social**: Empresa Gamma Indústria e Comércio Ltda
- **Nome Fantasia**: Empresa Gamma
- **CNPJ**: 99888777000199
- **Regime**: Lucro Real
- **Cidade**: Campinas/SP

## 🔍 Listagem de Empresas

### Response com Dados Completos

```json
[
  {
    "id": "uuid",
    "razaoSocial": "Empresa Alpha Comércio Ltda",
    "nomeFantasia": "Empresa Alpha",
    "cnpj": "11222333000144",
    "inscricaoEstadual": "123456789",
    "inscricaoMunicipal": "987654",
    "regimeTributario": "Simples Nacional",
    "cnaePrincipal": "4751-2/01",
    "cnaeSecundarios": ["4752-1/00", "4753-9/00"],
    "dataAbertura": "2020-01-15T00:00:00.000Z",
    "situacaoCadastral": "Ativa",
    "logradouro": "Rua das Flores",
    "numero": "100",
    "complemento": "Sala 201",
    "bairro": "Centro",
    "cidade": "São Paulo",
    "estado": "SP",
    "cep": "01310100",
    "pais": "Brasil",
    "telefone": "(11) 3000-1000",
    "celular": "(11) 99000-1000",
    "email": "contato@alpha.com.br",
    "site": "https://www.alpha.com.br",
    "active": true,
    "createdAt": "2025-10-24T10:00:00.000Z",
    "updatedAt": "2025-10-24T10:00:00.000Z",
    "_count": {
      "users": 3
    }
  }
]
```

## 🚀 Próximos Passos Recomendados

### Validações Avançadas
- [ ] Validação de dígito verificador do CNPJ
- [ ] Validação de dígito verificador da Inscrição Estadual por UF
- [ ] Validação de CEP via API (ViaCEP, por exemplo)
- [ ] Validação de formato de telefone brasileiro

### Integrações
- [ ] Consulta de CNPJ na Receita Federal
- [ ] Consulta de CEP para preenchimento automático
- [ ] Validação de situação cadastral na Receita
- [ ] Consulta de códigos IBGE

### Documentos Fiscais
- [ ] Upload seguro de certificado digital (A1/A3)
- [ ] Criptografia da senha do certificado
- [ ] Configurações de NF-e (ambiente, série, numeração)
- [ ] Configurações de NFC-e
- [ ] Configurações de NFS-e
- [ ] Logo da empresa para documentos

### Emissão de Notas Fiscais
- [ ] Integração com SEFAZ para NF-e
- [ ] Emissão de NFC-e
- [ ] Emissão de NFS-e
- [ ] Contingência offline
- [ ] Consulta de status de notas
- [ ] Cancelamento de notas
- [ ] Carta de correção

## 🔒 Segurança - Certificado Digital

### Armazenamento do Certificado

**⚠️ IMPORTANTE - Considerações de Segurança:**

1. **Senha do Certificado**
   - NUNCA armazene a senha em texto plano
   - Use criptografia forte (AES-256)
   - Considere usar um serviço de gerenciamento de secrets (AWS Secrets Manager, Azure Key Vault, etc.)

2. **Arquivo do Certificado**
   - Armazene em local seguro com permissões restritas
   - Considere usar storage criptografado
   - Faça backups regulares (criptografados)
   - Nunca commite certificados no Git

3. **Implementação Recomendada**
   ```typescript
   import * as crypto from 'crypto';
   
   // Criptografar senha antes de salvar
   function encryptPassword(password: string, encryptionKey: string): string {
     const iv = crypto.randomBytes(16);
     const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(encryptionKey), iv);
     let encrypted = cipher.update(password);
     encrypted = Buffer.concat([encrypted, cipher.final()]);
     return iv.toString('hex') + ':' + encrypted.toString('hex');
   }
   
   // Descriptografar senha ao usar
   function decryptPassword(encryptedPassword: string, encryptionKey: string): string {
     const parts = encryptedPassword.split(':');
     const iv = Buffer.from(parts[0], 'hex');
     const encryptedText = Buffer.from(parts[1], 'hex');
     const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(encryptionKey), iv);
     let decrypted = decipher.update(encryptedText);
     decrypted = Buffer.concat([decrypted, decipher.final()]);
     return decrypted.toString();
   }
   ```

4. **Variáveis de Ambiente**
   ```env
   # .env
   CERTIFICATE_ENCRYPTION_KEY=sua-chave-256-bits-aqui
   CERTIFICATES_PATH=/secure/certificates/
   ```

### Renovação de Certificados

Certificados A1 têm validade de 1 ano. Implemente:
- [ ] Notificação 30 dias antes do vencimento
- [ ] Processo de renovação automatizado
- [ ] Backup do certificado antigo
- [ ] Teste de conectividade após renovação

---

**Nota**: Todos os campos estão prontos para integração com sistemas fiscais brasileiros (NF-e, NFS-e, SPED, etc.)
