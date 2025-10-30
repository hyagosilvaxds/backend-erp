import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@Controller('audit')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  /**
   * GET /audit/company/:id
   * Busca histórico de auditoria de uma empresa
   * Permissão: MANAGE_COMPANIES (apenas admins)
   */
  @Get('company/:id')
  @RequirePermissions('MANAGE_COMPANIES')
  async getCompanyAuditHistory(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('action') action?: string,
  ) {
    return this.auditService.getCompanyAuditHistory(id, {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      action,
    });
  }

  /**
   * GET /audit/user/:id
   * Busca histórico de auditoria de um usuário
   * Permissão: MANAGE_COMPANIES (apenas admins)
   */
  @Get('user/:id')
  @RequirePermissions('MANAGE_COMPANIES')
  async getUserAuditHistory(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.auditService.getUserAuditHistory(id, {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  /**
   * GET /audit/users
   * Busca histórico de auditoria de ações relacionadas a usuários
   * Permissão: users.read
   */
  @Get('users')
  @RequirePermissions('users.read')
  async getUsersAuditHistory(
    @Query('companyId') companyId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('action') action?: string,
  ) {
    const actions = action ? [action] : [
      'USER_CREATE',
      'USER_UPDATE',
      'PASSWORD_CHANGE',
      'EMAIL_CHANGE',
      'USER_PHOTO_UPLOAD',
      'USER_PHOTO_REMOVE',
      'USER_TOGGLE_ACTIVE',
      'USER_DELETE',
      'USER_ASSIGN_COMPANY',
      'USER_ROLE_CHANGE',
      'USER_REMOVE_COMPANY',
    ];

    return this.auditService.getCompanyAuditHistory(companyId, {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      actions,
    });
  }

  /**
   * GET /audit/roles
   * Busca histórico de auditoria de ações relacionadas a roles
   * Permissão: users.read
   */
  @Get('roles')
  @RequirePermissions('users.read')
  async getRolesAuditHistory(
    @Query('companyId') companyId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('action') action?: string,
  ) {
    const actions = action ? [action] : [
      'ROLE_CREATE',
      'ROLE_UPDATE',
      'ROLE_DELETE',
      'ROLE_ADD_PERMISSION',
      'ROLE_REMOVE_PERMISSION',
    ];

    return this.auditService.getCompanyAuditHistory(companyId, {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      actions,
    });
  }
}
