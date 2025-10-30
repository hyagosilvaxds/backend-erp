import { PartialType } from '@nestjs/mapped-types';
import { CreatePlanoContasDto } from './create-plano-contas.dto';

export class UpdatePlanoContasDto extends PartialType(CreatePlanoContasDto) {}
