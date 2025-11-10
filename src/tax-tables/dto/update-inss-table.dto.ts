import { PartialType } from '@nestjs/mapped-types';
import { CreateInssTableDto } from './create-inss-table.dto';

export class UpdateInssTableDto extends PartialType(CreateInssTableDto) {}
