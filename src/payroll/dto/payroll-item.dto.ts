import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsInt,
  IsArray,
  ValidateNested,
  IsOptional,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PayrollEarningDto {
  @IsNotEmpty()
  @IsString()
  typeId: string;

  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  value: number;
}

export class PayrollDeductionDto {
  @IsNotEmpty()
  @IsString()
  typeId: string;

  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  value: number;
}

export class CreatePayrollItemDto {
  @IsNotEmpty({ message: 'O ID do colaborador é obrigatório' })
  @IsString()
  employeeId: string;

  @IsNotEmpty({ message: 'O salário base é obrigatório' })
  @IsNumber()
  @Min(0)
  baseSalary: number;

  @IsNotEmpty({ message: 'Os dias trabalhados são obrigatórios' })
  @IsInt()
  @Min(0)
  workDays: number;

  @IsArray({ message: 'Earnings deve ser um array' })
  @ValidateNested({ each: true })
  @Type(() => PayrollEarningDto)
  earnings: PayrollEarningDto[];

  @IsArray({ message: 'Deductions deve ser um array' })
  @ValidateNested({ each: true })
  @Type(() => PayrollDeductionDto)
  deductions: PayrollDeductionDto[];

  @IsOptional()
  @IsString()
  notes?: string;
}
