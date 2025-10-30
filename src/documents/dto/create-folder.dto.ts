import {
  IsString,
  IsOptional,
  IsBoolean,
  IsUUID,
  Length,
  MaxLength,
  Matches,
  IsArray,
} from 'class-validator';

export class CreateFolderDto {
  @IsString()
  @Length(3, 100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'Color must be a valid hex color' })
  color?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsUUID('4', { each: true })
  allowedRoleIds?: string[];
}
