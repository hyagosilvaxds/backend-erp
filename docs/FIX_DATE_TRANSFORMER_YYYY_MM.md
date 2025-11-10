# Fix: Date Transformer - Suporte para Formato YYYY-MM

## Problema

Ao criar uma distribuição com `competenceDate` no formato `"2025-09"` (apenas ano-mês), o Prisma retornava erro:

```
Invalid value for argument `competenceDate`: premature end of input. 
Expected ISO-8601 DateTime.
```

### Erro Completo
```typescript
PrismaClientValidationError: 
Invalid `this.prisma.distribution.create()` invocation

data: {
  competenceDate: "2025-09",  // ❌ Formato inválido
                  ~~~~~~~~~
  // ... outros campos
}

Invalid value for argument `competenceDate`: premature end of input. 
Expected ISO-8601 DateTime.
```

## Causa Raiz

O transformer `transformToISODate` não estava tratando o formato `YYYY-MM` (ano-mês), apenas:
- ✅ `YYYY-MM-DD` → `YYYY-MM-DDT00:00:00.000Z`
- ✅ `YYYY-MM-DDTHH:mm:ss.sssZ` → (mantém como está)
- ❌ `YYYY-MM` → (não tratado, passava direto)

## Solução

Adicionada validação e transformação para formato `YYYY-MM`:

```typescript
// Se está em formato YYYY-MM (apenas ano e mês), adiciona dia 01 e hora
if (typeof value === 'string' && /^\d{4}-\d{2}$/.test(value)) {
  return `${value}-01T00:00:00.000Z`;
}
```

### Transformações Suportadas

| Entrada | Saída | Uso |
|---------|-------|-----|
| `"2024-11-10"` | `"2024-11-10T00:00:00.000Z"` | Data completa |
| `"2024-11"` | `"2024-11-01T00:00:00.000Z"` | Competência mensal |
| `"2024-11-10T10:30:00.000Z"` | `"2024-11-10T10:30:00.000Z"` | ISO completo (mantém) |
| `null` / `undefined` | `null` / `undefined` | Campos opcionais |

## Arquivo Modificado

**Caminho**: `/src/common/transformers/date.transformer.ts`

### Antes
```typescript
export function transformToISODate({ value }: { value: any }): any {
  if (!value) return value;
  
  // Se já está em formato ISO completo, retorna como está
  if (typeof value === 'string' && value.includes('T')) {
    return value;
  }
  
  // Se está em formato YYYY-MM-DD, adiciona hora
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return `${value}T00:00:00.000Z`;
  }
  
  return value;
}
```

### Depois
```typescript
export function transformToISODate({ value }: { value: any }): any {
  if (!value) return value;
  
  // Se já está em formato ISO completo, retorna como está
  if (typeof value === 'string' && value.includes('T')) {
    return value;
  }
  
  // Se está em formato YYYY-MM-DD, adiciona hora
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return `${value}T00:00:00.000Z`;
  }
  
  // Se está em formato YYYY-MM (apenas ano e mês), adiciona dia 01 e hora
  if (typeof value === 'string' && /^\d{4}-\d{2}$/.test(value)) {
    return `${value}-01T00:00:00.000Z`;
  }
  
  return value;
}
```

## Impacto

### DTOs Afetados (usam `@Transform(transformToISODate)`)

#### Módulo SCP
1. **CreateDistributionDto**
   - `distributionDate`
   - `competenceDate` ✅ (problema resolvido)
   - `paymentDate`

2. **CreateBulkDistributionDto**
   - `distributionDate`
   - `competenceDate` ✅ (problema resolvido)
   - `paymentDate`

3. **CreateInvestmentDto** (Aportes)
   - `investmentDate`

4. **CreateDistributionPolicyDto**
   - `startDate`
   - `endDate`

#### Módulo Investidores
5. **CreateInvestorDto**
   - `birthDate` (PF)
   - `foundedDate` (PJ)

#### Outros Módulos
6. Qualquer DTO que use `@Transform(transformToISODate)`

### Compatibilidade

✅ **100% Retrocompatível**: Todos os formatos anteriormente suportados continuam funcionando

| Formato Enviado | Antes | Depois |
|-----------------|-------|--------|
| `"2024-11-10"` | ✅ Funciona | ✅ Funciona |
| `"2024-11-10T10:30:00.000Z"` | ✅ Funciona | ✅ Funciona |
| `"2024-11"` | ❌ Erro | ✅ Funciona |

## Casos de Uso

### 1. Competência Mensal
Para distribuições que se referem a um mês inteiro:

```json
{
  "competenceDate": "2024-11",
  // Será transformado para "2024-11-01T00:00:00.000Z"
}
```

### 2. Data Completa
Para distribuições de uma data específica:

```json
{
  "competenceDate": "2024-11-15",
  // Será transformado para "2024-11-15T00:00:00.000Z"
}
```

### 3. ISO Completo (Frontend envia)
Quando o frontend já envia no formato ISO:

```json
{
  "competenceDate": "2024-11-15T14:30:00.000Z",
  // Mantém o formato original
}
```

## Testes

### Teste Manual (HTTP)

```http
### Criar Distribuição com competenceDate YYYY-MM
POST http://localhost:3000/scp/distributions
Authorization: Bearer {{token}}
x-company-id: {{companyId}}
Content-Type: application/json

{
  "projectId": "uuid",
  "investorId": "uuid",
  "amount": 1000,
  "percentage": 100,
  "baseValue": 1000,
  "distributionDate": "2024-11-10",
  "competenceDate": "2024-11",  // ✅ Agora funciona!
  "status": "PENDENTE"
}
```

### Teste Unitário Sugerido

```typescript
describe('transformToISODate', () => {
  it('should transform YYYY-MM to ISO date with day 01', () => {
    const result = transformToISODate({ value: '2024-11' });
    expect(result).toBe('2024-11-01T00:00:00.000Z');
  });

  it('should transform YYYY-MM-DD to ISO date', () => {
    const result = transformToISODate({ value: '2024-11-10' });
    expect(result).toBe('2024-11-10T00:00:00.000Z');
  });

  it('should keep ISO format unchanged', () => {
    const input = '2024-11-10T14:30:00.000Z';
    const result = transformToISODate({ value: input });
    expect(result).toBe(input);
  });

  it('should return null for null value', () => {
    const result = transformToISODate({ value: null });
    expect(result).toBeNull();
  });
});
```

## Validação de Entrada

O `@IsDateString()` do class-validator aceita ambos os formatos:

```typescript
@IsDateString()  // ✅ Aceita YYYY-MM-DD e YYYY-MM
@Transform(transformToISODate)
competenceDate: string;
```

## Considerações

### Data como Primeiro Dia do Mês

Quando o formato é `YYYY-MM`, o transformer adiciona `-01` (primeiro dia do mês). Isso é apropriado para:

- ✅ Competências mensais
- ✅ Períodos de referência
- ✅ Início de ciclos

Se precisar do último dia do mês, o frontend deve enviar a data completa:
```json
{
  "competenceDate": "2024-11-30"  // Último dia de novembro
}
```

### Timezone

Todas as datas são convertidas para UTC (Z no final):
- `"2024-11"` → `"2024-11-01T00:00:00.000Z"` (midnight UTC)

Isso garante consistência no banco de dados e evita problemas de timezone.

## Benefícios

1. ✅ **UX Melhorado**: Usuário pode digitar `"2024-11"` ao invés de `"2024-11-01"`
2. ✅ **Flexibilidade**: Aceita múltiplos formatos de data
3. ✅ **Retrocompatível**: Não quebra código existente
4. ✅ **Validação Consistente**: Todas as datas transformadas para ISO-8601
5. ✅ **Documentação Clara**: Comentários explicam cada formato

## Referências

- **ISO 8601**: https://en.wikipedia.org/wiki/ISO_8601
- **Prisma DateTime**: https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference#datetime
- **class-validator IsDateString**: https://github.com/typestack/class-validator#isDateString

## Changelog

### [1.1.0] - 2024-11-10
- ✅ Adicionado suporte para formato `YYYY-MM`
- ✅ Documentação atualizada
- ✅ Exemplos adicionados
- ✅ 100% retrocompatível

### [1.0.0] - 2024-09-XX
- Suporte inicial para `YYYY-MM-DD` e ISO completo
