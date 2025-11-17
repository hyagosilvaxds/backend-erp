import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateNFeDto } from '../dto/create-nfe.dto';
import { UpdateNFeDto } from '../dto/update-nfe.dto';
import { CancelNFeDto } from '../dto/cancel-nfe.dto';
import { CreateNFeFromSaleDto } from '../dto/create-from-sale.dto';
import { NFeStatus, PaymentCodeSefaz } from '@prisma/client';
import { getSefazPaymentCode } from '../utils/sefaz-codes.util';

@Injectable()
export class NFeService {
  constructor(private prisma: PrismaService) {}

  /**
   * Cria uma nova NFe a partir de dados fornecidos
   */
  async create(companyId: string, dto: CreateNFeDto) {
    // Verificar se a empresa existe
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: {
        cnpj: true,
        razaoSocial: true,
        serieNFe: true,
        ultimoNumeroNFe: true,
        estado: true,
        codigoMunicipioIBGE: true,
      },
    });

    if (!company) {
      throw new NotFoundException('Empresa não encontrada');
    }

    // Incrementar o número da NFe
    const numeroNFe = (company.ultimoNumeroNFe || 0) + 1;

    // Validar se a venda existe (se fornecida)
    if (dto.saleId) {
      const sale = await this.prisma.sale.findUnique({
        where: { id: dto.saleId },
      });

      if (!sale) {
        throw new NotFoundException('Venda não encontrada');
      }

      if (sale.companyId !== companyId) {
        throw new BadRequestException('Venda não pertence a esta empresa');
      }
    }

    // Validar cliente se fornecido
    if (dto.destinatarioId) {
      const customer = await this.prisma.customer.findUnique({
        where: { id: dto.destinatarioId },
      });

      if (!customer) {
        throw new NotFoundException('Cliente não encontrado');
      }

      if (customer.companyId !== companyId) {
        throw new BadRequestException('Cliente não pertence a esta empresa');
      }
    }

    // Extrair itens do DTO
    const { items, ...nfeData } = dto;

    // Criar a NFe
    const nfe = await this.prisma.$transaction(async (tx) => {
      // Obter código UF e município da empresa
      const codigoUF = this.getCodigoUF(company.estado || 'SP');
      const cNF = this.generateCNF();
      
      // Criar a NFe
      const createdNFe = await tx.nFe.create({
        data: {
          companyId,
          numero: numeroNFe,
          serie: dto.serie || company.serieNFe || '1',
          modelo: dto.modelo || '55',
          status: NFeStatus.DRAFT,
          cUF: codigoUF,
          cNF: cNF,
          cMunFG: company.codigoMunicipioIBGE || '3550308',
          naturezaOperacao: dto.naturezaOperacao,
          tipoOperacao: dto.tipoOperacao,
          finalidade: dto.finalidade,
          destinatarioId: dto.destinatarioId,
          destinatarioNome: dto.destinatarioNome,
          destinatarioCnpjCpf: dto.destinatarioCnpjCpf,
          destinatarioIe: dto.destinatarioIe,
          destinatarioEmail: dto.destinatarioEmail,
          destinatarioTelefone: dto.destinatarioTelefone,
          destLogradouro: dto.destLogradouro,
          destNumero: dto.destNumero,
          destComplemento: dto.destComplemento,
          destBairro: dto.destBairro,
          destCidade: dto.destCidade,
          destEstado: dto.destEstado,
          destCep: dto.destCep,
          destPais: dto.destPais,
          destCodigoMunicipio: dto.destCodigoMunicipio || '',
          valorProdutos: dto.valorProdutos,
          valorFrete: dto.valorFrete,
          valorSeguro: dto.valorSeguro,
          valorDesconto: dto.valorDesconto,
          valorOutrasDespesas: dto.valorOutrasDespesas,
          valorIPI: dto.valorIPI,
          valorICMS: dto.valorICMS,
          valorICMSST: dto.valorICMSST,
          valorPIS: dto.valorPIS,
          valorCOFINS: dto.valorCOFINS,
          valorTotal: dto.valorTotal,
          valorTributosFederais: dto.valorTributosFederais,
          valorTributosEstaduais: dto.valorTributosEstaduais,
          valorTributosMunicipais: dto.valorTributosMunicipais,
          valorTributosTotal: dto.valorTributosTotal,
          modalidadeFrete: dto.modalidadeFrete,
          transportadoraNome: dto.transportadoraNome,
          transportadoraCnpjCpf: dto.transportadoraCnpjCpf,
          veiculoPlaca: dto.veiculoPlaca,
          veiculoUF: dto.veiculoUF,
          volumeQuantidade: dto.volumeQuantidade,
          volumeEspecie: dto.volumeEspecie,
          volumeMarca: dto.volumeMarca,
          volumeNumeracao: dto.volumeNumeracao,
          volumePesoLiquido: dto.volumePesoLiquido,
          volumePesoBruto: dto.volumePesoBruto,
          informacoesComplementares: dto.informacoesComplementares,
          informacoesFisco: dto.informacoesFisco,
          dataEmissao: dto.dataEmissao ? new Date(dto.dataEmissao) : undefined,
          dataSaida: dto.dataSaida ? new Date(dto.dataSaida) : undefined,
          observacoes: dto.observacoes,
          saleId: dto.saleId,
          items: {
            create: items.map((item, index) => ({
              numero: index + 1,
              productId: item.productId,
              codigoProduto: item.codigoProduto,
              codigoEAN: item.codigoEAN || 'SEM GTIN',
              codigoEANTrib: item.codigoEAN || 'SEM GTIN',
              descricao: item.descricao,
              ncm: item.ncm,
              cest: item.cest,
              cfop: item.cfop,
              unidadeComercial: item.unidade,
              quantidadeComercial: item.quantidade,
              valorUnitarioComercial: item.valorUnitario,
              unidadeTributavel: item.unidade,
              quantidadeTributavel: item.quantidade,
              valorUnitarioTributavel: item.valorUnitario,
              valorProduto: item.valorTotal,
              valorDesconto: item.valorDesconto || 0,
              valorFrete: item.valorFrete || 0,
              valorSeguro: item.valorSeguro || 0,
              valorOutros: item.valorOutrasDespesas || 0,
              indicadorTotal: 1,
              icmsOrigem: item.icmsOrigem,
              icmsCst: item.icmsCst,
              icmsCSOSN: item.icmsCst,
              icmsModalidadeBC: item.icmsModalidade,
              icmsBase: item.icmsBase,
              icmsAliquota: item.icmsAliquota,
              icmsValor: item.icmsValor,
              icmsStBase: item.icmsStBase,
              icmsStAliquota: item.icmsStAliquota,
              icmsStValor: item.icmsStValor,
              ipiCst: item.ipiCst,
              ipiBase: item.ipiBase,
              ipiAliquota: item.ipiAliquota,
              ipiValor: item.ipiValor,
              pisCst: item.pisCst,
              pisBase: item.pisBase,
              pisAliquota: item.pisAliquota,
              pisValor: item.pisValor,
              pisQuantidade: item.pisQuantidade,
              pisAliqValor: item.pisAliqValor,
              cofinsCst: item.cofinsCst,
              cofinsBase: item.cofinsBase,
              cofinsAliquota: item.cofinsAliquota,
              cofinsValor: item.cofinsValor,
              cofinsQuantidade: item.cofinsQuantidade,
              cofinsAliqValor: item.cofinsAliqValor,
              informacoesAdicionais: item.informacoesAdicionais,
            })),
          },
        },
        include: {
          items: true,
          company: true,
          sale: true,
          customer: true,
        },
      });

      // Atualizar o último número da NFe na empresa
      await tx.company.update({
        where: { id: companyId },
        data: { ultimoNumeroNFe: numeroNFe },
      });

      return createdNFe;
    });

    return nfe;
  }

  /**
   * Cria uma NFe a partir de uma venda existente
   */
  async createFromSale(companyId: string, dto: CreateNFeFromSaleDto) {
    // Buscar a venda com todos os relacionamentos
    const sale = await this.prisma.sale.findUnique({
      where: { id: dto.saleId },
      include: {
        customer: {
          include: {
            addresses: {
              where: { isDefault: true },
              take: 1,
            },
          },
        },
        items: {
          include: {
            product: true,
          },
        },
        paymentMethod: true, // Incluir forma de pagamento para obter código SEFAZ
      },
    });

    if (!sale) {
      throw new NotFoundException('Venda não encontrada');
    }

    if (sale.companyId !== companyId) {
      throw new BadRequestException('Venda não pertence a esta empresa');
    }

    // Buscar dados da empresa para comparação de estado
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: { estado: true },
    });

    if (!company) {
      throw new NotFoundException('Empresa não encontrada');
    }

    // Verificar se a venda já possui NFe
    const existingNfe = await this.prisma.nFe.findFirst({
      where: {
        saleId: dto.saleId,
        companyId,
        status: { notIn: [NFeStatus.CANCELED, NFeStatus.REJECTED] },
      },
    });

    if (existingNfe) {
      throw new ConflictException('Esta venda já possui uma NFe vinculada');
    }

    // Obter endereço do cliente
    const customerAddress = sale.customer.addresses[0] || sale.deliveryAddress;
    const customerState = customerAddress?.state || '';
    const companyState = company.estado || '';

    // Preparar código de pagamento SEFAZ (se houver forma de pagamento definida)
    let sefazPaymentCode: string | undefined;
    if (sale.paymentMethod?.sefazCode) {
      sefazPaymentCode = getSefazPaymentCode(sale.paymentMethod.sefazCode as PaymentCodeSefaz);
    }

    // Montar dados da NFe baseado na venda
    const nfeDto: CreateNFeDto = {
      saleId: sale.id,
      serie: dto.serie,
      modelo: dto.modelo || '55',
      naturezaOperacao: dto.naturezaOperacao,
      tipoOperacao: dto.tipoOperacao || 1,
      finalidade: dto.finalidade || 1,

      // Destinatário
      destinatarioId: sale.customerId,
      destinatarioNome: sale.customer.personType === 'JURIDICA' 
        ? (sale.customer.companyName || '')
        : (sale.customer.name || ''),
      destinatarioCnpjCpf: sale.customer.personType === 'JURIDICA'
        ? (sale.customer.cnpj || '')
        : (sale.customer.cpf || ''),
      destinatarioIe: sale.customer.stateRegistration || undefined,
      destinatarioEmail: sale.customer.email || undefined,
      destinatarioTelefone: sale.customer.mobile || sale.customer.phone || undefined,

      // Endereço (usar endereço da venda ou do cliente)
      destLogradouro: customerAddress?.street || '',
      destNumero: customerAddress?.number || 'S/N',
      destComplemento: customerAddress?.complement || undefined,
      destBairro: customerAddress?.neighborhood || '',
      destCidade: customerAddress?.city || '',
      destEstado: customerAddress?.state || '',
      destCep: customerAddress?.zipCode || '',
      destPais: 'Brasil',
      destCodigoMunicipio: customerAddress?.ibgeCode || undefined, // Usar código IBGE do endereço

      // Valores
      valorProdutos: sale.subtotal,
      valorFrete: sale.shippingCost || 0,
      valorDesconto: sale.discountAmount || 0,
      valorOutrasDespesas: sale.otherCharges || 0,
      valorTotal: sale.totalAmount,

      // Valores de tributos (serão calculados)
      valorIPI: 0,
      valorICMS: 0,
      valorICMSST: 0,
      valorPIS: 0,
      valorCOFINS: 0,

      // Frete
      modalidadeFrete: dto.modalidadeFrete ?? sale.shippingModality ?? 9,

      // Pagamento (usar código SEFAZ da forma de pagamento da venda)
      indicadorPagamento: sale.installments > 1 ? 1 : 0, // 0=À vista, 1=A prazo
      meioPagamento: sefazPaymentCode, // Código SEFAZ (01-99)
      valorPagamento: sale.totalAmount,
      valorTroco: 0,

      // Informações adicionais
      informacoesComplementares: dto.informacoesComplementares,
      informacoesFisco: dto.informacoesFisco,
      observacoes: dto.observacoes,

      // Itens
      items: sale.items.map((item) => {
        // Usar CFOP estadual se mesmo estado, interestadual se estados diferentes
        const isSameState = companyState === customerState;
        const cfop = isSameState 
          ? (item.product.cfopEstadual || '5102')
          : (item.product.cfopInterestadual || item.product.cfopEstadual || '6102');

        return {
          productId: item.productId,
          codigoProduto: item.product.sku || item.productCode,
          codigoEAN: item.product.barcode || undefined,
          descricao: item.productName,
          ncm: item.product.ncm || '00000000',
          cest: item.product.cest || undefined,
          cfop: cfop,
          unidade: item.productUnit || 'UN',
          quantidade: item.quantity,
          valorUnitario: item.unitPrice,
          valorTotal: item.total,
          valorDesconto: item.discount || 0,

          // Tributos do produto (usar configuração do produto)
          icmsCst: item.product.icmsCst || undefined,
          icmsOrigem: 0,
          icmsAliquota: item.product.icmsRate ? Number(item.product.icmsRate) : undefined,

          ipiCst: item.product.ipiCst || undefined,
          ipiAliquota: item.product.ipiRate ? Number(item.product.ipiRate) : undefined,

          pisCst: item.product.pisCst || undefined,
          pisAliquota: item.product.pisRate ? Number(item.product.pisRate) : undefined,

          cofinsCst: item.product.cofinsCst || undefined,
          cofinsAliquota: item.product.cofinsRate ? Number(item.product.cofinsRate) : undefined,
        };
      }),
    };

    // Criar a NFe usando o método create
    return this.create(companyId, nfeDto);
  }

  /**
   * Lista todas as NFes da empresa com filtros e paginação
   */
  async findAll(
    companyId: string,
    filters?: {
      status?: NFeStatus;
      saleId?: string;
      destinatarioId?: string;
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

    const where: any = {
      companyId,
    };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.saleId) {
      where.saleId = filters.saleId;
    }

    if (filters?.destinatarioId) {
      where.destinatarioId = filters.destinatarioId;
    }

    if (filters?.startDate || filters?.endDate) {
      where.dataEmissao = {};
      if (filters.startDate) {
        where.dataEmissao.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.dataEmissao.lte = filters.endDate;
      }
    }

    if (filters?.search) {
      where.OR = [
        { numero: { contains: filters.search } },
        { destinatarioNome: { contains: filters.search, mode: 'insensitive' } },
        { destinatarioCnpjCpf: { contains: filters.search } },
        { chaveAcesso: { contains: filters.search } },
      ];
    }

    const [nfes, total] = await Promise.all([
      this.prisma.nFe.findMany({
        where,
        include: {
          company: {
            select: {
              id: true,
              razaoSocial: true,
              cnpj: true,
            },
          },
          sale: {
            select: {
              id: true,
              code: true,
              totalAmount: true,
            },
          },
          customer: {
            select: {
              id: true,
              name: true,
              companyName: true,
              personType: true,
            },
          },
          items: true,
          events: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.nFe.count({ where }),
    ]);

    return {
      data: nfes,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Busca uma NFe específica
   */
  async findOne(companyId: string, id: string) {
    const nfe = await this.prisma.nFe.findFirst({
      where: { id, companyId },
      include: {
        company: true,
        sale: {
          include: {
            customer: true,
            items: {
              include: {
                product: true,
              },
            },
          },
        },
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
        events: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!nfe) {
      throw new NotFoundException('NFe não encontrada');
    }

    return nfe;
  }

  /**
   * Atualiza uma NFe (apenas se estiver em rascunho)
   */
  async update(companyId: string, id: string, dto: UpdateNFeDto) {
    const nfe = await this.findOne(companyId, id);

    if (nfe.status !== NFeStatus.DRAFT) {
      throw new BadRequestException('Apenas NFes em rascunho podem ser editadas');
    }

    const { items, ...nfeData } = dto;

    return this.prisma.$transaction(async (tx) => {
      // Se houver itens, atualizar/criar/deletar conforme necessário
      if (items) {
        // Deletar itens existentes
        await tx.nFeItem.deleteMany({
          where: { nfeId: id },
        });

        // Criar novos itens
        await tx.nFeItem.createMany({
          data: items.map((item, index) => ({
            nfeId: id,
            numero: index + 1,
            productId: item.productId,
            codigoProduto: item.codigoProduto,
            codigoEAN: item.codigoEAN,
            descricao: item.descricao,
            ncm: item.ncm,
            cest: item.cest,
            cfop: item.cfop,
            unidadeComercial: item.unidade,
            quantidadeComercial: item.quantidade,
            valorUnitarioComercial: item.valorUnitario,
            unidadeTributavel: item.unidade,
            quantidadeTributavel: item.quantidade,
            valorUnitarioTributavel: item.valorUnitario,
            valorProduto: item.valorTotal,
            valorDesconto: item.valorDesconto,
            valorFrete: item.valorFrete,
            valorSeguro: item.valorSeguro,
            valorOutrasDespesas: item.valorOutrasDespesas,
            icmsCst: item.icmsCst,
            icmsOrigem: item.icmsOrigem,
            icmsModalidade: item.icmsModalidade,
            icmsAliquota: item.icmsAliquota,
            icmsBase: item.icmsBase,
            icmsValor: item.icmsValor,
            icmsStBase: item.icmsStBase,
            icmsStAliquota: item.icmsStAliquota,
            icmsStValor: item.icmsStValor,
            ipiCst: item.ipiCst,
            ipiAliquota: item.ipiAliquota,
            ipiBase: item.ipiBase,
            ipiValor: item.ipiValor,
            pisCst: item.pisCst,
            pisAliquota: item.pisAliquota,
            pisBase: item.pisBase,
            pisValor: item.pisValor,
            pisQuantidade: item.pisQuantidade,
            pisAliqValor: item.pisAliqValor,
            cofinsCst: item.cofinsCst,
            cofinsAliquota: item.cofinsAliquota,
            cofinsBase: item.cofinsBase,
            cofinsValor: item.cofinsValor,
            cofinsQuantidade: item.cofinsQuantidade,
            cofinsAliqValor: item.cofinsAliqValor,
            informacoesAdicionais: item.informacoesAdicionais,
          })),
        });
      }

      // Atualizar a NFe
      return tx.nFe.update({
        where: { id },
        data: nfeData,
        include: {
          items: true,
          company: true,
          sale: true,
          customer: true,
        },
      });
    });
  }

  /**
   * Remove uma NFe (apenas se estiver em rascunho)
   */
  async remove(companyId: string, id: string) {
    const nfe = await this.findOne(companyId, id);

    if (nfe.status !== NFeStatus.DRAFT) {
      throw new BadRequestException('Apenas NFes em rascunho podem ser deletadas');
    }

    await this.prisma.nFe.delete({
      where: { id },
    });

    return { message: 'NFe deletada com sucesso' };
  }

  /**
   * Emite uma NFe (PLACEHOLDER - implementar integração com SEFAZ)
   */
  async emitir(companyId: string, id: string) {
    const nfe = await this.findOne(companyId, id);

    if (nfe.status !== NFeStatus.DRAFT) {
      throw new BadRequestException('Apenas NFes em rascunho podem ser emitidas');
    }

    // TODO: Implementar integração com SEFAZ
    // 1. Validar certificado digital
    // 2. Gerar XML da NFe
    // 3. Assinar digitalmente
    // 4. Enviar para SEFAZ
    // 5. Processar retorno
    // 6. Gerar chave de acesso
    // 7. Salvar protocolo

    // Por enquanto, apenas mudar o status para IN_PROCESS
    const updatedNfe = await this.prisma.nFe.update({
      where: { id },
      data: {
        status: NFeStatus.IN_PROCESS,
        dataEmissao: new Date(),
      },
      include: {
        items: true,
        company: true,
        sale: true,
        customer: true,
      },
    });

    return {
      message: 'NFe enviada para processamento (funcionalidade de emissão ainda não implementada)',
      nfe: updatedNfe,
    };
  }

  /**
   * Cancela uma NFe (PLACEHOLDER - implementar integração com SEFAZ)
   */
  async cancel(companyId: string, id: string, dto: CancelNFeDto) {
    const nfe = await this.findOne(companyId, id);

    if (nfe.status !== NFeStatus.AUTHORIZED) {
      throw new BadRequestException('Apenas NFes autorizadas podem ser canceladas');
    }

    // Verificar prazo de cancelamento (geralmente 24h)
    if (nfe.dataAutorizacao) {
      const hoursSinceAuth = (new Date().getTime() - nfe.dataAutorizacao.getTime()) / (1000 * 60 * 60);
      if (hoursSinceAuth > 24) {
        throw new BadRequestException('Prazo para cancelamento excedido (24 horas)');
      }
    }

    // TODO: Implementar integração com SEFAZ para cancelamento
    // 1. Validar certificado digital
    // 2. Gerar XML do evento de cancelamento
    // 3. Assinar digitalmente
    // 4. Enviar para SEFAZ
    // 5. Processar retorno

    // Por enquanto, apenas mudar o status
    const updatedNfe = await this.prisma.$transaction(async (tx) => {
      // Criar evento de cancelamento
      await tx.nFeEvent.create({
        data: {
          nfeId: id,
          tipo: 'CANCELAMENTO',
          descricao: 'Cancelamento de NFe',
          justificativa: dto.motivoCancelamento,
          status: 'PENDENTE',
        },
      });

      // Atualizar NFe
      return tx.nFe.update({
        where: { id },
        data: {
          status: NFeStatus.CANCELED,
          canceladaEm: new Date(),
          motivoCancelamento: dto.motivoCancelamento,
        },
        include: {
          items: true,
          company: true,
          sale: true,
          customer: true,
          events: true,
        },
      });
    });

    return {
      message: 'NFe cancelada (funcionalidade de cancelamento na SEFAZ ainda não implementada)',
      nfe: updatedNfe,
    };
  }

  /**
   * Gera o DANFE (PDF) da NFe (PLACEHOLDER)
   */
  async generateDanfe(companyId: string, id: string) {
    const nfe = await this.findOne(companyId, id);

    if (nfe.status === NFeStatus.DRAFT) {
      throw new BadRequestException('Não é possível gerar DANFE de NFe em rascunho');
    }

    // TODO: Implementar geração de DANFE
    // 1. Montar layout do DANFE conforme especificação
    // 2. Incluir código de barras da chave de acesso
    // 3. Incluir QR Code (para NFC-e)
    // 4. Gerar PDF usando biblioteca (ex: puppeteer, pdfkit)
    // 5. Salvar arquivo
    // 6. Retornar caminho ou buffer

    return {
      message: 'Geração de DANFE ainda não implementada',
      nfe: {
        id: nfe.id,
        numero: nfe.numero,
        serie: nfe.serie,
        chaveAcesso: nfe.chaveAcesso,
      },
    };
  }

  /**
   * Baixa o XML da NFe
   */
  async downloadXml(companyId: string, id: string) {
    const nfe = await this.findOne(companyId, id);

    if (!nfe.xmlAutorizado) {
      throw new NotFoundException('XML autorizado não disponível');
    }

    // TODO: Retornar o XML como arquivo para download
    return {
      xml: nfe.xmlAutorizado,
      filename: `NFe-${nfe.chaveAcesso}.xml`,
    };
  }

  /**
   * Consulta o status de uma NFe na SEFAZ (PLACEHOLDER)
   */
  async consultarStatus(companyId: string, id: string) {
    const nfe = await this.findOne(companyId, id);

    if (!nfe.chaveAcesso) {
      throw new BadRequestException('NFe não possui chave de acesso');
    }

    // TODO: Implementar consulta na SEFAZ
    // 1. Validar certificado
    // 2. Fazer requisição SOAP para consulta
    // 3. Processar retorno

    return {
      message: 'Consulta de status na SEFAZ ainda não implementada',
      nfe: {
        id: nfe.id,
        status: nfe.status,
        chaveAcesso: nfe.chaveAcesso,
      },
    };
  }

  /**
   * Estatísticas de NFes
   */
  async getStats(companyId: string) {
    const [total, emitidas, canceladas, rascunhos] = await Promise.all([
      this.prisma.nFe.count({ where: { companyId } }),
      this.prisma.nFe.count({
        where: { companyId, status: NFeStatus.AUTHORIZED },
      }),
      this.prisma.nFe.count({
        where: { companyId, status: NFeStatus.CANCELED },
      }),
      this.prisma.nFe.count({
        where: { companyId, status: NFeStatus.DRAFT },
      }),
    ]);

    const valorTotal = await this.prisma.nFe.aggregate({
      where: {
        companyId,
        status: NFeStatus.AUTHORIZED,
      },
      _sum: {
        valorTotal: true,
      },
    });

    return {
      total,
      emitidas,
      canceladas,
      rascunhos,
      valorTotalEmitidas: valorTotal._sum.valorTotal || 0,
    };
  }

  /**
   * Gera código numérico da NFe (8 dígitos aleatórios)
   */
  private generateCNF(): string {
    return Math.random().toString().slice(2, 10);
  }

  /**
   * Retorna o código IBGE da UF
   */
  private getCodigoUF(siglaUF: string): string {
    const codigosUF: Record<string, string> = {
      RO: '11', AC: '12', AM: '13', RR: '14', PA: '15', AP: '16', TO: '17',
      MA: '21', PI: '22', CE: '23', RN: '24', PB: '25', PE: '26', AL: '27',
      SE: '28', BA: '29', MG: '31', ES: '32', RJ: '33', SP: '35', PR: '41',
      SC: '42', RS: '43', MS: '50', MT: '51', GO: '52', DF: '53',
    };
    return codigosUF[siglaUF] || '35'; // Default: SP
  }
}
