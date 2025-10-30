import { IsString, IsOptional, IsBoolean, IsUUID, MinLength, MaxLength } from 'class-validator';

export class CreateProductCategoryDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsUUID()
  @IsOptional()
  parentId?: string; // Para subcategorias

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
