# 🔐 Sistema de Controle de Acesso por Roles - Documentos

## 📋 Resumo das Implementações

Data: 28 de outubro de 2024

---

## ✅ O Que Foi Implementado

### 1. **Controle de Acesso por Roles**

#### **Database (Prisma Schema)**
- ✅ Adicionado campo `allowedRoleIds: String[]` em `DocumentFolder`
- ✅ Adicionado campo `allowedRoleIds: String[]` em `Document`
- ✅ Migration `20251028015518_add_document_roles_and_versions` aplicada

#### **Nova Permissão Especial**
- ✅ Criada permissão `documents.view_all`
- ✅ Permite visualizar TODOS os documentos e pastas, independente de restrições
- ✅ Adicionada automaticamente à role `admin`

### 2. **Versionamento de Documentos**

#### **Database (Prisma Schema)**
- ✅ Adicionada relação `previousVersion` e `nextVersions` em `Document`
- ✅ Campo `previousVersionId` vincula versões
- ✅ Índice criado para otimizar buscas por versões

#### **Service**
- ✅ Método `getAllVersions()` - Busca todas as versões de um documento
- ✅ Método `findOneDocument()` - Retorna documento com todas as versões
- ✅ Método `uploadNewVersion()` - Mantém `allowedRoleIds` da versão original

### 3. **Dados do Usuário em Uploads**

#### **Já Implementado**
- ✅ Campo `uploadedById` já existia
- ✅ Relação `uploadedBy` já retorna dados do usuário (id, name, email)
- ✅ Todos os endpoints de listagem incluem `uploadedBy`

### 4. **Lógica de Filtro de Acesso**

#### **Service Methods**
- ✅ `getUserRoles()` - Busca roles e permissões do usuário
- ✅ `findAllFolders()` - Filtra pastas por permissões
- ✅ `findDocuments()` - Filtra documentos por permissões

#### **Regras de Acesso**

**Para Pastas:**
1. ✅ Se usuário tem permissão `documents.view_all` → vê todas as pastas
2. ✅ Se usuário criou a pasta → sempre pode visualizar
3. ✅ Se pasta é `isPublic: true` → todos podem visualizar
4. ✅ Se `allowedRoleIds` está vazio → todos podem visualizar
5. ✅ Se usuário tem role em `allowedRoleIds` → pode visualizar

**Para Documentos:**
1. ✅ Se usuário tem permissão `documents.view_all` → vê todos os documentos
2. ✅ Se usuário fez upload do documento → sempre pode visualizar
3. ✅ Se documento é `isPublic: true` → todos podem visualizar
4. ✅ Se `allowedRoleIds` está vazio → todos podem visualizar
5. ✅ Se usuário tem role em `allowedRoleIds` → pode visualizar

---

## 📊 Estrutura de Dados

### DocumentFolder (Atualizado)

```typescript
interface DocumentFolder {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  parentId?: string;
  isPublic: boolean;
  allowedRoleIds: string[];        // 🆕 NOVO
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Relações
  createdBy?: User;
  _count?: {
    documents: number;
    subfolders: number;
  };
}
```

### Document (Atualizado)

```typescript
interface Document {
  id: string;
  companyId: string;
  folderId?: string;
  name: string;
  description?: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  fileExtension: string;
  reference?: string;
  documentType?: string;
  tags: string[];
  expiresAt?: Date;
  isExpired: boolean;
  version: number;
  previousVersionId?: string;      // 🆕 ATUALIZADO (agora com relação)
  isLatest: boolean;
  isPublic: boolean;
  allowedRoleIds: string[];        // 🆕 NOVO
  uploadedById: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Relações
  folder?: DocumentFolder;
  uploadedBy?: User;               // ✅ JÁ EXISTIA
  previousVersion?: Document;      // 🆕 NOVO
  nextVersions?: Document[];       // 🆕 NOVO
  allVersions?: DocumentVersion[]; // 🆕 NOVO (computado)
}
```

### DocumentVersion (Computado)

```typescript
interface DocumentVersion {
  id: string;
  name: string;
  fileName: string;
  fileSize: number;
  version: number;
  isLatest: boolean;
  createdAt: Date;
  uploadedBy: {
    id: string;
    name: string;
    email: string;
  };
}
```

---

## 🔑 Nova Permissão

### `documents.view_all`

| Campo | Valor |
|-------|-------|
| **Resource** | `documents` |
| **Action** | `view_all` |
| **Name** | documents.view_all |
| **Description** | Permite visualizar todos os documentos e pastas, mesmo aqueles restritos a outras roles |
| **Roles** | `admin` (padrão) |

**Comportamento:**
- Usuários com esta permissão veem TODOS os documentos e pastas
- Ignora completamente os filtros de `allowedRoleIds`
- Ideal para administradores e gerentes
- Pode ser atribuída a outras roles conforme necessário

---

## 🔧 DTOs Atualizados

### CreateFolderDto

```typescript
{
  name: string;           // ✅ Obrigatório
  description?: string;
  color?: string;
  icon?: string;
  parentId?: string;
  isPublic?: boolean;
  allowedRoleIds?: string[];  // 🆕 NOVO - Array de UUIDs de roles
}
```

### UploadDocumentDto

```typescript
{
  file: File;             // ✅ Obrigatório
  name?: string;
  description?: string;
  folderId?: string;
  reference?: string;
  documentType?: string;
  tags?: string;          // CSV: "tag1,tag2,tag3"
  expiresAt?: string;
  isPublic?: string;      // "true" ou "false"
  allowedRoleIds?: string; // 🆕 NOVO - CSV: "uuid1,uuid2,uuid3"
}
```

### UpdateDocumentDto

```typescript
{
  name?: string;
  description?: string;
  folderId?: string;
  reference?: string;
  documentType?: string;
  tags?: string[];
  expiresAt?: string;
  isPublic?: boolean;
  allowedRoleIds?: string[];  // 🆕 NOVO - Array de UUIDs
}
```

---

## 🎯 Endpoints Atualizados

### `GET /documents/folders`

**Comportamento:**
- Filtra pastas baseado nas permissões do usuário
- Retorna apenas pastas que o usuário tem acesso
- Usuários com `documents.view_all` veem todas

**Response:**
```json
[
  {
    "id": "folder-uuid",
    "name": "Documentos RH",
    "allowedRoleIds": ["role-hr-uuid"],  // 🆕 NOVO
    "createdBy": {                        // ✅ JÁ EXISTIA
      "id": "user-uuid",
      "name": "João Silva",
      "email": "joao@empresa.com"
    },
    "documentsCount": 15,
    "subfoldersCount": 3
  }
]
```

### `GET /documents`

**Comportamento:**
- Filtra documentos baseado nas permissões do usuário
- Retorna apenas documentos que o usuário tem acesso
- Usuários com `documents.view_all` veem todos

**Response:**
```json
{
  "total": 50,
  "page": 1,
  "limit": 20,
  "totalPages": 3,
  "documents": [
    {
      "id": "doc-uuid",
      "name": "Contrato de Trabalho",
      "allowedRoleIds": ["role-hr-uuid"],  // 🆕 NOVO
      "uploadedBy": {                       // ✅ JÁ EXISTIA
        "id": "user-uuid",
        "name": "Maria Santos",
        "email": "maria@empresa.com"
      },
      "version": 1,
      "isLatest": true
    }
  ]
}
```

### `GET /documents/:id`

**Response:**
```json
{
  "id": "doc-uuid",
  "name": "Contrato de Prestação",
  "version": 2,
  "previousVersionId": "doc-uuid-v1",
  "isLatest": true,
  "allowedRoleIds": ["role-juridico-uuid"],  // 🆕 NOVO
  "uploadedBy": {                             // ✅ JÁ EXISTIA
    "id": "user-uuid",
    "name": "Carlos Souza",
    "email": "carlos@empresa.com"
  },
  "previousVersion": {                        // 🆕 NOVO
    "id": "doc-uuid-v1",
    "name": "Contrato de Prestação",
    "version": 1,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "uploadedBy": {
      "id": "user-uuid",
      "name": "Carlos Souza",
      "email": "carlos@empresa.com"
    }
  },
  "nextVersions": [],                         // 🆕 NOVO
  "allVersions": [                            // 🆕 NOVO
    {
      "id": "doc-uuid",
      "name": "Contrato de Prestação",
      "fileName": "contrato-v2.pdf",
      "fileSize": 256000,
      "version": 2,
      "isLatest": true,
      "createdAt": "2024-03-20T14:30:00.000Z",
      "uploadedBy": {
        "id": "user-uuid",
        "name": "Carlos Souza",
        "email": "carlos@empresa.com"
      }
    },
    {
      "id": "doc-uuid-v1",
      "name": "Contrato de Prestação",
      "fileName": "contrato-v1.pdf",
      "fileSize": 245000,
      "version": 1,
      "isLatest": false,
      "createdAt": "2024-01-15T10:00:00.000Z",
      "uploadedBy": {
        "id": "user-uuid",
        "name": "Carlos Souza",
        "email": "carlos@empresa.com"
      }
    }
  ]
}
```

---

## 💡 Exemplos de Uso

### Exemplo 1: Criar Pasta Restrita ao RH

```bash
curl -X POST http://localhost:3000/documents/folders \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Documentos RH",
    "description": "Documentos confidenciais do RH",
    "color": "#F44336",
    "allowedRoleIds": ["role-hr-uuid", "role-admin-uuid"]
  }'
```

**Resultado:**
- Apenas usuários com role `role-hr-uuid` ou `role-admin-uuid` podem ver esta pasta
- Usuários com `documents.view_all` também podem ver
- O criador da pasta sempre pode visualizar

### Exemplo 2: Upload de Documento Restrito ao Jurídico

```bash
curl -X POST http://localhost:3000/documents/upload \
  -H "Authorization: Bearer {token}" \
  -F "file=@contrato.pdf" \
  -F "name=Contrato de Prestação" \
  -F "folderId={folder-uuid}" \
  -F "allowedRoleIds=role-juridico-uuid,role-admin-uuid"
```

**Resultado:**
- Apenas usuários com role `role-juridico-uuid` ou `role-admin-uuid` podem ver
- O usuário que fez upload sempre pode visualizar
- Usuários com `documents.view_all` também podem ver

### Exemplo 3: Documento Público (Todos Podem Ver)

```bash
curl -X POST http://localhost:3000/documents/upload \
  -H "Authorization: Bearer {token}" \
  -F "file=@manual.pdf" \
  -F "name=Manual do Funcionário" \
  -F "isPublic=true"
```

**Resultado:**
- TODOS os usuários da empresa podem visualizar
- Ignora completamente as restrições de roles

### Exemplo 4: Documento Sem Restrições

```bash
curl -X POST http://localhost:3000/documents/upload \
  -H "Authorization: Bearer {token}" \
  -F "file=@comunicado.pdf" \
  -F "name=Comunicado Geral"
```

**Resultado:**
- Como `allowedRoleIds` não foi fornecido, fica vazio `[]`
- TODOS os usuários da empresa podem visualizar

### Exemplo 5: Upload Nova Versão (Mantém Permissões)

```bash
curl -X POST http://localhost:3000/documents/{doc-uuid}/version \
  -H "Authorization: Bearer {token}" \
  -F "file=@contrato-v2.pdf" \
  -F "description=Versão 2 - Valores atualizados"
```

**Resultado:**
- Nova versão herda `allowedRoleIds` da versão original
- Mantém as mesmas restrições de acesso
- Incrementa o número da versão

---

## 🔒 Cenários de Acesso

### Cenário 1: Usuário Admin
- ✅ Tem permissão `documents.view_all`
- ✅ Vê TODAS as pastas e documentos
- ✅ Ignora filtros de `allowedRoleIds`

### Cenário 2: Usuário RH
- Role: `role-hr-uuid`
- ✅ Vê pastas que criou
- ✅ Vê documentos que fez upload
- ✅ Vê pastas públicas (`isPublic: true`)
- ✅ Vê documentos públicos (`isPublic: true`)
- ✅ Vê pastas onde `allowedRoleIds` contém `role-hr-uuid`
- ✅ Vê documentos onde `allowedRoleIds` contém `role-hr-uuid`
- ❌ NÃO vê pastas/documentos restritos a outras roles

### Cenário 3: Usuário Comum (Sem Role Específica)
- Role: `role-user-uuid`
- ✅ Vê pastas que criou
- ✅ Vê documentos que fez upload
- ✅ Vê pastas públicas
- ✅ Vê documentos públicos
- ✅ Vê pastas/documentos sem restrições (`allowedRoleIds: []`)
- ❌ NÃO vê pastas/documentos restritos a outras roles

### Cenário 4: Usuário Jurídico com View All
- Role: `role-juridico-uuid`
- ✅ Tem permissão `documents.view_all`
- ✅ Vê TUDO (igual ao admin)

---

## 📝 Notas Importantes

### Sobre allowedRoleIds

1. **Array Vazio `[]`**:
   - Significa que TODOS podem visualizar
   - Comportamento padrão quando não especificado

2. **Array com UUIDs**:
   - Apenas usuários com essas roles podem visualizar
   - Lógica OR: usuário precisa ter PELO MENOS UMA das roles

3. **Combinação com isPublic**:
   - Se `isPublic: true`, ignora `allowedRoleIds`
   - Documentos públicos são sempre visíveis

### Sobre Criador/Uploader

- O usuário que criou a pasta **sempre** pode visualizá-la
- O usuário que fez upload do documento **sempre** pode visualizá-lo
- Mesmo que não tenha a role especificada em `allowedRoleIds`

### Sobre documents.view_all

- Permissão especial para "super usuários"
- Ignora TODOS os filtros de acesso
- Por padrão, apenas role `admin` tem
- Pode ser atribuída a outras roles (ex: gerentes, diretores)

### Sobre Versionamento

- Todas as versões compartilham as mesmas permissões
- Ao fazer upload de nova versão, permissões são copiadas
- `isLatest: true` marca a versão mais recente
- `allVersions` retorna histórico completo ordenado (mais recente primeiro)

---

## 🧪 Como Testar

### 1. Criar Role Específica (Se não existir)

```sql
INSERT INTO roles (id, name, description)
VALUES ('role-rh-uuid', 'RH', 'Recursos Humanos');
```

### 2. Atribuir Usuário à Role

```sql
UPDATE user_companies
SET role_id = 'role-rh-uuid'
WHERE user_id = 'user-uuid' AND company_id = 'company-uuid';
```

### 3. Testar Acesso Restrito

```bash
# Login como usuário RH
TOKEN_RH=$(curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"rh@empresa.com","password":"senha"}' \
  | jq -r '.access_token')

# Criar pasta restrita ao RH
curl -X POST http://localhost:3000/documents/folders \
  -H "Authorization: Bearer $TOKEN_RH" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Documentos RH",
    "allowedRoleIds": ["role-rh-uuid"]
  }'

# Login como usuário comum
TOKEN_USER=$(curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@empresa.com","password":"senha"}' \
  | jq -r '.access_token')

# Tentar listar pastas (não deve ver a pasta do RH)
curl -X GET http://localhost:3000/documents/folders \
  -H "Authorization: Bearer $TOKEN_USER"
```

### 4. Testar Permissão view_all

```bash
# Adicionar permissão view_all a uma role
INSERT INTO role_permissions (role_id, permission_id)
SELECT 'role-gerente-uuid', id
FROM permissions
WHERE resource = 'documents' AND action = 'view_all';

# Login como gerente
TOKEN_GERENTE=$(curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"gerente@empresa.com","password":"senha"}' \
  | jq -r '.access_token')

# Listar pastas (deve ver TODAS)
curl -X GET http://localhost:3000/documents/folders \
  -H "Authorization: Bearer $TOKEN_GERENTE"
```

---

## 🎉 Resumo Final

✅ **Controle de Acesso por Roles** - Implementado  
✅ **Permissão documents.view_all** - Criada e configurada  
✅ **Versionamento de Documentos** - Completo com histórico  
✅ **Dados do Uploader** - Já existia, mantido  
✅ **Filtros Automáticos** - Aplicados em GET /folders e GET /documents  
✅ **Criador Sempre Vê** - Implementado  
✅ **Migration Aplicada** - Banco atualizado  
✅ **DTOs Atualizados** - allowedRoleIds adicionado  
✅ **Compilação OK** - Sem erros  

**Sistema 100% funcional e pronto para testes!** 🚀
