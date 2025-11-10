import { IsString, IsUUID, IsOptional, IsEnum, IsArray, ValidateNested, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum StockTransferStatus {
  PENDING = 'PENDING',
  IN_TRANSIT = 'IN_TRANSIT',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export class StockTransferItemDto {
  @IsUUID()
  productId: string;

  @IsNumber()
  @Min(0.001)
  quantity: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateStockTransferDto {
  @IsUUID()
  fromLocationId: string; // Local de origem

  @IsUUID()
  toLocationId: string; // Local de destino

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StockTransferItemDto)
  items: StockTransferItemDto[]; // Itens a transferir

  @IsString()
  @IsOptional()
  notes?: string; // Observações sobre a transferência

  @IsUUID()
  @IsOptional()
  documentId?: string; // ID do documento vinculado (guia de transferência, etc)
}
