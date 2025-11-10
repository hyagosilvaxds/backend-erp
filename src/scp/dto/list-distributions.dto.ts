import { IsOptional, IsString, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { DistributionStatus } from './create-distribution.dto';

export class ListDistributionsDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  limit?: number = 10;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  investorId?: string;

  @IsOptional()
  @IsEnum(DistributionStatus)
  status?: DistributionStatus;
}
