/*
  Warnings:

  - You are about to drop the column `name` on the `companies` table. All the data in the column will be lost.
  - Added the required column `razaoSocial` to the `companies` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "companies" DROP COLUMN "name",
ADD COLUMN     "bairro" TEXT,
ADD COLUMN     "celular" TEXT,
ADD COLUMN     "cep" TEXT,
ADD COLUMN     "cidade" TEXT,
ADD COLUMN     "cnaePrincipal" TEXT,
ADD COLUMN     "cnaeSecundarios" TEXT[],
ADD COLUMN     "complemento" TEXT,
ADD COLUMN     "dataAbertura" TIMESTAMP(3),
ADD COLUMN     "email" TEXT,
ADD COLUMN     "estado" TEXT,
ADD COLUMN     "inscricaoEstadual" TEXT,
ADD COLUMN     "inscricaoMunicipal" TEXT,
ADD COLUMN     "logradouro" TEXT,
ADD COLUMN     "nomeFantasia" TEXT,
ADD COLUMN     "numero" TEXT,
ADD COLUMN     "pais" TEXT NOT NULL DEFAULT 'Brasil',
ADD COLUMN     "razaoSocial" TEXT NOT NULL,
ADD COLUMN     "regimeTributario" TEXT,
ADD COLUMN     "site" TEXT,
ADD COLUMN     "situacaoCadastral" TEXT NOT NULL DEFAULT 'Ativa',
ADD COLUMN     "telefone" TEXT;
