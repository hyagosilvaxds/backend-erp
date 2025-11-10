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
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CreateCustomerAddressDto } from './dto/create-customer-address.dto';
import { CreateCustomerContactDto } from './dto/create-customer-contact.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser, CurrentCompany } from '../auth/decorators/current-user.decorator';

@Controller('customers')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  // ==================== CLIENTES ====================

  @Post()
  @RequirePermissions('customers.create')
  create(
    @CurrentCompany() companyId: string,
    @CurrentUser() user: { userId: string },
    @Body() createCustomerDto: CreateCustomerDto,
  ) {
    return this.customersService.create(companyId, user.userId, createCustomerDto);
  }

  @Get()
  @RequirePermissions('customers.read')
  findAll(
    @CurrentCompany() companyId: string,
    @Query('personType') personType?: string,
    @Query('active') active?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.customersService.findAll(companyId, {
      personType,
      active: active !== undefined ? active === 'true' : undefined,
      search,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('stats')
  @RequirePermissions('customers.read')
  getStats(@CurrentCompany() companyId: string) {
    return this.customersService.getStats(companyId);
  }

  @Get(':id')
  @RequirePermissions('customers.read')
  findOne(
    @Param('id') id: string,
    @CurrentCompany() companyId: string,
  ) {
    return this.customersService.findOne(id, companyId);
  }

  @Patch(':id')
  @RequirePermissions('customers.update')
  update(
    @Param('id') id: string,
    @CurrentCompany() companyId: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.customersService.update(id, companyId, updateCustomerDto);
  }

  @Delete(':id')
  @RequirePermissions('customers.delete')
  remove(
    @Param('id') id: string,
    @CurrentCompany() companyId: string,
  ) {
    return this.customersService.remove(id, companyId);
  }

  @Patch(':id/toggle-active')
  @RequirePermissions('customers.update')
  toggleActive(
    @Param('id') id: string,
    @CurrentCompany() companyId: string,
  ) {
    return this.customersService.toggleActive(id, companyId);
  }

  // ==================== ENDEREÇOS ====================

  @Post(':id/addresses')
  @RequirePermissions('customers.update')
  addAddress(
    @Param('id') customerId: string,
    @CurrentCompany() companyId: string,
    @Body() createAddressDto: CreateCustomerAddressDto,
  ) {
    return this.customersService.addAddress(customerId, companyId, createAddressDto);
  }

  @Patch(':id/addresses/:addressId')
  @RequirePermissions('customers.update')
  updateAddress(
    @Param('id') customerId: string,
    @Param('addressId') addressId: string,
    @CurrentCompany() companyId: string,
    @Body() updateAddressDto: Partial<CreateCustomerAddressDto>,
  ) {
    return this.customersService.updateAddress(addressId, customerId, companyId, updateAddressDto);
  }

  @Delete(':id/addresses/:addressId')
  @RequirePermissions('customers.update')
  removeAddress(
    @Param('id') customerId: string,
    @Param('addressId') addressId: string,
    @CurrentCompany() companyId: string,
  ) {
    return this.customersService.removeAddress(addressId, customerId, companyId);
  }

  // ==================== CONTATOS ====================

  @Post(':id/contacts')
  @RequirePermissions('customers.update')
  addContact(
    @Param('id') customerId: string,
    @CurrentCompany() companyId: string,
    @Body() createContactDto: CreateCustomerContactDto,
  ) {
    return this.customersService.addContact(customerId, companyId, createContactDto);
  }

  @Patch(':id/contacts/:contactId')
  @RequirePermissions('customers.update')
  updateContact(
    @Param('id') customerId: string,
    @Param('contactId') contactId: string,
    @CurrentCompany() companyId: string,
    @Body() updateContactDto: Partial<CreateCustomerContactDto>,
  ) {
    return this.customersService.updateContact(contactId, customerId, companyId, updateContactDto);
  }

  @Delete(':id/contacts/:contactId')
  @RequirePermissions('customers.update')
  removeContact(
    @Param('id') customerId: string,
    @Param('contactId') contactId: string,
    @CurrentCompany() companyId: string,
  ) {
    return this.customersService.removeContact(contactId, customerId, companyId);
  }
}
