import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateSaleDto } from '../dto/create-sale.dto';
import { UpdateSaleDto } from '../dto/update-sale.dto';
import {
  ApproveCreditAnalysisDto,
  RejectCreditAnalysisDto,
  CancelSaleDto,
  ChangeStatusDto,
} from '../dto/sale-actions.dto';

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: string, dto: CreateSaleDto) {
    // Validar cliente
    const customer = await this.prisma.customer.findFirst({
      where: { id: dto.customerId, companyId },
    });

    if (!customer) {
      throw new NotFoundException('Cliente não encontrado');
    }

    // Validar método de pagamento se fornecido
    if (dto.paymentMethodId) {
      const paymentMethod = await this.prisma.paymentMethod.findFirst({
        where: { id: dto.paymentMethodId, companyId, active: true },
      });

      if (!paymentMethod) {
        throw new NotFoundException('Método de pagamento não encontrado ou inativo');
      }

      // Validar parcelas
      if (dto.installments && dto.installments > 1) {
        if (!paymentMethod.allowInstallments) {
          throw new BadRequestException('Este método de pagamento não permite parcelamento');
        }

        if (dto.installments > paymentMethod.maxInstallments) {
          throw new BadRequestException(
            `Este método de pagamento permite no máximo ${paymentMethod.maxInstallments} parcelas`,
          );
        }
      }
    }

    // Validar produtos e estoque
    for (const item of dto.items) {
      const product = await this.prisma.product.findFirst({
        where: { id: item.productId, companyId },
      });

      if (!product) {
        throw new NotFoundException(`Produto ${item.productId} não encontrado`);
      }

      if (item.stockLocationId) {
        const stockLocation = await this.prisma.stockLocation.findFirst({
          where: { id: item.stockLocationId, companyId },
        });

        if (!stockLocation) {
          throw new NotFoundException(`Local de estoque ${item.stockLocationId} não encontrado`);
        }

        // Verificar disponibilidade de estoque (apenas se não for orçamento)
        if (dto.status && dto.status !== 'QUOTE') {
          const stockByLocation = await this.prisma.productStockByLocation.findUnique({
            where: {
              productId_locationId: {
                productId: item.productId,
                locationId: item.stockLocationId,
              },
            },
          });

          const available = Number(stockByLocation?.quantity || 0);
          if (available < item.quantity) {
            throw new BadRequestException(
              `Estoque insuficiente para o produto ${product.name}. Disponível: ${available}, Solicitado: ${item.quantity}`,
            );
          }
        }
      }
    }

    // Gerar código único para a venda
    const count = await this.prisma.sale.count({ where: { companyId } });
    const code = `VDA-${String(count + 1).padStart(6, '0')}`;

    // Calcular totais
    let subtotal = 0;
    const itemsData: Prisma.SaleItemCreateWithoutSaleInput[] = [];

    for (const item of dto.items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
        select: {
          id: true,
          sku: true,
          name: true,
          unit: {
            select: {
              name: true,
            },
          },
          salePrice: true,
        },
      });

      if (!product) continue;

      const unitPrice = item.unitPrice;
      const itemSubtotal = unitPrice * item.quantity;
      const itemDiscount = item.discount || 0;
      const itemTotal = itemSubtotal - itemDiscount;

      subtotal += itemSubtotal;

      itemsData.push({
        product: { connect: { id: item.productId } },
        stockLocation: item.stockLocationId ? { connect: { id: item.stockLocationId } } : undefined,
        productCode: product.sku || product.id,
        productName: product.name,
        productUnit: product.unit?.name || 'UN',
        quantity: item.quantity,
        unitPrice,
        discount: itemDiscount,
        subtotal: itemSubtotal,
        total: itemTotal,
        notes: item.notes,
      });
    }

    const discountAmount = dto.discountAmount || 0;
    const discountPercent = dto.discountPercent || 0;
    const shippingCost = dto.shippingCost || 0;
    const otherCharges = dto.otherCharges || 0;

    // Aplicar descontos
    const totalDiscountAmount = discountAmount + (subtotal * discountPercent) / 100;
    const totalAmount = subtotal - totalDiscountAmount + shippingCost + otherCharges;

    // Determinar se requer análise de crédito
    let creditAnalysisRequired = false;
    let creditAnalysisStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'MANUAL' | null = null;

    if (dto.paymentMethodId && dto.status !== 'QUOTE') {
      const paymentMethodForCredit = await this.prisma.paymentMethod.findUnique({
        where: { id: dto.paymentMethodId },
      });
      
      if (paymentMethodForCredit?.requiresCreditAnalysis) {
        creditAnalysisRequired = true;
        creditAnalysisStatus = 'PENDING';
      }
    }

    // Preparar endereço de entrega
    const useCustomerAddress = dto.useCustomerAddress ?? true;
    const deliveryAddress = dto.deliveryAddress
      ? {
          street: dto.deliveryAddress.street,
          number: dto.deliveryAddress.number,
          complement: dto.deliveryAddress.complement,
          neighborhood: dto.deliveryAddress.neighborhood,
          city: dto.deliveryAddress.city,
          state: dto.deliveryAddress.state,
          zipCode: dto.deliveryAddress.zipCode,
        }
      : null;

    // Calcular valor da parcela se houver parcelamento
    const installmentValue =
      dto.installments && dto.installments > 1 ? totalAmount / dto.installments : totalAmount;

    // Criar venda
    const sale = await this.prisma.sale.create({
      data: {
        companyId,
        code,
        customerId: dto.customerId,
        status: dto.status || 'QUOTE',
        paymentMethodId: dto.paymentMethodId,
        installments: dto.installments || 1,
        installmentValue,
        subtotal,
        discountAmount: totalDiscountAmount,
        discountPercent,
        shippingCost,
        otherCharges,
        otherChargesDesc: dto.otherChargesDesc,
        totalAmount,
        notes: dto.notes,
        internalNotes: dto.internalNotes,
        validUntil: dto.validUntil ? new Date(dto.validUntil) : null,
        useCustomerAddress,
        deliveryAddress: deliveryAddress as any,
        creditAnalysisRequired,
        creditAnalysisStatus,
        items: {
          create: itemsData,
        },
      },
      include: {
        items: {
          include: {
            product: true,
            stockLocation: true,
          },
        },
        customer: true,
        paymentMethod: true,
      },
    });

    return sale;
  }

  async findAll(
    companyId: string,
    filters?: {
      status?: string;
      customerId?: string;
      startDate?: Date;
      endDate?: Date;
      search?: string;
      page?: number;
      limit?: number;
    },
  ) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.SaleWhereInput = { companyId };

    if (filters?.status) {
      where.status = filters.status as any;
    }

    if (filters?.customerId) {
      where.customerId = filters.customerId;
    }

    if (filters?.startDate || filters?.endDate) {
      where.quoteDate = {};
      if (filters.startDate) {
        where.quoteDate.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.quoteDate.lte = filters.endDate;
      }
    }

    if (filters?.search) {
      where.OR = [
        { code: { contains: filters.search, mode: 'insensitive' } },
        { customer: { name: { contains: filters.search, mode: 'insensitive' } } },
        { customer: { email: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }

    const [sales, total] = await Promise.all([
      this.prisma.sale.findMany({
        where,
        include: {
          customer: true,
          paymentMethod: true,
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: { quoteDate: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.sale.count({ where }),
    ]);

    return {
      data: sales,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(companyId: string, id: string) {
    const sale = await this.prisma.sale.findFirst({
      where: { id, companyId },
      include: {
        customer: true,
        paymentMethod: true,
        items: {
          include: {
            product: true,
            stockLocation: true,
          },
        },
      },
    });

    if (!sale) {
      throw new NotFoundException('Venda não encontrada');
    }

    return sale;
  }

  async update(companyId: string, id: string, dto: UpdateSaleDto) {
    const sale = await this.findOne(companyId, id);

    // Não permitir edição se não for orçamento ou pendente
    if (sale.status !== 'QUOTE' && sale.status !== 'PENDING_APPROVAL') {
      throw new BadRequestException('Somente orçamentos e vendas pendentes podem ser editados');
    }

    // Se estiver alterando método de pagamento, validar
    if (dto.paymentMethodId) {
      const paymentMethod = await this.prisma.paymentMethod.findFirst({
        where: { id: dto.paymentMethodId, companyId, active: true },
      });

      if (!paymentMethod) {
        throw new NotFoundException('Método de pagamento não encontrado ou inativo');
      }

      // Validar parcelas
      if (dto.installments && dto.installments > 1) {
        if (!paymentMethod.allowInstallments) {
          throw new BadRequestException('Este método de pagamento não permite parcelamento');
        }

        if (dto.installments > paymentMethod.maxInstallments) {
          throw new BadRequestException(
            `Este método de pagamento permite no máximo ${paymentMethod.maxInstallments} parcelas`,
          );
        }
      }
    }

    // Recalcular totais se necessário
    const updateData: Prisma.SaleUpdateInput = { ...dto } as any;

    if (dto.discountAmount !== undefined || dto.discountPercent !== undefined || dto.shippingCost !== undefined || dto.otherCharges !== undefined) {
      const discountAmount = dto.discountAmount ?? sale.discountAmount;
      const discountPercent = dto.discountPercent ?? sale.discountPercent;
      const shippingCost = dto.shippingCost ?? sale.shippingCost;
      const otherCharges = dto.otherCharges ?? sale.otherCharges;
      const subtotal = sale.subtotal;

      const totalDiscountAmount = discountAmount + (subtotal * discountPercent) / 100;
      const totalAmount = subtotal - totalDiscountAmount + shippingCost + otherCharges;

      updateData.discountAmount = totalDiscountAmount;
      updateData.discountPercent = discountPercent;
      updateData.shippingCost = shippingCost;
      updateData.otherCharges = otherCharges;
      updateData.totalAmount = totalAmount;

      // Recalcular valor da parcela
      if (dto.installments || sale.installments > 1) {
        const installments = dto.installments || sale.installments;
        updateData.installmentValue = totalAmount / installments;
      }
    }

    return this.prisma.sale.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
        paymentMethod: true,
        items: {
          include: {
            product: true,
            stockLocation: true,
          },
        },
      },
    });
  }

  async confirm(companyId: string, id: string) {
    const sale = await this.findOne(companyId, id);

    // Validar status
    if (sale.status === 'CONFIRMED' || sale.status === 'COMPLETED') {
      throw new BadRequestException('Venda já confirmada');
    }

    if (sale.status === 'CANCELED') {
      throw new BadRequestException('Venda cancelada não pode ser confirmada');
    }

    // Verificar análise de crédito se necessário
    if (sale.creditAnalysisStatus === 'PENDING') {
      throw new BadRequestException('Aguardando aprovação da análise de crédito');
    }

    if (sale.creditAnalysisStatus === 'REJECTED') {
      throw new BadRequestException('Análise de crédito foi rejeitada');
    }

    // Validar e dar baixa no estoque
    for (const item of sale.items) {
      if (item.stockLocationId) {
        // Verificar disponibilidade
        const stockByLocation = await this.prisma.productStockByLocation.findUnique({
          where: {
            productId_locationId: {
              productId: item.productId,
              locationId: item.stockLocationId,
            },
          },
        });

        const available = Number(stockByLocation?.quantity || 0);
        if (available < item.quantity) {
          throw new BadRequestException(
            `Estoque insuficiente para o produto ${item.productName}. Disponível: ${available}, Solicitado: ${item.quantity}`,
          );
        }

        // Calcular novo estoque
        const newQuantity = available - item.quantity;

        // Atualizar estoque
        await this.prisma.productStockByLocation.upsert({
          where: {
            productId_locationId: {
              productId: item.productId,
              locationId: item.stockLocationId,
            },
          },
          create: {
            companyId,
            productId: item.productId,
            locationId: item.stockLocationId,
            quantity: newQuantity,
          },
          update: {
            quantity: newQuantity,
          },
        });

        // Registrar movimentação
        await this.prisma.productStockMovement.create({
          data: {
            companyId,
            productId: item.productId,
            locationId: item.stockLocationId,
            type: 'EXIT',
            quantity: new Prisma.Decimal(item.quantity),
            previousStock: new Prisma.Decimal(available),
            newStock: new Prisma.Decimal(newQuantity),
            reason: 'Venda confirmada',
            notes: `Venda #${sale.code}`,
          },
        });
      }
    }

    // Atualizar status
    return this.prisma.sale.update({
      where: { id },
      data: {
        status: 'CONFIRMED',
        confirmedAt: new Date(),
      },
      include: {
        customer: true,
        paymentMethod: true,
        items: {
          include: {
            product: true,
            stockLocation: true,
          },
        },
      },
    });
  }

  async cancel(companyId: string, id: string, dto: CancelSaleDto) {
    const sale = await this.findOne(companyId, id);

    // Validar status
    if (sale.status === 'CANCELED') {
      throw new BadRequestException('Venda já está cancelada');
    }

    if (sale.status === 'COMPLETED') {
      throw new BadRequestException('Venda concluída não pode ser cancelada');
    }

    // Se já foi confirmada, devolver estoque
    if (
      sale.status === 'CONFIRMED' ||
      sale.status === 'IN_PRODUCTION' ||
      sale.status === 'READY_TO_SHIP' ||
      sale.status === 'SHIPPED'
    ) {
      for (const item of sale.items) {
        if (item.stockLocationId) {
          // Buscar estoque atual
          const stockByLocation = await this.prisma.productStockByLocation.findUnique({
            where: {
              productId_locationId: {
                productId: item.productId,
                locationId: item.stockLocationId,
              },
            },
          });

          const currentQuantity = Number(stockByLocation?.quantity || 0);
          const newQuantity = currentQuantity + item.quantity;

          // Atualizar estoque
          await this.prisma.productStockByLocation.upsert({
            where: {
              productId_locationId: {
                productId: item.productId,
                locationId: item.stockLocationId,
              },
            },
            create: {
              companyId,
              productId: item.productId,
              locationId: item.stockLocationId,
              quantity: newQuantity,
            },
            update: {
              quantity: newQuantity,
            },
          });

          // Registrar movimentação de devolução
          await this.prisma.productStockMovement.create({
            data: {
              companyId,
              productId: item.productId,
              locationId: item.stockLocationId,
              type: 'RETURN',
              quantity: new Prisma.Decimal(item.quantity),
              previousStock: new Prisma.Decimal(currentQuantity),
              newStock: new Prisma.Decimal(newQuantity),
              reason: 'Cancelamento de venda',
              notes: `Venda cancelada #${sale.code}: ${dto.cancellationReason}`,
            },
          });
        }
      }
    }

    return this.prisma.sale.update({
      where: { id },
      data: {
        status: 'CANCELED',
        cancellationReason: dto.cancellationReason,
        canceledAt: new Date(),
      },
      include: {
        customer: true,
        paymentMethod: true,
        items: {
          include: {
            product: true,
            stockLocation: true,
          },
        },
      },
    });
  }

  async approveCreditAnalysis(companyId: string, id: string, dto: ApproveCreditAnalysisDto) {
    const sale = await this.findOne(companyId, id);

    if (sale.creditAnalysisStatus !== 'PENDING') {
      throw new BadRequestException('Análise de crédito não está pendente');
    }

    if (!sale.paymentMethodId) {
      throw new BadRequestException('Venda não possui método de pagamento');
    }

    const paymentMethod = await this.prisma.paymentMethod.findUnique({
      where: { id: sale.paymentMethodId },
    });

    if (!paymentMethod) {
      throw new NotFoundException('Método de pagamento não encontrado');
    }

    if (paymentMethod.minCreditScore && dto.creditScore < paymentMethod.minCreditScore) {
      throw new BadRequestException(
        `Score de crédito insuficiente. Mínimo: ${paymentMethod.minCreditScore}, Informado: ${dto.creditScore}`,
      );
    }

    return this.prisma.sale.update({
      where: { id },
      data: {
        creditAnalysisStatus: 'APPROVED',
        creditScore: dto.creditScore,
        creditAnalysisNotes: dto.notes,
        creditAnalysisDate: new Date(),
        status: sale.status === 'PENDING_APPROVAL' ? 'APPROVED' : sale.status,
      },
      include: {
        customer: true,
        paymentMethod: true,
        items: {
          include: {
            product: true,
            stockLocation: true,
          },
        },
      },
    });
  }

  async rejectCreditAnalysis(companyId: string, id: string, dto: RejectCreditAnalysisDto) {
    const sale = await this.findOne(companyId, id);

    if (sale.creditAnalysisStatus !== 'PENDING') {
      throw new BadRequestException('Análise de crédito não está pendente');
    }

    return this.prisma.sale.update({
      where: { id },
      data: {
        creditAnalysisStatus: 'REJECTED',
        creditScore: dto.creditScore,
        creditAnalysisNotes: dto.notes,
        creditAnalysisDate: new Date(),
        status: 'REJECTED',
      },
      include: {
        customer: true,
        paymentMethod: true,
        items: {
          include: {
            product: true,
            stockLocation: true,
          },
        },
      },
    });
  }

  async changeStatus(companyId: string, id: string, dto: ChangeStatusDto) {
    const sale = await this.findOne(companyId, id);

    // Validar transições de status
    const validTransitions: Record<string, string[]> = {
      QUOTE: ['PENDING_APPROVAL', 'CANCELED'],
      PENDING_APPROVAL: ['APPROVED', 'REJECTED', 'CANCELED'],
      APPROVED: ['CONFIRMED', 'CANCELED'],
      CONFIRMED: ['IN_PRODUCTION', 'CANCELED'],
      IN_PRODUCTION: ['READY_TO_SHIP', 'CANCELED'],
      READY_TO_SHIP: ['SHIPPED'],
      SHIPPED: ['DELIVERED'],
      DELIVERED: ['COMPLETED'],
      REJECTED: [],
      CANCELED: [],
      COMPLETED: [],
    };

    if (!validTransitions[sale.status]?.includes(dto.status)) {
      throw new BadRequestException(`Transição de status inválida: ${sale.status} → ${dto.status}`);
    }

    const updateData: Prisma.SaleUpdateInput = { status: dto.status as any };

    // Atualizar timestamps específicos
    if (dto.status === 'CONFIRMED') {
      updateData.confirmedAt = new Date();
    }

    return this.prisma.sale.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
        paymentMethod: true,
        items: {
          include: {
            product: true,
            stockLocation: true,
          },
        },
      },
    });
  }
}
