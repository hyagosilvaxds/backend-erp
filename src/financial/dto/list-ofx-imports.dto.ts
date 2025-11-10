import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ListOFXImportsDto {
  @IsOptional()
  @IsString()
  companyId?: string;

  @IsOptional()
  @IsString()
  bankAccountId?: string;

  @IsOptional()
  @IsString()
  startDate?: string; // YYYY-MM-DD

  @IsOptional()
  @IsString()
  endDate?: string; // YYYY-MM-DD

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}

export class OFXImportListItemDto {
  id: string;
  companyId: string;
  bankAccountId: string;
  fileName: string;
  fileSize: number;
  bankId: string;
  accountId: string;
  accountType: string;
  startDate: Date;
  endDate: Date;
  balance: number;
  balanceDate: Date;
  totalTransactions: number;
  importedCount: number;
  duplicateCount: number;
  reconciledCount: number;
  status: string;
  errorMessage?: string;
  importedAt: Date;
  importedBy?: string;
  bankAccount?: {
    id: string;
    accountName: string;
    bankName: string;
  };
}

export class OFXImportListResponseDto {
  data: OFXImportListItemDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class OFXImportDetailDto extends OFXImportListItemDto {
  transactions: any[]; // Array de transações OFX
}
