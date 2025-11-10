import { IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class StatsPayrollDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  year?: number;
}
