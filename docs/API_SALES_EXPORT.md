# 📄 API de Exportação de Vendas - Guia Completo

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Exportação em PDF](#exportação-em-pdf)
3. [Exportação em Excel](#exportação-em-excel)
4. [Exemplos Práticos](#exemplos-práticos)
5. [Filtros Avançados](#filtros-avançados)
6. [Casos de Uso](#casos-de-uso)

---

## 🎯 Visão Geral

O sistema oferece duas formas de exportação de vendas:

### 📄 **PDF - Documento Individual**
- Exporta **uma venda específica**
- Formato profissional com logo da empresa
- Ideal para enviar ao cliente ou imprimir
- Suporta orçamentos e vendas confirmadas

### 📊 **Excel - Relatório Completo**
- Exporta **múltiplas vendas** com filtros
- 3 planilhas: Vendas, Itens Detalhados, Resumo
- Formatação profissional com cores por status
- Ideal para análises e relatórios gerenciais

---

## 📄 Exportação em PDF

### 🔌 Endpoint

```http
GET /sales/:id/pdf
Authorization: Bearer {seu_token_jwt}
```

### 📋 Parâmetros

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `id` | UUID | ✅ Sim | ID da venda |

### 📤 Response

**Status:** `200 OK`

**Headers:**
```http
Content-Type: application/pdf
Content-Disposition: attachment; filename="orcamento-ORC-2025-001.pdf"
```

**Body:** Binary PDF

### ✨ Características do PDF

#### 1️⃣ **Cabeçalho**
- ✅ Logo da empresa (automático do cadastro)
- ✅ Dados da empresa (razão social, CNPJ, endereço)
- ✅ Tipo do documento (ORÇAMENTO ou VENDA)
- ✅ Código da venda (ex: ORC-2025-001)

#### 2️⃣ **Informações do Cliente**
- Nome/Razão Social
- CPF/CNPJ
- Telefone
- Email
- Endereço completo

#### 3️⃣ **Tabela de Produtos**
- Código/SKU
- Descrição
- Quantidade
- Preço Unitário
- Desconto (se houver)
- Total

#### 4️⃣ **Totalizadores**
```
Subtotal:           R$ 1.500,00
Desconto (10%):   - R$   150,00
Frete:            + R$    50,00
Outras Despesas:  + R$    25,00
─────────────────────────────────
TOTAL:              R$ 1.425,00
```

#### 5️⃣ **Informações de Pagamento**
- Método de pagamento
- Número de parcelas
- Valor de cada parcela
- Datas de vencimento

#### 6️⃣ **Observações**
- Notas gerais (visíveis ao cliente)
- Observações internas (se aplicável)
- Análise de crédito (se houver)
- Motivo de cancelamento (se cancelada)

#### 7️⃣ **Rodapé**
- Data e hora de geração
- Número da página
- Status da venda

### 🎨 Formatação Visual

#### Status Colors
| Status | Cor | Uso |
|--------|-----|-----|
| `QUOTE` | 🔵 Azul | Orçamento aguardando decisão |
| `PENDING_APPROVAL` | 🟡 Amarelo | Aguardando aprovação interna |
| `APPROVED` | 🟢 Verde Claro | Aprovado, aguardando confirmação |
| `CONFIRMED` | 🟢 Verde | Venda confirmada |
| `IN_PRODUCTION` | 🟣 Roxo | Em produção |
| `READY_TO_SHIP` | 🔵 Azul Claro | Pronto para envio |
| `SHIPPED` | 🟠 Laranja | Enviado |
| `DELIVERED` | 🟢 Verde Escuro | Entregue |
| `COMPLETED` | ✅ Verde Sucesso | Concluído |
| `CANCELED` | 🔴 Vermelho | Cancelado |
| `REJECTED` | ⚫ Cinza | Rejeitado |

#### Marca d'água
- **Orçamentos (QUOTE):** Marca d'água "ORÇAMENTO" em diagonal
- **Canceladas:** Marca d'água "CANCELADO" em vermelho
- **Rejeitadas:** Marca d'água "REJEITADO" em cinza

### 📝 Exemplo de Requisição

```bash
curl -X GET \
  'https://api.seusite.com/sales/550e8400-e29b-41d4-a716-446655440000/pdf' \
  -H 'Authorization: Bearer seu_token_jwt' \
  --output orcamento.pdf
```

### 🌐 JavaScript/TypeScript

```typescript
async function downloadSalePDF(saleId: string) {
  const response = await fetch(`/sales/${saleId}/pdf`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `venda-${saleId}.pdf`;
  link.click();
}
```

### ⚠️ Erros Possíveis

#### 404 - Venda não encontrada
```json
{
  "statusCode": 404,
  "message": "Venda não encontrada",
  "error": "Not Found"
}
```

#### 404 - Logo não encontrada
```json
{
  "statusCode": 404,
  "message": "Logo da empresa não encontrada",
  "error": "Not Found"
}
```

**Solução:** Fazer upload da logo em `POST /companies/:id/upload/logo`

---

## 📊 Exportação em Excel

### 🔌 Endpoint

```http
GET /sales/export/excel
Authorization: Bearer {seu_token_jwt}
```

### 📋 Parâmetros de Filtro (Query String)

Todos os parâmetros são **opcionais**. Sem filtros, exporta todas as vendas.

| Parâmetro | Tipo | Descrição | Exemplo |
|-----------|------|-----------|---------|
| `status` | String | Filtrar por status | `CONFIRMED` |
| `customerId` | UUID | Filtrar por cliente | `550e8400-...` |
| `paymentMethodId` | UUID | Filtrar por método de pagamento | `pay-123-...` |
| `startDate` | Date | Data inicial (ISO 8601) | `2025-01-01` |
| `endDate` | Date | Data final (ISO 8601) | `2025-12-31` |
| `minAmount` | Number | Valor mínimo | `1000` |
| `maxAmount` | Number | Valor máximo | `10000` |

### 📤 Response

**Status:** `200 OK`

**Headers:**
```http
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="vendas-2025-11-10.xlsx"
```

**Body:** Binary Excel (.xlsx)

### 📑 Estrutura do Excel - 3 Planilhas

#### 📋 **Planilha 1: VENDAS**

Lista completa de vendas com 13 colunas:

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| Código | String | Código da venda (ORC-2025-001) |
| Status | String | Status atual |
| Cliente | String | Nome do cliente |
| Data | Date | Data de criação |
| Vendedor | String | Nome do vendedor |
| Método Pagamento | String | Forma de pagamento |
| Parcelas | Number | Número de parcelas |
| Subtotal | Currency | Soma dos itens |
| Desconto | Currency | Total de descontos |
| Frete | Currency | Custo de frete |
| Outras Despesas | Currency | Outras cobranças |
| Total | Currency | Valor total |
| Observações | String | Notas da venda |

**Formatação:**
- ✅ Cabeçalho em negrito, fundo escuro, texto branco
- ✅ Bordas em todas as células
- ✅ Valores monetários em formato brasileiro (R$)
- ✅ Datas em formato dd/mm/yyyy
- ✅ Cores de fundo por status
- ✅ Linha TOTALIZADOR no final com somas

**Exemplo:**
```
┌──────────────┬───────────┬─────────────┬────────────┬──────────┬─────────┬───────────┐
│ Código       │ Status    │ Cliente     │ Data       │ Subtotal │ Desconto│ Total     │
├──────────────┼───────────┼─────────────┼────────────┼──────────┼─────────┼───────────┤
│ ORC-2025-001 │ QUOTE     │ João Silva  │ 10/11/2025 │ 1.500,00 │  150,00 │ 1.425,00  │
│ VEN-2025-002 │ CONFIRMED │ Maria Santos│ 10/11/2025 │ 3.200,00 │  320,00 │ 2.980,00  │
│ VEN-2025-003 │ CANCELED  │ Pedro Souza │ 09/11/2025 │ 5.000,00 │  500,00 │ 4.550,00  │
├──────────────┴───────────┴─────────────┴────────────┼──────────┼─────────┼───────────┤
│                                         TOTALIZADOR  │ 9.700,00 │  970,00 │ 8.955,00  │
└──────────────────────────────────────────────────────┴──────────┴─────────┴───────────┘
```

#### 📦 **Planilha 2: ITENS DETALHADOS**

Todos os itens de todas as vendas:

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| Código Venda | String | Código da venda |
| Código Produto | String | SKU do produto |
| Produto | String | Nome do produto |
| Quantidade | Number | Quantidade vendida |
| Unidade | String | Unidade de medida |
| Preço Unit. | Currency | Preço unitário |
| Desconto | Currency | Desconto do item |
| Total | Currency | Total do item |
| Local Estoque | String | Local de retirada |

**Formatação:**
- ✅ Agrupamento visual por venda
- ✅ Cores alternadas para facilitar leitura
- ✅ Totalizadores por venda
- ✅ Total geral no final

**Exemplo:**
```
┌──────────────┬─────────┬──────────────┬────────┬────────────┬──────────┬──────────┐
│ Cód. Venda   │ SKU     │ Produto      │ Qtd    │ Preço Unit.│ Desconto │ Total    │
├──────────────┼─────────┼──────────────┼────────┼────────────┼──────────┼──────────┤
│ ORC-2025-001 │ PROD-01 │ Mouse Gamer  │   2,00 │    150,00  │   10,00  │  290,00  │
│ ORC-2025-001 │ PROD-02 │ Teclado RGB  │   1,00 │    350,00  │   20,00  │  330,00  │
├──────────────┴─────────┴──────────────┴────────┴────────────┴──────────┼──────────┤
│                                      Subtotal ORC-2025-001              │  620,00  │
├──────────────┬─────────┬──────────────┬────────┬────────────┬──────────┼──────────┤
│ VEN-2025-002 │ PROD-03 │ Monitor 24"  │   3,00 │    800,00  │  100,00  │ 2.300,00 │
├──────────────┴─────────┴──────────────┴────────┴────────────┴──────────┼──────────┤
│                                      Subtotal VEN-2025-002              │ 2.300,00 │
└─────────────────────────────────────────────────────────────────────────┴──────────┘
```

#### 📈 **Planilha 3: RESUMO**

Estatísticas e análises consolidadas:

**Seção 1: Resumo Geral**
```
┌─────────────────────────────┬─────────────┐
│ Total de Vendas             │          45 │
│ Valor Total                 │ R$ 156.780  │
│ Ticket Médio                │ R$   3.484  │
│ Total de Descontos          │ R$  12.450  │
│ Total de Frete              │ R$   2.340  │
└─────────────────────────────┴─────────────┘
```

**Seção 2: Por Status**
```
┌──────────────┬──────────┬────────────┬──────────────┐
│ Status       │ Qtd      │ Valor      │ % do Total   │
├──────────────┼──────────┼────────────┼──────────────┤
│ QUOTE        │      15  │  45.230,00 │       28,8%  │
│ CONFIRMED    │      25  │  98.500,00 │       62,8%  │
│ CANCELED     │       5  │  13.050,00 │        8,3%  │
└──────────────┴──────────┴────────────┴──────────────┘
```

**Seção 3: Top 10 Clientes**
```
┌──────────────────────┬───────────┬───────────────┐
│ Cliente              │ Qtd Vendas│ Valor Total   │
├──────────────────────┼───────────┼───────────────┤
│ João Silva Ltda      │        12 │   45.600,00   │
│ Maria Comércio       │         8 │   32.450,00   │
│ Pedro Distribuidora  │         5 │   21.300,00   │
└──────────────────────┴───────────┴───────────────┘
```

**Seção 4: Top 10 Produtos Vendidos**
```
┌──────────────────────┬───────────┬───────────────┐
│ Produto              │ Qtd       │ Valor Total   │
├──────────────────────┼───────────┼───────────────┤
│ Notebook Dell        │        45 │   156.750,00  │
│ Mouse Gamer          │       120 │    18.000,00  │
│ Teclado Mecânico     │        85 │    29.750,00  │
└──────────────────────┴───────────┴───────────────┘
```

**Seção 5: Por Método de Pagamento**
```
┌───────────────────┬──────────┬────────────┐
│ Método            │ Qtd      │ Valor      │
├───────────────────┼──────────┼────────────┤
│ PIX               │       20 │  67.800,00 │
│ Cartão Crédito    │       15 │  54.900,00 │
│ Boleto            │       10 │  34.080,00 │
└───────────────────┴──────────┴────────────┘
```

### 🎨 Cores por Status (Planilha 1)

| Status | Cor de Fundo | Texto |
|--------|--------------|-------|
| QUOTE | 🔵 Azul Claro (#E3F2FD) | Azul Escuro |
| PENDING_APPROVAL | 🟡 Amarelo Claro (#FFF9C4) | Laranja Escuro |
| APPROVED | 🟢 Verde Claro (#E8F5E9) | Verde Escuro |
| CONFIRMED | 🟢 Verde (#C8E6C9) | Verde Escuro |
| IN_PRODUCTION | 🟣 Roxo Claro (#E1BEE7) | Roxo Escuro |
| READY_TO_SHIP | 🔵 Azul (#BBDEFB) | Azul Escuro |
| SHIPPED | 🟠 Laranja Claro (#FFE0B2) | Laranja Escuro |
| DELIVERED | 🟢 Verde Escuro (#A5D6A7) | Verde |
| COMPLETED | ✅ Verde Sucesso (#81C784) | Branco |
| CANCELED | 🔴 Vermelho Claro (#FFCDD2) | Vermelho Escuro |
| REJECTED | ⚫ Cinza (#E0E0E0) | Cinza Escuro |

---

## 💡 Exemplos Práticos

### 📄 Exemplo 1: Download de PDF Individual

#### cURL
```bash
# Baixar orçamento em PDF
curl -X GET \
  'https://api.seusite.com/sales/550e8400-e29b-41d4-a716-446655440000/pdf' \
  -H 'Authorization: Bearer seu_token_jwt' \
  -o orcamento-001.pdf
```

#### JavaScript
```javascript
// Frontend - Download automático
async function downloadPDF(saleId) {
  const response = await fetch(`/sales/${saleId}/pdf`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `venda-${saleId}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
```

#### React Component
```typescript
import { useState } from 'react';
import { Download } from 'lucide-react';

function SalePDFButton({ saleId, saleCode }) {
  const [loading, setLoading] = useState(false);
  
  const handleDownload = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/sales/${saleId}/pdf`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Erro ao baixar PDF');
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${saleCode}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('Erro ao baixar PDF: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <button 
      onClick={handleDownload} 
      disabled={loading}
      className="btn-primary"
    >
      <Download size={16} />
      {loading ? 'Gerando...' : 'Baixar PDF'}
    </button>
  );
}
```

---

### 📊 Exemplo 2: Exportar Todas as Vendas em Excel

```bash
curl -X GET \
  'https://api.seusite.com/sales/export/excel' \
  -H 'Authorization: Bearer seu_token_jwt' \
  -o vendas-completas.xlsx
```

**Resultado:**
- Arquivo: `vendas-completas.xlsx`
- Tamanho: ~500KB (para 100 vendas)
- 3 planilhas com todas as vendas

---

### 📊 Exemplo 3: Filtrar Vendas Confirmadas do Mês

```bash
curl -X GET \
  'https://api.seusite.com/sales/export/excel?status=CONFIRMED&startDate=2025-11-01&endDate=2025-11-30' \
  -H 'Authorization: Bearer seu_token_jwt' \
  -o vendas-novembro.xlsx
```

**JavaScript:**
```javascript
async function exportMonthSales(month, year, status = 'CONFIRMED') {
  const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
  const endDate = new Date(year, month, 0).toISOString().split('T')[0];
  
  const params = new URLSearchParams({
    status,
    startDate,
    endDate
  });
  
  const response = await fetch(`/sales/export/excel?${params}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `vendas-${year}-${month}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}

// Uso: Exportar vendas confirmadas de novembro/2025
exportMonthSales(11, 2025, 'CONFIRMED');
```

---

### 📊 Exemplo 4: Vendas de um Cliente Específico

```bash
curl -X GET \
  'https://api.seusite.com/sales/export/excel?customerId=550e8400-e29b-41d4-a716-446655440000' \
  -H 'Authorization: Bearer seu_token_jwt' \
  -o vendas-cliente-joao.xlsx
```

---

### 📊 Exemplo 5: Vendas Acima de R$ 5.000

```bash
curl -X GET \
  'https://api.seusite.com/sales/export/excel?minAmount=5000' \
  -H 'Authorization: Bearer seu_token_jwt' \
  -o vendas-altas.xlsx
```

---

### 📊 Exemplo 6: Filtros Combinados

```bash
# Vendas confirmadas do cliente X, acima de R$ 1.000, no período
curl -X GET \
  'https://api.seusite.com/sales/export/excel?status=CONFIRMED&customerId=550e8400-...&minAmount=1000&startDate=2025-01-01&endDate=2025-12-31' \
  -H 'Authorization: Bearer seu_token_jwt' \
  -o relatorio-customizado.xlsx
```

**TypeScript:**
```typescript
interface ExcelFilters {
  status?: string;
  customerId?: string;
  paymentMethodId?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
}

async function exportSalesExcel(filters: ExcelFilters) {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, value.toString());
    }
  });
  
  const response = await fetch(`/sales/export/excel?${params}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (!response.ok) {
    throw new Error('Erro ao exportar Excel');
  }
  
  const blob = await response.blob();
  
  // Extrair nome do arquivo do header
  const contentDisposition = response.headers.get('Content-Disposition');
  const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
  const filename = filenameMatch?.[1] || 'vendas.xlsx';
  
  // Download
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Exemplo de uso
exportSalesExcel({
  status: 'CONFIRMED',
  startDate: '2025-11-01',
  endDate: '2025-11-30',
  minAmount: 1000
});
```

---

## 🔍 Filtros Avançados

### Combinações Úteis

#### 1. Relatório Mensal de Vendas Confirmadas
```typescript
{
  status: 'CONFIRMED',
  startDate: '2025-11-01',
  endDate: '2025-11-30'
}
```

#### 2. Orçamentos Pendentes
```typescript
{
  status: 'QUOTE',
  startDate: '2025-11-01'  // Orçamentos criados este mês
}
```

#### 3. Vendas Canceladas para Análise
```typescript
{
  status: 'CANCELED',
  startDate: '2025-01-01',
  endDate: '2025-12-31'
}
```

#### 4. Vendas de Alto Valor
```typescript
{
  status: 'CONFIRMED',
  minAmount: 10000  // Acima de R$ 10.000
}
```

#### 5. Vendas por Método de Pagamento
```typescript
{
  paymentMethodId: 'pix-uuid',
  status: 'CONFIRMED',
  startDate: '2025-11-01'
}
```

#### 6. Histórico Completo do Cliente
```typescript
{
  customerId: 'cliente-uuid'
  // Sem outros filtros = todas as vendas do cliente
}
```

#### 7. Vendas entre R$ 1.000 e R$ 5.000
```typescript
{
  minAmount: 1000,
  maxAmount: 5000,
  status: 'CONFIRMED'
}
```

---

## 📱 Casos de Uso

### Caso 1: Enviar Orçamento por Email

```typescript
async function sendQuoteByEmail(saleId: string, customerEmail: string) {
  // 1. Gerar PDF
  const pdfResponse = await fetch(`/sales/${saleId}/pdf`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const pdfBlob = await pdfResponse.blob();
  
  // 2. Upload para storage temporário
  const formData = new FormData();
  formData.append('file', pdfBlob, 'orcamento.pdf');
  const uploadResponse = await fetch('/temp-upload', {
    method: 'POST',
    body: formData
  });
  const { fileUrl } = await uploadResponse.json();
  
  // 3. Enviar email
  await fetch('/emails/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: customerEmail,
      subject: 'Seu Orçamento - Empresa XYZ',
      template: 'quote',
      attachments: [fileUrl]
    })
  });
  
  alert('Orçamento enviado com sucesso!');
}
```

---

### Caso 2: Impressão em Lote

```typescript
async function printMultipleSales(saleIds: string[]) {
  for (const saleId of saleIds) {
    const response = await fetch(`/sales/${saleId}/pdf`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    
    // Abrir em nova aba para impressão
    const printWindow = window.open(url);
    printWindow?.addEventListener('load', () => {
      printWindow.print();
    });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}
```

---

### Caso 3: Dashboard com Download Rápido

```typescript
import { FileText, FileSpreadsheet } from 'lucide-react';

function SalesReportDashboard() {
  const downloadMonthExcel = async () => {
    const now = new Date();
    const filters = {
      startDate: new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString().split('T')[0],
      endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0)
        .toISOString().split('T')[0]
    };
    
    await exportSalesExcel(filters);
  };
  
  const downloadConfirmedSales = async () => {
    await exportSalesExcel({ status: 'CONFIRMED' });
  };
  
  return (
    <div className="reports-dashboard">
      <h2>Relatórios de Vendas</h2>
      
      <div className="report-cards">
        <div className="card">
          <FileSpreadsheet size={32} />
          <h3>Vendas do Mês</h3>
          <button onClick={downloadMonthExcel}>
            Baixar Excel
          </button>
        </div>
        
        <div className="card">
          <FileSpreadsheet size={32} />
          <h3>Vendas Confirmadas</h3>
          <button onClick={downloadConfirmedSales}>
            Baixar Excel
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

### Caso 4: Análise de Performance

```typescript
async function generatePerformanceReport() {
  // Exportar vendas do ano
  const filters = {
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    status: 'CONFIRMED'
  };
  
  await exportSalesExcel(filters);
  
  // O Excel já contém:
  // - Planilha 1: Todas as vendas detalhadas
  // - Planilha 2: Itens vendidos
  // - Planilha 3: Resumo com:
  //   * Total de vendas
  //   * Ticket médio
  //   * Top clientes
  //   * Top produtos
  //   * Vendas por método de pagamento
  
  alert('Relatório anual gerado! Confira a planilha RESUMO para análises.');
}
```

---

### Caso 5: Auditoria de Cancelamentos

```typescript
async function auditCanceledSales() {
  const filters = {
    status: 'CANCELED',
    startDate: '2025-01-01',
    endDate: '2025-12-31'
  };
  
  await exportSalesExcel(filters);
  
  // Analisar:
  // - Quantas vendas foram canceladas
  // - Valor total perdido
  // - Clientes com mais cancelamentos
  // - Motivos de cancelamento (campo observações)
}
```

---

## ⚡ Performance e Limites

### PDF
- ⚡ Geração: ~2-5 segundos
- 📦 Tamanho: 100-500 KB (depende do logo e quantidade de itens)
- ✅ Sem limite de itens
- 🖼️ Logo: Máximo 5MB recomendado

### Excel
- ⚡ Geração: ~5-15 segundos (dependendo da quantidade)
- 📦 Tamanho: ~10KB por venda
- ⚠️ Recomendado: Até 5.000 vendas por exportação
- 💾 Memória: ~50MB para 1.000 vendas

### Dicas de Performance

1. **Filtrar antes de exportar:** Use filtros para limitar o volume
2. **Exportações grandes:** Considere fazer por período (mensal)
3. **Cache:** PDFs podem ser cacheados por ID da venda
4. **Background jobs:** Para exportações muito grandes (>10.000 vendas)

---

## 🔐 Segurança

### Permissões Necessárias

**PDF:**
- ✅ Permissão: `sales:read`
- ✅ Isolamento: Apenas vendas da própria empresa
- ✅ Verificação: Venda pertence ao usuário autenticado

**Excel:**
- ✅ Permissão: `sales:export` ou `sales:read`
- ✅ Isolamento: Apenas vendas da própria empresa
- ✅ Verificação: Empresa do token

### Logs de Auditoria

Todas as exportações são registradas:

```json
{
  "action": "EXPORT_SALES_EXCEL",
  "userId": "user-123",
  "companyId": "company-456",
  "filters": {
    "status": "CONFIRMED",
    "startDate": "2025-11-01",
    "endDate": "2025-11-30"
  },
  "resultCount": 45,
  "timestamp": "2025-11-10T10:30:00Z"
}
```

---

## ❓ Perguntas Frequentes

### Q: O PDF inclui a logo automaticamente?
**R:** Sim, se a logo foi enviada via `POST /companies/:id/upload/logo`.

### Q: Posso customizar o layout do PDF?
**R:** Atualmente não. Entre em contato se precisar de customizações.

### Q: O Excel tem limite de linhas?
**R:** Tecnicamente não, mas recomendamos até 5.000 vendas por performance.

### Q: Como exportar vendas de múltiplos status?
**R:** Atualmente o filtro de status aceita apenas 1 valor. Faça múltiplas exportações ou não use o filtro de status.

### Q: O Excel pode ser aberto no Google Sheets?
**R:** Sim! É um arquivo .xlsx padrão compatível com Excel, LibreOffice e Google Sheets.

### Q: As cores do Excel são mantidas ao abrir em outros programas?
**R:** Sim, as cores e formatações são preservadas.

### Q: Posso exportar apenas os itens sem as vendas?
**R:** Não diretamente, mas a planilha "Itens Detalhados" contém todos os itens.

### Q: Como saber quantas vendas serão exportadas antes de baixar?
**R:** Use `GET /sales?[mesmos_filtros]` para ver o total antes de exportar.

---

## 📚 Documentos Relacionados

- [API_SALES.md](./API_SALES.md) - API completa de vendas
- [API_SALES_CREATE.md](./API_SALES_CREATE.md) - Como criar vendas
- [SALES_INTEGRATION_FINANCE_STOCK.md](./SALES_INTEGRATION_FINANCE_STOCK.md) - Integração com Financeiro e Estoque

---

**Última atualização:** 10 de novembro de 2025
