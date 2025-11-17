-- CreateEnum
CREATE TYPE "NFeStatus" AS ENUM ('DRAFT', 'IN_PROCESS', 'AUTHORIZED', 'REJECTED', 'CANCELED', 'DENIED', 'CONTINGENCY');

-- CreateEnum
CREATE TYPE "NFeEventType" AS ENUM ('CANCELAMENTO', 'CARTA_CORRECAO', 'CONFIRMACAO_OPERACAO', 'CIENCIA_OPERACAO', 'DESCONHECIMENTO_OPERACAO', 'OPERACAO_NAO_REALIZADA');

-- CreateTable
CREATE TABLE "nfes" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "saleId" TEXT,
    "numero" INTEGER NOT NULL,
    "serie" TEXT NOT NULL,
    "modelo" TEXT NOT NULL DEFAULT '55',
    "chaveAcesso" TEXT,
    "status" "NFeStatus" NOT NULL DEFAULT 'DRAFT',
    "naturezaOperacao" TEXT NOT NULL,
    "tipoOperacao" INTEGER NOT NULL DEFAULT 1,
    "finalidade" INTEGER NOT NULL DEFAULT 1,
    "destinatarioId" TEXT,
    "destinatarioNome" TEXT NOT NULL,
    "destinatarioCnpjCpf" TEXT NOT NULL,
    "destinatarioIe" TEXT,
    "destinatarioEmail" TEXT,
    "destinatarioTelefone" TEXT,
    "destLogradouro" TEXT NOT NULL,
    "destNumero" TEXT NOT NULL,
    "destComplemento" TEXT,
    "destBairro" TEXT NOT NULL,
    "destCidade" TEXT NOT NULL,
    "destEstado" TEXT NOT NULL,
    "destCep" TEXT NOT NULL,
    "destPais" TEXT NOT NULL DEFAULT 'Brasil',
    "destCodigoMunicipio" TEXT,
    "valorProdutos" DOUBLE PRECISION NOT NULL,
    "valorFrete" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "valorSeguro" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "valorDesconto" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "valorOutrasDespesas" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "valorIPI" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "valorICMS" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "valorICMSST" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "valorPIS" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "valorCOFINS" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "valorTotal" DOUBLE PRECISION NOT NULL,
    "valorTributosFederais" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "valorTributosEstaduais" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "valorTributosMunicipais" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "valorTributosTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "modalidadeFrete" INTEGER NOT NULL DEFAULT 9,
    "transportadoraNome" TEXT,
    "transportadoraCnpjCpf" TEXT,
    "veiculoPlaca" TEXT,
    "veiculoUF" TEXT,
    "volumeQuantidade" DOUBLE PRECISION,
    "volumeEspecie" TEXT,
    "volumeMarca" TEXT,
    "volumeNumeracao" TEXT,
    "volumePesoLiquido" DOUBLE PRECISION,
    "volumePesoBruto" DOUBLE PRECISION,
    "informacoesComplementares" TEXT,
    "informacoesFisco" TEXT,
    "dataEmissao" TIMESTAMP(3),
    "dataSaida" TIMESTAMP(3),
    "protocoloAutorizacao" TEXT,
    "dataAutorizacao" TIMESTAMP(3),
    "xmlEnviado" TEXT,
    "xmlRetorno" TEXT,
    "xmlAutorizado" TEXT,
    "danfePdfPath" TEXT,
    "canceladaEm" TIMESTAMP(3),
    "motivoCancelamento" TEXT,
    "protocoloCancelamento" TEXT,
    "emContingencia" BOOLEAN NOT NULL DEFAULT false,
    "tipoContingencia" TEXT,
    "justificativaContingencia" TEXT,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nfes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nfe_items" (
    "id" TEXT NOT NULL,
    "nfeId" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "productId" TEXT,
    "codigoProduto" TEXT NOT NULL,
    "codigoEAN" TEXT,
    "descricao" TEXT NOT NULL,
    "ncm" TEXT NOT NULL,
    "cest" TEXT,
    "cfop" TEXT NOT NULL,
    "unidade" TEXT NOT NULL,
    "quantidade" DOUBLE PRECISION NOT NULL,
    "valorUnitario" DOUBLE PRECISION NOT NULL,
    "valorTotal" DOUBLE PRECISION NOT NULL,
    "valorDesconto" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "valorFrete" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "valorSeguro" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "valorOutrasDespesas" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "icmsCst" TEXT,
    "icmsOrigem" INTEGER,
    "icmsModalidade" INTEGER,
    "icmsAliquota" DOUBLE PRECISION,
    "icmsBase" DOUBLE PRECISION,
    "icmsValor" DOUBLE PRECISION,
    "icmsStBase" DOUBLE PRECISION,
    "icmsStAliquota" DOUBLE PRECISION,
    "icmsStValor" DOUBLE PRECISION,
    "ipiCst" TEXT,
    "ipiAliquota" DOUBLE PRECISION,
    "ipiBase" DOUBLE PRECISION,
    "ipiValor" DOUBLE PRECISION,
    "pisCst" TEXT,
    "pisAliquota" DOUBLE PRECISION,
    "pisBase" DOUBLE PRECISION,
    "pisValor" DOUBLE PRECISION,
    "cofinsCst" TEXT,
    "cofinsAliquota" DOUBLE PRECISION,
    "cofinsBase" DOUBLE PRECISION,
    "cofinsValor" DOUBLE PRECISION,
    "informacoesAdicionais" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nfe_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nfe_events" (
    "id" TEXT NOT NULL,
    "nfeId" TEXT NOT NULL,
    "tipo" "NFeEventType" NOT NULL,
    "sequencia" INTEGER NOT NULL DEFAULT 1,
    "descricao" TEXT NOT NULL,
    "justificativa" TEXT,
    "protocolo" TEXT,
    "dataEvento" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "xmlEnviado" TEXT,
    "xmlRetorno" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PROCESSADO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nfe_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "nfes_chaveAcesso_key" ON "nfes"("chaveAcesso");

-- CreateIndex
CREATE INDEX "nfes_companyId_idx" ON "nfes"("companyId");

-- CreateIndex
CREATE INDEX "nfes_saleId_idx" ON "nfes"("saleId");

-- CreateIndex
CREATE INDEX "nfes_status_idx" ON "nfes"("status");

-- CreateIndex
CREATE INDEX "nfes_chaveAcesso_idx" ON "nfes"("chaveAcesso");

-- CreateIndex
CREATE INDEX "nfes_dataEmissao_idx" ON "nfes"("dataEmissao");

-- CreateIndex
CREATE UNIQUE INDEX "nfes_companyId_serie_numero_key" ON "nfes"("companyId", "serie", "numero");

-- CreateIndex
CREATE INDEX "nfe_items_nfeId_idx" ON "nfe_items"("nfeId");

-- CreateIndex
CREATE INDEX "nfe_events_nfeId_idx" ON "nfe_events"("nfeId");

-- CreateIndex
CREATE INDEX "nfe_events_tipo_idx" ON "nfe_events"("tipo");

-- AddForeignKey
ALTER TABLE "nfes" ADD CONSTRAINT "nfes_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nfes" ADD CONSTRAINT "nfes_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "sales"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nfes" ADD CONSTRAINT "nfes_destinatarioId_fkey" FOREIGN KEY ("destinatarioId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nfe_items" ADD CONSTRAINT "nfe_items_nfeId_fkey" FOREIGN KEY ("nfeId") REFERENCES "nfes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nfe_items" ADD CONSTRAINT "nfe_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nfe_events" ADD CONSTRAINT "nfe_events_nfeId_fkey" FOREIGN KEY ("nfeId") REFERENCES "nfes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
