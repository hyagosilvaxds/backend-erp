import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PlanoContasService } from './plano-contas.service';
import { CreatePlanoContasDto } from './dto/create-plano-contas.dto';
import { UpdatePlanoContasDto } from './dto/update-plano-contas.dto';
import { CreateContaContabilDto } from './dto/create-conta-contabil.dto';
import { UpdateContaContabilDto } from './dto/update-conta-contabil.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@Controller('plano-contas')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PlanoContasController {
  constructor(private readonly planoContasService: PlanoContasService) {}

  // ==================== PLANO DE CONTAS ====================

  @Post()
  @RequirePermissions('accounting.create')
  createPlanoContas(@Body() createDto: CreatePlanoContasDto) {
    return this.planoContasService.createPlanoContas(createDto);
  }

  @Get()
  @RequirePermissions('accounting.read')
  findAllPlanoContas(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('tipo') tipo?: string,
    @Query('ativo') ativo?: string,
    @Query('companyId') companyId?: string,
  ) {
    return this.planoContasService.findAllPlanoContas({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      tipo,
      ativo: ativo !== undefined ? ativo === 'true' : undefined,
      companyId,
    });
  }

  @Get('padrao')
  @RequirePermissions('accounting.read')
  getPlanoPadrao(@Query('companyId') companyId?: string) {
    return this.planoContasService.getPlanoPadrao(companyId);
  }

  @Get(':id')
  @RequirePermissions('accounting.read')
  findOnePlanoContas(@Param('id') id: string) {
    return this.planoContasService.findOnePlanoContas(id);
  }

  @Get(':id/hierarquia')
  @RequirePermissions('accounting.read')
  getContasHierarquicas(
    @Param('id') id: string,
    @Query('ativo') ativo?: string,
  ) {
    return this.planoContasService.getContasHierarquicas(
      id,
      ativo !== undefined ? ativo === 'true' : undefined,
    );
  }

  @Post(':id/duplicar')
  @RequirePermissions('accounting.create')
  duplicarPlanoContas(
    @Param('id') id: string,
    @Body() body: { nome: string; descricao?: string },
  ) {
    return this.planoContasService.duplicarPlanoContas(
      id,
      body.nome,
      body.descricao,
    );
  }

  @Patch(':id')
  @RequirePermissions('accounting.update')
  updatePlanoContas(
    @Param('id') id: string,
    @Body() updateDto: UpdatePlanoContasDto,
  ) {
    return this.planoContasService.updatePlanoContas(id, updateDto);
  }

  @Delete(':id')
  @RequirePermissions('accounting.delete')
  removePlanoContas(@Param('id') id: string) {
    return this.planoContasService.removePlanoContas(id);
  }

  // ==================== CONTA CONTÁBIL ====================

  @Post(':planoContasId/contas')
  @RequirePermissions('accounting.create')
  createContaContabil(
    @Param('planoContasId') planoContasId: string,
    @Body() createDto: CreateContaContabilDto,
  ) {
    // Garante que o planoContasId do DTO seja o mesmo da URL
    createDto.planoContasId = planoContasId;
    return this.planoContasService.createContaContabil(createDto);
  }

  @Get(':planoContasId/contas')
  @RequirePermissions('accounting.read')
  findAllContasContabeis(
    @Param('planoContasId') planoContasId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('tipo') tipo?: string,
    @Query('nivel') nivel?: string,
    @Query('contaPaiId') contaPaiId?: string,
    @Query('search') search?: string,
  ) {
    return this.planoContasService.findAllContasContabeis(planoContasId, {
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      tipo,
      nivel: nivel ? parseInt(nivel) : undefined,
      contaPaiId,
      search,
    });
  }

  @Get('contas/:id')
  @RequirePermissions('accounting.read')
  findOneContaContabil(@Param('id') id: string) {
    return this.planoContasService.findOneContaContabil(id);
  }

  @Patch('contas/:id')
  @RequirePermissions('accounting.update')
  updateContaContabil(
    @Param('id') id: string,
    @Body() updateDto: UpdateContaContabilDto,
  ) {
    return this.planoContasService.updateContaContabil(id, updateDto);
  }

  @Delete('contas/:id')
  @RequirePermissions('accounting.delete')
  removeContaContabil(@Param('id') id: string) {
    return this.planoContasService.removeContaContabil(id);
  }
}
