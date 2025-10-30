# 📊 Plano de Contas - API Documentation

## 🎯 Visão Geral

Sistema completo de Plano de Contas contábil, permitindo que empresas configurem sua estrutura contábil hierárquica com contas de Ativo, Passivo, Receita, Despesa e Patrimônio Líquido.

## 🔐 Autenticação e Permissões

**Headers Obrigatórios:**
```
Authorization: Bearer {token}
```

**Permissões Necessárias:**
- `accounting.create` - Criar planos de contas e contas contábeis
- `accounting.read` - Visualizar planos de contas e contas contábeis
- `accounting.update` - Atualizar planos de contas e contas contábeis
- `accounting.delete` - Deletar planos de contas e contas contábeis

**Nota:** Usuários com role `admin` têm todas as permissões automaticamente.

---

## 📡 Endpoints - Plano de Contas

### 1. Criar Plano de Contas

```
POST /plano-contas
```

**Permissão:** `accounting.create`

**Body:**
```json
{
  "nome": "Plano de Contas Comercial",
  "descricao": "Plano de contas para empresas comerciais",
  "tipo": "Gerencial",
  "ativo": true,
  "padrao": false
}
```

**Campos:**
- `nome` (string, obrigatório) - Nome do plano de contas
- `descricao` (string, opcional) - Descrição detalhada
- `tipo` (enum, opcional) - `Gerencial`, `Fiscal` ou `Contabil` (padrão: `Gerencial`)
- `ativo` (boolean, opcional) - Se está ativo (padrão: `true`)
- `padrao` (boolean, opcional) - Se é o padrão do sistema (padrão: `false`)

**Resposta:**
```json
{
  "id": "uuid",
  "nome": "Plano de Contas Comercial",
  "descricao": "Plano de contas para empresas comerciais",
  "tipo": "Gerencial",
  "ativo": true,
  "padrao": false,
  "createdAt": "2025-10-25T10:00:00.000Z",
  "updatedAt": "2025-10-25T10:00:00.000Z",
  "contas": []
}
```

---

### 2. Listar Planos de Contas

```
GET /plano-contas
```

**Permissão:** `accounting.read`

**Query Parameters:**
- `page` (number, opcional) - Número da página (padrão: 1)
- `limit` (number, opcional) - Itens por página (padrão: 50)
- `tipo` (string, opcional) - Filtrar por tipo (`Gerencial`, `Fiscal`, `Contabil`)
- `ativo` (boolean, opcional) - Filtrar por status ativo

**Exemplo:**
```bash
GET /plano-contas?page=1&limit=20&tipo=Gerencial&ativo=true
```

**Resposta:**
```json
{
  "data": [
    {
      "id": "uuid",
      "nome": "Plano de Contas Padrão",
      "descricao": "Plano de contas padrão do sistema",
      "tipo": "Gerencial",
      "ativo": true,
      "padrao": true,
      "createdAt": "2025-10-25T10:00:00.000Z",
      "updatedAt": "2025-10-25T10:00:00.000Z",
      "_count": {
        "contas": 21
      }
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 50,
    "totalPages": 1
  }
}
```

---

### 3. Buscar Plano de Contas Padrão

```
GET /plano-contas/padrao
```

**Permissão:** `accounting.read`

**Resposta:**
```json
{
  "id": "uuid",
  "nome": "Plano de Contas Padrão",
  "descricao": "Plano de contas padrão do sistema",
  "tipo": "Gerencial",
  "ativo": true,
  "padrao": true,
  "createdAt": "2025-10-25T10:00:00.000Z",
  "updatedAt": "2025-10-25T10:00:00.000Z",
  "contas": [
    {
      "id": "uuid",
      "codigo": "1",
      "nome": "ATIVO",
      "tipo": "Ativo",
      "natureza": "Devedora",
      "nivel": 1,
      "contaPaiId": null,
      "aceitaLancamento": false,
      "ativo": true
    }
  ]
}
```

---

### 4. Buscar Plano de Contas por ID

```
GET /plano-contas/:id
```

**Permissão:** `accounting.read`

**Resposta:**
```json
{
  "id": "uuid",
  "nome": "Plano de Contas Comercial",
  "descricao": "Plano de contas para empresas comerciais",
  "tipo": "Gerencial",
  "ativo": true,
  "padrao": false,
  "createdAt": "2025-10-25T10:00:00.000Z",
  "updatedAt": "2025-10-25T10:00:00.000Z",
  "contas": [
    {
      "id": "uuid",
      "codigo": "1.1",
      "nome": "Ativo Circulante",
      "tipo": "Ativo",
      "natureza": "Devedora",
      "nivel": 2,
      "contaPaiId": "uuid-conta-pai",
      "aceitaLancamento": false,
      "ativo": true,
      "subContas": []
    }
  ]
}
```

---

### 5. Buscar Hierarquia de Contas

```
GET /plano-contas/:id/hierarquia
```

**Permissão:** `accounting.read`

Retorna a estrutura hierárquica completa das contas até 5 níveis de profundidade.

**Query Parameters:**
- `ativo` (boolean, opcional) - Filtrar por status ativo
  - Se não informado: retorna todas as contas (ativas e inativas)
  - Se `true`: retorna apenas contas ativas
  - Se `false`: retorna apenas contas inativas

**Exemplos:**
```bash
# Todas as contas (padrão - ativas e inativas)
GET /plano-contas/:id/hierarquia

# Apenas contas ativas
GET /plano-contas/:id/hierarquia?ativo=true

# Apenas contas inativas
GET /plano-contas/:id/hierarquia?ativo=false
```

**Resposta:**
```json
{
  "planoContas": {
    "id": "uuid",
    "nome": "Plano de Contas Padrão",
    "tipo": "Gerencial"
  },
  "contas": [
    {
      "id": "uuid",
      "codigo": "1",
      "nome": "ATIVO",
      "tipo": "Ativo",
      "natureza": "Devedora",
      "nivel": 1,
      "ativo": true,
      "subContas": [
        {
          "id": "uuid",
          "codigo": "1.1",
          "nome": "Ativo Circulante",
          "tipo": "Ativo",
          "natureza": "Devedora",
          "nivel": 2,
          "ativo": true,
          "subContas": [
            {
              "id": "uuid",
              "codigo": "1.1.01",
              "nome": "Disponível",
              "tipo": "Ativo",
              "natureza": "Devedora",
              "nivel": 3,
              "ativo": true,
              "subContas": [
                {
                  "id": "uuid",
                  "codigo": "1.1.01.001",
                  "nome": "Caixa Geral",
                  "tipo": "Ativo",
                  "natureza": "Devedora",
                  "nivel": 4,
                  "aceitaLancamento": true,
                  "ativo": true,
                  "subContas": []
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

---

### 6. Atualizar Plano de Contas

```
PATCH /plano-contas/:id
```

**Permissão:** `accounting.update`

**Body:** (todos os campos opcionais)
```json
{
  "nome": "Plano de Contas Industrial",
  "descricao": "Plano de contas atualizado para indústrias",
  "tipo": "Fiscal",
  "ativo": true,
  "padrao": false
}
```

**Resposta:** Retorna o plano de contas atualizado.

---

### 7. Duplicar Plano de Contas

```
POST /plano-contas/:id/duplicar
```

**Permissão:** `accounting.create`

Cria uma cópia completa do plano de contas, incluindo todas as contas e sua hierarquia.

**Body:**
```json
{
  "nome": "Plano de Contas Comercial - Cópia",
  "descricao": "Cópia do plano de contas comercial"
}
```

**Resposta:** Retorna o novo plano de contas criado com todas as contas duplicadas.

---

### 8. Excluir Plano de Contas

```
DELETE /plano-contas/:id
```

**Permissão:** `accounting.delete`

**Regra:** Não é possível excluir um plano de contas que possui contas cadastradas.

**Resposta:**
```json
{
  "message": "Plano de contas removido com sucesso"
}
```

---

## 📡 Endpoints - Contas Contábeis

### 1. Criar Conta Contábil

```
POST /plano-contas/:planoContasId/contas
```

**Permissão:** `accounting.create`

**Body:**
```json
{
  "codigo": "1.1.01.001",
  "nome": "Caixa Geral",
  "tipo": "Ativo",
  "natureza": "Devedora",
  "nivel": 4,
  "contaPaiId": "uuid-conta-pai",
  "aceitaLancamento": true,
  "ativo": true
}
```

**Campos:**
- `codigo` (string, obrigatório) - Código único da conta no plano
- `nome` (string, obrigatório) - Nome descritivo da conta
- `tipo` (enum, obrigatório) - `Ativo`, `Passivo`, `Receita`, `Despesa`, `Patrimônio Líquido`
- `natureza` (enum, obrigatório) - `Devedora` ou `Credora`
- `nivel` (number, obrigatório) - Nível hierárquico (1, 2, 3, 4...)
- `contaPaiId` (string, opcional) - ID da conta pai
- `aceitaLancamento` (boolean, opcional) - Se aceita lançamentos diretos (padrão: `true`)
- `ativo` (boolean, opcional) - Se está ativa (padrão: `true`)

**Validações:**
- Código deve ser único dentro do plano de contas
- Se tiver conta pai, o nível deve ser `nivel_pai + 1`
- Conta pai deve pertencer ao mesmo plano de contas

**Resposta:**
```json
{
  "id": "uuid",
  "planoContasId": "uuid",
  "codigo": "1.1.01.001",
  "nome": "Caixa Geral",
  "tipo": "Ativo",
  "natureza": "Devedora",
  "nivel": 4,
  "contaPaiId": "uuid-conta-pai",
  "aceitaLancamento": true,
  "ativo": true,
  "createdAt": "2025-10-25T10:00:00.000Z",
  "updatedAt": "2025-10-25T10:00:00.000Z",
  "contaPai": {
    "id": "uuid",
    "codigo": "1.1.01",
    "nome": "Disponível",
    "tipo": "Ativo",
    "nivel": 3
  },
  "subContas": []
}
```

---

### 2. Listar Contas Contábeis

```
GET /plano-contas/:planoContasId/contas
```

**Permissão:** `accounting.read`

**Query Parameters:**
- `page` (number, opcional) - Número da página (padrão: 1)
- `limit` (number, opcional) - Itens por página (padrão: 100)
- `tipo` (string, opcional) - Filtrar por tipo
- `nivel` (number, opcional) - Filtrar por nível
- `contaPaiId` (string, opcional) - Filtrar por conta pai
- `search` (string, opcional) - Buscar por código ou nome

**Exemplo:**
```bash
GET /plano-contas/uuid/contas?tipo=Ativo&nivel=4&search=caixa
```

**Resposta:**
```json
{
  "data": [
    {
      "id": "uuid",
      "planoContasId": "uuid",
      "codigo": "1.1.01.001",
      "nome": "Caixa Geral",
      "tipo": "Ativo",
      "natureza": "Devedora",
      "nivel": 4,
      "contaPaiId": "uuid-conta-pai",
      "aceitaLancamento": true,
      "ativo": true,
      "createdAt": "2025-10-25T10:00:00.000Z",
      "updatedAt": "2025-10-25T10:00:00.000Z",
      "contaPai": {
        "id": "uuid",
        "codigo": "1.1.01",
        "nome": "Disponível"
      },
      "_count": {
        "subContas": 0
      }
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 100,
    "totalPages": 1
  }
}
```

---

### 3. Buscar Conta Contábil por ID

```
GET /plano-contas/contas/:id
```

**Permissão:** `accounting.read`

**Resposta:**
```json
{
  "id": "uuid",
  "planoContasId": "uuid",
  "codigo": "1.1.01.001",
  "nome": "Caixa Geral",
  "tipo": "Ativo",
  "natureza": "Devedora",
  "nivel": 4,
  "contaPaiId": "uuid-conta-pai",
  "aceitaLancamento": true,
  "ativo": true,
  "createdAt": "2025-10-25T10:00:00.000Z",
  "updatedAt": "2025-10-25T10:00:00.000Z",
  "planoContas": {
    "id": "uuid",
    "nome": "Plano de Contas Padrão",
    "tipo": "Gerencial"
  },
  "contaPai": {
    "id": "uuid",
    "codigo": "1.1.01",
    "nome": "Disponível"
  },
  "subContas": []
}
```

---

### 4. Atualizar Conta Contábil

```
PATCH /plano-contas/contas/:id
```

**Permissão:** `accounting.update`

**Body:** (todos os campos opcionais)
```json
{
  "codigo": "1.1.01.002",
  "nome": "Caixa Matriz",
  "tipo": "Ativo",
  "natureza": "Devedora",
  "nivel": 4,
  "contaPaiId": "uuid-novo-pai",
  "aceitaLancamento": true,
  "ativo": true
}
```

**Validações:**
- Se alterar o código, ele deve continuar único no plano de contas
- Se alterar conta pai, ela deve pertencer ao mesmo plano de contas

**Resposta:** Retorna a conta contábil atualizada.

---

### 5. Excluir Conta Contábil

```
DELETE /plano-contas/contas/:id
```

**Permissão:** `accounting.delete`

**Regra:** Não é possível excluir uma conta que possui subcontas.

**Resposta:**
```json
{
  "message": "Conta contábil removida com sucesso"
}
```

---

## 📊 Tipos de Conta

### Tipos de Plano de Contas
- **Gerencial** - Para controle interno e gestão
- **Fiscal** - Para obrigações fiscais
- **Contabil** - Para escrituração contábil oficial

### Tipos de Conta Contábil
- **Ativo** - Bens e direitos da empresa
- **Passivo** - Obrigações e dívidas
- **Receita** - Ganhos e faturamento
- **Despesa** - Custos e gastos
- **Patrimônio Líquido** - Capital e reservas

### Natureza da Conta
- **Devedora** - Aumenta com débito (Ativo, Despesa)
- **Credora** - Aumenta com crédito (Passivo, Receita, Patrimônio Líquido)

---

## 🎨 Estrutura Hierárquica

### Níveis de Conta

```
Nível 1: 1 - ATIVO
Nível 2: 1.1 - Ativo Circulante
Nível 3: 1.1.01 - Disponível
Nível 4: 1.1.01.001 - Caixa Geral
Nível 5: 1.1.01.001.01 - Caixa Matriz
```

### Regras de Hierarquia

1. **Contas Sintéticas** (Níveis 1-3)
   - Não aceitam lançamentos diretos
   - Servem apenas para agrupar contas
   - Exemplo: `1 - ATIVO`, `1.1 - Ativo Circulante`

2. **Contas Analíticas** (Níveis 4+)
   - Aceitam lançamentos diretos
   - São as contas finais da hierarquia
   - Exemplo: `1.1.01.001 - Caixa Geral`

---

## 📋 Plano de Contas Padrão (Seed)

O seed cria automaticamente um plano de contas padrão com a seguinte estrutura:

### 1. ATIVO
- 1.1 Ativo Circulante
  - 1.1.01 Disponível
    - 1.1.01.001 Caixa Geral
    - 1.1.01.002 Bancos Conta Movimento
  - 1.1.02 Contas a Receber
    - 1.1.02.001 Clientes
    - 1.1.02.002 Duplicatas a Receber
- 1.2 Ativo Não Circulante
  - 1.2.01 Imobilizado
    - 1.2.01.001 Veículos
    - 1.2.01.002 Móveis e Utensílios

### 2. PASSIVO
- 2.1 Passivo Circulante
  - 2.1.01 Contas a Pagar
    - 2.1.01.001 Fornecedores
    - 2.1.01.002 Duplicatas a Pagar
- 2.2 Passivo Não Circulante
  - 2.2.01 Empréstimos de Longo Prazo
    - 2.2.01.001 Empréstimos Bancários

### 3. PATRIMÔNIO LÍQUIDO
- 3.1 Capital Social
  - 3.1.01 Capital Integralizado
    - 3.1.01.001 Capital Social

### 4. RECEITAS
- 4.1 Receitas Operacionais
  - 4.1.01 Receitas de Vendas
    - 4.1.01.001 Vendas de Mercadorias
    - 4.1.01.002 Vendas de Serviços

### 5. DESPESAS
- 5.1 Despesas Operacionais
  - 5.1.01 Despesas Administrativas
    - 5.1.01.001 Salários e Encargos
    - 5.1.01.002 Água, Luz e Telefone

---

## 🎨 Exemplos de Uso

### JavaScript/Fetch

```javascript
// Criar plano de contas
async function criarPlanoContas() {
  const response = await fetch('http://localhost:4000/plano-contas', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      nome: 'Plano de Contas Comercial',
      descricao: 'Para empresas comerciais',
      tipo: 'Gerencial',
      padrao: false,
    }),
  });

  const plano = await response.json();
  console.log('Plano criado:', plano);
  return plano;
}

// Criar conta contábil
async function criarConta(planoContasId) {
  const response = await fetch(
    `http://localhost:4000/plano-contas/${planoContasId}/contas`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        codigo: '1.1.01.001',
        nome: 'Caixa Geral',
        tipo: 'Ativo',
        natureza: 'Devedora',
        nivel: 4,
        contaPaiId: null, // ou UUID da conta pai
        aceitaLancamento: true,
      }),
    }
  );

  const conta = await response.json();
  console.log('Conta criada:', conta);
  return conta;
}

// Buscar hierarquia
async function buscarHierarquia(planoContasId) {
  const response = await fetch(
    `http://localhost:4000/plano-contas/${planoContasId}/hierarquia`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  const hierarquia = await response.json();
  console.log('Hierarquia:', hierarquia);
  return hierarquia;
}

// Duplicar plano de contas
async function duplicarPlano(planoContasId) {
  const response = await fetch(
    `http://localhost:4000/plano-contas/${planoContasId}/duplicar`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        nome: 'Plano de Contas - Cópia',
        descricao: 'Cópia do plano de contas',
      }),
    }
  );

  const novoPlano = await response.json();
  console.log('Plano duplicado:', novoPlano);
  return novoPlano;
}
```

### React Component

```tsx
import { useState, useEffect } from 'react';

interface Conta {
  id: string;
  codigo: string;
  nome: string;
  tipo: string;
  nivel: number;
  subContas?: Conta[];
}

export function PlanoContasTree({ planoContasId }: { planoContasId: string }) {
  const [hierarquia, setHierarquia] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarHierarquia() {
      try {
        const response = await fetch(
          `/api/plano-contas/${planoContasId}/hierarquia`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();
        setHierarquia(data);
      } catch (error) {
        console.error('Erro ao carregar hierarquia:', error);
      } finally {
        setLoading(false);
      }
    }

    carregarHierarquia();
  }, [planoContasId]);

  if (loading) {
    return <div>Carregando plano de contas...</div>;
  }

  return (
    <div className="plano-contas-tree">
      <h2>{hierarquia.planoContas.nome}</h2>
      {hierarquia.contas.map((conta: Conta) => (
        <ContaNode key={conta.id} conta={conta} />
      ))}
    </div>
  );
}

function ContaNode({ conta, nivel = 0 }: { conta: Conta; nivel?: number }) {
  const [expanded, setExpanded] = useState(nivel < 2);

  return (
    <div style={{ marginLeft: `${nivel * 20}px` }}>
      <div
        className="conta-item"
        onClick={() => setExpanded(!expanded)}
        style={{ cursor: conta.subContas?.length ? 'pointer' : 'default' }}
      >
        {conta.subContas?.length > 0 && (
          <span>{expanded ? '▼' : '▶'}</span>
        )}
        <strong>{conta.codigo}</strong> - {conta.nome}
        <span className="badge">{conta.tipo}</span>
      </div>

      {expanded &&
        conta.subContas?.map((subConta) => (
          <ContaNode key={subConta.id} conta={subConta} nivel={nivel + 1} />
        ))}
    </div>
  );
}
```

---

## ⚠️ Erros Comuns

### 404 - Plano de contas não encontrado
```json
{
  "statusCode": 404,
  "message": "Plano de contas não encontrado",
  "error": "Not Found"
}
```

### 409 - Código duplicado
```json
{
  "statusCode": 409,
  "message": "Já existe uma conta com o código 1.1.01.001 neste plano de contas",
  "error": "Conflict"
}
```

### 400 - Nível hierárquico inválido
```json
{
  "statusCode": 400,
  "message": "O nível da conta deve ser 3 (nível da conta pai + 1)",
  "error": "Bad Request"
}
```

### 400 - Não é possível excluir
```json
{
  "statusCode": 400,
  "message": "Não é possível excluir uma conta que possui subcontas",
  "error": "Bad Request"
}
```

### 403 - Sem permissão
```json
{
  "statusCode": 403,
  "message": "Você não tem permissão para acessar este recurso",
  "error": "Forbidden"
}
```

---

## 📚 Referências

- [Sistema de Autenticação](./AUTH_SYSTEM.md)
- [Permissões e Roles](./PERMISSIONS.md)
- [Empresas Multi-tenant](./COMPANIES.md)
