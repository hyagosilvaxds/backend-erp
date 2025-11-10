import { 
  IsString, 
  IsOptional, 
  IsDateString, 
  IsBoolean, 
  IsEnum 
} from 'class-validator';

export enum DocumentType {
  RG = 'RG',
  CPF = 'CPF',
  CNH = 'CNH',
  CTPS = 'CTPS',
  TITULO_ELEITOR = 'TITULO_ELEITOR',
  CERTIFICADO_RESERVISTA = 'CERTIFICADO_RESERVISTA',
  COMPROVANTE_RESIDENCIA = 'COMPROVANTE_RESIDENCIA',
  DIPLOMA = 'DIPLOMA',
  CERTIFICADO = 'CERTIFICADO',
  CONTRATO = 'CONTRATO',
  EXAME_ADMISSIONAL = 'EXAME_ADMISSIONAL',
  ASO = 'ASO',
  ATESTADO = 'ATESTADO',
  OUTROS = 'OUTROS',
}

export class UploadEmployeeDocumentDto {
  @IsEnum(DocumentType)
  documentType: DocumentType;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  documentNumber?: string;

  @IsOptional()
  @IsDateString()
  issueDate?: string;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @IsOptional()
  @IsBoolean()
  verified?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}
