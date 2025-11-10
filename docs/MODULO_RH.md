# 👥 Módulo de RH (Recursos Humanos)

**Data**: 6 de novembro de 2025  
**Versão**: 1.0

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Modelos de Dados](#modelos-de-dados)
3. [Permissões](#permissões)
4. [Próximos Passos](#próximos-passos)

---

## 🎯 Visão Geral

Módulo completo para gerenciamento de Recursos Humanos com:

### ✅ Funcionalidades Implementadas

- **Colaboradores (Employees)**: Cadastro completo de funcionários com dados pessoais, profissionais, contratuais e bancários
- **Centros de Custo**: Estrutura hierárquica de centros e subcentros de custo
- **Tipos de Proventos**: Criação personalizada de proventos (salário, hora extra, adicional noturno, etc.)
- **Tipos de Descontos**: Criação personalizada de descontos (INSS, IRRF, vale transporte, etc.)
- **Proventos de Colaboradores**: Vinculação de proventos específicos por colaborador
- **Folha de Pagamento**: Gestão de folhas mensais, diárias, semanais e adiantamentos
- **Cálculo Automático**: Suporte para cálculo automático de folha com proventos e descontos
- **Aprovação de Folha**: Workflow de aprovação de folhas de pagamento

---

## 📊 Modelos de Dados

### 1. Employee (Colaborador)

Cadastro completo de colaboradores com:

#### Dados Pessoais
- Nome completo
- CPF (único por empresa)
- RG
- Data de nascimento
- Gênero: MALE, FEMALE, OTHER
- Estado civil: SINGLE, MARRIED, DIVORCED, WIDOWED, OTHER

#### Dados de Contato
- Email
- Telefone
- Celular

#### Endereço Completo
- CEP, logradouro, número, complemento
- Bairro, cidade, estado

#### Dados Profissionais
- Cargo
- Departamento
- Data de admissão
- Data de demissão (opcional)
- Vinculação a Centro de Custo

#### Dados Contratuais
- Tipo de contrato: CLT, PJ, ESTAGIO, TEMPORARIO, AUTONOMO
- Jornada de trabalho
- Salário base

#### Dados de Empresa (para PJ)
- CNPJ da empresa
- Razão Social
- Nome Fantasia
- Inscrição Estadual
- Inscrição Municipal
- Email da empresa
- Telefone da empresa
- Endereço completo da empresa (CEP, logradouro, número, complemento, bairro, cidade, estado)

#### Dados Bancários
- Código e nome do banco
- Agência e conta
- Tipo de conta: CORRENTE, POUPANCA
- Chave PIX

---

### 2. EmployeeDocument (Documento de Colaborador)

Gestão de documentos vinculados a colaboradores:

#### Informações do Documento
- **Tipo de Documento**: RG, CPF, CNH, CTPS, TITULO_ELEITOR, CERTIFICADO_RESERVISTA, 
  COMPROVANTE_RESIDENCIA, DIPLOMA, CERTIFICADO, CONTRATO, EXAME_ADMISSIONAL, 
  ASO, ATESTADO, CONTRATO_SOCIAL, CNPJ, ALVARA, OUTROS
- **Nome**: Nome/título do documento
- **Descrição**: Detalhes adicionais
- **Número do Documento**: Número de identificação (se aplicável)
- **Data de Emissão**: Data em que foi emitido
- **Data de Validade**: Data de expiração (se aplicável)

#### Arquivo
- **URL do arquivo**: Link para o arquivo armazenado
- **Nome do arquivo**: Nome original do arquivo
- **Tamanho**: Tamanho em bytes
- **Tipo MIME**: Formato do arquivo (PDF, JPG, PNG, etc)

#### Status
- **Verificado**: Se o documento foi validado
- **Ativo**: Se o documento está ativo
- **Observações**: Notas adicionais

#### Auditoria
- **Enviado por**: Usuário que fez upload
- **Data de criação**
- **Data de atualização**

**Tipos de Documentos Suportados**:
- **Documentos Pessoais**: RG, CPF, CNH, Título de Eleitor, Certificado de Reservista
- **Documentos Trabalhistas**: CTPS, Contrato de Trabalho, Exame Admissional, ASO
- **Documentos Acadêmicos**: Diploma, Certificados
- **Documentos de Empresa (PJ)**: Contrato Social, Cartão CNPJ, Alvará, Inscrições
- **Outros**: Comprovante de Residência, Atestados, etc

---

### 3. CostCenter (Centro de Custo)

Estrutura hierárquica para organização de custos:

- **Código**: Identificador único (ex: "001", "001.001")
- **Nome**: Nome descritivo
- **Descrição**: Detalhes adicionais
- **Tipo**: REVENUE (receita), EXPENSE (despesa), INVESTMENT (investimento)
- **Hierarquia**: Suporte a centros pai e subcentros
- **Colaboradores**: Vinculação de funcionários ao centro

**Exemplo de Hierarquia**:
```
001 - Administrativo
  001.001 - Financeiro
  001.002 - RH
002 - Operacional
  002.001 - Produção
  002.002 - Logística
```

---

### 4. EarningType (Tipo de Provento)

Cadastro de tipos de proventos personalizáveis:

- **Código**: Identificador único
- **Nome**: Descrição do provento
- **Configurações**:
  - Recorrente: Se aparece todo mês automaticamente
  - Percentual: Se é percentual sobre o salário
  - Valor base: Valor fixo padrão
- **Incidências**:
  - INSS
  - FGTS
  - IRRF

**Exemplos de Proventos**:
- Salário Base
- Hora Extra 50%
- Hora Extra 100%
- Adicional Noturno
- Adicional Periculosidade
- Adicional Insalubridade
- Comissões
- Bonificações
- 13º Salário
- Férias

---

### 5. DeductionType (Tipo de Desconto)

Cadastro de tipos de descontos personalizáveis:

- **Código**: Identificador único
- **Nome**: Descrição do desconto
- **Configurações**:
  - Recorrente: Se é descontado todo mês
  - Percentual: Se é percentual sobre o salário
  - Valor fixo: Valor padrão

**Exemplos de Descontos**:
- INSS
- IRRF
- Vale Transporte
- Vale Refeição
- Vale Alimentação
- Plano de Saúde
- Plano Odontológico
- Pensão Alimentícia
- Empréstimo Consignado
- Faltas/Atrasos

---

### 6. EmployeeEarning (Provento do Colaborador)

Vinculação de proventos específicos a colaboradores:

- **Tipo de provento**: Referência ao EarningType
- **Recorrente**: Se repete mensalmente
- **Valor**: Valor específico (pode sobrescrever o padrão)
- **Percentual**: Percentual específico
- **Período**: Data de início e fim (opcional)

**Exemplo**: 
- Colaborador João Silva tem "Adicional Noturno" de R$ 500,00 recorrente desde 01/01/2025

---

### 7. Payroll (Folha de Pagamento)

Gestão de folhas de pagamento:

#### Tipos de Folha
- **MONTHLY**: Mensal
- **DAILY**: Diária
- **WEEKLY**: Semanal
- **ADVANCE**: Adiantamento

#### Status
- **DRAFT**: Rascunho (em edição)
- **CALCULATED**: Calculada (pronta para revisão)
- **APPROVED**: Aprovada (aguardando pagamento)
- **PAID**: Paga (concluída)

#### Dados
- Mês e ano de referência
- Período (data início e fim)
- Data de pagamento
- Totais automáticos:
  - Total de proventos
  - Total de descontos
  - Valor líquido

#### Auditoria
- Criador
- Aprovador
- Data de aprovação

---

### 7. PayrollItem (Item da Folha)

Detalhe por colaborador na folha:

- **Colaborador**: Referência ao Employee
- **Salário base**: Salário do período
- **Dias trabalhados**: Quantidade de dias
- **Proventos**: Array JSON com todos os proventos
  ```json
  [
    { "typeId": "uuid", "code": "SALARY", "name": "Salário Base", "value": 3000 },
    { "typeId": "uuid", "code": "OVERTIME", "name": "Hora Extra 50%", "value": 450 }
  ]
  ```
- **Descontos**: Array JSON com todos os descontos
  ```json
  [
    { "typeId": "uuid", "code": "INSS", "name": "INSS", "value": 300 },
    { "typeId": "uuid", "code": "IRRF", "name": "IRRF", "value": 150 }
  ]
  ```
- **Totais**:
  - Total de proventos
  - Total de descontos
  - Valor líquido a pagar

---

## 🔐 Permissões

### Permissões Criadas (26 total)

#### Colaboradores (4)
- ✅ `employees.create` - Criar colaborador
- ✅ `employees.read` - Visualizar colaboradores
- ✅ `employees.update` - Atualizar colaborador
- ✅ `employees.delete` - Deletar colaborador

#### Centros de Custo (4)
- ✅ `cost_centers.create` - Criar centro de custo
- ✅ `cost_centers.read` - Visualizar centros de custo
- ✅ `cost_centers.update` - Atualizar centro de custo
- ✅ `cost_centers.delete` - Deletar centro de custo

#### Tipos de Proventos (4)
- ✅ `earning_types.create` - Criar tipo de provento
- ✅ `earning_types.read` - Visualizar tipos de proventos
- ✅ `earning_types.update` - Atualizar tipo de provento
- ✅ `earning_types.delete` - Deletar tipo de provento

#### Tipos de Descontos (4)
- ✅ `deduction_types.create` - Criar tipo de desconto
- ✅ `deduction_types.read` - Visualizar tipos de descontos
- ✅ `deduction_types.update` - Atualizar tipo de desconto
- ✅ `deduction_types.delete` - Deletar tipo de desconto

#### Proventos de Colaboradores (4)
- ✅ `employee_earnings.create` - Adicionar provento ao colaborador
- ✅ `employee_earnings.read` - Visualizar proventos de colaboradores
- ✅ `employee_earnings.update` - Atualizar provento de colaborador
- ✅ `employee_earnings.delete` - Remover provento de colaborador

#### Folha de Pagamento (6)
- ✅ `payroll.create` - Criar folha de pagamento
- ✅ `payroll.read` - Visualizar folhas de pagamento
- ✅ `payroll.calculate` - Calcular folha de pagamento
- ✅ `payroll.approve` - Aprovar folha de pagamento
- ✅ `payroll.update` - Atualizar folha de pagamento
- ✅ `payroll.delete` - Deletar folha de pagamento

### Vinculação de Permissões

**Role Admin**: Todas as 26 permissões  
**Role Manager**: 6 permissões de leitura apenas

---

## 🚀 Próximos Passos

### 1. Criar Módulos NestJS

Será necessário criar os seguintes módulos:

#### A. EmployeesModule
```
src/employees/
├── employees.module.ts
├── employees.controller.ts
├── employees.service.ts
└── dto/
    ├── create-employee.dto.ts
    ├── update-employee.dto.ts
    └── query-employees.dto.ts
```

**Endpoints Sugeridos**:
- POST `/employees` - Criar colaborador
- GET `/employees` - Listar colaboradores (com filtros e paginação)
- GET `/employees/stats` - Estatísticas (total, ativos, por departamento, etc.)
- GET `/employees/:id` - Buscar por ID
- PATCH `/employees/:id` - Atualizar
- DELETE `/employees/:id` - Deletar
- PATCH `/employees/:id/toggle-active` - Ativar/Desativar
- POST `/employees/:id/earnings` - Adicionar provento
- GET `/employees/:id/earnings` - Listar proventos
- DELETE `/employees/:id/earnings/:earningId` - Remover provento

#### B. CostCentersModule (Opcional - pode reutilizar o existente)
```
src/cost-centers/
├── cost-centers.module.ts
├── cost-centers.controller.ts
├── cost-centers.service.ts
└── dto/
    ├── create-cost-center.dto.ts
    └── update-cost-center.dto.ts
```

#### C. EarningTypesModule
```
src/earning-types/
├── earning-types.module.ts
├── earning-types.controller.ts
├── earning-types.service.ts
└── dto/
    ├── create-earning-type.dto.ts
    └── update-earning-type.dto.ts
```

**Endpoints Sugeridos**:
- POST `/earning-types` - Criar tipo
- GET `/earning-types` - Listar
- GET `/earning-types/:id` - Buscar por ID
- PATCH `/earning-types/:id` - Atualizar
- DELETE `/earning-types/:id` - Deletar

#### D. DeductionTypesModule
```
src/deduction-types/
├── deduction-types.module.ts
├── deduction-types.controller.ts
├── deduction-types.service.ts
└── dto/
    ├── create-deduction-type.dto.ts
    └── update-deduction-type.dto.ts
```

**Endpoints similares aos earning-types**

#### E. PayrollModule
```
src/payroll/
├── payroll.module.ts
├── payroll.controller.ts
├── payroll.service.ts
└── dto/
    ├── create-payroll.dto.ts
    ├── calculate-payroll.dto.ts
    └── query-payroll.dto.ts
```

**Endpoints Sugeridos**:
- POST `/payroll` - Criar folha
- GET `/payroll` - Listar folhas (com filtros)
- GET `/payroll/stats` - Estatísticas
- GET `/payroll/:id` - Buscar por ID
- POST `/payroll/:id/calculate` - Calcular automaticamente
- POST `/payroll/:id/approve` - Aprovar
- PATCH `/payroll/:id` - Atualizar
- DELETE `/payroll/:id` - Deletar
- GET `/payroll/:id/export/pdf` - Exportar PDF
- GET `/payroll/:id/export/excel` - Exportar Excel

### 2. Lógica de Cálculo

Implementar service para cálculo automático de folha:

```typescript
class PayrollCalculationService {
  async calculatePayroll(payrollId: string) {
    // 1. Buscar colaboradores ativos
    // 2. Para cada colaborador:
    //    - Buscar salário base
    //    - Buscar proventos recorrentes
    //    - Calcular proventos percentuais
    //    - Calcular descontos (INSS, IRRF, etc.)
    //    - Calcular líquido
    // 3. Criar PayrollItem para cada colaborador
    // 4. Atualizar totais da Payroll
  }
}
```

### 3. Validações

Implementar validações importantes:
- CPF único por empresa
- Datas de admissão/demissão consistentes
- Salário maior que zero
- Período de folha válido
- Não permitir alterar folha aprovada
- Validar incidências de INSS/FGTS/IRRF

### 4. Relatórios

Implementar geração de relatórios:
- Holerite (recibo de pagamento)
- Folha de pagamento consolidada
- Relatório de encargos
- Relatório de centros de custo
- Guias de recolhimento (GPS, DARF)

---

## 📝 Observações Importantes

### Campos Sensíveis
Os seguintes dados são sensíveis e devem ter acesso restrito:
- Salário dos colaboradores
- Dados bancários
- CPF
- Dados de folha de pagamento

### Compliance
O módulo foi projetado para atender requisitos básicos de RH. Para compliance total com eSocial, será necessário:
- Eventos do eSocial
- Integração com SEFIP/GFIP
- Tabelas de eSocial (eventos 1000-3000)
- Validações específicas da legislação

### Performance
Para empresas com muitos colaboradores:
- Implementar paginação em listagens
- Cache de cálculos de folha
- Índices no banco para CPF, data de admissão, centro de custo

---

**Status**: ✅ Schema Prisma criado  
**Status**: ✅ Permissões criadas e vinculadas  
**Próximo Passo**: Criar controllers e services NestJS

**Última Atualização**: 6 de novembro de 2025  
**Versão**: 1.0
