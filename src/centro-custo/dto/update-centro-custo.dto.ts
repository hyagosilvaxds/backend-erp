import { PartialType } from '@nestjs/mapped-types';
import { CreateCentroCustoDto } from './create-centro-custo.dto';

export class UpdateCentroCustoDto extends PartialType(CreateCentroCustoDto) {}
