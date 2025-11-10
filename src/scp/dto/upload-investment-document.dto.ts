import { IsString, IsOptional } from 'class-validator';

export class UploadInvestmentDocumentDto {
  @IsString()
  investmentId: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  tags?: string;
}
