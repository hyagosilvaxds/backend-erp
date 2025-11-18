/*
  Warnings:

  - You are about to drop the column `icmsModalidade` on the `nfe_items` table. All the data in the column will be lost.
  - You are about to drop the column `quantidade` on the `nfe_items` table. All the data in the column will be lost.
  - You are about to drop the column `unidade` on the `nfe_items` table. All the data in the column will be lost.
  - You are about to drop the column `valorOutrasDespesas` on the `nfe_items` table. All the data in the column will be lost.
  - You are about to drop the column `valorTotal` on the `nfe_items` table. All the data in the column will be lost.
  - You are about to drop the column `valorUnitario` on the `nfe_items` table. All the data in the column will be lost.
  - Added the required column `quantidadeComercial` to the `nfe_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantidadeTributavel` to the `nfe_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unidadeComercial` to the `nfe_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unidadeTributavel` to the `nfe_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `valorProduto` to the `nfe_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `valorUnitarioComercial` to the `nfe_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `valorUnitarioTributavel` to the `nfe_items` table without a default value. This is not possible if the table is not empty.
  - Made the column `codigoEAN` on table `nfe_items` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `cMunFG` to the `nfes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cNF` to the `nfes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cUF` to the `nfes` table without a default value. This is not possible if the table is not empty.
  - Made the column `destCodigoMunicipio` on table `nfes` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "NFeModalidadeFrete" AS ENUM ('EMITENTE', 'DESTINATARIO', 'TERCEIROS', 'PROPRIO_EMITENTE', 'PROPRIO_DESTINATARIO', 'SEM_FRETE');

-- CreateEnum
CREATE TYPE "NFeIndicadorPresenca" AS ENUM ('NAO_SE_APLICA', 'PRESENCIAL', 'INTERNET', 'TELEATENDIMENTO', 'NFCE_ENTREGA_DOMICILIO', 'PRESENCIAL_FORA_ESTABELECIMENTO', 'NAO_PRESENCIAL_OUTROS');

-- CreateEnum
CREATE TYPE "NFeIndicadorIntermediador" AS ENUM ('SEM_INTERMEDIADOR', 'COM_INTERMEDIADOR');

-- CreateEnum
CREATE TYPE "NFeIndicadorIEDestinatario" AS ENUM ('CONTRIBUINTE', 'ISENTO', 'NAO_CONTRIBUINTE');

-- CreateEnum
CREATE TYPE "NFeFormaPagamento" AS ENUM ('DINHEIRO', 'CHEQUE', 'CARTAO_CREDITO', 'CARTAO_DEBITO', 'CREDITO_LOJA', 'VALE_ALIMENTACAO', 'VALE_REFEICAO', 'VALE_PRESENTE', 'VALE_COMBUSTIVEL', 'DUPLICATA_MERCANTIL', 'BOLETO_BANCARIO', 'DEPOSITO_BANCARIO', 'PIX', 'TRANSFERENCIA_BANCARIA', 'CASHBACK', 'SEM_PAGAMENTO', 'OUTROS');

-- AlterTable
ALTER TABLE "companies" ADD COLUMN     "respTecCNPJ" TEXT,
ADD COLUMN     "respTecContato" TEXT,
ADD COLUMN     "respTecEmail" TEXT,
ADD COLUMN     "respTecFone" TEXT;

-- AlterTable
ALTER TABLE "nfe_items" DROP COLUMN "icmsModalidade",
DROP COLUMN "quantidade",
DROP COLUMN "unidade",
DROP COLUMN "valorOutrasDespesas",
DROP COLUMN "valorTotal",
DROP COLUMN "valorUnitario",
ADD COLUMN     "cbsAliquota" DOUBLE PRECISION,
ADD COLUMN     "cbsValor" DOUBLE PRECISION,
ADD COLUMN     "codigoEANTrib" TEXT NOT NULL DEFAULT 'SEM GTIN',
ADD COLUMN     "cofinsAliqValor" DOUBLE PRECISION,
ADD COLUMN     "cofinsQuantidade" DOUBLE PRECISION,
ADD COLUMN     "ibsBase" DOUBLE PRECISION,
ADD COLUMN     "ibsCbsClassTrib" TEXT,
ADD COLUMN     "ibsCbsCst" TEXT,
ADD COLUMN     "ibsMunAliquota" DOUBLE PRECISION,
ADD COLUMN     "ibsMunValor" DOUBLE PRECISION,
ADD COLUMN     "ibsUFAliquota" DOUBLE PRECISION,
ADD COLUMN     "ibsUFValor" DOUBLE PRECISION,
ADD COLUMN     "ibsValor" DOUBLE PRECISION,
ADD COLUMN     "icmsCSOSN" TEXT,
ADD COLUMN     "icmsFCPAliquota" DOUBLE PRECISION,
ADD COLUMN     "icmsFCPBase" DOUBLE PRECISION,
ADD COLUMN     "icmsFCPValor" DOUBLE PRECISION,
ADD COLUMN     "icmsModalidadeBC" INTEGER,
ADD COLUMN     "icmsStMVA" DOUBLE PRECISION,
ADD COLUMN     "icmsStModalidadeBC" DOUBLE PRECISION,
ADD COLUMN     "icmsStReducaoBC" DOUBLE PRECISION,
ADD COLUMN     "icmsUFDestAliquota" DOUBLE PRECISION,
ADD COLUMN     "icmsUFDestBase" DOUBLE PRECISION,
ADD COLUMN     "icmsUFDestValor" DOUBLE PRECISION,
ADD COLUMN     "icmsUFRemetAliquota" DOUBLE PRECISION,
ADD COLUMN     "icmsUFRemetValor" DOUBLE PRECISION,
ADD COLUMN     "iiBase" DOUBLE PRECISION,
ADD COLUMN     "iiDespAdu" DOUBLE PRECISION,
ADD COLUMN     "iiIOF" DOUBLE PRECISION,
ADD COLUMN     "iiValor" DOUBLE PRECISION,
ADD COLUMN     "indicadorTotal" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "pisAliqValor" DOUBLE PRECISION,
ADD COLUMN     "pisQuantidade" DOUBLE PRECISION,
ADD COLUMN     "quantidadeComercial" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "quantidadeTributavel" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "unidadeComercial" TEXT NOT NULL,
ADD COLUMN     "unidadeTributavel" TEXT NOT NULL,
ADD COLUMN     "valorOutros" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "valorProduto" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "valorUnitarioComercial" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "valorUnitarioTributavel" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "codigoEAN" SET NOT NULL,
ALTER COLUMN "codigoEAN" SET DEFAULT 'SEM GTIN';

-- AlterTable
ALTER TABLE "nfes" ADD COLUMN     "cDV" TEXT,
ADD COLUMN     "cMunFG" TEXT NOT NULL,
ADD COLUMN     "cNF" TEXT NOT NULL,
ADD COLUMN     "cUF" TEXT NOT NULL,
ADD COLUMN     "destCodigoPais" TEXT NOT NULL DEFAULT '1058',
ADD COLUMN     "idDest" INTEGER NOT NULL DEFAULT 2,
ADD COLUMN     "indFinal" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "indIEDest" INTEGER NOT NULL DEFAULT 9,
ADD COLUMN     "indIntermed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "indPres" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "indicadorPagamento" INTEGER,
ADD COLUMN     "meioPagamento" TEXT,
ADD COLUMN     "procEmi" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "respTecCNPJ" TEXT,
ADD COLUMN     "respTecContato" TEXT,
ADD COLUMN     "respTecEmail" TEXT,
ADD COLUMN     "respTecFone" TEXT,
ADD COLUMN     "tpEmis" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "tpImp" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "transportadoraCidade" TEXT,
ADD COLUMN     "transportadoraEndereco" TEXT,
ADD COLUMN     "transportadoraIE" TEXT,
ADD COLUMN     "transportadoraUF" TEXT,
ADD COLUMN     "valorFCP" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "valorFCPST" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "valorFCPSTRet" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "valorICMSDeson" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "valorII" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "valorIPIDevol" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "valorPagamento" DOUBLE PRECISION,
ADD COLUMN     "valorTroco" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "verProc" TEXT NOT NULL DEFAULT '1.0',
ALTER COLUMN "destCodigoMunicipio" SET NOT NULL;
