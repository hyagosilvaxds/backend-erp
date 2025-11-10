import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFinancialCategoryDto } from '../dto/create-financial-category.dto';
import { UpdateFinancialCategoryDto } from '../dto/update-financial-category.dto';

@Injectable()
export class FinancialCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createFinancialCategoryDto: CreateFinancialCategoryDto) {
    return this.prisma.financialCategory.create({
      data: createFinancialCategoryDto,
    });
  }

  async findAll(companyId: string, type?: string) {
    return this.prisma.financialCategory.findMany({
      where: {
        companyId,
        ...(type && { type }),
      },
      include: {
        parent: true,
        children: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, companyId: string) {
    const category = await this.prisma.financialCategory.findFirst({
      where: { id, companyId },
      include: {
        parent: true,
        children: true,
      },
    });

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    return category;
  }

  async update(id: string, companyId: string, updateFinancialCategoryDto: UpdateFinancialCategoryDto) {
    await this.findOne(id, companyId);

    return this.prisma.financialCategory.update({
      where: { id },
      data: updateFinancialCategoryDto,
    });
  }

  async remove(id: string, companyId: string) {
    await this.findOne(id, companyId);

    return this.prisma.financialCategory.delete({
      where: { id },
    });
  }
}
