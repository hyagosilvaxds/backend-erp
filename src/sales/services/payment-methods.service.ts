import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePaymentMethodDto } from '../dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from '../dto/update-payment-method.dto';

@Injectable()
export class PaymentMethodsService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: string, dto: CreatePaymentMethodDto) {
    // Verificar se já existe método de pagamento com este código
    const existing = await this.prisma.paymentMethod.findFirst({
      where: {
        companyId,
        code: dto.code,
      },
    });

    if (existing) {
      throw new ConflictException('Já existe um método de pagamento com este código');
    }

    // Validações de negócio
    if (dto.allowInstallments && !dto.maxInstallments) {
      throw new ConflictException('Se permite parcelamento, deve informar o número máximo de parcelas');
    }

    if (dto.requiresCreditAnalysis && !dto.minCreditScore) {
      throw new ConflictException('Se requer análise de crédito, deve informar a pontuação mínima');
    }

    // Validar templates de parcelas
    if (dto.installmentTemplates && dto.installmentTemplates.length > 0) {
      // Verificar se a soma das porcentagens = 100% (se usarem porcentagem)
      const templatesWithPercentage = dto.installmentTemplates.filter(t => t.percentageOfTotal !== undefined);
      if (templatesWithPercentage.length > 0) {
        const totalPercentage = templatesWithPercentage.reduce((sum, t) => sum + (t.percentageOfTotal || 0), 0);
        if (Math.abs(totalPercentage - 100) > 0.01) {
          throw new ConflictException('A soma das porcentagens dos templates deve ser 100%');
        }
      }

      // Verificar números de parcelas únicos
      const installmentNumbers = dto.installmentTemplates.map(t => t.installmentNumber);
      const uniqueNumbers = new Set(installmentNumbers);
      if (uniqueNumbers.size !== installmentNumbers.length) {
        throw new ConflictException('Números de parcelas duplicados nos templates');
      }
    }

    // Extrair templates para criar separadamente
    const { installmentTemplates, ...paymentMethodData } = dto;

    // Criar método de pagamento
    const paymentMethod = await this.prisma.paymentMethod.create({
      data: {
        ...paymentMethodData,
        companyId,
      },
    });

    // Criar templates de parcelas se fornecidos
    if (installmentTemplates && installmentTemplates.length > 0) {
      await this.prisma.paymentInstallmentTemplate.createMany({
        data: installmentTemplates.map(template => ({
          paymentMethodId: paymentMethod.id,
          installmentNumber: template.installmentNumber,
          daysToPayment: template.daysToPayment,
          percentageOfTotal: template.percentageOfTotal || 0,
          fixedAmount: template.fixedAmount,
        })),
      });
    }

    // Retornar com templates incluídos
    return this.prisma.paymentMethod.findUnique({
      where: { id: paymentMethod.id },
      include: {
        installmentTemplates: {
          orderBy: { installmentNumber: 'asc' },
        },
      },
    });
  }

  async findAll(companyId: string, filters?: { active?: boolean; type?: string }) {
    const where: any = { companyId };

    if (filters?.active !== undefined) {
      where.active = filters.active;
    }

    if (filters?.type) {
      where.type = filters.type;
    }

    return this.prisma.paymentMethod.findMany({
      where,
      include: {
        installmentTemplates: {
          orderBy: { installmentNumber: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(companyId: string, id: string) {
    const paymentMethod = await this.prisma.paymentMethod.findFirst({
      where: { id, companyId },
      include: {
        installmentTemplates: {
          orderBy: { installmentNumber: 'asc' },
        },
      },
    });

    if (!paymentMethod) {
      throw new NotFoundException('Método de pagamento não encontrado');
    }

    return paymentMethod;
  }

  async update(companyId: string, id: string, dto: UpdatePaymentMethodDto) {
    // Verificar se existe
    await this.findOne(companyId, id);

    // Se estiver alterando o código, verificar duplicidade
    if (dto.code) {
      const existing = await this.prisma.paymentMethod.findFirst({
        where: {
          companyId,
          code: dto.code,
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictException('Já existe um método de pagamento com este código');
      }
    }

    // Validações de negócio
    if (dto.allowInstallments === false) {
      dto.maxInstallments = undefined;
      dto.installmentFee = undefined;
    }

    if (dto.requiresCreditAnalysis === false) {
      dto.minCreditScore = undefined;
    }

    return this.prisma.paymentMethod.update({
      where: { id },
      data: dto,
    });
  }

  async remove(companyId: string, id: string) {
    // Verificar se existe
    await this.findOne(companyId, id);

    // Verificar se há vendas associadas
    const salesCount = await this.prisma.sale.count({
      where: { paymentMethodId: id },
    });

    if (salesCount > 0) {
      throw new ConflictException(
        `Não é possível excluir este método de pagamento pois existem ${salesCount} venda(s) associada(s)`,
      );
    }

    return this.prisma.paymentMethod.delete({
      where: { id },
    });
  }

  async toggleActive(companyId: string, id: string) {
    const paymentMethod = await this.findOne(companyId, id);

    return this.prisma.paymentMethod.update({
      where: { id },
      data: { active: !paymentMethod.active },
    });
  }

  // ========================================
  // MÉTODOS PARA GERENCIAR TEMPLATES DE PARCELAS
  // ========================================

  async addInstallmentTemplate(
    companyId: string,
    paymentMethodId: string,
    template: { installmentNumber: number; daysToPayment: number; percentageOfTotal?: number; fixedAmount?: number },
  ) {
    // Verificar se o método de pagamento existe
    await this.findOne(companyId, paymentMethodId);

    // Verificar se já existe template com este número
    const existing = await this.prisma.paymentInstallmentTemplate.findUnique({
      where: {
        paymentMethodId_installmentNumber: {
          paymentMethodId,
          installmentNumber: template.installmentNumber,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        `Já existe um template para a parcela ${template.installmentNumber}`,
      );
    }

    return this.prisma.paymentInstallmentTemplate.create({
      data: {
        paymentMethodId,
        installmentNumber: template.installmentNumber,
        daysToPayment: template.daysToPayment,
        percentageOfTotal: template.percentageOfTotal || 0,
        fixedAmount: template.fixedAmount,
      },
    });
  }

  async updateInstallmentTemplate(
    companyId: string,
    paymentMethodId: string,
    installmentNumber: number,
    data: { daysToPayment?: number; percentageOfTotal?: number; fixedAmount?: number },
  ) {
    // Verificar se o método de pagamento existe
    await this.findOne(companyId, paymentMethodId);

    return this.prisma.paymentInstallmentTemplate.update({
      where: {
        paymentMethodId_installmentNumber: {
          paymentMethodId,
          installmentNumber,
        },
      },
      data,
    });
  }

  async removeInstallmentTemplate(companyId: string, paymentMethodId: string, installmentNumber: number) {
    // Verificar se o método de pagamento existe
    await this.findOne(companyId, paymentMethodId);

    return this.prisma.paymentInstallmentTemplate.delete({
      where: {
        paymentMethodId_installmentNumber: {
          paymentMethodId,
          installmentNumber,
        },
      },
    });
  }

  async getInstallmentTemplates(companyId: string, paymentMethodId: string) {
    // Verificar se o método de pagamento existe
    await this.findOne(companyId, paymentMethodId);

    return this.prisma.paymentInstallmentTemplate.findMany({
      where: { paymentMethodId },
      orderBy: { installmentNumber: 'asc' },
    });
  }

  async replaceInstallmentTemplates(
    companyId: string,
    paymentMethodId: string,
    templates: { installmentNumber: number; daysToPayment: number; percentageOfTotal?: number; fixedAmount?: number }[],
  ) {
    // Verificar se o método de pagamento existe
    await this.findOne(companyId, paymentMethodId);

    // Validar templates
    if (templates.length > 0) {
      // Verificar se a soma das porcentagens = 100% (se usarem porcentagem)
      const templatesWithPercentage = templates.filter(t => t.percentageOfTotal !== undefined);
      if (templatesWithPercentage.length > 0) {
        const totalPercentage = templatesWithPercentage.reduce((sum, t) => sum + (t.percentageOfTotal || 0), 0);
        if (Math.abs(totalPercentage - 100) > 0.01) {
          throw new ConflictException('A soma das porcentagens dos templates deve ser 100%');
        }
      }

      // Verificar números de parcelas únicos
      const installmentNumbers = templates.map(t => t.installmentNumber);
      const uniqueNumbers = new Set(installmentNumbers);
      if (uniqueNumbers.size !== installmentNumbers.length) {
        throw new ConflictException('Números de parcelas duplicados nos templates');
      }
    }

    // Deletar todos os templates existentes e criar novos
    await this.prisma.paymentInstallmentTemplate.deleteMany({
      where: { paymentMethodId },
    });

    if (templates.length > 0) {
      await this.prisma.paymentInstallmentTemplate.createMany({
        data: templates.map(template => ({
          paymentMethodId,
          installmentNumber: template.installmentNumber,
          daysToPayment: template.daysToPayment,
          percentageOfTotal: template.percentageOfTotal || 0,
          fixedAmount: template.fixedAmount,
        })),
      });
    }

    return this.getInstallmentTemplates(companyId, paymentMethodId);
  }
}
