import { IsOptional, IsString, IsBoolean, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { InvestorType, InvestorStatus } from './create-investor.dto';

export class ListInvestorsDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(InvestorType)
  type?: InvestorType;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsEnum(InvestorStatus)
  status?: InvestorStatus;
}
