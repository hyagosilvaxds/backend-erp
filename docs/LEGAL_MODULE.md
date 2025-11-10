# 📁 Módulo Jurídico - Documentação Completa

## 🎯 Visão Geral

O módulo jurídico permite o gerenciamento completo de documentos jurídicos (contratos e processos) integrado ao hub de documentos existente. Apenas usuários com permissões específicas do módulo jurídico podem acessar esses documentos.

**🔒 CARACTERÍSTICAS:**
- ✅ Controle de acesso exclusivo via permissões `legal.*`
- ✅ Integração total com o **Hub de Documentos**
- ✅ Upload de arquivos (PDF, Word, imagens, etc.)
- ✅ Categorização personalizável
- ✅ Gestão de contratos e processos
- ✅ Alertas de vencimento
- ✅ Auditoria completa
- ✅ Organização automática em pastas (Jurídico/Contratos, Jurídico/Processos)

---

## 🗂️ Estrutura de Dados

### LegalDocumentCategory (Categoria)

```typescript
{
  id: string              // UUID da categoria
  companyId: string       // Empresa proprietária
  name: string            // Nome da categoria
  description?: string    // Descrição
  color?: string          // Cor de identificação (hex code)
  icon?: string           // Ícone opcional
  active: boolean         // Status ativo/inativo
  createdAt: DateTime
  updatedAt: DateTime
}
```

### LegalDocument (Documento Jurídico)

```typescript
{
  id: string              // UUID do documento
  companyId: string       // Empresa proprietária
  categoryId?: string     // Categoria (opcional)
  documentId: string      // Referência ao documento no hub
  
  // Tipo e informações básicas
  type: string            // CONTRATO, PROCESSO_TRABALHISTA, PROCESSO_CIVIL, 
                          // PROCESSO_CRIMINAL, OUTROS
  title: string           // Título do documento
  description?: string    // Descrição
  reference?: string      // Número do processo/contrato
  
  // Partes envolvidas
  parties?: JSON          // Array: [{name, role, document, contact}]
  
  // Datas importantes
  startDate?: DateTime    // Data de início/assinatura
  endDate?: DateTime      // Data de término/conclusão
  dueDate?: DateTime      // Data de vencimento/renovação
  
  // Status e valores
  status: string          // ATIVO, CONCLUIDO, SUSPENSO, CANCELADO, ARQUIVADO
  value?: Decimal         // Valor do contrato/causa
  currency: string        // Moeda (default: BRL)
  
  // Observações
  notes?: string          // Notas/observações
  tags: string[]          // Tags para organização
  alertDays: number       // Dias para alertas de vencimento (default: 30)
  
  // Auditoria
  createdById: string
  active: boolean
  createdAt: DateTime
  updatedAt: DateTime
}
```

---

## 🔐 Permissões

O módulo jurídico possui 4 permissões específicas:

| Permissão | Descrição |
|-----------|-----------|
| `legal.create` | Criar documentos e categorias jurídicas |
| `legal.read` | Visualizar documentos e categorias jurídicas |
| `legal.update` | Atualizar documentos e categorias jurídicas |
| `legal.delete` | Excluir documentos e categorias jurídicas |

**⚠️ IMPORTANTE:** Apenas usuários com essas permissões podem acessar o módulo jurídico, mesmo que tenham acesso ao hub de documentos geral.

---

## 📡 Endpoints da API

### 🗂️ Categorias

#### 1. Criar Categoria

```
POST /legal/categories
```

**Permissão:** `legal.create`

**Body:**
```json
{
  "name": "Contratos Trabalhistas",
  "description": "Contratos de trabalho e prestação de serviços",
  "color": "#3B82F6",
  "icon": "briefcase",
  "active": true
}
```

**Resposta:**
```json
{
  "id": "cat-uuid",
  "companyId": "company-uuid",
  "name": "Contratos Trabalhistas",
  "description": "Contratos de trabalho e prestação de serviços",
  "color": "#3B82F6",
  "icon": "briefcase",
  "active": true,
  "createdAt": "2025-11-10T01:00:00.000Z",
  "updatedAt": "2025-11-10T01:00:00.000Z"
}
```

---

#### 2. Listar Categorias

```
GET /legal/categories
```

**Permissão:** `legal.read`

**Resposta:**
```json
[
  {
    "id": "cat-uuid",
    "name": "Contratos Trabalhistas",
    "description": "Contratos de trabalho e prestação de serviços",
    "color": "#3B82F6",
    "icon": "briefcase",
    "active": true,
    "_count": {
      "legalDocuments": 15
    },
    "createdAt": "2025-11-10T01:00:00.000Z",
    "updatedAt": "2025-11-10T01:00:00.000Z"
  }
]
```

---

#### 3. Buscar Categoria por ID

```
GET /legal/categories/:id
```

**Permissão:** `legal.read`

---

#### 4. Atualizar Categoria

```
PATCH /legal/categories/:id
```

**Permissão:** `legal.update`

**Body:**
```json
{
  "name": "Contratos Trabalhistas Atualizado",
  "color": "#10B981"
}
```

---

#### 5. Excluir Categoria

```
DELETE /legal/categories/:id
```

**Permissão:** `legal.delete`

**⚠️ Nota:** Não é possível excluir categorias com documentos vinculados.

---

### 📄 Documentos Jurídicos

#### 6. Criar Documento Jurídico (com Upload)

```
POST /legal/documents
```

**Permissão:** `legal.create`

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file` (file, **OBRIGATÓRIO**) - Arquivo do documento
- `type` (string, **OBRIGATÓRIO**) - Tipo do documento
  - `CONTRATO`
  - `PROCESSO_TRABALHISTA`
  - `PROCESSO_CIVIL`
  - `PROCESSO_CRIMINAL`
  - `OUTROS`
- `title` (string, **OBRIGATÓRIO**) - Título do documento
- `categoryId` (string, opcional) - ID da categoria
- `description` (string, opcional) - Descrição
- `reference` (string, opcional) - Número do processo/contrato
- `parties` (JSON, opcional) - Partes envolvidas
- `startDate` (datetime, opcional) - Data de início
- `endDate` (datetime, opcional) - Data de término
- `dueDate` (datetime, opcional) - Data de vencimento
- `status` (string, opcional) - Status (default: ATIVO)
- `value` (number, opcional) - Valor
- `currency` (string, opcional) - Moeda (default: BRL)
- `notes` (string, opcional) - Observações
- `tags` (array, opcional) - Tags
- `alertDays` (number, opcional) - Dias para alerta (default: 30)
- `documentName` (string, opcional) - Nome do arquivo no hub
- `documentDescription` (string, opcional) - Descrição no hub

**Exemplo com cURL:**
```bash
curl -X POST http://localhost:4000/legal/documents \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-company-id: $COMPANY_ID" \
  -F "file=@contrato.pdf" \
  -F "type=CONTRATO" \
  -F "title=Contrato de Prestação de Serviços - Fornecedor ABC" \
  -F "reference=CONT-2025-001" \
  -F "startDate=2025-11-10T00:00:00Z" \
  -F "dueDate=2026-11-10T00:00:00Z" \
  -F "value=50000" \
  -F "tags=fornecedor,servicos" \
  -F 'parties=[{"name":"Fornecedor ABC Ltda","role":"Contratado","document":"12.345.678/0001-90"}]'
```

**Resposta:**
```json
{
  "id": "legal-doc-uuid",
  "companyId": "company-uuid",
  "categoryId": null,
  "documentId": "doc-uuid",
  "type": "CONTRATO",
  "title": "Contrato de Prestação de Serviços - Fornecedor ABC",
  "description": null,
  "reference": "CONT-2025-001",
  "parties": [
    {
      "name": "Fornecedor ABC Ltda",
      "role": "Contratado",
      "document": "12.345.678/0001-90"
    }
  ],
  "startDate": "2025-11-10T00:00:00.000Z",
  "endDate": null,
  "dueDate": "2026-11-10T00:00:00.000Z",
  "status": "ATIVO",
  "value": "50000.00",
  "currency": "BRL",
  "notes": null,
  "tags": ["fornecedor", "servicos"],
  "alertDays": 30,
  "active": true,
  "createdAt": "2025-11-10T01:30:00.000Z",
  "updatedAt": "2025-11-10T01:30:00.000Z",
  "document": {
    "id": "doc-uuid",
    "name": "Contrato de Prestação de Serviços - Fornecedor ABC",
    "fileName": "contrato.pdf",
    "filePath": "/uploads/documents/company-uuid/2025/11/doc-uuid.pdf",
    "fileSize": 245678,
    "mimeType": "application/pdf",
    "fileExtension": ".pdf"
  },
  "category": null,
  "createdBy": {
    "id": "user-uuid",
    "name": "João Silva",
    "email": "joao@empresa.com"
  }
}
```

---

#### 7. Listar Documentos Jurídicos

```
GET /legal/documents
```

**Permissão:** `legal.read`

**Query Parameters:**
- `categoryId` (string, opcional) - Filtrar por categoria
- `type` (string, opcional) - Filtrar por tipo
- `status` (string, opcional) - Filtrar por status
- `search` (string, opcional) - Busca em título, descrição e referência
- `reference` (string, opcional) - Filtrar por referência
- `startDateFrom` (datetime, opcional) - Data inicial mínima
- `startDateTo` (datetime, opcional) - Data inicial máxima
- `dueDateFrom` (datetime, opcional) - Data de vencimento mínima
- `dueDateTo` (datetime, opcional) - Data de vencimento máxima
- `tags` (array, opcional) - Filtrar por tags
- `page` (number, opcional) - Página (default: 1)
- `limit` (number, opcional) - Itens por página (default: 20)
- `sortBy` (string, opcional) - Campo de ordenação (default: createdAt)
- `sortOrder` (string, opcional) - Ordem: asc ou desc (default: desc)

**Exemplo:**
```
GET /legal/documents?type=CONTRATO&status=ATIVO&page=1&limit=10
```

**Resposta:**
```json
{
  "documents": [
    {
      "id": "legal-doc-uuid",
      "title": "Contrato de Prestação de Serviços - Fornecedor ABC",
      "type": "CONTRATO",
      "reference": "CONT-2025-001",
      "status": "ATIVO",
      "dueDate": "2026-11-10T00:00:00.000Z",
      "value": "50000.00",
      "document": { ... },
      "category": null,
      "createdBy": { ... }
    }
  ],
  "pagination": {
    "total": 15,
    "page": 1,
    "limit": 10,
    "totalPages": 2
  }
}
```

---

#### 8. Estatísticas

```
GET /legal/documents/statistics
```

**Permissão:** `legal.read`

**Resposta:**
```json
{
  "total": 45,
  "byType": [
    { "type": "CONTRATO", "_count": 30 },
    { "type": "PROCESSO_TRABALHISTA", "_count": 10 },
    { "type": "PROCESSO_CIVIL", "_count": 5 }
  ],
  "byStatus": [
    { "status": "ATIVO", "_count": 35 },
    { "status": "CONCLUIDO", "_count": 8 },
    { "status": "ARQUIVADO", "_count": 2 }
  ],
  "expiringSoon": [
    {
      "id": "legal-doc-uuid",
      "title": "Contrato XYZ",
      "reference": "CONT-2025-042",
      "dueDate": "2025-12-15T00:00:00.000Z",
      "type": "CONTRATO"
    }
  ]
}
```

---

#### 9. Buscar Documento por ID

```
GET /legal/documents/:id
```

**Permissão:** `legal.read`

---

#### 10. Download do Documento

```
GET /legal/documents/:id/download
```

**Permissão:** `legal.read`

**Resposta:** Retorna os dados do documento no hub para fazer o download.

```json
{
  "id": "doc-uuid",
  "name": "Contrato de Prestação de Serviços",
  "fileName": "contrato.pdf",
  "filePath": "/uploads/documents/company-uuid/2025/11/doc-uuid.pdf",
  "fileSize": 245678,
  "mimeType": "application/pdf"
}
```

**Para fazer o download real do arquivo, use o endpoint do hub de documentos:**
```
GET /documents/:documentId/download
```

---

#### 11. Atualizar Documento

```
PATCH /legal/documents/:id
```

**Permissão:** `legal.update`

**Body:**
```json
{
  "status": "CONCLUIDO",
  "endDate": "2025-11-10T00:00:00Z",
  "notes": "Contrato concluído com sucesso"
}
```

**⚠️ Nota:** Não é possível atualizar o arquivo. Para isso, use o sistema de versionamento do hub de documentos.

---

#### 12. Excluir Documento

```
DELETE /legal/documents/:id
```

**Permissão:** `legal.delete`

**⚠️ Nota:** Realiza soft delete (marca como inativo). O documento continua no hub de documentos.

---

## 🔄 Fluxo de Trabalho Completo

### 1. Configurar Categorias

```bash
# Criar categoria de contratos
POST /legal/categories
{
  "name": "Contratos Comerciais",
  "description": "Contratos com fornecedores e clientes",
  "color": "#3B82F6",
  "icon": "file-contract"
}

# Criar categoria de processos
POST /legal/categories
{
  "name": "Processos Trabalhistas",
  "description": "Ações trabalhistas movidas ou recebidas",
  "color": "#EF4444",
  "icon": "gavel"
}
```

---

### 2. Cadastrar Contrato

```bash
POST /legal/documents
FormData:
  - file: contrato-fornecedor-xyz.pdf
  - type: CONTRATO
  - title: Contrato de Fornecimento - XYZ Ltda
  - categoryId: cat-contratos-uuid
  - reference: CONT-2025-042
  - startDate: 2025-11-10
  - dueDate: 2026-11-10
  - value: 120000
  - parties: [{"name":"XYZ Ltda","role":"Fornecedor","document":"12.345.678/0001-90"}]
  - tags: fornecimento,materia-prima
  - alertDays: 60
```

---

### 3. Cadastrar Processo

```bash
POST /legal/documents
FormData:
  - file: processo-123456.pdf
  - type: PROCESSO_TRABALHISTA
  - title: Ação Trabalhista - Colaborador João
  - categoryId: cat-processos-uuid
  - reference: 0001234-56.2025.5.01.0001
  - startDate: 2025-01-15
  - value: 50000
  - parties: [{"name":"João Silva","role":"Autor"},{"name":"Empresa ABC","role":"Réu"}]
  - status: ATIVO
  - notes: Audiência agendada para 15/12/2025
```

---

### 4. Consultar Documentos Vencendo

```bash
# Buscar documentos com vencimento nos próximos 30 dias
GET /legal/documents/statistics
```

---

### 5. Atualizar Status do Contrato

```bash
PATCH /legal/documents/{id}
{
  "status": "CONCLUIDO",
  "endDate": "2025-11-09T00:00:00Z",
  "notes": "Contrato rescindido amigavelmente"
}
```

---

## 📁 Organização Automática de Pastas

O sistema cria automaticamente a seguinte estrutura no hub de documentos:

```
Jurídico/
├── Contratos/
│   ├── 2025/
│   │   ├── Contrato 1.pdf
│   │   └── Contrato 2.pdf
│   └── 2024/
└── Processos/
    ├── 2025/
    │   ├── Processo 1.pdf
    │   └── Processo 2.pdf
    └── 2024/
```

**Regras:**
- Documentos do tipo `CONTRATO` vão para `Jurídico/Contratos/{ANO}`
- Documentos do tipo `PROCESSO_*` vão para `Jurídico/Processos/{ANO}`
- Pastas são criadas automaticamente se não existirem

---

## 🎨 Exemplo de Integração Frontend

### Upload de Contrato

```typescript
async function uploadLegalDocument(file: File, data: any) {
  const formData = new FormData();
  formData.append('file', file);
  
  // Dados do documento jurídico
  Object.keys(data).forEach(key => {
    if (data[key] !== null && data[key] !== undefined) {
      if (key === 'parties' || key === 'tags') {
        formData.append(key, JSON.stringify(data[key]));
      } else {
        formData.append(key, data[key]);
      }
    }
  });

  const response = await fetch('/api/legal/documents', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-company-id': companyId,
    },
    body: formData,
  });

  return await response.json();
}

// Uso
await uploadLegalDocument(selectedFile, {
  type: 'CONTRATO',
  title: 'Contrato de Prestação de Serviços',
  categoryId: selectedCategoryId,
  reference: 'CONT-2025-042',
  startDate: '2025-11-10T00:00:00Z',
  dueDate: '2026-11-10T00:00:00Z',
  value: 50000,
  currency: 'BRL',
  parties: [
    { name: 'Fornecedor ABC', role: 'Contratado', document: '12.345.678/0001-90' }
  ],
  tags: ['fornecedor', 'servicos'],
  alertDays: 30
});
```

---

### Listar Documentos com Filtros

```typescript
async function fetchLegalDocuments(filters: any) {
  const params = new URLSearchParams();
  
  Object.keys(filters).forEach(key => {
    if (filters[key]) {
      params.append(key, filters[key]);
    }
  });

  const response = await fetch(`/api/legal/documents?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-company-id': companyId,
    },
  });

  return await response.json();
}

// Uso
const result = await fetchLegalDocuments({
  type: 'CONTRATO',
  status: 'ATIVO',
  search: 'fornecedor',
  page: 1,
  limit: 20
});
```

---

### Componente React de Listagem

```tsx
import { useState, useEffect } from 'react';

export function LegalDocumentsList() {
  const [documents, setDocuments] = useState([]);
  const [filters, setFilters] = useState({ page: 1, limit: 20 });
  
  useEffect(() => {
    loadDocuments();
  }, [filters]);
  
  async function loadDocuments() {
    const result = await fetchLegalDocuments(filters);
    setDocuments(result.documents);
  }
  
  return (
    <div className="legal-documents">
      <div className="filters">
        <select onChange={(e) => setFilters({...filters, type: e.target.value})}>
          <option value="">Todos os tipos</option>
          <option value="CONTRATO">Contratos</option>
          <option value="PROCESSO_TRABALHISTA">Processos Trabalhistas</option>
          <option value="PROCESSO_CIVIL">Processos Cíveis</option>
        </select>
        
        <select onChange={(e) => setFilters({...filters, status: e.target.value})}>
          <option value="">Todos os status</option>
          <option value="ATIVO">Ativo</option>
          <option value="CONCLUIDO">Concluído</option>
          <option value="SUSPENSO">Suspenso</option>
        </select>
        
        <input
          type="text"
          placeholder="Buscar..."
          onChange={(e) => setFilters({...filters, search: e.target.value})}
        />
      </div>
      
      <div className="documents-list">
        {documents.map(doc => (
          <div key={doc.id} className="document-card">
            <h3>{doc.title}</h3>
            <p>Tipo: {doc.type}</p>
            <p>Status: {doc.status}</p>
            {doc.reference && <p>Ref: {doc.reference}</p>}
            {doc.dueDate && (
              <p>Vencimento: {new Date(doc.dueDate).toLocaleDateString()}</p>
            )}
            {doc.value && <p>Valor: R$ {parseFloat(doc.value).toLocaleString()}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 🎯 Boas Práticas

### ✅ DO's

1. **Use categorias para organização**
   - Crie categorias por tipo de documento ou departamento
   - Use cores diferentes para identificação visual rápida

2. **Preencha todos os metadados**
   - Sempre informe referência (número do processo/contrato)
   - Adicione partes envolvidas
   - Configure alertas de vencimento apropriados

3. **Use tags para facilitar buscas**
   - Adicione tags relevantes: fornecedor, cliente, tipo de serviço, etc.
   - Use tags consistentes em toda a empresa

4. **Configure alertas de vencimento**
   - Contratos: 60 dias antes do vencimento
   - Processos urgentes: 15 dias
   - Processos normais: 30 dias

5. **Mantenha status atualizado**
   - Atualize status conforme andamento
   - Registre datas de término/conclusão
   - Use campo `notes` para acompanhamento

---

### ❌ DON'Ts

1. **Não cadastre sem referência**
   - Sempre informe número do processo ou contrato

2. **Não ignore datas de vencimento**
   - Configure alertas apropriados
   - Revise documentos próximos ao vencimento

3. **Não deixe documentos sem categoria**
   - Sempre vincule a uma categoria
   - Crie novas categorias se necessário

4. **Não compartilhe com usuários sem permissão**
   - Módulo jurídico é restrito
   - Apenas usuários com permissões `legal.*` devem acessar

---

## 🔒 Segurança e Privacidade

### Controle de Acesso

- ✅ Todos os endpoints requerem autenticação JWT
- ✅ Permissões específicas do módulo jurídico (`legal.*`)
- ✅ Documentos isolados por empresa (multi-tenant)
- ✅ Não é possível acessar documentos de outras empresas
- ✅ Documentos não são públicos por padrão no hub

### Auditoria

Todas as ações são registradas:
- Criação de documentos e categorias
- Atualizações de status
- Exclusões (soft delete)
- Usuário responsável
- Data e hora da ação

---

## 📊 Relatórios e Estatísticas

### Endpoint de Estatísticas

```
GET /legal/documents/statistics
```

Retorna:
- Total de documentos
- Distribuição por tipo (CONTRATO, PROCESSO, etc.)
- Distribuição por status (ATIVO, CONCLUÍDO, etc.)
- Documentos vencendo nos próximos 30 dias

---

## 🚀 Status do Módulo

**Status:** 🟢 **PRODUCTION READY**

**Recursos implementados:**
- ✅ CRUD completo de categorias
- ✅ CRUD completo de documentos jurídicos
- ✅ Upload integrado ao hub de documentos
- ✅ Sistema de permissões
- ✅ Organização automática em pastas
- ✅ Filtros e busca avançada
- ✅ Estatísticas e relatórios
- ✅ Alertas de vencimento
- ✅ Auditoria completa
- ✅ Multi-tenant (isolamento por empresa)

---

## 📝 Notas Finais

- O módulo jurídico é totalmente integrado ao hub de documentos
- Todos os arquivos são armazenados no mesmo sistema de storage
- Não há necessidade de configuração adicional de storage
- As pastas são criadas automaticamente conforme necessário
- Os documentos jurídicos herdam todas as funcionalidades do hub (versionamento, download, etc.)

**Para mais informações sobre o hub de documentos, consulte:**
- `docs/DOCUMENTS_HUB.md` - Documentação completa do hub
- `docs/DOCUMENTS_QUICKSTART.md` - Guia rápido de uso
