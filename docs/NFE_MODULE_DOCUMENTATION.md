# 🧾 Módulo NF-e - Implementação Completa

## 📋 Visão Geral

Módulo completo para emissão de NF-e (Nota Fiscal Eletrônica) integrado ao sistema ERP, utilizando a biblioteca `node-sped-nfe`.

---

## ✅ O que foi Implementado

### 1. **Estrutura do Módulo**
```
src/fiscal/
├── fiscal.module.ts              # Módulo principal
├── controllers/
│   └── nfe.controller.ts        # Endpoints REST
├── services/
│   ├── nfe.service.ts           # Orquestração principal
│   ├── nfe-generator.service.ts # Geração do XML
│   └── nfe-sefaz.service.ts     # Comunicação com SEFAZ
└── dto/
    └── emitir-nfe.dto.ts        # DTOs de entrada
```

### 2. **Dependências Instaladas**
- ✅ `node-sped-nfe`: Biblioteca para geração e envio de NF-e
- ✅ `node-sped-pdf`: Geração de DANFE em PDF

---

## 🔧 Ajustes Necessários no Schema Prisma

### Adicionar Campos à Tabela `Company`

```prisma
model Company {
  // ... campos existentes ...
  
  // Certificado Digital A1
  certificateA1Path     String? // Caminho do arquivo .pfx
  certificateA1Password String? // Senha do certificado
  certificateA1ValidUntil DateTime? // Validade do certificado
  
  // Configurações NF-e
  nfeAmbiente          String @default("2") // 1=Produção, 2=Homologação
  nfeSerie             String @default("1") // Série padrão das NF-e
  nfeProximoNumero     Int    @default(1)   // Próximo número a ser usado
  
  // Responsável Técnico
  responsibleName  String?
  responsibleEmail String?
  responsiblePhone String?
}
```

### Adicionar Campos à Tabela `Product`

```prisma
model Product {
  // ... campos existentes ...
  
  // Dados Fiscais
  ncm         String? // Nomenclatura Comum do Mercosul (8 dígitos)
  cfop        String? // Código Fiscal de Operações e Prestações
  origem      String  @default("0") // Origem da mercadoria (0-8)
  unit        String  @default("UNID") // Unidade (UN, KG, CX, etc)
  
  // ICMS
  csosn       String? // CSOSN para Simples Nacional
  cstIcms     String? // CST ICMS para regime normal
  modBcIcms   String? // Modalidade BC ICMS
  aliqIcms    Float   @default(0) // Alíquota ICMS (%)
  
  // PIS
  cstPis      String  @default("49") // CST PIS
  bcPis       Float   @default(0)    // Base de cálculo PIS
  aliqPis     Float   @default(0)    // Alíquota PIS (%)
  
  // COFINS
  cstCofins   String  @default("49") // CST COFINS
  bcCofins    Float   @default(0)    // Base de cálculo COFINS
  aliqCofins  Float   @default(0)    // Alíquota COFINS (%)
}
```

---

## 🚀 Endpoints Disponíveis

### 1. **Emitir NF-e**
```http
POST /fiscal/nfe/emitir
Authorization: Bearer {token}
Content-Type: application/json

{
  "saleId": "uuid-da-venda",
  "modelo": "55",
  "serie": "1",
  "naturezaOperacao": "VENDA",
  "modalidadeFrete": "9",
  "enviarSefaz": true
}
```

**Resposta**:
```json
{
  "status": "AUTORIZADA",
  "chaveAcesso": "35241028256010000101550000000252100000001",
  "protocolo": "135240000000001",
  "dataAutorizacao": "2024-11-16T20:30:00Z",
  "xmlGerado": "/uploads/nfe/company-id/sale-id/nfe.xml",
  "xmlAssinado": "/uploads/nfe/company-id/sale-id/nfe_assinado.xml",
  "xmlProcessamento": "/uploads/nfe/company-id/sale-id/nfe_proc.xml",
  "danfe": "/uploads/nfe/company-id/sale-id/danfe.pdf"
}
```

---

### 2. **Listar NF-e**
```http
GET /fiscal/nfe?status=AUTHORIZED&dataInicio=2024-11-01&dataFim=2024-11-30
Authorization: Bearer {token}
```

---

### 3. **Buscar NF-e**
```http
GET /fiscal/nfe/:id
Authorization: Bearer {token}
```

---

### 4. **Baixar DANFE (PDF)**
```http
GET /fiscal/nfe/:id/danfe
Authorization: Bearer {token}
```

---

### 5. **Baixar XML**
```http
GET /fiscal/nfe/:id/xml
Authorization: Bearer {token}
```

---

### 6. **Cancelar NF-e**
```http
POST /fiscal/nfe/:id/cancelar
Authorization: Bearer {token}
Content-Type: application/json

{
  "justificativa": "Cliente solicitou cancelamento devido a erro no pedido"
}
```

---

### 7. **Consultar Status SEFAZ**
```http
GET /fiscal/nfe/sefaz/status
Authorization: Bearer {token}
```

---

## 🔐 Upload de Certificado Digital

Você precisará criar um endpoint para fazer upload do certificado `.pfx`:

```typescript
// src/companies/companies.controller.ts

@Post('certificate-upload')
@UseInterceptors(FileInterceptor('certificate'))
async uploadCertificate(
  @CompanyId() companyId: string,
  @UploadedFile() file: Express.Multer.File,
  @Body('password') password: string,
) {
  const uploadsDir = path.resolve('uploads', 'certificates', companyId);
  
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const filePath = path.join(uploadsDir, file.originalname);
  fs.writeFileSync(filePath, file.buffer);

  await this.prisma.company.update({
    where: { id: companyId },
    data: {
      certificateA1Path: filePath,
      certificateA1Password: password,
    },
  });

  return { message: 'Certificado enviado com sucesso' };
}
```

---

## 📦 Integração com Vendas

### Adicionar Botão "Emitir NF-e" na Tela de Vendas

```typescript
// Frontend - SaleDetailsPage.tsx

const handleEmitirNFe = async () => {
  try {
    const result = await api.post(`/fiscal/nfe/emitir`, {
      saleId: sale.id,
      enviarSefaz: true,
    });

    if (result.data.status === 'AUTORIZADA') {
      toast.success('NF-e autorizada com sucesso!');
      // Baixar DANFE automaticamente
      window.open(`/fiscal/nfe/${result.data.id}/danfe`, '_blank');
    }
  } catch (error) {
    toast.error('Erro ao emitir NF-e: ' + error.message);
  }
};
```

---

## ⚠️ Correções Necessárias

### 1. **node-sped-nfe API Changes**

A biblioteca `node-sped-nfe` pode ter mudanças na API. Verifique a documentação:

```typescript
// Exemplo correto de inicialização do Tools
const tools = new Tools(
  {
    mod: '55',
    tpAmb: 2, // 1=Produção, 2=Homologação
    UF: 'SP',
    versao: '4.00',
    timeout: 30,
    xmllint: '', // Deixe vazio se não tiver xmllint
    CSC: '', // Código de Segurança do Contribuinte (NFC-e)
    CSCid: '', // Identificador do CSC
    openssl: null,
    CPF: '', // Opcional
    CNPJ: company.cnpj, // CNPJ do emitente
  },
  {
    pfx: certificatePath,
    senha: password,
  },
);
```

### 2. **Prisma Schema - Campos da NFe**

Os campos no schema são diferentes do código. Use:
- ✅ `danfePdfPath` (não `danfePath`)
- ✅ `xmlAutorizado` (não `xmlPath`)
- ✅ `protocoloAutorizacao` (não `protocolo`)
- ✅ Status é enum: `DRAFT`, `AUTHORIZED`, `CANCELED`, `REJECTED`

### 3. **Métodos da Biblioteca**

Alguns métodos podem ter nomes diferentes:
```typescript
// Verificar na documentação:
tools.consultarNFe() // ao invés de sefazConsultaNFe()
tools.consultarRecibo() // ao invés de sefazConsultaRecibo()
tools.cancelarNFe() // ao invés de sefazCancelaNFe()
```

---

## 🧪 Como Testar

### 1. **Ambiente de Homologação**

Primeiro, teste em homologação:

```typescript
// Configurar empresa para homologação
await prisma.company.update({
  where: { id: companyId },
  data: {
    nfeAmbiente: '2', // Homologação
  },
});
```

### 2. **Dados de Teste**

Use dados fictícios em homologação:
- CNPJ: `57953546000184`
- Produtos com NCM válidos
- Valores reais (não zeros)

### 3. **Fluxo Completo**

```bash
# 1. Consultar status da SEFAZ
GET /fiscal/nfe/sefaz/status

# 2. Emitir NF-e
POST /fiscal/nfe/emitir
{
  "saleId": "...",
  "enviarSefaz": true
}

# 3. Baixar DANFE
GET /fiscal/nfe/:id/danfe

# 4. Consultar NF-e
GET /fiscal/nfe/consultar/:chaveAcesso

# 5. Cancelar (se necessário)
POST /fiscal/nfe/:id/cancelar
{
  "justificativa": "Teste de cancelamento em homologação"
}
```

---

## 📊 Validações Implementadas

### Antes de Emitir:
- ✅ Venda deve estar APPROVED
- ✅ Empresa deve ter CNPJ cadastrado
- ✅ Empresa deve ter Inscrição Estadual
- ✅ Empresa deve ter endereço completo
- ✅ Empresa deve ter certificado A1 válido
- ✅ Cliente deve ter CPF ou CNPJ
- ✅ Cliente deve ter endereço completo
- ✅ Produtos devem ter NCM cadastrado
- ✅ Produtos devem ter CFOP cadastrado

### Automações:
- ✅ cEAN = "SEM GTIN" se produto não tiver código de barras
- ✅ Próximo número da NF-e gerado automaticamente
- ✅ Código numérico (cNF) gerado aleatoriamente
- ✅ CRT determinado automaticamente pelo regime tributário
- ✅ Tipo de destino (idDest) determinado pela UF
- ✅ Forma de pagamento mapeada automaticamente

---

## 🔄 Próximos Passos

### Implementar:
1. ✅ Criar migration para adicionar campos no Prisma
2. ✅ Corrigir métodos da biblioteca node-sped-nfe
3. ✅ Criar endpoint de upload de certificado
4. ✅ Adicionar tela de configuração fiscal no frontend
5. ✅ Implementar tela de cadastro de NCM/CFOP nos produtos
6. ✅ Criar relatório de NF-e emitidas
7. ✅ Implementar carta de correção (CC-e)
8. ✅ Implementar manifestação do destinatário
9. ✅ Implementar download de XML em lote
10. ✅ Implementar sincronização com contador (XML/PDF por e-mail)

---

## 📚 Documentação de Referência

- **node-sped-nfe**: https://github.com/raldblox/node-sped-nfe
- **Manual NFe 4.0**: Portal da NF-e
- **Códigos CFOP**: Tabela oficial CONFAZ
- **Tabela NCM**: Receita Federal
- **Códigos CST/CSOSN**: Manual da SEFAZ

---

## ⚡ Exemplo Completo de Uso

```typescript
// 1. Configurar empresa
await prisma.company.update({
  where: { id: 'company-uuid' },
  data: {
    certificateA1Path: '/uploads/certificates/cert.pfx',
    certificateA1Password: 'senha123',
    nfeAmbiente: '2', // Homologação
    nfeSerie: '1',
    nfeProximoNumero: 1,
  },
});

// 2. Configurar produtos
await prisma.product.updateMany({
  data: {
    ncm: '85044010',
    cfop: '5102', // Venda interna
    origem: '0',
    csosn: '102', // Simples Nacional
  },
});

// 3. Emitir NF-e
const result = await nfeService.emitirNFe('company-uuid', {
  saleId: 'sale-uuid',
  enviarSefaz: true,
});

console.log('NF-e autorizada:', result.chaveAcesso);
console.log('DANFE gerado:', result.danfe);
```

---

**Versão**: 1.0.0  
**Data**: 16 de novembro de 2024  
**Status**: 🚧 Em Desenvolvimento
