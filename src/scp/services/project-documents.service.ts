import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DocumentsService } from '../../documents/documents.service';
import { UploadProjectDocumentDto } from '../dto/upload-project-document.dto';

@Injectable()
export class ProjectDocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly documentsService: DocumentsService,
  ) {}

  /**
   * Cria estrutura de pastas para documentos de projetos SCP
   * Estrutura: SCP / Projetos / [Nome do Projeto] / [Categoria]
   */
  async ensureProjectDocumentFolder(
    companyId: string,
    projectId: string,
    category: string = 'Geral',
    userId: string,
  ): Promise<string> {
    // Buscar informações do projeto
    const project = await this.prisma.scpProject.findFirst({
      where: {
        id: projectId,
        companyId,
      },
    });

    if (!project) {
      throw new NotFoundException('Projeto não encontrado');
    }

    // 1. Pasta raiz: SCP
    const scpFolder = await this.documentsService.findOrCreateFolder(
      'SCP',
      companyId,
      undefined,
      userId,
    );

    // 2. Pasta: Projetos
    const projetosFolder = await this.documentsService.findOrCreateFolder(
      'Projetos',
      companyId,
      scpFolder.id,
      userId,
    );

    // 3. Pasta do projeto específico (usando código + nome)
    const projectFolderName = `${project.code} - ${project.name}`;
    const projectFolder = await this.documentsService.findOrCreateFolder(
      projectFolderName,
      companyId,
      projetosFolder.id,
      userId,
    );

    // 4. Pasta da categoria (se não for 'Geral')
    if (category && category !== 'Geral') {
      const categoryFolder = await this.documentsService.findOrCreateFolder(
        category,
        companyId,
        projectFolder.id,
        userId,
      );
      return categoryFolder.id;
    }

    return projectFolder.id;
  }

  /**
   * Faz upload de documento para um projeto
   */
  async uploadDocument(
    companyId: string,
    userId: string,
    uploadDto: UploadProjectDocumentDto,
    file: Express.Multer.File,
  ) {
    // Verificar se projeto existe e pertence à empresa
    const project = await this.prisma.scpProject.findFirst({
      where: {
        id: uploadDto.projectId,
        companyId,
      },
    });

    if (!project) {
      throw new NotFoundException('Projeto não encontrado');
    }

    // Verificar permissões do usuário (deve ter acesso ao módulo SCP)
    await this.checkUserPermissions(userId, companyId);

    // Obter ou criar pasta do projeto
    const folderId = await this.ensureProjectDocumentFolder(
      companyId,
      uploadDto.projectId,
      uploadDto.category,
      userId,
    );

    // Fazer upload do documento usando DocumentsService
    const tagsArray = uploadDto.tags ? uploadDto.tags.split(',').map((t) => t.trim()) : [];
    tagsArray.push('SCP', 'Projeto', project.code);
    if (uploadDto.category) {
      tagsArray.push(uploadDto.category);
    }

    const uploadResult = await this.documentsService.uploadDocument(
      file,
      {
        folderId,
        name: uploadDto.name,
        description: uploadDto.description,
        reference: `SCP-${project.code}`,
        documentType: uploadDto.category || 'OUTRO',
        tags: tagsArray,
      },
      companyId,
      userId,
    );

    // Adicionar URL do documento ao array de attachments do projeto
    const documentUrl = `/documents/${uploadResult.id}`;
    await this.prisma.scpProject.update({
      where: { id: uploadDto.projectId },
      data: {
        attachments: {
          push: documentUrl,
        },
      },
    });

    return {
      ...uploadResult,
      projectId: uploadDto.projectId,
      projectCode: project.code,
      projectName: project.name,
    };
  }

  /**
   * Lista documentos de um projeto
   */
  async listProjectDocuments(
    companyId: string,
    userId: string,
    projectId: string,
    page: number = 1,
    limit: number = 20,
  ) {
    // Verificar se projeto existe e pertence à empresa
    const project = await this.prisma.scpProject.findFirst({
      where: {
        id: projectId,
        companyId,
      },
    });

    if (!project) {
      throw new NotFoundException('Projeto não encontrado');
    }

    // Verificar permissões
    await this.checkUserPermissions(userId, companyId);

    // Buscar todos os documentos relacionados ao projeto
    // Busca pela tag do código do projeto
    const where: any = {
      companyId,
      tags: {
        has: project.code, // Busca documentos que contenham o código do projeto nas tags
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
      data: documents.map((doc) => ({
        ...doc,
        projectId,
        projectCode: project.code,
        projectName: project.name,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Baixa um documento do projeto
   */
  async downloadDocument(
    companyId: string,
    userId: string,
    documentId: string,
  ) {
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

    // Verificar se documento pertence a um projeto SCP (tem tag 'SCP')
    if (!document.tags.includes('SCP')) {
      throw new ForbiddenException('Documento não pertence ao módulo SCP');
    }

    // Verificar permissões
    await this.checkUserPermissions(userId, companyId);

    // Retornar informações do arquivo
    return {
      filePath: document.filePath,
      fileName: document.fileName,
      mimeType: document.mimeType,
      originalName: document.name,
    };
  }

  /**
   * Remove documento do projeto
   */
  async deleteDocument(
    companyId: string,
    userId: string,
    documentId: string,
  ) {
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

    // Verificar se documento pertence a um projeto SCP
    if (!document.tags.includes('SCP')) {
      throw new ForbiddenException('Documento não pertence ao módulo SCP');
    }

    // Verificar permissões
    await this.checkUserPermissions(userId, companyId);

    // Extrair código do projeto das tags
    const projectCodeTag = document.tags.find((tag) => 
      tag.startsWith('SOLAR-') || tag.startsWith('PROJ-') || tag.includes('-')
    );

    // Remover referência do projeto se existir
    if (projectCodeTag) {
      const documentUrl = `/documents/${documentId}`;
      const project = await this.prisma.scpProject.findFirst({
        where: {
          code: projectCodeTag,
          companyId,
        },
      });

      if (project && project.attachments.includes(documentUrl)) {
        await this.prisma.scpProject.update({
          where: { id: project.id },
          data: {
            attachments: project.attachments.filter((url) => url !== documentUrl),
          },
        });
      }
    }

    // Deletar documento usando DocumentsService
    return this.documentsService.deleteDocument(documentId, companyId, userId);
  }

  /**
   * Verifica se usuário tem permissões para acessar documentos SCP
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

    // Verificar se tem permissão específica para investidores/SCP
    const hasScpPermission = userCompany.role.rolePermissions.some(
      (rp) =>
        rp.permission.resource === 'investidores' ||
        rp.permission.resource === 'scp' ||
        rp.permission.resource === 'projetos_scp' ||
        rp.permission.resource === 'documents',
    );

    if (!hasScpPermission) {
      throw new ForbiddenException(
        'Usuário não tem permissões para acessar documentos de projetos SCP',
      );
    }

    return true;
  }
}
