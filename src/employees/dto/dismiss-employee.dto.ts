import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class DismissEmployeeDto {
  @IsNotEmpty()
  @Type(() => Date)
  dismissalDate: Date;

  @IsOptional()
  @IsString()
  notes?: string;
}
