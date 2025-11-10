import { IsString, IsOptional, IsNotEmpty, IsEnum } from 'class-validator';

export enum ProjectDocumentCategory {
  CONTRATO = 'CONTRATO',
  ESTATUTO = 'ESTATUTO',
  ATA = 'ATA',
  RELATORIO = 'RELATORIO',
  COMPROVANTE = 'COMPROVANTE',
  LICENCA = 'LICENCA',
  ALVARA = 'ALVARA',
  PROJETO_TECNICO = 'PROJETO_TECNICO',
  PLANILHA = 'PLANILHA',
  OUTRO = 'OUTRO',
}

export class UploadProjectDocumentDto {
  @IsString()
  @IsNotEmpty()
  projectId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(ProjectDocumentCategory)
  @IsOptional()
  category?: ProjectDocumentCategory;

  @IsString()
  @IsOptional()
  tags?: string; // Comma-separated tags
}
