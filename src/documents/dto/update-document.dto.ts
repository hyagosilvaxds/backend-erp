import { IsString, IsOptional, IsArray, IsBoolean, IsDateString, IsUUID, MaxLength } from 'class-validator';

export class UpdateDocumentDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @IsUUID()
  @IsOptional()
  folderId?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  reference?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  documentType?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsDateString()
  @IsOptional()
  expiresAt?: string;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsUUID('4', { each: true })
  @IsOptional()
  allowedRoleIds?: string[];
}
