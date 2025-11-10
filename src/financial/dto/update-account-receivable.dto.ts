import { PartialType } from '@nestjs/mapped-types';
import { IsNumber, IsOptional } from 'class-validator';
import { CreateAccountReceivableDto } from './create-account-receivable.dto';

export class UpdateAccountReceivableDto extends PartialType(CreateAccountReceivableDto) {
  @IsOptional()
  @IsNumber()
  receivedAmount?: number;
}
