import { PartialType } from '@nestjs/mapped-types';
import { CreateFgtsTableDto } from './create-fgts-table.dto';

export class UpdateFgtsTableDto extends PartialType(CreateFgtsTableDto) {}
