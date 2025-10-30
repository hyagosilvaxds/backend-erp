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

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // ==================== CATEGORIAS ====================

  @Post('categories')
  @RequirePermissions('products.create')
  async createCategory(
    @Body() dto: CreateProductCategoryDto,
    @CurrentCompany() company: { id: string },
    @CurrentUser() user: { userId: string },
  ) {
    return this.productsService.createCategory(dto, company.id, user.userId);
  }

  @Get('categories')
  @RequirePermissions('products.read')
  async findAllCategories(
    @CurrentCompany() company: { id: string },
    @Query('parentId') parentId?: string,
  ) {
    return this.productsService.findAllCategories(company.id, parentId);
  }

  @Get('categories/:id')
  @RequirePermissions('products.read')
  async findCategoryById(
    @Param('id') id: string,
    @CurrentCompany() company: { id: string },
  ) {
    return this.productsService.findCategoryById(id, company.id);
  }

  @Patch('categories/:id')
  @RequirePermissions('products.update')
  async updateCategory(
    @Param('id') id: string,
    @Body() dto: UpdateProductCategoryDto,
    @CurrentCompany() company: { id: string },
    @CurrentUser() user: { userId: string },
  ) {
    return this.productsService.updateCategory(id, dto, company.id, user.userId);
  }

  @Delete('categories/:id')
  @RequirePermissions('products.delete')
  async deleteCategory(
    @Param('id') id: string,
    @CurrentCompany() company: { id: string },
    @CurrentUser() user: { userId: string },
  ) {
    await this.productsService.deleteCategory(id, company.id, user.userId);
    return { message: 'Categoria deletada com sucesso' };
  }

  // ==================== UNIDADES ====================

  @Post('units')
  @RequirePermissions('products.create')
  async createUnit(
    @Body() dto: CreateProductUnitDto,
    @CurrentCompany() company: { id: string },
  ) {
    return this.productsService.createUnit(dto, company.id);
  }

  @Get('units')
  @RequirePermissions('products.read')
  async findAllUnits(@CurrentCompany() company: { id: string }) {
    return this.productsService.findAllUnits(company.id);
  }

  @Get('units/:id')
  @RequirePermissions('products.read')
  async findUnitById(
    @Param('id') id: string,
    @CurrentCompany() company: { id: string },
  ) {
    return this.productsService.findUnitById(id, company.id);
  }

  @Patch('units/:id')
  @RequirePermissions('products.update')
  async updateUnit(
    @Param('id') id: string,
    @Body() dto: UpdateProductUnitDto,
    @CurrentCompany() company: { id: string },
  ) {
    return this.productsService.updateUnit(id, dto, company.id);
  }

  @Delete('units/:id')
  @RequirePermissions('products.delete')
  async deleteUnit(
    @Param('id') id: string,
    @CurrentCompany() company: { id: string },
  ) {
    await this.productsService.deleteUnit(id, company.id);
    return { message: 'Unidade deletada com sucesso' };
  }

  // ==================== MARCAS ====================

  @Post('brands')
  @RequirePermissions('products.create')
  async createBrand(
    @Body() dto: CreateProductBrandDto,
    @CurrentCompany() company: { id: string },
  ) {
    return this.productsService.createBrand(dto, company.id);
  }

  @Get('brands')
  @RequirePermissions('products.read')
  async findAllBrands(@CurrentCompany() company: { id: string }) {
    return this.productsService.findAllBrands(company.id);
  }

  @Get('brands/:id')
  @RequirePermissions('products.read')
  async findBrandById(
    @Param('id') id: string,
    @CurrentCompany() company: { id: string },
  ) {
    return this.productsService.findBrandById(id, company.id);
  }

  @Patch('brands/:id')
  @RequirePermissions('products.update')
  async updateBrand(
    @Param('id') id: string,
    @Body() dto: UpdateProductBrandDto,
    @CurrentCompany() company: { id: string },
  ) {
    return this.productsService.updateBrand(id, dto, company.id);
  }

  @Delete('brands/:id')
  @RequirePermissions('products.delete')
  async deleteBrand(
    @Param('id') id: string,
    @CurrentCompany() company: { id: string },
  ) {
    await this.productsService.deleteBrand(id, company.id);
    return { message: 'Marca deletada com sucesso' };
  }

  // ==================== PRODUTOS ====================

  @Post()
  @RequirePermissions('products.create')
  async createProduct(
    @Body() dto: CreateProductDto,
    @CurrentCompany() company: { id: string },
    @CurrentUser() user: { userId: string },
  ) {
    return this.productsService.createProduct(dto, company.id, user.userId);
  }

  @Get()
  @RequirePermissions('products.read')
  async findAllProducts(
    @CurrentCompany() company: { id: string },
    @Query() query: QueryProductsDto,
  ) {
    return this.productsService.findAllProducts(company.id, query);
  }

  @Get('low-stock')
  @RequirePermissions('products.read')
  async getLowStockProducts(@CurrentCompany() company: { id: string }) {
    return this.productsService.getLowStockProducts(company.id);
  }

  @Get('stats')
  @RequirePermissions('products.read')
  async getStatistics(@CurrentCompany() company: { id: string }) {
    return this.productsService.getStatistics(company.id);
  }

  @Get(':id')
  @RequirePermissions('products.read')
  async findProductById(
    @Param('id') id: string,
    @CurrentCompany() company: { id: string },
  ) {
    return this.productsService.findProductById(id, company.id);
  }

  @Patch(':id')
  @RequirePermissions('products.update')
  async updateProduct(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @CurrentCompany() company: { id: string },
    @CurrentUser() user: { userId: string },
  ) {
    return this.productsService.updateProduct(id, dto, company.id, user.userId);
  }

  @Delete(':id')
  @RequirePermissions('products.delete')
  async deleteProduct(
    @Param('id') id: string,
    @CurrentCompany() company: { id: string },
    @CurrentUser() user: { userId: string },
  ) {
    await this.productsService.deleteProduct(id, company.id, user.userId);
    return { message: 'Produto deletado com sucesso' };
  }

  // ==================== ESTOQUE ====================

  @Post(':id/stock-movement')
  @RequirePermissions('products.manage_stock')
  async addStockMovement(
    @Param('id') id: string,
    @CurrentCompany() company: { id: string },
    @CurrentUser() user: { userId: string },
    @Body()
    body: {
      type: 'ENTRY' | 'EXIT' | 'ADJUSTMENT' | 'RETURN' | 'LOSS' | 'TRANSFER';
      quantity: number;
      reason?: string;
      notes?: string;
      reference?: string;
    },
  ) {
    return this.productsService.addStockMovement(
      id,
      company.id,
      user.userId,
      body.type,
      body.quantity,
      body.reason,
      body.notes,
      body.reference,
    );
  }

  @Get(':id/stock-history')
  @RequirePermissions('products.read')
  async getStockHistory(
    @Param('id') id: string,
    @CurrentCompany() company: { id: string },
    @Query('limit') limit?: number,
  ) {
    return this.productsService.getStockHistory(id, company.id, limit || 50);
  }

  // ==================== FOTOS ====================

  @Post(':id/photos')
  @RequirePermissions('products.update')
  async addProductPhoto(
    @Param('id') productId: string,
    @CurrentCompany() company: { id: string },
    @CurrentUser() user: { userId: string },
    @Body() body: { documentId: string; order?: number; isPrimary?: boolean },
  ) {
    return this.productsService.addProductPhoto(
      productId,
      body.documentId,
      company.id,
      user.userId,
      body.order,
      body.isPrimary,
    );
  }

  @Delete(':id/photos/:photoId')
  @RequirePermissions('products.update')
  async removeProductPhoto(
    @Param('photoId') photoId: string,
    @CurrentCompany() company: { id: string },
    @CurrentUser() user: { userId: string },
  ) {
    return this.productsService.removeProductPhoto(photoId, company.id, user.userId);
  }

  @Patch(':id/photos/:photoId/primary')
  @RequirePermissions('products.update')
  async setPrimaryPhoto(
    @Param('photoId') photoId: string,
    @CurrentCompany() company: { id: string },
    @CurrentUser() user: { userId: string },
  ) {
    return this.productsService.setPrimaryPhoto(photoId, company.id, user.userId);
  }

  @Patch(':id/photos/reorder')
  @RequirePermissions('products.update')
  async reorderPhotos(
    @Param('id') productId: string,
    @CurrentCompany() company: { id: string },
    @CurrentUser() user: { userId: string },
    @Body() body: { photoOrders: { id: string; order: number }[] },
  ) {
    return this.productsService.reorderPhotos(
      productId,
      body.photoOrders,
      company.id,
      user.userId,
    );
  }
}
