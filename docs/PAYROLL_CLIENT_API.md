# 📘 API de Payroll - Documentação para Client

> **Guia completo de integração com o módulo de Folha de Pagamento**

---

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Autenticação](#-autenticação)
- [Endpoints Completos](#-endpoints-completos)
- [Exemplos de Integração](#-exemplos-de-integração)
- [Tratamento de Erros](#-tratamento-de-erros)
- [Fluxo de Trabalho Recomendado](#-fluxo-de-trabalho-recomendado)

---

## 🎯 Visão Geral

### Base URL
```
http://localhost:3000
```

### Prefixo
Todos os endpoints de payroll começam com:
```
/payroll
```

### Permissões Necessárias
- `payroll.create` - Criar folhas de pagamento
- `payroll.read` - Visualizar folhas e holerites
- `payroll.update` - Editar e ajustar folhas
- `payroll.delete` - Excluir folhas em rascunho
- `payroll.approve` - Aprovar folhas calculadas
- `payroll.pay` - Marcar folhas como pagas

---

## 🔐 Autenticação

Todos os endpoints requerem autenticação via **Bearer Token** no header:

```http
Authorization: Bearer {seu_token_jwt}
```

---

## 📚 Endpoints Completos

### 1. Listar Folhas de Pagamento

```http
GET /payroll
```

**Query Parameters:**
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `page` | number | Não | Página (padrão: 1) |
| `limit` | number | Não | Itens por página (padrão: 10, máx: 100) |
| `status` | string | Não | Filtrar por status: `DRAFT`, `CALCULATED`, `APPROVED`, `PAID` |
| `type` | string | Não | Filtrar por tipo: `MONTHLY`, `WEEKLY`, `DAILY`, `ADVANCE` |
| `referenceMonth` | number | Não | Filtrar por mês (1-12) |
| `referenceYear` | number | Não | Filtrar por ano (ex: 2024) |
| `search` | string | Não | Buscar por descrição ou colaborador |

**Exemplo de Request:**
```typescript
const response = await fetch(
  'http://localhost:3000/payroll?page=1&limit=20&status=CALCULATED&referenceMonth=11&referenceYear=2024',
  {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);

const data = await response.json();
```

**Resposta de Sucesso (200 OK):**
```json
{
  "data": [
    {
      "id": "uuid-da-folha",
      "companyId": "uuid-da-empresa",
      "referenceMonth": 11,
      "referenceYear": 2024,
      "type": "MONTHLY",
      "status": "CALCULATED",
      "startDate": "2024-11-01T00:00:00.000Z",
      "endDate": "2024-11-30T23:59:59.999Z",
      "paymentDate": "2024-12-05T00:00:00.000Z",
      "totalEarnings": "150000.00",
      "totalDeductions": "25000.00",
      "netAmount": "125000.00",
      "createdAt": "2024-11-01T10:00:00.000Z",
      "updatedAt": "2024-11-05T15:30:00.000Z",
      "itemsCount": 25
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

---

### 2. Criar Nova Folha de Pagamento

```http
POST /payroll
```

**Body (JSON):**
```json
{
  "referenceMonth": 12,
  "referenceYear": 2024,
  "type": "MONTHLY",
  "startDate": "2024-12-01",
  "endDate": "2024-12-31",
  "paymentDate": "2024-12-05"
}
```

**Validações:**
- `referenceMonth`: número entre 1 e 12
- `referenceYear`: ano válido (2000-2100)
- `type`: `MONTHLY`, `WEEKLY`, `DAILY` ou `ADVANCE`
- `startDate` e `endDate`: formato ISO 8601
- `paymentDate`: deve ser >= endDate

**Exemplo de Request:**
```typescript
const createPayroll = async () => {
  const response = await fetch('http://localhost:3000/payroll', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      referenceMonth: 12,
      referenceYear: 2024,
      type: 'MONTHLY',
      startDate: '2024-12-01',
      endDate: '2024-12-31',
      paymentDate: '2024-12-05'
    })
  });

  return await response.json();
};
```

**Resposta de Sucesso (201 Created):**
```json
{
  "id": "uuid-gerado",
  "companyId": "uuid-da-empresa",
  "referenceMonth": 12,
  "referenceYear": 2024,
  "type": "MONTHLY",
  "status": "DRAFT",
  "startDate": "2024-12-01T00:00:00.000Z",
  "endDate": "2024-12-31T23:59:59.999Z",
  "paymentDate": "2024-12-05T00:00:00.000Z",
  "totalEarnings": "0.00",
  "totalDeductions": "0.00",
  "netAmount": "0.00",
  "createdById": "uuid-do-usuario",
  "createdAt": "2024-11-09T10:00:00.000Z",
  "updatedAt": "2024-11-09T10:00:00.000Z"
}
```

---

### 3. Buscar Folha por ID

```http
GET /payroll/:id
```

**Path Parameters:**
- `id` (string, required): UUID da folha de pagamento

**Exemplo de Request:**
```typescript
const getPayroll = async (payrollId: string) => {
  const response = await fetch(
    `http://localhost:3000/payroll/${payrollId}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  return await response.json();
};
```

**Resposta de Sucesso (200 OK):**
```json
{
  "id": "uuid-da-folha",
  "companyId": "uuid-da-empresa",
  "referenceMonth": 11,
  "referenceYear": 2024,
  "type": "MONTHLY",
  "status": "CALCULATED",
  "startDate": "2024-11-01T00:00:00.000Z",
  "endDate": "2024-11-30T23:59:59.999Z",
  "paymentDate": "2024-12-05T00:00:00.000Z",
  "totalEarnings": "150000.00",
  "totalDeductions": "25000.00",
  "netAmount": "125000.00",
  "createdById": "uuid-usuario",
  "createdAt": "2024-11-01T10:00:00.000Z",
  "updatedAt": "2024-11-05T15:30:00.000Z",
  "approvedById": null,
  "approvedAt": null,
  "company": {
    "id": "uuid-empresa",
    "razaoSocial": "Empresa Exemplo LTDA",
    "cnpj": "12.345.678/0001-90"
  },
  "items": [
    {
      "id": "uuid-item-1",
      "payrollId": "uuid-da-folha",
      "employeeId": "uuid-colaborador-1",
      "workDays": 30,
      "totalEarnings": "5000.00",
      "totalDeductions": "850.00",
      "netAmount": "4150.00",
      "notes": null,
      "employee": {
        "id": "uuid-colaborador-1",
        "name": "João Silva",
        "cpf": "123.456.789-00",
        "admissionDate": "2020-01-15T00:00:00.000Z",
        "position": {
          "id": "uuid-cargo",
          "name": "Desenvolvedor Pleno"
        }
      },
      "earnings": [
        {
          "name": "Salário Base",
          "value": "4500.00"
        },
        {
          "name": "Vale Alimentação",
          "value": "500.00"
        }
      ],
      "deductions": [
        {
          "name": "INSS",
          "value": "495.00"
        },
        {
          "name": "IRRF",
          "value": "355.00"
        }
      ]
    }
  ],
  "createdBy": {
    "id": "uuid-usuario",
    "name": "Admin User"
  }
}
```

---

### 4. Atualizar Folha de Pagamento

```http
PATCH /payroll/:id
```

**Path Parameters:**
- `id` (string, required): UUID da folha de pagamento

**Body (JSON):**
```json
{
  "paymentDate": "2024-12-10",
  "notes": "Observações adicionais"
}
```

**Campos Atualizáveis:**
- `paymentDate` (string): Nova data de pagamento
- `notes` (string): Observações

**Restrições:**
- Apenas folhas com status `DRAFT` podem ser editadas
- `paymentDate` deve ser >= `endDate`

**Exemplo de Request:**
```typescript
const updatePayroll = async (payrollId: string) => {
  const response = await fetch(
    `http://localhost:3000/payroll/${payrollId}`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        paymentDate: '2024-12-10',
        notes: 'Data de pagamento ajustada'
      })
    }
  );

  return await response.json();
};
```

**Resposta de Sucesso (200 OK):**
```json
{
  "id": "uuid-da-folha",
  "paymentDate": "2024-12-10T00:00:00.000Z",
  "notes": "Data de pagamento ajustada",
  "updatedAt": "2024-11-09T11:30:00.000Z"
}
```

---

### 5. Calcular Folha de Pagamento

```http
POST /payroll/:id/calculate
```

**Path Parameters:**
- `id` (string, required): UUID da folha de pagamento

**Descrição:**
Este endpoint executa o cálculo automático da folha:
1. Busca todos os colaboradores ativos da empresa
2. Para cada colaborador:
   - Adiciona salário base (position.salary)
   - Adiciona proventos configurados (earnings do colaborador)
   - Calcula INSS (usando tabela fiscal)
   - Calcula IRRF (usando tabela fiscal)
   - Calcula FGTS (8% sobre salário)
   - Aplica descontos configurados
3. Cria/atualiza items da folha
4. Atualiza totalizadores
5. Muda status para `CALCULATED`

**Exemplo de Request:**
```typescript
const calculatePayroll = async (payrollId: string) => {
  const response = await fetch(
    `http://localhost:3000/payroll/${payrollId}/calculate`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  return await response.json();
};
```

**Resposta de Sucesso (200 OK):**
```json
{
  "id": "uuid-da-folha",
  "status": "CALCULATED",
  "totalEarnings": "150000.00",
  "totalDeductions": "25000.00",
  "netAmount": "125000.00",
  "itemsCount": 25,
  "updatedAt": "2024-11-09T12:00:00.000Z"
}
```

**Erros Comuns:**
- `400 Bad Request`: Folha não está em status `DRAFT`
- `404 Not Found`: Folha não encontrada
- `422 Unprocessable Entity`: Nenhum colaborador ativo encontrado

---

### 6. Adicionar/Ajustar Item da Folha

```http
POST /payroll/:id/items
```

**Path Parameters:**
- `id` (string, required): UUID da folha de pagamento

**Body (JSON):**
```json
{
  "employeeId": "uuid-do-colaborador",
  "workDays": 28,
  "earnings": [
    {
      "name": "Hora Extra",
      "value": 500.00
    },
    {
      "name": "Bônus",
      "value": 1000.00
    }
  ],
  "deductions": [
    {
      "name": "Vale Transporte",
      "value": 150.00
    }
  ],
  "notes": "Colaborador teve 2 dias de falta"
}
```

**Validações:**
- `employeeId`: deve ser um colaborador válido da empresa
- `workDays`: número entre 1 e 31
- `earnings`: array de proventos (nome + valor)
- `deductions`: array de descontos (nome + valor)

**Exemplo de Request:**
```typescript
const addPayrollItem = async (payrollId: string) => {
  const response = await fetch(
    `http://localhost:3000/payroll/${payrollId}/items`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        employeeId: 'uuid-colaborador',
        workDays: 28,
        earnings: [
          { name: 'Hora Extra', value: 500.00 }
        ],
        deductions: [
          { name: 'Vale Transporte', value: 150.00 }
        ],
        notes: 'Ajuste manual de horas extras'
      })
    }
  );

  return await response.json();
};
```

**Resposta de Sucesso (201 Created):**
```json
{
  "id": "uuid-novo-item",
  "payrollId": "uuid-da-folha",
  "employeeId": "uuid-colaborador",
  "workDays": 28,
  "totalEarnings": "5500.00",
  "totalDeductions": "1000.00",
  "netAmount": "4500.00",
  "earnings": [
    { "name": "Salário Base", "value": "5000.00" },
    { "name": "Hora Extra", "value": "500.00" }
  ],
  "deductions": [
    { "name": "INSS", "value": "550.00" },
    { "name": "IRRF", "value": "300.00" },
    { "name": "Vale Transporte", "value": "150.00" }
  ],
  "notes": "Ajuste manual de horas extras",
  "createdAt": "2024-11-09T13:00:00.000Z"
}
```

---

### 7. Aprovar Folha de Pagamento

```http
POST /payroll/:id/approve
```

**Path Parameters:**
- `id` (string, required): UUID da folha de pagamento

**Descrição:**
Aprova a folha de pagamento para pagamento. Apenas folhas com status `CALCULATED` podem ser aprovadas.

**Exemplo de Request:**
```typescript
const approvePayroll = async (payrollId: string) => {
  const response = await fetch(
    `http://localhost:3000/payroll/${payrollId}/approve`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  return await response.json();
};
```

**Resposta de Sucesso (200 OK):**
```json
{
  "id": "uuid-da-folha",
  "status": "APPROVED",
  "approvedById": "uuid-do-usuario",
  "approvedAt": "2024-11-09T14:00:00.000Z",
  "updatedAt": "2024-11-09T14:00:00.000Z"
}
```

**Erros Comuns:**
- `400 Bad Request`: Folha não está em status `CALCULATED`
- `403 Forbidden`: Usuário não tem permissão `payroll.approve`

---

### 8. Marcar Folha Como Paga

```http
POST /payroll/:id/pay
```

**Path Parameters:**
- `id` (string, required): UUID da folha de pagamento

**Descrição:**
Marca a folha como paga. Apenas folhas com status `APPROVED` podem ser marcadas como pagas.

**Exemplo de Request:**
```typescript
const markAsPaid = async (payrollId: string) => {
  const response = await fetch(
    `http://localhost:3000/payroll/${payrollId}/pay`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  return await response.json();
};
```

**Resposta de Sucesso (200 OK):**
```json
{
  "id": "uuid-da-folha",
  "status": "PAID",
  "updatedAt": "2024-11-09T15:00:00.000Z"
}
```

---

### 9. Excluir Folha de Pagamento

```http
DELETE /payroll/:id
```

**Path Parameters:**
- `id` (string, required): UUID da folha de pagamento

**Restrições:**
- Apenas folhas com status `DRAFT` podem ser excluídas

**Exemplo de Request:**
```typescript
const deletePayroll = async (payrollId: string) => {
  const response = await fetch(
    `http://localhost:3000/payroll/${payrollId}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  return response.status === 204;
};
```

**Resposta de Sucesso (204 No Content):**
Sem body de resposta.

---

### 10. Estatísticas da Folha

```http
GET /payroll/stats
```

**Query Parameters:**
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `referenceMonth` | number | Não | Filtrar por mês (1-12) |
| `referenceYear` | number | Não | Filtrar por ano |

**Exemplo de Request:**
```typescript
const getPayrollStats = async () => {
  const response = await fetch(
    'http://localhost:3000/payroll/stats?referenceMonth=11&referenceYear=2024',
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  return await response.json();
};
```

**Resposta de Sucesso (200 OK):**
```json
{
  "totalPayrolls": 12,
  "totalEmployees": 150,
  "totalEarnings": "1800000.00",
  "totalDeductions": "300000.00",
  "totalNetAmount": "1500000.00",
  "averageNetAmount": "10000.00",
  "byStatus": {
    "DRAFT": 2,
    "CALCULATED": 3,
    "APPROVED": 5,
    "PAID": 2
  },
  "byType": {
    "MONTHLY": 10,
    "WEEKLY": 0,
    "DAILY": 1,
    "ADVANCE": 1
  }
}
```

---

### 11. Baixar Holerite em PDF

```http
GET /payroll/:id/items/:itemId/payslip
```

**Path Parameters:**
- `id` (string, required): UUID da folha de pagamento
- `itemId` (string, required): UUID do item (colaborador)

**Descrição:**
Gera e retorna o PDF do holerite individual do colaborador.

**Formato do PDF:**
- Orientação: Retrato (A4)
- Conteúdo:
  - Dados da empresa
  - Dados do colaborador
  - Período de referência
  - Tabela de proventos
  - Tabela de descontos
  - Valor líquido destacado
  - Linhas de assinatura

**Exemplo de Request (Fetch API):**
```typescript
const downloadPayslip = async (
  payrollId: string, 
  itemId: string, 
  employeeName: string
) => {
  const response = await fetch(
    `http://localhost:3000/payroll/${payrollId}/items/${itemId}/payslip`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  if (!response.ok) {
    throw new Error('Erro ao baixar holerite');
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `holerite-${employeeName}-${new Date().toISOString().slice(0, 7)}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};
```

**Exemplo de Request (Axios):**
```typescript
import axios from 'axios';

const downloadPayslipAxios = async (
  payrollId: string, 
  itemId: string
) => {
  const response = await axios.get(
    `http://localhost:3000/payroll/${payrollId}/items/${itemId}/payslip`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      responseType: 'blob'
    }
  );

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `holerite-${itemId}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};
```

**Headers de Resposta:**
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="holerite-{itemId}.pdf"
```

---

### 13. Exportar Folha para Excel

```http
GET /payroll/:id/export/excel
```

**Path Parameters:**
- `id` (string, required): UUID da folha de pagamento

**Descrição:**
Exporta a folha de pagamento completa para um arquivo Excel (.xlsx) com duas abas:
1. **Folha de Pagamento**: Visão consolidada com todos os colaboradores
2. **Detalhamento por Colaborador**: Detalhamento individual de proventos e descontos

**Conteúdo do Excel:**

**Aba 1 - Folha de Pagamento:**
- Cabeçalho com dados da empresa
- Informações gerais (período, tipo, status, datas)
- Tabela com todos os colaboradores:
  - Nome, Cargo, CPF
  - Dias trabalhados
  - Total de proventos
  - Total de descontos
  - FGTS (8%)
  - Valor líquido
- Totalizadores com cores diferenciadas
- Informações de auditoria

**Aba 2 - Detalhamento por Colaborador:**
- Seção individual para cada colaborador
- Lista detalhada de todos os proventos
- Lista detalhada de todos os descontos
- Subtotais e valor líquido
- Observações (se houver)

**Exemplo de Request (Fetch API):**
```typescript
const exportToExcel = async (payrollId: string) => {
  const response = await fetch(
    `http://localhost:3000/payroll/${payrollId}/export/excel`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  if (!response.ok) {
    throw new Error('Erro ao exportar para Excel');
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `folha-pagamento-${new Date().toISOString().slice(0, 10)}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};
```

**Exemplo de Request (Axios):**
```typescript
import axios from 'axios';

const exportToExcelAxios = async (payrollId: string) => {
  const response = await axios.get(
    `http://localhost:3000/payroll/${payrollId}/export/excel`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      responseType: 'blob'
    }
  );

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  const date = new Date().toISOString().slice(0, 10);
  link.setAttribute('download', `folha-pagamento-${date}.xlsx`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
```

**Exemplo de Request (React Component):**
```tsx
import React, { useState } from 'react';

const ExportToExcelButton: React.FC<{ payrollId: string }> = ({ payrollId }) => {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3000/payroll/${payrollId}/export/excel`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (!response.ok) throw new Error('Erro ao exportar');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const date = new Date().toISOString().slice(0, 10);
      a.download = `folha-pagamento-${date}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao exportar para Excel');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleExport} disabled={loading}>
      {loading ? 'Exportando...' : 'Exportar Excel'}
    </button>
  );
};
```

**Headers de Resposta:**
```
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="folha-pagamento-{date}.xlsx"
```

---

### 12. Baixar Folha Consolidada em PDF

```http
GET /payroll/:id/pdf
```

**Path Parameters:**
- `id` (string, required): UUID da folha de pagamento

**Descrição:**
Gera e retorna o PDF consolidado da folha de pagamento com todos os colaboradores.

**Formato do PDF:**
- Orientação: Paisagem (A4)
- Conteúdo:
  - Dados da empresa
  - Informações gerais (período, tipo, status)
  - Tabela completa com todos os colaboradores
  - Totalizadores (proventos, descontos, líquido)
  - Informações de auditoria

**Exemplo de Request (Fetch API):**
```typescript
const downloadPayrollPDF = async (payrollId: string, monthYear: string) => {
  const response = await fetch(
    `http://localhost:3000/payroll/${payrollId}/pdf`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  if (!response.ok) {
    throw new Error('Erro ao baixar folha de pagamento');
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `folha-pagamento-${monthYear}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

// Uso
await downloadPayrollPDF('uuid-da-folha', '2024-11');
```

**Exemplo de Request (React Component):**
```tsx
import React, { useState } from 'react';

const DownloadPayrollButton: React.FC<{ payrollId: string }> = ({ payrollId }) => {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3000/payroll/${payrollId}/pdf`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (!response.ok) throw new Error('Erro ao baixar PDF');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `folha-pagamento-${payrollId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao baixar folha de pagamento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleDownload} disabled={loading}>
      {loading ? 'Baixando...' : 'Baixar PDF'}
    </button>
  );
};
```

---

## 💡 Exemplos de Integração

### Componente React: Lista de Folhas

```tsx
import React, { useEffect, useState } from 'react';

interface Payroll {
  id: string;
  referenceMonth: number;
  referenceYear: number;
  status: string;
  type: string;
  netAmount: string;
  itemsCount: number;
}

const PayrollList: React.FC = () => {
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchPayrolls();
  }, [page]);

  const fetchPayrolls = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3000/payroll?page=${page}&limit=20`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const data = await response.json();
      setPayrolls(data.data);
    } catch (error) {
      console.error('Erro ao buscar folhas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      DRAFT: 'bg-gray-200 text-gray-800',
      CALCULATED: 'bg-blue-200 text-blue-800',
      APPROVED: 'bg-green-200 text-green-800',
      PAID: 'bg-purple-200 text-purple-800'
    };
    
    return colors[status] || 'bg-gray-200';
  };

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(parseFloat(value));
  };

  const getMonthName = (month: number) => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return months[month - 1];
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Folhas de Pagamento</h1>
      
      <table className="min-w-full bg-white border">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2 border">Período</th>
            <th className="px-4 py-2 border">Tipo</th>
            <th className="px-4 py-2 border">Status</th>
            <th className="px-4 py-2 border">Colaboradores</th>
            <th className="px-4 py-2 border">Valor Líquido</th>
            <th className="px-4 py-2 border">Ações</th>
          </tr>
        </thead>
        <tbody>
          {payrolls.map((payroll) => (
            <tr key={payroll.id} className="hover:bg-gray-50">
              <td className="px-4 py-2 border">
                {getMonthName(payroll.referenceMonth)}/{payroll.referenceYear}
              </td>
              <td className="px-4 py-2 border">{payroll.type}</td>
              <td className="px-4 py-2 border">
                <span className={`px-2 py-1 rounded ${getStatusBadge(payroll.status)}`}>
                  {payroll.status}
                </span>
              </td>
              <td className="px-4 py-2 border text-center">
                {payroll.itemsCount}
              </td>
              <td className="px-4 py-2 border text-right">
                {formatCurrency(payroll.netAmount)}
              </td>
              <td className="px-4 py-2 border">
                <button className="text-blue-600 hover:underline mr-2">
                  Ver Detalhes
                </button>
                <button className="text-green-600 hover:underline">
                  Baixar PDF
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex justify-between">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Anterior
        </button>
        <span>Página {page}</span>
        <button
          onClick={() => setPage(p => p + 1)}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Próxima
        </button>
      </div>
    </div>
  );
};

export default PayrollList;
```

---

### Service TypeScript: Payroll API

```typescript
// payroll.service.ts

interface PayrollCreateDto {
  referenceMonth: number;
  referenceYear: number;
  type: 'MONTHLY' | 'WEEKLY' | 'DAILY' | 'ADVANCE';
  startDate: string;
  endDate: string;
  paymentDate: string;
}

interface PayrollItemDto {
  employeeId: string;
  workDays: number;
  earnings?: Array<{ name: string; value: number }>;
  deductions?: Array<{ name: string; value: number }>;
  notes?: string;
}

interface PayrollFilters {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
  referenceMonth?: number;
  referenceYear?: number;
}

class PayrollService {
  private baseUrl = 'http://localhost:3000/payroll';
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    };
  }

  async list(filters?: PayrollFilters) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }

    const url = `${this.baseUrl}?${params.toString()}`;
    const response = await fetch(url, {
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Erro ao listar folhas: ${response.statusText}`);
    }

    return await response.json();
  }

  async getById(id: string) {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar folha: ${response.statusText}`);
    }

    return await response.json();
  }

  async create(data: PayrollCreateDto) {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao criar folha');
    }

    return await response.json();
  }

  async update(id: string, data: Partial<PayrollCreateDto>) {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao atualizar folha');
    }

    return await response.json();
  }

  async calculate(id: string) {
    const response = await fetch(`${this.baseUrl}/${id}/calculate`, {
      method: 'POST',
      headers: this.getHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao calcular folha');
    }

    return await response.json();
  }

  async addItem(id: string, data: PayrollItemDto) {
    const response = await fetch(`${this.baseUrl}/${id}/items`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao adicionar item');
    }

    return await response.json();
  }

  async approve(id: string) {
    const response = await fetch(`${this.baseUrl}/${id}/approve`, {
      method: 'POST',
      headers: this.getHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao aprovar folha');
    }

    return await response.json();
  }

  async markAsPaid(id: string) {
    const response = await fetch(`${this.baseUrl}/${id}/pay`, {
      method: 'POST',
      headers: this.getHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao marcar como paga');
    }

    return await response.json();
  }

  async delete(id: string) {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao excluir folha');
    }

    return true;
  }

  async getStats(referenceMonth?: number, referenceYear?: number) {
    const params = new URLSearchParams();
    if (referenceMonth) params.append('referenceMonth', referenceMonth.toString());
    if (referenceYear) params.append('referenceYear', referenceYear.toString());

    const url = `${this.baseUrl}/stats?${params.toString()}`;
    const response = await fetch(url, {
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar estatísticas: ${response.statusText}`);
    }

    return await response.json();
  }

  async downloadPayslip(payrollId: string, itemId: string, filename?: string) {
    const response = await fetch(
      `${this.baseUrl}/${payrollId}/items/${itemId}/payslip`,
      {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Erro ao baixar holerite');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `holerite-${itemId}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  async downloadPayrollPDF(payrollId: string, filename?: string) {
    const response = await fetch(
      `${this.baseUrl}/${payrollId}/pdf`,
      {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Erro ao baixar folha de pagamento');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `folha-pagamento-${payrollId}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}

export default PayrollService;

// Uso:
// const payrollService = new PayrollService(token);
// await payrollService.list({ status: 'CALCULATED' });
// await payrollService.downloadPayslip('payroll-id', 'item-id');
```

---

### Hook React: usePayroll

```typescript
// hooks/usePayroll.ts

import { useState, useEffect } from 'react';
import PayrollService from '../services/payroll.service';

export const usePayroll = (payrollId?: string) => {
  const [payroll, setPayroll] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem('token') || '';
  const service = new PayrollService(token);

  const fetchPayroll = async () => {
    if (!payrollId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await service.getById(payrollId);
      setPayroll(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayroll();
  }, [payrollId]);

  const calculate = async () => {
    if (!payrollId) return;

    setLoading(true);
    setError(null);

    try {
      await service.calculate(payrollId);
      await fetchPayroll();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const approve = async () => {
    if (!payrollId) return;

    setLoading(true);
    setError(null);

    try {
      await service.approve(payrollId);
      await fetchPayroll();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const markAsPaid = async () => {
    if (!payrollId) return;

    setLoading(true);
    setError(null);

    try {
      await service.markAsPaid(payrollId);
      await fetchPayroll();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    if (!payrollId) return;

    try {
      await service.downloadPayrollPDF(payrollId);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return {
    payroll,
    loading,
    error,
    calculate,
    approve,
    markAsPaid,
    downloadPDF,
    refresh: fetchPayroll
  };
};

// Uso:
// const { payroll, loading, calculate, downloadPDF } = usePayroll('payroll-id');
```

---

## ⚠️ Tratamento de Erros

### Códigos de Status HTTP

| Código | Descrição | Tratamento Sugerido |
|--------|-----------|---------------------|
| `200` | Sucesso | Processar resposta normalmente |
| `201` | Criado com sucesso | Redirecionar ou atualizar lista |
| `204` | Sem conteúdo (DELETE) | Confirmar exclusão |
| `400` | Requisição inválida | Mostrar mensagem de erro ao usuário |
| `401` | Não autenticado | Redirecionar para login |
| `403` | Sem permissão | Mostrar mensagem de permissão negada |
| `404` | Não encontrado | Mostrar mensagem "recurso não encontrado" |
| `422` | Dados inválidos | Mostrar erros de validação |
| `500` | Erro no servidor | Mostrar mensagem genérica e tentar novamente |

### Estrutura de Erro Padrão

```json
{
  "statusCode": 400,
  "message": "Descrição do erro",
  "error": "Bad Request"
}
```

### Exemplo de Tratamento

```typescript
const handleApiError = (error: any) => {
  if (error.response) {
    // Erro com resposta do servidor
    switch (error.response.status) {
      case 400:
        alert(`Erro: ${error.response.data.message}`);
        break;
      case 401:
        alert('Sessão expirada. Faça login novamente.');
        window.location.href = '/login';
        break;
      case 403:
        alert('Você não tem permissão para esta ação.');
        break;
      case 404:
        alert('Recurso não encontrado.');
        break;
      case 422:
        // Erros de validação
        const errors = error.response.data.message;
        alert(`Dados inválidos: ${Array.isArray(errors) ? errors.join(', ') : errors}`);
        break;
      default:
        alert('Erro ao processar requisição. Tente novamente.');
    }
  } else if (error.request) {
    // Requisição foi feita mas sem resposta
    alert('Erro de conexão. Verifique sua internet.');
  } else {
    // Erro na configuração da requisição
    alert(`Erro: ${error.message}`);
  }
};
```

---

## 🔄 Fluxo de Trabalho Recomendado

### Workflow Completo da Folha

```typescript
// 1. Criar nova folha
const newPayroll = await payrollService.create({
  referenceMonth: 11,
  referenceYear: 2024,
  type: 'MONTHLY',
  startDate: '2024-11-01',
  endDate: '2024-11-30',
  paymentDate: '2024-12-05'
});

console.log('Folha criada:', newPayroll.id);

// 2. Calcular automaticamente (gera items para todos os colaboradores)
await payrollService.calculate(newPayroll.id);
console.log('Folha calculada!');

// 3. Buscar detalhes para revisão
const payroll = await payrollService.getById(newPayroll.id);
console.log('Total de colaboradores:', payroll.items.length);
console.log('Valor líquido total:', payroll.netAmount);

// 4. (Opcional) Ajustar item específico
if (needsAdjustment) {
  await payrollService.addItem(newPayroll.id, {
    employeeId: 'employee-uuid',
    workDays: 28,
    earnings: [{ name: 'Hora Extra', value: 500 }],
    notes: 'Ajuste de horas extras'
  });
}

// 5. Gerar holerites em PDF (para todos ou individuais)
for (const item of payroll.items) {
  await payrollService.downloadPayslip(
    newPayroll.id,
    item.id,
    `holerite-${item.employee.name}.pdf`
  );
}

// 6. Aprovar a folha
await payrollService.approve(newPayroll.id);
console.log('Folha aprovada!');

// 7. Baixar folha consolidada
await payrollService.downloadPayrollPDF(
  newPayroll.id,
  'folha-pagamento-novembro-2024.pdf'
);

// 8. Após realizar os pagamentos, marcar como paga
await payrollService.markAsPaid(newPayroll.id);
console.log('Folha marcada como paga!');
```

---

## 📊 Dashboard de Estatísticas

```tsx
import React, { useEffect, useState } from 'react';
import PayrollService from '../services/payroll.service';

const PayrollDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const token = localStorage.getItem('token') || '';
  const service = new PayrollService(token);

  useEffect(() => {
    loadStats();
  }, [month, year]);

  const loadStats = async () => {
    try {
      const data = await service.getStats(month, year);
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(parseFloat(value));
  };

  if (!stats) return <div>Carregando...</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard de Folha de Pagamento</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-gray-500 text-sm">Total de Folhas</h3>
          <p className="text-2xl font-bold">{stats.totalPayrolls}</p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-gray-500 text-sm">Colaboradores</h3>
          <p className="text-2xl font-bold">{stats.totalEmployees}</p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-gray-500 text-sm">Total de Proventos</h3>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(stats.totalEarnings)}
          </p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-gray-500 text-sm">Valor Líquido</h3>
          <p className="text-2xl font-bold text-blue-600">
            {formatCurrency(stats.totalNetAmount)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-4">Por Status</h3>
          <ul>
            <li className="flex justify-between py-2 border-b">
              <span>Rascunho</span>
              <span className="font-bold">{stats.byStatus.DRAFT}</span>
            </li>
            <li className="flex justify-between py-2 border-b">
              <span>Calculada</span>
              <span className="font-bold">{stats.byStatus.CALCULATED}</span>
            </li>
            <li className="flex justify-between py-2 border-b">
              <span>Aprovada</span>
              <span className="font-bold">{stats.byStatus.APPROVED}</span>
            </li>
            <li className="flex justify-between py-2">
              <span>Paga</span>
              <span className="font-bold">{stats.byStatus.PAID}</span>
            </li>
          </ul>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-4">Por Tipo</h3>
          <ul>
            <li className="flex justify-between py-2 border-b">
              <span>Mensal</span>
              <span className="font-bold">{stats.byType.MONTHLY}</span>
            </li>
            <li className="flex justify-between py-2 border-b">
              <span>Semanal</span>
              <span className="font-bold">{stats.byType.WEEKLY}</span>
            </li>
            <li className="flex justify-between py-2 border-b">
              <span>Diária</span>
              <span className="font-bold">{stats.byType.DAILY}</span>
            </li>
            <li className="flex justify-between py-2">
              <span>Adiantamento</span>
              <span className="font-bold">{stats.byType.ADVANCE}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PayrollDashboard;
```

---

## 🎓 Boas Práticas

### 1. **Cache de Token**
```typescript
// Armazene o token de forma segura
localStorage.setItem('token', token); // Para web
// ou AsyncStorage para React Native
```

### 2. **Loading States**
```typescript
const [loading, setLoading] = useState(false);

const handleAction = async () => {
  setLoading(true);
  try {
    await payrollService.calculate(id);
  } finally {
    setLoading(false);
  }
};
```

### 3. **Error Boundaries**
```tsx
<ErrorBoundary>
  <PayrollList />
</ErrorBoundary>
```

### 4. **Validação Client-Side**
```typescript
const validatePayrollData = (data: PayrollCreateDto) => {
  const errors: string[] = [];

  if (data.referenceMonth < 1 || data.referenceMonth > 12) {
    errors.push('Mês deve estar entre 1 e 12');
  }

  if (new Date(data.paymentDate) < new Date(data.endDate)) {
    errors.push('Data de pagamento deve ser após o fim do período');
  }

  return errors;
};
```

### 5. **Debounce em Buscas**
```typescript
import { debounce } from 'lodash';

const searchPayrolls = debounce(async (term: string) => {
  const results = await payrollService.list({ search: term });
  setResults(results);
}, 300);
```

---

## 📞 Suporte

Para dúvidas ou problemas com a API:
- **Email**: suporte@empresa.com
- **Documentação Técnica**: `/docs/PAYROLL_MANAGEMENT.md`
- **Implementação**: `/docs/PAYROLL_PDF_IMPLEMENTATION.md`

---

## 📝 Changelog

### v1.0.0 (09/11/2024)
- ✅ Implementação inicial completa
- ✅ Geração de PDFs com Puppeteer
- ✅ Endpoints de CRUD
- ✅ Workflow de aprovação
- ✅ Estatísticas e dashboard

---

**Documentação criada em:** 09 de novembro de 2024  
**Versão da API:** 1.0.0  
**Última atualização:** 09/11/2024
