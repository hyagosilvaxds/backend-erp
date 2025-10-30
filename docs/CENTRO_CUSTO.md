# 💰 Centro de Custos - API Documentation

## 🎯 Visão Geral

Sistema completo de Centro de Custos **isolado por empresa**, permitindo a organização hierárquica de departamentos, projetos e atividades para controle de custos e despesas.

**🔒 ISOLAMENTO POR EMPRESA:**
- ✅ Cada empresa tem seus próprios centros de custo
- ✅ Não há compartilhamento entre empresas
- ✅ Filtros automáticos garantem isolamento total
- ✅ Campo `companyId` é **obrigatório** em todas as operações

## 🔐 Autenticação e Permissões

**Headers Obrigatórios:**
```
Authorization: Bearer {token}
```

**Permissões Necessárias:**
- `accounting.create` - Criar centros de custo
- `accounting.read` - Visualizar centros de custo
- `accounting.update` - Atualizar centros de custo
- `accounting.delete` - Deletar centros de custo

**Nota:** Usuários com role `admin` têm todas as permissões automaticamente.

---

## 📊 Estrutura do Centro de Custos

### Hierarquia
Os centros de custo podem ter até 5 níveis de hierarquia:

```
1. Departamento (Nível 1)
   └── 1.1 Sub-departamento (Nível 2)
       └── 1.1.01 Setor (Nível 3)
           └── 1.1.01.001 Projeto (Nível 4)
               └── 1.1.01.001.001 Atividade (Nível 5)
```

### Exemplo Prático
```
01 - Administrativo
├── 01.01 - Recursos Humanos
│   ├── 01.01.001 - Recrutamento
│   └── 01.01.002 - Treinamento
├── 01.02 - Financeiro
│   ├── 01.02.001 - Contas a Pagar
│   └── 01.02.002 - Contas a Receber
└── 01.03 - TI
    ├── 01.03.001 - Infraestrutura
    └── 01.03.002 - Desenvolvimento

02 - Comercial
├── 02.01 - Vendas
├── 02.02 - Marketing
└── 02.03 - Pós-venda
```

---

## 📡 Endpoints

### 1. Criar Centro de Custos

```
POST /centro-custo
```

**Permissão:** `accounting.create`

**Body:**
```json
{
  "companyId": "uuid",
  "codigo": "01",
  "nome": "Administrativo",
  "descricao": "Departamento administrativo",
  "centroCustoPaiId": null,
  "nivel": 1,
  "responsavel": "João Silva",
  "email": "joao.silva@empresa.com",
  "ativo": true
}
```

**Campos:**
- `companyId` (string, **OBRIGATÓRIO**) - ID da empresa proprietária
- `codigo` (string, obrigatório) - Código único do centro de custo (ex: 01, 01.01, 01.01.001)
- `nome` (string, obrigatório) - Nome do centro de custo
- `descricao` (string, opcional) - Descrição detalhada
- `centroCustoPaiId` (string, opcional) - ID do centro de custo pai (null para nível 1)
- `nivel` (number, obrigatório) - Nível na hierarquia (1 a 5)
- `responsavel` (string, opcional) - Nome do responsável
- `email` (string, opcional) - Email do responsável
- `ativo` (boolean, opcional) - Se está ativo (padrão: true)

**Validações:**
- ✅ O código deve ser único **dentro da empresa**
- ✅ Se tem pai, o nível deve ser (nível do pai + 1)
- ✅ Se não tem pai, o nível deve ser 1
- ✅ O centro de custo pai deve pertencer **à mesma empresa**
- ✅ A empresa deve existir

**⚠️ IMPORTANTE:** O `companyId` é obrigatório e garante o isolamento. Centros de custo de empresas diferentes não se misturam.

**Resposta:**
```json
{
  "id": "uuid",
  "companyId": "uuid",
  "codigo": "01",
  "nome": "Administrativo",
  "descricao": "Departamento administrativo",
  "centroCustoPaiId": null,
  "centroCustoPai": null,
  "nivel": 1,
  "responsavel": "João Silva",
  "email": "joao.silva@empresa.com",
  "ativo": true,
  "createdAt": "2025-10-25T19:00:00.000Z",
  "updatedAt": "2025-10-25T19:00:00.000Z",
  "subCentros": []
}
```

---

### 2. Listar Centros de Custos

```
GET /centro-custo
```

**Permissão:** `accounting.read`

**Query Parameters:**
- `companyId` (string, **RECOMENDADO**) - Filtrar por empresa específica
- `page` (number, opcional) - Número da página (padrão: 1)
- `limit` (number, opcional) - Itens por página (padrão: 50)
- `ativo` (boolean, opcional) - Filtrar por status ativo
- `search` (string, opcional) - Buscar por código, nome ou descrição

**⚠️ IMPORTANTE:** Sempre filtre por `companyId` para garantir isolamento e performance.

**Exemplos:**
```bash
# ✅ RECOMENDADO: Centros de custo de uma empresa específica
GET /centro-custo?companyId=uuid-da-empresa

# Apenas ativos de uma empresa
GET /centro-custo?companyId=uuid&ativo=true

# Buscar por termo em uma empresa
GET /centro-custo?companyId=uuid&search=Administrativo

# Paginação customizada
GET /centro-custo?companyId=uuid&page=2&limit=20

# ⚠️ Sem companyId: retorna de todas as empresas (use apenas para admin)
GET /centro-custo
```

**Resposta:**
```json
{
  "data": [
    {
      "id": "uuid",
      "companyId": "uuid",
      "codigo": "01",
      "nome": "Administrativo",
      "descricao": "Departamento administrativo",
      "nivel": 1,
      "responsavel": "João Silva",
      "email": "joao.silva@empresa.com",
      "ativo": true,
      "createdAt": "2025-10-25T19:00:00.000Z",
      "updatedAt": "2025-10-25T19:00:00.000Z",
      "company": {
        "id": "uuid",
        "razaoSocial": "Empresa LTDA",
        "nomeFantasia": "Empresa"
      },
      "centroCustoPai": null,
      "_count": {
        "subCentros": 3
      }
    }
  ],
  "meta": {
    "total": 15,
    "page": 1,
    "limit": 50,
    "totalPages": 1
  }
}
```

---

### 3. Buscar Centro de Custo por ID

```
GET /centro-custo/:id
```

**Permissão:** `accounting.read`

**Resposta:**
```json
{
  "id": "uuid",
  "companyId": "uuid",
  "codigo": "01.01",
  "nome": "Recursos Humanos",
  "descricao": "Departamento de RH",
  "centroCustoPaiId": "uuid-pai",
  "nivel": 2,
  "responsavel": "Maria Santos",
  "email": "maria.santos@empresa.com",
  "ativo": true,
  "createdAt": "2025-10-25T19:00:00.000Z",
  "updatedAt": "2025-10-25T19:00:00.000Z",
  "company": {
    "id": "uuid",
    "razaoSocial": "Empresa LTDA",
    "nomeFantasia": "Empresa"
  },
  "centroCustoPai": {
    "id": "uuid-pai",
    "codigo": "01",
    "nome": "Administrativo"
  },
  "subCentros": [
    {
      "id": "uuid-sub1",
      "codigo": "01.01.001",
      "nome": "Recrutamento",
      "nivel": 3,
      "ativo": true
    },
    {
      "id": "uuid-sub2",
      "codigo": "01.01.002",
      "nome": "Treinamento",
      "nivel": 3,
      "ativo": true
    }
  ]
}
```

---

### 4. Buscar Centros de Custo por Empresa

```
GET /centro-custo/company/:companyId
```

**Permissão:** `accounting.read`

**✅ ENDPOINT RECOMENDADO:** Retorna todos os centros de custo de uma empresa específica (lista simples, não hierárquica).

**Isolamento Garantido:** Este endpoint garante que você verá **apenas** os centros de custo da empresa especificada.

**Resposta:**
```json
[
  {
    "id": "uuid",
    "codigo": "01",
    "nome": "Administrativo",
    "descricao": "Departamento administrativo",
    "nivel": 1,
    "responsavel": "João Silva",
    "email": "joao.silva@empresa.com",
    "ativo": true,
    "centroCustoPai": null,
    "_count": {
      "subCentros": 3
    }
  },
  {
    "id": "uuid",
    "codigo": "01.01",
    "nome": "Recursos Humanos",
    "nivel": 2,
    "ativo": true,
    "centroCustoPai": {
      "id": "uuid-pai",
      "codigo": "01",
      "nome": "Administrativo"
    },
    "_count": {
      "subCentros": 2
    }
  }
]
```

---

### 5. Buscar Hierarquia de Centros de Custo

```
GET /centro-custo/company/:companyId/hierarquia
```

**Permissão:** `accounting.read`

**✅ ENDPOINT RECOMENDADO:** Retorna a estrutura hierárquica completa dos centros de custo até 5 níveis de profundidade.

**🔒 Isolamento Garantido:** Retorna **apenas** centros de custo da empresa especificada no `:companyId`.

**Query Parameters:**
- `ativo` (boolean, opcional) - Filtrar por status ativo
  - Se não informado: retorna todos (ativos e inativos)
  - Se `true`: retorna apenas ativos
  - Se `false`: retorna apenas inativos

**Exemplos:**
```bash
# ✅ Todos os centros de custo da empresa (padrão)
GET /centro-custo/company/uuid-da-empresa/hierarquia

# ✅ Apenas ativos da empresa
GET /centro-custo/company/uuid-da-empresa/hierarquia?ativo=true

# ✅ Apenas inativos da empresa
GET /centro-custo/company/uuid-da-empresa/hierarquia?ativo=false
```

**Resposta:**
```json
{
  "company": {
    "id": "uuid",
    "razaoSocial": "Empresa LTDA",
    "nomeFantasia": "Empresa"
  },
  "centrosCusto": [
    {
      "id": "uuid",
      "codigo": "01",
      "nome": "Administrativo",
      "descricao": "Departamento administrativo",
      "nivel": 1,
      "responsavel": "João Silva",
      "email": "joao.silva@empresa.com",
      "ativo": true,
      "subCentros": [
        {
          "id": "uuid",
          "codigo": "01.01",
          "nome": "Recursos Humanos",
          "nivel": 2,
          "ativo": true,
          "subCentros": [
            {
              "id": "uuid",
              "codigo": "01.01.001",
              "nome": "Recrutamento",
              "nivel": 3,
              "ativo": true,
              "subCentros": []
            },
            {
              "id": "uuid",
              "codigo": "01.01.002",
              "nome": "Treinamento",
              "nivel": 3,
              "ativo": true,
              "subCentros": []
            }
          ]
        },
        {
          "id": "uuid",
          "codigo": "01.02",
          "nome": "Financeiro",
          "nivel": 2,
          "ativo": true,
          "subCentros": []
        }
      ]
    },
    {
      "id": "uuid",
      "codigo": "02",
      "nome": "Comercial",
      "nivel": 1,
      "ativo": true,
      "subCentros": []
    }
  ]
}
```

---

### 6. Atualizar Centro de Custos

```
PATCH /centro-custo/:id
```

**Permissão:** `accounting.update`

**Body:** (todos os campos opcionais)
```json
{
  "codigo": "01.01",
  "nome": "Recursos Humanos Atualizado",
  "descricao": "Nova descrição",
  "responsavel": "Carlos Souza",
  "email": "carlos.souza@empresa.com",
  "ativo": true
}
```

**Validações:**
- Se alterar o código, não pode duplicar código existente na empresa
- Se alterar o pai, o nível deve ser (nível do novo pai + 1)
- Não pode definir a si mesmo como pai

**Resposta:**
```json
{
  "id": "uuid",
  "codigo": "01.01",
  "nome": "Recursos Humanos Atualizado",
  "descricao": "Nova descrição",
  "nivel": 2,
  "responsavel": "Carlos Souza",
  "email": "carlos.souza@empresa.com",
  "ativo": true,
  "updatedAt": "2025-10-25T20:00:00.000Z"
}
```

---

### 7. Ativar/Desativar Centro de Custos

```
PATCH /centro-custo/:id/toggle-active
```

**Permissão:** `accounting.update`

Alterna o status ativo/inativo do centro de custo.

**Resposta:**
```json
{
  "id": "uuid",
  "codigo": "01.01",
  "nome": "Recursos Humanos",
  "ativo": false,
  "updatedAt": "2025-10-25T20:00:00.000Z"
}
```

---

### 8. Deletar Centro de Custos

```
DELETE /centro-custo/:id
```

**Permissão:** `accounting.delete`

**Validações:**
- Não é possível excluir um centro de custo que possui sub-centros
- Primeiro exclua os sub-centros ou mova-os para outro pai

**Resposta:**
```json
{
  "message": "Centro de custo removido com sucesso"
}
```

---

## 💡 Casos de Uso

### 1. Criar Estrutura Básica

```typescript
// 1. Criar departamento principal
const administrativo = await api.post('/centro-custo', {
  companyId: 'company-uuid',
  codigo: '01',
  nome: 'Administrativo',
  nivel: 1,
  ativo: true,
});

// 2. Criar sub-departamento
const rh = await api.post('/centro-custo', {
  companyId: 'company-uuid',
  codigo: '01.01',
  nome: 'Recursos Humanos',
  centroCustoPaiId: administrativo.id,
  nivel: 2,
  responsavel: 'Maria Santos',
  email: 'maria.santos@empresa.com',
  ativo: true,
});

// 3. Criar setor
const recrutamento = await api.post('/centro-custo', {
  companyId: 'company-uuid',
  codigo: '01.01.001',
  nome: 'Recrutamento',
  centroCustoPaiId: rh.id,
  nivel: 3,
  ativo: true,
});
```

### 2. Visualizar Hierarquia Completa

```typescript
const hierarquia = await api.get(`/centro-custo/company/${companyId}/hierarquia`);

console.log('Estrutura de Centros de Custo:');
hierarquia.centrosCusto.forEach(centro => {
  console.log(`${centro.codigo} - ${centro.nome}`);
  centro.subCentros.forEach(sub => {
    console.log(`  ${sub.codigo} - ${sub.nome}`);
    sub.subCentros.forEach(subsub => {
      console.log(`    ${subsub.codigo} - ${subsub.nome}`);
    });
  });
});
```

### 3. Buscar Centros de Custo Ativos

```typescript
const ativos = await api.get(`/centro-custo/company/${companyId}/hierarquia?ativo=true`);
```

### 4. Reorganizar Estrutura

```typescript
// Mover um centro de custo para outro pai
await api.patch(`/centro-custo/${centroCustoId}`, {
  centroCustoPaiId: novoPaiId,
  nivel: 3, // Atualizar nível conforme novo pai
});
```

---

## 🎨 Exemplo Frontend - React Component

```tsx
import { useEffect, useState } from 'react';

interface CentroCusto {
  id: string;
  codigo: string;
  nome: string;
  descricao?: string;
  nivel: number;
  responsavel?: string;
  email?: string;
  ativo: boolean;
  subCentros?: CentroCusto[];
}

interface CentroCustoTreeProps {
  companyId: string;
}

export function CentroCustoTree({ companyId }: CentroCustoTreeProps) {
  const [centros, setCentros] = useState<CentroCusto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInactive, setShowInactive] = useState(false);

  useEffect(() => {
    async function fetchCentros() {
      setLoading(true);
      try {
        const ativo = showInactive ? undefined : 'true';
        const params = ativo ? `?ativo=${ativo}` : '';
        
        const response = await fetch(
          `/api/centro-custo/company/${companyId}/hierarquia${params}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        const data = await response.json();
        setCentros(data.centrosCusto);
      } catch (error) {
        console.error('Erro ao carregar centros de custo:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCentros();
  }, [companyId, showInactive]);

  if (loading) {
    return <div>Carregando estrutura de centros de custo...</div>;
  }

  return (
    <div className="centro-custo-tree">
      <div className="tree-header">
        <h2>Centros de Custo</h2>
        <label>
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
          />
          Exibir inativos
        </label>
      </div>

      <div className="tree-content">
        {centros.map(centro => (
          <CentroCustoNode key={centro.id} centro={centro} level={0} />
        ))}
      </div>
    </div>
  );
}

function CentroCustoNode({ centro, level }: { centro: CentroCusto; level: number }) {
  const [expanded, setExpanded] = useState(level < 2); // Expande os 2 primeiros níveis

  return (
    <div className={`centro-node level-${level}`} style={{ marginLeft: `${level * 20}px` }}>
      <div className="centro-header" onClick={() => setExpanded(!expanded)}>
        {centro.subCentros && centro.subCentros.length > 0 && (
          <span className="expand-icon">{expanded ? '▼' : '▶'}</span>
        )}
        
        <span className={`centro-badge ${centro.ativo ? 'active' : 'inactive'}`}>
          {centro.codigo}
        </span>
        
        <span className="centro-nome">{centro.nome}</span>
        
        {centro.responsavel && (
          <span className="centro-responsavel">
            👤 {centro.responsavel}
          </span>
        )}
        
        {!centro.ativo && (
          <span className="inactive-badge">Inativo</span>
        )}
      </div>

      {centro.descricao && (
        <div className="centro-descricao">{centro.descricao}</div>
      )}

      {expanded && centro.subCentros && centro.subCentros.length > 0 && (
        <div className="sub-centros">
          {centro.subCentros.map(sub => (
            <CentroCustoNode key={sub.id} centro={sub} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## ⚠️ Erros Comuns

### 404 - Centro de custo não encontrado
```json
{
  "statusCode": 404,
  "message": "Centro de custo não encontrado",
  "error": "Not Found"
}
```

### 409 - Código duplicado
```json
{
  "statusCode": 409,
  "message": "Já existe um centro de custo com o código 01.01 nesta empresa",
  "error": "Conflict"
}
```

### 400 - Nível incorreto
```json
{
  "statusCode": 400,
  "message": "O nível do centro de custo deve ser 3 (nível do pai + 1)",
  "error": "Bad Request"
}
```

### 400 - Possui sub-centros
```json
{
  "statusCode": 400,
  "message": "Não é possível excluir um centro de custo que possui sub-centros",
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

### 404 - Empresa não encontrada
```json
{
  "statusCode": 404,
  "message": "Empresa não encontrada",
  "error": "Not Found"
}
```

### 400 - Centro pai de empresa diferente
```json
{
  "statusCode": 400,
  "message": "O centro de custo pai deve pertencer à mesma empresa",
  "error": "Bad Request"
}
```

---

## � Isolamento por Empresa

### Garantias de Isolamento

O sistema de Centro de Custos é **totalmente isolado por empresa**:

1. **Campo Obrigatório**
   - ✅ `companyId` é obrigatório em todas as operações de criação
   - ✅ Não existem centros de custo "globais" ou "do sistema"
   - ✅ Todo centro de custo pertence a uma única empresa

2. **Filtros Automáticos**
   - ✅ Ao buscar por empresa (`/company/:companyId`), retorna apenas daquela empresa
   - ✅ Hierarquia filtra automaticamente por empresa
   - ✅ Não há acesso cruzado entre empresas

3. **Validações de Integridade**
   - ✅ Centro de custo pai deve ser da mesma empresa
   - ✅ Código único por empresa (empresas diferentes podem ter códigos iguais)
   - ✅ Exclusão em cascata ao deletar empresa

4. **Segurança**
   - ✅ Não é possível criar centro de custo sem empresa
   - ✅ Não é possível vincular centros de empresas diferentes
   - ✅ Permissões respeitam isolamento de empresa

### Exemplo de Isolamento

**Empresa A:**
```
01 - Administrativo
├── 01.01 - RH
└── 01.02 - Financeiro
```

**Empresa B:**
```
01 - Operações       ← Mesmo código, empresa diferente ✅
├── 01.01 - Produção
└── 01.02 - Logística
```

**✅ Permitido:** Códigos iguais em empresas diferentes
**❌ Bloqueado:** Acessar centros de custo de outra empresa
**❌ Bloqueado:** Vincular centro pai de empresa diferente

### Uso Recomendado

```typescript
// ✅ SEMPRE filtre por empresa
const centros = await api.get(`/centro-custo/company/${empresaId}`);
const hierarquia = await api.get(`/centro-custo/company/${empresaId}/hierarquia`);

// ✅ SEMPRE envie companyId ao criar
const novo = await api.post('/centro-custo', {
  companyId: empresaId,  // OBRIGATÓRIO
  codigo: '01',
  nome: 'Administrativo',
  nivel: 1
});

// ⚠️ Evite listar sem companyId (retorna de todas as empresas)
const todos = await api.get('/centro-custo'); // Apenas para admin
```

### Verificação de Isolamento

Para garantir que o isolamento está funcionando:

```bash
# 1. Criar centro na Empresa A
curl -X POST http://localhost:4000/centro-custo \
  -H "Authorization: Bearer TOKEN" \
  -d '{"companyId": "empresa-a-uuid", "codigo": "01", "nome": "Administrativo", "nivel": 1}'

# 2. Buscar centros da Empresa A
curl http://localhost:4000/centro-custo/company/empresa-a-uuid \
  -H "Authorization: Bearer TOKEN"
# ✅ Retorna apenas centros da Empresa A

# 3. Buscar centros da Empresa B
curl http://localhost:4000/centro-custo/company/empresa-b-uuid \
  -H "Authorization: Bearer TOKEN"
# ✅ Retorna vazio (ou apenas centros da Empresa B)
# ✅ NÃO retorna centros da Empresa A
```

---

## �📚 Referências

- [Isolamento por Empresa - Guia Completo](./ISOLAMENTO_POR_EMPRESA.md)
- [Plano de Contas](./PLANO_CONTAS.md)
- [Sistema de Auditoria](./AUDIT_SYSTEM.md)
- [Permissões e Roles](./AUTH_PERMISSIONS.md)
