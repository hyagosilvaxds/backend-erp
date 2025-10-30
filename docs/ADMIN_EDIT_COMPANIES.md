# 📝 Edição de Empresas e Upload de Arquivos (Admin)

## Visão Geral

Endpoints exclusivos para usuários com **role admin** que permitem editar informações completas de empresas, fazer upload de logo e certificado digital A1.

## 🔒 Permissões Necessárias

- **`companies.update`** - Obrigatória para todos os endpoints
- Apenas usuários com **role admin** têm acesso a esses endpoints

---

## 1. Atualizar Empresa

### Endpoint

```
PATCH /companies/admin/:id
```

### Descrição

Atualiza as informações completas de uma empresa. Admin pode atualizar qualquer campo, incluindo dados fiscais, endereço, contatos e configurações.

### Parâmetros de Rota

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `id` | string | ID da empresa |

### Autenticação

```
Authorization: Bearer {token}
x-company-id: {companyId}
```

### Corpo da Requisição

Todos os campos são **opcionais**. Envie apenas os campos que deseja atualizar.

```json
{
  "razaoSocial": "Nova Razão Social Ltda",
  "nomeFantasia": "Novo Nome Fantasia",
  "cnpj": "12345678000190",
  "inscricaoEstadual": "123456789",
  "inscricaoMunicipal": "987654",
  "regimeTributario": "Simples Nacional",
  "cnaePrincipal": "4751-2/01",
  "cnaeSecundarios": ["4752-1/00", "4753-9/00"],
  "dataAbertura": "2020-01-15T00:00:00.000Z",
  "situacaoCadastral": "Ativa",
  "logradouro": "Rua Atualizada",
  "numero": "200",
  "complemento": "Sala 302",
  "bairro": "Centro",
  "cidade": "São Paulo",
  "estado": "SP",
  "cep": "01310100",
  "pais": "Brasil",
  "telefone": "(11) 3000-5000",
  "celular": "(11) 99000-5000",
  "email": "novoemail@empresa.com.br",
  "site": "https://www.novosite.com.br",
  "tipoContribuinte": "Contribuinte ICMS",
  "regimeApuracao": "Simples Nacional",
  "codigoMunicipioIBGE": "3550308",
  "codigoEstadoIBGE": "35",
  "cfopPadrao": "5102",
  "serieNFe": "2",
  "serieNFCe": "2",
  "serieNFSe": "2",
  "ambienteFiscal": "Producao",
  "planoContasId": "cm2r8g9h40005vy9x1a2b3c4i"
}
```

### Validações

#### Dados Básicos

| Campo | Validação |
|-------|-----------|
| `cnpj` | Formato válido (14 dígitos), único no sistema |
| `email` | Formato de e-mail válido |
| `site` | URL válida |

#### Endereço

| Campo | Validação |
|-------|-----------|
| `cep` | Formato válido (8 dígitos) |
| `estado` | UF válida (AC, AL, AP, AM, BA, CE, DF, ES, GO, MA, MT, MS, MG, PA, PB, PR, PE, PI, RJ, RN, RS, RO, RR, SC, SP, SE, TO) |

#### Configurações Fiscais

| Campo | Validação | Valores Aceitos |
|-------|-----------|-----------------|
| `regimeTributario` | Enum | Simples Nacional, Lucro Presumido, Lucro Real |
| `tipoContribuinte` | Enum | Contribuinte ICMS, Contribuinte ICMS e ISS, Isento, Não Contribuinte |
| `regimeApuracao` | Enum | Simples Nacional, Lucro Presumido, Lucro Real |
| `situacaoCadastral` | Enum | Ativa, Inativa, Suspensa, Inapta, Baixada |
| `ambienteFiscal` | Enum | Homologacao, Producao |

### Resposta de Sucesso

**Status:** `200 OK`

```json
{
  "id": "cm2r8g9h40000vy9x1a2b3c4d",
  "razaoSocial": "Nova Razão Social Ltda",
  "nomeFantasia": "Novo Nome Fantasia",
  "cnpj": "12345678000190",
  "inscricaoEstadual": "123456789",
  "inscricaoMunicipal": "987654",
  "regimeTributario": "Simples Nacional",
  "email": "novoemail@empresa.com.br",
  "telefone": "(11) 3000-5000",
  "active": true,
  "hasCertificadoA1": false,
  "createdAt": "2025-10-25T10:30:00.000Z",
  "updatedAt": "2025-10-25T15:45:00.000Z"
}
```

**Nota:** O campo `hasCertificadoA1` indica se a empresa possui certificado digital A1 cadastrado.

### Exemplos de Uso

#### cURL

```bash
curl -X PATCH http://localhost:3000/companies/admin/cm2r8g9h40000vy9x1a2b3c4d \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "x-company-id: cm2r8g9h40000vy9x1a2b3c4d" \
  -H "Content-Type: application/json" \
  -d '{
    "nomeFantasia": "Alpha Atualizada",
    "email": "novoemail@alpha.com.br",
    "regimeTributario": "Lucro Presumido"
  }'
```

#### JavaScript/TypeScript

```typescript
async function updateCompany(companyId: string, updates: Partial<Company>) {
  const response = await fetch(`http://localhost:3000/companies/admin/${companyId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-company-id': selectedCompanyId,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  return await response.json();
}

// Uso:
await updateCompany('cm2r8g9h40000vy9x1a2b3c4d', {
  nomeFantasia: 'Novo Nome',
  email: 'novoemail@empresa.com.br',
  telefone: '(11) 3000-9999',
});
```

#### React Hook

```typescript
import { useState } from 'react';
import { api } from '../services/api';

export function useUpdateCompany() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateCompany = async (companyId: string, updates: Partial<Company>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.patch(`/companies/admin/${companyId}`, updates);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao atualizar empresa');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateCompany, loading, error };
}
```

### Erros Possíveis

#### 400 Bad Request

```json
{
  "statusCode": 400,
  "message": [
    "cnpj must be a valid CNPJ",
    "email must be an email"
  ],
  "error": "Bad Request"
}
```

**Causa:** Dados inválidos

#### 404 Not Found

```json
{
  "statusCode": 404,
  "message": "Empresa não encontrada"
}
```

**Causa:** ID da empresa não existe

#### 409 Conflict

```json
{
  "statusCode": 409,
  "message": "CNPJ já cadastrado"
}
```

**Causa:** CNPJ já está em uso por outra empresa

---

## 2. Upload de Logo

### Endpoint

```
POST /companies/admin/:id/logo
```

### Descrição

Faz upload de uma logo para a empresa. A logo será armazenada no servidor e uma URL será retornada.

### Parâmetros de Rota

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `id` | string | ID da empresa |

### Autenticação

```
Authorization: Bearer {token}
x-company-id: {companyId}
```

### Corpo da Requisição

**Content-Type:** `multipart/form-data`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `logo` | File | Sim | Arquivo de imagem |

### Especificações do Arquivo

| Especificação | Valor |
|---------------|-------|
| **Formatos aceitos** | .jpg, .jpeg, .png, .gif, .webp |
| **Tamanho máximo** | 5 MB |
| **Campo do form-data** | `logo` |

### Resposta de Sucesso

**Status:** `200 OK`

```json
{
  "id": "cm2r8g9h40000vy9x1a2b3c4d",
  "razaoSocial": "Empresa Alpha Comércio Ltda",
  "nomeFantasia": "Empresa Alpha",
  "logoUrl": "http://localhost:3000/uploads/logos/logo-1730000000000-123456789.png",
  "logoFileName": "logo-1730000000000-123456789.png",
  "logoMimeType": "image/png",
  "hasCertificadoA1": true,
  "updatedAt": "2025-10-25T15:45:00.000Z"
}
```

### Exemplos de Uso

#### cURL

```bash
curl -X POST http://localhost:3000/companies/admin/cm2r8g9h40000vy9x1a2b3c4d/logo \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "x-company-id: cm2r8g9h40000vy9x1a2b3c4d" \
  -F "logo=@/path/to/logo.png"
```

#### JavaScript (FormData)

```typescript
async function uploadLogo(companyId: string, file: File) {
  const formData = new FormData();
  formData.append('logo', file);

  const response = await fetch(`http://localhost:3000/companies/admin/${companyId}/logo`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-company-id': selectedCompanyId,
    },
    body: formData,
  });

  return await response.json();
}

// Uso:
const fileInput = document.querySelector<HTMLInputElement>('#logoInput');
if (fileInput?.files?.[0]) {
  await uploadLogo('cm2r8g9h40000vy9x1a2b3c4d', fileInput.files[0]);
}
```

#### React Component

```typescript
import { useState } from 'react';
import { api } from '../services/api';

function LogoUpload({ companyId }: { companyId: string }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo
    if (!file.type.match(/image\/(jpeg|jpg|png|gif|webp)/)) {
      alert('Formato inválido. Use JPG, PNG, GIF ou WEBP');
      return;
    }

    // Validar tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Arquivo muito grande. Máximo: 5MB');
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    // Upload
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('logo', file);

      const response = await api.post(`/companies/admin/${companyId}/logo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Logo atualizada com sucesso!');
      console.log('Nova URL:', response.data.logoUrl);
    } catch (err) {
      console.error(err);
      alert('Erro ao fazer upload');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h3>Upload de Logo</h3>
      {preview && <img src={preview} alt="Preview" style={{ maxWidth: 200 }} />}
      <input
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        onChange={handleFileChange}
        disabled={uploading}
      />
      {uploading && <span>Enviando...</span>}
    </div>
  );
}
```

### Erros Possíveis

#### 400 Bad Request

```json
{
  "statusCode": 400,
  "message": "Apenas arquivos de imagem são permitidos (jpg, jpeg, png, gif, webp)"
}
```

**Causa:** Formato de arquivo inválido

```json
{
  "statusCode": 400,
  "message": "File too large"
}
```

**Causa:** Arquivo maior que 5MB

---

## 3. Remover Logo

### Endpoint

```
DELETE /companies/admin/:id/logo
```

### Descrição

Remove a logo da empresa, limpando os campos `logoUrl`, `logoFileName` e `logoMimeType`.

### Parâmetros de Rota

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `id` | string | ID da empresa |

### Autenticação

```
Authorization: Bearer {token}
x-company-id: {companyId}
```

### Resposta de Sucesso

**Status:** `200 OK`

```json
{
  "id": "cm2r8g9h40000vy9x1a2b3c4d",
  "razaoSocial": "Empresa Alpha Comércio Ltda",
  "logoUrl": null,
  "logoFileName": null,
  "logoMimeType": null,
  "hasCertificadoA1": true,
  "updatedAt": "2025-10-25T15:50:00.000Z"
}
```

### Exemplos de Uso

#### cURL

```bash
curl -X DELETE http://localhost:3000/companies/admin/cm2r8g9h40000vy9x1a2b3c4d/logo \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "x-company-id: cm2r8g9h40000vy9x1a2b3c4d"
```

#### JavaScript/TypeScript

```typescript
async function removeLogo(companyId: string) {
  const response = await fetch(`http://localhost:3000/companies/admin/${companyId}/logo`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-company-id': selectedCompanyId,
    },
  });

  return await response.json();
}
```

---

## 4. Upload de Certificado Digital A1

### Endpoint

```
POST /companies/admin/:id/certificate
```

### Descrição

Faz upload de um certificado digital A1 (.pfx ou .p12) para a empresa, usado para emissão de notas fiscais eletrônicas.

### Parâmetros de Rota

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `id` | string | ID da empresa |

### Autenticação

```
Authorization: Bearer {token}
x-company-id: {companyId}
```

### Corpo da Requisição

**Content-Type:** `multipart/form-data`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `certificate` | File | Sim | Arquivo do certificado (.pfx ou .p12) |
| `senha` | string | Sim | Senha do certificado |

### Especificações do Arquivo

| Especificação | Valor |
|---------------|-------|
| **Formatos aceitos** | .pfx, .p12 |
| **Tamanho máximo** | 10 MB |
| **Campo do form-data** | `certificate` |

### Resposta de Sucesso

**Status:** `200 OK`

```json
{
  "id": "cm2r8g9h40000vy9x1a2b3c4d",
  "razaoSocial": "Empresa Alpha Comércio Ltda",
  "nomeFantasia": "Empresa Alpha",
  "hasCertificadoA1": true,
  "updatedAt": "2025-10-25T16:00:00.000Z"
}
```

**✅ SEGURANÇA:** 
- A senha é automaticamente **criptografada com bcrypt** antes de ser armazenada
- Os campos `certificadoDigitalPath` e `certificadoDigitalSenha` **NUNCA** são retornados na API
- O campo `hasCertificadoA1` indica se há certificado cadastrado

### Exemplos de Uso

#### cURL

```bash
curl -X POST http://localhost:3000/companies/admin/cm2r8g9h40000vy9x1a2b3c4d/certificate \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "x-company-id: cm2r8g9h40000vy9x1a2b3c4d" \
  -F "certificate=@/path/to/certificado.pfx" \
  -F "senha=minha_senha_certificado"
```

#### JavaScript (FormData)

```typescript
async function uploadCertificate(companyId: string, file: File, senha: string) {
  const formData = new FormData();
  formData.append('certificate', file);
  formData.append('senha', senha);

  const response = await fetch(`http://localhost:3000/companies/admin/${companyId}/certificate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-company-id': selectedCompanyId,
    },
    body: formData,
  });

  return await response.json();
}
```

#### React Component

```typescript
import { useState } from 'react';
import { api } from '../services/api';

function CertificateUpload({ companyId }: { companyId: string }) {
  const [uploading, setUploading] = useState(false);
  const [senha, setSenha] = useState('');

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const fileInput = e.currentTarget.querySelector<HTMLInputElement>('input[type="file"]');
    const file = fileInput?.files?.[0];
    
    if (!file) {
      alert('Selecione um arquivo');
      return;
    }

    if (!senha) {
      alert('Informe a senha do certificado');
      return;
    }

    // Validar extensão
    if (!file.name.match(/\.(pfx|p12)$/i)) {
      alert('Formato inválido. Use .pfx ou .p12');
      return;
    }

    // Validar tamanho (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Arquivo muito grande. Máximo: 10MB');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('certificate', file);
      formData.append('senha', senha);

      await api.post(`/companies/admin/${companyId}/certificate`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Certificado enviado com sucesso!');
      setSenha('');
      if (fileInput) fileInput.value = '';
    } catch (err) {
      console.error(err);
      alert('Erro ao fazer upload');
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleUpload}>
      <h3>Upload de Certificado Digital A1</h3>
      
      <div>
        <label>
          Arquivo do Certificado (.pfx ou .p12):
          <input
            type="file"
            accept=".pfx,.p12"
            disabled={uploading}
            required
          />
        </label>
      </div>

      <div>
        <label>
          Senha do Certificado:
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            disabled={uploading}
            required
          />
        </label>
      </div>

      <button type="submit" disabled={uploading}>
        {uploading ? 'Enviando...' : 'Enviar Certificado'}
      </button>
    </form>
  );
}
```

### Erros Possíveis

#### 400 Bad Request

```json
{
  "statusCode": 400,
  "message": "Apenas arquivos de certificado digital são permitidos (.pfx ou .p12)"
}
```

**Causa:** Formato de arquivo inválido

```json
{
  "statusCode": 400,
  "message": [
    "senha should not be empty"
  ]
}
```

**Causa:** Senha não informada

---

## 5. Remover Certificado Digital

### Endpoint

```
DELETE /companies/admin/:id/certificate
```

### Descrição

Remove o certificado digital da empresa, limpando os campos `certificadoDigitalPath` e `certificadoDigitalSenha`.

### Parâmetros de Rota

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `id` | string | ID da empresa |

### Autenticação

```
Authorization: Bearer {token}
x-company-id: {companyId}
```

### Resposta de Sucesso

**Status:** `200 OK`

```json
{
  "id": "cm2r8g9h40000vy9x1a2b3c4d",
  "razaoSocial": "Empresa Alpha Comércio Ltda",
  "hasCertificadoA1": false,
  "updatedAt": "2025-10-25T16:05:00.000Z"
}
```

**Nota:** Após remover o certificado, `hasCertificadoA1` retorna `false`.

### Exemplos de Uso

#### cURL

```bash
curl -X DELETE http://localhost:3000/companies/admin/cm2r8g9h40000vy9x1a2b3c4d/certificate \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "x-company-id: cm2r8g9h40000vy9x1a2b3c4d"
```

#### JavaScript/TypeScript

```typescript
async function removeCertificate(companyId: string) {
  const response = await fetch(`http://localhost:3000/companies/admin/${companyId}/certificate`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-company-id': selectedCompanyId,
    },
  });

  return await response.json();
}
```

---

## Notas Importantes

### Segurança

1. ✅ **Senhas de Certificado**: Senhas são **automaticamente criptografadas** com bcrypt (10 rounds) antes de serem armazenadas
2. 🔒 **Certificados Sensíveis**: Certificados digitais são dados extremamente sensíveis
3. 🛡️ **Acesso Restrito**: Apenas admins podem fazer upload/remoção
4. 📁 **Armazenamento**: Arquivos são salvos localmente no servidor em `uploads/`
5. 🔐 **Validação de Senha**: Use o método `validateCertificatePassword()` para validar senha quando necessário (emissão de NF-e)

### Upload de Arquivos

1. ✅ **Validação de Tipo**: Servidor valida extensões dos arquivos
2. ✅ **Limite de Tamanho**: Logo (5MB), Certificado (10MB)
3. ✅ **Nomes Únicos**: Arquivos recebem nomes únicos com timestamp
4. 📂 **Estrutura de Pastas**:
   - Logos: `uploads/logos/`
   - Certificados: `uploads/certificates/`

### URLs de Acesso

- **Logo**: `http://localhost:3000/uploads/logos/logo-{timestamp}-{random}.{ext}`
- **Certificado**: Não acessível via URL (apenas path no servidor)

### Recomendações de Produção

1. 🌐 **CDN**: Use CDN (Cloudinary, AWS S3, etc) para logos em produção
2. ✅ **Criptografia**: Senhas de certificados JÁ são criptografadas com bcrypt
3. 🗄️ **Backup**: Faça backup regular dos certificados
4. 📊 **Logs**: Registre uploads/remoções para auditoria
5. 🔄 **Renovação**: Implemente alertas de expiração de certificados
6. 🔐 **HSM**: Em ambientes críticos, considere usar HSM (Hardware Security Module) para armazenar certificados

## Fluxo Completo de Uso

```
1. Admin acessa painel de empresas
   ↓
2. Busca detalhes da empresa (GET /companies/admin/:id)
   ↓
3. Atualiza informações básicas (PATCH /companies/admin/:id)
   ↓
4. Upload de logo (POST /companies/admin/:id/logo)
   ↓
5. Upload de certificado A1 (POST /companies/admin/:id/certificate)
   ↓
6. Sistema valida e armazena arquivos
   ↓
7. Empresa pronta para emissão de NF-e
```
