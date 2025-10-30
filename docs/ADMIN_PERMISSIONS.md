# 👥 Permissões de Administradores

## Visão Geral

Este documento explica as diferenças entre **SuperAdmin** e **Admin**, e como as permissões funcionam para criação de empresas.

---

## 🔑 Tipos de Administradores

### 1. SuperAdmin (Role-Based)

- **Tipo**: Role especial baseada em código
- **Permissões**: TODAS as permissões automaticamente
- **Características**:
  - Não precisa ter permissões configuradas no banco
  - O sistema reconhece pela role `superadmin`
  - Sempre bypass em todas as validações de permissão
  - Pode acessar TODAS as empresas
  - Pode criar, editar e deletar qualquer empresa

**Identificação no Código**:
```typescript
if (userCompany.role.name === 'superadmin') {
  // Sempre tem acesso total
  return true;
}
```

### 2. Admin (Permission-Based)

- **Tipo**: Role normal com permissões configuráveis
- **Permissões**: Definidas no banco de dados (tabela `RolePermission`)
- **Características**:
  - Permissões podem ser editadas/removidas
  - Por padrão, tem todas as permissões (mas podem ser alteradas)
  - Pode criar empresas se tiver `companies.create`
  - Pode editar empresas se tiver `companies.update`
  - Pode deletar empresas se tiver `companies.delete`

**Permissões Padrão do Admin** (configuradas no seed):
```typescript
const adminRole = {
  name: 'admin',
  permissions: [
    // Usuários
    'users.create', 'users.read', 'users.update', 'users.delete',
    
    // Empresas
    'companies.create', 'companies.read', 'companies.update', 'companies.delete',
    
    // Produtos
    'products.create', 'products.read', 'products.update', 'products.delete',
    
    // Vendas
    'sales.create', 'sales.read', 'sales.update', 'sales.delete',
    
    // Relatórios
    'reports.read'
  ]
}
```

---

## 🏢 Criação de Empresas

### Como Funciona?

Quando um admin (ou qualquer usuário) tenta criar uma empresa:

1. **Autenticação**: Verifica se o token JWT é válido
2. **Permissão Global**: Verifica se o usuário tem `companies.create` em **QUALQUER empresa** que ele tenha acesso
3. **Criação**: Se aprovado, cria a nova empresa

### Fluxo de Validação

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Usuário envia POST /companies sem x-company-id          │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. JwtAuthGuard valida o token                              │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. PermissionsGuard detecta que é companies.create          │
│    e NÃO há x-company-id                                    │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Busca TODAS as empresas do usuário                       │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Verifica em CADA empresa:                                │
│    - Se é SuperAdmin → APROVADO                             │
│    - Se tem companies.create → APROVADO                     │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Se encontrou permissão → Permite criar                   │
│    Se NÃO encontrou → 403 Forbidden                         │
└─────────────────────────────────────────────────────────────┘
```

### Por Que Não Precisa x-company-id?

Para criar uma empresa, **não faz sentido** especificar uma empresa existente porque:

1. A empresa ainda não existe
2. O usuário está criando uma NOVA empresa
3. A permissão é verificada **globalmente** (em qualquer empresa que o usuário tenha acesso)

**Analogia**: É como pedir permissão para entrar em um prédio que você está construindo. Você não precisa estar "dentro" de nenhum prédio específico para ter permissão de construir um novo.

---

## 📊 Comparação: SuperAdmin vs Admin

| Característica | SuperAdmin | Admin |
|----------------|------------|-------|
| **Tipo** | Role-based | Permission-based |
| **Permissões** | Todas (hardcoded) | Configuráveis no banco |
| **Criar Empresas** | ✅ Sempre | ✅ Se tiver `companies.create` |
| **Editar Empresas** | ✅ Todas | ✅ Empresas que tem acesso |
| **Deletar Empresas** | ✅ Todas | ✅ Se tiver `companies.delete` |
| **Acessar Qualquer Empresa** | ✅ Sim | ❌ Não |
| **Permissões Editáveis** | ❌ Não | ✅ Sim |
| **Bypass de Validações** | ✅ Sempre | ❌ Não |

---

## 🔧 Exemplos Práticos

### 1. Admin Criando Empresa (JavaScript/TypeScript)

```typescript
// Login como Admin
const loginResponse = await fetch('http://localhost:3000/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@example.com',
    password: 'senha123'
  })
});

const { access_token } = await loginResponse.json();

// Criar nova empresa (SEM x-company-id)
const createResponse = await fetch('http://localhost:3000/companies', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${access_token}`
    // ⚠️ NÃO enviar x-company-id
  },
  body: JSON.stringify({
    razaoSocial: 'NOVA EMPRESA LTDA',
    cnpj: '12345678000190',
    nomeFantasia: 'Nova Empresa',
    email: 'contato@novaempresa.com.br'
  })
});

const newCompany = await createResponse.json();
console.log('Empresa criada:', newCompany);
```

### 2. Admin Editando Empresa (JavaScript/TypeScript)

```typescript
// Editar empresa existente (PRECISA x-company-id)
const updateResponse = await fetch(`http://localhost:3000/companies/${companyId}`, {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${access_token}`,
    'x-company-id': companyId  // ⚠️ OBRIGATÓRIO para editar
  },
  body: JSON.stringify({
    nomeFantasia: 'Empresa Atualizada',
    telefone: '11987654321'
  })
});

const updatedCompany = await updateResponse.json();
console.log('Empresa atualizada:', updatedCompany);
```

### 3. Verificar Permissões do Admin

```typescript
// Obter perfil com empresas e permissões
const profileResponse = await fetch('http://localhost:3000/auth/profile', {
  headers: {
    'Authorization': `Bearer ${access_token}`
  }
});

const profile = await profileResponse.json();

// Verificar se tem permissão para criar empresas
profile.companies.forEach(company => {
  const canCreate = company.permissions.includes('companies.create');
  console.log(`Empresa: ${company.nomeFantasia}`);
  console.log(`Pode criar empresas: ${canCreate}`);
  console.log(`Permissões:`, company.permissions);
});
```

---

## ❓ FAQ

### 1. Admin pode criar empresas sem estar vinculado a nenhuma?

**Não**. O admin precisa estar vinculado a pelo menos uma empresa. Quando ele cria uma nova empresa, o sistema valida se ele tem a permissão `companies.create` em alguma das empresas que já tem acesso.

### 2. Posso remover a permissão de criar empresas do Admin?

**Sim**. Como a role `admin` é permission-based, você pode:

```typescript
// Remover permissão do banco de dados
await prisma.rolePermission.delete({
  where: {
    roleId_permissionId: {
      roleId: adminRoleId,
      permissionId: companiesCreatePermissionId
    }
  }
});
```

### 3. SuperAdmin pode perder permissões?

**Não**. O SuperAdmin é role-based, ou seja, as permissões são verificadas no código, não no banco de dados. Não há como remover permissões de um SuperAdmin.

### 4. Qual a diferença entre role-based e permission-based?

| Aspecto | Role-Based | Permission-Based |
|---------|------------|------------------|
| **Validação** | No código da aplicação | No banco de dados |
| **Flexibilidade** | Fixa (hardcoded) | Totalmente configurável |
| **Performance** | Mais rápida (sem query) | Requer query ao banco |
| **Exemplo** | SuperAdmin | Admin, Manager, Sales |

### 5. Como vincular o Admin à nova empresa criada?

O sistema **NÃO vincula automaticamente**. Você precisa fazer isso manualmente:

```typescript
// Após criar a empresa
const newCompany = await companiesService.create(createDto);

// Vincular o admin à nova empresa
await prisma.userCompany.create({
  data: {
    userId: adminUserId,
    companyId: newCompany.id,
    roleId: adminRoleId,
    active: true
  }
});
```

**Recomendação**: Implemente um endpoint específico para criar empresa + vincular automaticamente:

```typescript
@Post('companies/create-and-link')
async createAndLink(@Body() dto: CreateCompanyDto, @CurrentUser() user: any) {
  // 1. Criar empresa
  const company = await this.companiesService.create(dto, user.userId);
  
  // 2. Vincular usuário como admin na nova empresa
  await this.prisma.userCompany.create({
    data: {
      userId: user.userId,
      companyId: company.id,
      roleId: adminRoleId,
      active: true
    }
  });
  
  return company;
}
```

---

## 🎯 Resumo

1. **SuperAdmin** = Role especial, sempre todas as permissões
2. **Admin** = Role configurável, tem permissões no banco de dados
3. Para **criar empresas**: Não precisa `x-company-id`, mas precisa ter `companies.create` em alguma empresa
4. Para **editar/deletar**: Precisa `x-company-id` e permissão na empresa específica
5. Admin pode criar empresas se tiver a permissão `companies.create`
6. Permissões do Admin podem ser editadas no banco de dados

---

## 📚 Documentos Relacionados

- [AUTHENTICATION_DOCS.md](../AUTHENTICATION_DOCS.md) - Sistema de autenticação completo
- [COMPANY_MANAGEMENT.md](./COMPANY_MANAGEMENT.md) - Gerenciamento de empresas
- [COMPANY_FIELDS.md](./COMPANY_FIELDS.md) - Campos fiscais brasileiros
