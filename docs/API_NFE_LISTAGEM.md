# API NFe - Listagem com Filtros Avançados

## Endpoint: GET /fiscal/nfe

Lista todas as NFes da empresa com suporte a múltiplos filtros de busca.

### Autenticação
Requer token JWT no header: `Authorization: Bearer {token}`

---

## Parâmetros de Query (Filtros)

Todos os parâmetros são opcionais. Você pode combinar múltiplos filtros.

| Parâmetro | Tipo | Descrição | Exemplo |
|-----------|------|-----------|---------|
| `status` | String | Status da NFe | `AUTHORIZED`, `REJECTED`, `CANCELED`, `DRAFT` |
| `saleId` | UUID | ID da venda vinculada | `550e8400-e29b-41d4-a716-446655440000` |
| `numero` | Number | Número da NFe | `123`, `456` |
| `serie` | String | Série da NFe | `1`, `2`, `10` |
| `chaveAcesso` | String | Chave de acesso completa ou parcial | `35240`, `35240123456789000100550010000001231234567890` |
| `customerId` | UUID | ID do cliente (destinatário) | `550e8400-e29b-41d4-a716-446655440000` |
| `customerName` | String | Nome do cliente (busca parcial, case-insensitive) | `João`, `ACME`, `Silva` |
| `dataInicio` | Date | Data inicial de emissão (formato: YYYY-MM-DD) | `2024-01-01` |
| `dataFim` | Date | Data final de emissão (formato: YYYY-MM-DD) | `2024-12-31` |

---

## Exemplos de Requisições

### 1. Listar todas as NFes
```http
GET /fiscal/nfe
Authorization: Bearer {token}
```

### 2. Buscar NFe por número
```http
GET /fiscal/nfe?numero=123
Authorization: Bearer {token}
```

### 3. Buscar NFe por número e série
```http
GET /fiscal/nfe?numero=123&serie=1
Authorization: Bearer {token}
```

### 4. Buscar NFes autorizadas
```http
GET /fiscal/nfe?status=AUTHORIZED
Authorization: Bearer {token}
```

### 5. Buscar NFes de um cliente específico
```http
GET /fiscal/nfe?customerId=550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer {token}
```

### 6. Buscar NFes por nome do cliente (parcial)
```http
GET /fiscal/nfe?customerName=João
Authorization: Bearer {token}
```

### 7. Buscar por chave de acesso (parcial)
```http
GET /fiscal/nfe?chaveAcesso=35240
Authorization: Bearer {token}
```

### 8. Buscar NFes em um período
```http
GET /fiscal/nfe?dataInicio=2024-01-01&dataFim=2024-12-31
Authorization: Bearer {token}
```

### 9. Buscar NFes vinculadas a uma venda
```http
GET /fiscal/nfe?saleId=550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer {token}
```

### 10. Combinar múltiplos filtros
```http
GET /fiscal/nfe?status=AUTHORIZED&dataInicio=2024-11-01&dataFim=2024-11-30&customerName=Silva
Authorization: Bearer {token}
```

---

## Resposta de Sucesso

**Status:** `200 OK`

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "companyId": "660e8400-e29b-41d4-a716-446655440000",
    "saleId": "770e8400-e29b-41d4-a716-446655440000",
    "numero": 123,
    "serie": "1",
    "chaveAcesso": "35240123456789000100550010000001231234567890",
    "status": "AUTHORIZED",
    "naturezaOperacao": "VENDA",
    "destinatarioId": "880e8400-e29b-41d4-a716-446655440000",
    "destinatarioNome": "João Silva",
    "destinatarioCnpjCpf": "12345678901",
    "valorProdutos": 1000.00,
    "valorTotal": 1000.00,
    "dataEmissao": "2024-11-17T10:30:00.000Z",
    "dataAutorizacao": "2024-11-17T10:35:00.000Z",
    "protocoloAutorizacao": "135240000000001",
    "xmlAutorizado": "/path/to/xml",
    "xmlAutorizadoUrl": "/uploads/public/nfe/company-id/sale-id/nfe_sign.xml",
    "danfePdfPath": "/path/to/danfe.pdf",
    "danfePdfUrl": "/uploads/public/nfe/company-id/sale-id/danfe.pdf",
    "createdAt": "2024-11-17T10:30:00.000Z",
    "updatedAt": "2024-11-17T10:35:00.000Z",
    "sale": {
      "id": "770e8400-e29b-41d4-a716-446655440000",
      "saleNumber": "VND-00123",
      "totalAmount": 1000.00,
      "customer": {
        "id": "880e8400-e29b-41d4-a716-446655440000",
        "name": "João Silva",
        "document": "12345678901"
      }
    },
    "customer": {
      "id": "880e8400-e29b-41d4-a716-446655440000",
      "name": "João Silva",
      "document": "12345678901",
      "email": "joao@example.com",
      "phone": "(11) 98765-4321"
    }
  }
]
```

---

## Status de NFe Disponíveis

| Status | Descrição |
|--------|-----------|
| `DRAFT` | Rascunho (não emitida) |
| `IN_PROCESS` | Em processamento |
| `AUTHORIZED` | Autorizada pela SEFAZ |
| `REJECTED` | Rejeitada pela SEFAZ |
| `CANCELED` | Cancelada |
| `DENIED` | Denegada |
| `CONTINGENCY` | Em contingência |

---

## Exemplos com cURL

### Buscar por número
```bash
curl -X GET "http://localhost:3000/fiscal/nfe?numero=123" \
  -H "Authorization: Bearer {token}"
```

### Buscar por nome do cliente
```bash
curl -X GET "http://localhost:3000/fiscal/nfe?customerName=Silva" \
  -H "Authorization: Bearer {token}"
```

### Buscar NFes autorizadas no último mês
```bash
curl -X GET "http://localhost:3000/fiscal/nfe?status=AUTHORIZED&dataInicio=2024-11-01&dataFim=2024-11-30" \
  -H "Authorization: Bearer {token}"
```

---

## Exemplos com JavaScript/TypeScript

```typescript
// Buscar NFe por número
const response = await fetch('/fiscal/nfe?numero=123', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const nfes = await response.json();

// Buscar NFes de um cliente
const response = await fetch('/fiscal/nfe?customerName=João Silva', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const nfes = await response.json();

// Buscar NFes em período com status
const params = new URLSearchParams({
  status: 'AUTHORIZED',
  dataInicio: '2024-01-01',
  dataFim: '2024-12-31'
});

const response = await fetch(`/fiscal/nfe?${params}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const nfes = await response.json();
```

---

## Notas Importantes

1. **Busca Parcial**: Os filtros `chaveAcesso` e `customerName` fazem busca parcial (case-insensitive)
2. **Busca Exata**: Os filtros `numero`, `serie`, `status`, `saleId`, `customerId` fazem busca exata
3. **Período**: Ao usar `dataFim`, a busca inclui todo o dia (até 23:59:59)
4. **Combinação**: Você pode combinar quantos filtros desejar
5. **Performance**: Para melhor performance, use filtros mais específicos (numero, chaveAcesso, saleId)
6. **Ordenação**: Os resultados são ordenados por data de criação (mais recente primeiro)

---

## Casos de Uso Comuns

### Dashboard de NFes
```http
GET /fiscal/nfe?status=AUTHORIZED&dataInicio=2024-11-01&dataFim=2024-11-30
```

### Buscar NFe para reimprimir DANFE
```http
GET /fiscal/nfe?numero=123&serie=1
```

### Listar NFes de um cliente
```http
GET /fiscal/nfe?customerId={customerId}
```

### Verificar status de uma venda
```http
GET /fiscal/nfe?saleId={saleId}
```

### Buscar NFe para consulta na SEFAZ
```http
GET /fiscal/nfe?chaveAcesso={chaveAcesso}
```
