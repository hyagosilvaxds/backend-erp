# 🏢 Endpoints de Empresas para Admin

## Visão Geral

Endpoints exclusivos para usuários com **role admin** que permitem listar todas as empresas do sistema e buscar detalhes completos de qualquer empresa.

## 🔒 Permissões Necessárias

- **`companies.read`** - Obrigatória para ambos endpoints
- Apenas usuários com **role admin** têm acesso a esses endpoints

---

## 1. Listar Todas as Empresas

### Endpoint

```
GET /companies/admin/all?search={texto}&page={numero}&limit={tamanho}
```

### Descrição

Retorna uma lista paginada com todas as empresas cadastradas no sistema, independente de vínculo do usuário. Endpoint exclusivo para admins. Suporta busca por texto e paginação.

### Query Parameters

| Parâmetro | Tipo | Obrigatório | Padrão | Descrição |
|-----------|------|-------------|---------|-----------|
| `search` | string | Não | - | Texto para buscar em razão social, nome fantasia, CNPJ, e-mail, cidade ou estado |
| `page` | number | Não | 1 | Número da página (começa em 1) |
| `limit` | number | Não | 10 | Quantidade de registros por página |

### Autenticação

```
Authorization: Bearer {token}
```

### Headers Obrigatórios

```
Authorization: Bearer {token}
x-company-id: {companyId}
```

> ⚠️ Apesar de ser um endpoint de listagem geral, o header `x-company-id` é necessário para validar que o usuário possui a permissão `companies.read` em alguma empresa.

### Resposta de Sucesso

**Status:** `200 OK`

```json
{
  "data": [
    {
      "id": "cm2r8g9h40000vy9x1a2b3c4d",
      "razaoSocial": "Empresa Alpha Comércio Ltda",
      "nomeFantasia": "Empresa Alpha",
      "cnpj": "11222333000144",
      "inscricaoEstadual": "123456789",
      "inscricaoMunicipal": "987654",
      "regimeTributario": "Simples Nacional",
      "email": "contato@alpha.com.br",
      "telefone": "(11) 3000-1000",
      "celular": "(11) 99000-1000",
      "cidade": "São Paulo",
      "estado": "SP",
      "cep": "01310-100",
      "active": true,
      "situacaoCadastral": "Ativa",
      "logoUrl": null,
      "createdAt": "2025-10-25T10:30:00.000Z",
      "updatedAt": "2025-10-25T10:30:00.000Z",
      "_count": {
        "users": 3
      }
    },
    {
      "id": "cm2r8g9h40002vy9x1a2b3c4f",
      "razaoSocial": "Empresa Beta Serviços e Comércio Ltda",
      "nomeFantasia": "Empresa Beta",
      "cnpj": "55666777000188",
      "inscricaoEstadual": "987654321",
      "inscricaoMunicipal": "123456",
      "regimeTributario": "Lucro Presumido",
      "email": "contato@beta.com.br",
      "telefone": "(11) 3000-2000",
      "celular": "(11) 99000-2000",
      "cidade": "São Paulo",
      "estado": "SP",
      "cep": "01310-200",
      "active": true,
      "situacaoCadastral": "Ativa",
      "logoUrl": null,
      "createdAt": "2025-10-25T10:31:00.000Z",
      "updatedAt": "2025-10-25T10:31:00.000Z",
      "_count": {
        "users": 2
      }
    }
  ],
  "meta": {
    "total": 15,
    "page": 1,
    "limit": 10,
    "totalPages": 2
  }
}
```

### Campos Retornados

#### Estrutura da Resposta

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `data` | array | Lista de empresas |
| `meta` | object | Metadados da paginação |
| `meta.total` | number | Total de registros encontrados |
| `meta.page` | number | Página atual |
| `meta.limit` | number | Registros por página |
| `meta.totalPages` | number | Total de páginas |

#### Empresa (dentro de data[])

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | string | ID único da empresa |
| `razaoSocial` | string | Razão social da empresa |
| `nomeFantasia` | string | Nome fantasia da empresa |
| `cnpj` | string | CNPJ da empresa |
| `inscricaoEstadual` | string \| null | Inscrição estadual |
| `inscricaoMunicipal` | string \| null | Inscrição municipal |
| `regimeTributario` | string \| null | Regime tributário (Simples Nacional, Lucro Presumido, Lucro Real) |
| `email` | string \| null | E-mail de contato |
| `telefone` | string \| null | Telefone fixo |
| `celular` | string \| null | Celular/WhatsApp |
| `cidade` | string \| null | Cidade |
| `estado` | string \| null | Estado (UF) |
| `cep` | string \| null | CEP |
| `active` | boolean | Se a empresa está ativa |
| `situacaoCadastral` | string | Situação cadastral (Ativa, Inativa, Suspensa) |
| `logoUrl` | string \| null | URL da logo |
| `createdAt` | string | Data de criação no sistema |
| `updatedAt` | string | Data da última atualização |
| `_count.users` | number | Quantidade de usuários vinculados |

### Exemplos de Uso

#### cURL

**Listar todas (primeira página):**

```bash
curl -X GET "http://localhost:3000/companies/admin/all?page=1&limit=10" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "x-company-id: cm2r8g9h40000vy9x1a2b3c4d"
```

**Buscar por texto:**

```bash
curl -X GET "http://localhost:3000/companies/admin/all?search=Alpha&page=1&limit=10" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "x-company-id: cm2r8g9h40000vy9x1a2b3c4d"
```

**Buscar por CNPJ:**

```bash
curl -X GET "http://localhost:3000/companies/admin/all?search=11222333" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "x-company-id: cm2r8g9h40000vy9x1a2b3c4d"
```

**Buscar por cidade:**

```bash
curl -X GET "http://localhost:3000/companies/admin/all?search=São Paulo" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "x-company-id: cm2r8g9h40000vy9x1a2b3c4d"
```

#### JavaScript/TypeScript

**Função genérica com busca e paginação:**

```typescript
interface FetchCompaniesParams {
  search?: string;
  page?: number;
  limit?: number;
}

async function fetchAllCompanies(params: FetchCompaniesParams = {}) {
  const { search = '', page = 1, limit = 10 } = params;
  
  const queryParams = new URLSearchParams();
  if (search) queryParams.append('search', search);
  queryParams.append('page', page.toString());
  queryParams.append('limit', limit.toString());

  const response = await fetch(
    `http://localhost:3000/companies/admin/all?${queryParams}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-company-id': selectedCompanyId,
      },
    }
  );

  const result = await response.json();
  return result; // { data: [...], meta: { total, page, limit, totalPages } }
}

// Uso:
const firstPage = await fetchAllCompanies({ page: 1, limit: 10 });
const searchResults = await fetchAllCompanies({ search: 'Alpha', page: 1 });
const largePage = await fetchAllCompanies({ limit: 50 });
```

#### React Hook

```typescript
import { useState, useEffect } from 'react';
import { api } from '../services/api';

interface CompanySummary {
  id: string;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  inscricaoEstadual: string | null;
  inscricaoMunicipal: string | null;
  regimeTributario: string | null;
  email: string | null;
  telefone: string | null;
  celular: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
  active: boolean;
  situacaoCadastral: string;
  logoUrl: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    users: number;
  };
}

interface PaginatedResponse {
  data: CompanySummary[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface UseAllCompaniesParams {
  search?: string;
  page?: number;
  limit?: number;
}

export function useAllCompanies(params: UseAllCompaniesParams = {}) {
  const { search = '', page = 1, limit = 10 } = params;
  const [result, setResult] = useState<PaginatedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCompanies() {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams();
        if (search) queryParams.append('search', search);
        queryParams.append('page', page.toString());
        queryParams.append('limit', limit.toString());

        const response = await api.get(`/companies/admin/all?${queryParams}`);
        setResult(response.data);
      } catch (err) {
        setError('Erro ao carregar empresas');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadCompanies();
  }, [search, page, limit]);

  return { 
    companies: result?.data || [], 
    meta: result?.meta,
    loading, 
    error 
  };
}
```

#### Caso de Uso - Tabela de Empresas com Busca e Paginação

```typescript
function AdminCompaniesTable() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { companies, meta, loading } = useAllCompanies({
    search: searchTerm,
    page: currentPage,
    limit: pageSize,
  });

  if (loading) return <Spinner />;

  return (
    <div>
      {/* Barra de Busca */}
      <SearchBar
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setCurrentPage(1); // Volta para primeira página ao buscar
        }}
        placeholder="Buscar por razão social, CNPJ, cidade..."
      />

      {/* Informações de Paginação */}
      <div className="pagination-info">
        Mostrando {companies.length} de {meta?.total} empresas
        {searchTerm && ` (filtrado por "${searchTerm}")`}
      </div>

      {/* Tabela */}
      <Table>
        <thead>
          <tr>
            <th>Razão Social</th>
            <th>CNPJ</th>
            <th>Cidade/UF</th>
            <th>Regime</th>
            <th>Usuários</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {companies.map(company => (
            <tr key={company.id}>
              <td>
                <strong>{company.nomeFantasia}</strong>
                <br />
                <small>{company.razaoSocial}</small>
              </td>
              <td>{formatCNPJ(company.cnpj)}</td>
              <td>{company.cidade}/{company.estado}</td>
              <td>{company.regimeTributario}</td>
              <td>{company._count.users} usuários</td>
              <td>
                <Badge color={company.active ? 'success' : 'danger'}>
                  {company.situacaoCadastral}
                </Badge>
              </td>
              <td>
                <Button onClick={() => viewDetails(company.id)}>
                  Ver Detalhes
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Paginação */}
      <Pagination
        currentPage={meta?.page || 1}
        totalPages={meta?.totalPages || 1}
        onPageChange={setCurrentPage}
        pageSize={pageSize}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
        pageSizeOptions={[10, 25, 50, 100]}
      />
    </div>
  );
}
```

#### Exemplo de Componente de Paginação

```typescript
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions: number[];
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  onPageSizeChange,
  pageSizeOptions,
}: PaginationProps) {
  return (
    <div className="pagination">
      {/* Botões de navegação */}
      <div className="pagination-buttons">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
        >
          Primeira
        </button>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Anterior
        </button>
        
        <span>
          Página {currentPage} de {totalPages}
        </span>
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Próxima
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          Última
        </button>
      </div>

      {/* Seletor de tamanho de página */}
      <div className="page-size-selector">
        <label>
          Registros por página:
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            {pageSizeOptions.map(size => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
```

### Campos de Busca

O parâmetro `search` realiza busca **case-insensitive** nos seguintes campos:

| Campo | Exemplo de Busca |
|-------|------------------|
| Razão Social | `search=Alpha` ou `search=Comércio` |
| Nome Fantasia | `search=Beta` |
| CNPJ | `search=11222333` ou `search=11.222.333/0001-44` |
| E-mail | `search=contato@` ou `search=alpha.com` |
| Cidade | `search=São Paulo` ou `search=Campinas` |
| Estado | `search=SP` ou `search=RJ` |

**Dicas de Busca:**
- ✅ A busca não diferencia maiúsculas de minúsculas
- ✅ Busca por texto parcial funciona (ex: "Alpha" encontra "Alpha Comércio Ltda")
- ✅ CNPJ pode ser buscado com ou sem formatação
- ✅ Busca em múltiplos campos simultaneamente (OR logic)

### Erros Possíveis

#### 401 Unauthorized

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**Causa:** Token inválido ou não fornecido

#### 403 Forbidden

```json
{
  "statusCode": 403,
  "message": "Você não possui a permissão necessária: companies.read"
}
```

**Causa:** Usuário não tem a permissão `companies.read`

---

## 2. Buscar Detalhes da Empresa

### Endpoint

```
GET /companies/admin/:id
```

### Descrição

Retorna todos os detalhes de uma empresa específica, incluindo lista completa de usuários vinculados com suas roles. Endpoint exclusivo para admins.

### Parâmetros de Rota

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `id` | string | ID da empresa |

### Autenticação

```
Authorization: Bearer {token}
```

### Headers Obrigatórios

```
Authorization: Bearer {token}
x-company-id: {companyId}
```

### Resposta de Sucesso

**Status:** `200 OK`

```json
{
  "id": "cm2r8g9h40000vy9x1a2b3c4d",
  "razaoSocial": "Empresa Alpha Comércio Ltda",
  "nomeFantasia": "Empresa Alpha",
  "cnpj": "11222333000144",
  "inscricaoEstadual": "123456789",
  "inscricaoMunicipal": "987654",
  "regimeTributario": "Simples Nacional",
  "cnaePrincipal": "4751-2/01",
  "cnaeSecundarios": ["4752-1/00", "4753-9/00"],
  "dataAbertura": "2020-01-15T00:00:00.000Z",
  "situacaoCadastral": "Ativa",
  "logradouro": "Rua das Flores",
  "numero": "100",
  "complemento": "Sala 201",
  "bairro": "Centro",
  "cidade": "São Paulo",
  "estado": "SP",
  "cep": "01310-100",
  "pais": "Brasil",
  "telefone": "(11) 3000-1000",
  "celular": "(11) 99000-1000",
  "email": "contato@alpha.com.br",
  "site": "https://www.alpha.com.br",
  "tipoContribuinte": "Contribuinte ICMS",
  "regimeApuracao": "Simples Nacional",
  "codigoMunicipioIBGE": "3550308",
  "codigoEstadoIBGE": "35",
  "cfopPadrao": "5102",
  "certificadoDigitalPath": null,
  "certificadoDigitalSenha": null,
  "serieNFe": "1",
  "ultimoNumeroNFe": 0,
  "serieNFCe": "1",
  "ultimoNumeroNFCe": 0,
  "serieNFSe": "1",
  "ultimoNumeroNFSe": 0,
  "ambienteFiscal": "Homologacao",
  "logoUrl": null,
  "logoFileName": null,
  "logoMimeType": null,
  "planoContasId": "cm2r8g9h40005vy9x1a2b3c4i",
  "active": true,
  "createdAt": "2025-10-25T10:30:00.000Z",
  "updatedAt": "2025-10-25T10:30:00.000Z",
  "users": [
    {
      "id": "cm2r8g9h40006vy9x1a2b3c4j",
      "userId": "cm2r8g9h40007vy9x1a2b3c4k",
      "companyId": "cm2r8g9h40000vy9x1a2b3c4d",
      "roleId": "cm2r8g9h40001vy9x1a2b3c4e",
      "active": true,
      "createdAt": "2025-10-25T10:35:00.000Z",
      "updatedAt": "2025-10-25T10:35:00.000Z",
      "user": {
        "id": "cm2r8g9h40007vy9x1a2b3c4k",
        "name": "Admin Geral",
        "email": "admin@example.com",
        "active": true
      },
      "role": {
        "id": "cm2r8g9h40001vy9x1a2b3c4e",
        "name": "admin",
        "description": "Administrador - Acesso total ao sistema"
      }
    },
    {
      "id": "cm2r8g9h40008vy9x1a2b3c4l",
      "userId": "cm2r8g9h40009vy9x1a2b3c4m",
      "companyId": "cm2r8g9h40000vy9x1a2b3c4d",
      "roleId": "cm2r8g9h40004vy9x1a2b3c4h",
      "active": true,
      "createdAt": "2025-10-25T10:36:00.000Z",
      "updatedAt": "2025-10-25T10:36:00.000Z",
      "user": {
        "id": "cm2r8g9h40009vy9x1a2b3c4m",
        "name": "Gerente Multi",
        "email": "gerente@example.com",
        "active": true
      },
      "role": {
        "id": "cm2r8g9h40004vy9x1a2b3c4h",
        "name": "manager",
        "description": "Gerente"
      }
    }
  ]
}
```

### Campos Retornados

#### Dados Básicos

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | string | ID único da empresa |
| `razaoSocial` | string | Razão social da empresa |
| `nomeFantasia` | string \| null | Nome fantasia |
| `cnpj` | string | CNPJ |
| `inscricaoEstadual` | string \| null | Inscrição estadual |
| `inscricaoMunicipal` | string \| null | Inscrição municipal |

#### Regime Tributário

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `regimeTributario` | string \| null | Regime tributário |
| `cnaePrincipal` | string \| null | CNAE principal |
| `cnaeSecundarios` | string[] | Lista de CNAEs secundários |
| `dataAbertura` | string \| null | Data de abertura da empresa |
| `situacaoCadastral` | string | Situação cadastral |

#### Endereço

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `logradouro` | string \| null | Logradouro |
| `numero` | string \| null | Número |
| `complemento` | string \| null | Complemento |
| `bairro` | string \| null | Bairro |
| `cidade` | string \| null | Cidade |
| `estado` | string \| null | Estado (UF) |
| `cep` | string \| null | CEP |
| `pais` | string | País |

#### Contatos

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `telefone` | string \| null | Telefone fixo |
| `celular` | string \| null | Celular |
| `email` | string \| null | E-mail |
| `site` | string \| null | Website |

#### Configurações Fiscais

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `tipoContribuinte` | string \| null | Tipo de contribuinte |
| `regimeApuracao` | string \| null | Regime de apuração |
| `codigoMunicipioIBGE` | string \| null | Código IBGE do município |
| `codigoEstadoIBGE` | string \| null | Código IBGE do estado |
| `cfopPadrao` | string \| null | CFOP padrão |
| `serieNFe` | string \| null | Série NF-e |
| `ultimoNumeroNFe` | number \| null | Último número NF-e |
| `serieNFCe` | string \| null | Série NFC-e |
| `ultimoNumeroNFCe` | number \| null | Último número NFC-e |
| `serieNFSe` | string \| null | Série NFS-e |
| `ultimoNumeroNFSe` | number \| null | Último número NFS-e |
| `ambienteFiscal` | string | Ambiente fiscal (Homologacao/Producao) |

#### Logo e Plano de Contas

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `logoUrl` | string \| null | URL da logo |
| `logoFileName` | string \| null | Nome do arquivo da logo |
| `logoMimeType` | string \| null | Tipo MIME da logo |
| `planoContasId` | string \| null | ID do plano de contas |

#### Usuários Vinculados

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `users` | array | Lista de usuários vinculados |
| `users[].id` | string | ID do vínculo UserCompany |
| `users[].userId` | string | ID do usuário |
| `users[].companyId` | string | ID da empresa |
| `users[].roleId` | string | ID da role |
| `users[].active` | boolean | Se o vínculo está ativo |
| `users[].user.id` | string | ID do usuário |
| `users[].user.name` | string | Nome do usuário |
| `users[].user.email` | string | E-mail do usuário |
| `users[].user.active` | boolean | Se o usuário está ativo |
| `users[].role.id` | string | ID da role |
| `users[].role.name` | string | Nome da role |
| `users[].role.description` | string | Descrição da role |

### Exemplos de Uso

#### cURL

```bash
curl -X GET http://localhost:3000/companies/admin/cm2r8g9h40000vy9x1a2b3c4d \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "x-company-id: cm2r8g9h40000vy9x1a2b3c4d"
```

#### JavaScript/TypeScript

```typescript
async function getCompanyDetails(companyId: string) {
  const response = await fetch(`http://localhost:3000/companies/admin/${companyId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-company-id': selectedCompanyId,
    },
  });

  const company = await response.json();
  return company;
}
```

#### React Component

```typescript
import { useState, useEffect } from 'react';
import { api } from '../services/api';

function CompanyDetailsPage({ companyId }: { companyId: string }) {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCompany() {
      try {
        setLoading(true);
        const response = await api.get(`/companies/admin/${companyId}`);
        setCompany(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadCompany();
  }, [companyId]);

  if (loading) return <Spinner />;
  if (!company) return <div>Empresa não encontrada</div>;

  return (
    <div>
      <h1>{company.nomeFantasia}</h1>
      <p><strong>Razão Social:</strong> {company.razaoSocial}</p>
      <p><strong>CNPJ:</strong> {formatCNPJ(company.cnpj)}</p>
      <p><strong>Regime:</strong> {company.regimeTributario}</p>
      
      <h2>Endereço</h2>
      <p>
        {company.logradouro}, {company.numero}
        {company.complemento && ` - ${company.complemento}`}
        <br />
        {company.bairro} - {company.cidade}/{company.estado}
        <br />
        CEP: {formatCEP(company.cep)}
      </p>
      
      <h2>Contatos</h2>
      <p>
        <strong>E-mail:</strong> {company.email}<br />
        <strong>Telefone:</strong> {company.telefone}<br />
        <strong>Celular:</strong> {company.celular}
      </p>
      
      <h2>Usuários ({company.users.length})</h2>
      <Table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>E-mail</th>
            <th>Role</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {company.users.map(uc => (
            <tr key={uc.id}>
              <td>{uc.user.name}</td>
              <td>{uc.user.email}</td>
              <td>{uc.role.description}</td>
              <td>
                <Badge color={uc.active ? 'success' : 'danger'}>
                  {uc.active ? 'Ativo' : 'Inativo'}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
```

### Erros Possíveis

#### 401 Unauthorized

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**Causa:** Token inválido ou não fornecido

#### 403 Forbidden

```json
{
  "statusCode": 403,
  "message": "Você não possui a permissão necessária: companies.read"
}
```

**Causa:** Usuário não tem a permissão `companies.read`

#### 404 Not Found

```json
{
  "statusCode": 404,
  "message": "Empresa não encontrada"
}
```

**Causa:** ID da empresa não existe

---

## Notas Importantes

1. ✅ **Exclusivo para Admin**: Apenas usuários com role `admin` e permissão `companies.read` podem acessar
2. ✅ **Header x-company-id Obrigatório**: Necessário para validação de permissão
3. ✅ **Acesso Irrestrito**: Admin pode ver qualquer empresa, mesmo sem vínculo direto
4. ✅ **Informações Completas**: Endpoint de detalhes retorna TODOS os campos da empresa
5. ✅ **Usuários Ativos**: Lista de usuários inclui apenas vínculos ativos
6. ✅ **Ordem Alfabética**: Listagem ordenada por razão social
7. ⚠️ **Dados Sensíveis**: Certificado digital e senhas são retornados (use com cuidado)

## Diferença dos Endpoints Comuns

| Característica | `/companies` | `/companies/:id` | `/companies/admin/all` | `/companies/admin/:id` |
|----------------|-------------|------------------|------------------------|------------------------|
| **Acesso** | Empresas do usuário | Empresa específica do usuário | Todas as empresas | Qualquer empresa |
| **Permissão** | Qualquer usuário autenticado | Usuário vinculado | Admin com companies.read | Admin com companies.read |
| **Campos** | Resumidos | Completos com permissão | Resumidos | Completos sempre |
| **Filtro** | Por vínculo UserCompany | Por vínculo UserCompany | Sem filtro | Sem filtro |

## Fluxo Recomendado

```
1. Admin acessa painel de administração
   ↓
2. Chama GET /companies/admin/all
   ↓
3. Exibe tabela com todas as empresas
   ↓
4. Usuário clica em "Ver Detalhes"
   ↓
5. Chama GET /companies/admin/:id
   ↓
6. Exibe página completa com todos os dados
```
