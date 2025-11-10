import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DocumentsService } from '../../documents/documents.service';
import { UploadInvestmentDocumentDto } from '../dto/upload-investment-document.dto';

@Injectable()
export class InvestmentDocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly documentsService: DocumentsService,
  ) {}

  /**
   * Cria estrutura de pastas para documentos de aportes SCP
   * Estrutura: SCP / Aportes / [Projeto Code] / [Investidor] / [Categoria]
   */
  async ensureInvestmentDocumentFolder(
    companyId: string,
    investmentId: string,
    category: string = 'Comprovantes',
    userId: string,
  ): Promise<string> {
    // Buscar informações do aporte com projeto e investidor
    const investment = await this.prisma.investment.findFirst({
      where: {
        id: investmentId,
        companyId,
      },
      include: {
        project: true,
        investor: true,
      },
    });

    if (!investment) {
      throw new NotFoundException('Aporte não encontrado');
    }

    // 1. Pasta raiz: SCP
    const scpFolder = await this.documentsService.findOrCreateFolder(
      'SCP',
      companyId,
      undefined,
      userId,
    );

    // 2. Pasta: Aportes
    const aportesFolder = await this.documentsService.findOrCreateFolder(
      'Aportes',
      companyId,
      scpFolder.id,
      userId,
    );

    // 3. Pasta do projeto
    const projectFolderName = `${investment.project.code} - ${investment.project.name}`;
    const projectFolder = await this.documentsService.findOrCreateFolder(
      projectFolderName,
      companyId,
      aportesFolder.id,
      userId,
    );

    // 4. Pasta do investidor
    const investorName = investment.investor.type === 'PESSOA_FISICA'
      ? investment.investor.fullName
      : investment.investor.companyName;
    const investorFolder = await this.documentsService.findOrCreateFolder(
      investorName || 'Sem Nome',
      companyId,
      projectFolder.id,
      userId,
    );

    // 5. Pasta da categoria (se fornecida e não for 'Comprovantes')
    if (category && category !== 'Comprovantes') {
      const categoryFolder = await this.documentsService.findOrCreateFolder(
        category,
        companyId,
        investorFolder.id,
        userId,
      );
      return categoryFolder.id;
    }

    return investorFolder.id;
  }

  /**
   * Faz upload de documento para um aporte
   */
  async uploadDocument(
    companyId: string,
    userId: string,
    uploadDto: UploadInvestmentDocumentDto,
    file: Express.Multer.File,
  ) {
    // Verificar se aporte existe e pertence à empresa
    const investment = await this.prisma.investment.findFirst({
      where: {
        id: uploadDto.investmentId,
        companyId,
      },
      include: {
        project: true,
        investor: true,
      },
    });

    if (!investment) {
      throw new NotFoundException('Aporte não encontrado');
    }

    // Verificar permissões do usuário (deve ter acesso ao módulo SCP)
    await this.checkUserPermissions(userId, companyId);

    // Obter ou criar pasta do aporte
    const folderId = await this.ensureInvestmentDocumentFolder(
      companyId,
      uploadDto.investmentId,
      uploadDto.category,
      userId,
    );

    // Fazer upload do documento usando DocumentsService
    const tagsArray = uploadDto.tags ? uploadDto.tags.split(',').map((t) => t.trim()) : [];
    
    // Tags padrão: SCP, Aporte, Código do Projeto, ID do Aporte
    tagsArray.push(
      'SCP',
      'Aporte',
      'Investimento',
      investment.project.code,
      investment.id,
    );
    
    if (uploadDto.category) {
      tagsArray.push(uploadDto.category);
    }

    // Adicionar informação do investidor
    if (investment.investor.type === 'PESSOA_FISICA' && investment.investor.cpf) {
      tagsArray.push(investment.investor.cpf);
    } else if (investment.investor.type === 'PESSOA_JURIDICA' && investment.investor.cnpj) {
      tagsArray.push(investment.investor.cnpj);
    }

    const uploadResult = await this.documentsService.uploadDocument(
      file,
      {
        folderId,
        name: uploadDto.name,
        description: uploadDto.description,
        reference: `SCP-APT-${investment.project.code}-${investment.id.substring(0, 8)}`,
        documentType: uploadDto.category || 'Comprovante',
        tags: tagsArray,
      },
      companyId,
      userId,
    );

    // Adicionar URL do documento ao array de attachments do aporte
    const documentUrl = `/documents/${uploadResult.id}`;
    await this.prisma.investment.update({
      where: { id: uploadDto.investmentId },
      data: {
        attachments: {
          push: documentUrl,
        },
      },
    });

    return {
      ...uploadResult,
      investmentId: uploadDto.investmentId,
      projectCode: investment.project.code,
      projectName: investment.project.name,
      investorName: investment.investor.type === 'PESSOA_FISICA'
        ? investment.investor.fullName
        : investment.investor.companyName,
      amount: investment.amount,
      investmentDate: investment.investmentDate,
    };
  }

  /**
   * Lista documentos de um aporte
   */
  async listInvestmentDocuments(
    companyId: string,
    userId: string,
    investmentId: string,
    page: number = 1,
    limit: number = 20,
  ) {
    // Verificar se aporte existe e pertence à empresa
    const investment = await this.prisma.investment.findFirst({
      where: {
        id: investmentId,
        companyId,
      },
    });

    if (!investment) {
      throw new NotFoundException('Aporte não encontrado');
    }

    // Verificar permissões
    await this.checkUserPermissions(userId, companyId);

    // Buscar todos os documentos relacionados ao aporte
    // Busca pela tag do ID do aporte
    const where: any = {
      companyId,
      tags: {
        has: investmentId, // Busca documentos que contenham o ID do aporte nas tags
      },
    };

    const [documents, total] = await Promise.all([
      this.prisma.document.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          folder: {
            select: {
              id: true,
              name: true,
            },
          },
          uploadedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.document.count({ where }),
    ]);

    return {
      data: documents,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Faz download de um documento do aporte
   */
  async downloadDocument(
    companyId: string,
    userId: string,
    documentId: string,
  ) {
    // Verificar permissões
    await this.checkUserPermissions(userId, companyId);

    // Buscar documento
    const document = await this.prisma.document.findFirst({
      where: {
        id: documentId,
        companyId,
      },
    });

    if (!document) {
      throw new NotFoundException('Documento não encontrado');
    }

    return document;
  }

  /**
   * Deleta um documento do aporte
   */
  async deleteDocument(
    companyId: string,
    userId: string,
    documentId: string,
  ) {
    // Verificar permissões
    await this.checkUserPermissions(userId, companyId);

    // Buscar o documento para pegar as tags
    const document = await this.prisma.document.findFirst({
      where: {
        id: documentId,
        companyId,
      },
    });

    if (!document) {
      throw new NotFoundException('Documento não encontrado');
    }

    // Verificar se é um documento de aporte (tem tag 'Aporte' ou 'Investimento')
    const isInvestmentDoc = document.tags.some(
      (tag) => tag === 'Aporte' || tag === 'Investimento',
    );

    if (!isInvestmentDoc) {
      throw new ForbiddenException('Este documento não pertence a um aporte');
    }

    // Encontrar o investmentId nas tags (é um UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const investmentId = document.tags.find((tag) => uuidRegex.test(tag));

    if (investmentId) {
      // Remover URL do documento do array de attachments do aporte
      const investment = await this.prisma.investment.findUnique({
        where: { id: investmentId },
      });

      if (investment) {
        const documentUrl = `/documents/${documentId}`;
        const updatedAttachments = investment.attachments.filter(
          (url) => url !== documentUrl,
        );

        await this.prisma.investment.update({
          where: { id: investmentId },
          data: {
            attachments: updatedAttachments,
          },
        });
      }
    }

    // Deletar documento usando o serviço de documentos
    return this.documentsService.deleteDocument(documentId, companyId, userId);
  }

  /**
   * Verifica se usuário tem permissão para acessar módulo SCP
   */
  private async checkUserPermissions(userId: string, companyId: string) {
    // Buscar permissões do usuário
    const userCompany = await this.prisma.userCompany.findFirst({
      where: {
        userId,
        companyId,
      },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!userCompany) {
      throw new ForbiddenException('Usuário não pertence a esta empresa');
    }

    // Verificar se é admin (tem acesso total)
    if (userCompany.role.name === 'Admin' || userCompany.role.name === 'Administrador') {
      return true;
    }

    // Verificar se tem permissão específica para investidores/SCP/documentos
    const hasScpPermission = userCompany.role.rolePermissions.some(
      (rp) =>
        rp.permission.resource === 'investidores' ||
        rp.permission.resource === 'scp' ||
        rp.permission.resource === 'projetos_scp' ||
        rp.permission.resource === 'aportes' ||
        rp.permission.resource === 'investments' ||
        rp.permission.resource === 'documents',
    );

    if (!hasScpPermission) {
      throw new ForbiddenException(
        'Usuário não tem permissão para acessar o módulo SCP',
      );
    }

    return true;
  }
}
