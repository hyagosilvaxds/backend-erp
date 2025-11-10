import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreatePaymentMethodDto } from './create-payment-method.dto';

// Não permite atualizar templates via update - deve usar endpoints específicos
export class UpdatePaymentMethodDto extends PartialType(
  OmitType(CreatePaymentMethodDto, ['installmentTemplates'] as const),
) {}
