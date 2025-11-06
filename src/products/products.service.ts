import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { DocumentsService } from '../documents/documents.service';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { UpdateProductCategoryDto } from './dto/update-product-category.dto';
import { CreateProductUnitDto } from './dto/create-product-unit.dto';
import { UpdateProductUnitDto } from './dto/update-product-unit.dto';
import { CreateProductBrandDto } from './dto/create-product-brand.dto';
import { UpdateProductBrandDto } from './dto/update-product-brand.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    private documentsService: DocumentsService,
  ) {}

  // ==================== CATEGORIAS ====================

  async createCategory(dto: CreateProductCategoryDto, companyId: string, userId: string) {
    // Verificar se categoria pai existe (se fornecida)
    if (dto.parentId) {
      const parent = await this.prisma.productCategory.findUnique({
        where: { id: dto.parentId },
      });

      if (!parent || parent.companyId !== companyId) {
        throw new NotFoundException('Categoria pai não encontrada');
      }
    }

    // Verificar duplicação
    const existing = await this.prisma.productCategory.findFirst({
      where: {
        companyId,
        name: dto.name,
        parentId: dto.parentId || null,
      },
    });

    if (existing) {
      throw new ConflictException('Já existe uma categoria com este nome');
    }

    const category = await this.prisma.productCategory.create({
      data: {
        ...dto,
        companyId,
      },
      include: {
        parent: true,
        subcategories: true,
      },
    });

    // Registrar auditoria
    await this.auditService.log({
      companyId,
      userId,
      action: 'CREATE_PRODUCT_CATEGORY',
      entityType: 'ProductCategory',
      description: `Categoria "${category.name}" criada`,
      newValue: JSON.stringify(category),
    });

    return category;
  }

  async findAllCategories(companyId: string, parentId?: string) {
    const where: any = { companyId };
    
    if (parentId !== undefined) {
      where.parentId = parentId === 'null' ? null : parentId;
    }

    return this.prisma.productCategory.findMany({
      where,
      include: {
        parent: true,
        subcategories: true,
        _count: {
          select: {
            products: true,
            subcategories: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findCategoryById(id: string, companyId: string) {
    const category = await this.prisma.productCategory.findUnique({
      where: { id },
      include: {
        parent: true,
        subcategories: true,
        _count: {
          select: {
            products: true,
            subcategories: true,
          },
        },
      },
    });

    if (!category || category.companyId !== companyId) {
      throw new NotFoundException('Categoria não encontrada');
    }

    return category;
  }

  async updateCategory(id: string, dto: UpdateProductCategoryDto, companyId: string, userId: string) {
    const category = await this.findCategoryById(id, companyId);

    // Verificar duplicação se nome mudou
    if (dto.name && dto.name !== category.name) {
      const existing = await this.prisma.productCategory.findFirst({
        where: {
          companyId,
          name: dto.name,
          parentId: dto.parentId !== undefined ? dto.parentId : category.parentId,
          id: { not: id },
        },
      });

      if (existing) {
        throw new ConflictException('Já existe uma categoria com este nome');
      }
    }

    const updatedCategory = await this.prisma.productCategory.update({
      where: { id },
      data: dto,
      include: {
        parent: true,
        subcategories: true,
      },
    });

    // Registrar auditoria
    await this.auditService.log({
      companyId,
      userId,
      action: 'UPDATE_PRODUCT_CATEGORY',
      entityType: 'ProductCategory',
      description: `Categoria "${updatedCategory.name}" atualizada`,
      oldValue: JSON.stringify(category),
      newValue: JSON.stringify(updatedCategory),
    });

    return updatedCategory;
  }

  async deleteCategory(id: string, companyId: string, userId: string) {
    const category = await this.findCategoryById(id, companyId);

    // Verificar se tem produtos ou subcategorias
    const hasProducts = await this.prisma.product.count({
      where: { categoryId: id },
    });

    const hasSubcategories = await this.prisma.productCategory.count({
      where: { parentId: id },
    });

    if (hasProducts > 0) {
      throw new BadRequestException(
        `Não é possível deletar categoria com ${hasProducts} produto(s) vinculado(s)`,
      );
    }

    if (hasSubcategories > 0) {
      throw new BadRequestException(
        `Não é possível deletar categoria com ${hasSubcategories} subcategoria(s)`,
      );
    }

    await this.prisma.productCategory.delete({
      where: { id },
    });

    // Registrar auditoria
    await this.auditService.log({
      companyId,
      userId,
      action: 'DELETE_PRODUCT_CATEGORY',
      entityType: 'ProductCategory',
      description: `Categoria "${category.name}" deletada`,
      oldValue: JSON.stringify(category),
    });
  }

  // ==================== UNIDADES ====================

  async createUnit(dto: CreateProductUnitDto, companyId: string) {
    // Verificar duplicação
    const existing = await this.prisma.productUnit.findFirst({
      where: {
        companyId,
        abbreviation: dto.abbreviation,
      },
    });

    if (existing) {
      throw new ConflictException('Já existe uma unidade com esta abreviação');
    }

    return this.prisma.productUnit.create({
      data: {
        ...dto,
        companyId,
      },
    });
  }

  async findAllUnits(companyId: string) {
    return this.prisma.productUnit.findMany({
      where: { companyId },
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findUnitById(id: string, companyId: string) {
    const unit = await this.prisma.productUnit.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!unit || unit.companyId !== companyId) {
      throw new NotFoundException('Unidade não encontrada');
    }

    return unit;
  }

  async updateUnit(id: string, dto: UpdateProductUnitDto, companyId: string) {
    const unit = await this.findUnitById(id, companyId);

    // Verificar duplicação se abreviação mudou
    if (dto.abbreviation && dto.abbreviation !== unit.abbreviation) {
      const existing = await this.prisma.productUnit.findFirst({
        where: {
          companyId,
          abbreviation: dto.abbreviation,
          id: { not: id },
        },
      });

      if (existing) {
        throw new ConflictException('Já existe uma unidade com esta abreviação');
      }
    }

    return this.prisma.productUnit.update({
      where: { id },
      data: dto,
    });
  }

  async deleteUnit(id: string, companyId: string) {
    const unit = await this.findUnitById(id, companyId);

    // Verificar se tem produtos
    const hasProducts = await this.prisma.product.count({
      where: { unitId: id },
    });

    if (hasProducts > 0) {
      throw new BadRequestException(
        `Não é possível deletar unidade com ${hasProducts} produto(s) vinculado(s)`,
      );
    }

    await this.prisma.productUnit.delete({
      where: { id },
    });
  }

  // ==================== MARCAS ====================

  async createBrand(dto: CreateProductBrandDto, companyId: string) {
    // Verificar duplicação
    const existing = await this.prisma.productBrand.findFirst({
      where: {
        companyId,
        name: dto.name,
      },
    });

    if (existing) {
      throw new ConflictException('Já existe uma marca com este nome');
    }

    return this.prisma.productBrand.create({
      data: {
        ...dto,
        companyId,
      },
    });
  }

  async findAllBrands(companyId: string) {
    return this.prisma.productBrand.findMany({
      where: { companyId },
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findBrandById(id: string, companyId: string) {
    const brand = await this.prisma.productBrand.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!brand || brand.companyId !== companyId) {
      throw new NotFoundException('Marca não encontrada');
    }

    return brand;
  }

  async updateBrand(id: string, dto: UpdateProductBrandDto, companyId: string) {
    const brand = await this.findBrandById(id, companyId);

    // Verificar duplicação se nome mudou
    if (dto.name && dto.name !== brand.name) {
      const existing = await this.prisma.productBrand.findFirst({
        where: {
          companyId,
          name: dto.name,
          id: { not: id },
        },
      });

      if (existing) {
        throw new ConflictException('Já existe uma marca com este nome');
      }
    }

    return this.prisma.productBrand.update({
      where: { id },
      data: dto,
    });
  }

  async deleteBrand(id: string, companyId: string) {
    const brand = await this.findBrandById(id, companyId);

    // Verificar se tem produtos
    const hasProducts = await this.prisma.product.count({
      where: { brandId: id },
    });

    if (hasProducts > 0) {
      throw new BadRequestException(
        `Não é possível deletar marca com ${hasProducts} produto(s) vinculado(s)`,
      );
    }

    await this.prisma.productBrand.delete({
      where: { id },
    });
  }

  // ==================== PRODUTOS ====================

  async createProduct(dto: CreateProductDto, companyId: string, userId: string) {
    // Normalizar 'type' para 'productType' se enviado
    if (dto.type && !dto.productType) {
      dto.productType = dto.type;
    }
    delete dto.type; // Remove 'type' para evitar conflito no Prisma

    // Verificar se categoria existe
    if (dto.categoryId) {
      const category = await this.prisma.productCategory.findUnique({
        where: { id: dto.categoryId },
      });

      if (!category || category.companyId !== companyId) {
        throw new NotFoundException('Categoria não encontrada');
      }
    }

    // Verificar se marca existe
    if (dto.brandId) {
      const brand = await this.prisma.productBrand.findUnique({
        where: { id: dto.brandId },
      });

      if (!brand || brand.companyId !== companyId) {
        throw new NotFoundException('Marca não encontrada');
      }
    }

    // Verificar se unidade existe
    if (dto.unitId) {
      const unit = await this.prisma.productUnit.findUnique({
        where: { id: dto.unitId },
      });

      if (!unit || unit.companyId !== companyId) {
        throw new NotFoundException('Unidade não encontrada');
      }
    }

    // Verificar duplicação de barcode
    if (dto.barcode) {
      const existing = await this.prisma.product.findFirst({
        where: {
          companyId,
          barcode: dto.barcode,
        },
      });

      if (existing) {
        throw new ConflictException('Já existe um produto com este código de barras');
      }
    }

    // Verificar duplicação de SKU
    if (dto.sku) {
      const existing = await this.prisma.product.findFirst({
        where: {
          companyId,
          sku: dto.sku,
        },
      });

      if (existing) {
        throw new ConflictException('Já existe um produto com este SKU');
      }
    }

    // Calcular estoque total inicial
    let totalInitialStock = 0;
    if (dto.manageStock && dto.initialStockByLocations && dto.initialStockByLocations.length > 0) {
      totalInitialStock = dto.initialStockByLocations.reduce((sum, stock) => sum + stock.quantity, 0);
    }

    // Validar locais de estoque se fornecidos
    if (dto.manageStock && dto.initialStockByLocations && dto.initialStockByLocations.length > 0) {
      for (const stockByLocation of dto.initialStockByLocations) {
        const location = await this.prisma.stockLocation.findUnique({
          where: { id: stockByLocation.locationId },
        });

        if (!location || location.companyId !== companyId) {
          throw new NotFoundException(`Local de estoque ${stockByLocation.locationId} não encontrado`);
        }

        if (!location.active) {
          throw new BadRequestException(`Local de estoque "${location.name}" está inativo`);
        }
      }
    }

    // Preparar dados do produto (remover campo que não existe no schema)
    const { initialStockByLocations, ...productData } = dto;

    // Criar produto
    const product = await this.prisma.product.create({
      data: {
        ...productData,
        companyId,
        createdById: userId,
        currentStock: totalInitialStock,
      },
      include: {
        category: true,
        brand: true,
        unit: true,
        photos: true,
      },
    });

    // Criar estoque inicial em múltiplos locais
    if (dto.manageStock && dto.initialStockByLocations && dto.initialStockByLocations.length > 0) {
      for (const stockByLocation of dto.initialStockByLocations) {
        // Criar estoque no local
        await this.prisma.productStockByLocation.create({
          data: {
            companyId,
            productId: product.id,
            locationId: stockByLocation.locationId,
            quantity: stockByLocation.quantity,
          },
        });

        // Registrar movimentação para cada local
        await this.prisma.productStockMovement.create({
          data: {
            companyId,
            productId: product.id,
            type: 'ENTRY',
            quantity: stockByLocation.quantity,
            previousStock: 0,
            newStock: stockByLocation.quantity,
            reason: 'Estoque inicial',
            locationId: stockByLocation.locationId,
            userId,
          },
        });
      }
    }

    // Registrar auditoria
    await this.auditService.log({
      companyId,
      userId,
      action: 'CREATE_PRODUCT',
      entityType: 'Product',
      description: `Produto "${product.name}" (SKU: ${product.sku || 'N/A'}) criado`,
      newValue: JSON.stringify(product),
    });

    return product;
  }

  async findAllProducts(companyId: string, query: QueryProductsDto) {
    const { page = 1, limit = 50, search, categoryId, brandId, productType, availability, active, lowStock } = query;
    
    const where: any = { companyId };

    // Filtro de busca
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { barcode: { contains: search, mode: 'insensitive' } },
        { reference: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categoryId) where.categoryId = categoryId;
    if (brandId) where.brandId = brandId;
    if (productType) where.productType = productType;
    if (availability) where.availability = availability;
    if (active !== undefined) where.active = active;

    // Buscar todos os produtos primeiro
    const allProducts = await this.prisma.product.findMany({
      where,
      include: {
        category: true,
        brand: true,
        unit: true,
        photos: {
          where: { isPrimary: true },
          take: 1,
        },
        _count: {
          select: {
            photos: true,
            variations: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    // Filtrar produtos com estoque baixo se necessário
    let filteredProducts = allProducts;
    if (lowStock) {
      filteredProducts = allProducts.filter(
        (p) => p.manageStock && p.currentStock <= p.minStock,
      );
    }

    const total = filteredProducts.length;
    const skip = (page - 1) * limit;
    const products = filteredProducts.slice(skip, skip + limit);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      products,
    };
  }

  async findProductById(id: string, companyId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true,
        unit: true,
        photos: {
          orderBy: { order: 'asc' },
        },
        variations: {
          where: { active: true },
        },
        compositeItems: {
          include: {
            component: {
              select: {
                id: true,
                name: true,
                sku: true,
                unit: true,
              },
            },
          },
        },
        comboItems: {
          include: {
            item: {
              select: {
                id: true,
                name: true,
                sku: true,
                salePrice: true,
                unit: true,
              },
            },
          },
        },
        // Incluir estoque por local
        stocksByLocation: {
          include: {
            location: {
              select: {
                id: true,
                name: true,
                code: true,
                description: true,
                address: true,
                isDefault: true,
                active: true,
              },
            },
          },
          orderBy: {
            location: {
              name: 'asc',
            },
          },
        },
      },
    });

    if (!product || product.companyId !== companyId) {
      throw new NotFoundException('Produto não encontrado');
    }

    // Calcular estatísticas de estoque
    const stockSummary = {
      totalStock: product.currentStock.toNumber(),
      stockByLocations: product.stocksByLocation.map(stock => ({
        locationId: stock.location.id,
        locationName: stock.location.name,
        locationCode: stock.location.code,
        quantity: stock.quantity.toNumber(),
        isDefault: stock.location.isDefault,
        active: stock.location.active,
        address: stock.location.address,
        updatedAt: stock.updatedAt,
      })),
      locationsCount: product.stocksByLocation.length,
      locationsWithStock: product.stocksByLocation.filter(s => s.quantity.toNumber() > 0).length,
      locationsOutOfStock: product.stocksByLocation.filter(s => s.quantity.toNumber() === 0).length,
    };

    return {
      ...product,
      stockSummary,
    };
  }

  async updateProduct(id: string, dto: UpdateProductDto, companyId: string, userId: string) {
    const product = await this.findProductById(id, companyId);

    // Verificar categoria
    if (dto.categoryId) {
      const category = await this.prisma.productCategory.findUnique({
        where: { id: dto.categoryId },
      });

      if (!category || category.companyId !== companyId) {
        throw new NotFoundException('Categoria não encontrada');
      }
    }

    // Verificar marca
    if (dto.brandId) {
      const brand = await this.prisma.productBrand.findUnique({
        where: { id: dto.brandId },
      });

      if (!brand || brand.companyId !== companyId) {
        throw new NotFoundException('Marca não encontrada');
      }
    }

    // Verificar unidade
    if (dto.unitId) {
      const unit = await this.prisma.productUnit.findUnique({
        where: { id: dto.unitId },
      });

      if (!unit || unit.companyId !== companyId) {
        throw new NotFoundException('Unidade não encontrada');
      }
    }

    // Verificar duplicação de barcode
    if (dto.barcode && dto.barcode !== product.barcode) {
      const existing = await this.prisma.product.findFirst({
        where: {
          companyId,
          barcode: dto.barcode,
          id: { not: id },
        },
      });

      if (existing) {
        throw new ConflictException('Já existe um produto com este código de barras');
      }
    }

    // Verificar duplicação de SKU
    if (dto.sku && dto.sku !== product.sku) {
      const existing = await this.prisma.product.findFirst({
        where: {
          companyId,
          sku: dto.sku,
          id: { not: id },
        },
      });

      if (existing) {
        throw new ConflictException('Já existe um produto com este SKU');
      }
    }

    // Preparar dados para atualização (remover campos de relacionamento)
    const { categoryId, brandId, unitId, type, ...updateData } = dto;
    
    // Construir objeto de atualização com relacionamentos corretos
    const data: any = {
      ...updateData,
    };

    // Adicionar relacionamentos usando connect/disconnect
    if (categoryId !== undefined) {
      data.category = categoryId ? { connect: { id: categoryId } } : { disconnect: true };
    }

    if (brandId !== undefined) {
      data.brand = brandId ? { connect: { id: brandId } } : { disconnect: true };
    }

    if (unitId !== undefined) {
      data.unit = unitId ? { connect: { id: unitId } } : { disconnect: true };
    }

    // Tratar campo type -> productType
    if (type) {
      data.productType = type;
    }

    const updatedProduct = await this.prisma.product.update({
      where: { id },
      data,
      include: {
        category: true,
        brand: true,
        unit: true,
        photos: true,
      },
    });

    // Registrar auditoria
    await this.auditService.log({
      companyId,
      userId,
      action: 'UPDATE_PRODUCT',
      entityType: 'Product',
      description: `Produto "${updatedProduct.name}" (SKU: ${updatedProduct.sku || 'N/A'}) atualizado`,
      oldValue: JSON.stringify(product),
      newValue: JSON.stringify(updatedProduct),
    });

    return updatedProduct;
  }

  async deleteProduct(id: string, companyId: string, userId: string) {
    const product = await this.findProductById(id, companyId);

    // Verificar se está em compostos
    const inComposites = await this.prisma.productComposite.count({
      where: { componentId: id },
    });

    if (inComposites > 0) {
      throw new BadRequestException(
        `Produto está sendo usado em ${inComposites} produto(s) composto(s)`,
      );
    }

    // Verificar se está em combos
    const inCombos = await this.prisma.productCombo.count({
      where: { itemId: id },
    });

    if (inCombos > 0) {
      throw new BadRequestException(
        `Produto está sendo usado em ${inCombos} combo(s)`,
      );
    }

    await this.prisma.product.delete({
      where: { id },
    });

    // Registrar auditoria
    await this.auditService.log({
      companyId,
      userId,
      action: 'DELETE_PRODUCT',
      entityType: 'Product',
      description: `Produto "${product.name}" (SKU: ${product.sku || 'N/A'}) deletado`,
      oldValue: JSON.stringify(product),
    });
  }

  async getLowStockProducts(companyId: string) {
    const products = await this.prisma.product.findMany({
      where: {
        companyId,
        manageStock: true,
        active: true,
      },
      include: {
        category: true,
        brand: true,
        unit: true,
      },
      orderBy: { name: 'asc' },
    });

    // Filtrar produtos com estoque baixo
    return products.filter((p) => p.currentStock <= p.minStock);
  }

  // ==================== ESTOQUE ====================

  async addStockMovement(
    productId: string,
    dto: CreateStockMovementDto,
    companyId: string,
    userId: string,
  ) {
    const { type, quantity, locationId, reason, notes, reference, documentId } = dto;

    // Verificar se produto existe
    const product = await this.findProductById(productId, companyId);

    if (!product.manageStock) {
      throw new BadRequestException('Este produto não gerencia estoque');
    }

    // Validar local de estoque
    const location = await this.prisma.stockLocation.findUnique({
      where: { id: locationId },
    });

    if (!location || location.companyId !== companyId) {
      throw new NotFoundException('Local de estoque não encontrado');
    }

    if (!location.active) {
      throw new BadRequestException('Local de estoque não está ativo');
    }

    // Se documentId foi informado, validar e garantir estrutura de pastas
    if (documentId) {
      const document = await this.prisma.document.findUnique({
        where: { id: documentId },
      });

      if (!document || document.companyId !== companyId) {
        throw new NotFoundException('Documento não encontrado');
      }

      // Criar estrutura de pastas automaticamente se o documento não estiver em pasta
      if (!document.folderId) {
        const movementDate = new Date(); // Data da movimentação
        const folderId = await this.documentsService.ensureStockMovementFolder(
          companyId,
          movementDate,
          userId,
        );

        // Mover documento para a pasta correta
        await this.prisma.document.update({
          where: { id: documentId },
          data: { folderId },
        });
      }
    }

    // Buscar estoque atual do produto neste local
    const stockByLocation = await this.prisma.productStockByLocation.findUnique({
      where: {
        productId_locationId: {
          productId,
          locationId,
        },
      },
    });

    const previousStockInLocation = stockByLocation?.quantity || 0;
    const previousStockTotal = product.currentStock;
    let newStockInLocation: number;
    let newStockTotal: number;

    // Calcular novo estoque baseado no tipo
    if (type === 'ENTRY' || type === 'RETURN' || type === 'ADJUSTMENT') {
      newStockInLocation = Number(previousStockInLocation) + quantity;
      newStockTotal = Number(previousStockTotal) + quantity;
    } else if (type === 'EXIT' || type === 'LOSS') {
      newStockInLocation = Number(previousStockInLocation) - quantity;
      newStockTotal = Number(previousStockTotal) - quantity;
      
      if (newStockInLocation < 0) {
        throw new BadRequestException(
          `Estoque insuficiente no local "${location.name}". Disponível: ${previousStockInLocation}`,
        );
      }
      
      if (newStockTotal < 0) {
        throw new BadRequestException('Estoque total não pode ficar negativo');
      }
    } else if (type === 'TRANSFER') {
      throw new BadRequestException(
        'Use o endpoint de transferências para mover estoque entre locais',
      );
    } else {
      throw new BadRequestException('Tipo de movimentação inválido');
    }

    // Realizar movimentação em transação
    const movement = await this.prisma.$transaction(async (prisma) => {
      // Registrar movimentação
      const mov = await prisma.productStockMovement.create({
        data: {
          companyId,
          productId,
          type,
          quantity,
          previousStock: previousStockTotal,
          newStock: newStockTotal,
          locationId,
          reason,
          notes,
          reference,
          documentId,
          userId,
        },
      });

      // Atualizar ou criar estoque por local
      await prisma.productStockByLocation.upsert({
        where: {
          productId_locationId: {
            productId,
            locationId,
          },
        },
        create: {
          companyId,
          productId,
          locationId,
          quantity: newStockInLocation,
        },
        update: {
          quantity: newStockInLocation,
        },
      });

      // Atualizar estoque total do produto
      await prisma.product.update({
        where: { id: productId },
        data: { currentStock: newStockTotal },
      });

      return mov;
    });

    // Registrar auditoria
    await this.auditService.log({
      companyId,
      userId,
      action: 'STOCK_MOVEMENT',
      entityType: 'Product',
      description: `Movimentação de estoque no local "${location.name}": ${type} - ${quantity} unidades do produto "${product.name}"`,
      oldValue: JSON.stringify({ 
        currentStock: previousStockTotal,
        stockInLocation: previousStockInLocation,
      }),
      newValue: JSON.stringify({ 
        currentStock: newStockTotal,
        stockInLocation: newStockInLocation,
        movement,
      }),
    });

    return movement;
  }

  async getStockHistory(productId: string, companyId: string, limit = 50) {
    const product = await this.findProductById(productId, companyId);

    return this.prisma.productStockMovement.findMany({
      where: {
        productId,
        companyId,
      },
      include: {
        location: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        document: {
          select: {
            id: true,
            fileName: true,
            filePath: true,
            name: true,
            documentType: true,
            tags: true,
            fileSize: true,
            mimeType: true,
            folder: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getStockMovements(
    productId: string | undefined,
    companyId: string,
    filters?: {
      type?: string;
      locationId?: string;
      startDate?: Date;
      endDate?: Date;
      page?: number;
      limit?: number;
    },
  ) {
    // Se productId for fornecido, validar se o produto existe
    if (productId) {
      await this.findProductById(productId, companyId);
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {
      companyId,
    };

    // Adicionar filtro de produto apenas se fornecido
    if (productId) {
      where.productId = productId;
    }

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.locationId) {
      where.locationId = filters.locationId;
    }

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    const [movements, total] = await Promise.all([
      this.prisma.productStockMovement.findMany({
        where,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              barcode: true,
            },
          },
          location: {
            select: {
              id: true,
              name: true,
              code: true,
              address: true,
            },
          },
          document: {
            select: {
              id: true,
              fileName: true,
              filePath: true,
              name: true,
              documentType: true,
              tags: true,
              fileSize: true,
              mimeType: true,
              folder: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.productStockMovement.count({ where }),
    ]);

    return {
      data: movements,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Estatísticas de estoque de um produto
  async getProductStockStats(productId: string, companyId: string) {
    // Buscar o produto com validação
    const product = await this.findProductById(productId, companyId);

    // Buscar estoque por localização
    const stocksByLocation = await this.prisma.productStockByLocation.findMany({
      where: {
        productId,
        companyId,
      },
      include: {
        location: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    // Calcular estoque total (soma de todos os locais)
    const totalStock = stocksByLocation.reduce(
      (sum, stock) => sum + Number(stock.quantity),
      0,
    );

    return {
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      barcode: product.barcode,
      manageStock: product.manageStock,
      stats: {
        currentStock: Number(product.currentStock),
        minStock: Number(product.minStock),
        maxStock: product.maxStock ? Number(product.maxStock) : null,
        totalStock, // Soma de todos os locais
        needsRestock: Number(product.currentStock) <= Number(product.minStock),
        isOverstocked: product.maxStock 
          ? Number(product.currentStock) >= Number(product.maxStock) 
          : false,
        stockPercentage: product.maxStock 
          ? (Number(product.currentStock) / Number(product.maxStock)) * 100 
          : null,
      },
      stockByLocation: stocksByLocation.map((stock) => ({
        locationId: stock.locationId,
        locationName: stock.location.name,
        locationCode: stock.location.code,
        quantity: Number(stock.quantity),
      })),
      unit: product.unit
        ? {
            id: product.unit.id,
            name: product.unit.name,
            abbreviation: product.unit.abbreviation,
          }
        : null,
    };
  }

  async getAllProductsStock(companyId: string, filters?: {
    categoryId?: string;
    brandId?: string;
    search?: string;
    lowStock?: boolean;
    outOfStock?: boolean;
  }) {
    const where: any = {
      companyId,
      active: true,
      manageStock: true,
    };

    if (filters?.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters?.brandId) {
      where.brandId = filters.brandId;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { sku: { contains: filters.search, mode: 'insensitive' } },
        { barcode: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters?.lowStock) {
      where.currentStock = { lte: this.prisma.product.fields.minStock };
    }

    if (filters?.outOfStock) {
      where.currentStock = { lte: 0 };
    }

    const products = await this.prisma.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        sku: true,
        barcode: true,
        currentStock: true,
        minStock: true,
        maxStock: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        brand: {
          select: {
            id: true,
            name: true,
          },
        },
        unit: {
          select: {
            id: true,
            name: true,
            abbreviation: true,
          },
        },
        costPrice: true,
        salePrice: true,
      },
      orderBy: { name: 'asc' },
    });

    // Calcular valores totais
    const totalStockValue = products.reduce((sum, product) => {
      const stockValue = Number(product.currentStock) * Number(product.costPrice || 0);
      return sum + stockValue;
    }, 0);

    const totalSaleValue = products.reduce((sum, product) => {
      const stockValue = Number(product.currentStock) * Number(product.salePrice || 0);
      return sum + stockValue;
    }, 0);

    const lowStockCount = products.filter(p => Number(p.currentStock) <= Number(p.minStock || 0)).length;
    const outOfStockCount = products.filter(p => Number(p.currentStock) <= 0).length;

    return {
      products: products.map(p => ({
        ...p,
        stockValue: Number(p.currentStock) * Number(p.costPrice || 0),
        saleValue: Number(p.currentStock) * Number(p.salePrice || 0),
        status: Number(p.currentStock) <= 0 
          ? 'OUT_OF_STOCK' 
          : Number(p.currentStock) <= Number(p.minStock || 0) 
            ? 'LOW_STOCK' 
            : 'NORMAL',
      })),
      summary: {
        totalProducts: products.length,
        lowStockCount,
        outOfStockCount,
        totalStockValue: totalStockValue.toFixed(2),
        totalSaleValue: totalSaleValue.toFixed(2),
      },
    };
  }

  // ==================== ESTATÍSTICAS ====================

  async getStatistics(companyId: string) {
    const [
      totalProducts,
      activeProducts,
      lowStockProducts,
      outOfStockProducts,
      productsByCategory,
      productsByBrand,
      totalStockValue,
    ] = await Promise.all([
      this.prisma.product.count({ where: { companyId } }),
      this.prisma.product.count({ where: { companyId, active: true } }),
      this.prisma.product.count({
        where: {
          companyId,
          manageStock: true,
          active: true,
          currentStock: { lte: this.prisma.product.fields.minStock },
        },
      }),
      this.prisma.product.count({
        where: {
          companyId,
          manageStock: true,
          active: true,
          currentStock: { equals: 0 },
        },
      }),
      this.prisma.product.groupBy({
        by: ['categoryId'],
        where: { companyId },
        _count: true,
      }),
      this.prisma.product.groupBy({
        by: ['brandId'],
        where: { companyId },
        _count: true,
      }),
      this.prisma.product.aggregate({
        where: { companyId, active: true },
        _sum: {
          currentStock: true,
        },
      }),
    ]);

    return {
      totalProducts,
      activeProducts,
      inactiveProducts: totalProducts - activeProducts,
      lowStockProducts,
      outOfStockProducts,
      productsByCategory: productsByCategory.length,
      productsByBrand: productsByBrand.length,
      totalStockValue: totalStockValue._sum.currentStock || 0,
    };
  }

  // ==================== FOTOS ====================

  async addProductPhoto(
    productId: string,
    documentId: string,
    companyId: string,
    userId: string,
    order?: number,
    isPrimary?: boolean,
  ) {
    // Verificar se produto existe
    const product = await this.findProductById(productId, companyId);

    // Verificar se documento existe
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document || document.companyId !== companyId) {
      throw new NotFoundException('Documento não encontrado');
    }

    // Se for marcar como primária, desmarcar outras
    if (isPrimary) {
      await this.prisma.productPhoto.updateMany({
        where: { productId },
        data: { isPrimary: false },
      });
    }

    // Buscar próxima ordem se não fornecida
    if (order === undefined) {
      const lastPhoto = await this.prisma.productPhoto.findFirst({
        where: { productId },
        orderBy: { order: 'desc' },
      });
      order = lastPhoto ? lastPhoto.order + 1 : 0;
    }

    const photo = await this.prisma.productPhoto.create({
      data: {
        productId,
        documentId,
        order,
        isPrimary: isPrimary || false,
      },
    });

    // Registrar auditoria
    await this.auditService.log({
      companyId,
      userId,
      action: 'ADD_PRODUCT_PHOTO',
      entityType: 'Product',
      description: `Foto adicionada ao produto "${product.name}"`,
      newValue: JSON.stringify({ photoId: photo.id, documentId, isPrimary }),
    });

    return photo;
  }

  async removeProductPhoto(photoId: string, companyId: string, userId: string) {
    const photo = await this.prisma.productPhoto.findUnique({
      where: { id: photoId },
      include: {
        product: true,
      },
    });

    if (!photo || photo.product.companyId !== companyId) {
      throw new NotFoundException('Foto não encontrada');
    }

    await this.prisma.productPhoto.delete({
      where: { id: photoId },
    });

    // Registrar auditoria
    await this.auditService.log({
      companyId,
      userId,
      action: 'REMOVE_PRODUCT_PHOTO',
      entityType: 'Product',
      description: `Foto removida do produto "${photo.product.name}"`,
      oldValue: JSON.stringify(photo),
    });

    return { message: 'Foto removida com sucesso' };
  }

  async setPrimaryPhoto(photoId: string, companyId: string, userId: string) {
    const photo = await this.prisma.productPhoto.findUnique({
      where: { id: photoId },
      include: {
        product: true,
      },
    });

    if (!photo || photo.product.companyId !== companyId) {
      throw new NotFoundException('Foto não encontrada');
    }

    // Desmarcar outras fotos como primária
    await this.prisma.productPhoto.updateMany({
      where: { productId: photo.productId },
      data: { isPrimary: false },
    });

    // Marcar esta como primária
    const updatedPhoto = await this.prisma.productPhoto.update({
      where: { id: photoId },
      data: { isPrimary: true },
    });

    // Registrar auditoria
    await this.auditService.log({
      companyId,
      userId,
      action: 'SET_PRIMARY_PHOTO',
      entityType: 'Product',
      description: `Foto principal definida para produto "${photo.product.name}"`,
      newValue: JSON.stringify({ photoId }),
    });

    return updatedPhoto;
  }

  async reorderPhotos(
    productId: string,
    photoOrders: { id: string; order: number }[],
    companyId: string,
    userId: string,
  ) {
    const product = await this.findProductById(productId, companyId);

    // Atualizar ordem de cada foto
    await Promise.all(
      photoOrders.map((po) =>
        this.prisma.productPhoto.updateMany({
          where: {
            id: po.id,
            productId,
          },
          data: { order: po.order },
        }),
      ),
    );

    // Buscar fotos atualizadas
    const updatedPhotos = await this.prisma.productPhoto.findMany({
      where: { productId },
      orderBy: { order: 'asc' },
    });

    // Registrar auditoria
    await this.auditService.log({
      companyId,
      userId,
      action: 'REORDER_PRODUCT_PHOTOS',
      entityType: 'Product',
      description: `Fotos reordenadas para produto "${product.name}"`,
      newValue: JSON.stringify(photoOrders),
    });

    return updatedPhotos;
  }

  // ==================== LOCAIS DE ESTOQUE ====================

  async createStockLocation(dto: any, companyId: string) {
    // Verificar se código já existe
    const existing = await this.prisma.stockLocation.findUnique({
      where: {
        companyId_code: {
          companyId,
          code: dto.code,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Já existe um local de estoque com este código');
    }

    // Se marcar como padrão, desmarcar outros
    if (dto.isDefault) {
      await this.prisma.stockLocation.updateMany({
        where: { companyId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.stockLocation.create({
      data: {
        ...dto,
        companyId,
      },
    });
  }

  async findAllStockLocations(companyId: string) {
    return this.prisma.stockLocation.findMany({
      where: { companyId },
      include: {
        _count: {
          select: {
            productStocks: true,
            stockMovements: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findStockLocationById(id: string, companyId: string) {
    const location = await this.prisma.stockLocation.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            productStocks: true,
            stockMovements: true,
          },
        },
      },
    });

    if (!location || location.companyId !== companyId) {
      throw new NotFoundException('Local de estoque não encontrado');
    }

    return location;
  }

  async updateStockLocation(id: string, dto: any, companyId: string) {
    const location = await this.findStockLocationById(id, companyId);

    // Se código foi alterado, verificar duplicação
    if (dto.code && dto.code !== location.code) {
      const existing = await this.prisma.stockLocation.findUnique({
        where: {
          companyId_code: {
            companyId,
            code: dto.code,
          },
        },
      });

      if (existing) {
        throw new ConflictException('Já existe um local de estoque com este código');
      }
    }

    // Se marcar como padrão, desmarcar outros
    if (dto.isDefault && !location.isDefault) {
      await this.prisma.stockLocation.updateMany({
        where: { companyId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.stockLocation.update({
      where: { id },
      data: dto,
    });
  }

  async deleteStockLocation(id: string, companyId: string) {
    const location = await this.findStockLocationById(id, companyId);

    // Verificar se há estoque neste local
    const hasStock = await this.prisma.productStockByLocation.findFirst({
      where: {
        locationId: id,
        quantity: { gt: 0 },
      },
    });

    if (hasStock) {
      throw new BadRequestException('Não é possível deletar local com estoque');
    }

    // Verificar se há transferências pendentes
    const hasPendingTransfers = await this.prisma.stockTransfer.findFirst({
      where: {
        OR: [
          { fromLocationId: id },
          { toLocationId: id },
        ],
        status: { in: ['PENDING', 'IN_TRANSIT'] },
      },
    });

    if (hasPendingTransfers) {
      throw new BadRequestException('Não é possível deletar local com transferências pendentes');
    }

    await this.prisma.stockLocation.delete({
      where: { id },
    });

    return { message: 'Local de estoque deletado com sucesso' };
  }

  // ==================== ESTOQUE POR LOCAL ====================

  async getProductStockByLocation(productId: string, companyId: string) {
    const product = await this.findProductById(productId, companyId);

    const stocks = await this.prisma.productStockByLocation.findMany({
      where: {
        productId,
        companyId,
      },
      include: {
        location: {
          select: {
            id: true,
            name: true,
            code: true,
            active: true,
          },
        },
      },
      orderBy: {
        location: {
          name: 'asc',
        },
      },
    });

    return {
      product: {
        id: product.id,
        name: product.name,
        sku: product.sku,
        totalStock: product.currentStock,
      },
      stocksByLocation: stocks,
    };
  }

  async getAllStocksByLocation(companyId: string, locationId?: string) {
    const where: any = { companyId };
    
    if (locationId) {
      where.locationId = locationId;
    }

    const stocks = await this.prisma.productStockByLocation.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            barcode: true,
            unit: {
              select: {
                abbreviation: true,
              },
            },
          },
        },
        location: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: [
        { location: { name: 'asc' } },
        { product: { name: 'asc' } },
      ],
    });

    return stocks;
  }

  // ==================== TRANSFERÊNCIAS ====================

  async createStockTransfer(dto: any, companyId: string, userId: string) {
    // Validar locais
    const fromLocation = await this.findStockLocationById(dto.fromLocationId, companyId);
    const toLocation = await this.findStockLocationById(dto.toLocationId, companyId);

    if (dto.fromLocationId === dto.toLocationId) {
      throw new BadRequestException('Local de origem e destino não podem ser iguais');
    }

    // Se documentId foi informado, validar e garantir estrutura de pastas
    if (dto.documentId) {
      const document = await this.prisma.document.findUnique({
        where: { id: dto.documentId },
      });

      if (!document || document.companyId !== companyId) {
        throw new NotFoundException('Documento não encontrado');
      }

      // Criar estrutura de pastas automaticamente se o documento não estiver em pasta
      if (!document.folderId) {
        const transferDate = new Date(); // Data da transferência
        const folderId = await this.documentsService.ensureStockTransferFolder(
          companyId,
          transferDate,
          userId,
        );

        // Mover documento para a pasta correta
        await this.prisma.document.update({
          where: { id: dto.documentId },
          data: { folderId },
        });
      }
    }

    // Verificar estoque disponível nos locais de origem
    for (const item of dto.items) {
      const stock = await this.prisma.productStockByLocation.findUnique({
        where: {
          productId_locationId: {
            productId: item.productId,
            locationId: dto.fromLocationId,
          },
        },
      });

      if (!stock || stock.quantity.toNumber() < item.quantity) {
        const product = await this.prisma.product.findUnique({
          where: { id: item.productId },
          select: { name: true },
        });
        throw new BadRequestException(
          `Estoque insuficiente de "${product?.name}" no local de origem`,
        );
      }
    }

    // Gerar código da transferência
    const lastTransfer = await this.prisma.stockTransfer.findFirst({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });

    const lastNumber = lastTransfer?.code.match(/\d+$/)?.[0] || '0';
    const newNumber = (parseInt(lastNumber) + 1).toString().padStart(6, '0');
    const code = `TRANS-${newNumber}`;

    // Criar transferência
    const transfer = await this.prisma.stockTransfer.create({
      data: {
        companyId,
        code,
        fromLocationId: dto.fromLocationId,
        toLocationId: dto.toLocationId,
        status: 'PENDING',
        notes: dto.notes,
        documentId: dto.documentId,
        requestedBy: userId,
        items: {
          create: dto.items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            notes: item.notes,
          })),
        },
      },
      include: {
        fromLocation: true,
        toLocation: true,
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
          },
        },
      },
    });

    return transfer;
  }

  async approveStockTransfer(id: string, companyId: string, userId: string) {
    const transfer = await this.prisma.stockTransfer.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!transfer || transfer.companyId !== companyId) {
      throw new NotFoundException('Transferência não encontrada');
    }

    if (transfer.status !== 'PENDING') {
      throw new BadRequestException('Transferência não está pendente');
    }

    // Verificar estoque novamente
    for (const item of transfer.items) {
      const stock = await this.prisma.productStockByLocation.findUnique({
        where: {
          productId_locationId: {
            productId: item.productId,
            locationId: transfer.fromLocationId,
          },
        },
      });

      if (!stock || stock.quantity.toNumber() < item.quantity.toNumber()) {
        throw new BadRequestException(
          `Estoque insuficiente de "${item.product.name}" no local de origem`,
        );
      }
    }

    return this.prisma.stockTransfer.update({
      where: { id },
      data: {
        status: 'IN_TRANSIT',
        approvedBy: userId,
        approvedAt: new Date(),
      },
      include: {
        fromLocation: true,
        toLocation: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async completeStockTransfer(id: string, companyId: string, userId: string) {
    const transfer = await this.prisma.stockTransfer.findUnique({
      where: { id },
      include: {
        fromLocation: true,
        toLocation: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!transfer || transfer.companyId !== companyId) {
      throw new NotFoundException('Transferência não encontrada');
    }

    if (transfer.status !== 'IN_TRANSIT' && transfer.status !== 'PENDING') {
      throw new BadRequestException('Transferência não pode ser completada');
    }

    // Realizar movimentações de estoque em uma transação
    await this.prisma.$transaction(async (prisma) => {
      for (const item of transfer.items) {
        // Subtrair do local de origem
        const fromStock = await prisma.productStockByLocation.findUnique({
          where: {
            productId_locationId: {
              productId: item.productId,
              locationId: transfer.fromLocationId,
            },
          },
        });

        if (fromStock) {
          await prisma.productStockByLocation.update({
            where: {
              productId_locationId: {
                productId: item.productId,
                locationId: transfer.fromLocationId,
              },
            },
            data: {
              quantity: { decrement: item.quantity },
            },
          });
        }

        // Adicionar no local de destino
        await prisma.productStockByLocation.upsert({
          where: {
            productId_locationId: {
              productId: item.productId,
              locationId: transfer.toLocationId,
            },
          },
          create: {
            companyId,
            productId: item.productId,
            locationId: transfer.toLocationId,
            quantity: item.quantity,
          },
          update: {
            quantity: { increment: item.quantity },
          },
        });

        // Registrar movimentações
        const previousStock = fromStock?.quantity || 0;
        const newStock = typeof previousStock === 'number' 
          ? previousStock - item.quantity.toNumber() 
          : previousStock.toNumber() - item.quantity.toNumber();

        await prisma.productStockMovement.create({
          data: {
            companyId,
            productId: item.productId,
            type: 'TRANSFER',
            quantity: item.quantity,
            previousStock,
            newStock,
            locationId: transfer.fromLocationId,
            transferId: transfer.id,
            reason: `Transferência ${transfer.code} para ${transfer.toLocation.name}`,
            userId,
          },
        });

        await prisma.productStockMovement.create({
          data: {
            companyId,
            productId: item.productId,
            type: 'TRANSFER',
            quantity: item.quantity,
            previousStock: 0,
            newStock: item.quantity,
            locationId: transfer.toLocationId,
            transferId: transfer.id,
            reason: `Transferência ${transfer.code} de ${transfer.fromLocation.name}`,
            userId,
          },
        });
      }

      // Atualizar status da transferência
      await prisma.stockTransfer.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          completedBy: userId,
          completedAt: new Date(),
        },
      });
    });

    // Buscar transferência atualizada
    return this.prisma.stockTransfer.findUnique({
      where: { id },
      include: {
        fromLocation: true,
        toLocation: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async cancelStockTransfer(id: string, companyId: string) {
    const transfer = await this.prisma.stockTransfer.findUnique({
      where: { id },
    });

    if (!transfer || transfer.companyId !== companyId) {
      throw new NotFoundException('Transferência não encontrada');
    }

    if (transfer.status === 'COMPLETED') {
      throw new BadRequestException('Não é possível cancelar transferência completada');
    }

    return this.prisma.stockTransfer.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: {
        fromLocation: true,
        toLocation: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async findAllStockTransfers(companyId: string, status?: string) {
    const where: any = { companyId };
    
    if (status) {
      where.status = status;
    }

    return this.prisma.stockTransfer.findMany({
      where,
      include: {
        fromLocation: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        toLocation: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findStockTransferById(id: string, companyId: string) {
    const transfer = await this.prisma.stockTransfer.findUnique({
      where: { id },
      include: {
        fromLocation: true,
        toLocation: true,
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                barcode: true,
                unit: true,
              },
            },
          },
        },
      },
    });

    if (!transfer || transfer.companyId !== companyId) {
      throw new NotFoundException('Transferência não encontrada');
    }

    return transfer;
  }
}
