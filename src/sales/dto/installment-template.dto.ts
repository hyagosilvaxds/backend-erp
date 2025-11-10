import { IsNumber, IsOptional, Min, Max } from 'class-validator';

export class CreateInstallmentTemplateDto {
  @IsNumber()
  @Min(1)
  installmentNumber: number;

  @IsNumber()
  @Min(0)
  daysToPayment: number; // Dias após a venda para vencimento

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  percentageOfTotal?: number; // Porcentagem do total (0-100)

  @IsNumber()
  @Min(0)
  @IsOptional()
  fixedAmount?: number; // Ou valor fixo
}

