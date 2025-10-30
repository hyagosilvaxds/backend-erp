import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AssignUserToCompanyDto } from './dto/assign-user-to-company.dto';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  // ==================== LISTAGEM ====================

  /**
   * Listar TODOS os usuários do sistema (para admin)
   */
  async findAllUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    active?: boolean;
  }) {
    const { page = 1, limit = 50, search, active } = params;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (active !== undefined) {
      where.active = active;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          active: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              companies: true,
            },
          },
          companies: {
            select: {
              companyId: true,
              roleId: true,
              active: true,
              company: {
                select: {
                  id: true,
                  nomeFantasia: true,
                  razaoSocial: true,
                },
              },
              role: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                },
              },
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Listar usuários de uma empresa específica
   */
  async findUsersByCompany(
    companyId: string,
    params: {
      page?: number;
      limit?: number;
      search?: string;
      active?: boolean;
      roleId?: string;
    },
  ) {
    const { page = 1, limit = 50, search, active, roleId } = params;
    const skip = (page - 1) * limit;

    // Verificar se empresa existe
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Empresa não encontrada');
    }

    const where: any = {
      companies: {
        some: {
          companyId: companyId,
        },
      },
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (active !== undefined) {
      where.active = active;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          active: true,
          createdAt: true,
          updatedAt: true,
          companies: {
            where: {
              companyId: companyId,
              ...(roleId ? { roleId } : {}),
            },
            select: {
              companyId: true,
              roleId: true,
              active: true,
              createdAt: true,
              role: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                },
              },
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      company: {
        id: company.id,
        nomeFantasia: company.nomeFantasia,
        razaoSocial: company.razaoSocial,
      },
    };
  }

  /**
   * Buscar usuário por ID
   */
  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        active: true,
        createdAt: true,
        updatedAt: true,
        companies: {
          select: {
            companyId: true,
            roleId: true,
            active: true,
            createdAt: true,
            company: {
              select: {
                id: true,
                nomeFantasia: true,
                razaoSocial: true,
                cnpj: true,
                logoUrl: true,
              },
            },
            role: {
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
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }

  // ==================== CRUD ====================

  /**
   * Criar novo usuário
   */
  async create(
    createUserDto: CreateUserDto,
    adminId?: string,
    companyId?: string,
    metadata?: { ipAddress?: string; userAgent?: string },
  ) {
    // Verificar se email já existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email já cadastrado');
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        name: createUserDto.name,
        password: hashedPassword,
        active: createUserDto.active ?? true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Registrar auditoria
    if (adminId && companyId) {
      await this.auditService.logUserCreate(
        companyId,
        adminId,
        { id: user.id, email: user.email, name: user.name },
        metadata,
      );
    }

    return user;
  }

  /**
   * Atualizar usuário
   */
  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    adminId?: string,
    companyId?: string,
    metadata?: { ipAddress?: string; userAgent?: string },
  ) {
    // Verificar se usuário existe
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Se está alterando email, verificar se já não existe
    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const emailExists = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });

      if (emailExists) {
        throw new ConflictException('Email já cadastrado');
      }
    }

    const data: any = {};

    if (updateUserDto.email) data.email = updateUserDto.email;
    if (updateUserDto.name) data.name = updateUserDto.name;
    if (updateUserDto.active !== undefined) data.active = updateUserDto.active;

    // Se está alterando senha, fazer hash
    if (updateUserDto.password) {
      data.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const user = await this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Registrar auditoria
    if (adminId && companyId) {
      await this.auditService.logUserUpdate(
        companyId,
        adminId,
        id,
        existingUser,
        user,
        metadata,
      );
    }

    return user;
  }

  /**
   * Ativar/Desativar usuário
   */
  async toggleActive(
    id: string,
    adminId?: string,
    companyId?: string,
    metadata?: { ipAddress?: string; userAgent?: string },
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        active: !user.active,
      },
      select: {
        id: true,
        email: true,
        name: true,
        active: true,
        updatedAt: true,
      },
    });

    // Registrar auditoria
    if (adminId && companyId) {
      await this.auditService.logUserToggleActive(
        companyId,
        adminId,
        id,
        updated.active,
        metadata,
      );
    }

    return updated;
  }

  /**
   * Deletar usuário (soft delete)
   */
  async remove(
    id: string,
    adminId?: string,
    companyId?: string,
    metadata?: { ipAddress?: string; userAgent?: string },
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Desativar usuário e remover de todas as empresas
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id },
        data: { active: false },
      }),
      this.prisma.userCompany.updateMany({
        where: { userId: id },
        data: { active: false },
      }),
    ]);

    // Registrar auditoria
    if (adminId && companyId) {
      await this.auditService.logUserDelete(
        companyId,
        adminId,
        id,
        { id: user.id, email: user.email, name: user.name },
        metadata,
      );
    }
  }

  // ==================== GESTÃO DE EMPRESAS ====================

  /**
   * Vincular usuário a uma empresa
   */
  async assignToCompany(
    userId: string,
    assignDto: AssignUserToCompanyDto,
    adminId?: string,
    metadata?: { ipAddress?: string; userAgent?: string },
  ) {
    // Verificar se usuário existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Verificar se empresa existe
    const company = await this.prisma.company.findUnique({
      where: { id: assignDto.companyId },
    });

    if (!company) {
      throw new NotFoundException('Empresa não encontrada');
    }

    // Verificar se role existe
    const role = await this.prisma.role.findUnique({
      where: { id: assignDto.roleId },
    });

    if (!role) {
      throw new NotFoundException('Role não encontrada');
    }

    // Verificar se já existe vínculo
    const existing = await this.prisma.userCompany.findUnique({
      where: {
        userId_companyId: {
          userId,
          companyId: assignDto.companyId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Usuário já vinculado a esta empresa');
    }

    const userCompany = await this.prisma.userCompany.create({
      data: {
        userId,
        companyId: assignDto.companyId,
        roleId: assignDto.roleId,
        active: assignDto.active ?? true,
      },
      include: {
        company: {
          select: {
            id: true,
            nomeFantasia: true,
            razaoSocial: true,
          },
        },
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    // Registrar auditoria
    if (adminId) {
      await this.auditService.logUserAssignToCompany(
        assignDto.companyId,
        adminId,
        userId,
        { id: role.id, name: role.name },
        metadata,
      );
    }

    return userCompany;
  }

  /**
   * Atualizar role do usuário em uma empresa
   */
  async updateUserCompanyRole(
    userId: string,
    companyId: string,
    roleId: string,
    adminId?: string,
    metadata?: { ipAddress?: string; userAgent?: string },
  ) {
    // Verificar se role existe
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException('Role não encontrada');
    }

    // Verificar se vínculo existe
    const userCompany = await this.prisma.userCompany.findUnique({
      where: {
        userId_companyId: {
          userId,
          companyId,
        },
      },
      include: {
        user: true,
        role: true,
        company: true,
      },
    });

    if (!userCompany) {
      throw new NotFoundException('Vínculo usuário-empresa não encontrado');
    }

    const updated = await this.prisma.userCompany.update({
      where: {
        userId_companyId: {
          userId,
          companyId,
        },
      },
      data: {
        roleId,
      },
      include: {
        company: {
          select: {
            id: true,
            nomeFantasia: true,
            razaoSocial: true,
          },
        },
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    // Registrar auditoria
    if (adminId) {
      await this.auditService.logUserRoleChange(
        companyId,
        adminId,
        userId,
        { id: userCompany.role.id, name: userCompany.role.name },
        { id: role.id, name: role.name },
        metadata,
      );
    }

    return updated;
  }

  /**
   * Remover usuário de uma empresa
   */
  async removeFromCompany(
    userId: string,
    companyId: string,
    adminId?: string,
    metadata?: { ipAddress?: string; userAgent?: string },
  ) {
    const userCompany = await this.prisma.userCompany.findUnique({
      where: {
        userId_companyId: {
          userId,
          companyId,
        },
      },
      include: {
        user: true,
        company: true,
        role: true,
      },
    });

    if (!userCompany) {
      throw new NotFoundException('Vínculo usuário-empresa não encontrado');
    }

    // Verificar se é a última empresa do usuário
    const companiesCount = await this.prisma.userCompany.count({
      where: {
        userId,
        active: true,
      },
    });

    if (companiesCount === 1) {
      throw new BadRequestException(
        'Não é possível remover usuário da única empresa. Desative o usuário ao invés disso.',
      );
    }

    await this.prisma.userCompany.delete({
      where: {
        userId_companyId: {
          userId,
          companyId,
        },
      },
    });

    // Registrar auditoria
    if (adminId) {
      await this.auditService.logUserRemoveFromCompany(
        companyId,
        adminId,
        userId,
        metadata,
      );
    }
  }

  /**
   * Listar empresas de um usuário
   */
  async getUserCompanies(userId: string) {
    const userCompanies = await this.prisma.userCompany.findMany({
      where: {
        userId: userId,
        active: true,
      },
      include: {
        company: true,
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    return userCompanies.map((uc) => ({
      id: uc.company.id,
      razaoSocial: uc.company.razaoSocial,
      nomeFantasia: uc.company.nomeFantasia,
      cnpj: uc.company.cnpj,
      logoUrl: uc.company.logoUrl,
      email: uc.company.email,
      telefone: uc.company.telefone,
      cidade: uc.company.cidade,
      estado: uc.company.estado,
      active: uc.company.active,
      role: {
        id: uc.role.id,
        name: uc.role.name,
        description: uc.role.description,
        permissions: uc.role.rolePermissions.map((rp) => ({
          id: rp.permission.id,
          name: rp.permission.name,
          description: rp.permission.description,
          resource: rp.permission.resource,
          action: rp.permission.action,
        })),
      },
    }));
  }

  // ==================== MÉTODOS LEGADOS (manter compatibilidade) ====================

  async findAll(companyId: string) {
    return this.findUsersByCompany(companyId, {
      page: 1,
      limit: 50,
    });
  }

  // ==================== GESTÃO DE PERFIL ====================

  /**
   * Atualizar foto do usuário
   */
  async updatePhoto(userId: string, filename: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Se já tinha foto, deletar a antiga
    if (user.photoUrl) {
      const oldPhotoPath = path.join(
        process.cwd(),
        'uploads',
        'users',
        path.basename(user.photoUrl),
      );
      if (fs.existsSync(oldPhotoPath)) {
        fs.unlinkSync(oldPhotoPath);
      }
    }

    const photoUrl = `/uploads/users/${filename}`;

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { photoUrl },
      select: {
        id: true,
        email: true,
        name: true,
        photoUrl: true,
        active: true,
        updatedAt: true,
      },
    });

    return updated;
  }

  /**
   * Remover foto do usuário
   */
  async deletePhoto(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (!user.photoUrl) {
      throw new BadRequestException('Usuário não possui foto');
    }

    // Deletar arquivo físico
    const photoPath = path.join(
      process.cwd(),
      'uploads',
      'users',
      path.basename(user.photoUrl),
    );
    if (fs.existsSync(photoPath)) {
      fs.unlinkSync(photoPath);
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { photoUrl: null },
      select: {
        id: true,
        email: true,
        name: true,
        photoUrl: true,
        active: true,
        updatedAt: true,
      },
    });

    return updated;
  }

  /**
   * Alterar email do usuário (apenas admin)
   */
  async changeEmail(userId: string, newEmail: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Verificar se novo email já existe
    const emailExists = await this.prisma.user.findUnique({
      where: { email: newEmail },
    });

    if (emailExists && emailExists.id !== userId) {
      throw new ConflictException('Email já está em uso');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { email: newEmail },
      select: {
        id: true,
        email: true,
        name: true,
        photoUrl: true,
        active: true,
        updatedAt: true,
      },
    });

    return updated;
  }

  /**
   * Alterar senha do usuário
   * Se isOwnProfile = true, valida senha antiga
   * Se isOwnProfile = false (admin), não valida senha antiga
   */
  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
    isOwnProfile: boolean,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Se é o próprio usuário, validar senha antiga
    if (isOwnProfile) {
      const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Senha antiga incorreta');
      }
    }

    // Validar nova senha
    if (newPassword.length < 6) {
      throw new BadRequestException(
        'Nova senha deve ter no mínimo 6 caracteres',
      );
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
      select: {
        id: true,
        email: true,
        name: true,
        photoUrl: true,
        active: true,
        updatedAt: true,
      },
    });

    return {
      ...updated,
      message: 'Senha alterada com sucesso',
    };
  }
}
