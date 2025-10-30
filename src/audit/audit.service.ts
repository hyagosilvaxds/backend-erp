import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AuditLogData {
  companyId: string;
  userId: string;
  action: string;
  entityType?: string;
  fieldName?: string;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
  userAgent?: string;
  description?: string;
}

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  /**
   * Registra uma ação de auditoria
   */
  async log(data: AuditLogData) {
    return this.prisma.companyAudit.create({
      data: {
        companyId: data.companyId,
        userId: data.userId,
        action: data.action,
        entityType: data.entityType || 'Company',
        fieldName: data.fieldName,
        oldValue: data.oldValue ? JSON.stringify(data.oldValue) : null,
        newValue: data.newValue ? JSON.stringify(data.newValue) : null,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        description: data.description,
      },
    });
  }

  /**
   * Registra criação de empresa
   */
  async logCreate(companyId: string, userId: string, companyData: any, metadata?: { ipAddress?: string; userAgent?: string }) {
    return this.log({
      companyId,
      userId,
      action: 'CREATE',
      newValue: companyData,
      description: `Empresa criada: ${companyData.razaoSocial}`,
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
    });
  }

  /**
   * Registra atualização de empresa
   */
  async logUpdate(
    companyId: string,
    userId: string,
    oldData: any,
    newData: any,
    metadata?: { ipAddress?: string; userAgent?: string },
  ) {
    // Detectar campos alterados
    const changes = this.detectChanges(oldData, newData);
    
    // Criar múltiplos registros de auditoria, um por campo alterado
    const auditPromises = changes.map(change =>
      this.log({
        companyId,
        userId,
        action: 'UPDATE',
        fieldName: change.field,
        oldValue: change.oldValue,
        newValue: change.newValue,
        description: `Campo "${change.field}" alterado`,
        ipAddress: metadata?.ipAddress,
        userAgent: metadata?.userAgent,
      }),
    );

    return Promise.all(auditPromises);
  }

  /**
   * Registra upload de logo
   */
  async logUploadLogo(
    companyId: string,
    userId: string,
    logoUrl: string,
    metadata?: { ipAddress?: string; userAgent?: string },
  ) {
    return this.log({
      companyId,
      userId,
      action: 'UPLOAD_LOGO',
      newValue: { logoUrl },
      description: 'Logo da empresa atualizada',
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
    });
  }

  /**
   * Registra remoção de logo
   */
  async logRemoveLogo(
    companyId: string,
    userId: string,
    metadata?: { ipAddress?: string; userAgent?: string },
  ) {
    return this.log({
      companyId,
      userId,
      action: 'REMOVE_LOGO',
      description: 'Logo da empresa removida',
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
    });
  }

  /**
   * Registra upload de certificado A1
   */
  async logUploadCertificate(
    companyId: string,
    userId: string,
    metadata?: { ipAddress?: string; userAgent?: string },
  ) {
    return this.log({
      companyId,
      userId,
      action: 'UPLOAD_CERTIFICATE',
      description: 'Certificado digital A1 atualizado',
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
    });
  }

  /**
   * Registra remoção de certificado A1
   */
  async logRemoveCertificate(
    companyId: string,
    userId: string,
    metadata?: { ipAddress?: string; userAgent?: string },
  ) {
    return this.log({
      companyId,
      userId,
      action: 'REMOVE_CERTIFICATE',
      description: 'Certificado digital A1 removido',
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
    });
  }

  /**
   * Registra ativação/desativação de empresa
   */
  async logToggleActive(
    companyId: string,
    userId: string,
    active: boolean,
    metadata?: { ipAddress?: string; userAgent?: string },
  ) {
    return this.log({
      companyId,
      userId,
      action: 'TOGGLE_ACTIVE',
      newValue: { active },
      description: active ? 'Empresa ativada' : 'Empresa desativada',
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
    });
  }

  /**
   * Registra exclusão de empresa
   */
  async logDelete(
    companyId: string,
    userId: string,
    companyData: any,
    metadata?: { ipAddress?: string; userAgent?: string },
  ) {
    return this.log({
      companyId,
      userId,
      action: 'DELETE',
      oldValue: companyData,
      description: `Empresa deletada: ${companyData.razaoSocial}`,
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
    });
  }

  /**
   * Busca histórico de auditoria de uma empresa
   */
  async getCompanyAuditHistory(companyId: string, options?: {
    page?: number;
    limit?: number;
    action?: string;
    actions?: string[];
  }) {
    const { page = 1, limit = 50, action, actions } = options || {};
    const skip = (page - 1) * limit;

    const where = {
      companyId,
      ...(action && { action }),
      ...(actions && { action: { in: actions } }),
    };

    const [audits, total] = await Promise.all([
      this.prisma.companyAudit.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.companyAudit.count({ where }),
    ]);

    return {
      data: audits.map(audit => ({
        ...audit,
        oldValue: audit.oldValue ? JSON.parse(audit.oldValue) : null,
        newValue: audit.newValue ? JSON.parse(audit.newValue) : null,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Busca auditoria de um usuário específico
   */
  async getUserAuditHistory(userId: string, options?: {
    page?: number;
    limit?: number;
  }) {
    const { page = 1, limit = 50 } = options || {};
    const skip = (page - 1) * limit;

    const [audits, total] = await Promise.all([
      this.prisma.companyAudit.findMany({
        where: { userId },
        include: {
          company: {
            select: {
              id: true,
              razaoSocial: true,
              cnpj: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.companyAudit.count({ where: { userId } }),
    ]);

    return {
      data: audits.map(audit => ({
        ...audit,
        oldValue: audit.oldValue ? JSON.parse(audit.oldValue) : null,
        newValue: audit.newValue ? JSON.parse(audit.newValue) : null,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Detecta mudanças entre dois objetos
   */
  private detectChanges(oldData: any, newData: any): Array<{ field: string; oldValue: any; newValue: any }> {
    const changes: Array<{ field: string; oldValue: any; newValue: any }> = [];
    
    // Campos a ignorar
    const ignoreFields = ['id', 'createdAt', 'updatedAt', 'certificadoDigitalSenha', 'certificadoDigitalPath', 'password', 'photoUrl'];

    for (const key in newData) {
      if (ignoreFields.includes(key)) continue;
      if (newData[key] === undefined) continue;
      
      // Comparar valores
      const oldValue = oldData[key];
      const newValue = newData[key];
      
      // Se são diferentes, registrar mudança
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes.push({
          field: key,
          oldValue,
          newValue,
        });
      }
    }

    return changes;
  }

  // ==================== AUDITORIA DE USUÁRIOS ====================

  /**
   * Registra criação de usuário
   */
  async logUserCreate(
    companyId: string,
    userId: string,
    userData: any,
    metadata?: { ipAddress?: string; userAgent?: string },
  ) {
    const safeUserData = { ...userData };
    delete safeUserData.password; // Nunca logar senha

    return this.log({
      companyId,
      userId,
      action: 'USER_CREATE',
      newValue: safeUserData,
      description: `Usuário criado: ${userData.email}`,
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
    });
  }

  /**
   * Registra atualização de usuário
   */
  async logUserUpdate(
    companyId: string,
    userId: string,
    targetUserId: string,
    oldData: any,
    newData: any,
    metadata?: { ipAddress?: string; userAgent?: string },
  ) {
    const changes = this.detectChanges(oldData, newData);
    
    const auditPromises = changes.map(change =>
      this.log({
        companyId,
        userId,
        action: 'USER_UPDATE',
        fieldName: change.field,
        oldValue: change.oldValue,
        newValue: change.newValue,
        description: `Usuário ${targetUserId}: campo "${change.field}" alterado`,
        ipAddress: metadata?.ipAddress,
        userAgent: metadata?.userAgent,
      }),
    );

    return Promise.all(auditPromises);
  }

  /**
   * Registra alteração de senha
   */
  async logPasswordChange(
    companyId: string,
    userId: string,
    targetUserId: string,
    metadata?: { ipAddress?: string; userAgent?: string },
  ) {
    return this.log({
      companyId,
      userId,
      action: 'PASSWORD_CHANGE',
      description: userId === targetUserId 
        ? 'Usuário alterou sua própria senha'
        : `Senha do usuário ${targetUserId} foi alterada`,
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
    });
  }

  /**
   * Registra alteração de email
   */
  async logEmailChange(
    companyId: string,
    userId: string,
    targetUserId: string,
    oldEmail: string,
    newEmail: string,
    metadata?: { ipAddress?: string; userAgent?: string },
  ) {
    return this.log({
      companyId,
      userId,
      action: 'EMAIL_CHANGE',
      fieldName: 'email',
      oldValue: oldEmail,
      newValue: newEmail,
      description: `Email do usuário alterado de ${oldEmail} para ${newEmail}`,
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
    });
  }

  /**
   * Registra upload de foto de usuário
   */
  async logUserPhotoUpload(
    companyId: string,
    userId: string,
    targetUserId: string,
    photoUrl: string,
    metadata?: { ipAddress?: string; userAgent?: string },
  ) {
    return this.log({
      companyId,
      userId,
      action: 'USER_PHOTO_UPLOAD',
      newValue: { photoUrl },
      description: userId === targetUserId
        ? 'Usuário atualizou sua foto de perfil'
        : `Foto de perfil do usuário ${targetUserId} atualizada`,
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
    });
  }

  /**
   * Registra remoção de foto de usuário
   */
  async logUserPhotoRemove(
    companyId: string,
    userId: string,
    targetUserId: string,
    metadata?: { ipAddress?: string; userAgent?: string },
  ) {
    return this.log({
      companyId,
      userId,
      action: 'USER_PHOTO_REMOVE',
      description: userId === targetUserId
        ? 'Usuário removeu sua foto de perfil'
        : `Foto de perfil do usuário ${targetUserId} removida`,
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
    });
  }

  /**
   * Registra ativação/desativação de usuário
   */
  async logUserToggleActive(
    companyId: string,
    userId: string,
    targetUserId: string,
    active: boolean,
    metadata?: { ipAddress?: string; userAgent?: string },
  ) {
    return this.log({
      companyId,
      userId,
      action: 'USER_TOGGLE_ACTIVE',
      newValue: { active },
      description: active 
        ? `Usuário ${targetUserId} ativado`
        : `Usuário ${targetUserId} desativado`,
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
    });
  }

  /**
   * Registra exclusão de usuário
   */
  async logUserDelete(
    companyId: string,
    userId: string,
    targetUserId: string,
    userData: any,
    metadata?: { ipAddress?: string; userAgent?: string },
  ) {
    const safeUserData = { ...userData };
    delete safeUserData.password;

    return this.log({
      companyId,
      userId,
      action: 'USER_DELETE',
      oldValue: safeUserData,
      description: `Usuário deletado: ${userData.email}`,
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
    });
  }

  /**
   * Registra vínculo de usuário a empresa
   */
  async logUserAssignToCompany(
    companyId: string,
    userId: string,
    targetUserId: string,
    roleData: any,
    metadata?: { ipAddress?: string; userAgent?: string },
  ) {
    return this.log({
      companyId,
      userId,
      action: 'USER_ASSIGN_COMPANY',
      newValue: { targetUserId, role: roleData },
      description: `Usuário ${targetUserId} vinculado à empresa com role ${roleData.name}`,
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
    });
  }

  /**
   * Registra alteração de role de usuário em empresa
   */
  async logUserRoleChange(
    companyId: string,
    userId: string,
    targetUserId: string,
    oldRole: any,
    newRole: any,
    metadata?: { ipAddress?: string; userAgent?: string },
  ) {
    return this.log({
      companyId,
      userId,
      action: 'USER_ROLE_CHANGE',
      fieldName: 'roleId',
      oldValue: { roleId: oldRole.id, roleName: oldRole.name },
      newValue: { roleId: newRole.id, roleName: newRole.name },
      description: `Role do usuário ${targetUserId} alterada de ${oldRole.name} para ${newRole.name}`,
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
    });
  }

  /**
   * Registra remoção de usuário de empresa
   */
  async logUserRemoveFromCompany(
    companyId: string,
    userId: string,
    targetUserId: string,
    metadata?: { ipAddress?: string; userAgent?: string },
  ) {
    return this.log({
      companyId,
      userId,
      action: 'USER_REMOVE_COMPANY',
      oldValue: { targetUserId },
      description: `Usuário ${targetUserId} removido da empresa`,
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
    });
  }

  // ==================== AUDITORIA DE ROLES ====================

  /**
   * Registra criação de role
   */
  async logRoleCreate(
    companyId: string,
    userId: string,
    roleData: any,
    metadata?: { ipAddress?: string; userAgent?: string },
  ) {
    return this.log({
      companyId,
      userId,
      action: 'ROLE_CREATE',
      newValue: roleData,
      description: `Role criada: ${roleData.name}`,
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
    });
  }

  /**
   * Registra atualização de role
   */
  async logRoleUpdate(
    companyId: string,
    userId: string,
    roleId: string,
    oldData: any,
    newData: any,
    metadata?: { ipAddress?: string; userAgent?: string },
  ) {
    const changes = this.detectChanges(oldData, newData);
    
    const auditPromises = changes.map(change =>
      this.log({
        companyId,
        userId,
        action: 'ROLE_UPDATE',
        fieldName: change.field,
        oldValue: change.oldValue,
        newValue: change.newValue,
        description: `Role ${roleId}: campo "${change.field}" alterado`,
        ipAddress: metadata?.ipAddress,
        userAgent: metadata?.userAgent,
      }),
    );

    return Promise.all(auditPromises);
  }

  /**
   * Registra exclusão de role
   */
  async logRoleDelete(
    companyId: string,
    userId: string,
    roleData: any,
    metadata?: { ipAddress?: string; userAgent?: string },
  ) {
    return this.log({
      companyId,
      userId,
      action: 'ROLE_DELETE',
      oldValue: roleData,
      description: `Role deletada: ${roleData.name}`,
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
    });
  }

  /**
   * Registra atribuição de permissão a role
   */
  async logRoleAddPermission(
    companyId: string,
    userId: string,
    roleId: string,
    permissionData: any,
    metadata?: { ipAddress?: string; userAgent?: string },
  ) {
    return this.log({
      companyId,
      userId,
      action: 'ROLE_ADD_PERMISSION',
      newValue: { roleId, permission: permissionData },
      description: `Permissão ${permissionData.name} adicionada à role ${roleId}`,
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
    });
  }

  /**
   * Registra remoção de permissão de role
   */
  async logRoleRemovePermission(
    companyId: string,
    userId: string,
    roleId: string,
    permissionData: any,
    metadata?: { ipAddress?: string; userAgent?: string },
  ) {
    return this.log({
      companyId,
      userId,
      action: 'ROLE_REMOVE_PERMISSION',
      oldValue: { roleId, permission: permissionData },
      description: `Permissão ${permissionData.name} removida da role ${roleId}`,
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
    });
  }
}
