import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDeductionTypeDto } from './dto/create-deduction-type.dto';
import { UpdateDeductionTypeDto } from './dto/update-deduction-type.dto';
import { ListDeductionTypesDto } from './dto/list-deduction-types.dto';

@Injectable()
export class DeductionTypesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDeductionTypeDto: CreateDeductionTypeDto, companyId: string) {
    const { code, name, description, isRecurrent, isPercentage, baseValue } = createDeductionTypeDto;

    // Verificar se já existe um tipo de desconto com o mesmo código na empresa
    const existingDeductionType = await this.prisma.deductionType.findUnique({
      where: {
        companyId_code: {
          companyId,
          code,
        },
      },
    });

    if (existingDeductionType) {
      throw new BadRequestException(
        'Já existe um tipo de desconto com este código nesta empresa',
      );
    }

    return await this.prisma.deductionType.create({
      data: {
        companyId,
        code,
        name,
        description,
        isRecurrent: isRecurrent ?? false,
        isPercentage: isPercentage ?? false,
        baseValue,
      },
    });
  }

  async findAll(listDeductionTypesDto: ListDeductionTypesDto, companyId: string) {
    const { active, isRecurrent, search } = listDeductionTypesDto;

    const where: any = {
      companyId,
    };

    if (active !== undefined) {
      where.active = active;
    }

    if (isRecurrent !== undefined) {
      where.isRecurrent = isRecurrent;
    }

    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [deductionTypes, total] = await Promise.all([
      this.prisma.deductionType.findMany({
        where,
        orderBy: [{ code: 'asc' }],
      }),
      this.prisma.deductionType.count({ where }),
    ]);

    return {
      data: deductionTypes,
      total,
    };
  }

  async findOne(id: string, companyId: string) {
    const deductionType = await this.prisma.deductionType.findFirst({
      where: {
        id,
        companyId,
      },
    });

    if (!deductionType) {
      throw new NotFoundException('Tipo de desconto não encontrado');
    }

    return deductionType;
  }

  async update(
    id: string,
    updateDeductionTypeDto: UpdateDeductionTypeDto,
    companyId: string,
  ) {
    const deductionType = await this.findOne(id, companyId);

    // Se estiver alterando o código, verificar se o novo código já existe
    if (updateDeductionTypeDto.code && updateDeductionTypeDto.code !== deductionType.code) {
      const existingDeductionType = await this.prisma.deductionType.findUnique({
        where: {
          companyId_code: {
            companyId,
            code: updateDeductionTypeDto.code,
          },
        },
      });

      if (existingDeductionType) {
        throw new BadRequestException(
          'Já existe um tipo de desconto com este código nesta empresa',
        );
      }
    }

    return await this.prisma.deductionType.update({
      where: { id },
      data: updateDeductionTypeDto,
    });
  }

  async remove(id: string, companyId: string) {
    await this.findOne(id, companyId);

    // TODO: Verificar se existem colaboradores usando este tipo de desconto
    // quando o modelo EmployeeDeduction for criado

    await this.prisma.deductionType.delete({
      where: { id },
    });

    return { message: 'Tipo de desconto deletado com sucesso' };
  }

  async toggleActive(id: string, companyId: string) {
    const deductionType = await this.findOne(id, companyId);

    return await this.prisma.deductionType.update({
      where: { id },
      data: {
        active: !deductionType.active,
      },
    });
  }
}
