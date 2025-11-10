import { IsOptional, IsString, IsEnum, IsDateString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { LegalDocumentType, LegalDocumentStatus } from './create-legal-document.dto';

export class QueryLegalDocumentsDto {
  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsEnum(LegalDocumentType)
  type?: LegalDocumentType;

  @IsOptional()
  @IsEnum(LegalDocumentStatus)
  status?: LegalDocumentStatus;

  @IsOptional()
  @IsString()
  search?: string; // Busca em title, description, reference

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsDateString()
  startDateFrom?: string;

  @IsOptional()
  @IsDateString()
  startDateTo?: string;

  @IsOptional()
  @IsDateString()
  dueDateFrom?: string;

  @IsOptional()
  @IsDateString()
  dueDateTo?: string;

  @IsOptional()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
