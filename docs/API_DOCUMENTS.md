# 📁 API de Documentos - Referência Completa

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Autenticação](#autenticação)
- [Permissões](#permissões)
- [Endpoints de Pastas](#endpoints-de-pastas)
- [Endpoints de Documentos](#endpoints-de-documentos)
- [Endpoints de Relatórios](#endpoints-de-relatórios)
- [Tipos de Dados](#tipos-de-dados)
- [Códigos de Erro](#códigos-de-erro)
- [Exemplos de Uso](#exemplos-de-uso)

---

## 🌐 Visão Geral

**Base URL:** `http://localhost:3000`

**Prefixo:** `/documents`

**Formato:** JSON (exceto upload/download)

**Versionamento:** v1

---

## 🔐 Autenticação

Todas as rotas requerem autenticação via **JWT Bearer Token**.

### Headers obrigatórios:
```http
Authorization: Bearer {seu-token-jwt}
Content-Type: application/json
```

### Como obter o token:
```http
POST /auth/login
Content-Type: application/json

{
  "email": "usuario@empresa.com",
  "password": "senha123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-uuid",
    "name": "Nome do Usuário",
    "email": "usuario@empresa.com"
  }
}
```

---

## 🔑 Permissões

O sistema utiliza 4 permissões para controle de acesso:

| Permissão | Descrição | Endpoints Permitidos |
|-----------|-----------|---------------------|
| **`documents.read`** | Visualizar documentos e pastas | GET (todos) |
| **`documents.create`** | Criar pastas e fazer upload | POST |
| **`documents.update`** | Editar metadados | PATCH |
| **`documents.delete`** | Deletar documentos e pastas | DELETE |

### Matriz de Permissões por Endpoint

| Endpoint | Método | Permissão Necessária |
|----------|--------|---------------------|
| `/documents/folders` | GET | `documents.read` |
| `/documents/folders` | POST | `documents.create` |
| `/documents/folders/:id` | PATCH | `documents.update` |
| `/documents/folders/:id` | DELETE | `documents.delete` |
| `/documents` | GET | `documents.read` |
| `/documents/:id` | GET | `documents.read` |
| `/documents/:id/download` | GET | `documents.read` |
| `/documents/upload` | POST | `documents.create` |
| `/documents/:id/version` | POST | `documents.create` |
| `/documents/:id` | PATCH | `documents.update` |
| `/documents/:id` | DELETE | `documents.delete` |
| `/documents/expired` | GET | `documents.read` |
| `/documents/stats` | GET | `documents.read` |

> **Nota:** O role `admin` já possui todas as 4 permissões por padrão.

---

## 📂 Endpoints de Pastas

### 1. Listar Todas as Pastas

Lista todas as pastas da empresa, com opção de filtrar por pasta pai.

**Endpoint:** `GET /documents/folders`

**Permissão:** `documents.read`

**Query Parameters:**

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `parentId` | string (UUID) | Não | ID da pasta pai (omitir para listar pastas raiz) |

**Request:**
```http
GET /documents/folders HTTP/1.1
Authorization: Bearer {token}
```

**Request (Subpastas):**
```http
GET /documents/folders?parentId=550e8400-e29b-41d4-a716-446655440000 HTTP/1.1
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "companyId": "company-uuid",
    "name": "Notas Fiscais",
    "description": "Notas fiscais e comprovantes da empresa",
    "color": "#4CAF50",
    "icon": "receipt",
    "parentId": null,
    "isPublic": false,
    "createdById": "user-uuid",
    "createdAt": "2024-10-27T10:30:00.000Z",
    "updatedAt": "2024-10-27T10:30:00.000Z",
    "createdBy": {
      "id": "user-uuid",
      "name": "João Silva",
      "email": "joao@empresa.com"
    },
    "documentsCount": 15,
    "subfoldersCount": 3
  },
  {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "companyId": "company-uuid",
    "name": "Contratos",
    "description": "Contratos e acordos",
    "color": "#2196F3",
    "icon": "description",
    "parentId": null,
    "isPublic": true,
    "createdById": "user-uuid",
    "createdAt": "2024-10-27T11:00:00.000Z",
    "updatedAt": "2024-10-27T11:00:00.000Z",
    "createdBy": {
      "id": "user-uuid",
      "name": "João Silva",
      "email": "joao@empresa.com"
    },
    "documentsCount": 8,
    "subfoldersCount": 0
  }
]
```

---

### 2. Criar Pasta

Cria uma nova pasta na empresa.

**Endpoint:** `POST /documents/folders`

**Permissão:** `documents.create`

**Request Body:**
```json
{
  "name": "Notas Fiscais",
  "description": "Notas fiscais e comprovantes da empresa",
  "color": "#4CAF50",
  "icon": "receipt",
  "parentId": null,
  "isPublic": false
}
```

**Validações:**

| Campo | Tipo | Obrigatório | Validação |
|-------|------|-------------|-----------|
| `name` | string | ✅ Sim | Min: 3, Max: 100 caracteres |
| `description` | string | ❌ Não | Max: 500 caracteres |
| `color` | string | ❌ Não | Formato hex (#RRGGBB) |
| `icon` | string | ❌ Não | Nome do ícone |
| `parentId` | string (UUID) | ❌ Não | UUID válido de pasta existente |
| `isPublic` | boolean | ❌ Não | Default: false |
| `allowedRoleIds` | string[] (UUIDs) | ❌ Não | Array de UUIDs de roles. Vazio = todas as roles |

> **Controle de Acesso por Roles:**
> - Se `allowedRoleIds` estiver vazio (`[]`), todos os usuários da empresa podem visualizar
> - Se `allowedRoleIds` tiver UUIDs, apenas usuários com essas roles podem visualizar
> - Exemplo: `["role-uuid-1", "role-uuid-2"]` - apenas usuários com role-uuid-1 OU role-uuid-2 podem ver

**Response:** `201 Created`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "companyId": "company-uuid",
  "name": "Notas Fiscais",
  "description": "Notas fiscais e comprovantes da empresa",
  "color": "#4CAF50",
  "icon": "receipt",
  "parentId": null,
  "isPublic": false,
  "createdById": "user-uuid",
  "createdAt": "2024-10-27T10:30:00.000Z",
  "updatedAt": "2024-10-27T10:30:00.000Z",
  "createdBy": {
    "id": "user-uuid",
    "name": "João Silva",
    "email": "joao@empresa.com"
  }
}
```

**Erros Possíveis:**

| Status | Erro | Descrição |
|--------|------|-----------|
| 400 | Bad Request | Validação falhou |
| 404 | Not Found | Pasta pai não encontrada |

---

### 3. Atualizar Pasta

Atualiza os metadados de uma pasta existente.

**Endpoint:** `PATCH /documents/folders/:id`

**Permissão:** `documents.update`

**Path Parameters:**

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `id` | string (UUID) | ID da pasta |

**Request Body:**
```json
{
  "name": "Notas Fiscais 2024",
  "description": "Notas fiscais do ano de 2024",
  "color": "#2196F3"
}
```

**Nota:** Todos os campos são opcionais (PartialType).

**Response:** `200 OK`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "companyId": "company-uuid",
  "name": "Notas Fiscais 2024",
  "description": "Notas fiscais do ano de 2024",
  "color": "#2196F3",
  "icon": "receipt",
  "parentId": null,
  "isPublic": false,
  "createdById": "user-uuid",
  "createdAt": "2024-10-27T10:30:00.000Z",
  "updatedAt": "2024-10-27T12:00:00.000Z"
}
```

**Erros Possíveis:**

| Status | Erro | Descrição |
|--------|------|-----------|
| 404 | Not Found | Pasta não encontrada ou não pertence à empresa |

---

### 4. Deletar Pasta

Deleta uma pasta. Por padrão, não permite deletar pastas com conteúdo.

**Endpoint:** `DELETE /documents/folders/:id`

**Permissão:** `documents.delete`

**Path Parameters:**

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `id` | string (UUID) | ID da pasta |

**Query Parameters:**

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `force` | boolean | Não | Se `true`, deleta mesmo com conteúdo (default: false) |

**Request (Seguro):**
```http
DELETE /documents/folders/550e8400-e29b-41d4-a716-446655440000 HTTP/1.1
Authorization: Bearer {token}
```

**Request (Forçado):**
```http
DELETE /documents/folders/550e8400-e29b-41d4-a716-446655440000?force=true HTTP/1.1
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "message": "Pasta deletada com sucesso"
}
```

**Erros Possíveis:**

| Status | Erro | Descrição |
|--------|------|-----------|
| 400 | Bad Request | Pasta contém documentos/subpastas e force=false |
| 404 | Not Found | Pasta não encontrada |

**Exemplo de erro (pasta não vazia):**
```json
{
  "statusCode": 400,
  "message": "Não é possível deletar pasta com 15 documentos e 3 subpastas. Use force=true para forçar.",
  "error": "Bad Request"
}
```

---

## 📄 Endpoints de Documentos

### 5. Listar Documentos

Lista todos os documentos da empresa com suporte a filtros avançados e paginação.

**Endpoint:** `GET /documents`

**Permissão:** `documents.read`

**Query Parameters:**

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `folderId` | string (UUID) | Não | Filtrar por pasta (use "null" para documentos sem pasta) |
| `documentType` | string | Não | Filtrar por tipo (invoice, contract, report, etc.) |
| `tags` | string | Não | Filtrar por tags (separadas por vírgula) |
| `expired` | boolean | Não | Filtrar por status de expiração (true/false) |
| `expiresIn` | number | Não | Documentos que expiram em X dias |
| `search` | string | Não | Busca full-text em nome, descrição, referência |
| `page` | number | Não | Número da página (default: 1) |
| `limit` | number | Não | Itens por página (default: 50, max: 100) |

**Request (Todos):**
```http
GET /documents HTTP/1.1
Authorization: Bearer {token}
```

**Request (Com Filtros):**
```http
GET /documents?folderId=550e8400-e29b-41d4-a716-446655440000&search=nota&page=1&limit=20 HTTP/1.1
Authorization: Bearer {token}
```

**Request (Por Tags):**
```http
GET /documents?tags=nota-fiscal,2024&documentType=invoice HTTP/1.1
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "total": 150,
  "page": 1,
  "limit": 20,
  "totalPages": 8,
  "documents": [
    {
      "id": "doc-uuid-1",
      "companyId": "company-uuid",
      "folderId": "folder-uuid",
      "name": "Nota Fiscal Janeiro 2024",
      "description": "Nota fiscal referente ao mês de janeiro/2024",
      "fileName": "nota-fiscal-001.pdf",
      "filePath": "uploads/documents/company-uuid/2024/01/unique-uuid.pdf",
      "fileSize": 2048576,
      "mimeType": "application/pdf",
      "fileExtension": ".pdf",
      "reference": "NF-2024-001",
      "documentType": "invoice",
      "tags": ["nota-fiscal", "janeiro", "2024"],
      "expiresAt": "2025-12-31T23:59:59.000Z",
      "isExpired": false,
      "version": 1,
      "previousVersionId": null,
      "isLatest": true,
      "isPublic": false,
      "uploadedById": "user-uuid",
      "createdAt": "2024-10-27T10:00:00.000Z",
      "updatedAt": "2024-10-27T10:00:00.000Z",
      "folder": {
        "id": "folder-uuid",
        "name": "Notas Fiscais",
        "color": "#4CAF50"
      },
      "uploadedBy": {
        "id": "user-uuid",
        "name": "João Silva",
        "email": "joao@empresa.com"
      },
      "daysUntilExpiration": 365,
      "downloadUrl": "/documents/doc-uuid-1/download"
    }
  ]
}
```

---

### 6. Ver Detalhes do Documento

Retorna os detalhes completos de um documento específico.

**Endpoint:** `GET /documents/:id`

**Permissão:** `documents.read`

**Path Parameters:**

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `id` | string (UUID) | ID do documento |

**Request:**
```http
GET /documents/doc-uuid-1 HTTP/1.1
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "id": "doc-uuid-1",
  "companyId": "company-uuid",
  "folderId": "folder-uuid",
  "name": "Nota Fiscal Janeiro 2024",
  "description": "Nota fiscal referente ao mês de janeiro/2024",
  "fileName": "nota-fiscal-001.pdf",
  "filePath": "uploads/documents/company-uuid/2024/01/unique-uuid.pdf",
  "fileSize": 2048576,
  "mimeType": "application/pdf",
  "fileExtension": ".pdf",
  "reference": "NF-2024-001",
  "documentType": "invoice",
  "tags": ["nota-fiscal", "janeiro", "2024"],
  "expiresAt": "2025-12-31T23:59:59.000Z",
  "isExpired": false,
  "version": 2,
  "previousVersionId": "doc-uuid-0",
  "isLatest": true,
  "isPublic": false,
  "allowedRoleIds": ["role-uuid-1", "role-uuid-2"],
  "uploadedById": "user-uuid",
  "createdAt": "2024-10-27T10:00:00.000Z",
  "updatedAt": "2024-10-27T10:00:00.000Z",
  "folder": {
    "id": "folder-uuid",
    "name": "Notas Fiscais",
    "description": "Notas fiscais e comprovantes",
    "color": "#4CAF50",
    "icon": "receipt",
    "parentId": null,
    "isPublic": false,
    "createdById": "user-uuid",
    "createdAt": "2024-10-27T09:00:00.000Z",
    "updatedAt": "2024-10-27T09:00:00.000Z"
  },
  "uploadedBy": {
    "id": "user-uuid",
    "name": "João Silva",
    "email": "joao@empresa.com"
  },
  "previousVersion": {
    "id": "doc-uuid-0",
    "name": "Nota Fiscal Janeiro 2024",
    "version": 1,
    "createdAt": "2024-10-26T15:00:00.000Z",
    "uploadedBy": {
      "id": "user-uuid",
      "name": "João Silva",
      "email": "joao@empresa.com"
    }
  },
  "nextVersions": [],
  "allVersions": [
    {
      "id": "doc-uuid-1",
      "name": "Nota Fiscal Janeiro 2024",
      "fileName": "nota-fiscal-v2.pdf",
      "fileSize": 2048576,
      "version": 2,
      "isLatest": true,
      "createdAt": "2024-10-27T10:00:00.000Z",
      "uploadedBy": {
        "id": "user-uuid",
        "name": "João Silva",
        "email": "joao@empresa.com"
      }
    },
    {
      "id": "doc-uuid-0",
      "name": "Nota Fiscal Janeiro 2024",
      "fileName": "nota-fiscal-v1.pdf",
      "fileSize": 1987456,
      "version": 1,
      "isLatest": false,
      "createdAt": "2024-10-26T15:00:00.000Z",
      "uploadedBy": {
        "id": "user-uuid",
        "name": "João Silva",
        "email": "joao@empresa.com"
      }
    }
  ]
}
```

> **Novas Funcionalidades:**
> - `allowedRoleIds`: Array de UUIDs das roles que podem visualizar o documento
> - `uploadedBy`: Informações completas do usuário que fez upload
> - `previousVersion`: Detalhes da versão anterior (se houver)
> - `nextVersions`: Array de versões posteriores (se houver)
> - **`allVersions`**: Array com TODAS as versões do documento (ordenadas da mais recente para a mais antiga)

**Erros Possíveis:**

| Status | Erro | Descrição |
|--------|------|-----------|
| 404 | Not Found | Documento não encontrado ou não pertence à empresa |

---

### 7. Fazer Upload de Documento

Faz upload de um arquivo com seus metadados.

**Endpoint:** `POST /documents/upload`

**Permissão:** `documents.create`

**Content-Type:** `multipart/form-data`

**Form Data:**

| Campo | Tipo | Obrigatório | Validação |
|-------|------|-------------|-----------|
| `file` | File | ✅ Sim | Max: 50MB, Tipos permitidos (veja abaixo) |
| `name` | string | ❌ Não | Max: 255 (default: nome do arquivo) |
| `description` | string | ❌ Não | Max: 1000 |
| `folderId` | string (UUID) | ❌ Não | UUID válido de pasta existente |
| `reference` | string | ❌ Não | Único por empresa |
| `documentType` | string | ❌ Não | Tipo do documento |
| `tags` | string | ❌ Não | Tags separadas por vírgula |
| `expiresAt` | string (ISO Date) | ❌ Não | Data de validade |
| `isPublic` | string ("true"/"false") | ❌ Não | Default: "false" |
| `allowedRoleIds` | string | ❌ Não | UUIDs de roles separados por vírgula (ex: "uuid1,uuid2") |

> **Controle de Acesso por Roles:**
> - Se omitido ou vazio, todos os usuários da empresa podem visualizar
> - Se preenchido (ex: "role-uuid-1,role-uuid-2"), apenas usuários com essas roles podem visualizar
> - O acesso é verificado usando lógica OR (usuário precisa ter pelo menos uma das roles)

**Tipos de Arquivo Permitidos:**

| Categoria | MIME Types |
|-----------|------------|
| **PDF** | `application/pdf` |
| **Imagens** | `image/jpeg`, `image/png`, `image/gif`, `image/svg+xml`, `image/webp` |
| **Word** | `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document` |
| **Excel** | `application/vnd.ms-excel`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` |
| **PowerPoint** | `application/vnd.ms-powerpoint`, `application/vnd.openxmlformats-officedocument.presentationml.presentation` |
| **Texto** | `text/plain`, `text/csv` |
| **Compactados** | `application/zip`, `application/x-rar-compressed` |

**Request:**
```http
POST /documents/upload HTTP/1.1
Authorization: Bearer {token}
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary

------WebKitFormBoundary
Content-Disposition: form-data; name="file"; filename="nota-fiscal.pdf"
Content-Type: application/pdf

[binary data]
------WebKitFormBoundary
Content-Disposition: form-data; name="name"

Nota Fiscal Janeiro 2024
------WebKitFormBoundary
Content-Disposition: form-data; name="description"

Nota fiscal referente ao mês de janeiro/2024
------WebKitFormBoundary
Content-Disposition: form-data; name="folderId"

550e8400-e29b-41d4-a716-446655440000
------WebKitFormBoundary
Content-Disposition: form-data; name="reference"

NF-2024-001
------WebKitFormBoundary
Content-Disposition: form-data; name="documentType"

invoice
------WebKitFormBoundary
Content-Disposition: form-data; name="tags"

nota-fiscal,janeiro,2024
------WebKitFormBoundary
Content-Disposition: form-data; name="expiresAt"

2025-12-31
------WebKitFormBoundary
Content-Disposition: form-data; name="isPublic"

false
------WebKitFormBoundary--
```

**Response:** `201 Created`
```json
{
  "id": "doc-uuid-1",
  "companyId": "company-uuid",
  "folderId": "folder-uuid",
  "name": "Nota Fiscal Janeiro 2024",
  "description": "Nota fiscal referente ao mês de janeiro/2024",
  "fileName": "nota-fiscal.pdf",
  "filePath": "uploads/documents/company-uuid/2024/10/unique-uuid.pdf",
  "fileSize": 2048576,
  "mimeType": "application/pdf",
  "fileExtension": ".pdf",
  "reference": "NF-2024-001",
  "documentType": "invoice",
  "tags": ["nota-fiscal", "janeiro", "2024"],
  "expiresAt": "2025-12-31T23:59:59.000Z",
  "isExpired": false,
  "version": 1,
  "previousVersionId": null,
  "isLatest": true,
  "isPublic": false,
  "uploadedById": "user-uuid",
  "createdAt": "2024-10-27T10:00:00.000Z",
  "updatedAt": "2024-10-27T10:00:00.000Z",
  "folder": {
    "id": "folder-uuid",
    "name": "Notas Fiscais",
    "description": "Notas fiscais e comprovantes",
    "color": "#4CAF50",
    "icon": "receipt",
    "parentId": null,
    "isPublic": false,
    "createdById": "user-uuid",
    "createdAt": "2024-10-27T09:00:00.000Z",
    "updatedAt": "2024-10-27T09:00:00.000Z"
  },
  "uploadedBy": {
    "id": "user-uuid",
    "name": "João Silva",
    "email": "joao@empresa.com"
  }
}
```

**Erros Possíveis:**

| Status | Erro | Descrição |
|--------|------|-----------|
| 400 | Bad Request | Nenhum arquivo enviado |
| 400 | Bad Request | Tipo de arquivo não permitido |
| 400 | Bad Request | Arquivo muito grande (>50MB) |
| 404 | Not Found | Pasta não encontrada |
| 409 | Conflict | Referência já existe |

**Exemplo de erro (tipo não permitido):**
```json
{
  "statusCode": 400,
  "message": "Tipo de arquivo não permitido: application/x-executable. Tipos permitidos: PDF, Imagens (JPG, PNG, GIF, SVG, WEBP), Documentos Office (DOC, DOCX, XLS, XLSX, PPT, PPTX), Texto (TXT, CSV), Compactados (ZIP, RAR)",
  "error": "Bad Request"
}
```

---

### 8. Download de Documento

Faz download do arquivo físico.

**Endpoint:** `GET /documents/:id/download`

**Permissão:** `documents.read`

**Path Parameters:**

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `id` | string (UUID) | ID do documento |

**Request:**
```http
GET /documents/doc-uuid-1/download HTTP/1.1
Authorization: Bearer {token}
```

**Response:** `200 OK`

**Headers:**
```http
Content-Type: application/pdf
Content-Length: 2048576
Content-Disposition: attachment; filename="nota-fiscal.pdf"
```

**Body:** `[binary data]`

**Erros Possíveis:**

| Status | Erro | Descrição |
|--------|------|-----------|
| 404 | Not Found | Documento não encontrado |
| 500 | Internal Server Error | Arquivo não encontrado no servidor |

---

### 9. Atualizar Metadados do Documento

Atualiza apenas os metadados (não o arquivo físico).

**Endpoint:** `PATCH /documents/:id`

**Permissão:** `documents.update`

**Path Parameters:**

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `id` | string (UUID) | ID do documento |

**Request Body:**
```json
{
  "name": "Nota Fiscal Janeiro 2024 - Revisada",
  "description": "Nota fiscal revisada e atualizada",
  "folderId": "new-folder-uuid",
  "documentType": "invoice",
  "tags": ["nota-fiscal", "janeiro", "2024", "revisada"],
  "expiresAt": "2026-01-31",
  "isPublic": false
}
```

**Nota:** Todos os campos são opcionais.

**Response:** `200 OK`
```json
{
  "id": "doc-uuid-1",
  "companyId": "company-uuid",
  "folderId": "new-folder-uuid",
  "name": "Nota Fiscal Janeiro 2024 - Revisada",
  "description": "Nota fiscal revisada e atualizada",
  "fileName": "nota-fiscal.pdf",
  "filePath": "uploads/documents/company-uuid/2024/10/unique-uuid.pdf",
  "fileSize": 2048576,
  "mimeType": "application/pdf",
  "fileExtension": ".pdf",
  "reference": "NF-2024-001",
  "documentType": "invoice",
  "tags": ["nota-fiscal", "janeiro", "2024", "revisada"],
  "expiresAt": "2026-01-31T23:59:59.000Z",
  "isExpired": false,
  "version": 1,
  "previousVersionId": null,
  "isLatest": true,
  "isPublic": false,
  "uploadedById": "user-uuid",
  "createdAt": "2024-10-27T10:00:00.000Z",
  "updatedAt": "2024-10-27T14:30:00.000Z",
  "folder": {
    "id": "new-folder-uuid",
    "name": "Nova Pasta",
    "description": "Descrição da nova pasta",
    "color": "#FF5722",
    "icon": "folder",
    "parentId": null,
    "isPublic": false,
    "createdById": "user-uuid",
    "createdAt": "2024-10-27T13:00:00.000Z",
    "updatedAt": "2024-10-27T13:00:00.000Z"
  },
  "uploadedBy": {
    "id": "user-uuid",
    "name": "João Silva",
    "email": "joao@empresa.com"
  }
}
```

**Erros Possíveis:**

| Status | Erro | Descrição |
|--------|------|-----------|
| 404 | Not Found | Documento ou pasta não encontrado |
| 409 | Conflict | Nova referência já existe |

---

### 10. Upload de Nova Versão

Faz upload de uma nova versão de um documento existente.

**Endpoint:** `POST /documents/:id/version`

**Permissão:** `documents.create`

**Content-Type:** `multipart/form-data`

**Path Parameters:**

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `id` | string (UUID) | ID do documento original |

**Form Data:**

| Campo | Tipo | Obrigatório | Validação |
|-------|------|-------------|-----------|
| `file` | File | ✅ Sim | Max: 50MB, Tipos permitidos |
| `description` | string | ❌ Não | Descrição da nova versão |

**Request:**
```http
POST /documents/doc-uuid-1/version HTTP/1.1
Authorization: Bearer {token}
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary

------WebKitFormBoundary
Content-Disposition: form-data; name="file"; filename="nota-fiscal-v2.pdf"
Content-Type: application/pdf

[binary data]
------WebKitFormBoundary
Content-Disposition: form-data; name="description"

Versão 2 - Valores corrigidos
------WebKitFormBoundary--
```

**Response:** `201 Created`
```json
{
  "id": "doc-uuid-2",
  "companyId": "company-uuid",
  "folderId": "folder-uuid",
  "name": "Nota Fiscal Janeiro 2024",
  "description": "Versão 2 - Valores corrigidos",
  "fileName": "nota-fiscal-v2.pdf",
  "filePath": "uploads/documents/company-uuid/2024/10/new-uuid.pdf",
  "fileSize": 2150000,
  "mimeType": "application/pdf",
  "fileExtension": ".pdf",
  "reference": "NF-2024-001",
  "documentType": "invoice",
  "tags": ["nota-fiscal", "janeiro", "2024"],
  "expiresAt": "2025-12-31T23:59:59.000Z",
  "isExpired": false,
  "version": 2,
  "previousVersionId": "doc-uuid-1",
  "isLatest": true,
  "isPublic": false,
  "uploadedById": "user-uuid",
  "createdAt": "2024-10-27T15:00:00.000Z",
  "updatedAt": "2024-10-27T15:00:00.000Z",
  "folder": {
    "id": "folder-uuid",
    "name": "Notas Fiscais",
    "description": "Notas fiscais e comprovantes",
    "color": "#4CAF50",
    "icon": "receipt",
    "parentId": null,
    "isPublic": false,
    "createdById": "user-uuid",
    "createdAt": "2024-10-27T09:00:00.000Z",
    "updatedAt": "2024-10-27T09:00:00.000Z"
  },
  "uploadedBy": {
    "id": "user-uuid",
    "name": "João Silva",
    "email": "joao@empresa.com"
  }
}
```

**Nota:** O documento original (`doc-uuid-1`) terá `isLatest: false` após este upload.

**Erros Possíveis:**

| Status | Erro | Descrição |
|--------|------|-----------|
| 400 | Bad Request | Nenhum arquivo enviado |
| 404 | Not Found | Documento original não encontrado |

---

### 11. Deletar Documento

Deleta um documento e seu arquivo físico.

**Endpoint:** `DELETE /documents/:id`

**Permissão:** `documents.delete`

**Path Parameters:**

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `id` | string (UUID) | ID do documento |

**Query Parameters:**

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `deleteAllVersions` | boolean | Não | Se `true`, deleta todas as versões (default: false) |

**Request:**
```http
DELETE /documents/doc-uuid-1 HTTP/1.1
Authorization: Bearer {token}
```

**Request (Com todas as versões):**
```http
DELETE /documents/doc-uuid-1?deleteAllVersions=true HTTP/1.1
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "message": "Documento deletado com sucesso"
}
```

**Erros Possíveis:**

| Status | Erro | Descrição |
|--------|------|-----------|
| 404 | Not Found | Documento não encontrado |

---

## 📊 Endpoints de Relatórios

### 12. Documentos Vencidos e Vencendo

Lista documentos já vencidos e que irão vencer em breve.

**Endpoint:** `GET /documents/expired`

**Permissão:** `documents.read`

**Query Parameters:**

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `daysAhead` | number | Não | Quantos dias à frente considerar (default: 30) |

**Request:**
```http
GET /documents/expired?daysAhead=30 HTTP/1.1
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "expired": [
    {
      "id": "doc-uuid-expired",
      "name": "Contrato Vencido",
      "fileName": "contrato-2023.pdf",
      "expiresAt": "2024-05-15T23:59:59.000Z",
      "isExpired": true,
      "reference": "CT-2023-001",
      "documentType": "contract",
      "uploadedBy": {
        "id": "user-uuid",
        "name": "João Silva",
        "email": "joao@empresa.com"
      },
      "daysExpired": 165
    }
  ],
  "expiringSoon": [
    {
      "id": "doc-uuid-expiring",
      "name": "Documento a Vencer",
      "fileName": "documento-importante.pdf",
      "expiresAt": "2024-11-15T23:59:59.000Z",
      "isExpired": false,
      "reference": "DOC-2024-050",
      "documentType": "certificate",
      "uploadedBy": {
        "id": "user-uuid",
        "name": "Maria Santos",
        "email": "maria@empresa.com"
      },
      "daysUntilExpiration": 19
    }
  ]
}
```

---

### 13. Estatísticas

Retorna estatísticas completas sobre os documentos da empresa.

**Endpoint:** `GET /documents/stats`

**Permissão:** `documents.read`

**Request:**
```http
GET /documents/stats HTTP/1.1
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "total": 156,
  "totalSize": 524288000,
  "totalSizeFormatted": "500.0 MB",
  "uploadsThisMonth": 23,
  "differentFileTypes": 8,
  "differentMimeTypes": 12,
  "differentDocumentTypes": 5,
  "byDocumentType": {
    "invoice": 45,
    "contract": 23,
    "report": 18,
    "certificate": 12,
    "other": 58
  },
  "byFileExtension": {
    ".pdf": 89,
    ".jpg": 23,
    ".png": 15,
    ".xlsx": 12,
    ".docx": 10,
    ".zip": 4,
    ".csv": 2,
    ".txt": 1
  },
  "byMimeType": {
    "application/pdf": 89,
    "image/jpeg": 23,
    "image/png": 15,
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": 12,
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": 10,
    "application/zip": 4,
    "text/csv": 2,
    "text/plain": 1
  },
  "byFolder": {
    "folder-uuid-1": 45,
    "folder-uuid-2": 23,
    "folder-uuid-3": 18,
    "without-folder": 70
  },
  "expired": 8,
  "expiringSoon": 12,
  "recentUploads": 15
}
```

**Campos:**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `total` | number | **Total de documentos na empresa** |
| `totalSize` | number | **Espaço usado em bytes** |
| `totalSizeFormatted` | string | **Espaço formatado** (B, KB, MB, GB) |
| `uploadsThisMonth` | number | **Uploads feitos no mês atual** |
| `differentFileTypes` | number | **Quantidade de extensões diferentes** (.pdf, .jpg, etc) |
| `differentMimeTypes` | number | **Quantidade de tipos MIME diferentes** |
| `differentDocumentTypes` | number | **Quantidade de tipos de documento diferentes** (invoice, contract, etc) |
| `byDocumentType` | object | Contagem por tipo de documento |
| `byFileExtension` | object | Contagem por extensão de arquivo |
| `byMimeType` | object | Contagem por tipo MIME |
| `byFolder` | object | Contagem por pasta |
| `expired` | number | Documentos vencidos |
| `expiringSoon` | number | Documentos vencendo em 30 dias |
| `recentUploads` | number | Uploads nos últimos 7 dias |

---

## 📦 Tipos de Dados

### DocumentFolder

```typescript
interface DocumentFolder {
  id: string;                    // UUID
  companyId: string;             // UUID da empresa
  name: string;                  // 3-100 caracteres
  description?: string;          // Máx 500 caracteres
  color?: string;                // Hex (#RRGGBB)
  icon?: string;                 // Nome do ícone
  parentId?: string;             // UUID da pasta pai
  isPublic: boolean;             // Visibilidade
  createdById: string;           // UUID do criador
  createdAt: Date;               // Data de criação
  updatedAt: Date;               // Última atualização
  
  // Relações
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
  
  // Contadores
  documentsCount?: number;       // Total de documentos
  subfoldersCount?: number;      // Total de subpastas
}
```

### Document

```typescript
interface Document {
  id: string;                    // UUID
  companyId: string;             // UUID da empresa
  folderId?: string;             // UUID da pasta
  name: string;                  // Nome do documento
  description?: string;          // Descrição
  fileName: string;              // Nome do arquivo original
  filePath: string;              // Caminho no servidor
  fileSize: number;              // Tamanho em bytes
  mimeType: string;              // Tipo MIME
  fileExtension: string;         // Extensão (.pdf, .jpg, etc)
  reference?: string;            // Referência única
  documentType?: string;         // Tipo (invoice, contract, etc)
  tags: string[];                // Array de tags
  expiresAt?: Date;              // Data de validade
  isExpired: boolean;            // Status de expiração
  version: number;               // Número da versão
  previousVersionId?: string;    // UUID da versão anterior
  isLatest: boolean;             // Se é a versão mais recente
  isPublic: boolean;             // Visibilidade
  uploadedById: string;          // UUID do uploader
  createdAt: Date;               // Data de upload
  updatedAt: Date;               // Última atualização
  
  // Relações
  folder?: DocumentFolder;
  uploadedBy?: {
    id: string;
    name: string;
    email: string;
  };
  
  // Campos calculados
  daysUntilExpiration?: number;  // Dias até expirar
  downloadUrl?: string;          // URL de download
}
```

### Paginação

```typescript
interface PaginatedResponse<T> {
  total: number;                 // Total de registros
  page: number;                  // Página atual
  limit: number;                 // Itens por página
  totalPages: number;            // Total de páginas
  documents: T[];                // Array de dados
}
```

---

## ⚠️ Códigos de Erro

### Erros de Autenticação

| Status | Código | Mensagem | Solução |
|--------|--------|----------|---------|
| 401 | Unauthorized | Token não fornecido | Adicionar header Authorization |
| 401 | Unauthorized | Token inválido ou expirado | Fazer login novamente |
| 403 | Forbidden | Permissão negada | Verificar permissões do usuário |

### Erros de Validação

| Status | Código | Mensagem | Solução |
|--------|--------|----------|---------|
| 400 | Bad Request | Validação falhou | Verificar formato dos campos |
| 400 | Bad Request | Nenhum arquivo enviado | Enviar arquivo no campo `file` |
| 400 | Bad Request | Tipo de arquivo não permitido | Usar tipos permitidos |
| 400 | Bad Request | Arquivo muito grande | Reduzir tamanho para <50MB |

### Erros de Negócio

| Status | Código | Mensagem | Solução |
|--------|--------|----------|---------|
| 404 | Not Found | Pasta não encontrada | Verificar ID da pasta |
| 404 | Not Found | Documento não encontrado | Verificar ID do documento |
| 409 | Conflict | Referência já existe | Usar referência única |
| 400 | Bad Request | Pasta contém conteúdo | Usar `force=true` ou mover conteúdo |

### Erros de Servidor

| Status | Código | Mensagem | Solução |
|--------|--------|----------|---------|
| 500 | Internal Server Error | Erro interno | Verificar logs do servidor |
| 500 | Internal Server Error | Arquivo não encontrado | Verificar integridade do storage |

---

## 💡 Exemplos de Uso

### Exemplo 1: Fluxo Completo de Upload

```bash
# 1. Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario@empresa.com","password":"senha123"}'

# 2. Criar Pasta
curl -X POST http://localhost:3000/documents/folders \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Notas Fiscais 2024",
    "description": "Notas fiscais do ano",
    "color": "#4CAF50",
    "icon": "receipt"
  }'

# 3. Upload de Documento
curl -X POST http://localhost:3000/documents/upload \
  -H "Authorization: Bearer {token}" \
  -F "file=@/path/to/nota-fiscal.pdf" \
  -F "name=Nota Fiscal Janeiro" \
  -F "folderId={folder-uuid}" \
  -F "reference=NF-2024-001" \
  -F "documentType=invoice" \
  -F "tags=nota-fiscal,janeiro,2024" \
  -F "expiresAt=2025-12-31"

# 4. Listar Documentos
curl -X GET "http://localhost:3000/documents?folderId={folder-uuid}" \
  -H "Authorization: Bearer {token}"

# 5. Download
curl -X GET http://localhost:3000/documents/{doc-uuid}/download \
  -H "Authorization: Bearer {token}" \
  -o nota-fiscal.pdf
```

### Exemplo 2: Busca Avançada

```bash
# Buscar por texto
curl -X GET "http://localhost:3000/documents?search=contrato&page=1&limit=10" \
  -H "Authorization: Bearer {token}"

# Buscar por tags
curl -X GET "http://localhost:3000/documents?tags=urgente,2024" \
  -H "Authorization: Bearer {token}"

# Buscar documentos vencidos
curl -X GET "http://localhost:3000/documents?expired=true" \
  -H "Authorization: Bearer {token}"

# Buscar por tipo e pasta
curl -X GET "http://localhost:3000/documents?folderId={folder-uuid}&documentType=invoice" \
  -H "Authorization: Bearer {token}"
```

### Exemplo 3: Gerenciamento de Versões

```bash
# Upload versão inicial
curl -X POST http://localhost:3000/documents/upload \
  -H "Authorization: Bearer {token}" \
  -F "file=@contrato-v1.pdf" \
  -F "name=Contrato de Prestação de Serviços" \
  -F "reference=CT-2024-001"

# Upload nova versão
curl -X POST http://localhost:3000/documents/{doc-uuid}/version \
  -H "Authorization: Bearer {token}" \
  -F "file=@contrato-v2.pdf" \
  -F "description=Versão 2 - Valores atualizados"

# Listar todas as versões (buscar por reference)
curl -X GET "http://localhost:3000/documents?search=CT-2024-001" \
  -H "Authorization: Bearer {token}"
```

### Exemplo 4: Monitoramento de Validade

```bash
# Ver documentos vencidos
curl -X GET http://localhost:3000/documents/expired \
  -H "Authorization: Bearer {token}"

# Ver documentos vencendo em 7 dias
curl -X GET "http://localhost:3000/documents/expired?daysAhead=7" \
  -H "Authorization: Bearer {token}"

# Filtrar por documentos vencendo em 30 dias
curl -X GET "http://localhost:3000/documents?expiresIn=30" \
  -H "Authorization: Bearer {token}"
```

### Exemplo 5: Estatísticas e Relatórios

```bash
# Ver estatísticas gerais
curl -X GET http://localhost:3000/documents/stats \
  -H "Authorization: Bearer {token}"

# Ver uploads recentes (últimos 7 dias implícito nas stats)
curl -X GET http://localhost:3000/documents/stats \
  -H "Authorization: Bearer {token}"
```

### Exemplo 6: Controle de Acesso por Roles

```bash
# Criar pasta restrita apenas para gerentes e admin
curl -X POST http://localhost:3000/documents/folders \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Documentos Confidenciais",
    "description": "Apenas gerentes podem visualizar",
    "allowedRoleIds": ["role-gerente-uuid", "role-admin-uuid"]
  }'

# Upload de documento restrito
curl -X POST http://localhost:3000/documents/upload \
  -H "Authorization: Bearer {token}" \
  -F "file=@contrato-confidencial.pdf" \
  -F "name=Contrato Confidencial" \
  -F "allowedRoleIds=role-diretor-uuid,role-admin-uuid"

# Atualizar permissões de um documento
curl -X PATCH http://localhost:3000/documents/{doc-uuid} \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "allowedRoleIds": ["role-admin-uuid", "role-financeiro-uuid"]
  }'
```

### Exemplo 7: Histórico de Versões

```bash
# Ver detalhes com todas as versões
curl -X GET http://localhost:3000/documents/{doc-uuid} \
  -H "Authorization: Bearer {token}"

# A resposta inclui:
# - previousVersion: versão anterior
# - nextVersions: versões posteriores  
# - allVersions: TODAS as versões ordenadas

# Upload de nova versão (mantém permissões do original)
curl -X POST http://localhost:3000/documents/{doc-uuid}/version \
  -H "Authorization: Bearer {token}" \
  -F "file=@documento-v3.pdf" \
  -F "description=Versão 3 - Revisão final"
```

---

## 📝 Notas Finais

### Isolamento de Dados
- Todos os dados são isolados por `companyId`
- Usuários só veem documentos da própria empresa
- Validação automática via decorator `@CurrentCompany()`

### Controle de Acesso por Roles
- **`allowedRoleIds`**: Array de UUIDs de roles permitidas
- Se vazio ou omitido, **todos os usuários da empresa** podem visualizar
- Se preenchido, **apenas usuários com pelo menos uma das roles** podem visualizar
- Lógica OR: usuário precisa ter qualquer uma das roles listadas
- Aplicável tanto em **pastas** quanto em **documentos**
- Nova versão herda as permissões do documento original

### Versionamento de Documentos
- **Cada versão é um registro independente** com seu próprio ID
- **Vínculo bidirecional**: `previousVersionId` e `nextVersions`
- **Campo `allVersions`** retorna histórico completo ordenado
- **Rastreabilidade completa**: cada versão guarda `uploadedBy` com dados do usuário
- **Versão mais recente**: campo `isLatest: true`
- Upload de nova versão marca anterior como `isLatest: false`

### Rastreamento de Usuários
- **`uploadedBy`**: Objeto completo com `id`, `name`, `email` em todas as responses
- **`createdBy`**: Usuário que criou a pasta (também com dados completos)
- **Presente em**: Documentos, versões, pastas
- **Auditoria completa**: Sabe-se exatamente quem fez upload de cada versão

### Armazenamento
- Arquivos em: `uploads/documents/{companyId}/{year}/{month}/{uuid}.ext`
- Nomes únicos com UUID previnem conflitos
- Diretórios criados automaticamente

### Cron Job
- Roda diariamente à meia-noite (00:00)
- Marca documentos vencidos automaticamente
- Atualiza campo `isExpired` quando `expiresAt < hoje`

### Performance
- 14 índices otimizam queries (adicionado `previousVersionId`)
- Paginação padrão de 50 itens
- Limite máximo de 100 itens por página
- Busca eficiente de versões com índice dedicado

### Segurança
- JWT obrigatório em todas as rotas
- Validação de MIME type no upload
- Limite de tamanho de arquivo (50MB)
- Isolamento por empresa
- **Controle granular por roles**

---

## 🆕 Novidades - v1.1.0 (27/10/2024)

### ✨ Controle de Acesso por Roles
- Campo `allowedRoleIds` em pastas e documentos
- Restrição de visualização baseada em roles
- Lógica OR para múltiplas roles

### 🔗 Versionamento Aprimorado
- Vínculo bidirecional entre versões
- Campo `allVersions` retorna histórico completo
- Navegação facilitada entre versões

### 👤 Rastreamento de Usuários
- Dados completos do usuário em todos os uploads
- `uploadedBy` com `id`, `name`, `email`
- Histórico completo de quem fez cada versão

---

**Documentação gerada em:** 27 de outubro de 2024  
**Versão da API:** 1.1.0  
**Última atualização:** 27/10/2024
