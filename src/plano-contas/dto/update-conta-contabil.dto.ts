import { PartialType } from '@nestjs/mapped-types';
import { CreateContaContabilDto } from './create-conta-contabil.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateContaContabilDto extends PartialType(CreateContaContabilDto) {
  @IsOptional()
  @IsString()
  planoContasId?: string;
}
