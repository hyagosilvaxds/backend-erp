# Upload de Documentos em Aportes (Investments)

## Visão Geral

O módulo SCP agora permite fazer **upload de documentos** diretamente em registros de aportes/investimentos. Os documentos são organizados automaticamente em uma estrutura hierárquica de pastas e vinculados ao aporte através de tags.

## Estrutura de Pastas Automática

```
SCP/
└── Aportes/
    └── {PROJECT_CODE} - {PROJECT_NAME}/
        └── {INVESTOR_NAME}/
            ├── Comprovantes/           (padrão)
            ├── Contratos/
            ├── Recibos/
            └── Outros/
```

### Exemplo Real:
```
SCP/
└── Aportes/
    └── SOLAR-001 - Empreendimento Solar ABC/
        └── João Silva Santos/
            ├── Comprovantes/
            │   ├── comprovante-ted-50000.pdf
            │   └── comprovante-pix-25000.pdf
            ├── Contratos/
            │   └── contrato-aporte-001.pdf
            └── Recibos/
                └── recibo-assinado.pdf
```

## Endpoints

### Base URL
```
http://localhost:4000/scp/investments/documents
```

### 1. Upload de Documento

**Endpoint:** `POST /scp/investments/documents/upload`

**Headers:**
```http
Authorization: Bearer {token}
x-company-id: {companyId}
Content-Type: multipart/form-data
```

**Body (multipart/form-data):**
```
investmentId: string (required) - ID do aporte
name: string (optional) - Nome/título do documento
description: string (optional) - Descrição do documento
category: string (optional) - Categoria/tipo do documento
tags: string (optional) - Tags adicionais (separadas por vírgula)
file: binary (required) - Arquivo a ser enviado
```

**Categorias Disponíveis:**
- `Comprovantes` (padrão)
- `Contratos`
- `Recibos`
- `Termos`
- `Documentos Bancários`
- `Outros`

**Resposta de Sucesso (201):**
```json
{
  "id": "uuid-doc",
  "companyId": "uuid-company",
  "folderId": "uuid-folder",
  "name": "Comprovante de TED",
  "description": "Transferência de R$ 50.000,00",
  "fileName": "ted-50k.pdf",
  "filePath": "/uploads/documents/{companyId}/1699632000-abc123.pdf",
  "fileSize": 245760,
  "mimeType": "application/pdf",
  "fileExtension": ".pdf",
  "reference": "SCP-APT-SOLAR-001-a1b2c3d4",
  "documentType": "Comprovantes",
  "tags": [
    "SCP",
    "Aporte",
    "Investimento",
    "SOLAR-001",
    "uuid-investment",
    "123.456.789-00",
    "Comprovantes"
  ],
  "isPublic": false,
  "version": 1,
  "isLatest": true,
  "createdAt": "2024-11-10T15:30:00.000Z",
  "folder": {
    "id": "uuid-folder",
    "name": "João Silva Santos"
  },
  "uploadedBy": {
    "id": "uuid-user",
    "name": "Admin User",
    "email": "admin@example.com"
  },
  "investmentId": "uuid-investment",
  "projectCode": "SOLAR-001",
  "projectName": "Empreendimento Solar ABC",
  "investorName": "João Silva Santos",
  "amount": 50000,
  "investmentDate": "2024-11-01T00:00:00.000Z"
}
```

### 2. Listar Documentos de um Aporte

**Endpoint:** `GET /scp/investments/documents/:investmentId`

**Headers:**
```http
Authorization: Bearer {token}
x-company-id: {companyId}
```

**Query Parameters:**
- `page` (optional, default: 1) - Página atual
- `limit` (optional, default: 20) - Itens por página

**Resposta:**
```json
{
  "data": [
    {
      "id": "uuid-doc-1",
      "name": "Comprovante de TED",
      "fileName": "ted-50k.pdf",
      "fileSize": 245760,
      "mimeType": "application/pdf",
      "fileExtension": ".pdf",
      "reference": "SCP-APT-SOLAR-001-a1b2c3d4",
      "documentType": "Comprovantes",
      "tags": ["SCP", "Aporte", "SOLAR-001"],
      "createdAt": "2024-11-10T15:30:00.000Z",
      "folder": {
        "id": "uuid-folder",
        "name": "Comprovantes"
      },
      "uploadedBy": {
        "id": "uuid-user",
        "name": "Admin User",
        "email": "admin@example.com"
      }
    }
  ],
  "meta": {
    "total": 3,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

### 3. Download de Documento

**Endpoint:** `GET /scp/investments/documents/:documentId/download`

**Headers:**
```http
Authorization: Bearer {token}
x-company-id: {companyId}
```

**Resposta:**
- Arquivo binário com headers apropriados
- `Content-Type`: Tipo MIME do arquivo
- `Content-Disposition`: `attachment; filename="{original-filename}"`

### 4. Deletar Documento

**Endpoint:** `DELETE /scp/investments/documents/:documentId`

**Headers:**
```http
Authorization: Bearer {token}
x-company-id: {companyId}
```

**Resposta:**
- Status: `204 No Content`
- Remove arquivo físico do disco
- Remove registro do banco de dados
- Remove URL do array `attachments` do aporte

### 5. GET Investment por ID (Atualizado)

**Endpoint:** `GET /scp/investments/:id`

**Agora inclui documentos na resposta:**

```json
{
  "id": "uuid-investment",
  "companyId": "uuid-company",
  "projectId": "uuid-project",
  "investorId": "uuid-investor",
  "amount": 50000,
  "investmentDate": "2024-11-01T00:00:00.000Z",
  "referenceNumber": "APT-001",
  "documentNumber": "DOC-12345",
  "paymentMethod": "TED",
  "status": "CONFIRMADO",
  "notes": "Primeiro aporte do investidor",
  "attachments": [
    "/documents/uuid-doc-1",
    "/documents/uuid-doc-2"
  ],
  "createdAt": "2024-11-01T10:00:00.000Z",
  "updatedAt": "2024-11-01T10:00:00.000Z",
  "project": { ... },
  "investor": { ... },
  "bankAccount": { ... },
  "financialTransaction": { ... },
  "documents": [
    {
      "id": "uuid-doc-1",
      "name": "Comprovante de TED",
      "fileName": "ted-50k.pdf",
      "fileSize": 245760,
      "mimeType": "application/pdf",
      "fileExtension": ".pdf",
      "reference": "SCP-APT-SOLAR-001-a1b2c3d4",
      "documentType": "Comprovantes",
      "tags": ["SCP", "Aporte", "SOLAR-001", "uuid-investment"],
      "createdAt": "2024-11-01T10:05:00.000Z",
      "folder": {
        "id": "uuid-folder",
        "name": "Comprovantes"
      },
      "uploadedBy": {
        "id": "uuid-user",
        "name": "Admin User",
        "email": "admin@example.com"
      }
    }
  ]
}
```

## Vinculação de Documentos

Os documentos são vinculados ao aporte através de:

### 1. Tags Automáticas
Cada documento recebe automaticamente as seguintes tags:
- `SCP` - Módulo
- `Aporte` ou `Investimento` - Tipo
- `{PROJECT_CODE}` - Código do projeto (ex: "SOLAR-001")
- `{INVESTMENT_ID}` - UUID do aporte
- `{CPF}` ou `{CNPJ}` - Documento do investidor
- `{CATEGORY}` - Categoria escolhida

### 2. Campo Reference
Formato: `SCP-APT-{PROJECT_CODE}-{INVESTMENT_ID_SHORT}`

Exemplo: `SCP-APT-SOLAR-001-a1b2c3d4`

### 3. Array Attachments
O campo `attachments` do Investment é atualizado automaticamente:
```json
{
  "attachments": [
    "/documents/uuid-doc-1",
    "/documents/uuid-doc-2",
    "/documents/uuid-doc-3"
  ]
}
```

## Sistema de Permissões

### Requisitos:
- ✅ Usuário autenticado (JWT token)
- ✅ Header `x-company-id` presente
- ✅ Usuário pertence à empresa (companyId)
- ✅ Usuário tem permissão no módulo SCP (resource: 'scp')

### Validação:
```typescript
// Verifica se usuário tem role com permissão 'scp'
user.companies
  .find(uc => uc.companyId === companyId)
  .role.rolePermissions
  .some(rp => rp.permission.resource === 'scp')
```

## Casos de Uso

### 1. Aporte com Comprovante de Pagamento

**Cenário:** Investidor faz aporte de R$ 50.000 via TED

**Fluxo:**
1. Criar aporte:
   ```http
   POST /scp/investments
   {
     "projectId": "uuid",
     "investorId": "uuid",
     "amount": 50000,
     "investmentDate": "2024-11-01",
     "paymentMethod": "TED",
     "referenceNumber": "TED-123456"
   }
   ```

2. Upload comprovante:
   ```http
   POST /scp/investments/documents/upload
   {
     "investmentId": "uuid",
     "category": "Comprovantes",
     "name": "Comprovante TED R$ 50.000",
     "description": "Transferência bancária confirmada",
     "file": <ted-comprovante.pdf>
   }
   ```

3. Buscar aporte com documentos:
   ```http
   GET /scp/investments/{id}
   ```

### 2. Upload de Contrato de Aporte

**Cenário:** Anexar contrato assinado ao aporte

```http
POST /scp/investments/documents/upload
{
  "investmentId": "uuid",
  "category": "Contratos",
  "name": "Contrato de Aporte Assinado",
  "description": "Contrato entre empresa e investidor",
  "tags": "assinado,juridico",
  "file": <contrato-assinado.pdf>
}
```

### 3. Múltiplos Comprovantes

**Cenário:** Aporte parcelado com múltiplos comprovantes

```http
# Primeira parcela
POST /scp/investments/documents/upload
{
  "investmentId": "uuid",
  "name": "Parcela 1/3 - R$ 30.000",
  "category": "Comprovantes",
  "file": <parcela-1.pdf>
}

# Segunda parcela
POST /scp/investments/documents/upload
{
  "investmentId": "uuid",
  "name": "Parcela 2/3 - R$ 30.000",
  "category": "Comprovantes",
  "file": <parcela-2.pdf>
}

# Terceira parcela
POST /scp/investments/documents/upload
{
  "investmentId": "uuid",
  "name": "Parcela 3/3 - R$ 40.000",
  "category": "Comprovantes",
  "file": <parcela-3.pdf>
}
```

## Implementação Técnica

### Arquivos Criados

1. **`/src/scp/dto/upload-investment-document.dto.ts`**
   - DTO para upload de documentos em aportes
   - Campos: investmentId, name, description, category, tags

2. **`/src/scp/services/investment-documents.service.ts`**
   - Serviço para gerenciar documentos de aportes
   - Métodos: uploadDocument, listInvestmentDocuments, downloadDocument, deleteDocument
   - Integração com DocumentsService

3. **`/src/scp/controllers/investment-documents.controller.ts`**
   - Controller com endpoints REST
   - Rotas: POST upload, GET list, GET download, DELETE

### Arquivos Modificados

1. **`/src/scp/scp.module.ts`**
   - Adicionado InvestmentDocumentsService aos providers
   - Adicionado InvestmentDocumentsController aos controllers

2. **`/src/scp/services/investments.service.ts`**
   - Método `findOne()` atualizado para incluir documentos
   - Query adicional para buscar documentos por tags

### Schema Prisma

O modelo `Investment` já possui o campo `attachments`:
```prisma
model Investment {
  // ... outros campos
  attachments       String[] // Comprovantes
  // ...
}
```

## Diferenças vs. Documentos de Projetos

| Aspecto | Projetos | Aportes |
|---------|----------|---------|
| **Estrutura de Pastas** | SCP > Projetos > {Code-Name} > {Category} | SCP > Aportes > {Project} > {Investor} > {Category} |
| **Tags Padrão** | SCP, Projeto, {CODE} | SCP, Aporte, {CODE}, {INVESTMENT_ID} |
| **Reference** | SCP-{CODE} | SCP-APT-{CODE}-{ID_SHORT} |
| **Categoria Padrão** | Geral | Comprovantes |
| **Filtro na Query** | tags.has(project.code) | tags.has(investment.id) |

## Exemplos de Código

### Frontend - Upload de Documento

```typescript
async function uploadInvestmentDocument(
  investmentId: string,
  file: File,
  name: string,
  category: string
) {
  const formData = new FormData();
  formData.append('investmentId', investmentId);
  formData.append('name', name);
  formData.append('category', category);
  formData.append('file', file);

  const response = await fetch('/scp/investments/documents/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-company-id': companyId,
    },
    body: formData,
  });

  return response.json();
}
```

### Frontend - Listar Documentos

```typescript
async function getInvestmentDocuments(investmentId: string) {
  const response = await fetch(
    `/scp/investments/documents/${investmentId}?page=1&limit=20`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-company-id': companyId,
      },
    }
  );

  const data = await response.json();
  return data;
}
```

### Frontend - Download de Documento

```typescript
async function downloadDocument(documentId: string, fileName: string) {
  const response = await fetch(
    `/scp/investments/documents/${documentId}/download`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-company-id': companyId,
      },
    }
  );

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
}
```

## Testes

### Checklist de Testes

- [ ] Upload de comprovante de pagamento
- [ ] Upload de contrato
- [ ] Upload com categoria personalizada
- [ ] Upload com tags adicionais
- [ ] Listar documentos de um aporte
- [ ] Listar com paginação (page, limit)
- [ ] Download de documento
- [ ] Deletar documento
- [ ] GET investment por ID (verificar array documents)
- [ ] Verificar estrutura de pastas criada corretamente
- [ ] Verificar campo attachments atualizado no Investment
- [ ] Verificar permissões (usuário sem acesso SCP)
- [ ] Verificar isolamento por empresa (companyId)

### Arquivo de Testes HTTP

Use o arquivo `scp-investment-documents-tests.http` para testar todos os endpoints.

## Troubleshooting

### Erro: "Aporte não encontrado"
- Verifique se o `investmentId` está correto
- Verifique se o aporte pertence à empresa (x-company-id)

### Erro: "Usuário não tem permissão para acessar o módulo SCP"
- Verificar se usuário tem role com permissão 'scp'
- Verificar se userCompany está ativo

### Erro: "Argument `filePath` is missing"
- Este erro foi corrigido no DocumentsService
- Arquivos agora são salvos manualmente no disco

### Documento não aparece na listagem
- Verificar se tags incluem o ID do aporte
- Verificar se documento pertence à mesma empresa

## Performance

### Considerações:
- Query adicional para buscar documentos em `findOne()`
- Impacto mínimo: aportes geralmente têm poucos documentos (< 10)
- Índice em `Document.tags` otimiza a busca

### Otimizações Futuras:
- Implementar cache de documentos
- Lazy loading (query parameter)
- Compressão de imagens/PDFs
- CDN para download de arquivos

## Segurança

### Validações Implementadas:
- ✅ Autenticação JWT obrigatória
- ✅ Verificação de companyId (isolamento)
- ✅ Verificação de permissões (resource: 'scp')
- ✅ Validação de tipos de arquivo (mime type)
- ✅ Validação de tamanho máximo
- ✅ Paths seguros (sem directory traversal)
- ✅ Nomes de arquivo únicos (timestamp + random)

### Recomendações:
- Implementar antivírus scan em uploads
- Limitar tamanho máximo de arquivo (configurável)
- Limitar tipos de arquivo permitidos (whitelist)
- Rate limiting em endpoints de upload
- Audit log de downloads (implementado via AuditService)

## Conclusão

O sistema de upload de documentos em aportes está completamente implementado e integrado ao módulo SCP. A estrutura é similar aos documentos de projetos, mas adaptada para a hierarquia específica de aportes (Projeto > Investidor > Categoria).

### Benefícios:
- ✅ Organização automática de documentos
- ✅ Rastreabilidade completa (auditoria)
- ✅ Integração perfeita com sistema existente
- ✅ API RESTful consistente
- ✅ Permissões e segurança adequadas
- ✅ Documentação completa

### Próximos Passos:
- Implementar upload de documentos em Distributions
- Implementar versionamento de documentos
- Adicionar prévia de documentos (thumbnails)
- Implementar assinatura digital de contratos
