# 🚀 NF-e API - Guia Rápido de Referência

## 📋 Autenticação

```bash
# Login
POST /auth/login
{
  "email": "usuario@empresa.com",
  "password": "senha"
}

# Usar token em todas as requisições
Authorization: Bearer {token}
```

---

## 📤 1. EMITIR NF-e

```bash
POST /fiscal/nfe/emitir
```

**Mínimo necessário:**
```json
{
  "saleId": "uuid-da-venda",
  "enviarSefaz": true
}
```

**Resposta (Sucesso):**
```json
{
  "status": "AUTORIZADA",
  "chaveAcesso": "35240112345678901234550010000000011234567890",
  "protocolo": "135240000000123",
  "xmlProcessamento": "/path/nfe_proc.xml",
  "danfe": "/path/danfe.pdf"
}
```

**Resposta (Erro):**
```json
{
  "status": "REJEITADA",
  "motivoRejeicao": "Duplicidade de NF-e"
}
```

---

## 📋 2. LISTAR NF-e

```bash
GET /fiscal/nfe
GET /fiscal/nfe?status=AUTHORIZED
GET /fiscal/nfe?dataInicio=2024-11-01&dataFim=2024-11-30
GET /fiscal/nfe?saleId=uuid-da-venda
```

**Resposta:**
```json
[
  {
    "id": "uuid",
    "numero": 1,
    "serie": "1",
    "chaveAcesso": "35240112345678901234550010000000011234567890",
    "status": "AUTHORIZED",
    "valorTotal": 1500.00,
    "destinatarioNome": "Cliente Exemplo",
    "dataEmissao": "2024-11-16T10:30:00.000Z"
  }
]
```

---

## 🔍 3. BUSCAR NF-e

```bash
GET /fiscal/nfe/:id
```

**Resposta:** Objeto completo da NF-e com todos os detalhes.

---

## 📄 4. DOWNLOAD DANFE (PDF)

```bash
GET /fiscal/nfe/:id/danfe
```

**Retorna:** Arquivo PDF (application/pdf)

**JavaScript:**
```javascript
const response = await fetch(`${API_URL}/fiscal/nfe/${nfeId}/danfe`, {
  headers: { 'Authorization': `Bearer ${token}` }
});

const blob = await response.blob();
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `danfe-${nfeId}.pdf`;
a.click();
```

---

## 📥 5. DOWNLOAD XML

```bash
GET /fiscal/nfe/:id/xml
```

**Retorna:** Arquivo XML (application/xml)

**JavaScript:**
```javascript
const response = await fetch(`${API_URL}/fiscal/nfe/${nfeId}/xml`, {
  headers: { 'Authorization': `Bearer ${token}` }
});

const blob = await response.blob();
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `nfe-${nfeId}.xml`;
a.click();
```

---

## 🔍 6. CONSULTAR NA SEFAZ

```bash
GET /fiscal/nfe/consultar/:chaveAcesso
```

**Exemplo:**
```bash
GET /fiscal/nfe/consultar/35240112345678901234550010000000011234567890
```

**Resposta:**
```json
{
  "cStat": "100",
  "xMotivo": "Autorizado o uso da NF-e",
  "chNFe": "35240112345678901234550010000000011234567890",
  "nProt": "135240000000123"
}
```

---

## ❌ 7. CANCELAR NF-e

```bash
POST /fiscal/nfe/:id/cancelar
```

**Body:**
```json
{
  "justificativa": "Motivo do cancelamento (mínimo 15 caracteres)"
}
```

**Resposta:**
```json
{
  "cStat": "135",
  "xMotivo": "Evento registrado e vinculado a NF-e",
  "nProt": "135240000000124"
}
```

**⚠️ Requisitos:**
- Justificativa mínimo 15 caracteres
- NF-e com status AUTHORIZED
- Menos de 24 horas da emissão

---

## 🟢 8. STATUS SEFAZ

```bash
GET /fiscal/nfe/sefaz/status
```

**Resposta:**
```json
{
  "cStat": "107",
  "xMotivo": "Serviço em Operação"
}
```

**Códigos:**
- `107` = ✅ Online
- `108` = ⚠️ Paralisado Momentaneamente
- `109` = ⚠️ Paralisado sem Previsão

---

## 📊 Códigos de Status (cStat)

### ✅ Sucesso
- `100` - Autorizado o uso da NF-e
- `101` - Cancelamento homologado
- `107` - Serviço em operação
- `135` - Evento registrado

### ❌ Erros Comuns
- `204` - Duplicidade de NF-e
- `217` - NF-e não consta na base
- `233` - Destinatário não habilitado
- `539` - Duplicidade de NF-e
- `656` - Consumo indevido

---

## 🔄 Fluxo Completo (JavaScript)

```javascript
// 1. Verificar SEFAZ
const statusResp = await fetch(`${API_URL}/fiscal/nfe/sefaz/status`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
const status = await statusResp.json();

if (status.cStat !== '107') {
  console.error('SEFAZ offline');
  return;
}

// 2. Emitir NF-e
const emitirResp = await fetch(`${API_URL}/fiscal/nfe/emitir`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    saleId: 'uuid-da-venda',
    enviarSefaz: true
  })
});

const nfe = await emitirResp.json();

if (nfe.status !== 'AUTORIZADA') {
  console.error('Erro:', nfe.motivoRejeicao);
  return;
}

console.log('✅ NF-e autorizada!');
console.log('Chave:', nfe.chaveAcesso);

// 3. Buscar lista para obter ID
const listarResp = await fetch(
  `${API_URL}/fiscal/nfe?saleId=${nfe.saleId}`,
  { headers: { 'Authorization': `Bearer ${token}` }}
);
const nfes = await listarResp.json();
const nfeId = nfes[0].id;

// 4. Download DANFE
const danfeResp = await fetch(
  `${API_URL}/fiscal/nfe/${nfeId}/danfe`,
  { headers: { 'Authorization': `Bearer ${token}` }}
);
const danfeBlob = await danfeResp.blob();

// 5. Download XML
const xmlResp = await fetch(
  `${API_URL}/fiscal/nfe/${nfeId}/xml`,
  { headers: { 'Authorization': `Bearer ${token}` }}
);
const xmlBlob = await xmlResp.blob();

console.log('✅ Downloads completos!');
```

---

## 🎨 React Components

### Emitir NF-e
```jsx
function EmitirNFe({ saleId, token }) {
  const [loading, setLoading] = useState(false);
  
  const emitir = async () => {
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/fiscal/nfe/emitir`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ saleId, enviarSefaz: true })
      });
      
      const nfe = await response.json();
      
      if (nfe.status === 'AUTORIZADA') {
        alert(`✅ NF-e ${nfe.chaveAcesso} autorizada!`);
      } else {
        alert(`❌ Erro: ${nfe.motivoRejeicao}`);
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <button onClick={emitir} disabled={loading}>
      {loading ? '⏳ Emitindo...' : '📤 Emitir NF-e'}
    </button>
  );
}
```

### Download DANFE
```jsx
function DownloadDanfe({ nfeId, token }) {
  const download = async () => {
    const response = await fetch(
      `${API_URL}/fiscal/nfe/${nfeId}/danfe`,
      { headers: { 'Authorization': `Bearer ${token}` }}
    );
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `danfe-${nfeId}.pdf`;
    a.click();
    window.URL.revokeObjectURL(url);
  };
  
  return <button onClick={download}>📄 DANFE</button>;
}
```

### Listar NF-e
```jsx
function ListarNFe({ token }) {
  const [nfes, setNfes] = useState([]);
  
  useEffect(() => {
    const carregar = async () => {
      const response = await fetch(`${API_URL}/fiscal/nfe`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setNfes(data);
    };
    
    carregar();
  }, [token]);
  
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
            <td>{nfe.destinatarioNome}</td>
            <td>R$ {nfe.valorTotal.toFixed(2)}</td>
            <td>{nfe.status}</td>
            <td>
              <DownloadDanfe nfeId={nfe.id} token={token} />
              <DownloadXml nfeId={nfe.id} token={token} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

---

## 🛠️ cURL Examples

```bash
# Emitir NF-e
curl -X POST https://api.example.com/fiscal/nfe/emitir \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"saleId":"uuid","enviarSefaz":true}'

# Listar NF-e
curl https://api.example.com/fiscal/nfe \
  -H "Authorization: Bearer TOKEN"

# Listar com filtros
curl "https://api.example.com/fiscal/nfe?status=AUTHORIZED&dataInicio=2024-11-01" \
  -H "Authorization: Bearer TOKEN"

# Buscar NF-e
curl https://api.example.com/fiscal/nfe/UUID \
  -H "Authorization: Bearer TOKEN"

# Download DANFE
curl https://api.example.com/fiscal/nfe/UUID/danfe \
  -H "Authorization: Bearer TOKEN" \
  -o danfe.pdf

# Download XML
curl https://api.example.com/fiscal/nfe/UUID/xml \
  -H "Authorization: Bearer TOKEN" \
  -o nfe.xml

# Consultar na SEFAZ
curl https://api.example.com/fiscal/nfe/consultar/CHAVE_44_DIGITOS \
  -H "Authorization: Bearer TOKEN"

# Cancelar NF-e
curl -X POST https://api.example.com/fiscal/nfe/UUID/cancelar \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"justificativa":"Motivo com mais de 15 caracteres"}'

# Status SEFAZ
curl https://api.example.com/fiscal/nfe/sefaz/status \
  -H "Authorization: Bearer TOKEN"
```

---

## 📱 Postman Collection

### Variables
```json
{
  "base_url": "https://api.example.com",
  "token": "{{token}}",
  "sale_id": "uuid-da-venda",
  "nfe_id": "uuid-da-nfe"
}
```

### Requests

1. **Login**
   - Method: `POST`
   - URL: `{{base_url}}/auth/login`
   - Body: `{"email": "user@example.com", "password": "pass"}`
   - Tests: `pm.environment.set("token", pm.response.json().access_token);`

2. **Emitir NF-e**
   - Method: `POST`
   - URL: `{{base_url}}/fiscal/nfe/emitir`
   - Headers: `Authorization: Bearer {{token}}`
   - Body: `{"saleId": "{{sale_id}}", "enviarSefaz": true}`

3. **Listar NF-e**
   - Method: `GET`
   - URL: `{{base_url}}/fiscal/nfe`
   - Headers: `Authorization: Bearer {{token}}`

---

## 🔒 Segurança

### ✅ Boas Práticas

1. **Nunca expor o token:**
   ```javascript
   // ❌ ERRADO
   const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
   
   // ✅ CORRETO
   const token = localStorage.getItem('token');
   ```

2. **Verificar expiração:**
   ```javascript
   if (response.status === 401) {
     // Token expirado - fazer login novamente
     redirectToLogin();
   }
   ```

3. **HTTPS obrigatório:**
   ```
   ✅ https://api.example.com
   ❌ http://api.example.com
   ```

4. **Validar respostas:**
   ```javascript
   if (!response.ok) {
     throw new Error(`HTTP ${response.status}`);
   }
   ```

---

## ⚠️ Tratamento de Erros

```javascript
try {
  const response = await fetch(`${API_URL}/fiscal/nfe/emitir`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ saleId, enviarSefaz: true })
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      // Token inválido
      return redirectToLogin();
    }
    
    if (response.status === 404) {
      throw new Error('Venda não encontrada');
    }
    
    throw new Error(`Erro HTTP ${response.status}`);
  }
  
  const data = await response.json();
  
  if (data.status === 'REJEITADA') {
    throw new Error(data.motivoRejeicao);
  }
  
  // Sucesso
  console.log('✅ NF-e autorizada:', data.chaveAcesso);
  
} catch (error) {
  console.error('❌ Erro:', error.message);
  alert(`Erro ao emitir NF-e: ${error.message}`);
}
```

---

## 📚 Links Úteis

- [Documentação Completa](./API_NFE_COMPLETE.md)
- [Fluxo SEFAZ](./NFE_SEFAZ_FLOW_COMPLETE.md)
- [Mapeamento de Dados](./NFE_MAPEAMENTO_DADOS_EMPRESA.md)
- [Manual SEFAZ](http://www.nfe.fazenda.gov.br/portal/principal.aspx)

---

**Versão:** 1.0.0  
**Data:** 16 de novembro de 2025
