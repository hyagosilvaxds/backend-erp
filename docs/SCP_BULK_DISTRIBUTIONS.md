# Distribuição em Lote - SCP Module

## Visão Geral

A funcionalidade de **Distribuição em Lote** permite criar múltiplas distribuições para diferentes investidores em uma única requisição. Isso é especialmente útil para processar rodadas de distribuição de lucros de forma eficiente.

## Endpoint

```
POST /scp/distributions/bulk
```

**Headers:**
- `Authorization: Bearer {token}`
- `x-company-id: {companyId}`
- `Content-Type: application/json`

## Estrutura do Request

### Campos Compartilhados

Estes campos são aplicados a todas as distribuições criadas:

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `projectId` | string (UUID) | Sim | ID do projeto SCP |
| `baseValue` | number | Sim | Valor base total da distribuição |
| `referenceNumber` | string | Não | Número de referência da distribuição |
| `distributionDate` | string (ISO Date) | Sim | Data da distribuição |
| `competenceDate` | string (ISO Date) | Sim | Data de competência |
| `paymentMethod` | enum | Não | Método de pagamento: TED, PIX, DOC, DINHEIRO, CHEQUE |
| `paymentDate` | string (ISO Date) | Não | Data do pagamento |
| `status` | enum | Não | Status: PENDENTE, PAGO, CANCELADO (padrão: PENDENTE) |
| `bankAccountId` | string (UUID) | Não | ID da conta bancária usada |
| `attachments` | string[] | Não | Array de nomes de arquivos anexos |
| `distributions` | array | Sim | Array de distribuições individuais |

### Campos Individuais (por investidor)

Cada item no array `distributions` contém:

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `investorId` | string (UUID) | Sim | ID do investidor |
| `amount` | number | Sim | Valor bruto da distribuição |
| `percentage` | number | Sim | Percentual da distribuição |
| `irrf` | number | Não | Valor do IRRF retido |
| `otherDeductions` | number | Não | Outras deduções |
| `notes` | string | Não | Observações específicas do investidor |

## Exemplo Completo

### Request

```json
{
  "projectId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "baseValue": 100000.00,
  "referenceNumber": "DIST-2024-Q1-001",
  "distributionDate": "2024-03-31",
  "competenceDate": "2024-03-01",
  "paymentMethod": "TED",
  "paymentDate": "2024-03-31",
  "status": "PAGO",
  "attachments": [
    "comprovante-ted-1.pdf",
    "comprovante-ted-2.pdf",
    "comprovante-ted-3.pdf"
  ],
  "distributions": [
    {
      "investorId": "inv-001-uuid",
      "amount": 50000.00,
      "percentage": 50.0,
      "irrf": 7500.00,
      "otherDeductions": 100.00,
      "notes": "Sócio majoritário - 50% do lucro"
    },
    {
      "investorId": "inv-002-uuid",
      "amount": 30000.00,
      "percentage": 30.0,
      "irrf": 4500.00,
      "otherDeductions": 0,
      "notes": "Participação de 30%"
    },
    {
      "investorId": "inv-003-uuid",
      "amount": 20000.00,
      "percentage": 20.0,
      "irrf": 3000.00,
      "otherDeductions": 0,
      "notes": "Investidor minoritário - 20%"
    }
  ]
}
```

### Response (Sucesso)

```json
{
  "message": "3 distribuições criadas com sucesso",
  "count": 3,
  "distributions": [
    {
      "id": "dist-001-uuid",
      "companyId": "company-uuid",
      "projectId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "investorId": "inv-001-uuid",
      "amount": 50000.00,
      "percentage": 50.0,
      "baseValue": 100000.00,
      "referenceNumber": "DIST-2024-Q1-001",
      "distributionDate": "2024-03-31T00:00:00.000Z",
      "competenceDate": "2024-03-01T00:00:00.000Z",
      "paymentMethod": "TED",
      "paymentDate": "2024-03-31T00:00:00.000Z",
      "status": "PAGO",
      "irrf": 7500.00,
      "otherDeductions": 100.00,
      "netAmount": 42400.00,
      "notes": "Sócio majoritário - 50% do lucro",
      "attachments": [
        "comprovante-ted-1.pdf",
        "comprovante-ted-2.pdf",
        "comprovante-ted-3.pdf"
      ],
      "paidAt": "2024-03-31T14:30:00.000Z",
      "createdAt": "2024-03-31T14:30:00.000Z",
      "updatedAt": "2024-03-31T14:30:00.000Z",
      "project": {
        "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "code": "SCP-001",
        "name": "Projeto Alpha",
        // ... outros campos
      },
      "investor": {
        "id": "inv-001-uuid",
        "name": "João Silva",
        // ... outros campos
      }
    },
    // ... distribuições 2 e 3 com estrutura similar
  ]
}
```

### Response (Erro - Investidor não encontrado)

```json
{
  "statusCode": 404,
  "message": "Um ou mais investidores não encontrados",
  "error": "Not Found"
}
```

### Response (Erro - Projeto não encontrado)

```json
{
  "statusCode": 404,
  "message": "Projeto não encontrado",
  "error": "Not Found"
}
```

## Funcionamento Interno

### 1. Validações

1. **Projeto**: Verifica se o projeto existe e pertence à empresa
2. **Investidores**: Verifica se todos os investidores existem e pertencem à empresa
3. **Dados**: Valida tipos e valores obrigatórios

### 2. Transação Atômica

Todas as distribuições são criadas dentro de uma **transação do Prisma**. Isso garante que:

- Ou todas as distribuições são criadas com sucesso
- Ou nenhuma é criada (rollback em caso de erro)
- Não há risco de criar distribuições parciais

### 3. Cálculo Automático

Para cada distribuição:

```
netAmount = amount - irrf - otherDeductions
```

Exemplo:
- Amount: R$ 50.000,00
- IRRF: R$ 7.500,00
- Outras deduções: R$ 100,00
- **Net Amount: R$ 42.400,00**

### 4. Atualização do Projeto

Se `status = 'PAGO'`:

- Soma todos os `netAmount` das distribuições
- Incrementa o campo `distributedValue` do projeto com o total
- Define `paidAt` com a data/hora atual

### 5. Auditoria

Cada distribuição registra:

- `createdAt`: Data de criação
- `updatedAt`: Última atualização
- `paidAt`: Data do pagamento (se status = PAGO)

## Casos de Uso

### 1. Distribuição Trimestral (Status PENDENTE)

Criar todas as distribuições do trimestre como PENDENTES e depois atualizar individualmente quando cada pagamento for efetuado.

```json
{
  "projectId": "uuid",
  "baseValue": 150000.00,
  "referenceNumber": "DIST-Q1-2024",
  "distributionDate": "2024-03-31",
  "competenceDate": "2024-01-01",
  "status": "PENDENTE",
  "distributions": [
    // ... investidores
  ]
}
```

**Vantagem**: Planejamento antecipado, controle individual de pagamentos.

### 2. Pagamento Imediato (Status PAGO)

Quando o pagamento já foi efetuado para todos os investidores.

```json
{
  "projectId": "uuid",
  "baseValue": 80000.00,
  "referenceNumber": "DIST-MENSAL-11-2024",
  "distributionDate": "2024-11-30",
  "competenceDate": "2024-11-01",
  "paymentMethod": "PIX",
  "paymentDate": "2024-11-30",
  "status": "PAGO",
  "attachments": ["comprovantes-pix.pdf"],
  "distributions": [
    // ... investidores
  ]
}
```

**Vantagem**: Registro completo e atualização imediata do `distributedValue` do projeto.

### 3. Distribuição Proporcional

Distribuir lucros proporcionalmente à participação de cada investidor.

**Exemplo:**
- Lucro total: R$ 100.000,00
- Investidor A: 50% → R$ 50.000,00
- Investidor B: 30% → R$ 30.000,00
- Investidor C: 20% → R$ 20.000,00

```json
{
  "baseValue": 100000.00,
  "distributions": [
    {
      "investorId": "A",
      "amount": 50000.00,
      "percentage": 50.0
    },
    {
      "investorId": "B",
      "amount": 30000.00,
      "percentage": 30.0
    },
    {
      "investorId": "C",
      "amount": 20000.00,
      "percentage": 20.0
    }
  ]
}
```

### 4. Valores Diferentes por Investidor

Cada investidor pode ter deduções diferentes (IRRF, taxas, etc.).

```json
{
  "distributions": [
    {
      "investorId": "A",
      "amount": 50000.00,
      "percentage": 50.0,
      "irrf": 7500.00,
      "otherDeductions": 100.00,
      "notes": "Possui isenção parcial"
    },
    {
      "investorId": "B",
      "amount": 50000.00,
      "percentage": 50.0,
      "irrf": 10000.00,
      "otherDeductions": 0,
      "notes": "Sem isenções"
    }
  ]
}
```

## Diferenças entre `/distributions` e `/distributions/bulk`

| Aspecto | `/distributions` | `/distributions/bulk` |
|---------|------------------|----------------------|
| **Investidores** | 1 por vez | Múltiplos |
| **Transação** | Individual | Atômica (todos ou nenhum) |
| **Eficiência** | N requests para N investidores | 1 request para N investidores |
| **Attachments** | Individual | Compartilhado por todos |
| **Status** | Individual | Compartilhado por todos |
| **Notes** | Uma nota | Uma nota por investidor |
| **Uso ideal** | Distribuição única ou correção | Rodada completa de distribuição |

## Fluxo Recomendado

### Passo 1: Preparar dados

1. Listar investidores do projeto
2. Calcular valores e percentuais
3. Preparar comprovantes (se status = PAGO)

### Passo 2: Criar distribuição em lote

```bash
POST /scp/distributions/bulk
```

### Passo 3: Verificar resultado

- Conferir `count` retornado
- Validar que todos os investidores foram incluídos
- Verificar se `distributedValue` do projeto foi atualizado (se status = PAGO)

### Passo 4: Listar distribuições criadas

```bash
GET /scp/distributions?projectId={uuid}&page=1&limit=50
```

## Boas Práticas

### 1. Usar `referenceNumber` para organização

```
DIST-{ANO}-Q{TRIMESTRE}-{SEQUENCIAL}
DIST-2024-Q1-001
DIST-2024-MENSAL-03-001
```

### 2. Anexar comprovantes quando status = PAGO

Sempre incluir comprovantes de pagamento para auditoria.

### 3. Validar soma de percentuais

Antes de enviar, validar que a soma dos percentuais faz sentido (geralmente 100%).

### 4. Usar `notes` para contexto

Adicionar informações relevantes para cada investidor.

### 5. Status PENDENTE primeiro

Para processos que levam tempo, criar como PENDENTE e depois atualizar individualmente quando pago:

```bash
# Criar como PENDENTE
POST /scp/distributions/bulk (status: PENDENTE)

# Depois atualizar cada uma quando paga
PUT /scp/distributions/{id} (status: PAGO, paymentDate, etc.)
```

## Troubleshooting

### Erro: "Um ou mais investidores não encontrados"

**Causa**: Um ou mais IDs de investidores não existem ou não pertencem à empresa.

**Solução**:
1. Listar investidores: `GET /investors`
2. Verificar IDs corretos
3. Confirmar que investidores pertencem à empresa correta

### Erro: "Projeto não encontrado"

**Causa**: ID do projeto não existe ou não pertence à empresa.

**Solução**:
1. Listar projetos: `GET /scp/projects`
2. Usar ID correto
3. Verificar `x-company-id` header

### Transação falhou no meio

**Causa**: Erro em alguma validação ou constraint do banco.

**Resultado**: Nenhuma distribuição foi criada (rollback automático).

**Solução**:
1. Verificar logs de erro
2. Corrigir dados problemáticos
3. Tentar novamente

## Performance

### Comparação de Performance

**Cenário**: Criar distribuições para 10 investidores

| Método | Requests | Tempo Estimado | Atomicidade |
|--------|----------|----------------|-------------|
| Individual | 10 requests | ~5-10s | Não |
| Bulk | 1 request | ~0.5-1s | Sim |

**Vantagens do Bulk**:
- 10x mais rápido
- Menos overhead de rede
- Transação atômica
- Mais fácil de auditar

## Exemplos de Integração

### Frontend React

```typescript
interface BulkDistribution {
  investorId: string;
  amount: number;
  percentage: number;
  irrf?: number;
  otherDeductions?: number;
  notes?: string;
}

async function createBulkDistribution(
  projectId: string,
  baseValue: number,
  distributions: BulkDistribution[]
) {
  const response = await fetch('/scp/distributions/bulk', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'x-company-id': companyId,
    },
    body: JSON.stringify({
      projectId,
      baseValue,
      referenceNumber: `DIST-${new Date().getFullYear()}-${Date.now()}`,
      distributionDate: new Date().toISOString(),
      competenceDate: new Date().toISOString(),
      status: 'PENDENTE',
      distributions,
    }),
  });

  if (!response.ok) {
    throw new Error('Falha ao criar distribuições');
  }

  return response.json();
}
```

### Python

```python
import requests
from datetime import datetime

def create_bulk_distribution(project_id, distributions):
    url = 'https://api.example.com/scp/distributions/bulk'
    
    payload = {
        'projectId': project_id,
        'baseValue': sum(d['amount'] for d in distributions),
        'referenceNumber': f'DIST-{datetime.now().year}-{datetime.now().timestamp()}',
        'distributionDate': datetime.now().isoformat(),
        'competenceDate': datetime.now().isoformat(),
        'status': 'PENDENTE',
        'distributions': distributions
    }
    
    response = requests.post(
        url,
        json=payload,
        headers={
            'Authorization': f'Bearer {token}',
            'x-company-id': company_id,
        }
    )
    
    response.raise_for_status()
    return response.json()
```

## Conclusão

A funcionalidade de **Distribuição em Lote** oferece uma maneira eficiente, segura e atômica de processar múltiplas distribuições simultaneamente. Use-a para:

- ✅ Processar rodadas completas de distribuição
- ✅ Garantir consistência com transações atômicas
- ✅ Melhorar performance (10x mais rápido)
- ✅ Simplificar auditoria com comprovantes compartilhados
- ✅ Reduzir complexidade no frontend

Para distribuições individuais ou correções pontuais, continue usando `POST /scp/distributions`.
