# 🎭 Gerenciamento de Roles (Papéis/Funções) - API Documentation

## 🎯 Visão Geral

Sistema completo de gerenciamento de **roles** (papéis/funções) com permissões granulares. Cada role pode ter múltiplas permissões atribuídas, e múltiplos usuários podem ter a mesma role em diferentes empresas.

**🔒 CONCEITOS:**
- ✅ Roles definem **conjuntos de permissões**
- ✅ Cada usuário tem uma **role por empresa**
- ✅ Permissões são **granulares e específicas** (users.create, users.read, etc.)
- ✅ Roles com usuários atribuídos **não podem ser deletadas**
- ✅ **Auditoria completa** de todas as operações

## 🔐 Autenticação e Permissões

**Headers Obrigatórios:**
```
Authorization: Bearer {token}
x-company-id: {company-uuid}
```

**Permissões Necessárias:**
- `users.read` - Visualizar roles e permissões
- `users.create` - Criar roles
- `users.update` - Atualizar roles e gerenciar permissões
- `users.delete` - Deletar roles

---

## 📡 Endpoints

### 1. Listar Todas as Roles

```
GET /roles
```

**Permissão:** `users.read`

**Resposta:**
```json
[
  {
    "id": "role-uuid",
    "name": "admin",
    "description": "Administrador com acesso total",
    "createdAt": "2025-10-27T10:00:00.000Z",
    "updatedAt": "2025-10-27T10:00:00.000Z",
    "usersCount": 5,
    "permissions": [
      {
        "id": "perm-uuid-1",
        "name": "users.create",
        "description": "Criar usuários",
        "resource": "users",
        "action": "create"
      },
      {
        "id": "perm-uuid-2",
        "name": "users.read",
        "description": "Visualizar usuários",
        "resource": "users",
        "action": "read"
      }
    ]
  }
]
```

---

### 2. Buscar Role por ID

```
GET /roles/:id
```

**Permissão:** `users.read`

**Resposta:**
```json
{
  "id": "role-uuid",
  "name": "manager",
  "description": "Gerente com permissões de gestão",
  "createdAt": "2025-10-27T10:00:00.000Z",
  "updatedAt": "2025-10-27T10:00:00.000Z",
  "usersCount": 3,
  "permissions": [
    {
      "id": "perm-uuid",
      "name": "users.read",
      "description": "Visualizar usuários",
      "resource": "users",
      "action": "read"
    }
  ]
}
```

---

### 3. Buscar Role por Nome

```
GET /roles/name/:name
```

**Permissão:** `users.read`

**Exemplo:**
```bash
GET /roles/name/admin
```

**Resposta:**
```json
{
  "id": "role-uuid",
  "name": "admin",
  "description": "Administrador com acesso total",
  "permissions": [...]
}
```

---

### 4. Listar Todas as Permissões Disponíveis

```
GET /roles/permissions/all
```

**Permissão:** `users.read`

**Resposta:**
```json
{
  "all": [
    {
      "id": "perm-uuid-1",
      "name": "users.create",
      "description": "Criar usuários",
      "resource": "users",
      "action": "create",
      "createdAt": "2025-10-27T10:00:00.000Z",
      "updatedAt": "2025-10-27T10:00:00.000Z"
    },
    {
      "id": "perm-uuid-2",
      "name": "users.read",
      "description": "Visualizar usuários",
      "resource": "users",
      "action": "read",
      "createdAt": "2025-10-27T10:00:00.000Z",
      "updatedAt": "2025-10-27T10:00:00.000Z"
    }
  ],
  "byResource": {
    "users": [
      {
        "id": "perm-uuid-1",
        "name": "users.create",
        "description": "Criar usuários",
        "resource": "users",
        "action": "create"
      },
      {
        "id": "perm-uuid-2",
        "name": "users.read",
        "description": "Visualizar usuários",
        "resource": "users",
        "action": "read"
      }
    ],
    "companies": [...]
  }
}
```

---

### 5. Criar Nova Role

```
POST /roles
```

**Permissão:** `users.create`

**Body:**
```json
{
  "name": "support",
  "description": "Suporte técnico com acesso limitado",
  "permissionIds": [
    "perm-uuid-1",
    "perm-uuid-2"
  ]
}
```

**Campos:**
- `name` (string, **OBRIGATÓRIO**) - Nome da role (2-50 caracteres, único)
- `description` (string, opcional) - Descrição da role (máximo 200 caracteres)
- `permissionIds` (array, opcional) - IDs das permissões iniciais

**Validações:**
- ✅ Nome deve ser único
- ✅ Nome entre 2 e 50 caracteres
- ✅ Permissões devem existir
- ✅ Registra auditoria

**Resposta:**
```json
{
  "id": "new-role-uuid",
  "name": "support",
  "description": "Suporte técnico com acesso limitado",
  "createdAt": "2025-10-27T10:30:00.000Z",
  "updatedAt": "2025-10-27T10:30:00.000Z",
  "permissions": [
    {
      "id": "perm-uuid-1",
      "name": "users.read",
      "description": "Visualizar usuários",
      "resource": "users",
      "action": "read"
    }
  ]
}
```

---

### 6. Atualizar Role

```
PATCH /roles/:id
```

**Permissão:** `users.update`

**Body:** (todos os campos opcionais)
```json
{
  "name": "super-support",
  "description": "Suporte avançado com mais permissões"
}
```

**Validações:**
- Se alterar nome, não pode duplicar nome existente
- Nome entre 2 e 50 caracteres
- Descrição máximo 200 caracteres

**Resposta:**
```json
{
  "id": "role-uuid",
  "name": "super-support",
  "description": "Suporte avançado com mais permissões",
  "createdAt": "2025-10-27T10:30:00.000Z",
  "updatedAt": "2025-10-27T11:00:00.000Z",
  "permissions": [...]
}
```

---

### 7. Deletar Role

```
DELETE /roles/:id
```

**Permissão:** `users.delete`

**⚠️ IMPORTANTE:**
- ❌ Não pode deletar se houver usuários com esta role
- ✅ Permissões são removidas automaticamente
- ✅ Registra auditoria

**Resposta:** `204 No Content`

**Erro se houver usuários:**
```json
{
  "statusCode": 400,
  "message": "Não é possível deletar esta role pois existem 5 usuários atribuídos a ela",
  "error": "Bad Request"
}
```

---

## 🔑 Gestão de Permissões

### 8. Adicionar Permissões a uma Role

```
POST /roles/:id/permissions
```

**Permissão:** `users.update`

**Body:**
```json
{
  "permissionIds": [
    "perm-uuid-3",
    "perm-uuid-4",
    "perm-uuid-5"
  ]
}
```

**Campos:**
- `permissionIds` (array, **OBRIGATÓRIO**) - IDs das permissões a adicionar (mínimo 1)

**Validações:**
- ✅ Role deve existir
- ✅ Permissões devem existir
- ✅ Ignora permissões já atribuídas
- ✅ Registra auditoria para cada permissão adicionada

**Resposta:**
```json
{
  "id": "role-uuid",
  "name": "support",
  "description": "Suporte técnico",
  "createdAt": "2025-10-27T10:30:00.000Z",
  "updatedAt": "2025-10-27T11:15:00.000Z",
  "usersCount": 2,
  "permissions": [
    {
      "id": "perm-uuid-1",
      "name": "users.read",
      "description": "Visualizar usuários",
      "resource": "users",
      "action": "read"
    },
    {
      "id": "perm-uuid-3",
      "name": "users.update",
      "description": "Atualizar usuários",
      "resource": "users",
      "action": "update"
    }
  ]
}
```

---

### 9. Remover Permissões de uma Role

```
DELETE /roles/:id/permissions
```

**Permissão:** `users.update`

**Body:**
```json
{
  "permissionIds": [
    "perm-uuid-3",
    "perm-uuid-4"
  ]
}
```

**Campos:**
- `permissionIds` (array, **OBRIGATÓRIO**) - IDs das permissões a remover (mínimo 1)

**Validações:**
- ✅ Role deve existir
- ✅ Apenas remove permissões que estão atribuídas
- ✅ Registra auditoria para cada permissão removida

**Resposta:**
```json
{
  "id": "role-uuid",
  "name": "support",
  "description": "Suporte técnico",
  "createdAt": "2025-10-27T10:30:00.000Z",
  "updatedAt": "2025-10-27T11:20:00.000Z",
  "usersCount": 2,
  "permissions": [
    {
      "id": "perm-uuid-1",
      "name": "users.read",
      "description": "Visualizar usuários",
      "resource": "users",
      "action": "read"
    }
  ]
}
```

---

## 💡 Casos de Uso

### 1. Criar Role Completa

```bash
# 1. Listar permissões disponíveis
curl http://localhost:4000/roles/permissions/all \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-company-id: $COMPANY_ID"

# 2. Criar role com permissões
curl -X POST http://localhost:4000/roles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-company-id: $COMPANY_ID" \
  -d '{
    "name": "sales",
    "description": "Vendedor com acesso a vendas e clientes",
    "permissionIds": [
      "perm-sales-read",
      "perm-sales-create",
      "perm-customers-read"
    ]
  }'
```

### 2. Atualizar Permissões de uma Role

```bash
# Adicionar novas permissões
curl -X POST http://localhost:4000/roles/role-uuid/permissions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-company-id: $COMPANY_ID" \
  -d '{
    "permissionIds": ["perm-reports-read", "perm-dashboard-read"]
  }'

# Remover permissões
curl -X DELETE http://localhost:4000/roles/role-uuid/permissions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-company-id: $COMPANY_ID" \
  -d '{
    "permissionIds": ["perm-sales-delete"]
  }'
```

### 3. Clonar Role

```bash
# 1. Buscar role existente
ORIGINAL=$(curl http://localhost:4000/roles/original-role-id \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-company-id: $COMPANY_ID")

# 2. Extrair IDs das permissões
PERMISSIONS=$(echo $ORIGINAL | jq '[.permissions[].id]')

# 3. Criar nova role com mesmas permissões
curl -X POST http://localhost:4000/roles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-company-id: $COMPANY_ID" \
  -d "{
    \"name\": \"new-role-name\",
    \"description\": \"Cópia da role original\",
    \"permissionIds\": $PERMISSIONS
  }"
```

---

## ⚠️ Erros Comuns

### 404 - Role não encontrada
```json
{
  "statusCode": 404,
  "message": "Role não encontrada",
  "error": "Not Found"
}
```

### 409 - Nome já existe
```json
{
  "statusCode": 409,
  "message": "Já existe uma role com este nome",
  "error": "Conflict"
}
```

### 400 - Role em uso
```json
{
  "statusCode": 400,
  "message": "Não é possível deletar esta role pois existem 5 usuários atribuídos a ela",
  "error": "Bad Request"
}
```

### 400 - Permissões já atribuídas
```json
{
  "statusCode": 400,
  "message": "Todas as permissões já estão atribuídas a esta role",
  "error": "Bad Request"
}
```

### 400 - Permissões não atribuídas
```json
{
  "statusCode": 400,
  "message": "Nenhuma das permissões fornecidas está atribuída a esta role",
  "error": "Bad Request"
}
```

### 400 - Permissão não encontrada
```json
{
  "statusCode": 400,
  "message": "Uma ou mais permissões não foram encontradas",
  "error": "Bad Request"
}
```

---

## 📊 Estrutura de Permissões

### Formato
```
{resource}.{action}
```

### Recursos Comuns
- `users` - Gerenciamento de usuários
- `companies` - Gerenciamento de empresas
- `roles` - Gerenciamento de roles
- `products` - Gerenciamento de produtos
- `sales` - Gerenciamento de vendas
- `reports` - Relatórios

### Ações Comuns
- `create` - Criar novos registros
- `read` - Visualizar registros
- `update` - Atualizar registros
- `delete` - Deletar registros

### Exemplos
```
users.create       → Criar usuários
users.read         → Visualizar usuários
users.update       → Atualizar usuários
users.delete       → Deletar usuários
companies.create   → Criar empresas
products.read      → Visualizar produtos
sales.create       → Criar vendas
reports.read       → Visualizar relatórios
```

---

## 🎯 Roles Padrão do Sistema

### 1. **admin** - Administrador
```json
{
  "name": "admin",
  "description": "Administrador com acesso total",
  "permissions": ["*"] // Todas as permissões
}
```

### 2. **manager** - Gerente
```json
{
  "name": "manager",
  "description": "Gerente com permissões de gestão",
  "permissions": [
    "users.read",
    "users.create",
    "users.update",
    "companies.read",
    "products.*",
    "sales.*",
    "reports.read"
  ]
}
```

### 3. **sales** - Vendedor
```json
{
  "name": "sales",
  "description": "Vendedor com acesso a vendas",
  "permissions": [
    "customers.read",
    "customers.create",
    "products.read",
    "sales.create",
    "sales.read",
    "sales.update"
  ]
}
```

### 4. **viewer** - Visualizador
```json
{
  "name": "viewer",
  "description": "Apenas visualização",
  "permissions": [
    "users.read",
    "companies.read",
    "products.read",
    "sales.read",
    "reports.read"
  ]
}
```

---

## 📋 Auditoria

Todas as operações são registradas no sistema de auditoria:

### Ações Rastreadas
- `ROLE_CREATE` - Criação de role
- `ROLE_UPDATE` - Atualização de role
- `ROLE_DELETE` - Exclusão de role
- `ROLE_ADD_PERMISSION` - Adicionar permissão
- `ROLE_REMOVE_PERMISSION` - Remover permissão

### Consultar Auditoria
```bash
# Auditoria de roles
curl http://localhost:4000/audit/roles?companyId=$COMPANY_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-company-id: $COMPANY_ID"

# Filtrar por ação específica
curl "http://localhost:4000/audit/roles?companyId=$COMPANY_ID&action=ROLE_CREATE" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-company-id: $COMPANY_ID"
```

---

## 🎨 Exemplo Frontend - React Component

```tsx
import { useState, useEffect } from 'react';

interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  usersCount: number;
  permissions: Permission[];
}

export function RoleManager() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRoles();
    loadPermissions();
  }, []);

  async function loadRoles() {
    const response = await fetch('/api/roles', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-company-id': companyId,
      },
    });
    const data = await response.json();
    setRoles(data);
  }

  async function loadPermissions() {
    const response = await fetch('/api/roles/permissions/all', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-company-id': companyId,
      },
    });
    const data = await response.json();
    setPermissions(data.all);
  }

  async function createRole(name: string, description: string, permissionIds: string[]) {
    await fetch('/api/roles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'x-company-id': companyId,
      },
      body: JSON.stringify({ name, description, permissionIds }),
    });
    
    await loadRoles();
  }

  async function addPermissions(roleId: string, permissionIds: string[]) {
    await fetch(`/api/roles/${roleId}/permissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'x-company-id': companyId,
      },
      body: JSON.stringify({ permissionIds }),
    });
    
    await loadRoles();
  }

  async function deleteRole(roleId: string) {
    await fetch(`/api/roles/${roleId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-company-id': companyId,
      },
    });
    
    await loadRoles();
  }

  return (
    <div className="role-manager">
      <h2>Gerenciamento de Roles</h2>
      
      <div className="roles-list">
        {roles.map(role => (
          <div key={role.id} className="role-card">
            <h3>{role.name}</h3>
            <p>{role.description}</p>
            <p className="users-count">{role.usersCount} usuários</p>
            
            <div className="permissions">
              {role.permissions.map(perm => (
                <span key={perm.id} className="permission-badge">
                  {perm.name}
                </span>
              ))}
            </div>
            
            <button onClick={() => deleteRole(role.id)}>
              Deletar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 📚 Referências

- [Sistema de Autenticação](./AUTH.md)
- [Gerenciamento de Usuários](./USERS_MANAGEMENT.md)
- [Sistema de Auditoria](./AUDIT_SYSTEM.md)
- [Permissões e Segurança](./AUTH_PERMISSIONS.md)

---

## 🎉 Resumo

**✅ Sistema Completo de Roles:**

- 9 endpoints implementados
- CRUD completo (Create, Read, Update, Delete)
- Gerenciamento de permissões
- Auditoria completa
- Validações robustas
- Documentação detalhada
- Exemplos práticos
- Pronto para uso em produção

**Status:** 🟢 **PRODUCTION READY**
