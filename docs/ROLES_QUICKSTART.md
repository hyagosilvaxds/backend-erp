# 🚀 Roles Management - Guia Rápido

## 📋 Sumário

- [Login e Setup](#login-e-setup)
- [Listar e Buscar](#listar-e-buscar)
- [Criar Role](#criar-role)
- [Atualizar Role](#atualizar-role)
- [Gerenciar Permissões](#gerenciar-permissões)
- [Deletar Role](#deletar-role)
- [Exemplos Práticos](#exemplos-práticos)

---

## 🔐 Login e Setup

```bash
# 1. Fazer login
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "senha123"
  }'

# 2. Salvar token e company ID
TOKEN="seu_token_aqui"
COMPANY_ID="sua_company_id_aqui"
```

---

## 📖 Listar e Buscar

### Listar Todas as Roles

```bash
curl http://localhost:4000/roles \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-company-id: $COMPANY_ID"
```

### Buscar Role por ID

```bash
curl http://localhost:4000/roles/role-uuid \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-company-id: $COMPANY_ID"
```

### Buscar Role por Nome

```bash
curl http://localhost:4000/roles/name/admin \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-company-id: $COMPANY_ID"
```

### Listar Todas as Permissões

```bash
curl http://localhost:4000/roles/permissions/all \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-company-id: $COMPANY_ID"
```

---

## ✨ Criar Role

### Role Simples (sem permissões)

```bash
curl -X POST http://localhost:4000/roles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-company-id: $COMPANY_ID" \
  -d '{
    "name": "support",
    "description": "Equipe de suporte técnico"
  }'
```

### Role com Permissões

```bash
curl -X POST http://localhost:4000/roles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-company-id: $COMPANY_ID" \
  -d '{
    "name": "sales",
    "description": "Equipe de vendas",
    "permissionIds": [
      "perm-customers-read",
      "perm-customers-create",
      "perm-sales-read",
      "perm-sales-create"
    ]
  }'
```

---

## 📝 Atualizar Role

### Atualizar Nome e Descrição

```bash
curl -X PATCH http://localhost:4000/roles/role-uuid \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-company-id: $COMPANY_ID" \
  -d '{
    "name": "senior-sales",
    "description": "Vendedores seniores com mais permissões"
  }'
```

### Atualizar Apenas Descrição

```bash
curl -X PATCH http://localhost:4000/roles/role-uuid \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-company-id: $COMPANY_ID" \
  -d '{
    "description": "Nova descrição da role"
  }'
```

---

## 🔑 Gerenciar Permissões

### Adicionar Permissões

```bash
curl -X POST http://localhost:4000/roles/role-uuid/permissions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-company-id: $COMPANY_ID" \
  -d '{
    "permissionIds": [
      "perm-reports-read",
      "perm-dashboard-read",
      "perm-customers-update"
    ]
  }'
```

### Remover Permissões

```bash
curl -X DELETE http://localhost:4000/roles/role-uuid/permissions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-company-id: $COMPANY_ID" \
  -d '{
    "permissionIds": [
      "perm-customers-delete",
      "perm-sales-delete"
    ]
  }'
```

---

## 🗑️ Deletar Role

```bash
curl -X DELETE http://localhost:4000/roles/role-uuid \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-company-id: $COMPANY_ID"
```

⚠️ **Atenção:** Não é possível deletar roles que têm usuários atribuídos!

---

## 💡 Exemplos Práticos

### 1. Criar Role de Suporte Técnico

```bash
# Passo 1: Listar permissões disponíveis
curl http://localhost:4000/roles/permissions/all \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-company-id: $COMPANY_ID" | jq '.byResource'

# Passo 2: Criar role com permissões específicas
curl -X POST http://localhost:4000/roles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-company-id: $COMPANY_ID" \
  -d '{
    "name": "technical-support",
    "description": "Suporte técnico com acesso a tickets e clientes",
    "permissionIds": [
      "perm-tickets-read",
      "perm-tickets-create",
      "perm-tickets-update",
      "perm-customers-read"
    ]
  }'

# Passo 3: Salvar o ID da role criada
SUPPORT_ROLE_ID="id_retornado"
```

### 2. Promover Role (Adicionar Mais Permissões)

```bash
# Cenário: Vendedor promovido a vendedor sênior

# Adicionar permissões de gestão
curl -X POST http://localhost:4000/roles/$SALES_ROLE_ID/permissions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-company-id: $COMPANY_ID" \
  -d '{
    "permissionIds": [
      "perm-sales-delete",
      "perm-reports-read",
      "perm-team-read"
    ]
  }'
```

### 3. Clonar Role Existente

```bash
# Passo 1: Buscar role original
ORIGINAL=$(curl http://localhost:4000/roles/$ORIGINAL_ROLE_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-company-id: $COMPANY_ID")

# Passo 2: Extrair IDs das permissões
PERMISSIONS=$(echo $ORIGINAL | jq '[.permissions[].id]')

# Passo 3: Criar nova role
curl -X POST http://localhost:4000/roles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-company-id: $COMPANY_ID" \
  -d "{
    \"name\": \"sales-trainee\",
    \"description\": \"Vendedor em treinamento (baseado em sales)\",
    \"permissionIds\": $PERMISSIONS
  }"

# Passo 4: Remover algumas permissões sensíveis
curl -X DELETE http://localhost:4000/roles/$NEW_ROLE_ID/permissions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-company-id: $COMPANY_ID" \
  -d '{
    "permissionIds": ["perm-sales-delete", "perm-customers-delete"]
  }'
```

### 4. Criar Hierarquia de Roles

```bash
# Role 1: Estagiário (apenas leitura)
curl -X POST http://localhost:4000/roles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-company-id: $COMPANY_ID" \
  -d '{
    "name": "intern",
    "description": "Estagiário - apenas visualização",
    "permissionIds": [
      "perm-customers-read",
      "perm-products-read",
      "perm-sales-read"
    ]
  }'

# Role 2: Júnior (leitura + criação)
curl -X POST http://localhost:4000/roles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-company-id: $COMPANY_ID" \
  -d '{
    "name": "junior",
    "description": "Júnior - visualização e criação",
    "permissionIds": [
      "perm-customers-read",
      "perm-customers-create",
      "perm-products-read",
      "perm-sales-read",
      "perm-sales-create"
    ]
  }'

# Role 3: Pleno (leitura + criação + edição)
curl -X POST http://localhost:4000/roles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-company-id: $COMPANY_ID" \
  -d '{
    "name": "mid-level",
    "description": "Pleno - gestão completa",
    "permissionIds": [
      "perm-customers-read",
      "perm-customers-create",
      "perm-customers-update",
      "perm-products-read",
      "perm-sales-read",
      "perm-sales-create",
      "perm-sales-update",
      "perm-reports-read"
    ]
  }'

# Role 4: Sênior (tudo acima + deleção)
curl -X POST http://localhost:4000/roles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-company-id: $COMPANY_ID" \
  -d '{
    "name": "senior",
    "description": "Sênior - acesso completo",
    "permissionIds": [
      "perm-customers-read",
      "perm-customers-create",
      "perm-customers-update",
      "perm-customers-delete",
      "perm-products-read",
      "perm-sales-read",
      "perm-sales-create",
      "perm-sales-update",
      "perm-sales-delete",
      "perm-reports-read",
      "perm-team-read"
    ]
  }'
```

### 5. Auditoria de Roles

```bash
# Ver todas as alterações em roles
curl "http://localhost:4000/audit/roles?companyId=$COMPANY_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-company-id: $COMPANY_ID"

# Filtrar apenas criações de roles
curl "http://localhost:4000/audit/roles?companyId=$COMPANY_ID&action=ROLE_CREATE" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-company-id: $COMPANY_ID"

# Filtrar apenas adições de permissões
curl "http://localhost:4000/audit/roles?companyId=$COMPANY_ID&action=ROLE_ADD_PERMISSION" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-company-id: $COMPANY_ID"
```

---

## 🎯 Dicas e Boas Práticas

### ✅ DO's (Faça)

1. **Nomeação Clara**
   ```json
   {
     "name": "sales-manager",
     "description": "Gerente de vendas com acesso a relatórios e equipe"
   }
   ```

2. **Princípio do Menor Privilégio**
   - Dê apenas as permissões necessárias
   - Melhor ter roles específicas que roles com muitas permissões

3. **Hierarquia Lógica**
   ```
   viewer → user → power-user → manager → admin
   ```

4. **Documentar Descrições**
   ```json
   {
     "description": "Suporte N1: atendimento básico, criar e responder tickets"
   }
   ```

### ❌ DON'Ts (Não Faça)

1. **Não Use Nomes Genéricos**
   ```json
   // ❌ Ruim
   { "name": "role1" }
   
   // ✅ Bom
   { "name": "customer-support-basic" }
   ```

2. **Não Dê Todas as Permissões**
   ```json
   // ❌ Evite criar muitos "admins"
   { "name": "user", "permissionIds": ["*"] }
   
   // ✅ Seja específico
   { "name": "sales", "permissionIds": ["sales.*", "customers.read"] }
   ```

3. **Não Delete Roles em Uso**
   ```bash
   # ❌ Vai falhar se houver usuários
   curl -X DELETE /roles/$ROLE_ID
   
   # ✅ Primeiro remova usuários ou mude suas roles
   # Depois delete a role
   ```

---

## 📊 Permissões Comuns por Departamento

### Vendas
```json
{
  "name": "sales",
  "permissionIds": [
    "customers.read",
    "customers.create",
    "customers.update",
    "products.read",
    "sales.read",
    "sales.create",
    "sales.update",
    "reports.read"
  ]
}
```

### Suporte
```json
{
  "name": "support",
  "permissionIds": [
    "tickets.read",
    "tickets.create",
    "tickets.update",
    "customers.read",
    "products.read"
  ]
}
```

### Financeiro
```json
{
  "name": "finance",
  "permissionIds": [
    "invoices.read",
    "invoices.create",
    "invoices.update",
    "payments.read",
    "payments.create",
    "reports.read",
    "sales.read"
  ]
}
```

### RH
```json
{
  "name": "hr",
  "permissionIds": [
    "users.read",
    "users.create",
    "users.update",
    "roles.read",
    "companies.read"
  ]
}
```

---

## 🔍 Troubleshooting

### Erro: "Já existe uma role com este nome"

**Solução:** Escolha outro nome ou atualize a role existente

```bash
# Listar roles existentes
curl http://localhost:4000/roles \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-company-id: $COMPANY_ID" | jq '.[].name'
```

### Erro: "Não é possível deletar esta role"

**Solução:** Remova todos os usuários desta role primeiro

```bash
# Ver quantos usuários têm esta role
curl http://localhost:4000/roles/$ROLE_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-company-id: $COMPANY_ID" | jq '.usersCount'

# Listar usuários com esta role
curl "http://localhost:4000/users/company/$COMPANY_ID?roleId=$ROLE_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-company-id: $COMPANY_ID"
```

### Erro: "Permissão não encontrada"

**Solução:** Verifique se os IDs das permissões estão corretos

```bash
# Listar todas as permissões disponíveis
curl http://localhost:4000/roles/permissions/all \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-company-id: $COMPANY_ID" | jq '.all[] | {id, name}'
```

---

## 📚 Próximos Passos

- 📖 [Documentação Completa de Roles](./ROLES_MANAGEMENT.md)
- 👥 [Gerenciamento de Usuários](./USERS_MANAGEMENT.md)
- 🔐 [Sistema de Autenticação](./AUTH.md)
- 📊 [Sistema de Auditoria](./AUDIT_SYSTEM.md)

---

**Status:** 🟢 **PRONTO PARA USO**
