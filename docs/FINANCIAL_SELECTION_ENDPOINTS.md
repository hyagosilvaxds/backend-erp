# 📋 Endpoints de Seleção - Centro de Custo e Conta Contábil

## 📌 Resumo

Este documento descreve os endpoints disponíveis para buscar **Centro de Custo** e **Conta Contábil** no módulo financeiro, facilitando a seleção destes itens em formulários (ex: criação de lançamentos a partir do OFX).

---

## 🏢 Centro de Custo

### Endpoint: Listar Centros de Custo

```http
GET /financial/centros-custo?companyId={companyId}&ativo={true|false}
Authorization: Bearer {token}
```

#### Query Parameters

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `companyId` | string | **Sim** | UUID da empresa |
| `ativo` | boolean | Não | Filtrar por status (padrão: `true`) |

#### Resposta

```json
[
  {
    "id": "uuid",
    "codigo": "CC001",
    "nome": "Administrativo",
    "descricao": "Centro de custo administrativo",
    "nivel": 1,
    "ativo": true,
    "centroCustoPaiId": null,
    "responsavel": "João Silva",
    "email": "joao@empresa.com"
  },
  {
    "id": "uuid",
    "codigo": "CC002",
    "nome": "Produção",
    "descricao": "Centro de custo de produção",
    "nivel": 1,
    "ativo": true,
    "centroCustoPaiId": null,
    "responsavel": "Maria Santos",
    "email": "maria@empresa.com"
  }
]
```

#### Exemplos de Uso

```bash
# Buscar centros de custo ativos (padrão)
GET /financial/centros-custo?companyId=uuid-empresa

# Buscar centros de custo ativos (explícito)
GET /financial/centros-custo?companyId=uuid-empresa&ativo=true

# Buscar centros de custo inativos
GET /financial/centros-custo?companyId=uuid-empresa&ativo=false
```

---

## 📊 Conta Contábil

Para buscar contas contábeis, são necessários **2 passos**:

### 1. Obter Plano de Contas Padrão

```http
GET /financial/plano-contas/padrao?companyId={companyId}
Authorization: Bearer {token}
```

#### Query Parameters

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `companyId` | string | **Sim** | UUID da empresa |

#### Resposta

```json
{
  "id": "uuid-plano",
  "nome": "Plano de Contas Padrão",
  "descricao": "Plano de contas gerencial",
  "tipo": "Gerencial",
  "ativo": true,
  "padrao": true,
  "companyId": null
}
```

### 2. Listar Contas Contábeis do Plano

```http
GET /financial/plano-contas/{planoId}/contas?aceitaLancamento=true&page=1&limit=100
Authorization: Bearer {token}
```

#### Path Parameters

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `planoId` | string | UUID do plano de contas (obtido no passo 1) |

#### Query Parameters

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `aceitaLancamento` | boolean | Não | Filtrar apenas contas que aceitam lançamento (recomendado: `true`) |
| `tipo` | string | Não | Filtrar por tipo: `ATIVO`, `PASSIVO`, `RECEITA`, `DESPESA`, `PATRIMONIO_LIQUIDO` |
| `nivel` | number | Não | Filtrar por nível (1, 2, 3, 4, 5) |
| `page` | number | Não | Número da página (padrão: 1) |
| `limit` | number | Não | Itens por página (padrão: 100) |

#### Resposta

```json
{
  "data": [
    {
      "id": "uuid-conta",
      "codigo": "1.1.01.001",
      "nome": "Caixa Geral",
      "tipo": "ATIVO",
      "natureza": "Devedora",
      "nivel": 4,
      "aceitaLancamento": true,
      "ativo": true
    },
    {
      "id": "uuid-conta",
      "codigo": "3.1.01.001",
      "nome": "Vendas",
      "tipo": "RECEITA",
      "natureza": "Credora",
      "nivel": 4,
      "aceitaLancamento": true,
      "ativo": true
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 100,
  "totalPages": 1
}
```

#### Exemplos de Uso

```bash
# Buscar todas as contas que aceitam lançamento
GET /financial/plano-contas/uuid-plano/contas?aceitaLancamento=true

# Buscar apenas contas de receita
GET /financial/plano-contas/uuid-plano/contas?aceitaLancamento=true&tipo=RECEITA

# Buscar apenas contas de despesa
GET /financial/plano-contas/uuid-plano/contas?aceitaLancamento=true&tipo=DESPESA

# Buscar contas de nível 4 (contas detalhadas)
GET /financial/plano-contas/uuid-plano/contas?aceitaLancamento=true&nivel=4

# Paginação
GET /financial/plano-contas/uuid-plano/contas?aceitaLancamento=true&page=2&limit=50
```

---

## 🎯 Fluxo Completo para Formulário

Para popular um formulário de criação de lançamento (ex: OFX), busque os dados nesta ordem:

### 1. Categorias Financeiras

```http
GET /financial/categories?companyId={companyId}&ativo=true
```

### 2. Centros de Custo

```http
GET /financial/centros-custo?companyId={companyId}&ativo=true
```

### 3. Plano de Contas Padrão

```http
GET /financial/plano-contas/padrao?companyId={companyId}
```

### 4. Contas Contábeis

```http
GET /financial/plano-contas/{planoId}/contas?aceitaLancamento=true
```

---

## 💻 Exemplo em TypeScript/React

```typescript
interface DropdownOptions {
  categories: Category[];
  centrosCusto: CentroCusto[];
  contasContabeis: ContaContabil[];
}

async function fetchDropdownOptions(companyId: string): Promise<DropdownOptions> {
  const token = localStorage.getItem('token');
  const headers = {
    'Authorization': `Bearer ${token}`,
  };

  // 1. Buscar categorias
  const categoriesRes = await fetch(
    `/api/financial/categories?companyId=${companyId}&ativo=true`,
    { headers }
  );
  const categories = await categoriesRes.json();

  // 2. Buscar centros de custo
  const centrosCustoRes = await fetch(
    `/api/financial/centros-custo?companyId=${companyId}&ativo=true`,
    { headers }
  );
  const centrosCusto = await centrosCustoRes.json();

  // 3. Buscar plano de contas padrão
  const planoRes = await fetch(
    `/api/financial/plano-contas/padrao?companyId=${companyId}`,
    { headers }
  );
  const plano = await planoRes.json();

  // 4. Buscar contas contábeis
  const contasRes = await fetch(
    `/api/financial/plano-contas/${plano.id}/contas?aceitaLancamento=true&limit=100`,
    { headers }
  );
  const contasData = await contasRes.json();

  return {
    categories,
    centrosCusto,
    contasContabeis: contasData.data,
  };
}
```

---

## 🎨 Exemplo de Dropdown em React

```tsx
import React, { useState, useEffect } from 'react';

interface FormData {
  categoryId: string;
  centroCustoId: string;
  contaContabilId: string;
}

export function TransactionForm({ companyId }: { companyId: string }) {
  const [options, setOptions] = useState<DropdownOptions | null>(null);
  const [formData, setFormData] = useState<FormData>({
    categoryId: '',
    centroCustoId: '',
    contaContabilId: '',
  });

  useEffect(() => {
    fetchDropdownOptions(companyId).then(setOptions);
  }, [companyId]);

  if (!options) return <div>Carregando...</div>;

  return (
    <form>
      {/* Categoria */}
      <label>
        Categoria:
        <select
          value={formData.categoryId}
          onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
        >
          <option value="">Selecione uma categoria</option>
          {options.categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </label>

      {/* Centro de Custo */}
      <label>
        Centro de Custo (opcional):
        <select
          value={formData.centroCustoId}
          onChange={(e) => setFormData({ ...formData, centroCustoId: e.target.value })}
        >
          <option value="">Selecione um centro de custo</option>
          {options.centrosCusto.map((cc) => (
            <option key={cc.id} value={cc.id}>
              {cc.codigo} - {cc.nome}
            </option>
          ))}
        </select>
      </label>

      {/* Conta Contábil */}
      <label>
        Conta Contábil (opcional):
        <select
          value={formData.contaContabilId}
          onChange={(e) => setFormData({ ...formData, contaContabilId: e.target.value })}
        >
          <option value="">Selecione uma conta contábil</option>
          {options.contasContabeis.map((conta) => (
            <option key={conta.id} value={conta.id}>
              {conta.codigo} - {conta.nome}
            </option>
          ))}
        </select>
      </label>
    </form>
  );
}
```

---

## 📝 Notas Importantes

### Centro de Custo

- ✅ **Isolamento por Empresa**: Retorna apenas centros de custo da empresa especificada
- ✅ **Filtro de Ativos**: Por padrão, retorna apenas centros de custo ativos
- ✅ **Ordenação**: Ordenado por código (ascendente)
- ✅ **Performance**: Consulta otimizada com select específico

### Conta Contábil

- ✅ **Duas Etapas**: Primeiro busca plano de contas, depois as contas
- ✅ **Filtro de Lançamento**: Use `aceitaLancamento=true` para retornar apenas contas que aceitam lançamento
- ✅ **Plano Padrão**: O endpoint `/padrao` busca primeiro plano da empresa, depois plano padrão do sistema
- ✅ **Paginação**: Suporta paginação (padrão: 100 itens por página)
- ✅ **Múltiplos Filtros**: Pode filtrar por tipo, nível, e busca textual

### Segurança

- 🔒 **Autenticação**: Todos os endpoints requerem JWT (`@UseGuards(JwtAuthGuard)`)
- 🔒 **Validação**: Valida `companyId` obrigatório
- 🔒 **Isolamento**: Garante que cada empresa vê apenas seus dados

---

## 📦 Arquivos Criados/Modificados

### Novos Arquivos

1. **`src/financial/controllers/financial-centro-custo.controller.ts`**
   - Controller para endpoints de Centro de Custo no módulo financeiro
   - Endpoints: `GET /` e `GET /:id`

2. **`financial-centro-custo-tests.http`**
   - Exemplos de requisições HTTP
   - Casos de uso completos

3. **`docs/FINANCIAL_SELECTION_ENDPOINTS.md`** (este arquivo)
   - Documentação completa dos endpoints de seleção

### Arquivos Modificados

1. **`src/financial/financial.module.ts`**
   - Adicionado `FinancialCentroCustoController` aos controllers

2. **`docs/OFX_CREATE_TRANSACTION.md`**
   - Adicionada seção "Endpoints Auxiliares para Seleção"
   - Atualizado exemplo React com busca de dropdowns

---

## 🔗 Referências

- **Centro de Custo**: `/centro-custo/company/:companyId` (endpoint completo com permissões)
- **Plano de Contas**: `/plano-contas/:planoContasId/contas` (endpoint completo com permissões)
- **OFX Create Transaction**: `docs/OFX_CREATE_TRANSACTION.md`
- **Centro de Custo Docs**: `docs/CENTRO_CUSTO.md`
- **Plano de Contas Docs**: `docs/PLANO_CONTAS.md`

---

📅 **Criado em**: 17/11/2025  
🔖 **Versão**: 1.0  
✍️ **Autor**: Sistema de Documentação Automática
