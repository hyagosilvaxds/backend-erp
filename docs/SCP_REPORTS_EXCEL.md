<!-- Continua na próxima mensagem devido ao tamanho -->
# Relatórios Excel - Módulo SCP

## Visão Geral

O módulo de relatórios permite exportar dados do sistema SCP em planilhas Excel (.xlsx) com formatação profissional, filtros avançados e cálculos automáticos.

## Endpoints Disponíveis

### 1. Relatório de Aportes
```
GET /scp/reports/investments/export
```

**Descrição**: Exporta todos os aportes em formato Excel.

**Filtros Disponíveis**:
- `projectId` (string): Filtrar por projeto específico
- `investorId` (string): Filtrar por investidor específico
- `startDate` (ISO date): Data inicial de filtro
- `endDate` (ISO date): Data final de filtro
- `status` (enum): PENDENTE, CONFIRMADO, CANCELADO

**Colunas do Excel**:
- Data
- Projeto
- Investidor
- CPF/CNPJ
- Valor
- Método Pagamento
- Status
- Referência
- Documento

**Recursos**:
- ✅ Total automático (fórmula SUM)
- ✅ Formatação monetária (R$)
- ✅ Cabeçalho em destaque (azul)
- ✅ Largura de colunas otimizada

**Exemplo**:
```http
GET /scp/reports/investments/export?projectId=uuid&startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer {token}
x-company-id: {companyId}
```

---

### 2. Relatório de Aportes por Investidor
```
GET /scp/reports/investments/by-investor/export
```

**Descrição**: Agrupa aportes por investidor com subtotais.

**Filtros**: Mesmos do relatório anterior

**Colunas do Excel**:
- Investidor (agrupado)
- CPF/CNPJ (agrupado)
- Projeto
- Data
- Valor
- Status

**Recursos**:
- ✅ Agrupamento por investidor
- ✅ Subtotais automáticos por investidor
- ✅ Nome do investidor aparece apenas na primeira linha
- ✅ Subtotais com fundo cinza

**Exemplo de Saída**:
```
João Silva          | 123.456.789-00 | Projeto A | 2024-01-15 | R$ 10.000 | CONFIRMADO
                    |                | Projeto B | 2024-02-20 | R$ 5.000  | CONFIRMADO
                    | Subtotal:      |           |            | R$ 15.000 |
Maria Santos        | 987.654.321-00 | Projeto A | 2024-03-10 | R$ 20.000 | CONFIRMADO
                    | Subtotal:      |           |            | R$ 20.000 |
```

---

### 3. Relatório de Aportes por Projeto
```
GET /scp/reports/investments/by-project/export
```

**Descrição**: Agrupa aportes por projeto com subtotais.

**Filtros**: Mesmos do relatório de aportes

**Colunas do Excel**:
- Projeto (agrupado)
- Investidor
- Data
- Valor
- Status

**Recursos**:
- ✅ Agrupamento por projeto
- ✅ Subtotais automáticos por projeto
- ✅ Ideal para análise de captação por projeto

---

### 4. Relatório de Distribuições
```
GET /scp/reports/distributions/export
```

**Descrição**: Exporta todas as distribuições (pagamentos) aos investidores.

**Filtros Disponíveis**:
- `projectId` (string): Filtrar por projeto
- `investorId` (string): Filtrar por investidor
- `startDate` (ISO date): Data inicial
- `endDate` (ISO date): Data final
- `status` (enum): PENDENTE, PAGO, CANCELADO

**Colunas do Excel**:
- Data Distribuição
- Data Competência
- Projeto
- Investidor
- CPF/CNPJ
- Valor Base
- Valor Bruto
- IRRF
- Deduções
- Valor Líquido
- Percentual %
- Status
- Método Pagamento
- Referência

**Recursos**:
- ✅ Cálculo automático de totais (fórmulas)
- ✅ Formatação de percentual
- ✅ Cabeçalho verde (destaque para distribuições)
- ✅ Todas as colunas monetárias formatadas

**Exemplo**:
```http
GET /scp/reports/distributions/export?status=PAGO&startDate=2024-01-01
Authorization: Bearer {token}
x-company-id: {companyId}
```

---

### 5. Relatório de ROI (Retorno sobre Investimento)
```
GET /scp/reports/roi/export
```

**Descrição**: Calcula e exibe o ROI para cada combinação investidor/projeto.

**Filtros Disponíveis**:
- `projectId` (string): Filtrar por projeto
- `investorId` (string): Filtrar por investidor
- `startDate` (ISO date): Data inicial
- `endDate` (ISO date): Data final

**Colunas do Excel**:
- Investidor
- Projeto
- Total Investido
- Total Distribuído
- ROI (R$)
- ROI (%)

**Cálculos**:
```typescript
ROI (R$) = Total Distribuído - Total Investido
ROI (%) = (ROI / Total Investido) × 100
```

**Recursos**:
- ✅ ROI positivo: **verde**
- ✅ ROI negativo: **vermelho**
- ✅ ROI zero: preto
- ✅ Cabeçalho laranja
- ✅ Considera apenas distribuições PAGAS

**Exemplo de Saída**:
```
João Silva | Projeto A | R$ 10.000 | R$ 12.000 | R$ 2.000 (verde) | 20.00% (verde)
Maria Santos | Projeto B | R$ 50.000 | R$ 45.000 | -R$ 5.000 (vermelho) | -10.00% (vermelho)
```

---

### 6. Resumo de Investidores
```
GET /scp/reports/investors/export
```

**Descrição**: Relatório consolidado de todos os investidores.

**Filtros Disponíveis**:
- `type` (enum): PESSOA_FISICA, PESSOA_JURIDICA
- `status` (enum): ATIVO, INATIVO, SUSPENSO, BLOQUEADO
- `category` (string): Categoria do investidor

**Colunas do Excel**:
- Nome/Razão Social
- CPF/CNPJ
- Tipo
- Email
- Telefone
- Status
- Qtd Aportes
- Total Investido
- Qtd Distribuições
- Total Recebido
- ROI (R$)

**Recursos**:
- ✅ Consolidação de todos os dados do investidor
- ✅ ROI calculado automaticamente
- ✅ Cores para ROI positivo/negativo
- ✅ Contadores de aportes e distribuições
- ✅ Ideal para análise de carteira

**Exemplo**:
```http
GET /scp/reports/investors/export?type=PESSOA_FISICA&status=ATIVO
Authorization: Bearer {token}
x-company-id: {companyId}
```

---

### 7. Resumo de Projetos
```
GET /scp/reports/projects/export
```

**Descrição**: Relatório consolidado de todos os projetos SCP.

**Filtros Disponíveis**:
- `status` (enum): PLANEJAMENTO, EM_CAPTACAO, ATIVO, CONCLUIDO, CANCELADO, SUSPENSO
- `startDate` (ISO date): Data inicial do projeto
- `endDate` (ISO date): Data final do projeto

**Colunas do Excel**:
- Código
- Nome
- Status
- Data Início
- Data Fim
- Valor Total
- Valor Investido
- % Investido
- Distribuído
- Qtd Aportes
- Qtd Distribuições

**Cálculos**:
```typescript
% Investido = (Valor Investido / Valor Total) × 100
```

**Recursos**:
- ✅ % de captação por projeto
- ✅ Totais de investimento e distribuição
- ✅ Contadores de aportes e distribuições
- ✅ Cabeçalho verde
- ✅ Ideal para análise de performance

**Exemplo**:
```http
GET /scp/reports/projects/export?status=ATIVO
Authorization: Bearer {token}
x-company-id: {companyId}
```

---

## Formatos e Padrões

### Formatação Monetária
Todas as colunas com valores monetários são formatadas automaticamente:
```
R$ 1.234,56
R$ 10.000,00
R$ 100.000,00
```

### Formatação de Percentuais
```
25.50%
100.00%
-10.25%
```

### Formatação de Datas
```
10/11/2024 (pt-BR)
```

### Cores dos Cabeçalhos
- **Aportes**: Azul (`#4472C4`)
- **Distribuições**: Verde (`#70AD47`)
- **ROI**: Laranja (`#ED7D31`)
- **Investidores**: Azul claro (`#5B9BD5`)

### Nome dos Arquivos
Os arquivos exportados seguem o padrão:
```
aportes_2024-11-10.xlsx
distribuicoes_2024-11-10.xlsx
roi_retorno_investimento_2024-11-10.xlsx
resumo_investidores_2024-11-10.xlsx
resumo_projetos_2024-11-10.xlsx
aportes_por_investidor_2024-11-10.xlsx
aportes_por_projeto_2024-11-10.xlsx
```

---

## Exemplos de Uso

### Caso 1: Auditoria Anual
Exportar todas as distribuições pagas em 2024:
```http
GET /scp/reports/distributions/export?status=PAGO&startDate=2024-01-01&endDate=2024-12-31
```

### Caso 2: Análise de Performance de Investidor
Exportar ROI de um investidor específico:
```http
GET /scp/reports/roi/export?investorId=uuid-do-investidor
```

### Caso 3: Captação por Projeto
Ver todos os aportes de um projeto:
```http
GET /scp/reports/investments/by-project/export?projectId=uuid-do-projeto
```

### Caso 4: Carteira de Investidores VIP
Exportar resumo de investidores VIP ativos:
```http
GET /scp/reports/investors/export?category=VIP&status=ATIVO
```

### Caso 5: Projetos em Andamento
Ver todos os projetos ativos com suas métricas:
```http
GET /scp/reports/projects/export?status=ATIVO
```

---

## Estrutura Técnica

### DTOs de Filtros

#### ExportInvestmentsDto
```typescript
{
  projectId?: string;
  investorId?: string;
  startDate?: string;  // ISO date
  endDate?: string;    // ISO date
  status?: 'ATIVO' | 'INATIVO' | 'SUSPENSO';
}
```

#### ExportDistributionsDto
```typescript
{
  projectId?: string;
  investorId?: string;
  startDate?: string;
  endDate?: string;
  status?: 'PENDENTE' | 'PAGO' | 'CANCELADO';
}
```

#### ExportROIDto
```typescript
{
  projectId?: string;
  investorId?: string;
  startDate?: string;
  endDate?: string;
}
```

#### ExportInvestorsDto
```typescript
{
  type?: 'PESSOA_FISICA' | 'PESSOA_JURIDICA';
  status?: 'ATIVO' | 'INATIVO' | 'SUSPENSO' | 'BLOQUEADO';
  category?: string;
  projectIds?: string[];  // Investidores de projetos específicos
}
```

#### ExportProjectsDto
```typescript
{
  status?: 'PLANEJAMENTO' | 'EM_CAPTACAO' | 'ATIVO' | 'CONCLUIDO' | 'CANCELADO' | 'SUSPENSO';
  startDate?: string;
  endDate?: string;
}
```

---

## Headers Obrigatórios

Todos os endpoints requerem:
```http
Authorization: Bearer {jwt-token}
x-company-id: {company-uuid}
```

---

## Resposta HTTP

### Content-Type
```
application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
```

### Content-Disposition
```
attachment; filename="aportes_2024-11-10.xlsx"
```

### Status Codes
- `200 OK`: Arquivo gerado com sucesso
- `401 Unauthorized`: Token inválido
- `403 Forbidden`: Sem permissão
- `404 Not Found`: Dados não encontrados
- `500 Internal Server Error`: Erro ao gerar Excel

---

## Boas Práticas

### 1. Use Filtros para Grandes Volumes
Para empresas com muitos dados, sempre use filtros:
```http
# ❌ Evite (pode gerar arquivo muito grande)
GET /scp/reports/investments/export

# ✅ Prefira (arquivo otimizado)
GET /scp/reports/investments/export?startDate=2024-01-01&endDate=2024-12-31
```

### 2. Combine Filtros
```http
GET /scp/reports/investments/export?projectId=uuid&status=CONFIRMADO&startDate=2024-01-01
```

### 3. Relatórios por Período
Para análises mensais:
```http
# Janeiro 2024
GET /scp/reports/distributions/export?startDate=2024-01-01&endDate=2024-01-31&status=PAGO

# 1º Trimestre 2024
GET /scp/reports/distributions/export?startDate=2024-01-01&endDate=2024-03-31&status=PAGO
```

### 4. Análise de Investidor Específico
```http
# Todos os dados do investidor
GET /scp/reports/investors/export?investorId=uuid

# Aportes do investidor
GET /scp/reports/investments/by-investor/export?investorId=uuid

# ROI do investidor
GET /scp/reports/roi/export?investorId=uuid
```

---

## Integração Frontend

### React/TypeScript
```typescript
async function downloadReport(type: string, filters: any) {
  const params = new URLSearchParams(filters);
  
  const response = await fetch(
    `/scp/reports/${type}/export?${params}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-company-id': companyId,
      },
    }
  );

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = response.headers.get('Content-Disposition')
    ?.split('filename=')[1]
    ?.replace(/"/g, '') || 'relatorio.xlsx';
  a.click();
  window.URL.revokeObjectURL(url);
}

// Uso
downloadReport('investments', { 
  projectId: 'uuid', 
  startDate: '2024-01-01' 
});
```

### JavaScript Vanilla
```javascript
function downloadReport(url) {
  fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-company-id': companyId,
    },
  })
    .then(response => response.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'relatorio.xlsx';
      a.click();
    });
}

// Uso
downloadReport('/scp/reports/investments/export?startDate=2024-01-01');
```

---

## Troubleshooting

### Erro: Arquivo vazio
**Causa**: Filtros muito restritivos, nenhum dado encontrado.

**Solução**: Verifique se os filtros estão corretos e se há dados no período.

### Erro: 401 Unauthorized
**Causa**: Token expirado ou inválido.

**Solução**: Faça login novamente para obter novo token.

### Erro: 403 Forbidden
**Causa**: Usuário sem permissão SCP.

**Solução**: Verifique as permissões do usuário no módulo SCP.

### Erro: Arquivo muito grande
**Causa**: Muitos registros sem filtro.

**Solução**: Use filtros de data para reduzir o volume:
```http
GET /scp/reports/investments/export?startDate=2024-01-01&endDate=2024-12-31
```

---

## Performance

### Estimativa de Tempo de Geração

| Registros | Tempo Estimado |
|-----------|----------------|
| 100 | ~0.5s |
| 500 | ~1s |
| 1.000 | ~2s |
| 5.000 | ~8s |
| 10.000 | ~15s |

### Otimizações Implementadas

1. **Queries Otimizadas**: Uso de `include` para evitar N+1
2. **Filtros no Banco**: Aplicados diretamente na query
3. **Streaming**: Buffer direto para resposta
4. **Formatação Condicional**: Aplicada apenas onde necessário

---

## Changelog

### v1.0.0 - 2024-11-10
- ✅ Relatório de Aportes
- ✅ Relatório de Aportes por Investidor
- ✅ Relatório de Aportes por Projeto
- ✅ Relatório de Distribuições
- ✅ Relatório de ROI
- ✅ Resumo de Investidores
- ✅ Resumo de Projetos
- ✅ Filtros avançados
- ✅ Formatação profissional
- ✅ Fórmulas automáticas
- ✅ Agrupamentos e subtotais

---

## Referências

- **ExcelJS**: https://github.com/exceljs/exceljs
- **Prisma ORM**: https://www.prisma.io/
- **NestJS**: https://nestjs.com/

---

## Suporte

Para dúvidas ou problemas, consulte:
- [SCP_MODULE.md](./SCP_MODULE.md) - Documentação completa do módulo
- [scp-reports-tests.http](../scp-reports-tests.http) - Exemplos de requisições
