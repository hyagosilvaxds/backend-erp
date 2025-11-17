# 📡 API de NFe - Documentação Completa de Endpoints

## 📋 Índice

1. [Autenticação e Headers](#autenticação-e-headers)
2. [Criar NFe Manual](#1-criar-nfe-manual)
3. [Criar NFe de Venda](#2-criar-nfe-de-venda)
4. [Listar NFes](#3-listar-nfes)
5. [Buscar Estatísticas](#4-buscar-estatísticas)
6. [Buscar NFe Específica](#5-buscar-nfe-específica)
7. [Atualizar NFe](#6-atualizar-nfe)
8. [Deletar NFe](#7-deletar-nfe)
9. [Emitir NFe](#8-emitir-nfe)
10. [Cancelar NFe](#9-cancelar-nfe)
11. [Gerar DANFE](#10-gerar-danfe)
12. [Baixar XML](#11-baixar-xml)
13. [Consultar Status](#12-consultar-status)
14. [Códigos de Status HTTP](#códigos-de-status-http)
15. [Modelos de Dados](#modelos-de-dados)

---

## Autenticação e Headers

Todos os endpoints requerem autenticação JWT e identificação da empresa:

```http
Authorization: Bearer {seu_token_jwt}
X-Company-Id: {uuid_da_empresa}
Content-Type: application/json
```

**Base URL:** `http://localhost:3000` (desenvolvimento)

---

## 1. Criar NFe Manual

Cria uma nova NFe com dados fornecidos manualmente.

### Request

```http
POST /nfe
```

### Payload

```json
{
  "serie": "1",
  "modelo": "55",
  "naturezaOperacao": "VENDA",
  "tipoOperacao": 1,
  "finalidade": 1,
  "idDest": 2,
  "indFinal": 0,
  "indPres": 1,
  "indIntermed": 0,
  
  "destinatarioId": "uuid-do-cliente",
  "destinatarioNome": "EMPRESA TESTE LTDA",
  "destinatarioCnpjCpf": "12345678000190",
  "destinatarioIe": "123456789",
  "indIEDest": 1,
  "destinatarioEmail": "contato@empresateste.com.br",
  "destinatarioTelefone": "11999999999",
  
  "destLogradouro": "Rua das Flores",
  "destNumero": "123",
  "destComplemento": "Sala 10",
  "destBairro": "Centro",
  "destCidade": "São Paulo",
  "destCodigoMunicipio": "3550308",
  "destEstado": "SP",
  "destCep": "01310100",
  "destCodigoPais": "1058",
  "destPais": "Brasil",
  
  "valorProdutos": 1200.00,
  "valorFrete": 50.00,
  "valorSeguro": 0.00,
  "valorDesconto": 38.00,
  "valorOutrasDespesas": 0.00,
  "valorIPI": 0.00,
  "valorICMS": 180.00,
  "valorPIS": 16.50,
  "valorCOFINS": 76.00,
  "valorTotal": 1212.00,
  
  "modalidadeFrete": 9,
  "transportadoraNome": null,
  "transportadoraCnpjCpf": null,
  
  "indicadorPagamento": 0,
  "meioPagamento": "17",
  "valorPagamento": 1212.00,
  "valorTroco": 0.00,
  
  "informacoesComplementares": "Nota Fiscal de venda de produtos",
  "informacoesFisco": null,
  "observacoes": "Observações internas",
  
  "items": [
    {
      "productId": "uuid-do-produto",
      "codigoProduto": "126",
      "codigoEAN": "SEM GTIN",
      "codigoEANTrib": "SEM GTIN",
      "descricao": "CABOS MICROFONE DMX XR CANON BALANCEADO 20 METROS",
      "ncm": "85044010",
      "cest": null,
      "cfop": "6102",
      "unidadeComercial": "UNID",
      "quantidadeComercial": 3.0,
      "valorUnitarioComercial": 132.00,
      "unidadeTributavel": "UNID",
      "quantidadeTributavel": 3.0,
      "valorUnitarioTributavel": 132.00,
      "valorProduto": 396.00,
      "valorDesconto": 0.00,
      "valorFrete": 0.00,
      "valorSeguro": 0.00,
      "valorOutros": 0.00,
      "indicadorTotal": 1,
      "icmsOrigem": 0,
      "icmsCSOSN": "400",
      "pisCst": "49",
      "pisValor": 0.00,
      "cofinsCst": "49",
      "cofinsValor": 0.00
    },
    {
      "productId": "uuid-do-produto-2",
      "codigoProduto": "127",
      "codigoEAN": "SEM GTIN",
      "codigoEANTrib": "SEM GTIN",
      "descricao": "CABO DE MICROFONE XLR FEMEA PARA P10 MONO 20 METROS",
      "ncm": "85044010",
      "cest": null,
      "cfop": "6102",
      "unidadeComercial": "UNID",
      "quantidadeComercial": 2.0,
      "valorUnitarioComercial": 185.00,
      "unidadeTributavel": "UNID",
      "quantidadeTributavel": 2.0,
      "valorUnitarioTributavel": 185.00,
      "valorProduto": 370.00,
      "valorDesconto": 38.00,
      "valorFrete": 0.00,
      "valorSeguro": 0.00,
      "valorOutros": 0.00,
      "indicadorTotal": 1,
      "icmsOrigem": 0,
      "icmsCSOSN": "400",
      "pisCst": "49",
      "pisValor": 0.00,
      "cofinsCst": "49",
      "cofinsValor": 0.00
    }
  ]
}
```

### Response (201 Created)

```json
{
  "id": "uuid-da-nfe",
  "companyId": "uuid-da-empresa",
  "saleId": null,
  "cUF": "35",
  "cNF": "12345678",
  "numero": 253,
  "serie": "1",
  "modelo": "55",
  "chaveAcesso": null,
  "cDV": null,
  "status": "DRAFT",
  "naturezaOperacao": "VENDA",
  "tipoOperacao": 1,
  "finalidade": 1,
  "idDest": 2,
  "cMunFG": "3550308",
  "tpImp": 1,
  "tpEmis": 1,
  "indFinal": 0,
  "indPres": 1,
  "indIntermed": 0,
  "procEmi": 0,
  "verProc": "1.0",
  "destinatarioId": "uuid-do-cliente",
  "destinatarioNome": "EMPRESA TESTE LTDA",
  "destinatarioCnpjCpf": "12345678000190",
  "destinatarioIe": "123456789",
  "indIEDest": 1,
  "destinatarioEmail": "contato@empresateste.com.br",
  "destinatarioTelefone": "11999999999",
  "destLogradouro": "Rua das Flores",
  "destNumero": "123",
  "destComplemento": "Sala 10",
  "destBairro": "Centro",
  "destCidade": "São Paulo",
  "destCodigoMunicipio": "3550308",
  "destEstado": "SP",
  "destCep": "01310100",
  "destCodigoPais": "1058",
  "destPais": "Brasil",
  "valorProdutos": 1200.00,
  "valorFrete": 50.00,
  "valorSeguro": 0.00,
  "valorDesconto": 38.00,
  "valorOutrasDespesas": 0.00,
  "valorII": 0.00,
  "valorIPI": 0.00,
  "valorIPIDevol": 0.00,
  "valorICMS": 180.00,
  "valorICMSDeson": 0.00,
  "valorFCP": 0.00,
  "valorICMSST": 0.00,
  "valorFCPST": 0.00,
  "valorFCPSTRet": 0.00,
  "valorPIS": 16.50,
  "valorCOFINS": 76.00,
  "valorTotal": 1212.00,
  "valorTributosFederais": 0.00,
  "valorTributosEstaduais": 0.00,
  "valorTributosMunicipais": 0.00,
  "valorTributosTotal": 0.00,
  "modalidadeFrete": 9,
  "transportadoraNome": null,
  "transportadoraCnpjCpf": null,
  "transportadoraIE": null,
  "transportadoraEndereco": null,
  "transportadoraCidade": null,
  "transportadoraUF": null,
  "veiculoPlaca": null,
  "veiculoUF": null,
  "volumeQuantidade": null,
  "volumeEspecie": null,
  "volumeMarca": null,
  "volumeNumeracao": null,
  "volumePesoLiquido": null,
  "volumePesoBruto": null,
  "indicadorPagamento": 0,
  "meioPagamento": "17",
  "valorPagamento": 1212.00,
  "valorTroco": 0.00,
  "informacoesComplementares": "Nota Fiscal de venda de produtos",
  "informacoesFisco": null,
  "dataEmissao": null,
  "dataSaida": null,
  "protocoloAutorizacao": null,
  "dataAutorizacao": null,
  "xmlEnviado": null,
  "xmlRetorno": null,
  "xmlAutorizado": null,
  "danfePdfPath": null,
  "canceladaEm": null,
  "motivoCancelamento": null,
  "protocoloCancelamento": null,
  "emContingencia": false,
  "tipoContingencia": null,
  "justificativaContingencia": null,
  "respTecCNPJ": null,
  "respTecContato": null,
  "respTecEmail": null,
  "respTecFone": null,
  "observacoes": "Observações internas",
  "createdAt": "2025-11-16T20:00:00.000Z",
  "updatedAt": "2025-11-16T20:00:00.000Z",
  "company": {
    "id": "uuid-da-empresa",
    "razaoSocial": "MINHA EMPRESA LTDA",
    "cnpj": "12345678000100"
  },
  "sale": null,
  "customer": {
    "id": "uuid-do-cliente",
    "name": null,
    "companyName": "EMPRESA TESTE LTDA",
    "personType": "JURIDICA"
  },
  "items": [
    {
      "id": "uuid-item-1",
      "nfeId": "uuid-da-nfe",
      "numero": 1,
      "productId": "uuid-do-produto",
      "codigoProduto": "126",
      "codigoEAN": "SEM GTIN",
      "codigoEANTrib": "SEM GTIN",
      "descricao": "CABOS MICROFONE DMX XR CANON BALANCEADO 20 METROS",
      "ncm": "85044010",
      "cest": null,
      "cfop": "6102",
      "unidadeComercial": "UNID",
      "quantidadeComercial": 3.0,
      "valorUnitarioComercial": 132.00,
      "unidadeTributavel": "UNID",
      "quantidadeTributavel": 3.0,
      "valorUnitarioTributavel": 132.00,
      "valorProduto": 396.00,
      "valorDesconto": 0.00,
      "valorFrete": 0.00,
      "valorSeguro": 0.00,
      "valorOutros": 0.00,
      "indicadorTotal": 1,
      "icmsOrigem": 0,
      "icmsCst": null,
      "icmsCSOSN": "400",
      "icmsModalidadeBC": null,
      "icmsBase": null,
      "icmsAliquota": null,
      "icmsValor": null,
      "icmsFCPBase": null,
      "icmsFCPAliquota": null,
      "icmsFCPValor": null,
      "icmsStModalidadeBC": null,
      "icmsStBase": null,
      "icmsStAliquota": null,
      "icmsStValor": null,
      "icmsStMVA": null,
      "icmsStReducaoBC": null,
      "icmsUFDestBase": null,
      "icmsUFDestAliquota": null,
      "icmsUFDestValor": null,
      "icmsUFRemetAliquota": null,
      "icmsUFRemetValor": null,
      "ipiCst": null,
      "ipiBase": null,
      "ipiAliquota": null,
      "ipiValor": null,
      "iiBase": null,
      "iiDespAdu": null,
      "iiValor": null,
      "iiIOF": null,
      "pisCst": "49",
      "pisBase": null,
      "pisAliquota": null,
      "pisValor": 0.00,
      "pisQuantidade": null,
      "pisAliqValor": null,
      "cofinsCst": "49",
      "cofinsBase": null,
      "cofinsAliquota": null,
      "cofinsValor": 0.00,
      "cofinsQuantidade": null,
      "cofinsAliqValor": null,
      "ibsCbsCst": null,
      "ibsCbsClassTrib": null,
      "ibsBase": null,
      "ibsUFAliquota": null,
      "ibsUFValor": null,
      "ibsMunAliquota": null,
      "ibsMunValor": null,
      "ibsValor": null,
      "cbsAliquota": null,
      "cbsValor": null,
      "informacoesAdicionais": null,
      "createdAt": "2025-11-16T20:00:00.000Z",
      "updatedAt": "2025-11-16T20:00:00.000Z"
    },
    {
      "id": "uuid-item-2",
      "nfeId": "uuid-da-nfe",
      "numero": 2,
      "productId": "uuid-do-produto-2",
      "codigoProduto": "127",
      "codigoEAN": "SEM GTIN",
      "codigoEANTrib": "SEM GTIN",
      "descricao": "CABO DE MICROFONE XLR FEMEA PARA P10 MONO 20 METROS",
      "ncm": "85044010",
      "cest": null,
      "cfop": "6102",
      "unidadeComercial": "UNID",
      "quantidadeComercial": 2.0,
      "valorUnitarioComercial": 185.00,
      "unidadeTributavel": "UNID",
      "quantidadeTributavel": 2.0,
      "valorUnitarioTributavel": 185.00,
      "valorProduto": 370.00,
      "valorDesconto": 38.00,
      "valorFrete": 0.00,
      "valorSeguro": 0.00,
      "valorOutros": 0.00,
      "indicadorTotal": 1,
      "icmsOrigem": 0,
      "icmsCst": null,
      "icmsCSOSN": "400",
      "pisCst": "49",
      "pisValor": 0.00,
      "cofinsCst": "49",
      "cofinsValor": 0.00,
      "createdAt": "2025-11-16T20:00:00.000Z",
      "updatedAt": "2025-11-16T20:00:00.000Z"
    }
  ],
  "events": []
}
```

### Erros Possíveis

```json
// 404 - Empresa não encontrada
{
  "statusCode": 404,
  "message": "Empresa não encontrada",
  "error": "Not Found"
}

// 404 - Cliente não encontrado
{
  "statusCode": 404,
  "message": "Cliente não encontrado",
  "error": "Not Found"
}

// 400 - Cliente não pertence à empresa
{
  "statusCode": 400,
  "message": "Cliente não pertence a esta empresa",
  "error": "Bad Request"
}

// 400 - Validação falhou
{
  "statusCode": 400,
  "message": [
    "serie should not be empty",
    "naturezaOperacao should not be empty",
    "destinatarioNome should not be empty"
  ],
  "error": "Bad Request"
}
```

---

## 2. Criar NFe de Venda

Cria uma NFe a partir de uma venda existente, preenchendo automaticamente os dados.

### Request

```http
POST /nfe/from-sale
```

### Payload

```json
{
  "saleId": "uuid-da-venda",
  "serie": "1",
  "modelo": "55",
  "naturezaOperacao": "VENDA",
  "tipoOperacao": 1,
  "finalidade": 1,
  "modalidadeFrete": 9,
  "informacoesComplementares": "NFe gerada automaticamente da venda #VENDA-001",
  "informacoesFisco": null,
  "observacoes": "Gerada automaticamente"
}
```

### Response (201 Created)

```json
{
  "id": "uuid-da-nfe",
  "companyId": "uuid-da-empresa",
  "saleId": "uuid-da-venda",
  "numero": 254,
  "serie": "1",
  "modelo": "55",
  "status": "DRAFT",
  "naturezaOperacao": "VENDA",
  "destinatarioNome": "CLIENTE DA VENDA LTDA",
  "destinatarioCnpjCpf": "98765432000100",
  "valorTotal": 1500.00,
  "createdAt": "2025-11-16T20:05:00.000Z",
  "updatedAt": "2025-11-16T20:05:00.000Z",
  "company": { /* ... */ },
  "sale": {
    "id": "uuid-da-venda",
    "code": "VENDA-001",
    "totalAmount": 1500.00
  },
  "customer": { /* ... */ },
  "items": [ /* itens da venda */ ],
  "events": []
}
```

### Erros Possíveis

```json
// 404 - Venda não encontrada
{
  "statusCode": 404,
  "message": "Venda não encontrada",
  "error": "Not Found"
}

// 400 - Venda não pertence à empresa
{
  "statusCode": 400,
  "message": "Venda não pertence a esta empresa",
  "error": "Bad Request"
}

// 409 - Venda já possui NFe
{
  "statusCode": 409,
  "message": "Esta venda já possui uma NFe vinculada",
  "error": "Conflict"
}
```

---

## 3. Listar NFes

Lista todas as NFes da empresa com filtros e paginação.

### Request

```http
GET /nfe?status=DRAFT&page=1&limit=20&search=cliente
```

### Query Parameters

| Parâmetro | Tipo | Descrição | Exemplo |
|-----------|------|-----------|---------|
| `status` | string | Filtrar por status | `DRAFT`, `AUTHORIZED`, `CANCELED` |
| `saleId` | string (UUID) | Filtrar por venda | `uuid-da-venda` |
| `destinatarioId` | string (UUID) | Filtrar por cliente | `uuid-do-cliente` |
| `startDate` | string (ISO) | Data inicial | `2025-01-01` |
| `endDate` | string (ISO) | Data final | `2025-12-31` |
| `search` | string | Busca livre | `cliente`, `123`, `chave` |
| `page` | number | Número da página | `1` |
| `limit` | number | Itens por página | `20` |

### Response (200 OK)

```json
{
  "data": [
    {
      "id": "uuid-nfe-1",
      "companyId": "uuid-da-empresa",
      "saleId": "uuid-venda-1",
      "numero": 254,
      "serie": "1",
      "modelo": "55",
      "chaveAcesso": null,
      "status": "DRAFT",
      "naturezaOperacao": "VENDA",
      "destinatarioNome": "CLIENTE ABC LTDA",
      "destinatarioCnpjCpf": "12345678000100",
      "valorTotal": 1500.00,
      "dataEmissao": null,
      "createdAt": "2025-11-16T20:00:00.000Z",
      "updatedAt": "2025-11-16T20:00:00.000Z",
      "company": {
        "id": "uuid-da-empresa",
        "razaoSocial": "MINHA EMPRESA LTDA",
        "cnpj": "12345678000100"
      },
      "sale": {
        "id": "uuid-venda-1",
        "code": "VENDA-001",
        "totalAmount": 1500.00
      },
      "customer": {
        "id": "uuid-cliente-1",
        "name": null,
        "companyName": "CLIENTE ABC LTDA",
        "personType": "JURIDICA"
      },
      "items": [
        {
          "id": "uuid-item-1",
          "numero": 1,
          "descricao": "PRODUTO TESTE",
          "quantidade": 10,
          "valorUnitario": 150.00,
          "valorTotal": 1500.00
        }
      ],
      "events": []
    },
    {
      "id": "uuid-nfe-2",
      "numero": 253,
      "serie": "1",
      "status": "AUTHORIZED",
      "destinatarioNome": "CLIENTE XYZ LTDA",
      "valorTotal": 2500.00,
      "dataEmissao": "2025-11-15T10:30:00.000Z",
      "chaveAcesso": "35251112345678000100550010002530001234567890",
      /* ... */
    }
  ],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

---

## 4. Buscar Estatísticas

Retorna estatísticas consolidadas de NFes da empresa.

### Request

```http
GET /nfe/stats
```

### Response (200 OK)

```json
{
  "total": 150,
  "emitidas": 120,
  "canceladas": 5,
  "rascunhos": 25,
  "valorTotalEmitidas": 150000.00
}
```

---

## 5. Buscar NFe Específica

Busca uma NFe específica com todos os relacionamentos.

### Request

```http
GET /nfe/{id}
```

### Response (200 OK)

```json
{
  "id": "uuid-da-nfe",
  "companyId": "uuid-da-empresa",
  "saleId": "uuid-da-venda",
  "cUF": "35",
  "cNF": "12345678",
  "numero": 254,
  "serie": "1",
  "modelo": "55",
  "chaveAcesso": "35251112345678000100550010002540001234567890",
  "cDV": "0",
  "status": "AUTHORIZED",
  "naturezaOperacao": "VENDA",
  "tipoOperacao": 1,
  "finalidade": 1,
  "idDest": 2,
  "cMunFG": "3550308",
  "tpImp": 1,
  "tpEmis": 1,
  "indFinal": 0,
  "indPres": 1,
  "indIntermed": 0,
  "procEmi": 0,
  "verProc": "1.0",
  "destinatarioId": "uuid-do-cliente",
  "destinatarioNome": "CLIENTE ABC LTDA",
  "destinatarioCnpjCpf": "12345678000100",
  "destinatarioIe": "123456789",
  "indIEDest": 1,
  "destinatarioEmail": "contato@clienteabc.com.br",
  "destinatarioTelefone": "11988887777",
  "destLogradouro": "Av. Paulista",
  "destNumero": "1000",
  "destComplemento": "Andar 10",
  "destBairro": "Bela Vista",
  "destCidade": "São Paulo",
  "destCodigoMunicipio": "3550308",
  "destEstado": "SP",
  "destCep": "01310100",
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
  "valorPIS": 24.75,
  "valorCOFINS": 114.00,
  "valorTotal": 1500.00,
  "valorTributosFederais": 138.75,
  "valorTributosEstaduais": 270.00,
  "valorTributosMunicipais": 0.00,
  "valorTributosTotal": 408.75,
  "modalidadeFrete": 9,
  "transportadoraNome": null,
  "transportadoraCnpjCpf": null,
  "transportadoraIE": null,
  "transportadoraEndereco": null,
  "transportadoraCidade": null,
  "transportadoraUF": null,
  "veiculoPlaca": null,
  "veiculoUF": null,
  "volumeQuantidade": null,
  "volumeEspecie": null,
  "volumeMarca": null,
  "volumeNumeracao": null,
  "volumePesoLiquido": null,
  "volumePesoBruto": null,
  "indicadorPagamento": 0,
  "meioPagamento": "17",
  "valorPagamento": 1500.00,
  "valorTroco": 0.00,
  "informacoesComplementares": "Venda realizada via sistema ERP",
  "informacoesFisco": null,
  "dataEmissao": "2025-11-16T10:30:00.000Z",
  "dataSaida": "2025-11-16T10:30:00.000Z",
  "protocoloAutorizacao": "135251234567890",
  "dataAutorizacao": "2025-11-16T10:31:00.000Z",
  "xmlEnviado": "<nfeProc>...</nfeProc>",
  "xmlRetorno": "<retEnviNFe>...</retEnviNFe>",
  "xmlAutorizado": "<nfeProc>...</nfeProc>",
  "danfePdfPath": "uploads/nfe/danfe/35251112345678000100550010002540001234567890.pdf",
  "canceladaEm": null,
  "motivoCancelamento": null,
  "protocoloCancelamento": null,
  "emContingencia": false,
  "tipoContingencia": null,
  "justificativaContingencia": null,
  "respTecCNPJ": "12345678000100",
  "respTecContato": "Suporte Técnico",
  "respTecEmail": "suporte@empresa.com.br",
  "respTecFone": "1133334444",
  "observacoes": "Nota fiscal gerada com sucesso",
  "createdAt": "2025-11-16T09:00:00.000Z",
  "updatedAt": "2025-11-16T10:31:00.000Z",
  "company": {
    "id": "uuid-da-empresa",
    "razaoSocial": "MINHA EMPRESA LTDA",
    "nomeFantasia": "Minha Empresa",
    "cnpj": "12345678000100",
    "inscricaoEstadual": "123456789",
    "logradouro": "Rua Comercial",
    "numero": "500",
    "bairro": "Centro",
    "cidade": "São Paulo",
    "estado": "SP",
    "cep": "01000000",
    "telefone": "1133332222",
    "email": "contato@minhaempresa.com.br",
    "codigoMunicipioIBGE": "3550308",
    "regimeTributario": "1"
  },
  "sale": {
    "id": "uuid-da-venda",
    "code": "VENDA-001",
    "status": "CONFIRMED",
    "totalAmount": 1500.00,
    "confirmedAt": "2025-11-16T09:00:00.000Z",
    "customer": {
      "id": "uuid-do-cliente",
      "name": null,
      "companyName": "CLIENTE ABC LTDA",
      "cnpj": "12345678000100"
    },
    "items": [
      {
        "id": "uuid-sale-item-1",
        "productId": "uuid-produto-1",
        "productCode": "PROD001",
        "productName": "PRODUTO TESTE",
        "quantity": 10,
        "unitPrice": 150.00,
        "total": 1500.00,
        "product": {
          "id": "uuid-produto-1",
          "name": "PRODUTO TESTE",
          "sku": "PROD001",
          "ncm": "85044010",
          "cfopEstadual": "5102"
        }
      }
    ]
  },
  "customer": {
    "id": "uuid-do-cliente",
    "companyId": "uuid-da-empresa",
    "personType": "JURIDICA",
    "name": null,
    "companyName": "CLIENTE ABC LTDA",
    "cnpj": "12345678000100",
    "stateRegistration": "123456789",
    "email": "contato@clienteabc.com.br",
    "phone": "1199998888",
    "mobile": "11988887777",
    "active": true
  },
  "items": [
    {
      "id": "uuid-nfe-item-1",
      "nfeId": "uuid-da-nfe",
      "numero": 1,
      "productId": "uuid-produto-1",
      "codigoProduto": "PROD001",
      "codigoEAN": "SEM GTIN",
      "codigoEANTrib": "SEM GTIN",
      "descricao": "PRODUTO TESTE",
      "ncm": "85044010",
      "cest": null,
      "cfop": "5102",
      "unidadeComercial": "UN",
      "quantidadeComercial": 10.0,
      "valorUnitarioComercial": 150.00,
      "unidadeTributavel": "UN",
      "quantidadeTributavel": 10.0,
      "valorUnitarioTributavel": 150.00,
      "valorProduto": 1500.00,
      "valorDesconto": 0.00,
      "valorFrete": 0.00,
      "valorSeguro": 0.00,
      "valorOutros": 0.00,
      "indicadorTotal": 1,
      "icmsOrigem": 0,
      "icmsCst": "00",
      "icmsCSOSN": null,
      "icmsModalidadeBC": 3,
      "icmsBase": 1500.00,
      "icmsAliquota": 18.00,
      "icmsValor": 270.00,
      "icmsFCPBase": null,
      "icmsFCPAliquota": null,
      "icmsFCPValor": null,
      "icmsStModalidadeBC": null,
      "icmsStBase": null,
      "icmsStAliquota": null,
      "icmsStValor": null,
      "icmsStMVA": null,
      "icmsStReducaoBC": null,
      "icmsUFDestBase": null,
      "icmsUFDestAliquota": null,
      "icmsUFDestValor": null,
      "icmsUFRemetAliquota": null,
      "icmsUFRemetValor": null,
      "ipiCst": null,
      "ipiBase": null,
      "ipiAliquota": null,
      "ipiValor": null,
      "iiBase": null,
      "iiDespAdu": null,
      "iiValor": null,
      "iiIOF": null,
      "pisCst": "01",
      "pisBase": 1500.00,
      "pisAliquota": 1.65,
      "pisValor": 24.75,
      "pisQuantidade": null,
      "pisAliqValor": null,
      "cofinsCst": "01",
      "cofinsBase": 1500.00,
      "cofinsAliquota": 7.60,
      "cofinsValor": 114.00,
      "cofinsQuantidade": null,
      "cofinsAliqValor": null,
      "ibsCbsCst": null,
      "ibsCbsClassTrib": null,
      "ibsBase": null,
      "ibsUFAliquota": null,
      "ibsUFValor": null,
      "ibsMunAliquota": null,
      "ibsMunValor": null,
      "ibsValor": null,
      "cbsAliquota": null,
      "cbsValor": null,
      "informacoesAdicionais": null,
      "createdAt": "2025-11-16T09:00:00.000Z",
      "updatedAt": "2025-11-16T09:00:00.000Z",
      "product": {
        "id": "uuid-produto-1",
        "name": "PRODUTO TESTE",
        "sku": "PROD001",
        "barcode": null,
        "ncm": "85044010",
        "cfopEstadual": "5102"
      }
    }
  ],
  "events": [
    {
      "id": "uuid-event-1",
      "nfeId": "uuid-da-nfe",
      "tipo": "CONFIRMACAO_OPERACAO",
      "sequencia": 1,
      "descricao": "NFe autorizada pela SEFAZ",
      "justificativa": null,
      "protocolo": "135251234567890",
      "dataEvento": "2025-11-16T10:31:00.000Z",
      "xmlEnviado": null,
      "xmlRetorno": null,
      "status": "PROCESSADO",
      "createdAt": "2025-11-16T10:31:00.000Z"
    }
  ]
}
```

### Erros Possíveis

```json
// 404 - NFe não encontrada
{
  "statusCode": 404,
  "message": "NFe não encontrada",
  "error": "Not Found"
}
```

---

## 6. Atualizar NFe

Atualiza uma NFe (apenas se estiver em rascunho).

### Request

```http
PUT /nfe/{id}
```

### Payload

```json
{
  "observacoes": "Observação atualizada",
  "informacoesComplementares": "Informações complementares atualizadas",
  "valorDesconto": 50.00,
  "valorTotal": 1162.00
}
```

### Response (200 OK)

```json
{
  "id": "uuid-da-nfe",
  "numero": 254,
  "status": "DRAFT",
  "observacoes": "Observação atualizada",
  "informacoesComplementares": "Informações complementares atualizadas",
  "valorDesconto": 50.00,
  "valorTotal": 1162.00,
  "updatedAt": "2025-11-16T20:30:00.000Z",
  /* ... demais campos */
}
```

### Erros Possíveis

```json
// 400 - Apenas NFes em rascunho podem ser editadas
{
  "statusCode": 400,
  "message": "Apenas NFes em rascunho podem ser editadas",
  "error": "Bad Request"
}
```

---

## 7. Deletar NFe

Remove uma NFe (apenas se estiver em rascunho).

### Request

```http
DELETE /nfe/{id}
```

### Response (200 OK)

```json
{
  "message": "NFe deletada com sucesso"
}
```

### Erros Possíveis

```json
// 400 - Apenas NFes em rascunho podem ser deletadas
{
  "statusCode": 400,
  "message": "Apenas NFes em rascunho podem ser deletadas",
  "error": "Bad Request"
}
```

---

## 8. Emitir NFe

Emite uma NFe (envia para SEFAZ).

**⚠️ NOTA:** Funcionalidade ainda não implementada. Apenas muda o status para `IN_PROCESS`.

### Request

```http
POST /nfe/{id}/emitir
```

### Response (200 OK)

```json
{
  "message": "NFe enviada para processamento (funcionalidade de emissão ainda não implementada)",
  "nfe": {
    "id": "uuid-da-nfe",
    "numero": 254,
    "serie": "1",
    "status": "IN_PROCESS",
    "dataEmissao": "2025-11-16T20:45:00.000Z",
    "updatedAt": "2025-11-16T20:45:00.000Z",
    /* ... demais campos */
  }
}
```

### Erros Possíveis

```json
// 400 - Apenas NFes em rascunho podem ser emitidas
{
  "statusCode": 400,
  "message": "Apenas NFes em rascunho podem ser emitidas",
  "error": "Bad Request"
}
```

### Implementação Futura

Quando implementado, o endpoint irá:
1. Validar certificado digital da empresa
2. Gerar XML da NFe conforme leiaute 4.0
3. Assinar digitalmente o XML
4. Enviar para webservice da SEFAZ
5. Processar retorno (autorização/rejeição)
6. Gerar chave de acesso de 44 dígitos
7. Salvar protocolo de autorização
8. Atualizar status para `AUTHORIZED` ou `REJECTED`

---

## 9. Cancelar NFe

Cancela uma NFe autorizada.

**⚠️ NOTA:** Funcionalidade ainda não implementada. Apenas muda o status para `CANCELED`.

### Request

```http
POST /nfe/{id}/cancelar
```

### Payload

```json
{
  "motivoCancelamento": "Cliente solicitou cancelamento devido a erro no pedido"
}
```

**Validação:** O motivo deve ter no mínimo 15 e no máximo 255 caracteres.

### Response (200 OK)

```json
{
  "message": "NFe cancelada (funcionalidade de cancelamento na SEFAZ ainda não implementada)",
  "nfe": {
    "id": "uuid-da-nfe",
    "numero": 254,
    "serie": "1",
    "status": "CANCELED",
    "canceladaEm": "2025-11-16T21:00:00.000Z",
    "motivoCancelamento": "Cliente solicitou cancelamento devido a erro no pedido",
    "updatedAt": "2025-11-16T21:00:00.000Z",
    /* ... demais campos */,
    "events": [
      {
        "id": "uuid-event-cancel",
        "nfeId": "uuid-da-nfe",
        "tipo": "CANCELAMENTO",
        "sequencia": 1,
        "descricao": "Cancelamento de NFe",
        "justificativa": "Cliente solicitou cancelamento devido a erro no pedido",
        "status": "PENDENTE",
        "dataEvento": "2025-11-16T21:00:00.000Z",
        "createdAt": "2025-11-16T21:00:00.000Z"
      }
    ]
  }
}
```

### Erros Possíveis

```json
// 400 - Apenas NFes autorizadas podem ser canceladas
{
  "statusCode": 400,
  "message": "Apenas NFes autorizadas podem ser canceladas",
  "error": "Bad Request"
}

// 400 - Prazo para cancelamento excedido
{
  "statusCode": 400,
  "message": "Prazo para cancelamento excedido (24 horas)",
  "error": "Bad Request"
}

// 400 - Motivo muito curto
{
  "statusCode": 400,
  "message": [
    "O motivo do cancelamento deve ter no mínimo 15 caracteres"
  ],
  "error": "Bad Request"
}
```

### Implementação Futura

Quando implementado, o endpoint irá:
1. Validar certificado digital
2. Gerar XML do evento de cancelamento
3. Assinar digitalmente
4. Enviar para SEFAZ
5. Processar retorno
6. Salvar protocolo de cancelamento
7. Criar evento de cancelamento

---

## 10. Gerar DANFE

Gera o DANFE (Documento Auxiliar da Nota Fiscal Eletrônica) em PDF.

**⚠️ NOTA:** Funcionalidade ainda não implementada.

### Request

```http
GET /nfe/{id}/danfe
```

### Response (200 OK)

```json
{
  "message": "Geração de DANFE ainda não implementada",
  "nfe": {
    "id": "uuid-da-nfe",
    "numero": 254,
    "serie": "1",
    "chaveAcesso": "35251112345678000100550010002540001234567890"
  }
}
```

### Implementação Futura

Quando implementado, o endpoint irá:
1. Validar se a NFe foi emitida
2. Gerar PDF do DANFE usando biblioteca `node-sped-pdf`
3. Incluir código de barras da chave de acesso
4. Incluir QR Code (para NFC-e)
5. Salvar arquivo PDF
6. Retornar o PDF como download

**Response esperado:**
```http
HTTP/1.1 200 OK
Content-Type: application/pdf
Content-Disposition: attachment; filename="DANFE-35251112345678000100550010002540001234567890.pdf"

[conteúdo do PDF]
```

---

## 11. Baixar XML

Baixa o XML autorizado da NFe.

**⚠️ NOTA:** Funcionalidade ainda não implementada.

### Request

```http
GET /nfe/{id}/xml
```

### Response (200 OK)

```json
{
  "xml": "<nfeProc xmlns=\"http://www.portalfiscal.inf.br/nfe\">...</nfeProc>",
  "filename": "NFe-35251112345678000100550010002540001234567890.xml"
}
```

### Erros Possíveis

```json
// 404 - XML não disponível
{
  "statusCode": 404,
  "message": "XML autorizado não disponível",
  "error": "Not Found"
}
```

### Implementação Futura

**Response esperado:**
```http
HTTP/1.1 200 OK
Content-Type: application/xml
Content-Disposition: attachment; filename="NFe-35251112345678000100550010002540001234567890.xml"

<?xml version="1.0" encoding="UTF-8"?>
<nfeProc xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">
  <!-- conteúdo do XML -->
</nfeProc>
```

---

## 12. Consultar Status

Consulta o status de uma NFe na SEFAZ.

**⚠️ NOTA:** Funcionalidade ainda não implementada.

### Request

```http
GET /nfe/{id}/status
```

### Response (200 OK)

```json
{
  "message": "Consulta de status na SEFAZ ainda não implementada",
  "nfe": {
    "id": "uuid-da-nfe",
    "status": "AUTHORIZED",
    "chaveAcesso": "35251112345678000100550010002540001234567890"
  }
}
```

### Implementação Futura

Quando implementado, o endpoint irá:
1. Validar certificado digital
2. Fazer requisição SOAP para consulta
3. Processar retorno da SEFAZ
4. Retornar status atualizado

**Response esperado:**
```json
{
  "chaveAcesso": "35251112345678000100550010002540001234567890",
  "status": "AUTHORIZED",
  "protocolo": "135251234567890",
  "dataAutorizacao": "2025-11-16T10:31:00.000Z",
  "situacao": "100 - Autorizado o uso da NF-e",
  "xmlRetorno": "<retConsSitNFe>...</retConsSitNFe>"
}
```

---

## Códigos de Status HTTP

| Código | Descrição |
|--------|-----------|
| 200 | OK - Requisição bem sucedida |
| 201 | Created - Recurso criado com sucesso |
| 400 | Bad Request - Dados inválidos ou violação de regra de negócio |
| 401 | Unauthorized - Token inválido ou ausente |
| 403 | Forbidden - Sem permissão para acessar o recurso |
| 404 | Not Found - Recurso não encontrado |
| 409 | Conflict - Conflito (ex: NFe duplicada) |
| 500 | Internal Server Error - Erro interno do servidor |

---

## Modelos de Dados

### NFeStatus (Enum)

```typescript
enum NFeStatus {
  DRAFT = "DRAFT",           // Rascunho (não emitida)
  IN_PROCESS = "IN_PROCESS", // Em processamento
  AUTHORIZED = "AUTHORIZED", // Autorizada
  REJECTED = "REJECTED",     // Rejeitada
  CANCELED = "CANCELED",     // Cancelada
  DENIED = "DENIED",         // Denegada
  CONTINGENCY = "CONTINGENCY" // Em contingência
}
```

### NFeEventType (Enum)

```typescript
enum NFeEventType {
  CANCELAMENTO = "CANCELAMENTO",
  CARTA_CORRECAO = "CARTA_CORRECAO",
  CONFIRMACAO_OPERACAO = "CONFIRMACAO_OPERACAO",
  CIENCIA_OPERACAO = "CIENCIA_OPERACAO",
  DESCONHECIMENTO_OPERACAO = "DESCONHECIMENTO_OPERACAO",
  OPERACAO_NAO_REALIZADA = "OPERACAO_NAO_REALIZADA"
}
```

### Modalidade de Frete

```typescript
0 - Por conta do emitente
1 - Por conta do destinatário
2 - Por conta de terceiros
3 - Transporte próprio por conta do emitente
4 - Transporte próprio por conta do destinatário
9 - Sem ocorrência de transporte
```

### Indicador de Presença

```typescript
0 - Não se aplica
1 - Operação presencial
2 - Operação não presencial, pela Internet
3 - Operação não presencial, Teleatendimento
4 - NFC-e em operação com entrega a domicílio
5 - Operação presencial, fora do estabelecimento
9 - Operação não presencial, outros
```

### Meio de Pagamento

```typescript
01 - Dinheiro
02 - Cheque
03 - Cartão de Crédito
04 - Cartão de Débito
05 - Crédito Loja
10 - Vale Alimentação
11 - Vale Refeição
12 - Vale Presente
13 - Vale Combustível
14 - Duplicata Mercantil
15 - Boleto Bancário
16 - Depósito Bancário
17 - PIX
18 - Transferência Bancária
19 - Cashback
90 - Sem Pagamento
99 - Outros
```

### Indicador IE Destinatário

```typescript
1 - Contribuinte ICMS
2 - Contribuinte isento de Inscrição no cadastro de Contribuintes
9 - Não Contribuinte
```

---

## Observações Importantes

### Campos Obrigatórios para Emissão Real

Quando a emissão para SEFAZ for implementada, os seguintes campos serão obrigatórios:

**Empresa (Company):**
- ✅ `certificadoDigitalPath` - Caminho do certificado .pfx
- ✅ `certificadoDigitalSenha` - Senha do certificado
- ✅ `codigoMunicipioIBGE` - Código IBGE do município
- ✅ `respTecCNPJ`, `respTecContato`, `respTecEmail`, `respTecFone`

**NFe:**
- ✅ Todos os dados do destinatário
- ✅ Pelo menos 1 item
- ✅ Todos os tributos calculados
- ✅ Natureza da operação
- ✅ CFOP de cada item
- ✅ NCM de cada item

### Validações de Negócio

1. **Criação:**
   - Empresa deve existir e estar ativa
   - Cliente deve pertencer à empresa (se fornecido)
   - Venda deve pertencer à empresa (se fornecida)
   - Número da NFe é incrementado automaticamente

2. **Edição:**
   - Apenas NFes em status `DRAFT` podem ser editadas
   - Apenas NFes em status `DRAFT` podem ser deletadas

3. **Emissão:**
   - Apenas NFes em status `DRAFT` podem ser emitidas
   - Certificado digital deve estar configurado
   - Todos os campos obrigatórios devem estar preenchidos

4. **Cancelamento:**
   - Apenas NFes em status `AUTHORIZED` podem ser canceladas
   - Prazo máximo de 24 horas após autorização
   - Motivo deve ter entre 15 e 255 caracteres

---

## Exemplos de Integração

### JavaScript/TypeScript (Fetch API)

```typescript
// Criar NFe de venda
const response = await fetch('http://localhost:3000/nfe/from-sale', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'X-Company-Id': companyId,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    saleId: 'uuid-da-venda',
    serie: '1',
    naturezaOperacao: 'VENDA',
    modalidadeFrete: 9
  })
});

const nfe = await response.json();
console.log('NFe criada:', nfe.numero);
```

### React Query

```typescript
import { useMutation, useQuery } from '@tanstack/react-query';

// Listar NFes
const { data: nfes, isLoading } = useQuery({
  queryKey: ['nfes', { status: 'DRAFT', page: 1 }],
  queryFn: async () => {
    const response = await fetch('/nfe?status=DRAFT&page=1', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Company-Id': companyId
      }
    });
    return response.json();
  }
});

// Emitir NFe
const emitirMutation = useMutation({
  mutationFn: async (nfeId: string) => {
    const response = await fetch(`/nfe/${nfeId}/emitir`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Company-Id': companyId
      }
    });
    return response.json();
  },
  onSuccess: () => {
    // Atualizar lista de NFes
    queryClient.invalidateQueries(['nfes']);
  }
});
```

---

**Versão:** 1.0  
**Data:** 16/11/2025  
**Status:** Documentação completa - Emissão SEFAZ pendente
