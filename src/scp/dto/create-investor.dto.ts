import { IsString, IsEmail, IsOptional, IsBoolean, IsEnum, IsDateString, IsNumber, IsArray, ValidateIf } from 'class-validator';
import { Transform } from 'class-transformer';

export enum InvestorType {
  PESSOA_FISICA = 'PESSOA_FISICA',
  PESSOA_JURIDICA = 'PESSOA_JURIDICA',
}

export enum Gender {
  MASCULINO = 'MASCULINO',
  FEMININO = 'FEMININO',
  OUTRO = 'OUTRO',
}

export enum MaritalStatus {
  SOLTEIRO = 'SOLTEIRO',
  CASADO = 'CASADO',
  DIVORCIADO = 'DIVORCIADO',
  VIUVO = 'VIUVO',
  UNIAO_ESTAVEL = 'UNIAO_ESTAVEL',
}

export enum AddressType {
  RESIDENCIAL = 'RESIDENCIAL',
  COMERCIAL = 'COMERCIAL',
}

export enum AccountType {
  CORRENTE = 'CORRENTE',
  POUPANCA = 'POUPANCA',
  SALARIO = 'SALARIO',
}

export enum PixKeyType {
  CPF = 'CPF',
  CNPJ = 'CNPJ',
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
  RANDOM = 'RANDOM',
}

export enum InvestorProfile {
  CONSERVADOR = 'CONSERVADOR',
  MODERADO = 'MODERADO',
  ARROJADO = 'ARROJADO',
}

export enum InvestorStatus {
  ATIVO = 'ATIVO',
  INATIVO = 'INATIVO',
  SUSPENSO = 'SUSPENSO',
  BLOQUEADO = 'BLOQUEADO',
}

export class CreateInvestorDto {
  @IsEnum(InvestorType)
  type: InvestorType;

  // ========== DADOS PESSOA FÍSICA ==========
  @ValidateIf((o) => o.type === InvestorType.PESSOA_FISICA)
  @IsString()
  fullName?: string;

  @ValidateIf((o) => o.type === InvestorType.PESSOA_FISICA)
  @IsString()
  cpf?: string;

  @IsString()
  @IsOptional()
  rg?: string;

  @IsString()
  @IsOptional()
  rgIssuer?: string;

  @IsDateString()
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return value;
    // Se já está em formato ISO completo, retorna
    if (value.includes('T')) return value;
    // Se está em formato YYYY-MM-DD, adiciona hora
    return `${value}T00:00:00.000Z`;
  })
  birthDate?: string;

  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @IsEnum(MaritalStatus)
  @IsOptional()
  maritalStatus?: MaritalStatus;

  @IsString()
  @IsOptional()
  nationality?: string;

  @IsString()
  @IsOptional()
  profession?: string;

  @IsString()
  @IsOptional()
  motherName?: string;

  @IsString()
  @IsOptional()
  fatherName?: string;

  // ========== DADOS PESSOA JURÍDICA ==========
  @ValidateIf((o) => o.type === InvestorType.PESSOA_JURIDICA)
  @IsString()
  companyName?: string;

  @IsString()
  @IsOptional()
  tradeName?: string;

  @ValidateIf((o) => o.type === InvestorType.PESSOA_JURIDICA)
  @IsString()
  cnpj?: string;

  @IsString()
  @IsOptional()
  stateRegistration?: string;

  @IsString()
  @IsOptional()
  municipalRegistration?: string;

  @IsDateString()
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return value;
    if (value.includes('T')) return value;
    return `${value}T00:00:00.000Z`;
  })
  foundedDate?: string;

  @IsString()
  @IsOptional()
  legalNature?: string;

  @IsString()
  @IsOptional()
  mainActivity?: string;

  // ========== REPRESENTANTE LEGAL (PJ) ==========
  @IsString()
  @IsOptional()
  legalRepName?: string;

  @IsString()
  @IsOptional()
  legalRepDocument?: string;

  @IsString()
  @IsOptional()
  legalRepRole?: string;

  // ========== CONTATOS ==========
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsEmail()
  @IsOptional()
  alternativeEmail?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  mobilePhone?: string;

  @IsString()
  @IsOptional()
  whatsapp?: string;

  // ========== ENDEREÇO PRINCIPAL ==========
  @IsEnum(AddressType)
  @IsOptional()
  addressType?: AddressType;

  @IsString()
  @IsOptional()
  street?: string;

  @IsString()
  @IsOptional()
  number?: string;

  @IsString()
  @IsOptional()
  complement?: string;

  @IsString()
  @IsOptional()
  neighborhood?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  zipCode?: string;

  @IsString()
  @IsOptional()
  country?: string;

  // ========== ENDEREÇO DE CORRESPONDÊNCIA ==========
  @IsBoolean()
  @IsOptional()
  mailingAddressSame?: boolean;

  @IsString()
  @IsOptional()
  mailingStreet?: string;

  @IsString()
  @IsOptional()
  mailingNumber?: string;

  @IsString()
  @IsOptional()
  mailingComplement?: string;

  @IsString()
  @IsOptional()
  mailingNeighborhood?: string;

  @IsString()
  @IsOptional()
  mailingCity?: string;

  @IsString()
  @IsOptional()
  mailingState?: string;

  @IsString()
  @IsOptional()
  mailingZipCode?: string;

  @IsString()
  @IsOptional()
  mailingCountry?: string;

  // ========== DADOS BANCÁRIOS ==========
  @IsString()
  @IsOptional()
  bankName?: string;

  @IsString()
  @IsOptional()
  bankCode?: string;

  @IsString()
  @IsOptional()
  agencyNumber?: string;

  @IsString()
  @IsOptional()
  agencyDigit?: string;

  @IsString()
  @IsOptional()
  accountNumber?: string;

  @IsString()
  @IsOptional()
  accountDigit?: string;

  @IsEnum(AccountType)
  @IsOptional()
  accountType?: AccountType;

  @IsEnum(PixKeyType)
  @IsOptional()
  pixKeyType?: PixKeyType;

  @IsString()
  @IsOptional()
  pixKey?: string;

  // ========== INFORMAÇÕES FINANCEIRAS ==========
  @IsNumber()
  @IsOptional()
  monthlyIncome?: number;

  @IsNumber()
  @IsOptional()
  patrimony?: number;

  @IsEnum(InvestorProfile)
  @IsOptional()
  investorProfile?: InvestorProfile;

  @IsString()
  @IsOptional()
  investmentGoal?: string;

  // ========== DOCUMENTOS (URLs) ==========
  @IsString()
  @IsOptional()
  identityDocUrl?: string;

  @IsString()
  @IsOptional()
  cpfDocUrl?: string;

  @IsString()
  @IsOptional()
  addressProofUrl?: string;

  @IsString()
  @IsOptional()
  incomeProofUrl?: string;

  @IsString()
  @IsOptional()
  socialContractUrl?: string;

  @IsString()
  @IsOptional()
  cnpjDocUrl?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  attachments?: string[];

  // ========== INFORMAÇÕES ADICIONAIS ==========
  @IsString()
  @IsOptional()
  investorCode?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsBoolean()
  @IsOptional()
  isAccreditedInvestor?: boolean;

  @IsDateString()
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return value;
    if (value.includes('T')) return value;
    return `${value}T00:00:00.000Z`;
  })
  termsAcceptedAt?: string;

  @IsDateString()
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return value;
    if (value.includes('T')) return value;
    return `${value}T00:00:00.000Z`;
  })
  privacyPolicyAcceptedAt?: string;

  // ========== STATUS ==========
  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @IsEnum(InvestorStatus)
  @IsOptional()
  status?: InvestorStatus;

  @IsString()
  @IsOptional()
  statusReason?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  internalNotes?: string;

  @IsDateString()
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return value;
    if (value.includes('T')) return value;
    return `${value}T00:00:00.000Z`;
  })
  lastContactDate?: string;
}
