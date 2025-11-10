import {
  IsNotEmpty,
  IsInt,
  Min,
  Max,
  IsString,
  IsIn,
  IsDateString,
} from 'class-validator';

export class CreatePayrollDto {
  @IsNotEmpty({ message: 'O mês de referência é obrigatório' })
  @IsInt({ message: 'O mês deve ser um número inteiro' })
  @Min(1, { message: 'O mês deve ser entre 1 e 12' })
  @Max(12, { message: 'O mês deve ser entre 1 e 12' })
  referenceMonth: number;

  @IsNotEmpty({ message: 'O ano de referência é obrigatório' })
  @IsInt({ message: 'O ano deve ser um número inteiro' })
  @Min(2000, { message: 'O ano deve ser maior ou igual a 2000' })
  @Max(2100, { message: 'O ano deve ser menor ou igual a 2100' })
  referenceYear: number;

  @IsNotEmpty({ message: 'O tipo de folha é obrigatório' })
  @IsString()
  @IsIn(['MONTHLY', 'DAILY', 'WEEKLY', 'ADVANCE'], {
    message: 'O tipo deve ser MONTHLY, DAILY, WEEKLY ou ADVANCE',
  })
  type: string;

  @IsNotEmpty({ message: 'A data de início é obrigatória' })
  @IsDateString({}, { message: 'A data de início deve ser válida' })
  startDate: string;

  @IsNotEmpty({ message: 'A data de fim é obrigatória' })
  @IsDateString({}, { message: 'A data de fim deve ser válida' })
  endDate: string;

  @IsNotEmpty({ message: 'A data de pagamento é obrigatória' })
  @IsDateString({}, { message: 'A data de pagamento deve ser válida' })
  paymentDate: string;
}
