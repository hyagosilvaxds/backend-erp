# 🏢 ERP Multi-Empresa - Backend

Sistema de autenticação para ERP multi-empresa desenvolvido com NestJS, Prisma e PostgreSQL.

## 📋 Características

- ✅ Autenticação JWT
- 🏢 Multi-empresa (usuários podem acessar múltiplas empresas)
- 👥 Sistema de Roles (papéis) dinâmicos
- 🔐 Sistema de Permissões granulares por recurso e ação
- � Role SuperAdmin especial (role-based, sempre todas as permissões)
- �🔒 Guards personalizados para controle de acesso
- 🏢 Gerenciamento completo de empresas
- 📊 Banco de dados PostgreSQL com Prisma ORM

## 🏗️ Arquitetura

### Modelos do Banco de Dados

- **User**: Usuários do sistema
- **Company**: Empresas cadastradas
- **UserCompany**: Relacionamento usuário-empresa com role associada
- **Role**: Papéis (superadmin, admin, manager, sales, viewer)
- **Permission**: Permissões granulares (resource + action)
- **RolePermission**: Relacionamento role-permissão

### Sistema de Permissões

As permissões seguem o padrão `resource.action`:

- **users**: create, read, update, delete
- **companies**: create, read, update, delete
- **products**: create, read, update, delete
- **sales**: create, read, update, delete
- **reports**: read

### Roles Padrão

1. **SuperAdmin**: Acesso total ao sistema (role-based, sempre todas as permissões)
2. **Admin**: Acesso total a recursos (permissões editáveis)
3. **Manager**: Leitura, criação e atualização (permissões editáveis)
4. **Sales**: Acesso a vendas e visualização de produtos (permissões editáveis)
5. **Viewer**: Apenas visualização (permissões editáveis)

## 🚀 Instalação e Configuração

### Pré-requisitos

- Node.js 18+
- PostgreSQL (via Docker ou instalação local)
- npm ou yarn

### 1. Configurar o Banco de Dados

```bash
# Criar container Docker com PostgreSQL
docker run -d \
  --name erp-postgres \
  -e POSTGRES_USER=erp_user \
  -e POSTGRES_PASSWORD=erp_pass \
  -e POSTGRES_DB=erp_db \
  -p 5432:5432 \
  -v erp_pgdata:/var/lib/postgresql/data \
  postgres:17
```

### 2. Instalar Dependências

```bash
npm install
```

### 3. Configurar Variáveis de Ambiente

O arquivo `.env` já está configurado:

```env
DATABASE_URL="postgresql://erp_user:erp_pass@localhost:5432/erp_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
PORT=3000
```

### 4. Executar Migrations e Seed

```bash
# Gerar Prisma Client
npm run prisma:generate

# Executar migrations
npm run prisma:migrate

# Popular banco de dados
npm run prisma:seed
```

### 5. Iniciar o Servidor

```bash
# Modo desenvolvimento
npm run start:dev

# Modo produção
npm run build
npm run start:prod
```

## 👥 Usuários de Teste

Após executar o seed, você terá os seguintes usuários (senha: `senha123`):

| Email | Role | Empresas | Descrição |
|-------|------|----------|-----------|
| superadmin@example.com | SuperAdmin | 3 | **Acesso total (role-based)** - sempre todas as permissões |
| admin@example.com | Admin | 3 | Acesso completo a todas as empresas (permissões editáveis) |
| gerente@example.com | Manager | 2 | Gerente em Empresa Alpha e Beta |
| vendedor@example.com | Sales | 1 | Vendedor na Empresa Alpha |
| viewer@example.com | Viewer | 1 | Visualizador na Empresa Gamma |

### Empresas Criadas

1. **Empresa Alpha** - CNPJ: 11222333000144
2. **Empresa Beta** - CNPJ: 55666777000188
3. **Empresa Gamma** - CNPJ: 99888777000199

## 🔐 Usando a API

### 1. Autenticação (Login)

```bash
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "senha123"
}
```

**Resposta:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": "uuid",
    "email": "admin@example.com",
    "name": "Admin Geral",
    "companies": [
      {
        "companyId": "uuid",
        "companyName": "Empresa Alpha",
        "companyCnpj": "11222333000144",
        "role": {
          "id": "uuid",
          "name": "admin",
          "description": "Administrador do sistema"
        },
        "permissions": [
          {
            "id": "uuid",
            "name": "users.create",
            "resource": "users",
            "action": "create"
          },
          // ... todas as permissões
        ]
      }
    ]
  }
}
```

### 2. Obter Perfil do Usuário

```bash
GET http://localhost:3000/auth/profile
Authorization: Bearer {access_token}
```

### 3. Acessar Recursos Protegidos

Para acessar recursos protegidos, é necessário:
1. Incluir o token JWT no header `Authorization`
2. Incluir o ID da empresa no header `x-company-id`

```bash
GET http://localhost:3000/users
Authorization: Bearer {access_token}
x-company-id: {company_id}
```

## 🛡️ Proteção de Rotas

### Exemplo de Controller Protegido

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser, CurrentCompany } from '../auth/decorators/current-user.decorator';

@Controller('products')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ProductsController {
  
  @Get()
  @RequirePermissions('products.read')
  async findAll(
    @CurrentUser() user: any,
    @CurrentCompany() company: any
  ) {
    // user contém: userId, email, name
    // company contém: id, role, permissions[]
    return this.productsService.findAll(company.id);
  }

  @Post()
  @RequirePermissions('products.create')
  async create(@Body() createDto: CreateProductDto) {
    return this.productsService.create(createDto);
  }
}
```

## 📁 Estrutura do Projeto

```
backend-erp/
├── prisma/
│   ├── migrations/         # Migrations do banco
│   ├── schema.prisma       # Schema do Prisma
│   └── seed.ts            # Seed com dados iniciais
├── src/
│   ├── auth/              # Módulo de autenticação
│   │   ├── decorators/    # Decorators customizados
│   │   ├── dto/           # Data Transfer Objects
│   │   ├── guards/        # Guards de autenticação e permissão
│   │   ├── interfaces/    # Interfaces TypeScript
│   │   ├── strategies/    # Estratégias Passport
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   ├── prisma/            # Módulo Prisma
│   │   ├── prisma.service.ts
│   │   └── prisma.module.ts
│   ├── users/             # Módulo de usuários (exemplo)
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── users.module.ts
│   ├── app.module.ts
│   └── main.ts
├── .env                   # Variáveis de ambiente
├── .env.example           # Exemplo de variáveis
├── package.json
└── README.md
```

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run start:dev          # Inicia em modo watch

# Produção
npm run build              # Compila o projeto
npm run start:prod         # Inicia em produção

# Prisma
npm run prisma:generate    # Gera Prisma Client
npm run prisma:migrate     # Executa migrations
npm run prisma:seed        # Popula banco de dados

# Testes
npm run test               # Executa testes
npm run test:watch         # Testes em modo watch
npm run test:cov           # Testes com coverage
```

## � Documentação Adicional

- [Autenticação Frontend](docs/FRONTEND_AUTH.md) - Guia completo de integração para frontend
- [Sistema de Roles e Permissões](docs/ROLES_PERMISSIONS.md) - Detalhes sobre o sistema de permissões
- [Gerenciamento de Empresas](docs/COMPANIES.md) - API de empresas
- [Exemplos de Requisições](api-requests.http) - Arquivo HTTP com exemplos prontos

## �🔒 Segurança

- Senhas são hasheadas com bcrypt (salt rounds: 10)
- JWT expira em 24 horas
- Validação de entrada com class-validator
- Guards de autenticação e autorização
- **SuperAdmin**: Role especial com acesso total (role-based)
- Verificação de empresa ativa antes de conceder acesso
- Header `x-company-id` obrigatório para contexto de empresa

## 🎯 Regras de Negócio

### SuperAdmin

- **Acesso Total**: Pode acessar e gerenciar todas as empresas
- **Role-Based**: Sempre tem todas as permissões automaticamente
- **Não precisa de header x-company-id**: Tem contexto global
- **Criação de Empresas**: Pode criar empresas sem restrições
- **Deleção**: Único que pode deletar empresas

### Outras Roles (Admin, Manager, Sales, Viewer)

- **Acesso Limitado**: Só pode acessar empresas às quais está vinculado
- **Permissões Editáveis**: As permissões podem ser alteradas
- **Header x-company-id obrigatório**: Deve especificar o contexto da empresa
- **Criação de Empresas**: Precisa da permissão `companies.create`

## 📝 Próximos Passos

- [ ] Implementar refresh tokens
- [ ] Adicionar auditoria (logs de ações)
- [ ] Implementar rate limiting
- [ ] Adicionar recuperação de senha
- [ ] Implementar convites para novos usuários
- [ ] Criar dashboard de administração
- [ ] Adicionar mais módulos (produtos, vendas, etc.)
- [ ] Implementar gerenciamento de roles e permissões via API

## 📚 Tecnologias

- [NestJS](https://nestjs.com/) - Framework Node.js
- [Prisma](https://www.prisma.io/) - ORM
- [PostgreSQL](https://www.postgresql.org/) - Banco de dados
- [JWT](https://jwt.io/) - Autenticação
- [Passport](http://www.passportjs.org/) - Estratégias de autenticação
- [bcrypt](https://github.com/kelektiv/node.bcrypt.js) - Hash de senhas
- [class-validator](https://github.com/typestack/class-validator) - Validação

## 📄 Licença

UNLICENSED - Projeto privado

---

Desenvolvido com ❤️ para sistemas ERP multi-empresa
