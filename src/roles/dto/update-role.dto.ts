import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class UpdateRoleDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Nome deve ter no mínimo 2 caracteres' })
  @MaxLength(50, { message: 'Nome deve ter no máximo 50 caracteres' })
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Descrição deve ter no máximo 200 caracteres' })
  description?: string;
}
