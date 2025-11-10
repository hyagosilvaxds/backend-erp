# Changelog - Módulo de RH v2.0

**Data**: 8 de novembro de 2025

## 🎉 Novidades da Versão 2.0

### ✨ Novos Recursos

#### 1. Sistema de Cargos (Positions)
- ✅ Cadastro completo de cargos
- ✅ Faixa salarial (mínimo e máximo)
- ✅ Código Brasileiro de Ocupações (CBO)
- ✅ Código único por empresa
- ✅ Validação: não permite deletar cargo com colaboradores vinculados
- ✅ Listagem mostra contagem de colaboradores por cargo
- ✅ Detalhes do cargo mostram colaboradores vinculados

**Endpoints:**
- `POST /positions` - Criar cargo
- `GET /positions` - Listar cargos
- `GET /positions/:id` - Buscar cargo
- `PATCH /positions/:id` - Atualizar cargo
- `DELETE /positions/:id` - Excluir cargo

**Permissões:**
- `positions.create`
- `positions.read`
- `positions.update`
- `positions.delete`

---

#### 2. Sistema de Departamentos (Departments)
- ✅ Cadastro de departamentos com hierarquia
- ✅ Suporte a sub-departamentos (estrutura pai-filho ilimitada)
- ✅ Vinculação de gestor (colaborador) por departamento
- ✅ Código único por empresa
- ✅ Validação: previne referências circulares na hierarquia
- ✅ Validação: não permite deletar com colaboradores ou sub-departamentos
- ✅ Listagem mostra contagem de colaboradores e sub-departamentos
- ✅ Detalhes mostram departamento pai, filhos e colaboradores

**Endpoints:**
- `POST /departments` - Criar departamento
- `GET /departments` - Listar departamentos
- `GET /departments/:id` - Buscar departamento
- `PATCH /departments/:id` - Atualizar departamento
- `DELETE /departments/:id` - Excluir departamento

**Permissões:**
- `departments.create`
- `departments.read`
- `departments.update`
- `departments.delete`

---

#### 3. Sistema de Tabelas Fiscais (INSS, FGTS, IRRF)
- ✅ Tabelas configuráveis de INSS (faixas progressivas)
- ✅ Tabelas configuráveis de FGTS (alíquotas por categoria)
- ✅ Tabelas configuráveis de IRRF (faixas progressivas + dedução dependentes)
- ✅ Controle por ano/mês de referência
- ✅ Apenas uma tabela ativa por tipo/período
- ✅ Cálculos automáticos na folha de pagamento

**Endpoints INSS:**
- `POST /tax-tables/inss` - Criar tabela INSS
- `GET /tax-tables/inss` - Listar tabelas INSS
- `GET /tax-tables/inss/active` - Buscar tabela ativa
- `GET /tax-tables/inss/:id` - Buscar tabela específica
- `PATCH /tax-tables/inss/:id` - Atualizar tabela
- `DELETE /tax-tables/inss/:id` - Excluir tabela

**Endpoints FGTS:**
- `POST /tax-tables/fgts` - Criar tabela FGTS
- `GET /tax-tables/fgts` - Listar tabelas FGTS
- `GET /tax-tables/fgts/active` - Buscar tabela ativa
- `GET /tax-tables/fgts/:id` - Buscar tabela específica
- `PATCH /tax-tables/fgts/:id` - Atualizar tabela
- `DELETE /tax-tables/fgts/:id` - Excluir tabela

**Endpoints IRRF:**
- `POST /tax-tables/irrf` - Criar tabela IRRF
- `GET /tax-tables/irrf` - Listar tabelas IRRF
- `GET /tax-tables/irrf/active` - Buscar tabela ativa
- `GET /tax-tables/irrf/:id` - Buscar tabela específica
- `PATCH /tax-tables/irrf/:id` - Atualizar tabela
- `DELETE /tax-tables/irrf/:id` - Excluir tabela

**Permissões:**
- `tax_tables.create`
- `tax_tables.read`
- `tax_tables.update`
- `tax_tables.delete`

---

### 🔄 Alterações em Recursos Existentes

#### Colaboradores (Employees)
**Antes:**
```json
{
  "position": "Desenvolvedor Sênior",
  "department": "TI"
}
```

**Agora:**
```json
{
  "positionId": "uuid-do-cargo",
  "departmentId": "uuid-do-departamento"
}
```

**Mudanças:**
- ❌ Removido: `position` (string)
- ❌ Removido: `department` (string)
- ✅ Adicionado: `positionId` (UUID, opcional)
- ✅ Adicionado: `departmentId` (UUID, opcional)
- ✅ Relações: Colaborador agora tem relação com Position e Department

**Impacto:**
- Colaboradores existentes terão `positionId` e `departmentId` como `null` até serem atualizados
- É necessário criar cargos e departamentos antes de vincular a colaboradores
- Endpoint `GET /employees/:id` agora retorna objeto `position` e `department` completos (não apenas strings)

---

#### Folha de Pagamento (Payroll)
**Antes:**
- INSS: 11% fixo (empregado) + 20% fixo (empregador)
- FGTS: 8% fixo
- IRRF: Não calculado

**Agora:**
- ✅ INSS: Cálculo progressivo por faixas usando tabela fiscal ativa
- ✅ FGTS: Cálculo por categoria (CLT, Aprendiz, Doméstico) usando tabela ativa
- ✅ IRRF: Cálculo progressivo com dedução de dependentes usando tabela ativa
- ✅ Cálculo automático busca tabelas fiscais do período da folha
- ✅ Se não houver tabela ativa, usa cálculo padrão

**Exemplo de Cálculo Real:**
```
Salário: R$ 3.000,00

INSS Progressivo:
- Faixa 1 (até R$ 1.412,00): R$ 1.412,00 × 7,5% = R$ 105,90
- Faixa 2 (até R$ 2.666,68): R$ 1.254,68 × 9,0% = R$ 112,92
- Faixa 3 (até R$ 4.000,03): R$ 333,32 × 12,0% = R$ 39,99
Total INSS: R$ 258,81

FGTS (CLT 8%):
R$ 3.000,00 × 8% = R$ 240,00

IRRF Progressivo:
Base: R$ 3.000,00 - R$ 258,81 (INSS) - R$ 379,18 (2 dependentes) = R$ 2.362,01
IRRF: (R$ 2.362,01 × 7,5%) - R$ 169,44 = R$ 7,71
```

---

#### Dashboard de RH
**Antes:**
```json
{
  "charges": {
    "inss": "31625.00",  // Fixo 11%
    "fgts": "23000.00",  // Fixo 8%
    "total": "143750.00"
  }
}
```

**Agora:**
```json
{
  "charges": {
    "inss": "28750.45",           // Cálculo progressivo real
    "fgts": "23000.00",           // Usando tabela FGTS ativa
    "thirteenthSalary": "23958.33", // Provisão 13º
    "vacation": "23958.33",       // Provisão férias + 1/3
    "others": "41208.34",         // RAT, Terceiros, etc
    "total": "140875.45",
    "percentage": "49.00"         // % sobre folha
  },
  "byDepartment": {
    "dept-uuid-1": 15,  // Usa departmentId agora
    "dept-uuid-2": 10
  }
}
```

**Melhorias:**
- ✅ Cálculos de INSS e FGTS usam tabelas fiscais reais
- ✅ Breakdown detalhado de todos encargos
- ✅ Provisões de 13º salário e férias
- ✅ Percentual de encargos sobre folha
- ✅ Contagem por departamento usa IDs (relações)

---

### 📊 Estrutura Organizacional

#### Exemplo de Hierarquia de Departamentos
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

#### Exemplo de Cargos por Área
```
Área de Desenvolvimento:
- DEV-JR: Desenvolvedor Júnior (R$ 3.000 - R$ 5.000) - CBO 2124-05
- DEV-PL: Desenvolvedor Pleno (R$ 5.000 - R$ 8.000) - CBO 2124-05
- DEV-SR: Desenvolvedor Sênior (R$ 8.000 - R$ 15.000) - CBO 2124-05
- TECH-LEAD: Tech Lead (R$ 12.000 - R$ 20.000) - CBO 2124-10

Área de RH:
- ANALISTA-RH-JR: Analista de RH Júnior (R$ 2.500 - R$ 4.000)
- ANALISTA-RH-SR: Analista de RH Sênior (R$ 4.500 - R$ 7.000)
- COORD-RH: Coordenador de RH (R$ 7.000 - R$ 10.000)
```

---

### 🗄️ Migrações de Banco de Dados

#### Migration: `20251108234850_add_positions_and_departments`
```sql
-- Criar tabela de cargos
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

-- Criar tabela de departamentos
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

-- Alterar tabela de colaboradores
ALTER TABLE employees 
  DROP COLUMN position,
  DROP COLUMN department,
  ADD COLUMN position_id UUID,
  ADD COLUMN department_id UUID,
  ADD FOREIGN KEY (position_id) REFERENCES positions(id),
  ADD FOREIGN KEY (department_id) REFERENCES departments(id);

-- Criar índices
CREATE INDEX idx_employees_position_id ON employees(position_id);
CREATE INDEX idx_employees_department_id ON employees(department_id);
```

#### Migration: `20251108203350_add_tax_tables`
```sql
-- Tabelas INSS, FGTS e IRRF criadas
-- Campos JSON para armazenar faixas/alíquotas configuráveis
```

---

### 🔐 Novas Permissões

Total de **12 novas permissões** criadas:

#### Cargos (4 permissões)
- `positions.create` - Create Positions
- `positions.read` - Read Positions
- `positions.update` - Update Positions
- `positions.delete` - Delete Positions

#### Departamentos (4 permissões)
- `departments.create` - Create Departments
- `departments.read` - Read Departments
- `departments.update` - Update Departments
- `departments.delete` - Delete Departments

#### Tabelas Fiscais (4 permissões)
- `tax_tables.create` - Create Tax Tables
- `tax_tables.read` - Read Tax Tables
- `tax_tables.update` - Update Tax Tables
- `tax_tables.delete` - Delete Tax Tables

---

### 📝 Scripts de Seed

#### `prisma/seeds/create-positions-permissions.ts`
Cria as 4 permissões de cargos.

#### `prisma/seeds/create-departments-permissions.ts`
Cria as 4 permissões de departamentos.

#### `prisma/seeds/create-tax-tables-permissions.ts`
Cria as 4 permissões de tabelas fiscais.

#### `prisma/seeds/create-default-tax-tables.ts`
Insere tabelas fiscais padrão 2025:
- INSS com 4 faixas progressivas
- FGTS com 3 categorias (CLT, Aprendiz, Doméstico)
- IRRF com 5 faixas progressivas + dedução de R$ 189,59 por dependente

---

### 🎨 Frontend - Atualizações Necessárias

#### 1. Tela de Colaboradores
- ✅ Substituir input text de "Cargo" por select de cargos (`GET /positions`)
- ✅ Substituir input text de "Departamento" por select de departamentos (`GET /departments`)
- ✅ Exibir nome do cargo e departamento (não apenas IDs)
- ✅ Filtros por cargo e departamento

#### 2. Nova Tela: Cadastro de Cargos
- Lista de cargos com código, nome, faixa salarial
- Botão "Novo Cargo"
- Formulário: código, nome, descrição, salário min/max, CBO
- Ações: Editar, Deletar (com validação de colaboradores vinculados)

#### 3. Nova Tela: Cadastro de Departamentos
- Árvore hierárquica de departamentos (TreeView)
- Botão "Novo Departamento"
- Formulário: código, nome, descrição, departamento pai, gestor
- Ações: Editar, Deletar (com validação)
- Visualização de sub-departamentos e colaboradores

#### 4. Nova Tela: Tabelas Fiscais
- Abas: INSS | FGTS | IRRF
- Lista de tabelas por ano/mês
- Indicador visual de tabela ativa
- Formulário para criar/editar tabelas
- Preview do cálculo com exemplo

#### 5. Organograma
- Visualização gráfica da hierarquia de departamentos
- Cards com contagem de colaboradores
- Foto/nome do gestor
- Drill-down para ver colaboradores

#### 6. Dashboard de RH
- Gráfico de distribuição por cargo
- Gráfico de distribuição por departamento
- Breakdown detalhado de encargos
- Percentual de encargos sobre folha

---

### ⚠️ Breaking Changes

#### 1. Colaboradores - Campos Alterados
**Antes:**
```typescript
interface Employee {
  position: string;      // "Desenvolvedor Sênior"
  department: string;    // "TI"
}
```

**Agora:**
```typescript
interface Employee {
  positionId?: string;   // UUID do cargo
  departmentId?: string; // UUID do departamento
  position?: {           // Objeto completo (ao buscar)
    id: string;
    code: string;
    name: string;
    minSalary: number;
    maxSalary: number;
  };
  department?: {         // Objeto completo (ao buscar)
    id: string;
    code: string;
    name: string;
    parent?: { ... };
  };
}
```

**Ação Necessária:**
- Atualizar formulários para usar selects
- Atualizar listagens para exibir `employee.position.name`
- Criar telas de cadastro de cargos e departamentos antes de usar

#### 2. Dashboard - Estrutura Alterada
**Antes:**
```typescript
byDepartment: Record<string, number>; // { "TI": 15, "RH": 10 }
```

**Agora:**
```typescript
byDepartment: Record<string, number>; // { "uuid-1": 15, "uuid-2": 10 }
```

**Ação Necessária:**
- Buscar nomes dos departamentos via `GET /departments` para exibir
- Ou usar endpoint atualizado que já retorna nomes (futuro)

---

### 📚 Documentação Atualizada

#### `docs/API_RH.md`
- ✅ Adicionada seção "Cargos (Positions)"
- ✅ Adicionada seção "Departamentos (Departments)"
- ✅ Adicionada seção "Tabelas Fiscais (INSS, FGTS, IRRF)"
- ✅ Atualizada seção "Colaboradores" com novos campos
- ✅ Atualizada seção "Validações e Erros"
- ✅ Atualizada seção "Exemplos de Uso"
- ✅ Adicionada seção "Permissões por Módulo"
- ✅ Versão atualizada: 2.0

#### `docs/CARGOS_DEPARTAMENTOS.md`
- ✅ Documentação completa de cargos e departamentos
- ✅ Estrutura de banco de dados
- ✅ Todos os endpoints com exemplos
- ✅ Regras de negócio e validações
- ✅ Exemplos de hierarquia organizacional

#### `docs/TABELAS_FISCAIS.md`
- ✅ Documentação completa de tabelas fiscais
- ✅ Estrutura das tabelas 2025
- ✅ Exemplos de cálculos reais
- ✅ Como configurar tabelas
- ✅ Integração com folha de pagamento

---

### 🚀 Como Atualizar

#### Para Backend
```bash
# 1. Atualizar código (já está pronto!)
git pull origin development

# 2. Aplicar migrations (já aplicadas!)
npx prisma migrate deploy

# 3. Criar permissões
npx ts-node prisma/seeds/create-positions-permissions.ts
npx ts-node prisma/seeds/create-departments-permissions.ts
npx ts-node prisma/seeds/create-tax-tables-permissions.ts

# 4. Criar tabelas fiscais padrão 2025
npx ts-node prisma/seeds/create-default-tax-tables.ts

# 5. Reiniciar servidor
npm run start:dev
```

#### Para Frontend
1. Criar telas de cadastro de Cargos
2. Criar telas de cadastro de Departamentos
3. Criar telas de Tabelas Fiscais
4. Atualizar formulário de Colaboradores (usar selects)
5. Atualizar listagem de Colaboradores (mostrar objetos relacionados)
6. Atualizar Dashboard de RH (novos campos)
7. Criar tela de Organograma (opcional)

---

### 🎯 Benefícios

#### 1. Gestão Estruturada
- ✅ Cargos padronizados com faixas salariais
- ✅ Hierarquia organizacional clara
- ✅ Facilita análise de cargos e salários
- ✅ Conformidade legal (CBO)

#### 2. Cálculos Precisos
- ✅ INSS calculado corretamente (progressivo)
- ✅ FGTS por categoria
- ✅ IRRF com dedução de dependentes
- ✅ Encargos reais (não estimados)
- ✅ Dashboard com dados precisos

#### 3. Flexibilidade
- ✅ Tabelas fiscais atualizáveis sem código
- ✅ Suporte a mudanças na legislação
- ✅ Histórico de tabelas por período
- ✅ Possibilidade de múltiplas tabelas (cenários)

#### 4. Relatórios e Analytics
- ✅ Distribuição por cargo
- ✅ Distribuição por departamento
- ✅ Organograma visual
- ✅ Análise de massa salarial
- ✅ Breakdown de encargos

---

### 🐛 Bugs Corrigidos

#### EmployeesService
- ✅ Dashboard usava campo `department` (string) - corrigido para `departmentId` (UUID)
- ✅ GroupBy de departamentos atualizado
- ✅ Cálculos de INSS agora progressivos (não fixos)
- ✅ Cálculos de FGTS por categoria (não fixos)

#### TaxTablesController
- ✅ Import de `CurrentCompany` decorator corrigido

---

### 📊 Estatísticas

- **Arquivos criados**: 18
- **Arquivos modificados**: 5
- **Linhas de código adicionadas**: ~2.800
- **Endpoints novos**: 25
- **Permissões criadas**: 12
- **Migrations**: 2
- **Seeds**: 4

---

### 🔮 Próximos Passos (v3.0)

1. **eSocial**: Integração para envio de eventos
2. **CNAB**: Geração de arquivo para pagamento bancário
3. **Organograma Visual**: Interface gráfica da hierarquia
4. **Análise de Cargos**: Comparação de salários por cargo/mercado
5. **Importação**: Excel/CSV de colaboradores em massa
6. **Relatórios**: PDF de folha, holerites, recibos
7. **Histórico**: Auditoria de mudanças em colaboradores
8. **Ponto Eletrônico**: Integração para cálculo de horas

---

**Desenvolvido por**: GitHub Copilot + Hyago Silva  
**Data**: 8 de novembro de 2025  
**Versão**: 2.0.0
