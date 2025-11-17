import { IsString, MinLength, MaxLength } from 'class-validator';

export class CancelNFeDto {
  @IsString()
  @MinLength(15, { message: 'O motivo do cancelamento deve ter no mínimo 15 caracteres' })
  @MaxLength(255, { message: 'O motivo do cancelamento deve ter no máximo 255 caracteres' })
  motivoCancelamento: string;
}
