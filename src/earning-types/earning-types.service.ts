import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEarningTypeDto } from './dto/create-earning-type.dto';
import { UpdateEarningTypeDto } from './dto/update-earning-type.dto';
import { ListEarningTypesDto } from './dto/list-earning-types.dto';

@Injectable()
export class EarningTypesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createEarningTypeDto: CreateEarningTypeDto, companyId: string) {
    const { code, name, description, isRecurrent, isPercentage, baseValue, hasINSS, hasFGTS, hasIRRF } = createEarningTypeDto;

    // Verificar se já existe um tipo de provento com o mesmo código na empresa
    const existingEarningType = await this.prisma.earningType.findUnique({
      where: {
        companyId_code: {
          companyId,
          code,
        },
      },
    });

    if (existingEarningType) {
      throw new BadRequestException(
        'Já existe um tipo de provento com este código nesta empresa',
      );
    }

    return await this.prisma.earningType.create({
      data: {
        companyId,
        code,
        name,
        description,
        isRecurrent: isRecurrent ?? false,
        isPercentage: isPercentage ?? false,
        baseValue,
        hasINSS: hasINSS ?? true,
        hasFGTS: hasFGTS ?? true,
        hasIRRF: hasIRRF ?? true,
      },
    });
  }

  async findAll(listEarningTypesDto: ListEarningTypesDto, companyId: string) {
    const { active, isRecurrent, search } = listEarningTypesDto;

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

    const [earningTypes, total] = await Promise.all([
      this.prisma.earningType.findMany({
        where,
        orderBy: [{ code: 'asc' }],
      }),
      this.prisma.earningType.count({ where }),
    ]);

    return {
      data: earningTypes,
      total,
    };
  }

  async findOne(id: string, companyId: string) {
    const earningType = await this.prisma.earningType.findFirst({
      where: {
        id,
        companyId,
      },
      include: {
        _count: {
          select: {
            employeeEarnings: true,
          },
        },
      },
    });

    if (!earningType) {
      throw new NotFoundException('Tipo de provento não encontrado');
    }

    return earningType;
  }

  async update(
    id: string,
    updateEarningTypeDto: UpdateEarningTypeDto,
    companyId: string,
  ) {
    const earningType = await this.findOne(id, companyId);

    // Se estiver alterando o código, verificar se o novo código já existe
    if (updateEarningTypeDto.code && updateEarningTypeDto.code !== earningType.code) {
      const existingEarningType = await this.prisma.earningType.findUnique({
        where: {
          companyId_code: {
            companyId,
            code: updateEarningTypeDto.code,
          },
        },
      });

      if (existingEarningType) {
        throw new BadRequestException(
          'Já existe um tipo de provento com este código nesta empresa',
        );
      }
    }

    return await this.prisma.earningType.update({
      where: { id },
      data: updateEarningTypeDto,
    });
  }

  async remove(id: string, companyId: string) {
    const earningType = await this.findOne(id, companyId);

    // Verificar se existem colaboradores usando este tipo de provento
    const employeeEarningsCount = await this.prisma.employeeEarning.count({
      where: {
        earningTypeId: id,
        employee: {
          companyId,
        },
      },
    });

    if (employeeEarningsCount > 0) {
      throw new BadRequestException(
        `Não é possível deletar este tipo de provento pois existem ${employeeEarningsCount} colaborador(es) usando-o`,
      );
    }

    await this.prisma.earningType.delete({
      where: { id },
    });

    return { message: 'Tipo de provento deletado com sucesso' };
  }

  async toggleActive(id: string, companyId: string) {
    const earningType = await this.findOne(id, companyId);

    return await this.prisma.earningType.update({
      where: { id },
      data: {
        active: !earningType.active,
      },
    });
  }
}
