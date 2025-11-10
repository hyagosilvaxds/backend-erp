import { IsString, IsNumber, IsDateString, IsOptional, IsEnum, IsArray, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export enum ProjectStatus {
  ATIVO = 'ATIVO',
  CONCLUIDO = 'CONCLUIDO',
  CANCELADO = 'CANCELADO',
  SUSPENSO = 'SUSPENSO',
}

export class CreateProjectDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  code: string;

  @IsNumber()
  totalValue: number;

  @IsDateString()
  @Transform(({ value }) => {
    if (!value) return value;
    if (value.includes('T')) return value;
    return `${value}T00:00:00.000Z`;
  })
  startDate: string;

  @IsDateString()
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return value;
    if (value.includes('T')) return value;
    return `${value}T00:00:00.000Z`;
  })
  endDate?: string;

  @IsEnum(ProjectStatus)
  @IsOptional()
  status?: ProjectStatus;

  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  attachments?: string[];
}
