# 🧪 Exemplos Práticos - Testando com Dados do Seed

Este guia mostra como testar todos os endpoints usando os dados criados pelo seed.

---

## 📋 Dados Disponíveis no Seed

### 👥 Usuários (senha: `senha123` para todos)

| Email | Empresas | Roles |
|-------|----------|-------|
| admin@example.com | 3 empresas | admin (todas) |
| gerente@example.com | 2 empresas | manager |
| vendedor@example.com | 1 empresa | sales |
| viewer@example.com | 1 empresa | viewer |

### 🏢 Empresas

| Nome Fantasia | CNPJ | Razão Social |
|---------------|------|--------------|
| Empresa Alpha | 11222333000144 | Empresa Alpha Comércio Ltda |
| Empresa Beta | 55666777000188 | Empresa Beta Serviços e Comércio Ltda |
| Empresa Gamma | 99888777000199 | Empresa Gamma Tecnologia Ltda |

### 🎭 Roles

| Nome | Descrição | Permissões |
|------|-----------|------------|
| admin | Administrador | Todas |
| manager | Gerente | Gestão (sem delete) |
| sales | Vendedor | Vendas |
| viewer | Visualizador | Apenas leitura |

---

## 🚀 Passo a Passo Completo

### 1️⃣ Login como Admin

```bash
# Fazer login
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "senha123"
  }' | jq

# Salvar a resposta para pegar IDs
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "senha123"
  }' > login_admin.json

# Extrair token
TOKEN=$(jq -r '.access_token' login_admin.json)
echo "Token: $TOKEN"

# Extrair IDs das empresas
EMPRESA_1=$(jq -r '.companies[0].id' login_admin.json)
EMPRESA_2=$(jq -r '.companies[1].id' login_admin.json)
EMPRESA_3=$(jq -r '.companies[2].id' login_admin.json)

echo "Empresa 1: $EMPRESA_1"
echo "Empresa 2: $EMPRESA_2"
echo "Empresa 3: $EMPRESA_3"

# Extrair IDs das roles
ADMIN_ROLE=$(jq -r '.companies[0].role.id' login_admin.json)
echo "Admin Role ID: $ADMIN_ROLE"
```

### 2️⃣ Listar Todos os Usuários

```bash
# Ver todos os 4 usuários do seed
curl http://localhost:4000/users/all \
  -H "Authorization: Bearer $TOKEN" | jq

# Com formatação bonita
curl -s http://localhost:4000/users/all \
  -H "Authorization: Bearer $TOKEN" | jq '.data[] | {name, email, active, empresas: ._count.companies}'
```

**Resultado Esperado:**
```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "active": true,
  "empresas": 3
}
{
  "name": "Gerente User",
  "email": "gerente@example.com",
  "active": true,
  "empresas": 2
}
{
  "name": "Vendedor User",
  "email": "vendedor@example.com",
  "active": true,
  "empresas": 1
}
{
  "name": "Viewer User",
  "email": "viewer@example.com",
  "active": true,
  "empresas": 1
}
```

### 3️⃣ Listar Usuários da Empresa 1

```bash
# Ver todos os usuários da Empresa Alpha
curl http://localhost:4000/users/company/$EMPRESA_1 \
  -H "Authorization: Bearer $TOKEN" | jq

# Apenas nomes e roles
curl -s http://localhost:4000/users/company/$EMPRESA_1 \
  -H "Authorization: Bearer $TOKEN" | \
  jq '.data[] | {nome: .name, email: .email, role: .companies[0].role.name}'
```

### 4️⃣ Criar Novo Usuário

```bash
# Criar novo usuário
curl -X POST http://localhost:4000/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste.usuario@example.com",
    "name": "Usuário de Teste",
    "password": "senha123",
    "active": true
  }' | jq

# Salvar resposta
curl -X POST http://localhost:4000/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste.usuario@example.com",
    "name": "Usuário de Teste",
    "password": "senha123",
    "active": true
  }' > novo_usuario.json

# Extrair ID do novo usuário
NOVO_USER_ID=$(jq -r '.id' novo_usuario.json)
echo "Novo usuário ID: $NOVO_USER_ID"
```

### 5️⃣ Buscar Detalhes do Novo Usuário

```bash
# Ver detalhes completos
curl http://localhost:4000/users/$NOVO_USER_ID \
  -H "Authorization: Bearer $TOKEN" | jq

# Note que ele ainda não tem empresas vinculadas
```

### 6️⃣ Vincular Usuário à Empresa 1

```bash
# Vincular como Manager
curl -X POST http://localhost:4000/users/$NOVO_USER_ID/companies \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": "'$EMPRESA_1'",
    "roleId": "'$ADMIN_ROLE'",
    "active": true
  }' | jq

# Verificar vínculo
curl http://localhost:4000/users/$NOVO_USER_ID \
  -H "Authorization: Bearer $TOKEN" | \
  jq '.companies[] | {empresa: .company.nomeFantasia, role: .role.name}'
```

### 7️⃣ Login com Novo Usuário

```bash
# Fazer login com o novo usuário
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste.usuario@example.com",
    "password": "senha123"
  }' | jq

# Ver suas empresas
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste.usuario@example.com",
    "password": "senha123"
  }' > login_novo_usuario.json

TOKEN_NOVO=$(jq -r '.access_token' login_novo_usuario.json)

# Buscar próprias empresas
curl http://localhost:4000/users/me/companies \
  -H "Authorization: Bearer $TOKEN_NOVO" | jq
```

### 8️⃣ Vincular a Mais Empresas

```bash
# Voltar como admin
# Vincular à Empresa 2 como Sales
curl -X POST http://localhost:4000/users/$NOVO_USER_ID/companies \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": "'$EMPRESA_2'",
    "roleId": "sales-role-uuid",
    "active": true
  }' | jq

# Vincular à Empresa 3 como Viewer
curl -X POST http://localhost:4000/users/$NOVO_USER_ID/companies \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": "'$EMPRESA_3'",
    "roleId": "viewer-role-uuid",
    "active": true
  }' | jq

# Ver todas as empresas do usuário
curl http://localhost:4000/users/$NOVO_USER_ID/companies \
  -H "Authorization: Bearer $TOKEN" | \
  jq '.[] | {empresa: .nomeFantasia, role: .role.name}'
```

### 9️⃣ Buscar por Filtros

```bash
# Buscar usuários ativos
curl "http://localhost:4000/users/all?active=true" \
  -H "Authorization: Bearer $TOKEN" | \
  jq '.data | length'

# Buscar por nome
curl "http://localhost:4000/users/all?search=Admin" \
  -H "Authorization: Bearer $TOKEN" | \
  jq '.data[] | .name'

# Buscar por email
curl "http://localhost:4000/users/all?search=gerente" \
  -H "Authorization: Bearer $TOKEN" | \
  jq '.data[] | .email'

# Usuários da Empresa 1 com role específica
curl "http://localhost:4000/users/company/$EMPRESA_1?roleId=$ADMIN_ROLE" \
  -H "Authorization: Bearer $TOKEN" | \
  jq '.data | length'
```

### 🔟 Atualizar Dados do Usuário

```bash
# Atualizar nome
curl -X PATCH http://localhost:4000/users/$NOVO_USER_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Usuário de Teste ATUALIZADO"
  }' | jq

# Alterar email
curl -X PATCH http://localhost:4000/users/$NOVO_USER_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "novo.email@example.com"
  }' | jq

# Alterar senha
curl -X PATCH http://localhost:4000/users/$NOVO_USER_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "password": "novaSenha123"
  }' | jq
```

### 1️⃣1️⃣ Alterar Role em uma Empresa

```bash
# Promover de Sales para Admin na Empresa 2
curl -X PATCH http://localhost:4000/users/$NOVO_USER_ID/companies/$EMPRESA_2/role \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "roleId": "'$ADMIN_ROLE'"
  }' | jq

# Verificar mudança
curl http://localhost:4000/users/$NOVO_USER_ID/companies \
  -H "Authorization: Bearer $TOKEN" | \
  jq '.[] | select(.id == "'$EMPRESA_2'") | {empresa: .nomeFantasia, role: .role.name}'
```

### 1️⃣2️⃣ Desativar Usuário

```bash
# Alternar status
curl -X PATCH http://localhost:4000/users/$NOVO_USER_ID/toggle-active \
  -H "Authorization: Bearer $TOKEN" | jq

# Verificar
curl http://localhost:4000/users/$NOVO_USER_ID \
  -H "Authorization: Bearer $TOKEN" | jq '.active'

# Ativar novamente
curl -X PATCH http://localhost:4000/users/$NOVO_USER_ID/toggle-active \
  -H "Authorization: Bearer $TOKEN" | jq
```

### 1️⃣3️⃣ Remover de uma Empresa

```bash
# Remover da Empresa 3
curl -X DELETE http://localhost:4000/users/$NOVO_USER_ID/companies/$EMPRESA_3 \
  -H "Authorization: Bearer $TOKEN"

# Verificar
curl http://localhost:4000/users/$NOVO_USER_ID/companies \
  -H "Authorization: Bearer $TOKEN" | jq 'length'
```

### 1️⃣4️⃣ Listar Usuários Inativos

```bash
# Ver todos os inativos
curl "http://localhost:4000/users/all?active=false" \
  -H "Authorization: Bearer $TOKEN" | jq

# Inativos de uma empresa
curl "http://localhost:4000/users/company/$EMPRESA_1?active=false" \
  -H "Authorization: Bearer $TOKEN" | jq
```

### 1️⃣5️⃣ Paginação

```bash
# Primeira página (2 itens)
curl "http://localhost:4000/users/all?limit=2&page=1" \
  -H "Authorization: Bearer $TOKEN" | jq '.meta'

# Segunda página
curl "http://localhost:4000/users/all?limit=2&page=2" \
  -H "Authorization: Bearer $TOKEN" | jq '.meta'

# Terceira página
curl "http://localhost:4000/users/all?limit=2&page=3" \
  -H "Authorization: Bearer $TOKEN" | jq '.meta'
```

---

## 🎯 Cenários de Teste Completos

### Cenário 1: Onboarding de Novo Funcionário

```bash
# 1. Admin cria o usuário
curl -X POST http://localhost:4000/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao.silva@example.com",
    "name": "João Silva",
    "password": "senha123"
  }' | jq -r '.id' > joao_id.txt

JOAO_ID=$(cat joao_id.txt)

# 2. Vincular à empresa como Manager
curl -X POST http://localhost:4000/users/$JOAO_ID/companies \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": "'$EMPRESA_1'",
    "roleId": "manager-role-uuid"
  }' | jq

# 3. João faz primeiro login
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao.silva@example.com",
    "password": "senha123"
  }' | jq '.companies[] | {empresa: .nomeFantasia, role: .role.name}'

# 4. Admin verifica que João está ativo
curl http://localhost:4000/users/company/$EMPRESA_1 \
  -H "Authorization: Bearer $TOKEN" | \
  jq '.data[] | select(.email == "joao.silva@example.com") | {name, active, role: .companies[0].role.name}'
```

### Cenário 2: Promoção de Funcionário

```bash
# 1. Ver role atual
curl http://localhost:4000/users/$JOAO_ID \
  -H "Authorization: Bearer $TOKEN" | \
  jq '.companies[] | {empresa: .company.nomeFantasia, role: .role.name}'

# 2. Promover para Admin
curl -X PATCH http://localhost:4000/users/$JOAO_ID/companies/$EMPRESA_1/role \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "roleId": "'$ADMIN_ROLE'"
  }' | jq

# 3. João faz login e vê novas permissões
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao.silva@example.com",
    "password": "senha123"
  }' | jq '.companies[0].role.permissions | length'
```

### Cenário 3: Transferência Entre Empresas

```bash
# 1. Usuário está na Empresa 1
curl http://localhost:4000/users/$JOAO_ID/companies \
  -H "Authorization: Bearer $TOKEN" | jq

# 2. Adicionar à Empresa 2
curl -X POST http://localhost:4000/users/$JOAO_ID/companies \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": "'$EMPRESA_2'",
    "roleId": "manager-role-uuid"
  }' | jq

# 3. Remover da Empresa 1
curl -X DELETE http://localhost:4000/users/$JOAO_ID/companies/$EMPRESA_1 \
  -H "Authorization: Bearer $TOKEN"

# 4. Verificar empresas finais
curl http://localhost:4000/users/$JOAO_ID/companies \
  -H "Authorization: Bearer $TOKEN" | \
  jq '.[] | .nomeFantasia'
```

### Cenário 4: Auditoria - Quem tem acesso à Empresa X?

```bash
# Listar todos com acesso à Empresa 1
curl http://localhost:4000/users/company/$EMPRESA_1 \
  -H "Authorization: Bearer $TOKEN" | \
  jq '.data[] | {
    nome: .name,
    email: .email,
    role: .companies[0].role.name,
    ativo: .active
  }'

# Apenas admins da empresa
curl "http://localhost:4000/users/company/$EMPRESA_1?roleId=$ADMIN_ROLE" \
  -H "Authorization: Bearer $TOKEN" | \
  jq '.data | length'
```

---

## 📊 Visualização dos Dados

### Ver Todos os Usuários e Suas Empresas

```bash
curl -s http://localhost:4000/users/all \
  -H "Authorization: Bearer $TOKEN" | \
  jq -r '.data[] | "\(.name) (\(.email)) - \(._count.companies) empresas - Status: \(if .active then "Ativo" else "Inativo" end)"'
```

### Ver Estrutura de uma Empresa

```bash
curl -s http://localhost:4000/users/company/$EMPRESA_1 \
  -H "Authorization: Bearer $TOKEN" | \
  jq -r '
    "Empresa: \(.company.nomeFantasia)\n" +
    "Total de usuários: \(.meta.total)\n" +
    "\nUsuários:\n" +
    (.data[] | "- \(.name) (\(.companies[0].role.name))")
  '
```

---

## 🧹 Cleanup (Opcional)

```bash
# Deletar usuário de teste (soft delete)
curl -X DELETE http://localhost:4000/users/$NOVO_USER_ID \
  -H "Authorization: Bearer $TOKEN"

# Verificar que foi desativado
curl "http://localhost:4000/users/all?active=false" \
  -H "Authorization: Bearer $TOKEN" | \
  jq '.data[] | select(.email == "teste.usuario@example.com") | {name, email, active}'
```

---

## 💡 Dicas Úteis

### 1. Salvar Token em Variável de Ambiente

```bash
# Adicione ao ~/.zshrc ou ~/.bashrc
export ERP_TOKEN=$(curl -s -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "senha123"}' | jq -r '.access_token')

# Depois use:
curl http://localhost:4000/users/all -H "Authorization: Bearer $ERP_TOKEN"
```

### 2. Criar Aliases

```bash
# Adicione ao ~/.zshrc ou ~/.bashrc
alias erp-login='curl -s -X POST http://localhost:4000/auth/login -H "Content-Type: application/json"'
alias erp-users='curl -s http://localhost:4000/users/all -H "Authorization: Bearer $ERP_TOKEN"'
alias erp-company='curl -s http://localhost:4000/users/company'

# Use:
erp-login -d '{"email": "admin@example.com", "password": "senha123"}' | jq
erp-users | jq
erp-company/uuid -H "Authorization: Bearer $ERP_TOKEN" | jq
```

### 3. Script Completo de Teste

```bash
#!/bin/bash
# teste_usuarios.sh

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Testando API de Usuários${NC}\n"

# Login
echo -e "${GREEN}1. Fazendo login...${NC}"
TOKEN=$(curl -s -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "senha123"}' | jq -r '.access_token')
echo "Token obtido: ${TOKEN:0:20}..."

# Listar usuários
echo -e "\n${GREEN}2. Listando todos os usuários...${NC}"
curl -s http://localhost:4000/users/all \
  -H "Authorization: Bearer $TOKEN" | \
  jq -r '.data[] | "- \(.name) (\(.email))"'

# Criar usuário
echo -e "\n${GREEN}3. Criando novo usuário...${NC}"
USER_ID=$(curl -s -X POST http://localhost:4000/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email": "teste@example.com", "name": "Teste", "password": "senha123"}' | \
  jq -r '.id')
echo "Usuário criado: $USER_ID"

echo -e "\n${BLUE}✅ Testes concluídos!${NC}"
```

Salve como `teste_usuarios.sh`, dê permissão de execução e execute:
```bash
chmod +x teste_usuarios.sh
./teste_usuarios.sh
```

---

## 📚 Referências

- 📖 Documentação completa: `docs/USERS_MANAGEMENT.md`
- 🚀 Guia rápido: `docs/USERS_QUICKSTART.md`
- 📊 Resumo: `docs/USERS_IMPLEMENTATION_SUMMARY.md`
