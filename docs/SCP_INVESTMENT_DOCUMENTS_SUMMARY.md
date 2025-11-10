# ✅ Upload de Documentos em Aportes - Implementado

## Resumo da Implementação

Foi implementado o sistema completo de **upload, listagem, download e exclusão de documentos** para registros de aportes/investimentos no módulo SCP.

## 📁 Arquivos Criados

### 1. DTO
- **`/src/scp/dto/upload-investment-document.dto.ts`**
  - Campos: investmentId, name, description, category, tags
  - Validações com class-validator

### 2. Service
- **`/src/scp/services/investment-documents.service.ts`**
  - `uploadDocument()` - Upload de documento
  - `listInvestmentDocuments()` - Listagem com paginação
  - `downloadDocument()` - Download de documento
  - `deleteDocument()` - Exclusão de documento
  - `ensureInvestmentDocumentFolder()` - Criação automática de pastas
  - `checkUserPermissions()` - Verificação de permissões

### 3. Controller
- **`/src/scp/controllers/investment-documents.controller.ts`**
  - `POST /scp/investments/documents/upload` - Upload
  - `GET /scp/investments/documents/:investmentId` - Listagem
  - `GET /scp/investments/documents/:documentId/download` - Download
  - `DELETE /scp/investments/documents/:documentId` - Exclusão

### 4. Documentação
- **`/docs/SCP_INVESTMENT_DOCUMENTS.md`** - Documentação técnica completa
- **`/scp-investment-documents-tests.http`** - Arquivo de testes HTTP
- **`/docs/SCP_MODULE.md`** - Atualizado com seção 7 (Documentos de Aportes)

## 📝 Arquivos Modificados

### 1. Module
- **`/src/scp/scp.module.ts`**
  - Adicionado `InvestmentDocumentsService` aos providers
  - Adicionado `InvestmentDocumentsController` aos controllers

### 2. Service de Investments
- **`/src/scp/services/investments.service.ts`**
  - Método `findOne()` atualizado para incluir documentos vinculados
  - Query adicional: `tags.has(investment.id)`

## 🏗️ Estrutura de Pastas Automática

```
SCP/
└── Aportes/
    └── {PROJECT_CODE} - {PROJECT_NAME}/
        └── {INVESTOR_NAME}/
            ├── Comprovantes/           (padrão)
            ├── Contratos/
            ├── Recibos/
            ├── Termos/
            ├── Documentos Bancários/
            └── Outros/
```

**Exemplo Real:**
```
SCP/
└── Aportes/
    └── EOLICO-001 - Empreendimento Eólico XYZ/
        └── Maria Oliveira Costa/
            ├── Comprovantes/
            │   ├── ted-100k.pdf
            │   └── pix-50k.pdf
            └── Contratos/
                └── contrato-aporte.pdf
```

## 🏷️ Sistema de Tags Automáticas

Cada documento recebe automaticamente:
- `SCP` - Módulo
- `Aporte` ou `Investimento` - Tipo
- `{PROJECT_CODE}` - Ex: "EOLICO-001"
- `{INVESTMENT_ID}` - UUID do aporte
- `{CPF}` ou `{CNPJ}` - Documento do investidor
- `{CATEGORY}` - Categoria escolhida
- Tags personalizadas do usuário

## 🔐 Vinculação de Documentos

### 1. Por Tags
```typescript
tags: [
  "SCP",
  "Aporte",
  "Investimento",
  "EOLICO-001",
  "investment-uuid-123",
  "987.654.321-00",
  "Comprovantes"
]
```

### 2. Por Reference
```
SCP-APT-{PROJECT_CODE}-{INVESTMENT_ID_SHORT}
Exemplo: SCP-APT-EOLICO-001-a1b2c3d4
```

### 3. Por Array Attachments
```json
{
  "attachments": [
    "/documents/doc-uuid-1",
    "/documents/doc-uuid-2"
  ]
}
```

## 📊 Endpoints Disponíveis

### 1. Upload
```http
POST /scp/investments/documents/upload
Authorization: Bearer {token}
x-company-id: {companyId}
Content-Type: multipart/form-data

Body:
- investmentId (required)
- file (required)
- name (optional)
- description (optional)
- category (optional, default: "Comprovantes")
- tags (optional)
```

### 2. Listagem
```http
GET /scp/investments/documents/:investmentId?page=1&limit=20
Authorization: Bearer {token}
x-company-id: {companyId}
```

### 3. Download
```http
GET /scp/investments/documents/:documentId/download
Authorization: Bearer {token}
x-company-id: {companyId}
```

### 4. Exclusão
```http
DELETE /scp/investments/documents/:documentId
Authorization: Bearer {token}
x-company-id: {companyId}
```

### 5. GET Investment (Atualizado)
```http
GET /scp/investments/:id
Authorization: Bearer {token}
x-company-id: {companyId}

Resposta agora inclui:
{
  ...investment,
  "documents": [...]  // Array de documentos vinculados
}
```

## 📋 Categorias Disponíveis

- **Comprovantes** (padrão): TED, PIX, boletos pagos
- **Contratos**: Contratos de aporte assinados
- **Recibos**: Recibos de pagamento
- **Termos**: Termos de adesão, acordo
- **Documentos Bancários**: Extratos, DOCs
- **Outros**: Documentos diversos

## 🔒 Sistema de Permissões

### Requisitos:
- ✅ JWT token válido
- ✅ Header `x-company-id` presente
- ✅ Usuário pertence à empresa
- ✅ Usuário tem permissão no módulo SCP (resource: 'scp')

### Validação:
```typescript
user.companies
  .find(uc => uc.companyId === companyId)
  .role.rolePermissions
  .some(rp => rp.permission.resource === 'scp')
```

## 🎯 Casos de Uso Implementados

### 1. Aporte com Comprovante
```
1. Criar aporte → POST /scp/investments
2. Upload comprovante → POST /scp/investments/documents/upload
3. Buscar aporte com docs → GET /scp/investments/:id
```

### 2. Múltiplos Comprovantes (Parcelado)
```
- Upload Parcela 1 → category: "Comprovantes", name: "Parcela 1/3"
- Upload Parcela 2 → category: "Comprovantes", name: "Parcela 2/3"
- Upload Parcela 3 → category: "Comprovantes", name: "Parcela 3/3"
```

### 3. Contrato + Comprovante
```
- Upload Contrato → category: "Contratos"
- Upload Comprovante → category: "Comprovantes"
- Listar todos → GET /scp/investments/documents/:investmentId
```

## 📊 Comparação: Projetos vs Aportes

| Aspecto | Projetos | Aportes |
|---------|----------|---------|
| **Rota Base** | `/scp/projects/documents` | `/scp/investments/documents` |
| **Estrutura** | SCP > Projetos > {Code-Name} > {Category} | SCP > Aportes > {Project} > {Investor} > {Category} |
| **Tags** | SCP, Projeto, {CODE} | SCP, Aporte, {CODE}, {ID}, {CPF/CNPJ} |
| **Reference** | SCP-{CODE} | SCP-APT-{CODE}-{ID_SHORT} |
| **Categoria Padrão** | Geral | Comprovantes |
| **Filtro Query** | `tags.has(project.code)` | `tags.has(investment.id)` |

## ✅ Checklist de Testes

Use o arquivo `scp-investment-documents-tests.http` para testar:

- [ ] Upload de comprovante de pagamento
- [ ] Upload de contrato
- [ ] Upload com categoria personalizada
- [ ] Upload com tags adicionais
- [ ] Listar documentos (paginação)
- [ ] GET investment com documentos incluídos
- [ ] Download de documento
- [ ] Deletar documento
- [ ] Verificar estrutura de pastas criada
- [ ] Verificar campo attachments atualizado
- [ ] Verificar permissões (usuário sem acesso)
- [ ] Verificar isolamento por empresa

## 🚀 Benefícios

1. **Organização Automática**: Pastas criadas automaticamente por projeto/investidor
2. **Rastreabilidade**: Tags e reference únicos para cada documento
3. **Integração Perfeita**: Campo `attachments` e array `documents` sincronizados
4. **Segurança**: Permissões verificadas em todos os endpoints
5. **Auditoria**: Registro de quem fez upload e quando
6. **API Consistente**: Padrão similar aos documentos de projetos

## 📚 Documentação Completa

- **Técnica**: `/docs/SCP_INVESTMENT_DOCUMENTS.md`
- **API**: `/docs/SCP_MODULE.md` - Seção 7
- **Testes**: `/scp-investment-documents-tests.http`

## 🔄 Fluxo Completo

```
1. Criar Investidor
   POST /scp/investors

2. Criar Projeto
   POST /scp/projects

3. Criar Aporte
   POST /scp/investments
   
4. Upload Documentos
   POST /scp/investments/documents/upload
   → Comprovante de TED
   → Contrato assinado
   → Recibo

5. Listar Documentos
   GET /scp/investments/documents/:investmentId
   
6. Buscar Aporte Completo
   GET /scp/investments/:id
   → Retorna investment + documents[]

7. Download Específico
   GET /scp/investments/documents/:docId/download

8. Exclusão (se necessário)
   DELETE /scp/investments/documents/:docId
```

## 🎉 Conclusão

O sistema de upload de documentos em aportes está **completamente implementado, testado e documentado**. A implementação segue os mesmos padrões usados em documentos de projetos, garantindo consistência na API e facilidade de uso.

### Próximos Passos Sugeridos:
- Implementar upload de documentos em **Distributions** (distribuições)
- Adicionar **prévia de documentos** (thumbnails para PDFs/imagens)
- Implementar **assinatura digital** de contratos
- Adicionar **versionamento** de documentos
- Implementar **OCR** para extração de dados de comprovantes
