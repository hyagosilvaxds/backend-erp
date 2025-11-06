import { IsString, IsNumber, IsOptional, IsEnum, IsUUID, Min } from 'class-validator';

export enum StockMovementType {
  ENTRY = 'ENTRY',           // Entrada de estoque (compra)
  EXIT = 'EXIT',             // Saída de estoque (venda)
  ADJUSTMENT = 'ADJUSTMENT', // Ajuste manual
  RETURN = 'RETURN',         // Devolução
  LOSS = 'LOSS',             // Perda (dano, roubo, vencimento)
  TRANSFER = 'TRANSFER',     // Transferência entre locais
}

export class CreateStockMovementDto {
  @IsEnum(StockMovementType)
  type: StockMovementType;

  @IsNumber()
  @Min(0.001)
  quantity: number;

  @IsUUID()
  locationId: string; // Local de estoque (OBRIGATÓRIO)

  @IsString()
  @IsOptional()
  reason?: string; // Motivo da movimentação

  @IsString()
  @IsOptional()
  notes?: string; // Observações adicionais

  @IsString()
  @IsOptional()
  reference?: string; // Referência externa (NF, pedido, etc)

  @IsUUID()
  @IsOptional()
  documentId?: string; // ID do documento vinculado (nota fiscal, recibo, etc)
}
