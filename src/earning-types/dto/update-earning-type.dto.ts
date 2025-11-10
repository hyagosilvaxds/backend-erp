import { PartialType } from '@nestjs/mapped-types';
import { CreateEarningTypeDto } from './create-earning-type.dto';

export class UpdateEarningTypeDto extends PartialType(CreateEarningTypeDto) {}
