# 🚀 Guia Rápido - Endpoints de Gerenciamento de Usuários

## 📋 Resumo dos Endpoints Criados

### 🔍 Visualização

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/users/all` | GET | Lista TODOS os usuários (admin) |
| `/users/company/:companyId` | GET | Lista usuários de uma empresa |
| `/users/:id` | GET | Busca usuário por ID |
| `/users/:userId/companies` | GET | Lista empresas de um usuário |
| `/users/me/companies` | GET | Empresas do usuário logado |

### ✏️ Gerenciamento

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/users` | POST | Criar novo usuário |
| `/users/:id` | PATCH | Atualizar usuário |
| `/users/:id/toggle-active` | PATCH | Ativar/Desativar |
| `/users/:id` | DELETE | Deletar (soft delete) |

### 🏢 Gestão de Empresas

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/users/:userId/companies` | POST | Vincular a empresa |
| `/users/:userId/companies/:companyId/role` | PATCH | Atualizar role |
| `/users/:userId/companies/:companyId` | DELETE | Remover de empresa |

---

## 🧪 Testando os Endpoints

### 1️⃣ Login e Obter Token

```bash
# Login como admin
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "senha123"
  }'

# Resposta:
# {
#   "access_token": "eyJhbGc...",
#   "user": { ... },
#   "companies": [ ... ]
# }

# Salve o token para usar nos próximos requests:
TOKEN="seu_token_aqui"
```

### 2️⃣ Listar Todos os Usuários

```bash
# Listar todos os usuários do sistema
curl http://localhost:4000/users/all \
  -H "Authorization: Bearer $TOKEN"

# Com filtros
curl "http://localhost:4000/users/all?search=João&active=true&page=1&limit=20" \
  -H "Authorization: Bearer $TOKEN"
```

### 3️⃣ Listar Usuários de uma Empresa

```bash
# Obter ID de uma empresa (do login ou de outro endpoint)
COMPANY_ID="uuid-da-empresa"

# Listar usuários da empresa
curl http://localhost:4000/users/company/$COMPANY_ID \
  -H "Authorization: Bearer $TOKEN"

# Com filtros
curl "http://localhost:4000/users/company/$COMPANY_ID?active=true&roleId=role-uuid" \
  -H "Authorization: Bearer $TOKEN"
```

### 4️⃣ Criar Novo Usuário

```bash
# Criar usuário
curl -X POST http://localhost:4000/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "novo.usuario@example.com",
    "name": "Novo Usuário",
    "password": "senha123",
    "active": true
  }'

# Resposta:
# {
#   "id": "novo-user-uuid",
#   "email": "novo.usuario@example.com",
#   "name": "Novo Usuário",
#   "active": true,
#   "createdAt": "...",
#   "updatedAt": "..."
# }

# Salvar ID:
USER_ID="novo-user-uuid"
```

### 5️⃣ Vincular Usuário a uma Empresa

```bash
# Primeiro, obter ID de uma role (admin, manager, sales, viewer)
# Você pode ver as roles ao fazer login ou consultar /roles

ROLE_ID="role-uuid"

# Vincular usuário à empresa
curl -X POST http://localhost:4000/users/$USER_ID/companies \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": "'$COMPANY_ID'",
    "roleId": "'$ROLE_ID'",
    "active": true
  }'
```

### 6️⃣ Buscar Usuário Específico

```bash
# Ver detalhes completos de um usuário
curl http://localhost:4000/users/$USER_ID \
  -H "Authorization: Bearer $TOKEN"

# Resposta inclui todas as empresas e roles do usuário
```

### 7️⃣ Atualizar Dados do Usuário

```bash
# Atualizar nome e email
curl -X PATCH http://localhost:4000/users/$USER_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nome Atualizado",
    "email": "email.atualizado@example.com"
  }'

# Alterar senha
curl -X PATCH http://localhost:4000/users/$USER_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "password": "novaSenha123"
  }'
```

### 8️⃣ Atualizar Role do Usuário em uma Empresa

```bash
# Promover usuário para admin
ADMIN_ROLE_ID="admin-role-uuid"

curl -X PATCH http://localhost:4000/users/$USER_ID/companies/$COMPANY_ID/role \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "roleId": "'$ADMIN_ROLE_ID'"
  }'
```

### 9️⃣ Ativar/Desativar Usuário

```bash
# Alternar status ativo/inativo
curl -X PATCH http://localhost:4000/users/$USER_ID/toggle-active \
  -H "Authorization: Bearer $TOKEN"
```

### 🔟 Listar Empresas de um Usuário

```bash
# Ver todas as empresas que o usuário tem acesso
curl http://localhost:4000/users/$USER_ID/companies \
  -H "Authorization: Bearer $TOKEN"
```

### 1️⃣1️⃣ Remover Usuário de uma Empresa

```bash
# Desvincular usuário de uma empresa (mantém nas outras)
curl -X DELETE http://localhost:4000/users/$USER_ID/companies/$COMPANY_ID \
  -H "Authorization: Bearer $TOKEN"
```

### 1️⃣2️⃣ Deletar Usuário (Soft Delete)

```bash
# Desativar usuário completamente
curl -X DELETE http://localhost:4000/users/$USER_ID \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📊 Cenários Completos

### Cenário 1: Criar Novo Colaborador Multi-Empresa

```bash
# Passo 1: Criar usuário
curl -X POST http://localhost:4000/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "colaborador@example.com",
    "name": "José Silva",
    "password": "senha123"
  }' | jq -r '.id' > user_id.txt

USER_ID=$(cat user_id.txt)

# Passo 2: Vincular à Empresa 1 como Manager
curl -X POST http://localhost:4000/users/$USER_ID/companies \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": "empresa-1-uuid",
    "roleId": "manager-role-uuid"
  }'

# Passo 3: Vincular à Empresa 2 como Sales
curl -X POST http://localhost:4000/users/$USER_ID/companies \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": "empresa-2-uuid",
    "roleId": "sales-role-uuid"
  }'

# Passo 4: Verificar
curl http://localhost:4000/users/$USER_ID/companies \
  -H "Authorization: Bearer $TOKEN"
```

### Cenário 2: Buscar Todos os Admins de uma Empresa

```bash
# Primeiro, obter ID da role admin
# (você pode ver isso ao fazer login)

# Listar apenas admins da empresa
curl "http://localhost:4000/users/company/$COMPANY_ID?roleId=$ADMIN_ROLE_ID" \
  -H "Authorization: Bearer $TOKEN"
```

### Cenário 3: Auditoria - Listar Usuários Inativos

```bash
# Ver todos os usuários desativados no sistema
curl "http://localhost:4000/users/all?active=false" \
  -H "Authorization: Bearer $TOKEN"

# Ver usuários inativos de uma empresa específica
curl "http://localhost:4000/users/company/$COMPANY_ID?active=false" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🔍 IDs Úteis do Seed

Após rodar `npx prisma db seed`, você terá:

### Usuários:
```bash
# admin@example.com - senha: senha123
# gerente@example.com - senha: senha123
# vendedor@example.com - senha: senha123
# viewer@example.com - senha: senha123
```

### Roles:
- `admin` - Administrador (todas as permissões)
- `manager` - Gerente
- `sales` - Vendedor
- `viewer` - Visualizador

### Para obter UUIDs:

```bash
# Login e salvar resposta completa
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "senha123"
  }' > login_response.json

# Ver companies disponíveis
cat login_response.json | jq '.companies'

# Ver role do usuário
cat login_response.json | jq '.companies[0].role'
```

---

## � Gestão de Perfil

### Upload de Foto do Usuário

```bash
# Upload de foto do próprio perfil
curl -X POST http://localhost:4000/users/$USER_ID/photo \
  -H "Authorization: Bearer $TOKEN" \
  -F "photo=@/caminho/para/foto.jpg"

# Upload como admin (foto de outro usuário)
curl -X POST http://localhost:4000/users/outro-user-id/photo \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -F "photo=@/caminho/para/foto.jpg"
```

**Resposta:**
```json
{
  "id": "uuid",
  "email": "usuario@example.com",
  "name": "Nome do Usuário",
  "photoUrl": "/uploads/users/user-photo-1761402345678-123456789.jpg",
  "active": true
}
```

### Remover Foto do Usuário

```bash
# Remover própria foto
curl -X DELETE http://localhost:4000/users/$USER_ID/photo \
  -H "Authorization: Bearer $TOKEN"

# Remover foto como admin
curl -X DELETE http://localhost:4000/users/outro-user-id/photo \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Resposta:**
```json
{
  "id": "uuid",
  "email": "usuario@example.com",
  "name": "Nome do Usuário",
  "photoUrl": null,
  "active": true
}
```

### Alterar Email (Apenas Admin)

```bash
# Alterar email de um usuário
curl -X PATCH http://localhost:4000/users/$USER_ID/email \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "novo.email@example.com"
  }'
```

**Resposta:**
```json
{
  "id": "uuid",
  "email": "novo.email@example.com",
  "name": "Nome do Usuário",
  "photoUrl": "/uploads/users/user-photo-123.jpg",
  "active": true
}
```

### Alterar Senha

```bash
# Usuário alterando própria senha (PRECISA da senha antiga)
curl -X PATCH http://localhost:4000/users/$USER_ID/password \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "oldPassword": "senhaAntiga123",
    "newPassword": "novaSenha123"
  }'

# Admin alterando senha de outro usuário (NÃO precisa validar senha antiga)
curl -X PATCH http://localhost:4000/users/outro-user-id/password \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "oldPassword": "qualquerCoisa",
    "newPassword": "senhaTemporaria123"
  }'
```

**Resposta:**
```json
{
  "id": "uuid",
  "email": "usuario@example.com",
  "name": "Nome do Usuário",
  "photoUrl": "/uploads/users/user-photo-123.jpg",
  "active": true,
  "message": "Senha alterada com sucesso"
}
```

---

## 🔐 Teste Completo de Fluxo com Perfil

### Cenário: Usuário Gerenciando Próprio Perfil

```bash
# 1. Login como usuário
export USER_TOKEN=$(curl -s -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@example.com",
    "password": "senha123"
  }' | jq -r '.access_token')

export USER_ID=$(curl -s http://localhost:4000/users/me \
  -H "Authorization: Bearer $USER_TOKEN" | jq -r '.id')

# 2. Ver perfil atual
curl http://localhost:4000/users/$USER_ID \
  -H "Authorization: Bearer $USER_TOKEN"

# 3. Fazer upload de foto
curl -X POST http://localhost:4000/users/$USER_ID/photo \
  -H "Authorization: Bearer $USER_TOKEN" \
  -F "photo=@minha-foto.jpg"

# 4. Alterar senha (precisa da senha antiga)
curl -X PATCH http://localhost:4000/users/$USER_ID/password \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "oldPassword": "senha123",
    "newPassword": "novaSenha456"
  }'

# 5. Verificar mudanças
curl http://localhost:4000/users/$USER_ID \
  -H "Authorization: Bearer $USER_TOKEN"
```

### Cenário: Admin Gerenciando Usuário

```bash
# 1. Login como Admin
export ADMIN_TOKEN=$(curl -s -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }' | jq -r '.access_token')

# 2. Buscar usuário específico
export TARGET_USER_ID=$(curl -s "http://localhost:4000/users?search=maria" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq -r '.users[0].id')

# 3. Alterar email do usuário
curl -X PATCH http://localhost:4000/users/$TARGET_USER_ID/email \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "novo.email@example.com"
  }'

# 4. Resetar senha (não precisa da senha antiga)
curl -X PATCH http://localhost:4000/users/$TARGET_USER_ID/password \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "oldPassword": "",
    "newPassword": "senhaTemporaria123"
  }'

# 5. Upload de foto para o usuário
curl -X POST http://localhost:4000/users/$TARGET_USER_ID/photo \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -F "photo=@foto-usuario.jpg"

# 6. Verificar mudanças
curl http://localhost:4000/users/$TARGET_USER_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## �📝 Notas Importantes

1. **Permissões:**
   - Todos os endpoints requerem `users.read` ou `users.update` ou `users.create` ou `users.delete`
   - Apenas `/users/me/companies` não requer permissão específica (apenas JWT)
   - **Foto:** Próprio usuário OU permissão `users.update`
   - **Email:** Apenas permissão `users.update`
   - **Senha:** Próprio usuário (com senha antiga) OU permissão `users.update`

2. **Multi-Empresa:**
   - Um usuário pode estar em várias empresas
   - Cada vínculo tem sua própria role
   - Não pode remover usuário da única empresa (desative ao invés disso)

3. **Soft Delete:**
   - Deletar usuário = desativar + remover de todas as empresas
   - Dados não são excluídos do banco

4. **Busca:**
   - Parâmetro `search` busca em nome E email
   - Case insensitive

5. **Paginação:**
   - Padrão: 50 itens por página
   - Pode ser customizado com `limit` e `page`

6. **Upload de Fotos:**
   - Formatos: JPG, JPEG, PNG, GIF
   - Tamanho máximo: 5MB
   - Foto anterior é deletada automaticamente ao fazer upload de nova
   - Arquivos salvos em `/uploads/users/`

7. **Alteração de Senha:**
   - **Próprio usuário:** DEVE informar senha antiga (validada)
   - **Admin:** NÃO precisa validar senha antiga
   - Nova senha: mínimo 6 caracteres
   - Senha armazenada com hash bcrypt

8. **Alteração de Email:**
   - Apenas admin pode alterar
   - Email deve ser único no sistema
   - Usuário precisará fazer login com novo email

---

## 🎯 Próximos Passos

1. ✅ **Implementado:** Endpoints de gerenciamento de usuários
2. ✅ **Implementado:** Seed com estrutura completa
3. 📝 **Documentação:** Completa em `/docs/USERS_MANAGEMENT.md`
4. 🔄 **Frontend:** Implementar interfaces de gestão de usuários
5. 🧪 **Testes:** Criar testes E2E para os endpoints

---

## 📚 Documentação Completa

Para documentação detalhada com todos os campos, validações e exemplos de frontend, veja:
- 📄 `/docs/USERS_MANAGEMENT.md`
