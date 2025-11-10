import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsNumber,
  IsArray,
  IsObject,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum LegalDocumentType {
  CONTRATO = 'CONTRATO',
  PROCESSO_TRABALHISTA = 'PROCESSO_TRABALHISTA',
  PROCESSO_CIVIL = 'PROCESSO_CIVIL',
  PROCESSO_CRIMINAL = 'PROCESSO_CRIMINAL',
  OUTROS = 'OUTROS',
}

export enum LegalDocumentStatus {
  ATIVO = 'ATIVO',
  CONCLUIDO = 'CONCLUIDO',
  SUSPENSO = 'SUSPENSO',
  CANCELADO = 'CANCELADO',
  ARQUIVADO = 'ARQUIVADO',
}

export class CreateLegalDocumentDto {
  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsEnum(LegalDocumentType)
  type: LegalDocumentType;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  reference?: string;

  @IsObject()
  @IsOptional()
  parties?: any; // Array de objetos com {name, role, document, contact}

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsEnum(LegalDocumentStatus)
  @IsOptional()
  status?: LegalDocumentStatus;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  value?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  alertDays?: number;

  // Campos para upload do documento
  @IsString()
  @IsOptional()
  folderId?: string;

  @IsString()
  @IsOptional()
  documentName?: string;

  @IsString()
  @IsOptional()
  documentDescription?: string;
}
