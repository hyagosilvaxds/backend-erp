import { IsOptional, IsBoolean, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class ListEarningTypesDto {
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  active?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isRecurrent?: boolean;

  @IsOptional()
  @IsString()
  search?: string;
}
