import { Injectable, BadRequestException } from '@nestjs/common';
import { parse } from 'ofx-js';
import { OFXStatementDto, OFXTransactionDto, OFXAccountDto } from '../dto/ofx-transaction.dto';

@Injectable()
export class OFXParserService {
  async parseOFXFile(ofxContent: string): Promise<OFXStatementDto> {
    try {
      // Parse do arquivo OFX usando a função parse do ofx-js (retorna Promise)
      const parsedData = await parse(ofxContent);
      
      if (!parsedData || !parsedData.OFX || !parsedData.OFX.BANKMSGSRSV1) {
        throw new BadRequestException('Arquivo OFX inválido ou sem dados de extrato');
      }

      const bankMsgRs = parsedData.OFX.BANKMSGSRSV1;
      const stmtrs = bankMsgRs.STMTTRNRS?.STMTRS;

      if (!stmtrs) {
        throw new BadRequestException('Extrato bancário não encontrado no arquivo OFX');
      }

      const transactions: OFXTransactionDto[] = [];
      const banktranlist = stmtrs.BANKTRANLIST;

      if (banktranlist && banktranlist.STMTTRN && Array.isArray(banktranlist.STMTTRN)) {
        for (const txn of banktranlist.STMTTRN) {
          transactions.push({
            fitId: txn.FITID || `${txn.DTPOSTED}_${txn.TRNAMT}`,
            type: parseFloat(txn.TRNAMT) >= 0 ? 'CREDIT' : 'DEBIT',
            datePosted: this.parseOFXDate(txn.DTPOSTED),
            amount: Math.abs(parseFloat(txn.TRNAMT)),
            name: txn.NAME || txn.MEMO || 'Transação sem descrição',
            memo: txn.MEMO,
            checkNum: txn.CHECKNUM,
          });
        }
      }

      const bankacctfrom = stmtrs.BANKACCTFROM;
      const account: OFXAccountDto = {
        bankId: bankacctfrom?.BANKID || '',
        accountId: bankacctfrom?.ACCTID || '',
        accountType: bankacctfrom?.ACCTTYPE || 'CHECKING',
      };

      const ledgerbal = stmtrs.LEDGERBAL;
      const result: OFXStatementDto = {
        account,
        transactions,
        balance: parseFloat(ledgerbal?.BALAMT || '0'),
        balanceDate: this.parseOFXDate(ledgerbal?.DTASOF),
        startDate: this.parseOFXDate(banktranlist?.DTSTART),
        endDate: this.parseOFXDate(banktranlist?.DTEND),
      };

      return result;
    } catch (error) {
      throw new BadRequestException(
        `Erro ao processar arquivo OFX: ${error.message}`
      );
    }
  }

  private parseOFXDate(dateString: string): Date {
    if (!dateString) return new Date();

    // OFX date format: YYYYMMDDHHMMSS ou YYYYMMDD
    const cleanDate = dateString.replace(/[^0-9]/g, '');
    
    const year = parseInt(cleanDate.substring(0, 4));
    const month = parseInt(cleanDate.substring(4, 6)) - 1;
    const day = parseInt(cleanDate.substring(6, 8));
    const hour = parseInt(cleanDate.substring(8, 10)) || 0;
    const minute = parseInt(cleanDate.substring(10, 12)) || 0;
    const second = parseInt(cleanDate.substring(12, 14)) || 0;

    return new Date(year, month, day, hour, minute, second);
  }
}
