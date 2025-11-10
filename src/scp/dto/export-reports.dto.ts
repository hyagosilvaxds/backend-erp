import { IsOptional, IsString, IsDateString, IsEnum, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';
import { transformToISODate } from '../../common/transformers/date.transformer';

export enum ReportType {
  INVESTMENTS = 'INVESTMENTS',
  INVESTMENTS_BY_INVESTOR = 'INVESTMENTS_BY_INVESTOR',
  INVESTMENTS_BY_PROJECT = 'INVESTMENTS_BY_PROJECT',
  DISTRIBUTIONS = 'DISTRIBUTIONS',
  DISTRIBUTIONS_BY_INVESTOR = 'DISTRIBUTIONS_BY_INVESTOR',
  DISTRIBUTIONS_BY_PROJECT = 'DISTRIBUTIONS_BY_PROJECT',
  ROI = 'ROI',
  INVESTORS_SUMMARY = 'INVESTORS_SUMMARY',
  PROJECTS_SUMMARY = 'PROJECTS_SUMMARY',
  FINANCIAL_SUMMARY = 'FINANCIAL_SUMMARY',
}

export class ExportInvestmentsDto {
  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  investorId?: string;

  @IsOptional()
  @IsDateString()
  @Transform(transformToISODate)
  startDate?: string;

  @IsOptional()
  @IsDateString()
  @Transform(transformToISODate)
  endDate?: string;

  @IsOptional()
  @IsEnum(['ATIVO', 'INATIVO', 'SUSPENSO'])
  status?: string;
}

export class ExportDistributionsDto {
  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  investorId?: string;

  @IsOptional()
  @IsDateString()
  @Transform(transformToISODate)
  startDate?: string;

  @IsOptional()
  @IsDateString()
  @Transform(transformToISODate)
  endDate?: string;

  @IsOptional()
  @IsEnum(['PENDENTE', 'PAGO', 'CANCELADO'])
  status?: string;
}

export class ExportROIDto {
  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  investorId?: string;

  @IsOptional()
  @IsDateString()
  @Transform(transformToISODate)
  startDate?: string;

  @IsOptional()
  @IsDateString()
  @Transform(transformToISODate)
  endDate?: string;
}

export class ExportInvestorsDto {
  @IsOptional()
  @IsEnum(['PESSOA_FISICA', 'PESSOA_JURIDICA'])
  type?: string;

  @IsOptional()
  @IsEnum(['ATIVO', 'INATIVO', 'SUSPENSO', 'BLOQUEADO'])
  status?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  projectIds?: string[];
}

export class ExportProjectsDto {
  @IsOptional()
  @IsEnum(['PLANEJAMENTO', 'EM_CAPTACAO', 'ATIVO', 'CONCLUIDO', 'CANCELADO', 'SUSPENSO'])
  status?: string;

  @IsOptional()
  @IsDateString()
  @Transform(transformToISODate)
  startDate?: string;

  @IsOptional()
  @IsDateString()
  @Transform(transformToISODate)
  endDate?: string;
}
