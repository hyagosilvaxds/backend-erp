# Sistema de Cargos e Departamentos

## Visão Geral

O sistema de Cargos e Departamentos permite a gestão estruturada de cargos e departamentos na empresa, possibilitando vincular colaboradores a cargos específicos e organizar a hierarquia departamental.

## Características Principais

### Cargos (Positions)
- **Código único**: Cada cargo possui um código único dentro da empresa
- **Faixa salarial**: Definição de salário mínimo e máximo para o cargo
- **CBO**: Código Brasileiro de Ocupações para conformidade legal
- **Status ativo/inativo**: Controle de cargos disponíveis
- **Validações**: 
  - Não permite código duplicado
  - Não permite exclusão se houver colaboradores vinculados
  - Retorna contagem de colaboradores por cargo

### Departamentos (Departments)
- **Código único**: Cada departamento possui um código único dentro da empresa
- **Hierarquia**: Suporte a departamentos pais e sub-departamentos
- **Gestor**: Possibilidade de vincular um colaborador como gestor do departamento
- **Status ativo/inativo**: Controle de departamentos disponíveis
- **Validações**:
  - Não permite código duplicado
  - Não permite exclusão se houver colaboradores ou sub-departamentos vinculados
  - Previne referências circulares na hierarquia
  - Departamento não pode ser pai de si mesmo

## Estrutura do Banco de Dados

### Tabela: positions
```sql
CREATE TABLE positions (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  min_salary DECIMAL(15,2),
  max_salary DECIMAL(15,2),
  cbo VARCHAR(10),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(company_id, code)
);
```

### Tabela: departments
```sql
CREATE TABLE departments (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  parent_id UUID,
  manager_id UUID,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(company_id, code),
  FOREIGN KEY (parent_id) REFERENCES departments(id),
  FOREIGN KEY (manager_id) REFERENCES employees(id)
);
```

### Atualização na Tabela: employees
```sql
ALTER TABLE employees 
  DROP COLUMN position,
  DROP COLUMN department,
  ADD COLUMN position_id UUID,
  ADD COLUMN department_id UUID,
  ADD FOREIGN KEY (position_id) REFERENCES positions(id),
  ADD FOREIGN KEY (department_id) REFERENCES departments(id);
```

## API Endpoints

### Cargos (Positions)

#### Criar Cargo
```http
POST /positions
Authorization: Bearer {token}
Permissions: positions.create

Body:
{
  "code": "DEV-SR",
  "name": "Desenvolvedor Sênior",
  "description": "Desenvolvedor com mais de 5 anos de experiência",
  "minSalary": 8000.00,
  "maxSalary": 15000.00,
  "cbo": "2124-05",
  "active": true
}

Response: 201 Created
{
  "id": "uuid",
  "companyId": "uuid",
  "code": "DEV-SR",
  "name": "Desenvolvedor Sênior",
  "description": "Desenvolvedor com mais de 5 anos de experiência",
  "minSalary": 8000.00,
  "maxSalary": 15000.00,
  "cbo": "2124-05",
  "active": true,
  "_count": {
    "employees": 0
  },
  "createdAt": "2025-01-08T00:00:00.000Z",
  "updatedAt": "2025-01-08T00:00:00.000Z"
}
```

#### Listar Cargos
```http
GET /positions?active=true
Authorization: Bearer {token}
Permissions: positions.read

Response: 200 OK
[
  {
    "id": "uuid",
    "code": "DEV-SR",
    "name": "Desenvolvedor Sênior",
    "minSalary": 8000.00,
    "maxSalary": 15000.00,
    "_count": {
      "employees": 5
    }
  }
]
```

#### Buscar Cargo por ID
```http
GET /positions/{id}
Authorization: Bearer {token}
Permissions: positions.read

Response: 200 OK
{
  "id": "uuid",
  "code": "DEV-SR",
  "name": "Desenvolvedor Sênior",
  "employees": [
    {
      "id": "uuid",
      "name": "João Silva",
      "email": "joao@empresa.com",
      "status": "ACTIVE"
    }
  ],
  "_count": {
    "employees": 5
  }
}
```

#### Atualizar Cargo
```http
PATCH /positions/{id}
Authorization: Bearer {token}
Permissions: positions.update

Body:
{
  "name": "Desenvolvedor Sênior Full Stack",
  "maxSalary": 18000.00
}

Response: 200 OK
```

#### Excluir Cargo
```http
DELETE /positions/{id}
Authorization: Bearer {token}
Permissions: positions.delete

Response: 200 OK
{
  "message": "Position deleted successfully"
}

Error: 400 Bad Request (se houver colaboradores)
{
  "message": "Cannot delete position with 5 employees. Please reassign employees first."
}
```

### Departamentos (Departments)

#### Criar Departamento
```http
POST /departments
Authorization: Bearer {token}
Permissions: departments.create

Body:
{
  "code": "TI",
  "name": "Tecnologia da Informação",
  "description": "Departamento de TI",
  "parentId": null,
  "managerId": "employee-uuid",
  "active": true
}

Response: 201 Created
```

#### Criar Sub-Departamento
```http
POST /departments
Authorization: Bearer {token}
Permissions: departments.create

Body:
{
  "code": "TI-DEV",
  "name": "Desenvolvimento",
  "description": "Equipe de desenvolvimento",
  "parentId": "ti-department-uuid",
  "managerId": "manager-uuid",
  "active": true
}

Response: 201 Created
```

#### Listar Departamentos
```http
GET /departments?active=true
Authorization: Bearer {token}
Permissions: departments.read

Response: 200 OK
[
  {
    "id": "uuid",
    "code": "TI",
    "name": "Tecnologia da Informação",
    "parent": null,
    "_count": {
      "employees": 15,
      "children": 3
    }
  }
]
```

#### Buscar Departamento por ID
```http
GET /departments/{id}
Authorization: Bearer {token}
Permissions: departments.read

Response: 200 OK
{
  "id": "uuid",
  "code": "TI",
  "name": "Tecnologia da Informação",
  "parent": null,
  "children": [
    {
      "id": "uuid",
      "code": "TI-DEV",
      "name": "Desenvolvimento",
      "_count": {
        "employees": 10
      }
    }
  ],
  "employees": [
    {
      "id": "uuid",
      "name": "João Silva",
      "position": {
        "name": "Desenvolvedor Sênior"
      }
    }
  ],
  "_count": {
    "employees": 15,
    "children": 3
  }
}
```

#### Atualizar Departamento
```http
PATCH /departments/{id}
Authorization: Bearer {token}
Permissions: departments.update

Body:
{
  "name": "Tecnologia e Inovação",
  "managerId": "new-manager-uuid"
}

Response: 200 OK

Error: 400 Bad Request (referência circular)
{
  "message": "Circular reference detected: parent department cannot be a child of this department"
}
```

#### Excluir Departamento
```http
DELETE /departments/{id}
Authorization: Bearer {token}
Permissions: departments.delete

Response: 200 OK
{
  "message": "Department deleted successfully"
}

Error: 400 Bad Request (colaboradores vinculados)
{
  "message": "Cannot delete department with 15 employees. Please reassign employees first."
}

Error: 400 Bad Request (sub-departamentos)
{
  "message": "Cannot delete department with 3 sub-departments. Please reassign or delete sub-departments first."
}
```

## Integração com Colaboradores

### Criar Colaborador com Cargo e Departamento
```http
POST /employees
Authorization: Bearer {token}

Body:
{
  "name": "Maria Santos",
  "cpf": "12345678900",
  "email": "maria@empresa.com",
  "positionId": "position-uuid",
  "departmentId": "department-uuid",
  "admissionDate": "2025-01-08",
  "contractType": "CLT",
  "salary": 10000.00
}
```

### Atualizar Cargo/Departamento do Colaborador
```http
PATCH /employees/{id}
Authorization: Bearer {token}

Body:
{
  "positionId": "new-position-uuid",
  "departmentId": "new-department-uuid"
}
```

## Permissões

### Cargos
- `positions.create` - Criar novos cargos
- `positions.read` - Visualizar cargos
- `positions.update` - Editar cargos
- `positions.delete` - Excluir cargos

### Departamentos
- `departments.create` - Criar novos departamentos
- `departments.read` - Visualizar departamentos
- `departments.update` - Editar departamentos
- `departments.delete` - Excluir departamentos

## Exemplos de Uso

### Estrutura Hierárquica de Departamentos
```
Empresa
├── TI (Tecnologia da Informação)
│   ├── TI-DEV (Desenvolvimento)
│   │   ├── TI-DEV-FE (Frontend)
│   │   └── TI-DEV-BE (Backend)
│   ├── TI-INF (Infraestrutura)
│   └── TI-SEC (Segurança)
├── RH (Recursos Humanos)
│   ├── RH-REC (Recrutamento)
│   └── RH-DP (Departamento Pessoal)
└── FIN (Financeiro)
    ├── FIN-CONT (Contabilidade)
    └── FIN-TES (Tesouraria)
```

### Estrutura de Cargos
```
Área de Desenvolvimento:
- DEV-JR: Desenvolvedor Júnior (R$ 3.000 - R$ 5.000)
- DEV-PL: Desenvolvedor Pleno (R$ 5.000 - R$ 8.000)
- DEV-SR: Desenvolvedor Sênior (R$ 8.000 - R$ 15.000)
- TECH-LEAD: Tech Lead (R$ 12.000 - R$ 20.000)

Área de RH:
- ANALISTA-RH-JR: Analista de RH Júnior (R$ 2.500 - R$ 4.000)
- ANALISTA-RH-SR: Analista de RH Sênior (R$ 4.500 - R$ 7.000)
- COORD-RH: Coordenador de RH (R$ 7.000 - R$ 10.000)
```

## Validações e Regras de Negócio

### Cargos
1. ✅ Código único por empresa
2. ✅ Não permite deletar cargo com colaboradores vinculados
3. ✅ Salário mínimo não pode ser maior que salário máximo (validação no frontend)
4. ✅ Lista de cargos mostra contagem de colaboradores
5. ✅ Busca de cargo individual mostra lista de colaboradores

### Departamentos
1. ✅ Código único por empresa
2. ✅ Não permite deletar departamento com colaboradores vinculados
3. ✅ Não permite deletar departamento com sub-departamentos
4. ✅ Previne referências circulares na hierarquia
5. ✅ Departamento não pode ser pai de si mesmo
6. ✅ ParentId e managerId devem existir e pertencer à mesma empresa
7. ✅ Lista de departamentos mostra contagem de colaboradores e sub-departamentos
8. ✅ Busca de departamento individual mostra:
   - Departamento pai
   - Sub-departamentos
   - Colaboradores vinculados com seus cargos

## Migration

A migration `20251108234850_add_positions_and_departments` foi aplicada com sucesso e criou:
- Tabela `positions`
- Tabela `departments`
- Alterou tabela `employees` (removeu campos String, adicionou FKs)

## Seeds

Para criar as permissões necessárias:
```bash
npx ts-node prisma/seeds/create-positions-permissions.ts
npx ts-node prisma/seeds/create-departments-permissions.ts
```

## Próximos Passos

1. ✅ Criar interface frontend para cadastro de cargos
2. ✅ Criar interface frontend para cadastro de departamentos
3. ✅ Atualizar formulário de colaboradores para usar selects de cargo/departamento
4. ✅ Criar relatório de organograma da empresa
5. ✅ Adicionar filtros por cargo/departamento na listagem de colaboradores

## Notas Técnicas

- Os campos `positionId` e `departmentId` são opcionais no Employee
- A migration preserva dados existentes (campos String foram removidos apenas no schema)
- Colaboradores existentes ficarão com `positionId` e `departmentId` null até serem atualizados
- Recomenda-se criar um script de migração de dados para converter strings antigas para IDs
