# 📊 Endpoints de Plano de Contas no Módulo Financeiro

## Visão Geral

O módulo financeiro fornece endpoints simplificados para acessar planos de contas e contas contábeis **sem necessidade de permissões granulares**. Qualquer usuário com acesso ao módulo financeiro pode usar estes endpoints.

## Diferença dos Endpoints de Contabilidade

| Característica | `/financial/plano-contas` | `/api/plano-contas` |
|----------------|----------------------------|---------------------|
| Permissões | Apenas JWT | `accounting.read`, `accounting.create`, etc. |
| Objetivo | Consulta para lançamentos | Gestão completa do plano |
| Funcionalidades | Leitura apenas | CRUD completo |
| Acesso | Módulo financeiro | Módulo contábil |

## Endpoints Disponíveis

### 1. Listar Planos de Contas da Empresa

```http
GET /financial/plano-contas?companyId={companyId}&ativo=true
Authorization: Bearer {token}
```

**Query Parameters:**
- `companyId` (obrigatório): ID da empresa
- `ativo` (opcional): Filtrar apenas planos ativos (`true` ou `false`)

**Resposta:**
```json
[
  {
    "id": "uuid",
    "nome": "Plano de Contas Empresarial",
    "descricao": "Plano principal da empresa",
    "tipo": "EMPRESARIAL",
    "ativo": true,
    "padrao": false,
    "companyId": "uuid",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "_count": {
      "contas": 150
    }
  },
  {
    "id": "uuid-2",
    "nome": "Plano de Contas Padrão",
    "descricao": "Plano padrão do sistema",
    "tipo": "GERENCIAL",
    "ativo": true,
    "padrao": true,
    "companyId": null,
    "_count": {
      "contas": 200
    }
  }
]
```

**Notas:**
- Retorna tanto planos da empresa quanto planos padrão do sistema
- Planos padrão aparecem primeiro na lista
- Mostra contador de contas em cada plano

---

### 2. Obter Plano de Contas Padrão

```http
GET /financial/plano-contas/padrao?companyId={companyId}
Authorization: Bearer {token}
```

**Query Parameters:**
- `companyId` (obrigatório): ID da empresa

**Resposta:**
```json
{
  "id": "uuid",
  "nome": "Plano de Contas Principal",
  "descricao": "Plano de contas empresarial",
  "tipo": "EMPRESARIAL",
  "ativo": true,
  "padrao": false,
  "companyId": "uuid",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Lógica de Busca:**
1. Busca primeiro um plano ativo da empresa
2. Se não encontrar, busca o plano padrão do sistema
3. Retorna erro se nenhum plano for encontrado

**Exemplo de Erro:**
```json
{
  "message": "Nenhum plano de contas encontrado para esta empresa",
  "error": "Bad Request",
  "statusCode": 400
}
```

---

### 3. Listar Contas Contábeis de um Plano

```http
GET /financial/plano-contas/:planoId/contas?page=1&limit=50
Authorization: Bearer {token}
```

**Path Parameters:**
- `planoId`: ID do plano de contas

**Query Parameters:**
- `tipo` (opcional): Filtrar por tipo
  - `ATIVO`
  - `PASSIVO`
  - `RECEITA`
  - `DESPESA`
  - `PATRIMONIO_LIQUIDO`
- `nivel` (opcional): Filtrar por nível (1, 2, 3, 4, 5)
- `aceitaLancamento` (opcional): Filtrar apenas contas que aceitam lançamento (`true` ou `false`)
- `page` (opcional): Número da página (padrão: 1)
- `limit` (opcional): Itens por página (padrão: 100)

**Resposta:**
```json
{
  "data": [
    {
      "id": "uuid",
      "planoContasId": "uuid",
      "codigo": "1.1.01.001",
      "nome": "Caixa",
      "descricao": "Caixa geral",
      "tipo": "ATIVO",
      "nivel": 4,
      "aceitaLancamento": true,
      "contaPaiId": "uuid",
      "natureza": "DEVEDORA",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": "uuid-2",
      "planoContasId": "uuid",
      "codigo": "1.1.01.002",
      "nome": "Bancos",
      "descricao": "Contas bancárias",
      "tipo": "ATIVO",
      "nivel": 4,
      "aceitaLancamento": true,
      "contaPaiId": "uuid",
      "natureza": "DEVEDORA",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 50,
  "totalPages": 3
}
```

**Exemplos de Filtros:**

```http
# Apenas contas de despesa que aceitam lançamento
GET /financial/plano-contas/{planoId}/contas?tipo=DESPESA&aceitaLancamento=true

# Contas de nível 4 (mais detalhadas)
GET /financial/plano-contas/{planoId}/contas?nivel=4&limit=100

# Todas as contas de receita
GET /financial/plano-contas/{planoId}/contas?tipo=RECEITA&page=1&limit=50
```

---

### 4. Buscar Conta Contábil por ID

```http
GET /financial/plano-contas/contas/:contaId
Authorization: Bearer {token}
```

**Path Parameters:**
- `contaId`: ID da conta contábil

**Resposta:**
```json
{
  "id": "uuid",
  "planoContasId": "uuid",
  "codigo": "1.1.01.001",
  "nome": "Caixa",
  "descricao": "Caixa geral",
  "tipo": "ATIVO",
  "nivel": 4,
  "aceitaLancamento": true,
  "contaPaiId": "uuid",
  "natureza": "DEVEDORA",
  "planoContas": {
    "id": "uuid",
    "nome": "Plano Principal",
    "tipo": "EMPRESARIAL"
  },
  "contaPai": {
    "id": "uuid",
    "codigo": "1.1.01",
    "nome": "Disponível"
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Inclui:**
- Dados completos da conta
- Informações do plano de contas
- Informações da conta pai (se houver)

---

## Casos de Uso

### 1. Selecionar Conta para Lançamento Financeiro

```typescript
// 1. Buscar plano padrão
const plano = await fetch(
  `${API_URL}/financial/plano-contas/padrao?companyId=${companyId}`,
  { headers: { Authorization: `Bearer ${token}` } }
).then(r => r.json());

// 2. Buscar contas que aceitam lançamento
const contasResponse = await fetch(
  `${API_URL}/financial/plano-contas/${plano.id}/contas?aceitaLancamento=true&limit=200`,
  { headers: { Authorization: `Bearer ${token}` } }
).then(r => r.json());

// 3. Usar em dropdown/select
const contas = contasResponse.data.map(c => ({
  value: c.id,
  label: `${c.codigo} - ${c.nome}`
}));
```

### 2. Filtrar Contas por Tipo de Transação

```typescript
// Para receitas, buscar contas de RECEITA
const fetchContasReceita = async (planoId) => {
  const response = await fetch(
    `${API_URL}/financial/plano-contas/${planoId}/contas?tipo=RECEITA&aceitaLancamento=true`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.json();
};

// Para despesas, buscar contas de DESPESA
const fetchContasDespesa = async (planoId) => {
  const response = await fetch(
    `${API_URL}/financial/plano-contas/${planoId}/contas?tipo=DESPESA&aceitaLancamento=true`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.json();
};
```

### 3. Exibir Hierarquia de Contas

```typescript
// Buscar todas as contas
const allContas = await fetch(
  `${API_URL}/financial/plano-contas/${planoId}/contas?limit=1000`,
  { headers: { Authorization: `Bearer ${token}` } }
).then(r => r.json());

// Organizar por nível
const byLevel = allContas.data.reduce((acc, conta) => {
  acc[conta.nivel] = acc[conta.nivel] || [];
  acc[conta.nivel].push(conta);
  return acc;
}, {});
```

---

## Exemplo React Component

```typescript
import React, { useEffect, useState } from 'react';

interface ContaContabil {
  id: string;
  codigo: string;
  nome: string;
  aceitaLancamento: boolean;
}

export function ContaContabilSelect({ 
  companyId, 
  tipo,
  onChange 
}: {
  companyId: string;
  tipo?: 'RECEITA' | 'DESPESA';
  onChange: (contaId: string) => void;
}) {
  const [contas, setContas] = useState<ContaContabil[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContas();
  }, [companyId, tipo]);

  const loadContas = async () => {
    try {
      // 1. Buscar plano padrão
      const plano = await fetch(
        `${process.env.REACT_APP_API_URL}/financial/plano-contas/padrao?companyId=${companyId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      ).then(r => r.json());

      // 2. Buscar contas
      const params = new URLSearchParams({
        aceitaLancamento: 'true',
        limit: '200',
      });
      
      if (tipo) {
        params.append('tipo', tipo);
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/financial/plano-contas/${plano.id}/contas?${params}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      ).then(r => r.json());

      setContas(response.data);
    } catch (error) {
      console.error('Erro ao carregar contas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <select onChange={(e) => onChange(e.target.value)}>
      <option value="">Selecione uma conta...</option>
      {contas.map(conta => (
        <option key={conta.id} value={conta.id}>
          {conta.codigo} - {conta.nome}
        </option>
      ))}
    </select>
  );
}
```

---

## Notas Importantes

1. **Permissões Simplificadas**: Estes endpoints requerem apenas autenticação JWT, sem permissões granulares

2. **Isolamento de Dados**: Sempre filtra por `companyId` para garantir isolamento de dados entre empresas

3. **Contas que Aceitam Lançamento**: Para lançamentos financeiros, sempre filtre por `aceitaLancamento=true`

4. **Tipos de Conta**:
   - `ATIVO`: Bens e direitos
   - `PASSIVO`: Obrigações
   - `RECEITA`: Entradas de recursos
   - `DESPESA`: Saídas de recursos
   - `PATRIMONIO_LIQUIDO`: Capital e lucros/prejuízos

5. **Níveis de Conta**:
   - Nível 1: Grupo (ex: 1 - ATIVO)
   - Nível 2: Subgrupo (ex: 1.1 - ATIVO CIRCULANTE)
   - Nível 3: Conta sintética (ex: 1.1.01 - DISPONÍVEL)
   - Nível 4: Conta analítica (ex: 1.1.01.001 - CAIXA)
   - Nível 5: Sub-conta (opcional)

---

**Data:** 10 de novembro de 2025  
**Versão:** 1.2.0  
**Status:** ✅ Implementado
