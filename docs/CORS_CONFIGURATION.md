# 🌐 Configuração de CORS

## Descrição

CORS (Cross-Origin Resource Sharing) permite que o backend aceite requisições de diferentes origens (domínios).

## Configuração Atual

### Origens Permitidas

```typescript
origin: [
  'http://localhost:3000',           // Development (Next.js padrão)
  'http://localhost:5173',           // Development (Vite)
  'https://erp.otimizeagenda.com',   // Produção HTTPS
  'http://erp.otimizeagenda.com',    // Produção HTTP
]
```

### Métodos HTTP Permitidos

- ✅ `GET` - Obter dados
- ✅ `POST` - Criar recursos
- ✅ `PUT` - Atualizar completo
- ✅ `PATCH` - Atualizar parcial
- ✅ `DELETE` - Remover recursos
- ✅ `OPTIONS` - Preflight requests

### Headers Permitidos

- ✅ `Content-Type` - Tipo do conteúdo (application/json)
- ✅ `Authorization` - Token JWT (Bearer)
- ✅ `x-company-id` - ID da empresa (multi-tenant)
- ✅ `Accept` - Tipo de resposta aceito

### Configurações Adicionais

| Configuração | Valor | Descrição |
|--------------|-------|-----------|
| `credentials` | `true` | Permite envio de cookies e headers de autenticação |
| `maxAge` | `3600` | Cache de preflight por 1 hora (performance) |

---

## Como Funciona

### 1. Frontend Faz Requisição

```javascript
// Frontend em https://erp.otimizeagenda.com
fetch('https://api.example.com/sales', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer token123',
    'x-company-id': 'company-uuid',
    'Content-Type': 'application/json',
  },
  credentials: 'include', // Importante!
});
```

### 2. Browser Envia Preflight (OPTIONS)

```http
OPTIONS /sales HTTP/1.1
Host: api.example.com
Origin: https://erp.otimizeagenda.com
Access-Control-Request-Method: GET
Access-Control-Request-Headers: authorization,x-company-id
```

### 3. Backend Responde com Permissões

```http
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: https://erp.otimizeagenda.com
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, x-company-id, Accept
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 3600
```

### 4. Browser Permite a Requisição Real

```http
GET /sales HTTP/1.1
Host: api.example.com
Origin: https://erp.otimizeagenda.com
Authorization: Bearer token123
x-company-id: company-uuid
```

---

## Adicionar Nova Origem

### Desenvolvimento Local

Se o frontend estiver em outra porta:

```typescript
app.enableCors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:8080',  // ← Adicionar aqui
    'https://erp.otimizeagenda.com',
  ],
  // ...
});
```

### Novo Domínio de Produção

```typescript
app.enableCors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://erp.otimizeagenda.com',
    'https://erp2.otimizeagenda.com',  // ← Novo domínio
    'https://erp.outrodominio.com',    // ← Outro domínio
  ],
  // ...
});
```

### Permitir Qualquer Origem (NÃO RECOMENDADO EM PRODUÇÃO)

```typescript
app.enableCors({
  origin: '*', // ⚠️ Inseguro! Permite qualquer domínio
  // ...
});
```

---

## Variáveis de Ambiente (Recomendado)

### .env

```env
# Desenvolvimento
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# Produção
CORS_ORIGINS=https://erp.otimizeagenda.com,http://erp.otimizeagenda.com
```

### main.ts

```typescript
app.enableCors({
  origin: process.env.CORS_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'https://erp.otimizeagenda.com',
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-company-id', 'Accept'],
  credentials: true,
  maxAge: 3600,
});
```

---

## Testes

### 1. Teste de Preflight (OPTIONS)

```bash
curl -X OPTIONS http://localhost:4000/sales \
  -H "Origin: https://erp.otimizeagenda.com" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: authorization,x-company-id" \
  -v
```

**Resposta esperada:**
```
< HTTP/1.1 204 No Content
< Access-Control-Allow-Origin: https://erp.otimizeagenda.com
< Access-Control-Allow-Methods: GET,POST,PUT,PATCH,DELETE,OPTIONS
< Access-Control-Allow-Headers: Content-Type,Authorization,x-company-id,Accept
< Access-Control-Allow-Credentials: true
< Access-Control-Max-Age: 3600
```

---

### 2. Teste de Requisição Real

```bash
curl -X GET http://localhost:4000/sales \
  -H "Origin: https://erp.otimizeagenda.com" \
  -H "Authorization: Bearer token123" \
  -H "x-company-id: uuid-123" \
  -v
```

**Resposta esperada:**
```
< HTTP/1.1 200 OK
< Access-Control-Allow-Origin: https://erp.otimizeagenda.com
< Access-Control-Allow-Credentials: true
< Content-Type: application/json
```

---

### 3. Teste de Origem Não Permitida

```bash
curl -X GET http://localhost:4000/sales \
  -H "Origin: https://dominio-nao-autorizado.com" \
  -H "Authorization: Bearer token123" \
  -v
```

**Resposta esperada:**
- ❌ Header `Access-Control-Allow-Origin` **não** presente
- Browser bloqueará a resposta

---

## Troubleshooting

### Erro: "CORS policy: No 'Access-Control-Allow-Origin' header"

**Causa:** Origem não está na lista permitida

**Solução:**
1. Verificar se o domínio está em `origin: [...]`
2. Verificar se há typo no domínio (http vs https)
3. Verificar console do backend (logs)

---

### Erro: "CORS policy: Credentials flag is true, but Access-Control-Allow-Credentials header is ''"

**Causa:** Frontend enviando `credentials: 'include'` mas backend não permite

**Solução:**
```typescript
app.enableCors({
  credentials: true, // ← Adicionar
  // ...
});
```

---

### Erro: "CORS policy: Method PUT is not allowed by Access-Control-Allow-Methods"

**Causa:** Método não está na lista permitida

**Solução:**
```typescript
app.enableCors({
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], // ← Verificar
  // ...
});
```

---

### Erro: "CORS policy: Request header x-company-id is not allowed"

**Causa:** Header personalizado não está na lista

**Solução:**
```typescript
app.enableCors({
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'x-company-id',  // ← Adicionar headers personalizados
    'Accept',
  ],
  // ...
});
```

---

## Segurança

### ✅ Boas Práticas

1. **Listar origens específicas** (não usar `'*'` em produção)
2. **Usar HTTPS** em produção (`https://` não `http://`)
3. **Limitar headers** apenas aos necessários
4. **Limitar métodos** apenas aos utilizados
5. **Usar credentials: true** apenas se necessário

### ❌ Evitar

```typescript
// ❌ NÃO FAZER EM PRODUÇÃO
app.enableCors({
  origin: '*',              // Permite qualquer origem
  credentials: true,         // Com credentials = true + origin: '*' = ERRO
  allowedHeaders: '*',       // Permite qualquer header
});
```

**Por quê?**
- Permite ataques CSRF (Cross-Site Request Forgery)
- Expõe API para domínios maliciosos
- Viola princípio do menor privilégio

---

## Configuração para Subdomínios

### Permitir Múltiplos Subdomínios

```typescript
app.enableCors({
  origin: (origin, callback) => {
    // Lista de domínios base permitidos
    const allowedDomains = [
      'otimizeagenda.com',
      'localhost',
    ];

    // Verificar se origem está na lista OU é subdomínio permitido
    if (!origin) {
      // Requisições sem Origin (ex: Postman, curl)
      callback(null, true);
      return;
    }

    const isAllowed = allowedDomains.some(domain => {
      const regex = new RegExp(`https?://(.*\\.)?${domain}(:\\d+)?$`);
      return regex.test(origin);
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Origem não permitida pelo CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-company-id', 'Accept'],
  credentials: true,
  maxAge: 3600,
});
```

**Origens permitidas:**
- ✅ `https://erp.otimizeagenda.com`
- ✅ `https://admin.otimizeagenda.com`
- ✅ `https://api.otimizeagenda.com`
- ✅ `http://localhost:3000`
- ❌ `https://malicious.com`

---

## Frontend - Exemplos de Integração

### Fetch API

```javascript
// Configuração global
const API_URL = 'https://api.example.com';

async function fetchAPI(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: 'include', // Importante!
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
      'x-company-id': getCompanyId(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}

// Uso
const sales = await fetchAPI('/sales');
```

---

### Axios

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.example.com',
  withCredentials: true, // Importante!
});

// Interceptor para adicionar headers
api.interceptors.request.use((config) => {
  config.headers.Authorization = `Bearer ${getToken()}`;
  config.headers['x-company-id'] = getCompanyId();
  return config;
});

// Uso
const { data } = await api.get('/sales');
```

---

### Angular HttpClient

```typescript
import { HttpClient, HttpHeaders } from '@angular/common/http';

constructor(private http: HttpClient) {}

getSales() {
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${this.getToken()}`,
    'x-company-id': this.getCompanyId(),
  });

  return this.http.get('/sales', {
    headers,
    withCredentials: true, // Importante!
  });
}
```

---

## Logs e Debugging

### Habilitar Logs de CORS

```typescript
app.enableCors({
  origin: (origin, callback) => {
    console.log(`📡 CORS - Origin: ${origin}`);
    // ... lógica de validação
    callback(null, true);
  },
  // ...
});
```

### Verificar Headers no Browser

**Chrome DevTools:**
1. Abrir DevTools (F12)
2. Aba Network
3. Fazer requisição
4. Clicar na requisição
5. Ver aba "Headers"
6. Verificar:
   - Request Headers: `Origin`
   - Response Headers: `Access-Control-Allow-*`

---

## Checklist de Deploy

Antes de fazer deploy em produção:

- [ ] Domínio de produção adicionado em `origin`
- [ ] Usar HTTPS (`https://` não `http://`)
- [ ] Remover origens de desenvolvimento se não necessárias
- [ ] Testar preflight (OPTIONS)
- [ ] Testar requisição real
- [ ] Verificar headers no browser
- [ ] Documentar domínios permitidos
- [ ] Configurar variáveis de ambiente

---

## Arquivo Atual

**Localização:** `src/main.ts`

```typescript
app.enableCors({
  origin: [
    'http://localhost:3000',           // Development local
    'http://localhost:5173',           // Vite dev server
    'https://erp.otimizeagenda.com',   // Produção HTTPS
    'http://erp.otimizeagenda.com',    // Produção HTTP
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'x-company-id',
    'Accept',
  ],
  credentials: true,
  maxAge: 3600,
});
```

---

## Referências

- [MDN - CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [NestJS - CORS](https://docs.nestjs.com/security/cors)
- [Express CORS Package](https://expressjs.com/en/resources/middleware/cors.html)

---

## Status

✅ **CORS Habilitado e Configurado**

- ✅ Domínio `erp.otimizeagenda.com` permitido (HTTP + HTTPS)
- ✅ Localhost permitido para desenvolvimento
- ✅ Todos os métodos HTTP necessários
- ✅ Headers personalizados (`x-company-id`) permitidos
- ✅ Credentials habilitado
- ✅ Cache de preflight (1 hora)

**Pronto para produção!** 🚀
