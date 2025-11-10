# 📊 Sistema de Tabelas Fiscais - Guia de Uso

## ✅ Status da Implementação

Sistema completo de tabelas fiscais implementado com:
- ✅ Tabelas INSS (faixas progressivas)
- ✅ Tabelas FGTS (alíquotas por categoria)
- ✅ Tabelas IRRF (faixas progressivas com dedução por dependente)
- ✅ Cálculos automáticos na folha de pagamento
- ✅ Cálculos automáticos no dashboard de RH
- ✅ Migrations criadas
- ✅ Permissões criadas
- ✅ Dados padrão 2025 inseridos

## 📋 Endpoints Disponíveis

### INSS
- `POST /tax-tables/inss` - Criar tabela INSS
- `GET /tax-tables/inss` - Listar tabelas INSS
- `GET /tax-tables/inss/:id` - Buscar tabela INSS
- `PATCH /tax-tables/inss/:id` - Atualizar tabela INSS
- `DELETE /tax-tables/inss/:id` - Deletar tabela INSS

### FGTS
- `POST /tax-tables/fgts` - Criar tabela FGTS
- `GET /tax-tables/fgts` - Listar tabelas FGTS
- `GET /tax-tables/fgts/:id` - Buscar tabela FGTS
- `PATCH /tax-tables/fgts/:id` - Atualizar tabela FGTS
- `DELETE /tax-tables/fgts/:id` - Deletar tabela FGTS

### IRRF
- `POST /tax-tables/irrf` - Criar tabela IRRF
- `GET /tax-tables/irrf` - Listar tabelas IRRF
- `GET /tax-tables/irrf/:id` - Buscar tabela IRRF
- `PATCH /tax-tables/irrf/:id` - Atualizar tabela IRRF
- `DELETE /tax-tables/irrf/:id` - Deletar tabela IRRF

## 📖 Exemplos de Uso

### 1. Criar Tabela INSS

```bash
curl -X POST http://localhost:4000/tax-tables/inss \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "x-company-id: ${COMPANY_ID}" \
  -H "Content-Type: application/json" \
  -d '{
    "year": 2025,
    "month": 1,
    "ranges": [
      {
        "minValue": 0,
        "maxValue": 1412.00,
        "employeeRate": 7.5,
        "employerRate": 20.0
      },
      {
        "minValue": 1412.01,
        "maxValue": 2666.68,
        "employeeRate": 9.0,
        "employerRate": 20.0
      },
      {
        "minValue": 2666.69,
        "maxValue": 4000.03,
        "employeeRate": 12.0,
        "employerRate": 20.0
      },
      {
        "minValue": 4000.04,
        "maxValue": 7786.02,
        "employeeRate": 14.0,
        "employerRate": 20.0
      }
    ],
    "active": true
  }'
```

### 2. Criar Tabela FGTS

```bash
curl -X POST http://localhost:4000/tax-tables/fgts \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "x-company-id: ${COMPANY_ID}" \
  -H "Content-Type: application/json" \
  -d '{
    "year": 2025,
    "month": 1,
    "rates": [
      {
        "category": "CLT",
        "monthlyRate": 8.0,
        "terminationRate": 40.0,
        "description": "Alíquota padrão para CLT"
      },
      {
        "category": "MENOR_APRENDIZ",
        "monthlyRate": 2.0,
        "terminationRate": 40.0,
        "description": "Alíquota reduzida para menor aprendiz"
      }
    ],
    "active": true
  }'
```

### 3. Criar Tabela IRRF

```bash
curl -X POST http://localhost:4000/tax-tables/irrf \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "x-company-id: ${COMPANY_ID}" \
  -H "Content-Type: application/json" \
  -d '{
    "year": 2025,
    "month": 1,
    "dependentDeduction": 189.59,
    "ranges": [
      {
        "minValue": 0,
        "maxValue": 2259.20,
        "rate": 0,
        "deduction": 0
      },
      {
        "minValue": 2259.21,
        "maxValue": 2826.65,
        "rate": 7.5,
        "deduction": 169.44
      },
      {
        "minValue": 2826.66,
        "maxValue": 3751.05,
        "rate": 15.0,
        "deduction": 381.44
      },
      {
        "minValue": 3751.06,
        "maxValue": 4664.68,
        "rate": 22.5,
        "deduction": 662.77
      },
      {
        "minValue": 4664.69,
        "maxValue": null,
        "rate": 27.5,
        "deduction": 896.00
      }
    ],
    "active": true
  }'
```

### 4. Listar Tabelas

```bash
# Listar tabelas INSS de 2025
curl -X GET "http://localhost:4000/tax-tables/inss?year=2025&active=true" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "x-company-id: ${COMPANY_ID}"

# Listar tabelas FGTS
curl -X GET "http://localhost:4000/tax-tables/fgts" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "x-company-id: ${COMPANY_ID}"

# Listar tabelas IRRF
curl -X GET "http://localhost:4000/tax-tables/irrf" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "x-company-id: ${COMPANY_ID}"
```

## 🔧 Como Funciona

### Cálculo de Folha de Pagamento

Quando você chama `POST /payroll/:id/calculate`, o sistema:

1. Busca as tabelas fiscais ativas para o período da folha
2. Para cada colaborador:
   - Calcula INSS usando a tabela progressiva (desconto do empregado + contribuição patronal)
   - Calcula IRRF usando a tabela progressiva (com dedução por dependentes)
   - Aplica as alíquotas corretas baseadas nas tabelas
3. Gera os itens da folha com os valores calculados

### Dashboard de RH

Quando você chama `GET /employees/dashboard`, o sistema:

1. Busca as tabelas fiscais ativas
2. Calcula para todos os colaboradores ativos:
   - INSS patronal real (usando tabela progressiva)
   - FGTS (usando alíquota da tabela)
   - Provisões (13º + férias + 1/3 férias)
   - Outros encargos (RAT, Salário Educação, Sistema S)
3. Retorna o custo total real por centro de custo

## 📊 Tabelas Padrão 2025

O sistema já vem com tabelas padrão de 2025 cadastradas:

### INSS 2025
- Faixa 1: Até R$ 1.412,00 - 7,5% (empregado) / 20% (empregador)
- Faixa 2: R$ 1.412,01 a R$ 2.666,68 - 9% / 20%
- Faixa 3: R$ 2.666,69 a R$ 4.000,03 - 12% / 20%
- Faixa 4: R$ 4.000,04 a R$ 7.786,02 - 14% / 20%

### FGTS 2025
- CLT: 8% mensal / 40% rescisão
- Menor Aprendiz: 2% mensal / 40% rescisão
- Estágio: 0% (sem FGTS)

### IRRF 2025
- Dedução por dependente: R$ 189,59
- Faixa 1: Até R$ 2.259,20 - Isento
- Faixa 2: R$ 2.259,21 a R$ 2.826,65 - 7,5%
- Faixa 3: R$ 2.826,66 a R$ 3.751,05 - 15%
- Faixa 4: R$ 3.751,06 a R$ 4.664,68 - 22,5%
- Faixa 5: Acima de R$ 4.664,68 - 27,5%

## 🔒 Permissões

As seguintes permissões foram criadas:
- `tax_tables.create` - Criar tabelas fiscais
- `tax_tables.read` - Visualizar tabelas fiscais
- `tax_tables.update` - Atualizar tabelas fiscais
- `tax_tables.delete` - Deletar tabelas fiscais

## ⚙️ Configuração

### Criar Permissões

```bash
npx ts-node prisma/seeds/create-tax-tables-permissions.ts
```

### Criar Tabelas Padrão 2025

```bash
npx ts-node prisma/seeds/create-default-tax-tables.ts
```

## 💡 Dicas

1. **Múltiplas Tabelas**: Você pode ter várias tabelas para o mesmo período, mas apenas uma pode estar ativa por vez.

2. **Atualização Anual**: Crie novas tabelas quando as alíquotas mudarem (geralmente no início do ano).

3. **Histórico**: Mantenha as tabelas antigas (inativas) para referência histórica e recálculos.

4. **Validação**: O sistema valida que não pode ter duas tabelas ativas para o mesmo período (ano/mês).

5. **Busca Automática**: Se não houver tabela para o mês específico, o sistema busca a mais recente automaticamente.

## 🚀 Próximos Passos

Para adicionar suporte a:
- Dependentes por colaborador (campo no Employee)
- Categorias diferentes de contrato (usar em vez de hardcoded 'CLT')
- Descontos adicionais personalizados
- Exportação de relatórios com detalhamento fiscal
