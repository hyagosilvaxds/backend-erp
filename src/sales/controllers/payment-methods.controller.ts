import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CompanyId } from '../../common/decorators/company-id.decorator';
import { PaymentMethodsService } from '../services/payment-methods.service';
import { CreatePaymentMethodDto } from '../dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from '../dto/update-payment-method.dto';
import { CreateInstallmentTemplateDto } from '../dto/installment-template.dto';

@Controller('sales/payment-methods')
@UseGuards(JwtAuthGuard)
export class PaymentMethodsController {
  constructor(private readonly paymentMethodsService: PaymentMethodsService) {}

  @Post()
  create(@CompanyId() companyId: string, @Body() dto: CreatePaymentMethodDto) {
    return this.paymentMethodsService.create(companyId, dto);
  }

  @Get()
  findAll(
    @CompanyId() companyId: string,
    @Query('active') active?: string,
    @Query('type') type?: string,
  ) {
    const filters: any = {};
    if (active !== undefined) {
      filters.active = active === 'true';
    }
    if (type) {
      filters.type = type;
    }
    return this.paymentMethodsService.findAll(companyId, filters);
  }

  @Get(':id')
  findOne(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.paymentMethodsService.findOne(companyId, id);
  }

  @Put(':id')
  update(
    @CompanyId() companyId: string,
    @Param('id') id: string,
    @Body() dto: UpdatePaymentMethodDto,
  ) {
    return this.paymentMethodsService.update(companyId, id, dto);
  }

  @Delete(':id')
  remove(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.paymentMethodsService.remove(companyId, id);
  }

  @Patch(':id/toggle-active')
  toggleActive(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.paymentMethodsService.toggleActive(companyId, id);
  }

  // ========================================
  // ENDPOINTS PARA TEMPLATES DE PARCELAS
  // ========================================

  @Get(':id/installment-templates')
  getInstallmentTemplates(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.paymentMethodsService.getInstallmentTemplates(companyId, id);
  }

  @Post(':id/installment-templates')
  addInstallmentTemplate(
    @CompanyId() companyId: string,
    @Param('id') id: string,
    @Body() dto: CreateInstallmentTemplateDto,
  ) {
    return this.paymentMethodsService.addInstallmentTemplate(companyId, id, dto);
  }

  @Put(':id/installment-templates')
  replaceInstallmentTemplates(
    @CompanyId() companyId: string,
    @Param('id') id: string,
    @Body() dto: { templates: CreateInstallmentTemplateDto[] },
  ) {
    return this.paymentMethodsService.replaceInstallmentTemplates(companyId, id, dto.templates);
  }

  @Patch(':id/installment-templates/:installmentNumber')
  updateInstallmentTemplate(
    @CompanyId() companyId: string,
    @Param('id') id: string,
    @Param('installmentNumber') installmentNumber: string,
    @Body() dto: { daysToPayment?: number; percentageOfTotal?: number; fixedAmount?: number },
  ) {
    return this.paymentMethodsService.updateInstallmentTemplate(
      companyId,
      id,
      parseInt(installmentNumber),
      dto,
    );
  }

  @Delete(':id/installment-templates/:installmentNumber')
  removeInstallmentTemplate(
    @CompanyId() companyId: string,
    @Param('id') id: string,
    @Param('installmentNumber') installmentNumber: string,
  ) {
    return this.paymentMethodsService.removeInstallmentTemplate(
      companyId,
      id,
      parseInt(installmentNumber),
    );
  }
}
