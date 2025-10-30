# 🏢 Gerenciamento de Empresas

## Visão Geral

Este documento descreve como administradores podem **criar**, **editar** e **gerenciar** empresas no sistema ERP multi-empresa.

---

## 📋 Índice

1. [Permissões Necessárias](#permissões-necessárias)
2. [Criar Nova Empresa](#criar-nova-empresa)
3. [Editar Empresa Existente](#editar-empresa-existente)
4. [Listar Empresas](#listar-empresas)
5. [Ativar/Desativar Empresa](#ativardesativar-empresa)
6. [Deletar Empresa](#deletar-empresa)
7. [Exemplos Frontend](#exemplos-frontend)

---

## Permissões Necessárias

### Quem Pode Criar Empresas?

1. **SuperAdmin**: Sempre pode criar empresas (role-based)
2. **Admin**: Tem a permissão `companies.create` e pode criar empresas
3. **Outras Roles**: Podem criar empresas se tiverem a permissão `companies.create` atribuída

### Importante sobre Criação de Empresas

- Para **criar** uma nova empresa, **NÃO é necessário** enviar o header `x-company-id`
- O sistema verifica se o usuário tem a permissão `companies.create` em **qualquer empresa** que ele tenha acesso
- Para **editar/deletar** empresas existentes, o header `x-company-id` é obrigatório

---

## 🆕 Criar Nova Empresa

### Endpoint
```
POST /companies
```

### Headers
```
Authorization: Bearer {token}
```

> 🔍 **Nota**: Para criar empresa, **NÃO é necessário** enviar o header `x-company-id`.

### Campos Obrigatórios

| Campo | Tipo | Validação | Descrição |
|-------|------|-----------|-----------|
| `razaoSocial` | string | 3-200 caracteres | Razão social da empresa |
| `cnpj` | string | 14 dígitos | CNPJ sem formatação (apenas números) |

### Campos Opcionais (Recomendados)

#### 📋 Informações Cadastrais
| Campo | Tipo | Validação | Descrição |
|-------|------|-----------|-----------|
| `nomeFantasia` | string | 3-200 caracteres | Nome fantasia |
| `inscricaoEstadual` | string | - | Inscrição Estadual |
| `inscricaoMunicipal` | string | - | Inscrição Municipal |
| `regimeTributario` | string | - | Ex: "Simples Nacional", "Lucro Presumido", "Lucro Real" |
| `cnaePrincipal` | string | - | CNAE principal |
| `cnaeSecundarios` | string[] | - | Lista de CNAEs secundários |
| `dataAbertura` | string (ISO) | ISO 8601 | Data de abertura da empresa |
| `situacaoCadastral` | string | - | Ex: "Ativa", "Suspensa", "Baixada" |

#### 📍 Endereço
| Campo | Tipo | Validação | Descrição |
|-------|------|-----------|-----------|
| `logradouro` | string | - | Rua, avenida, etc. |
| `numero` | string | - | Número do endereço |
| `complemento` | string | - | Complemento |
| `bairro` | string | - | Bairro |
| `cidade` | string | - | Cidade |
| `estado` | string | 2 caracteres | UF (Ex: "SP", "RJ") |
| `cep` | string | 8 dígitos | CEP sem formatação |
| `pais` | string | - | País (padrão: "Brasil") |

#### 📞 Contatos
| Campo | Tipo | Validação | Descrição |
|-------|------|-----------|-----------|
| `telefone` | string | - | Telefone fixo |
| `celular` | string | - | Celular/WhatsApp |
| `email` | string | Email válido | Email principal |
| `site` | string | URL válida | Website |

#### 💼 Configurações Fiscais
| Campo | Tipo | Validação | Descrição |
|-------|------|-----------|-----------|
| `tipoContribuinte` | string | - | Ex: "ICMS", "Isento", "Não Contribuinte" |
| `regimeApuracao` | string | - | Ex: "Mensal", "Trimestral" |
| `codigoMunicipioIBGE` | string | 7 dígitos | Código IBGE do município |
| `codigoEstadoIBGE` | string | 2 dígitos | Código IBGE do estado |
| `cfopPadrao` | string | 4 dígitos | CFOP padrão (Ex: "5102") |

#### 🔐 Certificado Digital
| Campo | Tipo | Validação | Descrição |
|-------|------|-----------|-----------|
| `certificadoDigitalPath` | string | - | Caminho do certificado A1 |
| `certificadoDigitalSenha` | string | - | Senha do certificado |

#### 📄 Numeração de Notas Fiscais
| Campo | Tipo | Validação | Descrição |
|-------|------|-----------|-----------|
| `serieNFe` | string | - | Série da NF-e (Ex: "1") |
| `serieNFCe` | string | - | Série da NFC-e (Ex: "1") |
| `serieNFSe` | string | - | Série da NFS-e (Ex: "1") |
| `ambienteFiscal` | string | - | "Homologacao" ou "Producao" |

#### ⚙️ Outros
| Campo | Tipo | Validação | Descrição |
|-------|------|-----------|-----------|
| `active` | boolean | - | Se a empresa está ativa (padrão: true) |
| `logoUrl` | string | URL válida | URL do logo da empresa |
| `logoFileName` | string | - | Nome do arquivo do logo |
| `logoMimeType` | string | - | Tipo MIME (Ex: "image/png") |
| `planoContasId` | string | UUID | ID do plano de contas vinculado |

### Request Body - Exemplo Mínimo

```json
{
  "razaoSocial": "Minha Empresa LTDA",
  "cnpj": "12345678000190"
}
```

### Request Body - Exemplo Completo

```json
{
  "razaoSocial": "Tech Solutions Informática LTDA",
  "nomeFantasia": "Tech Solutions",
  "cnpj": "12345678000190",
  "inscricaoEstadual": "123456789",
  "inscricaoMunicipal": "987654321",
  "regimeTributario": "Simples Nacional",
  "cnaePrincipal": "6201-5/00",
  "cnaeSecundarios": ["6202-3/00", "6209-1/00"],
  "dataAbertura": "2020-01-15T00:00:00.000Z",
  "situacaoCadastral": "Ativa",
  
  "logradouro": "Rua das Flores",
  "numero": "123",
  "complemento": "Sala 45",
  "bairro": "Centro",
  "cidade": "São Paulo",
  "estado": "SP",
  "cep": "01310100",
  "pais": "Brasil",
  
  "telefone": "11-3456-7890",
  "celular": "11-98765-4321",
  "email": "contato@techsolutions.com.br",
  "site": "https://www.techsolutions.com.br",
  
  "tipoContribuinte": "ICMS",
  "regimeApuracao": "Mensal",
  "codigoMunicipioIBGE": "3550308",
  "codigoEstadoIBGE": "35",
  "cfopPadrao": "5102",
  
  "certificadoDigitalPath": "/certificates/empresa-cert.pfx",
  "certificadoDigitalSenha": "senha_certificado",
  
  "serieNFe": "1",
  "serieNFCe": "1",
  "serieNFSe": "A",
  "ambienteFiscal": "Homologacao",
  
  "active": true
}
```

### Response (201 Created)

```json
{
  "id": "uuid-da-empresa",
  "razaoSocial": "Tech Solutions Informática LTDA",
  "nomeFantasia": "Tech Solutions",
  "cnpj": "12345678000190",
  "inscricaoEstadual": "123456789",
  "inscricaoMunicipal": "987654321",
  "regimeTributario": "Simples Nacional",
  "cnaePrincipal": "6201-5/00",
  "cnaeSecundarios": ["6202-3/00", "6209-1/00"],
  "dataAbertura": "2020-01-15T00:00:00.000Z",
  "situacaoCadastral": "Ativa",
  "logradouro": "Rua das Flores",
  "numero": "123",
  "complemento": "Sala 45",
  "bairro": "Centro",
  "cidade": "São Paulo",
  "estado": "SP",
  "cep": "01310100",
  "pais": "Brasil",
  "telefone": "11-3456-7890",
  "celular": "11-98765-4321",
  "email": "contato@techsolutions.com.br",
  "site": "https://www.techsolutions.com.br",
  "tipoContribuinte": "ICMS",
  "regimeApuracao": "Mensal",
  "codigoMunicipioIBGE": "3550308",
  "codigoEstadoIBGE": "35",
  "cfopPadrao": "5102",
  "certificadoDigitalPath": "/certificates/empresa-cert.pfx",
  "certificadoDigitalSenha": "senha_certificado",
  "serieNFe": "1",
  "ultimoNumeroNFe": 0,
  "serieNFCe": "1",
  "ultimoNumeroNFCe": 0,
  "serieNFSe": "A",
  "ultimoNumeroNFSe": 0,
  "ambienteFiscal": "Homologacao",
  "logoUrl": null,
  "logoFileName": null,
  "logoMimeType": null,
  "planoContasId": null,
  "active": true,
  "createdAt": "2025-10-25T10:00:00.000Z",
  "updatedAt": "2025-10-25T10:00:00.000Z"
}
```

### Erros Possíveis

```json
// 400 - Validação
{
  "statusCode": 400,
  "message": [
    "Razão social é obrigatória",
    "CNPJ deve ter 14 caracteres",
    "CNPJ deve conter apenas números"
  ],
  "error": "Bad Request"
}

// 400 - CNPJ duplicado
{
  "statusCode": 400,
  "message": "CNPJ já cadastrado"
}

// 403 - Sem permissão
{
  "statusCode": 403,
  "message": "Usuário não tem permissão para executar esta ação"
}
```

---

## ✏️ Editar Empresa Existente

### Endpoint
```
PATCH /companies/{id}
```

### Headers
```
Authorization: Bearer {token}
```

> 🔍 **Nota**: Para editar empresa, **NÃO é necessário** enviar o header `x-company-id`.

### Request Body

Todos os campos são opcionais. Envie apenas os campos que deseja atualizar.

```json
{
  "nomeFantasia": "Tech Solutions Premium",
  "email": "comercial@techsolutions.com.br",
  "telefone": "11-3456-7899",
  "ambienteFiscal": "Producao"
}
```

### Response (200 OK)

```json
{
  "id": "uuid-da-empresa",
  "razaoSocial": "Tech Solutions Informática LTDA",
  "nomeFantasia": "Tech Solutions Premium",
  "cnpj": "12345678000190",
  // ... demais campos atualizados
}
```

### Erros Possíveis

```json
// 400 - CNPJ duplicado (se tentar alterar)
{
  "statusCode": 400,
  "message": "CNPJ já cadastrado em outra empresa"
}

// 403 - Sem permissão
{
  "statusCode": 403,
  "message": "Usuário não tem permissão para executar esta ação"
}

// 404 - Empresa não encontrada
{
  "statusCode": 404,
  "message": "Empresa não encontrada"
}
```

---

## 📋 Listar Empresas

### Endpoint
```
GET /companies
```

### Headers
```
Authorization: Bearer {token}
```

### Comportamento

- **SuperAdmin**: Retorna todas as empresas do sistema
- **Outros usuários**: Retorna apenas empresas às quais o usuário tem acesso

### Response (200 OK)

```json
[
  {
    "id": "uuid-empresa-1",
    "razaoSocial": "Empresa Alpha LTDA",
    "nomeFantasia": "Alpha",
    "cnpj": "11222333000144",
    "active": true,
    "createdAt": "2025-10-24T10:00:00.000Z",
    "updatedAt": "2025-10-24T10:00:00.000Z"
  },
  {
    "id": "uuid-empresa-2",
    "razaoSocial": "Empresa Beta LTDA",
    "nomeFantasia": "Beta",
    "cnpj": "55666777000188",
    "active": true,
    "createdAt": "2025-10-24T10:00:00.000Z",
    "updatedAt": "2025-10-24T10:00:00.000Z"
  }
]
```

---

## 🔄 Ativar/Desativar Empresa

### Endpoint
```
PATCH /companies/{id}/toggle-active
```

### Headers
```
Authorization: Bearer {token}
```

### Permissão Necessária
`companies.update`

### Response (200 OK)

```json
{
  "id": "uuid-da-empresa",
  "razaoSocial": "Tech Solutions Informática LTDA",
  "active": false,
  // ... demais campos
}
```

---

## 🗑️ Deletar Empresa

### Endpoint
```
DELETE /companies/{id}
```

### Headers
```
Authorization: Bearer {token}
```

### Permissão Necessária
`companies.delete`

> ⚠️ **ATENÇÃO**: Esta operação é irreversível e deve ser usada com cuidado.

### Response (200 OK)

```json
{
  "message": "Empresa deletada com sucesso"
}
```

---

## 💻 Exemplos Frontend

### React + TypeScript

#### 1. Serviço de Empresas

```typescript
// src/services/companies.service.ts
import api from './api';

export interface CreateCompanyData {
  razaoSocial: string;
  cnpj: string;
  nomeFantasia?: string;
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
  serieNFCe?: string;
  serieNFSe?: string;
  ambienteFiscal?: string;
  active?: boolean;
}

export interface Company extends CreateCompanyData {
  id: string;
  ultimoNumeroNFe: number;
  ultimoNumeroNFCe: number;
  ultimoNumeroNFSe: number;
  logoUrl?: string;
  logoFileName?: string;
  logoMimeType?: string;
  planoContasId?: string;
  createdAt: string;
  updatedAt: string;
}

class CompaniesService {
  async create(data: CreateCompanyData): Promise<Company> {
    const { data: company } = await api.post<Company>('/companies', data);
    return company;
  }

  async update(id: string, data: Partial<CreateCompanyData>): Promise<Company> {
    const { data: company } = await api.patch<Company>(`/companies/${id}`, data);
    return company;
  }

  async findAll(): Promise<Company[]> {
    const { data } = await api.get<Company[]>('/companies');
    return data;
  }

  async findOne(id: string): Promise<Company> {
    const { data } = await api.get<Company>(`/companies/${id}`);
    return data;
  }

  async toggleActive(id: string): Promise<Company> {
    const { data } = await api.patch<Company>(`/companies/${id}/toggle-active`);
    return data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/companies/${id}`);
  }
}

export default new CompaniesService();
```

#### 2. Formulário de Criação

```typescript
// src/components/CreateCompanyForm.tsx
import React, { useState } from 'react';
import companiesService, { CreateCompanyData } from '../services/companies.service';
import { useAuth } from '../contexts/AuthContext';

export const CreateCompanyForm: React.FC = () => {
  const { hasPermission } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Dados básicos
  const [razaoSocial, setRazaoSocial] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [nomeFantasia, setNomeFantasia] = useState('');
  const [inscricaoEstadual, setInscricaoEstadual] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  
  // Endereço
  const [cep, setCep] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');

  if (!hasPermission('companies.create')) {
    return <div>Você não tem permissão para criar empresas.</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const data: CreateCompanyData = {
        razaoSocial,
        cnpj: cnpj.replace(/\D/g, ''), // Remove formatação
        nomeFantasia: nomeFantasia || undefined,
        inscricaoEstadual: inscricaoEstadual || undefined,
        email: email || undefined,
        telefone: telefone || undefined,
        cep: cep ? cep.replace(/\D/g, '') : undefined,
        logradouro: logradouro || undefined,
        numero: numero || undefined,
        bairro: bairro || undefined,
        cidade: cidade || undefined,
        estado: estado || undefined,
      };

      await companiesService.create(data);
      setSuccess(true);
      
      // Limpar formulário
      setRazaoSocial('');
      setCnpj('');
      setNomeFantasia('');
      setInscricaoEstadual('');
      setEmail('');
      setTelefone('');
      setCep('');
      setLogradouro('');
      setNumero('');
      setBairro('');
      setCidade('');
      setEstado('');

    } catch (err: any) {
      const message = err.response?.data?.message;
      setError(Array.isArray(message) ? message.join(', ') : message || 'Erro ao criar empresa');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="create-company-form">
      <h2>Cadastrar Nova Empresa</h2>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">Empresa criada com sucesso!</div>}

      {/* Dados básicos */}
      <section>
        <h3>Dados Cadastrais</h3>
        
        <div className="form-group">
          <label>Razão Social *</label>
          <input
            type="text"
            value={razaoSocial}
            onChange={(e) => setRazaoSocial(e.target.value)}
            required
            minLength={3}
            maxLength={200}
          />
        </div>

        <div className="form-group">
          <label>CNPJ * (apenas números)</label>
          <input
            type="text"
            value={cnpj}
            onChange={(e) => setCnpj(e.target.value)}
            required
            pattern="\d{14}"
            placeholder="12345678000190"
            maxLength={18}
          />
          <small>Informe apenas os 14 dígitos</small>
        </div>

        <div className="form-group">
          <label>Nome Fantasia</label>
          <input
            type="text"
            value={nomeFantasia}
            onChange={(e) => setNomeFantasia(e.target.value)}
            maxLength={200}
          />
        </div>

        <div className="form-group">
          <label>Inscrição Estadual</label>
          <input
            type="text"
            value={inscricaoEstadual}
            onChange={(e) => setInscricaoEstadual(e.target.value)}
          />
        </div>
      </section>

      {/* Contatos */}
      <section>
        <h3>Contatos</h3>
        
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Telefone</label>
          <input
            type="text"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
          />
        </div>
      </section>

      {/* Endereço */}
      <section>
        <h3>Endereço</h3>
        
        <div className="form-group">
          <label>CEP</label>
          <input
            type="text"
            value={cep}
            onChange={(e) => setCep(e.target.value)}
            pattern="\d{8}"
            maxLength={9}
            placeholder="01310100"
          />
        </div>

        <div className="form-group">
          <label>Logradouro</label>
          <input
            type="text"
            value={logradouro}
            onChange={(e) => setLogradouro(e.target.value)}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Número</label>
            <input
              type="text"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Bairro</label>
            <input
              type="text"
              value={bairro}
              onChange={(e) => setBairro(e.target.value)}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Cidade</label>
            <input
              type="text"
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Estado (UF)</label>
            <input
              type="text"
              value={estado}
              onChange={(e) => setEstado(e.target.value.toUpperCase())}
              maxLength={2}
              placeholder="SP"
            />
          </div>
        </div>
      </section>

      <button type="submit" disabled={loading}>
        {loading ? 'Criando...' : 'Criar Empresa'}
      </button>
    </form>
  );
};
```

#### 3. Lista de Empresas

```typescript
// src/pages/Companies.tsx
import React, { useEffect, useState } from 'react';
import companiesService, { Company } from '../services/companies.service';
import { useAuth } from '../contexts/AuthContext';
import { PermissionGate } from '../components/PermissionGate';

export const Companies: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const { hasPermission } = useAuth();

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      const data = await companiesService.findAll();
      setCompanies(data);
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      await companiesService.toggleActive(id);
      loadCompanies(); // Recarregar lista
    } catch (error) {
      console.error('Erro ao ativar/desativar empresa:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar esta empresa?')) return;

    try {
      await companiesService.delete(id);
      loadCompanies(); // Recarregar lista
    } catch (error) {
      console.error('Erro ao deletar empresa:', error);
    }
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="companies-page">
      <div className="header">
        <h1>Empresas</h1>
        
        <PermissionGate permissions={['companies.create']}>
          <button onClick={() => {/* abrir modal de criar */}}>
            Nova Empresa
          </button>
        </PermissionGate>
      </div>

      <table>
        <thead>
          <tr>
            <th>Razão Social</th>
            <th>Nome Fantasia</th>
            <th>CNPJ</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {companies.map((company) => (
            <tr key={company.id}>
              <td>{company.razaoSocial}</td>
              <td>{company.nomeFantasia || '-'}</td>
              <td>{formatCnpj(company.cnpj)}</td>
              <td>
                <span className={`badge ${company.active ? 'success' : 'danger'}`}>
                  {company.active ? 'Ativa' : 'Inativa'}
                </span>
              </td>
              <td>
                <PermissionGate permissions={['companies.update']}>
                  <button onClick={() => {/* editar */}}>Editar</button>
                  <button onClick={() => handleToggleActive(company.id)}>
                    {company.active ? 'Desativar' : 'Ativar'}
                  </button>
                </PermissionGate>
                
                <PermissionGate permissions={['companies.delete']}>
                  <button onClick={() => handleDelete(company.id)}>Deletar</button>
                </PermissionGate>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

function formatCnpj(cnpj: string): string {
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}
```

---

## 📝 Validações Importantes

### CNPJ
- Deve ter **exatamente 14 dígitos**
- Deve conter **apenas números** (sem pontos, barras ou hífens)
- Deve ser **único** no sistema

### CEP
- Deve ter **8 dígitos**
- Apenas números

### UF (Estado)
- Deve ter **2 caracteres**
- Ex: "SP", "RJ", "MG"

### Códigos IBGE
- **Município**: 7 dígitos
- **Estado**: 2 dígitos

### CFOP
- Deve ter **4 dígitos**

### Email
- Deve ser um email válido

### URL
- Deve ser uma URL válida (site, logoUrl)

---

## 🎯 Resumo Rápido

### Para Criar Empresa:
1. Fazer login e obter token
2. Ter permissão `companies.create` ou ser SuperAdmin
3. **NÃO enviar** header `x-company-id`
4. Enviar POST para `/companies` com `razaoSocial` e `cnpj` (mínimo)

### Para Editar Empresa:
1. Ter permissão `companies.update` ou ser SuperAdmin
2. **NÃO enviar** header `x-company-id`
3. Enviar PATCH para `/companies/{id}` com campos a atualizar

### Para Listar Empresas:
1. Ter permissão `companies.read` ou ser SuperAdmin
2. **NÃO enviar** header `x-company-id`
3. Enviar GET para `/companies`

---

## 🔗 Links Relacionados

- [Documentação de Autenticação](../AUTHENTICATION_DOCS.md)
- [Campos Fiscais da Empresa](./COMPANY_FIELDS.md)
- [Configurações Fiscais](./FISCAL_CONFIG.md)
- [Logo e Plano de Contas](./LOGO_AND_PLANO_CONTAS.md)

---

**Última atualização**: 25 de outubro de 2025
