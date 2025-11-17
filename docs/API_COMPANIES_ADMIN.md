# API de Gestão de Empresas - Documentação para Administradores

## 📋 Visão Geral

Este documento descreve todos os endpoints disponíveis para **administradores** gerenciarem empresas no sistema ERP, incluindo criação, listagem, edição, upload de certificados e auditoria.

---

## 🔐 Autenticação

Todos os endpoints requerem autenticação via **JWT Token** no header:

```http
Authorization: Bearer {seu_token_jwt}
```

### Permissões Necessárias

| Operação | Permissão | Descrição |
|----------|-----------|-----------|
| Criar empresa | `companies.create` | Permite criar novas empresas |
| Listar empresas | `companies.read` | Permite visualizar empresas |
| Editar empresa | `companies.update` | Permite modificar dados de empresas |
| Deletar empresa | `companies.delete` | Permite remover empresas |

---

## 📚 Índice de Endpoints

1. [POST /companies](#1-post-companies) - Criar empresa
2. [GET /companies/admin/all](#2-get-companiesadminall) - Listar todas as empresas
3. [GET /companies/admin/:id](#3-get-companiesadminid) - Buscar empresa por ID
4. [PATCH /companies/admin/:id](#4-patch-companiesadminid) - Editar empresa (admin)
5. [POST /companies/admin/:id/logo](#5-post-companiesadminidlogo) - Upload de logo
6. [DELETE /companies/admin/:id/logo](#6-delete-companiesadminidlogo) - Remover logo
7. [POST /companies/admin/:id/certificate](#7-post-companiesadminidcertificate) - Upload de certificado A1
8. [DELETE /companies/admin/:id/certificate](#8-delete-companiesadminidcertificate) - Remover certificado
9. [GET /companies/admin/:id/audit](#9-get-companiesadminidaudit) - Histórico de auditoria
10. [DELETE /companies/:id](#10-delete-companiesid) - Deletar empresa
11. [PATCH /companies/:id/toggle-active](#11-patch-companiesidtoggle-active) - Ativar/Desativar empresa

---

## 1. POST /companies

Cria uma nova empresa no sistema.

### Endpoint
```
POST /companies
```

### Headers
```http
Authorization: Bearer {token}
Content-Type: application/json
```

### Payload

```json
{
  "razaoSocial": "EMPRESA EXEMPLO LTDA",
  "nomeFantasia": "Empresa Exemplo",
  "cnpj": "12345678000195",
  "inscricaoEstadual": "123456789",
  "inscricaoMunicipal": "12345",
  "regimeTributario": "SIMPLES_NACIONAL",
  "cnaePrincipal": "4712100",
  "cnaeSecundarios": ["4713000", "4729699"],
  "dataAbertura": "2020-01-15T00:00:00.000Z",
  "situacaoCadastral": "Ativa",
  "logradouro": "Avenida Paulista",
  "numero": "1000",
  "complemento": "Sala 200",
  "bairro": "Bela Vista",
  "cidade": "São Paulo",
  "estado": "SP",
  "cep": "01310100",
  "pais": "Brasil",
  "telefone": "1134567890",
  "celular": "11987654321",
  "email": "contato@empresaexemplo.com.br",
  "site": "https://www.empresaexemplo.com.br",
  "tipoContribuinte": "ICMS",
  "regimeApuracao": "SIMPLES_NACIONAL",
  "codigoMunicipioIBGE": "3550308",
  "codigoEstadoIBGE": "35",
  "cfopPadrao": "5102",
  "serieNFe": "1",
  "serieNFCe": "1",
  "serieNFSe": "1",
  "ambienteFiscal": "HOMOLOGACAO",
  "respTecCNPJ": "12345678000195",
  "respTecContato": "João Silva",
  "respTecEmail": "joao@software.com",
  "respTecFone": "11987654321",
  "active": true
}
```

### Campos Obrigatórios

| Campo | Tipo | Validação | Descrição |
|-------|------|-----------|-----------|
| `razaoSocial` | String | 3-200 caracteres | Nome jurídico da empresa |
| `cnpj` | String | 14 dígitos (apenas números) | CNPJ da empresa |

### Campos Opcionais (Recomendados para NFe)

| Campo | Tipo | Validação | Descrição |
|-------|------|-----------|-----------|
| `nomeFantasia` | String | 3-200 caracteres | Nome comercial |
| `inscricaoEstadual` | String | - | IE ou "ISENTO" |
| `logradouro` | String | - | Rua, Avenida, etc. |
| `numero` | String | - | Número do endereço |
| `bairro` | String | - | Bairro |
| `cidade` | String | - | Município |
| `estado` | String | 2 caracteres | UF (sigla) |
| `cep` | String | 8 dígitos | CEP sem hífen |
| `codigoMunicipioIBGE` | String | 7 dígitos | Código IBGE |
| `regimeTributario` | String | Enum | `SIMPLES_NACIONAL`, `SIMPLES_NACIONAL_EXCESSO`, `REGIME_NORMAL` |
| `cnaePrincipal` | String | 7 dígitos | CNAE principal |
| `serieNFe` | String | 1-3 caracteres | Série da NFe (geralmente "1") |
| `ambienteFiscal` | String | Enum | `HOMOLOGACAO` ou `PRODUCAO` |
| `respTecCNPJ` | String | 14 dígitos | CNPJ do responsável técnico* |
| `respTecContato` | String | - | Nome do contato técnico* |
| `respTecEmail` | String | Email válido | Email do responsável técnico* |
| `respTecFone` | String | 10-11 dígitos | Telefone do responsável técnico* |
| `email` | String | Email válido | Email da empresa |

> ⚠️ *Campos de Responsável Técnico são obrigatórios para emissão de NFe desde 01/04/2024.

### Resposta de Sucesso

**Status:** `201 Created`

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "razaoSocial": "EMPRESA EXEMPLO LTDA",
  "nomeFantasia": "Empresa Exemplo",
  "cnpj": "12345678000195",
  "inscricaoEstadual": "123456789",
  "inscricaoMunicipal": "12345",
  "regimeTributario": "SIMPLES_NACIONAL",
  "cnaePrincipal": "4712100",
  "cnaeSecundarios": ["4713000", "4729699"],
  "dataAbertura": "2020-01-15T00:00:00.000Z",
  "situacaoCadastral": "Ativa",
  "logradouro": "Avenida Paulista",
  "numero": "1000",
  "complemento": "Sala 200",
  "bairro": "Bela Vista",
  "cidade": "São Paulo",
  "estado": "SP",
  "cep": "01310100",
  "pais": "Brasil",
  "codigoMunicipioIBGE": "3550308",
  "codigoEstadoIBGE": "35",
  "cfopPadrao": "5102",
  "telefone": "1134567890",
  "celular": "11987654321",
  "email": "contato@empresaexemplo.com.br",
  "site": "https://www.empresaexemplo.com.br",
  "tipoContribuinte": "ICMS",
  "regimeApuracao": "SIMPLES_NACIONAL",
  "serieNFe": "1",
  "ultimoNumeroNFe": 0,
  "serieNFCe": "1",
  "ultimoNumeroNFCe": 0,
  "serieNFSe": "1",
  "ultimoNumeroNFSe": 0,
  "ambienteFiscal": "HOMOLOGACAO",
  "respTecCNPJ": "12345678000195",
  "respTecContato": "João Silva",
  "respTecEmail": "joao@software.com",
  "respTecFone": "11987654321",
  "logoUrl": null,
  "logoFileName": null,
  "logoMimeType": null,
  "certificadoDigitalPath": null,
  "active": true,
  "createdAt": "2025-11-16T20:30:00.000Z",
  "updatedAt": "2025-11-16T20:30:00.000Z"
}
```

### Erros Possíveis

#### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": [
    "Razão social é obrigatória",
    "CNPJ deve ter 14 caracteres",
    "CNPJ deve conter apenas números",
    "Email deve ser válido"
  ],
  "error": "Bad Request"
}
```

#### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "Já existe uma empresa cadastrada com este CNPJ",
  "error": "Conflict"
}
```

#### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Você não tem permissão para criar empresas",
  "error": "Forbidden"
}
```

---

## 2. GET /companies/admin/all

Lista todas as empresas do sistema com paginação e busca.

### Endpoint
```
GET /companies/admin/all
```

### Query Parameters

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `search` | String | Não | Busca por razão social, CNPJ ou nome fantasia |
| `page` | Number | Não | Número da página (padrão: 1) |
| `limit` | Number | Não | Itens por página (padrão: 20, máx: 100) |

### Exemplo de Requisição

```http
GET /companies/admin/all?search=exemplo&page=1&limit=20
Authorization: Bearer {token}
```

### Resposta de Sucesso

**Status:** `200 OK`

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "razaoSocial": "EMPRESA EXEMPLO LTDA",
      "nomeFantasia": "Empresa Exemplo",
      "cnpj": "12345678000195",
      "inscricaoEstadual": "123456789",
      "cidade": "São Paulo",
      "estado": "SP",
      "email": "contato@empresaexemplo.com.br",
      "active": true,
      "createdAt": "2025-11-16T20:30:00.000Z"
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "razaoSocial": "OUTRA EMPRESA LTDA",
      "nomeFantasia": "Outra Empresa",
      "cnpj": "98765432000187",
      "inscricaoEstadual": "987654321",
      "cidade": "Rio de Janeiro",
      "estado": "RJ",
      "email": "contato@outraempresa.com.br",
      "active": true,
      "createdAt": "2025-11-15T10:00:00.000Z"
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

---

## 3. GET /companies/admin/:id

Busca uma empresa específica por ID com todos os detalhes.

### Endpoint
```
GET /companies/admin/:id
```

### Parâmetros de URL

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `id` | UUID | ID da empresa |

### Exemplo de Requisição

```http
GET /companies/admin/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer {token}
```

### Resposta de Sucesso

**Status:** `200 OK`

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "razaoSocial": "EMPRESA EXEMPLO LTDA",
  "nomeFantasia": "Empresa Exemplo",
  "cnpj": "12345678000195",
  "inscricaoEstadual": "123456789",
  "inscricaoMunicipal": "12345",
  "regimeTributario": "SIMPLES_NACIONAL",
  "cnaePrincipal": "4712100",
  "cnaeSecundarios": ["4713000", "4729699"],
  "dataAbertura": "2020-01-15T00:00:00.000Z",
  "situacaoCadastral": "Ativa",
  "logradouro": "Avenida Paulista",
  "numero": "1000",
  "complemento": "Sala 200",
  "bairro": "Bela Vista",
  "cidade": "São Paulo",
  "estado": "SP",
  "cep": "01310100",
  "pais": "Brasil",
  "codigoMunicipioIBGE": "3550308",
  "telefone": "1134567890",
  "celular": "11987654321",
  "email": "contato@empresaexemplo.com.br",
  "serieNFe": "1",
  "ultimoNumeroNFe": 150,
  "ambienteFiscal": "PRODUCAO",
  "certificadoDigitalPath": "/uploads/certificados/cert_550e8400.pfx",
  "respTecCNPJ": "12345678000195",
  "respTecContato": "João Silva",
  "respTecEmail": "joao@software.com",
  "respTecFone": "11987654321",
  "logoUrl": "https://api.erp.com/uploads/logos/logo_550e8400.png",
  "active": true,
  "createdAt": "2025-11-16T20:30:00.000Z",
  "updatedAt": "2025-11-16T22:15:00.000Z",
  "_stats": {
    "totalUsers": 15,
    "totalProducts": 250,
    "totalCustomers": 120,
    "totalSales": 1500
  }
}
```

### Erros Possíveis

#### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Empresa não encontrada",
  "error": "Not Found"
}
```

---

## 4. PATCH /companies/admin/:id

Atualiza os dados de uma empresa (acesso admin).

### Endpoint
```
PATCH /companies/admin/:id
```

### Payload

Todos os campos são opcionais. Envie apenas os campos que deseja atualizar.

```json
{
  "razaoSocial": "EMPRESA EXEMPLO EDITADA LTDA",
  "nomeFantasia": "Empresa Exemplo Editada",
  "inscricaoEstadual": "999888777",
  "logradouro": "Rua Nova",
  "numero": "2000",
  "bairro": "Centro",
  "cidade": "São Paulo",
  "estado": "SP",
  "cep": "01234567",
  "codigoMunicipioIBGE": "3550308",
  "email": "novo@email.com.br",
  "telefone": "1199999999",
  "serieNFe": "2",
  "ambienteFiscal": "PRODUCAO",
  "respTecCNPJ": "12345678000195",
  "respTecContato": "Maria Santos",
  "respTecEmail": "maria@software.com",
  "respTecFone": "11988887777"
}
```

### Resposta de Sucesso

**Status:** `200 OK`

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "razaoSocial": "EMPRESA EXEMPLO EDITADA LTDA",
  "nomeFantasia": "Empresa Exemplo Editada",
  "cnpj": "12345678000195",
  "inscricaoEstadual": "999888777",
  "logradouro": "Rua Nova",
  "numero": "2000",
  "bairro": "Centro",
  "cidade": "São Paulo",
  "estado": "SP",
  "cep": "01234567",
  "codigoMunicipioIBGE": "3550308",
  "email": "novo@email.com.br",
  "telefone": "1199999999",
  "serieNFe": "2",
  "ambienteFiscal": "PRODUCAO",
  "respTecCNPJ": "12345678000195",
  "respTecContato": "Maria Santos",
  "respTecEmail": "maria@software.com",
  "respTecFone": "11988887777",
  "updatedAt": "2025-11-16T23:00:00.000Z"
}
```

---

## 5. POST /companies/admin/:id/logo

Faz upload do logo da empresa.

### Endpoint
```
POST /companies/admin/:id/logo
```

### Headers
```http
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

### Form Data

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `logo` | File | Sim | Arquivo de imagem (PNG, JPG, JPEG, GIF) |

### Restrições

- **Formatos aceitos:** `.png`, `.jpg`, `.jpeg`, `.gif`
- **Tamanho máximo:** 5 MB
- **Dimensões recomendadas:** 300x300px (quadrado)

### Exemplo com cURL

```bash
curl -X POST \
  https://api.erp.com/companies/admin/550e8400-e29b-41d4-a716-446655440000/logo \
  -H 'Authorization: Bearer {token}' \
  -F 'logo=@/path/to/logo.png'
```

### Resposta de Sucesso

**Status:** `200 OK`

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "logoUrl": "https://api.erp.com/uploads/logos/logo_550e8400_1700172000000.png",
  "logoFileName": "logo_550e8400_1700172000000.png",
  "logoMimeType": "image/png",
  "updatedAt": "2025-11-16T23:30:00.000Z"
}
```

### Erros Possíveis

#### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Formato de arquivo inválido. Aceitos: PNG, JPG, JPEG, GIF",
  "error": "Bad Request"
}
```

```json
{
  "statusCode": 400,
  "message": "Arquivo muito grande. Tamanho máximo: 5 MB",
  "error": "Bad Request"
}
```

---

## 6. DELETE /companies/admin/:id/logo

Remove o logo da empresa.

### Endpoint
```
DELETE /companies/admin/:id/logo
```

### Resposta de Sucesso

**Status:** `200 OK`

```json
{
  "message": "Logo removido com sucesso",
  "id": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

## 7. POST /companies/admin/:id/certificate

Faz upload do certificado digital A1 para emissão de NFe.

### Endpoint
```
POST /companies/admin/:id/certificate
```

### Headers
```http
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

### Form Data

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `certificate` | File | Sim | Arquivo de certificado (.pfx ou .p12) |
| `senha` | String | Sim | Senha do certificado |

### Restrições

- **Formatos aceitos:** `.pfx`, `.p12`
- **Tamanho máximo:** 10 MB
- **Tipo:** Certificado A1 válido

### Exemplo com cURL

```bash
curl -X POST \
  https://api.erp.com/companies/admin/550e8400-e29b-41d4-a716-446655440000/certificate \
  -H 'Authorization: Bearer {token}' \
  -F 'certificate=@/path/to/certificado.pfx' \
  -F 'senha=senha_do_certificado'
```

### Resposta de Sucesso

**Status:** `200 OK`

```json
{
  "message": "Certificado digital instalado com sucesso",
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "certificadoDigitalPath": "/uploads/certificados/cert_550e8400_1700172000000.pfx",
  "certificateInfo": {
    "subject": "CN=EMPRESA EXEMPLO LTDA:12345678000195",
    "issuer": "CN=AC Certisign NFe G5",
    "validFrom": "2024-01-01T00:00:00.000Z",
    "validTo": "2025-12-31T23:59:59.000Z",
    "serialNumber": "1234567890ABCDEF"
  },
  "updatedAt": "2025-11-16T23:45:00.000Z"
}
```

### Erros Possíveis

#### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Formato de arquivo inválido. Aceitos: PFX, P12",
  "error": "Bad Request"
}
```

```json
{
  "statusCode": 400,
  "message": "Senha do certificado é obrigatória",
  "error": "Bad Request"
}
```

```json
{
  "statusCode": 400,
  "message": "Senha do certificado incorreta",
  "error": "Bad Request"
}
```

```json
{
  "statusCode": 400,
  "message": "Certificado expirado. Validade: 2023-12-31",
  "error": "Bad Request"
}
```

---

## 8. DELETE /companies/admin/:id/certificate

Remove o certificado digital da empresa.

### Endpoint
```
DELETE /companies/admin/:id/certificate
```

### Resposta de Sucesso

**Status:** `200 OK`

```json
{
  "message": "Certificado digital removido com sucesso",
  "id": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

## 9. GET /companies/admin/:id/audit

Busca o histórico de auditoria da empresa.

### Endpoint
```
GET /companies/admin/:id/audit
```

### Query Parameters

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `page` | Number | Não | Número da página (padrão: 1) |
| `limit` | Number | Não | Itens por página (padrão: 50) |
| `action` | String | Não | Filtrar por ação (`CREATE`, `UPDATE`, `DELETE`) |

### Exemplo de Requisição

```http
GET /companies/admin/550e8400-e29b-41d4-a716-446655440000/audit?page=1&limit=20&action=UPDATE
Authorization: Bearer {token}
```

### Resposta de Sucesso

**Status:** `200 OK`

```json
{
  "data": [
    {
      "id": "audit_001",
      "companyId": "550e8400-e29b-41d4-a716-446655440000",
      "userId": "user_123",
      "userName": "Admin User",
      "action": "UPDATE",
      "entityType": "Company",
      "entityId": "550e8400-e29b-41d4-a716-446655440000",
      "changes": {
        "before": {
          "email": "antigo@email.com",
          "telefone": "1134567890"
        },
        "after": {
          "email": "novo@email.com",
          "telefone": "1199999999"
        }
      },
      "ipAddress": "192.168.1.100",
      "userAgent": "Mozilla/5.0...",
      "createdAt": "2025-11-16T23:00:00.000Z"
    },
    {
      "id": "audit_002",
      "companyId": "550e8400-e29b-41d4-a716-446655440000",
      "userId": "user_123",
      "userName": "Admin User",
      "action": "CREATE",
      "entityType": "Company",
      "entityId": "550e8400-e29b-41d4-a716-446655440000",
      "changes": {
        "after": {
          "razaoSocial": "EMPRESA EXEMPLO LTDA",
          "cnpj": "12345678000195"
        }
      },
      "ipAddress": "192.168.1.100",
      "userAgent": "Mozilla/5.0...",
      "createdAt": "2025-11-16T20:30:00.000Z"
    }
  ],
  "meta": {
    "total": 15,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

---

## 10. DELETE /companies/:id

Deleta uma empresa (soft delete).

### Endpoint
```
DELETE /companies/:id
```

### Resposta de Sucesso

**Status:** `200 OK`

```json
{
  "message": "Empresa removida com sucesso",
  "id": "550e8400-e29b-41d4-a716-446655440000"
}
```

### ⚠️ Atenção

- Esta operação é **irreversível**
- Todos os dados relacionados (usuários, produtos, vendas, etc.) serão removidos em cascata
- Recomenda-se fazer backup antes de deletar

---

## 11. PATCH /companies/:id/toggle-active

Ativa ou desativa uma empresa.

### Endpoint
```
PATCH /companies/:id/toggle-active
```

### Resposta de Sucesso

**Status:** `200 OK`

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "razaoSocial": "EMPRESA EXEMPLO LTDA",
  "active": false,
  "updatedAt": "2025-11-17T00:00:00.000Z"
}
```

---

## ✅ Validações Importantes

### 1. CNPJ

```typescript
// Deve ter 14 dígitos (apenas números)
// Validação de dígitos verificadores
const validateCNPJ = (cnpj: string): boolean => {
  const cleaned = cnpj.replace(/\D/g, '');
  if (cleaned.length !== 14) return false;
  // ... validação completa dos dígitos verificadores
};
```

**Erros comuns:**
- ❌ `12.345.678/0001-95` (com máscara)
- ✅ `12345678000195` (apenas números)

### 2. CEP

```typescript
// Deve ter 8 dígitos (sem hífen)
const validateCEP = (cep: string): boolean => {
  return /^\d{8}$/.test(cep);
};
```

**Erros comuns:**
- ❌ `01310-100` (com hífen)
- ✅ `01310100` (apenas números)

### 3. Código IBGE

```typescript
// Deve ter 7 dígitos
const validateCodigoIBGE = (codigo: string): boolean => {
  return /^\d{7}$/.test(codigo);
};
```

### 4. Estado (UF)

```typescript
// Deve ter exatamente 2 caracteres
const VALID_UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];
```

### 5. Email

```typescript
// Deve ser um email válido
const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
```

### 6. Regime Tributário

```typescript
enum RegimeTributario {
  SIMPLES_NACIONAL = 'SIMPLES_NACIONAL',
  SIMPLES_NACIONAL_EXCESSO = 'SIMPLES_NACIONAL_EXCESSO',
  REGIME_NORMAL = 'REGIME_NORMAL',
}
```

### 7. Ambiente Fiscal

```typescript
enum AmbienteFiscal {
  HOMOLOGACAO = 'HOMOLOGACAO', // Testes
  PRODUCAO = 'PRODUCAO',        // NFe real
}
```

⚠️ **Importante:** Para usar `PRODUCAO`, é obrigatório ter certificado digital válido.

### 8. CNAEs (Atividades Econômicas)

```typescript
// CNAE Principal - 1 único CNAE obrigatório
cnaePrincipal: string; // Exemplo: "4712100"

// CNAEs Secundários - Array com múltiplas atividades (opcional)
cnaeSecundarios: string[]; // Exemplo: ["4713000", "4729699", "4781400"]
```

**Estrutura do CNAE:**
- 7 dígitos numéricos
- Formato: `XXXX-X/XX` (mas enviar sem máscara: `XXXXXXX`)

**Exemplos práticos:**

| CNAE | Descrição |
|------|-----------|
| `4712100` | Comércio varejista de mercadorias em geral |
| `4713000` | Lojas de departamentos ou magazines |
| `4729699` | Comércio varejista de produtos alimentícios em geral |
| `4781400` | Comércio varejista de artigos do vestuário e acessórios |
| `6201500` | Desenvolvimento de programas de computador sob encomenda |
| `6202300` | Desenvolvimento e licenciamento de programas de computador customizáveis |

**Validação:**
```typescript
// CNAE Principal
cnaePrincipal: "4712100" // ✅ Correto

// CNAEs Secundários (múltiplos)
cnaeSecundarios: ["4713000", "4729699", "4781400"] // ✅ Correto - Array com vários CNAEs

// Erros comuns
cnaePrincipal: "47.12-1/00" // ❌ Não enviar com máscara
cnaeSecundarios: "4713000"  // ❌ Deve ser array, não string
```

**📋 Como encontrar CNAEs:**
- [Consulta CNAE - IBGE](https://concla.ibge.gov.br/busca-online-cnae.html)
- Verificar no Cartão CNPJ da empresa
- Consultar no Portal da Receita Federal

---

## 🚨 Códigos de Erro HTTP

| Código | Significado | Quando Acontece |
|--------|-------------|-----------------|
| 200 | OK | Requisição bem-sucedida |
| 201 | Created | Recurso criado com sucesso |
| 400 | Bad Request | Validação falhou, dados inválidos |
| 401 | Unauthorized | Token inválido ou ausente |
| 403 | Forbidden | Sem permissão para acessar |
| 404 | Not Found | Recurso não encontrado |
| 409 | Conflict | Conflito (ex: CNPJ duplicado) |
| 500 | Internal Server Error | Erro no servidor |

---

## 📊 Exemplos de Uso

### Exemplo 1: Criar Empresa Completa para NFe

```javascript
const createCompany = async () => {
  const response = await fetch('https://api.erp.com/companies', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      razaoSocial: 'EMPRESA EXEMPLO LTDA',
      nomeFantasia: 'Empresa Exemplo',
      cnpj: '12345678000195',
      inscricaoEstadual: '123456789',
      logradouro: 'Avenida Paulista',
      numero: '1000',
      bairro: 'Bela Vista',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01310100',
      codigoMunicipioIBGE: '3550308',
      regimeTributario: 'SIMPLES_NACIONAL',
      cnaePrincipal: '4712100',
      cnaeSecundarios: ['4713000', '4729699'], // Múltiplas atividades
      serieNFe: '1',
      ambienteFiscal: 'HOMOLOGACAO',
      respTecCNPJ: '12345678000195',
      respTecContato: 'João Silva',
      respTecEmail: 'joao@software.com',
      respTecFone: '11987654321',
      email: 'contato@exemplo.com.br',
      telefone: '1134567890',
      active: true,
    }),
  });

  const data = await response.json();
  console.log('Empresa criada:', data);
  return data;
};
```

### Exemplo 2: Upload de Certificado

```javascript
const uploadCertificate = async (companyId, certificateFile, password) => {
  const formData = new FormData();
  formData.append('certificate', certificateFile);
  formData.append('senha', password);

  const response = await fetch(
    `https://api.erp.com/companies/admin/${companyId}/certificate`,
    {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
      },
      body: formData,
    }
  );

  const data = await response.json();
  console.log('Certificado instalado:', data);
  return data;
};
```

### Exemplo 3: Listar Empresas com Filtro

```javascript
const listCompanies = async (searchTerm, page = 1) => {
  const response = await fetch(
    `https://api.erp.com/companies/admin/all?search=${searchTerm}&page=${page}&limit=20`,
    {
      headers: {
        'Authorization': 'Bearer ' + token,
      },
    }
  );

  const data = await response.json();
  console.log(`Total: ${data.meta.total} empresas`);
  return data;
};
```

### Exemplo 4: Adicionar ou Remover CNAEs Secundários

```javascript
// Adicionar novos CNAEs secundários mantendo os existentes
const addCNAEs = async (companyId) => {
  // 1. Buscar a empresa atual
  const company = await fetch(
    `https://api.erp.com/companies/admin/${companyId}`,
    {
      headers: { 'Authorization': 'Bearer ' + token },
    }
  ).then(res => res.json());

  // 2. Adicionar novos CNAEs ao array existente
  const novosCNAEs = [...company.cnaeSecundarios, '4781400', '6201500'];

  // 3. Atualizar a empresa
  const response = await fetch(
    `https://api.erp.com/companies/admin/${companyId}`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cnaeSecundarios: novosCNAEs,
      }),
    }
  );

  return await response.json();
};

// Remover um CNAE específico
const removeCNAE = async (companyId, cnaeToRemove) => {
  // 1. Buscar a empresa atual
  const company = await fetch(
    `https://api.erp.com/companies/admin/${companyId}`,
    {
      headers: { 'Authorization': 'Bearer ' + token },
    }
  ).then(res => res.json());

  // 2. Filtrar removendo o CNAE desejado
  const cnaesFiltrados = company.cnaeSecundarios.filter(
    cnae => cnae !== cnaeToRemove
  );

  // 3. Atualizar a empresa
  const response = await fetch(
    `https://api.erp.com/companies/admin/${companyId}`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cnaeSecundarios: cnaesFiltrados,
      }),
    }
  );

  return await response.json();
};

// Substituir todos os CNAEs secundários
const replaceCNAEs = async (companyId) => {
  const response = await fetch(
    `https://api.erp.com/companies/admin/${companyId}`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cnaeSecundarios: ['4713000', '4729699', '4781400'], // Nova lista completa
      }),
    }
  );

  return await response.json();
};
```

---

## 🔗 Links Relacionados

- **[Cadastro de Empresa para NFe - Frontend](./NFE_COMPANY_FIELDS_FRONTEND.md)** - Guia completo dos campos necessários
- **[Validadores TypeScript](./NFE_COMPANY_VALIDATORS.md)** - Biblioteca de validação
- **[Quick Reference](./NFE_COMPANY_FIELDS_QUICK_REF.md)** - Referência rápida dos campos
- **[Códigos de Pagamento SEFAZ](./NFE_PAYMENT_CODES_FRONTEND.md)** - Formas de pagamento

---

## ✅ Checklist de Criação de Empresa

- [ ] Dados básicos (Razão Social, CNPJ)
- [ ] Endereço completo (incluindo código IBGE)
- [ ] Regime tributário e CNAE
- [ ] Série da NFe
- [ ] Ambiente fiscal (Homologação/Produção)
- [ ] Responsável Técnico (obrigatório para NFe)
- [ ] Contatos (email, telefone)
- [ ] Upload de logo (opcional)
- [ ] Upload de certificado A1 (obrigatório para produção)
- [ ] Testar emissão em homologação
- [ ] Ativar empresa

---

**🚀 API pronta para gerenciamento completo de empresas!**

> **Última atualização:** 16 de novembro de 2025  
> **Versão da API:** 1.0  
> **Base URL:** `https://api.erp.com`

