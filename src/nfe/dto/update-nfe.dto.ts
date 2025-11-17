import { PartialType } from '@nestjs/mapped-types';
import { CreateNFeDto } from './create-nfe.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateNFeDto extends PartialType(CreateNFeDto) {
  @IsOptional()
  @IsString()
  observacoes?: string;
}
