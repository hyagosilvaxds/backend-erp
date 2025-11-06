import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser, CurrentCompany } from '../auth/decorators/current-user.decorator';

// DTOs de Categoria
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { UpdateProductCategoryDto } from './dto/update-product-category.dto';

// DTOs de Unidade
import { CreateProductUnitDto } from './dto/create-product-unit.dto';
import { UpdateProductUnitDto } from './dto/update-product-unit.dto';

// DTOs de Marca
import { CreateProductBrandDto } from './dto/create-product-brand.dto';
import { UpdateProductBrandDto } from './dto/update-product-brand.dto';

// DTOs de Produto
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';

@Controller('products')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // ==================== CATEGORIAS ====================

  @Post('categories')
  @RequirePermissions('products.create')
  async createCategory(
    @Body() dto: CreateProductCategoryDto,
    @CurrentCompany() companyId: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.productsService.createCategory(dto, companyId, user.userId);
  }

  @Get('categories')
  @RequirePermissions('products.read')
  async findAllCategories(
    @CurrentCompany() companyId: string,
    @Query('parentId') parentId?: string,
  ) {
    return this.productsService.findAllCategories(companyId, parentId);
  }

  @Get('categories/:id')
  @RequirePermissions('products.read')
  async findCategoryById(
    @Param('id') id: string,
    @CurrentCompany() companyId: string,
  ) {
    return this.productsService.findCategoryById(id, companyId);
  }

  @Patch('categories/:id')
  @RequirePermissions('products.update')
  async updateCategory(
    @Param('id') id: string,
    @Body() dto: UpdateProductCategoryDto,
    @CurrentCompany() companyId: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.productsService.updateCategory(id, dto, companyId, user.userId);
  }

  @Delete('categories/:id')
  @RequirePermissions('products.delete')
  async deleteCategory(
    @Param('id') id: string,
    @CurrentCompany() companyId: string,
    @CurrentUser() user: { userId: string },
  ) {
    await this.productsService.deleteCategory(id, companyId, user.userId);
    return { message: 'Categoria deletada com sucesso' };
  }

  // ==================== UNIDADES ====================

  @Post('units')
  @RequirePermissions('products.create')
  async createUnit(
    @Body() dto: CreateProductUnitDto,
    @CurrentCompany() companyId: string,
  ) {
    return this.productsService.createUnit(dto, companyId);
  }

  @Get('units')
  @RequirePermissions('products.read')
  async findAllUnits(@CurrentCompany() companyId: string) {
    return this.productsService.findAllUnits(companyId);
  }

  @Get('units/:id')
  @RequirePermissions('products.read')
  async findUnitById(
    @Param('id') id: string,
    @CurrentCompany() companyId: string,
  ) {
    return this.productsService.findUnitById(id, companyId);
  }

  @Patch('units/:id')
  @RequirePermissions('products.update')
  async updateUnit(
    @Param('id') id: string,
    @Body() dto: UpdateProductUnitDto,
    @CurrentCompany() companyId: string,
  ) {
    return this.productsService.updateUnit(id, dto, companyId);
  }

  @Delete('units/:id')
  @RequirePermissions('products.delete')
  async deleteUnit(
    @Param('id') id: string,
    @CurrentCompany() companyId: string,
  ) {
    await this.productsService.deleteUnit(id, companyId);
    return { message: 'Unidade deletada com sucesso' };
  }

  // ==================== MARCAS ====================

  @Post('brands')
  @RequirePermissions('products.create')
  async createBrand(
    @Body() dto: CreateProductBrandDto,
    @CurrentCompany() companyId: string,
  ) {
    return this.productsService.createBrand(dto, companyId);
  }

  @Get('brands')
  @RequirePermissions('products.read')
  async findAllBrands(@CurrentCompany() companyId: string) {
    return this.productsService.findAllBrands(companyId);
  }

  @Get('brands/:id')
  @RequirePermissions('products.read')
  async findBrandById(
    @Param('id') id: string,
    @CurrentCompany() companyId: string,
  ) {
    return this.productsService.findBrandById(id, companyId);
  }

  @Patch('brands/:id')
  @RequirePermissions('products.update')
  async updateBrand(
    @Param('id') id: string,
    @Body() dto: UpdateProductBrandDto,
    @CurrentCompany() companyId: string,
  ) {
    return this.productsService.updateBrand(id, dto, companyId);
  }

  @Delete('brands/:id')
  @RequirePermissions('products.delete')
  async deleteBrand(
    @Param('id') id: string,
    @CurrentCompany() companyId: string,
  ) {
    await this.productsService.deleteBrand(id, companyId);
    return { message: 'Marca deletada com sucesso' };
  }

  // ==================== PRODUTOS ====================

  @Post()
  @RequirePermissions('products.create')
  async createProduct(
    @Body() dto: CreateProductDto,
    @CurrentCompany() companyId: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.productsService.createProduct(dto, companyId, user.userId);
  }

  @Get()
  @RequirePermissions('products.read')
  async findAllProducts(
    @CurrentCompany() companyId: string,
    @Query() query: QueryProductsDto,
  ) {
    return this.productsService.findAllProducts(companyId, query);
  }

  // Rotas específicas devem vir ANTES de rotas com parâmetros dinâmicos
  
  @Get('low-stock')
  @RequirePermissions('products.read')
  async getLowStockProducts(@CurrentCompany() companyId: string) {
    return this.productsService.getLowStockProducts(companyId);
  }

  @Get('stats')
  @RequirePermissions('products.read')
  async getStatistics(@CurrentCompany() companyId: string) {
    return this.productsService.getStatistics(companyId);
  }

  @Get('stock')
  @RequirePermissions('products.read')
  async getAllProductsStock(
    @CurrentCompany() companyId: string,
    @Query('categoryId') categoryId?: string,
    @Query('brandId') brandId?: string,
    @Query('search') search?: string,
    @Query('lowStock') lowStock?: string,
    @Query('outOfStock') outOfStock?: string,
  ) {
    return this.productsService.getAllProductsStock(companyId, {
      categoryId,
      brandId,
      search,
      lowStock: lowStock === 'true',
      outOfStock: outOfStock === 'true',
    });
  }

  @Get('stock/by-location')
  @RequirePermissions('products.read')
  async getAllStocksByLocation(
    @CurrentCompany() companyId: string,
    @Query('locationId') locationId?: string,
  ) {
    return this.productsService.getAllStocksByLocation(companyId, locationId);
  }

  // ==================== LOCAIS DE ESTOQUE ====================

  @Post('stock-locations')
  @RequirePermissions('products.create')
  async createStockLocation(
    @Body() dto: any,
    @CurrentCompany() companyId: string,
  ) {
    return this.productsService.createStockLocation(dto, companyId);
  }

  @Get('stock-locations')
  @RequirePermissions('products.read')
  async findAllStockLocations(@CurrentCompany() companyId: string) {
    return this.productsService.findAllStockLocations(companyId);
  }

  @Get('stock-locations/:id')
  @RequirePermissions('products.read')
  async findStockLocationById(
    @Param('id') id: string,
    @CurrentCompany() companyId: string,
  ) {
    return this.productsService.findStockLocationById(id, companyId);
  }

  @Patch('stock-locations/:id')
  @RequirePermissions('products.update')
  async updateStockLocation(
    @Param('id') id: string,
    @Body() dto: any,
    @CurrentCompany() companyId: string,
  ) {
    return this.productsService.updateStockLocation(id, dto, companyId);
  }

  @Delete('stock-locations/:id')
  @RequirePermissions('products.delete')
  async deleteStockLocation(
    @Param('id') id: string,
    @CurrentCompany() companyId: string,
  ) {
    return this.productsService.deleteStockLocation(id, companyId);
  }

  // ==================== TRANSFERÊNCIAS ====================

  @Post('stock-transfers')
  @RequirePermissions('products.manage_stock')
  async createStockTransfer(
    @Body() dto: any,
    @CurrentCompany() companyId: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.productsService.createStockTransfer(dto, companyId, user.userId);
  }

  @Get('stock-transfers')
  @RequirePermissions('products.read')
  async findAllStockTransfers(
    @CurrentCompany() companyId: string,
    @Query('status') status?: string,
  ) {
    return this.productsService.findAllStockTransfers(companyId, status);
  }

  @Get('stock-transfers/:id')
  @RequirePermissions('products.read')
  async findStockTransferById(
    @Param('id') id: string,
    @CurrentCompany() companyId: string,
  ) {
    return this.productsService.findStockTransferById(id, companyId);
  }

  @Patch('stock-transfers/:id/approve')
  @RequirePermissions('products.manage_stock')
  async approveStockTransfer(
    @Param('id') id: string,
    @CurrentCompany() companyId: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.productsService.approveStockTransfer(id, companyId, user.userId);
  }

  @Patch('stock-transfers/:id/complete')
  @RequirePermissions('products.manage_stock')
  async completeStockTransfer(
    @Param('id') id: string,
    @CurrentCompany() companyId: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.productsService.completeStockTransfer(id, companyId, user.userId);
  }

  @Patch('stock-transfers/:id/cancel')
  @RequirePermissions('products.manage_stock')
  async cancelStockTransfer(
    @Param('id') id: string,
    @CurrentCompany() companyId: string,
  ) {
    return this.productsService.cancelStockTransfer(id, companyId);
  }

  // Rotas com parâmetros dinâmicos devem vir por último

  @Get(':id')
  @RequirePermissions('products.read')
  async findProductById(
    @Param('id') id: string,
    @CurrentCompany() companyId: string,
  ) {
    return this.productsService.findProductById(id, companyId);
  }

  @Patch(':id')
  @RequirePermissions('products.update')
  async updateProduct(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @CurrentCompany() companyId: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.productsService.updateProduct(id, dto, companyId, user.userId);
  }

  @Delete(':id')
  @RequirePermissions('products.delete')
  async deleteProduct(
    @Param('id') id: string,
    @CurrentCompany() companyId: string,
    @CurrentUser() user: { userId: string },
  ) {
    await this.productsService.deleteProduct(id, companyId, user.userId);
    return { message: 'Produto deletado com sucesso' };
  }

  // ==================== ESTOQUE ====================

  @Post(':id/stock-movement')
  @RequirePermissions('products.manage_stock')
  async addStockMovement(
    @Param('id') id: string,
    @Body() body: CreateStockMovementDto,
    @CurrentCompany() companyId: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.productsService.addStockMovement(
      id,
      body,
      companyId,
      user.userId,
    );
  }

  @Get('stock-movements')
  @RequirePermissions('products.read')
  async getAllStockMovements(
    @CurrentCompany() companyId: string,
    @Query('productId') productId?: string,
    @Query('type') type?: string,
    @Query('locationId') locationId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.productsService.getStockMovements(
      productId, // pode ser undefined
      companyId,
      {
        type: type !== 'all' ? type : undefined,
        locationId: locationId !== 'all' ? locationId : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      },
    );
  }

  @Get(':id/stock-history')
  @RequirePermissions('products.read')
  async getStockHistory(
    @Param('id') id: string,
    @CurrentCompany() companyId: string,
    @Query('limit') limit?: number,
  ) {
    return this.productsService.getStockHistory(id, companyId, limit || 50);
  }

  @Get(':id/stock-movements')
  @RequirePermissions('products.read')
  async getStockMovements(
    @Param('id') id: string,
    @CurrentCompany() companyId: string,
    @Query('type') type?: string,
    @Query('locationId') locationId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.productsService.getStockMovements(id, companyId, {
      type,
      locationId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get(':id/stock-stats')
  @RequirePermissions('products.read')
  async getProductStockStats(
    @Param('id') id: string,
    @CurrentCompany() companyId: string,
  ) {
    return this.productsService.getProductStockStats(id, companyId);
  }

  // ==================== FOTOS ====================

  @Post(':id/photos')
  @RequirePermissions('products.update')
  async addProductPhoto(
    @Param('id') id: string,
    @Body() body: { documentId: string; order?: number; isPrimary?: boolean },
    @CurrentCompany() companyId: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.productsService.addProductPhoto(
      id,
      body.documentId,
      companyId,
      user.userId,
      body.order,
      body.isPrimary,
    );
  }

  @Delete(':id/photos/:photoId')
  @RequirePermissions('products.update')
  async removeProductPhoto(
    @Param('photoId') photoId: string,
    @CurrentCompany() companyId: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.productsService.removeProductPhoto(photoId, companyId, user.userId);
  }

  @Patch(':id/photos/:photoId/primary')
  @RequirePermissions('products.update')
  async setPrimaryPhoto(
    @Param('photoId') photoId: string,
    @CurrentCompany() companyId: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.productsService.setPrimaryPhoto(photoId, companyId, user.userId);
  }

  @Patch(':id/photos/reorder')
  @RequirePermissions('products.update')
  async reorderPhotos(
    @Param('id') id: string,
    @Body() body: { photoOrders: { id: string; order: number }[] },
    @CurrentCompany() companyId: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.productsService.reorderPhotos(
      id,
      body.photoOrders,
      companyId,
      user.userId,
    );
  }

  // ==================== ESTOQUE POR LOCAL ====================

  @Get(':id/stock-by-location')
  @RequirePermissions('products.read')
  async getProductStockByLocation(
    @Param('id') id: string,
    @CurrentCompany() companyId: string,
  ) {
    return this.productsService.getProductStockByLocation(id, companyId);
  }
}

