import { PaymentCodeSefaz } from '@prisma/client';

/**
 * Mapeamento dos códigos SEFAZ para os valores numéricos aceitos pela SEFAZ
 * Baseado na Tabela 4.3.3.4.6.1 do Manual de Orientação da NFe
 * 
 * @see https://www.nfe.fazenda.gov.br/portal/exibirArquivo.aspx?conteudo=eRn/kZdQ+Ks=
 */
export const SEFAZ_PAYMENT_CODE_MAP: Record<PaymentCodeSefaz, string> = {
  [PaymentCodeSefaz.DINHEIRO]: '01',
  [PaymentCodeSefaz.CHEQUE]: '02',
  [PaymentCodeSefaz.CARTAO_CREDITO]: '03',
  [PaymentCodeSefaz.CARTAO_DEBITO]: '04',
  [PaymentCodeSefaz.CREDITO_LOJA]: '05',
  [PaymentCodeSefaz.VALE_ALIMENTACAO]: '10',
  [PaymentCodeSefaz.VALE_REFEICAO]: '11',
  [PaymentCodeSefaz.VALE_PRESENTE]: '12',
  [PaymentCodeSefaz.VALE_COMBUSTIVEL]: '13',
  [PaymentCodeSefaz.DUPLICATA_MERCANTIL]: '14',
  [PaymentCodeSefaz.BOLETO_BANCARIO]: '15',
  [PaymentCodeSefaz.DEPOSITO_BANCARIO]: '16',
  [PaymentCodeSefaz.PIX_DINAMICO]: '17',
  [PaymentCodeSefaz.TRANSFERENCIA]: '18',
  [PaymentCodeSefaz.PROGRAMA_FIDELIDADE]: '19',
  [PaymentCodeSefaz.PIX_ESTATICO]: '20',
  [PaymentCodeSefaz.CREDITO_EM_LOJA]: '21',
  [PaymentCodeSefaz.PAGAMENTO_ELETRONICO_NAO_INFORMADO]: '22',
  [PaymentCodeSefaz.SEM_PAGAMENTO]: '90',
  [PaymentCodeSefaz.OUTROS]: '99',
};

/**
 * Converte o enum PaymentCodeSefaz para o código numérico esperado pela SEFAZ
 * 
 * @param sefazCode - Enum do Prisma
 * @returns Código numérico no formato string (ex: '01', '17', '99')
 * 
 * @example
 * ```typescript
 * getSefazPaymentCode(PaymentCodeSefaz.PIX_DINAMICO) // '17'
 * getSefazPaymentCode(PaymentCodeSefaz.CARTAO_CREDITO) // '03'
 * ```
 */
export function getSefazPaymentCode(sefazCode: PaymentCodeSefaz): string {
  return SEFAZ_PAYMENT_CODE_MAP[sefazCode];
}

/**
 * Descrições completas dos códigos de pagamento SEFAZ
 */
export const SEFAZ_PAYMENT_DESCRIPTIONS: Record<PaymentCodeSefaz, string> = {
  [PaymentCodeSefaz.DINHEIRO]: 'Dinheiro',
  [PaymentCodeSefaz.CHEQUE]: 'Cheque',
  [PaymentCodeSefaz.CARTAO_CREDITO]: 'Cartão de Crédito',
  [PaymentCodeSefaz.CARTAO_DEBITO]: 'Cartão de Débito',
  [PaymentCodeSefaz.CREDITO_LOJA]: 'Crédito Loja',
  [PaymentCodeSefaz.VALE_ALIMENTACAO]: 'Vale Alimentação',
  [PaymentCodeSefaz.VALE_REFEICAO]: 'Vale Refeição',
  [PaymentCodeSefaz.VALE_PRESENTE]: 'Vale Presente',
  [PaymentCodeSefaz.VALE_COMBUSTIVEL]: 'Vale Combustível',
  [PaymentCodeSefaz.DUPLICATA_MERCANTIL]: 'Duplicata Mercantil',
  [PaymentCodeSefaz.BOLETO_BANCARIO]: 'Boleto Bancário',
  [PaymentCodeSefaz.DEPOSITO_BANCARIO]: 'Depósito Bancário',
  [PaymentCodeSefaz.PIX_DINAMICO]: 'Pagamento Instantâneo (PIX) - Dinâmico',
  [PaymentCodeSefaz.TRANSFERENCIA]: 'Transferência bancária, Carteira Digital',
  [PaymentCodeSefaz.PROGRAMA_FIDELIDADE]: 'Programa de fidelidade, Cashback, Crédito Virtual',
  [PaymentCodeSefaz.PIX_ESTATICO]: 'PIX Estático',
  [PaymentCodeSefaz.CREDITO_EM_LOJA]: 'Crédito em Loja (Private Label)',
  [PaymentCodeSefaz.PAGAMENTO_ELETRONICO_NAO_INFORMADO]: 'Pagamento Eletrônico não Informado',
  [PaymentCodeSefaz.SEM_PAGAMENTO]: 'Sem pagamento',
  [PaymentCodeSefaz.OUTROS]: 'Outros',
};
