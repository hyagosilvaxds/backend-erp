export class MatchTransactionDto {
  ofxTransactionId: string;
  systemTransactionId?: string;
  matchScore: number; // 0 a 100
  matchReasons: string[];
  autoMatched: boolean;
}

export class SimilarTransactionDto {
  transactionId: string;
  description: string;
  amount: number;
  transactionDate: Date;
  type: string;
  categoryName?: string;
  matchScore: number;
  matchReasons: string[];
}

export class OFXImportResultDto {
  totalTransactions: number;
  autoMatched: number;
  needsReview: number;
  alreadyImported: number;
  matches: MatchTransactionDto[];
  importId?: string; // ID do registro OFXImport criado
}
