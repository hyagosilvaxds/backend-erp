import { IsOptional, IsString, IsBoolean, IsArray, IsNumber, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class QueryDocumentsDto {
  @IsString()
  @IsOptional()
  folderId?: string;

  @IsString()
  @IsOptional()
  documentType?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map((tag) => tag.trim());
    }
    return value;
  })
  tags?: string[];

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  expired?: boolean;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  expiresIn?: number;

  @IsString()
  @IsOptional()
  search?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  limit?: number;
}
