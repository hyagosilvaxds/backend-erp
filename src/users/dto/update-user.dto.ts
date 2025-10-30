import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class UpdateUserDto {
  @IsEmail({}, { message: 'Email inválido' })
  @IsOptional()
  email?: string;

  @IsString({ message: 'Nome deve ser uma string' })
  @IsOptional()
  name?: string;

  @IsString({ message: 'Senha deve ser uma string' })
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
  @IsOptional()
  password?: string;

  @IsBoolean({ message: 'Active deve ser booleano' })
  @IsOptional()
  active?: boolean;
}
