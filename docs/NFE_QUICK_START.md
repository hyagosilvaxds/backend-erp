# 🚀 NF-e - Quick Start Frontend

## Resumo Executivo

Guia rápido para implementar emissão de NF-e no frontend.

---

## 📋 Checklist Rápido

### 1. Configuração Inicial (Uma Única Vez)
```bash
✅ Configurar dados fiscais da empresa (PUT /companies/{id})
✅ Upload certificado A1 (POST /companies/{id}/certificate)
✅ Configurar produtos com NCM/CFOP (PUT /products/{id})
```

### 2. Fluxo de Emissão
```bash
1. Criar venda normal
2. Aprovar venda (POST /sales/{id}/approve)
3. Emitir NF-e (POST /fiscal/nfe/emitir)
4. Baixar DANFE/XML (GET /fiscal/nfe/{id}/danfe)
```

---

## 🔗 Endpoints Principais

### Emitir NF-e
```javascript
POST /fiscal/nfe/emitir

{
  "saleId": "uuid-da-venda",
  "enviarSefaz": true
}

// Response (sucesso)
{
  "status": "AUTORIZADA",
  "chaveAcesso": "35231234567890001234550010000000011234567890",
  "protocolo": "135230000000001",
  "danfe": "/path/to/danfe.pdf"
}
```

### Listar NF-e
```javascript
GET /fiscal/nfe?status=AUTHORIZED&dataInicio=2023-11-01

// Response
[
  {
    "id": "uuid",
    "numero": 1,
    "serie": "1",
    "chaveAcesso": "...",
    "status": "AUTHORIZED",
    "valorTotal": 1500.00,
    "sale": {
      "customer": {
        "name": "Cliente"
      }
    }
  }
]
```

### Downloads
```javascript
// DANFE (PDF)
GET /fiscal/nfe/{id}/danfe
// Response: application/pdf

// XML
GET /fiscal/nfe/{id}/xml
// Response: application/xml
```

### Cancelar NF-e
```javascript
POST /fiscal/nfe/{id}/cancelar

{
  "justificativa": "Motivo com mínimo 15 caracteres"
}

// Regras: 
// - Apenas NF-e AUTHORIZED
// - Dentro de 24 horas
// - Justificativa >= 15 caracteres
```

### Status SEFAZ
```javascript
GET /fiscal/nfe/sefaz/status-servico

// Response
{
  "cStat": "107",
  "xMotivo": "Serviço em Operação",
  "tpAmb": "2"
}
```

---

## 🎨 Componentes React (Exemplos)

### 1. Botão Emitir NF-e
```tsx
const EmitirNFeButton = ({ saleId }) => {
  const [loading, setLoading] = useState(false);

  const handleEmitir = async () => {
    setLoading(true);
    try {
      const result = await api.post('/fiscal/nfe/emitir', {
        saleId,
        enviarSefaz: true,
      });

      if (result.data.status === 'AUTORIZADA') {
        toast.success('NF-e emitida com sucesso!');
        downloadDanfe(result.data.danfe);
      }
    } catch (error) {
      toast.error('Erro ao emitir NF-e');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleEmitir} loading={loading}>
      Emitir NF-e
    </Button>
  );
};
```

### 2. Download DANFE
```tsx
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
```

### 3. Upload Certificado
```tsx
const CertificateUpload = ({ companyId }) => {
  const handleUpload = async (file, password) => {
    const formData = new FormData();
    formData.append('certificate', file);
    formData.append('senha', password);

    await api.post(`/companies/${companyId}/certificate`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    toast.success('Certificado enviado!');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="file" accept=".pfx" />
      <input type="password" placeholder="Senha do certificado" />
      <button type="submit">Enviar</button>
    </form>
  );
};
```

### 4. Lista de NF-e
```tsx
const NFeList = () => {
  const [nfes, setNfes] = useState([]);

  useEffect(() => {
    api.get('/fiscal/nfe').then(res => setNfes(res.data));
  }, []);

  return (
    <table>
      <thead>
        <tr>
          <th>Número</th>
          <th>Cliente</th>
          <th>Valor</th>
          <th>Status</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        {nfes.map(nfe => (
          <tr key={nfe.id}>
            <td>{nfe.numero}</td>
            <td>{nfe.sale?.customer?.name}</td>
            <td>{formatCurrency(nfe.valorTotal)}</td>
            <td><StatusBadge status={nfe.status} /></td>
            <td>
              <button onClick={() => downloadDanfe(nfe.id)}>DANFE</button>
              <button onClick={() => downloadXml(nfe.id)}>XML</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
```

---

## ⚙️ Dados Necessários

### Empresa (campos fiscais)
```javascript
{
  "razaoSocial": "EMPRESA LTDA",
  "cnpj": "12345678000190",
  "inscricaoEstadual": "123456789",
  "regimeTributario": "SIMPLES NACIONAL",
  "logradouro": "Rua Exemplo",
  "numero": "123",
  "bairro": "Centro",
  "cidade": "São Paulo",
  "estado": "SP",
  "cep": "01234567",
  "codigoMunicipioIBGE": "3550308",
  "nfeAmbiente": "2",  // 1=Produção, 2=Homologação
  "serieNFe": "1"
}
```

### Produto (campos fiscais)
```javascript
{
  "ncm": "12345678",           // OBRIGATÓRIO
  "cfopEstadual": "5102",      // CFOP mesma UF
  "cfopInterestadual": "6108", // CFOP outra UF
  "origin": "0",               // 0-8 (origem)
  "csosn": "102",              // Simples Nacional
  // OU (para Lucro Real/Presumido)
  "icmsCst": "00",
  "icmsRate": 18.00,
  "pisCst": "01",
  "pisRate": 1.65,
  "cofinsCst": "01",
  "cofinsRate": 7.60
}
```

### Cliente (campos necessários)
```javascript
{
  "name": "Cliente Exemplo",
  "cnpj": "12345678000190",  // ou "cpf"
  "stateRegistration": "123456789",  // opcional
  "addresses": [
    {
      "type": "BILLING",
      "street": "Rua Cliente",
      "number": "456",
      "neighborhood": "Bairro",
      "city": "São Paulo",
      "state": "SP",
      "zipCode": "01234567",
      "ibgeCode": "3550308"
    }
  ]
}
```

---

## ❌ Erros Comuns

### 1. Certificado não cadastrado
```
Mensagem: "Empresa não possui certificado A1 cadastrado"
Solução: POST /companies/{id}/certificate
```

### 2. Produto sem NCM
```
Mensagem: "Produto 'X' não possui NCM cadastrado"
Solução: Adicionar NCM no produto (PUT /products/{id})
```

### 3. Cliente sem endereço
```
Mensagem: "Cliente não possui endereço cadastrado"
Solução: Cadastrar endereço com IBGE code
```

### 4. NF-e rejeitada SEFAZ
```
Status: "REJEITADA"
Códigos comuns:
- 539: Duplicidade (já foi emitida)
- 204: Número duplicado (alterar número)
- 227: CNPJ inválido (corrigir cliente)
- 280: Certificado inválido (renovar)
```

---

## 🎯 Status da NF-e

```typescript
enum NFeStatus {
  DRAFT      = 'Rascunho (XML gerado, não enviado)',
  AUTHORIZED = 'Autorizada pela SEFAZ',
  CANCELED   = 'Cancelada',
  REJECTED   = 'Rejeitada pela SEFAZ'
}
```

### Badge de Status (exemplo)
```tsx
const StatusBadge = ({ status }) => {
  const config = {
    DRAFT: { color: 'gray', label: 'Rascunho' },
    AUTHORIZED: { color: 'green', label: 'Autorizada' },
    CANCELED: { color: 'red', label: 'Cancelada' },
    REJECTED: { color: 'orange', label: 'Rejeitada' },
  };

  const { color, label } = config[status];
  return <span className={`badge-${color}`}>{label}</span>;
};
```

---

## 🔐 Segurança

### Headers Necessários
```javascript
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
```

### Permissões
- **Emitir NF-e**: Usuário logado (mesma empresa)
- **Listar NF-e**: Usuário logado (mesma empresa)
- **Upload Certificado**: Admin apenas
- **Remover Certificado**: Admin apenas

---

## 📱 Fluxo Mobile-Friendly

```
┌─────────────────────────────┐
│   Lista de Vendas           │
│   [Venda #001] → [Emitir]   │
└─────────────────────────────┘
           ↓
┌─────────────────────────────┐
│   Modal: Emitir NF-e        │
│   ○ Gerar XML               │
│   ● Emitir e Enviar SEFAZ   │
│   [Confirmar] [Cancelar]    │
└─────────────────────────────┘
           ↓
┌─────────────────────────────┐
│   Resultado                 │
│   ✓ NF-e Autorizada         │
│   Chave: 352312...          │
│   [📄 DANFE] [📋 XML]       │
└─────────────────────────────┘
```

---

## 🧪 Testes

### Ambiente de Homologação
```javascript
// Certificado de teste da SEFAZ
// Disponível em: http://www.nfe.fazenda.gov.br/

// Configurar empresa
PUT /companies/{id}
{
  "nfeAmbiente": "2"  // Homologação
}

// Testar emissão
POST /fiscal/nfe/emitir
{
  "saleId": "...",
  "enviarSefaz": true
}

// IMPORTANTE: Em homologação, o DANFE terá marca d'água
```

### Checklist de Teste
- [ ] Upload de certificado
- [ ] Configuração empresa
- [ ] Configuração produto
- [ ] Emissão NF-e (apenas XML)
- [ ] Emissão NF-e (com envio SEFAZ)
- [ ] Download DANFE
- [ ] Download XML
- [ ] Cancelamento (até 24h)
- [ ] Status SEFAZ

---

## 📚 Recursos Adicionais

### Documentação Completa
- `FRONTEND_NFE_IMPLEMENTATION.md` - Guia detalhado (100+ páginas)
- `NFE_MODULE_DOCUMENTATION.md` - Especificação técnica backend
- `CERTIFICATE_ENCRYPTION.md` - Sistema de criptografia

### APIs Externas
- [Consulta NCM](https://portalunico.siscomex.gov.br/classif/)
- [Tabela CFOP](http://www.econeteditora.com.br/tabelas_fiscais/cfop.php)
- [Portal NF-e](http://www.nfe.fazenda.gov.br/)

### Suporte
- GitHub Issues: [backend-erp/issues]
- Docs: [/docs/NFE_*.md]
- Email: suporte@empresa.com.br

---

**Versão**: 1.0.0  
**Última Atualização**: 16/11/2025  
**Próximo: Implementar componentes frontend**
