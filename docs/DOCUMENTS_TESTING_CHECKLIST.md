# ✅ Checklist de Testes - Módulo de Documentos

## 📋 Antes de Começar

### Pré-requisitos
- [ ] Servidor rodando (`npm run start:dev`)
- [ ] Token JWT válido obtido via `/auth/login`
- [ ] Postman/Insomnia instalado
- [ ] Collection importada (`docs/postman-collection-documents.json`)
- [ ] Arquivo de teste preparado (PDF, imagem, etc.)

---

## 🔐 Testes de Autenticação e Permissões

### Autenticação Básica
- [ ] **T-AUTH-01**: Tentar acessar endpoint sem token → `401 Unauthorized`
- [ ] **T-AUTH-02**: Tentar acessar com token inválido → `401 Unauthorized`
- [ ] **T-AUTH-03**: Tentar acessar com token expirado → `401 Unauthorized`
- [ ] **T-AUTH-04**: Acessar com token válido → `200 OK`

### Permissões
- [ ] **T-PERM-01**: Usuário sem `documents.read` tentar listar → `403 Forbidden`
- [ ] **T-PERM-02**: Usuário sem `documents.create` tentar upload → `403 Forbidden`
- [ ] **T-PERM-03**: Usuário sem `documents.update` tentar editar → `403 Forbidden`
- [ ] **T-PERM-04**: Usuário sem `documents.delete` tentar deletar → `403 Forbidden`
- [ ] **T-PERM-05**: Usuário admin executar todas as operações → `200/201 OK`

### Isolamento de Dados
- [ ] **T-ISO-01**: Usuário da Empresa A não vê documentos da Empresa B
- [ ] **T-ISO-02**: Usuário da Empresa A tenta acessar documento da Empresa B → `404`
- [ ] **T-ISO-03**: Busca retorna apenas documentos da empresa do usuário

---

## 📂 Testes de Pastas

### Criar Pasta (POST /documents/folders)
- [ ] **T-FOL-01**: Criar pasta raiz com dados válidos → `201 Created`
- [ ] **T-FOL-02**: Criar pasta sem nome → `400 Bad Request`
- [ ] **T-FOL-03**: Criar pasta com nome muito curto (< 3 chars) → `400`
- [ ] **T-FOL-04**: Criar pasta com nome muito longo (> 100 chars) → `400`
- [ ] **T-FOL-05**: Criar pasta com cor inválida (não hex) → `400`
- [ ] **T-FOL-06**: Criar pasta com `parentId` inexistente → `404`
- [ ] **T-FOL-07**: Criar pasta com `parentId` de outra empresa → `404`
- [ ] **T-FOL-08**: Criar subpasta com `parentId` válido → `201`
- [ ] **T-FOL-09**: Verificar `createdBy` está correto
- [ ] **T-FOL-10**: Verificar `companyId` está correto

### Listar Pastas (GET /documents/folders)
- [ ] **T-FOL-11**: Listar pastas raiz → `200 OK` com array
- [ ] **T-FOL-12**: Listar subpastas com `parentId` → `200 OK`
- [ ] **T-FOL-13**: Verificar `documentsCount` está correto
- [ ] **T-FOL-14**: Verificar `subfoldersCount` está correto
- [ ] **T-FOL-15**: Verificar ordenação por nome (asc)
- [ ] **T-FOL-16**: Pasta vazia retorna array vazio

### Atualizar Pasta (PATCH /documents/folders/:id)
- [ ] **T-FOL-17**: Atualizar nome → `200 OK`
- [ ] **T-FOL-18**: Atualizar descrição → `200 OK`
- [ ] **T-FOL-19**: Atualizar cor → `200 OK`
- [ ] **T-FOL-20**: Atualizar todos os campos → `200 OK`
- [ ] **T-FOL-21**: Atualizar pasta inexistente → `404`
- [ ] **T-FOL-22**: Atualizar pasta de outra empresa → `404`
- [ ] **T-FOL-23**: Verificar `updatedAt` foi atualizado

### Deletar Pasta (DELETE /documents/folders/:id)
- [ ] **T-FOL-24**: Deletar pasta vazia → `200 OK`
- [ ] **T-FOL-25**: Deletar pasta com documentos sem `force` → `400`
- [ ] **T-FOL-26**: Deletar pasta com subpastas sem `force` → `400`
- [ ] **T-FOL-27**: Deletar pasta com conteúdo usando `force=true` → `200 OK`
- [ ] **T-FOL-28**: Verificar arquivos físicos foram deletados
- [ ] **T-FOL-29**: Deletar pasta inexistente → `404`
- [ ] **T-FOL-30**: Deletar pasta de outra empresa → `404`

---

## 📄 Testes de Upload

### Upload Básico (POST /documents/upload)
- [ ] **T-UPL-01**: Upload de PDF válido → `201 Created`
- [ ] **T-UPL-02**: Upload de imagem JPG → `201`
- [ ] **T-UPL-03**: Upload de imagem PNG → `201`
- [ ] **T-UPL-04**: Upload de documento Word (DOCX) → `201`
- [ ] **T-UPL-05**: Upload de planilha Excel (XLSX) → `201`
- [ ] **T-UPL-06**: Upload de ZIP → `201`
- [ ] **T-UPL-07**: Upload sem arquivo → `400`
- [ ] **T-UPL-08**: Upload de tipo não permitido (EXE) → `400`
- [ ] **T-UPL-09**: Upload de arquivo > 50MB → `400` ou `413`
- [ ] **T-UPL-10**: Verificar arquivo físico foi criado no caminho correto

### Upload com Metadados
- [ ] **T-UPL-11**: Upload com nome customizado
- [ ] **T-UPL-12**: Upload com descrição
- [ ] **T-UPL-13**: Upload com `folderId` válido
- [ ] **T-UPL-14**: Upload com `folderId` inexistente → `404`
- [ ] **T-UPL-15**: Upload com referência única
- [ ] **T-UPL-16**: Upload com referência duplicada → `409`
- [ ] **T-UPL-17**: Upload com `documentType`
- [ ] **T-UPL-18**: Upload com tags (CSV)
- [ ] **T-UPL-19**: Upload com data de expiração
- [ ] **T-UPL-20**: Upload como público (`isPublic=true`)

### Validações de Upload
- [ ] **T-UPL-21**: Verificar `fileName` preserva nome original
- [ ] **T-UPL-22**: Verificar `filePath` tem UUID único
- [ ] **T-UPL-23**: Verificar `fileSize` está correto
- [ ] **T-UPL-24**: Verificar `mimeType` está correto
- [ ] **T-UPL-25**: Verificar `fileExtension` está correto
- [ ] **T-UPL-26**: Verificar `version` = 1 para novo documento
- [ ] **T-UPL-27**: Verificar `isLatest` = true
- [ ] **T-UPL-28**: Verificar `uploadedById` é o usuário atual
- [ ] **T-UPL-29**: Verificar `companyId` é da empresa do usuário
- [ ] **T-UPL-30**: Verificar `createdAt` e `updatedAt` estão setados

---

## 📋 Testes de Listagem e Busca

### Listar Documentos (GET /documents)
- [ ] **T-LST-01**: Listar todos os documentos → `200 OK`
- [ ] **T-LST-02**: Verificar paginação (page, limit)
- [ ] **T-LST-03**: Verificar `total`, `totalPages` estão corretos
- [ ] **T-LST-04**: Verificar `daysUntilExpiration` calculado
- [ ] **T-LST-05**: Verificar `downloadUrl` está presente
- [ ] **T-LST-06**: Verificar ordenação por `createdAt` desc

### Filtros
- [ ] **T-FLT-01**: Filtrar por `folderId`
- [ ] **T-FLT-02**: Filtrar por `documentType`
- [ ] **T-FLT-03**: Filtrar por `tags` (uma tag)
- [ ] **T-FLT-04**: Filtrar por múltiplas `tags`
- [ ] **T-FLT-05**: Filtrar por `expired=true`
- [ ] **T-FLT-06**: Filtrar por `expired=false`
- [ ] **T-FLT-07**: Filtrar por `expiresIn` (dias)
- [ ] **T-FLT-08**: Combinar múltiplos filtros

### Busca (search)
- [ ] **T-SRC-01**: Buscar por nome do documento
- [ ] **T-SRC-02**: Buscar por descrição
- [ ] **T-SRC-03**: Buscar por referência
- [ ] **T-SRC-04**: Buscar por nome do arquivo
- [ ] **T-SRC-05**: Busca case-insensitive
- [ ] **T-SRC-06**: Busca com termo parcial
- [ ] **T-SRC-07**: Busca sem resultados retorna array vazio

### Ver Detalhes (GET /documents/:id)
- [ ] **T-DTL-01**: Ver detalhes de documento existente → `200 OK`
- [ ] **T-DTL-02**: Ver detalhes com todas as relações carregadas
- [ ] **T-DTL-03**: Ver documento inexistente → `404`
- [ ] **T-DTL-04**: Ver documento de outra empresa → `404`

---

## ⬇️ Testes de Download

### Download (GET /documents/:id/download)
- [ ] **T-DWN-01**: Download de documento existente → `200 OK` + arquivo
- [ ] **T-DWN-02**: Verificar `Content-Type` correto
- [ ] **T-DWN-03**: Verificar `Content-Length` correto
- [ ] **T-DWN-04**: Verificar `Content-Disposition` tem filename
- [ ] **T-DWN-05**: Verificar conteúdo do arquivo está correto
- [ ] **T-DWN-06**: Download de documento inexistente → `404`
- [ ] **T-DWN-07**: Download quando arquivo físico não existe → `500`
- [ ] **T-DWN-08**: Download de documento de outra empresa → `404`

---

## ✏️ Testes de Atualização

### Atualizar Metadados (PATCH /documents/:id)
- [ ] **T-UPD-01**: Atualizar nome → `200 OK`
- [ ] **T-UPD-02**: Atualizar descrição → `200 OK`
- [ ] **T-UPD-03**: Mover para outra pasta (`folderId`) → `200 OK`
- [ ] **T-UPD-04**: Mover para pasta inexistente → `404`
- [ ] **T-UPD-05**: Atualizar `documentType` → `200 OK`
- [ ] **T-UPD-06**: Atualizar tags → `200 OK`
- [ ] **T-UPD-07**: Atualizar data de expiração → `200 OK`
- [ ] **T-UPD-08**: Alterar `isPublic` → `200 OK`
- [ ] **T-UPD-09**: Atualizar referência → `200 OK`
- [ ] **T-UPD-10**: Atualizar para referência duplicada → `409`
- [ ] **T-UPD-11**: Atualizar documento inexistente → `404`
- [ ] **T-UPD-12**: Verificar `updatedAt` foi atualizado

---

## 🔄 Testes de Versionamento

### Upload Nova Versão (POST /documents/:id/version)
- [ ] **T-VER-01**: Upload nova versão com arquivo → `201 Created`
- [ ] **T-VER-02**: Verificar `version` incrementou
- [ ] **T-VER-03**: Verificar `previousVersionId` aponta para versão anterior
- [ ] **T-VER-04**: Verificar nova versão tem `isLatest=true`
- [ ] **T-VER-05**: Verificar versão anterior tem `isLatest=false`
- [ ] **T-VER-06**: Verificar metadados foram copiados da versão anterior
- [ ] **T-VER-07**: Nova versão sem arquivo → `400`
- [ ] **T-VER-08**: Versão de documento inexistente → `404`
- [ ] **T-VER-09**: Upload múltiplas versões (v1 → v2 → v3)
- [ ] **T-VER-10**: Buscar todas as versões pela referência

---

## 🗑️ Testes de Deleção

### Deletar Documento (DELETE /documents/:id)
- [ ] **T-DEL-01**: Deletar documento existente → `200 OK`
- [ ] **T-DEL-02**: Verificar arquivo físico foi deletado
- [ ] **T-DEL-03**: Verificar registro foi removido do banco
- [ ] **T-DEL-04**: Deletar documento inexistente → `404`
- [ ] **T-DEL-05**: Deletar documento de outra empresa → `404`
- [ ] **T-DEL-06**: Deletar com `deleteAllVersions=true`
- [ ] **T-DEL-07**: Verificar todas as versões foram deletadas
- [ ] **T-DEL-08**: Tentar acessar documento deletado → `404`

---

## 📊 Testes de Relatórios

### Documentos Vencidos (GET /documents/expired)
- [ ] **T-EXP-01**: Listar vencidos e vencendo → `200 OK`
- [ ] **T-EXP-02**: Verificar array `expired` contém apenas vencidos
- [ ] **T-EXP-03**: Verificar array `expiringSoon` contém apenas próximos
- [ ] **T-EXP-04**: Verificar `daysExpired` calculado corretamente
- [ ] **T-EXP-05**: Verificar `daysUntilExpiration` calculado
- [ ] **T-EXP-06**: Filtrar por `daysAhead` (7, 15, 30, 60)
- [ ] **T-EXP-07**: Sem documentos vencidos retorna arrays vazios
- [ ] **T-EXP-08**: Ordenação por data de expiração (asc)

### Estatísticas (GET /documents/stats)
- [ ] **T-STA-01**: Ver estatísticas → `200 OK`
- [ ] **T-STA-02**: Verificar `total` está correto
- [ ] **T-STA-03**: Verificar `totalSize` em bytes
- [ ] **T-STA-04**: Verificar `totalSizeFormatted` (KB/MB/GB)
- [ ] **T-STA-05**: Verificar `byType` tem contagens corretas
- [ ] **T-STA-06**: Verificar `byFolder` tem contagens corretas
- [ ] **T-STA-07**: Verificar `expired` count
- [ ] **T-STA-08**: Verificar `expiringSoon` count (30 dias)
- [ ] **T-STA-09**: Verificar `recentUploads` (últimos 7 dias)
- [ ] **T-STA-10**: Sem documentos retorna zeros

---

## 🤖 Testes de Automação

### Cron Job de Expiração
- [ ] **T-CRN-01**: Criar documento com data passada
- [ ] **T-CRN-02**: Aguardar cron executar (ou executar manualmente)
- [ ] **T-CRN-03**: Verificar `isExpired` foi atualizado para `true`
- [ ] **T-CRN-04**: Verificar log no console
- [ ] **T-CRN-05**: Documentos já vencidos não são reprocessados

---

## 🔒 Testes de Segurança

### Validação de Arquivos
- [ ] **T-SEC-01**: Upload de script malicioso (.sh, .bat) → `400`
- [ ] **T-SEC-02**: Upload de executável (.exe, .app) → `400`
- [ ] **T-SEC-03**: Upload com MIME type falsificado → `400`
- [ ] **T-SEC-04**: Upload de arquivo muito grande → `400/413`

### Isolamento
- [ ] **T-SEC-05**: Usuário não pode acessar pastas de outra empresa
- [ ] **T-SEC-06**: Usuário não pode acessar documentos de outra empresa
- [ ] **T-SEC-07**: Usuário não pode mover documentos entre empresas
- [ ] **T-SEC-08**: Path traversal no download (`../../etc/passwd`) → Bloqueado

### SQL Injection
- [ ] **T-SEC-09**: Busca com SQL injection → Não executa SQL
- [ ] **T-SEC-10**: Filtros com SQL injection → Seguro (Prisma protege)

---

## 🎭 Testes de Edge Cases

### Casos Extremos
- [ ] **T-EDG-01**: Upload de arquivo de 0 bytes
- [ ] **T-EDG-02**: Upload de arquivo exatamente 50MB
- [ ] **T-EDG-03**: Nome com caracteres especiais (ñ, ç, ü)
- [ ] **T-EDG-04**: Nome com emojis
- [ ] **T-EDG-05**: Descrição muito longa
- [ ] **T-EDG-06**: Tags array vazio
- [ ] **T-EDG-07**: Tags com mais de 50 itens
- [ ] **T-EDG-08**: Data de expiração no passado
- [ ] **T-EDG-09**: Data de expiração muito no futuro (100 anos)
- [ ] **T-EDG-10**: Múltiplos uploads simultâneos (concorrência)

### Performance
- [ ] **T-PRF-01**: Upload de arquivo 50MB < 30 segundos
- [ ] **T-PRF-02**: Listar 1000 documentos < 2 segundos
- [ ] **T-PRF-03**: Busca em 10.000 documentos < 3 segundos
- [ ] **T-PRF-04**: Estatísticas com muitos dados < 1 segundo

---

## 📱 Testes de Integração

### Fluxo Completo
- [ ] **T-INT-01**: Criar pasta → Upload → Listar → Download → Deletar
- [ ] **T-INT-02**: Upload → Ver detalhes → Atualizar → Nova versão → Download
- [ ] **T-INT-03**: Criar estrutura hierárquica de pastas (3 níveis)
- [ ] **T-INT-04**: Mover documento entre pastas
- [ ] **T-INT-05**: Deletar pasta com force (cascade)

### Auditoria (se implementada)
- [ ] **T-AUD-01**: Verificar log de criação de pasta
- [ ] **T-AUD-02**: Verificar log de upload
- [ ] **T-AUD-03**: Verificar log de atualização
- [ ] **T-AUD-04**: Verificar log de deleção
- [ ] **T-AUD-05**: Verificar log de download

---

## 📈 Resumo de Testes

### Total de Testes: **150+**

| Categoria | Quantidade |
|-----------|------------|
| Autenticação & Permissões | 8 |
| Pastas | 30 |
| Upload | 30 |
| Listagem & Busca | 17 |
| Download | 8 |
| Atualização | 12 |
| Versionamento | 10 |
| Deleção | 8 |
| Relatórios | 10 |
| Automação | 5 |
| Segurança | 10 |
| Edge Cases | 10 |
| Integração | 5 |

---

## 🎯 Prioridade de Testes

### 🔴 Críticos (Executar Primeiro)
- T-AUTH-04: Autenticação válida funciona
- T-UPL-01: Upload básico funciona
- T-LST-01: Listagem funciona
- T-DWN-01: Download funciona
- T-SEC-05 a T-SEC-08: Isolamento de dados

### 🟡 Importantes
- Todos os testes de validação (T-FOL-02 a T-FOL-08)
- Testes de filtros e busca
- Testes de versionamento
- Testes de relatórios

### 🟢 Opcionais
- Testes de performance
- Testes de edge cases
- Testes de concorrência

---

## 🚀 Como Executar

### 1. Usando Postman
```bash
# Importar collection
File > Import > docs/postman-collection-documents.json

# Configurar variáveis
base_url = http://localhost:3000
token = {seu-jwt-token}

# Executar collection
Collections > Documents > Run
```

### 2. Usando cURL (Linha de Comando)
```bash
# Ver arquivo: docs/DOCUMENTS_API_QUICK_REFERENCE.md
```

### 3. Scripts Automatizados
```javascript
// Criar script de teste usando Newman (CLI do Postman)
npm install -g newman
newman run docs/postman-collection-documents.json \
  --environment docs/postman-environment.json \
  --reporters cli,json
```

---

## 📝 Relatório de Testes

### Template
```markdown
## Relatório de Testes - [Data]

### Resumo
- Total de testes: X
- Passaram: Y
- Falharam: Z
- Taxa de sucesso: XX%

### Testes Críticos
- [✅/❌] T-AUTH-04: Autenticação
- [✅/❌] T-UPL-01: Upload básico
- [✅/❌] T-LST-01: Listagem
- [✅/❌] T-DWN-01: Download

### Bugs Encontrados
1. [Severidade] Descrição do bug
   - Teste: T-XXX-XX
   - Esperado: ...
   - Obtido: ...
   - Como reproduzir: ...

### Observações
- ...
```

---

**Checklist criado em:** 27/10/2024  
**Versão:** 1.0
