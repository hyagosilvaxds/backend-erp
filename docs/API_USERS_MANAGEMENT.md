# API de Gestão de Usuários - Documentação

## 📋 Visão Geral

Este documento descreve os endpoints para criar usuários e vinculá-los a empresas no sistema ERP.

---

## 🔐 Autenticação

Todos os endpoints requerem autenticação via **JWT Token** no header:

```http
Authorization: Bearer {seu_token_jwt}
```

### Headers Obrigatórios

| Header | Descrição | Exemplo |
|--------|-----------|---------|
| `Authorization` | Token JWT do usuário autenticado | `Bearer eyJhbGc...` |
| `x-company-id` | ID da empresa no contexto atual | `550e8400-e29b-41d4-a716-446655440000` |

### Permissões Necessárias

| Operação | Permissão | Descrição |
|----------|-----------|-----------|
| Criar usuário | `users.create` | Permite criar novos usuários |
| Vincular a empresa | `users.update` | Permite vincular usuários a empresas |
| Atualizar role | `users.update` | Permite alterar a role do usuário |

---

## 📚 Endpoints

### 1. Criar Usuário

Cria um novo usuário no sistema e o vincula automaticamente à empresa especificada no header `x-company-id`.

#### Endpoint
```
POST /users
```

#### Headers
```http
Authorization: Bearer {token}
x-company-id: 550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json
```

#### Payload

```json
{
  "email": "usuario@exemplo.com",
  "name": "João da Silva",
  "password": "senha123",
  "active": true
}
```

#### Campos

| Campo | Tipo | Obrigatório | Validação | Descrição |
|-------|------|-------------|-----------|-----------|
| `email` | String | ✅ Sim | Email válido | Email do usuário (único no sistema) |
| `name` | String | ✅ Sim | - | Nome completo do usuário |
| `password` | String | ✅ Sim | Mínimo 6 caracteres | Senha do usuário |
| `active` | Boolean | ❌ Não | - | Se o usuário está ativo (padrão: `true`) |

#### Resposta de Sucesso

**Status:** `201 Created`

```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "email": "usuario@exemplo.com",
  "name": "João da Silva",
  "active": true,
  "createdAt": "2025-11-16T10:00:00.000Z",
  "updatedAt": "2025-11-16T10:00:00.000Z",
  "companies": [
    {
      "companyId": "550e8400-e29b-41d4-a716-446655440000",
      "roleId": "role_001",
      "active": true,
      "createdAt": "2025-11-16T10:00:00.000Z",
      "role": {
        "id": "role_001",
        "name": "manager",
        "description": "Gerente"
      },
      "company": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "razaoSocial": "EMPRESA EXEMPLO LTDA",
        "nomeFantasia": "Empresa Exemplo"
      }
    }
  ]
}
```

#### Erros Possíveis

##### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": [
    "Email inválido",
    "Nome é obrigatório",
    "Senha deve ter no mínimo 6 caracteres"
  ],
  "error": "Bad Request"
}
```

##### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "Email já cadastrado no sistema",
  "error": "Conflict"
}
```

##### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Você não tem permissão para criar usuários",
  "error": "Forbidden"
}
```

---

### 2. Vincular Usuário a Empresa

Vincula um usuário existente a uma nova empresa com uma role específica.

#### Endpoint
```
POST /users/:userId/companies
```

#### Parâmetros de URL

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `userId` | UUID | ID do usuário a ser vinculado |

#### Headers
```http
Authorization: Bearer {token}
x-company-id: 550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json
```

#### Payload

```json
{
  "companyId": "7c5e250b-a93e-4298-b3ab-10e7c1522fc0",
  "roleId": "role_002",
  "active": true
}
```

#### Campos

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `companyId` | String (UUID) | ✅ Sim | ID da empresa à qual vincular o usuário |
| `roleId` | String (UUID) | ✅ Sim | ID da role que o usuário terá na empresa |
| `active` | Boolean | ❌ Não | Se o vínculo está ativo (padrão: `true`) |

#### Resposta de Sucesso

**Status:** `201 Created`

```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "email": "usuario@exemplo.com",
  "name": "João da Silva",
  "active": true,
  "companies": [
    {
      "companyId": "550e8400-e29b-41d4-a716-446655440000",
      "roleId": "role_001",
      "active": true,
      "role": {
        "id": "role_001",
        "name": "manager",
        "description": "Gerente"
      },
      "company": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "razaoSocial": "EMPRESA EXEMPLO LTDA",
        "nomeFantasia": "Empresa Exemplo"
      }
    },
    {
      "companyId": "7c5e250b-a93e-4298-b3ab-10e7c1522fc0",
      "roleId": "role_002",
      "active": true,
      "role": {
        "id": "role_002",
        "name": "sales",
        "description": "Vendedor"
      },
      "company": {
        "id": "7c5e250b-a93e-4298-b3ab-10e7c1522fc0",
        "razaoSocial": "OUTRA EMPRESA LTDA",
        "nomeFantasia": "Outra Empresa"
      }
    }
  ]
}
```

#### Erros Possíveis

##### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": [
    "Company ID é obrigatório",
    "Role ID é obrigatório"
  ],
  "error": "Bad Request"
}
```

##### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Usuário não encontrado",
  "error": "Not Found"
}
```

```json
{
  "statusCode": 404,
  "message": "Empresa não encontrada",
  "error": "Not Found"
}
```

```json
{
  "statusCode": 404,
  "message": "Role não encontrada",
  "error": "Not Found"
}
```

##### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "Usuário já está vinculado a esta empresa",
  "error": "Conflict"
}
```

---

### 3. Atualizar Role do Usuário em uma Empresa

Atualiza a role de um usuário em uma empresa específica.

#### Endpoint
```
PATCH /users/:userId/companies/:companyId/role
```

#### Parâmetros de URL

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `userId` | UUID | ID do usuário |
| `companyId` | UUID | ID da empresa |

#### Headers
```http
Authorization: Bearer {token}
x-company-id: 550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json
```

#### Payload

```json
{
  "roleId": "role_003"
}
```

#### Campos

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `roleId` | String (UUID) | ✅ Sim | ID da nova role |

#### Resposta de Sucesso

**Status:** `200 OK`

```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "email": "usuario@exemplo.com",
  "name": "João da Silva",
  "active": true,
  "companies": [
    {
      "companyId": "550e8400-e29b-41d4-a716-446655440000",
      "roleId": "role_003",
      "active": true,
      "role": {
        "id": "role_003",
        "name": "admin",
        "description": "Administrador"
      },
      "company": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "razaoSocial": "EMPRESA EXEMPLO LTDA",
        "nomeFantasia": "Empresa Exemplo"
      }
    }
  ]
}
```

#### Erros Possíveis

##### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Usuário não encontrado",
  "error": "Not Found"
}
```

```json
{
  "statusCode": 404,
  "message": "Vínculo usuário-empresa não encontrado",
  "error": "Not Found"
}
```

```json
{
  "statusCode": 404,
  "message": "Role não encontrada",
  "error": "Not Found"
}
```

---

## 📊 Exemplos de Uso

### Exemplo 1: Criar Usuário

```javascript
const createUser = async () => {
  const response = await fetch('https://api.erp.com/users', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token,
      'x-company-id': '550e8400-e29b-41d4-a716-446655440000',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'joao.silva@exemplo.com',
      name: 'João da Silva',
      password: 'senha@123',
      active: true,
    }),
  });

  const user = await response.json();
  console.log('Usuário criado:', user);
  return user;
};
```

### Exemplo 2: Vincular Usuário a Empresa

```javascript
const assignUserToCompany = async (userId, companyId, roleId) => {
  const response = await fetch(
    `https://api.erp.com/users/${userId}/companies`,
    {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'x-company-id': '550e8400-e29b-41d4-a716-446655440000',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        companyId: companyId,
        roleId: roleId,
        active: true,
      }),
    }
  );

  const user = await response.json();
  console.log('Usuário vinculado:', user);
  return user;
};
```

### Exemplo 3: Atualizar Role

```javascript
const updateUserRole = async (userId, companyId, newRoleId) => {
  const response = await fetch(
    `https://api.erp.com/users/${userId}/companies/${companyId}/role`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': 'Bearer ' + token,
        'x-company-id': '550e8400-e29b-41d4-a716-446655440000',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        roleId: newRoleId,
      }),
    }
  );

  const user = await response.json();
  console.log('Role atualizada:', user);
  return user;
};
```

---

## 🎯 Fluxo Completo: Criar e Configurar Usuário

### 1. Criar o Usuário
```bash
POST /users
```
```json
{
  "email": "maria@exemplo.com",
  "name": "Maria Santos",
  "password": "senha123"
}
```

### 2. Vincular a Segunda Empresa (opcional)
```bash
POST /users/{userId}/companies
```
```json
{
  "companyId": "7c5e250b-a93e-4298-b3ab-10e7c1522fc0",
  "roleId": "role_sales"
}
```

### 3. Atualizar Role na Primeira Empresa (opcional)
```bash
PATCH /users/{userId}/companies/{companyId}/role
```
```json
{
  "roleId": "role_admin"
}
```

---

## 🔑 Roles Disponíveis

| Nome | Código | Descrição | Permissões |
|------|--------|-----------|------------|
| Administrador | `admin` | Acesso total ao sistema | Todas |
| Gerente | `manager` | Gerenciamento operacional | Leitura e escrita na maioria dos módulos |
| Vendedor | `sales` | Foco em vendas e clientes | Vendas, clientes, produtos (leitura) |
| Visualizador | `viewer` | Apenas leitura | Acesso somente leitura |

> 💡 **Dica:** Use `GET /roles` para listar todas as roles disponíveis com seus IDs.

---

## ✅ Validações Importantes

### 1. Email
```typescript
// Deve ser um email válido
const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
```

**Erros comuns:**
- ❌ `usuario@exemplo` (sem domínio completo)
- ❌ `usuario.exemplo.com` (sem @)
- ✅ `usuario@exemplo.com`

### 2. Senha
```typescript
// Deve ter no mínimo 6 caracteres
const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};
```

**Recomendações:**
- ✅ Mínimo 8 caracteres
- ✅ Incluir letras maiúsculas e minúsculas
- ✅ Incluir números
- ✅ Incluir caracteres especiais

### 3. IDs (UUID)
```typescript
// Deve ser um UUID válido (formato: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
const validateUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};
```

---

## 🚨 Códigos de Erro HTTP

| Código | Significado | Quando Acontece |
|--------|-------------|-----------------|
| 200 | OK | Atualização bem-sucedida |
| 201 | Created | Recurso criado com sucesso |
| 400 | Bad Request | Validação falhou, dados inválidos |
| 401 | Unauthorized | Token inválido ou ausente |
| 403 | Forbidden | Sem permissão para acessar |
| 404 | Not Found | Recurso não encontrado |
| 409 | Conflict | Conflito (ex: email duplicado, usuário já vinculado) |
| 500 | Internal Server Error | Erro no servidor |

---

## ⚠️ Observações Importantes

### Sobre Criação de Usuários
- ✅ O usuário é automaticamente vinculado à empresa no header `x-company-id`
- ✅ O email deve ser único em todo o sistema
- ✅ A senha é criptografada antes de ser armazenada
- ✅ O campo `active` define se o usuário pode fazer login

### Sobre Vinculação a Empresas
- ✅ Um usuário pode estar vinculado a múltiplas empresas
- ✅ Cada vínculo tem sua própria role independente
- ✅ Um usuário não pode ser vinculado duas vezes à mesma empresa
- ✅ Admin pode vincular usuários a qualquer empresa

### Sobre Roles
- ✅ A role define as permissões do usuário na empresa
- ✅ Cada empresa pode ter roles customizadas
- ✅ Alterar a role afeta apenas o vínculo específico empresa-usuário
- ✅ O usuário pode ter roles diferentes em empresas diferentes

---

## 🔗 Links Relacionados

- **[API de Gestão de Empresas](./API_COMPANIES_ADMIN.md)** - Como criar e gerenciar empresas
- **[API de Roles e Permissões](./API_ROLES_PERMISSIONS.md)** - Gerenciamento de roles
- **[Autenticação](./AUTH_CHANGE_PASSWORD.md)** - Sistema de autenticação

---

## 📝 Checklist de Criação de Usuário

- [ ] Email válido e único
- [ ] Nome completo do usuário
- [ ] Senha segura (mínimo 6 caracteres)
- [ ] Header `x-company-id` especificado
- [ ] Permissão `users.create`
- [ ] Token JWT válido
- [ ] Empresa existe e está ativa
- [ ] Role definida para o vínculo

---

**🚀 API pronta para gerenciamento completo de usuários!**

> **Última atualização:** 16 de novembro de 2025  
> **Versão da API:** 1.0  
> **Base URL:** `https://api.erp.com`
