# API de Tabelas Tributárias

Documentação completa dos endpoints para gerenciamento de tabelas tributárias (INSS, IRRF e FGTS).

## Índice

- [Autenticação](#autenticação)
- [Permissões Necessárias](#permissões-necessárias)
- [Tabelas INSS](#tabelas-inss)
- [Tabelas IRRF](#tabelas-irrf)
- [Tabelas FGTS](#tabelas-fgts)
- [Exemplos de Uso](#exemplos-de-uso)

---

## Autenticação

**Todas as requisições requerem autenticação via Bearer Token.**

```http
Authorization: Bearer {seu_token_jwt}
```

---

## Permissões Necessárias

| Operação | Permissão Requerida |
|----------|---------------------|
| Criar tabela | `tax_tables.create` |
| Listar/Ver tabelas | `tax_tables.read` |
| Atualizar tabela | `tax_tables.update` |
| Excluir tabela | `tax_tables.delete` |

---

## Tabelas INSS

### 1. Criar Tabela INSS

Cria uma nova tabela de contribuição do INSS com faixas salariais e alíquotas.

**Endpoint:** `POST /tax-tables/inss`

**Permissões:** `tax_tables.create`

**Request Body:**
```json
{
  "referenceYear": 2025,
  "active": true,
  "brackets": [
    {
      "upTo": 1412.00,
      "employeeRate": 7.5,
      "employerRate": 20
    },
    {
      "upTo": 2666.68,
      "employeeRate": 9,
      "employerRate": 20
    },
    {
      "upTo": 4000.03,
      "employeeRate": 12,
      "employerRate": 20
    },
    {
      "upTo": 7786.02,
      "employeeRate": 14,
      "employerRate": 20
    }
  ]
}
```

**Formato Alternativo (também aceito):**
```json
{
  "year": 2025,
  "active": true,
  "ranges": [
    {
      "minValue": 0,
      "maxValue": 1412.00,
      "employeeRate": 7.5,
      "employerRate": 20
    },
    {
      "minValue": 1412.01,
      "maxValue": 2666.68,
      "employeeRate": 9,
      "employerRate": 20
    },
    {
      "minValue": 2666.69,
      "maxValue": 4000.03,
      "employeeRate": 12,
      "employerRate": 20
    },
    {
      "minValue": 4000.04,
      "maxValue": 7786.02,
      "employeeRate": 14,
      "employerRate": 20
    }
  ]
}
```

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `referenceYear` ou `year` | Number | ✅ | Ano de referência (2000-2100) |
| `active` | Boolean | ⚪ | Se a tabela está ativa (default: true) |
| `brackets` ou `ranges` | Array | ✅ | Faixas de contribuição |

**Campos do Bracket/Range:**
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `upTo` ou `maxValue` | Number | ✅ | Valor máximo da faixa |
| `minValue` | Number | ⚪ | Valor mínimo (auto-calculado se usar `brackets`) |
| `employeeRate` | Number | ✅ | Alíquota do empregado (%) |
| `employerRate` | Number | ✅ | Alíquota do empregador (%) |

**Response (201 Created):**
```json
{
  "id": "cm3xyz123456",
  "companyId": "cm3abc789012",
  "year": 2025,
  "active": true,
  "ranges": [
    {
      "id": "range_001",
      "minValue": 0,
      "maxValue": 1412.00,
      "employeeRate": 7.5,
      "employerRate": 20
    },
    {
      "id": "range_002",
      "minValue": 1412.01,
      "maxValue": 2666.68,
      "employeeRate": 9,
      "employerRate": 20
    },
    {
      "id": "range_003",
      "minValue": 2666.69,
      "maxValue": 4000.03,
      "employeeRate": 12,
      "employerRate": 20
    },
    {
      "id": "range_004",
      "minValue": 4000.04,
      "maxValue": 7786.02,
      "employeeRate": 14,
      "employerRate": 20
    }
  ],
  "createdAt": "2025-11-09T10:00:00.000Z",
  "updatedAt": "2025-11-09T10:00:00.000Z"
}
```

---

### 2. Listar Tabelas INSS

Lista todas as tabelas INSS da empresa, com filtros opcionais.

**Endpoint:** `GET /tax-tables/inss`

**Permissões:** `tax_tables.read`

**Query Parameters:**
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `year` | Number | ⚪ | Filtrar por ano |
| `active` | Boolean | ⚪ | Filtrar por status ativo/inativo |

**Exemplos:**
```http
GET /tax-tables/inss
GET /tax-tables/inss?year=2025
GET /tax-tables/inss?active=true
GET /tax-tables/inss?year=2025&active=true
```

**Response (200 OK):**
```json
[
  {
    "id": "cm3xyz123456",
    "companyId": "cm3abc789012",
    "year": 2025,
    "active": true,
    "ranges": [
      {
        "id": "range_001",
        "minValue": 0,
        "maxValue": 1412.00,
        "employeeRate": 7.5,
        "employerRate": 20
      }
      // ... demais faixas
    ],
    "createdAt": "2025-11-09T10:00:00.000Z",
    "updatedAt": "2025-11-09T10:00:00.000Z"
  }
]
```

---

### 3. Buscar Tabela INSS por ID

Retorna uma tabela INSS específica.

**Endpoint:** `GET /tax-tables/inss/:id`

**Permissões:** `tax_tables.read`

**URL Parameters:**
- `id` (string, obrigatório) - ID da tabela

**Response (200 OK):**
```json
{
  "id": "cm3xyz123456",
  "companyId": "cm3abc789012",
  "year": 2025,
  "active": true,
  "ranges": [
    {
      "id": "range_001",
      "minValue": 0,
      "maxValue": 1412.00,
      "employeeRate": 7.5,
      "employerRate": 20
    }
    // ... demais faixas
  ],
  "createdAt": "2025-11-09T10:00:00.000Z",
  "updatedAt": "2025-11-09T10:00:00.000Z"
}
```

---

### 4. Atualizar Tabela INSS

Atualiza uma tabela INSS existente.

**Endpoint:** `PATCH /tax-tables/inss/:id`

**Permissões:** `tax_tables.update`

**URL Parameters:**
- `id` (string, obrigatório) - ID da tabela

**Request Body:** (Todos os campos são opcionais)
```json
{
  "active": false,
  "brackets": [
    {
      "upTo": 1518.00,
      "employeeRate": 7.5,
      "employerRate": 20
    }
    // ... demais faixas atualizadas
  ]
}
```

**Response (200 OK):**
```json
{
  "id": "cm3xyz123456",
  "companyId": "cm3abc789012",
  "year": 2025,
  "active": false,
  "ranges": [
    // ... faixas atualizadas
  ],
  "createdAt": "2025-11-09T10:00:00.000Z",
  "updatedAt": "2025-11-09T11:30:00.000Z"
}
```

---

### 5. Excluir Tabela INSS

Remove uma tabela INSS.

**Endpoint:** `DELETE /tax-tables/inss/:id`

**Permissões:** `tax_tables.delete`

**URL Parameters:**
- `id` (string, obrigatório) - ID da tabela

**Response (200 OK):**
```json
{
  "message": "Tabela INSS removida com sucesso"
}
```

---

## Tabelas IRRF

### 1. Criar Tabela IRRF

Cria uma nova tabela de Imposto de Renda Retido na Fonte.

**Endpoint:** `POST /tax-tables/irrf`

**Permissões:** `tax_tables.create`

**Request Body:**
```json
{
  "year": 2025,
  "dependentDeduction": 189.59,
  "active": true,
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
      "rate": 15,
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
  ]
}
```

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `year` | Number | ✅ | Ano de referência (2000-2100) |
| `dependentDeduction` | Number | ✅ | Valor de dedução por dependente |
| `active` | Boolean | ⚪ | Se a tabela está ativa (default: true) |
| `ranges` | Array | ✅ | Faixas de imposto |

**Campos do Range:**
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `minValue` | Number | ✅ | Valor mínimo da faixa |
| `maxValue` | Number | ⚪ | Valor máximo (null = sem limite) |
| `rate` | Number | ✅ | Alíquota do imposto (%) |
| `deduction` | Number | ✅ | Valor de dedução da faixa |

**Response (201 Created):**
```json
{
  "id": "cm3irrf123456",
  "companyId": "cm3abc789012",
  "year": 2025,
  "dependentDeduction": 189.59,
  "active": true,
  "ranges": [
    {
      "id": "range_001",
      "minValue": 0,
      "maxValue": 2259.20,
      "rate": 0,
      "deduction": 0
    }
    // ... demais faixas
  ],
  "createdAt": "2025-11-09T10:00:00.000Z",
  "updatedAt": "2025-11-09T10:00:00.000Z"
}
```

---

### 2. Listar Tabelas IRRF

**Endpoint:** `GET /tax-tables/irrf`

**Permissões:** `tax_tables.read`

**Query Parameters:** (mesmos da tabela INSS)
- `year` (opcional) - Filtrar por ano
- `active` (opcional) - Filtrar por status

---

### 3. Buscar Tabela IRRF por ID

**Endpoint:** `GET /tax-tables/irrf/:id`

**Permissões:** `tax_tables.read`

---

### 4. Atualizar Tabela IRRF

**Endpoint:** `PATCH /tax-tables/irrf/:id`

**Permissões:** `tax_tables.update`

---

### 5. Excluir Tabela IRRF

**Endpoint:** `DELETE /tax-tables/irrf/:id`

**Permissões:** `tax_tables.delete`

---

## Tabelas FGTS

### 1. Criar Tabela FGTS

Cria uma nova tabela de alíquotas do FGTS por cargo da empresa.

**Endpoint:** `POST /tax-tables/fgts`

**Permissões:** `tax_tables.create`

**Request Body:**
```json
{
  "year": 2025,
  "active": true,
  "rates": [
    {
      "positionId": "cm3pos123456",
      "monthlyRate": 8,
      "terminationRate": 40
    },
    {
      "positionId": "cm3pos789012",
      "monthlyRate": 2,
      "terminationRate": 40
    },
    {
      "positionId": "cm3pos345678",
      "monthlyRate": 0,
      "terminationRate": 0
    }
  ]
}
```

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `year` | Number | ✅ | Ano de referência (2000-2100) |
| `active` | Boolean | ⚪ | Se a tabela está ativa (default: true) |
| `rates` | Array | ✅ | Alíquotas por cargo |

**Campos do Rate:**
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `positionId` | String | ✅ | ID do cargo cadastrado no sistema |
| `monthlyRate` | Number | ✅ | Alíquota mensal (%) - CLT: 8%, Aprendiz: 2%, Estagiário: 0% |
| `terminationRate` | Number | ✅ | Alíquota em caso de demissão (%) - Normalmente 40% |

**Response (201 Created):**
```json
{
  "id": "cm3fgts123456",
  "companyId": "cm3abc789012",
  "year": 2025,
  "active": true,
  "rates": [
    {
      "positionId": "cm3pos123456",
      "positionName": "Desenvolvedor Sênior",
      "positionCode": "DEV-SR",
      "monthlyRate": 8,
      "terminationRate": 40
    },
    {
      "positionId": "cm3pos789012",
      "positionName": "Aprendiz",
      "positionCode": "APREND",
      "monthlyRate": 2,
      "terminationRate": 40
    },
    {
      "positionId": "cm3pos345678",
      "positionName": "Estagiário",
      "positionCode": "ESTAG",
      "monthlyRate": 0,
      "terminationRate": 0
    }
  ],
  "createdAt": "2025-11-09T10:00:00.000Z",
  "updatedAt": "2025-11-09T10:00:00.000Z"
}
```

**⚠️ Notas Importantes:**
- A tabela FGTS agora é baseada em **cargos** ao invés de categorias fixas
- Você deve primeiro cadastrar os cargos através do endpoint `/positions`
- O FGTS será calculado automaticamente na folha de pagamento com base no cargo do empregado
- Se um empregado tiver um cargo não configurado na tabela, será usado uma taxa padrão (8% mensal, 40% rescisão)

---

### 2. Listar Tabelas FGTS

**Endpoint:** `GET /tax-tables/fgts`

**Permissões:** `tax_tables.read`

**Query Parameters:** (mesmos das outras tabelas)

---

### 3. Buscar Tabela FGTS por ID

**Endpoint:** `GET /tax-tables/fgts/:id`

**Permissões:** `tax_tables.read`

---

### 4. Atualizar Tabela FGTS

**Endpoint:** `PATCH /tax-tables/fgts/:id`

**Permissões:** `tax_tables.update`

---

### 5. Excluir Tabela FGTS

**Endpoint:** `DELETE /tax-tables/fgts/:id`

**Permissões:** `tax_tables.delete`

---

## Exemplos de Uso

### Exemplo JavaScript/TypeScript (Frontend)

```typescript
// Configuração do cliente
const API_URL = 'http://localhost:4000';
const token = 'seu_token_jwt';

const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};

// 1. Criar tabela INSS
async function createInssTable() {
  const response = await fetch(`${API_URL}/tax-tables/inss`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      referenceYear: 2025,
      active: true,
      brackets: [
        { upTo: 1412.00, employeeRate: 7.5, employerRate: 20 },
        { upTo: 2666.68, employeeRate: 9, employerRate: 20 },
        { upTo: 4000.03, employeeRate: 12, employerRate: 20 },
        { upTo: 7786.02, employeeRate: 14, employerRate: 20 }
      ]
    })
  });
  
  return await response.json();
}

// 2. Listar tabelas INSS ativas de 2025
async function getInssTables() {
  const response = await fetch(
    `${API_URL}/tax-tables/inss?year=2025&active=true`,
    { headers }
  );
  
  return await response.json();
}

// 3. Criar tabela IRRF
async function createIrrfTable() {
  const response = await fetch(`${API_URL}/tax-tables/irrf`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      year: 2025,
      dependentDeduction: 189.59,
      active: true,
      ranges: [
        { minValue: 0, maxValue: 2259.20, rate: 0, deduction: 0 },
        { minValue: 2259.21, maxValue: 2826.65, rate: 7.5, deduction: 169.44 },
        { minValue: 2826.66, maxValue: 3751.05, rate: 15, deduction: 381.44 },
        { minValue: 3751.06, maxValue: 4664.68, rate: 22.5, deduction: 662.77 },
        { minValue: 4664.69, maxValue: null, rate: 27.5, deduction: 896.00 }
      ]
    })
  });
  
  return await response.json();
}

// 4. Atualizar tabela (desativar)
async function deactivateTable(tableId: string, type: 'inss' | 'irrf' | 'fgts') {
  const response = await fetch(`${API_URL}/tax-tables/${type}/${tableId}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ active: false })
  });
  
  return await response.json();
}

// 5. Excluir tabela
async function deleteTable(tableId: string, type: 'inss' | 'irrf' | 'fgts') {
  const response = await fetch(`${API_URL}/tax-tables/${type}/${tableId}`, {
    method: 'DELETE',
    headers
  });
  
  return await response.json();
}
```

---

### Exemplo cURL

```bash
# Criar tabela INSS
curl -X POST http://localhost:4000/tax-tables/inss \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "referenceYear": 2025,
    "active": true,
    "brackets": [
      {"upTo": 1412.00, "employeeRate": 7.5, "employerRate": 20},
      {"upTo": 2666.68, "employeeRate": 9, "employerRate": 20},
      {"upTo": 4000.03, "employeeRate": 12, "employerRate": 20},
      {"upTo": 7786.02, "employeeRate": 14, "employerRate": 20}
    ]
  }'

# Listar tabelas INSS
curl -X GET "http://localhost:4000/tax-tables/inss?year=2025&active=true" \
  -H "Authorization: Bearer SEU_TOKEN"

# Buscar tabela específica
curl -X GET http://localhost:4000/tax-tables/inss/cm3xyz123456 \
  -H "Authorization: Bearer SEU_TOKEN"

# Atualizar tabela
curl -X PATCH http://localhost:4000/tax-tables/inss/cm3xyz123456 \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"active": false}'

# Excluir tabela
curl -X DELETE http://localhost:4000/tax-tables/inss/cm3xyz123456 \
  -H "Authorization: Bearer SEU_TOKEN"
```

---

## Erros Comuns

### 400 Bad Request - Campos inválidos

```json
{
  "message": [
    "year must not be greater than 2100",
    "year must not be less than 2000"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

**Solução:** Verifique se todos os campos obrigatórios estão presentes e com os valores corretos.

---

### 401 Unauthorized - Token inválido ou ausente

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**Solução:** Certifique-se de enviar o header `Authorization: Bearer {token}` com um token válido.

---

### 403 Forbidden - Sem permissão

```json
{
  "statusCode": 403,
  "message": "Você não tem permissão para acessar este recurso"
}
```

**Solução:** Verifique se seu usuário possui as permissões necessárias (`tax_tables.create`, `tax_tables.read`, etc.).

---

### 404 Not Found - Tabela não encontrada

```json
{
  "statusCode": 404,
  "message": "Tabela não encontrada"
}
```

**Solução:** Verifique se o ID da tabela está correto e se ela pertence à empresa do usuário logado.

---

## Notas Importantes

1. **Isolamento por Empresa:** Todas as tabelas são isoladas por empresa. Você só pode acessar tabelas da sua própria empresa.

2. **Formato Flexível (INSS):** A API de INSS aceita tanto o formato `brackets` (com `upTo`) quanto `ranges` (com `minValue` e `maxValue`).

3. **Tabelas Ativas:** Recomenda-se manter apenas uma tabela ativa por tipo e ano para evitar conflitos nos cálculos.

4. **Faixa Sem Limite (IRRF):** Na última faixa do IRRF, use `maxValue: null` para indicar valores acima do limite.

5. **Validações:** Todos os campos numéricos são validados. Anos devem estar entre 2000-2100 e alíquotas entre 0-100%.

---

## Suporte

Para dúvidas ou problemas, consulte a documentação completa do sistema ou entre em contato com o suporte técnico.
