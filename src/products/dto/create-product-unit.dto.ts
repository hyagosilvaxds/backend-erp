import { IsString, IsBoolean, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateProductUnitDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @IsString()
  @MinLength(1)
  @MaxLength(10)
  abbreviation: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
