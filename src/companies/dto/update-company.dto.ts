import { PartialType } from '@nestjs/mapped-types';
import { CreateCompanyDto } from './create-company.dto';
import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateCompanyDto extends PartialType(CreateCompanyDto) {
  @IsOptional()
  @IsBoolean({ message: 'Active deve ser um booleano' })
  active?: boolean;
}
