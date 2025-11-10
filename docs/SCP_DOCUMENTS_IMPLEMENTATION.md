# Documentos de Projetos SCP - Resumo de Implementação

## 📋 Visão Geral

Sistema completo de gerenciamento de documentos para projetos SCP, integrado ao hub de documentos da empresa com controle de permissões e organização automática em pastas.

## ✅ Implementado

### 1. **DTO (Data Transfer Object)**
**Arquivo:** `/src/scp/dto/upload-project-document.dto.ts`

- Enum `ProjectDocumentCategory` com 10 categorias de documentos
- Validações com class-validator:
  - `projectId`: UUID obrigatório
  - `name`: String obrigatória, máximo 255 caracteres
  - `description`: String opcional, máximo 1000 caracteres
  - `category`: Enum opcional, padrão OUTRO
  - `tags`: String opcional, separadas por vírgula

**Categorias:**
- CONTRATO
- ESTATUTO
- ATA
- RELATORIO
- COMPROVANTE
- LICENCA
- ALVARA
- PROJETO_TECNICO
- PLANILHA
- OUTRO

### 2. **Service**
**Arquivo:** `/src/scp/services/project-documents.service.ts`

**Métodos Implementados:**

#### `ensureProjectDocumentFolder()`
- Cria estrutura hierárquica de pastas: `SCP > Projetos > [Código - Nome] > [Categoria]`
- Usa `DocumentsService.findOrCreateFolder()` para garantir que pastas existam
- Retorna ID da pasta da categoria para upload

#### `uploadDocument()`
- Valida se projeto existe e pertence à empresa
- Verifica permissões do usuário
- Cria estrutura de pastas automaticamente
- Faz upload via `DocumentsService.uploadDocument()`
- Adiciona tags automáticas: SCP, Projeto, código do projeto, categoria
- Define referência única: `SCP-[CÓDIGO_PROJETO]`
- Adiciona URL do documento em `project.attachments[]`

#### `listProjectDocuments()`
- Lista documentos por projeto com paginação
- Filtra por tags contendo o código do projeto
- Inclui dados de pasta e uploader
- Retorna metadata com total, página, limite e total de páginas

#### `downloadDocument()`
- Busca documento e valida se pertence ao módulo SCP (via tags)
- Verifica permissões do usuário
- Retorna informações do arquivo (path, nome, mimeType)

#### `deleteDocument()`
- Remove documento do hub via `DocumentsService.deleteDocument()`
- Remove URL da lista `project.attachments[]`
- Valida permissões e módulo SCP

#### `checkUserPermissions()` (privado)
- Verifica se usuário é Admin/Administrador (acesso total)
- Ou se tem permissões para recursos: `investidores`, `scp`, `projetos_scp`, `documents`
- Usa estrutura correta: `role.rolePermissions.permission.resource`

### 3. **Controller**
**Arquivo:** `/src/scp/controllers/project-documents.controller.ts`

**Endpoints:**

#### `POST /scp/projects/documents/upload`
- Upload multipart/form-data com `FileInterceptor`
- Valida DTO e arquivo
- Retorna documento criado com todas as informações

#### `GET /scp/projects/documents/project/:projectId`
- Lista documentos do projeto
- Query params: `page` (padrão 1), `limit` (padrão 10)
- Retorna array de documentos + metadata de paginação

#### `GET /scp/projects/documents/:documentId/download`
- Download como stream
- Headers de resposta configurados: Content-Type, Content-Disposition
- Usa `createReadStream` para enviar arquivo

#### `DELETE /scp/projects/documents/:documentId`
- Remove documento do sistema
- Retorna mensagem de sucesso

### 4. **Module**
**Arquivo:** `/src/scp/scp.module.ts`

- Importa `DocumentsModule` para acesso ao `DocumentsService`
- Registra `ProjectDocumentsService` nos providers
- Registra `ProjectDocumentsController` nos controllers

## 📁 Estrutura de Pastas

```
Document Hub
└── SCP
    └── Projetos
        ├── SOLAR-001 - Usina Solar ABC
        │   ├── CONTRATO
        │   │   └── contrato-investimento.pdf
        │   ├── ESTATUTO
        │   │   └── estatuto-social.pdf
        │   ├── RELATORIO
        │   │   └── relatorio-jan-2024.xlsx
        │   └── COMPROVANTE
        │       └── ted-pagamento.pdf
        └── SOLAR-002 - Fazenda Solar XYZ
            └── ...
```

## 🔐 Controle de Permissões

**Usuários com acesso:**
1. **Admin** ou **Administrador**: Acesso total
2. Usuários com permissões para recursos:
   - `investidores`
   - `scp`
   - `projetos_scp`
   - `documents`

**Validação:**
- Verifica `UserCompany` do usuário
- Busca `role` com `rolePermissions` e `permission`
- Verifica se `permission.resource` está na lista permitida

## 🏷️ Sistema de Tags

**Tags Automáticas:**
- `SCP` - Identifica módulo
- `Projeto` - Identifica contexto
- `[CÓDIGO_PROJETO]` - Ex: SOLAR-001
- `[CATEGORIA]` - Ex: CONTRATO

**Tags Customizadas:**
- Definidas pelo usuário no upload
- Separadas por vírgula
- Armazenadas como array no banco

## 🔗 Integração com Projeto

**Campo `attachments` no ScpProject:**
```typescript
attachments: string[] // URLs dos documentos: ["/documents/uuid1", "/documents/uuid2"]
```

**Fluxo:**
1. Upload adiciona URL em `project.attachments`
2. Delete remove URL de `project.attachments`
3. Lista usa tags para buscar documentos relacionados

## 📚 Documentação

### 1. **Documentação Completa**
**Arquivo:** `/docs/SCP_MODULE.md` (Seção 6)

Inclui:
- Descrição de cada endpoint
- Headers e autenticação
- Parâmetros e body
- Exemplos de requisição (cURL, JavaScript/Axios)
- Respostas de sucesso e erro
- Estrutura de pastas
- Integração com projeto

### 2. **Arquivo de Testes HTTP**
**Arquivo:** `/scp-documents-tests.http`

Inclui:
- Variáveis configuráveis
- 5 exemplos de upload (contrato, estatuto, relatório, comprovante, projeto técnico)
- Testes de listagem com paginação
- Teste de download
- Teste de exclusão
- Testes de erro (400, 404, 403)
- Testes sem autenticação (401)
- Notas de uso e configuração

## 🧪 Testando a Implementação

### 1. Obter Token
```http
POST /auth/login
{
  "email": "usuario@empresa.com",
  "password": "senha123"
}
```

### 2. Criar/Obter Projeto
```http
POST /scp/projects
{
  "code": "SOLAR-001",
  "name": "Usina Solar ABC",
  "description": "Projeto de usina solar fotovoltaica",
  "startDate": "2024-01-01",
  "status": "EM_ANDAMENTO"
}
```

### 3. Upload de Documento
```bash
curl -X POST http://localhost:3000/scp/projects/documents/upload \
  -H "Authorization: Bearer SEU_TOKEN" \
  -F "file=@/path/to/contrato.pdf" \
  -F "projectId=UUID_DO_PROJETO" \
  -F "name=Contrato de Investimento" \
  -F "category=CONTRATO"
```

### 4. Listar Documentos
```http
GET /scp/projects/documents/project/{projectId}?page=1&limit=10
Authorization: Bearer SEU_TOKEN
```

### 5. Download
```http
GET /scp/projects/documents/{documentId}/download
Authorization: Bearer SEU_TOKEN
```

### 6. Excluir
```http
DELETE /scp/projects/documents/{documentId}
Authorization: Bearer SEU_TOKEN
```

## 🔧 Tecnologias Utilizadas

- **NestJS**: Framework principal
- **Multer**: Upload de arquivos
- **Prisma**: ORM para banco de dados
- **class-validator**: Validação de DTOs
- **class-transformer**: Transformação de dados
- **Express**: Servidor HTTP (Response stream)
- **Node fs**: Sistema de arquivos (createReadStream)

## ✨ Destaques da Implementação

1. **Organização Automática**: Pastas criadas automaticamente conforme hierarquia
2. **Integração Completa**: Usa DocumentsService existente, sem duplicar código
3. **Segurança**: Controle de permissões em todas as operações
4. **Isolamento**: Dados filtrados automaticamente por empresa (companyId no token)
5. **Rastreabilidade**: Tags automáticas facilitam busca e organização
6. **Referência Única**: `SCP-[CÓDIGO]` evita duplicação
7. **Download Eficiente**: Usa streams para arquivos grandes
8. **Documentação Rica**: Exemplos práticos para todas as operações

## 📊 Campos do Documento

```typescript
{
  id: string;                    // UUID do documento
  name: string;                  // Nome do documento
  description: string | null;    // Descrição opcional
  fileName: string;              // Nome do arquivo físico (timestamp + nome)
  filePath: string;              // Caminho no servidor
  fileSize: number;              // Tamanho em bytes
  mimeType: string;              // Tipo MIME (application/pdf, etc)
  folderId: string;              // ID da pasta (categoria)
  tags: string[];                // Array de tags
  reference: string;             // Referência única (SCP-CODIGO)
  documentType: string;          // Tipo/categoria do documento
  companyId: string;             // ID da empresa (isolamento)
  uploadedById: string;          // ID do usuário que fez upload
  createdAt: Date;               // Data de criação
  updatedAt: Date;               // Data de atualização
}
```

## 🚀 Próximos Passos Sugeridos

1. **Validação de Tipos de Arquivo**: Limitar extensões permitidas por categoria
2. **Limite de Tamanho**: Configurar tamanho máximo por tipo de arquivo
3. **Versionamento**: Implementar histórico de versões de documentos
4. **Assinatura Digital**: Integração com certificados A1/A3
5. **Preview**: Geração de thumbnails para PDFs e imagens
6. **Busca Avançada**: Filtros por categoria, período, tags
7. **Auditoria**: Log de quem acessou/baixou cada documento
8. **Notificações**: Alertar investidores sobre novos documentos

## 📝 Convenções do Código

- **Nomenclatura**: camelCase para variáveis/métodos, PascalCase para classes
- **Validações**: Sempre no DTO com class-validator
- **Erros**: Exceções do NestJS (NotFoundException, ForbiddenException, etc)
- **Async/Await**: Todas operações assíncronas com async/await
- **Tipagem**: TypeScript strict, sem `any` (exceto `req` do Express)
- **Imports**: Organizados (NestJS → third-party → local)
- **Comentários**: JSDoc para métodos públicos

## 🎯 Checklist de Qualidade

- [x] TypeScript sem erros de compilação
- [x] Validações de entrada (DTO)
- [x] Controle de permissões
- [x] Isolamento por empresa
- [x] Tratamento de erros
- [x] Documentação completa
- [x] Exemplos de uso
- [x] Testes HTTP preparados
- [x] Integração com sistema existente
- [x] Código limpo e organizado

## 💡 Dicas de Uso

1. **Upload via cURL**: Use `-F` para multipart/form-data
2. **Upload via JavaScript**: Use FormData para construir requisição
3. **Download**: Configure responseType como 'blob' no Axios
4. **Paginação**: Ajuste `limit` conforme necessidade (padrão 10)
5. **Tags**: Use vírgulas para separar, sem espaços extras
6. **Categorias**: Sempre use valores do enum (maiúsculas)
7. **Permissões**: Configure roles antes de testar
8. **Token**: Renove periodicamente conforme expiração JWT

---

**Implementação concluída com sucesso!** 🎉

Todos os endpoints estão funcionais, documentados e prontos para uso no client.
