import { IsString, IsNumber, IsEnum, IsOptional, IsBoolean } from 'class-validator';

export class EmitirNFeDto {
  @IsString()
  saleId: string;

  @IsOptional()
  @IsEnum(['55', '65'])
  modelo?: string; // 55 = NF-e, 65 = NFC-e

  @IsOptional()
  @IsString()
  serie?: string;

  @IsOptional()
  @IsNumber()
  numero?: number;

  @IsOptional()
  @IsString()
  naturezaOperacao?: string;

  @IsOptional()
  @IsEnum(['0', '1'])
  tipoOperacao?: string; // 0 = Entrada, 1 = Saída

  @IsOptional()
  @IsEnum(['1', '2', '3', '4'])
  finalidade?: string; // 1=Normal, 2=Complementar, 3=Ajuste, 4=Devolução

  @IsOptional()
  @IsEnum(['0', '1'])
  consumidorFinal?: string; // 0 = Não, 1 = Sim

  @IsOptional()
  @IsEnum(['0', '1', '2', '3', '4', '9'])
  presencaComprador?: string; // 0=Não se aplica, 1=Presencial, 2=Internet, 3=Teleatendimento, 4=NFC-e entrega, 9=Outros

  @IsOptional()
  @IsEnum(['9', '0', '1', '2', '3', '4'])
  modalidadeFrete?: string; // 0=Por conta do emitente, 1=Por conta do destinatário, 2=Por conta de terceiros, 3=Próprio por conta do remetente, 4=Próprio por conta do destinatário, 9=Sem frete

  @IsOptional()
  @IsBoolean()
  enviarSefaz?: boolean; // Se true, envia para SEFAZ, senão apenas gera XML
}
