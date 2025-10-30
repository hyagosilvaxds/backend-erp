# 📁 Hub de Documentos - Sistema de Gerenciamento de Arquivos

## 🎯 Visão Geral

Sistema completo de **gerenciamento de documentos** com upload de arquivos, organização em pastas, controle de validade, versionamento e auditoria completa. Ideal para centralizar documentos fiscais, contratos, certificados e outros arquivos importantes da empresa.

**🔒 CONCEITOS:**
- ✅ Documentos organizados em **pastas hierárquicas**
- ✅ **Upload de múltiplos tipos** de arquivo (PDF, imagens, Word, Excel, etc.)
- ✅ **Metadados completos**: referência, tipo, tags, validade
- ✅ **Controle de vencimento** com alertas automáticos
- ✅ **Versionamento** de documentos
- ✅ **Controle de acesso** por empresa
- ✅ **Auditoria completa** de quem fez upload

---

## 📊 Estrutura de Dados

### DocumentFolder (Pasta)
```typescript
{
  id: string              // UUID da pasta
  companyId: string       // Empresa proprietária
  name: string            // Nome da pasta
  description?: string    // Descrição opcional
  color?: string          // Cor hex (#FF5733)
  icon?: string           // Ícone (folder, file-text, shield, etc.)
  parentId?: string       // Pasta pai (para hierarquia)
  isPublic: boolean       // Se todos da empresa podem ver
  createdById: string     // Quem criou
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Document (Documento)
```typescript
{
  id: string              // UUID do documento
  companyId: string       // Empresa proprietária
  folderId?: string       // Pasta (opcional)
  
  // Dados básicos
  name: string            // Nome do documento
  description?: string    // Descrição
  
  // Arquivo
  fileName: string        // Nome original
  filePath: string        // Caminho no servidor
  fileSize: number        // Tamanho em bytes
  mimeType: string        // application/pdf, image/jpeg, etc.
  fileExtension: string   // .pdf, .jpg, .docx, etc.
  
  // Metadados
  reference?: string      // Referência/código
  documentType?: string   // Tipo (contrato, nota_fiscal, etc.)
  tags: string[]          // Tags para busca
  
  // Validade
  expiresAt?: DateTime    // Data de vencimento
  isExpired: boolean      // Se está vencido
  
  // Versão
  version: number         // Número da versão
  previousVersionId?: string // Versão anterior
  isLatest: boolean       // Se é a última versão
  
  // Acesso
  isPublic: boolean       // Se todos da empresa podem ver
  
  // Auditoria
  uploadedById: string    // Quem fez upload
  createdAt: DateTime
  updatedAt: DateTime
}
```

---

## 🔐 Autenticação e Permissões

**Headers Obrigatórios:**
```
Authorization: Bearer {token}
x-company-id: {company-uuid}
```

**Permissões Necessárias:**
- `documents.read` - Visualizar documentos e pastas
- `documents.create` - Upload de documentos e criar pastas
- `documents.update` - Editar metadados e mover documentos
- `documents.delete` - Deletar documentos e pastas

---

## 📡 Endpoints - Pastas

### 1. Listar Todas as Pastas

```
GET /documents/folders
```

**Permissão:** `documents.read`

**Query Parameters:**
- `parentId` (opcional) - Filtrar por pasta pai (raiz se omitido)
- `includeSubfolders` (opcional) - Incluir subpastas recursivamente

**Resposta:**
```json
[
  {
    "id": "folder-uuid",
    "companyId": "company-uuid",
    "name": "Documentos Fiscais",
    "description": "Notas fiscais, certificados e documentos contábeis",
    "color": "#3B82F6",
    "icon": "file-text",
    "parentId": null,
    "isPublic": true,
    "createdBy": {
      "id": "user-uuid",
      "name": "João Silva",
      "email": "joao@empresa.com"
    },
    "documentsCount": 45,
    "subfoldersCount": 3,
    "createdAt": "2025-10-27T10:00:00.000Z",
    "updatedAt": "2025-10-27T10:00:00.000Z"
  }
]
```

---

### 2. Criar Nova Pasta

```
POST /documents/folders
```

**Permissão:** `documents.create`

**Body:**
```json
{
  "name": "Contratos 2025",
  "description": "Contratos fechados em 2025",
  "color": "#10B981",
  "icon": "folder",
  "parentId": "parent-folder-uuid",
  "isPublic": true
}
```

**Campos:**
- `name` (string, **OBRIGATÓRIO**) - Nome da pasta (3-100 caracteres)
- `description` (string, opcional) - Descrição (máximo 500 caracteres)
- `color` (string, opcional) - Código hex da cor (#RRGGBB)
- `icon` (string, opcional) - Nome do ícone
- `parentId` (string, opcional) - UUID da pasta pai
- `isPublic` (boolean, opcional) - Default: false

**Resposta:**
```json
{
  "id": "new-folder-uuid",
  "companyId": "company-uuid",
  "name": "Contratos 2025",
  "description": "Contratos fechados em 2025",
  "color": "#10B981",
  "icon": "folder",
  "parentId": "parent-folder-uuid",
  "isPublic": true,
  "createdById": "user-uuid",
  "createdAt": "2025-10-27T10:30:00.000Z",
  "updatedAt": "2025-10-27T10:30:00.000Z"
}
```

---

### 3. Atualizar Pasta

```
PATCH /documents/folders/:id
```

**Permissão:** `documents.update`

**Body:** (todos campos opcionais)
```json
{
  "name": "Contratos 2025 - Ativos",
  "description": "Contratos ativos e vigentes",
  "color": "#EF4444",
  "icon": "shield"
}
```

---

### 4. Deletar Pasta

```
DELETE /documents/folders/:id
```

**Permissão:** `documents.delete`

**Query Parameters:**
- `force` (boolean, opcional) - Se true, deleta mesmo com documentos

**⚠️ IMPORTANTE:**
- Pasta com documentos só pode ser deletada com `force=true`
- Subpastas são deletadas em cascata
- Documentos dentro da pasta também são deletados

**Resposta:** `204 No Content`

---

## 📡 Endpoints - Documentos

### 5. Listar Documentos

```
GET /documents
```

**Permissão:** `documents.read`

**Query Parameters:**
- `folderId` (string, opcional) - Filtrar por pasta
- `documentType` (string, opcional) - Filtrar por tipo
- `tags` (string[], opcional) - Filtrar por tags
- `expired` (boolean, opcional) - Apenas vencidos
- `expiresIn` (number, opcional) - Expira em X dias
- `search` (string, opcional) - Buscar em nome, descrição, referência

**Resposta:**
```json
{
  "total": 156,
  "documents": [
    {
      "id": "doc-uuid",
      "companyId": "company-uuid",
      "folderId": "folder-uuid",
      "name": "Contrato Fornecedor XYZ",
      "description": "Contrato de fornecimento de matéria-prima",
      "fileName": "contrato-fornecedor-xyz.pdf",
      "fileSize": 524288,
      "mimeType": "application/pdf",
      "fileExtension": ".pdf",
      "reference": "CONT-2025-001",
      "documentType": "contrato",
      "tags": ["fornecedor", "matéria-prima", "2025"],
      "expiresAt": "2026-12-31T23:59:59.000Z",
      "isExpired": false,
      "daysUntilExpiration": 428,
      "version": 2,
      "isLatest": true,
      "isPublic": false,
      "uploadedBy": {
        "id": "user-uuid",
        "name": "Maria Santos",
        "email": "maria@empresa.com"
      },
      "downloadUrl": "/documents/doc-uuid/download",
      "createdAt": "2025-01-15T09:30:00.000Z",
      "updatedAt": "2025-03-20T14:15:00.000Z"
    }
  ]
}
```

---

### 6. Upload de Documento

```
POST /documents/upload
```

**Permissão:** `documents.create`

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file` (file, **OBRIGATÓRIO**) - Arquivo a ser enviado
- `name` (string, opcional) - Nome do documento (usa nome do arquivo se omitido)
- `description` (string, opcional) - Descrição do documento
- `folderId` (string, opcional) - UUID da pasta
- `reference` (string, opcional) - Referência/código
- `documentType` (string, opcional) - Tipo do documento
- `tags` (string[], opcional) - Tags separadas por vírgula
- `expiresAt` (datetime, opcional) - Data de vencimento (ISO 8601)
- `isPublic` (boolean, opcional) - Default: false

**Tipos de Arquivo Aceitos:**
```
application/pdf              → PDF
image/jpeg, image/png        → Imagens
application/msword           → Word (.doc)
application/vnd.openxmlformats-officedocument.wordprocessingml.document → Word (.docx)
application/vnd.ms-excel     → Excel (.xls)
application/vnd.openxmlformats-officedocument.spreadsheetml.sheet → Excel (.xlsx)
text/plain                   → Texto
application/zip              → ZIP
```

**Tamanho Máximo:** 50 MB por arquivo

**Exemplo com cURL:**
```bash
curl -X POST http://localhost:4000/documents/upload \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-company-id: $COMPANY_ID" \
  -F "file=@/path/to/contrato.pdf" \
  -F "name=Contrato Fornecedor ABC" \
  -F "description=Contrato de prestação de serviços" \
  -F "folderId=folder-uuid" \
  -F "reference=CONT-2025-042" \
  -F "documentType=contrato" \
  -F "tags=fornecedor,servicos,2025" \
  -F "expiresAt=2026-12-31T23:59:59.000Z" \
  -F "isPublic=false"
```

**Resposta:**
```json
{
  "id": "doc-uuid",
  "companyId": "company-uuid",
  "folderId": "folder-uuid",
  "name": "Contrato Fornecedor ABC",
  "description": "Contrato de prestação de serviços",
  "fileName": "contrato.pdf",
  "filePath": "/uploads/company-uuid/2025/10/doc-uuid.pdf",
  "fileSize": 524288,
  "mimeType": "application/pdf",
  "fileExtension": ".pdf",
  "reference": "CONT-2025-042",
  "documentType": "contrato",
  "tags": ["fornecedor", "servicos", "2025"],
  "expiresAt": "2026-12-31T23:59:59.000Z",
  "isExpired": false,
  "version": 1,
  "isLatest": true,
  "isPublic": false,
  "uploadedById": "user-uuid",
  "createdAt": "2025-10-27T10:45:00.000Z",
  "updatedAt": "2025-10-27T10:45:00.000Z"
}
```

---

### 7. Upload de Nova Versão

```
POST /documents/:id/new-version
```

**Permissão:** `documents.update`

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file` (file, **OBRIGATÓRIO**) - Nova versão do arquivo
- `description` (string, opcional) - Descrição das mudanças

**Comportamento:**
- Versão anterior é mantida com `isLatest = false`
- Nova versão recebe `version = versão_anterior + 1`
- Metadados (tags, referência, etc.) são copiados
- Data de validade é mantida

---

### 8. Download de Documento

```
GET /documents/:id/download
```

**Permissão:** `documents.read`

**Query Parameters:**
- `version` (number, opcional) - Baixar versão específica

**Resposta:** Stream do arquivo com headers apropriados
```
Content-Type: {mimeType}
Content-Disposition: attachment; filename="{fileName}"
Content-Length: {fileSize}
```

---

### 9. Visualizar Documento (Preview)

```
GET /documents/:id/preview
```

**Permissão:** `documents.read`

**Resposta:** Stream do arquivo para visualização inline
```
Content-Type: {mimeType}
Content-Disposition: inline; filename="{fileName}"
```

---

### 10. Atualizar Metadados

```
PATCH /documents/:id
```

**Permissão:** `documents.update`

**Body:** (todos campos opcionais)
```json
{
  "name": "Contrato Atualizado",
  "description": "Descrição revisada",
  "folderId": "new-folder-uuid",
  "reference": "CONT-2025-042-REV",
  "documentType": "contrato",
  "tags": ["fornecedor", "servicos", "revisado"],
  "expiresAt": "2027-12-31T23:59:59.000Z",
  "isPublic": true
}
```

---

### 11. Deletar Documento

```
DELETE /documents/:id
```

**Permissão:** `documents.delete`

**Query Parameters:**
- `deleteAllVersions` (boolean, opcional) - Deleta todas as versões

**⚠️ IMPORTANTE:**
- Se `deleteAllVersions=true`, deleta todas as versões
- Se `false` ou omitido, deleta apenas a versão especificada
- Arquivo físico é removido do servidor

**Resposta:** `204 No Content`

---

### 12. Buscar Documentos Vencidos

```
GET /documents/expired
```

**Permissão:** `documents.read`

**Query Parameters:**
- `daysAhead` (number, opcional) - Documentos que vencem em X dias (default: 30)

**Resposta:**
```json
{
  "expired": [
    {
      "id": "doc-uuid",
      "name": "Certificado SSL",
      "expiresAt": "2025-10-01T00:00:00.000Z",
      "daysExpired": 26,
      "documentType": "certificado",
      "uploadedBy": { "name": "João Silva" }
    }
  ],
  "expiringSoon": [
    {
      "id": "doc-uuid-2",
      "name": "Alvará de Funcionamento",
      "expiresAt": "2025-11-15T00:00:00.000Z",
      "daysUntilExpiration": 19,
      "documentType": "certificado",
      "uploadedBy": { "name": "Maria Santos" }
    }
  ]
}
```

---

### 13. Estatísticas de Documentos

```
GET /documents/stats
```

**Permissão:** `documents.read`

**Resposta:**
```json
{
  "total": 342,
  "totalSize": 5368709120,
  "totalSizeFormatted": "5.0 GB",
  "byType": {
    "contrato": 45,
    "nota_fiscal": 234,
    "certificado": 12,
    "comprovante": 51
  },
  "byFolder": {
    "folder-uuid-1": 120,
    "folder-uuid-2": 85,
    "without-folder": 137
  },
  "expired": 8,
  "expiringSoon": 15,
  "recentUploads": 23
}
```

---

## 📋 Tipos de Documentos Sugeridos

### Documentos Fiscais
```typescript
documentType: "nota_fiscal"         // Notas fiscais
documentType: "certificado_digital" // Certificados A1, A3
documentType: "alvara"              // Alvarás e licenças
documentType: "declaracao"          // Declarações fiscais
```

### Documentos Jurídicos
```typescript
documentType: "contrato"            // Contratos em geral
documentType: "procuracao"          // Procurações
documentType: "estatuto"            // Estatuto social
documentType: "ata"                 // Atas de reunião
```

### Documentos Operacionais
```typescript
documentType: "comprovante"         // Comprovantes diversos
documentType: "boleto"              // Boletos bancários
documentType: "recibo"              // Recibos
documentType: "orcamento"           // Orçamentos
```

### Documentos de RH
```typescript
documentType: "curriculum"          // Currículos
documentType: "contrato_trabalho"   // Contratos de trabalho
documentType: "exame_medico"        // Exames médicos
documentType: "ferias"              // Documentos de férias
```

---

## 🏷️ Tags Sugeridas

**Por Categoria:**
```typescript
// Financeiro
["financeiro", "pagamento", "recebimento", "banco"]

// Jurídico
["juridico", "contrato", "processo", "advogado"]

// Fiscal
["fiscal", "imposto", "tributo", "sefaz"]

// RH
["rh", "funcionario", "admissao", "demissao"]

// Operacional
["operacional", "fornecedor", "cliente", "estoque"]
```

**Por Urgência:**
```typescript
["urgente", "importante", "baixa-prioridade"]
```

**Por Status:**
```typescript
["ativo", "arquivado", "cancelado", "revisao"]
```

---

## ⚠️ Erros Comuns

### 400 - Arquivo muito grande
```json
{
  "statusCode": 400,
  "message": "Arquivo excede o tamanho máximo de 50MB",
  "error": "Bad Request"
}
```

### 400 - Tipo de arquivo não permitido
```json
{
  "statusCode": 400,
  "message": "Tipo de arquivo não permitido. Aceitos: PDF, imagens, Word, Excel",
  "error": "Bad Request"
}
```

### 404 - Pasta não encontrada
```json
{
  "statusCode": 404,
  "message": "Pasta não encontrada",
  "error": "Not Found"
}
```

### 400 - Pasta com documentos
```json
{
  "statusCode": 400,
  "message": "Não é possível deletar pasta com 15 documentos. Use force=true para forçar",
  "error": "Bad Request"
}
```

### 409 - Referência duplicada
```json
{
  "statusCode": 409,
  "message": "Já existe um documento com a referência CONT-2025-042",
  "error": "Conflict"
}
```

---

## 🎨 Exemplo Frontend - React Component

```tsx
import { useState, useEffect } from 'react';
import { Upload, Folder, File, Calendar, Tag } from 'lucide-react';

interface Document {
  id: string;
  name: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  reference?: string;
  documentType?: string;
  tags: string[];
  expiresAt?: string;
  isExpired: boolean;
  daysUntilExpiration?: number;
  uploadedBy: {
    name: string;
    email: string;
  };
  createdAt: string;
}

interface DocumentFolder {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  documentsCount: number;
  subfoldersCount: number;
}

export function DocumentsHub() {
  const [folders, setFolders] = useState<DocumentFolder[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadFolders();
    loadDocuments();
  }, [selectedFolder]);

  async function loadFolders() {
    const response = await fetch('/api/documents/folders', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-company-id': companyId,
      },
    });
    const data = await response.json();
    setFolders(data);
  }

  async function loadDocuments() {
    const url = selectedFolder
      ? `/api/documents?folderId=${selectedFolder}`
      : '/api/documents';
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-company-id': companyId,
      },
    });
    const data = await response.json();
    setDocuments(data.documents);
  }

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', file.name);
    if (selectedFolder) {
      formData.append('folderId', selectedFolder);
    }

    try {
      await fetch('/api/documents/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-company-id': companyId,
        },
        body: formData,
      });

      await loadDocuments();
    } finally {
      setUploading(false);
    }
  }

  async function downloadDocument(id: string) {
    const response = await fetch(`/api/documents/${id}/download`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-company-id': companyId,
      },
    });

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = response.headers.get('content-disposition')?.split('filename=')[1] || 'download';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  return (
    <div className="documents-hub">
      <div className="header">
        <h1>Hub de Documentos</h1>
        <label className="upload-button">
          <Upload size={20} />
          Fazer Upload
          <input
            type="file"
            onChange={handleUpload}
            disabled={uploading}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      <div className="content">
        {/* Sidebar com pastas */}
        <aside className="folders-sidebar">
          <h2>Pastas</h2>
          <div
            className={`folder-item ${!selectedFolder ? 'active' : ''}`}
            onClick={() => setSelectedFolder(null)}
          >
            <Folder size={18} />
            Todos os Documentos
          </div>
          {folders.map(folder => (
            <div
              key={folder.id}
              className={`folder-item ${selectedFolder === folder.id ? 'active' : ''}`}
              onClick={() => setSelectedFolder(folder.id)}
              style={{ borderLeft: `4px solid ${folder.color || '#gray'}` }}
            >
              <Folder size={18} />
              <div>
                <div className="folder-name">{folder.name}</div>
                <div className="folder-stats">
                  {folder.documentsCount} documentos
                </div>
              </div>
            </div>
          ))}
        </aside>

        {/* Lista de documentos */}
        <main className="documents-list">
          {uploading && (
            <div className="upload-progress">Fazendo upload...</div>
          )}

          {documents.map(doc => (
            <div key={doc.id} className="document-card">
              <div className="document-icon">
                <File size={32} />
              </div>
              
              <div className="document-info">
                <h3>{doc.name}</h3>
                <div className="document-meta">
                  <span>{doc.fileName}</span>
                  <span>{formatFileSize(doc.fileSize)}</span>
                  <span>por {doc.uploadedBy.name}</span>
                </div>

                {doc.reference && (
                  <div className="reference">
                    Ref: {doc.reference}
                  </div>
                )}

                {doc.tags.length > 0 && (
                  <div className="tags">
                    {doc.tags.map(tag => (
                      <span key={tag} className="tag">
                        <Tag size={12} />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {doc.expiresAt && (
                  <div className={`expiration ${doc.isExpired ? 'expired' : ''}`}>
                    <Calendar size={14} />
                    {doc.isExpired
                      ? `Vencido há ${Math.abs(doc.daysUntilExpiration!)} dias`
                      : `Vence em ${doc.daysUntilExpiration} dias`
                    }
                  </div>
                )}
              </div>

              <button
                className="download-button"
                onClick={() => downloadDocument(doc.id)}
              >
                Download
              </button>
            </div>
          ))}
        </main>
      </div>
    </div>
  );
}
```

---

## 🔄 Fluxo de Trabalho Completo

### 1. Organização Inicial
```bash
# 1. Criar estrutura de pastas
POST /documents/folders
{
  "name": "Documentos Fiscais",
  "color": "#3B82F6"
}

POST /documents/folders
{
  "name": "Contratos",
  "color": "#10B981"
}

POST /documents/folders
{
  "name": "Certificados",
  "parentId": "fiscais-folder-uuid",
  "color": "#EF4444"
}
```

### 2. Upload de Documentos
```bash
# Upload de nota fiscal
curl -X POST /documents/upload \
  -F "file=@nf-0001.pdf" \
  -F "name=Nota Fiscal 0001" \
  -F "folderId=fiscais-folder-uuid" \
  -F "reference=NF-2025-0001" \
  -F "documentType=nota_fiscal" \
  -F "tags=venda,cliente-abc"
```

### 3. Gestão de Vencimentos
```bash
# Upload de certificado digital com validade
curl -X POST /documents/upload \
  -F "file=@certificado-a1.pfx" \
  -F "name=Certificado Digital A1" \
  -F "folderId=certificados-folder-uuid" \
  -F "documentType=certificado_digital" \
  -F "expiresAt=2026-06-30T23:59:59Z" \
  -F "tags=fiscal,assinatura"

# Verificar documentos vencendo
GET /documents/expired?daysAhead=30
```

### 4. Versionamento
```bash
# Upload de nova versão do contrato
POST /documents/{contract-id}/new-version
FormData: file=contrato-v2.pdf, description="Adicionada cláusula 5.3"
```

### 5. Busca e Filtros
```bash
# Buscar contratos de 2025
GET /documents?documentType=contrato&tags=2025

# Buscar por referência
GET /documents?search=CONT-2025

# Documentos de uma pasta específica
GET /documents?folderId=contratos-folder-uuid
```

---

## 📊 Relatórios e Dashboards

### Widget: Documentos Vencendo
```typescript
GET /documents/expired?daysAhead=15

// Exibir alerta visual para:
// - Documentos vencidos (vermelho)
// - Vencendo em 7 dias (laranja)
// - Vencendo em 15 dias (amarelo)
```

### Widget: Espaço Utilizado
```typescript
GET /documents/stats

// Exibir:
// - Total de documentos
// - Espaço total usado
// - Breakdown por tipo
// - Gráfico de crescimento
```

### Widget: Uploads Recentes
```typescript
GET /documents?sort=createdAt&order=desc&limit=10

// Últimos 10 documentos enviados
```

---

## 🎯 Boas Práticas

### ✅ DO's

1. **Organize em Pastas Lógicas**
   - Crie estrutura hierárquica clara
   - Use cores para identificação rápida

2. **Use Tags Consistentemente**
   - Defina padrão de nomenclatura
   - Tags em lowercase
   - Máximo 5 tags por documento

3. **Defina Referências Únicas**
   - Use padrão: `TIPO-ANO-NUMERO`
   - Exemplo: `CONT-2025-042`, `NF-2025-1234`

4. **Configure Validades**
   - Sempre defina `expiresAt` para:
     - Certificados digitais
     - Alvarás
     - Contratos temporários
     - Documentos com prazo

5. **Mantenha Descrições**
   - Adicione contexto útil
   - Facilita buscas futuras

### ❌ DON'Ts

1. **Não Suba Arquivos Enormes**
   - Respeite limite de 50MB
   - Comprima PDFs quando possível

2. **Não Use Nomes Genéricos**
   - ❌ "documento.pdf"
   - ✅ "Contrato Fornecedor XYZ - Jan 2025.pdf"

3. **Não Esqueça de Versionar**
   - Sempre use endpoint `/new-version`
   - Nunca substitua arquivo manualmente

4. **Não Deixe Documentos sem Pasta**
   - Organize sempre que possível
   - Use pasta "Temporários" se necessário

---

## 🔒 Segurança

### Armazenamento
- Arquivos salvos fora do diretório público
- Acesso apenas via API autenticada
- Nomes de arquivo randomizados (UUID)

### Validações
- Whitelist de tipos MIME
- Verificação de magic numbers
- Limite de tamanho por upload

### Auditoria
- Registro de quem fez upload
- IP e User-Agent capturados
- Histórico de downloads (opcional)

---

## 📚 Referências

- [Sistema de Autenticação](./AUTH.md)
- [Gerenciamento de Usuários](./USERS_MANAGEMENT.md)
- [Sistema de Auditoria](./AUDIT_SYSTEM.md)
- [Permissões](./AUTH_PERMISSIONS.md)

---

## 🎉 Resumo

**✅ Sistema Completo de Documentos:**

- 13 endpoints implementados
- Upload com múltiplos formatos
- Organização em pastas hierárquicas
- Metadados completos (referência, tipo, tags, validade)
- Versionamento automático
- Controle de vencimentos
- Busca avançada
- Estatísticas e relatórios
- Auditoria completa
- Pronto para produção

**Status:** 🟢 **PRODUCTION READY**
