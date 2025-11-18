# Fluxo Completo de Emissão de NF-e - SEFAZ Integration

## 📋 Visão Geral

Este documento descreve o **fluxo completo de emissão de NF-e** implementado no sistema, seguindo as melhores práticas da SEFAZ e utilizando transmissão **SÍNCRONA** para obtenção imediata do resultado.

---

## 🔄 Fluxo de Emissão (10 Passos)

### **Endpoint:** `POST /fiscal/nfe/emitir`

```http
POST /fiscal/nfe/emitir
Authorization: Bearer {token}
Content-Type: application/json

{
  "saleId": "uuid-da-venda",
  "enviarSefaz": true
}
```

---

### **Passo 1: Gerar XML da NF-e**

```typescript
const xml = await this.nfeGenerator.gerarXML(companyId, dto);
```

**Descrição:**
- Busca todos os dados da venda, empresa, cliente e produtos no banco de dados
- Gera XML completo da NF-e seguindo o layout oficial da SEFAZ
- Utiliza **APENAS dados reais** cadastrados no sistema

**Arquivo Gerado:** `nfe.xml`
- XML bruto da NF-e (não assinado)
- Contém todas as tags obrigatórias e opcionais

---

### **Passo 2: Salvar XML Gerado**

```typescript
const xmlPath = await this.salvarArquivo(companyId, dto.saleId, 'nfe.xml', xml);
```

**Descrição:**
- Salva XML em: `uploads/nfe/{companyId}/{saleId}/nfe.xml`
- Cria diretórios automaticamente se não existirem

**Resultado:**
```
/uploads/nfe/abc123/venda456/nfe.xml
```

---

### **Passo 3: Assinar XML Digitalmente**

```typescript
const xmlAssinado = await this.nfeSefaz.assinarXML(companyId, xml);
```

**Descrição:**
- Busca certificado A1 da empresa no banco de dados
- Assina digitalmente o XML usando o certificado
- Adiciona tag `<Signature>` ao XML
- Validação da assinatura é feita pela biblioteca `node-sped-nfe`

**Certificado:**
```typescript
// Buscado do banco: company.certificateA1Buffer + company.certificatePassword
```

---

### **Passo 4: Salvar XML Assinado**

```typescript
const xmlAssinadoPath = await this.salvarArquivo(
  companyId,
  dto.saleId,
  'nfe_sign.xml',
  xmlAssinado,
);
```

**Descrição:**
- Salva XML assinado em: `uploads/nfe/{companyId}/{saleId}/nfe_sign.xml`
- Este é o XML que será enviado para a SEFAZ

**Resultado:**
```
/uploads/nfe/abc123/venda456/nfe_sign.xml
```

---

### **Passo 5: Enviar para SEFAZ (Transmissão SÍNCRONA)**

```typescript
const respostaSefaz = await this.nfeSefaz.enviarLote(companyId, xmlAssinado);
```

**Descrição:**
- Envia lote com **indSinc: 1** (transmissão SÍNCRONA)
- Aguarda processamento imediato pela SEFAZ
- Retorna resposta com protocolo de autorização ou rejeição

**Parâmetros:**
```typescript
{
  indSinc: 1  // 1 = SÍNCRONO (resposta imediata)
              // 0 = ASSÍNCRONO (precisa consultar depois)
}
```

**Resposta SEFAZ (Exemplo Autorizada):**
```json
{
  "protNFe": [{
    "infProt": [{
      "cStat": ["100"],           // 100 = Autorizada
      "xMotivo": ["Autorizado o uso da NF-e"],
      "chNFe": ["35240112345678901234550010000000011234567890"],
      "nProt": ["135240000000123"],
      "dhRecbto": ["2024-01-15T10:30:00-03:00"]
    }]
  }]
}
```

**Resposta SEFAZ (Exemplo Rejeitada):**
```json
{
  "protNFe": [{
    "infProt": [{
      "cStat": ["539"],
      "xMotivo": ["Duplicidade de NF-e"]
    }]
  }]
}
```

---

### **Passo 6: Verificar Status de Autorização**

```typescript
if (respostaSefaz.protNFe[0].infProt[0].cStat[0] === '100') {
  // NF-e AUTORIZADA ✅
} else {
  // NF-e REJEITADA ❌
}
```

**Códigos de Status Comuns:**

| cStat | Descrição | Ação |
|-------|-----------|------|
| `100` | Autorizado o uso da NF-e | **✅ SUCESSO** - Continua fluxo |
| `539` | Duplicidade de NF-e | ❌ Erro - NF-e já existe |
| `204` | Duplicidade de NF-e em contingência | ❌ Erro - NF-e em contingência |
| `217` | NF-e não consta na base de dados da SEFAZ | ❌ Erro - Consultar novamente |
| `233` | Destino não habilitado para receber NF-e | ❌ Erro - Verificar cadastro |

**Referência:** [Manual de Códigos da SEFAZ](http://www.nfe.fazenda.gov.br/portal/exibirArquivo.aspx?conteudo=m5uD/NjE0mc=)

---

### **Passo 7: Gerar XML de Processamento (nfeProc)**

```typescript
const xmlProcessamento = await this.nfeSefaz.gerarXmlProcessamento(
  xmlAssinado,
  respostaSefaz,
);
```

**Descrição:**
- Gera o **XML de Processamento** (nfeProc)
- Combina: XML assinado + Protocolo de autorização
- Este é o XML oficial que deve ser armazenado e disponibilizado

**Estrutura nfeProc:**
```xml
<nfeProc versao="4.00" xmlns="http://www.portalfiscal.inf.br/nfe">
  <NFe xmlns="http://www.portalfiscal.inf.br/nfe">
    <!-- XML da NF-e com assinatura -->
  </NFe>
  <protNFe versao="4.00">
    <infProt>
      <tpAmb>1</tpAmb>
      <verAplic>SVRS202401151030</verAplic>
      <chNFe>35240112345678901234550010000000011234567890</chNFe>
      <dhRecbto>2024-01-15T10:30:00-03:00</dhRecbto>
      <nProt>135240000000123</nProt>
      <digVal>abc123...</digVal>
      <cStat>100</cStat>
      <xMotivo>Autorizado o uso da NF-e</xMotivo>
    </infProt>
  </protNFe>
</nfeProc>
```

**Importância:**
- ✅ Contém o protocolo de autorização
- ✅ É o XML válido legalmente
- ✅ Deve ser enviado ao cliente
- ✅ Usado para gerar o DANFE

---

### **Passo 8: Salvar XML de Processamento**

```typescript
const xmlProcessamentoPath = await this.salvarArquivo(
  companyId,
  dto.saleId,
  'nfe_proc.xml',
  xmlProcessamento,
);
```

**Descrição:**
- Salva em: `uploads/nfe/{companyId}/{saleId}/nfe_proc.xml`
- Este é o XML que deve ser guardado e disponibilizado

**Resultado:**
```
/uploads/nfe/abc123/venda456/nfe_proc.xml
```

---

### **Passo 9: Gerar DANFE (PDF)**

```typescript
const danfePdf = await this.nfeSefaz.gerarDANFE(xmlProcessamento);
```

**Descrição:**
- Gera o **DANFE** (Documento Auxiliar da Nota Fiscal Eletrônica)
- **IMPORTANTE:** Usa o `xmlProcessamento` (nfeProc), não o xmlAssinado
- O DANFE contém:
  - Dados da NF-e
  - Chave de acesso com código de barras
  - Protocolo de autorização
  - QR Code (para NFC-e)

**Por que usar xmlProcessamento?**
```typescript
// ❌ ERRADO - Não contém protocolo
gerarDANFE(xmlAssinado)

// ✅ CORRETO - Contém NF-e + protocolo
gerarDANFE(xmlProcessamento)
```

---

### **Passo 10: Salvar DANFE (PDF)**

```typescript
const danfePath = await this.salvarArquivo(
  companyId,
  dto.saleId,
  'danfe.pdf',
  danfePdf,
);
```

**Descrição:**
- Salva PDF em: `uploads/nfe/{companyId}/{saleId}/danfe.pdf`
- Este é o PDF que será impresso e/ou enviado ao cliente

**Resultado:**
```
/uploads/nfe/abc123/venda456/danfe.pdf
```

---

### **Passo 11: Salvar no Banco de Dados**

```typescript
await this.salvarNFeNoBanco(companyId, dto.saleId, resultado);
```

**Descrição:**
- Salva todos os dados da NF-e na tabela `nfe`
- Campos principais:
  - `chaveAcesso`: Chave de 44 dígitos
  - `protocoloAutorizacao`: Número do protocolo
  - `status`: 'AUTHORIZED'
  - `xmlEnviado`: Caminho do nfe_sign.xml
  - `xmlAutorizado`: Caminho do nfe_proc.xml
  - `danfePdfPath`: Caminho do danfe.pdf

---

## 📁 Arquivos Gerados

Após emissão completa, os seguintes arquivos são criados:

```
uploads/nfe/{companyId}/{saleId}/
├── nfe.xml           # XML bruto (não assinado)
├── nfe_sign.xml      # XML assinado digitalmente
├── nfe_proc.xml      # XML de processamento (NF-e + protocolo) ⭐ PRINCIPAL
└── danfe.pdf         # DANFE em PDF
```

**Em caso de erro/rejeição:**
```
uploads/nfe/{companyId}/{saleId}/
├── nfe.xml
├── nfe_sign.xml
└── nfe_err.xml       # Resposta de erro da SEFAZ
```

---

## 🎯 Resposta da API

### **Sucesso (NF-e Autorizada)**

```json
{
  "xmlGerado": "/uploads/nfe/abc123/venda456/nfe.xml",
  "xmlAssinado": "/uploads/nfe/abc123/venda456/nfe_sign.xml",
  "status": "AUTORIZADA",
  "respostaSefaz": {
    "protNFe": [{
      "infProt": [{
        "cStat": ["100"],
        "xMotivo": ["Autorizado o uso da NF-e"],
        "chNFe": ["35240112345678901234550010000000011234567890"],
        "nProt": ["135240000000123"],
        "dhRecbto": ["2024-01-15T10:30:00-03:00"]
      }]
    }]
  },
  "chaveAcesso": "35240112345678901234550010000000011234567890",
  "protocolo": "135240000000123",
  "dataAutorizacao": "2024-01-15T10:30:00-03:00",
  "xmlProcessamento": "/uploads/nfe/abc123/venda456/nfe_proc.xml",
  "danfe": "/uploads/nfe/abc123/venda456/danfe.pdf"
}
```

### **Erro (NF-e Rejeitada)**

```json
{
  "xmlGerado": "/uploads/nfe/abc123/venda456/nfe.xml",
  "xmlAssinado": "/uploads/nfe/abc123/venda456/nfe_sign.xml",
  "status": "REJEITADA",
  "respostaSefaz": {
    "protNFe": [{
      "infProt": [{
        "cStat": ["539"],
        "xMotivo": ["Duplicidade de NF-e"]
      }]
    }]
  },
  "motivoRejeicao": "Duplicidade de NF-e",
  "xmlErro": "/uploads/nfe/abc123/venda456/nfe_err.xml"
}
```

---

## 🔐 Segurança e Validações

### **1. Certificado Digital A1**

```typescript
// Buscado do banco de dados
const company = await prisma.company.findUnique({
  where: { id: companyId },
  select: {
    certificateA1Buffer: true,  // Buffer do certificado .pfx
    certificatePassword: true,  // Senha do certificado
  }
});
```

**Validações:**
- ✅ Certificado válido e não expirado
- ✅ Senha correta
- ✅ Certificado no formato A1 (.pfx)

### **2. Dados Obrigatórios**

**Empresa (Emitente):**
- ✅ CNPJ
- ✅ Inscrição Estadual
- ✅ Endereço completo
- ✅ Código município IBGE

**Cliente (Destinatário):**
- ✅ CPF ou CNPJ
- ✅ Nome/Razão Social
- ✅ Endereço completo

**Produtos:**
- ✅ Código NCM
- ✅ CFOP
- ✅ Impostos configurados

### **3. Ambiente SEFAZ**

```typescript
// Definido na configuração da empresa
tpAmb: company.ambienteNFe || '2'  // 1 = Produção, 2 = Homologação
```

---

## 🚀 Comparação: Síncrono vs Assíncrono

### **Transmissão SÍNCRONA (indSinc: 1)** ✅ IMPLEMENTADO

```typescript
// Envia e aguarda resposta imediata
const resposta = await enviarLote(xml, { indSinc: 1 });

if (resposta.protNFe[0].infProt[0].cStat[0] === '100') {
  // NF-e já autorizada! 
  // Pode gerar DANFE imediatamente
}
```

**Vantagens:**
- ✅ Resposta imediata (1 única requisição)
- ✅ Mais simples de implementar
- ✅ Não precisa consultar recibo depois
- ✅ Melhor experiência do usuário

**Desvantagens:**
- ⚠️ Timeout maior (aguarda processamento)
- ⚠️ Limite de 50 NF-e por lote

---

### **Transmissão ASSÍNCRONA (indSinc: 0)** ❌ NÃO USAR

```typescript
// Envia lote
const resposta = await enviarLote(xml, { indSinc: 0 });

// Recebe apenas o número do recibo
const recibo = resposta.infRec[0].nRec[0];

// Precisa consultar depois
await consultarRecibo(recibo);
```

**Vantagens:**
- ✅ Retorna mais rápido (não aguarda processamento)
- ✅ Permite enviar mais NF-e por lote (até 50)

**Desvantagens:**
- ❌ Precisa de 2 requisições (enviar + consultar)
- ❌ Mais complexo de implementar
- ❌ Usuário precisa esperar sem feedback

---

## 📊 Fluxograma Completo

```
┌─────────────────────────────────────────────────────────────┐
│                    EMISSÃO DE NF-e                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  1. Gerar XML   │
                    │   (BD → XML)    │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ 2. Salvar nfe.xml│
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ 3. Assinar XML  │
                    │  (Certificado)  │
                    └────────┬────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │4. Salvar         │
                    │  nfe_sign.xml    │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ 5. Enviar SEFAZ  │
                    │  (indSinc: 1)    │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ 6. Verificar     │
                    │   cStat === '100'│
                    └────────┬─────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼                         ▼
       ┌────────────────┐        ┌────────────────┐
       │  cStat = 100   │        │  cStat ≠ 100   │
       │   AUTORIZADA   │        │   REJEITADA    │
       └────────┬───────┘        └────────┬───────┘
                │                         │
                ▼                         ▼
       ┌────────────────┐        ┌────────────────┐
       │7. Gerar nfeProc│        │ Salvar erro    │
       │ (XML + Prot)   │        │  nfe_err.xml   │
       └────────┬───────┘        └────────────────┘
                │
                ▼
       ┌────────────────┐
       │8. Salvar       │
       │  nfe_proc.xml  │
       └────────┬───────┘
                │
                ▼
       ┌────────────────┐
       │9. Gerar DANFE  │
       │  (nfeProc)     │
       └────────┬───────┘
                │
                ▼
       ┌────────────────┐
       │10. Salvar      │
       │   danfe.pdf    │
       └────────┬───────┘
                │
                ▼
       ┌────────────────┐
       │11. Salvar no BD│
       │  (status: AUTH)│
       └────────────────┘
```

---

## 🔍 Endpoints Relacionados

### **1. Baixar DANFE**
```http
GET /fiscal/nfe/:id/danfe
```
Retorna o PDF do DANFE

### **2. Baixar XML**
```http
GET /fiscal/nfe/:id/xml
```
Retorna o XML de processamento (nfeProc)

### **3. Consultar NF-e**
```http
GET /fiscal/nfe/consultar/:chaveAcesso
```
Consulta NF-e diretamente na SEFAZ pela chave

### **4. Cancelar NF-e**
```http
POST /fiscal/nfe/:id/cancelar
```
Cancela uma NF-e autorizada

### **5. Status SEFAZ**
```http
GET /fiscal/nfe/sefaz/status
```
Verifica se os servidores da SEFAZ estão online

---

## 📖 Referências

- **Manual de Integração NF-e:** http://www.nfe.fazenda.gov.br/portal/listaConteudo.aspx?tipoConteudo=BMPFMBoln3w=
- **Códigos de Status:** http://www.nfe.fazenda.gov.br/portal/exibirArquivo.aspx?conteudo=m5uD/NjE0mc=
- **Layout NF-e 4.0:** http://www.nfe.fazenda.gov.br/portal/exibirArquivo.aspx?conteudo=qbh4VGIMPqw=
- **Biblioteca node-sped-nfe:** https://github.com/paulobritania/node-sped-nfe

---

## ✅ Checklist de Implementação

- [x] Gerar XML a partir de dados do BD
- [x] Assinar XML com certificado A1
- [x] Enviar lote SÍNCRONO (indSinc: 1)
- [x] Verificar status de autorização (cStat === '100')
- [x] Gerar XML de processamento (nfeProc)
- [x] Gerar DANFE a partir do nfeProc
- [x] Salvar arquivos (nfe.xml, nfe_sign.xml, nfe_proc.xml, danfe.pdf)
- [x] Salvar dados no banco de dados
- [x] Tratamento de erros e rejeições
- [x] Endpoints de download (DANFE e XML)
- [x] Consulta de NF-e
- [x] Cancelamento de NF-e

---

## 🎓 Conceitos Importantes

### **XML Assinado vs XML de Processamento**

| Tipo | Descrição | Quando Usar |
|------|-----------|-------------|
| **nfe_sign.xml** | XML assinado digitalmente | Enviar para SEFAZ |
| **nfe_proc.xml** | XML + Protocolo de autorização | Guardar, enviar ao cliente, gerar DANFE |

### **indSinc: Síncrono vs Assíncrono**

| Valor | Modo | Comportamento |
|-------|------|---------------|
| `1` | Síncrono | Aguarda processamento, retorna autorização imediata |
| `0` | Assíncrono | Retorna recibo, precisa consultar depois |

### **cStat: Códigos de Status**

| Código | Significado | Ação |
|--------|-------------|------|
| `100` | Autorizado | ✅ Continuar fluxo |
| `539` | Duplicidade | ❌ NF-e já existe |
| `204` | Duplicidade contingência | ❌ Verificar contingência |

---

**Versão:** 1.0.0  
**Data:** 2024-01-15  
**Autor:** Sistema ERP Backend
