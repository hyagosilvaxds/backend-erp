# 🏢 Gerenciamento de Empresas

## Visão Geral

O sistema permite o cadastro e gerenciamento de múltiplas empresas. Cada empresa pode ter vários usuários com diferentes roles e permissões.

## Permissões de Empresas

### Permissões Disponíveis

- `companies.create` - Criar novas empresas
- `companies.read` - Visualizar empresas
- `companies.update` - Atualizar informações de empresas
- `companies.delete` - Deletar empresas

### Regras de Acesso

#### SuperAdmin
- **Acesso Total**: Pode criar, visualizar, editar e deletar qualquer empresa
- **Não precisa de header x-company-id**: Tem acesso a todas as empresas do sistema
- **Role-Based**: Sempre tem todas as permissões automaticamente

#### Admin e Outras Roles
- **Acesso Limitado**: Só pode visualizar e gerenciar empresas às quais está vinculado
- **Permissões Editáveis**: As permissões são baseadas nas atribuições da role
- **Precisa ter permissão específica**: Para criar empresas, precisa da permissão `companies.create`

## Endpoints da API

### 1. Criar Empresa

**POST** `/companies`

**Headers:**
```http
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Empresa Teste Ltda",
  "cnpj": "12345678901234",
  "active": true
}
```

**Validações:**
- `name`: String, 3-100 caracteres, obrigatório
- `cnpj`: String, exatamente 14 dígitos, apenas números, obrigatório e único
- `active`: Boolean, opcional (padrão: true)

**Resposta de Sucesso (201):**
```json
{
  "id": "uuid",
  "name": "Empresa Teste Ltda",
  "cnpj": "12345678901234",
  "active": true,
  "createdAt": "2025-10-24T10:00:00.000Z",
  "updatedAt": "2025-10-24T10:00:00.000Z"
}
```

**Erros Possíveis:**
- `400` - Validação falhou
- `401` - Não autenticado
- `403` - Sem permissão `companies.create`
- `409` - CNPJ já cadastrado

---

### 2. Listar Empresas

**GET** `/companies`

**Headers:**
```http
Authorization: Bearer {token}
```

**Comportamento:**
- **SuperAdmin**: Retorna todas as empresas do sistema
- **Outros usuários**: Retorna apenas as empresas às quais o usuário tem acesso

**Resposta de Sucesso (200):**
```json
[
  {
    "id": "uuid",
    "name": "Empresa Alpha",
    "cnpj": "11222333000144",
    "active": true,
    "createdAt": "2025-10-24T10:00:00.000Z",
    "updatedAt": "2025-10-24T10:00:00.000Z",
    "_count": {
      "users": 5
    },
    "userRole": "admin"  // Apenas para usuários não-superadmin
  }
]
```

---

### 3. Buscar Empresa por ID

**GET** `/companies/:id`

**Headers:**
```http
Authorization: Bearer {token}
```

**Resposta de Sucesso (200):**
```json
{
  "id": "uuid",
  "name": "Empresa Alpha",
  "cnpj": "11222333000144",
  "active": true,
  "createdAt": "2025-10-24T10:00:00.000Z",
  "updatedAt": "2025-10-24T10:00:00.000Z",
  "users": [
    {
      "id": "uuid",
      "userId": "uuid",
      "companyId": "uuid",
      "roleId": "uuid",
      "active": true,
      "user": {
        "id": "uuid",
        "name": "João Silva",
        "email": "joao@example.com",
        "active": true
      },
      "role": {
        "id": "uuid",
        "name": "admin",
        "description": "Administrador do sistema"
      }
    }
  ]
}
```

**Erros Possíveis:**
- `401` - Não autenticado
- `403` - Usuário não tem acesso a esta empresa
- `404` - Empresa não encontrada

---

### 4. Atualizar Empresa

**PATCH** `/companies/:id`

**Headers:**
```http
Authorization: Bearer {token}
x-company-id: {companyId}  // Obrigatório para não-superadmin
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Empresa Alpha Updated",
  "cnpj": "11222333000144",
  "active": true
}
```

**Validações:**
- Todos os campos são opcionais
- Se `cnpj` for alterado, será validado se já não existe

**Resposta de Sucesso (200):**
```json
{
  "id": "uuid",
  "name": "Empresa Alpha Updated",
  "cnpj": "11222333000144",
  "active": true,
  "createdAt": "2025-10-24T10:00:00.000Z",
  "updatedAt": "2025-10-24T10:00:00.000Z"
}
```

**Erros Possíveis:**
- `401` - Não autenticado
- `403` - Sem permissão ou sem acesso à empresa
- `404` - Empresa não encontrada
- `409` - CNPJ já cadastrado

---

### 5. Ativar/Desativar Empresa

**PATCH** `/companies/:id/toggle-active`

**Headers:**
```http
Authorization: Bearer {token}
x-company-id: {companyId}  // Obrigatório para não-superadmin
```

**Comportamento:**
- Inverte o estado `active` da empresa
- **Apenas SuperAdmin** pode executar esta ação

**Resposta de Sucesso (200):**
```json
{
  "id": "uuid",
  "name": "Empresa Alpha",
  "cnpj": "11222333000144",
  "active": false,
  "createdAt": "2025-10-24T10:00:00.000Z",
  "updatedAt": "2025-10-24T10:00:00.000Z"
}
```

**Erros Possíveis:**
- `401` - Não autenticado
- `403` - Apenas SuperAdmin pode executar esta ação
- `404` - Empresa não encontrada

---

### 6. Deletar Empresa

**DELETE** `/companies/:id`

**Headers:**
```http
Authorization: Bearer {token}
x-company-id: {companyId}  // Obrigatório para não-superadmin
```

**Comportamento:**
- **Apenas SuperAdmin** pode deletar empresas
- Deleta a empresa e todos os vínculos com usuários (cascade)

**Resposta de Sucesso (200):**
```json
{
  "id": "uuid",
  "name": "Empresa Alpha",
  "cnpj": "11222333000144",
  "active": true,
  "createdAt": "2025-10-24T10:00:00.000Z",
  "updatedAt": "2025-10-24T10:00:00.000Z"
}
```

**Erros Possíveis:**
- `401` - Não autenticado
- `403` - Apenas SuperAdmin pode deletar empresas
- `404` - Empresa não encontrada

---

## Exemplos de Uso

### Exemplo 1: SuperAdmin criando uma empresa

```bash
curl -X POST http://localhost:3000/companies \
  -H "Authorization: Bearer {superadmin_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nova Empresa Ltda",
    "cnpj": "98765432109876"
  }'
```

### Exemplo 2: Admin com permissão criando uma empresa

```bash
curl -X POST http://localhost:3000/companies \
  -H "Authorization: Bearer {admin_token}" \
  -H "x-company-id: {company_id}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Filial Norte",
    "cnpj": "11223344556677"
  }'
```

### Exemplo 3: Listando empresas (SuperAdmin)

```bash
curl -X GET http://localhost:3000/companies \
  -H "Authorization: Bearer {superadmin_token}"
```

### Exemplo 4: Listando empresas (Usuário comum)

```bash
curl -X GET http://localhost:3000/companies \
  -H "Authorization: Bearer {user_token}"
```

### Exemplo 5: Atualizando uma empresa

```bash
curl -X PATCH http://localhost:3000/companies/{company_id} \
  -H "Authorization: Bearer {token}" \
  -H "x-company-id: {company_id}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Empresa Renomeada"
  }'
```

---

## Fluxo de Trabalho Recomendado

### Para SuperAdmin

1. Fazer login
2. Criar empresas conforme necessário
3. Adicionar usuários às empresas (via endpoints de usuários)
4. Gerenciar roles e permissões

### Para Admin com Permissão

1. Fazer login
2. Selecionar empresa no contexto (x-company-id)
3. Criar novas empresas/filiais se tiver permissão
4. Gerenciar usuários da sua empresa

### Para Usuários Comuns

1. Fazer login
2. Listar empresas disponíveis
3. Selecionar empresa para trabalhar
4. Realizar operações conforme permissões

---

## Validação de CNPJ

O sistema valida que:
- CNPJ tenha exatamente 14 caracteres
- CNPJ contenha apenas números
- CNPJ seja único no sistema

**Nota**: O sistema não valida a estrutura do dígito verificador do CNPJ. Para produção, recomenda-se adicionar essa validação.

---

## Considerações de Segurança

1. **SuperAdmin**: Role especial que sempre tem todas as permissões
2. **Header x-company-id**: Obrigatório para usuários não-superadmin em rotas protegidas
3. **Validação de Acesso**: Usuários só podem acessar empresas às quais estão vinculados
4. **Cascade Delete**: Ao deletar uma empresa, todos os vínculos são removidos automaticamente

---

## Próximos Passos

Após criar empresas, você pode:

1. Vincular usuários às empresas
2. Atribuir roles aos usuários nas empresas
3. Gerenciar permissões das roles (exceto superadmin)
4. Criar módulos específicos de cada empresa (produtos, vendas, etc.)
