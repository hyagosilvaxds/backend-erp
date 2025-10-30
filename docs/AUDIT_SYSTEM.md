# Sistema de Auditoria de Empresas

## 📋 Visão Geral

Sistema completo de auditoria que registra todas as alterações realizadas nas empresas, incluindo:
- Criação e edição de dados
- Upload e remoção de logos
- Upload e remoção de certificados A1
- Ativação/desativação de empresas

## 🗄️ Estrutura do Banco de Dados

### Tabela `company_audits`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único |
| companyId | UUID | ID da empresa auditada |
| userId | UUID | ID do usuário que fez a alteração |
| action | String | Tipo de ação (CREATE, UPDATE, UPLOAD_LOGO, etc) |
| entityType | String | Tipo da entidade (sempre "Company") |
| fieldName | String? | Campo específico alterado (opcional) |
| oldValue | String? | Valor anterior (JSON string) |
| newValue | String? | Novo valor (JSON string) |
| ipAddress | String? | IP do usuário |
| userAgent | String? | Browser/app do usuário |
| description | String? | Descrição legível da ação |
| createdAt | DateTime | Data e hora da ação |

### Índices

- `companyId` - Buscar auditoria por empresa
- `userId` - Buscar auditoria por usuário
- `action` - Filtrar por tipo de ação
- `createdAt` - Ordenar por data

## 🔧 Tipos de Ação

| Ação | Descrição |
|------|-----------|
| CREATE | Empresa criada |
| UPDATE | Dados da empresa alterados |
| DELETE | Empresa deletada |
| UPLOAD_LOGO | Logo atualizada |
| REMOVE_LOGO | Logo removida |
| UPLOAD_CERTIFICATE | Certificado A1 atualizado |
| REMOVE_CERTIFICATE | Certificado A1 removido |
| TOGGLE_ACTIVE | Empresa ativada/desativada |

## 📡 Endpoints da API

### 1. Histórico de Auditoria da Empresa

```
GET /audit/company/:id
```

**Permissão:** `MANAGE_COMPANIES` (apenas admins)

**Parâmetros de Query:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| page | number | Página (padrão: 1) |
| limit | number | Itens por página (padrão: 50) |
| action | string | Filtrar por tipo de ação |

**Exemplo:**
```bash
curl http://localhost:4000/audit/company/123e4567-e89b-12d3-a456-426614174000?page=1&limit=20 \
  -H "Authorization: Bearer {token}"
```

**Resposta:**
```json
{
  "data": [
    {
      "id": "audit-123",
      "companyId": "123e4567-e89b-12d3-a456-426614174000",
      "userId": "user-456",
      "user": {
        "id": "user-456",
        "name": "João Silva",
        "email": "joao@empresa.com"
      },
      "action": "UPLOAD_CERTIFICATE",
      "description": "Certificado digital A1 atualizado",
      "createdAt": "2025-10-25T15:30:00.000Z"
    },
    {
      "id": "audit-124",
      "companyId": "123e4567-e89b-12d3-a456-426614174000",
      "userId": "user-789",
      "user": {
        "id": "user-789",
        "name": "Maria Santos",
        "email": "maria@empresa.com"
      },
      "action": "UPDATE",
      "fieldName": "razaoSocial",
      "oldValue": "Empresa Antiga LTDA",
      "newValue": "Empresa Nova LTDA",
      "description": "Campo \"razaoSocial\" alterado",
      "createdAt": "2025-10-25T14:15:00.000Z"
    }
  ],
  "meta": {
    "total": 45,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

### 2. Histórico de Auditoria do Usuário

```
GET /audit/user/:id
```

**Permissão:** `MANAGE_COMPANIES` (apenas admins)

**Parâmetros de Query:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| page | number | Página (padrão: 1) |
| limit | number | Itens por página (padrão: 50) |

**Exemplo:**
```bash
curl http://localhost:4000/audit/user/user-456 \
  -H "Authorization: Bearer {token}"
```

**Resposta:**
```json
{
  "data": [
    {
      "id": "audit-123",
      "companyId": "123e4567-e89b-12d3-a456-426614174000",
      "company": {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "razaoSocial": "Empresa LTDA",
        "cnpj": "12345678000190"
      },
      "userId": "user-456",
      "action": "UPLOAD_CERTIFICATE",
      "description": "Certificado digital A1 atualizado",
      "createdAt": "2025-10-25T15:30:00.000Z"
    }
  ],
  "meta": {
    "total": 12,
    "page": 1,
    "limit": 50,
    "totalPages": 1
  }
}
```

## 💻 Uso no Código

### Registrando Auditoria Manualmente

```typescript
import { AuditService } from './audit/audit.service';

@Injectable()
export class SomeService {
  constructor(private auditService: AuditService) {}

  async updateCompany(companyId: string, userId: string, data: any) {
    // ... lógica de atualização

    // Registrar auditoria
    await this.auditService.log({
      companyId,
      userId,
      action: 'UPDATE',
      fieldName: 'email',
      oldValue: oldEmail,
      newValue: newEmail,
      description: 'E-mail da empresa atualizado',
    });
  }
}
```

### Métodos Disponíveis

```typescript
// Criar empresa
await auditService.logCreate(companyId, userId, companyData);

// Atualizar empresa (detecta mudanças automaticamente)
await auditService.logUpdate(companyId, userId, oldData, newData);

// Upload de logo
await auditService.logUploadLogo(companyId, userId, logoUrl);

// Remover logo
await auditService.logRemoveLogo(companyId, userId);

// Upload de certificado
await auditService.logUploadCertificate(companyId, userId);

// Remover certificado
await auditService.logRemoveCertificate(companyId, userId);

// Ativar/desativar
await auditService.logToggleActive(companyId, userId, active);

// Deletar empresa
await auditService.logDelete(companyId, userId, companyData);
```

## 🎨 Interface Frontend

### TypeScript Interface

```typescript
interface CompanyAudit {
  id: string;
  companyId: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  action: string;
  entityType: string;
  fieldName?: string;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
  userAgent?: string;
  description?: string;
  createdAt: string;
}
```

### Exemplo de Componente React

```tsx
import { useEffect, useState } from 'react';

interface AuditLogProps {
  companyId: string;
}

export function AuditLog({ companyId }: AuditLogProps) {
  const [audits, setAudits] = useState<CompanyAudit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAudits() {
      const response = await fetch(
        `/api/audit/company/${companyId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      const data = await response.json();
      setAudits(data.data);
      setLoading(false);
    }
    fetchAudits();
  }, [companyId]);

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="audit-log">
      <h3>Histórico de Alterações</h3>
      <table>
        <thead>
          <tr>
            <th>Data/Hora</th>
            <th>Usuário</th>
            <th>Ação</th>
            <th>Descrição</th>
          </tr>
        </thead>
        <tbody>
          {audits.map(audit => (
            <tr key={audit.id}>
              <td>{new Date(audit.createdAt).toLocaleString('pt-BR')}</td>
              <td>{audit.user.name}</td>
              <td>
                <ActionBadge action={audit.action} />
              </td>
              <td>
                {audit.description}
                {audit.fieldName && (
                  <div className="text-sm text-gray-600">
                    {audit.oldValue} → {audit.newValue}
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ActionBadge({ action }: { action: string }) {
  const colors = {
    CREATE: 'bg-green-100 text-green-800',
    UPDATE: 'bg-blue-100 text-blue-800',
    DELETE: 'bg-red-100 text-red-800',
    UPLOAD_LOGO: 'bg-purple-100 text-purple-800',
    UPLOAD_CERTIFICATE: 'bg-yellow-100 text-yellow-800',
    REMOVE_LOGO: 'bg-gray-100 text-gray-800',
    REMOVE_CERTIFICATE: 'bg-gray-100 text-gray-800',
    TOGGLE_ACTIVE: 'bg-indigo-100 text-indigo-800',
  };

  const labels = {
    CREATE: 'Criação',
    UPDATE: 'Atualização',
    DELETE: 'Exclusão',
    UPLOAD_LOGO: 'Upload Logo',
    UPLOAD_CERTIFICATE: 'Upload Certificado',
    REMOVE_LOGO: 'Remoção Logo',
    REMOVE_CERTIFICATE: 'Remoção Certificado',
    TOGGLE_ACTIVE: 'Ativação/Desativação',
  };

  return (
    <span className={`px-2 py-1 rounded text-xs ${colors[action]}`}>
      {labels[action]}
    </span>
  );
}
```

## 🔐 Segurança

### Dados Protegidos

- ❌ Senha do certificado NUNCA é registrada na auditoria
- ❌ Path do certificado NUNCA é registrado na auditoria
- ✅ Apenas informações não-sensíveis são armazenadas

### Permissões

- Apenas usuários com permissão `MANAGE_COMPANIES` podem ver auditoria
- Auditoria é read-only (não pode ser editada ou deletada)

## 📊 Casos de Uso

### 1. Compliance e Regulamentação

```typescript
// Gerar relatório de todas as alterações em certificados
const audits = await auditService.getCompanyAuditHistory(companyId, {
  action: 'UPLOAD_CERTIFICATE'
});
```

### 2. Investigação de Problemas

```typescript
// Ver quem alterou determinado campo
const audits = await auditService.getCompanyAuditHistory(companyId);
const emailChanges = audits.data.filter(a => 
  a.fieldName === 'email'
);
```

### 3. Histórico do Usuário

```typescript
// Ver todas as ações de um usuário
const audits = await auditService.getUserAuditHistory(userId);
```

## ✅ Checklist de Implementação

### Backend
- [x] Model Prisma criado
- [x] Migration aplicada
- [x] AuditService criado
- [x] AuditModule criado
- [x] AuditController criado
- [x] Integrado em todos os métodos de companies.service.ts
  - [x] create() - Criação de empresa
  - [x] update() - Atualização pelo usuário
  - [x] updateCompanyAsAdmin() - Atualização pelo admin
  - [x] remove() - Exclusão
  - [x] toggleActive() - Ativação/desativação
  - [x] uploadLogo() - Upload de logo
  - [x] removeLogo() - Remoção de logo
  - [x] uploadCertificate() - Upload de certificado A1
  - [x] removeCertificate() - Remoção de certificado A1
- [x] userId passado em todos os métodos do controller
- [ ] Captura de IP e User-Agent nos controllers (opcional)
- [ ] Testes unitários

### Frontend
- [ ] Interface TypeScript
- [ ] Componente de histórico de auditoria
- [ ] Filtros por tipo de ação
- [ ] Páginação
- [ ] Export para CSV/PDF

## 📚 Referências

- [Segurança de Dados Sensíveis](./SECURITY_SENSITIVE_DATA.md)
- [Upload de Certificado A1](./CERTIFICATE_A1_UPLOAD.md)
- [Endpoints Admin](./ADMIN_EDIT_COMPANIES.md)
