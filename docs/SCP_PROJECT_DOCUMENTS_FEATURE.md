# GET Project by ID - Agora Retorna Documentos

## Resumo da Mudança

O endpoint `GET /scp/projects/:id` foi atualizado para incluir automaticamente todos os documentos vinculados ao projeto na resposta.

## O Que Mudou

### Antes
```json
GET /scp/projects/{id}

Resposta:
{
  "id": "uuid",
  "name": "Projeto ABC",
  "code": "PROJ-001",
  "investments": [...],
  "distributions": [...],
  "distributionPolicies": [...],
  "totals": {...}
}
```

### Depois
```json
GET /scp/projects/{id}

Resposta:
{
  "id": "uuid",
  "name": "Projeto ABC",
  "code": "PROJ-001",
  "investments": [...],
  "distributions": [...],
  "distributionPolicies": [...],
  "documents": [        // ← NOVO!
    {
      "id": "uuid-doc",
      "name": "Contrato de Investimento",
      "fileName": "contrato.pdf",
      "fileSize": 524288,
      "mimeType": "application/pdf",
      "fileExtension": ".pdf",
      "reference": "SCP-PROJ-001",
      "documentType": "Contratos",
      "tags": ["SCP", "Projeto", "PROJ-001", "Contratos"],
      "folder": {
        "id": "uuid-folder",
        "name": "PROJ-001 - Projeto ABC"
      },
      "uploadedBy": {
        "id": "uuid-user",
        "name": "Admin User",
        "email": "admin@example.com"
      },
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ],
  "totals": {...}
}
```

## Implementação Técnica

### Arquivo Modificado
- **`/src/scp/services/projects.service.ts`** - Método `findOne()`

### Como Funciona

1. **Query de Documentos**: Após buscar o projeto, o serviço consulta o banco de dados por documentos que contenham o código do projeto nas tags:
   ```typescript
   const documents = await this.prisma.document.findMany({
     where: {
       companyId,
       tags: {
         has: project.code, // Ex: "SOLAR-001"
       },
     },
     orderBy: { createdAt: 'desc' },
     include: {
       folder: { select: { id: true, name: true } },
       uploadedBy: { select: { id: true, name: true, email: true } }
     }
   });
   ```

2. **Vinculação por Tags**: Os documentos são automaticamente vinculados ao projeto através das tags:
   - Quando um documento é enviado via `/scp/projects/documents/upload`
   - O serviço adiciona o código do projeto às tags: `["SCP", "Projeto", "SOLAR-001", "Contratos"]`
   - O campo `reference` também é preenchido com `"SCP-{código}"`

3. **Resposta Completa**: O método `findOne()` retorna:
   ```typescript
   return {
     ...project,
     documents,  // Array de documentos vinculados
     totals: {...}
   };
   ```

## Dados Retornados para Cada Documento

Cada objeto no array `documents` contém:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | string | UUID do documento |
| `name` | string | Nome/título do documento |
| `fileName` | string | Nome do arquivo original |
| `fileSize` | number | Tamanho em bytes |
| `mimeType` | string | Tipo MIME (ex: application/pdf) |
| `fileExtension` | string | Extensão do arquivo (.pdf, .jpg, etc) |
| `reference` | string | Referência: "SCP-{código}" |
| `documentType` | string | Categoria/tipo do documento |
| `tags` | string[] | Tags para organização e busca |
| `isPublic` | boolean | Se o documento é público |
| `createdAt` | DateTime | Data de criação/upload |
| `folder.id` | string | ID da pasta onde está armazenado |
| `folder.name` | string | Nome da pasta |
| `uploadedBy.id` | string | ID do usuário que fez upload |
| `uploadedBy.name` | string | Nome do usuário |
| `uploadedBy.email` | string | Email do usuário |

## Estrutura de Pastas

Os documentos são organizados automaticamente na seguinte estrutura:

```
SCP/
└── Projetos/
    └── {CODE} - {NAME}/          Ex: "SOLAR-001 - Empreendimento Solar ABC"
        ├── Contratos/
        ├── Relatórios Financeiros/
        ├── Estudos e Análises/
        ├── Documentos Legais/
        ├── Comprovantes de Pagamento/
        ├── Termos e Acordos/
        ├── Laudos e Certificações/
        ├── Fotos e Imagens/
        ├── Correspondências/
        └── Outros/
```

## Categorias de Documentos

Categorias disponíveis para upload:
- **Contratos**: Contratos de investimento, parcerias, etc.
- **Relatórios Financeiros**: Balanços, demonstrativos, etc.
- **Estudos e Análises**: Viabilidade, impacto, etc.
- **Documentos Legais**: Certidões, alvarás, registros, etc.
- **Comprovantes de Pagamento**: TED, PIX, boletos, etc.
- **Termos e Acordos**: Termos de adesão, acordos, etc.
- **Laudos e Certificações**: Técnicos, ambientais, etc.
- **Fotos e Imagens**: Imagens do projeto, obras, etc.
- **Correspondências**: E-mails, ofícios, notificações, etc.
- **Outros**: Documentos diversos

## Endpoints Relacionados

### 1. Buscar Projeto com Documentos (Atualizado)
```http
GET /scp/projects/{id}
Authorization: Bearer {token}
x-company-id: {companyId}
```

### 2. Upload de Documento
```http
POST /scp/projects/documents/upload
Authorization: Bearer {token}
x-company-id: {companyId}
Content-Type: multipart/form-data

{
  "projectId": "uuid",
  "category": "Contratos",
  "name": "Contrato de Investimento",
  "description": "Contrato padrão",
  "tags": "legal,contrato",
  "file": <binary>
}
```

### 3. Listar Documentos do Projeto (Específico)
```http
GET /scp/projects/{projectId}/documents?page=1&limit=20
Authorization: Bearer {token}
x-company-id: {companyId}
```

### 4. Download de Documento
```http
GET /scp/projects/documents/{documentId}/download
Authorization: Bearer {token}
x-company-id: {companyId}
```

### 5. Deletar Documento
```http
DELETE /scp/projects/documents/{documentId}
Authorization: Bearer {token}
x-company-id: {companyId}
```

## Benefícios

1. **Visão Completa**: Uma única chamada retorna todas as informações do projeto, incluindo documentos
2. **Menos Requests**: Frontend não precisa fazer chamadas separadas para buscar documentos
3. **Performance**: Query otimizada usando índice nas tags
4. **Organização**: Documentos automaticamente organizados por categoria
5. **Auditoria**: Rastreamento completo de quem fez upload e quando

## Exemplo de Uso

```typescript
// Frontend
const response = await fetch(`/scp/projects/${projectId}`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'x-company-id': companyId
  }
});

const project = await response.json();

// Agora você tem acesso direto aos documentos
console.log(`Projeto: ${project.name}`);
console.log(`Documentos: ${project.documents.length}`);

project.documents.forEach(doc => {
  console.log(`- ${doc.name} (${doc.documentType})`);
});
```

## Compatibilidade

✅ **Backward Compatible**: A mudança é 100% retrocompatível
- Projetos sem documentos retornam `documents: []`
- Não quebra integrações existentes
- Apenas adiciona dados extras à resposta

## Testes

Use o arquivo `scp-project-details-test.http` para testar:

1. Criar um projeto
2. Fazer upload de documentos
3. Buscar projeto por ID (verificar se documentos aparecem)
4. Download individual de documentos

## Documentação Atualizada

- ✅ `/docs/SCP_MODULE.md` - Exemplo de resposta atualizado
- ✅ `/scp-project-details-test.http` - Testes HTTP com exemplos
- ✅ Este documento de resumo

## Performance

**Considerações**:
- Query adicional para buscar documentos (otimizada com índice em tags)
- Impacto mínimo: documentos geralmente são poucos por projeto (< 50)
- Se necessário: implementar paginação ou lazy loading no futuro

**Alternativas Futuras** (se necessário):
```typescript
// Opção 1: Query parameter para incluir/excluir documentos
GET /scp/projects/{id}?includeDocuments=true

// Opção 2: Retornar apenas contagem
GET /scp/projects/{id}?documentsCount=true
// Response: { ...project, documentsCount: 12 }
```

## Conclusão

O endpoint `GET /scp/projects/:id` agora oferece uma visão completa do projeto, incluindo todos os documentos vinculados. Esta mudança melhora a experiência do usuário e reduz a quantidade de chamadas HTTP necessárias para exibir informações completas de um projeto.
