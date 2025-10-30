import { IsString, IsNotEmpty } from 'class-validator';

export class ChangePasswordDto {
  @IsString({ message: 'Senha antiga deve ser uma string' })
  @IsNotEmpty({ message: 'Senha antiga é obrigatória' })
  oldPassword: string;

  @IsString({ message: 'Nova senha deve ser uma string' })
  @IsNotEmpty({ message: 'Nova senha é obrigatória' })
  newPassword: string;
}
