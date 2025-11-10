import { IsString, IsEnum, IsDateString, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { transformToISODate } from '../../common/transformers/date.transformer';

export class ListSalesDto {
  @IsEnum(['QUOTE', 'PENDING_APPROVAL', 'APPROVED', 'CONFIRMED', 'IN_PRODUCTION', 'READY_TO_SHIP', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELED', 'REJECTED'])
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  customerId?: string;

  @IsDateString()
  @Transform(transformToISODate)
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @Transform(transformToISODate)
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  search?: string;
}
