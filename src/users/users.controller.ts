import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  UploadedFile,
  UseInterceptors,
  ForbiddenException,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { SkipPermissions } from '../auth/decorators/skip-permissions.decorator';
import {
  CurrentUser,
  CurrentCompany,
} from '../auth/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AssignUserToCompanyDto } from './dto/assign-user-to-company.dto';
import { UpdateUserCompanyRoleDto } from './dto/update-user-company-role.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ChangeEmailDto } from './dto/change-email.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ==================== ENDPOINTS DO USUÁRIO LOGADO (SEM PERMISSÕES) ====================

  /**
   * Obter empresas do usuário logado
   * GET /users/me/companies
   * ⚠️ IMPORTANTE: Este endpoint DEVE vir antes de /users/:id para não conflitar
   * Não requer permissões específicas, apenas autenticação JWT
   */
  @Get('me/companies')
  @SkipPermissions()
  async getMyCompanies(@CurrentUser() user: any) {
    return this.usersService.getUserCompanies(user.userId);
  }

  // ==================== ENDPOINTS GERAIS ====================

  /**
   * Listar TODOS os usuários do sistema (apenas admin)
   * GET /users/all
   */
  @Get('all')
  @RequirePermissions('users.read')
  async findAllUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('active') active?: string,
  ) {
    return this.usersService.findAllUsers({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 50,
      search,
      active: active ? active === 'true' : undefined,
    });
  }

  /**
   * Listar usuários de uma empresa específica
   * GET /users/company/:companyId
   */
  @Get('company/:companyId')
  @RequirePermissions('users.read')
  async findUsersByCompany(
    @Param('companyId') companyId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('active') active?: string,
    @Query('roleId') roleId?: string,
  ) {
    return this.usersService.findUsersByCompany(companyId, {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 50,
      search,
      active: active ? active === 'true' : undefined,
      roleId,
    });
  }

  /**
   * Buscar usuário por ID
   * GET /users/:id
   */
  @Get(':id')
  @RequirePermissions('users.read')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  /**
   * Criar novo usuário
   * POST /users
   */
  @Post()
  @RequirePermissions('users.create')
  async create(
    @Body() createUserDto: CreateUserDto,
    @CurrentUser() user: any,
    @CurrentCompany() companyId: string,
    @Req() req: Request,
  ) {
    return this.usersService.create(createUserDto, user.id, companyId, {
      ipAddress: req['ip'],
      userAgent: req.headers['user-agent'],
    });
  }

  /**
   * Atualizar usuário
   * PATCH /users/:id
   */
  @Patch(':id')
  @RequirePermissions('users.update')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user: any,
    @CurrentCompany() companyId: string,
    @Req() req: Request,
  ) {
    return this.usersService.update(id, updateUserDto, user.id, companyId, {
      ipAddress: req['ip'],
      userAgent: req.headers['user-agent'],
    });
  }

  /**
   * Ativar/Desativar usuário
   * PATCH /users/:id/toggle-active
   */
  @Patch(':id/toggle-active')
  @RequirePermissions('users.update')
  async toggleActive(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @CurrentCompany() companyId: string,
    @Req() req: Request,
  ) {
    return this.usersService.toggleActive(id, user.id, companyId, {
      ipAddress: req['ip'],
      userAgent: req.headers['user-agent'],
    });
  }

  /**
   * Deletar usuário (soft delete)
   * DELETE /users/:id
   */
  @Delete(':id')
  @RequirePermissions('users.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @CurrentCompany() companyId: string,
    @Req() req: Request,
  ) {
    await this.usersService.remove(id, user.id, companyId, {
      ipAddress: req['ip'],
      userAgent: req.headers['user-agent'],
    });
  }

  // ==================== GESTÃO DE EMPRESAS ====================

  /**
   * Vincular usuário a uma empresa
   * POST /users/:userId/companies
   */
  @Post(':userId/companies')
  @RequirePermissions('users.update')
  async assignToCompany(
    @Param('userId') userId: string,
    @Body() assignDto: AssignUserToCompanyDto,
    @CurrentUser() user: any,
    @Req() req: Request,
  ) {
    return this.usersService.assignToCompany(userId, assignDto, user.id, {
      ipAddress: req['ip'],
      userAgent: req.headers['user-agent'],
    });
  }

  /**
   * Atualizar role do usuário em uma empresa
   * PATCH /users/:userId/companies/:companyId/role
   */
  @Patch(':userId/companies/:companyId/role')
  @RequirePermissions('users.update')
  async updateUserCompanyRole(
    @Param('userId') userId: string,
    @Param('companyId') companyId: string,
    @Body() updateRoleDto: UpdateUserCompanyRoleDto,
    @CurrentUser() user: any,
    @Req() req: Request,
  ) {
    return this.usersService.updateUserCompanyRole(
      userId,
      companyId,
      updateRoleDto.roleId,
      user.id,
      {
        ipAddress: req['ip'],
        userAgent: req.headers['user-agent'],
      },
    );
  }

  /**
   * Remover usuário de uma empresa
   * DELETE /users/:userId/companies/:companyId
   */
  @Delete(':userId/companies/:companyId')
  @RequirePermissions('users.update')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeFromCompany(
    @Param('userId') userId: string,
    @Param('companyId') companyId: string,
    @CurrentUser() user: any,
    @Req() req: Request,
  ) {
    await this.usersService.removeFromCompany(userId, companyId, user.id, {
      ipAddress: req['ip'],
      userAgent: req.headers['user-agent'],
    });
  }

  /**
   * Listar empresas de um usuário
   * GET /users/:userId/companies
   */
  @Get(':userId/companies')
  @RequirePermissions('users.read')
  async getUserCompanies(@Param('userId') userId: string) {
    return this.usersService.getUserCompanies(userId);
  }

  // ==================== GESTÃO DE PERFIL ====================

  /**
   * Upload de foto do usuário
   * POST /users/:id/photo
   * Admin, usuário com permissão ou próprio usuário pode alterar
   */
  @Post(':id/photo')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: './uploads/users',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `user-photo-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return callback(
            new Error('Apenas imagens são permitidas!'),
            false,
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  async uploadPhoto(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() currentUser: any,
  ) {
    // Verificar se é o próprio usuário ou tem permissão
    const hasPermission = currentUser.permissions?.includes('users.update');
    const isOwnProfile = currentUser.userId === id;

    if (!hasPermission && !isOwnProfile) {
      throw new ForbiddenException(
        'Você não tem permissão para alterar a foto deste usuário',
      );
    }

    if (!file) {
      throw new Error('Nenhum arquivo foi enviado');
    }

    return this.usersService.updatePhoto(id, file.filename);
  }

  /**
   * Remover foto do usuário
   * DELETE /users/:id/photo
   * Admin, usuário com permissão ou próprio usuário pode remover
   */
  @Delete(':id/photo')
  @UseGuards(JwtAuthGuard)
  async deletePhoto(
    @Param('id') id: string,
    @CurrentUser() currentUser: any,
  ) {
    // Verificar se é o próprio usuário ou tem permissão
    const hasPermission = currentUser.permissions?.includes('users.update');
    const isOwnProfile = currentUser.userId === id;

    if (!hasPermission && !isOwnProfile) {
      throw new ForbiddenException(
        'Você não tem permissão para remover a foto deste usuário',
      );
    }

    return this.usersService.deletePhoto(id);
  }

  /**
   * Alterar email do usuário
   * PATCH /users/:id/email
   * Apenas admin ou usuário com permissão
   */
  @Patch(':id/email')
  @RequirePermissions('users.update')
  async changeEmail(
    @Param('id') id: string,
    @Body() changeEmailDto: ChangeEmailDto,
  ) {
    return this.usersService.changeEmail(id, changeEmailDto.email);
  }

  /**
   * Alterar senha do usuário
   * PATCH /users/:id/password
   * Admin, usuário com permissão ou próprio usuário (com senha antiga)
   */
  @Patch(':id/password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Param('id') id: string,
    @Body() changePasswordDto: ChangePasswordDto,
    @CurrentUser() currentUser: any,
  ) {
    // Verificar se é o próprio usuário ou tem permissão
    const hasPermission = currentUser.permissions?.includes('users.update');
    const isOwnProfile = currentUser.userId === id;

    if (!hasPermission && !isOwnProfile) {
      throw new ForbiddenException(
        'Você não tem permissão para alterar a senha deste usuário',
      );
    }

    return this.usersService.changePassword(
      id,
      changePasswordDto.oldPassword,
      changePasswordDto.newPassword,
      isOwnProfile,
    );
  }
}
