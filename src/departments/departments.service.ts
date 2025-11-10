import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

  async create(createDepartmentDto: CreateDepartmentDto, companyId: string) {
    // Check if code already exists for this company
    const existing = await this.prisma.department.findFirst({
      where: {
        companyId,
        code: createDepartmentDto.code,
      },
    });

    if (existing) {
      throw new BadRequestException(
        `Department with code ${createDepartmentDto.code} already exists`,
      );
    }

    // If parentId is provided, verify it exists and belongs to the same company
    if (createDepartmentDto.parentId) {
      const parent = await this.prisma.department.findFirst({
        where: {
          id: createDepartmentDto.parentId,
          companyId,
        },
      });

      if (!parent) {
        throw new BadRequestException('Parent department not found');
      }
    }

    // If managerId is provided, verify the employee exists and belongs to the same company
    if (createDepartmentDto.managerId) {
      const manager = await this.prisma.employee.findFirst({
        where: {
          id: createDepartmentDto.managerId,
          companyId,
        },
      });

      if (!manager) {
        throw new BadRequestException('Manager employee not found');
      }
    }

    return this.prisma.department.create({
      data: {
        ...createDepartmentDto,
        companyId,
      },
      include: {
        parent: true,
        _count: {
          select: {
            employees: true,
            children: true,
          },
        },
      },
    });
  }

  async findAll(companyId: string, active?: boolean) {
    return this.prisma.department.findMany({
      where: {
        companyId,
        ...(active !== undefined && { active }),
      },
      include: {
        parent: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        _count: {
          select: {
            employees: true,
            children: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: string, companyId: string) {
    const department = await this.prisma.department.findFirst({
      where: {
        id,
        companyId,
      },
      include: {
        parent: true,
        children: {
          select: {
            id: true,
            code: true,
            name: true,
            active: true,
            _count: {
              select: {
                employees: true,
              },
            },
          },
        },
        employees: {
          select: {
            id: true,
            name: true,
            email: true,
            active: true,
            position: {
              select: {
                id: true,
                code: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            employees: true,
            children: true,
          },
        },
      },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    return department;
  }

  async update(
    id: string,
    updateDepartmentDto: UpdateDepartmentDto,
    companyId: string,
  ) {
    const department = await this.prisma.department.findFirst({
      where: {
        id,
        companyId,
      },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    // If updating code, check if new code already exists
    if (updateDepartmentDto.code && updateDepartmentDto.code !== department.code) {
      const existing = await this.prisma.department.findFirst({
        where: {
          companyId,
          code: updateDepartmentDto.code,
          id: { not: id },
        },
      });

      if (existing) {
        throw new BadRequestException(
          `Department with code ${updateDepartmentDto.code} already exists`,
        );
      }
    }

    // If updating parentId, verify it exists and belongs to the same company
    if (updateDepartmentDto.parentId) {
      // Check if parent is not the department itself
      if (updateDepartmentDto.parentId === id) {
        throw new BadRequestException('Department cannot be its own parent');
      }

      const parent = await this.prisma.department.findFirst({
        where: {
          id: updateDepartmentDto.parentId,
          companyId,
        },
      });

      if (!parent) {
        throw new BadRequestException('Parent department not found');
      }

      // Check for circular reference (parent cannot be a child of this department)
      const isCircular = await this.checkCircularReference(
        id,
        updateDepartmentDto.parentId,
        companyId,
      );

      if (isCircular) {
        throw new BadRequestException(
          'Circular reference detected: parent department cannot be a child of this department',
        );
      }
    }

    // If updating managerId, verify the employee exists
    if (updateDepartmentDto.managerId) {
      const manager = await this.prisma.employee.findFirst({
        where: {
          id: updateDepartmentDto.managerId,
          companyId,
        },
      });

      if (!manager) {
        throw new BadRequestException('Manager employee not found');
      }
    }

    return this.prisma.department.update({
      where: { id },
      data: updateDepartmentDto,
      include: {
        parent: true,
        _count: {
          select: {
            employees: true,
            children: true,
          },
        },
      },
    });
  }

  async remove(id: string, companyId: string) {
    const department = await this.prisma.department.findFirst({
      where: {
        id,
        companyId,
      },
      include: {
        _count: {
          select: {
            employees: true,
            children: true,
          },
        },
      },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    if (department._count.employees > 0) {
      throw new BadRequestException(
        `Cannot delete department with ${department._count.employees} employees. Please reassign employees first.`,
      );
    }

    if (department._count.children > 0) {
      throw new BadRequestException(
        `Cannot delete department with ${department._count.children} sub-departments. Please reassign or delete sub-departments first.`,
      );
    }

    await this.prisma.department.delete({
      where: { id },
    });

    return { message: 'Department deleted successfully' };
  }

  // Helper method to check circular reference
  private async checkCircularReference(
    departmentId: string,
    parentId: string,
    companyId: string,
  ): Promise<boolean> {
    let currentParentId: string | null = parentId;

    while (currentParentId) {
      if (currentParentId === departmentId) {
        return true;
      }

      const parent = await this.prisma.department.findFirst({
        where: {
          id: currentParentId,
          companyId,
        },
        select: {
          parentId: true,
        },
      });

      if (!parent) {
        break;
      }

      currentParentId = parent.parentId;
    }

    return false;
  }
}
