export interface OFXTransactionDto {
  fitId: string; // ID único da transação no banco
  type: string; // DEBIT ou CREDIT
  datePosted: Date; // Data da transação
  amount: number; // Valor
  name: string; // Nome/descrição
  memo?: string; // Memo adicional
  checkNum?: string; // Número do cheque/documento
}

export interface OFXAccountDto {
  bankId: string; // Código do banco
  accountId: string; // Número da conta
  accountType: string; // Tipo da conta
}

export interface OFXStatementDto {
  account: OFXAccountDto;
  transactions: OFXTransactionDto[];
  balance: number;
  balanceDate: Date;
  startDate: Date;
  endDate: Date;
}
