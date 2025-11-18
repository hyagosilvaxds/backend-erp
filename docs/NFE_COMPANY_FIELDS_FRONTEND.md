# Cadastro de Empresa para Emissão de NFe - Guia Frontend

## 📋 Visão Geral

Para que uma empresa possa **emitir Notas Fiscais Eletrônicas (NFe)**, é necessário que diversos campos estejam corretamente preenchidos no cadastro. Este documento detalha todos os campos obrigatórios e opcionais, com suas validações e exemplos.

---

## 🔴 Campos OBRIGATÓRIOS para Emissão de NFe

### 1. **Dados Cadastrais Básicos**

| Campo | Tipo | Validação | Exemplo |
|-------|------|-----------|---------|
| `razaoSocial` | String | Obrigatório, min 3, max 60 caracteres | "EMPRESA EXEMPLO LTDA" |
| `cnpj` | String | Obrigatório, 14 dígitos, validação CNPJ | "12345678000195" |
| `inscricaoEstadual` | String | Obrigatório* | "123456789" ou "ISENTO" |

> ⚠️ *`inscricaoEstadual` pode ser "ISENTO" para empresas do Simples Nacional que não realizam operações interestaduais.

**Validação Frontend:**
```typescript
// CNPJ
const validateCNPJ = (cnpj: string): boolean => {
  const cleaned = cnpj.replace(/\D/g, '');
  if (cleaned.length !== 14) return false;
  // Implementar validação de dígitos verificadores
  return true;
};

// Inscrição Estadual
const validateIE = (ie: string, uf: string): boolean => {
  if (ie.toUpperCase() === 'ISENTO') return true;
  // Validação varia por UF
  return ieValidators[uf](ie);
};
```

---

### 2. **Endereço Completo**

| Campo | Tipo | Validação | Exemplo |
|-------|------|-----------|---------|
| `logradouro` | String | Obrigatório, max 60 caracteres | "Avenida Paulista" |
| `numero` | String | Obrigatório, max 10 caracteres | "1000" ou "S/N" |
| `bairro` | String | Obrigatório, max 60 caracteres | "Bela Vista" |
| `cidade` | String | Obrigatório, max 60 caracteres | "São Paulo" |
| `estado` | String | Obrigatório, 2 caracteres (UF) | "SP" |
| `cep` | String | Obrigatório, 8 dígitos | "01310100" |
| `complemento` | String | Opcional, max 60 caracteres | "Sala 200" |
| `codigoMunicipioIBGE` | String | Obrigatório, 7 dígitos | "3550308" (São Paulo) |

**Validação Frontend:**
```typescript
// CEP
const validateCEP = (cep: string): boolean => {
  const cleaned = cep.replace(/\D/g, '');
  return cleaned.length === 8;
};

// Estado (UF)
const VALID_UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

// Código IBGE
const validateCodigoMunicipio = (codigo: string): boolean => {
  return /^\d{7}$/.test(codigo);
};
```

**🔍 Buscar Código IBGE:**
```typescript
// API recomendada para buscar código IBGE
const buscarCodigoIBGE = async (cidade: string, uf: string) => {
  const response = await fetch(
    `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`
  );
  const municipios = await response.json();
  const encontrado = municipios.find((m: any) => 
    m.nome.toLowerCase() === cidade.toLowerCase()
  );
  return encontrado?.id; // Código de 7 dígitos
};
```

---

### 3. **Regime Tributário**

| Campo | Tipo | Validação | Exemplo |
|-------|------|-----------|---------|
| `regimeTributario` | String | Obrigatório, enum | "SIMPLES_NACIONAL" |

**Opções válidas:**
```typescript
enum RegimeTributario {
  SIMPLES_NACIONAL = 'SIMPLES_NACIONAL',
  SIMPLES_NACIONAL_EXCESSO = 'SIMPLES_NACIONAL_EXCESSO',
  REGIME_NORMAL = 'REGIME_NORMAL', // Lucro Presumido ou Real
}
```

**Select Frontend:**
```tsx
const REGIME_OPTIONS = [
  { value: 'SIMPLES_NACIONAL', label: '1 - Simples Nacional' },
  { value: 'SIMPLES_NACIONAL_EXCESSO', label: '2 - Simples Nacional - Excesso' },
  { value: 'REGIME_NORMAL', label: '3 - Regime Normal' },
];
```

---

### 4. **Certificado Digital A1**

| Campo | Tipo | Validação | Exemplo |
|-------|------|-----------|---------|
| `certificadoDigitalPath` | String | Obrigatório para produção | "/uploads/certificados/cert.pfx" |
| `certificadoDigitalSenha` | String | Obrigatório para produção | "senha123" (criptografada) |

**⚠️ Importante:**
- Certificado deve ser tipo **A1** (.pfx ou .p12)
- Senha deve ser criptografada antes de enviar ao backend
- Certificado precisa estar válido (verificar data de validade)

**Upload Frontend:**
```tsx
const handleCertificateUpload = async (file: File, password: string) => {
  const formData = new FormData();
  formData.append('certificate', file);
  formData.append('password', password);
  
  const response = await fetch('/api/companies/:id/certificate', {
    method: 'POST',
    body: formData,
  });
  
  return response.json();
};

// Validação
const validateCertificate = (file: File): boolean => {
  const validExtensions = ['.pfx', '.p12'];
  const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
  return validExtensions.includes(extension);
};
```

---

### 5. **Ambiente Fiscal**

| Campo | Tipo | Validação | Exemplo |
|-------|------|-----------|---------|
| `ambienteFiscal` | String | Obrigatório, enum | "HOMOLOGACAO" |

**Opções:**
```typescript
enum AmbienteFiscal {
  HOMOLOGACAO = 'HOMOLOGACAO', // 2 - Testes
  PRODUCAO = 'PRODUCAO',       // 1 - Emissão real
}
```

**⚠️ Validação Importante:**
```typescript
// Não permitir ambiente de produção sem certificado válido
const canUseProduction = (company: Company): boolean => {
  return !!(
    company.certificadoDigitalPath &&
    company.certificadoDigitalSenha &&
    company.inscricaoEstadual
  );
};
```

---

### 6. **Série e Numeração da NFe**

| Campo | Tipo | Validação | Exemplo |
|-------|------|-----------|---------|
| `serieNFe` | String | Obrigatório, numérico, 1-3 dígitos | "1" |
| `ultimoNumeroNFe` | Int | Opcional, auto-incrementado | 0 |

**Validação:**
```typescript
const validateSerie = (serie: string): boolean => {
  const num = parseInt(serie);
  return num >= 1 && num <= 999;
};
```

---

### 7. **CNAE (Atividade Econômica)**

| Campo | Tipo | Validação | Exemplo |
|-------|------|-----------|---------|
| `cnaePrincipal` | String | Obrigatório, 7 dígitos | "4712100" (Comércio varejista) |

**Buscar CNAE:**
```typescript
const buscarCNAE = async (descricao: string) => {
  const response = await fetch(
    `https://servicodados.ibge.gov.br/api/v2/cnae/classes?search=${descricao}`
  );
  return response.json();
};
```

---

## 🟡 Campos RECOMENDADOS

### 1. **Responsável Técnico** (Obrigatório a partir de 2024)

| Campo | Tipo | Validação | Exemplo |
|-------|------|-----------|---------|
| `respTecCNPJ` | String | Obrigatório*, 14 dígitos | "12345678000195" |
| `respTecContato` | String | Obrigatório*, max 60 caracteres | "João Silva" |
| `respTecEmail` | String | Obrigatório*, email válido | "joao@software.com" |
| `respTecFone` | String | Obrigatório*, 10-11 dígitos | "11987654321" |

> ⚠️ *A partir de **01/04/2024**, a SEFAZ exige o preenchimento do Responsável Técnico em todas as NFes.

**Validação:**
```typescript
interface ResponsavelTecnico {
  cnpj: string;    // CNPJ da empresa desenvolvedora do software
  contato: string; // Nome do contato técnico
  email: string;   // Email para contato
  fone: string;    // Telefone no formato: 1187654321
}

const validateResponsavelTecnico = (data: ResponsavelTecnico): boolean => {
  return !!(
    validateCNPJ(data.cnpj) &&
    data.contato.length >= 3 &&
    validateEmail(data.email) &&
    /^\d{10,11}$/.test(data.fone)
  );
};
```

---

### 2. **Contatos**

| Campo | Tipo | Validação | Exemplo |
|-------|------|-----------|---------|
| `email` | String | Recomendado, email válido | "contato@empresa.com.br" |
| `telefone` | String | Opcional, 10 dígitos | "1134567890" |
| `celular` | String | Opcional, 11 dígitos | "11987654321" |

---

### 3. **CFOP Padrão**

| Campo | Tipo | Validação | Exemplo |
|-------|------|-----------|---------|
| `cfopPadrao` | String | Opcional, 4 dígitos | "5102" |

**CFOPs Comuns:**
```typescript
const CFOP_COMUM = [
  { value: '5101', label: '5101 - Venda de produção do estabelecimento' },
  { value: '5102', label: '5102 - Venda de mercadoria adquirida de terceiros' },
  { value: '5405', label: '5405 - Venda de mercadoria adquirida ou recebida de terceiros em operação com mercadoria sujeita ao regime de substituição tributária, na condição de contribuinte substituído' },
  { value: '6101', label: '6101 - Venda de produção do estabelecimento (Interestadual)' },
  { value: '6102', label: '6102 - Venda de mercadoria adquirida de terceiros (Interestadual)' },
];
```

---

## 🟢 Campos OPCIONAIS

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `nomeFantasia` | String | Nome comercial da empresa |
| `inscricaoMunicipal` | String | Para emissão de NFS-e |
| `site` | String | Website da empresa |
| `logoUrl` | String | Logo para exibir na DANFE |
| `dataAbertura` | DateTime | Data de fundação |

---

## 📋 Validação Completa no Frontend

### Formulário de Cadastro/Edição

```tsx
import { z } from 'zod';

const companyNFeSchema = z.object({
  // Dados Básicos
  razaoSocial: z.string().min(3).max(60),
  cnpj: z.string().length(14).refine(validateCNPJ, 'CNPJ inválido'),
  inscricaoEstadual: z.string().min(1, 'Obrigatório'),
  
  // Endereço
  logradouro: z.string().min(3).max(60),
  numero: z.string().min(1).max(10),
  bairro: z.string().min(3).max(60),
  cidade: z.string().min(3).max(60),
  estado: z.enum(VALID_UFS),
  cep: z.string().length(8),
  codigoMunicipioIBGE: z.string().length(7),
  complemento: z.string().max(60).optional(),
  
  // Fiscal
  regimeTributario: z.enum(['SIMPLES_NACIONAL', 'SIMPLES_NACIONAL_EXCESSO', 'REGIME_NORMAL']),
  cnaePrincipal: z.string().length(7),
  
  // NFe
  serieNFe: z.string().min(1).max(3).refine(
    (val) => parseInt(val) >= 1 && parseInt(val) <= 999,
    'Série deve estar entre 1 e 999'
  ),
  ambienteFiscal: z.enum(['HOMOLOGACAO', 'PRODUCAO']),
  
  // Certificado (obrigatório para produção)
  certificadoDigitalPath: z.string().optional(),
  certificadoDigitalSenha: z.string().optional(),
  
  // Responsável Técnico (obrigatório a partir de 2024)
  respTecCNPJ: z.string().length(14).refine(validateCNPJ, 'CNPJ inválido'),
  respTecContato: z.string().min(3).max(60),
  respTecEmail: z.string().email(),
  respTecFone: z.string().regex(/^\d{10,11}$/, 'Telefone inválido'),
  
  // Contatos
  email: z.string().email().optional(),
  telefone: z.string().regex(/^\d{10}$/).optional(),
  celular: z.string().regex(/^\d{11}$/).optional(),
}).refine((data) => {
  // Validação: Produção requer certificado
  if (data.ambienteFiscal === 'PRODUCAO') {
    return !!(data.certificadoDigitalPath && data.certificadoDigitalSenha);
  }
  return true;
}, {
  message: 'Certificado digital obrigatório para ambiente de produção',
  path: ['certificadoDigitalPath'],
});

type CompanyNFeForm = z.infer<typeof companyNFeSchema>;
```

---

## 🎨 Componente de Formulário (Exemplo React)

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

function CompanyNFeForm() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<CompanyNFeForm>({
    resolver: zodResolver(companyNFeSchema),
  });

  const ambienteFiscal = watch('ambienteFiscal');

  const onSubmit = async (data: CompanyNFeForm) => {
    const response = await fetch('/api/companies/:id', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    // ...
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Dados Básicos */}
      <section>
        <h3>Dados Cadastrais</h3>
        
        <Input 
          label="Razão Social" 
          {...register('razaoSocial')}
          error={errors.razaoSocial?.message}
          required
          maxLength={60}
        />
        
        <Input 
          label="CNPJ" 
          {...register('cnpj')}
          error={errors.cnpj?.message}
          mask="99.999.999/9999-99"
          required
        />
        
        <Input 
          label="Inscrição Estadual" 
          {...register('inscricaoEstadual')}
          error={errors.inscricaoEstadual?.message}
          required
          placeholder="Número ou ISENTO"
        />
      </section>

      {/* Endereço */}
      <section>
        <h3>Endereço</h3>
        
        <Input 
          label="CEP" 
          {...register('cep')}
          error={errors.cep?.message}
          mask="99999-999"
          required
          onBlur={buscarEnderecoPorCEP}
        />
        
        <Input 
          label="Logradouro" 
          {...register('logradouro')}
          error={errors.logradouro?.message}
          required
          maxLength={60}
        />
        
        <div className="grid grid-cols-3 gap-4">
          <Input 
            label="Número" 
            {...register('numero')}
            error={errors.numero?.message}
            required
            maxLength={10}
          />
          
          <Input 
            label="Complemento" 
            {...register('complemento')}
            error={errors.complemento?.message}
            maxLength={60}
            className="col-span-2"
          />
        </div>
        
        <Input 
          label="Bairro" 
          {...register('bairro')}
          error={errors.bairro?.message}
          required
          maxLength={60}
        />
        
        <div className="grid grid-cols-3 gap-4">
          <Input 
            label="Cidade" 
            {...register('cidade')}
            error={errors.cidade?.message}
            required
            maxLength={60}
            className="col-span-2"
          />
          
          <Select 
            label="UF" 
            {...register('estado')}
            error={errors.estado?.message}
            options={UF_OPTIONS}
            required
          />
        </div>
        
        <Input 
          label="Código IBGE do Município" 
          {...register('codigoMunicipioIBGE')}
          error={errors.codigoMunicipioIBGE?.message}
          required
          maxLength={7}
          helpText="7 dígitos - Ex: 3550308 para São Paulo"
        />
      </section>

      {/* Configurações Fiscais */}
      <section>
        <h3>Configurações Fiscais</h3>
        
        <Select 
          label="Regime Tributário" 
          {...register('regimeTributario')}
          error={errors.regimeTributario?.message}
          options={REGIME_OPTIONS}
          required
        />
        
        <Input 
          label="CNAE Principal" 
          {...register('cnaePrincipal')}
          error={errors.cnaePrincipal?.message}
          required
          maxLength={7}
          helpText="7 dígitos da atividade econômica"
        />
      </section>

      {/* Configurações de NFe */}
      <section>
        <h3>Configurações de NFe</h3>
        
        <Input 
          label="Série da NFe" 
          {...register('serieNFe')}
          error={errors.serieNFe?.message}
          required
          type="number"
          min={1}
          max={999}
          helpText="Geralmente usa-se série 1"
        />
        
        <Select 
          label="Ambiente Fiscal" 
          {...register('ambienteFiscal')}
          error={errors.ambienteFiscal?.message}
          options={[
            { value: 'HOMOLOGACAO', label: 'Homologação (Testes)' },
            { value: 'PRODUCAO', label: 'Produção (NFe Real)' },
          ]}
          required
        />
        
        {ambienteFiscal === 'PRODUCAO' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
            <p className="text-yellow-800 font-semibold">
              ⚠️ Atenção: Modo Produção
            </p>
            <p className="text-yellow-700 text-sm">
              Certifique-se de ter um certificado digital A1 válido instalado.
              NFes emitidas em produção têm validade jurídica!
            </p>
          </div>
        )}
      </section>

      {/* Certificado Digital */}
      <section>
        <h3>Certificado Digital A1</h3>
        
        <FileUpload 
          label="Certificado (.pfx ou .p12)" 
          accept=".pfx,.p12"
          onChange={handleCertificateUpload}
          required={ambienteFiscal === 'PRODUCAO'}
        />
        
        <Input 
          label="Senha do Certificado" 
          type="password"
          {...register('certificadoDigitalSenha')}
          error={errors.certificadoDigitalSenha?.message}
          required={ambienteFiscal === 'PRODUCAO'}
        />
      </section>

      {/* Responsável Técnico */}
      <section>
        <h3>Responsável Técnico</h3>
        <p className="text-sm text-gray-600 mb-4">
          Obrigatório para emissão de NFe a partir de 01/04/2024
        </p>
        
        <Input 
          label="CNPJ do Responsável Técnico" 
          {...register('respTecCNPJ')}
          error={errors.respTecCNPJ?.message}
          mask="99.999.999/9999-99"
          required
          helpText="CNPJ da empresa desenvolvedora do software"
        />
        
        <Input 
          label="Nome do Contato" 
          {...register('respTecContato')}
          error={errors.respTecContato?.message}
          required
          maxLength={60}
        />
        
        <Input 
          label="Email" 
          type="email"
          {...register('respTecEmail')}
          error={errors.respTecEmail?.message}
          required
        />
        
        <Input 
          label="Telefone" 
          {...register('respTecFone')}
          error={errors.respTecFone?.message}
          mask="(99) 99999-9999"
          required
        />
      </section>

      <Button type="submit">Salvar Configurações</Button>
    </form>
  );
}
```

---

## 🧪 Checklist de Validação Pré-Emissão

Antes de permitir que uma empresa emita NFe, validar:

```typescript
interface ValidationResult {
  canEmitNFe: boolean;
  errors: string[];
  warnings: string[];
}

const validateCompanyForNFe = (company: Company): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Dados básicos
  if (!company.razaoSocial) errors.push('Razão Social não informada');
  if (!company.cnpj || !validateCNPJ(company.cnpj)) errors.push('CNPJ inválido');
  if (!company.inscricaoEstadual) errors.push('Inscrição Estadual não informada');

  // Endereço
  if (!company.logradouro) errors.push('Logradouro não informado');
  if (!company.numero) errors.push('Número do endereço não informado');
  if (!company.bairro) errors.push('Bairro não informado');
  if (!company.cidade) errors.push('Cidade não informada');
  if (!company.estado) errors.push('Estado (UF) não informado');
  if (!company.cep || !validateCEP(company.cep)) errors.push('CEP inválido');
  if (!company.codigoMunicipioIBGE) errors.push('Código IBGE do município não informado');

  // Fiscal
  if (!company.regimeTributario) errors.push('Regime Tributário não informado');
  if (!company.cnaePrincipal) errors.push('CNAE Principal não informado');

  // NFe
  if (!company.serieNFe) errors.push('Série da NFe não informada');
  if (!company.ambienteFiscal) errors.push('Ambiente Fiscal não informado');

  // Certificado (apenas produção)
  if (company.ambienteFiscal === 'PRODUCAO') {
    if (!company.certificadoDigitalPath) errors.push('Certificado Digital não instalado');
    if (!company.certificadoDigitalSenha) errors.push('Senha do Certificado não informada');
  }

  // Responsável Técnico (obrigatório a partir de 2024)
  if (!company.respTecCNPJ) errors.push('CNPJ do Responsável Técnico não informado');
  if (!company.respTecContato) errors.push('Nome do Contato Técnico não informado');
  if (!company.respTecEmail) errors.push('Email do Responsável Técnico não informado');
  if (!company.respTecFone) errors.push('Telefone do Responsável Técnico não informado');

  // Warnings
  if (!company.email) warnings.push('Email da empresa não informado');
  if (!company.telefone && !company.celular) warnings.push('Nenhum telefone informado');

  return {
    canEmitNFe: errors.length === 0,
    errors,
    warnings,
  };
};
```

---

## 🎯 Mensagens de Erro Amigáveis

```tsx
function CompanyNFeStatus({ company }: { company: Company }) {
  const validation = validateCompanyForNFe(company);

  if (validation.canEmitNFe) {
    return (
      <div className="bg-green-50 border border-green-200 rounded p-4">
        <p className="text-green-800 font-semibold flex items-center">
          ✅ Empresa configurada para emitir NFe
        </p>
        {validation.warnings.length > 0 && (
          <div className="mt-2">
            <p className="text-yellow-700 text-sm">Avisos:</p>
            <ul className="list-disc list-inside text-yellow-700 text-sm">
              {validation.warnings.map((w, i) => <li key={i}>{w}</li>)}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded p-4">
      <p className="text-red-800 font-semibold flex items-center">
        ❌ Empresa não pode emitir NFe
      </p>
      <p className="text-red-700 text-sm mt-1">
        Corrija os seguintes problemas:
      </p>
      <ul className="list-disc list-inside text-red-700 text-sm mt-2">
        {validation.errors.map((error, i) => (
          <li key={i}>{error}</li>
        ))}
      </ul>
      <Button 
        onClick={() => navigate('/companies/:id/edit')}
        className="mt-3"
      >
        Completar Cadastro
      </Button>
    </div>
  );
}
```

---

## 📚 Endpoints da API

### GET `/api/companies/:id`
Retorna todos os dados da empresa.

### PUT `/api/companies/:id`
Atualiza os dados da empresa.

**Payload exemplo:**
```json
{
  "razaoSocial": "EMPRESA EXEMPLO LTDA",
  "cnpj": "12345678000195",
  "inscricaoEstadual": "123456789",
  "logradouro": "Avenida Paulista",
  "numero": "1000",
  "bairro": "Bela Vista",
  "cidade": "São Paulo",
  "estado": "SP",
  "cep": "01310100",
  "codigoMunicipioIBGE": "3550308",
  "regimeTributario": "SIMPLES_NACIONAL",
  "cnaePrincipal": "4712100",
  "serieNFe": "1",
  "ambienteFiscal": "HOMOLOGACAO",
  "respTecCNPJ": "12345678000195",
  "respTecContato": "João Silva",
  "respTecEmail": "joao@software.com",
  "respTecFone": "11987654321",
  "email": "contato@empresa.com.br"
}
```

### POST `/api/companies/:id/certificate`
Upload do certificado digital.

**Form Data:**
- `certificate`: File (.pfx ou .p12)
- `password`: String

### GET `/api/companies/:id/nfe-status`
Valida se a empresa pode emitir NFe.

**Resposta:**
```json
{
  "canEmitNFe": true,
  "errors": [],
  "warnings": ["Email da empresa não informado"]
}
```

---

## ✅ Checklist de Implementação Frontend

- [ ] Formulário de cadastro/edição com todos os campos NFe
- [ ] Validação de CNPJ com dígitos verificadores
- [ ] Validação de Inscrição Estadual por UF
- [ ] Busca automática de endereço por CEP (ViaCEP)
- [ ] Busca de código IBGE por cidade/UF
- [ ] Upload de certificado digital (.pfx/.p12)
- [ ] Validação de regime tributário
- [ ] Select de ambiente fiscal (Homologação/Produção)
- [ ] Campos de Responsável Técnico obrigatórios
- [ ] Indicador visual se empresa pode emitir NFe
- [ ] Mensagens de erro amigáveis
- [ ] Tooltip explicativo em cada campo
- [ ] Validação em tempo real (onBlur)
- [ ] Botão "Testar Conexão com SEFAZ" (ambiente homologação)

---

## 🔗 Links Úteis

- **ViaCEP API**: https://viacep.com.br/
- **IBGE Localidades API**: https://servicodados.ibge.gov.br/api/docs/localidades
- **CNAE Consulta**: https://concla.ibge.gov.br/busca-online-cnae.html
- **Tabela de Municípios IBGE**: https://www.ibge.gov.br/explica/codigos-dos-municipios.php
- **Manual NFe**: https://www.nfe.fazenda.gov.br/portal/principal.aspx

---

**🚀 Com esses campos corretamente preenchidos, a empresa estará pronta para emitir NFe!**
