# 💰 Gerenciamento de Folha de Pagamento (Payroll)

> **Documentação completa do módulo de Folha de Pagamento com emissão de holerites em PDF**

---

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Fluxo de Trabalho](#-fluxo-de-trabalho)
- [Endpoints da API](#-endpoints-da-api)
- [Emissão de PDFs](#-emissão-de-pdfs)
- [Modelos de Dados](#-modelos-de-dados)
- [Exemplos Práticos](#-exemplos-práticos)
- [Validações e Regras](#-validações-e-regras)
- [Integrações](#-integrações)

---

## 🎯 Visão Geral

O módulo de Folha de Pagamento permite gerenciar o ciclo completo de pagamento de colaboradores, incluindo:

- ✅ Criação e gestão de folhas de pagamento (mensal, semanal, diária, adiantamento)
- ✅ Cálculo automático de proventos e descontos (INSS, IRRF, FGTS)
- ✅ Workflow de aprovação (Rascunho → Calculado → Aprovado → Pago)
- ✅ Emissão de holerites individuais em PDF
- ✅ Relatórios consolidados da folha em PDF
- ✅ Estatísticas e dashboards
- ✅ Auditoria completa

### Status da Folha

| Status | Descrição | Ações Permitidas |
|--------|-----------|------------------|
| `DRAFT` | Rascunho (em edição) | Editar, Deletar, Calcular |
| `CALCULATED` | Calculada (pronta para revisão) | Ajustar itens, Aprovar, Voltar para rascunho |
| `APPROVED` | Aprovada (aguardando pagamento) | Marcar como paga |
| `PAID` | Paga (concluída) | Apenas consultar |

### Tipos de Folha

| Tipo | Código | Uso |
|------|--------|-----|
| Mensal | `MONTHLY` | Folha de pagamento padrão mensal |
| Semanal | `WEEKLY` | Folha semanal |
| Diária | `DAILY` | Pagamento de diárias |
| Adiantamento | `ADVANCE` | Adiantamento salarial (13º, férias, etc) |

---

## 🔄 Fluxo de Trabalho

### Workflow Completo

```
1. CRIAR FOLHA
   ↓
2. CALCULAR AUTOMATICAMENTE
   ↓
3. REVISAR E AJUSTAR (opcional)
   ↓
4. GERAR HOLERITES EM PDF
   ↓
5. APROVAR FOLHA
   ↓
6. REALIZAR PAGAMENTOS (externo)
   ↓
7. MARCAR COMO PAGA
```

### Processo Detalhado

#### 1️⃣ Criação da Folha

```http
POST /payroll
```

Define o período (mês/ano), tipo da folha e datas de início, fim e pagamento.

#### 2️⃣ Cálculo Automático

```http
POST /payroll/:id/calculate
```

O sistema automaticamente:
- Busca todos os colaboradores ativos
- Calcula proventos (salário base + adicionais configurados)
- Aplica descontos (INSS, IRRF) usando tabelas fiscais
- Gera um item da folha para cada colaborador

#### 3️⃣ Revisão e Ajustes

```http
POST /payroll/:id/items
```

Permite adicionar ou ajustar manualmente itens específicos de colaboradores.

#### 4️⃣ Emissão de PDFs

```http
GET /payroll/:id/pdf                      # Folha consolidada
GET /payroll/:id/items/:itemId/payslip    # Holerite individual
```

#### 5️⃣ Aprovação

```http
POST /payroll/:id/approve
```

Requer permissão `payroll.approve`. Registra quem aprovou e quando.

#### 6️⃣ Marcação como Paga

```http
POST /payroll/:id/pay
```

Confirma que os pagamentos foram realizados.

---

## 📡 Endpoints da API

### 📝 Criar Folha de Pagamento

**Endpoint:** `POST /payroll`

**Permissão:** `payroll.create`

**Body:**
```json
{
  "referenceMonth": 11,
  "referenceYear": 2025,
  "type": "MONTHLY",
  "startDate": "2025-11-01",
  "endDate": "2025-11-30",
  "paymentDate": "2025-12-05"
}
```

**Validações:**
- ✅ Mês entre 1 e 12
- ✅ Ano entre 2000 e 2100
- ✅ Data de fim > Data de início
- ✅ Data de pagamento > Data de fim
- ✅ Não pode existir folha duplicada (mesmo mês/ano/tipo)

**Resposta:**
```json
{
  "id": "uuid",
  "companyId": "uuid",
  "referenceMonth": 11,
  "referenceYear": 2025,
  "type": "MONTHLY",
  "status": "DRAFT",
  "startDate": "2025-11-01T00:00:00.000Z",
  "endDate": "2025-11-30T23:59:59.999Z",
  "paymentDate": "2025-12-05T00:00:00.000Z",
  "totalEarnings": "0.00",
  "totalDeductions": "0.00",
  "netAmount": "0.00",
  "createdAt": "2025-11-09T..."
}
```

---

### 📊 Listar Folhas de Pagamento

**Endpoint:** `GET /payroll`

**Permissão:** `payroll.read`

**Query Params:**
```
?status=PAID
&type=MONTHLY
&referenceMonth=11
&referenceYear=2025
&page=1
&limit=50
```

**Resposta:**
```json
{
  "data": [
    {
      "id": "uuid",
      "referenceMonth": 11,
      "referenceYear": 2025,
      "type": "MONTHLY",
      "status": "PAID",
      "paymentDate": "2025-12-05T...",
      "totalEarnings": "150000.00",
      "totalDeductions": "35000.00",
      "netAmount": "115000.00",
      "itemsCount": 25,
      "createdAt": "2025-11-09T..."
    }
  ],
  "total": 12,
  "page": 1,
  "limit": 50,
  "totalPages": 1
}
```

---

### 🔍 Buscar Folha por ID

**Endpoint:** `GET /payroll/:id`

**Permissão:** `payroll.read`

**Resposta:**
```json
{
  "id": "uuid",
  "companyId": "uuid",
  "referenceMonth": 11,
  "referenceYear": 2025,
  "type": "MONTHLY",
  "status": "APPROVED",
  "startDate": "2025-11-01T...",
  "endDate": "2025-11-30T...",
  "paymentDate": "2025-12-05T...",
  "totalEarnings": "150000.00",
  "totalDeductions": "35000.00",
  "netAmount": "115000.00",
  "createdById": "uuid",
  "createdBy": {
    "id": "uuid",
    "name": "Admin Sistema"
  },
  "approvedById": "uuid",
  "approvedBy": {
    "id": "uuid",
    "name": "Gestor RH"
  },
  "approvedAt": "2025-11-30T...",
  "createdAt": "2025-11-09T...",
  "updatedAt": "2025-11-30T...",
  "items": [
    {
      "id": "uuid",
      "employeeId": "uuid",
      "employee": {
        "id": "uuid",
        "name": "João Silva",
        "cpf": "12345678901",
        "position": "Analista de Sistemas"
      },
      "baseSalary": "5000.00",
      "workDays": 30,
      "earnings": [
        {
          "typeId": "base-salary",
          "code": "SALARY",
          "name": "Salário Base",
          "value": 5000.00
        },
        {
          "typeId": "uuid",
          "code": "OVERTIME",
          "name": "Hora Extra 50%",
          "value": 500.00
        }
      ],
      "totalEarnings": "5500.00",
      "deductions": [
        {
          "typeId": "inss",
          "code": "INSS",
          "name": "INSS",
          "value": 550.00
        },
        {
          "typeId": "irrf",
          "code": "IRRF",
          "name": "IRRF",
          "value": 250.00
        }
      ],
      "totalDeductions": "800.00",
      "netAmount": "4700.00",
      "notes": null,
      "createdAt": "2025-11-09T...",
      "updatedAt": "2025-11-09T..."
    }
  ]
}
```

---

### ✏️ Atualizar Folha

**Endpoint:** `PATCH /payroll/:id`

**Permissão:** `payroll.update`

**Restrições:**
- ⚠️ Só pode atualizar folhas em status `DRAFT`

**Body (parcial):**
```json
{
  "startDate": "2025-11-01",
  "endDate": "2025-11-30",
  "paymentDate": "2025-12-10"
}
```

---

### 🗑️ Deletar Folha

**Endpoint:** `DELETE /payroll/:id`

**Permissão:** `payroll.delete`

**Restrições:**
- ⚠️ Só pode deletar folhas em status `DRAFT`

**Resposta:**
```json
{
  "message": "Folha de pagamento deletada com sucesso"
}
```

---

### 🧮 Calcular Folha

**Endpoint:** `POST /payroll/:id/calculate`

**Permissão:** `payroll.calculate`

**Restrições:**
- ⚠️ Só pode calcular folhas em status `DRAFT`

**Processo:**
1. Busca todos os colaboradores ativos da empresa
2. Para cada colaborador:
   - Calcula salário base
   - Adiciona proventos recorrentes (configurados no cadastro)
   - Calcula INSS usando tabela progressiva
   - Calcula IRRF usando tabela progressiva
   - Aplica outros descontos configurados
3. Cria um item da folha para cada colaborador
4. Atualiza totalizadores da folha
5. Muda status para `CALCULATED`

**Resposta:**
```json
{
  "id": "uuid",
  "status": "CALCULATED",
  "totalEarnings": "150000.00",
  "totalDeductions": "35000.00",
  "netAmount": "115000.00",
  "itemsCount": 25,
  "message": "Folha calculada com sucesso para 25 colaboradores"
}
```

---

### ➕ Adicionar/Atualizar Item da Folha

**Endpoint:** `POST /payroll/:id/items`

**Permissão:** `payroll.update`

**Restrições:**
- ⚠️ Só pode alterar itens em folhas `DRAFT` ou `CALCULATED`

**Body:**
```json
{
  "employeeId": "uuid",
  "baseSalary": 5000.00,
  "workDays": 30,
  "earnings": [
    {
      "typeId": "base-salary",
      "code": "SALARY",
      "name": "Salário Base",
      "value": 5000.00
    },
    {
      "typeId": "uuid",
      "code": "BONUS",
      "name": "Bônus de Produtividade",
      "value": 1000.00
    }
  ],
  "deductions": [
    {
      "typeId": "inss",
      "code": "INSS",
      "name": "INSS",
      "value": 600.00
    },
    {
      "typeId": "irrf",
      "code": "IRRF",
      "name": "IRRF",
      "value": 300.00
    }
  ],
  "notes": "Bônus excepcional por projeto"
}
```

**Resposta:**
```json
{
  "id": "uuid",
  "payrollId": "uuid",
  "employeeId": "uuid",
  "baseSalary": "5000.00",
  "workDays": 30,
  "totalEarnings": "6000.00",
  "totalDeductions": "900.00",
  "netAmount": "5100.00",
  "notes": "Bônus excepcional por projeto",
  "updatedAt": "2025-11-09T..."
}
```

---

### ✅ Aprovar Folha

**Endpoint:** `POST /payroll/:id/approve`

**Permissão:** `payroll.approve`

**Restrições:**
- ⚠️ Só pode aprovar folhas em status `CALCULATED`

**Resposta:**
```json
{
  "id": "uuid",
  "status": "APPROVED",
  "approvedBy": {
    "id": "uuid",
    "name": "Gestor RH"
  },
  "approvedAt": "2025-11-30T12:30:00.000Z",
  "message": "Folha de pagamento aprovada com sucesso"
}
```

---

### 💸 Marcar como Paga

**Endpoint:** `POST /payroll/:id/pay`

**Permissão:** `payroll.approve`

**Restrições:**
- ⚠️ Só pode marcar como paga folhas em status `APPROVED`

**Resposta:**
```json
{
  "id": "uuid",
  "status": "PAID",
  "message": "Folha de pagamento marcada como paga"
}
```

---

### 📈 Estatísticas

**Endpoint:** `GET /payroll/stats`

**Permissão:** `payroll.read`

**Query Params:**
```
?year=2025
```

**Resposta:**
```json
{
  "year": 2025,
  "totalPaid": "1380000.00",
  "averageMonthly": "115000.00",
  "byMonth": [
    {
      "month": 1,
      "monthName": "Janeiro",
      "totalEarnings": "150000.00",
      "totalDeductions": "35000.00",
      "netAmount": "115000.00",
      "employeesCount": 25
    },
    {
      "month": 2,
      "monthName": "Fevereiro",
      "totalEarnings": "0.00",
      "totalDeductions": "0.00",
      "netAmount": "0.00",
      "employeesCount": 0
    }
    // ... demais meses
  ],
  "byStatus": {
    "DRAFT": 1,
    "CALCULATED": 2,
    "APPROVED": 1,
    "PAID": 8
  }
}
```

---

## 📄 Emissão de PDFs

### � Tecnologia de Geração

Os PDFs são gerados no backend utilizando **Puppeteer**, que oferece:
- ✅ Renderização HTML/CSS de alta qualidade
- ✅ Chromium headless para fidelidade visual
- ✅ Suporte completo a fontes e estilos modernos
- ✅ Performance otimizada para documentos profissionais

**Arquitetura:**
1. Templates HTML são construídos dinamicamente com dados da folha
2. CSS profissional é aplicado via `getBaseStyles()` do PdfService
3. Puppeteer renderiza o HTML em PDF de alta qualidade
4. Buffer é enviado ao cliente para download

**Configuração:**
- Formato: A4 (retrato para holerites, paisagem para folha consolidada)
- Margens: 20mm superior/inferior, 15mm esquerda/direita
- Print Background: Habilitado
- Fontes: Arial, Helvetica (web-safe)

---

### �📋 Holerite Individual (Payslip)

**Endpoint:** `GET /payroll/:id/items/:itemId/payslip`

**Permissão:** `payroll.read`

**Descrição:** Gera o holerite (recibo de pagamento) individual de um colaborador em PDF.

**Conteúdo do PDF:**
- ✅ Dados do empregador (empresa)
- ✅ Dados do colaborador (nome, CPF, cargo, admissão)
- ✅ Período de referência (mês/ano)
- ✅ Dias trabalhados
- ✅ Tabela de proventos detalhada
- ✅ Tabela de descontos detalhada
- ✅ Valor líquido a receber (destacado)
- ✅ Observações (se houver)
- ✅ Campos de assinatura (empregador e colaborador)

**Exemplo de Uso:**
```bash
curl -X GET "http://localhost:3000/payroll/{payrollId}/items/{itemId}/payslip" \
  -H "Authorization: Bearer {token}" \
  -o holerite-joao-silva.pdf
```

**Resposta:**
- Status: `200 OK`
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="holerite-{itemId}.pdf"`

---

### 📊 Folha Consolidada

**Endpoint:** `GET /payroll/:id/pdf`

**Permissão:** `payroll.read`

**Descrição:** Gera relatório completo da folha de pagamento em formato PDF (orientação paisagem).

**Conteúdo do PDF:**
- ✅ Informações gerais da folha (período, tipo, status)
- ✅ Tabela com todos os colaboradores
  - Nome
  - Cargo
  - Dias trabalhados
  - Total de proventos
  - Total de descontos
  - Valor líquido
- ✅ Totalizadores gerais
  - Total de proventos da empresa
  - Total de descontos
  - Valor líquido total
- ✅ Informações de auditoria
  - Criado por
  - Data de criação
  - Aprovado por
  - Data de aprovação

**Exemplo de Uso:**
```bash
curl -X GET "http://localhost:3000/payroll/{payrollId}/pdf" \
  -H "Authorization: Bearer {token}" \
  -o folha-pagamento-novembro-2025.pdf
```

**Resposta:**
- Status: `200 OK`
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="folha-pagamento-{payrollId}.pdf"`

---

## 📊 Modelos de Dados

### Payroll (Folha de Pagamento)

```typescript
{
  id: string
  companyId: string
  
  // Período
  referenceMonth: number      // 1-12
  referenceYear: number       // Ex: 2025
  type: string               // MONTHLY | DAILY | WEEKLY | ADVANCE
  
  // Datas
  startDate: Date            // Início do período
  endDate: Date              // Fim do período
  paymentDate: Date          // Data prevista de pagamento
  
  // Status
  status: string             // DRAFT | CALCULATED | APPROVED | PAID
  
  // Totalizadores
  totalEarnings: Decimal     // Total de proventos
  totalDeductions: Decimal   // Total de descontos
  netAmount: Decimal         // Valor líquido total
  
  // Auditoria
  createdById: string
  createdAt: Date
  updatedAt: Date
  approvedById?: string
  approvedAt?: Date
  
  // Relacionamentos
  items: PayrollItem[]       // Itens por colaborador
}
```

### PayrollItem (Item da Folha)

```typescript
{
  id: string
  payrollId: string
  employeeId: string
  
  // Valores base
  baseSalary: Decimal        // Salário base do colaborador
  workDays: number           // Dias trabalhados no período
  
  // Proventos (JSON array)
  earnings: [
    {
      typeId: string,
      code: string,
      name: string,
      value: number
    }
  ]
  totalEarnings: Decimal
  
  // Descontos (JSON array)
  deductions: [
    {
      typeId: string,
      code: string,
      name: string,
      value: number
    }
  ]
  totalDeductions: Decimal
  
  // Resultado
  netAmount: Decimal         // Valor líquido = Proventos - Descontos
  
  // Observações
  notes?: string
  
  createdAt: Date
  updatedAt: Date
}
```

---

## 💡 Exemplos Práticos

### Exemplo 1: Criar e Processar Folha Mensal

```javascript
// 1. Criar folha de pagamento de novembro/2025
const createResponse = await fetch('http://localhost:3000/payroll', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer {token}',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    referenceMonth: 11,
    referenceYear: 2025,
    type: 'MONTHLY',
    startDate: '2025-11-01',
    endDate: '2025-11-30',
    paymentDate: '2025-12-05'
  })
});

const payroll = await createResponse.json();
console.log('Folha criada:', payroll.id);

// 2. Calcular automaticamente
const calculateResponse = await fetch(
  `http://localhost:3000/payroll/${payroll.id}/calculate`,
  {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer {token}'
    }
  }
);

const calculated = await calculateResponse.json();
console.log('Calculado para', calculated.itemsCount, 'colaboradores');
console.log('Total líquido:', calculated.netAmount);

// 3. Buscar detalhes da folha calculada
const detailsResponse = await fetch(
  `http://localhost:3000/payroll/${payroll.id}`,
  {
    headers: {
      'Authorization': 'Bearer {token}'
    }
  }
);

const details = await detailsResponse.json();
console.log('Itens da folha:', details.items.length);

// 4. Gerar PDF consolidado
window.open(
  `http://localhost:3000/payroll/${payroll.id}/pdf?token={token}`,
  '_blank'
);

// 5. Gerar holerite de um colaborador específico
const itemId = details.items[0].id;
window.open(
  `http://localhost:3000/payroll/${payroll.id}/items/${itemId}/payslip?token={token}`,
  '_blank'
);

// 6. Aprovar folha
const approveResponse = await fetch(
  `http://localhost:3000/payroll/${payroll.id}/approve`,
  {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer {token}'
    }
  }
);

const approved = await approveResponse.json();
console.log('Folha aprovada por:', approved.approvedBy.name);

// 7. Após realizar pagamentos, marcar como paga
const payResponse = await fetch(
  `http://localhost:3000/payroll/${payroll.id}/pay`,
  {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer {token}'
    }
  }
);

const paid = await payResponse.json();
console.log('Status:', paid.status); // PAID
```

---

### Exemplo 2: Ajustar Item Manualmente

```javascript
// Cenário: Adicionar bônus excepcional a um colaborador

const payrollId = 'uuid-da-folha';
const employeeId = 'uuid-do-colaborador';

const response = await fetch(
  `http://localhost:3000/payroll/${payrollId}/items`,
  {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer {token}',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      employeeId: employeeId,
      baseSalary: 5000.00,
      workDays: 30,
      earnings: [
        {
          typeId: 'base-salary',
          code: 'SALARY',
          name: 'Salário Base',
          value: 5000.00
        },
        {
          typeId: 'bonus-uuid',
          code: 'BONUS',
          name: 'Bônus Excepcional',
          value: 2000.00  // 👈 Bônus adicional
        }
      ],
      deductions: [
        {
          typeId: 'inss',
          code: 'INSS',
          name: 'INSS',
          value: 700.00  // Recalculado com base no novo total
        },
        {
          typeId: 'irrf',
          code: 'IRRF',
          name: 'IRRF',
          value: 350.00
        }
      ],
      notes: 'Bônus por excelente desempenho no projeto X'
    })
  }
);

const updated = await response.json();
console.log('Novo líquido:', updated.netAmount); // 5950.00
```

---

### Exemplo 3: Gerar Holerites de Todos os Colaboradores

```javascript
// Buscar folha com todos os itens
const response = await fetch(
  `http://localhost:3000/payroll/${payrollId}`,
  {
    headers: {
      'Authorization': 'Bearer {token}'
    }
  }
);

const payroll = await response.json();

// Para cada colaborador, baixar o holerite
for (const item of payroll.items) {
  const filename = `holerite-${item.employee.name.replace(/\s/g, '-')}.pdf`;
  
  // Baixar PDF
  const pdfResponse = await fetch(
    `http://localhost:3000/payroll/${payrollId}/items/${item.id}/payslip`,
    {
      headers: {
        'Authorization': 'Bearer {token}'
      }
    }
  );
  
  const blob = await pdfResponse.blob();
  
  // Salvar arquivo
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  
  console.log(`✅ Holerite gerado: ${filename}`);
}
```

---

### Exemplo 4: Dashboard de Estatísticas

```javascript
// Buscar estatísticas do ano
const response = await fetch(
  'http://localhost:3000/payroll/stats?year=2025',
  {
    headers: {
      'Authorization': 'Bearer {token}'
    }
  }
);

const stats = await response.json();

console.log('=== ESTATÍSTICAS 2025 ===');
console.log('Total pago no ano:', stats.totalPaid);
console.log('Média mensal:', stats.averageMonthly);
console.log('\nPor mês:');

stats.byMonth.forEach(month => {
  if (month.employeesCount > 0) {
    console.log(`${month.monthName}: ${month.netAmount} (${month.employeesCount} colaboradores)`);
  }
});

console.log('\nPor status:');
console.log('Rascunho:', stats.byStatus.DRAFT);
console.log('Calculadas:', stats.byStatus.CALCULATED);
console.log('Aprovadas:', stats.byStatus.APPROVED);
console.log('Pagas:', stats.byStatus.PAID);
```

---

## ✅ Validações e Regras

### Regras de Negócio

| Regra | Descrição |
|-------|-----------|
| **Unicidade** | Não pode haver duas folhas com mesmo mês/ano/tipo para a mesma empresa |
| **Workflow** | Transições de status devem seguir a ordem: DRAFT → CALCULATED → APPROVED → PAID |
| **Edição** | Só pode editar folhas em status DRAFT |
| **Deleção** | Só pode deletar folhas em status DRAFT |
| **Cálculo** | Só pode calcular folhas em status DRAFT |
| **Aprovação** | Só pode aprovar folhas em status CALCULATED |
| **Pagamento** | Só pode marcar como paga folhas em status APPROVED |
| **Datas** | Data fim > Data início < Data pagamento |
| **Itens** | Só pode adicionar/editar itens em folhas DRAFT ou CALCULATED |

### Validações de Entrada

#### Criar Folha
- ✅ `referenceMonth`: obrigatório, inteiro, entre 1 e 12
- ✅ `referenceYear`: obrigatório, inteiro, entre 2000 e 2100
- ✅ `type`: obrigatório, um de: MONTHLY, DAILY, WEEKLY, ADVANCE
- ✅ `startDate`: obrigatório, formato ISO 8601
- ✅ `endDate`: obrigatório, formato ISO 8601, posterior a startDate
- ✅ `paymentDate`: obrigatório, formato ISO 8601, posterior a endDate

#### Adicionar Item
- ✅ `employeeId`: obrigatório, UUID válido, colaborador da empresa
- ✅ `baseSalary`: obrigatório, número positivo
- ✅ `workDays`: obrigatório, inteiro, entre 1 e 31
- ✅ `earnings`: array obrigatório, cada item com typeId, code, name, value
- ✅ `deductions`: array obrigatório, estrutura similar a earnings

---

## 🔗 Integrações

### Integração com Tabelas Fiscais

O cálculo automático utiliza as **Tabelas Fiscais** configuradas no sistema:

```typescript
// INSS - Tabela Progressiva
const inssTable = await taxTablesService.getActiveInssTable(
  companyId,
  referenceYear
);

const inssCalculation = taxTablesService.calculateInss(
  totalEarnings,
  inssTable
);

// IRRF - Tabela Progressiva
const irrfTable = await taxTablesService.getActiveIrrfTable(
  companyId,
  referenceYear
);

const irrfCalculation = taxTablesService.calculateIrrf(
  taxableIncome,        // Total - INSS
  dependentsCount,       // Do cadastro do colaborador
  irrfTable
);
```

**Veja mais:** [Documentação de Tabelas Fiscais](./TABELAS_FISCAIS.md)

---

### Integração com Proventos e Descontos

O sistema busca automaticamente proventos e descontos configurados:

```typescript
// Busca proventos ativos do colaborador
const earnings = await prisma.employeeEarning.findMany({
  where: {
    employeeId,
    active: true,
    OR: [
      { isRecurrent: true },              // Proventos recorrentes
      { 
        startDate: { lte: payroll.endDate },
        endDate: { gte: payroll.startDate }  // Ou dentro do período
      }
    ]
  }
});
```

**Veja mais:** [API de Proventos e Descontos](./EARNINGS_DEDUCTIONS.md)

---

### Integração com Colaboradores

Apenas colaboradores **ativos** são incluídos no cálculo automático:

```typescript
const employees = await prisma.employee.findMany({
  where: {
    companyId,
    active: true  // 👈 Apenas ativos
  }
});
```

**Veja mais:** [API de Colaboradores](./API_RH.md)

---

## 🔐 Permissões Necessárias

| Ação | Permissão | Descrição |
|------|-----------|-----------|
| Criar | `payroll.create` | Criar nova folha de pagamento |
| Visualizar | `payroll.read` | Ver folhas e gerar PDFs |
| Calcular | `payroll.calculate` | Executar cálculo automático |
| Editar | `payroll.update` | Modificar folha ou itens |
| Deletar | `payroll.delete` | Remover folha (apenas DRAFT) |
| Aprovar | `payroll.approve` | Aprovar e marcar como paga |

---

## 🎨 Personalização de PDFs

Os PDFs são gerados usando o **PDFMake** com layout profissional:

### Recursos Visuais
- ✅ Cabeçalho com nome da empresa
- ✅ Rodapé com numeração de páginas
- ✅ Tabelas com bordas e cores
- ✅ Destaque para totalizadores
- ✅ Formatação de valores em BRL
- ✅ Formatação de datas em PT-BR
- ✅ Formatação de CPF/CNPJ

### Orientações
- **Holerite**: A4 Retrato (Portrait)
- **Folha Consolidada**: A4 Paisagem (Landscape)

---

## 📌 Casos de Uso Comuns

### 1. Folha Mensal Padrão
```
1. Criar folha do mês
2. Calcular automaticamente
3. Revisar e ajustar se necessário
4. Gerar holerites para distribuição
5. Aprovar
6. Realizar pagamentos externos
7. Marcar como paga
```

### 2. Adiantamento Salarial
```
1. Criar folha tipo ADVANCE
2. Calcular (50% do salário, sem descontos)
3. Aprovar e pagar
4. Na folha mensal, deduzir o valor do adiantamento
```

### 3. 13º Salário
```
1ª Parcela (até 30/11):
- Criar folha tipo ADVANCE
- 50% do salário (sem descontos)

2ª Parcela (até 20/12):
- Criar folha tipo ADVANCE
- 50% restante (com descontos INSS e IRRF)
```

### 4. Férias
```
1. Criar folha tipo ADVANCE
2. Calcular: Salário + 1/3 constitucional
3. Aplicar descontos (INSS, IRRF)
4. Aprovar e pagar 2 dias antes do início
```

---

## 📞 Suporte

- 📧 Email: suporte@empresa.com
- 📚 Wiki: wiki.empresa.com/payroll
- 🐛 Issues: github.com/empresa/erp/issues

---

## 📝 Changelog

### Versão 1.0.0 - Novembro 2025
- ✅ Implementação completa do módulo de folha de pagamento
- ✅ Cálculo automático com INSS e IRRF
- ✅ Geração de holerites em PDF
- ✅ Geração de folha consolidada em PDF
- ✅ Workflow de aprovação
- ✅ Estatísticas e dashboards
- ✅ Auditoria completa

---

**Desenvolvido com ❤️ pela equipe de ERP**
