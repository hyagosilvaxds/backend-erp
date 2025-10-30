# 🏢 API de Gerenciamento de Empresas

## 📋 Índice
- [Visão Geral](#visão-geral)
- [Autenticação](#autenticação)
- [Endpoints](#endpoints)
- [Modelos de Dados](#modelos-de-dados)
- [Exemplos de Integração](#exemplos-de-integração)
- [Tratamento de Erros](#tratamento-de-erros)
- [Permissões](#permissões)

---

## 🎯 Visão Geral

A API de Gerenciamento de Empresas permite que usuários com permissões adequadas (SuperAdmin ou usuários com permissão `companies.create`, `companies.update`, etc.) possam:

- ✅ Criar novas empresas com todos os dados fiscais brasileiros
- ✅ Listar empresas (com filtro por permissão)
- ✅ Visualizar detalhes completos de uma empresa
- ✅ Atualizar todos os campos de uma empresa
- ✅ Ativar/Desativar empresas
- ✅ Deletar empresas (apenas SuperAdmin)

---

## 🔐 Autenticação

Todos os endpoints requerem autenticação via **JWT Token**.

### Headers Obrigatórios

```http
Authorization: Bearer {seu_token_jwt}
Content-Type: application/json
```

### Headers Opcionais

```http
x-company-id: {uuid_da_empresa}
```

> **Nota**: O header `x-company-id` é necessário para operações que requerem contexto de empresa específica.

---

## 📡 Endpoints

### 1. Criar Nova Empresa

Cria uma nova empresa no sistema com todos os dados cadastrais e fiscais.

**Endpoint**: `POST /companies`

**Permissão necessária**: `companies.create` (ou SuperAdmin)

**Request Body**:

```json
{
  // ===== DADOS CADASTRAIS BÁSICOS ===== (OBRIGATÓRIOS)
  "razaoSocial": "EMPRESA EXEMPLO LTDA",
  "cnpj": "12345678000190",
  
  // ===== DADOS CADASTRAIS BÁSICOS ===== (OPCIONAIS)
  "nomeFantasia": "Empresa Exemplo",
  "inscricaoEstadual": "123456789",
  "inscricaoMunicipal": "987654321",
  
  // ===== REGIME TRIBUTÁRIO E ATIVIDADES =====
  "regimeTributario": "Simples Nacional",
  "cnaePrincipal": "6201-5/00",
  "cnaeSecundarios": ["6202-3/00", "6203-1/00"],
  "dataAbertura": "2020-01-15",
  "situacaoCadastral": "Ativa",
  
  // ===== ENDEREÇO COMPLETO =====
  "logradouro": "Rua das Flores",
  "numero": "123",
  "complemento": "Sala 456",
  "bairro": "Centro",
  "cidade": "São Paulo",
  "estado": "SP",
  "cep": "01310100",
  "pais": "Brasil",
  
  // ===== CONTATOS =====
  "telefone": "11987654321",
  "celular": "11912345678",
  "email": "contato@empresa.com.br",
  "site": "https://www.empresa.com.br",
  
  // ===== CONFIGURAÇÕES FISCAIS =====
  "tipoContribuinte": "Contribuinte ICMS",
  "regimeApuracao": "Regime Normal",
  "codigoMunicipioIBGE": "3550308",
  "codigoEstadoIBGE": "35",
  "cfopPadrao": "5102",
  
  // ===== CERTIFICADO DIGITAL A1 =====
  "certificadoDigitalPath": "/certificates/empresa.pfx",
  "certificadoDigitalSenha": "senha_certificado",
  
  // ===== NUMERAÇÃO DE NOTAS FISCAIS =====
  "serieNFe": "1",
  "serieNFCe": "1",
  "serieNFSe": "A1",
  "ambienteFiscal": "Homologacao",
  
  // ===== CONTROLE INTERNO =====
  "active": true
}
```

**Response 201 (Sucesso)**:

```json
{
  "id": "uuid-da-empresa",
  "razaoSocial": "EMPRESA EXEMPLO LTDA",
  "nomeFantasia": "Empresa Exemplo",
  "cnpj": "12345678000190",
  "inscricaoEstadual": "123456789",
  "inscricaoMunicipal": "987654321",
  "regimeTributario": "Simples Nacional",
  "cnaePrincipal": "6201-5/00",
  "cnaeSecundarios": ["6202-3/00", "6203-1/00"],
  "dataAbertura": "2020-01-15T00:00:00.000Z",
  "situacaoCadastral": "Ativa",
  "logradouro": "Rua das Flores",
  "numero": "123",
  "complemento": "Sala 456",
  "bairro": "Centro",
  "cidade": "São Paulo",
  "estado": "SP",
  "cep": "01310100",
  "pais": "Brasil",
  "telefone": "11987654321",
  "celular": "11912345678",
  "email": "contato@empresa.com.br",
  "site": "https://www.empresa.com.br",
  "tipoContribuinte": "Contribuinte ICMS",
  "regimeApuracao": "Regime Normal",
  "codigoMunicipioIBGE": "3550308",
  "codigoEstadoIBGE": "35",
  "cfopPadrao": "5102",
  "certificadoDigitalPath": "/certificates/empresa.pfx",
  "certificadoDigitalSenha": "senha_certificado",
  "serieNFe": "1",
  "ultimoNumeroNFe": 0,
  "serieNFCe": "1",
  "ultimoNumeroNFCe": 0,
  "serieNFSe": "A1",
  "ultimoNumeroNFSe": 0,
  "ambienteFiscal": "Homologacao",
  "logoUrl": null,
  "logoFileName": null,
  "logoMimeType": null,
  "planoContasId": null,
  "active": true,
  "createdAt": "2025-10-24T12:00:00.000Z",
  "updatedAt": "2025-10-24T12:00:00.000Z"
}
```

**Erros Possíveis**:

```json
// 409 Conflict - CNPJ já existe
{
  "statusCode": 409,
  "message": "CNPJ já cadastrado",
  "error": "Conflict"
}

// 403 Forbidden - Sem permissão
{
  "statusCode": 403,
  "message": "Você não tem permissão para realizar esta ação",
  "error": "Forbidden"
}

// 400 Bad Request - Validação falhou
{
  "statusCode": 400,
  "message": [
    "Razão social é obrigatória",
    "CNPJ deve ter 14 caracteres",
    "CNPJ deve conter apenas números"
  ],
  "error": "Bad Request"
}
```

---

### 2. Listar Todas as Empresas

Lista todas as empresas que o usuário tem acesso.

**Endpoint**: `GET /companies`

**Permissão necessária**: Qualquer usuário autenticado

**Response 200**:

```json
[
  {
    "id": "uuid-empresa-1",
    "razaoSocial": "EMPRESA 1 LTDA",
    "nomeFantasia": "Empresa 1",
    "cnpj": "12345678000190",
    "email": "empresa1@example.com",
    "telefone": "11987654321",
    "cidade": "São Paulo",
    "estado": "SP",
    "active": true,
    "createdAt": "2025-10-24T12:00:00.000Z",
    "updatedAt": "2025-10-24T12:00:00.000Z",
    "_count": {
      "users": 5
    },
    // Se não for SuperAdmin, inclui o papel do usuário nesta empresa
    "userRole": "admin"
  },
  {
    "id": "uuid-empresa-2",
    "razaoSocial": "EMPRESA 2 LTDA",
    "nomeFantasia": "Empresa 2",
    "cnpj": "98765432000110",
    "email": "empresa2@example.com",
    "telefone": "11912345678",
    "cidade": "Rio de Janeiro",
    "estado": "RJ",
    "active": true,
    "createdAt": "2025-10-24T12:00:00.000Z",
    "updatedAt": "2025-10-24T12:00:00.000Z",
    "_count": {
      "users": 3
    },
    "userRole": "manager"
  }
]
```

> **Nota**: 
> - **SuperAdmin** vê todas as empresas do sistema
> - **Usuários comuns** veem apenas as empresas às quais estão vinculados

---

### 3. Buscar Empresa por ID

Retorna todos os detalhes de uma empresa específica, incluindo usuários vinculados.

**Endpoint**: `GET /companies/:id`

**Permissão necessária**: Acesso à empresa (ou SuperAdmin)

**Response 200**:

```json
{
  "id": "uuid-da-empresa",
  "razaoSocial": "EMPRESA EXEMPLO LTDA",
  "nomeFantasia": "Empresa Exemplo",
  "cnpj": "12345678000190",
  "inscricaoEstadual": "123456789",
  "inscricaoMunicipal": "987654321",
  "regimeTributario": "Simples Nacional",
  "cnaePrincipal": "6201-5/00",
  "cnaeSecundarios": ["6202-3/00", "6203-1/00"],
  "dataAbertura": "2020-01-15T00:00:00.000Z",
  "situacaoCadastral": "Ativa",
  "logradouro": "Rua das Flores",
  "numero": "123",
  "complemento": "Sala 456",
  "bairro": "Centro",
  "cidade": "São Paulo",
  "estado": "SP",
  "cep": "01310100",
  "pais": "Brasil",
  "telefone": "11987654321",
  "celular": "11912345678",
  "email": "contato@empresa.com.br",
  "site": "https://www.empresa.com.br",
  "tipoContribuinte": "Contribuinte ICMS",
  "regimeApuracao": "Regime Normal",
  "codigoMunicipioIBGE": "3550308",
  "codigoEstadoIBGE": "35",
  "cfopPadrao": "5102",
  "certificadoDigitalPath": "/certificates/empresa.pfx",
  "certificadoDigitalSenha": "senha_certificado",
  "serieNFe": "1",
  "ultimoNumeroNFe": 150,
  "serieNFCe": "1",
  "ultimoNumeroNFCe": 89,
  "serieNFSe": "A1",
  "ultimoNumeroNFSe": 45,
  "ambienteFiscal": "Producao",
  "logoUrl": "https://cdn.example.com/logos/empresa.png",
  "logoFileName": "logo_empresa.png",
  "logoMimeType": "image/png",
  "planoContasId": "uuid-plano-contas",
  "active": true,
  "createdAt": "2025-10-24T12:00:00.000Z",
  "updatedAt": "2025-10-24T12:00:00.000Z",
  "users": [
    {
      "id": "uuid-user-company-1",
      "userId": "uuid-user-1",
      "companyId": "uuid-da-empresa",
      "roleId": "uuid-role-admin",
      "active": true,
      "user": {
        "id": "uuid-user-1",
        "name": "João Silva",
        "email": "joao@example.com",
        "active": true
      },
      "role": {
        "id": "uuid-role-admin",
        "name": "admin",
        "description": "Administrador da Empresa"
      }
    }
  ]
}
```

**Erros Possíveis**:

```json
// 404 Not Found
{
  "statusCode": 404,
  "message": "Empresa não encontrada",
  "error": "Not Found"
}

// 403 Forbidden
{
  "statusCode": 403,
  "message": "Você não tem acesso a esta empresa",
  "error": "Forbidden"
}
```

---

### 4. Atualizar Empresa

Atualiza os dados de uma empresa existente. Todos os campos são opcionais.

**Endpoint**: `PATCH /companies/:id`

**Permissão necessária**: `companies.update` (ou SuperAdmin)

**Request Body** (todos os campos são opcionais):

```json
{
  "nomeFantasia": "Novo Nome Fantasia",
  "telefone": "11999887766",
  "email": "novo@email.com",
  "logradouro": "Nova Rua",
  "numero": "456",
  "ambienteFiscal": "Producao",
  "active": true
}
```

**Response 200**:

```json
{
  "id": "uuid-da-empresa",
  "razaoSocial": "EMPRESA EXEMPLO LTDA",
  "nomeFantasia": "Novo Nome Fantasia",
  "cnpj": "12345678000190",
  // ... todos os outros campos
  "updatedAt": "2025-10-24T14:30:00.000Z"
}
```

**Erros Possíveis**:

```json
// 404 Not Found
{
  "statusCode": 404,
  "message": "Empresa não encontrada",
  "error": "Not Found"
}

// 403 Forbidden
{
  "statusCode": 403,
  "message": "Você não tem acesso a esta empresa",
  "error": "Forbidden"
}

// 409 Conflict - CNPJ duplicado
{
  "statusCode": 409,
  "message": "CNPJ já cadastrado",
  "error": "Conflict"
}
```

---

### 5. Ativar/Desativar Empresa

Alterna o status ativo/inativo de uma empresa.

**Endpoint**: `PATCH /companies/:id/toggle-active`

**Permissão necessária**: `companies.update` (ou SuperAdmin)

**Response 200**:

```json
{
  "id": "uuid-da-empresa",
  "razaoSocial": "EMPRESA EXEMPLO LTDA",
  "active": false,
  // ... todos os outros campos
  "updatedAt": "2025-10-24T14:30:00.000Z"
}
```

---

### 6. Deletar Empresa

Deleta permanentemente uma empresa do sistema.

**Endpoint**: `DELETE /companies/:id`

**Permissão necessária**: **Apenas SuperAdmin**

**Response 200**:

```json
{
  "id": "uuid-da-empresa",
  "razaoSocial": "EMPRESA EXEMPLO LTDA",
  // ... todos os campos da empresa deletada
}
```

**Erros Possíveis**:

```json
// 403 Forbidden - Não é SuperAdmin
{
  "statusCode": 403,
  "message": "Apenas SuperAdmin pode deletar empresas",
  "error": "Forbidden"
}

// 404 Not Found
{
  "statusCode": 404,
  "message": "Empresa não encontrada",
  "error": "Not Found"
}
```

---

## 📊 Modelos de Dados

### Campos da Empresa

#### ✅ Obrigatórios

| Campo | Tipo | Descrição | Validação |
|-------|------|-----------|-----------|
| `razaoSocial` | `string` | Razão social da empresa | 3-200 caracteres |
| `cnpj` | `string` | CNPJ (apenas números) | 14 dígitos, único |

#### 📝 Opcionais - Dados Cadastrais

| Campo | Tipo | Descrição | Validação |
|-------|------|-----------|-----------|
| `nomeFantasia` | `string` | Nome fantasia | 3-200 caracteres |
| `inscricaoEstadual` | `string` | Inscrição estadual | - |
| `inscricaoMunicipal` | `string` | Inscrição municipal | - |
| `regimeTributario` | `string` | Regime tributário (ex: Simples Nacional, Lucro Real) | - |
| `cnaePrincipal` | `string` | CNAE principal | - |
| `cnaeSecundarios` | `string[]` | CNAEs secundários | Array de strings |
| `dataAbertura` | `string` | Data de abertura (ISO 8601) | Formato: YYYY-MM-DD |
| `situacaoCadastral` | `string` | Situação cadastral | Padrão: "Ativa" |

#### 📍 Opcionais - Endereço

| Campo | Tipo | Descrição | Validação |
|-------|------|-----------|-----------|
| `logradouro` | `string` | Logradouro/Rua | - |
| `numero` | `string` | Número | - |
| `complemento` | `string` | Complemento | - |
| `bairro` | `string` | Bairro | - |
| `cidade` | `string` | Cidade | - |
| `estado` | `string` | UF do estado | 2 caracteres |
| `cep` | `string` | CEP (apenas números) | 8 dígitos |
| `pais` | `string` | País | Padrão: "Brasil" |

#### 📞 Opcionais - Contatos

| Campo | Tipo | Descrição | Validação |
|-------|------|-----------|-----------|
| `telefone` | `string` | Telefone fixo | - |
| `celular` | `string` | Celular | - |
| `email` | `string` | E-mail | Formato de e-mail válido |
| `site` | `string` | Website | URL válida |

#### 💰 Opcionais - Configurações Fiscais

| Campo | Tipo | Descrição | Validação |
|-------|------|-----------|-----------|
| `tipoContribuinte` | `string` | Tipo de contribuinte (ex: Contribuinte ICMS) | - |
| `regimeApuracao` | `string` | Regime de apuração (ex: Regime Normal) | - |
| `codigoMunicipioIBGE` | `string` | Código IBGE do município | 7 dígitos |
| `codigoEstadoIBGE` | `string` | Código IBGE do estado | 2 dígitos |
| `cfopPadrao` | `string` | CFOP padrão | 4 dígitos |

#### 🔐 Opcionais - Certificado Digital

| Campo | Tipo | Descrição | Validação |
|-------|------|-----------|-----------|
| `certificadoDigitalPath` | `string` | Caminho do arquivo do certificado A1 | - |
| `certificadoDigitalSenha` | `string` | Senha do certificado | - |

#### 📄 Opcionais - Notas Fiscais

| Campo | Tipo | Descrição | Validação |
|-------|------|-----------|-----------|
| `serieNFe` | `string` | Série da NF-e | - |
| `ultimoNumeroNFe` | `number` | Último número NF-e emitido | Automático, iniciando em 0 |
| `serieNFCe` | `string` | Série da NFC-e | - |
| `ultimoNumeroNFCe` | `number` | Último número NFC-e emitido | Automático, iniciando em 0 |
| `serieNFSe` | `string` | Série da NFS-e | - |
| `ultimoNumeroNFSe` | `number` | Último número NFS-e emitido | Automático, iniciando em 0 |
| `ambienteFiscal` | `string` | Ambiente fiscal | "Homologacao" ou "Producao" |

#### 🎨 Opcionais - Branding

| Campo | Tipo | Descrição | Validação |
|-------|------|-----------|-----------|
| `logoUrl` | `string` | URL pública do logo | URL válida |
| `logoFileName` | `string` | Nome do arquivo do logo | - |
| `logoMimeType` | `string` | MIME type do logo | Ex: image/png |
| `planoContasId` | `string` | ID do plano de contas | UUID |

#### ⚙️ Controle Interno

| Campo | Tipo | Descrição | Validação |
|-------|------|-----------|-----------|
| `active` | `boolean` | Empresa ativa | Padrão: true |

---

## 💻 Exemplos de Integração

### React/TypeScript

```typescript
// types/company.ts
export interface Company {
  id: string;
  razaoSocial: string;
  nomeFantasia?: string;
  cnpj: string;
  inscricaoEstadual?: string;
  inscricaoMunicipal?: string;
  regimeTributario?: string;
  cnaePrincipal?: string;
  cnaeSecundarios?: string[];
  dataAbertura?: string;
  situacaoCadastral?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  pais?: string;
  telefone?: string;
  celular?: string;
  email?: string;
  site?: string;
  tipoContribuinte?: string;
  regimeApuracao?: string;
  codigoMunicipioIBGE?: string;
  codigoEstadoIBGE?: string;
  cfopPadrao?: string;
  certificadoDigitalPath?: string;
  certificadoDigitalSenha?: string;
  serieNFe?: string;
  ultimoNumeroNFe?: number;
  serieNFCe?: string;
  ultimoNumeroNFCe?: number;
  serieNFSe?: string;
  ultimoNumeroNFSe?: number;
  ambienteFiscal?: string;
  logoUrl?: string;
  logoFileName?: string;
  logoMimeType?: string;
  planoContasId?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCompanyDto {
  razaoSocial: string;
  cnpj: string;
  nomeFantasia?: string;
  // ... outros campos opcionais
}

// services/companyService.ts
import axios from 'axios';
import { Company, CreateCompanyDto } from '../types/company';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const companyService = {
  // Criar nova empresa
  create: async (data: CreateCompanyDto): Promise<Company> => {
    const response = await api.post<Company>('/companies', data);
    return response.data;
  },

  // Listar todas as empresas
  getAll: async (): Promise<Company[]> => {
    const response = await api.get<Company[]>('/companies');
    return response.data;
  },

  // Buscar empresa por ID
  getById: async (id: string): Promise<Company> => {
    const response = await api.get<Company>(`/companies/${id}`);
    return response.data;
  },

  // Atualizar empresa
  update: async (id: string, data: Partial<CreateCompanyDto>): Promise<Company> => {
    const response = await api.patch<Company>(`/companies/${id}`, data);
    return response.data;
  },

  // Ativar/Desativar empresa
  toggleActive: async (id: string): Promise<Company> => {
    const response = await api.patch<Company>(`/companies/${id}/toggle-active`);
    return response.data;
  },

  // Deletar empresa (apenas SuperAdmin)
  delete: async (id: string): Promise<Company> => {
    const response = await api.delete<Company>(`/companies/${id}`);
    return response.data;
  },
};

// hooks/useCompanies.ts
import { useState, useEffect } from 'react';
import { companyService } from '../services/companyService';
import { Company } from '../types/company';

export const useCompanies = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const data = await companyService.getAll();
      setCompanies(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar empresas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  return { companies, loading, error, refetch: loadCompanies };
};

// components/CreateCompanyForm.tsx
import React, { useState } from 'react';
import { companyService } from '../services/companyService';
import { CreateCompanyDto } from '../types/company';

export const CreateCompanyForm: React.FC = () => {
  const [formData, setFormData] = useState<CreateCompanyDto>({
    razaoSocial: '',
    cnpj: '',
    nomeFantasia: '',
    email: '',
    telefone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const company = await companyService.create(formData);
      alert('Empresa criada com sucesso!');
      // Redirecionar ou limpar formulário
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao criar empresa');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Razão Social *</label>
        <input
          type="text"
          value={formData.razaoSocial}
          onChange={(e) => setFormData({ ...formData, razaoSocial: e.target.value })}
          required
        />
      </div>

      <div>
        <label>CNPJ * (apenas números)</label>
        <input
          type="text"
          value={formData.cnpj}
          onChange={(e) => setFormData({ ...formData, cnpj: e.target.value.replace(/\D/g, '') })}
          maxLength={14}
          required
        />
      </div>

      <div>
        <label>Nome Fantasia</label>
        <input
          type="text"
          value={formData.nomeFantasia}
          onChange={(e) => setFormData({ ...formData, nomeFantasia: e.target.value })}
        />
      </div>

      {/* Adicione mais campos conforme necessário */}

      {error && <div className="error">{error}</div>}

      <button type="submit" disabled={loading}>
        {loading ? 'Criando...' : 'Criar Empresa'}
      </button>
    </form>
  );
};
```

### Vue.js/TypeScript

```typescript
// services/companyService.ts
import axios, { AxiosInstance } from 'axios';

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const createCompany = async (data: any) => {
  const response = await api.post('/companies', data);
  return response.data;
};

export const getCompanies = async () => {
  const response = await api.get('/companies');
  return response.data;
};

export const getCompanyById = async (id: string) => {
  const response = await api.get(`/companies/${id}`);
  return response.data;
};

export const updateCompany = async (id: string, data: any) => {
  const response = await api.patch(`/companies/${id}`, data);
  return response.data;
};

export const deleteCompany = async (id: string) => {
  const response = await api.delete(`/companies/${id}`);
  return response.data;
};

// composables/useCompanies.ts
import { ref, onMounted } from 'vue';
import { getCompanies } from '../services/companyService';

export const useCompanies = () => {
  const companies = ref([]);
  const loading = ref(true);
  const error = ref(null);

  const loadCompanies = async () => {
    try {
      loading.value = true;
      companies.value = await getCompanies();
      error.value = null;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao carregar empresas';
    } finally {
      loading.value = false;
    }
  };

  onMounted(() => {
    loadCompanies();
  });

  return { companies, loading, error, refetch: loadCompanies };
};
```

### Angular

```typescript
// services/company.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface Company {
  id: string;
  razaoSocial: string;
  cnpj: string;
  // ... outros campos
}

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private apiUrl = `${environment.apiUrl}/companies`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  create(data: any): Observable<Company> {
    return this.http.post<Company>(this.apiUrl, data, { headers: this.getHeaders() });
  }

  getAll(): Observable<Company[]> {
    return this.http.get<Company[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getById(id: string): Observable<Company> {
    return this.http.get<Company>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  update(id: string, data: any): Observable<Company> {
    return this.http.patch<Company>(`${this.apiUrl}/${id}`, data, { headers: this.getHeaders() });
  }

  delete(id: string): Observable<Company> {
    return this.http.delete<Company>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  toggleActive(id: string): Observable<Company> {
    return this.http.patch<Company>(`${this.apiUrl}/${id}/toggle-active`, {}, { headers: this.getHeaders() });
  }
}
```

---

## ⚠️ Tratamento de Erros

### Códigos de Status HTTP

| Código | Descrição | Quando ocorre |
|--------|-----------|---------------|
| `200` | OK | Operação bem-sucedida (GET, PATCH, DELETE) |
| `201` | Created | Empresa criada com sucesso |
| `400` | Bad Request | Dados de entrada inválidos |
| `401` | Unauthorized | Token JWT inválido ou ausente |
| `403` | Forbidden | Sem permissão para a operação |
| `404` | Not Found | Empresa não encontrada |
| `409` | Conflict | CNPJ já cadastrado |
| `500` | Internal Server Error | Erro no servidor |

### Estrutura de Erro Padrão

```typescript
interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
}
```

### Exemplo de Tratamento de Erros

```typescript
try {
  const company = await companyService.create(formData);
  // Sucesso
} catch (error: any) {
  if (error.response) {
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        // Validação falhou
        if (Array.isArray(data.message)) {
          data.message.forEach((msg: string) => console.error(msg));
        } else {
          console.error(data.message);
        }
        break;
        
      case 401:
        // Não autenticado - redirecionar para login
        window.location.href = '/login';
        break;
        
      case 403:
        // Sem permissão
        alert('Você não tem permissão para realizar esta ação');
        break;
        
      case 409:
        // CNPJ duplicado
        alert('CNPJ já cadastrado no sistema');
        break;
        
      case 404:
        // Empresa não encontrada
        alert('Empresa não encontrada');
        break;
        
      default:
        alert('Erro ao processar requisição');
    }
  } else {
    // Erro de rede
    console.error('Erro de conexão:', error.message);
  }
}
```

---

## 🔒 Permissões

### Estrutura de Permissões

O sistema utiliza permissões baseadas em recursos e ações:

```
{resource}.{action}
```

### Permissões de Empresas

| Permissão | Descrição | Operações Permitidas |
|-----------|-----------|---------------------|
| `companies.create` | Criar empresas | POST /companies |
| `companies.read` | Visualizar empresas | GET /companies, GET /companies/:id |
| `companies.update` | Atualizar empresas | PATCH /companies/:id, PATCH /companies/:id/toggle-active |
| `companies.delete` | Deletar empresas | DELETE /companies/:id |

### SuperAdmin

O **SuperAdmin** é um papel especial que:
- ✅ Sempre tem todas as permissões
- ✅ Pode acessar todas as empresas do sistema
- ✅ Pode deletar empresas
- ✅ Não precisa estar vinculado a uma empresa para acessá-la
- ✅ É baseado em role (`role: 'superadmin'`)

### Verificação de Permissões no Frontend

```typescript
// utils/permissions.ts
export const hasPermission = (userPermissions: string[], required: string): boolean => {
  return userPermissions.includes(required);
};

export const canCreateCompany = (user: any): boolean => {
  return user.isSuperAdmin || hasPermission(user.permissions, 'companies.create');
};

export const canUpdateCompany = (user: any): boolean => {
  return user.isSuperAdmin || hasPermission(user.permissions, 'companies.update');
};

export const canDeleteCompany = (user: any): boolean => {
  return user.isSuperAdmin || hasPermission(user.permissions, 'companies.delete');
};

// Uso em componente
const user = getCurrentUser();

if (canCreateCompany(user)) {
  // Mostrar botão "Nova Empresa"
}

if (canUpdateCompany(user)) {
  // Mostrar botão "Editar"
}

if (canDeleteCompany(user)) {
  // Mostrar botão "Deletar"
}
```

---

## 📝 Notas Importantes

### CNPJ

- Deve conter **apenas números** (sem pontos, barras ou traços)
- Deve ter exatamente **14 caracteres**
- Deve ser **único** no sistema

### Campos Automáticos

Os seguintes campos são gerenciados automaticamente pelo sistema:

- `id`: Gerado como UUID
- `createdAt`: Data/hora de criação
- `updatedAt`: Data/hora da última atualização
- `ultimoNumeroNFe`: Inicializado em 0
- `ultimoNumeroNFCe`: Inicializado em 0
- `ultimoNumeroNFSe`: Inicializado em 0

### Valores Padrão

Se não fornecidos, os seguintes campos recebem valores padrão:

- `active`: `true`
- `situacaoCadastral`: `"Ativa"`
- `pais`: `"Brasil"`

### Hierarquia de Acesso

1. **SuperAdmin**: Acesso total a todas as empresas
2. **Admin/Manager**: Acesso às empresas vinculadas
3. **Sales/Viewer**: Acesso limitado às empresas vinculadas

---

## 🚀 Próximos Passos

Após integrar a API de empresas, você pode:

1. ✅ Implementar upload de logo da empresa
2. ✅ Vincular plano de contas à empresa
3. ✅ Gerenciar usuários por empresa
4. ✅ Implementar módulos de produtos, vendas, financeiro
5. ✅ Integrar com APIs de NF-e, NFC-e, NFS-e

---

## 📞 Suporte

Para dúvidas ou problemas com a API, consulte:

- Documentação completa: `/docs`
- Arquivo de exemplos HTTP: `/api-requests.http`
- Logs do servidor: Terminal de desenvolvimento

---

**Desenvolvido com ❤️ para o ERP Multi-Empresa**
