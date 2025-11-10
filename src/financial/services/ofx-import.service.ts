import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OFXParserService } from './ofx-parser.service';
import { TransactionMatchingService } from './transaction-matching.service';
import {
  OFXImportResultDto,
  MatchTransactionDto,
} from '../dto/match-transaction.dto';
import { OFXTransactionDto } from '../dto/ofx-transaction.dto';

/**
 * Serviço de Importação OFX
 * 
 * IMPORTANTE: A conciliação é SEMPRE MANUAL
 * - O sistema importa o arquivo OFX
 * - Busca transações similares no sistema
 * - Calcula um score de similaridade (0-100)
 * - Retorna sugestões ordenadas por score
 * - O USUÁRIO decide qual lançamento conciliar (se algum)
 * 
 * Não há conciliação automática em nenhum caso.
 */
@Injectable()
export class OFXImportService {
  constructor(
    private prisma: PrismaService,
    private ofxParser: OFXParserService,
    private matchingService: TransactionMatchingService,
  ) {}

  /**
   * Importa e processa um arquivo OFX
   * Retorna as transações do OFX com sugestões de match, mas NÃO concilia automaticamente
   */
  async importOFXFile(
    ofxContent: string,
    bankAccountId: string,
    companyId: string,
    fileName: string,
    fileSize: number,
  ): Promise<OFXImportResultDto> {
    // Verificar se a conta bancária existe
    const bankAccount = await this.prisma.bankAccount.findUnique({
      where: { id: bankAccountId, companyId },
    });

    if (!bankAccount) {
      throw new NotFoundException('Conta bancária não encontrada');
    }

    // Parse do arquivo OFX (agora é assíncrono)
    const ofxStatement = await this.ofxParser.parseOFXFile(ofxContent);

    const matches: MatchTransactionDto[] = [];
    let needsReview = 0;
    let alreadyImported = 0;

    // Processar cada transação do OFX
    for (const ofxTxn of ofxStatement.transactions) {
      // Verificar se já foi importada/conciliada
      const isImported = await this.matchingService.isTransactionAlreadyImported(
        ofxTxn.fitId,
        bankAccountId,
      );

      if (isImported) {
        alreadyImported++;
        continue;
      }

      // Buscar transações similares
      const similarTransactions = await this.matchingService.findSimilarTransactions(
        ofxTxn,
        companyId,
        bankAccountId,
      );

      if (similarTransactions.length > 0) {
        const bestMatch = similarTransactions[0];
        const matchDto: MatchTransactionDto = {
          ofxTransactionId: ofxTxn.fitId,
          systemTransactionId: bestMatch.transactionId,
          matchScore: bestMatch.matchScore,
          matchReasons: bestMatch.matchReasons,
          autoMatched: false, // Sempre false - conciliação é manual
        };

        matches.push(matchDto);
        needsReview++;
      } else {
        // Sem match - precisa revisão manual
        matches.push({
          ofxTransactionId: ofxTxn.fitId,
          matchScore: 0,
          matchReasons: ['Nenhuma transação similar encontrada'],
          autoMatched: false,
        });
        needsReview++;
      }
    }

    // Atualizar saldo da conta se necessário
    if (ofxStatement.balance && Math.abs(bankAccount.currentBalance - ofxStatement.balance) > 0.01) {
      await this.prisma.bankAccount.update({
        where: { id: bankAccountId },
        data: {
          currentBalance: ofxStatement.balance,
        },
      });
    }

    // Salvar o extrato importado no banco de dados
    const ofxImport = await this.prisma.oFXImport.create({
      data: {
        companyId,
        bankAccountId,
        fileName,
        fileSize,
        bankId: ofxStatement.account.bankId,
        accountId: ofxStatement.account.accountId,
        accountType: ofxStatement.account.accountType,
        startDate: ofxStatement.startDate,
        endDate: ofxStatement.endDate,
        balance: ofxStatement.balance,
        balanceDate: ofxStatement.balanceDate,
        totalTransactions: ofxStatement.transactions.length,
        importedCount: needsReview,
        duplicateCount: alreadyImported,
        reconciledCount: 0,
        transactions: ofxStatement.transactions as any,
        status: 'COMPLETED',
      },
    });

    return {
      totalTransactions: ofxStatement.transactions.length,
      autoMatched: 0, // Sempre 0 - não há conciliação automática
      needsReview,
      alreadyImported,
      matches,
      importId: ofxImport.id,
    };
  }

  /**
   * Busca transações similares para uma transação OFX específica
   */
  async findSimilarForOFXTransaction(
    ofxTransaction: OFXTransactionDto,
    bankAccountId: string,
    companyId: string,
  ) {
    // Verificar se a conta bancária existe
    const bankAccount = await this.prisma.bankAccount.findUnique({
      where: { id: bankAccountId, companyId },
    });

    if (!bankAccount) {
      throw new NotFoundException('Conta bancária não encontrada');
    }

    return this.matchingService.findSimilarTransactions(
      ofxTransaction,
      companyId,
      bankAccountId,
    );
  }

  /**
   * Concilia manualmente uma transação OFX com uma transação do sistema
   * Esta é a ÚNICA forma de conciliação - escolhida pelo usuário
   */
  async manualReconcile(
    ofxFitId: string,
    systemTransactionId: string,
    companyId: string,
  ) {
    return this.matchingService.autoReconcile(
      ofxFitId,
      systemTransactionId,
      companyId,
    );
  }

  /**
   * Lista todos os extratos OFX importados com paginação
   */
  async listOFXImports(
    companyId: string,
    filters?: {
      bankAccountId?: string;
      startDate?: string;
      endDate?: string;
      page?: number;
      limit?: number;
    },
  ) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { companyId };

    if (filters?.bankAccountId) {
      where.bankAccountId = filters.bankAccountId;
    }

    if (filters?.startDate || filters?.endDate) {
      where.importedAt = {};
      if (filters.startDate) {
        where.importedAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.importedAt.lte = new Date(filters.endDate);
      }
    }

    const [imports, total] = await Promise.all([
      this.prisma.oFXImport.findMany({
        where,
        skip,
        take: limit,
        orderBy: { importedAt: 'desc' },
        include: {
          bankAccount: {
            select: {
              id: true,
              accountName: true,
              bankName: true,
            },
          },
        },
      }),
      this.prisma.oFXImport.count({ where }),
    ]);

    return {
      data: imports,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Busca detalhes de um extrato OFX específico
   */
  async getOFXImportById(id: string, companyId: string) {
    const ofxImport = await this.prisma.oFXImport.findFirst({
      where: { id, companyId },
      include: {
        bankAccount: {
          select: {
            id: true,
            accountName: true,
            bankName: true,
            bankCode: true,
            accountNumber: true,
          },
        },
      },
    });

    if (!ofxImport) {
      throw new NotFoundException('Extrato OFX não encontrado');
    }

    return ofxImport;
  }

  /**
   * Deleta um extrato OFX importado
   * ATENÇÃO: Isso NÃO desfaz conciliações já realizadas
   */
  async deleteOFXImport(id: string, companyId: string) {
    const ofxImport = await this.prisma.oFXImport.findFirst({
      where: { id, companyId },
    });

    if (!ofxImport) {
      throw new NotFoundException('Extrato OFX não encontrado');
    }

    await this.prisma.oFXImport.delete({
      where: { id },
    });

    return { message: 'Extrato OFX deletado com sucesso' };
  }
}
