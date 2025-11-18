/*
  Warnings:

  - Added the required column `sefazCode` to the `payment_methods` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentCodeSefaz" AS ENUM ('DINHEIRO', 'CHEQUE', 'CARTAO_CREDITO', 'CARTAO_DEBITO', 'CREDITO_LOJA', 'VALE_ALIMENTACAO', 'VALE_REFEICAO', 'VALE_PRESENTE', 'VALE_COMBUSTIVEL', 'DUPLICATA_MERCANTIL', 'BOLETO_BANCARIO', 'DEPOSITO_BANCARIO', 'PIX_DINAMICO', 'TRANSFERENCIA', 'PROGRAMA_FIDELIDADE', 'PIX_ESTATICO', 'CREDITO_EM_LOJA', 'PAGAMENTO_ELETRONICO_NAO_INFORMADO', 'SEM_PAGAMENTO', 'OUTROS');

-- AlterTable
ALTER TABLE "payment_methods" ADD COLUMN     "sefazCode" TEXT NOT NULL;
