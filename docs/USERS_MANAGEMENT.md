# 👥 Gerenciamento de Usuários - API Documentation

## 🎯 Visão Geral

Sistema completo de gerenciamento de usuários com suporte a **multi-empresa**. Cada usuário pode estar vinculado a múltiplas empresas com diferentes roles (papéis/funções).

**🔒 ISOLAMENTO E SEGURANÇA:**
- ✅ Usuários podem pertencer a múltiplas empresas
- ✅ Cada vínculo empresa-usuário tem sua própria role
- ✅ Permissões necessárias para todas as operações
- ✅ Soft delete (desativação ao invés de exclusão)

## 🔐 Autenticação e Permissões

**Headers Obrigatórios:**
```
Authorization: Bearer {token}
```

**Permissões Necessárias:**
- `users.create` - Criar usuários
- `users.read` - Visualizar usuários
- `users.update` - Atualizar usuários e gerenciar vínculos
- `users.delete` - Deletar usuários

**Nota:** Usuários com role `admin` têm todas as permissões automaticamente.

---

## 📡 Endpoints

### 1. Listar TODOS os Usuários do Sistema

```
GET /users/all
```

**Permissão:** `users.read`

**✅ USO:** Endpoint para administradores visualizarem todos os usuários do sistema, independente de empresa.

**Query Parameters:**
- `page` (number, opcional) - Número da página (padrão: 1)
- `limit` (number, opcional) - Itens por página (padrão: 50)
- `search` (string, opcional) - Buscar por nome ou email
- `active` (boolean, opcional) - Filtrar por status ativo

**Exemplos:**
```bash
# Todos os usuários (primeira página)
GET /users/all

# Buscar por termo
GET /users/all?search=João

# Apenas usuários ativos
GET /users/all?active=true

# Paginação customizada
GET /users/all?page=2&limit=20

# Apenas inativos
GET /users/all?active=false
```

**Resposta:**
```json
{
  "data": [
    {
      "id": "uuid",
      "email": "joao.silva@example.com",
      "name": "João Silva",
      "active": true,
      "createdAt": "2025-01-15T10:00:00.000Z",
      "updatedAt": "2025-01-15T10:00:00.000Z",
      "_count": {
        "companies": 3
      },
      "companies": [
        {
          "companyId": "company-uuid-1",
          "roleId": "role-uuid",
          "active": true,
          "company": {
            "id": "company-uuid-1",
            "nomeFantasia": "Empresa Alpha",
            "razaoSocial": "Empresa Alpha Comércio Ltda"
          },
          "role": {
            "id": "role-uuid",
            "name": "admin",
            "description": "Administrador com acesso total"
          }
        },
        {
          "companyId": "company-uuid-2",
          "roleId": "role-uuid-2",
          "active": true,
          "company": {
            "id": "company-uuid-2",
            "nomeFantasia": "Empresa Beta",
            "razaoSocial": "Empresa Beta Serviços Ltda"
          },
          "role": {
            "id": "role-uuid-2",
            "name": "manager",
            "description": "Gerente com permissões de gestão"
          }
        }
      ]
    }
  ],
  "meta": {
    "total": 45,
    "page": 1,
    "limit": 50,
    "totalPages": 1
  }
}
```

---

### 2. Listar Usuários de uma Empresa

```
GET /users/company/:companyId
```

**Permissão:** `users.read`

**✅ USO:** Listar todos os usuários vinculados a uma empresa específica.

**Query Parameters:**
- `page` (number, opcional) - Número da página (padrão: 1)
- `limit` (number, opcional) - Itens por página (padrão: 50)
- `search` (string, opcional) - Buscar por nome ou email
- `active` (boolean, opcional) - Filtrar por status ativo
- `roleId` (string, opcional) - Filtrar por role específica

**Exemplos:**
```bash
# Todos os usuários da empresa
GET /users/company/empresa-uuid

# Apenas administradores da empresa
GET /users/company/empresa-uuid?roleId=admin-role-uuid

# Buscar por nome
GET /users/company/empresa-uuid?search=Maria

# Apenas ativos
GET /users/company/empresa-uuid?active=true
```

**Resposta:**
```json
{
  "data": [
    {
      "id": "uuid",
      "email": "maria.santos@example.com",
      "name": "Maria Santos",
      "active": true,
      "createdAt": "2025-01-15T10:00:00.000Z",
      "updatedAt": "2025-01-15T10:00:00.000Z",
      "companies": [
        {
          "companyId": "empresa-uuid",
          "roleId": "role-uuid",
          "active": true,
          "createdAt": "2025-01-15T10:00:00.000Z",
          "role": {
            "id": "role-uuid",
            "name": "manager",
            "description": "Gerente com permissões de gestão"
          }
        }
      ]
    }
  ],
  "meta": {
    "total": 12,
    "page": 1,
    "limit": 50,
    "totalPages": 1
  },
  "company": {
    "id": "empresa-uuid",
    "nomeFantasia": "Empresa Alpha",
    "razaoSocial": "Empresa Alpha Comércio Ltda"
  }
}
```

---

### 3. Buscar Usuário por ID

```
GET /users/:id
```

**Permissão:** `users.read`

**Resposta:**
```json
{
  "id": "uuid",
  "email": "joao.silva@example.com",
  "name": "João Silva",
  "active": true,
  "createdAt": "2025-01-15T10:00:00.000Z",
  "updatedAt": "2025-01-15T10:00:00.000Z",
  "companies": [
    {
      "companyId": "company-uuid",
      "roleId": "role-uuid",
      "active": true,
      "createdAt": "2025-01-15T10:00:00.000Z",
      "company": {
        "id": "company-uuid",
        "nomeFantasia": "Empresa Alpha",
        "razaoSocial": "Empresa Alpha Comércio Ltda",
        "cnpj": "11222333000144",
        "logoUrl": "https://..."
      },
      "role": {
        "id": "role-uuid",
        "name": "admin",
        "description": "Administrador com acesso total",
        "rolePermissions": [
          {
            "permission": {
              "id": "perm-uuid",
              "name": "users.create",
              "description": "Criar usuários",
              "resource": "users",
              "action": "create"
            }
          }
        ]
      }
    }
  ]
}
```

---

### 4. Criar Novo Usuário

```
POST /users
```

**Permissão:** `users.create`

**Body:**
```json
{
  "email": "novo.usuario@example.com",
  "name": "Novo Usuário",
  "password": "senha123",
  "active": true
}
```

**Campos:**
- `email` (string, **OBRIGATÓRIO**) - Email único do usuário
- `name` (string, **OBRIGATÓRIO**) - Nome completo
- `password` (string, **OBRIGATÓRIO**) - Senha (mínimo 6 caracteres)
- `active` (boolean, opcional) - Se está ativo (padrão: true)

**Validações:**
- ✅ Email deve ser válido
- ✅ Email deve ser único no sistema
- ✅ Senha deve ter no mínimo 6 caracteres
- ✅ Senha é armazenada com hash bcrypt

**Resposta:**
```json
{
  "id": "uuid",
  "email": "novo.usuario@example.com",
  "name": "Novo Usuário",
  "active": true,
  "createdAt": "2025-01-15T10:00:00.000Z",
  "updatedAt": "2025-01-15T10:00:00.000Z"
}
```

**⚠️ IMPORTANTE:** Após criar o usuário, você deve vinculá-lo a pelo menos uma empresa usando o endpoint `POST /users/:userId/companies`.

---

### 5. Atualizar Usuário

```
PATCH /users/:id
```

**Permissão:** `users.update`

**Body:** (todos os campos opcionais)
```json
{
  "email": "email.atualizado@example.com",
  "name": "Nome Atualizado",
  "password": "novaSenha123",
  "active": false
}
```

**Validações:**
- Se alterar email, não pode duplicar email existente
- Se alterar senha, deve ter mínimo 6 caracteres

**Resposta:**
```json
{
  "id": "uuid",
  "email": "email.atualizado@example.com",
  "name": "Nome Atualizado",
  "active": false,
  "createdAt": "2025-01-15T10:00:00.000Z",
  "updatedAt": "2025-01-15T14:30:00.000Z"
}
```

---

### 6. Ativar/Desativar Usuário

```
PATCH /users/:id/toggle-active
```

**Permissão:** `users.update`

Alterna o status ativo/inativo do usuário.

**Resposta:**
```json
{
  "id": "uuid",
  "email": "usuario@example.com",
  "name": "Nome do Usuário",
  "active": false,
  "updatedAt": "2025-01-15T14:30:00.000Z"
}
```

---

### 7. Deletar Usuário

```
DELETE /users/:id
```

**Permissão:** `users.delete`

**⚠️ SOFT DELETE:** O usuário é desativado e removido de todas as empresas, mas não é excluído do banco de dados.

**Resposta:** `204 No Content`

---

## 🏢 Gestão de Empresas

### 8. Vincular Usuário a uma Empresa

```
POST /users/:userId/companies
```

**Permissão:** `users.update`

**Body:**
```json
{
  "companyId": "empresa-uuid",
  "roleId": "role-uuid",
  "active": true
}
```

**Campos:**
- `companyId` (string, **OBRIGATÓRIO**) - ID da empresa
- `roleId` (string, **OBRIGATÓRIO**) - ID da role que o usuário terá na empresa
- `active` (boolean, opcional) - Se o vínculo está ativo (padrão: true)

**Validações:**
- ✅ Usuário deve existir
- ✅ Empresa deve existir
- ✅ Role deve existir
- ✅ Não pode vincular usuário já vinculado à mesma empresa

**Resposta:**
```json
{
  "userId": "user-uuid",
  "companyId": "empresa-uuid",
  "roleId": "role-uuid",
  "active": true,
  "createdAt": "2025-01-15T10:00:00.000Z",
  "company": {
    "id": "empresa-uuid",
    "nomeFantasia": "Empresa Alpha",
    "razaoSocial": "Empresa Alpha Comércio Ltda"
  },
  "role": {
    "id": "role-uuid",
    "name": "manager",
    "description": "Gerente com permissões de gestão"
  }
}
```

---

### 9. Atualizar Role do Usuário em uma Empresa

```
PATCH /users/:userId/companies/:companyId/role
```

**Permissão:** `users.update`

**Body:**
```json
{
  "roleId": "nova-role-uuid"
}
```

**Validações:**
- ✅ Role deve existir
- ✅ Vínculo usuário-empresa deve existir

**Resposta:**
```json
{
  "userId": "user-uuid",
  "companyId": "empresa-uuid",
  "roleId": "nova-role-uuid",
  "active": true,
  "company": {
    "id": "empresa-uuid",
    "nomeFantasia": "Empresa Alpha",
    "razaoSocial": "Empresa Alpha Comércio Ltda"
  },
  "role": {
    "id": "nova-role-uuid",
    "name": "admin",
    "description": "Administrador com acesso total"
  }
}
```

---

### 10. Remover Usuário de uma Empresa

```
DELETE /users/:userId/companies/:companyId
```

**Permissão:** `users.update`

**Validações:**
- ✅ Vínculo deve existir
- ❌ Não pode remover se for a única empresa do usuário (desative o usuário ao invés disso)

**Resposta:** `204 No Content`

---

### 11. Listar Empresas de um Usuário

```
GET /users/:userId/companies
```

**Permissão:** `users.read`

**Resposta:**
```json
[
  {
    "id": "empresa-uuid",
    "razaoSocial": "Empresa Alpha Comércio Ltda",
    "nomeFantasia": "Empresa Alpha",
    "cnpj": "11222333000144",
    "logoUrl": "https://...",
    "email": "contato@alpha.com.br",
    "telefone": "(11) 3000-1000",
    "cidade": "São Paulo",
    "estado": "SP",
    "active": true,
    "role": {
      "id": "role-uuid",
      "name": "admin",
      "description": "Administrador com acesso total",
      "permissions": [
        {
          "id": "perm-uuid",
          "name": "users.create",
          "description": "Criar usuários",
          "resource": "users",
          "action": "create"
        }
      ]
    }
  }
]
```

---

### 12. Obter Empresas do Usuário Logado

```
GET /users/me/companies
```

**Autenticação:** Requer apenas JWT (sem permissões específicas)

**✅ USO:** Endpoint para o usuário logado ver suas próprias empresas.

**Resposta:** Mesma estrutura do endpoint anterior.

---

## 💡 Casos de Uso

### 1. Criar Usuário e Vincular a Empresas

```typescript
// 1. Criar usuário
const user = await api.post('/users', {
  email: 'novo.usuario@example.com',
  name: 'Novo Usuário',
  password: 'senha123',
  active: true,
});

// 2. Vincular à Empresa 1 como Admin
await api.post(`/users/${user.id}/companies`, {
  companyId: 'empresa-1-uuid',
  roleId: 'admin-role-uuid',
  active: true,
});

// 3. Vincular à Empresa 2 como Manager
await api.post(`/users/${user.id}/companies`, {
  companyId: 'empresa-2-uuid',
  roleId: 'manager-role-uuid',
  active: true,
});
```

### 2. Listar Usuários de uma Empresa com Filtros

```typescript
// Buscar apenas administradores ativos
const admins = await api.get(`/users/company/${companyId}?roleId=${adminRoleId}&active=true`);

// Buscar por nome
const searchResults = await api.get(`/users/company/${companyId}?search=João`);
```

### 3. Alterar Role de um Usuário

```typescript
// Promover usuário de 'sales' para 'manager'
await api.patch(`/users/${userId}/companies/${companyId}/role`, {
  roleId: managerRoleId,
});
```

### 4. Remover Usuário de uma Empresa

```typescript
// Remover vínculo (usuário continua nas outras empresas)
await api.delete(`/users/${userId}/companies/${companyId}`);
```

---

## 🎨 Exemplo Frontend - React Component

```tsx
import { useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  active: boolean;
  companies: Array<{
    companyId: string;
    role: {
      name: string;
      description: string;
    };
  }>;
}

interface UserListProps {
  companyId?: string; // Se fornecido, lista usuários da empresa
}

export function UserList({ companyId }: UserListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showInactive, setShowInactive] = useState(false);

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (!showInactive) params.append('active', 'true');

        const endpoint = companyId
          ? `/api/users/company/${companyId}?${params}`
          : `/api/users/all?${params}`;

        const response = await fetch(endpoint, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();
        setUsers(data.data);
      } catch (error) {
        console.error('Erro ao carregar usuários:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, [companyId, search, showInactive]);

  async function handleToggleActive(userId: string) {
    try {
      await fetch(`/api/users/${userId}/toggle-active`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      // Atualizar lista
      setUsers(users.map(u => 
        u.id === userId ? { ...u, active: !u.active } : u
      ));
    } catch (error) {
      console.error('Erro ao alternar status:', error);
    }
  }

  if (loading) {
    return <div>Carregando usuários...</div>;
  }

  return (
    <div className="user-list">
      <div className="list-header">
        <h2>{companyId ? 'Usuários da Empresa' : 'Todos os Usuários'}</h2>
        
        <div className="filters">
          <input
            type="text"
            placeholder="Buscar por nome ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          
          <label>
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
            />
            Exibir inativos
          </label>
        </div>
      </div>

      <table className="user-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Status</th>
            <th>Empresas</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} className={!user.active ? 'inactive' : ''}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>
                <span className={`badge ${user.active ? 'active' : 'inactive'}`}>
                  {user.active ? 'Ativo' : 'Inativo'}
                </span>
              </td>
              <td>
                {user.companies.map(c => (
                  <div key={c.companyId} className="company-badge">
                    {c.role.name}
                  </div>
                ))}
              </td>
              <td>
                <button onClick={() => handleToggleActive(user.id)}>
                  {user.active ? 'Desativar' : 'Ativar'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## ⚠️ Erros Comuns

### 404 - Usuário não encontrado
```json
{
  "statusCode": 404,
  "message": "Usuário não encontrado",
  "error": "Not Found"
}
```

### 409 - Email já cadastrado
```json
{
  "statusCode": 409,
  "message": "Email já cadastrado",
  "error": "Conflict"
}
```

### 409 - Usuário já vinculado à empresa
```json
{
  "statusCode": 409,
  "message": "Usuário já vinculado a esta empresa",
  "error": "Conflict"
}
```

### 400 - Não pode remover da única empresa
```json
{
  "statusCode": 400,
  "message": "Não é possível remover usuário da única empresa. Desative o usuário ao invés disso.",
  "error": "Bad Request"
}
```

### 404 - Empresa não encontrada
```json
{
  "statusCode": 404,
  "message": "Empresa não encontrada",
  "error": "Not Found"
}
```

### 404 - Role não encontrada
```json
{
  "statusCode": 404,
  "message": "Role não encontrada",
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

## 📊 Fluxo de Gestão de Usuários

```
1. Criar Usuário
   POST /users
   ↓
2. Vincular a Empresas
   POST /users/:userId/companies (pode ser chamado múltiplas vezes)
   ↓
3. Gerenciar Roles
   PATCH /users/:userId/companies/:companyId/role
   ↓
4. Visualizar Atividade
   GET /users/:userId
   GET /users/:userId/companies
   ↓
5. Manutenção
   PATCH /users/:id (atualizar dados)
   PATCH /users/:id/toggle-active (ativar/desativar)
   DELETE /users/:userId/companies/:companyId (remover de empresa)
   DELETE /users/:id (soft delete completo)
```

---

## 📚 Referências

- [Sistema de Autenticação](./AUTH.md)
- [Permissões e Roles](./AUTH_PERMISSIONS.md)
- [Gestão de Empresas](./COMPANIES.md)
- [Sistema de Auditoria](./AUDIT_SYSTEM.md)
