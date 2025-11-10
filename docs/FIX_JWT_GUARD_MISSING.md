# Fix: userId undefined - JwtAuthGuard Faltando

## Problema

Erro ao tentar listar ou fazer upload de documentos em aportes:

```
PrismaClientValidationError: 
Invalid `this.prisma.user.findUnique()` invocation
Argument `where` of type UserWhereUniqueInput needs at least one of `id` or `email` arguments.
where: {
  id: undefined,  // ❌ userId está undefined!
}
```

## Causa Raiz

O controller `InvestmentDocumentsController` **não tinha o guard de autenticação** `@UseGuards(JwtAuthGuard)`.

Sem o guard:
- ❌ `request.user` não é populado pelo JWT
- ❌ `@UserId()` decorator retorna `undefined`
- ❌ `@CompanyId()` também pode falhar

## Comparação

### ProjectDocumentsController (✅ Funcionando)
```typescript
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('scp/projects/documents')
@UseGuards(JwtAuthGuard)  // ✅ Guard presente
export class ProjectDocumentsController {
  // ...
}
```

### InvestmentDocumentsController (❌ Antes - Com Erro)
```typescript
@Controller('scp/investments/documents')
// ❌ Guard faltando!
export class InvestmentDocumentsController {
  // ...
}
```

### InvestmentDocumentsController (✅ Depois - Corrigido)
```typescript
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('scp/investments/documents')
@UseGuards(JwtAuthGuard)  // ✅ Guard adicionado
export class InvestmentDocumentsController {
  // ...
}
```

## Solução Implementada

### 1. Adicionado Import
```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
```

### 2. Adicionado Guard no Controller
```typescript
@Controller('scp/investments/documents')
@UseGuards(JwtAuthGuard)  // ← Adicionado
export class InvestmentDocumentsController {
  // ...
}
```

## Como o JWT Guard Funciona

### 1. Request chega no controller
```http
GET /scp/investments/documents/uuid-123
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
x-company-id: uuid-company
```

### 2. JwtAuthGuard intercepta
```typescript
@UseGuards(JwtAuthGuard)
// ↓ Guard valida token e popula request.user
```

### 3. Token JWT decodificado
```json
{
  "userId": "uuid-user-123",
  "email": "user@example.com",
  "name": "John Doe",
  "iat": 1699632000,
  "exp": 1699718400
}
```

### 4. request.user populado
```typescript
request.user = {
  userId: "uuid-user-123",
  email: "user@example.com",
  name: "John Doe"
}
```

### 5. Decorators funcionam
```typescript
@UserId() userId: string  
// ↓ Extrai request.user.userId
// ✅ userId = "uuid-user-123"

@CompanyId() companyId: string
// ↓ Extrai request.headers['x-company-id']
// ✅ companyId = "uuid-company"
```

## Endpoints Afetados (Agora Corrigidos)

Todos os endpoints do `InvestmentDocumentsController` agora exigem autenticação:

### 1. Upload de Documento
```http
POST /scp/investments/documents/upload
Authorization: Bearer {token}  ← Obrigatório
x-company-id: {companyId}
```

### 2. Listar Documentos
```http
GET /scp/investments/documents/:investmentId
Authorization: Bearer {token}  ← Obrigatório
x-company-id: {companyId}
```

### 3. Download de Documento
```http
GET /scp/investments/documents/:documentId/download
Authorization: Bearer {token}  ← Obrigatório
x-company-id: {companyId}
```

### 4. Deletar Documento
```http
DELETE /scp/investments/documents/:documentId
Authorization: Bearer {token}  ← Obrigatório
x-company-id: {companyId}
```

## Teste

### Antes (❌ Erro)
```bash
curl -X GET http://localhost:4000/scp/investments/documents/uuid-123 \
  -H "x-company-id: uuid-company"

# Resultado: Error 500 - userId is undefined
```

### Depois (✅ Funciona)
```bash
curl -X GET http://localhost:4000/scp/investments/documents/uuid-123 \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "x-company-id: uuid-company"

# Resultado: { "data": [...], "meta": {...} }
```

### Sem Token (🔒 Protegido)
```bash
curl -X GET http://localhost:4000/scp/investments/documents/uuid-123 \
  -H "x-company-id: uuid-company"

# Resultado: 401 Unauthorized
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

## Fluxo de Autenticação Completo

```
1. Cliente faz request
   ↓
2. NestJS recebe request
   ↓
3. @UseGuards(JwtAuthGuard) intercepta
   ↓
4. JwtAuthGuard valida token:
   - Token presente? ✅
   - Token válido? ✅
   - Token não expirado? ✅
   ↓
5. Token decodificado → request.user populado
   ↓
6. Controller method executado
   ↓
7. @UserId() extrai request.user.userId ✅
8. @CompanyId() extrai request.headers['x-company-id'] ✅
   ↓
9. Service executado com userId e companyId corretos
   ↓
10. Response retornado ao cliente
```

## Checklist de Segurança

Agora todos os endpoints estão protegidos:

- ✅ Autenticação JWT obrigatória
- ✅ Token deve ser válido
- ✅ Token não pode estar expirado
- ✅ userId extraído corretamente do token
- ✅ companyId validado no header
- ✅ Permissões verificadas (resource: 'scp')
- ✅ Isolamento por empresa garantido

## Lição Aprendida

**Sempre adicionar `@UseGuards(JwtAuthGuard)` em controllers que:**
1. Usam `@UserId()` decorator
2. Usam `@CompanyId()` decorator
3. Precisam de autenticação
4. Acessam recursos protegidos

## Padrão para Novos Controllers

```typescript
import { 
  Controller, 
  UseGuards,
  // ... outros imports
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CompanyId } from '../../common/decorators/company-id.decorator';
import { UserId } from '../../common/decorators/user-id.decorator';

@Controller('path')
@UseGuards(JwtAuthGuard)  // ← SEMPRE ADICIONAR
export class MyController {
  @Get()
  async list(
    @CompanyId() companyId: string,  // ✅ Funciona
    @UserId() userId: string,         // ✅ Funciona
  ) {
    // ...
  }
}
```

## Arquivos Modificados

- ✅ `/src/scp/controllers/investment-documents.controller.ts`
  - Adicionado `import { UseGuards } from '@nestjs/common'`
  - Adicionado `import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'`
  - Adicionado `@UseGuards(JwtAuthGuard)` no controller

## Impacto

- ✅ **Upload de documentos funcionando**
- ✅ **Listagem de documentos funcionando**
- ✅ **Download de documentos funcionando**
- ✅ **Exclusão de documentos funcionando**
- ✅ **Verificação de permissões funcionando**
- ✅ **Segurança garantida** (autenticação obrigatória)

## Conclusão

O problema foi **falta do guard de autenticação** no controller. Sem o `@UseGuards(JwtAuthGuard)`, o `request.user` não era populado, resultando em `userId` undefined.

A correção foi simples: **adicionar o guard no controller**, seguindo o padrão usado em outros controllers do módulo SCP.

---

**Status:** ✅ Corrigido e testado
**Prioridade:** Alta (impedia uso completo da funcionalidade)
**Tempo de correção:** ~2 minutos
