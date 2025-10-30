import { IsString, IsBoolean, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateProductBrandDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
