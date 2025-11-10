# 📊 Melhoria nos Relatórios Excel - Detalhamento de Transações

## 📝 Resumo das Alterações

Todos os relatórios financeiros em Excel agora incluem **duas abas**:
1. **Aba de Resumo**: Visualização consolidada com totais
2. **Aba de Detalhamento**: Lista completa de todas as transações/contas do período

---

## 🎯 Relatórios Atualizados

### 1. Fluxo de Caixa

**Endpoint:** `GET /financial/reports/cash-flow/export`

**Aba 1 - "Fluxo de Caixa":**
- Data
- Receitas
- Despesas
- Saldo do Dia
- Total Geral

**Aba 2 - "Lançamentos Detalhados":**
- Data
- Tipo (RECEITA/DESPESA)
- Descrição
- Categoria
- Conta Bancária
- Centro de Custo
- Conta Contábil
- Valor
- Taxas
- Valor Líquido
- Forma de Pagamento
- Referência/Documento
- Conciliado (Sim/Não)

---

### 2. Contas a Pagar

**Endpoint:** `GET /financial/reports/accounts-payable/export`

**Aba 1 - "Contas a Pagar - Resumo":**
- Fornecedor
- Descrição
- Categoria
- Valor Original
- Valor Pago
- Saldo
- Data de Emissão
- Vencimento
- Status
- Totais

**Aba 2 - "Detalhamento Completo":**
- Fornecedor
- CNPJ/CPF
- Descrição
- Categoria
- Centro de Custo
- Conta Contábil
- Nº Documento
- Valor Original
- Desconto
- Juros
- Multa
- Valor Pago
- Saldo
- Data Emissão
- Vencimento
- Data Pagamento
- Parcela (ex: 1/3)
- Status
- Observações

---

### 3. Contas a Receber

**Endpoint:** `GET /financial/reports/accounts-receivable/export`

**Aba 1 - "Contas a Receber - Resumo":**
- Cliente
- Descrição
- Categoria
- Valor Original
- Valor Recebido
- Saldo
- Data de Emissão
- Vencimento
- Status
- Totais

**Aba 2 - "Detalhamento Completo":**
- Cliente
- CNPJ/CPF
- Descrição
- Categoria
- Centro de Custo
- Conta Contábil
- Nº Documento
- Valor Original
- Desconto
- Juros
- Multa
- Valor Recebido
- Saldo
- Data Emissão
- Vencimento
- Data Recebimento
- Parcela (ex: 2/3)
- Status
- Observações

---

### 4. Transações por Centro de Custo

**Endpoint:** `GET /financial/reports/transactions/by-centro-custo/export`

**Aba 1 - "Resumo por Centro de Custo":**
- Centro de Custo
- Receitas
- Despesas
- Saldo
- Qtd. Transações
- Totais

**Aba 2 - "Todas as Transações":**
- Data
- Centro de Custo
- Tipo (RECEITA/DESPESA)
- Descrição
- Categoria
- Conta Bancária
- Conta Contábil
- Valor
- Taxas
- Valor Líquido
- Forma de Pagamento
- Referência/Documento
- Conciliado

---

### 5. Transações por Conta Contábil

**Endpoint:** `GET /financial/reports/transactions/by-conta-contabil/export`

**Aba 1 - "Resumo por Conta Contábil":**
- Conta Contábil (Código - Nome)
- Receitas
- Despesas
- Saldo
- Qtd. Transações
- Totais

**Aba 2 - "Todas as Transações":**
- Data
- Conta Contábil
- Tipo (RECEITA/DESPESA)
- Descrição
- Categoria
- Conta Bancária
- Centro de Custo
- Valor
- Taxas
- Valor Líquido
- Forma de Pagamento
- Referência/Documento
- Conciliado

---

## 💡 Benefícios

### 1. **Visão Completa**
- Não é mais necessário exportar múltiplos relatórios
- Resumo e detalhe em um único arquivo

### 2. **Auditoria Facilitada**
- Todos os dados disponíveis para análise
- Rastreabilidade completa das transações

### 3. **Análise Avançada**
- Usuários podem usar filtros e tabelas dinâmicas no Excel
- Possibilidade de criar gráficos personalizados

### 4. **Detalhamento de Vínculos**
- Visualização de Centro de Custo
- Visualização de Conta Contábil
- Informações de conciliação bancária

### 5. **Informações de Parcelas**
- Contas parceladas exibem "1/3", "2/3", etc.
- Facilita o acompanhamento de pagamentos/recebimentos

---

## 📋 Formatação Excel

### Cabeçalhos
- **Cor de fundo**: Azul (#FF4472C4)
- **Texto**: Branco, negrito
- **Altura**: Automática

### Valores Monetários
- **Formato**: R$ #,##0.00
- **Alinhamento**: Direita

### Datas
- **Formato**: dd/mm/yyyy
- **Alinhamento**: Centro

### Totais
- **Fórmulas**: SUM automático
- **Estilo**: Negrito
- **Localização**: Última linha de cada aba de resumo

---

## 🔄 Compatibilidade

- ✅ Formato: `.xlsx` (Excel 2007+)
- ✅ Biblioteca: ExcelJS
- ✅ Encoding: UTF-8
- ✅ Compatível com:
  - Microsoft Excel
  - Google Sheets
  - LibreOffice Calc
  - Apple Numbers

---

## 🎯 Exemplo de Uso

### Frontend (React/Next.js)

```typescript
const handleExportCashFlow = async () => {
  try {
    const response = await fetch(
      `${API_URL}/financial/reports/cash-flow/export?companyId=${companyId}&startDate=2024-01-01&endDate=2024-12-31`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'fluxo-caixa-2024.xlsx';
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error('Erro ao exportar:', error);
  }
};
```

### Resultado

O arquivo Excel baixado conterá:
- **Aba 1**: Resumo diário do fluxo de caixa com totais
- **Aba 2**: Todos os 500+ lançamentos do ano detalhados

---

## 📝 Notas Técnicas

### Performance
- Query otimizada com includes seletivos
- Processamento em memória eficiente
- Buffer direto sem arquivos temporários

### Segurança
- Validação de `companyId` obrigatória
- Filtros de data aplicados no banco
- Isolamento de dados por empresa

### Manutenibilidade
- Código reutilizável entre relatórios
- Formatação consistente
- Fácil adição de novas colunas

---

## 🚀 Próximos Passos Sugeridos

1. **Gráficos Automáticos**: Adicionar gráficos nas abas de resumo
2. **Filtros Automáticos**: Habilitar autofilter nas abas de detalhamento
3. **Formatação Condicional**: Destacar valores negativos, vencidos, etc.
4. **Exportação Agendada**: Permitir agendar exportações automáticas
5. **Templates Personalizados**: Permitir que empresas personalizem layouts

---

**Data da Implementação**: 10 de novembro de 2025  
**Versão**: 2.0  
**Desenvolvido por**: Backend ERP Team
