import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CompaniesService } from '../../companies/companies.service';
import { NFeSefazService } from './nfe-sefaz.service';
import { EmitirNFeDto } from '../dto/emitir-nfe.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class NFeService {
  constructor(
    private prisma: PrismaService,
    private companiesService: CompaniesService,
    private nfeSefaz: NFeSefazService,
  ) {}

  /**
   * Emite uma NF-e enviando os dados para a API externa
   */
  async emitirNFe(companyId: string, dto: EmitirNFeDto) {
    console.log('🏁 [NF-e] ===== INICIANDO EMISSÃO DE NF-e =====');
    console.log('📋 [NF-e] Dados recebidos:', JSON.stringify(dto, null, 2));
    
    // 1. Buscar todos os dados necessários do banco de dados
    console.log('� [NF-e] Buscando dados da venda, empresa e cliente...');
    const sale = await this.prisma.sale.findUnique({
      where: { id: dto.saleId },
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
        company: true,
      },
    });

    if (!sale) {
      throw new Error('Venda não encontrada');
    }

    if (!sale.company) {
      throw new Error('Empresa não encontrada');
    }

    console.log('✅ [NF-e] Dados da venda carregados');
    console.log('   - Empresa:', sale.company.razaoSocial);
    console.log('   - Cliente:', sale.customer.name);
    console.log('   - Produtos:', sale.items.length);

    // 2. Obter próximo número da NF-e
    const numeroNFe = dto.numero || await this.obterProximoNumero(companyId, dto.serie || '1');
    const cNF = Math.random().toString().slice(2, 10);

    // 3. Determinar destino da operação (interno ou interestadual)
    const enderecoCliente = sale.customer.addresses.find(a => a.type === 'BILLING') 
                         || sale.customer.addresses.find(a => a.type === 'MAIN') 
                         || sale.customer.addresses[0];

    if (!enderecoCliente) {
      throw new Error('Cliente sem endereço cadastrado');
    }

    const idDest = sale.company.estado === enderecoCliente.state ? '1' : '2';
    const isInterestadual = idDest === '2';

    // 4. Ler certificado digital como base64
    if (!sale.company.certificadoDigitalPath) {
      throw new Error('Empresa não possui certificado digital cadastrado');
    }
    
    const certificatePath = path.resolve(sale.company.certificadoDigitalPath);
    const certificadoPfxBuffer = fs.readFileSync(certificatePath);
    const certificadoPfxBase64 = certificadoPfxBuffer.toString('base64');
    
    // Descriptografar senha do certificado
    const senhaDescriptografada = await this.companiesService.getDecryptedCertificatePassword(sale.company.id);

    // 5. Montar payload para a API externa
    const payload = {
      config: {
        mod: '55',
        tpAmb: sale.company.ambienteFiscal === 'Homologacao' ? 2 : 1, // 1=Produção, 2=Homologação
        UF: sale.company.estado || 'SP',
        versao: '4.00',
        timeout: 10,
      },
      certificado: {
        pfxBase64: certificadoPfxBase64,
        senha: senhaDescriptografada,
      },
      ide: {
        cUF: this.obterCodigoUF(sale.company.estado || 'SP'),
        cNF: cNF,
        natOp: dto.naturezaOperacao || 'VENDA',
        mod: dto.modelo || '55',
        serie: dto.serie || '1',
        nNF: numeroNFe.toString(),
        dhEmi: new Date().toISOString(),
        tpNF: dto.tipoOperacao || '1',
        idDest: idDest,
        cMunFG: sale.company.codigoMunicipioIBGE || '3550308',
        tpImp: '1',
        tpEmis: '1',
        cDV: '1',
        tpAmb: (sale.company.ambienteFiscal === 'Homologacao' ? 2 : 1).toString(), // 1=Produção, 2=Homologação
        finNFe: dto.finalidade || '1',
        indFinal: dto.consumidorFinal || '0',
        indPres: dto.presencaComprador || '1',
        indIntermed: '0',
        procEmi: '0',
        verProc: '4.13',
      },
      emit: {
        CNPJ: sale.company.cnpj.replace(/\D/g, ''),
        xNome: this.removerAcentuacao(sale.company.razaoSocial),
        xFant: this.removerAcentuacao(sale.company.nomeFantasia || sale.company.razaoSocial),
        IE: sale.company.inscricaoEstadual?.replace(/\D/g, ''),
        CRT: this.obterCRT(sale.company.regimeTributario || ''),
      },
      enderEmit: {
        xLgr: this.removerAcentuacao(sale.company.logradouro || ''),
        nro: sale.company.numero || 'S/N',
        xCpl: sale.company.complemento ? this.removerAcentuacao(sale.company.complemento) : undefined,
        xBairro: this.removerAcentuacao(sale.company.bairro || ''),
        cMun: sale.company.codigoMunicipioIBGE || '3550308',
        xMun: this.removerAcentuacao(sale.company.cidade || ''),
        UF: sale.company.estado || '',
        CEP: sale.company.cep?.replace(/\D/g, '') || '',
        cPais: '1058',
        xPais: 'BRASIL',
        fone: sale.company.telefone?.replace(/\D/g, '') || sale.company.celular?.replace(/\D/g, '') || undefined,
      },
      dest: sale.customer.cnpj
        ? {
            CNPJ: sale.customer.cnpj.replace(/\D/g, ''),
            xNome: this.removerAcentuacao(sale.customer.companyName || sale.customer.name),
            indIEDest: sale.customer.stateRegistrationExempt ? '2' : '1',
            IE: !sale.customer.stateRegistrationExempt && sale.customer.stateRegistration 
                ? sale.customer.stateRegistration.replace(/\D/g, '') 
                : undefined,
          }
        : {
            CPF: sale.customer.cpf?.replace(/\D/g, ''),
            xNome: this.removerAcentuacao(sale.customer.name),
            indIEDest: '9',
          },
      enderDest: {
        xLgr: this.removerAcentuacao(enderecoCliente.street),
        nro: enderecoCliente.number,
        xCpl: enderecoCliente.complement ? this.removerAcentuacao(enderecoCliente.complement) : undefined,
        xBairro: this.removerAcentuacao(enderecoCliente.neighborhood),
        cMun: enderecoCliente.ibgeCode || '3550308',
        xMun: this.removerAcentuacao(enderecoCliente.city),
        UF: enderecoCliente.state,
        CEP: enderecoCliente.zipCode.replace(/\D/g, ''),
        cPais: '1058',
        xPais: 'BRASIL',
        fone: sale.customer.phone?.replace(/\D/g, '') || sale.customer.mobile?.replace(/\D/g, '') || undefined,
      },
      produtos: sale.items.map((item, index) => {
        const produto = item.product;
        const cfop = isInterestadual
          ? (produto.cfopInterestadual || produto.cfop || '6102')
          : (produto.cfopEstadual || produto.cfop || '5102');
        const unidade = produto.unit?.abbreviation || produto.unit?.name || 'UNID';
        
        // Gerar código numérico: usar SKU se for numérico, senão usar índice + 1
        const codigoProduto = produto.sku && /^\d+$/.test(produto.sku) 
          ? produto.sku 
          : (index + 1).toString();
        
        return {
          cProd: codigoProduto,
          cEAN: produto.barcode || 'SEM GTIN',
          xProd: this.removerAcentuacao(produto.name.substring(0, 120)),
          NCM: produto.ncm?.replace(/\D/g, ''),
          CFOP: cfop,
          uCom: unidade,
          qCom: item.quantity.toFixed(4),
          vUnCom: item.unitPrice.toFixed(10),
          vProd: item.total.toFixed(2),
          cEANTrib: produto.barcode || 'SEM GTIN',
          uTrib: unidade,
          qTrib: item.quantity.toFixed(4),
          vUnTrib: item.unitPrice.toFixed(10),
          vDesc: item.discount ? item.discount.toFixed(2) : undefined,
          indTot: '1',
          impostos: {
            ICMS: {
              orig: '0',
              CSOSN: '400',
            },
            PIS: {
              CST: '49',
              qBCProd: 0,
              vAliqProd: 0,
              vPIS: 0,
            },
            COFINS: {
              CST: '49',
              qBCProd: 0,
              vAliqProd: 0,
              vCOFINS: 0,
            },
            IBSCBS: {
              CST: '000',
              cClassTrib: '000001',
              gIBSCBS: {
                vBC: item.total.toFixed(2),
                gIBSUF: {
                  pIBSUF: '0.10',
                  vIBSUF: '0.10',
                },
                gIBSMun: {
                  pIBSMun: '0.0000',
                  vIBSMun: '0.00',
                },
                vIBS: '0.10',
                gCBS: {
                  pCBS: '0.90',
                  vCBS: '0.90',
                },
              },
            },
          },
        };
      }),
      transporte: {
        modFrete: parseInt(dto.modalidadeFrete || '9'),
      },
      pagamento: [
        {
          indPag: sale.installments > 1 ? 1 : 0,
          tPag: this.mapearFormaPagamento(sale.paymentMethod?.sefazCode || 'OUTROS'),
          vPag: sale.totalAmount.toFixed(2),
        },
      ],
      troco: '0.00',
      respTec: {
        CNPJ: (sale.company.respTecCNPJ || sale.company.cnpj)?.replace(/\D/g, ''),
        xContato: this.removerAcentuacao(sale.company.respTecContato || sale.company.responsibleName || 'Suporte Tecnico'),
        email: sale.company.respTecEmail || sale.company.responsibleEmail || sale.company.email || 'contato@empresa.com',
        fone: (sale.company.respTecFone || sale.company.responsiblePhone || sale.company.telefone || sale.company.celular || '0000000000').replace(/\D/g, ''),
      },
    };

    console.log('� [NF-e] Payload montado. Enviando para API externa...');
    console.log('🌐 [NF-e] URL: http://localhost:4001/emitir-nfe');

    // 6. Enviar para API externa
    try {
      const response = await fetch('http://localhost:4001/emitir-nfe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log('❌ [NF-e] Erro na API externa:', errorData);
        throw new Error(`Erro na API externa: ${errorData.error || errorData.message}`);
      }

      const resultado = await response.json();
      console.log('✅ [NF-e] Resposta recebida da API externa');
      console.log(JSON.stringify(resultado, null, 2));

      // 7. Salvar no banco de dados se autorizada
      if (resultado.success && resultado.resultado?.protNFe?.[0]?.infProt?.[0]?.cStat?.[0] === '100') {
        console.log('✅ [NF-e] NF-e AUTORIZADA! Salvando no banco...');
        await this.salvarNFeNoBanco(companyId, dto.saleId, {
          chaveAcesso: resultado.resultado.protNFe[0].infProt[0].chNFe[0],
          protocolo: resultado.resultado.protNFe[0].infProt[0].nProt[0],
          dataAutorizacao: resultado.resultado.protNFe[0].infProt[0].dhRecbto[0],
          status: 'AUTORIZADA',
        });
      }

      return resultado;
    } catch (error) {
      console.log('💥 [NF-e] Erro ao comunicar com API externa!');
      console.log('❌ [NF-e] Mensagem:', error.message);
      console.log('❌ [NF-e] Stack:', error.stack);
      throw error;
    }
  }

  /**
   * Remove acentuação de uma string
   */
  private removerAcentuacao(texto: string): string {
    if (!texto) return texto;
    
    return texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[çÇ]/g, (match) => match === 'ç' ? 'c' : 'C');
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
   * Obtém o CRT (Código de Regime Tributário)
   */
  private obterCRT(regimeTributario: string): string {
    if (!regimeTributario) return '3';
    const regime = regimeTributario.toUpperCase();
    if (regime.includes('SIMPLES')) return '1';
    if (regime.includes('MEI')) return '1';
    if (regime.includes('PRESUMIDO')) return '2';
    if (regime.includes('REAL')) return '3';
    return '3';
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
   * Consulta uma NF-e pela chave de acesso
   */
  async consultarNFe(companyId: string, chaveAcesso: string) {
    return this.nfeSefaz.consultarNFe(companyId, chaveAcesso);
  }

  /**
   * Cancela uma NF-e
   */
  async cancelarNFe(
    companyId: string,
    nfeId: string,
    justificativa: string,
  ) {
    const nfe = await this.prisma.nFe.findFirst({
      where: {
        id: nfeId,
        companyId,
      },
    });

    if (!nfe) {
      throw new Error('NF-e não encontrada');
    }

    if (nfe.status !== 'AUTHORIZED') {
      throw new Error('Apenas NF-e autorizadas podem ser canceladas');
    }

    if (!nfe.chaveAcesso || !nfe.protocoloAutorizacao) {
      throw new Error('NF-e sem chave de acesso ou protocolo');
    }

    const resultado = await this.nfeSefaz.cancelarNFe(
      companyId,
      nfe.chaveAcesso,
      nfe.protocoloAutorizacao,
      justificativa,
    );

    // Atualizar status no banco
    await this.prisma.nFe.update({
      where: { id: nfeId },
      data: {
        status: 'CANCELED',
        canceladaEm: new Date(),
        motivoCancelamento: justificativa,
      },
    });

    return resultado;
  }

  /**
   * Consulta o status do serviço da SEFAZ
   */
  async consultarStatusServico(companyId: string) {
    return this.nfeSefaz.consultarStatusServico(companyId);
  }

  /**
   * Lista todas as NF-e de uma empresa
   */
  async listarNFes(companyId: string, filtros?: any) {
    const where: any = { companyId };

    if (filtros?.status) {
      where.status = filtros.status;
    }

    if (filtros?.saleId) {
      where.saleId = filtros.saleId;
    }

    if (filtros?.dataInicio && filtros?.dataFim) {
      where.emitidaEm = {
        gte: new Date(filtros.dataInicio),
        lte: new Date(filtros.dataFim),
      };
    }

    return this.prisma.nFe.findMany({
      where,
      include: {
        sale: {
          include: {
            customer: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Busca uma NF-e por ID
   */
  async buscarNFe(companyId: string, nfeId: string) {
    return this.prisma.nFe.findFirst({
      where: {
        id: nfeId,
        companyId,
      },
      include: {
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
      },
    });
  }

  /**
   * Salva um arquivo no sistema de arquivos
   */
  private async salvarArquivo(
    companyId: string,
    saleId: string,
    nomeArquivo: string,
    conteudo: string | Buffer,
  ): Promise<string> {
    const uploadsDir = path.resolve(process.cwd(), 'uploads', 'nfe', companyId, saleId);

    // Criar diretórios se não existirem
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, nomeArquivo);
    fs.writeFileSync(filePath, conteudo);

    return filePath;
  }

  /**
   * Salva os dados da NF-e no banco de dados
   */
  private async salvarNFeNoBanco(companyId: string, saleId: string, resultado: any) {
    // Buscar dados da venda para preencher campos obrigatórios
    const sale = await this.prisma.sale.findUnique({
      where: { id: saleId },
      include: {
        customer: {
          include: {
            addresses: true,
          },
        },
        company: true,
      },
    });

    if (!sale || !sale.customer) {
      throw new Error('Venda ou cliente não encontrados');
    }

    const endereco = sale.customer.addresses.find(addr => addr.type === 'BILLING') || sale.customer.addresses[0];

    if (!endereco) {
      throw new Error('Cliente sem endereço cadastrado');
    }

    // Extrair dados da chave de acesso
    const chave = resultado.chaveAcesso;
    const cUF = chave.substring(0, 2);
    const serie = chave.substring(22, 25);
    const numero = parseInt(chave.substring(25, 34));
    const cNF = chave.substring(35, 43);
    const cDV = chave.substring(43, 44);

    // Determinar se é operação interna ou interestadual
    const idDest = sale.company.estado === endereco.state ? 1 : 2;

    await this.prisma.nFe.create({
      data: {
        companyId,
        saleId,
        destinatarioId: sale.customer.id,
        
        // Identificação
        cUF,
        cNF,
        numero,
        serie,
        modelo: '55',
        chaveAcesso: resultado.chaveAcesso,
        cDV,
        
        // Tipo de operação
        naturezaOperacao: 'VENDA',
        tipoOperacao: 1,
        finalidade: 1,
        idDest,
        cMunFG: sale.company.codigoMunicipioIBGE || '',
        tpImp: 1,
        tpEmis: 1,
        indFinal: 1,
        indPres: 1,
        indIntermed: 0,
        procEmi: 0,
        verProc: '1.0',
        
        // Destinatário
        destinatarioNome: sale.customer.name || '',
        destinatarioCnpjCpf: sale.customer.cnpj || sale.customer.cpf || '',
        destinatarioIe: sale.customer.stateRegistration || '',
        indIEDest: sale.customer.stateRegistration ? 1 : 9,
        destinatarioEmail: sale.customer.email || '',
        destinatarioTelefone: sale.customer.phone || '',
        
        // Endereço destinatário
        destLogradouro: endereco.street,
        destNumero: endereco.number,
        destComplemento: endereco.complement || '',
        destBairro: endereco.neighborhood,
        destCidade: endereco.city,
        destCodigoMunicipio: endereco.ibgeCode || '',
        destEstado: endereco.state,
        destCep: endereco.zipCode,
        destCodigoPais: '1058',
        destPais: 'Brasil',
        
        // Valores
        valorProdutos: sale.totalAmount,
        valorFrete: 0,
        valorSeguro: 0,
        valorDesconto: 0,
        valorOutrasDespesas: 0,
        valorII: 0,
        valorIPI: 0,
        valorIPIDevol: 0,
        valorICMS: 0,
        valorICMSDeson: 0,
        valorFCP: 0,
        valorICMSST: 0,
        valorFCPST: 0,
        valorFCPSTRet: 0,
        valorPIS: 0,
        valorCOFINS: 0,
        valorTotal: sale.totalAmount,
        
        // Frete
        modalidadeFrete: 9,
        
        // Pagamento
        indicadorPagamento: 0,
        valorPagamento: sale.totalAmount,
        valorTroco: 0,
        
        // Protocolo
        protocoloAutorizacao: resultado.protocolo,
        dataAutorizacao: new Date(resultado.dataAutorizacao),
        status: 'AUTHORIZED',
        
        // Arquivos
        xmlEnviado: resultado.xmlAssinado,
        xmlAutorizado: resultado.xmlProcessamento,
        danfePdfPath: resultado.danfe,
        
        // Datas
        dataEmissao: new Date(),
        dataSaida: new Date(),
        
        // Responsável Técnico
        respTecCNPJ: sale.company.respTecCNPJ || '',
        respTecContato: sale.company.respTecContato || '',
        respTecEmail: sale.company.respTecEmail || '',
        respTecFone: sale.company.respTecFone || '',
      },
    });
  }
}
