import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  /**
   * Listar todas as roles com suas permissões
   */
  async findAll() {
    const roles = await this.prisma.role.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        rolePermissions: {
          select: {
            permission: {
              select: {
                id: true,
                name: true,
                description: true,
                resource: true,
                action: true,
              },
            },
          },
        },
        _count: {
          select: {
            userCompanies: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Formatar resposta
    return roles.map((role) => ({
      id: role.id,
      name: role.name,
      description: role.description,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
      usersCount: role._count.userCompanies,
      permissions: role.rolePermissions.map((rp) => rp.permission),
    }));
  }

  /**
   * Buscar role por ID com permissões
   */
  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        rolePermissions: {
          select: {
            permission: {
              select: {
                id: true,
                name: true,
                description: true,
                resource: true,
                action: true,
              },
            },
          },
        },
        _count: {
          select: {
            userCompanies: true,
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException('Role não encontrada');
    }

    return {
      id: role.id,
      name: role.name,
      description: role.description,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
      usersCount: role._count.userCompanies,
      permissions: role.rolePermissions.map((rp) => rp.permission),
    };
  }

  /**
   * Buscar role por nome
   */
  async findByName(name: string) {
    const role = await this.prisma.role.findUnique({
      where: { name },
      select: {
        id: true,
        name: true,
        description: true,
        rolePermissions: {
          select: {
            permission: {
              select: {
                id: true,
                name: true,
                description: true,
                resource: true,
                action: true,
              },
            },
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException(`Role '${name}' não encontrada`);
    }

    return {
      id: role.id,
      name: role.name,
      description: role.description,
      permissions: role.rolePermissions.map((rp) => rp.permission),
    };
  }

  /**
   * Listar todas as permissões disponíveis
   */
  async findAllPermissions() {
    const permissions = await this.prisma.permission.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        resource: true,
        action: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: [{ resource: 'asc' }, { action: 'asc' }],
    });

    // Agrupar por recurso
    const grouped = permissions.reduce(
      (acc, perm) => {
        if (!acc[perm.resource]) {
          acc[perm.resource] = [];
        }
        acc[perm.resource].push(perm);
        return acc;
      },
      {} as Record<string, typeof permissions>,
    );

    return {
      all: permissions,
      byResource: grouped,
    };
  }

  /**
   * Verificar se role existe
   */
  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.role.count({
      where: { id },
    });
    return count > 0;
  }

  // ==================== CRUD ====================

  /**
   * Criar nova role
   */
  async create(
    createRoleDto: CreateRoleDto,
    companyId: string,
    userId: string,
    metadata?: { ipAddress?: string; userAgent?: string },
  ) {
    // Verificar se já existe role com esse nome
    const existing = await this.prisma.role.findUnique({
      where: { name: createRoleDto.name },
    });

    if (existing) {
      throw new ConflictException('Já existe uma role com este nome');
    }

    // Validar permissões se fornecidas
    if (createRoleDto.permissionIds && createRoleDto.permissionIds.length > 0) {
      const permissions = await this.prisma.permission.findMany({
        where: { id: { in: createRoleDto.permissionIds } },
      });

      if (permissions.length !== createRoleDto.permissionIds.length) {
        throw new BadRequestException('Uma ou mais permissões não foram encontradas');
      }
    }

    // Criar role
    const role = await this.prisma.role.create({
      data: {
        name: createRoleDto.name,
        description: createRoleDto.description,
        rolePermissions: createRoleDto.permissionIds
          ? {
              create: createRoleDto.permissionIds.map((permissionId) => ({
                permissionId,
              })),
            }
          : undefined,
      },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    // Registrar auditoria
    await this.auditService.logRoleCreate(
      companyId,
      userId,
      {
        id: role.id,
        name: role.name,
        description: role.description,
        permissions: role.rolePermissions.map((rp) => rp.permission.name),
      },
      metadata,
    );

    return {
      id: role.id,
      name: role.name,
      description: role.description,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
      permissions: role.rolePermissions.map((rp) => rp.permission),
    };
  }

  /**
   * Atualizar role
   */
  async update(
    id: string,
    updateRoleDto: UpdateRoleDto,
    companyId: string,
    userId: string,
    metadata?: { ipAddress?: string; userAgent?: string },
  ) {
    // Verificar se role existe
    const existingRole = await this.prisma.role.findUnique({
      where: { id },
    });

    if (!existingRole) {
      throw new NotFoundException('Role não encontrada');
    }

    // Verificar se nome já existe (se estiver alterando)
    if (updateRoleDto.name && updateRoleDto.name !== existingRole.name) {
      const nameExists = await this.prisma.role.findUnique({
        where: { name: updateRoleDto.name },
      });

      if (nameExists) {
        throw new ConflictException('Já existe uma role com este nome');
      }
    }

    // Atualizar role
    const updated = await this.prisma.role.update({
      where: { id },
      data: {
        name: updateRoleDto.name,
        description: updateRoleDto.description,
      },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    // Registrar auditoria
    await this.auditService.logRoleUpdate(
      companyId,
      userId,
      id,
      existingRole,
      updated,
      metadata,
    );

    return {
      id: updated.id,
      name: updated.name,
      description: updated.description,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      permissions: updated.rolePermissions.map((rp) => rp.permission),
    };
  }

  /**
   * Deletar role
   */
  async remove(
    id: string,
    companyId: string,
    userId: string,
    metadata?: { ipAddress?: string; userAgent?: string },
  ) {
    // Verificar se role existe
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            userCompanies: true,
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException('Role não encontrada');
    }

    // Verificar se existem usuários usando esta role
    if (role._count.userCompanies > 0) {
      throw new BadRequestException(
        `Não é possível deletar esta role pois existem ${role._count.userCompanies} usuários atribuídos a ela`,
      );
    }

    // Deletar role (permissões são deletadas em cascata)
    await this.prisma.role.delete({
      where: { id },
    });

    // Registrar auditoria
    await this.auditService.logRoleDelete(
      companyId,
      userId,
      { id: role.id, name: role.name, description: role.description },
      metadata,
    );
  }

  // ==================== PERMISSÕES ====================

  /**
   * Adicionar permissões a uma role
   */
  async addPermissions(
    roleId: string,
    permissionIds: string[],
    companyId: string,
    userId: string,
    metadata?: { ipAddress?: string; userAgent?: string },
  ) {
    // Verificar se role existe
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException('Role não encontrada');
    }

    // Verificar se permissões existem
    const permissions = await this.prisma.permission.findMany({
      where: { id: { in: permissionIds } },
    });

    if (permissions.length !== permissionIds.length) {
      throw new BadRequestException('Uma ou mais permissões não foram encontradas');
    }

    // Verificar quais permissões já estão atribuídas
    const existingPermissionIds = role.rolePermissions.map((rp) => rp.permissionId);
    const newPermissionIds = permissionIds.filter((id) => !existingPermissionIds.includes(id));

    if (newPermissionIds.length === 0) {
      throw new BadRequestException('Todas as permissões já estão atribuídas a esta role');
    }

    // Adicionar novas permissões
    await this.prisma.rolePermission.createMany({
      data: newPermissionIds.map((permissionId) => ({
        roleId,
        permissionId,
      })),
    });

    // Registrar auditoria para cada permissão adicionada
    for (const permissionId of newPermissionIds) {
      const permission = permissions.find((p) => p.id === permissionId);
      if (permission) {
        await this.auditService.logRoleAddPermission(
          companyId,
          userId,
          roleId,
          { id: permission.id, name: permission.name },
          metadata,
        );
      }
    }

    // Retornar role atualizada
    return this.findOne(roleId);
  }

  /**
   * Remover permissões de uma role
   */
  async removePermissions(
    roleId: string,
    permissionIds: string[],
    companyId: string,
    userId: string,
    metadata?: { ipAddress?: string; userAgent?: string },
  ) {
    // Verificar se role existe
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException('Role não encontrada');
    }

    // Verificar quais permissões estão realmente atribuídas
    const existingPermissionIds = role.rolePermissions.map((rp) => rp.permissionId);
    const toRemove = permissionIds.filter((id) => existingPermissionIds.includes(id));

    if (toRemove.length === 0) {
      throw new BadRequestException('Nenhuma das permissões fornecidas está atribuída a esta role');
    }

    // Remover permissões
    await this.prisma.rolePermission.deleteMany({
      where: {
        roleId,
        permissionId: { in: toRemove },
      },
    });

    // Registrar auditoria para cada permissão removida
    for (const permissionId of toRemove) {
      const permission = role.rolePermissions.find((rp) => rp.permissionId === permissionId);
      if (permission) {
        await this.auditService.logRoleRemovePermission(
          companyId,
          userId,
          roleId,
          { id: permission.permission.id, name: permission.permission.name },
          metadata,
        );
      }
    }

    // Retornar role atualizada
    return this.findOne(roleId);
  }
}
