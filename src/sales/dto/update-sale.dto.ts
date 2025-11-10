import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateSaleDto } from './create-sale.dto';

export class UpdateSaleDto extends PartialType(
  OmitType(CreateSaleDto, ['items', 'customerId'] as const)
) {}
