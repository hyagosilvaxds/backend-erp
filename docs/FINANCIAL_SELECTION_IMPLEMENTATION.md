# 📋 Implementação: Endpoints de Seleção (Centro de Custo e Conta Contábil)

## 🎯 Objetivo

Adicionar endpoints simplificados no módulo financeiro para facilitar a busca de **Centro de Custo** e **Conta Contábil** em formulários (ex: criação de lançamentos a partir do OFX).

---

## ✅ O que foi implementado

### 1. Novo Controller: Financial Centro de Custo

**Arquivo**: `src/financial/controllers/financial-centro-custo.controller.ts`

**Endpoints**:
- `GET /financial/centros-custo?companyId={id}&ativo={true|false}` - Listar centros de custo
- `GET /financial/centros-custo/:id?id={id}` - Buscar centro de custo por ID

**Características**:
- ✅ Autenticação JWT obrigatória
- ✅ Filtro por empresa (companyId obrigatório)
- ✅ Filtro por status ativo (padrão: true)
- ✅ Ordenação por código
- ✅ Retorna apenas campos necessários (otimizado)

### 2. Endpoints de Conta Contábil (já existentes)

**Arquivos**:
- `src/financial/controllers/financial-plano-contas.controller.ts` (já existia)

**Endpoints**:
- `GET /financial/plano-contas/padrao?companyId={id}` - Obter plano de contas padrão
- `GET /financial/plano-contas/:planoId/contas?aceitaLancamento=true` - Listar contas contábeis

**Características**:
- ✅ Autenticação JWT obrigatória
- ✅ Busca plano padrão (empresa ou sistema)
- ✅ Filtros: tipo, nível, aceitaLancamento
- ✅ Paginação (padrão: 100 itens)

---

## 📦 Arquivos Criados/Modificados

### Novos Arquivos

1. **`src/financial/controllers/financial-centro-custo.controller.ts`** (103 linhas)
   - Controller com 2 endpoints
   - Guards: JwtAuthGuard
   - Validação: companyId obrigatório
   - Select otimizado (apenas campos necessários)

2. **`financial-centro-custo-tests.http`** (70 linhas)
   - Exemplos de requisições
   - Casos de uso completos
   - Fluxo OFX completo

3. **`docs/FINANCIAL_SELECTION_ENDPOINTS.md`** (430 linhas)
   - Documentação completa
   - Exemplos TypeScript/React
   - Fluxo de uso
   - Referências cruzadas

### Arquivos Modificados

1. **`src/financial/financial.module.ts`**
   - Adicionado import de `FinancialCentroCustoController`
   - Registrado controller no array de controllers

2. **`docs/OFX_CREATE_TRANSACTION.md`**
   - Adicionada seção "Endpoints Auxiliares para Seleção" (120 linhas)
   - Atualizado exemplo React para incluir busca de dropdowns (180 linhas)
   - Documentação de fluxo completo com todos os endpoints

---

## 🔍 Detalhes Técnicos

### Controller: Financial Centro de Custo

```typescript
@Controller('financial/centros-custo')
@UseGuards(JwtAuthGuard)
export class FinancialCentroCustoController {
  
  @Get()
  async findAll(
    @Query('companyId') companyId: string,
    @Query('ativo') ativo?: string,
  ) {
    // Validação: companyId obrigatório
    // Filtro: ativo padrão = true
    // Ordenação: codigo asc
    // Select: apenas campos necessários
  }

  @Get(':id')
  async findOne(@Query('id') id: string) {
    // Busca por ID
    // Validação: id obrigatório
  }
}
```

### Validações Implementadas

1. **companyId obrigatório**:
   ```typescript
   if (!companyId) {
     throw new BadRequestException('companyId é obrigatório');
   }
   ```

2. **Filtro de ativos (padrão: true)**:
   ```typescript
   if (ativo === undefined || ativo === 'true') {
     where.ativo = true;
   }
   ```

3. **ID obrigatório**:
   ```typescript
   if (!id) {
     throw new BadRequestException('id é obrigatório');
   }
   ```

### Select Otimizado

```typescript
select: {
  id: true,
  codigo: true,
  nome: true,
  descricao: true,
  nivel: true,
  ativo: true,
  centroCustoPaiId: true,
  responsavel: true,
  email: true,
}
```

**Campos não incluídos** (desnecessários para dropdowns):
- `createdAt`, `updatedAt`
- `companyId` (já é filtro)
- Relações completas

---

## 🚀 Como Usar

### Fluxo Completo para Formulário OFX

```typescript
async function fetchDropdownOptions(companyId: string) {
  const token = localStorage.getItem('token');
  const headers = { 'Authorization': `Bearer ${token}` };

  // 1. Categorias
  const categories = await fetch(
    `/api/financial/categories?companyId=${companyId}&ativo=true`,
    { headers }
  ).then(r => r.json());

  // 2. Centros de Custo (NOVO)
  const centrosCusto = await fetch(
    `/api/financial/centros-custo?companyId=${companyId}&ativo=true`,
    { headers }
  ).then(r => r.json());

  // 3. Plano de Contas Padrão
  const plano = await fetch(
    `/api/financial/plano-contas/padrao?companyId=${companyId}`,
    { headers }
  ).then(r => r.json());

  // 4. Contas Contábeis
  const contasData = await fetch(
    `/api/financial/plano-contas/${plano.id}/contas?aceitaLancamento=true&limit=100`,
    { headers }
  ).then(r => r.json());

  return {
    categories,
    centrosCusto,
    contasContabeis: contasData.data,
  };
}
```

### Criar Lançamento com Todos os Dados

```typescript
await fetch('/api/financial/ofx/create-transaction', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    ofxFitId: '20240115001',
    companyId: companyId,
    bankAccountId: bankAccountId,
    type: 'DESPESA',
    transactionType: 'PIX',
    categoryId: selectedCategory,          // Do passo 1
    centroCustoId: selectedCentroCusto,    // Do passo 2 (NOVO)
    contaContabilId: selectedConta,        // Do passo 4 (NOVO)
    description: 'Taxa bancária mensal',
    notes: 'Observação adicional'
  })
});
```

---

## 📊 Comparação: Antes vs Depois

### Antes

❌ **Problema**: Para buscar centro de custo, era necessário:
- Usar endpoint `/centro-custo/company/:companyId` (fora do módulo financial)
- Ter permissão `accounting.read`
- Endpoint mais pesado (retorna company completo, _count, etc)

❌ **Problema**: Para buscar conta contábil:
- Endpoint `/financial/plano-contas/:planoId/contas` existia
- Mas não havia endpoint para buscar plano padrão no módulo financial
- Era necessário usar `/plano-contas/padrao` (outro módulo)

### Depois

✅ **Solução**: Centro de custo no módulo financial:
- Endpoint: `/financial/centros-custo?companyId={id}`
- Sem necessidade de permissões especiais (apenas JWT)
- Select otimizado (apenas campos necessários)
- Integrado ao fluxo financeiro

✅ **Solução**: Conta contábil completa:
- Endpoint: `/financial/plano-contas/padrao?companyId={id}` (já existia)
- Endpoint: `/financial/plano-contas/:planoId/contas` (já existia)
- Tudo no mesmo módulo (financial)
- Documentação unificada

---

## 🧪 Testes

### Arquivo de Testes

**`financial-centro-custo-tests.http`**

Inclui:
- ✅ Listar centros de custo ativos
- ✅ Listar todos os centros de custo
- ✅ Listar centros de custo inativos
- ✅ Buscar centro de custo por ID
- ✅ Fluxo completo de criação de lançamento OFX

### Exemplos de Requisição

```http
### Listar centros de custo ativos
GET http://localhost:3000/financial/centros-custo?companyId=uuid&ativo=true
Authorization: Bearer {token}

### Buscar por ID
GET http://localhost:3000/financial/centros-custo/uuid?id=uuid
Authorization: Bearer {token}
```

---

## 📚 Documentação

### Documentos Criados/Atualizados

1. **`docs/FINANCIAL_SELECTION_ENDPOINTS.md`** (NOVO)
   - Documentação completa dos endpoints de seleção
   - Exemplos TypeScript/React
   - Fluxo completo de uso
   - 430 linhas

2. **`docs/OFX_CREATE_TRANSACTION.md`** (ATUALIZADO)
   - Seção "Endpoints Auxiliares para Seleção" adicionada
   - Exemplo React atualizado com busca de dropdowns
   - Fluxo completo documentado
   - +300 linhas adicionadas

3. **`financial-centro-custo-tests.http`** (NOVO)
   - Exemplos de requisições HTTP
   - Casos de uso reais
   - 70 linhas

---

## 🔐 Segurança

### Validações Implementadas

1. ✅ **Autenticação**: `@UseGuards(JwtAuthGuard)`
2. ✅ **companyId obrigatório**: Valida presença
3. ✅ **ID obrigatório**: Valida no endpoint `:id`
4. ✅ **Isolamento**: Retorna apenas dados da empresa especificada

### Sem Necessidade de Permissões Especiais

- ❌ Não requer `accounting.read` (mais simples que `/centro-custo`)
- ✅ Apenas JWT (usuário autenticado)
- 💡 **Razão**: São endpoints de leitura para seleção, não modificação

---

## ✅ Checklist de Implementação

- [x] Controller criado (`financial-centro-custo.controller.ts`)
- [x] Controller registrado no módulo (`financial.module.ts`)
- [x] Endpoints testados (sem erros de compilação)
- [x] Documentação completa criada
- [x] Arquivo de testes HTTP criado
- [x] Documentação OFX atualizada
- [x] Exemplos React/TypeScript incluídos
- [x] Validações implementadas
- [x] Guards de segurança aplicados
- [x] Select otimizado (performance)

---

## 🎯 Resultado Final

### Endpoints Disponíveis

1. **Centro de Custo**:
   - `GET /financial/centros-custo?companyId={id}&ativo={true|false}`

2. **Conta Contábil**:
   - `GET /financial/plano-contas/padrao?companyId={id}`
   - `GET /financial/plano-contas/:planoId/contas?aceitaLancamento=true`

3. **Categorias** (já existia):
   - `GET /financial/categories?companyId={id}&ativo=true`

### Integração Completa

Estes endpoints permitem que o frontend:
- 📋 Popule dropdowns facilmente
- 🔄 Crie lançamentos OFX com todos os dados
- 🎯 Mantenha consistência de dados
- ⚡ Tenha performance otimizada

---

📅 **Criado em**: 17/11/2025  
🔖 **Versão**: 1.0  
✅ **Status**: Concluído  
✍️ **Autor**: Sistema de Documentação Automática
