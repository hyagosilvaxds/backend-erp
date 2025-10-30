import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class AssignUserToCompanyDto {
  @IsString({ message: 'Company ID deve ser uma string' })
  @IsNotEmpty({ message: 'Company ID é obrigatório' })
  companyId: string;

  @IsString({ message: 'Role ID deve ser uma string' })
  @IsNotEmpty({ message: 'Role ID é obrigatório' })
  roleId: string;

  @IsBoolean({ message: 'Active deve ser booleano' })
  @IsOptional()
  active?: boolean;
}
