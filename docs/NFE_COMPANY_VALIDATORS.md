# Validadores para Campos de Empresa NFe

## 📦 Biblioteca de Validação Completa

```typescript
// utils/validators/company-nfe.ts

/**
 * Valida CNPJ com dígitos verificadores
 */
export function validateCNPJ(cnpj: string): boolean {
  const cleaned = cnpj.replace(/\D/g, '');
  
  if (cleaned.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cleaned)) return false; // Todos iguais
  
  // Validar primeiro dígito
  let soma = 0;
  let peso = 5;
  for (let i = 0; i < 12; i++) {
    soma += parseInt(cleaned[i]) * peso;
    peso = peso === 2 ? 9 : peso - 1;
  }
  let digito1 = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  
  if (parseInt(cleaned[12]) !== digito1) return false;
  
  // Validar segundo dígito
  soma = 0;
  peso = 6;
  for (let i = 0; i < 13; i++) {
    soma += parseInt(cleaned[i]) * peso;
    peso = peso === 2 ? 9 : peso - 1;
  }
  let digito2 = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  
  return parseInt(cleaned[13]) === digito2;
}

/**
 * Valida CEP
 */
export function validateCEP(cep: string): boolean {
  const cleaned = cep.replace(/\D/g, '');
  return cleaned.length === 8 && /^\d{8}$/.test(cleaned);
}

/**
 * Valida código IBGE de município (7 dígitos)
 */
export function validateCodigoIBGE(codigo: string): boolean {
  return /^\d{7}$/.test(codigo);
}

/**
 * Valida UF (Estado)
 */
export function validateUF(uf: string): boolean {
  const validUFs = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
    'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
    'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];
  return validUFs.includes(uf.toUpperCase());
}

/**
 * Valida CNAE (7 dígitos)
 */
export function validateCNAE(cnae: string): boolean {
  const cleaned = cnae.replace(/\D/g, '');
  return cleaned.length === 7;
}

/**
 * Valida série da NFe (1-999)
 */
export function validateSerie(serie: string): boolean {
  const num = parseInt(serie);
  return !isNaN(num) && num >= 1 && num <= 999;
}

/**
 * Valida email
 */
export function validateEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Valida telefone (10 dígitos: fixo ou 11 dígitos: celular)
 */
export function validatePhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 10 || cleaned.length === 11;
}

/**
 * Valida Inscrição Estadual por UF
 * Simplificado - implementar validação específica por estado
 */
export function validateInscricaoEstadual(ie: string, uf: string): boolean {
  const cleaned = ie.replace(/\D/g, '');
  
  // Permite "ISENTO"
  if (ie.toUpperCase() === 'ISENTO') return true;
  
  // Validação básica - deve ter entre 8 e 14 dígitos
  if (cleaned.length < 8 || cleaned.length > 14) return false;
  
  // TODO: Implementar validação específica por UF
  // Cada estado tem sua própria regra de validação
  
  return true;
}

/**
 * Valida extensão de arquivo de certificado
 */
export function validateCertificateFile(fileName: string): boolean {
  const validExtensions = ['.pfx', '.p12'];
  const extension = fileName.slice(fileName.lastIndexOf('.')).toLowerCase();
  return validExtensions.includes(extension);
}

/**
 * Valida regime tributário
 */
export function validateRegimeTributario(regime: string): boolean {
  const validRegimes = ['SIMPLES_NACIONAL', 'SIMPLES_NACIONAL_EXCESSO', 'REGIME_NORMAL'];
  return validRegimes.includes(regime);
}

/**
 * Valida ambiente fiscal
 */
export function validateAmbienteFiscal(ambiente: string): boolean {
  return ['HOMOLOGACAO', 'PRODUCAO'].includes(ambiente);
}
```

---

## 🔍 Validação de Inscrição Estadual por UF

```typescript
// utils/validators/ie-validators.ts

/**
 * Validadores específicos de IE por UF
 * Fonte: https://www.sintegra.gov.br/
 */

const ieValidators: Record<string, (ie: string) => boolean> = {
  SP: (ie: string) => {
    const cleaned = ie.replace(/\D/g, '');
    if (cleaned.length !== 12) return false;
    
    // Validação específica de SP
    // TODO: Implementar algoritmo completo
    return /^\d{12}$/.test(cleaned);
  },
  
  RJ: (ie: string) => {
    const cleaned = ie.replace(/\D/g, '');
    if (cleaned.length !== 8) return false;
    return /^\d{8}$/.test(cleaned);
  },
  
  MG: (ie: string) => {
    const cleaned = ie.replace(/\D/g, '');
    if (cleaned.length !== 13) return false;
    return /^\d{13}$/.test(cleaned);
  },
  
  // Adicionar outros estados conforme necessário
  // Para simplificar, validar apenas o formato básico
};

export function validateIEByUF(ie: string, uf: string): boolean {
  if (ie.toUpperCase() === 'ISENTO') return true;
  
  const validator = ieValidators[uf];
  if (validator) {
    return validator(ie);
  }
  
  // Validação genérica para UFs não implementadas
  const cleaned = ie.replace(/\D/g, '');
  return cleaned.length >= 8 && cleaned.length <= 14;
}
```

---

## 🌐 Busca de Dados Externos

```typescript
// utils/api/external-apis.ts

/**
 * Busca endereço por CEP usando ViaCEP
 */
export async function buscarEnderecoPorCEP(cep: string) {
  const cleaned = cep.replace(/\D/g, '');
  
  if (cleaned.length !== 8) {
    throw new Error('CEP inválido');
  }
  
  const response = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`);
  
  if (!response.ok) {
    throw new Error('Erro ao buscar CEP');
  }
  
  const data = await response.json();
  
  if (data.erro) {
    throw new Error('CEP não encontrado');
  }
  
  return {
    logradouro: data.logradouro,
    bairro: data.bairro,
    cidade: data.localidade,
    estado: data.uf,
    cep: cleaned,
  };
}

/**
 * Busca código IBGE por cidade e UF
 */
export async function buscarCodigoIBGE(cidade: string, uf: string) {
  const response = await fetch(
    `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`
  );
  
  if (!response.ok) {
    throw new Error('Erro ao buscar municípios');
  }
  
  const municipios = await response.json();
  
  const encontrado = municipios.find((m: any) =>
    m.nome.toLowerCase() === cidade.toLowerCase()
  );
  
  if (!encontrado) {
    throw new Error(`Município ${cidade}/${uf} não encontrado`);
  }
  
  return String(encontrado.id); // Código de 7 dígitos
}

/**
 * Busca CNAEs por descrição
 */
export async function buscarCNAE(descricao: string) {
  const response = await fetch(
    `https://servicodados.ibge.gov.br/api/v2/cnae/classes`
  );
  
  if (!response.ok) {
    throw new Error('Erro ao buscar CNAEs');
  }
  
  const cnaes = await response.json();
  
  // Filtrar por descrição
  return cnaes.filter((cnae: any) =>
    cnae.descricao.toLowerCase().includes(descricao.toLowerCase())
  ).map((cnae: any) => ({
    codigo: cnae.id,
    descricao: cnae.descricao,
  }));
}

/**
 * Lista todos os municípios de uma UF
 */
export async function listarMunicipiosPorUF(uf: string) {
  const response = await fetch(
    `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`
  );
  
  if (!response.ok) {
    throw new Error('Erro ao buscar municípios');
  }
  
  const municipios = await response.json();
  
  return municipios.map((m: any) => ({
    id: String(m.id),
    nome: m.nome,
  }));
}
```

---

## ✅ Validação Completa da Empresa

```typescript
// utils/validators/company-nfe-validator.ts

import { validateCNPJ, validateCEP, validateCodigoIBGE, validateUF, validateCNAE, validateSerie, validateEmail, validatePhone, validateRegimeTributario, validateAmbienteFiscal } from './company-nfe';
import { validateIEByUF } from './ie-validators';

export interface CompanyValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
}

export interface Company {
  razaoSocial?: string;
  cnpj?: string;
  inscricaoEstadual?: string;
  logradouro?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  codigoMunicipioIBGE?: string;
  regimeTributario?: string;
  cnaePrincipal?: string;
  serieNFe?: string;
  ambienteFiscal?: string;
  certificadoDigitalPath?: string;
  certificadoDigitalSenha?: string;
  respTecCNPJ?: string;
  respTecContato?: string;
  respTecEmail?: string;
  respTecFone?: string;
  email?: string;
  telefone?: string;
  celular?: string;
}

/**
 * Valida todos os campos obrigatórios para emissão de NFe
 */
export function validateCompanyForNFe(company: Company): CompanyValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Dados Básicos
  if (!company.razaoSocial || company.razaoSocial.length < 3) {
    errors.push({ field: 'razaoSocial', message: 'Razão Social obrigatória (mínimo 3 caracteres)' });
  }

  if (!company.cnpj) {
    errors.push({ field: 'cnpj', message: 'CNPJ obrigatório' });
  } else if (!validateCNPJ(company.cnpj)) {
    errors.push({ field: 'cnpj', message: 'CNPJ inválido' });
  }

  if (!company.inscricaoEstadual) {
    errors.push({ field: 'inscricaoEstadual', message: 'Inscrição Estadual obrigatória' });
  } else if (company.estado && !validateIEByUF(company.inscricaoEstadual, company.estado)) {
    errors.push({ field: 'inscricaoEstadual', message: 'Inscrição Estadual inválida para este estado' });
  }

  // Endereço
  if (!company.logradouro) {
    errors.push({ field: 'logradouro', message: 'Logradouro obrigatório' });
  }

  if (!company.numero) {
    errors.push({ field: 'numero', message: 'Número do endereço obrigatório' });
  }

  if (!company.bairro) {
    errors.push({ field: 'bairro', message: 'Bairro obrigatório' });
  }

  if (!company.cidade) {
    errors.push({ field: 'cidade', message: 'Cidade obrigatória' });
  }

  if (!company.estado) {
    errors.push({ field: 'estado', message: 'Estado (UF) obrigatório' });
  } else if (!validateUF(company.estado)) {
    errors.push({ field: 'estado', message: 'Estado inválido' });
  }

  if (!company.cep) {
    errors.push({ field: 'cep', message: 'CEP obrigatório' });
  } else if (!validateCEP(company.cep)) {
    errors.push({ field: 'cep', message: 'CEP inválido (deve ter 8 dígitos)' });
  }

  if (!company.codigoMunicipioIBGE) {
    errors.push({ field: 'codigoMunicipioIBGE', message: 'Código IBGE do município obrigatório' });
  } else if (!validateCodigoIBGE(company.codigoMunicipioIBGE)) {
    errors.push({ field: 'codigoMunicipioIBGE', message: 'Código IBGE inválido (deve ter 7 dígitos)' });
  }

  // Fiscal
  if (!company.regimeTributario) {
    errors.push({ field: 'regimeTributario', message: 'Regime Tributário obrigatório' });
  } else if (!validateRegimeTributario(company.regimeTributario)) {
    errors.push({ field: 'regimeTributario', message: 'Regime Tributário inválido' });
  }

  if (!company.cnaePrincipal) {
    errors.push({ field: 'cnaePrincipal', message: 'CNAE Principal obrigatório' });
  } else if (!validateCNAE(company.cnaePrincipal)) {
    errors.push({ field: 'cnaePrincipal', message: 'CNAE inválido (deve ter 7 dígitos)' });
  }

  // NFe
  if (!company.serieNFe) {
    errors.push({ field: 'serieNFe', message: 'Série da NFe obrigatória' });
  } else if (!validateSerie(company.serieNFe)) {
    errors.push({ field: 'serieNFe', message: 'Série inválida (deve estar entre 1 e 999)' });
  }

  if (!company.ambienteFiscal) {
    errors.push({ field: 'ambienteFiscal', message: 'Ambiente Fiscal obrigatório' });
  } else if (!validateAmbienteFiscal(company.ambienteFiscal)) {
    errors.push({ field: 'ambienteFiscal', message: 'Ambiente Fiscal inválido' });
  }

  // Certificado (apenas em produção)
  if (company.ambienteFiscal === 'PRODUCAO') {
    if (!company.certificadoDigitalPath) {
      errors.push({ field: 'certificadoDigitalPath', message: 'Certificado Digital obrigatório para ambiente de produção' });
    }
    if (!company.certificadoDigitalSenha) {
      errors.push({ field: 'certificadoDigitalSenha', message: 'Senha do Certificado obrigatória para ambiente de produção' });
    }
  }

  // Responsável Técnico (obrigatório desde 2024)
  if (!company.respTecCNPJ) {
    errors.push({ field: 'respTecCNPJ', message: 'CNPJ do Responsável Técnico obrigatório' });
  } else if (!validateCNPJ(company.respTecCNPJ)) {
    errors.push({ field: 'respTecCNPJ', message: 'CNPJ do Responsável Técnico inválido' });
  }

  if (!company.respTecContato || company.respTecContato.length < 3) {
    errors.push({ field: 'respTecContato', message: 'Nome do Contato Técnico obrigatório' });
  }

  if (!company.respTecEmail) {
    errors.push({ field: 'respTecEmail', message: 'Email do Responsável Técnico obrigatório' });
  } else if (!validateEmail(company.respTecEmail)) {
    errors.push({ field: 'respTecEmail', message: 'Email do Responsável Técnico inválido' });
  }

  if (!company.respTecFone) {
    errors.push({ field: 'respTecFone', message: 'Telefone do Responsável Técnico obrigatório' });
  } else if (!validatePhone(company.respTecFone)) {
    errors.push({ field: 'respTecFone', message: 'Telefone do Responsável Técnico inválido' });
  }

  // Warnings (campos recomendados)
  if (!company.email) {
    warnings.push({ field: 'email', message: 'Email da empresa não informado (recomendado)' });
  } else if (!validateEmail(company.email)) {
    warnings.push({ field: 'email', message: 'Email da empresa inválido' });
  }

  if (!company.telefone && !company.celular) {
    warnings.push({ field: 'telefone', message: 'Nenhum telefone informado (recomendado)' });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Valida apenas se pode emitir em homologação
 */
export function canEmitNFeHomologacao(company: Company): boolean {
  const validation = validateCompanyForNFe(company);
  return validation.isValid && company.ambienteFiscal === 'HOMOLOGACAO';
}

/**
 * Valida se pode emitir em produção
 */
export function canEmitNFeProducao(company: Company): boolean {
  const validation = validateCompanyForNFe(company);
  return validation.isValid && 
         company.ambienteFiscal === 'PRODUCAO' &&
         !!company.certificadoDigitalPath &&
         !!company.certificadoDigitalSenha;
}
```

---

## 🎨 Hooks React

```typescript
// hooks/useCompanyNFeValidation.ts

import { useMemo } from 'react';
import { validateCompanyForNFe } from '@/utils/validators/company-nfe-validator';
import type { Company } from '@/types';

export function useCompanyNFeValidation(company: Company | undefined) {
  const validation = useMemo(() => {
    if (!company) {
      return {
        isValid: false,
        errors: [{ field: 'company', message: 'Empresa não carregada' }],
        warnings: [],
      };
    }
    return validateCompanyForNFe(company);
  }, [company]);

  return {
    canEmitNFe: validation.isValid,
    errors: validation.errors,
    warnings: validation.warnings,
    errorCount: validation.errors.length,
    warningCount: validation.warnings.length,
  };
}
```

**Uso:**
```tsx
function CompanyNFeStatus() {
  const { data: company } = useCompany();
  const { canEmitNFe, errors, warnings } = useCompanyNFeValidation(company);

  if (canEmitNFe) {
    return <Badge variant="success">✅ Pronto para NFe</Badge>;
  }

  return (
    <Alert variant="error">
      <p>❌ Empresa não pode emitir NFe</p>
      <ul>
        {errors.map((error, i) => (
          <li key={i}>{error.message}</li>
        ))}
      </ul>
    </Alert>
  );
}
```

---

## 🧪 Testes Unitários

```typescript
// __tests__/validators/company-nfe.test.ts

import { validateCNPJ, validateCEP, validateCodigoIBGE } from '@/utils/validators/company-nfe';

describe('Company NFe Validators', () => {
  describe('validateCNPJ', () => {
    it('should validate correct CNPJ', () => {
      expect(validateCNPJ('11222333000181')).toBe(true);
    });

    it('should reject invalid CNPJ', () => {
      expect(validateCNPJ('11222333000180')).toBe(false);
    });

    it('should reject CNPJ with all same digits', () => {
      expect(validateCNPJ('11111111111111')).toBe(false);
    });

    it('should handle CNPJ with mask', () => {
      expect(validateCNPJ('11.222.333/0001-81')).toBe(true);
    });
  });

  describe('validateCEP', () => {
    it('should validate correct CEP', () => {
      expect(validateCEP('01310100')).toBe(true);
    });

    it('should handle CEP with mask', () => {
      expect(validateCEP('01310-100')).toBe(true);
    });

    it('should reject invalid CEP', () => {
      expect(validateCEP('123')).toBe(false);
    });
  });

  describe('validateCodigoIBGE', () => {
    it('should validate correct code', () => {
      expect(validateCodigoIBGE('3550308')).toBe(true);
    });

    it('should reject invalid code', () => {
      expect(validateCodigoIBGE('12345')).toBe(false);
    });
  });
});
```

---

**🚀 Com esses validadores, o frontend terá validação completa e consistente!**
