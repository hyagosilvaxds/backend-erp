import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CreateCustomerAddressDto } from './dto/create-customer-address.dto';
import { CreateCustomerContactDto } from './dto/create-customer-contact.dto';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  // ==================== CLIENTES ====================

  async create(companyId: string, userId: string, dto: CreateCustomerDto) {
    // Validações por tipo de pessoa
    if (dto.personType === 'FISICA') {
      if (!dto.cpf) {
        throw new BadRequestException('CPF é obrigatório para pessoa física');
      }
      if (!dto.name) {
        throw new BadRequestException('Nome é obrigatório para pessoa física');
      }
    } else if (dto.personType === 'JURIDICA') {
      if (!dto.cnpj) {
        throw new BadRequestException('CNPJ é obrigatório para pessoa jurídica');
      }
      if (!dto.companyName) {
        throw new BadRequestException('Razão Social é obrigatória para pessoa jurídica');
      }
    }

    // Verificar duplicidade de CPF/CNPJ
    if (dto.cpf) {
      const existingCpf = await this.prisma.customer.findFirst({
        where: {
          companyId,
          cpf: dto.cpf,
        },
      });
      if (existingCpf) {
        throw new BadRequestException('Já existe um cliente com este CPF');
      }
    }

    if (dto.cnpj) {
      const existingCnpj = await this.prisma.customer.findFirst({
        where: {
          companyId,
          cnpj: dto.cnpj,
        },
      });
      if (existingCnpj) {
        throw new BadRequestException('Já existe um cliente com este CNPJ');
      }
    }

    // Separar endereços e contatos do DTO
    const { addresses, contacts, ...customerData } = dto;

    // Criar cliente com endereços e contatos
    return this.prisma.customer.create({
      data: {
        ...customerData,
        companyId,
        createdById: userId,
        // Criar endereços relacionados
        addresses: addresses && addresses.length > 0 ? {
          create: addresses,
        } : undefined,
        // Criar contatos relacionados
        contacts: contacts && contacts.length > 0 ? {
          create: contacts,
        } : undefined,
      },
      include: {
        addresses: true,
        contacts: true,
      },
    });
  }

  async findAll(companyId: string, filters?: {
    personType?: string;
    active?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const where: any = { companyId };

    if (filters?.personType) {
      where.personType = filters.personType;
    }

    if (filters?.active !== undefined) {
      where.active = filters.active;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { cpf: { contains: filters.search } },
        { companyName: { contains: filters.search, mode: 'insensitive' } },
        { tradeName: { contains: filters.search, mode: 'insensitive' } },
        { cnpj: { contains: filters.search } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const skip = (page - 1) * limit;

    const [customers, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        include: {
          addresses: {
            where: { active: true },
            orderBy: { isDefault: 'desc' },
          },
          contacts: {
            where: { active: true },
            orderBy: { isPrimary: 'desc' },
          },
        },
        orderBy: [
          { active: 'desc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
      this.prisma.customer.count({ where }),
    ]);

    return {
      data: customers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, companyId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, companyId },
      include: {
        addresses: {
          orderBy: [
            { isDefault: 'desc' },
            { createdAt: 'desc' },
          ],
        },
        contacts: {
          orderBy: [
            { isPrimary: 'desc' },
            { type: 'asc' },
            { createdAt: 'desc' },
          ],
        },
      },
    });

    if (!customer) {
      throw new NotFoundException('Cliente não encontrado');
    }

    return customer;
  }

  async update(id: string, companyId: string, dto: UpdateCustomerDto) {
    await this.findOne(id, companyId);

    // Verificar duplicidade de CPF/CNPJ (exceto o próprio)
    if (dto.cpf) {
      const existingCpf = await this.prisma.customer.findFirst({
        where: {
          companyId,
          cpf: dto.cpf,
          id: { not: id },
        },
      });
      if (existingCpf) {
        throw new BadRequestException('Já existe outro cliente com este CPF');
      }
    }

    if (dto.cnpj) {
      const existingCnpj = await this.prisma.customer.findFirst({
        where: {
          companyId,
          cnpj: dto.cnpj,
          id: { not: id },
        },
      });
      if (existingCnpj) {
        throw new BadRequestException('Já existe outro cliente com este CNPJ');
      }
    }

    // Separar endereços e contatos do DTO (não permitir atualização em massa aqui)
    const { addresses, contacts, ...customerData } = dto;

    return this.prisma.customer.update({
      where: { id },
      data: customerData,
      include: {
        addresses: true,
        contacts: true,
      },
    });
  }

  async remove(id: string, companyId: string) {
    await this.findOne(id, companyId);

    return this.prisma.customer.delete({
      where: { id },
    });
  }

  async toggleActive(id: string, companyId: string) {
    const customer = await this.findOne(id, companyId);

    return this.prisma.customer.update({
      where: { id },
      data: { active: !customer.active },
    });
  }

  // ==================== ENDEREÇOS ====================

  async addAddress(customerId: string, companyId: string, dto: CreateCustomerAddressDto) {
    // Verificar se o cliente existe
    await this.findOne(customerId, companyId);

    // Se for marcado como padrão, desmarcar os outros
    if (dto.isDefault) {
      await this.prisma.customerAddress.updateMany({
        where: { customerId },
        data: { isDefault: false },
      });
    }

    return this.prisma.customerAddress.create({
      data: {
        ...dto,
        customerId,
      },
    });
  }

  async updateAddress(addressId: string, customerId: string, companyId: string, dto: Partial<CreateCustomerAddressDto>) {
    // Verificar se o cliente existe
    await this.findOne(customerId, companyId);

    const address = await this.prisma.customerAddress.findFirst({
      where: { id: addressId, customerId },
    });

    if (!address) {
      throw new NotFoundException('Endereço não encontrado');
    }

    // Se for marcado como padrão, desmarcar os outros
    if (dto.isDefault) {
      await this.prisma.customerAddress.updateMany({
        where: {
          customerId,
          id: { not: addressId },
        },
        data: { isDefault: false },
      });
    }

    return this.prisma.customerAddress.update({
      where: { id: addressId },
      data: dto,
    });
  }

  async removeAddress(addressId: string, customerId: string, companyId: string) {
    // Verificar se o cliente existe
    await this.findOne(customerId, companyId);

    const address = await this.prisma.customerAddress.findFirst({
      where: { id: addressId, customerId },
    });

    if (!address) {
      throw new NotFoundException('Endereço não encontrado');
    }

    return this.prisma.customerAddress.delete({
      where: { id: addressId },
    });
  }

  // ==================== CONTATOS ====================

  async addContact(customerId: string, companyId: string, dto: CreateCustomerContactDto) {
    // Verificar se o cliente existe
    await this.findOne(customerId, companyId);

    // Se for marcado como principal deste tipo, desmarcar os outros do mesmo tipo
    if (dto.isPrimary) {
      await this.prisma.customerContact.updateMany({
        where: {
          customerId,
          type: dto.type,
        },
        data: { isPrimary: false },
      });
    }

    return this.prisma.customerContact.create({
      data: {
        ...dto,
        customerId,
      },
    });
  }

  async updateContact(contactId: string, customerId: string, companyId: string, dto: Partial<CreateCustomerContactDto>) {
    // Verificar se o cliente existe
    await this.findOne(customerId, companyId);

    const contact = await this.prisma.customerContact.findFirst({
      where: { id: contactId, customerId },
    });

    if (!contact) {
      throw new NotFoundException('Contato não encontrado');
    }

    // Se for marcado como principal deste tipo, desmarcar os outros do mesmo tipo
    if (dto.isPrimary && dto.type) {
      await this.prisma.customerContact.updateMany({
        where: {
          customerId,
          type: dto.type,
          id: { not: contactId },
        },
        data: { isPrimary: false },
      });
    }

    return this.prisma.customerContact.update({
      where: { id: contactId },
      data: dto,
    });
  }

  async removeContact(contactId: string, customerId: string, companyId: string) {
    // Verificar se o cliente existe
    await this.findOne(customerId, companyId);

    const contact = await this.prisma.customerContact.findFirst({
      where: { id: contactId, customerId },
    });

    if (!contact) {
      throw new NotFoundException('Contato não encontrado');
    }

    return this.prisma.customerContact.delete({
      where: { id: contactId },
    });
  }

  // ==================== ESTATÍSTICAS ====================

  async getStats(companyId: string) {
    const [total, active, inactive, fisica, juridica] = await Promise.all([
      this.prisma.customer.count({ where: { companyId } }),
      this.prisma.customer.count({ where: { companyId, active: true } }),
      this.prisma.customer.count({ where: { companyId, active: false } }),
      this.prisma.customer.count({ where: { companyId, personType: 'FISICA' } }),
      this.prisma.customer.count({ where: { companyId, personType: 'JURIDICA' } }),
    ]);

    return {
      total,
      active,
      inactive,
      byType: {
        fisica,
        juridica,
      },
    };
  }
}
