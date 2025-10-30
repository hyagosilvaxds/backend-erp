# 🔄 Isolamento por Empresa - Plano de Contas e Centro de Custos

## 📋 Mudanças Implementadas

### ✅ O que foi feito

1. **Plano de Contas** agora é por empresa
   - Adicionado campo `companyId` (nullable)
   - `companyId = null` → Planos padrão do sistema
   - `companyId = uuid` → Planos específicos da empresa

2. **Centro de Custos** já era por empresa desde o início
   - Campo `companyId` obrigatório
   - Filtros automáticos por empresa

### 🗄️ Alterações no Schema

```prisma
model PlanoContas {
  id          String   @id @default(uuid())
  
  // NOVO: Empresa dona do plano de contas
  companyId   String?  // Null para planos padrão do sistema
  company     Company? @relation(fields: [companyId], references: [id], onDelete: Cascade)
  
  nome        String
  descricao   String?
  tipo        String   @default("Gerencial")
  ativo       Boolean  @default(true)
  padrao      Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  contas ContaContabil[]

  @@index([companyId])
  @@map("plano_contas")
}
```

### 🔧 Comportamento Atualizado

#### Plano de Contas

**Antes:**
- ❌ Todos os planos eram compartilhados entre todas as empresas
- ❌ Não havia isolamento por empresa

**Depois:**
- ✅ Planos do sistema (`companyId = null`): Disponíveis como template
- ✅ Planos da empresa (`companyId = uuid`): Isolados por empresa
- ✅ Cada empresa pode ter seu próprio plano padrão

#### Centro de Custos

**Sempre foi isolado por empresa:**
- ✅ `companyId` obrigatório
- ✅ Cada empresa tem seus próprios centros de custo

---

## 📡 API - Plano de Contas

### 1. Criar Plano de Contas

```bash
# Criar plano para uma empresa específica
POST /plano-contas
{
  "companyId": "uuid-da-empresa",
  "nome": "Plano de Contas Personalizado",
  "descricao": "Plano específico da empresa",
  "tipo": "Gerencial",
  "padrao": true,
  "ativo": true
}

# Criar plano padrão do sistema (admin)
POST /plano-contas
{
  "companyId": null,
  "nome": "Plano de Contas Sistema",
  "descricao": "Plano template do sistema",
  "tipo": "Gerencial",
  "padrao": true,
  "ativo": true
}
```

### 2. Listar Planos de Contas

```bash
# Listar planos de uma empresa específica
GET /plano-contas?companyId=uuid-da-empresa

# Listar planos padrão do sistema (sem companyId)
GET /plano-contas

# Com filtros
GET /plano-contas?companyId=uuid&tipo=Gerencial&ativo=true
```

### 3. Buscar Plano Padrão

```bash
# Buscar plano padrão de uma empresa
GET /plano-contas/padrao?companyId=uuid-da-empresa

# Buscar plano padrão do sistema
GET /plano-contas/padrao
```

### 4. Buscar Hierarquia de Contas

```bash
# Hierarquia de um plano específico
GET /plano-contas/:id/hierarquia

# Filtrar apenas contas ativas
GET /plano-contas/:id/hierarquia?ativo=true
```

---

## 📡 API - Centro de Custos

### 1. Criar Centro de Custos

```bash
POST /centro-custo
{
  "companyId": "uuid-da-empresa",  # OBRIGATÓRIO
  "codigo": "01",
  "nome": "Administrativo",
  "nivel": 1,
  "responsavel": "João Silva",
  "email": "joao@empresa.com",
  "ativo": true
}
```

### 2. Listar por Empresa

```bash
# Lista simples
GET /centro-custo/company/:companyId

# Hierarquia completa
GET /centro-custo/company/:companyId/hierarquia

# Com filtros
GET /centro-custo?companyId=uuid&ativo=true&search=Administrativo
```

---

## 🎯 Casos de Uso

### Cenário 1: Empresa Nova

```typescript
// 1. Buscar plano padrão do sistema para usar como base
const planoPadrao = await api.get('/plano-contas/padrao');

// 2. Duplicar para a empresa
const planoEmpresa = await api.post(`/plano-contas/${planoPadrao.id}/duplicar`, {
  nome: `Plano de Contas - ${empresa.nomeFantasia}`,
  descricao: 'Plano personalizado da empresa'
});

// 3. Criar centros de custo da empresa
const administrativo = await api.post('/centro-custo', {
  companyId: empresa.id,
  codigo: '01',
  nome: 'Administrativo',
  nivel: 1
});
```

### Cenário 2: Consultar Dados de Uma Empresa

```typescript
// 1. Buscar planos de contas da empresa
const planos = await api.get(`/plano-contas?companyId=${empresaId}`);

// 2. Buscar plano padrão da empresa
const planoPadrao = await api.get(`/plano-contas/padrao?companyId=${empresaId}`);

// 3. Buscar centros de custo da empresa
const centros = await api.get(`/centro-custo/company/${empresaId}`);

// 4. Buscar hierarquia de centros de custo
const hierarquia = await api.get(`/centro-custo/company/${empresaId}/hierarquia`);
```

### Cenário 3: Admin Criando Templates

```typescript
// Admin pode criar planos padrão do sistema
const planoTemplate = await api.post('/plano-contas', {
  companyId: null, // Sistema
  nome: 'Plano Industrial',
  descricao: 'Template para indústrias',
  tipo: 'Fiscal',
  padrao: false,
  ativo: true
});
```

---

## 🔒 Validações e Regras

### Plano de Contas

1. **Plano Padrão**
   - Apenas um plano pode ser padrão por empresa
   - Apenas um plano pode ser padrão do sistema (companyId = null)
   - Ao marcar um plano como padrão, os outros da mesma empresa/sistema são desmarcados

2. **Isolamento**
   - Ao listar sem `companyId`: retorna apenas planos do sistema
   - Ao listar com `companyId`: retorna apenas planos dessa empresa
   - Não há acesso cruzado entre empresas

3. **Exclusão**
   - Não pode excluir plano com contas cadastradas
   - Exclusão em cascata: se excluir empresa, exclui planos e contas

### Centro de Custos

1. **Obrigatoriedade**
   - `companyId` é sempre obrigatório
   - Não existem centros de custo do sistema

2. **Isolamento**
   - Todos os endpoints filtram automaticamente por empresa
   - Centros de custo são sempre específicos da empresa

3. **Hierarquia**
   - Centro pai deve ser da mesma empresa
   - Nível correto baseado no pai

---

## 🚀 Migration Aplicada

```sql
-- Add companyId to plano_contas
ALTER TABLE "plano_contas" ADD COLUMN "companyId" TEXT;

-- Add index
CREATE INDEX "plano_contas_companyId_idx" ON "plano_contas"("companyId");

-- Add foreign key
ALTER TABLE "plano_contas" 
ADD CONSTRAINT "plano_contas_companyId_fkey" 
FOREIGN KEY ("companyId") 
REFERENCES "companies"("id") 
ON DELETE CASCADE 
ON UPDATE CASCADE;
```

---

## 📊 Impacto

### Dados Existentes

- ✅ Plano de contas padrão atual ficou com `companyId = null` (sistema)
- ✅ Todas as contas continuam funcionando
- ✅ Centros de custo não foram afetados (já eram por empresa)

### Frontend

**IMPORTANTE: Frontend precisa enviar `companyId` nos endpoints:**

```typescript
// ❌ ANTES (não isolava por empresa)
GET /plano-contas
GET /plano-contas/padrao

// ✅ DEPOIS (isola por empresa)
GET /plano-contas?companyId=uuid
GET /plano-contas/padrao?companyId=uuid

// ✅ Planos do sistema (templates)
GET /plano-contas  // sem companyId
GET /plano-contas/padrao  // sem companyId
```

---

## ✅ Checklist de Implementação

- [x] Schema atualizado (companyId no PlanoContas)
- [x] Migration criada e aplicada
- [x] Service atualizado (filtros por empresa)
- [x] Controller atualizado (parâmetro companyId)
- [x] DTOs atualizados
- [x] Seed atualizado (plano padrão com companyId = null)
- [x] Validações de padrão por empresa/sistema
- [x] Documentação atualizada
- [ ] Frontend precisa ser atualizado para passar companyId

---

## 🎨 Exemplo Frontend - Context de Empresa

```typescript
// Context para gerenciar empresa ativa
const CompanyContext = createContext<{
  currentCompany: Company | null;
  setCurrentCompany: (company: Company) => void;
}>();

// Hook para usar em componentes
function usePlanoContas() {
  const { currentCompany } = useContext(CompanyContext);

  async function getPlanos() {
    const companyId = currentCompany?.id;
    const url = companyId 
      ? `/api/plano-contas?companyId=${companyId}`
      : '/api/plano-contas'; // Planos do sistema

    return fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  async function getPlanoPadrao() {
    const companyId = currentCompany?.id;
    const url = companyId
      ? `/api/plano-contas/padrao?companyId=${companyId}`
      : '/api/plano-contas/padrao'; // Padrão do sistema

    return fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  return { getPlanos, getPlanoPadrao };
}
```

---

## 📚 Referências

- [Plano de Contas - Documentação Completa](./PLANO_CONTAS.md)
- [Centro de Custos - Documentação Completa](./CENTRO_CUSTO.md)
- [Sistema Multi-Empresa](./MULTI_COMPANY.md)
