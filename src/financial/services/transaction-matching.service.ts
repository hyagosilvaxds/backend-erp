import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OFXTransactionDto } from '../dto/ofx-transaction.dto';
import { SimilarTransactionDto } from '../dto/match-transaction.dto';
import { compareTwoStrings } from 'string-similarity';
import { differenceInDays, parseISO } from 'date-fns';

@Injectable()
export class TransactionMatchingService {
  constructor(private prisma: PrismaService) {}

  /**
   * Encontra lançamentos no sistema que são similares a um lançamento do extrato OFX
   */
  async findSimilarTransactions(
    ofxTransaction: OFXTransactionDto,
    companyId: string,
    bankAccountId: string,
  ): Promise<SimilarTransactionDto[]> {
    // Buscar transações em um intervalo de ±7 dias
    const startDate = new Date(ofxTransaction.datePosted);
    startDate.setDate(startDate.getDate() - 7);
    
    const endDate = new Date(ofxTransaction.datePosted);
    endDate.setDate(endDate.getDate() + 7);

    // Determinar o tipo de transação (RECEITA ou DESPESA)
    const transactionType = ofxTransaction.type === 'CREDIT' ? 'RECEITA' : 'DESPESA';

    // Buscar transações candidatas
    const candidates = await this.prisma.financialTransaction.findMany({
      where: {
        companyId,
        bankAccountId,
        type: transactionType,
        transactionDate: {
          gte: startDate,
          lte: endDate,
        },
        reconciled: false, // Apenas transações não conciliadas
      },
      include: {
        category: true,
      },
      orderBy: {
        transactionDate: 'desc',
      },
    });

    // Calcular score de similaridade para cada candidato
    const similarities: SimilarTransactionDto[] = [];

    for (const transaction of candidates) {
      const score = this.calculateMatchScore(
        ofxTransaction,
        transaction,
      );

      if (score.totalScore >= 30) { // Threshold mínimo de 30%
        similarities.push({
          transactionId: transaction.id,
          description: transaction.description,
          amount: transaction.netAmount,
          transactionDate: transaction.transactionDate,
          type: transaction.type,
          categoryName: transaction.category?.name,
          matchScore: score.totalScore,
          matchReasons: score.reasons,
        });
      }
    }

    // Ordenar por score descendente
    return similarities.sort((a, b) => b.matchScore - a.matchScore);
  }

  /**
   * Calcula o score de match entre uma transação OFX e uma transação do sistema
   */
  private calculateMatchScore(
    ofxTxn: OFXTransactionDto,
    sysTxn: any,
  ): { totalScore: number; reasons: string[] } {
    let totalScore = 0;
    const reasons: string[] = [];

    // 1. Comparação de valor (peso: 40 pontos)
    const amountDiff = Math.abs(ofxTxn.amount - sysTxn.netAmount);
    const amountDiffPercent = (amountDiff / ofxTxn.amount) * 100;

    if (amountDiffPercent === 0) {
      totalScore += 40;
      reasons.push('Valor exato');
    } else if (amountDiffPercent <= 1) {
      totalScore += 35;
      reasons.push('Valor muito próximo (diferença < 1%)');
    } else if (amountDiffPercent <= 5) {
      totalScore += 25;
      reasons.push('Valor próximo (diferença < 5%)');
    } else if (amountDiffPercent <= 10) {
      totalScore += 15;
      reasons.push('Valor razoavelmente próximo (diferença < 10%)');
    }

    // 2. Comparação de data (peso: 30 pontos)
    const daysDiff = Math.abs(
      differenceInDays(
        ofxTxn.datePosted,
        sysTxn.transactionDate,
      ),
    );

    if (daysDiff === 0) {
      totalScore += 30;
      reasons.push('Mesma data');
    } else if (daysDiff === 1) {
      totalScore += 25;
      reasons.push('Diferença de 1 dia');
    } else if (daysDiff <= 3) {
      totalScore += 20;
      reasons.push('Diferença de até 3 dias');
    } else if (daysDiff <= 7) {
      totalScore += 10;
      reasons.push('Diferença de até 7 dias');
    }

    // 3. Comparação de descrição (peso: 30 pontos)
    const ofxDescription = this.normalizeString(
      `${ofxTxn.name} ${ofxTxn.memo || ''}`,
    );
    const sysDescription = this.normalizeString(sysTxn.description);

    const descriptionSimilarity = compareTwoStrings(
      ofxDescription,
      sysDescription,
    );

    if (descriptionSimilarity >= 0.8) {
      totalScore += 30;
      reasons.push('Descrição muito similar (80%+)');
    } else if (descriptionSimilarity >= 0.6) {
      totalScore += 20;
      reasons.push('Descrição similar (60%+)');
    } else if (descriptionSimilarity >= 0.4) {
      totalScore += 10;
      reasons.push('Descrição parcialmente similar (40%+)');
    }

    // 4. Verificação de palavras-chave comuns
    const ofxWords = ofxDescription.split(' ').filter(w => w.length > 3);
    const sysWords = sysDescription.split(' ').filter(w => w.length > 3);
    const commonWords = ofxWords.filter(word => sysWords.includes(word));

    if (commonWords.length > 0) {
      const bonus = Math.min(commonWords.length * 5, 15);
      totalScore += bonus;
      reasons.push(`${commonWords.length} palavra(s) em comum`);
    }

    return {
      totalScore: Math.round(totalScore),
      reasons,
    };
  }

  /**
   * Normaliza string para comparação
   */
  private normalizeString(str: string): string {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^\w\s]/g, '') // Remove pontuação
      .replace(/\s+/g, ' ') // Normaliza espaços
      .trim();
  }

  /**
   * Verifica se uma transação OFX já foi importada (baseado no FITID)
   */
  async isTransactionAlreadyImported(
    fitId: string,
    bankAccountId: string,
  ): Promise<boolean> {
    const existing = await this.prisma.financialTransaction.findFirst({
      where: {
        bankAccountId,
        referenceNumber: fitId,
      },
    });

    return !!existing;
  }

  /**
   * Concilia automaticamente uma transação OFX com uma transação do sistema
   */
  async autoReconcile(
    ofxFitId: string,
    systemTransactionId: string,
    companyId: string,
  ): Promise<any> {
    const transaction = await this.prisma.financialTransaction.update({
      where: {
        id: systemTransactionId,
        companyId,
      },
      data: {
        reconciled: true,
        reconciledAt: new Date(),
        referenceNumber: ofxFitId, // Armazena o FITID como referência
      },
      include: {
        category: true,
        bankAccount: true,
      },
    });

    return transaction;
  }
}
