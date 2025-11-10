import { PartialType } from '@nestjs/mapped-types';
import { CreateDeductionTypeDto } from './create-deduction-type.dto';

export class UpdateDeductionTypeDto extends PartialType(CreateDeductionTypeDto) {}
