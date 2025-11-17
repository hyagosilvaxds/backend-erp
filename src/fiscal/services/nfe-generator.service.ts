import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Make } from 'node-sped-nfe';
import { EmitirNFeDto } from '../dto/emitir-nfe.dto';

@Injectable()
export class NFeGeneratorService {
  constructor(private prisma: PrismaService) {}

  /**
   * Gera o XML da NF-e a partir dos dados da venda
   */
  async gerarXML(companyId: string, dto: EmitirNFeDto): Promise<string> {
    // 1. Buscar venda completa com todos os relacionamentos
    const sale = await this.prisma.sale.findFirst({
      where: {
        id: dto.saleId,
        companyId,
      },
      include: {
        customer: {
          include: {
            addresses: true,
          },
        },
        items: {
          include: {
            product: {
              include: {
                unit: true,
              },
            },
          },
        },
        paymentMethod: true,
        company: true, // Buscar a empresa também
      },
    });

    if (!sale) {
      throw new NotFoundException('Venda não encontrada');
    }

    if (sale.status !== 'APPROVED') {
      throw new BadRequestException('Apenas vendas aprovadas podem gerar NF-e');
    }

    // 2. Validar dados obrigatórios
    this.validarDadosEmissao(sale);

    // 3. Buscar próximo número da NF-e (se não fornecido)
    const numeroNFe = dto.numero || await this.obterProximoNumero(companyId, dto.serie || '1');

    // 4. Gerar código numérico aleatório (cNF)
    const cNF = Math.random().toString().slice(2, 10);

    // 5. Criar instância do Make
    const NFe = new Make();

    // 6. Preencher tags da NF-e
    this.preencherInfNFe(NFe);
    this.preencherIde(NFe, sale, dto, numeroNFe, cNF);
    this.preencherEmitente(NFe, sale.company);
    this.preencherDestinatario(NFe, sale.customer);
    
    // Verificar se é venda interestadual
    const isInterestadual = this.determinarDestinoOperacao(sale.company.estado || 'SP', sale.customer) === '2';
    this.preencherProdutos(NFe, sale.items, isInterestadual);
    
    this.preencherImpostos(NFe, sale);
    this.preencherTotal(NFe);
    this.preencherTransporte(NFe, sale);
    this.preencherPagamento(NFe, sale);
    this.preencherResponsavelTecnico(NFe, sale.company);

    return NFe.xml();
  }

  /**
   * Valida se todos os dados necessários estão preenchidos
   */
  private validarDadosEmissao(sale: any): void {
    const erros: string[] = [];

    // Validar empresa
    if (!sale.company.cnpj) erros.push('CNPJ da empresa não cadastrado');
    if (!sale.company.inscricaoEstadual) erros.push('Inscrição Estadual da empresa não cadastrada');
    if (!sale.company.logradouro || !sale.company.cidade || !sale.company.estado) {
      erros.push('Endereço completo da empresa não cadastrado');
    }

    // Validar cliente
    if (!sale.customer.cnpj && !sale.customer.cpf) {
      erros.push('CPF/CNPJ do cliente não cadastrado');
    }
    
    const enderecoCliente = sale.customer.addresses?.find(a => a.type === 'MAIN') || sale.customer.addresses?.[0];
    if (!enderecoCliente) {
      erros.push('Endereço do cliente não cadastrado');
    }

    // Validar itens
    if (!sale.items || sale.items.length === 0) {
      erros.push('Venda sem itens');
    }

    sale.items.forEach((item, index) => {
      if (!item.product.ncm) {
        erros.push(`Produto "${item.product.name}" sem NCM cadastrado`);
      }
      // CFOP será determinado automaticamente (estadual ou interestadual)
      if (!item.product.cfopEstadual && !item.product.cfopInterestadual) {
        erros.push(`Produto "${item.product.name}" sem CFOP cadastrado (estadual ou interestadual)`);
      }
    });

    if (erros.length > 0) {
      throw new BadRequestException({
        message: 'Dados incompletos para emissão da NF-e',
        errors: erros,
      });
    }
  }

  /**
   * Obtém o próximo número da NF-e
   */
  private async obterProximoNumero(companyId: string, serie: string): Promise<number> {
    const ultimaNFe = await this.prisma.nFe.findFirst({
      where: {
        companyId,
        serie,
      },
      orderBy: {
        numero: 'desc',
      },
    });

    return ultimaNFe ? ultimaNFe.numero + 1 : 1;
  }

  /**
   * Tag infNFe
   */
  private preencherInfNFe(NFe: Make): void {
    NFe.tagInfNFe({ Id: null, versao: '4.00' });
  }

  /**
   * Tag ide - Identificação da NF-e
   */
  private preencherIde(NFe: Make, sale: any, dto: EmitirNFeDto, numeroNFe: number, cNF: string): void {
    const company = sale.company;

    // Obter código da UF da empresa (sempre usar o cadastrado)
    const codigoUF = this.obterCodigoUF(company.estado || 'SP');
    
    // Tipo de ambiente: 1=Produção, 2=Homologação (cadastrado na empresa)
    const tpAmb = company.nfeAmbiente === '1' ? '1' : '2';

    // Determinar destino: 1=Interna, 2=Interestadual, 3=Exterior
    const idDest = this.determinarDestinoOperacao(company.estado || 'SP', sale.customer);

    // Série da NF-e (cadastrada na empresa)
    const serie = dto.serie || company.serieNFe || '1';

    NFe.tagIde({
      cUF: codigoUF, // Código IBGE da UF da empresa
      cNF: cNF, // Código numérico aleatório (8 dígitos)
      natOp: 'VENDA', // Sempre "VENDA"
      mod: '55', // Sempre "55" (NF-e)
      serie: serie, // Série cadastrada na empresa
      nNF: numeroNFe.toString(), // Número sequencial por série
      dhEmi: NFe.formatData(), // Data/hora atual
      tpNF: '1', // Sempre "1" (Saída)
      idDest: idDest, // 1=Interna, 2=Interestadual, 3=Exterior
      cMunFG: company.codigoMunicipioIBGE || '', // Código IBGE do município
      tpImp: '1', // Sempre "1" (Retrato)
      tpEmis: '1', // Sempre "1" (Normal)
      cDV: '1', // Calculado pela biblioteca
      tpAmb: tpAmb, // 1=Produção, 2=Homologação
      finNFe: dto.finalidade?.toString() || '1', // 1=Normal (permitir escolha do usuário)
      indFinal: dto.consumidorFinal?.toString() || '0', // 0=Não, 1=Sim (vem do DTO)
      indPres: dto.presencaComprador?.toString() || '1', // Indicador de presença do comprador
      indIntermed: '0', // Sempre "0" (Sem intermediador)
      procEmi: '0', // Sempre "0" (Aplicativo do contribuinte)
      verProc: '4.13', // Versão do aplicativo
    });
  }

  /**
   * Tag emit - Emitente (usa dados reais cadastrados no BD)
   * Todos os dados vêm do cadastro da empresa no banco de dados
   */
  private preencherEmitente(NFe: Make, company: any): void {
    NFe.tagEmit({
      CNPJ: company.cnpj.replace(/\D/g, ''), // CNPJ do emitente (cadastrado no bd)
      xNome: company.razaoSocial, // Razão social do emitente (cadastrado no bd)
      xFant: company.nomeFantasia || company.razaoSocial, // Nome fantasia do emitente (cadastrado no bd)
      IE: company.inscricaoEstadual?.replace(/\D/g, ''), // Inscrição Estadual do emitente (cadastrado no bd)
      CRT: this.obterCRT(company.regimeTributario), // Código de Regime Tributário (1=Simples Nacional) (cadastrado no bd)
    });

    NFe.tagEnderEmit({
      xLgr: company.logradouro || '', // Logradouro (rua, avenida, etc.) (cadastrado no bd)
      nro: company.numero || 'S/N', // Número (cadastrado no bd)
      xCpl: company.complemento || undefined, // Complemento (cadastrado no bd)
      xBairro: company.bairro || '', // Bairro (cadastrado no bd)
      cMun: company.codigoMunicipioIBGE || this.obterCodigoMunicipio(company.cidade, company.estado), // Código do município (Tabela IBGE) (cadastrado no bd)
      xMun: company.cidade || '', // Nome do município (cadastrado no bd)
      UF: company.estado || '', // Sigla da UF (cadastrado no bd)
      CEP: company.cep?.replace(/\D/g, '') || '', // CEP (cadastrado no bd)
      cPais: '1058', // Código do país (1058 para Brasil) (sempre 1058)
      xPais: 'BRASIL', // Nome do país (sempre "BRASIL")
      fone: company.telefone?.replace(/\D/g, '') || company.celular?.replace(/\D/g, '') || undefined, // Telefone (cadastrado no bd)
    });
  }

  /**
   * Tag dest - Destinatário (usa dados reais cadastrados no BD)
   * Todos os dados vêm do cadastro do cliente da venda
   * Prioriza endereço BILLING > MAIN > primeiro disponível
   */
  private preencherDestinatario(NFe: Make, customer: any): void {
    // Prioriza endereço de cobrança (BILLING), depois principal (MAIN), depois qualquer
    const endereco = customer.addresses.find(a => a.type === 'BILLING') 
                  || customer.addresses.find(a => a.type === 'MAIN') 
                  || customer.addresses[0];

    // Monta tagDest conforme tipo de pessoa
    const tagDest: any = {};

    // Pessoa Jurídica (CNPJ)
    if (customer.personType === 'JURIDICA' && customer.cnpj) {
      tagDest.CNPJ = customer.cnpj.replace(/\D/g, ''); // CNPJ do destinatário (cadastrado no cliente da venda)
      tagDest.xNome = customer.companyName || customer.name; // Razão social do destinatário (cadastrado no cliente da venda)
      tagDest.indIEDest = customer.stateRegistrationExempt ? '2' : '1'; // 1=Contribuinte ICMS, 2=Isento (cadastrado no cliente da venda)
      if (!customer.stateRegistrationExempt && customer.stateRegistration) {
        tagDest.IE = customer.stateRegistration.replace(/\D/g, ''); // Inscrição Estadual (cadastrado no cliente da venda)
      }
    } 
    // Pessoa Física (CPF)
    else if (customer.cpf) {
      tagDest.CPF = customer.cpf.replace(/\D/g, ''); // CPF do destinatário (cadastrado no cliente da venda)
      tagDest.xNome = customer.name; // Nome do destinatário (cadastrado no cliente da venda)
      tagDest.indIEDest = '9'; // Sempre "9" (Não contribuinte) para pessoa física
    }

    NFe.tagDest(tagDest);

    NFe.tagEnderDest({
      xLgr: endereco.street, // Logradouro (cadastrado no cliente da venda)
      nro: endereco.number, // Número (cadastrado no cliente da venda)
      xCpl: endereco.complement || undefined, // Complemento (cadastrado no cliente da venda)
      xBairro: endereco.neighborhood, // Bairro (cadastrado no cliente da venda)
      cMun: endereco.ibgeCode || this.obterCodigoMunicipio(endereco.city, endereco.state), // Código do município (Tabela IBGE) (cadastrado no cliente da venda)
      xMun: endereco.city, // Nome do município (cadastrado no cliente da venda)
      UF: endereco.state, // Sigla da UF (cadastrado no cliente da venda)
      CEP: endereco.zipCode.replace(/\D/g, ''), // CEP (cadastrado no cliente da venda)
      cPais: '1058', // Código do país (sempre 1058 para Brasil)
      xPais: 'BRASIL', // Nome do país (sempre "BRASIL")
      fone: customer.phone?.replace(/\D/g, '') || customer.mobile?.replace(/\D/g, '') || undefined, // Telefone (cadastrado no cliente da venda)
    });
  }

  /**
   * Tag prod - Produtos (usa dados reais cadastrados no BD)
   * Todos os dados vêm do cadastro dos produtos na venda
   */
  private preencherProdutos(NFe: Make, items: any[], isInterestadual: boolean): void {
    const produtos = items.map((item, index) => {
      const produto = item.product;
      
      // Determinar CFOP: se interestadual usa cfopInterestadual, senão usa cfopEstadual (cadastrado no produto)
      const cfop = isInterestadual 
        ? (produto.cfopInterestadual || produto.cfop || '6102')
        : (produto.cfopEstadual || produto.cfop || '5102');
      
      // Determinar unidade: usar o unit relacionado ou padrão (cadastrado no produto)
      const unidade = produto.unit?.abbreviation || produto.unit?.name || 'UNID';
      
      return {
        cProd: produto.sku || produto.id.toString().slice(0, 8), // Código do produto (SKU cadastrado no produto)
        cEAN: produto.barcode || 'SEM GTIN', // Código de barras (EAN) (cadastrado no produto, se não houver use SEM GTIN)
        xProd: produto.name.substring(0, 120), // Descrição do produto (cadastrado no produto) - Limite de 120 caracteres
        NCM: produto.ncm?.replace(/\D/g, ''), // Nomenclatura Comum do Mercosul (cadastrado no produto)
        CFOP: cfop, // Código Fiscal de Operações (cadastrado no produto - estadual ou interestadual)
        uCom: unidade, // Unidade comercial (cadastrado no produto)
        qCom: item.quantity.toFixed(4), // Quantidade comercial (quantidade do produto na venda)
        vUnCom: item.unitPrice.toFixed(10), // Valor unitário comercial (valor do produto na venda)
        vProd: item.total.toFixed(2), // Valor total bruto do produto (total da soma dos produtos quantidade)
        cEANTrib: produto.barcode || 'SEM GTIN', // Código de barras tributável (cadastrado no produto, se não houver use SEM GTIN)
        uTrib: unidade, // Unidade tributável (usa o mesmo que uCom)
        qTrib: item.quantity.toFixed(4), // Quantidade tributável (mesma quantidade de qCom)
        vUnTrib: item.unitPrice.toFixed(10), // Valor unitário tributável (valor unitário do produto na venda)
        vDesc: item.discount ? item.discount.toFixed(2) : undefined, // Valor do desconto (se houver)
        indTot: '1', // Indica se o valor do item entra no valor total da NF-e (1=Sim)
      };
    });

    NFe.tagProd(produtos);
  }

  /**
   * Impostos - ICMS, PIS, COFINS (usa dados reais cadastrados no BD)
   * Todos os impostos vêm do cadastro de cada produto
   */
  private preencherImpostos(NFe: Make, sale: any): void {
    const company = sale.company;
    const isSimples = company.regimeTributario === 'SIMPLES_NACIONAL' || company.taxRegime === 'SIMPLES_NACIONAL';

    sale.items.forEach((item, index) => {
      const produto = item.product;

      // ===== ICMS =====
      if (isSimples) {
        // ICMS para Simples Nacional (CSOSN cadastrado no produto)
        NFe.tagProdICMSSN(index, {
          orig: produto.origin || produto.origem || '0', // Origem da mercadoria (cadastrado no produto)
          CSOSN: produto.csosn || '102', // CSOSN (cadastrado no produto) - 102 = Tributada sem permissão de crédito, 400 = Não tributada
        });
      } else {
        // ICMS para Regime Normal (CST cadastrado no produto)
        NFe.tagProdICMS(index, {
          orig: produto.origin || produto.origem || '0', // Origem da mercadoria (cadastrado no produto)
          CST: produto.icmsCst || produto.cstIcms || '00', // CST do ICMS (cadastrado no produto)
          modBC: produto.icmsModBc || produto.modBcIcms || '3', // Modalidade de determinação da BC (cadastrado no produto)
          vBC: (item.total * ((produto.icmsRate || produto.aliqIcms || 0) / 100)).toFixed(2), // Base de cálculo (calculado)
          pICMS: (produto.icmsRate || produto.aliqIcms || 0).toFixed(2), // Alíquota do ICMS (cadastrado no produto)
          vICMS: (item.total * ((produto.icmsRate || produto.aliqIcms || 0) / 100)).toFixed(2), // Valor do ICMS (calculado)
        });
      }

      // ===== PIS =====
      // PIS (CST e alíquota cadastrados no produto)
      const pisCst = produto.pisCst || produto.cstPis || '49'; // CST 49 = Outras operações de saída
      const pisRate = produto.pisRate || produto.aliqPis || 0;
      const pisVBC = pisRate > 0 ? item.total.toFixed(2) : undefined;
      const pisPAliq = pisRate > 0 ? pisRate.toFixed(2) : undefined;
      const pisValor = pisRate > 0 ? (item.total * pisRate / 100).toFixed(2) : '0.00';

      NFe.tagProdPIS(index, {
        CST: pisCst, // CST do PIS (cadastrado no produto)
        vBC: pisVBC, // Base de cálculo do PIS (calculado se houver alíquota)
        pPIS: pisPAliq, // Alíquota do PIS (cadastrado no produto)
        vPIS: pisValor, // Valor do PIS (calculado)
        qBCProd: 0, // Quantidade vendida (usado em casos específicos)
        vAliqProd: 0, // Alíquota por unidade (usado em casos específicos)
      });

      // ===== COFINS =====
      // COFINS (CST e alíquota cadastrados no produto)
      const cofinsCst = produto.cofinsCst || produto.cstCofins || '49'; // CST 49 = Outras operações de saída
      const cofinsRate = produto.cofinsRate || produto.aliqCofins || 0;
      const cofinsVBC = cofinsRate > 0 ? item.total.toFixed(2) : undefined;
      const cofinsPAliq = cofinsRate > 0 ? cofinsRate.toFixed(2) : undefined;
      const cofinsValor = cofinsRate > 0 ? (item.total * cofinsRate / 100).toFixed(2) : '0.00';

      NFe.tagProdCOFINS(index, {
        CST: cofinsCst, // CST do COFINS (cadastrado no produto)
        vBC: cofinsVBC, // Base de cálculo do COFINS (calculado se houver alíquota)
        pCOFINS: cofinsPAliq, // Alíquota do COFINS (cadastrado no produto)
        vCOFINS: cofinsValor, // Valor do COFINS (calculado)
        qBCProd: 0, // Quantidade vendida (usado em casos específicos)
        vAliqProd: 0, // Alíquota por unidade (usado em casos específicos)
      });

      // ===== IPI ===== (Opcional - se cadastrado no produto)
      if (produto.ipiCst && produto.ipiRate) {
        const ipiValor = (item.total * produto.ipiRate / 100).toFixed(2);
        
        // Nota: A biblioteca pode não ter suporte direto para IPI, 
        // mas seguindo o padrão, seria algo como:
        // NFe.tagProdIPI(index, {
        //   CST: produto.ipiCst,
        //   vBC: item.total.toFixed(2),
        //   pIPI: produto.ipiRate.toFixed(2),
        //   vIPI: ipiValor,
        // });
      }

      // ===== IBS/CBS ===== (Reforma Tributária - Opcional)
      // O grupo IBS/CBS (Imposto sobre Bens e Serviços / Contribuição sobre Bens e Serviços) 
      // é parte da Reforma Tributária e pode não ser obrigatório dependendo da data de vigência
      // 
      // Nota: Estes campos geralmente não estão cadastrados no produto ainda.
      // Quando a Reforma Tributária entrar em vigor, será necessário adicionar campos no modelo Product:
      // - ibsCst: String? // CST do IBS
      // - ibsRate: Decimal? // Alíquota do IBS
      // - cbsRate: Decimal? // Alíquota do CBS
      // - cClassTrib: String? // Código da classificação tributária
      //
      // Exemplo de implementação futura:
      // if (produto.ibsCst && produto.cClassTrib) {
      //   NFe.tagProdIBSCBS(index, {
      //     CST: produto.ibsCst,
      //     cClassTrib: produto.cClassTrib,
      //     gIBSCBS: {
      //       vBC: item.total.toFixed(2),
      //       gIBSUF: {
      //         pIBSUF: produto.ibsRate?.toFixed(2) || "0.00",
      //         vIBSUF: (item.total * (produto.ibsRate || 0) / 100).toFixed(2),
      //       },
      //       gIBSMun: {
      //         pIBSMun: "0.0000",
      //         vIBSMun: "0.00",
      //       },
      //       vIBS: (item.total * (produto.ibsRate || 0) / 100).toFixed(2),
      //       gCBS: {
      //         pCBS: produto.cbsRate?.toFixed(2) || "0.00",
      //         vCBS: (item.total * (produto.cbsRate || 0) / 100).toFixed(2),
      //       },
      //     },
      //   });
      // }
    });
  }

  /**
   * Tag total - Totais da NF-e
   */
  private preencherTotal(NFe: Make): void {
    // tagTotal() calcula automaticamente os totais se não passar parâmetros
    // Ou podemos passar um objeto vazio para usar os valores calculados
    NFe.tagTotal({});
  }

  /**
   * Tag transp - Transporte (usa dados reais cadastrados no BD)
   * Modalidade de frete vem do cadastro da venda
   */
  private preencherTransporte(NFe: Make, sale: any): void {
    NFe.tagTransp({
      modFrete: sale.shippingModality?.toString() || '9', // Modalidade do frete (cadastrada na venda): 0=Emitente, 1=Destinatário, 2=Terceiros, 9=Sem frete
    });
  }

  /**
   * Tag pag - Pagamento (usa dados reais cadastrados no BD)
   * Forma de pagamento e valores vêm do cadastro da venda
   */
  private preencherPagamento(NFe: Make, sale: any): void {
    // Mapeia a forma de pagamento cadastrada na venda para código da NF-e
    const formaPagamento = this.mapearFormaPagamento(sale.paymentMethod?.type);
    
    // Determina indicador de pagamento: 0=À vista, 1=A prazo
    const indPag = sale.installments > 1 ? '1' : '0'; // Se tem mais de 1 parcela, é a prazo
    
    NFe.tagDetPag([
      {
        indPag: indPag, // Indicador de pagamento (0=À vista, 1=A prazo) (calculado com base nas parcelas da venda)
        tPag: formaPagamento, // Tipo de pagamento (cadastrado na venda): 01=Dinheiro, 03=Cartão Crédito, 15=Boleto, 17=PIX, etc.
        vPag: sale.totalAmount.toFixed(2), // Valor do pagamento (total da venda cadastrado)
      },
    ]);

    NFe.tagTroco('0.00'); // Valor do troco (sempre 0.00)
  }

  /**
   * Tag infRespTec - Responsável Técnico (usa dados reais cadastrados no BD)
   * Informações do responsável técnico pelo sistema vêm do cadastro da empresa
   */
  private preencherResponsavelTecnico(NFe: Make, company: any): void {
    NFe.tagInfRespTec({
      CNPJ: (company.respTecCNPJ || company.cnpj)?.replace(/\D/g, ''), // CNPJ do responsável técnico (cadastrado na empresa)
      xContato: company.respTecContato || company.responsibleName || 'Suporte Técnico', // Nome do contato (cadastrado na empresa)
      email: company.respTecEmail || company.responsibleEmail || company.email || 'contato@empresa.com', // Email do responsável técnico (cadastrado na empresa)
      fone: (company.respTecFone || company.responsiblePhone || company.telefone || company.celular || '0000000000').replace(/\D/g, ''), // Telefone (cadastrado na empresa)
    });
  }

  /**
   * Mapeia o tipo de pagamento do sistema para o código da NF-e
   */
  private mapearFormaPagamento(tipo: string): string {
    const mapa = {
      DINHEIRO: '01',
      CHEQUE: '02',
      CARTAO_CREDITO: '03',
      CARTAO_DEBITO: '04',
      CREDITO_LOJA: '05',
      VALE_ALIMENTACAO: '10',
      VALE_REFEICAO: '11',
      VALE_PRESENTE: '12',
      VALE_COMBUSTIVEL: '13',
      BOLETO: '15',
      PIX: '17',
      TRANSFERENCIA: '18',
      CASHBACK: '19',
      SEM_PAGAMENTO: '90',
      OUTROS: '99',
    };

    return mapa[tipo] || '99';
  }

  /**
   * Obtém código da UF
   */
  private obterCodigoUF(uf: string): string {
    const codigos = {
      AC: '12', AL: '27', AP: '16', AM: '13', BA: '29', CE: '23', DF: '53',
      ES: '32', GO: '52', MA: '21', MT: '51', MS: '50', MG: '31', PA: '15',
      PB: '25', PR: '41', PE: '26', PI: '22', RJ: '33', RN: '24', RS: '43',
      RO: '11', RR: '14', SC: '42', SP: '35', SE: '28', TO: '17',
    };
    return codigos[uf] || '35';
  }

  /**
   * Obtém código do município (exemplo simplificado - idealmente usar tabela IBGE)
   */
  private obterCodigoMunicipio(cidade: string, uf: string): string {
    // Aqui você deve implementar uma busca na tabela IBGE
    // Por enquanto, retornar um código genérico
    return '9999999';
  }

  /**
   * Determina se a operação é interna, interestadual ou exterior
   * 1 = Operação interna (dentro do estado)
   * 2 = Operação interestadual (outro estado)
   * 3 = Operação com exterior (outro país)
   */
  private determinarDestinoOperacao(ufEmitente: string, customer: any): string {
    // Buscar endereço do cliente (priorizar BILLING, depois MAIN, depois primeiro)
    const enderecoCliente = 
      customer.addresses.find(a => a.type === 'BILLING') ||
      customer.addresses.find(a => a.type === 'MAIN') || 
      customer.addresses[0];
    
    if (!enderecoCliente) {
      return '1'; // Default: Interna
    }

    // Verificar se é operação com exterior (país diferente de Brasil)
    if (enderecoCliente.country && enderecoCliente.country !== 'Brasil' && enderecoCliente.country !== 'BR') {
      return '3'; // Exterior
    }
    
    // Verificar se é operação interna ou interestadual
    const ufCliente = enderecoCliente.state || '';
    const ufEmpresa = ufEmitente || 'SP';
    
    if (ufCliente.toUpperCase() === ufEmpresa.toUpperCase()) {
      return '1'; // Interna (mesmo estado)
    } else {
      return '2'; // Interestadual (estados diferentes)
    }
  }

  /**
   * Obtém o CRT (Código de Regime Tributário)
   */
  private obterCRT(regimeTributario: string): string {
    if (!regimeTributario) return '3';
    
    const regime = regimeTributario.toUpperCase();
    
    if (regime.includes('SIMPLES')) return '1';
    if (regime.includes('MEI')) return '1';
    if (regime.includes('PRESUMIDO')) return '3';
    if (regime.includes('REAL')) return '3';
    
    return '3'; // Padrão: Regime Normal
  }
}
