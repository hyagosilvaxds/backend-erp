import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CompaniesService } from '../../companies/companies.service';
import { Tools } from 'node-sped-nfe';
import { DANFe } from 'node-sped-pdf';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class NFeSefazService {
  constructor(
    private prisma: PrismaService,
    private companiesService: CompaniesService,
  ) {}

  /**
   * Inicializa as ferramentas da SEFAZ com o certificado da empresa
   */
  private async inicializarTools(company: any): Promise<Tools> {
    console.log('🔧 [SEFAZ] Iniciando inicialização do Tools...');
    if (!company.certificadoDigitalPath) {
      throw new BadRequestException('Empresa não possui certificado A1 cadastrado');
    }

    if (!company.certificadoDigitalSenha) {
      throw new BadRequestException('Senha do certificado não cadastrada');
    }

    const certificatePath = path.resolve(company.certificadoDigitalPath);

    if (!fs.existsSync(certificatePath)) {
      throw new BadRequestException('Arquivo do certificado não encontrado');
    }

    // Verificar validade do certificado
    if (company.certificadoDigitalValidoAte && new Date(company.certificadoDigitalValidoAte) < new Date()) {
      throw new BadRequestException('Certificado A1 expirado. Faça upload de um novo certificado.');
    }

    // Descriptografar senha do certificado
    const senhaDescriptografada = await this.companiesService.getDecryptedCertificatePassword(company.id);

    // Tipo de ambiente: 1=Produção, 2=Homologação (sempre usar o cadastrado na empresa)
    const tpAmb = company.nfeAmbiente === '1' ? 1 : 2;

    // UF da empresa (sempre usar o cadastrado)
    const ufEmpresa = company.estado || 'SP';

    const toolsConfig = {
      mod: '55', // Sempre 55 (NF-e)
      xmllint: '',
      UF: ufEmpresa, // UF da empresa
      tpAmb: tpAmb, // 1=Produção, 2=Homologação
      CSC: '',
      CSCid: '',
      versao: '4.00', // Sempre 4.00
      timeout: 30, // Sempre 30 segundos
      openssl: null,
      CPF: '',
      CNPJ: company.cnpj || '',
    };

    const certificateConfig = {
      pfx: certificatePath, // Caminho do certificado A1 cadastrado na empresa
      senha: senhaDescriptografada, // Senha descriptografada do banco
    };

    console.log('📋 [SEFAZ] Configurações para o Tools:');
    console.log('   - Gerais:', JSON.stringify(toolsConfig, null, 2));
    console.log('   - Certificado:', {
      pfx: certificateConfig.pfx,
      senha: '[OCULTA]',
    });

    const tools = new Tools(
      toolsConfig,
      certificateConfig,
    );

    return tools;
  }

  /**
   * Assina o XML da NF-e
   */
  async assinarXML(companyId: string, xml: string): Promise<string> {
    console.log('✍️  [SEFAZ] Iniciando assinatura do XML...');
    
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new BadRequestException('Empresa não encontrada');
    }

    console.log('🏢 [SEFAZ] Empresa encontrada:', company.razaoSocial);
    console.log('📋 [SEFAZ] Tamanho do XML:', xml.length, 'bytes');

    const tools = await this.inicializarTools(company);
    console.log('✅ [SEFAZ] Tools inicializado para assinatura');

    try {
      console.log('🔐 [SEFAZ] Assinando XML com certificado digital...');
      const xmlAssinado = await tools.xmlSign(xml);
      console.log('✅ [SEFAZ] XML assinado com sucesso!');
      console.log('📋 [SEFAZ] Tamanho do XML assinado:', xmlAssinado.length, 'bytes');
      
      return xmlAssinado;
    } catch (error) {
      console.log('💥 [SEFAZ] ERRO ao assinar XML!');
      console.log('❌ [SEFAZ] Mensagem:', error.message);
      console.log('❌ [SEFAZ] Stack:', error.stack);
      
      throw new InternalServerErrorException({
        message: 'Erro ao assinar XML',
        error: error.message,
      });
    }
  }

  /**
   * Envia o lote de NF-e para a SEFAZ de forma síncrona
   * Retorna a resposta completa incluindo protocolo se autorizada
   */
  async enviarLote(companyId: string, xmlAssinado: string): Promise<any> {
    console.log('📡 [SEFAZ] Iniciando envio de lote para SEFAZ...');
    
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new BadRequestException('Empresa não encontrada');
    }

    console.log('🏢 [SEFAZ] Dados da empresa:');
    console.log('   - CNPJ:', company.cnpj);
    console.log('   - UF:', company.estado);
    console.log('   - Ambiente:', company.nfeAmbiente === '1' ? 'Produção' : 'Homologação');
    console.log('   - Tem certificado?', !!company.certificadoDigitalPath);

    const tools = await this.inicializarTools(company);
    console.log('✅ [SEFAZ] Tools inicializado com sucesso');

    try {
      console.log('📤 [SEFAZ] Enviando lote (modo síncrono - indSinc: 1)...');
      console.log('📝 [SEFAZ] Tamanho do XML assinado:', xmlAssinado.length, 'bytes');
      
      // Envia lote de forma SÍNCRONA (indSinc: 1) para receber resposta imediata
      const respostaXML = await (tools as any).sefazEnviaLote(xmlAssinado, { indSinc: 1 });
      
      console.log('✅ [SEFAZ] Resposta XML recebida da SEFAZ!');
      console.log('📨 [SEFAZ] Tipo da resposta XML:', typeof respostaXML);
      console.log('📨 [SEFAZ] Resposta XML completa:', respostaXML);

      // A biblioteca pode retornar string vazia em caso de erro não capturado.
      // Se for uma string vazia ou não for um XML, o xml2json vai falhar ou retornar objeto vazio.
      if (!respostaXML || typeof respostaXML !== 'string' || !respostaXML.startsWith('<')) {
        throw new InternalServerErrorException({
          message: 'Resposta inválida ou vazia recebida da SEFAZ.',
          response: respostaXML,
        });
      }

      // Forçar a conversão para JSON para garantir que temos um objeto
      const resposta = await tools.xml2json(respostaXML);
      
      console.log('✅ [SEFAZ] Resposta convertida para JSON!');
      console.log('📨 [SEFAZ] Resposta JSON completa:');
      console.log(JSON.stringify(resposta, null, 2));
      
      // Verificar estrutura da resposta
      console.log('🔍 [SEFAZ] Analisando estrutura da resposta...');
      console.log('   - É objeto?', typeof resposta === 'object');
      console.log('   - É array?', Array.isArray(resposta));
      console.log('   - Keys:', Object.keys(resposta || {}));
      
      return resposta; // Retorna resposta completa (já em formato JSON pela biblioteca)
    } catch (error) {
      console.log('💥 [SEFAZ] ERRO ao enviar lote!');
      console.log('❌ [SEFAZ] Mensagem:', error.message);
      console.log('❌ [SEFAZ] Tipo do erro:', error.constructor.name);
      console.log('❌ [SEFAZ] Stack:', error.stack);
      
      if (error.response) {
        console.log('📨 [SEFAZ] Resposta do erro:', error.response);
      }
      
      // Se o erro já for o nosso, apenas relance
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      
      throw new InternalServerErrorException({
        message: 'Erro ao enviar lote para SEFAZ',
        error: error.message,
        details: error,
      });
    }
  }

  /**
   * Gera o XML de processamento (nfeProc) a partir do XML assinado e resposta da SEFAZ
   * Este XML contém tanto a NF-e quanto o protocolo de autorização
   */
  async gerarXmlProcessamento(xmlAssinado: string, respostaSefaz: any): Promise<string> {
    const company = await this.prisma.company.findFirst();

    if (!company) {
      throw new BadRequestException('Empresa não encontrada');
    }

    const tools = await this.inicializarTools(company);

    try {
      const xmlProc = (tools as any).gerarXmlProc(xmlAssinado, respostaSefaz);
      return xmlProc;
    } catch (error) {
      throw new InternalServerErrorException({
        message: 'Erro ao gerar XML de processamento',
        error: error.message,
      });
    }
  }

  /**
   * Consulta uma NF-e pela chave de acesso
   */
  async consultarNFe(companyId: string, chaveAcesso: string): Promise<any> {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new BadRequestException('Empresa não encontrada');
    }

    const tools = await this.inicializarTools(company);

    try {
      const resposta = await tools.consultarNFe(chaveAcesso);
      const respostaJSON = await tools.xml2json(resposta);
      return respostaJSON;
    } catch (error) {
      throw new InternalServerErrorException({
        message: 'Erro ao consultar NF-e',
        error: error.message,
      });
    }
  }

  /**
   * Cancela uma NF-e usando evento
   */
  async cancelarNFe(
    companyId: string,
    chaveAcesso: string,
    protocolo: string,
    justificativa: string,
  ): Promise<any> {
    if (justificativa.length < 15) {
      throw new BadRequestException('Justificativa deve ter no mínimo 15 caracteres');
    }

    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new BadRequestException('Empresa não encontrada');
    }

    const tools = await this.inicializarTools(company);

    try {
      // Evento de cancelamento (110111)
      const resposta = await tools.sefazEvento({
        chNFe: chaveAcesso,
        tpEvento: '110111',
        nProt: protocolo,
        xJust: justificativa,
        nSeqEvento: 1,
        dhEvento: new Date().toISOString(),
      });
      
      const respostaJSON = await tools.xml2json(resposta);
      return respostaJSON;
    } catch (error) {
      throw new InternalServerErrorException({
        message: 'Erro ao cancelar NF-e',
        error: error.message,
      });
    }
  }

  /**
   * Gera o DANFE (PDF) a partir do XML de processamento
   */
  async gerarDANFE(xmlProcessamento: string): Promise<Buffer> {
    try {
      const pdfBuffer = await DANFe({ xml: xmlProcessamento });
      return pdfBuffer;
    } catch (error) {
      throw new InternalServerErrorException({
        message: 'Erro ao gerar DANFE',
        error: error.message,
      });
    }
  }

  /**
   * Consulta o status do serviço da SEFAZ
   */
  async consultarStatusServico(companyId: string): Promise<any> {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new BadRequestException('Empresa não encontrada');
    }

    const tools = await this.inicializarTools(company);

    try {
      const resposta = await tools.sefazStatus();
      const respostaJSON = await tools.xml2json(resposta);
      return respostaJSON;
    } catch (error) {
      throw new InternalServerErrorException({
        message: 'Erro ao consultar status do serviço',
        error: error.message,
      });
    }
  }
}
