# 📁 Documentos - Referência Rápida de Endpoints

## 🔗 Base URL
```
http://localhost:3000/documents
```

---

## 📂 PASTAS (4 endpoints)

### 1️⃣ Listar Pastas
```http
GET /documents/folders?parentId={uuid}
Authorization: Bearer {token}
Permissão: documents.read
```

### 2️⃣ Criar Pasta
```http
POST /documents/folders
Authorization: Bearer {token}
Permissão: documents.create
Content-Type: application/json

{
  "name": "Nome da Pasta",
  "description": "Descrição",
  "color": "#4CAF50",
  "icon": "receipt",
  "parentId": null,
  "isPublic": false
}
```

### 3️⃣ Atualizar Pasta
```http
PATCH /documents/folders/{id}
Authorization: Bearer {token}
Permissão: documents.update
Content-Type: application/json

{
  "name": "Novo Nome"
}
```

### 4️⃣ Deletar Pasta
```http
DELETE /documents/folders/{id}?force=true
Authorization: Bearer {token}
Permissão: documents.delete
```

---

## 📄 DOCUMENTOS (9 endpoints)

### 5️⃣ Listar Documentos
```http
GET /documents?folderId={uuid}&search=termo&page=1&limit=20
Authorization: Bearer {token}
Permissão: documents.read

Query Parameters:
- folderId: UUID da pasta
- documentType: Tipo do documento
- tags: "tag1,tag2,tag3"
- expired: true/false
- expiresIn: Dias (número)
- search: Texto de busca
- page: Número da página
- limit: Itens por página (max 100)
```

### 6️⃣ Ver Detalhes
```http
GET /documents/{id}
Authorization: Bearer {token}
Permissão: documents.read
```

### 7️⃣ Upload de Documento
```http
POST /documents/upload
Authorization: Bearer {token}
Permissão: documents.create
Content-Type: multipart/form-data

Form Data:
- file: [arquivo] (obrigatório)
- name: "Nome do Documento"
- description: "Descrição"
- folderId: UUID da pasta
- reference: "REF-2024-001"
- documentType: "invoice"
- tags: "tag1,tag2,tag3"
- expiresAt: "2025-12-31"
- isPublic: "false"
```

**Tipos Permitidos:**
- PDF: `application/pdf`
- Imagens: JPG, PNG, GIF, SVG, WEBP
- Word: DOC, DOCX
- Excel: XLS, XLSX
- PowerPoint: PPT, PPTX
- Texto: TXT, CSV
- Compactados: ZIP, RAR

**Limite:** 50MB

### 8️⃣ Download
```http
GET /documents/{id}/download
Authorization: Bearer {token}
Permissão: documents.read

Response:
- Content-Type: {mime-type}
- Content-Disposition: attachment; filename="..."
- Body: [binary data]
```

### 9️⃣ Atualizar Metadados
```http
PATCH /documents/{id}
Authorization: Bearer {token}
Permissão: documents.update
Content-Type: application/json

{
  "name": "Novo Nome",
  "description": "Nova descrição",
  "folderId": "novo-folder-uuid",
  "documentType": "contract",
  "tags": ["tag1", "tag2"],
  "expiresAt": "2026-01-31",
  "isPublic": false
}
```

### 🔟 Upload Nova Versão
```http
POST /documents/{id}/version
Authorization: Bearer {token}
Permissão: documents.create
Content-Type: multipart/form-data

Form Data:
- file: [arquivo] (obrigatório)
- description: "Versão 2 - Corrigida"
```

### 1️⃣1️⃣ Deletar Documento
```http
DELETE /documents/{id}?deleteAllVersions=true
Authorization: Bearer {token}
Permissão: documents.delete
```

---

## 📊 RELATÓRIOS (2 endpoints)

### 1️⃣2️⃣ Documentos Vencidos
```http
GET /documents/expired?daysAhead=30
Authorization: Bearer {token}
Permissão: documents.read

Response:
{
  "expired": [
    { "id": "...", "daysExpired": 165, ... }
  ],
  "expiringSoon": [
    { "id": "...", "daysUntilExpiration": 19, ... }
  ]
}
```

### 1️⃣3️⃣ Estatísticas
```http
GET /documents/stats
Authorization: Bearer {token}
Permissão: documents.read

Response:
{
  "total": 156,
  "totalSize": 524288000,
  "totalSizeFormatted": "500.0 MB",
  "byType": { "invoice": 45, ... },
  "byFolder": { "folder-uuid": 45, ... },
  "expired": 8,
  "expiringSoon": 12,
  "recentUploads": 15
}
```

---

## 🔑 PERMISSÕES

| Permissão | Descrição | Endpoints |
|-----------|-----------|-----------|
| `documents.read` | Visualizar | GET (todos) |
| `documents.create` | Criar/Upload | POST |
| `documents.update` | Editar metadados | PATCH |
| `documents.delete` | Deletar | DELETE |

---

## 💾 ESTRUTURA DE ARMAZENAMENTO

```
uploads/
└── documents/
    └── {companyId}/
        └── {year}/
            └── {month}/
                ├── {uuid1}.pdf
                ├── {uuid2}.jpg
                └── {uuid3}.docx
```

---

## ⚡ EXEMPLOS RÁPIDOS

### Criar Pasta e Fazer Upload
```bash
# 1. Criar pasta
curl -X POST http://localhost:3000/documents/folders \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Notas Fiscais","color":"#4CAF50"}'

# 2. Upload
curl -X POST http://localhost:3000/documents/upload \
  -H "Authorization: Bearer TOKEN" \
  -F "file=@nota.pdf" \
  -F "name=NF Janeiro" \
  -F "folderId=FOLDER_UUID" \
  -F "reference=NF-2024-001"
```

### Buscar e Baixar
```bash
# Buscar
curl -X GET "http://localhost:3000/documents?search=nota" \
  -H "Authorization: Bearer TOKEN"

# Baixar
curl -X GET http://localhost:3000/documents/DOC_UUID/download \
  -H "Authorization: Bearer TOKEN" \
  -o arquivo.pdf
```

### Monitorar Vencimentos
```bash
# Ver vencidos
curl -X GET http://localhost:3000/documents/expired \
  -H "Authorization: Bearer TOKEN"

# Ver estatísticas
curl -X GET http://localhost:3000/documents/stats \
  -H "Authorization: Bearer TOKEN"
```

---

## 📱 COLLECTION POSTMAN

Importe para Postman:
```
docs/postman-collection-documents.json
```

Variáveis necessárias:
- `base_url`: http://localhost:3000
- `token`: seu JWT token

---

## 🐛 CÓDIGOS DE ERRO COMUNS

| Status | Erro | Causa |
|--------|------|-------|
| 400 | Bad Request | Validação falhou ou arquivo inválido |
| 401 | Unauthorized | Token ausente ou inválido |
| 403 | Forbidden | Sem permissão |
| 404 | Not Found | Recurso não encontrado |
| 409 | Conflict | Referência duplicada |
| 413 | Payload Too Large | Arquivo > 50MB |

---

## 📚 DOCUMENTAÇÃO COMPLETA

Para mais detalhes, consulte:

- **[API_DOCUMENTS.md](./API_DOCUMENTS.md)** - Documentação completa com exemplos
- **[DOCUMENTS_QUICKSTART.md](./DOCUMENTS_QUICKSTART.md)** - Guia prático
- **[postman-collection-documents.json](./postman-collection-documents.json)** - Testes prontos

---

**Última atualização:** 27/10/2024
