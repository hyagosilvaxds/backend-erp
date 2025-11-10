# SCP Module - Quick Start Guide

## Início Rápido

Este guia mostra como começar a usar o módulo de Investidores SCP em 5 minutos.

## 1. Cadastrar Investidores

```bash
POST /scp/investors
Authorization: Bearer {seu_token}

# Pessoa Física
{
  "type": "PESSOA_FISICA",
  "name": "Maria Santos",
  "document": "111.222.333-44",
  "email": "maria@email.com",
  "phone": "(11) 91234-5678",
  "bankName": "Itaú",
  "bankCode": "341",
  "agencyNumber": "1234",
  "accountNumber": "12345-6",
  "accountType": "CORRENTE",
  "pixKey": "maria@email.com"
}

# Pessoa Jurídica
{
  "type": "PESSOA_JURIDICA",
  "name": "Tech Investimentos Ltda",
  "document": "11.222.333/0001-44",
  "email": "contato@techinvest.com",
  "phone": "(11) 3333-4444",
  "bankName": "Banco do Brasil",
  "bankCode": "001",
  "agencyNumber": "5678",
  "accountNumber": "98765-4",
  "accountType": "CORRENTE"
}
```

**Resposta:** IDs dos investidores criados

## 2. Criar Projeto

```bash
POST /scp/projects
Authorization: Bearer {seu_token}

{
  "name": "Projeto Energia Solar - Fase 1",
  "code": "SOLAR-2024-01",
  "description": "Construção de usina fotovoltaica de 500kWp",
  "totalValue": 2500000.00,
  "startDate": "2024-11-01T00:00:00.000Z",
  "endDate": "2026-10-31T23:59:59.999Z",
  "status": "ATIVO",
  "active": true,
  "notes": "Projeto com retorno estimado de 18% a.a."
}
```

**Resposta:** ID do projeto criado

## 3. Definir Políticas de Distribuição

Configure como os lucros serão divididos entre os investidores. A soma dos percentuais deve ser 100%.

```bash
# Investidor 1: 50% dos lucros
POST /scp/distribution-policies
Authorization: Bearer {seu_token}

{
  "projectId": "{project_id}",
  "investorId": "{investor1_id}",
  "percentage": 50.00,
  "type": "PROPORCIONAL",
  "startDate": "2024-11-01T00:00:00.000Z",
  "active": true
}

# Investidor 2: 30% dos lucros
{
  "projectId": "{project_id}",
  "investorId": "{investor2_id}",
  "percentage": 30.00,
  "type": "PROPORCIONAL",
  "startDate": "2024-11-01T00:00:00.000Z",
  "active": true
}

# Investidor 3: 20% dos lucros
{
  "projectId": "{project_id}",
  "investorId": "{investor3_id}",
  "percentage": 20.00,
  "type": "PROPORCIONAL",
  "startDate": "2024-11-01T00:00:00.000Z",
  "active": true
}
```

### Verificar Políticas
```bash
GET /scp/distribution-policies/by-project/{project_id}
```

**Resposta esperada:**
```json
{
  "summary": {
    "totalPercentage": 100.00,
    "isComplete": true
  }
}
```

## 4. Registrar Aportes de Capital

```bash
POST /scp/investments
Authorization: Bearer {seu_token}

{
  "projectId": "{project_id}",
  "investorId": "{investor1_id}",
  "amount": 1250000.00,
  "investmentDate": "2024-11-01T10:00:00.000Z",
  "referenceNumber": "AP-2024-001",
  "paymentMethod": "TRANSFERENCIA",
  "status": "CONFIRMADO",
  "notes": "Aporte inicial - 50% do projeto"
}

# Repetir para outros investidores...
```

### Verificar Aportes do Projeto
```bash
GET /scp/investments/by-project/{project_id}
```

## 5. Distribuir Lucros

### Opção A: Criar Manualmente
```bash
POST /scp/distributions

{
  "projectId": "{project_id}",
  "investorId": "{investor1_id}",
  "amount": 25000.00,
  "percentage": 50.00,
  "baseValue": 50000.00,
  "distributionDate": "2024-12-05T00:00:00.000Z",
  "competenceDate": "2024-11-30T23:59:59.999Z",
  "status": "PENDENTE",
  "irrf": 1250.00,
  "otherDeductions": 0
}
```

### Opção B: Criar Automaticamente (Recomendado)
```bash
POST /scp/distributions/bulk-create
Authorization: Bearer {seu_token}

{
  "projectId": "{project_id}",
  "baseValue": 50000.00,
  "competenceDate": "2024-11-30T23:59:59.999Z",
  "distributionDate": "2024-12-05T00:00:00.000Z"
}
```

**Resultado:** Cria 3 distribuições automaticamente:
- Investidor 1: R$ 25.000 (50%)
- Investidor 2: R$ 15.000 (30%)
- Investidor 3: R$ 10.000 (20%)

## 6. Marcar Distribuições como Pagas

Após efetuar as transferências bancárias:

```bash
POST /scp/distributions/{distribution_id}/mark-as-paid
Authorization: Bearer {seu_token}
```

Ou atualizar manualmente:

```bash
PUT /scp/distributions/{distribution_id}

{
  "status": "PAGO",
  "paymentDate": "2024-12-06T14:30:00.000Z",
  "paymentMethod": "PIX"
}
```

## 7. Consultar Estatísticas

### Visão Geral de Todos os Projetos
```bash
GET /scp/projects/stats
```

**Resposta:**
```json
{
  "projects": [
    {
      "projectName": "Energia Solar - Fase 1",
      "totalInvested": 2500000.00,
      "totalDistributed": 150000.00,
      "availableBalance": 2350000.00,
      "roi": "6.00"
    }
  ],
  "summary": {
    "totalProjects": 1,
    "totalInvested": 2500000.00,
    "totalDistributed": 150000.00,
    "averageROI": "6.00"
  }
}
```

### Dados de um Investidor
```bash
GET /scp/investors/{investor_id}
```

**Resposta:**
```json
{
  "id": "uuid",
  "name": "Maria Santos",
  "document": "111.222.333-44",
  "investments": [...],
  "distributions": [...],
  "totals": {
    "invested": 1250000.00,
    "distributed": 75000.00
  }
}
```

### Dados de um Projeto
```bash
GET /scp/projects/{project_id}
```

**Resposta:**
```json
{
  "id": "uuid",
  "name": "Energia Solar - Fase 1",
  "code": "SOLAR-2024-01",
  "investedValue": 2500000.00,
  "distributedValue": 150000.00,
  "totals": {
    "invested": 2500000.00,
    "distributed": 150000.00,
    "pending": 0,
    "availableBalance": 2350000.00
  }
}
```

## Fluxo Mensal Típico

```bash
# 1. No início do mês: Verificar aportes pendentes
GET /scp/investments?status=PENDENTE

# 2. Confirmar aportes recebidos
PUT /scp/investments/{id}
{ "status": "CONFIRMADO" }

# 3. No final do mês: Calcular lucros
# (exemplo: R$ 50.000 de lucro)

# 4. Criar distribuições automaticamente
POST /scp/distributions/bulk-create
{
  "projectId": "{project_id}",
  "baseValue": 50000.00,
  "competenceDate": "2024-11-30T23:59:59.999Z",
  "distributionDate": "2024-12-05T00:00:00.000Z"
}

# 5. Revisar distribuições criadas
GET /scp/distributions?status=PENDENTE&projectId={project_id}

# 6. Efetuar pagamentos aos investidores
# (via banco, PIX, etc.)

# 7. Marcar como pagas
POST /scp/distributions/{dist1_id}/mark-as-paid
POST /scp/distributions/{dist2_id}/mark-as-paid
POST /scp/distributions/{dist3_id}/mark-as-paid

# 8. Gerar relatório mensal
GET /scp/projects/stats
```

## Dicas Importantes

### ✅ Boas Práticas

1. **Sempre defina políticas de distribuição antes de distribuir lucros**
   - Facilita cálculos
   - Evita erros manuais
   - Garante transparência

2. **Use bulk-create para distribuições**
   - Mais rápido
   - Calcula automaticamente
   - Consistente

3. **Mantenha status atualizados**
   - PENDENTE: Aguardando confirmação/pagamento
   - CONFIRMADO: Valor recebido
   - PAGO: Transferência realizada

4. **Use referenceNumber e documentNumber**
   - Facilita rastreamento
   - Importante para auditoria

5. **Anexe comprovantes**
   - Use campo `attachments`
   - Armazene URLs de documentos

### ⚠️ Cuidados

1. **Políticas devem somar 100%**
   - Sistema valida automaticamente
   - Não permite exceder 100%

2. **Não delete registros com vínculos**
   - Desative ao invés de deletar
   - Use `active: false`

3. **Atenção ao mudar status**
   - CONFIRMADO → CANCELADO afeta investedValue
   - PAGO → CANCELADO afeta distributedValue

4. **Documentos únicos por empresa**
   - CPF/CNPJ não pode repetir
   - Código de projeto não pode repetir

## Troubleshooting

### "Soma dos percentuais excede 100%"
**Solução:** Ajuste os percentuais das políticas ativas do projeto.

```bash
# Verificar políticas atuais
GET /scp/distribution-policies/by-project/{project_id}

# Ajustar percentuais
PUT /scp/distribution-policies/{policy_id}
{ "percentage": 30.00 }
```

### "Investidor já possui política ativa"
**Solução:** Desative a política anterior ou crie uma nova com período diferente.

```bash
# Desativar política antiga
PUT /scp/distribution-policies/{old_policy_id}
{ "active": false, "endDate": "2024-10-31T23:59:59.999Z" }

# Criar nova política
POST /scp/distribution-policies
{ ... }
```

### "Não é possível excluir com vínculos"
**Solução:** Desative o registro ao invés de excluir.

```bash
PUT /scp/investors/{id}
{ "active": false }

PUT /scp/projects/{id}
{ "active": false, "status": "CANCELADO" }
```

## Próximos Passos

1. ✅ Cadastrar investidores
2. ✅ Criar projetos
3. ✅ Definir políticas
4. ✅ Registrar aportes
5. ✅ Distribuir lucros
6. 📊 Gerar relatórios gerenciais
7. 📧 Configurar notificações
8. 🔗 Integrar com módulo financeiro

## Recursos Adicionais

- **Documentação Completa:** `/docs/SCP_MODULE.md`
- **Testes HTTP:** `/scp-api-tests.http`
- **Schema Prisma:** `/prisma/schema.prisma` (modelos Investor, ScpProject, etc.)

## Suporte

Para dúvidas ou problemas:
1. Consulte a documentação completa
2. Verifique os exemplos em `scp-api-tests.http`
3. Analise os logs do servidor
4. Verifique validações e mensagens de erro da API
