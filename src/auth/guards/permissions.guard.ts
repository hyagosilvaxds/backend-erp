import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { SKIP_PERMISSIONS_KEY } from '../decorators/skip-permissions.decorator';

export const PERMISSIONS_KEY = 'permissions';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Verificar se deve pular verificação de permissões
    const skipPermissions = this.reflector.getAllAndOverride<boolean>(
      SKIP_PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (skipPermissions) {
      return true;
    }

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const companyId = request.headers['x-company-id'];

    // Para criação de empresas, não exige company-id
    // Busca as permissões em qualquer empresa do usuário
    if (!companyId && requiredPermissions.includes('companies.create')) {
      return this.checkCreateCompanyPermission(request, user, requiredPermissions);
    }

    if (!companyId) {
      throw new ForbiddenException(
        'Empresa não especificada no cabeçalho x-company-id',
      );
    }

    // Buscar as permissões do usuário na empresa específica
    const userCompany = await this.prisma.userCompany.findUnique({
      where: {
        userId_companyId: {
          userId: user.userId,
          companyId: companyId,
        },
      },
      include: {
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

    if (!userCompany || !userCompany.active) {
      throw new ForbiddenException(
        'Usuário não tem acesso a esta empresa',
      );
    }

    const userPermissions = userCompany.role.rolePermissions.map(
      (rp) => `${rp.permission.resource}.${rp.permission.action}`,
    );

    const hasPermission = requiredPermissions.some((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        'Usuário não tem permissão para executar esta ação',
      );
    }

    // Adicionar informações da empresa e role ao request
    request.company = {
      id: userCompany.companyId,
      role: userCompany.role.name,
      permissions: userPermissions,
    };

    return true;
  }

  /**
   * Valida permissão para criar empresas sem x-company-id
   * Verifica se o usuário tem a permissão em QUALQUER empresa
   */
  private async checkCreateCompanyPermission(
    request: any,
    user: any,
    requiredPermissions: string[],
  ): Promise<boolean> {
    // Buscar todas as empresas do usuário
    const userCompanies = await this.prisma.userCompany.findMany({
      where: {
        userId: user.userId,
        active: true,
      },
      include: {
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

    if (userCompanies.length === 0) {
      throw new ForbiddenException(
        'Usuário não tem acesso a nenhuma empresa',
      );
    }

    // Verificar se em alguma empresa o usuário tem a permissão necessária
    for (const userCompany of userCompanies) {
      // Verificar se a role tem a permissão
      const userPermissions = userCompany.role.rolePermissions.map(
        (rp) => `${rp.permission.resource}.${rp.permission.action}`,
      );

      const hasPermission = requiredPermissions.some((permission) =>
        userPermissions.includes(permission),
      );

      if (hasPermission) {
        request.company = {
          id: null, // Não há empresa específica para criação
          role: userCompany.role.name,
          permissions: userPermissions,
        };
        return true;
      }
    }

    throw new ForbiddenException(
      'Usuário não tem permissão para criar empresas',
    );
  }
}
