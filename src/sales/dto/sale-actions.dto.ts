import { IsString, IsNumber, IsOptional, IsEnum, Min, Max } from 'class-validator';

export class ApproveCreditAnalysisDto {
  @IsNumber()
  @Min(0)
  @Max(1000)
  creditScore: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class RejectCreditAnalysisDto {
  @IsNumber()
  @Min(0)
  @Max(1000)
  @IsOptional()
  creditScore?: number;

  @IsString()
  notes: string;
}

export class CancelSaleDto {
  @IsString()
  cancellationReason: string;
}

export class ChangeStatusDto {
  @IsEnum(['QUOTE', 'PENDING_APPROVAL', 'APPROVED', 'CONFIRMED', 'IN_PRODUCTION', 'READY_TO_SHIP', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELED', 'REJECTED'])
  status: string;
}

