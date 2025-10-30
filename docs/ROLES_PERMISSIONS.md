# 🎭 Gerenciamento de Roles e Permissões - API Documentation

## 🎯 Visão Geral

Sistema completo de **controle de acesso baseado em roles (RBAC)** que gerencia permissões de usuários através de papéis/funções predefinidas.

**🔒 CONCEITOS PRINCIPAIS:**
- ✅ **Role (Papel/Função)** - Conjunto de permissões (ex: admin, manager, sales)
- ✅ **Permission (Permissão)** - Ação específica em um recurso (ex: users.create)
- ✅ **Resource (Recurso)** - Entidade do sistema (ex: users, companies, products)
- ✅ **Action (Ação)** - Operação permitida (ex: create, read, update, delete)
- ✅ **Multi-Empresa** - Usuário pode ter roles diferentes em empresas diferentes

## 🔐 Autenticação e Permissões

**Headers Obrigatórios:**
```
Authorization: Bearer {token}
```

**Permissões Necessárias:**
- `users.read` - Visualizar roles e permissões

**Nota:** Role `admin` tem todas as permissões automaticamente.

---

## 📊 Estrutura de Dados

### Role (Papel/Função)

```typescript
interface Role {
  id: string;
  name: string;              // Nome único (ex: "admin", "manager")
  description: string;       // Descrição da role
  usersCount: number;        // Quantidade de usuários com esta role
  permissions: Permission[]; // Lista de permissões
  createdAt: Date;
  updatedAt: Date;
}
```

### Permission (Permissão)

```typescript
interface Permission {
  id: string;
  name: string;        // Nome único (ex: "users.create")
  description: string; // Descrição legível
  resource: string;    // Recurso (ex: "users", "companies")
  action: string;      // Ação (ex: "create", "read", "update", "delete")
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 📡 Endpoints

### 1. Listar Todas as Roles

```
GET /roles
```

**Permissão:** `users.read`

**✅ USO:** Listar todas as roles disponíveis no sistema com suas permissões e contagem de usuários.

**Resposta:**
```json
[
  {
    "id": "role-uuid-1",
    "name": "admin",
    "description": "Administrador com acesso total ao sistema",
    "usersCount": 5,
    "createdAt": "2025-01-15T10:00:00.000Z",
    "updatedAt": "2025-01-15T10:00:00.000Z",
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
      },
      {
        "id": "perm-uuid-3",
        "name": "users.update",
        "description": "Atualizar usuários",
        "resource": "users",
        "action": "update"
      },
      {
        "id": "perm-uuid-4",
        "name": "users.delete",
        "description": "Deletar usuários",
        "resource": "users",
        "action": "delete"
      }
      // ... mais permissões
    ]
  },
  {
    "id": "role-uuid-2",
    "name": "manager",
    "description": "Gerente com permissões de gestão",
    "usersCount": 12,
    "createdAt": "2025-01-15T10:00:00.000Z",
    "updatedAt": "2025-01-15T10:00:00.000Z",
    "permissions": [
      {
        "id": "perm-uuid-2",
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
      // ... mais permissões (sem users.delete)
    ]
  },
  {
    "id": "role-uuid-3",
    "name": "sales",
    "description": "Vendedor com acesso operacional",
    "usersCount": 25,
    "createdAt": "2025-01-15T10:00:00.000Z",
    "updatedAt": "2025-01-15T10:00:00.000Z",
    "permissions": [
      {
        "id": "perm-uuid-20",
        "name": "products.read",
        "description": "Visualizar produtos",
        "resource": "products",
        "action": "read"
      },
      {
        "id": "perm-uuid-21",
        "name": "sales.create",
        "description": "Criar vendas",
        "resource": "sales",
        "action": "create"
      }
      // ... permissões de vendas
    ]
  },
  {
    "id": "role-uuid-4",
    "name": "viewer",
    "description": "Visualizador com acesso somente leitura",
    "usersCount": 8,
    "createdAt": "2025-01-15T10:00:00.000Z",
    "updatedAt": "2025-01-15T10:00:00.000Z",
    "permissions": [
      {
        "id": "perm-uuid-2",
        "name": "users.read",
        "description": "Visualizar usuários",
        "resource": "users",
        "action": "read"
      },
      {
        "id": "perm-uuid-10",
        "name": "companies.read",
        "description": "Visualizar empresas",
        "resource": "companies",
        "action": "read"
      }
      // ... apenas permissões de leitura
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

**Exemplo:**
```bash
GET /roles/role-uuid-1
```

**Resposta:**
```json
{
  "id": "role-uuid-1",
  "name": "admin",
  "description": "Administrador com acesso total ao sistema",
  "usersCount": 5,
  "createdAt": "2025-01-15T10:00:00.000Z",
  "updatedAt": "2025-01-15T10:00:00.000Z",
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
    // ... todas as permissões da role
  ]
}
```

---

### 3. Buscar Role por Nome

```
GET /roles/name/:name
```

**Permissão:** `users.read`

**Exemplos:**
```bash
# Buscar role admin
GET /roles/name/admin

# Buscar role manager
GET /roles/name/manager

# Buscar role sales
GET /roles/name/sales

# Buscar role viewer
GET /roles/name/viewer
```

**Resposta:**
```json
{
  "id": "role-uuid-2",
  "name": "manager",
  "description": "Gerente com permissões de gestão",
  "permissions": [
    {
      "id": "perm-uuid-2",
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
    },
    {
      "id": "perm-uuid-5",
      "name": "companies.create",
      "description": "Criar empresas",
      "resource": "companies",
      "action": "create"
    },
    {
      "id": "perm-uuid-6",
      "name": "companies.read",
      "description": "Visualizar empresas",
      "resource": "companies",
      "action": "read"
    },
    {
      "id": "perm-uuid-7",
      "name": "companies.update",
      "description": "Atualizar empresas",
      "resource": "companies",
      "action": "update"
    }
    // ... mais permissões
  ]
}
```

---

### 4. Listar Todas as Permissões

```
GET /roles/permissions/all
```

**Permissão:** `users.read`

**✅ USO:** Listar todas as permissões disponíveis no sistema, útil para criar novas roles ou entender o sistema de permissões.

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
      "createdAt": "2025-01-15T10:00:00.000Z",
      "updatedAt": "2025-01-15T10:00:00.000Z"
    },
    {
      "id": "perm-uuid-2",
      "name": "users.read",
      "description": "Visualizar usuários",
      "resource": "users",
      "action": "read",
      "createdAt": "2025-01-15T10:00:00.000Z",
      "updatedAt": "2025-01-15T10:00:00.000Z"
    }
    // ... todas as permissões
  ],
  "byResource": {
    "users": [
      {
        "id": "perm-uuid-1",
        "name": "users.create",
        "description": "Criar usuários",
        "resource": "users",
        "action": "create",
        "createdAt": "2025-01-15T10:00:00.000Z",
        "updatedAt": "2025-01-15T10:00:00.000Z"
      },
      {
        "id": "perm-uuid-2",
        "name": "users.read",
        "description": "Visualizar usuários",
        "resource": "users",
        "action": "read",
        "createdAt": "2025-01-15T10:00:00.000Z",
        "updatedAt": "2025-01-15T10:00:00.000Z"
      },
      {
        "id": "perm-uuid-3",
        "name": "users.update",
        "description": "Atualizar usuários",
        "resource": "users",
        "action": "update",
        "createdAt": "2025-01-15T10:00:00.000Z",
        "updatedAt": "2025-01-15T10:00:00.000Z"
      },
      {
        "id": "perm-uuid-4",
        "name": "users.delete",
        "description": "Deletar usuários",
        "resource": "users",
        "action": "delete",
        "createdAt": "2025-01-15T10:00:00.000Z",
        "updatedAt": "2025-01-15T10:00:00.000Z"
      }
    ],
    "companies": [
      {
        "id": "perm-uuid-5",
        "name": "companies.create",
        "description": "Criar empresas",
        "resource": "companies",
        "action": "create",
        "createdAt": "2025-01-15T10:00:00.000Z",
        "updatedAt": "2025-01-15T10:00:00.000Z"
      },
      {
        "id": "perm-uuid-6",
        "name": "companies.read",
        "description": "Visualizar empresas",
        "resource": "companies",
        "action": "read",
        "createdAt": "2025-01-15T10:00:00.000Z",
        "updatedAt": "2025-01-15T10:00:00.000Z"
      }
      // ... mais permissões de companies
    ],
    "accounting": [
      {
        "id": "perm-uuid-13",
        "name": "accounting.create",
        "description": "Criar contas contábeis",
        "resource": "accounting",
        "action": "create",
        "createdAt": "2025-01-15T10:00:00.000Z",
        "updatedAt": "2025-01-15T10:00:00.000Z"
      }
      // ... mais permissões de accounting
    ]
    // ... mais recursos
  }
}
```

---

## 👥 Alterar Role de um Usuário

### Endpoint: Atualizar Role em uma Empresa

```
PATCH /users/:userId/companies/:companyId/role
```

**Permissão:** `users.update`

**✅ USO:** Alterar a role (papel/função) de um usuário em uma empresa específica.

**Body:**
```json
{
  "roleId": "nova-role-uuid"
}
```

**Validações:**
- ✅ Role deve existir
- ✅ Vínculo usuário-empresa deve existir
- ✅ Usuário com permissão users.update pode fazer a alteração

**Exemplo Completo:**

```bash
# 1. Listar roles disponíveis
curl http://localhost:4000/roles \
  -H "Authorization: Bearer $TOKEN" | jq

# 2. Encontrar ID da role desejada
# Exemplo: "manager" -> "role-uuid-manager"

# 3. Alterar role do usuário
curl -X PATCH http://localhost:4000/users/user-uuid/companies/company-uuid/role \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "roleId": "role-uuid-manager"
  }' | jq

# 4. Verificar mudança
curl http://localhost:4000/users/user-uuid \
  -H "Authorization: Bearer $TOKEN" | \
  jq '.companies[] | select(.companyId == "company-uuid") | {empresa: .company.nomeFantasia, role: .role.name}'
```

**Resposta:**
```json
{
  "userId": "user-uuid",
  "companyId": "company-uuid",
  "roleId": "role-uuid-manager",
  "active": true,
  "company": {
    "id": "company-uuid",
    "nomeFantasia": "Empresa Alpha",
    "razaoSocial": "Empresa Alpha Comércio Ltda"
  },
  "role": {
    "id": "role-uuid-manager",
    "name": "manager",
    "description": "Gerente com permissões de gestão"
  }
}
```

---

## 📊 Roles Padrão do Sistema

### 1. Admin (Administrador)

**Nome:** `admin`  
**Descrição:** Administrador com acesso total ao sistema

**Permissões:**
- ✅ **users.*** - Todas as operações com usuários
- ✅ **companies.*** - Todas as operações com empresas
- ✅ **accounting.*** - Todas as operações contábeis
- ✅ **products.*** - Todas as operações com produtos
- ✅ **sales.*** - Todas as operações de vendas
- ✅ **reports.*** - Todos os relatórios

**Uso Recomendado:** Proprietários, Diretores, CTO, CEO

---

### 2. Manager (Gerente)

**Nome:** `manager`  
**Descrição:** Gerente com permissões de gestão

**Permissões:**
- ✅ **users.read** - Visualizar usuários
- ✅ **users.update** - Atualizar usuários
- ✅ **companies.create** - Criar empresas
- ✅ **companies.read** - Visualizar empresas
- ✅ **companies.update** - Atualizar empresas
- ✅ **accounting.*** - Todas as operações contábeis
- ✅ **products.*** - Todas as operações com produtos
- ✅ **sales.*** - Todas as operações de vendas
- ✅ **reports.read** - Visualizar relatórios

**Não Tem:**
- ❌ **users.create** - Criar usuários
- ❌ **users.delete** - Deletar usuários
- ❌ **companies.delete** - Deletar empresas

**Uso Recomendado:** Gerentes, Coordenadores, Supervisores

---

### 3. Sales (Vendedor)

**Nome:** `sales`  
**Descrição:** Vendedor com acesso operacional

**Permissões:**
- ✅ **users.read** - Visualizar usuários (apenas da empresa)
- ✅ **companies.read** - Visualizar empresa
- ✅ **products.read** - Visualizar produtos
- ✅ **sales.create** - Criar vendas
- ✅ **sales.read** - Visualizar vendas
- ✅ **sales.update** - Atualizar vendas

**Não Tem:**
- ❌ Criar/deletar usuários
- ❌ Modificar empresas
- ❌ Acessar contabilidade
- ❌ Deletar vendas

**Uso Recomendado:** Vendedores, Representantes Comerciais

---

### 4. Viewer (Visualizador)

**Nome:** `viewer`  
**Descrição:** Visualizador com acesso somente leitura

**Permissões:**
- ✅ **users.read** - Visualizar usuários
- ✅ **companies.read** - Visualizar empresas
- ✅ **products.read** - Visualizar produtos
- ✅ **sales.read** - Visualizar vendas
- ✅ **reports.read** - Visualizar relatórios

**Não Tem:**
- ❌ Nenhuma operação de criação
- ❌ Nenhuma operação de atualização
- ❌ Nenhuma operação de exclusão

**Uso Recomendado:** Auditores, Contadores Externos, Consultores

---

## 💡 Casos de Uso

### 1. Ver Todas as Roles Disponíveis

```typescript
// Listar roles
const roles = await api.get('/roles');

console.log('Roles disponíveis:');
roles.forEach(role => {
  console.log(`- ${role.name}: ${role.description}`);
  console.log(`  Usuários: ${role.usersCount}`);
  console.log(`  Permissões: ${role.permissions.length}`);
});
```

### 2. Promover Usuário de Sales para Manager

```typescript
// 1. Buscar role "manager"
const roles = await api.get('/roles');
const managerRole = roles.find(r => r.name === 'manager');

// 2. Atualizar role do usuário
await api.patch(`/users/${userId}/companies/${companyId}/role`, {
  roleId: managerRole.id,
});

console.log('✅ Usuário promovido para Manager');
```

### 3. Verificar Permissões de uma Role

```typescript
// Buscar role específica
const adminRole = await api.get('/roles/name/admin');

console.log(`Role: ${adminRole.name}`);
console.log(`Descrição: ${adminRole.description}`);
console.log('\nPermissões:');

// Agrupar por recurso
const byResource = adminRole.permissions.reduce((acc, perm) => {
  if (!acc[perm.resource]) acc[perm.resource] = [];
  acc[perm.resource].push(perm.action);
  return acc;
}, {});

Object.entries(byResource).forEach(([resource, actions]) => {
  console.log(`- ${resource}: ${actions.join(', ')}`);
});
```

### 4. Listar Usuários por Role

```typescript
// Buscar role
const salesRole = await api.get('/roles/name/sales');

// Buscar usuários da empresa com essa role
const users = await api.get(`/users/company/${companyId}?roleId=${salesRole.id}`);

console.log(`Vendedores da empresa: ${users.data.length}`);
users.data.forEach(user => {
  console.log(`- ${user.name} (${user.email})`);
});
```

### 5. Alterar Role de Múltiplos Usuários

```typescript
// Promover todos os vendedores para manager
const salesRole = await api.get('/roles/name/sales');
const managerRole = await api.get('/roles/name/manager');

// Buscar todos os vendedores
const salesUsers = await api.get(`/users/company/${companyId}?roleId=${salesRole.id}`);

// Promover cada um
for (const user of salesUsers.data) {
  await api.patch(`/users/${user.id}/companies/${companyId}/role`, {
    roleId: managerRole.id,
  });
  console.log(`✅ ${user.name} promovido para Manager`);
}
```

---

## 🎨 Exemplo Frontend - React Component

### Componente de Seleção de Role

```tsx
import { useEffect, useState } from 'react';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Array<{
    name: string;
    description: string;
  }>;
}

interface RoleSelectorProps {
  userId: string;
  companyId: string;
  currentRoleId: string;
  onRoleChange?: (newRole: Role) => void;
}

export function RoleSelector({ 
  userId, 
  companyId, 
  currentRoleId,
  onRoleChange 
}: RoleSelectorProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState(currentRoleId);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadRoles() {
      try {
        const response = await fetch('/api/roles', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setRoles(data);
      } catch (error) {
        console.error('Erro ao carregar roles:', error);
      } finally {
        setLoading(false);
      }
    }

    loadRoles();
  }, []);

  async function handleRoleChange(newRoleId: string) {
    if (newRoleId === currentRoleId) return;

    setSaving(true);
    try {
      const response = await fetch(
        `/api/users/${userId}/companies/${companyId}/role`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ roleId: newRoleId }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSelectedRole(newRoleId);
        
        const newRole = roles.find(r => r.id === newRoleId);
        if (newRole && onRoleChange) {
          onRoleChange(newRole);
        }
      }
    } catch (error) {
      console.error('Erro ao alterar role:', error);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div>Carregando roles...</div>;
  }

  return (
    <div className="role-selector">
      <label htmlFor="role-select">Função/Papel:</label>
      
      <select
        id="role-select"
        value={selectedRole}
        onChange={(e) => handleRoleChange(e.target.value)}
        disabled={saving}
      >
        {roles.map(role => (
          <option key={role.id} value={role.id}>
            {role.name} - {role.description}
          </option>
        ))}
      </select>

      {saving && <span className="saving">Salvando...</span>}

      {/* Mostrar permissões da role selecionada */}
      {selectedRole && (
        <div className="role-permissions">
          <h4>Permissões:</h4>
          <ul>
            {roles
              .find(r => r.id === selectedRole)
              ?.permissions.map(perm => (
                <li key={perm.name}>
                  <strong>{perm.name}</strong>: {perm.description}
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

### Componente de Lista de Roles

```tsx
import { useEffect, useState } from 'react';

interface Role {
  id: string;
  name: string;
  description: string;
  usersCount: number;
  permissions: Array<{
    resource: string;
    action: string;
    description: string;
  }>;
}

export function RolesList() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [expandedRole, setExpandedRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRoles() {
      try {
        const response = await fetch('/api/roles', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setRoles(data);
      } catch (error) {
        console.error('Erro ao carregar roles:', error);
      } finally {
        setLoading(false);
      }
    }

    loadRoles();
  }, []);

  function toggleExpand(roleId: string) {
    setExpandedRole(expandedRole === roleId ? null : roleId);
  }

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="roles-list">
      <h2>Funções/Papéis do Sistema</h2>
      
      <div className="roles-grid">
        {roles.map(role => (
          <div key={role.id} className="role-card">
            <div className="role-header" onClick={() => toggleExpand(role.id)}>
              <h3>{role.name}</h3>
              <span className="users-count">
                {role.usersCount} usuários
              </span>
            </div>
            
            <p className="role-description">{role.description}</p>
            
            <div className="role-stats">
              <span>{role.permissions.length} permissões</span>
            </div>

            {expandedRole === role.id && (
              <div className="role-permissions-expanded">
                <h4>Permissões Detalhadas:</h4>
                
                {/* Agrupar por recurso */}
                {Object.entries(
                  role.permissions.reduce((acc, perm) => {
                    if (!acc[perm.resource]) acc[perm.resource] = [];
                    acc[perm.resource].push(perm);
                    return acc;
                  }, {} as Record<string, typeof role.permissions>)
                ).map(([resource, perms]) => (
                  <div key={resource} className="resource-group">
                    <h5>{resource}</h5>
                    <ul>
                      {perms.map(perm => (
                        <li key={perm.name}>
                          <span className="action-badge">{perm.action}</span>
                          {perm.description}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
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

### 404 - Role por nome não encontrada
```json
{
  "statusCode": 404,
  "message": "Role 'nome-invalido' não encontrada",
  "error": "Not Found"
}
```

### 404 - Vínculo usuário-empresa não encontrado
```json
{
  "statusCode": 404,
  "message": "Vínculo usuário-empresa não encontrado",
  "error": "Not Found"
}
```

### 403 - Sem permissão
```json
{
  "statusCode": 403,
  "message": "Você não tem permissão para acessar este recurso",
  "error": "Forbidden"
}
```

---

## 📊 Matriz de Permissões

### Recursos e Ações Disponíveis

| Recurso | create | read | update | delete |
|---------|--------|------|--------|--------|
| **users** | ✅ | ✅ | ✅ | ✅ |
| **companies** | ✅ | ✅ | ✅ | ✅ |
| **accounting** | ✅ | ✅ | ✅ | ✅ |
| **products** | ✅ | ✅ | ✅ | ✅ |
| **sales** | ✅ | ✅ | ✅ | ✅ |
| **reports** | - | ✅ | - | - |

### Permissões por Role

| Permissão | admin | manager | sales | viewer |
|-----------|-------|---------|-------|--------|
| **users.create** | ✅ | ❌ | ❌ | ❌ |
| **users.read** | ✅ | ✅ | ✅ | ✅ |
| **users.update** | ✅ | ✅ | ❌ | ❌ |
| **users.delete** | ✅ | ❌ | ❌ | ❌ |
| **companies.create** | ✅ | ✅ | ❌ | ❌ |
| **companies.read** | ✅ | ✅ | ✅ | ✅ |
| **companies.update** | ✅ | ✅ | ❌ | ❌ |
| **companies.delete** | ✅ | ❌ | ❌ | ❌ |
| **accounting.*** | ✅ | ✅ | ❌ | ❌ |
| **products.create** | ✅ | ✅ | ❌ | ❌ |
| **products.read** | ✅ | ✅ | ✅ | ✅ |
| **products.update** | ✅ | ✅ | ❌ | ❌ |
| **products.delete** | ✅ | ✅ | ❌ | ❌ |
| **sales.create** | ✅ | ✅ | ✅ | ❌ |
| **sales.read** | ✅ | ✅ | ✅ | ✅ |
| **sales.update** | ✅ | ✅ | ✅ | ❌ |
| **sales.delete** | ✅ | ✅ | ❌ | ❌ |
| **reports.read** | ✅ | ✅ | ❌ | ✅ |

---

## 🔄 Fluxo de Alteração de Role

```
1. Listar Roles Disponíveis
   GET /roles
   ↓
2. Selecionar Nova Role
   (Verificar permissões e descrição)
   ↓
3. Alterar Role do Usuário
   PATCH /users/:userId/companies/:companyId/role
   ↓
4. Verificar Mudança
   GET /users/:userId
   ↓
5. Usuário Faz Novo Login
   POST /auth/login
   (Recebe novas permissões no token)
```

---

## 📚 Referências

- [Gerenciamento de Usuários](./USERS_MANAGEMENT.md)
- [Sistema de Autenticação](./AUTH.md)
- [Gestão de Empresas](./COMPANIES.md)
- [Sistema de Auditoria](./AUDIT_SYSTEM.md)

---

## 🎯 Próximos Passos

1. ✅ **Implementado:** Endpoints de listagem de roles
2. ✅ **Implementado:** Endpoint de alteração de role
3. ✅ **Documentado:** Sistema completo de RBAC
4. 🔄 **Sugerido:** Endpoint para criar roles customizadas
5. 🔄 **Sugerido:** Endpoint para gerenciar permissões de roles
6. 🔄 **Sugerido:** Interface visual para gestão de roles
