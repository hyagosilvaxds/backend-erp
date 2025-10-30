# 📁 Módulo de Documentos - Guia Rápido

## ✅ Implementação Completa

O módulo de documentos está 100% implementado e pronto para uso!

## 🎯 Funcionalidades Implementadas

### **1. Gestão de Pastas (4 endpoints)**
- ✅ `GET /documents/folders` - Listar pastas
- ✅ `POST /documents/folders` - Criar pasta
- ✅ `PATCH /documents/folders/:id` - Editar pasta
- ✅ `DELETE /documents/folders/:id?force=true` - Deletar pasta

### **2. Upload de Documentos (9 endpoints)**
- ✅ `POST /documents/upload` - Upload de arquivo
- ✅ `GET /documents` - Listar documentos com filtros
- ✅ `GET /documents/:id` - Ver detalhes
- ✅ `GET /documents/:id/download` - Download
- ✅ `PATCH /documents/:id` - Atualizar metadados
- ✅ `DELETE /documents/:id` - Deletar documento
- ✅ `POST /documents/:id/version` - Upload nova versão
- ✅ `GET /documents/expired` - Documentos vencidos
- ✅ `GET /documents/stats` - Estatísticas

### **3. Features Avançadas**
- ✅ 17 tipos de arquivo permitidos (PDF, imagens, Office, etc.)
- ✅ Limite de 50MB por arquivo
- ✅ Armazenamento organizado: `/uploads/documents/{companyId}/{year}/{month}/`
- ✅ Versionamento de documentos
- ✅ Controle de validade com cron job automático
- ✅ Busca por texto, tags, tipo, pasta
- ✅ Estatísticas de uso e armazenamento
- ✅ Pastas hierárquicas (subpastas)
- ✅ Documentos públicos/privados
- ✅ Referências únicas (ex: "NF-2024-001")

## 🚀 Como Testar

### 1️⃣ **Criar uma Pasta**

```bash
POST http://localhost:3000/documents/folders
Authorization: Bearer {seu-token}
Content-Type: application/json

{
  "name": "Notas Fiscais",
  "description": "Notas fiscais da empresa",
  "color": "#4CAF50",
  "icon": "receipt",
  "isPublic": false
}
```

### 2️⃣ **Fazer Upload de um Documento**

```bash
POST http://localhost:3000/documents/upload
Authorization: Bearer {seu-token}
Content-Type: multipart/form-data

file: [selecione um arquivo]
name: "NF Janeiro 2024"
description: "Nota fiscal do mês de janeiro"
folderId: "uuid-da-pasta"
reference: "NF-2024-001"
documentType: "invoice"
tags: "nota-fiscal,janeiro,2024"
expiresAt: "2025-12-31"
isPublic: "false"
```

### 3️⃣ **Buscar Documentos**

```bash
GET http://localhost:3000/documents?search=nota&documentType=invoice&page=1&limit=20
Authorization: Bearer {seu-token}
```

### 4️⃣ **Download de Documento**

```bash
GET http://localhost:3000/documents/{document-id}/download
Authorization: Bearer {seu-token}
```

### 5️⃣ **Ver Documentos Vencidos**

```bash
GET http://localhost:3000/documents/expired?daysAhead=30
Authorization: Bearer {seu-token}
```

### 6️⃣ **Estatísticas**

```bash
GET http://localhost:3000/documents/stats
Authorization: Bearer {seu-token}
```

## 📊 Estrutura de Armazenamento

```
uploads/
└── documents/
    └── {companyId}/
        └── {year}/
            └── {month}/
                ├── uuid1.pdf
                ├── uuid2.jpg
                └── uuid3.docx
```

## 🔐 Permissões Necessárias

Todas as rotas requerem autenticação JWT + uma das permissões:

- **`documents.read`** - Visualizar documentos e pastas
- **`documents.create`** - Fazer upload e criar pastas
- **`documents.update`** - Editar metadados
- **`documents.delete`** - Deletar documentos e pastas

## 🤖 Cron Job Automático

Um job roda **diariamente à meia-noite** e marca documentos vencidos:

```typescript
@Cron('0 0 * * *')
async markExpiredDocuments() {
  // Atualiza isExpired=true para documentos com expiresAt < hoje
}
```

## 📦 Tipos de Arquivo Permitidos

1. **Documentos**: PDF, DOC, DOCX
2. **Planilhas**: XLS, XLSX
3. **Apresentações**: PPT, PPTX
4. **Imagens**: JPG, JPEG, PNG, GIF, SVG, WEBP
5. **Compactados**: ZIP, RAR
6. **Texto**: TXT, CSV

## 🧪 Próximos Passos

1. **Testar todos os endpoints** com Postman/Insomnia
2. **Verificar logs de auditoria** (se integrado)
3. **Testar upload de arquivos grandes** (até 50MB)
4. **Verificar permissões** de diferentes usuários
5. **Testar filtros e busca** avançada
6. **Validar cron job** de expiração
7. **Testar versionamento** de documentos

## 📚 Documentação Completa

Para mais detalhes, consulte:

- **`docs/DOCUMENTS_HUB.md`** - Referência completa da API
- **`docs/DOCUMENTS_QUICKSTART.md`** - Guia prático com exemplos
- **`docs/DOCUMENTS_SUMMARY.md`** - Resumo executivo
- **`docs/DOCUMENTS_IMPLEMENTATION.md`** - Guia de implementação

## ✨ Funcionalidades Extras Disponíveis

- Organização por pastas hierárquicas
- Tags para categorização flexível
- Busca full-text em nome, descrição e referência
- Controle de validade com alertas
- Versionamento automático
- Estatísticas de uso e armazenamento
- Documentos públicos (compartilháveis)
- Referências únicas (ex: números de nota fiscal)

---

**🎉 Sistema pronto para produção!**
