# ERP Multi-Empresa - Backend

Sistema de autenticação para ERP multi-empresa construído com NestJS e Prisma.

## 📋 Características

- ✅ Autenticação JWT
- ✅ Multi-empresa (um usuário pode ter acesso a várias empresas)
- ✅ Sistema de roles dinâmicas (Admin, Manager, Sales, Viewer)
- ✅ Sistema de permissões granulares por recurso e ação
- ✅ Guards de autenticação e autorização
- ✅ Banco de dados PostgreSQL com Prisma ORM

## 🏗️ Estrutura do Banco de Dados

### Modelos Principais:

- **User**: Usuários do sistema
- **Company**: Empresas cadastradas
- **UserCompany**: Relacionamento entre usuários e empresas (com role)
- **Role**: Papéis/funções (admin, manager, sales, viewer)
- **Permission**: Permissões granulares (resource + action)
- **RolePermission**: Relacionamento entre roles e permissões

## 🚀 Como Executar

### 1. Instalar dependências

\`\`\`bash
npm install
\`\`\`

### 2. Configurar variáveis de ambiente

Copie o arquivo \`.env.example\` para \`.env\` e configure suas variáveis:

\`\`\`bash
cp .env.example .env
\`\`\`

Edite o arquivo \`.env\` com suas configurações de banco de dados.

### 3. Executar migrações do Prisma

\`\`\`bash
npm run prisma:generate
npm run prisma:migrate
\`\`\`

### 4. Popular banco de dados (seed)

\`\`\`bash
npm run prisma:seed
\`\`\`

### 5. Iniciar o servidor

\`\`\`bash
# Desenvolvimento
npm run start:dev

# Produção
npm run build
npm run start:prod
\`\`\`

A aplicação estará rodando em \`http://localhost:3000\`

## 👥 Usuários de Teste

Após executar o seed, você terá os seguintes usuários disponíveis (senha: \`senha123\`):

| Email                   | Role    | Empresas              | Descrição                    |
| ----------------------- | ------- | --------------------- | ---------------------------- |
| admin@example.com       | Admin   | Alpha, Beta, Gamma    | Admin com acesso total       |
| gerente@example.com     | Manager | Alpha, Beta           | Gerente em duas empresas     |
| vendedor@example.com    | Sales   | Alpha                 | Vendedor em uma empresa      |
| viewer@example.com      | Viewer  | Gamma                 | Visualizador em uma empresa  |

## 🔐 Autenticação

### Login

\`\`\`bash
POST /auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "senha123"
}
\`\`\`

### Header de Empresa

Para rotas protegidas por permissões, é necessário enviar o header \`x-company-id\`:

\`\`\`bash
GET /users
Authorization: Bearer {access_token}
x-company-id: {company_uuid}
\`\`\`

## 🔒 Sistema de Permissões

### Estrutura de Permissões

Cada permissão segue o padrão: \`resource.action\`

Exemplos:
- \`users.create\` - Criar usuários
- \`users.read\` - Visualizar usuários
- \`products.read\` - Visualizar produtos
- \`sales.create\` - Criar vendas

### Roles e Permissões

| Role    | Permissões                                                                 |
| ------- | -------------------------------------------------------------------------- |
| Admin   | Todas as permissões                                                        |
| Manager | Tudo exceto deletar usuários e vendas                                      |
| Sales   | Criar, ler, atualizar e deletar vendas; Visualizar produtos                |
| Viewer  | Apenas visualizar (read) em todos os recursos                              |

## 📦 Tecnologias Utilizadas

- **NestJS** - Framework Node.js
- **Prisma** - ORM
- **PostgreSQL** - Banco de dados
- **JWT** - Autenticação
- **Passport** - Middleware de autenticação
- **bcrypt** - Hash de senhas
- **class-validator** - Validação de DTOs
