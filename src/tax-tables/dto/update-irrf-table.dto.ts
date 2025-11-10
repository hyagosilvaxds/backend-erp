import { PartialType } from '@nestjs/mapped-types';
import { CreateIrrfTableDto } from './create-irrf-table.dto';

export class UpdateIrrfTableDto extends PartialType(CreateIrrfTableDto) {}
