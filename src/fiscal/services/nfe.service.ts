import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CompaniesService } from '../../companies/companies.service';
import { NFeSefazService } from './nfe-sefaz.service';
import { EmitirNFeDto } from '../dto/emitir-nfe.dto';
import { Make } from 'node-sped-nfe';
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
   * Emite uma NF-e gerando XML localmente e enviando para SEFAZ
   */
  async emitirNFe(companyId: string, dto: EmitirNFeDto) {
    console.log('🏁 [NF-e] ===== INICIANDO EMISSÃO DE NF-e =====');
    console.log('📋 [NF-e] Dados recebidos:', JSON.stringify(dto, null, 2));
    
    // 1. Buscar todos os dados necessários do banco de dados
    console.log('🔍 [NF-e] Buscando dados da venda, empresa e cliente...');
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
    
    // LOG DE DEBUG: Verificar dados da venda
    console.log('\n🔍 [DEBUG] Dados completos da venda:');
    console.log('   - subtotal:', sale.subtotal, '(tipo:', typeof sale.subtotal, ')');
    console.log('   - totalAmount:', sale.totalAmount, '(tipo:', typeof sale.totalAmount, ')');
    console.log('   - installments:', sale.installments);
    
    console.log('\n🔍 [DEBUG] Itens da venda:');
    sale.items.forEach((item, index) => {
      console.log(`   Item ${index + 1}:`);
      console.log(`     - productId: ${item.productId}`);
      console.log(`     - productName: ${item.productName}`);
      console.log(`     - quantity: ${item.quantity} (tipo: ${typeof item.quantity})`);
      console.log(`     - unitPrice: ${item.unitPrice} (tipo: ${typeof item.unitPrice})`);
      console.log(`     - discount: ${item.discount} (tipo: ${typeof item.discount})`);
      console.log(`     - total: ${item.total} (tipo: ${typeof item.total})`);
    });

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

    console.log('\n📝 [NF-e] ETAPA 1: Gerando XML da NF-e...');
    
    // 4. Criar instância do Make para gerar XML
    const NFe = new Make();
    
    // A ORDEM DAS CHAMADAS É CRÍTICA PARA A VALIDAÇÃO DO SCHEMA PELA SEFAZ
    
    // 4.1. Informações da NF-e
    NFe.tagInfNFe({ Id: null, versao: '4.00' });
    
    // 4.2. Identificação da NF-e
    const tpAmb = sale.company.ambienteFiscal === 'Homologacao' ? '2' : '1';
    console.log(`   - Código numérico (cNF): ${cNF}`);
    console.log(`   - Nota Fiscal: Série ${dto.serie || '1'} / Número ${numeroNFe}`);
    console.log(`   - Ambiente: ${tpAmb === '1' ? 'PRODUÇÃO' : 'HOMOLOGAÇÃO'}`);
    
    NFe.tagIde({
      cUF: this.obterCodigoUF(sale.company.estado || 'SP'),
      cNF: cNF,
      natOp: this.removerAcentuacao(dto.naturezaOperacao || 'VENDA'),
      mod: dto.modelo || '55',
      serie: dto.serie || '1',
      nNF: numeroNFe.toString(),
      dhEmi: NFe.formatData(),
      tpNF: dto.tipoOperacao || '1',
      idDest: idDest,
      cMunFG: sale.company.codigoMunicipioIBGE || '3550308',
      tpImp: '1',
      tpEmis: '1',
      cDV: '1',
      tpAmb: tpAmb,
      finNFe: dto.finalidade || '1',
      indFinal: dto.consumidorFinal || '0',
      indPres: dto.presencaComprador || '1',
      indIntermed: '0',
      procEmi: '0',
      verProc: '4.13',
    });
    
    // 4.3. Emitente
    NFe.tagEmit({
      CNPJ: sale.company.cnpj.replace(/\D/g, ''),
      xNome: this.removerAcentuacao(sale.company.razaoSocial),
      xFant: this.removerAcentuacao(sale.company.nomeFantasia || sale.company.razaoSocial),
      IE: sale.company.inscricaoEstadual?.replace(/\D/g, ''),
      CRT: this.obterCRT(sale.company.regimeTributario || ''),
    });
    
    NFe.tagEnderEmit({
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
    });
    
    console.log(`   ✅ Dados do emitente adicionados`);
    
    // 4.4. Destinatário
    const destData: any = sale.customer.cnpj
      ? {
          CNPJ: sale.customer.cnpj.replace(/\D/g, ''),
          xNome: this.removerAcentuacao(sale.customer.companyName || sale.customer.name || 'Cliente'),
          indIEDest: sale.customer.stateRegistrationExempt ? '2' : '1',
          IE: !sale.customer.stateRegistrationExempt && sale.customer.stateRegistration 
              ? sale.customer.stateRegistration.replace(/\D/g, '') 
              : undefined,
        }
      : {
          CPF: sale.customer.cpf?.replace(/\D/g, ''),
          xNome: this.removerAcentuacao(sale.customer.name || 'Cliente'),
          indIEDest: '9',
        };
    
    NFe.tagDest(destData);
    
    NFe.tagEnderDest({
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
    });
    
    console.log(`   ✅ Dados do destinatário adicionados`);
    
    // 4.5. Produtos (SEM OS IMPOSTOS)
    console.log('\n📦 [NF-e] Processando produtos...');
    const produtos = sale.items.map((item, index) => {
      const produto = item.product;
      const cfop = isInterestadual
        ? (produto.cfopInterestadual || produto.cfop || '6102')
        : (produto.cfopEstadual || produto.cfop || '5102');
      const unidade = produto.unit?.abbreviation || produto.unit?.name || 'UNID';
      
      const codigoProduto = produto.sku && /^\d+$/.test(produto.sku) 
        ? produto.sku 
        : (index + 1).toString();
      
      // Garantir que valores numéricos sejam válidos (nunca null, undefined ou NaN)
      const quantity = this.garantirNumero(item.quantity);
      const unitPrice = this.garantirNumero(item.unitPrice);
      const discount = this.garantirNumero(item.discount);
      const total = this.garantirNumero(item.total);
      
      console.log(`   📦 Produto ${index + 1}: ${produto.name}`);
      console.log(`      - quantity: ${quantity}`);
      console.log(`      - unitPrice: ${unitPrice}`);
      console.log(`      - discount: ${discount}`);
      console.log(`      - total: ${total}`);
      console.log(`      - vDesc será: ${discount.toFixed(2)}`);
      
      return {
        cProd: codigoProduto,
        cEAN: produto.barcode || 'SEM GTIN',
        xProd: this.removerAcentuacao(produto.name.substring(0, 120)),
        NCM: produto.ncm?.replace(/\D/g, ''),
        CFOP: cfop,
        uCom: unidade,
        qCom: quantity.toFixed(4),
        vUnCom: unitPrice.toFixed(10),
        vProd: total.toFixed(2),
        cEANTrib: produto.barcode || 'SEM GTIN',
        uTrib: unidade,
        qTrib: quantity.toFixed(4),
        vUnTrib: unitPrice.toFixed(10),
        indTot: '1',
      };
    });
    
    console.log('\n📝 [DEBUG] Dados dos produtos para XML:');
    console.log(JSON.stringify(produtos, null, 2));
    
    NFe.tagProd(produtos);
    console.log(`   ✅ ${produtos.length} produto(s) adicionado(s)`);
    
    // 4.6. Impostos de cada produto
    console.log('   🧮 Processando impostos dos produtos...');
    for (let index = 0; index < sale.items.length; index++) {
      const item = sale.items[index];
      const produto = item.product;
      const itemTotal = this.garantirNumero(item.total);
      
      console.log(`\n   📦 Item ${index + 1}: ${produto.name}`);
      console.log(`      💰 Valor total: R$ ${itemTotal.toFixed(2)}`);
      
      // ===== ICMS =====
      const crt = this.obterCRT(sale.company.regimeTributario || '');
      const origem = produto.origin || produto.origem || '0'; // 0 = Nacional
      
      if (crt === '1') {
        // Simples Nacional - usar CSOSN
        const csosn = produto.csosn || '400'; // 400 = Não tributado pelo Simples Nacional
        console.log(`      🏷️  ICMS: CSOSN ${csosn} (Simples Nacional)`);
        NFe.tagProdICMSSN(index, { orig: origem, CSOSN: csosn });
      } else {
        // Regime Normal - usar CST
        const icmsCst = produto.icmsCst || produto.cstIcms || '41'; // 41 = Não tributado
        const icmsRate = this.garantirNumero(produto.icmsRate || produto.aliqIcms);
        console.log(`      🏷️  ICMS: CST ${icmsCst}, Alíquota ${icmsRate.toFixed(2)}%`);
        
        if (icmsRate > 0) {
          const vBC = itemTotal;
          const vICMS = vBC * (icmsRate / 100);
          NFe.tagProdICMS(index, {
            orig: origem,
            CST: icmsCst,
            modBC: produto.icmsModBc || produto.modBcIcms || '3', // 3 = Valor da operação
            vBC: vBC.toFixed(2),
            pICMS: icmsRate.toFixed(2),
            vICMS: vICMS.toFixed(2),
          });
        } else {
          NFe.tagProdICMS(index, { orig: origem, CST: icmsCst });
        }
      }
      
      // ===== PIS =====
      const pisCst = produto.pisCst || produto.cstPis || '49'; // 49 = Outras operações de saída
      const pisRate = this.garantirNumero(produto.pisRate || produto.aliqPis);
      console.log(`      🏷️  PIS: CST ${pisCst}, Alíquota ${pisRate.toFixed(2)}%`);
      
      if (pisRate > 0) {
        const vBCPis = this.garantirNumero(produto.bcPis) || itemTotal;
        const vPIS = vBCPis * (pisRate / 100);
        NFe.tagProdPIS(index, {
          CST: pisCst,
          vBC: vBCPis.toFixed(2),
          pPIS: pisRate.toFixed(2),
          vPIS: vPIS.toFixed(2),
        });
      } else {
        NFe.tagProdPIS(index, { 
          CST: pisCst, 
          qBCProd: 0, 
          vAliqProd: 0, 
          vPIS: 0 
        });
      }
      
      // ===== COFINS =====
      const cofinsCst = produto.cofinsCst || produto.cstCofins || '49'; // 49 = Outras operações de saída
      const cofinsRate = this.garantirNumero(produto.cofinsRate || produto.aliqCofins);
      console.log(`      🏷️  COFINS: CST ${cofinsCst}, Alíquota ${cofinsRate.toFixed(2)}%`);
      
      if (cofinsRate > 0) {
        const vBCCofins = this.garantirNumero(produto.bcCofins) || itemTotal;
        const vCOFINS = vBCCofins * (cofinsRate / 100);
        NFe.tagProdCOFINS(index, {
          CST: cofinsCst,
          vBC: vBCCofins.toFixed(2),
          pCOFINS: cofinsRate.toFixed(2),
          vCOFINS: vCOFINS.toFixed(2),
        });
      } else {
        NFe.tagProdCOFINS(index, { 
          CST: cofinsCst, 
          qBCProd: 0, 
          vAliqProd: 0, 
          vCOFINS: 0 
        });
      }
      
      // ===== IBS/CBS =====
      // Usar alíquotas cadastradas na empresa
      const pIBSUF = sale.company.aliquotaIBS || 0.10; // Alíquota da empresa ou padrão 0.10%
      const pIBSMun = 0.00; // Municipal (não implementado ainda)
      const pCBS = sale.company.aliquotaCBS || 0.90; // Alíquota da empresa ou padrão 0.90%

      const vIBSUF = itemTotal * (pIBSUF / 100);
      const vIBSMun = itemTotal * (pIBSMun / 100);
      const vIBS = vIBSUF + vIBSMun;
      const vCBS = itemTotal * (pCBS / 100);

      console.log(`      🏷️  IBS/CBS:`);
      console.log(`         - vBC: R$ ${itemTotal.toFixed(2)}`);
      console.log(`         - pIBSUF: ${pIBSUF}%, vIBSUF: R$ ${vIBSUF.toFixed(2)}`);
      console.log(`         - pIBSMun: ${pIBSMun}%, vIBSMun: R$ ${vIBSMun.toFixed(2)}`);
      console.log(`         - vIBS: R$ ${vIBS.toFixed(2)}`);
      console.log(`         - pCBS: ${pCBS}%, vCBS: R$ ${vCBS.toFixed(2)}`);

      NFe.tagProdIBSCBS(index, {
        CST: '000',
        cClassTrib: '000001',
        gIBSCBS: {
          vBC: itemTotal.toFixed(2),
          gIBSUF: {
            pIBSUF: pIBSUF.toFixed(4),
            vIBSUF: vIBSUF.toFixed(2),
          },
          gIBSMun: {
            pIBSMun: pIBSMun.toFixed(4),
            vIBSMun: vIBSMun.toFixed(2),
          },
          vIBS: vIBS.toFixed(2),
          gCBS: {
            pCBS: pCBS.toFixed(4),
            vCBS: vCBS.toFixed(2),
          },
        },
      });
    }
    console.log('\n   ✅ Impostos de todos os produtos adicionados');
    
    // 4.7. Totais
    console.log('\n💰 [NF-e] Calculando totais da NF-e...');
    
    // Garantir que valores sejam numéricos válidos
    const subtotal = this.garantirNumero(sale.subtotal);
    const totalAmount = this.garantirNumero(sale.totalAmount);
    
    console.log('   💰 Valores da venda:');
    console.log(`      - Subtotal (produtos): R$ ${subtotal.toFixed(2)}`);
    console.log(`      - Total da venda (vNF): R$ ${totalAmount.toFixed(2)}`);
    
    // Calcular totais de impostos (somar todos os itens)
    let totalICMS = 0;
    let totalPIS = 0;
    let totalCOFINS = 0;
    let totalIBS = 0;
    let totalCBS = 0;
    
    for (let index = 0; index < sale.items.length; index++) {
      const item = sale.items[index];
      const produto = item.product;
      const itemTotal = this.garantirNumero(item.total);
      
      // Calcular ICMS
      const crt = this.obterCRT(sale.company.regimeTributario || '');
      if (crt !== '1') { // Não é Simples Nacional
        const icmsRate = this.garantirNumero(produto.icmsRate || produto.aliqIcms);
        if (icmsRate > 0) {
          totalICMS += itemTotal * (icmsRate / 100);
        }
      }
      
      // Calcular PIS
      const pisRate = this.garantirNumero(produto.pisRate || produto.aliqPis);
      if (pisRate > 0) {
        totalPIS += itemTotal * (pisRate / 100);
      }
      
      // Calcular COFINS
      const cofinsRate = this.garantirNumero(produto.cofinsRate || produto.aliqCofins);
      if (cofinsRate > 0) {
        totalCOFINS += itemTotal * (cofinsRate / 100);
      }
      
      // Calcular IBS/CBS
      const pIBSUF = sale.company.aliquotaIBS || 0.10;
      const pCBS = sale.company.aliquotaCBS || 0.90;
      totalIBS += itemTotal * (pIBSUF / 100);
      totalCBS += itemTotal * (pCBS / 100);
    }
    
    console.log('\n   💰 Totais de impostos calculados:');
    console.log(`      - Total ICMS: R$ ${totalICMS.toFixed(2)}`);
    console.log(`      - Total PIS: R$ ${totalPIS.toFixed(2)}`);
    console.log(`      - Total COFINS: R$ ${totalCOFINS.toFixed(2)}`);
    console.log(`      - Total IBS: R$ ${totalIBS.toFixed(2)}`);
    console.log(`      - Total CBS: R$ ${totalCBS.toFixed(2)}`);
    
    // Usar o totalAmount da venda como vNF (já inclui produtos, frete, descontos, encargos, etc)
    // A NFe não precisa detalhar cada componente, apenas informar os valores principais
    const vNF = totalAmount;
    
    console.log('\n   🧮 Totais da NF-e:');
    console.log(`      - vProd (produtos): R$ ${subtotal.toFixed(2)}`);
    console.log(`      - vNF (total): R$ ${vNF.toFixed(2)}`);
    
    // Montar objeto de totais para a NFe
    const totaisNFe = {
      // Total de produtos
      vProd: subtotal.toFixed(2),
      
      // Totais de tributos
      vICMS: totalICMS.toFixed(2),
      vPIS: totalPIS.toFixed(2),
      vCOFINS: totalCOFINS.toFixed(2),
      
      // Outros valores (todos zerados - já incluídos no totalAmount)
      vFrete: '0.00', // Frete (já incluído no totalAmount)
      vSeg: '0.00', // Seguro
      vDesc: '0.00', // Desconto (já aplicado no totalAmount)
      vOutro: '0.00', // Outras despesas (já aplicadas no totalAmount)
      vII: '0.00', // Imposto de Importação
      vIPI: '0.00', // IPI
      
      // Valor total da nota (do banco, já calculado corretamente)
      vNF: vNF.toFixed(2),
    };
    
    console.log('\n   💰 Estrutura de totais para XML:');
    console.log(JSON.stringify(totaisNFe, null, 2));
    
    NFe.tagTotal(totaisNFe);
    console.log('   ✅ Totais calculados e adicionados');
    
    // 4.8. Transporte
    console.log('\n🚚 [NF-e] Processando transporte...');
    const modalidadeFrete = sale.shippingModality || 9; // 9 = Sem frete (padrão)
    console.log(`   🚚 Modalidade de frete: ${modalidadeFrete}`);
    
    NFe.tagTransp({ modFrete: modalidadeFrete });
    console.log('   ✅ Dados de transporte adicionados');
    
    // 4.9. Pagamento
    console.log('\n💳 [NF-e] Processando pagamento...');
    
    // IMPORTANTE: vPag DEVE ser igual ao vNF (= totalAmount)
    console.log(`   💰 vNF: R$ ${vNF.toFixed(2)}`);
    console.log(`   💰 totalAmount: R$ ${totalAmount.toFixed(2)}`);
    if (Math.abs(vNF - totalAmount) > 0.01) {
      console.log(`   ⚠️  ATENÇÃO: Diferença de R$ ${Math.abs(vNF - totalAmount).toFixed(2)} entre vNF e totalAmount!`);
      console.log(`   ℹ️  Usando vNF calculado para o pagamento (correto para SEFAZ)`);
    }
    
    // Obter o código SEFAZ do método de pagamento
    let codigoPagamentoSefaz = sale.paymentMethod?.sefazCode || '99'; // 99 = Outros (padrão)
    
    // Se o sefazCode vier como string do enum (ex: "BOLETO_BANCARIO"), converter para código numérico
    if (codigoPagamentoSefaz && isNaN(Number(codigoPagamentoSefaz))) {
      console.log(`   ⚠️  sefazCode veio como enum: ${codigoPagamentoSefaz}, convertendo...`);
      codigoPagamentoSefaz = this.mapearFormaPagamento(codigoPagamentoSefaz);
    }
    
    console.log(`   💳 Código SEFAZ do pagamento (tPag): ${codigoPagamentoSefaz}`);
    console.log(`   💳 Nome do método: ${sale.paymentMethod?.name || 'Não informado'}`);
    console.log(`   💳 Parcelas: ${sale.installments}`);
    
    // Construir objeto de pagamento
    // IMPORTANTE: vPag DEVE ser igual ao vNF calculado anteriormente
    const detPagamento: any = {
      indPag: sale.installments > 1 ? 1 : 0, // 0=à vista, 1=a prazo
      tPag: codigoPagamentoSefaz,
      vPag: vNF.toFixed(2), // DEVE SER IGUAL AO vNF (não usar totalAmount!)
    };
    
    // Se for código 99 (Outros), a descrição é OBRIGATÓRIA
    if (codigoPagamentoSefaz === '99') {
      detPagamento.xPag = this.removerAcentuacao(
        sale.paymentMethod?.name || 'Outras formas de pagamento'
      ).substring(0, 60); // Limite de 60 caracteres
      console.log(`   💳 Descrição do pagamento (xPag): ${detPagamento.xPag}`);
    }
    
    console.log(`   💳 Estrutura de pagamento:`);
    console.log(`      - indPag: ${detPagamento.indPag} (${detPagamento.indPag === 0 ? 'À vista' : 'A prazo'})`);
    console.log(`      - tPag: ${detPagamento.tPag}`);
    console.log(`      - vPag: R$ ${detPagamento.vPag}`);
    
    NFe.tagDetPag([detPagamento]);
    
    // IMPORTANTE: O troco só deve ser informado quando o valor pago for MAIOR que o valor da nota
    // Em vendas normais, o troco é sempre 0.00
    // Validação SEFAZ: vPag - vTroco = vNF
    const valorTroco = 0; // Em vendas a prazo ou cartão, não há troco
    NFe.tagTroco(valorTroco.toFixed(2));
    
    console.log(`   💳 Troco: R$ ${valorTroco.toFixed(2)}`);
    console.log(`\n   ✅ Validação SEFAZ do pagamento:`);
    console.log(`      Fórmula: vPag - vTroco = vNF`);
    console.log(`      Valores: ${detPagamento.vPag} - ${valorTroco.toFixed(2)} = ${vNF.toFixed(2)}`);
    
    // Verificar se a validação está correta
    const vPagNum = parseFloat(detPagamento.vPag);
    const vTrocoNum = parseFloat(valorTroco.toFixed(2));
    const vNFNum = parseFloat(vNF.toFixed(2));
    const resultadoValidacao = vPagNum - vTrocoNum;
    
    console.log(`      Conversão numérica:`);
    console.log(`        vPag: ${vPagNum}`);
    console.log(`        vTroco: ${vTrocoNum}`);
    console.log(`        vNF: ${vNFNum}`);
    console.log(`        vPag - vTroco: ${resultadoValidacao}`);
    
    if (Math.abs(resultadoValidacao - vNFNum) < 0.01) {
      console.log(`      ✅ Validação OK!`);
    } else {
      console.log(`      ❌ ERRO: Diferença de R$ ${Math.abs(resultadoValidacao - vNFNum).toFixed(2)}`);
    }
    console.log(`   ✅ Formas de pagamento adicionadas`);
    
    // 4.10. Responsável Técnico
    NFe.tagInfRespTec({
      CNPJ: (sale.company.respTecCNPJ || sale.company.cnpj)?.replace(/\D/g, ''),
      xContato: this.removerAcentuacao(sale.company.respTecContato || sale.company.responsibleName || 'Suporte Tecnico'),
      email: sale.company.respTecEmail || sale.company.responsibleEmail || sale.company.email || 'contato@empresa.com',
      fone: (sale.company.respTecFone || sale.company.responsiblePhone || sale.company.telefone || sale.company.celular || '0000000000').replace(/\D/g, ''),
    });
    console.log('   ✅ Responsável técnico adicionado');
    
    const xmlGerado = NFe.xml();
    console.log(`   ✅ XML gerado com sucesso (${xmlGerado.length} caracteres)`);
    
    // DEBUG: Extrair e mostrar seção de totais e pagamento do XML
    console.log('\n🔍 [DEBUG] Verificando XML gerado:');
    try {
      const totalMatch = xmlGerado.match(/<total>[\s\S]*?<\/total>/);
      const vNFMatchTotal = totalMatch ? totalMatch[0].match(/<vNF>([\d.]+)<\/vNF>/) : null;
      
      if (totalMatch) {
        console.log('   📊 Seção <total>:');
        const vProdMatch = totalMatch[0].match(/<vProd>([\d.]+)<\/vProd>/);
        const vFreteMatch = totalMatch[0].match(/<vFrete>([\d.]+)<\/vFrete>/);
        const vDescMatch = totalMatch[0].match(/<vDesc>([\d.]+)<\/vDesc>/);
        const vOutroMatch = totalMatch[0].match(/<vOutro>([\d.]+)<\/vOutro>/);
        
        if (vProdMatch) console.log(`      - vProd: ${vProdMatch[1]}`);
        if (vFreteMatch) console.log(`      - vFrete: ${vFreteMatch[1]}`);
        if (vDescMatch) console.log(`      - vDesc: ${vDescMatch[1]}`);
        if (vOutroMatch) console.log(`      - vOutro: ${vOutroMatch[1]}`);
        if (vNFMatchTotal) console.log(`      - vNF: ${vNFMatchTotal[1]}`);
      }
      
      const pagMatch = xmlGerado.match(/<pag>[\s\S]*?<\/pag>/);
      if (pagMatch) {
        console.log('   💳 Seção <pag>:');
        const vPagMatch = pagMatch[0].match(/<vPag>([\d.]+)<\/vPag>/);
        const vTrocoMatch = pagMatch[0].match(/<vTroco>([\d.]+)<\/vTroco>/);
        
        if (vPagMatch) console.log(`      - vPag: ${vPagMatch[1]}`);
        if (vTrocoMatch) console.log(`      - vTroco: ${vTrocoMatch[1]}`);
        
        if (vNFMatchTotal && vPagMatch && vTrocoMatch) {
          const vNFVal = parseFloat(vNFMatchTotal[1]);
          const vPagVal = parseFloat(vPagMatch[1]);
          const vTrocoVal = parseFloat(vTrocoMatch[1]);
          const diffXml = Math.abs((vPagVal - vTrocoVal) - vNFVal);
          
          console.log(`   🧮 Validação no XML:`);
          console.log(`      ${vPagVal} - ${vTrocoVal} = ${(vPagVal - vTrocoVal).toFixed(2)}`);
          console.log(`      vNF = ${vNFVal}`);
          
          if (diffXml < 0.01) {
            console.log(`      ✅ XML está correto!`);
          } else {
            console.log(`      ❌ ERRO no XML! Diferença: ${diffXml.toFixed(2)}`);
          }
        }
      }
    } catch (e) {
      console.log('   ⚠️  Erro ao analisar XML:', e.message);
    }
    
    // 5. Salvar XML gerado
    const xmlGeradoFile = await this.salvarArquivo(companyId, dto.saleId, 'nfe.xml', xmlGerado);
    console.log('💾 [NF-e] XML salvo em:', xmlGeradoFile.path);
    console.log('🔗 [NF-e] URL pública:', xmlGeradoFile.url);
    
    // 6. Assinar XML
    console.log('\n✍️  [NF-e] ETAPA 2: Assinando XML digitalmente...');
    const xmlAssinado = await this.nfeSefaz.assinarXML(companyId, xmlGerado);
    console.log(`   ✅ XML assinado com sucesso (${xmlAssinado.length} caracteres)`);
    
    // 7. Salvar XML assinado
    const xmlAssinadoFile = await this.salvarArquivo(companyId, dto.saleId, 'nfe_sign.xml', xmlAssinado);
    console.log('💾 [NF-e] XML assinado salvo em:', xmlAssinadoFile.path);
    console.log('🔗 [NF-e] URL pública:', xmlAssinadoFile.url);
    
    let resultado: any = {
      numero: numeroNFe,
      serie: dto.serie || '1',
      cUF: this.obterCodigoUF(sale.company.estado || 'SP'),
      cNF: cNF,
      naturezaOperacao: dto.naturezaOperacao || 'VENDA',
      xmlGerado: xmlGeradoFile.path,
      xmlGeradoUrl: xmlGeradoFile.url,
      xmlAssinado: xmlAssinadoFile.path,
      xmlAssinadoUrl: xmlAssinadoFile.url,
      status: 'GERADO',
    };
    
    // 8. Enviar para SEFAZ (se solicitado)
    if (dto.enviarSefaz !== false) {
      try {
        console.log('\n📡 [NF-e] ETAPA 3: Enviando para a SEFAZ...');
        console.log(`   🌐 Conectando com SEFAZ ${sale.company.estado}...`);
        console.log(`   🏷️  Ambiente: ${tpAmb === '1' ? 'PRODUÇÃO' : 'HOMOLOGAÇÃO'}`);
        
        const respostaSefazCompleta = await this.nfeSefaz.enviarLote(companyId, xmlAssinado);
        
        // Extrair XML e JSON da resposta
        const respostaSefazXML = respostaSefazCompleta.xml;
        const respostaSefaz = respostaSefazCompleta.json;
        
        console.log('✅ [NF-e] Resposta recebida da SEFAZ');
        console.log(JSON.stringify(respostaSefaz, null, 2));
        
        resultado.respostaSefaz = respostaSefaz;
        
        // 9. Verificar o tipo de resposta da SEFAZ
        // Pode ser retEnviNFe (lote) ou protNFe (protocolo direto)
        
        let cStat: string | undefined;
        let xMotivo: string | undefined;
        let infProt: any;
        
        // Verificar se é resposta de lote (retEnviNFe)
        if (respostaSefaz?.retEnviNFe) {
          const retEnvi = respostaSefaz.retEnviNFe;
          cStat = retEnvi.cStat;
          xMotivo = retEnvi.xMotivo;
          
          console.log('📋 [NF-e] Resposta do tipo retEnviNFe (lote)');
          console.log(`   🔢 cStat: ${cStat}`);
          console.log(`   💬 xMotivo: ${xMotivo}`);
          
          // Se o lote foi processado com sucesso (cStat 104), verificar o protNFe
          if (cStat === '104' && retEnvi.protNFe) {
            const protNFe = Array.isArray(retEnvi.protNFe) ? retEnvi.protNFe[0] : retEnvi.protNFe;
            infProt = protNFe?.infProt;
            if (infProt) {
              cStat = infProt.cStat;
              xMotivo = infProt.xMotivo;
              console.log('   ✅ Protocolo encontrado na resposta do lote');
              console.log(`   🔢 cStat do protocolo: ${cStat}`);
              console.log(`   💬 xMotivo do protocolo: ${xMotivo}`);
            }
          }
        }
        // Verificar se é resposta direta de protocolo (protNFe)
        else if (respostaSefaz?.protNFe) {
          console.log('📋 [NF-e] Resposta do tipo protNFe (protocolo direto)');
          const protNFe = Array.isArray(respostaSefaz.protNFe) ? respostaSefaz.protNFe[0] : respostaSefaz.protNFe;
          infProt = protNFe?.infProt;
          if (infProt) {
            cStat = infProt.cStat;
            xMotivo = infProt.xMotivo;
            console.log(`   🔢 cStat: ${cStat}`);
            console.log(`   💬 xMotivo: ${xMotivo}`);
          }
        }
        
        // Verificar se foi autorizada (cStat === '100')
        if (cStat === '100' && infProt) {
          console.log('✅ [NF-e] NF-e AUTORIZADA COM SUCESSO!');
          console.log(`   📋 Chave de Acesso: ${infProt.chNFe}`);
          console.log(`   🔢 Protocolo: ${infProt.nProt}`);
          console.log(`   📅 Data/Hora: ${infProt.dhRecbto}`);
          
          resultado.status = 'AUTORIZADA';
          resultado.chaveAcesso = infProt.chNFe;
          resultado.protocolo = infProt.nProt;
          resultado.dataAutorizacao = infProt.dhRecbto;
          
          // 10. Gerar DANFE
          console.log('\n�️  [NF-e] ETAPA 4: Gerando DANFE (PDF)...');
          try {
            // Gerar DANFE direto com o XML assinado
            const danfePdf = await this.nfeSefaz.gerarDANFE(xmlAssinado);
            const danfeFile = await this.salvarArquivo(companyId, dto.saleId, 'danfe.pdf', danfePdf);
            resultado.danfe = danfeFile.path;
            resultado.danfeUrl = danfeFile.url;
            console.log(`   ✅ DANFE gerado com sucesso`);
            console.log('   🔗 URL pública:', danfeFile.url);
          } catch (danfeError) {
            console.error('   ❌ Erro ao gerar DANFE:', danfeError.message);
            console.error('   ❌ Stack:', danfeError.stack);
          }
          
          // 11. Salvar NF-e no banco de dados
          await this.salvarNFeNoBanco(companyId, dto.saleId, resultado, sale);
          console.log('   ✅ NF-e salva no banco de dados');
          
          // 12. Atualizar status da venda para INVOICED (faturado) e adicionar URL do XML
          if (dto.saleId) {
            await this.prisma.sale.update({
              where: { id: dto.saleId },
              data: { 
                status: 'INVOICED',
                nfeXmlUrl: resultado.xmlAssinadoUrl, // URL pública do XML para download
              },
            });
            console.log('   ✅ Status da venda atualizado para INVOICED');
            console.log('   ✅ URL do XML adicionada na venda');
          }
        } else {
          // NF-e rejeitada ou erro no serviço
          console.log('❌ [NF-e] NF-e REJEITADA OU ERRO NO SERVIÇO');
          console.log(`   🔢 Código: ${cStat || 'N/A'}`);
          console.log(`   💬 Motivo: ${xMotivo || 'Erro desconhecido'}`);
          
          resultado.status = 'REJEITADA';
          resultado.codigoStatus = cStat;
          resultado.motivoRejeicao = xMotivo || 'Erro desconhecido';
          
          const xmlErroFile = await this.salvarArquivo(
            companyId,
            dto.saleId,
            'nfe_err.json',
            JSON.stringify(respostaSefaz, null, 2),
          );
          resultado.xmlErro = xmlErroFile.path;
          resultado.xmlErroUrl = xmlErroFile.url;
          console.log('   💾 Erro salvo em:', xmlErroFile.path);
          console.log('   🔗 URL pública:', xmlErroFile.url);
          
          // Interpretar códigos de status comuns
          if (cStat === '109') {
            console.log('   ℹ️  Serviço da SEFAZ está temporariamente indisponível');
            console.log('   ℹ️  Tente novamente mais tarde ou entre em contingência');
          } else if (cStat === '108') {
            console.log('   ℹ️  Serviço da SEFAZ em manutenção');
          } else if (cStat && parseInt(cStat) >= 200 && parseInt(cStat) < 300) {
            console.log('   ℹ️  Erro de validação no XML da NF-e');
            console.log('   ℹ️  Verifique os dados informados e tente novamente');
          }
        }
        
        // 13. Atualizar contador de numeração da empresa SEMPRE
        // Independente de autorização ou rejeição, o número foi usado
        console.log('\n🔢 [NF-e] Atualizando contador de numeração...');
        await this.atualizarContadorNFe(companyId, numeroNFe);
        console.log('   ⚠️  Número da NFe consumido (autorizada ou rejeitada)');
        
      } catch (error) {
        console.log('💥 [NF-e] ERRO durante envio para SEFAZ!');
        console.log('❌ [NF-e] Mensagem:', error.message);
        console.log('❌ [NF-e] Stack:', error.stack);
        
        resultado.status = 'ERRO';
        resultado.erro = error.message;
        
        const xmlErroFile = await this.salvarArquivo(
          companyId,
          dto.saleId,
          'nfe_err.txt',
          error.message,
        );
        resultado.xmlErro = xmlErroFile.path;
        resultado.xmlErroUrl = xmlErroFile.url;
        console.log('   💾 Erro salvo em:', xmlErroFile.path);
        console.log('   🔗 URL pública:', xmlErroFile.url);
        
        // Incrementar contador mesmo com erro
        console.log('\n🔢 [NF-e] Atualizando contador de numeração (erro)...');
        await this.atualizarContadorNFe(companyId, numeroNFe);
        console.log('   ⚠️  Número da NFe consumido (erro durante envio)');
        
        throw error;
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ [NF-e] PROCESSAMENTO CONCLUÍDO');
    console.log('='.repeat(80) + '\n');
    
    return resultado;
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
   * Converte valor para número garantindo que nunca seja NaN, null ou undefined
   */
  private garantirNumero(valor: any): number {
    if (valor === null || valor === undefined) {
      return 0;
    }
    
    // Se for string, tentar converter
    if (typeof valor === 'string') {
      const numero = parseFloat(valor);
      return isNaN(numero) ? 0 : numero;
    }
    
    // Se for número, verificar se é válido
    if (typeof valor === 'number') {
      return isNaN(valor) ? 0 : valor;
    }
    
    // Se for Decimal do Prisma ou outro objeto
    const numero = Number(valor);
    return isNaN(numero) ? 0 : numero;
  }

  /**
   * Obtém o próximo número da NF-e e atualiza o contador na empresa
   */
  private async obterProximoNumero(companyId: string, serie: string): Promise<number> {
    // Buscar configuração da empresa
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: {
        proximoNumeroNFe: true,
        ultimoNumeroNFe: true,
        serieNFe: true,
      },
    });

    if (!company) {
      throw new Error('Empresa não encontrada');
    }

    // Usar o próximo número configurado na empresa
    const proximoNumero = company.proximoNumeroNFe || 1;

    console.log(`\n🔢 [NF-e] Numeração da NF-e:`);
    console.log(`   - Último número emitido: ${company.ultimoNumeroNFe || 0}`);
    console.log(`   - Próximo número: ${proximoNumero}`);
    console.log(`   - Série: ${serie || company.serieNFe || '1'}`);

    return proximoNumero;
  }

  /**
   * Atualiza o contador de numeração da NF-e após emissão bem-sucedida
   */
  private async atualizarContadorNFe(companyId: string, numeroEmitido: number): Promise<void> {
    await this.prisma.company.update({
      where: { id: companyId },
      data: {
        ultimoNumeroNFe: numeroEmitido,
        proximoNumeroNFe: numeroEmitido + 1,
      },
    });

    console.log(`\n🔢 [NF-e] Contador atualizado:`);
    console.log(`   - Último número: ${numeroEmitido}`);
    console.log(`   - Próximo número: ${numeroEmitido + 1}`);
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
   * Usado como fallback quando o sefazCode vem como string do enum em vez de código numérico
   */
  private mapearFormaPagamento(tipo: string): string {
    const mapa: { [key: string]: string } = {
      // Códigos padrão
      'DINHEIRO': '01',
      'CHEQUE': '02',
      'CARTAO_CREDITO': '03',
      'CARTAO_DEBITO': '04',
      'CREDITO_LOJA': '05',
      'VALE_ALIMENTACAO': '10',
      'VALE_REFEICAO': '11',
      'VALE_PRESENTE': '12',
      'VALE_COMBUSTIVEL': '13',
      'DUPLICATA_MERCANTIL': '14',
      'BOLETO_BANCARIO': '15',
      'BOLETO': '15',
      'DEPOSITO_BANCARIO': '16',
      'PIX_DINAMICO': '17',
      'PIX': '17',
      'TRANSFERENCIA': '18',
      'PROGRAMA_FIDELIDADE': '19',
      'CASHBACK': '19',
      'PIX_ESTATICO': '20',
      'CREDITO_EM_LOJA': '21',
      'PAGAMENTO_ELETRONICO_NAO_INFORMADO': '22',
      'SEM_PAGAMENTO': '90',
      'OUTROS': '99',
    };
    
    // Converter para maiúsculo e tentar mapear
    const tipoUpper = tipo?.toUpperCase() || '';
    return mapa[tipoUpper] || '99';
  }

  /**
   * Salva arquivo e retorna objeto com path e URL pública
   */
  private async salvarArquivo(
    companyId: string, 
    saleId: string, 
    fileName: string, 
    content: string | Buffer
  ): Promise<{ path: string; url: string }> {
    // Salvar em pasta pública
    const publicDir = path.join(process.cwd(), 'uploads', 'public', 'nfe', companyId, saleId);
    
    // Criar diretório se não existir
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    const filePath = path.join(publicDir, fileName);
    fs.writeFileSync(filePath, content);
    
    // Gerar URL pública (assumindo que uploads/public está servido estaticamente)
    const publicUrl = `/uploads/public/nfe/${companyId}/${saleId}/${fileName}`;
    
    return {
      path: filePath,
      url: publicUrl,
    };
  }

  /**
   * Salva NF-e no banco de dados
   */
  private async salvarNFeNoBanco(companyId: string, saleId: string, dados: any, sale?: any) {
    const numero = parseInt(dados.numero || '1');
    const serie = dados.serie || '1';
    
    console.log(`\n💾 [NF-e] Salvando NFe no banco...`);
    console.log(`   - Empresa: ${companyId}`);
    console.log(`   - Série: ${serie}`);
    console.log(`   - Número: ${numero}`);
    console.log(`   - Chave: ${dados.chaveAcesso || 'N/A'}`);
    console.log(`   - Cliente: ${sale?.customerId || 'N/A'}`);
    
    // Verificar se já existe
    const existente = await this.prisma.nFe.findFirst({
      where: {
        companyId,
        serie,
        numero,
      },
    });
    
    if (existente) {
      console.log(`   ⚠️  NFe já existe no banco (ID: ${existente.id})`);
      console.log(`   🔄 Atualizando registro existente...`);
    } else {
      console.log(`   ✨ Criando novo registro...`);
    }
    
    // Preparar dados do destinatário
    const destinatarioId = sale?.customerId || null;
    const destinatarioNome = sale?.customer?.name || sale?.customer?.companyName || 'Cliente';
    const destinatarioCnpjCpf = sale?.customer?.document || '00000000000';
    
    // Buscar endereço do cliente
    const enderecoCliente = sale?.customer?.addresses?.find((a: any) => a.type === 'BILLING') 
                         || sale?.customer?.addresses?.find((a: any) => a.type === 'MAIN')
                         || sale?.customer?.addresses?.[0];
    
    // Verificar se já existe NFe com essa numeração
    // Se existir, não devemos sobrescrever - isso indica erro de numeração
    if (existente) {
      throw new Error(`Já existe uma NFe com a série ${serie} e número ${numero}. Verifique a numeração.`);
    }
    
    // Criar nova NFe no banco
    await this.prisma.nFe.create({
      data: {
        companyId,
        saleId,
        destinatarioId, // Vincular com o cliente
        chaveAcesso: dados.chaveAcesso,
        protocoloAutorizacao: dados.protocolo,
        numero,
        serie,
        status: dados.status === 'AUTORIZADA' ? 'AUTHORIZED' : 'DRAFT',
        dataAutorizacao: dados.dataAutorizacao ? new Date(dados.dataAutorizacao) : undefined,
        dataEmissao: dados.dataAutorizacao ? new Date(dados.dataAutorizacao) : new Date(),
        xmlAutorizado: dados.xmlAssinado,
        xmlAutorizadoUrl: dados.xmlAssinadoUrl,
        danfePdfPath: dados.danfe,
        danfePdfUrl: dados.danfeUrl,
        // Campos obrigatórios com valores padrão
        cUF: dados.cUF || '35',
        cNF: dados.cNF || Math.random().toString().slice(2, 10),
        naturezaOperacao: dados.naturezaOperacao || 'VENDA',
        cMunFG: dados.cMunFG || '3550308',
        destinatarioNome,
        destinatarioCnpjCpf,
        destLogradouro: enderecoCliente?.street || 'Rua',
        destNumero: enderecoCliente?.number || 'S/N',
        destBairro: enderecoCliente?.neighborhood || 'Bairro',
        destCidade: enderecoCliente?.city || 'Cidade',
        destCodigoMunicipio: enderecoCliente?.cityCode || '3550308',
        destEstado: enderecoCliente?.state || 'SP',
        destCep: enderecoCliente?.zipCode?.replace(/\D/g, '') || '00000000',
        valorProdutos: sale?.subtotal || dados.valorProdutos || 0,
        valorTotal: sale?.totalAmount || dados.valorTotal || 0,
      },
    });
    
    console.log(`   ✅ NFe salva com sucesso!`);
  }

  /**
   * Consulta uma NF-e pela chave de acesso
   */
  async consultarNFe(companyId: string, chaveAcesso: string) {
    return this.nfeSefaz.consultarNFe(companyId, chaveAcesso);
  }

  /**
   * Consulta o status do serviço da SEFAZ
   */
  async consultarStatusServico(companyId: string) {
    return this.nfeSefaz.consultarStatusServico(companyId);
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

    if (nfe.status === 'CANCELED') {
      throw new Error('NF-e já está cancelada');
    }

    if (nfe.status !== 'AUTHORIZED') {
      throw new Error('Apenas NF-e autorizadas podem ser canceladas');
    }

    if (!nfe.chaveAcesso || !nfe.protocoloAutorizacao) {
      throw new Error('NF-e não possui chave de acesso ou protocolo');
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
   * Busca uma NF-e específica
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
          },
        },
      },
    });
  }

  /**
   * Lista NF-es com filtros avançados
   */
  async listarNFes(companyId: string, filters?: any) {
    const where: any = {
      companyId,
    };

    // Filtro por status
    if (filters?.status) {
      where.status = filters.status;
    }

    // Filtro por venda
    if (filters?.saleId) {
      where.saleId = filters.saleId;
    }

    // Filtro por número da NFe
    if (filters?.numero) {
      where.numero = parseInt(filters.numero);
    }

    // Filtro por série
    if (filters?.serie) {
      where.serie = filters.serie;
    }

    // Filtro por chave de acesso (busca exata ou parcial)
    if (filters?.chaveAcesso) {
      where.chaveAcesso = {
        contains: filters.chaveAcesso,
        mode: 'insensitive',
      };
    }

    // Filtro por cliente (destinatário)
    if (filters?.customerId) {
      where.destinatarioId = filters.customerId;
    }

    // Filtro por nome do cliente (busca parcial)
    if (filters?.customerName) {
      where.destinatarioNome = {
        contains: filters.customerName,
        mode: 'insensitive',
      };
    }

    // Filtro por período de emissão
    if (filters?.dataInicio || filters?.dataFim) {
      where.dataEmissao = {};
      if (filters.dataInicio) {
        where.dataEmissao.gte = new Date(filters.dataInicio);
      }
      if (filters.dataFim) {
        // Adicionar 23:59:59 ao fim do dia
        const dataFim = new Date(filters.dataFim);
        dataFim.setHours(23, 59, 59, 999);
        where.dataEmissao.lte = dataFim;
      }
    }

    console.log('🔍 [NF-e] Listando NFes com filtros:', JSON.stringify(where, null, 2));

    return this.prisma.nFe.findMany({
      where,
      include: {
        sale: {
          include: {
            customer: true,
          },
        },
        customer: true, // Incluir dados do destinatário diretamente
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

    /**
   * Baixa XML da NF-e
   */
  async baixarXML(nfeId: string) {
    const nfe = await this.prisma.nFe.findUnique({
      where: { id: nfeId },
    });

    if (!nfe || !nfe.xmlAutorizado) {
      throw new Error('XML não encontrado');
    }

    return fs.readFileSync(nfe.xmlAutorizado, 'utf-8');
  }

  /**
   * Baixa DANFE da NF-e
   */
  async baixarDANFE(nfeId: string) {
    const nfe = await this.prisma.nFe.findUnique({
      where: { id: nfeId },
    });

    if (!nfe || !nfe.danfePdfPath) {
      throw new Error('DANFE não encontrado');
    }

    return fs.readFileSync(nfe.danfePdfPath);
  }

  /**
   * Inutiliza uma numeração de NF-e
   */
  async inutilizarNumeracao(
    companyId: string,
    dto: {
      serie: string;
      numeroInicial: number;
      numeroFinal: number;
      justificativa: string;
    },
  ) {
    // TODO: Implementar inutilização de numeração quando o método estiver disponível no NFeSefazService
    throw new Error('Método não implementado');
  }

  /**
   * Gera DANFE de uma NF-e já emitida
   */
  async gerarDANFENFeExistente(companyId: string, nfeId: string) {
    console.log('🖨️  [NF-e] Gerando DANFE de NF-e existente...');
    console.log('   📋 NFe ID:', nfeId);
    
    // Buscar a NFe
    const nfe = await this.prisma.nFe.findFirst({
      where: {
        id: nfeId,
        companyId,
      },
      include: {
        sale: true,
      },
    });

    if (!nfe) {
      throw new BadRequestException('NF-e não encontrada');
    }

    if (nfe.status !== 'AUTHORIZED') {
      throw new BadRequestException('Apenas NF-e autorizadas podem gerar DANFE');
    }

    if (!nfe.xmlAutorizado) {
      throw new BadRequestException('XML da NF-e não encontrado');
    }

    console.log('   ✅ NF-e encontrada');
    console.log('   📋 Chave de Acesso:', nfe.chaveAcesso);
    console.log('   📋 Número:', nfe.numero);

    try {
      // Ler o XML autorizado
      const xmlAssinado = fs.readFileSync(nfe.xmlAutorizado, 'utf-8');
      console.log('   ✅ XML carregado');

      // Gerar DANFE
      console.log('   🖨️  Gerando PDF do DANFE...');
      const danfePdf = await this.nfeSefaz.gerarDANFE(xmlAssinado);
      console.log('   ✅ DANFE gerado com sucesso');

      // Salvar DANFE
      const saleId = nfe.saleId || nfeId;
      const danfeFile = await this.salvarArquivo(companyId, saleId, 'danfe.pdf', danfePdf);
      console.log('   💾 DANFE salvo em:', danfeFile.path);
      console.log('   🔗 URL pública:', danfeFile.url);

      // Atualizar NFe no banco
      await this.prisma.nFe.update({
        where: { id: nfeId },
        data: {
          danfePdfPath: danfeFile.path,
          danfePdfUrl: danfeFile.url,
        },
      });
      console.log('   ✅ NFe atualizada no banco');

      return {
        success: true,
        message: 'DANFE gerado com sucesso',
        danfePath: danfeFile.path,
        danfeUrl: danfeFile.url,
        nfeId: nfe.id,
        chaveAcesso: nfe.chaveAcesso,
        numero: nfe.numero,
      };
    } catch (error) {
      console.error('   ❌ Erro ao gerar DANFE:', error.message);
      throw new InternalServerErrorException({
        message: 'Erro ao gerar DANFE',
        error: error.message,
      });
    }
  }
}
