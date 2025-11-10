# 📚 Documentação do Módulo de RH

## 📄 Arquivos de Documentação

### 1. [MODULO_RH.md](./MODULO_RH.md)
**Visão Técnica Completa**
- Modelos de dados detalhados (7 tabelas)
- Estrutura do schema Prisma
- Permissões (26 total)
- Relacionamentos entre entidades
- Próximos passos de implementação

### 2. [API_RH.md](./API_RH.md)
**Documentação da API REST**
- 60+ endpoints documentados
- Payloads de request completos
- Exemplos de response
- Permissões necessárias por endpoint
- Exemplos de código JavaScript/TypeScript
- Validações e erros comuns
- Workflow de folha de pagamento

---

## 🚀 Quick Start

### Endpoints Principais

#### Colaboradores
```
POST   /employees              - Criar colaborador
GET    /employees              - Listar colaboradores
GET    /employees/:id          - Buscar por ID
PATCH  /employees/:id          - Atualizar
DELETE /employees/:id          - Deletar
GET    /employees/stats        - Estatísticas
```

#### Folha de Pagamento
```
POST   /payroll                - Criar folha
GET    /payroll                - Listar folhas
GET    /payroll/:id            - Buscar por ID
POST   /payroll/:id/calculate  - Calcular automaticamente
POST   /payroll/:id/approve    - Aprovar
POST   /payroll/:id/pay        - Marcar como paga
GET    /payroll/stats          - Estatísticas
```

#### Centros de Custo
```
POST   /cost-centers           - Criar
GET    /cost-centers           - Listar
GET    /cost-centers/hierarchy - Ver hierarquia completa
GET    /cost-centers/:id       - Buscar por ID
```

#### Proventos e Descontos
```
POST   /earning-types          - Criar tipo de provento
GET    /earning-types          - Listar tipos
POST   /deduction-types        - Criar tipo de desconto
GET    /deduction-types        - Listar tipos
```

#### Proventos de Colaboradores
```
POST   /employees/:id/earnings           - Adicionar provento
GET    /employees/:id/earnings           - Listar proventos
DELETE /employees/:id/earnings/:earningId - Remover provento
```

---

## 🔐 Permissões

### Colaboradores (4)
- `employees.create` - Criar
- `employees.read` - Visualizar
- `employees.update` - Atualizar
- `employees.delete` - Deletar

### Folha de Pagamento (6)
- `payroll.create` - Criar
- `payroll.read` - Visualizar
- `payroll.calculate` - Calcular
- `payroll.approve` - Aprovar
- `payroll.update` - Atualizar
- `payroll.delete` - Deletar

### Centros de Custo (4)
- `cost_centers.create`
- `cost_centers.read`
- `cost_centers.update`
- `cost_centers.delete`

### Proventos (4)
- `earning_types.create`
- `earning_types.read`
- `earning_types.update`
- `earning_types.delete`

### Descontos (4)
- `deduction_types.create`
- `deduction_types.read`
- `deduction_types.update`
- `deduction_types.delete`

### Proventos de Colaboradores (4)
- `employee_earnings.create`
- `employee_earnings.read`
- `employee_earnings.update`
- `employee_earnings.delete`

**Total**: 26 permissões

---

## 📊 Modelos de Dados

### 1. Employee (Colaborador)
Dados pessoais, profissionais, contratuais e bancários completos.
- Vinculado a centro de custo
- Suporta CLT, PJ, Estágio, Temporário, Autônomo
- CPF único por empresa

### 2. CostCenter (Centro de Custo)
Estrutura hierárquica de custos.
- Suporta níveis ilimitados (001, 001.001, 001.001.001...)
- Tipos: REVENUE, EXPENSE, INVESTMENT

### 3. EarningType (Tipo de Provento)
Configuração de proventos personalizáveis.
- Exemplos: Salário, Hora Extra, Adicional Noturno, Comissões
- Configurável como recorrente ou pontual
- Valor fixo ou percentual

### 4. DeductionType (Tipo de Desconto)
Configuração de descontos personalizáveis.
- Exemplos: INSS, IRRF, Vale Transporte, Plano de Saúde
- Configurável como recorrente ou pontual
- Valor fixo ou percentual

### 5. EmployeeEarning (Provento do Colaborador)
Vincula proventos específicos a colaboradores.
- Permite sobrescrever valores padrão
- Suporta período de validade (início/fim)

### 6. Payroll (Folha de Pagamento)
Gestão de folhas mensais, diárias ou semanais.
- Status: DRAFT → CALCULATED → APPROVED → PAID
- Cálculo automático ou manual
- Auditoria completa

### 7. PayrollItem (Item da Folha)
Detalhe por colaborador na folha.
- Proventos e descontos em JSON (flexível)
- Totais calculados automaticamente

---

## 🔄 Workflow Típico

### Configuração Inicial

1. **Criar Centros de Custo**
   ```
   POST /cost-centers
   ```

2. **Criar Tipos de Proventos**
   ```
   POST /earning-types
   (Salário, Hora Extra 50%, Adicional Noturno, etc.)
   ```

3. **Criar Tipos de Descontos**
   ```
   POST /deduction-types
   (INSS, IRRF, Vale Transporte, etc.)
   ```

### Gestão de Colaboradores

4. **Cadastrar Colaboradores**
   ```
   POST /employees
   ```

5. **Adicionar Proventos Específicos**
   ```
   POST /employees/:id/earnings
   (Ex: Adicional Noturno para colaboradores do turno da noite)
   ```

### Folha de Pagamento Mensal

6. **Criar Folha do Mês**
   ```
   POST /payroll
   (Referência: Novembro/2025)
   ```

7. **Calcular Automaticamente**
   ```
   POST /payroll/:id/calculate
   (Sistema busca todos colaboradores ativos e calcula)
   ```

8. **Revisar e Ajustar**
   ```
   POST /payroll/:id/items
   (Adicionar/editar manualmente se necessário)
   ```

9. **Aprovar**
   ```
   POST /payroll/:id/approve
   (Apenas usuários com permissão payroll.approve)
   ```

10. **Realizar Pagamentos**
    ```
    (Processo externo - integração bancária)
    ```

11. **Marcar como Paga**
    ```
    POST /payroll/:id/pay
    ```

---

## 💻 Exemplo de Código Completo

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Configurar token e empresa em todas as requisições
api.interceptors.request.use(config => {
  config.headers.Authorization = `Bearer ${getToken()}`;
  config.headers['x-company-id'] = getCompanyId();
  return config;
});

// 1. Criar colaborador
async function createEmployee() {
  const response = await api.post('/employees', {
    name: 'João Silva Santos',
    cpf: '12345678900',
    position: 'Desenvolvedor Sênior',
    department: 'TI',
    admissionDate: '2023-01-15',
    contractType: 'CLT',
    salary: 8500.00,
    costCenterId: 'cost-center-uuid'
  });
  
  return response.data;
}

// 2. Criar folha de pagamento
async function createAndCalculatePayroll() {
  // Criar folha
  const payroll = await api.post('/payroll', {
    referenceMonth: 11,
    referenceYear: 2025,
    type: 'MONTHLY',
    startDate: '2025-11-01',
    endDate: '2025-11-30',
    paymentDate: '2025-12-05'
  });
  
  // Calcular automaticamente
  const calculated = await api.post(
    `/payroll/${payroll.data.id}/calculate`
  );
  
  // Aprovar
  const approved = await api.post(
    `/payroll/${payroll.data.id}/approve`
  );
  
  return approved.data;
}

// 3. Adicionar provento a colaborador
async function addNightShiftAllowance(employeeId: string) {
  const response = await api.post(
    `/employees/${employeeId}/earnings`,
    {
      earningTypeId: 'night-shift-uuid',
      isRecurrent: true,
      value: 500.00,
      startDate: '2025-11-01'
    }
  );
  
  return response.data;
}

// 4. Listar colaboradores com filtros
async function listActiveEmployees() {
  const response = await api.get('/employees', {
    params: {
      active: true,
      department: 'TI',
      page: 1,
      limit: 50
    }
  });
  
  return response.data;
}

// 5. Buscar estatísticas
async function getPayrollStats() {
  const response = await api.get('/payroll/stats', {
    params: { year: 2025 }
  });
  
  return response.data;
}
```

---

## ⚠️ Validações Importantes

### Colaboradores
- ✅ CPF único por empresa
- ✅ Data de admissão ≤ hoje
- ✅ Data de demissão > admissão
- ✅ Salário > 0

### Folha de Pagamento
- ✅ Período único (não pode ter 2 folhas mensais de Nov/2025)
- ✅ Workflow: DRAFT → CALCULATED → APPROVED → PAID
- ✅ Não pode alterar folha aprovada
- ✅ Não pode deletar folha aprovada

### Centros de Custo
- ✅ Código único por empresa
- ✅ Não pode criar loops na hierarquia
- ✅ Só pode deletar se não houver colaboradores

---

## 🎯 Status de Implementação

| Componente | Status |
|------------|--------|
| **Schema Prisma** | ✅ 100% |
| **Migrations** | ✅ 100% |
| **Permissões** | ✅ 100% |
| **Seeds** | ✅ 100% |
| **API REST** | ⏳ Pendente |
| **Lógica de Cálculo** | ⏳ Pendente |
| **Relatórios** | ⏳ Pendente |
| **Exportações** | ⏳ Pendente |

---

## 📖 Leitura Recomendada

1. **MODULO_RH.md** - Para entender a estrutura de dados
2. **API_RH.md** - Para implementar a integração
3. **Prisma Schema** - Para ver os relacionamentos
4. **Seeds** - Para ver exemplos de dados

---

## 🆘 Suporte

Para dúvidas sobre:
- **Modelos de dados**: Consulte `MODULO_RH.md`
- **Endpoints**: Consulte `API_RH.md`
- **Permissões**: Veja seção de permissões em ambos os arquivos
- **Validações**: Consulte seção de validações no `API_RH.md`

---

**Última Atualização**: 8 de novembro de 2025  
**Versão**: 1.0
