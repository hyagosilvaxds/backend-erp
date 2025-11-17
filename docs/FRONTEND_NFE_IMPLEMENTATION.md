# 📄 Guia de Implementação Frontend - NF-e e DANFE

## Visão Geral

Este documento descreve como integrar o sistema de emissão de NF-e (Nota Fiscal Eletrônica) e geração de DANFE no frontend.

---

## 📋 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Fluxo Completo](#fluxo-completo)
3. [Configuração da Empresa](#1-configuração-da-empresa)
4. [Upload de Certificado Digital](#2-upload-de-certificado-digital)
5. [Configuração de Produtos](#3-configuração-de-produtos)
6. [Emissão de NF-e](#4-emissão-de-nf-e)
7. [Consulta e Download](#5-consulta-e-download)
8. [Status e Monitoramento](#6-status-e-monitoramento)
9. [Cancelamento](#7-cancelamento)
10. [Tratamento de Erros](#8-tratamento-de-erros)
11. [Componentes Sugeridos](#componentes-sugeridos)
12. [Exemplos de Código](#exemplos-de-código)

---

## Pré-requisitos

### Backend
- ✅ Módulo Fiscal implementado
- ✅ Sistema de criptografia configurado
- ✅ Variável `ENCRYPTION_KEY` no `.env`

### Dados Necessários
- ✅ Empresa configurada com dados fiscais
- ✅ Certificado A1 (.pfx) válido
- ✅ Produtos com NCM, CFOP e CST cadastrados
- ✅ Venda aprovada com cliente e endereço

---

## Fluxo Completo

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUXO DE EMISSÃO NF-e                     │
└─────────────────────────────────────────────────────────────┘

1. CONFIGURAÇÃO INICIAL (uma única vez)
   ├─ Configurar dados fiscais da empresa
   ├─ Upload certificado A1 + senha
   └─ Configurar produtos (NCM, CFOP, CST)

2. VENDA
   ├─ Criar venda normal
   ├─ Aprovar venda (POST /sales/{id}/approve)
   └─ Verificar status: APPROVED

3. EMISSÃO NF-e
   ├─ Clicar em "Emitir NF-e" na venda
   ├─ POST /fiscal/nfe/emitir
   ├─ Aguardar processamento (XML + Assinatura + SEFAZ)
   └─ Receber: status, chave de acesso, protocolo

4. CONSULTA E DOWNLOAD
   ├─ GET /fiscal/nfe (listar todas)
   ├─ GET /fiscal/nfe/{id}/danfe (baixar PDF)
   └─ GET /fiscal/nfe/{id}/xml (baixar XML)

5. CANCELAMENTO (se necessário)
   └─ POST /fiscal/nfe/{id}/cancelar
```

---

## 1. Configuração da Empresa

### Endpoint: Atualizar Dados Fiscais
```http
PUT /companies/{companyId}
Authorization: Bearer {admin-token}
Content-Type: application/json
```

### Request Body
```json
{
  "razaoSocial": "EMPRESA EXEMPLO LTDA",
  "nomeFantasia": "Empresa Exemplo",
  "cnpj": "12345678000190",
  "inscricaoEstadual": "123456789",
  "regimeTributario": "SIMPLES NACIONAL",
  
  // Endereço da empresa
  "logradouro": "Rua Exemplo",
  "numero": "123",
  "complemento": "Sala 01",
  "bairro": "Centro",
  "cidade": "São Paulo",
  "estado": "SP",
  "cep": "01234567",
  "codigoMunicipioIBGE": "3550308",
  
  // Configurações NF-e
  "nfeAmbiente": "2",  // "1" = Produção, "2" = Homologação
  "serieNFe": "1",
  "proximoNumeroNFe": 1,
  
  // Responsável Técnico (opcional)
  "respTecCNPJ": "12345678000190",
  "respTecContato": "Nome do Responsável",
  "respTecEmail": "suporte@empresa.com.br",
  "respTecFone": "11999999999",
  
  // Contatos
  "telefone": "1133334444",
  "celular": "11999998888",
  "email": "contato@empresa.com.br"
}
```

### Response
```json
{
  "id": "uuid-empresa",
  "razaoSocial": "EMPRESA EXEMPLO LTDA",
  "cnpj": "12345678000190",
  "nfeAmbiente": "2",
  "hasCertificate": false,
  ...
}
```

### UI Sugerida
```tsx
// Componente: CompanyFiscalSettings.tsx
const CompanyFiscalSettings = () => {
  return (
    <Form>
      <Section title="Dados da Empresa">
        <Input label="Razão Social" required />
        <Input label="Nome Fantasia" />
        <Input label="CNPJ" mask="99.999.999/9999-99" required />
        <Input label="Inscrição Estadual" required />
        <Select label="Regime Tributário" required>
          <option>SIMPLES NACIONAL</option>
          <option>LUCRO PRESUMIDO</option>
          <option>LUCRO REAL</option>
        </Select>
      </Section>

      <Section title="Endereço">
        <Input label="CEP" mask="99999-999" />
        <Input label="Logradouro" />
        <Input label="Número" />
        <Input label="Bairro" />
        <Input label="Cidade" />
        <Select label="Estado" />
        <Input label="Código IBGE do Município" />
      </Section>

      <Section title="Configurações NF-e">
        <Select label="Ambiente SEFAZ" required>
          <option value="2">Homologação</option>
          <option value="1">Produção</option>
        </Select>
        <Input label="Série da NF-e" defaultValue="1" />
        <Input label="Próximo Número" type="number" defaultValue="1" />
      </Section>

      <Section title="Responsável Técnico (Opcional)">
        <Input label="CNPJ" mask="99.999.999/9999-99" />
        <Input label="Nome do Contato" />
        <Input label="E-mail" type="email" />
        <Input label="Telefone" mask="(99) 99999-9999" />
      </Section>

      <Button type="submit">Salvar Configurações</Button>
    </Form>
  );
};
```

---

## 2. Upload de Certificado Digital

### Endpoint: Upload Certificado A1
```http
POST /companies/{companyId}/certificate
Authorization: Bearer {admin-token}
Content-Type: multipart/form-data
```

### Request Body (FormData)
```javascript
const formData = new FormData();
formData.append('certificate', certificateFile); // Arquivo .pfx
formData.append('senha', 'senha-do-certificado');
```

### Response
```json
{
  "id": "uuid-empresa",
  "razaoSocial": "EMPRESA EXEMPLO LTDA",
  "hasCertificate": true,
  "certificadoDigitalValidoAte": "2026-12-31T23:59:59.000Z"
}
```

### Endpoint: Remover Certificado
```http
DELETE /companies/{companyId}/certificate
Authorization: Bearer {admin-token}
```

### UI Sugerida
```tsx
// Componente: CertificateUpload.tsx
const CertificateUpload = ({ companyId }) => {
  const [certificate, setCertificate] = useState(null);
  const [password, setPassword] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    setUploading(true);
    
    const formData = new FormData();
    formData.append('certificate', certificate);
    formData.append('senha', password);

    try {
      const response = await api.post(
        `/companies/${companyId}/certificate`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );

      toast.success('Certificado enviado com sucesso!');
      setPassword(''); // Limpar senha
    } catch (error) {
      toast.error('Erro ao enviar certificado');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <Title>Certificado Digital A1</Title>
        {hasCertificate && (
          <Badge color="green">
            ✓ Certificado cadastrado
          </Badge>
        )}
      </CardHeader>

      <CardBody>
        {hasCertificate ? (
          <>
            <Alert type="success">
              Certificado válido até: {formatDate(validoAte)}
            </Alert>
            <Button 
              variant="danger" 
              onClick={handleRemoveCertificate}
            >
              Remover Certificado
            </Button>
          </>
        ) : (
          <>
            <Alert type="warning">
              É necessário um certificado A1 (.pfx) para emitir NF-e
            </Alert>
            
            <FileInput
              label="Arquivo do Certificado (.pfx)"
              accept=".pfx"
              onChange={(file) => setCertificate(file)}
            />
            
            <PasswordInput
              label="Senha do Certificado"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite a senha do certificado"
            />
            
            <Button
              onClick={handleUpload}
              disabled={!certificate || !password || uploading}
              loading={uploading}
            >
              Enviar Certificado
            </Button>
          </>
        )}
      </CardBody>
    </Card>
  );
};
```

---

## 3. Configuração de Produtos

### Campos Fiscais Necessários

Os produtos precisam ter os seguintes campos cadastrados:

```typescript
interface ProductFiscalData {
  // Classificação Fiscal
  ncm: string;              // NCM (8 dígitos) - OBRIGATÓRIO
  cest?: string;            // CEST (7 dígitos) - Opcional
  
  // CFOP
  cfop?: string;            // CFOP padrão (4 dígitos)
  cfopEstadual?: string;    // CFOP para venda dentro do estado
  cfopInterestadual?: string; // CFOP para venda fora do estado
  
  // Origem da Mercadoria
  origin?: string;          // 0-8 (Nacional, Estrangeira, etc)
  origem?: string;          // Alias de origin
  
  // ICMS
  icmsCst?: string;         // CST do ICMS (00, 10, 20, etc)
  cstIcms?: string;         // Alias de icmsCst
  icmsRate?: number;        // Alíquota do ICMS (%)
  aliqIcms?: number;        // Alias de icmsRate
  icmsModBc?: string;       // Modalidade BC ICMS
  modBcIcms?: string;       // Alias de icmsModBc
  csosn?: string;           // CSOSN para Simples Nacional
  
  // IPI
  ipiCst?: string;          // CST do IPI
  ipiRate?: number;         // Alíquota do IPI (%)
  
  // PIS
  pisCst?: string;          // CST do PIS
  cstPis?: string;          // Alias de pisCst
  pisRate?: number;         // Alíquota do PIS (%)
  aliqPis?: number;         // Alias de pisRate
  bcPis?: number;           // Base de cálculo PIS
  
  // COFINS
  cofinsCst?: string;       // CST do COFINS
  cstCofins?: string;       // Alias de cofinsCst
  cofinsRate?: number;      // Alíquota do COFINS (%)
  aliqCofins?: number;      // Alias de cofinsRate
  bcCofins?: number;        // Base de cálculo COFINS
  
  // Unidade de Medida
  unitId: string;           // ID da unidade (relacionamento)
  barcode?: string;         // Código de barras (GTIN)
}
```

### Endpoint: Atualizar Produto
```http
PUT /products/{productId}
Authorization: Bearer {token}
Content-Type: application/json
```

### Request Body (Exemplo Simples Nacional)
```json
{
  "name": "Produto Exemplo",
  "price": 100.00,
  
  // Dados Fiscais - SIMPLES NACIONAL
  "ncm": "12345678",
  "cest": "0123456",
  "cfopEstadual": "5102",
  "cfopInterestadual": "6108",
  "origin": "0",
  "csosn": "102",
  "barcode": "7891234567890",
  "unitId": "uuid-unidade"
}
```

### Request Body (Exemplo Lucro Real)
```json
{
  "name": "Produto Exemplo",
  "price": 100.00,
  
  // Dados Fiscais - LUCRO REAL
  "ncm": "12345678",
  "cfopEstadual": "5102",
  "cfopInterestadual": "6108",
  "origin": "0",
  
  // ICMS
  "icmsCst": "00",
  "icmsRate": 18.00,
  "icmsModBc": "3",
  
  // PIS
  "pisCst": "01",
  "pisRate": 1.65,
  
  // COFINS
  "cofinsCst": "01",
  "cofinsRate": 7.60,
  
  "barcode": "7891234567890",
  "unitId": "uuid-unidade"
}
```

### UI Sugerida
```tsx
// Componente: ProductFiscalTab.tsx
const ProductFiscalTab = ({ regimeTributario }) => {
  return (
    <Form>
      <Section title="Classificação Fiscal">
        <Input 
          label="NCM" 
          mask="99999999"
          required
          hint="Nomenclatura Comum do Mercosul (8 dígitos)"
        />
        <Input 
          label="CEST" 
          mask="9999999"
          hint="Código Especificador da Substituição Tributária"
        />
        <Input 
          label="Código de Barras (GTIN/EAN)"
          hint="Deixe em branco se não tiver"
        />
      </Section>

      <Section title="CFOP - Código Fiscal de Operação">
        <Input 
          label="CFOP Estadual (mesma UF)" 
          mask="9999"
          placeholder="5102"
          hint="Ex: 5102 - Venda de mercadoria adquirida"
        />
        <Input 
          label="CFOP Interestadual (outra UF)" 
          mask="9999"
          placeholder="6108"
          hint="Ex: 6108 - Venda de mercadoria adquirida"
        />
      </Section>

      <Section title="Origem da Mercadoria">
        <Select label="Origem" required>
          <option value="0">0 - Nacional</option>
          <option value="1">1 - Estrangeira (importação direta)</option>
          <option value="2">2 - Estrangeira (adquirida mercado interno)</option>
          <option value="3">3 - Nacional com mais de 40% estrangeiro</option>
          <option value="4">4 - Nacional conforme processo produtivo básico</option>
          <option value="5">5 - Nacional com menos de 40% estrangeiro</option>
          <option value="6">6 - Estrangeira (importação direta sem similar)</option>
          <option value="7">7 - Estrangeira (mercado interno sem similar)</option>
          <option value="8">8 - Nacional com mais de 70% estrangeiro</option>
        </Select>
      </Section>

      {regimeTributario === 'SIMPLES NACIONAL' ? (
        <Section title="CSOSN - Simples Nacional">
          <Select label="CSOSN" required>
            <option value="101">101 - Tributada pelo Simples Nacional com permissão de crédito</option>
            <option value="102">102 - Tributada pelo Simples Nacional sem permissão de crédito</option>
            <option value="103">103 - Isenção do ICMS no Simples Nacional</option>
            <option value="201">201 - Tributada pelo Simples Nacional com ST e permissão de crédito</option>
            <option value="202">202 - Tributada pelo Simples Nacional com ST e sem permissão de crédito</option>
            <option value="203">203 - Isenção do ICMS no Simples Nacional para faixa de receita bruta com ST</option>
            <option value="300">300 - Imune</option>
            <option value="400">400 - Não tributada pelo Simples Nacional</option>
            <option value="500">500 - ICMS cobrado anteriormente por ST ou por antecipação</option>
            <option value="900">900 - Outros</option>
          </Select>
        </Section>
      ) : (
        <>
          <Section title="ICMS">
            <Select label="CST ICMS" required>
              <option value="00">00 - Tributada integralmente</option>
              <option value="10">10 - Tributada e com cobrança do ICMS por ST</option>
              <option value="20">20 - Com redução de base de cálculo</option>
              <option value="30">30 - Isenta ou não tributada e com cobrança do ICMS por ST</option>
              <option value="40">40 - Isenta</option>
              <option value="41">41 - Não tributada</option>
              <option value="50">50 - Suspensão</option>
              <option value="51">51 - Diferimento</option>
              <option value="60">60 - ICMS cobrado anteriormente por ST</option>
              <option value="70">70 - Com redução de BC e cobrança do ICMS por ST</option>
              <option value="90">90 - Outras</option>
            </Select>
            <Input 
              label="Alíquota ICMS (%)" 
              type="number" 
              step="0.01"
              placeholder="18.00"
            />
            <Select label="Modalidade BC ICMS">
              <option value="0">0 - Margem Valor Agregado (%)</option>
              <option value="1">1 - Pauta (Valor)</option>
              <option value="2">2 - Preço Tabelado Máx. (valor)</option>
              <option value="3">3 - Valor da operação</option>
            </Select>
          </Section>

          <Section title="PIS">
            <Select label="CST PIS" required>
              <option value="01">01 - Operação Tributável com Alíquota Básica</option>
              <option value="02">02 - Operação Tributável com Alíquota Diferenciada</option>
              <option value="04">04 - Operação Tributável Monofásica - Revenda a Alíquota Zero</option>
              <option value="05">05 - Operação Tributável por Substituição Tributária</option>
              <option value="06">06 - Operação Tributável a Alíquota Zero</option>
              <option value="07">07 - Operação Isenta da Contribuição</option>
              <option value="08">08 - Operação sem Incidência da Contribuição</option>
              <option value="09">09 - Operação com Suspensão da Contribuição</option>
              <option value="49">49 - Outras Operações de Saída</option>
            </Select>
            <Input 
              label="Alíquota PIS (%)" 
              type="number" 
              step="0.01"
              placeholder="1.65"
            />
          </Section>

          <Section title="COFINS">
            <Select label="CST COFINS" required>
              <option value="01">01 - Operação Tributável com Alíquota Básica</option>
              <option value="02">02 - Operação Tributável com Alíquota Diferenciada</option>
              <option value="04">04 - Operação Tributável Monofásica - Revenda a Alíquota Zero</option>
              <option value="05">05 - Operação Tributável por Substituição Tributária</option>
              <option value="06">06 - Operação Tributável a Alíquota Zero</option>
              <option value="07">07 - Operação Isenta da Contribuição</option>
              <option value="08">08 - Operação sem Incidência da Contribuição</option>
              <option value="09">09 - Operação com Suspensão da Contribuição</option>
              <option value="49">49 - Outras Operações de Saída</option>
            </Select>
            <Input 
              label="Alíquota COFINS (%)" 
              type="number" 
              step="0.01"
              placeholder="7.60"
            />
          </Section>
        </>
      )}

      <Button type="submit">Salvar Dados Fiscais</Button>
    </Form>
  );
};
```

---

## 4. Emissão de NF-e

### Endpoint: Emitir NF-e
```http
POST /fiscal/nfe/emitir
Authorization: Bearer {token}
Content-Type: application/json
```

### Request Body
```json
{
  "saleId": "uuid-da-venda",
  "enviarSefaz": true,  // true = envia para SEFAZ, false = apenas gera XML
  
  // Opcionais (valores padrão são usados)
  "modelo": "55",       // "55" = NF-e, "65" = NFC-e
  "serie": "1",
  "numero": null,       // null = usa proximoNumeroNFe da empresa
  "naturezaOperacao": "VENDA",
  "tipoOperacao": 1,    // 0 = Entrada, 1 = Saída
  "consumidorFinal": 1, // 0 = Não, 1 = Sim
  "presencaComprador": 1, // 1 = Presencial, 2 = Internet, etc
  "modalidadeFrete": 9   // 0 = Emitente, 1 = Destinatário, 9 = Sem frete
}
```

### Response (Sucesso - Autorizada)
```json
{
  "status": "AUTORIZADA",
  "chaveAcesso": "35231234567890001234550010000000011234567890",
  "protocolo": "135230000000001",
  "dataAutorizacao": "2023-11-16T10:30:00.000Z",
  "xmlGerado": "/uploads/nfe/company-id/sale-id/nfe.xml",
  "xmlAssinado": "/uploads/nfe/company-id/sale-id/nfe_assinado.xml",
  "xmlProcessamento": "/uploads/nfe/company-id/sale-id/nfe_assinado.xml",
  "danfe": "/uploads/nfe/company-id/sale-id/danfe.pdf",
  "respostaSefaz": {
    "protNFe": [...],
    ...
  }
}
```

### Response (Rejeitada)
```json
{
  "status": "REJEITADA",
  "motivoRejeicao": "539 - Duplicidade de NF-e",
  "xmlGerado": "/uploads/nfe/company-id/sale-id/nfe.xml",
  "xmlAssinado": "/uploads/nfe/company-id/sale-id/nfe_assinado.xml",
  "respostaSefaz": {
    ...
  }
}
```

### Response (Erro)
```json
{
  "status": "ERRO",
  "erro": "Empresa não possui certificado A1 cadastrado",
  "xmlGerado": "/uploads/nfe/company-id/sale-id/nfe.xml"
}
```

### UI Sugerida
```tsx
// Componente: EmitirNFeButton.tsx
const EmitirNFeButton = ({ sale }) => {
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [result, setResult] = useState(null);

  const handleEmitir = async (enviarSefaz = true) => {
    setLoading(true);

    try {
      const response = await api.post('/fiscal/nfe/emitir', {
        saleId: sale.id,
        enviarSefaz,
      });

      setResult(response.data);
      
      if (response.data.status === 'AUTORIZADA') {
        toast.success('NF-e emitida com sucesso!');
      } else if (response.data.status === 'REJEITADA') {
        toast.error(`NF-e rejeitada: ${response.data.motivoRejeicao}`);
      }
    } catch (error) {
      toast.error('Erro ao emitir NF-e');
      setResult({ status: 'ERRO', erro: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setModalOpen(true)}
        disabled={sale.status !== 'APPROVED' || sale.nfeId}
      >
        {sale.nfeId ? 'NF-e Emitida' : 'Emitir NF-e'}
      </Button>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <ModalHeader>Emitir Nota Fiscal Eletrônica</ModalHeader>
        
        <ModalBody>
          <Alert type="info">
            <p>Venda: #{sale.numero}</p>
            <p>Cliente: {sale.customer.name}</p>
            <p>Valor Total: {formatCurrency(sale.totalAmount)}</p>
          </Alert>

          {result ? (
            <ResultDisplay result={result} />
          ) : (
            <div>
              <p>Escolha uma opção:</p>
              <Button
                onClick={() => handleEmitir(false)}
                loading={loading}
                variant="secondary"
              >
                Gerar XML (não enviar SEFAZ)
              </Button>
              <Button
                onClick={() => handleEmitir(true)}
                loading={loading}
                variant="primary"
              >
                Emitir e Enviar para SEFAZ
              </Button>
            </div>
          )}
        </ModalBody>
      </Modal>
    </>
  );
};

// Componente: ResultDisplay.tsx
const ResultDisplay = ({ result }) => {
  if (result.status === 'AUTORIZADA') {
    return (
      <Alert type="success">
        <h3>✓ NF-e Autorizada!</h3>
        <p>Chave de Acesso: {result.chaveAcesso}</p>
        <p>Protocolo: {result.protocolo}</p>
        <p>Data: {formatDateTime(result.dataAutorizacao)}</p>
        
        <ButtonGroup>
          <Button onClick={() => downloadDanfe(result.danfe)}>
            📄 Baixar DANFE
          </Button>
          <Button onClick={() => downloadXml(result.xmlProcessamento)}>
            📋 Baixar XML
          </Button>
        </ButtonGroup>
      </Alert>
    );
  }

  if (result.status === 'REJEITADA') {
    return (
      <Alert type="error">
        <h3>✗ NF-e Rejeitada</h3>
        <p>{result.motivoRejeicao}</p>
        <Button onClick={() => downloadXml(result.xmlGerado)}>
          Ver XML Gerado
        </Button>
      </Alert>
    );
  }

  if (result.status === 'ERRO') {
    return (
      <Alert type="error">
        <h3>✗ Erro ao Emitir</h3>
        <p>{result.erro}</p>
      </Alert>
    );
  }

  return null;
};
```

---

## 5. Consulta e Download

### Endpoint: Listar NF-e
```http
GET /fiscal/nfe
Authorization: Bearer {token}
Query Parameters:
  - status: DRAFT | AUTHORIZED | CANCELED | REJECTED
  - saleId: uuid
  - dataInicio: 2023-01-01
  - dataFim: 2023-12-31
```

### Response
```json
[
  {
    "id": "uuid-nfe",
    "numero": 1,
    "serie": "1",
    "modelo": "55",
    "chaveAcesso": "35231234567890001234550010000000011234567890",
    "status": "AUTHORIZED",
    "valorTotal": 1500.00,
    "dataEmissao": "2023-11-16T10:30:00.000Z",
    "protocoloAutorizacao": "135230000000001",
    "sale": {
      "id": "uuid-sale",
      "numero": "V-001",
      "customer": {
        "id": "uuid-customer",
        "name": "Cliente Exemplo"
      }
    }
  }
]
```

### Endpoint: Baixar DANFE (PDF)
```http
GET /fiscal/nfe/{nfeId}/danfe
Authorization: Bearer {token}
```

Response: `application/pdf` (download do arquivo)

### Endpoint: Baixar XML
```http
GET /fiscal/nfe/{nfeId}/xml
Authorization: Bearer {token}
```

Response: `application/xml` (download do arquivo)

### UI Sugerida
```tsx
// Componente: NFeList.tsx
const NFeList = () => {
  const [nfes, setNfes] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    dataInicio: '',
    dataFim: '',
  });

  useEffect(() => {
    loadNfes();
  }, [filters]);

  const loadNfes = async () => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/fiscal/nfe?${params}`);
    setNfes(response.data);
  };

  const downloadDanfe = async (nfeId) => {
    const response = await api.get(`/fiscal/nfe/${nfeId}/danfe`, {
      responseType: 'blob',
    });
    
    const url = window.URL.createObjectURL(response.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = `danfe-${nfeId}.pdf`;
    a.click();
  };

  const downloadXml = async (nfeId) => {
    const response = await api.get(`/fiscal/nfe/${nfeId}/xml`, {
      responseType: 'blob',
    });
    
    const url = window.URL.createObjectURL(response.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nfe-${nfeId}.xml`;
    a.click();
  };

  return (
    <Card>
      <CardHeader>
        <Title>Notas Fiscais Eletrônicas</Title>
      </CardHeader>

      <Filters>
        <Select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">Todos os Status</option>
          <option value="DRAFT">Rascunho</option>
          <option value="AUTHORIZED">Autorizadas</option>
          <option value="CANCELED">Canceladas</option>
          <option value="REJECTED">Rejeitadas</option>
        </Select>

        <DateInput
          label="Data Início"
          value={filters.dataInicio}
          onChange={(e) => setFilters({ ...filters, dataInicio: e.target.value })}
        />

        <DateInput
          label="Data Fim"
          value={filters.dataFim}
          onChange={(e) => setFilters({ ...filters, dataFim: e.target.value })}
        />
      </Filters>

      <Table>
        <thead>
          <tr>
            <th>Número</th>
            <th>Série</th>
            <th>Cliente</th>
            <th>Valor</th>
            <th>Data</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {nfes.map((nfe) => (
            <tr key={nfe.id}>
              <td>{nfe.numero}</td>
              <td>{nfe.serie}</td>
              <td>{nfe.sale?.customer?.name}</td>
              <td>{formatCurrency(nfe.valorTotal)}</td>
              <td>{formatDate(nfe.dataEmissao)}</td>
              <td>
                <StatusBadge status={nfe.status} />
              </td>
              <td>
                <ButtonGroup>
                  <IconButton
                    icon="download"
                    title="Baixar DANFE"
                    onClick={() => downloadDanfe(nfe.id)}
                    disabled={nfe.status !== 'AUTHORIZED'}
                  />
                  <IconButton
                    icon="code"
                    title="Baixar XML"
                    onClick={() => downloadXml(nfe.id)}
                  />
                  <IconButton
                    icon="search"
                    title="Ver Detalhes"
                    onClick={() => navigate(`/nfe/${nfe.id}`)}
                  />
                </ButtonGroup>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  );
};

// Componente: StatusBadge.tsx
const StatusBadge = ({ status }) => {
  const config = {
    DRAFT: { color: 'gray', label: 'Rascunho' },
    AUTHORIZED: { color: 'green', label: 'Autorizada' },
    CANCELED: { color: 'red', label: 'Cancelada' },
    REJECTED: { color: 'orange', label: 'Rejeitada' },
  };

  const { color, label } = config[status] || { color: 'gray', label: status };

  return <Badge color={color}>{label}</Badge>;
};
```

---

## 6. Status e Monitoramento

### Endpoint: Consultar Status SEFAZ
```http
GET /fiscal/nfe/sefaz/status-servico
Authorization: Bearer {token}
```

### Response
```json
{
  "cUF": "35",
  "tpAmb": "2",
  "verAplic": "SP_NFE_PL009_V4",
  "cStat": "107",
  "xMotivo": "Serviço em Operação",
  "dhRecbto": "2023-11-16T10:00:00-03:00",
  "tMed": "1"
}
```

### Endpoint: Consultar NF-e na SEFAZ
```http
GET /fiscal/nfe/consultar/{chaveAcesso}
Authorization: Bearer {token}
```

### Response
```json
{
  "cStat": "100",
  "xMotivo": "Autorizado o uso da NF-e",
  "chNFe": "35231234567890001234550010000000011234567890",
  "dhRecbto": "2023-11-16T10:30:00-03:00",
  "nProt": "135230000000001"
}
```

### UI Sugerida
```tsx
// Componente: SefazStatus.tsx
const SefazStatus = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkStatus = async () => {
    setLoading(true);
    try {
      const response = await api.get('/fiscal/nfe/sefaz/status-servico');
      setStatus(response.data);
    } catch (error) {
      toast.error('Erro ao consultar status da SEFAZ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 60000); // Atualiza a cada 1 minuto
    return () => clearInterval(interval);
  }, []);

  if (!status) return <Spinner />;

  const isOperational = status.cStat === '107';

  return (
    <Card>
      <CardHeader>
        <Title>Status SEFAZ</Title>
        <Button onClick={checkStatus} loading={loading}>
          Atualizar
        </Button>
      </CardHeader>

      <CardBody>
        <StatusIndicator active={isOperational}>
          {isOperational ? (
            <>
              <Icon name="check-circle" color="green" />
              <span>Serviço em Operação</span>
            </>
          ) : (
            <>
              <Icon name="x-circle" color="red" />
              <span>{status.xMotivo}</span>
            </>
          )}
        </StatusIndicator>

        <Details>
          <DetailItem>
            <Label>Ambiente:</Label>
            <Value>{status.tpAmb === '1' ? 'Produção' : 'Homologação'}</Value>
          </DetailItem>
          <DetailItem>
            <Label>UF:</Label>
            <Value>{status.cUF}</Value>
          </DetailItem>
          <DetailItem>
            <Label>Versão:</Label>
            <Value>{status.verAplic}</Value>
          </DetailItem>
          <DetailItem>
            <Label>Última Atualização:</Label>
            <Value>{formatDateTime(status.dhRecbto)}</Value>
          </DetailItem>
        </Details>
      </CardBody>
    </Card>
  );
};
```

---

## 7. Cancelamento

### Endpoint: Cancelar NF-e
```http
POST /fiscal/nfe/{nfeId}/cancelar
Authorization: Bearer {token}
Content-Type: application/json
```

### Request Body
```json
{
  "justificativa": "Motivo do cancelamento com no mínimo 15 caracteres"
}
```

### Response
```json
{
  "cStat": "135",
  "xMotivo": "Evento registrado e vinculado a NF-e",
  "chNFe": "35231234567890001234550010000000011234567890",
  "dhRegEvento": "2023-11-16T11:00:00-03:00",
  "nProt": "135230000000002"
}
```

### Regras de Cancelamento
- ✅ NF-e deve estar com status `AUTHORIZED`
- ✅ Cancelamento dentro de 24 horas da autorização
- ✅ Justificativa com mínimo de 15 caracteres
- ❌ Não pode cancelar após 24 horas (nesse caso, faça uma nota de devolução)

### UI Sugerida
```tsx
// Componente: CancelarNFeButton.tsx
const CancelarNFeButton = ({ nfe }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [justificativa, setJustificativa] = useState('');
  const [loading, setLoading] = useState(false);

  const canCancel = () => {
    if (nfe.status !== 'AUTHORIZED') return false;
    
    const horasDesdeAutorizacao = 
      (new Date() - new Date(nfe.dataAutorizacao)) / (1000 * 60 * 60);
    
    return horasDesdeAutorizacao <= 24;
  };

  const handleCancel = async () => {
    if (justificativa.length < 15) {
      toast.error('Justificativa deve ter no mínimo 15 caracteres');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post(`/fiscal/nfe/${nfe.id}/cancelar`, {
        justificativa,
      });

      toast.success('NF-e cancelada com sucesso!');
      setModalOpen(false);
      // Recarregar dados
    } catch (error) {
      toast.error('Erro ao cancelar NF-e');
    } finally {
      setLoading(false);
    }
  };

  if (!canCancel()) {
    return null; // Ou mostrar botão desabilitado com tooltip
  }

  return (
    <>
      <Button
        variant="danger"
        onClick={() => setModalOpen(true)}
      >
        Cancelar NF-e
      </Button>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <ModalHeader>Cancelar Nota Fiscal Eletrônica</ModalHeader>
        
        <ModalBody>
          <Alert type="warning">
            <h3>⚠️ Atenção!</h3>
            <p>O cancelamento de NF-e é uma operação irreversível.</p>
            <p>NF-e: {nfe.numero} - Série {nfe.serie}</p>
            <p>Chave: {nfe.chaveAcesso}</p>
          </Alert>

          <Textarea
            label="Justificativa do Cancelamento"
            value={justificativa}
            onChange={(e) => setJustificativa(e.target.value)}
            placeholder="Digite o motivo do cancelamento (mínimo 15 caracteres)"
            rows={4}
            required
            minLength={15}
          />

          <CharacterCount>
            {justificativa.length}/15 caracteres
          </CharacterCount>
        </ModalBody>

        <ModalFooter>
          <Button
            variant="secondary"
            onClick={() => setModalOpen(false)}
          >
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={handleCancel}
            loading={loading}
            disabled={justificativa.length < 15}
          >
            Confirmar Cancelamento
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};
```

---

## 8. Tratamento de Erros

### Erros Comuns

#### 1. Certificado Não Cadastrado
```json
{
  "statusCode": 400,
  "message": "Empresa não possui certificado A1 cadastrado"
}
```
**Solução**: Fazer upload do certificado digital

#### 2. Certificado Expirado
```json
{
  "statusCode": 400,
  "message": "Certificado A1 expirado. Faça upload de um novo certificado."
}
```
**Solução**: Upload de novo certificado válido

#### 3. Dados Fiscais Incompletos
```json
{
  "statusCode": 400,
  "message": "Empresa sem inscrição estadual"
}
```
**Solução**: Completar dados fiscais da empresa

#### 4. Produto Sem NCM
```json
{
  "statusCode": 400,
  "message": "Produto 'Nome do Produto' não possui NCM cadastrado"
}
```
**Solução**: Cadastrar NCM no produto

#### 5. Cliente Sem Endereço
```json
{
  "statusCode": 400,
  "message": "Cliente não possui endereço cadastrado"
}
```
**Solução**: Cadastrar endereço do cliente

#### 6. Rejeição SEFAZ
```json
{
  "status": "REJEITADA",
  "motivoRejeicao": "539 - Duplicidade de NF-e"
}
```
**Soluções comuns**:
- `539`: Duplicidade - NF-e já foi autorizada
- `204`: Duplicidade de número - Alterar número da NF-e
- `227`: CNPJ destinatário inválido - Corrigir CNPJ do cliente
- `280`: Certificado inválido - Renovar certificado

### Componente de Tratamento
```tsx
// Componente: ErrorHandler.tsx
const ErrorHandler = ({ error }) => {
  const getErrorMessage = (error) => {
    // Erros de configuração
    if (error.message?.includes('certificado')) {
      return {
        title: 'Certificado Digital',
        message: error.message,
        action: 'Fazer upload do certificado',
        link: '/settings/certificate',
      };
    }

    if (error.message?.includes('NCM')) {
      return {
        title: 'Produto sem NCM',
        message: error.message,
        action: 'Configurar produto',
        link: '/products',
      };
    }

    if (error.message?.includes('endereço')) {
      return {
        title: 'Cliente sem Endereço',
        message: error.message,
        action: 'Cadastrar endereço',
        link: '/customers',
      };
    }

    // Rejeições SEFAZ
    if (error.motivoRejeicao) {
      const codigo = error.motivoRejeicao.match(/^(\d+)/)?.[1];
      
      const solutions = {
        '539': 'Esta NF-e já foi autorizada anteriormente',
        '204': 'Altere o número da NF-e nas configurações',
        '227': 'Verifique o CNPJ/CPF do cliente',
        '280': 'Renovar certificado digital',
      };

      return {
        title: 'NF-e Rejeitada pela SEFAZ',
        message: error.motivoRejeicao,
        solution: solutions[codigo] || 'Consulte o manual da SEFAZ',
      };
    }

    return {
      title: 'Erro ao Emitir NF-e',
      message: error.message || 'Erro desconhecido',
    };
  };

  const errorInfo = getErrorMessage(error);

  return (
    <Alert type="error">
      <h3>{errorInfo.title}</h3>
      <p>{errorInfo.message}</p>
      {errorInfo.solution && (
        <p><strong>Solução:</strong> {errorInfo.solution}</p>
      )}
      {errorInfo.action && errorInfo.link && (
        <Button onClick={() => navigate(errorInfo.link)}>
          {errorInfo.action}
        </Button>
      )}
    </Alert>
  );
};
```

---

## Componentes Sugeridos

### 1. Dashboard Fiscal
```tsx
const DashboardFiscal = () => {
  return (
    <Grid>
      <Card>
        <SefazStatus />
      </Card>
      
      <Card>
        <StatCard
          title="NF-e Emitidas (Mês)"
          value={totalMes}
          icon="file-text"
        />
      </Card>
      
      <Card>
        <StatCard
          title="Valor Total (Mês)"
          value={formatCurrency(valorTotalMes)}
          icon="dollar-sign"
        />
      </Card>
      
      <Card>
        <StatCard
          title="Taxa de Rejeição"
          value={`${taxaRejeicao}%`}
          icon="alert-triangle"
          color={taxaRejeicao > 5 ? 'red' : 'green'}
        />
      </Card>
    </Grid>
  );
};
```

### 2. Wizard de Configuração
```tsx
const ConfigWizard = () => {
  const [step, setStep] = useState(1);

  return (
    <Wizard>
      <Step number={1} active={step === 1}>
        <CompanyFiscalSettings />
      </Step>
      
      <Step number={2} active={step === 2}>
        <CertificateUpload />
      </Step>
      
      <Step number={3} active={step === 3}>
        <ProductsFiscalConfig />
      </Step>
      
      <Step number={4} active={step === 4}>
        <TestEmission />
      </Step>
    </Wizard>
  );
};
```

### 3. Validador de Pré-requisitos
```tsx
const PreRequisitesValidator = ({ companyId }) => {
  const [checks, setChecks] = useState({
    dadosEmpresa: false,
    certificado: false,
    produtosConfigurados: false,
  });

  useEffect(() => {
    validatePreRequisites();
  }, []);

  return (
    <Card>
      <CardHeader>Pré-requisitos para Emissão de NF-e</CardHeader>
      <CardBody>
        <CheckList>
          <CheckItem checked={checks.dadosEmpresa}>
            Dados fiscais da empresa configurados
          </CheckItem>
          <CheckItem checked={checks.certificado}>
            Certificado A1 cadastrado e válido
          </CheckItem>
          <CheckItem checked={checks.produtosConfigurados}>
            Produtos com NCM e CFOP configurados
          </CheckItem>
        </CheckList>
        
        {allChecked && (
          <Alert type="success">
            ✓ Sistema pronto para emissão de NF-e!
          </Alert>
        )}
      </CardBody>
    </Card>
  );
};
```

---

## Exemplos de Código

### Service completo para NF-e
```typescript
// services/nfe.service.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

export const nfeService = {
  // Emitir NF-e
  async emitir(saleId: string, enviarSefaz = true) {
    const response = await api.post('/fiscal/nfe/emitir', {
      saleId,
      enviarSefaz,
    });
    return response.data;
  },

  // Listar NF-e
  async listar(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/fiscal/nfe?${params}`);
    return response.data;
  },

  // Buscar NF-e por ID
  async buscar(nfeId: string) {
    const response = await api.get(`/fiscal/nfe/${nfeId}`);
    return response.data;
  },

  // Baixar DANFE
  async baixarDanfe(nfeId: string) {
    const response = await api.get(`/fiscal/nfe/${nfeId}/danfe`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Baixar XML
  async baixarXml(nfeId: string) {
    const response = await api.get(`/fiscal/nfe/${nfeId}/xml`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Cancelar NF-e
  async cancelar(nfeId: string, justificativa: string) {
    const response = await api.post(`/fiscal/nfe/${nfeId}/cancelar`, {
      justificativa,
    });
    return response.data;
  },

  // Consultar na SEFAZ
  async consultarSefaz(chaveAcesso: string) {
    const response = await api.get(`/fiscal/nfe/consultar/${chaveAcesso}`);
    return response.data;
  },

  // Status do serviço SEFAZ
  async statusSefaz() {
    const response = await api.get('/fiscal/nfe/sefaz/status-servico');
    return response.data;
  },
};

// Hook personalizado
export const useNFe = (nfeId?: string) => {
  const [nfe, setNfe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (nfeId) {
      loadNFe();
    }
  }, [nfeId]);

  const loadNFe = async () => {
    setLoading(true);
    try {
      const data = await nfeService.buscar(nfeId);
      setNfe(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const emitir = async (saleId: string) => {
    setLoading(true);
    try {
      const data = await nfeService.emitir(saleId);
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancelar = async (justificativa: string) => {
    setLoading(true);
    try {
      const data = await nfeService.cancelar(nfeId, justificativa);
      await loadNFe(); // Recarregar
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    nfe,
    loading,
    error,
    emitir,
    cancelar,
    reload: loadNFe,
  };
};
```

---

## Checklist de Implementação

### Backend (✅ Completo)
- [x] API de emissão de NF-e
- [x] Upload de certificado
- [x] Geração de XML
- [x] Assinatura digital
- [x] Envio para SEFAZ
- [x] Geração de DANFE
- [x] Cancelamento

### Frontend (A fazer)
- [ ] Tela de configuração fiscal da empresa
- [ ] Upload de certificado A1
- [ ] Configuração fiscal de produtos
- [ ] Botão "Emitir NF-e" na venda
- [ ] Modal de emissão com opções
- [ ] Listagem de NF-e emitidas
- [ ] Download de DANFE e XML
- [ ] Cancelamento de NF-e
- [ ] Dashboard fiscal
- [ ] Status da SEFAZ em tempo real
- [ ] Tratamento de erros contextual

---

## Suporte e Documentação Adicional

### Links Úteis
- [Manual de Integração NF-e v4.0](http://www.nfe.fazenda.gov.br/portal/principal.aspx)
- [Tabela de Códigos SEFAZ](http://www.nfe.fazenda.gov.br/portal/listaConteudo.aspx?tipoConteudo=tW+YMyk/50s=)
- [Consulta NCM](https://portalunico.siscomex.gov.br/classif/)
- [Tabela CFOP](http://www.econeteditora.com.br/tabelas_fiscais/cfop.php)

### Próximos Passos
1. ✅ Implementar componentes básicos
2. ✅ Testar em ambiente de homologação
3. ✅ Validar com contador/fiscal
4. ✅ Treinar usuários
5. ✅ Ativar em produção

---

**Data de Criação**: 16/11/2025  
**Versão**: 1.0.0  
**Autor**: Backend ERP Team
