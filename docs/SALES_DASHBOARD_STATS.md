# 📊 Dashboard de Vendas - Estatísticas

## Endpoint

```
GET /sales/dashboard/stats
```

**Requer:** Token JWT + Company ID no header

---

## Descrição

Retorna estatísticas consolidadas para o dashboard administrativo, incluindo:

1. **Vendas do mês** (total em R$ + variação com mês anterior)
2. **Produtos ativos** (quantidade + variação)
3. **Clientes** (quantidade total + variação)
4. **Ticket médio** (valor médio + variação)
5. **Vendas recentes** (últimas 4 vendas confirmadas)
6. **Produtos mais vendidos** (top 4 produtos do mês)

---

## Request

```http
GET /sales/dashboard/stats HTTP/1.1
Authorization: Bearer <token>
x-company-id: <company-uuid>
```

---

## Response (200 OK)

```json
{
  "period": {
    "currentMonth": {
      "start": "2025-11-01T00:00:00.000Z",
      "end": "2025-11-30T23:59:59.999Z"
    },
    "previousMonth": {
      "start": "2025-10-01T00:00:00.000Z",
      "end": "2025-10-31T23:59:59.999Z"
    }
  },
  "metrics": {
    "sales": {
      "current": 125000.50,
      "previous": 98000.00,
      "change": 27.55,
      "changePercent": "+27.55%"
    },
    "products": {
      "current": 48,
      "previous": 45,
      "change": 6.67,
      "changePercent": "+6.67%"
    },
    "customers": {
      "current": 128,
      "previous": 115,
      "change": 11.30,
      "changePercent": "+11.30%"
    },
    "averageTicket": {
      "current": 2500.01,
      "previous": 2200.00,
      "change": 13.64,
      "changePercent": "+13.64%"
    }
  },
  "recentSales": [
    {
      "id": "uuid-1",
      "code": "VEN-2025-0042",
      "customer": {
        "id": "uuid-customer",
        "name": "João Silva",
        "cpf": "12345678900",
        "cnpj": null
      },
      "totalAmount": 3500.00,
      "installments": 3,
      "paymentMethod": {
        "id": "uuid-payment",
        "name": "Cartão de Crédito"
      },
      "confirmedAt": "2025-11-10T14:30:00.000Z",
      "status": "CONFIRMED"
    },
    {
      "id": "uuid-2",
      "code": "VEN-2025-0041",
      "customer": {
        "id": "uuid-customer-2",
        "name": "Maria Santos",
        "cpf": null,
        "cnpj": "12345678000190"
      },
      "totalAmount": 8500.00,
      "installments": 1,
      "paymentMethod": {
        "id": "uuid-payment-2",
        "name": "PIX"
      },
      "confirmedAt": "2025-11-09T16:45:00.000Z",
      "status": "CONFIRMED"
    }
  ],
  "topProducts": [
    {
      "product": {
        "id": "uuid-product-1",
        "name": "Notebook Dell Inspiron 15",
        "sku": "NB-DELL-001",
        "salePrice": 3500.00,
        "currentStock": 12
      },
      "quantitySold": 25,
      "salesCount": 20
    },
    {
      "product": {
        "id": "uuid-product-2",
        "name": "Mouse Logitech MX Master 3",
        "sku": "MS-LGT-001",
        "salePrice": 450.00,
        "currentStock": 45
      },
      "quantitySold": 18,
      "salesCount": 15
    }
  ]
}
```

---

## Estrutura da Resposta

### `period`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `currentMonth.start` | Date | Data de início do mês atual |
| `currentMonth.end` | Date | Data de fim do mês atual |
| `previousMonth.start` | Date | Data de início do mês anterior |
| `previousMonth.end` | Date | Data de fim do mês anterior |

### `metrics.sales`

| Campo | Tipo | Descrição | Exemplo |
|-------|------|-----------|---------|
| `current` | number | Total de vendas confirmadas no mês atual (R$) | 125000.50 |
| `previous` | number | Total de vendas do mês anterior (R$) | 98000.00 |
| `change` | number | Variação percentual | 27.55 |
| `changePercent` | string | Variação formatada | "+27.55%" |

**Cálculo:**
```typescript
change = ((current - previous) / previous) * 100
```

### `metrics.products`

| Campo | Tipo | Descrição | Exemplo |
|-------|------|-----------|---------|
| `current` | number | Produtos ativos (active=true, stock>0) | 48 |
| `previous` | number | Produtos ativos no mês anterior | 45 |
| `change` | number | Variação percentual | 6.67 |
| `changePercent` | string | Variação formatada | "+6.67%" |

### `metrics.customers`

| Campo | Tipo | Descrição | Exemplo |
|-------|------|-----------|---------|
| `current` | number | Total de clientes ativos | 128 |
| `previous` | number | Clientes ativos até o mês anterior | 115 |
| `change` | number | Variação percentual | 11.30 |
| `changePercent` | string | Variação formatada | "+11.30%" |

### `metrics.averageTicket`

| Campo | Tipo | Descrição | Exemplo |
|-------|------|-----------|---------|
| `current` | number | Ticket médio do mês atual (R$) | 2500.01 |
| `previous` | number | Ticket médio do mês anterior (R$) | 2200.00 |
| `change` | number | Variação percentual | 13.64 |
| `changePercent` | string | Variação formatada | "+13.64%" |

**Cálculo:**
```typescript
averageTicket = totalSales / numberOfSales
```

### `recentSales[]`

Array com as 4 vendas confirmadas mais recentes:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | string | ID da venda |
| `code` | string | Código da venda (VEN-YYYY-####) |
| `customer` | object | Dados do cliente |
| `totalAmount` | number | Valor total da venda |
| `installments` | number | Número de parcelas |
| `paymentMethod` | object | Método de pagamento |
| `confirmedAt` | Date | Data de confirmação |
| `status` | string | Status (sempre CONFIRMED) |

### `topProducts[]`

Array com os 4 produtos mais vendidos no mês:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `product` | object | Dados do produto |
| `quantitySold` | number | Quantidade total vendida no mês |
| `salesCount` | number | Número de vendas que incluíram o produto |

---

## Exemplos de Uso

### cURL

```bash
curl -X GET "http://localhost:4000/sales/dashboard/stats" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-company-id: $COMPANY_ID"
```

### JavaScript (Fetch)

```javascript
async function getDashboardStats() {
  const token = localStorage.getItem('access_token');
  const companyId = localStorage.getItem('company_id');

  const response = await fetch('/sales/dashboard/stats', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-company-id': companyId,
    },
  });

  if (!response.ok) {
    throw new Error('Erro ao carregar estatísticas');
  }

  return await response.json();
}
```

### TypeScript (Axios)

```typescript
import axios from 'axios';

interface DashboardStats {
  period: {
    currentMonth: { start: Date; end: Date };
    previousMonth: { start: Date; end: Date };
  };
  metrics: {
    sales: MetricComparison;
    products: MetricComparison;
    customers: MetricComparison;
    averageTicket: MetricComparison;
  };
  recentSales: Sale[];
  topProducts: TopProduct[];
}

interface MetricComparison {
  current: number;
  previous: number;
  change: number;
  changePercent: string;
}

async function getDashboardStats(): Promise<DashboardStats> {
  const token = localStorage.getItem('access_token');
  const companyId = localStorage.getItem('company_id');

  const { data } = await axios.get<DashboardStats>(
    '/sales/dashboard/stats',
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-company-id': companyId,
      },
    }
  );

  return data;
}
```

---

## Componente React

```tsx
import { useState, useEffect } from 'react';
import axios from 'axios';

interface DashboardStats {
  metrics: {
    sales: {
      current: number;
      change: number;
      changePercent: string;
    };
    products: {
      current: number;
      change: number;
      changePercent: string;
    };
    customers: {
      current: number;
      change: number;
      changePercent: string;
    };
    averageTicket: {
      current: number;
      change: number;
      changePercent: string;
    };
  };
  recentSales: any[];
  topProducts: any[];
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const token = localStorage.getItem('access_token');
      const companyId = localStorage.getItem('company_id');

      const { data } = await axios.get<DashboardStats>(
        '/sales/dashboard/stats',
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-company-id': companyId,
          },
        }
      );

      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!stats) {
    return <div>Erro ao carregar estatísticas</div>;
  }

  return (
    <div className="dashboard">
      {/* Cards de Métricas */}
      <div className="metrics-grid">
        <MetricCard
          title="Vendas do Mês"
          value={`R$ ${stats.metrics.sales.current.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          change={stats.metrics.sales.changePercent}
          positive={stats.metrics.sales.change >= 0}
        />

        <MetricCard
          title="Produtos Ativos"
          value={stats.metrics.products.current.toString()}
          change={stats.metrics.products.changePercent}
          positive={stats.metrics.products.change >= 0}
        />

        <MetricCard
          title="Clientes"
          value={stats.metrics.customers.current.toString()}
          change={stats.metrics.customers.changePercent}
          positive={stats.metrics.customers.change >= 0}
        />

        <MetricCard
          title="Ticket Médio"
          value={`R$ ${stats.metrics.averageTicket.current.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          change={stats.metrics.averageTicket.changePercent}
          positive={stats.metrics.averageTicket.change >= 0}
        />
      </div>

      {/* Vendas Recentes */}
      <div className="recent-sales">
        <h2>Vendas Recentes</h2>
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Cliente</th>
              <th>Valor</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            {stats.recentSales.map((sale) => (
              <tr key={sale.id}>
                <td>{sale.code}</td>
                <td>{sale.customer.name}</td>
                <td>R$ {sale.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td>{new Date(sale.confirmedAt).toLocaleDateString('pt-BR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Produtos Mais Vendidos */}
      <div className="top-products">
        <h2>Produtos Mais Vendidos</h2>
        <ul>
          {stats.topProducts.map((item) => (
            <li key={item.product.id}>
              <div className="product-info">
                <strong>{item.product.name}</strong>
                <span>{item.product.sku}</span>
              </div>
              <div className="product-stats">
                <span>{item.quantitySold} unidades vendidas</span>
                <span>{item.salesCount} vendas</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  positive: boolean;
}

function MetricCard({ title, value, change, positive }: MetricCardProps) {
  return (
    <div className="metric-card">
      <h3>{title}</h3>
      <div className="value">{value}</div>
      <div className={`change ${positive ? 'positive' : 'negative'}`}>
        {change}
      </div>
    </div>
  );
}
```

---

## Regras de Negócio

### 1. Vendas Consideradas

- ✅ Apenas vendas com status `CONFIRMED`
- ✅ Usa o campo `confirmedAt` para filtrar por período
- ❌ Orçamentos (QUOTE) não são contabilizados
- ❌ Vendas canceladas não são contabilizadas

### 2. Produtos Ativos

- ✅ `active = true`
- ✅ `currentStock > 0`
- ℹ️ Produtos sem estoque não são considerados "ativos"

### 3. Ticket Médio

```typescript
ticketMedio = totalVendasConfirmadas / numeroDeVendas
```

**Exemplo:**
- Total: R$ 100.000,00
- Vendas: 40
- Ticket Médio: R$ 2.500,00

### 4. Comparação com Mês Anterior

**Se mês anterior = 0:**
```typescript
change = current > 0 ? 100 : 0
changePercent = current > 0 ? '+100%' : '0%'
```

**Se current = 0 e previous > 0:**
```typescript
change = -100
changePercent = '-100%'
```

### 5. Produtos Mais Vendidos

- Agrupados por `productId`
- Soma de `quantity` nos itens de venda
- Ordenados por quantidade (descendente)
- Apenas vendas confirmadas do mês atual
- Top 4 produtos

---

## Erros Possíveis

### 401 - Unauthorized

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**Causa:** Token JWT ausente ou inválido

### 403 - Forbidden

```json
{
  "statusCode": 403,
  "message": "Acesso negado"
}
```

**Causa:** Usuário não tem permissão para acessar esta empresa

---

## Performance

### Otimizações Implementadas

1. **Agregações no Banco**
   - Usa `aggregate()` e `groupBy()` do Prisma
   - Processamento no PostgreSQL (mais rápido)

2. **Consultas Paralelas**
   - Múltiplas queries independentes
   - Pode ser otimizado com `Promise.all()`

3. **Limit nos Arrays**
   - Apenas 4 vendas recentes
   - Apenas 4 produtos mais vendidos
   - Reduz payload da resposta

### Tempo de Resposta Esperado

- **< 500ms** para bancos pequenos (< 10k vendas)
- **< 1s** para bancos médios (10k-100k vendas)
- **< 2s** para bancos grandes (> 100k vendas)

---

## Cache (Recomendado para Produção)

```typescript
// Exemplo com Redis
import { Cache } from '@nestjs/cache-manager';

@Injectable()
export class SalesService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getDashboardStats(companyId: string) {
    // Tentar obter do cache
    const cacheKey = `dashboard:stats:${companyId}`;
    const cached = await this.cacheManager.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    // Calcular estatísticas
    const stats = await this.calculateStats(companyId);

    // Guardar no cache por 5 minutos
    await this.cacheManager.set(cacheKey, stats, 300);

    return stats;
  }
}
```

---

## Testes

### Teste Manual

```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"senha123"}' | jq -r '.access_token')

# 2. Obter estatísticas
curl -X GET "http://localhost:4000/sales/dashboard/stats" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-company-id: your-company-id" | jq
```

### Casos de Teste

1. **Empresa sem vendas**
   - Deve retornar zeros
   - `changePercent` = "0%"

2. **Primeira venda do mês**
   - `current` > 0
   - `previous` = 0
   - `changePercent` = "+100%"

3. **Mês com menos vendas que anterior**
   - `change` negativo
   - `changePercent` com sinal "-"

4. **Produtos sem vendas no mês**
   - `topProducts` = []

---

## Documentação Relacionada

| Documento | Descrição |
|-----------|-----------|
| [API_SALES_MANAGEMENT.md](./API_SALES_MANAGEMENT.md) | Gestão completa de vendas |
| [SALES_QUICKSTART.md](./SALES_QUICKSTART.md) | Guia rápido de vendas |
| [SALES_PDF_LOGO_FIX.md](./SALES_PDF_LOGO_FIX.md) | Exportação de PDF |

---

## Status

✅ **Implementação Completa**

- Endpoint criado e funcional
- Todas as métricas implementadas
- Comparação com mês anterior
- Vendas recentes
- Produtos mais vendidos
- Zero erros de compilação

**Pronto para uso!** 🚀
