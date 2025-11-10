import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser, CurrentCompany } from '../auth/decorators/current-user.decorator';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AddPermissionsDto } from './dto/add-permissions.dto';
import { RemovePermissionsDto } from './dto/remove-permissions.dto';

@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  // ==================== LISTAGEM ====================

  /**
   * Listar todas as roles
   * GET /roles
   */
  @Get()
  @RequirePermissions('users.read')
  async findAll() {
    return this.rolesService.findAll();
  }

  /**
   * Buscar role por ID
   * GET /roles/:id
   */
  @Get(':id')
  @RequirePermissions('users.read')
  async findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  /**
   * Buscar role por nome
   * GET /roles/name/:name
   */
  @Get('name/:name')
  @RequirePermissions('users.read')
  async findByName(@Param('name') name: string) {
    return this.rolesService.findByName(name);
  }

  /**
   * Listar todas as permissões disponíveis
   * GET /roles/permissions/all
   */
  @Get('permissions/all')
  @RequirePermissions('users.read')
  async findAllPermissions() {
    return this.rolesService.findAllPermissions();
  }

  // ==================== CRUD ====================

  /**
   * Criar nova role
   * POST /roles
   */
  @Post()
  @RequirePermissions('users.create')
  async create(
    @Body() createRoleDto: CreateRoleDto,
    @CurrentCompany() companyId: string,
    @CurrentUser() user: any,
    @Req() req: Request,
  ) {
    return this.rolesService.create(createRoleDto, companyId, user.userId, {
      ipAddress: req['ip'],
      userAgent: req.headers['user-agent'],
    });
  }

  /**
   * Atualizar role
   * PATCH /roles/:id
   */
  @Patch(':id')
  @RequirePermissions('users.update')
  async update(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
    @CurrentCompany() companyId: string,
    @CurrentUser() user: any,
    @Req() req: Request,
  ) {
    return this.rolesService.update(id, updateRoleDto, companyId, user.userId, {
      ipAddress: req['ip'],
      userAgent: req.headers['user-agent'],
    });
  }

  /**
   * Deletar role
   * DELETE /roles/:id
   */
  @Delete(':id')
  @RequirePermissions('users.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @CurrentCompany() companyId: string,
    @CurrentUser() user: any,
    @Req() req: Request,
  ) {
    await this.rolesService.remove(id, companyId, user.userId, {
      ipAddress: req['ip'],
      userAgent: req.headers['user-agent'],
    });
  }

  // ==================== PERMISSÕES ====================

  /**
   * Adicionar permissões a uma role
   * POST /roles/:id/permissions
   */
  /**
   * Adicionar permissões a uma role
   * POST /roles/:id/permissions
   */
  @Post(':id/permissions')
  @RequirePermissions('users.update')
  async addPermissions(
    @Param('id') id: string,
    @Body() addPermissionsDto: AddPermissionsDto,
    @CurrentCompany() companyId: string,
    @CurrentUser() user: any,
    @Req() req: Request,
  ) {
    return this.rolesService.addPermissions(
      id,
      addPermissionsDto.permissionIds,
      companyId,
      user.userId,
      {
        ipAddress: req['ip'],
        userAgent: req.headers['user-agent'],
      },
    );
  }

  /**
   * Remover permissões de uma role
   * DELETE /roles/:id/permissions
   */
  @Delete(':id/permissions')
  @RequirePermissions('users.update')
  async removePermissions(
    @Param('id') id: string,
    @Body() removePermissionsDto: RemovePermissionsDto,
    @CurrentCompany() companyId: string,
    @CurrentUser() user: any,
    @Req() req: Request,
  ) {
    return this.rolesService.removePermissions(
      id,
      removePermissionsDto.permissionIds,
      companyId,
      user.userId,
      {
        ipAddress: req['ip'],
        userAgent: req.headers['user-agent'],
      },
    );
  }
}

