# 📊 Endpoint de Auditoria de Empresas

## 🎯 Visão Geral

Endpoints para consultar o histórico completo de alterações realizadas nas empresas, incluindo quem fez, quando foi feito e o que foi alterado.

## 📡 Endpoints Disponíveis

### 1. Via AuditController (Recomendado)

```
GET /audit/company/:id
```

### 2. Via CompaniesController (Alternativo)

```
GET /companies/admin/:id/audit
```

**Ambos retornam os mesmos dados!**

## 🔐 Autenticação e Permissões

**Headers Obrigatórios:**
```
Authorization: Bearer {token}
```

**Permissão Necessária:**
- `MANAGE_COMPANIES` (via /audit/company/:id)
- `companies.read` (via /companies/admin/:id/audit)

## 📋 Parâmetros

### Path Parameters

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| id | string (UUID) | ID da empresa |

### Query Parameters

| Parâmetro | Tipo | Padrão | Descrição |
|-----------|------|--------|-----------|
| page | number | 1 | Número da página |
| limit | number | 50 | Itens por página |
| action | string | - | Filtrar por tipo de ação |

### Valores de `action`

- `CREATE` - Criação da empresa
- `UPDATE` - Atualização de dados
- `DELETE` - Exclusão da empresa
- `UPLOAD_LOGO` - Upload de logo
- `REMOVE_LOGO` - Remoção de logo
- `UPLOAD_CERTIFICATE` - Upload de certificado A1
- `REMOVE_CERTIFICATE` - Remoção de certificado A1
- `TOGGLE_ACTIVE` - Ativação/desativação

## 📤 Exemplos de Requisição

### 1. Buscar todas as alterações (paginado)

```bash
curl http://localhost:4000/audit/company/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 2. Buscar com paginação customizada

```bash
curl "http://localhost:4000/audit/company/123e4567-e89b-12d3-a456-426614174000?page=2&limit=20" \
  -H "Authorization: Bearer {token}"
```

### 3. Filtrar apenas uploads de certificado

```bash
curl "http://localhost:4000/audit/company/123e4567-e89b-12d3-a456-426614174000?action=UPLOAD_CERTIFICATE" \
  -H "Authorization: Bearer {token}"
```

### 4. Filtrar apenas atualizações

```bash
curl "http://localhost:4000/audit/company/123e4567-e89b-12d3-a456-426614174000?action=UPDATE" \
  -H "Authorization: Bearer {token}"
```

### 5. Via endpoint alternativo

```bash
curl "http://localhost:4000/companies/admin/123e4567-e89b-12d3-a456-426614174000/audit?page=1&limit=50" \
  -H "Authorization: Bearer {token}"
```

## 📥 Resposta

### Estrutura

```json
{
  "data": [
    {
      "id": "string",
      "companyId": "string",
      "userId": "string",
      "user": {
        "id": "string",
        "name": "string",
        "email": "string"
      },
      "action": "string",
      "entityType": "string",
      "fieldName": "string | null",
      "oldValue": "any | null",
      "newValue": "any | null",
      "ipAddress": "string | null",
      "userAgent": "string | null",
      "description": "string | null",
      "createdAt": "string (ISO 8601)"
    }
  ],
  "meta": {
    "total": "number",
    "page": "number",
    "limit": "number",
    "totalPages": "number"
  }
}
```

### Exemplo Completo

```json
{
  "data": [
    {
      "id": "audit-123e4567",
      "companyId": "company-456789",
      "userId": "user-789abc",
      "user": {
        "id": "user-789abc",
        "name": "João Silva",
        "email": "joao.silva@empresa.com"
      },
      "action": "UPLOAD_CERTIFICATE",
      "entityType": "Company",
      "fieldName": null,
      "oldValue": null,
      "newValue": null,
      "ipAddress": null,
      "userAgent": null,
      "description": "Certificado digital A1 atualizado",
      "createdAt": "2025-10-25T15:30:00.000Z"
    },
    {
      "id": "audit-234def",
      "companyId": "company-456789",
      "userId": "user-789abc",
      "user": {
        "id": "user-789abc",
        "name": "João Silva",
        "email": "joao.silva@empresa.com"
      },
      "action": "UPDATE",
      "entityType": "Company",
      "fieldName": "email",
      "oldValue": "antigo@empresa.com",
      "newValue": "novo@empresa.com",
      "ipAddress": null,
      "userAgent": null,
      "description": "Campo \"email\" alterado",
      "createdAt": "2025-10-25T14:20:00.000Z"
    },
    {
      "id": "audit-345ghi",
      "companyId": "company-456789",
      "userId": "user-abc123",
      "user": {
        "id": "user-abc123",
        "name": "Maria Santos",
        "email": "maria.santos@empresa.com"
      },
      "action": "UPLOAD_LOGO",
      "entityType": "Company",
      "fieldName": null,
      "oldValue": null,
      "newValue": {
        "logoUrl": "http://localhost:4000/uploads/logos/logo-123.png"
      },
      "ipAddress": null,
      "userAgent": null,
      "description": "Logo da empresa atualizada",
      "createdAt": "2025-10-25T10:15:00.000Z"
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

## 🎨 Exemplos de Uso Frontend

### JavaScript/Fetch

```javascript
async function getCompanyAudit(companyId, page = 1, limit = 50, action = null) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  
  if (action) {
    params.append('action', action);
  }

  const response = await fetch(
    `${API_URL}/audit/company/${companyId}?${params}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    }
  );

  if (!response.ok) {
    throw new Error('Erro ao buscar auditoria');
  }

  return response.json();
}

// Uso
const audit = await getCompanyAudit('company-123');
console.log(`Total de alterações: ${audit.meta.total}`);
audit.data.forEach(log => {
  console.log(`${log.user.name} - ${log.action} - ${log.createdAt}`);
});
```

### React Component

```tsx
import { useEffect, useState } from 'react';

interface AuditLog {
  id: string;
  action: string;
  user: {
    name: string;
    email: string;
  };
  description: string;
  createdAt: string;
  fieldName?: string;
  oldValue?: any;
  newValue?: any;
}

interface CompanyAuditProps {
  companyId: string;
}

export function CompanyAudit({ companyId }: CompanyAuditProps) {
  const [audits, setAudits] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState<string>('');

  useEffect(() => {
    async function fetchAudits() {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '20',
        });
        
        if (filter) {
          params.append('action', filter);
        }

        const response = await fetch(
          `/api/audit/company/${companyId}?${params}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        const data = await response.json();
        setAudits(data.data);
        setTotalPages(data.meta.totalPages);
      } catch (error) {
        console.error('Erro ao carregar auditoria:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAudits();
  }, [companyId, page, filter]);

  if (loading) {
    return <div>Carregando histórico...</div>;
  }

  return (
    <div className="audit-container">
      <div className="audit-header">
        <h2>Histórico de Alterações</h2>
        
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">Todas as ações</option>
          <option value="CREATE">Criação</option>
          <option value="UPDATE">Atualizações</option>
          <option value="UPLOAD_LOGO">Upload de Logo</option>
          <option value="UPLOAD_CERTIFICATE">Upload de Certificado</option>
          <option value="TOGGLE_ACTIVE">Ativação/Desativação</option>
        </select>
      </div>

      <table className="audit-table">
        <thead>
          <tr>
            <th>Data/Hora</th>
            <th>Usuário</th>
            <th>Ação</th>
            <th>Descrição</th>
            <th>Detalhes</th>
          </tr>
        </thead>
        <tbody>
          {audits.map((log) => (
            <tr key={log.id}>
              <td>
                {new Date(log.createdAt).toLocaleString('pt-BR')}
              </td>
              <td>
                <div>
                  <div className="user-name">{log.user.name}</div>
                  <div className="user-email">{log.user.email}</div>
                </div>
              </td>
              <td>
                <ActionBadge action={log.action} />
              </td>
              <td>{log.description}</td>
              <td>
                {log.fieldName && (
                  <div className="change-details">
                    <strong>{log.fieldName}</strong>
                    <div>
                      <span className="old-value">{JSON.stringify(log.oldValue)}</span>
                      {' → '}
                      <span className="new-value">{JSON.stringify(log.newValue)}</span>
                    </div>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Anterior
          </button>
          <span>Página {page} de {totalPages}</span>
          <button 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
}

function ActionBadge({ action }: { action: string }) {
  const badges = {
    CREATE: { label: 'Criação', color: 'green' },
    UPDATE: { label: 'Atualização', color: 'blue' },
    DELETE: { label: 'Exclusão', color: 'red' },
    UPLOAD_LOGO: { label: 'Upload Logo', color: 'purple' },
    REMOVE_LOGO: { label: 'Remoção Logo', color: 'gray' },
    UPLOAD_CERTIFICATE: { label: 'Upload Certificado', color: 'orange' },
    REMOVE_CERTIFICATE: { label: 'Remoção Certificado', color: 'gray' },
    TOGGLE_ACTIVE: { label: 'Ativação/Desativação', color: 'indigo' },
  };

  const badge = badges[action] || { label: action, color: 'gray' };

  return (
    <span className={`badge badge-${badge.color}`}>
      {badge.label}
    </span>
  );
}
```

### Axios

```typescript
import axios from 'axios';

interface AuditParams {
  page?: number;
  limit?: number;
  action?: string;
}

async function getCompanyAudit(
  companyId: string,
  params: AuditParams = {}
) {
  const response = await axios.get(
    `/audit/company/${companyId}`,
    {
      params: {
        page: params.page || 1,
        limit: params.limit || 50,
        ...(params.action && { action: params.action }),
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}

// Exemplos de uso
const allAudits = await getCompanyAudit('company-123');
const certificateAudits = await getCompanyAudit('company-123', { 
  action: 'UPLOAD_CERTIFICATE' 
});
const page2 = await getCompanyAudit('company-123', { 
  page: 2, 
  limit: 20 
});
```

## 📊 Casos de Uso

### 1. Relatório de Alterações Recentes

```typescript
const audit = await getCompanyAudit(companyId, { limit: 10 });
console.log('Últimas 10 alterações:');
audit.data.forEach(log => {
  console.log(`- ${log.user.name}: ${log.description} (${log.createdAt})`);
});
```

### 2. Auditoria de Certificados

```typescript
const certAudits = await getCompanyAudit(companyId, { 
  action: 'UPLOAD_CERTIFICATE' 
});
console.log(`Certificado atualizado ${certAudits.meta.total} vezes`);
console.log('Histórico:');
certAudits.data.forEach(log => {
  console.log(`- ${log.user.name} em ${new Date(log.createdAt).toLocaleDateString()}`);
});
```

### 3. Rastrear Mudança Específica

```typescript
const updates = await getCompanyAudit(companyId, { action: 'UPDATE' });
const emailChanges = updates.data.filter(log => log.fieldName === 'email');

console.log(`Email foi alterado ${emailChanges.length} vezes`);
emailChanges.forEach(change => {
  console.log(
    `${change.user.name} alterou de ${change.oldValue} para ${change.newValue}`
  );
});
```

### 4. Dashboard de Estatísticas

```typescript
const audit = await getCompanyAudit(companyId, { limit: 1000 });

const stats = {
  total: audit.meta.total,
  byAction: {},
  byUser: {},
};

audit.data.forEach(log => {
  stats.byAction[log.action] = (stats.byAction[log.action] || 0) + 1;
  stats.byUser[log.user.name] = (stats.byUser[log.user.name] || 0) + 1;
});

console.log('Estatísticas:', stats);
// {
//   total: 45,
//   byAction: { UPDATE: 30, UPLOAD_CERTIFICATE: 5, UPLOAD_LOGO: 2, ... },
//   byUser: { "João Silva": 20, "Maria Santos": 15, ... }
// }
```

## 🔒 Segurança

### Dados Protegidos

- ❌ **Senha do certificado** nunca é registrada (nem o hash)
- ❌ **Path do certificado** nunca é exposto
- ✅ Apenas a **ação** é registrada (UPLOAD_CERTIFICATE / REMOVE_CERTIFICATE)

### Exemplo de Auditoria de Certificado

```json
{
  "action": "UPLOAD_CERTIFICATE",
  "description": "Certificado digital A1 atualizado",
  "oldValue": null,
  "newValue": null
}
```

**Note:** Não há dados sensíveis expostos!

## ⚠️ Erros Comuns

### 404 - Empresa não encontrada

```json
{
  "statusCode": 404,
  "message": "Empresa não encontrada",
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

### 401 - Não autenticado

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

## 📚 Referências

- [Sistema de Auditoria Completo](./AUDIT_SYSTEM.md)
- [Implementação da Auditoria](./AUDIT_IMPLEMENTATION_COMPLETE.md)
- [Segurança de Dados Sensíveis](./SECURITY_SENSITIVE_DATA.md)
- [Endpoints Admin](./ADMIN_EDIT_COMPANIES.md)
