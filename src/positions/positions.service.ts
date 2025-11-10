import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';

@Injectable()
export class PositionsService {
  constructor(private prisma: PrismaService) {}

  async create(createPositionDto: CreatePositionDto, companyId: string) {
    // Verificar se já existe cargo com este código
    const existing = await this.prisma.position.findFirst({
      where: {
        companyId,
        code: createPositionDto.code,
      },
    });

    if (existing) {
      throw new BadRequestException('Já existe um cargo com este código');
    }

    return this.prisma.position.create({
      data: {
        ...createPositionDto,
        companyId,
      },
    });
  }

  async findAll(companyId: string, active?: boolean) {
    const where: any = { companyId };
    if (active !== undefined) {
      where.active = active;
    }

    return this.prisma.position.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { employees: true },
        },
      },
    });
  }

  async findOne(id: string, companyId: string) {
    const position = await this.prisma.position.findFirst({
      where: { id, companyId },
      include: {
        employees: {
          select: {
            id: true,
            name: true,
            cpf: true,
            active: true,
          },
        },
      },
    });

    if (!position) {
      throw new NotFoundException('Cargo não encontrado');
    }

    return position;
  }

  async update(
    id: string,
    updatePositionDto: UpdatePositionDto,
    companyId: string,
  ) {
    await this.findOne(id, companyId);

    // Verificar se já existe outro cargo com este código
    if (updatePositionDto.code) {
      const existing = await this.prisma.position.findFirst({
        where: {
          companyId,
          code: updatePositionDto.code,
          id: { not: id },
        },
      });

      if (existing) {
        throw new BadRequestException('Já existe um cargo com este código');
      }
    }

    return this.prisma.position.update({
      where: { id },
      data: updatePositionDto,
    });
  }

  async remove(id: string, companyId: string) {
    const position = await this.findOne(id, companyId);

    // Verificar se há colaboradores vinculados
    const employeesCount = await this.prisma.employee.count({
      where: { positionId: id },
    });

    if (employeesCount > 0) {
      throw new BadRequestException(
        `Não é possível deletar este cargo pois existem ${employeesCount} colaborador(es) vinculado(s)`,
      );
    }

    await this.prisma.position.delete({ where: { id } });
    return { message: 'Cargo deletado com sucesso' };
  }
}
