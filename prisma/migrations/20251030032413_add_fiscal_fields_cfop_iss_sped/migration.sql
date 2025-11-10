-- AlterTable
ALTER TABLE "products" ADD COLUMN     "cfopEntradaEstadual" TEXT,
ADD COLUMN     "cfopEntradaInterestadual" TEXT,
ADD COLUMN     "cfopEstadual" TEXT,
ADD COLUMN     "cfopInterestadual" TEXT,
ADD COLUMN     "codigoServico" TEXT,
ADD COLUMN     "issRate" DECIMAL(5,2),
ADD COLUMN     "itemListaServico" TEXT,
ADD COLUMN     "tipoItemSped" TEXT,
ADD COLUMN     "tipoProduto" TEXT DEFAULT 'PRODUTO';
