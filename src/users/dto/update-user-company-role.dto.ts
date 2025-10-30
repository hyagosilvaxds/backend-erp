import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserCompanyRoleDto {
  @IsString({ message: 'Role ID deve ser uma string' })
  @IsNotEmpty({ message: 'Role ID é obrigatório' })
  roleId: string;
}
