import { PartialType } from '@nestjs/mapped-types';
import { IsNumber, IsOptional } from 'class-validator';
import { CreateAccountPayableDto } from './create-account-payable.dto';

export class UpdateAccountPayableDto extends PartialType(CreateAccountPayableDto) {
  @IsOptional()
  @IsNumber()
  paidAmount?: number;
}
