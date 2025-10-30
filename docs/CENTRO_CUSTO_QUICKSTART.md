# 🚀 Centro de Custos - Guia Rápido

## ✅ O que foi implementado

✅ Modelo de dados `CentroCusto` no Prisma
✅ Migration aplicada no banco de dados
✅ CRUD completo de centros de custo
✅ Estrutura hierárquica (até 5 níveis)
✅ **🔒 ISOLAMENTO TOTAL POR EMPRESA**
✅ Relacionamento obrigatório com empresas
✅ Filtros por empresa, status ativo e busca textual
✅ Endpoint de hierarquia completa
✅ Validações de integridade
✅ Permissões via `accounting.*`
✅ Documentação completa

## 🔒 Isolamento por Empresa

**IMPORTANTE:** Centros de Custo são **sempre** isolados por empresa:
- ✅ `companyId` é **obrigatório** em todas as operações
- ✅ Cada empresa tem seus próprios centros de custo
- ✅ Não há compartilhamento entre empresas
- ✅ Código pode se repetir em empresas diferentes
- ✅ Centro pai deve ser da mesma empresa

## 📋 Endpoints Disponíveis

```
POST   /centro-custo                              - Criar centro de custo
GET    /centro-custo                              - Listar (com filtros)
GET    /centro-custo/:id                          - Buscar por ID
GET    /centro-custo/company/:companyId           - Buscar por empresa
GET    /centro-custo/company/:companyId/hierarquia - Hierarquia completa
PATCH  /centro-custo/:id                          - Atualizar
PATCH  /centro-custo/:id/toggle-active            - Ativar/Desativar
DELETE /centro-custo/:id                          - Deletar
```

## 🔑 Permissões

Usa as mesmas permissões do Plano de Contas:
- `accounting.create` - Criar
- `accounting.read` - Visualizar
- `accounting.update` - Editar
- `accounting.delete` - Deletar

Admins têm todas as permissões automaticamente.

## 🎯 Teste Rápido

### 1. Login como Admin
```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@erp.com",
    "password": "Admin@123"
  }'
```

### 2. Criar Centro de Custo Principal
```bash
curl -X POST http://localhost:4000/centro-custo \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": "ID_DA_EMPRESA",  # ← OBRIGATÓRIO
    "codigo": "01",
    "nome": "Administrativo",
    "descricao": "Departamento administrativo",
    "nivel": 1,
    "responsavel": "João Silva",
    "email": "joao.silva@empresa.com",
    "ativo": true
  }'
```

### 3. Criar Sub-Centro de Custo
```bash
curl -X POST http://localhost:4000/centro-custo \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": "ID_DA_EMPRESA",  # ← MESMA EMPRESA
    "codigo": "01.01",
    "nome": "Recursos Humanos",
    "centroCustoPaiId": "ID_DO_CENTRO_PAI",
    "nivel": 2,
    "responsavel": "Maria Santos",
    "email": "maria.santos@empresa.com",
    "ativo": true
  }'
```

### 4. Buscar Hierarquia (Isolado por Empresa)
```bash
# ✅ Retorna APENAS centros da empresa especificada
curl http://localhost:4000/centro-custo/company/ID_DA_EMPRESA/hierarquia \
  -H "Authorization: Bearer SEU_TOKEN"
```

### 5. Listar Todos
```bash
curl "http://localhost:4000/centro-custo?companyId=ID_DA_EMPRESA&ativo=true" \
  -H "Authorization: Bearer SEU_TOKEN"
```

## 📊 Estrutura Sugerida

```
01 - Administrativo
├── 01.01 - Recursos Humanos
│   ├── 01.01.001 - Recrutamento e Seleção
│   ├── 01.01.002 - Treinamento e Desenvolvimento
│   └── 01.01.003 - Departamento Pessoal
├── 01.02 - Financeiro
│   ├── 01.02.001 - Contas a Pagar
│   ├── 01.02.002 - Contas a Receber
│   └── 01.02.003 - Tesouraria
└── 01.03 - Tecnologia da Informação
    ├── 01.03.001 - Infraestrutura
    ├── 01.03.002 - Desenvolvimento
    └── 01.03.003 - Suporte

02 - Comercial
├── 02.01 - Vendas Internas
├── 02.02 - Vendas Externas
└── 02.03 - Marketing
    ├── 02.03.001 - Marketing Digital
    └── 02.03.002 - Eventos

03 - Operacional
├── 03.01 - Produção
├── 03.02 - Logística
│   ├── 03.02.001 - Expedição
│   └── 03.02.002 - Transporte
└── 03.03 - Qualidade
```

## 🔍 Filtros Úteis

```bash
# ✅ SEMPRE filtre por empresa (recomendado)
GET /centro-custo?companyId=uuid

# Apenas centros ativos de uma empresa
GET /centro-custo?companyId=uuid&ativo=true

# Buscar por termo em uma empresa
GET /centro-custo?companyId=uuid&search=RH

# Hierarquia completa de uma empresa (apenas ativos)
GET /centro-custo/company/uuid/hierarquia?ativo=true

# Paginação por empresa
GET /centro-custo?companyId=uuid&page=1&limit=20

# ⚠️ Sem companyId: retorna de todas as empresas (apenas admin)
GET /centro-custo
```

## ⚙️ Validações Importantes

- ✅ **`companyId` é OBRIGATÓRIO** ao criar
- ✅ Código único **por empresa** (empresas diferentes podem ter códigos iguais)
- ✅ Nível correto baseado no pai (pai.nivel + 1)
- ✅ Centro pai deve ser **da mesma empresa**
- ✅ Não pode ser pai de si mesmo
- ✅ Não pode excluir se tiver sub-centros
- ✅ Email válido (opcional)

## 🎨 Campos Disponíveis

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| **companyId** | string | **✅ SIM** | **ID da empresa (OBRIGATÓRIO)** |
| codigo | string | ✅ | Código único (ex: 01, 01.01) |
| nome | string | ✅ | Nome do centro de custo |
| descricao | string | ❌ | Descrição detalhada |
| centroCustoPaiId | string | ❌ | ID do pai (null para nível 1) |
| nivel | number | ✅ | Nível na hierarquia (1-5) |
| responsavel | string | ❌ | Nome do responsável |
| email | string | ❌ | Email do responsável |
| ativo | boolean | ❌ | Status ativo (padrão: true) |

## 🔒 Isolamento por Empresa

**Exemplos práticos:**

```typescript
// ✅ Empresa A: código "01"
POST /centro-custo
{ "companyId": "empresa-a", "codigo": "01", "nome": "Administrativo" }

// ✅ Empresa B: código "01" (mesmo código, OK!)
POST /centro-custo
{ "companyId": "empresa-b", "codigo": "01", "nome": "Operacional" }

// ✅ Buscar centros da Empresa A (retorna apenas dela)
GET /centro-custo/company/empresa-a

// ✅ Buscar centros da Empresa B (retorna apenas dela)
GET /centro-custo/company/empresa-b

// ❌ Tentar vincular pai de empresa diferente (BLOQUEADO)
POST /centro-custo
{ 
  "companyId": "empresa-a", 
  "centroCustoPaiId": "centro-da-empresa-b"  // ERRO!
}
```

## 📚 Documentação Completa

Ver: [docs/CENTRO_CUSTO.md](./CENTRO_CUSTO.md)

## ✅ Status

**IMPLEMENTAÇÃO COMPLETA** - Pronto para uso! 🎉
