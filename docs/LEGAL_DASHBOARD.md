# 📊 Dashboard Jurídico - Documentação de Endpoints

## 🎯 Visão Geral

A Dashboard Jurídica oferece uma visão completa e analítica de todos os documentos jurídicos da empresa, com métricas, alertas e visualizações em tempo real.

---

## 📡 Endpoints da Dashboard

### 1. Dashboard Completa

```
GET /legal/dashboard
```

**Permissão:** `legal.read`

**Descrição:** Retorna todas as métricas, estatísticas e alertas da dashboard em uma única chamada.

**Resposta:**
```json
{
  "overview": {
    "total": 25,              // Total de documentos
    "contracts": 15,          // Total de contratos
    "processes": 10,          // Total de processos
    "active": 20,             // Documentos ativos
    "thisMonth": 3,           // Criados este mês
    "thisYear": 25            // Criados este ano
  },
  "values": {
    "total": 500000.00,       // Valor total de todos os documentos
    "contracts": 350000.00,   // Valor total dos contratos
    "processes": 150000.00    // Valor total dos processos
  },
  "byStatus": [
    { "status": "ATIVO", "count": 20 },
    { "status": "CONCLUIDO", "count": 3 },
    { "status": "SUSPENSO", "count": 1 },
    { "status": "ARQUIVADO", "count": 1 }
  ],
  "byType": [
    { "type": "CONTRATO", "count": 15 },
    { "type": "PROCESSO_TRABALHISTA", "count": 7 },
    { "type": "PROCESSO_CIVIL", "count": 2 },
    { "type": "PROCESSO_CRIMINAL", "count": 1 }
  ],
  "byCategory": [
    {
      "categoryId": "uuid-1",
      "categoryName": "Contratos Comerciais",
      "count": 10
    },
    {
      "categoryId": "uuid-2",
      "categoryName": "Processos Trabalhistas",
      "count": 7
    }
  ],
  "alerts": {
    "expired": [
      {
        "id": "uuid",
        "title": "Contrato Fornecedor XYZ",
        "reference": "CONT-2024-050",
        "type": "CONTRATO",
        "dueDate": "2025-10-15T00:00:00.000Z",
        "value": 25000.00
      }
    ],
    "expiringSoon30": [
      {
        "id": "uuid",
        "title": "Contrato Prestação ABC",
        "reference": "CONT-2025-020",
        "type": "CONTRATO",
        "dueDate": "2025-12-05T00:00:00.000Z",
        "value": 30000.00
      }
    ],
    "expiringSoon60": [
      {
        "id": "uuid",
        "title": "Processo Trabalhista #12345",
        "reference": "PROC-2025-001",
        "type": "PROCESSO_TRABALHISTA",
        "dueDate": "2026-01-15T00:00:00.000Z"
      }
    ]
  },
  "recentDocuments": [
    {
      "id": "uuid",
      "title": "Novo Contrato",
      "type": "CONTRATO",
      "status": "ATIVO",
      "reference": "CONT-2025-030",
      "value": 15000.00,
      "category": {
        "id": "uuid",
        "name": "Contratos Comerciais"
      },
      "createdBy": {
        "id": "uuid",
        "name": "João Silva",
        "email": "joao@empresa.com"
      },
      "createdAt": "2025-11-08T10:30:00.000Z"
    }
  ],
  "monthlyData": [
    { "month": "jun/2025", "count": 5 },
    { "month": "jul/2025", "count": 3 },
    { "month": "ago/2025", "count": 4 },
    { "month": "set/2025", "count": 6 },
    { "month": "out/2025", "count": 4 },
    { "month": "nov/2025", "count": 3 }
  ]
}
```

**Exemplo de uso:**
```bash
curl -X GET http://localhost:4000/legal/dashboard \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-company-id: $COMPANY_ID"
```

---

### 2. Documentos Vencendo

```
GET /legal/documents/expiring?days=30
```

**Permissão:** `legal.read`

**Query Parameters:**
- `days` (opcional, padrão: 30) - Número de dias à frente para verificar vencimentos

**Descrição:** Retorna todos os documentos ativos que vencerão nos próximos X dias.

**Resposta:**
```json
[
  {
    "id": "uuid",
    "companyId": "uuid",
    "categoryId": "uuid",
    "documentId": "uuid",
    "type": "CONTRATO",
    "title": "Contrato Fornecedor ABC",
    "description": "Contrato anual de prestação de serviços",
    "reference": "CONT-2025-010",
    "parties": [
      {
        "name": "Empresa ABC Ltda",
        "role": "Fornecedor",
        "document": "12.345.678/0001-90",
        "contact": "contato@abc.com"
      }
    ],
    "startDate": "2025-01-01T00:00:00.000Z",
    "endDate": "2025-12-31T23:59:59.000Z",
    "dueDate": "2025-12-01T00:00:00.000Z",
    "status": "ATIVO",
    "value": 30000.00,
    "currency": "BRL",
    "notes": "Renovação automática se não cancelado com 30 dias de antecedência",
    "tags": ["fornecedor", "servicos", "anual"],
    "alertDays": 30,
    "daysUntilExpiration": 22,  // Calculado automaticamente
    "document": {
      "id": "uuid",
      "name": "Contrato ABC 2025",
      "fileName": "contrato-abc-2025.pdf",
      "filePath": "/uploads/documents/...",
      "fileSize": 524288,
      "mimeType": "application/pdf",
      "fileExtension": ".pdf"
    },
    "category": {
      "id": "uuid",
      "name": "Contratos Comerciais",
      "color": "#3B82F6"
    },
    "createdBy": {
      "id": "uuid",
      "name": "Maria Santos",
      "email": "maria@empresa.com"
    },
    "active": true,
    "createdAt": "2025-01-15T09:00:00.000Z",
    "updatedAt": "2025-01-15T09:00:00.000Z"
  }
]
```

**Exemplos:**
```bash
# Vencendo em 30 dias
curl -X GET "http://localhost:4000/legal/documents/expiring?days=30" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-company-id: $COMPANY_ID"

# Vencendo em 60 dias
curl -X GET "http://localhost:4000/legal/documents/expiring?days=60" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-company-id: $COMPANY_ID"

# Vencendo em 7 dias (urgente)
curl -X GET "http://localhost:4000/legal/documents/expiring?days=7" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-company-id: $COMPANY_ID"
```

---

### 3. Documentos Vencidos

```
GET /legal/documents/expired
```

**Permissão:** `legal.read`

**Descrição:** Retorna todos os documentos ativos que já venceram (dueDate < hoje).

**Resposta:**
```json
[
  {
    "id": "uuid",
    "title": "Contrato Vencido XYZ",
    "type": "CONTRATO",
    "status": "ATIVO",
    "reference": "CONT-2024-050",
    "dueDate": "2025-10-15T00:00:00.000Z",
    "value": 25000.00,
    "document": { ... },
    "category": { ... },
    "createdBy": { ... }
  }
]
```

**Exemplo:**
```bash
curl -X GET http://localhost:4000/legal/documents/expired \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-company-id: $COMPANY_ID"
```

---

### 4. Documentos por Valor

```
GET /legal/documents/by-value?minValue=10000&maxValue=100000
```

**Permissão:** `legal.read`

**Query Parameters:**
- `minValue` (opcional) - Valor mínimo
- `maxValue` (opcional) - Valor máximo

**Descrição:** Filtra documentos por faixa de valor.

**Resposta:** Lista de documentos ordenados por valor (decrescente)

**Exemplos:**
```bash
# Documentos acima de R$ 50.000
curl -X GET "http://localhost:4000/legal/documents/by-value?minValue=50000" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-company-id: $COMPANY_ID"

# Documentos entre R$ 10.000 e R$ 100.000
curl -X GET "http://localhost:4000/legal/documents/by-value?minValue=10000&maxValue=100000" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-company-id: $COMPANY_ID"

# Documentos abaixo de R$ 5.000
curl -X GET "http://localhost:4000/legal/documents/by-value?maxValue=5000" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-company-id: $COMPANY_ID"
```

---

### 5. Timeline de Documentos

```
GET /legal/documents/timeline?year=2025
```

**Permissão:** `legal.read`

**Query Parameters:**
- `year` (opcional, padrão: ano atual) - Ano para visualizar

**Descrição:** Retorna todos os documentos que possuem datas (início, fim ou vencimento) no ano especificado.

**Resposta:**
```json
[
  {
    "id": "uuid",
    "title": "Contrato Anual 2025",
    "type": "CONTRATO",
    "status": "ATIVO",
    "reference": "CONT-2025-001",
    "startDate": "2025-01-01T00:00:00.000Z",
    "endDate": "2025-12-31T23:59:59.000Z",
    "dueDate": "2025-12-31T23:59:59.000Z",
    "value": 50000.00
  },
  {
    "id": "uuid",
    "title": "Processo Trabalhista",
    "type": "PROCESSO_TRABALHISTA",
    "status": "ATIVO",
    "reference": "PROC-2025-010",
    "startDate": "2025-03-15T00:00:00.000Z",
    "endDate": null,
    "dueDate": "2025-08-30T00:00:00.000Z",
    "value": 15000.00
  }
]
```

**Exemplos:**
```bash
# Timeline do ano atual
curl -X GET http://localhost:4000/legal/documents/timeline \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-company-id: $COMPANY_ID"

# Timeline de 2024
curl -X GET "http://localhost:4000/legal/documents/timeline?year=2024" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-company-id: $COMPANY_ID"
```

---

### 6. Estatísticas Básicas

```
GET /legal/documents/statistics
```

**Permissão:** `legal.read`

**Descrição:** Retorna estatísticas básicas (versão simplificada da dashboard).

**Resposta:**
```json
{
  "total": 25,
  "byType": [
    { "type": "CONTRATO", "_count": 15 },
    { "type": "PROCESSO_TRABALHISTA", "_count": 7 },
    { "type": "PROCESSO_CIVIL", "_count": 2 },
    { "type": "PROCESSO_CRIMINAL", "_count": 1 }
  ],
  "byStatus": [
    { "status": "ATIVO", "_count": 20 },
    { "status": "CONCLUIDO", "_count": 3 },
    { "status": "SUSPENSO", "_count": 1 },
    { "status": "ARQUIVADO", "_count": 1 }
  ],
  "expiringSoon": [
    {
      "id": "uuid",
      "title": "Contrato ABC",
      "reference": "CONT-2025-001",
      "dueDate": "2025-12-01T00:00:00.000Z",
      "type": "CONTRATO"
    }
  ]
}
```

---

## 📊 Componentes da Dashboard

### Cards de Visão Geral
- **Total de Documentos**: Quantidade total de documentos ativos
- **Contratos**: Quantidade de contratos
- **Processos**: Quantidade de processos (trabalhistas, cíveis, criminais)
- **Documentos Ativos**: Documentos com status ATIVO
- **Este Mês**: Documentos criados no mês atual
- **Este Ano**: Documentos criados no ano atual

### Valores Financeiros
- **Valor Total**: Soma de todos os valores de documentos
- **Valor em Contratos**: Soma dos valores de contratos
- **Valor em Processos**: Soma dos valores de processos

### Gráficos
- **Por Status**: Distribuição de documentos por status (pizza/donut)
- **Por Tipo**: Distribuição de documentos por tipo (barra)
- **Por Categoria**: Distribuição por categoria (barra horizontal)
- **Mensal**: Documentos criados nos últimos 6 meses (linha)

### Alertas
- **🔴 Vencidos**: Documentos que já passaram da data de vencimento
- **🟡 Vencendo em 30 dias**: Alertas de média prioridade
- **🟢 Vencendo em 60 dias**: Alertas de baixa prioridade

### Documentos Recentes
- Lista dos 5 documentos mais recentemente criados

---

## 🎨 Exemplo de Integração Frontend

### React/Next.js

```tsx
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface DashboardData {
  overview: {
    total: number;
    contracts: number;
    processes: number;
    active: number;
    thisMonth: number;
    thisYear: number;
  };
  values: {
    total: number;
    contracts: number;
    processes: number;
  };
  byStatus: Array<{ status: string; count: number }>;
  byType: Array<{ type: string; count: number }>;
  byCategory: Array<{ categoryId: string; categoryName: string; count: number }>;
  alerts: {
    expired: any[];
    expiringSoon30: any[];
    expiringSoon60: any[];
  };
  recentDocuments: any[];
  monthlyData: Array<{ month: string; count: number }>;
}

export function LegalDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const response = await api.get('/legal/dashboard');
      setData(response.data);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div>Carregando...</div>;
  if (!data) return <div>Erro ao carregar dados</div>;

  return (
    <div className="dashboard">
      {/* Cards de Visão Geral */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <Card title="Total" value={data.overview.total} />
        <Card title="Contratos" value={data.overview.contracts} />
        <Card title="Processos" value={data.overview.processes} />
        <Card title="Ativos" value={data.overview.active} />
        <Card title="Este Mês" value={data.overview.thisMonth} />
        <Card title="Este Ano" value={data.overview.thisYear} />
      </div>

      {/* Valores Financeiros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <ValueCard 
          title="Valor Total" 
          value={data.values.total} 
          currency="BRL"
        />
        <ValueCard 
          title="Contratos" 
          value={data.values.contracts} 
          currency="BRL"
        />
        <ValueCard 
          title="Processos" 
          value={data.values.processes} 
          currency="BRL"
        />
      </div>

      {/* Alertas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <AlertCard 
          title="Vencidos" 
          count={data.alerts.expired.length}
          items={data.alerts.expired}
          severity="error"
        />
        <AlertCard 
          title="Vencendo em 30 dias" 
          count={data.alerts.expiringSoon30.length}
          items={data.alerts.expiringSoon30}
          severity="warning"
        />
        <AlertCard 
          title="Vencendo em 60 dias" 
          count={data.alerts.expiringSoon60.length}
          items={data.alerts.expiringSoon60}
          severity="info"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <PieChart 
          title="Por Status" 
          data={data.byStatus} 
        />
        <BarChart 
          title="Por Tipo" 
          data={data.byType} 
        />
      </div>

      {/* Gráfico de linha - Documentos por mês */}
      <div className="mb-6">
        <LineChart 
          title="Documentos Criados (Últimos 6 meses)" 
          data={data.monthlyData} 
        />
      </div>

      {/* Documentos Recentes */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Documentos Recentes</h3>
        <DocumentsList documents={data.recentDocuments} />
      </div>
    </div>
  );
}
```

---

## 🔔 Sistema de Alertas

### Níveis de Prioridade

1. **🔴 Crítico (Vencidos)**
   - Documentos ativos com `dueDate < hoje`
   - Requer ação imediata
   - Cor: Vermelho (#EF4444)

2. **🟡 Alerta (30 dias)**
   - Documentos vencendo em até 30 dias
   - Requer atenção
   - Cor: Amarelo (#F59E0B)

3. **🟢 Informação (60 dias)**
   - Documentos vencendo em 31-60 dias
   - Planejamento futuro
   - Cor: Azul (#3B82F6)

### Automação de Alertas

```typescript
// Exemplo de verificação diária (pode ser implementado como cron job)
async function checkExpiringDocuments() {
  const dashboard = await api.get('/legal/dashboard');
  
  // Notificar vencidos
  if (dashboard.alerts.expired.length > 0) {
    await sendNotification({
      type: 'critical',
      title: `${dashboard.alerts.expired.length} documento(s) vencido(s)`,
      documents: dashboard.alerts.expired,
    });
  }
  
  // Notificar vencendo em 30 dias
  if (dashboard.alerts.expiringSoon30.length > 0) {
    await sendNotification({
      type: 'warning',
      title: `${dashboard.alerts.expiringSoon30.length} documento(s) vencendo em 30 dias`,
      documents: dashboard.alerts.expiringSoon30,
    });
  }
}
```

---

## 📈 Métricas Disponíveis

### Quantitativas
- Total de documentos
- Documentos por tipo
- Documentos por status
- Documentos por categoria
- Documentos por período (dia, mês, ano)

### Financeiras
- Valor total de contratos
- Valor total de processos
- Valor médio por documento
- Valor por categoria

### Temporais
- Documentos vencidos
- Documentos vencendo (30/60 dias)
- Timeline anual
- Tendência mensal de criação

### Operacionais
- Documentos ativos vs inativos
- Taxa de conclusão
- Tempo médio de duração
- Documentos por responsável

---

## ✅ Status da Implementação

**Dashboard:** 🟢 Implementada e testada

**Endpoints disponíveis:**
- ✅ `/legal/dashboard` - Dashboard completa
- ✅ `/legal/documents/expiring` - Vencendo
- ✅ `/legal/documents/expired` - Vencidos
- ✅ `/legal/documents/by-value` - Por valor
- ✅ `/legal/documents/timeline` - Timeline
- ✅ `/legal/documents/statistics` - Estatísticas básicas

**Status:** 🟢 **PRODUCTION READY**
