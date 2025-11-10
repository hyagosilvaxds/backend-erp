-- CreateTable
CREATE TABLE "legal_document_categories" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "icon" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "legal_document_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "legal_documents" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "categoryId" TEXT,
    "documentId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "reference" TEXT,
    "parties" JSONB,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ATIVO',
    "value" DECIMAL(15,2),
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "notes" TEXT,
    "tags" TEXT[],
    "alertDays" INTEGER DEFAULT 30,
    "createdById" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "legal_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "legal_document_categories_companyId_idx" ON "legal_document_categories"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "legal_document_categories_companyId_name_key" ON "legal_document_categories"("companyId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "legal_documents_documentId_key" ON "legal_documents"("documentId");

-- CreateIndex
CREATE INDEX "legal_documents_companyId_idx" ON "legal_documents"("companyId");

-- CreateIndex
CREATE INDEX "legal_documents_categoryId_idx" ON "legal_documents"("categoryId");

-- CreateIndex
CREATE INDEX "legal_documents_documentId_idx" ON "legal_documents"("documentId");

-- CreateIndex
CREATE INDEX "legal_documents_type_idx" ON "legal_documents"("type");

-- CreateIndex
CREATE INDEX "legal_documents_status_idx" ON "legal_documents"("status");

-- CreateIndex
CREATE INDEX "legal_documents_reference_idx" ON "legal_documents"("reference");

-- CreateIndex
CREATE INDEX "legal_documents_dueDate_idx" ON "legal_documents"("dueDate");

-- AddForeignKey
ALTER TABLE "legal_document_categories" ADD CONSTRAINT "legal_document_categories_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "legal_documents" ADD CONSTRAINT "legal_documents_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "legal_documents" ADD CONSTRAINT "legal_documents_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "legal_document_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "legal_documents" ADD CONSTRAINT "legal_documents_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "legal_documents" ADD CONSTRAINT "legal_documents_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
