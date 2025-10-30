# 📋 Listar Empresas do Usuário

## Endpoint

```
GET /users/me/companies
```

## Descrição

Retorna todas as empresas que o usuário autenticado tem acesso, incluindo informações básicas de cada empresa e a role do usuário em cada uma delas.

## Autenticação

Requer token JWT no header `Authorization`.

```
Authorization: Bearer {token}
```

## Permissões

- ✅ **Não requer permissão específica** - qualquer usuário autenticado pode consultar suas próprias empresas
- ✅ **Não requer header `x-company-id`** - endpoint independente de empresa

## Resposta de Sucesso

**Status:** `200 OK`

**Corpo da Resposta:**

```json
[
  {
    "id": "cm2r8g9h40000vy9x1a2b3c4d",
    "razaoSocial": "Empresa Alpha Comércio Ltda",
    "nomeFantasia": "Empresa Alpha",
    "cnpj": "11222333000144",
    "logoUrl": null,
    "email": "contato@alpha.com.br",
    "telefone": "(11) 3000-1000",
    "cidade": "São Paulo",
    "estado": "SP",
    "active": true,
    "role": {
      "id": "cm2r8g9h40001vy9x1a2b3c4e",
      "name": "admin",
      "description": "Administrador - Acesso total ao sistema",
      "permissions": [
        {
          "id": "cm2r8g9h40010vy9x1a2b3c4x",
          "name": "users.create",
          "description": "Criar usuários",
          "resource": "users",
          "action": "create"
        },
        {
          "id": "cm2r8g9h40011vy9x1a2b3c4y",
          "name": "users.read",
          "description": "Visualizar usuários",
          "resource": "users",
          "action": "read"
        },
        {
          "id": "cm2r8g9h40012vy9x1a2b3c4z",
          "name": "users.update",
          "description": "Atualizar usuários",
          "resource": "users",
          "action": "update"
        }
        // ... todas as 17 permissões para admin
      ]
    }
  },
  {
    "id": "cm2r8g9h40002vy9x1a2b3c4f",
    "razaoSocial": "Empresa Beta Serviços e Comércio Ltda",
    "nomeFantasia": "Empresa Beta",
    "cnpj": "55666777000188",
    "logoUrl": null,
    "email": "contato@beta.com.br",
    "telefone": "(11) 3000-2000",
    "cidade": "São Paulo",
    "estado": "SP",
    "active": true,
    "role": {
      "id": "cm2r8g9h40001vy9x1a2b3c4e",
      "name": "admin",
      "description": "Administrador - Acesso total ao sistema",
      "permissions": [
        // ... todas as 17 permissões
      ]
    }
  },
  {
    "id": "cm2r8g9h40003vy9x1a2b3c4g",
    "razaoSocial": "Empresa Gamma Indústria e Comércio Ltda",
    "nomeFantasia": "Empresa Gamma",
    "cnpj": "99888777000199",
    "logoUrl": null,
    "email": "contato@gamma.com.br",
    "telefone": "(19) 3500-3000",
    "cidade": "Campinas",
    "estado": "SP",
    "active": true,
    "role": {
      "id": "cm2r8g9h40004vy9x1a2b3c4h",
      "name": "manager",
      "description": "Gerente",
      "permissions": [
        {
          "id": "cm2r8g9h40011vy9x1a2b3c4y",
          "name": "users.read",
          "description": "Visualizar usuários",
          "resource": "users",
          "action": "read"
        },
        {
          "id": "cm2r8g9h40010vy9x1a2b3c4x",
          "name": "users.create",
          "description": "Criar usuários",
          "resource": "users",
          "action": "create"
        }
        // ... demais permissões de manager (sem delete)
      ]
    }
  }
]
```

## Campos Retornados

### Empresa

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | string | ID único da empresa |
| `razaoSocial` | string | Razão social da empresa |
| `nomeFantasia` | string | Nome fantasia da empresa |
| `cnpj` | string | CNPJ da empresa |
| `logoUrl` | string \| null | URL da logo da empresa |
| `email` | string | E-mail de contato da empresa |
| `telefone` | string | Telefone de contato da empresa |
| `cidade` | string | Cidade da empresa |
| `estado` | string | Estado (UF) da empresa |
| `active` | boolean | Se a empresa está ativa |

### Role

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | string | ID único da role |
| `name` | string | Nome da role (admin, manager, sales, viewer) |
| `description` | string | Descrição da role |
| `permissions` | array | Array de permissões da role |

### Permission (dentro de role.permissions)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | string | ID único da permissão |
| `name` | string | Nome da permissão (ex: users.create) |
| `description` | string | Descrição da permissão |
| `resource` | string | Recurso (users, companies, products, sales, reports) |
| `action` | string | Ação (create, read, update, delete) |

## Exemplos de Uso

### Requisição

```bash
curl -X GET http://localhost:3000/users/me/companies \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### JavaScript/TypeScript (fetch)

```typescript
const response = await fetch('http://localhost:3000/users/me/companies', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});

const companies = await response.json();
console.log('Minhas empresas:', companies);
```

### React - Hook personalizado

```typescript
import { useState, useEffect } from 'react';
import { api } from '../services/api';

interface UserCompany {
  id: string;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  logoUrl: string | null;
  email: string;
  telefone: string;
  cidade: string;
  estado: string;
  active: boolean;
  role: {
    id: string;
    name: string;
    description: string;
    permissions: {
      id: string;
      name: string;
      description: string;
      resource: string;
      action: string;
    }[];
  };
}

export function useUserCompanies() {
  const [companies, setCompanies] = useState<UserCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCompanies() {
      try {
        setLoading(true);
        const response = await api.get('/users/me/companies');
        setCompanies(response.data);
      } catch (err) {
        setError('Erro ao carregar empresas');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadCompanies();
  }, []);

  return { companies, loading, error };
}
```

### Vue 3 - Composable

```typescript
import { ref, onMounted } from 'vue';
import { api } from '../services/api';

export function useUserCompanies() {
  const companies = ref([]);
  const loading = ref(true);
  const error = ref(null);

  const loadCompanies = async () => {
    try {
      loading.value = true;
      const response = await api.get('/users/me/companies');
      companies.value = response.data;
    } catch (err) {
      error.value = 'Erro ao carregar empresas';
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  onMounted(() => {
    loadCompanies();
  });

  return { companies, loading, error, loadCompanies };
}
```

## Casos de Uso

### 1. Seletor de Empresas no Frontend

Use este endpoint para criar um componente que permite o usuário selecionar qual empresa deseja acessar:

```typescript
function CompanySelector({ onSelectCompany }) {
  const { companies, loading } = useUserCompanies();

  if (loading) return <Spinner />;

  return (
    <Select placeholder="Selecione uma empresa">
      {companies.map(company => (
        <Option key={company.id} value={company.id}>
          <div>
            <strong>{company.nomeFantasia}</strong>
            <small>{company.role.description}</small>
          </div>
        </Option>
      ))}
    </Select>
  );
}
```

### 2. Verificar Permissões por Empresa

```typescript
function checkUserPermission(
  companyId: string, 
  companies: UserCompany[], 
  permissionName: string
) {
  const userCompany = companies.find(c => c.id === companyId);
  if (!userCompany) return false;
  
  return userCompany.role.permissions.some(p => p.name === permissionName);
}

// Exemplo de uso
const canCreateUsers = checkUserPermission(
  selectedCompanyId, 
  companies, 
  'users.create'
);

if (canCreateUsers) {
  // Mostrar botão de criar usuário
}
```

### 3. Obter todas as permissões do usuário em uma empresa

```typescript
function getUserPermissions(companyId: string, companies: UserCompany[]) {
  const userCompany = companies.find(c => c.id === companyId);
  return userCompany?.role.permissions.map(p => p.name) || [];
}

// Exemplo de uso
const permissions = getUserPermissions(selectedCompanyId, companies);
console.log('Permissões:', permissions);
// Output: ['users.create', 'users.read', 'users.update', 'users.delete', ...]
```

### 3. Dashboard com Múltiplas Empresas

```typescript
function MultiCompanyDashboard() {
  const { companies } = useUserCompanies();

  return (
    <div>
      <h1>Minhas Empresas</h1>
      {companies.map(company => (
        <CompanyCard key={company.id}>
          <h2>{company.nomeFantasia}</h2>
          <p>{company.razaoSocial}</p>
          <Badge>{company.role.description}</Badge>
          <PermissionsList>
            {company.role.permissions.map(p => (
              <PermissionBadge key={p.id}>
                {p.resource}.{p.action}
              </PermissionBadge>
            ))}
          </PermissionsList>
          <Link to={`/company/${company.id}/dashboard`}>
            Acessar
          </Link>
        </CompanyCard>
      ))}
    </div>
  );
}
```

### 4. Hook para verificar permissões

```typescript
import { useState, useEffect } from 'react';

export function usePermission(permissionName: string) {
  const { companies } = useUserCompanies();
  const { selectedCompanyId } = useCompany();
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    if (!selectedCompanyId) {
      setHasPermission(false);
      return;
    }

    const company = companies.find(c => c.id === selectedCompanyId);
    const permission = company?.role.permissions.some(
      p => p.name === permissionName
    );
    
    setHasPermission(!!permission);
  }, [companies, selectedCompanyId, permissionName]);

  return hasPermission;
}

// Uso em componente
function UsersList() {
  const canCreate = usePermission('users.create');
  const canDelete = usePermission('users.delete');

  return (
    <div>
      {canCreate && <Button>Criar Usuário</Button>}
      <Table>
        {/* ... */}
        {canDelete && <DeleteButton />}
      </Table>
    </div>
  );
}
```

## Possíveis Erros

### 401 Unauthorized

**Causa:** Token inválido ou não fornecido

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**Solução:** Fazer login novamente e obter um novo token

### 404 Not Found

**Causa:** Usuário não existe ou não tem empresas associadas

**Solução:** Verificar se o usuário está corretamente vinculado a pelo menos uma empresa

## Notas Importantes

1. ✅ **Endpoint Público para Usuário Autenticado**: Qualquer usuário autenticado pode consultar suas próprias empresas
2. ✅ **Não Requer x-company-id**: Este endpoint não depende de uma empresa específica
3. ✅ **Apenas Empresas Ativas**: Retorna apenas empresas onde `active = true` no vínculo `UserCompany`
4. ✅ **Informações Essenciais**: Retorna apenas os campos mais importantes para interface
5. ✅ **Role Incluída**: Cada empresa retorna a role específica do usuário naquela empresa
6. ✅ **Permissões Incluídas**: Retorna todas as permissões explícitas da role do usuário em cada empresa
7. ✅ **Permissões Explícitas**: Admin tem todas as 17 permissões atribuídas explicitamente (não role-based)
8. ✅ **Cache no Frontend**: Recomenda-se cachear essa resposta e usar para verificação de permissões client-side

## Fluxo Recomendado

```
1. Usuário faz login
   ↓
2. Recebe token JWT
   ↓
3. Chama GET /users/me/companies
   ↓
4. Recebe lista de empresas com roles
   ↓
5. Frontend mostra seletor de empresas
   ↓
6. Usuário seleciona uma empresa
   ↓
7. Frontend salva companyId selecionado
   ↓
8. Nas próximas requisições, envia header x-company-id
```

## Integração com Context/Store

### React Context

```typescript
interface CompanyContextData {
  companies: UserCompany[];
  selectedCompany: UserCompany | null;
  selectCompany: (companyId: string) => void;
  hasPermission: (permissionName: string) => boolean;
  getPermissions: () => string[];
}

export const CompanyProvider: React.FC = ({ children }) => {
  const { companies } = useUserCompanies();
  const [selectedCompany, setSelectedCompany] = useState<UserCompany | null>(null);

  useEffect(() => {
    // Seleciona automaticamente a primeira empresa
    if (companies.length > 0 && !selectedCompany) {
      setSelectedCompany(companies[0]);
    }
  }, [companies]);

  const selectCompany = (companyId: string) => {
    const company = companies.find(c => c.id === companyId);
    if (company) {
      setSelectedCompany(company);
      // Salva no localStorage para persistir
      localStorage.setItem('selectedCompanyId', companyId);
    }
  };

  const hasPermission = (permissionName: string): boolean => {
    if (!selectedCompany) return false;
    return selectedCompany.role.permissions.some(p => p.name === permissionName);
  };

  const getPermissions = (): string[] => {
    if (!selectedCompany) return [];
    return selectedCompany.role.permissions.map(p => p.name);
  };

  return (
    <CompanyContext.Provider 
      value={{ 
        companies, 
        selectedCompany, 
        selectCompany,
        hasPermission,
        getPermissions
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
};
```

### Vuex Store

```typescript
export const companyModule = {
  state: {
    companies: [],
    selectedCompany: null,
  },
  mutations: {
    SET_COMPANIES(state, companies) {
      state.companies = companies;
    },
    SET_SELECTED_COMPANY(state, company) {
      state.selectedCompany = company;
    },
  },
  actions: {
    async loadCompanies({ commit }) {
      const response = await api.get('/users/me/companies');
      commit('SET_COMPANIES', response.data);
      // Seleciona automaticamente a primeira
      if (response.data.length > 0) {
        commit('SET_SELECTED_COMPANY', response.data[0]);
      }
    },
    selectCompany({ commit, state }, companyId) {
      const company = state.companies.find(c => c.id === companyId);
      if (company) {
        commit('SET_SELECTED_COMPANY', company);
        localStorage.setItem('selectedCompanyId', companyId);
      }
    },
  },
};
```
