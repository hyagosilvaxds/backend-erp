# 🔧 Correção: Campo validUntil

## 🐛 Problema Identificado

O frontend estava enviando o campo `validUntil` no formato timestamp completo:

```json
{
  "validUntil": "2025-11-15T23:59:59.999Z"
}
```

Mas o backend retornava erro:

```json
{
  "statusCode": 400,
  "message": [
    "validUntil must be a valid ISO 8601 date string"
  ],
  "error": "Bad Request"
}
```

## 🔍 Causa Raiz

O decorator `@IsDateString()` do class-validator é muito restritivo e valida **antes** do `@Transform()` ser aplicado, rejeitando timestamps completos com horário.

### Código Anterior:
```typescript
@IsDateString()  // ❌ Validava antes da transformação
@Transform(transformToISODate)
@IsOptional()
validUntil?: string;
```

## ✅ Solução Implementada

Removido o `@IsDateString()` e mantido apenas o `@Transform()`, que já faz validação e aceita múltiplos formatos:

### Código Corrigido:
```typescript
@Transform(transformToISODate)  // ✅ Aceita múltiplos formatos
@IsOptional()
validUntil?: string;
```

## 📋 Formatos Aceitos

O transformer `transformToISODate` aceita os seguintes formatos:

| Formato | Exemplo | Resultado |
|---------|---------|-----------|
| **Data simples** | `"2025-12-31"` | ✅ Date: 2025-12-31T00:00:00.000Z |
| **Timestamp completo** | `"2025-12-31T23:59:59.999Z"` | ✅ Date: 2025-12-31T23:59:59.999Z |
| **Ano e mês** | `"2025-12"` | ✅ Date: 2025-12-01T00:00:00.000Z |
| **Formato brasileiro** | `"31/12/2025"` | ❌ Rejeitado |
| **Espaço no lugar de T** | `"2025-12-31 23:59:59"` | ❌ Rejeitado |

## 🧪 Teste Manual

### Payload do Frontend (agora funciona):
```json
POST /sales
{
  "customerId": "43194635-4c19-448d-a4f2-8fa915099b63",
  "status": "QUOTE",
  "items": [
    {
      "productId": "dc9a4149-db5a-4727-86e9-81c6facfeaad",
      "quantity": 1,
      "unitPrice": 200,
      "stockLocationId": "0c2e2ec6-484b-4176-86bf-f8f3beae808f",
      "notes": "asdf"
    }
  ],
  "paymentMethodId": "94d6ff8e-8a7d-422c-8f63-8cb5888a66c6",
  "installments": 3,
  "discountAmount": 2,
  "shippingCost": 134,
  "otherCharges": 10,
  "notes": "asdf",
  "internalNotes": "sadf",
  "validUntil": "2025-11-15T23:59:59.999Z",  // ✅ Agora aceito
  "useCustomerAddress": true
}
```

### Response Esperado:
```json
{
  "id": "...",
  "code": "ORC-2025-XXX",
  "status": "QUOTE",
  "customerId": "43194635-4c19-448d-a4f2-8fa915099b63",
  "validUntil": "2025-11-15T23:59:59.999Z",
  "totalAmount": 342,
  "createdAt": "2025-11-10T...",
  ...
}
```

## 📝 Arquivos Modificados

### 1. `/src/sales/dto/create-sale.dto.ts`
```diff
  @IsString()
  @IsOptional()
  internalNotes?: string;

- @IsDateString()
  @Transform(transformToISODate)
  @IsOptional()
  validUntil?: string;
```

### 2. `/docs/API_SALES_CREATE.md`
- Adicionada seção explicando formatos aceitos
- Adicionado exemplo de erro de data inválida
- Atualizada tabela de validações

## ✅ Benefícios

1. **Compatibilidade com Frontend**: Aceita timestamps completos enviados por date pickers
2. **Flexibilidade**: Aceita tanto data simples quanto timestamp
3. **Consistência**: Mesmo transformer usado em outros DTOs do sistema
4. **Validação Mantida**: O transformer ainda valida o formato

## 🔄 Impacto

- ✅ **Sem Breaking Changes**: Formatos anteriores continuam funcionando
- ✅ **Adicionado Suporte**: Timestamps completos agora aceitos
- ✅ **Documentação Atualizada**: Guia completo de formatos aceitos

## 📚 Referências

- [date.transformer.ts](/src/common/transformers/date.transformer.ts)
- [API_SALES_CREATE.md](/docs/API_SALES_CREATE.md)
- [CreateSaleDto](/src/sales/dto/create-sale.dto.ts)

---

**Data da Correção:** 10 de novembro de 2025  
**Versão:** 1.0  
**Status:** ✅ Resolvido
