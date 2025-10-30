import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { UpdateProductCategoryDto } from './dto/update-product-category.dto';
import { CreateProductUnitDto } from './dto/create-product-unit.dto';
import { UpdateProductUnitDto } from './dto/update-product-unit.dto';
import { CreateProductBrandDto } from './dto/create-product-brand.dto';
import { UpdateProductBrandDto } from './dto/update-product-brand.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
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

    // Criar produto
    const product = await this.prisma.product.create({
      data: {
        ...dto,
        companyId,
        createdById: userId,
        currentStock: dto.initialStock || 0,
      },
      include: {
        category: true,
        brand: true,
        unit: true,
        photos: true,
      },
    });

    // Registrar movimentação inicial de estoque se gerenciar estoque
    if (dto.manageStock && (dto.initialStock || 0) > 0) {
      await this.prisma.productStockMovement.create({
        data: {
          companyId,
          productId: product.id,
          type: 'ENTRY',
          quantity: dto.initialStock || 0,
          previousStock: 0,
          newStock: dto.initialStock || 0,
          reason: 'Estoque inicial',
          userId,
        },
      });
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
      },
    });

    if (!product || product.companyId !== companyId) {
      throw new NotFoundException('Produto não encontrado');
    }

    return product;
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

    const updatedProduct = await this.prisma.product.update({
      where: { id },
      data: dto,
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
    companyId: string,
    userId: string,
    type: string,
    quantity: number,
    reason?: string,
    notes?: string,
    reference?: string,
  ) {
    const product = await this.findProductById(productId, companyId);

    if (!product.manageStock) {
      throw new BadRequestException('Este produto não gerencia estoque');
    }

    const previousStock = product.currentStock;
    let newStock: number;

    // Calcular novo estoque baseado no tipo
    if (type === 'ENTRY' || type === 'RETURN' || type === 'ADJUSTMENT') {
      newStock = Number(previousStock) + quantity;
    } else if (type === 'EXIT' || type === 'LOSS') {
      newStock = Number(previousStock) - quantity;
      if (newStock < 0) {
        throw new BadRequestException('Estoque não pode ficar negativo');
      }
    } else {
      throw new BadRequestException('Tipo de movimentação inválido');
    }

    // Registrar movimentação
    const movement = await this.prisma.productStockMovement.create({
      data: {
        companyId,
        productId,
        type,
        quantity,
        previousStock,
        newStock,
        reason,
        notes,
        reference,
        userId,
      },
    });

    // Atualizar estoque do produto
    await this.prisma.product.update({
      where: { id: productId },
      data: { currentStock: newStock },
    });

    // Registrar auditoria
    await this.auditService.log({
      companyId,
      userId,
      action: 'STOCK_MOVEMENT',
      entityType: 'Product',
      description: `Movimentação de estoque: ${type} - ${quantity} unidades do produto "${product.name}"`,
      oldValue: JSON.stringify({ currentStock: previousStock }),
      newValue: JSON.stringify({ currentStock: newStock, movement }),
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
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
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
}
