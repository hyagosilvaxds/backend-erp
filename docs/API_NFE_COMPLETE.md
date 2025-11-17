# 📄 API de Nota Fiscal Eletrônica (NF-e) - Documentação Completa

## 📋 Índice

1. [Introdução](#introdução)
2. [Autenticação](#autenticação)
3. [Endpoints Disponíveis](#endpoints-disponíveis)
4. [Emissão de NF-e](#1-emissão-de-nf-e)
5. [Listagem de NF-e](#2-listagem-de-nf-e)
6. [Buscar NF-e Específica](#3-buscar-nf-e-específica)
7. [Download DANFE (PDF)](#4-download-danfe-pdf)
8. [Download XML](#5-download-xml)
9. [Consultar NF-e na SEFAZ](#6-consultar-nf-e-na-sefaz)
10. [Cancelar NF-e](#7-cancelar-nf-e)
11. [Status do Serviço SEFAZ](#8-status-do-serviço-sefaz)
12. [Códigos de Status](#códigos-de-status)
13. [Exemplos de Uso](#exemplos-de-uso)
14. [Fluxo Completo](#fluxo-completo)
15. [Tratamento de Erros](#tratamento-de-erros)

---

## 🔐 Introdução

Esta API permite a **emissão, consulta, download e cancelamento de Notas Fiscais Eletrônicas (NF-e)** integrada com a SEFAZ.

**Base URL:** `https://api.seudominio.com.br`

**Versão:** 1.0.0

**Ambiente:**
- **Produção:** `tpAmb: 1`
- **Homologação:** `tpAmb: 2`

---

## 🔐 Autenticação

Todos os endpoints requerem autenticação via **Bearer Token (JWT)**.

### **Header obrigatório:**

```http
Authorization: Bearer {seu_token_jwt}
```

### **Como obter o token:**

```http
POST /auth/login
Content-Type: application/json

{
  "email": "usuario@empresa.com",
  "password": "senha123"
}
```

**Resposta:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "usuario@empresa.com",
    "companyId": "company-uuid"
  }
}
```

---

## 📚 Endpoints Disponíveis

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/fiscal/nfe/emitir` | Emite uma NF-e |
| `GET` | `/fiscal/nfe` | Lista todas as NF-e |
| `GET` | `/fiscal/nfe/:id` | Busca uma NF-e específica |
| `GET` | `/fiscal/nfe/:id/danfe` | Download do DANFE (PDF) |
| `GET` | `/fiscal/nfe/:id/xml` | Download do XML |
| `GET` | `/fiscal/nfe/consultar/:chaveAcesso` | Consulta NF-e na SEFAZ |
| `POST` | `/fiscal/nfe/:id/cancelar` | Cancela uma NF-e |
| `GET` | `/fiscal/nfe/sefaz/status` | Status do serviço SEFAZ |

---

## 1. 📤 Emissão de NF-e

Emite uma Nota Fiscal Eletrônica a partir de uma venda cadastrada.

### **Endpoint:**
```http
POST /fiscal/nfe/emitir
```

### **Headers:**
```http
Authorization: Bearer {token}
Content-Type: application/json
```

### **Body (Request):**

```json
{
  "saleId": "uuid-da-venda",
  "enviarSefaz": true,
  "modelo": "55",
  "serie": "1",
  "naturezaOperacao": "VENDA",
  "tipoOperacao": "1",
  "finalidade": "1",
  "consumidorFinal": "1",
  "presencaComprador": "1",
  "modalidadeFrete": "9"
}
```

### **Parâmetros:**

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `saleId` | string (UUID) | ✅ Sim | ID da venda |
| `enviarSefaz` | boolean | ❌ Não | Se `true`, envia para SEFAZ. Se `false`, apenas gera XML. **Default:** `true` |
| `modelo` | string | ❌ Não | Modelo da nota. `55` = NF-e, `65` = NFC-e. **Default:** `55` |
| `serie` | string | ❌ Não | Série da nota. **Default:** `1` |
| `numero` | number | ❌ Não | Número da nota. Se não informado, é gerado automaticamente. |
| `naturezaOperacao` | string | ❌ Não | Natureza da operação. **Default:** `VENDA` |
| `tipoOperacao` | string | ❌ Não | `0` = Entrada, `1` = Saída. **Default:** `1` |
| `finalidade` | string | ❌ Não | `1` = Normal, `2` = Complementar, `3` = Ajuste, `4` = Devolução. **Default:** `1` |
| `consumidorFinal` | string | ❌ Não | `0` = Não, `1` = Sim. **Default:** `1` |
| `presencaComprador` | string | ❌ Não | `0` = Não se aplica, `1` = Presencial, `2` = Internet, `3` = Teleatendimento, `4` = NFC-e entrega, `9` = Outros. **Default:** `1` |
| `modalidadeFrete` | string | ❌ Não | `0` = Emitente, `1` = Destinatário, `2` = Terceiros, `3` = Próprio remetente, `4` = Próprio destinatário, `9` = Sem frete. **Default:** `9` |

### **Resposta (Success - 200):**

```json
{
  "xmlGerado": "/uploads/nfe/company-id/sale-id/nfe.xml",
  "xmlAssinado": "/uploads/nfe/company-id/sale-id/nfe_sign.xml",
  "status": "AUTORIZADA",
  "respostaSefaz": {
    "protNFe": [{
      "infProt": [{
        "cStat": ["100"],
        "xMotivo": ["Autorizado o uso da NF-e"],
        "chNFe": ["35240112345678901234550010000000011234567890"],
        "nProt": ["135240000000123"],
        "dhRecbto": ["2024-11-16T10:30:00-03:00"]
      }]
    }]
  },
  "chaveAcesso": "35240112345678901234550010000000011234567890",
  "protocolo": "135240000000123",
  "dataAutorizacao": "2024-11-16T10:30:00-03:00",
  "xmlProcessamento": "/uploads/nfe/company-id/sale-id/nfe_proc.xml",
  "danfe": "/uploads/nfe/company-id/sale-id/danfe.pdf"
}
```

### **Resposta (Erro - Rejeitada):**

```json
{
  "xmlGerado": "/uploads/nfe/company-id/sale-id/nfe.xml",
  "xmlAssinado": "/uploads/nfe/company-id/sale-id/nfe_sign.xml",
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
  "xmlErro": "/uploads/nfe/company-id/sale-id/nfe_err.xml"
}
```

### **Exemplo de Requisição (cURL):**

```bash
curl -X POST https://api.seudominio.com.br/fiscal/nfe/emitir \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "saleId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "enviarSefaz": true
  }'
```

### **Exemplo (JavaScript/Fetch):**

```javascript
const response = await fetch('https://api.seudominio.com.br/fiscal/nfe/emitir', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    saleId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    enviarSefaz: true
  })
});

const data = await response.json();
console.log('NF-e emitida:', data);
```

### **Fluxo Interno:**

1. ✅ Busca dados da venda no banco
2. ✅ Gera XML da NF-e
3. ✅ Assina XML digitalmente com certificado A1
4. ✅ Envia para SEFAZ (transmissão síncrona)
5. ✅ Verifica autorização (`cStat === '100'`)
6. ✅ Gera XML de processamento (nfeProc)
7. ✅ Gera DANFE (PDF)
8. ✅ Salva tudo no banco de dados

### **Arquivos Gerados:**

```
uploads/nfe/{companyId}/{saleId}/
├── nfe.xml           # XML bruto
├── nfe_sign.xml      # XML assinado
├── nfe_proc.xml      # XML de processamento (NF-e + protocolo)
└── danfe.pdf         # DANFE em PDF
```

---

## 2. 📋 Listagem de NF-e

Lista todas as Notas Fiscais Eletrônicas da empresa com filtros opcionais.

### **Endpoint:**
```http
GET /fiscal/nfe
```

### **Headers:**
```http
Authorization: Bearer {token}
```

### **Query Parameters (Filtros):**

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `status` | string | ❌ Não | Filtrar por status: `AUTHORIZED`, `REJECTED`, `CANCELED`, `PENDING` |
| `saleId` | string (UUID) | ❌ Não | Filtrar por ID da venda |
| `dataInicio` | string (ISO) | ❌ Não | Data inicial (formato: `2024-01-01`) |
| `dataFim` | string (ISO) | ❌ Não | Data final (formato: `2024-12-31`) |

### **Exemplo de Requisição:**

```http
GET /fiscal/nfe?status=AUTHORIZED&dataInicio=2024-11-01&dataFim=2024-11-30
Authorization: Bearer {token}
```

### **Resposta (200):**

```json
[
  {
    "id": "nfe-uuid-1",
    "companyId": "company-uuid",
    "saleId": "sale-uuid",
    "numero": 1,
    "serie": "1",
    "modelo": "55",
    "chaveAcesso": "35240112345678901234550010000000011234567890",
    "status": "AUTHORIZED",
    "naturezaOperacao": "VENDA",
    "dataEmissao": "2024-11-16T10:30:00.000Z",
    "valorTotal": 1500.00,
    "destinatarioNome": "Cliente Exemplo Ltda",
    "destinatarioCnpjCpf": "12345678000190",
    "protocoloAutorizacao": "135240000000123",
    "dataAutorizacao": "2024-11-16T10:30:00.000Z",
    "xmlAutorizado": "/uploads/nfe/company-id/sale-id/nfe_proc.xml",
    "danfePdfPath": "/uploads/nfe/company-id/sale-id/danfe.pdf",
    "sale": {
      "id": "sale-uuid",
      "customer": {
        "id": "customer-uuid",
        "name": "Cliente Exemplo Ltda",
        "cnpj": "12345678000190"
      }
    }
  },
  {
    "id": "nfe-uuid-2",
    "companyId": "company-uuid",
    "saleId": "sale-uuid-2",
    "numero": 2,
    "serie": "1",
    "modelo": "55",
    "chaveAcesso": "35240112345678901234550010000000021234567890",
    "status": "AUTHORIZED",
    "naturezaOperacao": "VENDA",
    "dataEmissao": "2024-11-15T14:20:00.000Z",
    "valorTotal": 2300.50,
    "destinatarioNome": "Outro Cliente S.A.",
    "destinatarioCnpjCpf": "98765432000110",
    "protocoloAutorizacao": "135240000000124",
    "dataAutorizacao": "2024-11-15T14:20:00.000Z",
    "xmlAutorizado": "/uploads/nfe/company-id/sale-id-2/nfe_proc.xml",
    "danfePdfPath": "/uploads/nfe/company-id/sale-id-2/danfe.pdf",
    "sale": {
      "id": "sale-uuid-2",
      "customer": {
        "id": "customer-uuid-2",
        "name": "Outro Cliente S.A.",
        "cnpj": "98765432000110"
      }
    }
  }
]
```

### **Exemplo (cURL):**

```bash
curl -X GET "https://api.seudominio.com.br/fiscal/nfe?status=AUTHORIZED&dataInicio=2024-11-01" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### **Exemplo (JavaScript):**

```javascript
const params = new URLSearchParams({
  status: 'AUTHORIZED',
  dataInicio: '2024-11-01',
  dataFim: '2024-11-30'
});

const response = await fetch(`https://api.seudominio.com.br/fiscal/nfe?${params}`, {
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  }
});

const nfes = await response.json();
console.log(`Total de NF-e: ${nfes.length}`);
```

---

## 3. 🔍 Buscar NF-e Específica

Busca os detalhes completos de uma NF-e específica.

### **Endpoint:**
```http
GET /fiscal/nfe/:id
```

### **Headers:**
```http
Authorization: Bearer {token}
```

### **Path Parameters:**

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `id` | string (UUID) | ID da NF-e |

### **Exemplo de Requisição:**

```http
GET /fiscal/nfe/f47ac10b-58cc-4372-a567-0e02b2c3d479
Authorization: Bearer {token}
```

### **Resposta (200):**

```json
{
  "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "companyId": "company-uuid",
  "saleId": "sale-uuid",
  "destinatarioId": "customer-uuid",
  
  "cUF": "35",
  "cNF": "12345678",
  "numero": 1,
  "serie": "1",
  "modelo": "55",
  "chaveAcesso": "35240112345678901234550010000000011234567890",
  "cDV": "0",
  
  "naturezaOperacao": "VENDA",
  "tipoOperacao": 1,
  "finalidade": 1,
  "idDest": 1,
  "cMunFG": "3550308",
  "tpImp": 1,
  "tpEmis": 1,
  "indFinal": 1,
  "indPres": 1,
  "indIntermed": 0,
  "procEmi": 0,
  "verProc": "1.0",
  
  "destinatarioNome": "Cliente Exemplo Ltda",
  "destinatarioCnpjCpf": "12345678000190",
  "destinatarioIe": "123456789",
  "indIEDest": 1,
  "destinatarioEmail": "cliente@exemplo.com",
  "destinatarioTelefone": "1133334444",
  
  "destLogradouro": "Rua Exemplo",
  "destNumero": "123",
  "destComplemento": "Sala 1",
  "destBairro": "Centro",
  "destCidade": "São Paulo",
  "destCodigoMunicipio": "3550308",
  "destEstado": "SP",
  "destCep": "01234567",
  "destCodigoPais": "1058",
  "destPais": "Brasil",
  
  "valorProdutos": 1500.00,
  "valorFrete": 0.00,
  "valorSeguro": 0.00,
  "valorDesconto": 0.00,
  "valorOutrasDespesas": 0.00,
  "valorII": 0.00,
  "valorIPI": 0.00,
  "valorIPIDevol": 0.00,
  "valorICMS": 270.00,
  "valorICMSDeson": 0.00,
  "valorFCP": 0.00,
  "valorICMSST": 0.00,
  "valorFCPST": 0.00,
  "valorFCPSTRet": 0.00,
  "valorPIS": 24.68,
  "valorCOFINS": 113.85,
  "valorTotal": 1500.00,
  
  "modalidadeFrete": 9,
  "indicadorPagamento": 0,
  "valorPagamento": 1500.00,
  "valorTroco": 0.00,
  
  "protocoloAutorizacao": "135240000000123",
  "dataAutorizacao": "2024-11-16T10:30:00.000Z",
  "status": "AUTHORIZED",
  
  "xmlEnviado": "/uploads/nfe/company-id/sale-id/nfe_sign.xml",
  "xmlAutorizado": "/uploads/nfe/company-id/sale-id/nfe_proc.xml",
  "danfePdfPath": "/uploads/nfe/company-id/sale-id/danfe.pdf",
  
  "dataEmissao": "2024-11-16T10:30:00.000Z",
  "dataSaida": "2024-11-16T10:30:00.000Z",
  
  "respTecCNPJ": "12345678000190",
  "respTecContato": "Suporte TI",
  "respTecEmail": "suporte@empresa.com",
  "respTecFone": "1133334444",
  
  "createdAt": "2024-11-16T10:30:00.000Z",
  "updatedAt": "2024-11-16T10:30:00.000Z",
  
  "sale": {
    "id": "sale-uuid",
    "totalAmount": 1500.00,
    "customer": {
      "id": "customer-uuid",
      "name": "Cliente Exemplo Ltda",
      "cnpj": "12345678000190",
      "email": "cliente@exemplo.com"
    },
    "items": [
      {
        "id": "item-uuid",
        "quantity": 10,
        "unitPrice": 150.00,
        "totalPrice": 1500.00,
        "product": {
          "id": "product-uuid",
          "name": "Produto Exemplo",
          "sku": "PROD-001",
          "ncm": "12345678",
          "cfop": "5102"
        }
      }
    ]
  }
}
```

### **Exemplo (cURL):**

```bash
curl -X GET https://api.seudominio.com.br/fiscal/nfe/f47ac10b-58cc-4372-a567-0e02b2c3d479 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### **Exemplo (JavaScript):**

```javascript
const nfeId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

const response = await fetch(`https://api.seudominio.com.br/fiscal/nfe/${nfeId}`, {
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  }
});

const nfe = await response.json();
console.log('Chave de Acesso:', nfe.chaveAcesso);
console.log('Status:', nfe.status);
```

---

## 4. 📄 Download DANFE (PDF)

Baixa o arquivo PDF do DANFE (Documento Auxiliar da Nota Fiscal Eletrônica).

### **Endpoint:**
```http
GET /fiscal/nfe/:id/danfe
```

### **Headers:**
```http
Authorization: Bearer {token}
```

### **Path Parameters:**

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `id` | string (UUID) | ID da NF-e |

### **Resposta:**

- **Content-Type:** `application/pdf`
- **Content-Disposition:** `attachment; filename="danfe-{numero}.pdf"`
- **Body:** Stream do arquivo PDF

### **Erros Possíveis:**

```json
// 404 - DANFE não encontrado
{
  "message": "DANFE não encontrado"
}

// 404 - Arquivo não existe
{
  "message": "Arquivo DANFE não encontrado"
}
```

### **Exemplo (cURL):**

```bash
curl -X GET https://api.seudominio.com.br/fiscal/nfe/f47ac10b-58cc-4372-a567-0e02b2c3d479/danfe \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -o danfe.pdf
```

### **Exemplo (JavaScript - Download):**

```javascript
const nfeId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

const response = await fetch(
  `https://api.seudominio.com.br/fiscal/nfe/${nfeId}/danfe`,
  {
    headers: {
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    }
  }
);

const blob = await response.blob();
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `danfe-${nfeId}.pdf`;
a.click();
```

### **Exemplo (JavaScript - Abrir em nova aba):**

```javascript
const nfeId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
const url = `https://api.seudominio.com.br/fiscal/nfe/${nfeId}/danfe`;

window.open(url, '_blank');
```

### **Exemplo (React):**

```jsx
function DanfeDownloadButton({ nfeId, token }) {
  const handleDownload = async () => {
    const response = await fetch(
      `https://api.seudominio.com.br/fiscal/nfe/${nfeId}/danfe`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    if (!response.ok) {
      alert('Erro ao baixar DANFE');
      return;
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `danfe-${nfeId}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };
  
  return (
    <button onClick={handleDownload}>
      📄 Baixar DANFE
    </button>
  );
}
```

---

## 5. 📥 Download XML

Baixa o arquivo XML de processamento da NF-e (nfeProc - contém NF-e + protocolo).

### **Endpoint:**
```http
GET /fiscal/nfe/:id/xml
```

### **Headers:**
```http
Authorization: Bearer {token}
```

### **Path Parameters:**

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `id` | string (UUID) | ID da NF-e |

### **Resposta:**

- **Content-Type:** `application/xml`
- **Content-Disposition:** `attachment; filename="nfe-{chaveAcesso}.xml"`
- **Body:** Stream do arquivo XML

### **Erros Possíveis:**

```json
// 404 - XML não encontrado
{
  "message": "XML não encontrado"
}

// 404 - Arquivo não existe
{
  "message": "Arquivo XML não encontrado"
}
```

### **Exemplo (cURL):**

```bash
curl -X GET https://api.seudominio.com.br/fiscal/nfe/f47ac10b-58cc-4372-a567-0e02b2c3d479/xml \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -o nfe.xml
```

### **Exemplo (JavaScript - Download):**

```javascript
const nfeId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

const response = await fetch(
  `https://api.seudominio.com.br/fiscal/nfe/${nfeId}/xml`,
  {
    headers: {
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    }
  }
);

const blob = await response.blob();
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `nfe-${nfeId}.xml`;
a.click();
```

### **Exemplo (React):**

```jsx
function XmlDownloadButton({ nfeId, token }) {
  const handleDownload = async () => {
    const response = await fetch(
      `https://api.seudominio.com.br/fiscal/nfe/${nfeId}/xml`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    if (!response.ok) {
      alert('Erro ao baixar XML');
      return;
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nfe-${nfeId}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };
  
  return (
    <button onClick={handleDownload}>
      📥 Baixar XML
    </button>
  );
}
```

---

## 6. 🔍 Consultar NF-e na SEFAZ

Consulta uma NF-e diretamente na SEFAZ pela chave de acesso.

### **Endpoint:**
```http
GET /fiscal/nfe/consultar/:chaveAcesso
```

### **Headers:**
```http
Authorization: Bearer {token}
```

### **Path Parameters:**

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `chaveAcesso` | string (44 dígitos) | Chave de acesso da NF-e |

### **Exemplo de Requisição:**

```http
GET /fiscal/nfe/consultar/35240112345678901234550010000000011234567890
Authorization: Bearer {token}
```

### **Resposta (200 - Autorizada):**

```json
{
  "cStat": "100",
  "xMotivo": "Autorizado o uso da NF-e",
  "chNFe": "35240112345678901234550010000000011234567890",
  "dhRecbto": "2024-11-16T10:30:00-03:00",
  "nProt": "135240000000123",
  "digVal": "abc123def456...",
  "cUF": "35",
  "tpAmb": "1",
  "verAplic": "SVRS202411161030"
}
```

### **Resposta (200 - Cancelada):**

```json
{
  "cStat": "101",
  "xMotivo": "Cancelamento de NF-e homologado",
  "chNFe": "35240112345678901234550010000000011234567890",
  "dhRecbto": "2024-11-16T15:45:00-03:00",
  "nProt": "135240000000124"
}
```

### **Resposta (404 - Não Encontrada):**

```json
{
  "cStat": "217",
  "xMotivo": "NF-e não consta na base de dados da SEFAZ"
}
```

### **Exemplo (cURL):**

```bash
curl -X GET "https://api.seudominio.com.br/fiscal/nfe/consultar/35240112345678901234550010000000011234567890" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### **Exemplo (JavaScript):**

```javascript
const chaveAcesso = '35240112345678901234550010000000011234567890';

const response = await fetch(
  `https://api.seudominio.com.br/fiscal/nfe/consultar/${chaveAcesso}`,
  {
    headers: {
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    }
  }
);

const resultado = await response.json();

if (resultado.cStat === '100') {
  console.log('✅ NF-e Autorizada');
  console.log('Protocolo:', resultado.nProt);
} else if (resultado.cStat === '101') {
  console.log('❌ NF-e Cancelada');
} else {
  console.log('⚠️ Status:', resultado.xMotivo);
}
```

---

## 7. ❌ Cancelar NF-e

Cancela uma NF-e autorizada.

### **Endpoint:**
```http
POST /fiscal/nfe/:id/cancelar
```

### **Headers:**
```http
Authorization: Bearer {token}
Content-Type: application/json
```

### **Path Parameters:**

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `id` | string (UUID) | ID da NF-e |

### **Body (Request):**

```json
{
  "justificativa": "Motivo do cancelamento deve ter no mínimo 15 caracteres"
}
```

### **Parâmetros:**

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `justificativa` | string | ✅ Sim | Justificativa do cancelamento (**mínimo 15 caracteres**) |

### **Requisitos:**

- ✅ NF-e deve estar com status `AUTHORIZED`
- ✅ Justificativa deve ter no mínimo 15 caracteres
- ✅ NF-e deve ter menos de 24 horas de emissão
- ✅ NF-e deve ter chave de acesso e protocolo

### **Resposta (200 - Sucesso):**

```json
{
  "cStat": "135",
  "xMotivo": "Evento registrado e vinculado a NF-e",
  "chNFe": "35240112345678901234550010000000011234567890",
  "dhRecbto": "2024-11-16T15:45:00-03:00",
  "nProt": "135240000000124",
  "tpEvento": "110111",
  "xEvento": "Cancelamento",
  "nSeqEvento": "1"
}
```

### **Erros Possíveis:**

```json
// 404 - NF-e não encontrada
{
  "message": "NF-e não encontrada"
}

// 400 - Status inválido
{
  "message": "Apenas NF-e autorizadas podem ser canceladas"
}

// 400 - Dados incompletos
{
  "message": "NF-e sem chave de acesso ou protocolo"
}

// 400 - Justificativa curta
{
  "message": "Justificativa deve ter no mínimo 15 caracteres"
}
```

### **Exemplo (cURL):**

```bash
curl -X POST https://api.seudominio.com.br/fiscal/nfe/f47ac10b-58cc-4372-a567-0e02b2c3d479/cancelar \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "justificativa": "Cancelamento solicitado pelo cliente devido a erro no pedido"
  }'
```

### **Exemplo (JavaScript):**

```javascript
const nfeId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

const response = await fetch(
  `https://api.seudominio.com.br/fiscal/nfe/${nfeId}/cancelar`,
  {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      justificativa: 'Cancelamento solicitado pelo cliente devido a erro no pedido'
    })
  }
);

const resultado = await response.json();

if (resultado.cStat === '135') {
  console.log('✅ NF-e cancelada com sucesso!');
  console.log('Protocolo:', resultado.nProt);
} else {
  console.log('❌ Erro ao cancelar:', resultado.xMotivo);
}
```

### **Exemplo (React):**

```jsx
function CancelarNFeButton({ nfeId, token }) {
  const [justificativa, setJustificativa] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleCancelar = async () => {
    if (justificativa.length < 15) {
      alert('Justificativa deve ter no mínimo 15 caracteres');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch(
        `https://api.seudominio.com.br/fiscal/nfe/${nfeId}/cancelar`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ justificativa })
        }
      );
      
      const resultado = await response.json();
      
      if (resultado.cStat === '135') {
        alert('✅ NF-e cancelada com sucesso!');
      } else {
        alert(`❌ Erro: ${resultado.xMotivo}`);
      }
    } catch (error) {
      alert('Erro ao cancelar NF-e');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <textarea
        value={justificativa}
        onChange={(e) => setJustificativa(e.target.value)}
        placeholder="Justificativa do cancelamento (mínimo 15 caracteres)"
        rows={4}
        style={{ width: '100%' }}
      />
      <button onClick={handleCancelar} disabled={loading}>
        {loading ? '⏳ Cancelando...' : '❌ Cancelar NF-e'}
      </button>
    </div>
  );
}
```

---

## 8. 🟢 Status do Serviço SEFAZ

Verifica se os servidores da SEFAZ estão online e disponíveis.

### **Endpoint:**
```http
GET /fiscal/nfe/sefaz/status
```

### **Headers:**
```http
Authorization: Bearer {token}
```

### **Resposta (200 - Serviço Ativo):**

```json
{
  "cStat": "107",
  "xMotivo": "Serviço em Operação",
  "cUF": "35",
  "dhRecbto": "2024-11-16T10:30:00-03:00",
  "tpAmb": "1",
  "verAplic": "SVRS202411161030",
  "tMed": "1"
}
```

### **Resposta (200 - Serviço Indisponível):**

```json
{
  "cStat": "108",
  "xMotivo": "Serviço Paralisado Momentaneamente",
  "cUF": "35",
  "dhRecbto": "2024-11-16T10:30:00-03:00",
  "tpAmb": "1"
}
```

### **Exemplo (cURL):**

```bash
curl -X GET https://api.seudominio.com.br/fiscal/nfe/sefaz/status \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### **Exemplo (JavaScript):**

```javascript
const response = await fetch(
  'https://api.seudominio.com.br/fiscal/nfe/sefaz/status',
  {
    headers: {
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    }
  }
);

const status = await response.json();

if (status.cStat === '107') {
  console.log('✅ SEFAZ Online');
} else {
  console.log('⚠️ SEFAZ:', status.xMotivo);
}
```

### **Exemplo (React - Status Monitor):**

```jsx
function SefazStatusMonitor({ token }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch(
          'https://api.seudominio.com.br/fiscal/nfe/sefaz/status',
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        const data = await response.json();
        setStatus(data);
      } catch (error) {
        console.error('Erro ao verificar status:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkStatus();
    const interval = setInterval(checkStatus, 60000); // Verifica a cada 1 minuto
    
    return () => clearInterval(interval);
  }, [token]);
  
  if (loading) return <div>⏳ Verificando...</div>;
  
  return (
    <div style={{
      padding: '10px',
      borderRadius: '5px',
      backgroundColor: status?.cStat === '107' ? '#d4edda' : '#f8d7da',
      color: status?.cStat === '107' ? '#155724' : '#721c24'
    }}>
      {status?.cStat === '107' ? '🟢' : '🔴'} 
      SEFAZ: {status?.xMotivo}
    </div>
  );
}
```

---

## 📊 Códigos de Status

### **Status da NF-e (Banco de Dados)**

| Status | Descrição |
|--------|-----------|
| `PENDING` | NF-e em processamento |
| `AUTHORIZED` | NF-e autorizada pela SEFAZ |
| `REJECTED` | NF-e rejeitada pela SEFAZ |
| `CANCELED` | NF-e cancelada |
| `DENIED` | NF-e denegada |

### **Códigos SEFAZ (cStat)**

#### **✅ Sucesso**

| cStat | Descrição |
|-------|-----------|
| `100` | Autorizado o uso da NF-e |
| `101` | Cancelamento de NF-e homologado |
| `107` | Serviço em Operação |
| `135` | Evento registrado e vinculado a NF-e |

#### **⚠️ Avisos**

| cStat | Descrição |
|-------|-----------|
| `108` | Serviço Paralisado Momentaneamente |
| `109` | Serviço Paralisado sem Previsão |

#### **❌ Erros Comuns**

| cStat | Descrição | Solução |
|-------|-----------|---------|
| `204` | Duplicidade de NF-e | Verificar se NF-e já foi emitida |
| `217` | NF-e não consta na base da SEFAZ | Aguardar e consultar novamente |
| `233` | Destinatário não habilitado | Verificar IE do destinatário |
| `539` | Duplicidade de NF-e | NF-e com mesma chave já existe |
| `656` | Consumo Indevido | Limite de consultas excedido |

**Referência Completa:** [Manual de Códigos SEFAZ](http://www.nfe.fazenda.gov.br/portal/exibirArquivo.aspx?conteudo=m5uD/NjE0mc=)

---

## 💡 Exemplos de Uso

### **Exemplo 1: Fluxo Completo - Emitir e Baixar NF-e**

```javascript
async function emitirEBaixarNFe(token, saleId) {
  // 1. Emitir NF-e
  const emissaoResponse = await fetch('https://api.seudominio.com.br/fiscal/nfe/emitir', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      saleId: saleId,
      enviarSefaz: true
    })
  });
  
  const emissao = await emissaoResponse.json();
  
  if (emissao.status !== 'AUTORIZADA') {
    console.error('❌ NF-e rejeitada:', emissao.motivoRejeicao);
    return;
  }
  
  console.log('✅ NF-e autorizada!');
  console.log('Chave:', emissao.chaveAcesso);
  console.log('Protocolo:', emissao.protocolo);
  
  // 2. Buscar detalhes da NF-e no banco
  const nfeResponse = await fetch(
    `https://api.seudominio.com.br/fiscal/nfe?saleId=${saleId}`,
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );
  
  const nfes = await nfeResponse.json();
  const nfe = nfes[0];
  
  // 3. Baixar DANFE
  const danfeResponse = await fetch(
    `https://api.seudominio.com.br/fiscal/nfe/${nfe.id}/danfe`,
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );
  
  const danfeBlob = await danfeResponse.blob();
  
  // 4. Baixar XML
  const xmlResponse = await fetch(
    `https://api.seudominio.com.br/fiscal/nfe/${nfe.id}/xml`,
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );
  
  const xmlBlob = await xmlResponse.blob();
  
  console.log('📄 Arquivos baixados com sucesso!');
  
  return { nfe, danfeBlob, xmlBlob };
}
```

### **Exemplo 2: Listar NF-e do Mês Atual**

```javascript
async function listarNFesMesAtual(token) {
  const hoje = new Date();
  const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
  
  const dataInicio = primeiroDia.toISOString().split('T')[0];
  const dataFim = ultimoDia.toISOString().split('T')[0];
  
  const params = new URLSearchParams({
    status: 'AUTHORIZED',
    dataInicio,
    dataFim
  });
  
  const response = await fetch(
    `https://api.seudominio.com.br/fiscal/nfe?${params}`,
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );
  
  const nfes = await response.json();
  
  console.log(`📊 Total de NF-e autorizadas no mês: ${nfes.length}`);
  
  const valorTotal = nfes.reduce((sum, nfe) => sum + nfe.valorTotal, 0);
  console.log(`💰 Valor total: R$ ${valorTotal.toFixed(2)}`);
  
  return nfes;
}
```

### **Exemplo 3: Verificar Status e Emitir NF-e**

```javascript
async function emitirComVerificacao(token, saleId) {
  // 1. Verificar se SEFAZ está online
  const statusResponse = await fetch(
    'https://api.seudominio.com.br/fiscal/nfe/sefaz/status',
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );
  
  const status = await statusResponse.json();
  
  if (status.cStat !== '107') {
    console.error('⚠️ SEFAZ indisponível:', status.xMotivo);
    return;
  }
  
  console.log('✅ SEFAZ online');
  
  // 2. Emitir NF-e
  const emissaoResponse = await fetch(
    'https://api.seudominio.com.br/fiscal/nfe/emitir',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ saleId, enviarSefaz: true })
    }
  );
  
  const emissao = await emissaoResponse.json();
  
  if (emissao.status === 'AUTORIZADA') {
    console.log('✅ NF-e emitida com sucesso!');
    console.log('Chave:', emissao.chaveAcesso);
  } else {
    console.error('❌ Erro:', emissao.motivoRejeicao);
  }
  
  return emissao;
}
```

---

## 🔄 Fluxo Completo

### **Diagrama do Fluxo**

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUXO DE EMISSÃO NF-e                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ 1. POST /emitir │
                    │  (saleId)       │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ 2. Gerar XML    │
                    │   (BD → XML)    │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ 3. Assinar XML  │
                    │  (Certificado)  │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ 4. Enviar SEFAZ │
                    │  (indSinc: 1)   │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ 5. cStat = 100? │
                    └────────┬────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼                         ▼
       ┌────────────────┐        ┌────────────────┐
       │ ✅ AUTORIZADA  │        │ ❌ REJEITADA   │
       └────────┬───────┘        └────────┬───────┘
                │                         │
                ▼                         ▼
       ┌────────────────┐        ┌────────────────┐
       │ 6. Gerar       │        │ Retornar erro  │
       │    nfeProc     │        │ (motivoRejeic) │
       └────────┬───────┘        └────────────────┘
                │
                ▼
       ┌────────────────┐
       │ 7. Gerar DANFE │
       └────────┬───────┘
                │
                ▼
       ┌────────────────┐
       │ 8. Salvar BD   │
       └────────┬───────┘
                │
                ▼
       ┌────────────────┐
       │ 9. GET /nfe/:id│
       │   (Buscar)     │
       └────────┬───────┘
                │
                ▼
       ┌────────────────┐
       │10. GET /danfe  │
       │   (Download)   │
       └────────┬───────┘
                │
                ▼
       ┌────────────────┐
       │11. GET /xml    │
       │   (Download)   │
       └────────────────┘
```

---

## ⚠️ Tratamento de Erros

### **Estrutura de Erro Padrão**

```json
{
  "statusCode": 400,
  "message": "Descrição do erro",
  "error": "Bad Request"
}
```

### **Códigos HTTP**

| Código | Descrição | Quando Ocorre |
|--------|-----------|---------------|
| `200` | OK | Requisição bem-sucedida |
| `400` | Bad Request | Dados inválidos ou incompletos |
| `401` | Unauthorized | Token inválido ou expirado |
| `403` | Forbidden | Sem permissão |
| `404` | Not Found | Recurso não encontrado |
| `500` | Internal Server Error | Erro interno do servidor |

### **Erros Comuns**

#### **1. Token Inválido**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```
**Solução:** Fazer login novamente e obter novo token.

#### **2. Venda Não Encontrada**
```json
{
  "statusCode": 404,
  "message": "Venda não encontrada"
}
```
**Solução:** Verificar se o `saleId` está correto.

#### **3. Certificado Inválido**
```json
{
  "statusCode": 400,
  "message": "Certificado digital inválido ou expirado"
}
```
**Solução:** Atualizar certificado A1 da empresa.

#### **4. NF-e Duplicada**
```json
{
  "status": "REJEITADA",
  "motivoRejeicao": "Duplicidade de NF-e",
  "respostaSefaz": {
    "protNFe": [{
      "infProt": [{
        "cStat": ["539"],
        "xMotivo": ["Duplicidade de NF-e"]
      }]
    }]
  }
}
```
**Solução:** Verificar se NF-e já foi emitida para esta venda.

#### **5. Justificativa Cancelamento Curta**
```json
{
  "statusCode": 400,
  "message": "Justificativa deve ter no mínimo 15 caracteres"
}
```
**Solução:** Fornecer justificativa mais detalhada.

---

## 📚 Referências Adicionais

### **Documentação Técnica**

- [NFE_SEFAZ_FLOW_COMPLETE.md](./NFE_SEFAZ_FLOW_COMPLETE.md) - Fluxo detalhado de emissão
- [NFE_SEFAZ_INTEGRATION_COMPLETE.md](./NFE_SEFAZ_INTEGRATION_COMPLETE.md) - Detalhes da implementação
- [NFE_MAPEAMENTO_DADOS_EMPRESA.md](./NFE_MAPEAMENTO_DADOS_EMPRESA.md) - Mapeamento de dados
- [Manual SEFAZ](http://www.nfe.fazenda.gov.br/portal/principal.aspx) - Documentação oficial

### **Bibliotecas Utilizadas**

- `node-sped-nfe` - Biblioteca para integração com SEFAZ
- `@nestjs/common` - Framework NestJS
- `prisma` - ORM para banco de dados

---

## 🎯 Resumo dos Endpoints

| Ação | Método | Endpoint |
|------|--------|----------|
| **Emitir NF-e** | `POST` | `/fiscal/nfe/emitir` |
| **Listar NF-e** | `GET` | `/fiscal/nfe` |
| **Buscar NF-e** | `GET` | `/fiscal/nfe/:id` |
| **Download DANFE** | `GET` | `/fiscal/nfe/:id/danfe` |
| **Download XML** | `GET` | `/fiscal/nfe/:id/xml` |
| **Consultar SEFAZ** | `GET` | `/fiscal/nfe/consultar/:chaveAcesso` |
| **Cancelar NF-e** | `POST` | `/fiscal/nfe/:id/cancelar` |
| **Status SEFAZ** | `GET` | `/fiscal/nfe/sefaz/status` |

---

**Versão:** 1.0.0  
**Data:** 16 de novembro de 2025  
**Autor:** Sistema ERP Backend
