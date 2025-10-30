-- CreateTable
CREATE TABLE "product_categories" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "parentId" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_units" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "abbreviation" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_brands" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sku" TEXT,
    "barcode" TEXT,
    "reference" TEXT,
    "categoryId" TEXT,
    "brandId" TEXT,
    "costPrice" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "profitMargin" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "salePrice" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "salePriceInstallment" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "minSalePrice" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "wholesalePrice" DECIMAL(10,2),
    "minWholesaleQty" INTEGER,
    "manageStock" BOOLEAN NOT NULL DEFAULT true,
    "currentStock" DECIMAL(10,3) NOT NULL DEFAULT 0,
    "initialStock" DECIMAL(10,3) NOT NULL DEFAULT 0,
    "minStock" DECIMAL(10,3) NOT NULL DEFAULT 0,
    "maxStock" DECIMAL(10,3),
    "unitId" TEXT,
    "dimensionType" TEXT,
    "width" DECIMAL(10,2),
    "height" DECIMAL(10,2),
    "length" DECIMAL(10,2),
    "weight" DECIMAL(10,3),
    "grossWeight" DECIMAL(10,3),
    "expiryAlertDays" INTEGER,
    "warrantyPeriod" INTEGER,
    "productType" TEXT NOT NULL DEFAULT 'SIMPLE',
    "isComposite" BOOLEAN NOT NULL DEFAULT false,
    "hasVariations" BOOLEAN NOT NULL DEFAULT false,
    "isCombo" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "availability" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "notes" TEXT,
    "ncm" TEXT,
    "cest" TEXT,
    "origin" TEXT,
    "icmsCst" TEXT,
    "icmsRate" DECIMAL(5,2),
    "icmsModBc" TEXT,
    "ipiCst" TEXT,
    "ipiRate" DECIMAL(5,2),
    "pisCst" TEXT,
    "pisRate" DECIMAL(5,2),
    "cofinsCst" TEXT,
    "cofinsRate" DECIMAL(5,2),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_photos" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_variations" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sku" TEXT,
    "barcode" TEXT,
    "costPrice" DECIMAL(10,2),
    "salePrice" DECIMAL(10,2),
    "salePriceInstallment" DECIMAL(10,2),
    "currentStock" DECIMAL(10,3) NOT NULL DEFAULT 0,
    "attributes" JSONB NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_variations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_composites" (
    "id" TEXT NOT NULL,
    "compositeId" TEXT NOT NULL,
    "componentId" TEXT NOT NULL,
    "quantity" DECIMAL(10,3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_composites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_combos" (
    "id" TEXT NOT NULL,
    "comboId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "quantity" DECIMAL(10,3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_combos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_stock_movements" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "quantity" DECIMAL(10,3) NOT NULL,
    "previousStock" DECIMAL(10,3) NOT NULL,
    "newStock" DECIMAL(10,3) NOT NULL,
    "reason" TEXT,
    "notes" TEXT,
    "reference" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_stock_movements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "product_categories_companyId_idx" ON "product_categories"("companyId");

-- CreateIndex
CREATE INDEX "product_categories_parentId_idx" ON "product_categories"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "product_categories_companyId_name_parentId_key" ON "product_categories"("companyId", "name", "parentId");

-- CreateIndex
CREATE INDEX "product_units_companyId_idx" ON "product_units"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "product_units_companyId_abbreviation_key" ON "product_units"("companyId", "abbreviation");

-- CreateIndex
CREATE INDEX "product_brands_companyId_idx" ON "product_brands"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "product_brands_companyId_name_key" ON "product_brands"("companyId", "name");

-- CreateIndex
CREATE INDEX "products_companyId_idx" ON "products"("companyId");

-- CreateIndex
CREATE INDEX "products_categoryId_idx" ON "products"("categoryId");

-- CreateIndex
CREATE INDEX "products_brandId_idx" ON "products"("brandId");

-- CreateIndex
CREATE INDEX "products_unitId_idx" ON "products"("unitId");

-- CreateIndex
CREATE INDEX "products_barcode_idx" ON "products"("barcode");

-- CreateIndex
CREATE INDEX "products_sku_idx" ON "products"("sku");

-- CreateIndex
CREATE INDEX "products_active_idx" ON "products"("active");

-- CreateIndex
CREATE INDEX "products_productType_idx" ON "products"("productType");

-- CreateIndex
CREATE UNIQUE INDEX "products_companyId_barcode_key" ON "products"("companyId", "barcode");

-- CreateIndex
CREATE UNIQUE INDEX "products_companyId_sku_key" ON "products"("companyId", "sku");

-- CreateIndex
CREATE INDEX "product_photos_productId_idx" ON "product_photos"("productId");

-- CreateIndex
CREATE INDEX "product_photos_documentId_idx" ON "product_photos"("documentId");

-- CreateIndex
CREATE INDEX "product_variations_productId_idx" ON "product_variations"("productId");

-- CreateIndex
CREATE INDEX "product_variations_barcode_idx" ON "product_variations"("barcode");

-- CreateIndex
CREATE UNIQUE INDEX "product_variations_productId_sku_key" ON "product_variations"("productId", "sku");

-- CreateIndex
CREATE INDEX "product_composites_compositeId_idx" ON "product_composites"("compositeId");

-- CreateIndex
CREATE INDEX "product_composites_componentId_idx" ON "product_composites"("componentId");

-- CreateIndex
CREATE UNIQUE INDEX "product_composites_compositeId_componentId_key" ON "product_composites"("compositeId", "componentId");

-- CreateIndex
CREATE INDEX "product_combos_comboId_idx" ON "product_combos"("comboId");

-- CreateIndex
CREATE INDEX "product_combos_itemId_idx" ON "product_combos"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "product_combos_comboId_itemId_key" ON "product_combos"("comboId", "itemId");

-- CreateIndex
CREATE INDEX "product_stock_movements_companyId_idx" ON "product_stock_movements"("companyId");

-- CreateIndex
CREATE INDEX "product_stock_movements_productId_idx" ON "product_stock_movements"("productId");

-- CreateIndex
CREATE INDEX "product_stock_movements_type_idx" ON "product_stock_movements"("type");

-- CreateIndex
CREATE INDEX "product_stock_movements_createdAt_idx" ON "product_stock_movements"("createdAt");

-- AddForeignKey
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "product_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_units" ADD CONSTRAINT "product_units_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_brands" ADD CONSTRAINT "product_brands_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "product_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "product_brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "product_units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_photos" ADD CONSTRAINT "product_photos_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variations" ADD CONSTRAINT "product_variations_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_composites" ADD CONSTRAINT "product_composites_compositeId_fkey" FOREIGN KEY ("compositeId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_composites" ADD CONSTRAINT "product_composites_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_combos" ADD CONSTRAINT "product_combos_comboId_fkey" FOREIGN KEY ("comboId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_combos" ADD CONSTRAINT "product_combos_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_stock_movements" ADD CONSTRAINT "product_stock_movements_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_stock_movements" ADD CONSTRAINT "product_stock_movements_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
