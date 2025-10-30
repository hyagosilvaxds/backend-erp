import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { Cron } from '@nestjs/schedule';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { QueryDocumentsDto } from './dto/query-documents.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DocumentsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  // ==================== HELPERS ====================

  async getUserRoles(userId: string, companyId: string) {
    const userCompany = await this.prisma.userCompany.findFirst({
      where: {
        userId,
        companyId,
      },
      select: {
        roleId: true,
        role: {
          select: {
            rolePermissions: {
              select: {
                permission: {
                  select: {
                    resource: true,
                    action: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!userCompany) {
      return null;
    }

    // Verificar se tem permissão view_all
    const hasViewAllPermission = userCompany.role.rolePermissions.some(
      (rp) =>
        rp.permission.resource === 'documents' &&
        rp.permission.action === 'view_all',
    );

    return {
      roleIds: [userCompany.roleId],
      hasViewAllPermission,
    };
  }

  // ==================== PASTAS ====================

  async findAllFolders(
    companyId: string,
    parentId?: string,
    userId?: string,
    userRoleIds?: string[],
    hasViewAllPermission?: boolean,
  ) {
    const folders = await this.prisma.documentFolder.findMany({
      where: {
        companyId,
        parentId: parentId === 'null' || !parentId ? null : parentId,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            documents: true,
            subfolders: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Se tem permissão view_all, retorna todas as pastas
    if (hasViewAllPermission) {
      return folders.map((folder) => ({
        ...folder,
        documentsCount: folder._count.documents,
        subfoldersCount: folder._count.subfolders,
      }));
    }

    // Filtrar pastas baseado em permissões
    const filteredFolders = folders.filter((folder) => {
      // Se o usuário criou a pasta, pode visualizar
      if (folder.createdById === userId) {
        return true;
      }

      // Se a pasta é pública ou não tem restrições, todos podem ver
      if (folder.isPublic || folder.allowedRoleIds.length === 0) {
        return true;
      }

      // Verificar se o usuário tem alguma das roles permitidas
      if (userRoleIds && userRoleIds.length > 0) {
        return folder.allowedRoleIds.some((roleId) =>
          userRoleIds.includes(roleId),
        );
      }

      return false;
    });

    return filteredFolders.map((folder) => ({
      ...folder,
      documentsCount: folder._count.documents,
      subfoldersCount: folder._count.subfolders,
    }));
  }

  async createFolder(dto: CreateFolderDto, companyId: string, userId: string) {
    // Verificar se pasta pai existe (se fornecida)
    if (dto.parentId) {
      const parent = await this.prisma.documentFolder.findUnique({
        where: { id: dto.parentId },
      });

      if (!parent || parent.companyId !== companyId) {
        throw new NotFoundException('Pasta pai não encontrada');
      }
    }

    const folder = await this.prisma.documentFolder.create({
      data: {
        ...dto,
        companyId,
        createdById: userId,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Auditoria
    await this.auditService.log({
      companyId,
      userId,
      action: 'CREATE_FOLDER',
      entityType: 'DocumentFolder',
      newValue: { 
        folderId: folder.id,
        folderName: folder.name,
        parentId: folder.parentId,
        isPublic: folder.isPublic,
        allowedRoleIds: folder.allowedRoleIds,
      },
      description: `Pasta criada: ${folder.name}`,
    });

    return folder;
  }

  async updateFolder(id: string, dto: UpdateFolderDto, companyId: string, userId: string) {
    const folder = await this.prisma.documentFolder.findUnique({
      where: { id },
    });

    if (!folder || folder.companyId !== companyId) {
      throw new NotFoundException('Pasta não encontrada');
    }

    const updatedFolder = await this.prisma.documentFolder.update({
      where: { id },
      data: dto,
    });

    // Auditoria
    await this.auditService.log({
      companyId,
      userId,
      action: 'UPDATE_FOLDER',
      entityType: 'DocumentFolder',
      oldValue: {
        name: folder.name,
        description: folder.description,
        color: folder.color,
        icon: folder.icon,
        isPublic: folder.isPublic,
        allowedRoleIds: folder.allowedRoleIds,
      },
      newValue: {
        name: updatedFolder.name,
        description: updatedFolder.description,
        color: updatedFolder.color,
        icon: updatedFolder.icon,
        isPublic: updatedFolder.isPublic,
        allowedRoleIds: updatedFolder.allowedRoleIds,
      },
      description: `Pasta atualizada: ${updatedFolder.name}`,
    });

    return updatedFolder;
  }

  async deleteFolder(id: string, companyId: string, userId: string, force: boolean = false) {
    const folder = await this.prisma.documentFolder.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            documents: true,
            subfolders: true,
          },
        },
      },
    });

    if (!folder || folder.companyId !== companyId) {
      throw new NotFoundException('Pasta não encontrada');
    }

    if (
      !force &&
      (folder._count.documents > 0 || folder._count.subfolders > 0)
    ) {
      throw new BadRequestException(
        `Não é possível deletar pasta com ${folder._count.documents} documentos e ${folder._count.subfolders} subpastas. Use force=true para forçar.`,
      );
    }

    // Deletar arquivos físicos se force=true
    if (force) {
      const documents = await this.prisma.document.findMany({
        where: { folderId: id },
      });

      for (const doc of documents) {
        this.deletePhysicalFile(doc.filePath);
      }
    }

    await this.prisma.documentFolder.delete({
      where: { id },
    });

    // Auditoria
    await this.auditService.log({
      companyId,
      userId,
      action: 'DELETE_FOLDER',
      entityType: 'DocumentFolder',
      oldValue: {
        folderId: folder.id,
        folderName: folder.name,
        documentsCount: folder._count.documents,
        subfoldersCount: folder._count.subfolders,
        forced: force,
      },
      description: `Pasta removida: ${folder.name}${force ? ' (forçado)' : ''}`,
    });
  }

  // ==================== DOCUMENTOS ====================

  async findDocuments(
    companyId: string,
    query: QueryDocumentsDto,
    userId?: string,
    userRoleIds?: string[],
    hasViewAllPermission?: boolean,
  ) {
    const {
      folderId,
      documentType,
      tags,
      expired,
      expiresIn,
      search,
      page = 1,
      limit = 50,
    } = query;

    const where: any = { companyId };

    if (folderId) {
      where.folderId = folderId === 'null' ? null : folderId;
    }

    if (documentType) {
      where.documentType = documentType;
    }

    if (tags && tags.length > 0) {
      where.tags = {
        hasSome: tags,
      };
    }

    if (expired !== undefined) {
      where.isExpired = expired;
    }

    if (expiresIn) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + expiresIn);

      where.expiresAt = {
        gte: new Date(),
        lte: futureDate,
      };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { reference: { contains: search, mode: 'insensitive' } },
        { fileName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const documents = await this.prisma.document.findMany({
      where,
      include: {
        folder: {
          select: {
            id: true,
            name: true,
            color: true,
            isPublic: true,
            allowedRoleIds: true,
            createdById: true,
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Se tem permissão view_all, não filtra
    const filteredDocuments = hasViewAllPermission
      ? documents
      : documents.filter((doc) => {
          // Se o documento é público, SEMPRE pode visualizar (ignora restrições da pasta)
          if (doc.isPublic) {
            return true;
          }

          // Se o usuário fez upload do documento, pode visualizar
          if (doc.uploadedById === userId) {
            return true;
          }

          // Verificar acesso à pasta (se o documento estiver em uma pasta)
          if (doc.folder) {
            // Se o usuário criou a pasta, pode ver os documentos dela
            if (doc.folder.createdById === userId) {
              // Mas ainda precisa verificar as restrições do documento
              // Continue para as verificações do documento
            } else {
              // Se a pasta tem restrições e o usuário não tem acesso, bloqueia
              if (
                !doc.folder.isPublic &&
                doc.folder.allowedRoleIds.length > 0
              ) {
                const hasAccessToFolder =
                  userRoleIds &&
                  userRoleIds.some(
                    (roleId) =>
                      doc.folder?.allowedRoleIds.includes(roleId) || false,
                  );

                if (!hasAccessToFolder) {
                  return false; // Sem acesso à pasta, bloqueia o documento
                }
              }
            }
          }

          // Verificar restrições do próprio documento
          // Se não tem restrições, todos podem ver
          if (doc.allowedRoleIds.length === 0) {
            return true;
          }

          // Verificar se o usuário tem alguma das roles permitidas no documento
          if (userRoleIds && userRoleIds.length > 0) {
            return doc.allowedRoleIds.some((roleId) =>
              userRoleIds.includes(roleId),
            );
          }

          return false;
        });

    // Aplicar paginação aos documentos filtrados
    const total = filteredDocuments.length;
    const paginatedDocuments = filteredDocuments.slice(
      (page - 1) * limit,
      page * limit,
    );

    const documentsWithExpiration = paginatedDocuments.map((doc) => {
      let daysUntilExpiration: number | null = null;

      if (doc.expiresAt) {
        const now = new Date();
        const expires = new Date(doc.expiresAt);
        const diff = expires.getTime() - now.getTime();
        daysUntilExpiration = Math.ceil(diff / (1000 * 60 * 60 * 24));
      }

      return {
        ...doc,
        daysUntilExpiration,
        downloadUrl: `/documents/${doc.id}/download`,
      };
    });

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      documents: documentsWithExpiration,
    };
  }

  async findOneDocument(id: string, companyId: string) {
    const document = await this.prisma.document.findUnique({
      where: { id },
      include: {
        folder: true,
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        previousVersion: {
          select: {
            id: true,
            name: true,
            version: true,
            createdAt: true,
            uploadedBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        nextVersions: {
          select: {
            id: true,
            name: true,
            version: true,
            createdAt: true,
            uploadedBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!document || document.companyId !== companyId) {
      throw new NotFoundException('Documento não encontrado');
    }

    // Buscar todas as versões (anteriores e posteriores)
    const allVersions = await this.getAllVersions(id, companyId);

    return {
      ...document,
      allVersions,
    };
  }

  // Método auxiliar para buscar todas as versões de um documento
  private async getAllVersions(documentId: string, companyId: string) {
    // Encontrar a primeira versão
    let firstVersionId = documentId;
    let currentDoc = await this.prisma.document.findUnique({
      where: { id: documentId },
      select: { previousVersionId: true },
    });

    while (currentDoc?.previousVersionId) {
      firstVersionId = currentDoc.previousVersionId;
      currentDoc = await this.prisma.document.findUnique({
        where: { id: currentDoc.previousVersionId },
        select: { previousVersionId: true },
      });
    }

    // Buscar todas as versões a partir da primeira
    const versions: any[] = [];
    let nextVersionId: string | null = firstVersionId;

    while (nextVersionId) {
      const version = await this.prisma.document.findUnique({
        where: { id: nextVersionId },
        select: {
          id: true,
          name: true,
          fileName: true,
          fileSize: true,
          version: true,
          isLatest: true,
          createdAt: true,
          uploadedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (version) {
        versions.push(version);
      }

      // Buscar próxima versão
      const nextVersion = await this.prisma.document.findFirst({
        where: {
          companyId,
          previousVersionId: nextVersionId,
        },
        select: { id: true },
      });

      nextVersionId = nextVersion?.id || null;
    }

    return versions.sort((a, b) => b.version - a.version); // Ordenar do mais recente para o mais antigo
  }

  async uploadDocument(
    file: Express.Multer.File,
    dto: UploadDocumentDto,
    companyId: string,
    userId: string,
  ) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo foi enviado');
    }

    // Verificar se pasta existe (se fornecida)
    if (dto.folderId) {
      const folder = await this.prisma.documentFolder.findUnique({
        where: { id: dto.folderId },
      });

      if (!folder || folder.companyId !== companyId) {
        throw new NotFoundException('Pasta não encontrada');
      }
    }

    // Verificar se referência é única (se fornecida)
    if (dto.reference) {
      const existing = await this.prisma.document.findFirst({
        where: {
          companyId,
          reference: dto.reference,
        },
      });

      if (existing) {
        throw new ConflictException(
          `Já existe um documento com a referência ${dto.reference}`,
        );
      }
    }

    // Criar documento
    const document = await this.prisma.document.create({
      data: {
        companyId,
        folderId: dto.folderId || null,
        name: dto.name || file.originalname,
        description: dto.description,
        fileName: file.originalname,
        filePath: file.path,
        fileSize: file.size,
        mimeType: file.mimetype,
        fileExtension: path.extname(file.originalname),
        reference: dto.reference,
        documentType: dto.documentType,
        tags: dto.tags || [],
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        isPublic: dto.isPublic || false,
        allowedRoleIds: dto.allowedRoleIds || [],
        uploadedById: userId,
      },
      include: {
        folder: true,
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Auditoria
    await this.auditService.log({
      companyId,
      userId,
      action: 'UPLOAD_DOCUMENT',
      entityType: 'Document',
      newValue: {
        documentId: document.id,
        documentName: document.name,
        fileName: document.fileName,
        fileSize: document.fileSize,
        mimeType: document.mimeType,
        folderId: document.folderId,
        reference: document.reference,
        documentType: document.documentType,
        isPublic: document.isPublic,
        allowedRoleIds: document.allowedRoleIds,
      },
      description: `Documento enviado: ${document.name}`,
    });

    return document;
  }

  async updateDocument(
    id: string,
    dto: UpdateDocumentDto,
    companyId: string,
    userId: string,
  ) {
    const document = await this.findOneDocument(id, companyId);

    // Verificar nova pasta (se fornecida)
    if (dto.folderId && dto.folderId !== document.folderId) {
      const folder = await this.prisma.documentFolder.findUnique({
        where: { id: dto.folderId },
      });

      if (!folder || folder.companyId !== companyId) {
        throw new NotFoundException('Pasta não encontrada');
      }
    }

    // Verificar referência única (se alterada)
    if (dto.reference && dto.reference !== document.reference) {
      const existing = await this.prisma.document.findFirst({
        where: {
          companyId,
          reference: dto.reference,
          id: { not: id },
        },
      });

      if (existing) {
        throw new ConflictException(
          `Já existe um documento com a referência ${dto.reference}`,
        );
      }
    }

    const updatedDocument = await this.prisma.document.update({
      where: { id },
      data: {
        ...dto,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      },
      include: {
        folder: true,
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Auditoria
    await this.auditService.log({
      companyId,
      userId,
      action: 'UPDATE_DOCUMENT',
      entityType: 'Document',
      oldValue: {
        name: document.name,
        description: document.description,
        folderId: document.folderId,
        reference: document.reference,
        documentType: document.documentType,
        tags: document.tags,
        isPublic: document.isPublic,
        allowedRoleIds: document.allowedRoleIds,
      },
      newValue: {
        name: updatedDocument.name,
        description: updatedDocument.description,
        folderId: updatedDocument.folderId,
        reference: updatedDocument.reference,
        documentType: updatedDocument.documentType,
        tags: updatedDocument.tags,
        isPublic: updatedDocument.isPublic,
        allowedRoleIds: updatedDocument.allowedRoleIds,
      },
      description: `Documento atualizado: ${updatedDocument.name}`,
    });

    return updatedDocument;
  }

  async deleteDocument(
    id: string,
    companyId: string,
    userId: string,
    deleteAllVersions: boolean = false,
  ) {
    const document = await this.findOneDocument(id, companyId);

    // Deletar arquivo físico
    this.deletePhysicalFile(document.filePath);

    // Deletar do banco
    await this.prisma.document.delete({
      where: { id },
    });

    // Auditoria
    await this.auditService.log({
      companyId,
      userId,
      action: 'DELETE_DOCUMENT',
      entityType: 'Document',
      oldValue: {
        documentId: document.id,
        documentName: document.name,
        fileName: document.fileName,
        fileSize: document.fileSize,
        mimeType: document.mimeType,
        version: document.version,
        folderId: document.folderId,
        reference: document.reference,
      },
      description: `Documento removido: ${document.name}`,
    });

    // TODO: Implementar deleção de todas as versões se deleteAllVersions=true
  }

  async uploadNewVersion(
    id: string,
    file: Express.Multer.File,
    description: string,
    companyId: string,
    userId: string,
  ) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo foi enviado');
    }

    const originalDoc = await this.findOneDocument(id, companyId);

    // Marcar documento original como não sendo mais a última versão
    await this.prisma.document.update({
      where: { id },
      data: { isLatest: false },
    });

    // Criar nova versão
    const newVersion = await this.prisma.document.create({
      data: {
        companyId,
        folderId: originalDoc.folderId,
        name: originalDoc.name,
        description: description || originalDoc.description,
        fileName: file.originalname,
        filePath: file.path,
        fileSize: file.size,
        mimeType: file.mimetype,
        fileExtension: path.extname(file.originalname),
        reference: originalDoc.reference,
        documentType: originalDoc.documentType,
        tags: originalDoc.tags,
        expiresAt: originalDoc.expiresAt,
        isPublic: originalDoc.isPublic,
        allowedRoleIds: originalDoc.allowedRoleIds,
        version: originalDoc.version + 1,
        previousVersionId: id,
        isLatest: true,
        uploadedById: userId,
      },
      include: {
        folder: true,
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Auditoria
    await this.auditService.log({
      companyId,
      userId,
      action: 'UPLOAD_NEW_VERSION',
      entityType: 'Document',
      newValue: {
        documentId: newVersion.id,
        documentName: newVersion.name,
        fileName: newVersion.fileName,
        fileSize: newVersion.fileSize,
        version: newVersion.version,
        previousVersionId: id,
        previousVersion: originalDoc.version,
      },
      description: `Nova versão enviada: ${newVersion.name} (v${newVersion.version})`,
    });

    return newVersion;
  }

  async getExpiredDocuments(companyId: string, daysAhead: number = 30) {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    const [expired, expiringSoon] = await Promise.all([
      // Documentos já vencidos
      this.prisma.document.findMany({
        where: {
          companyId,
          expiresAt: {
            lt: now,
          },
          isExpired: true,
        },
        include: {
          uploadedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          expiresAt: 'asc',
        },
      }),
      // Documentos vencendo em breve
      this.prisma.document.findMany({
        where: {
          companyId,
          expiresAt: {
            gte: now,
            lte: futureDate,
          },
          isExpired: false,
        },
        include: {
          uploadedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          expiresAt: 'asc',
        },
      }),
    ]);

    const expiredWithDays = expired.map((doc) => {
      const diff = now.getTime() - new Date(doc.expiresAt!).getTime();
      return {
        ...doc,
        daysExpired: Math.ceil(diff / (1000 * 60 * 60 * 24)),
      };
    });

    const expiringSoonWithDays = expiringSoon.map((doc) => {
      const diff = new Date(doc.expiresAt!).getTime() - now.getTime();
      return {
        ...doc,
        daysUntilExpiration: Math.ceil(diff / (1000 * 60 * 60 * 24)),
      };
    });

    return {
      expired: expiredWithDays,
      expiringSoon: expiringSoonWithDays,
    };
  }

  async getStatistics(companyId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const [
      total,
      documents,
      expired,
      expiringSoon,
      uploadsThisMonth,
    ] = await Promise.all([
      this.prisma.document.count({ where: { companyId } }),
      this.prisma.document.findMany({
        where: { companyId },
        select: {
          fileSize: true,
          documentType: true,
          folderId: true,
          fileExtension: true,
          mimeType: true,
          createdAt: true,
        },
      }),
      this.prisma.document.count({
        where: { companyId, isExpired: true },
      }),
      this.prisma.document.count({
        where: {
          companyId,
          expiresAt: {
            gte: new Date(),
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
          isExpired: false,
        },
      }),
      this.prisma.document.count({
        where: {
          companyId,
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      }),
    ]);

    const totalSize = documents.reduce((sum, doc) => sum + doc.fileSize, 0);

    // Contagem por tipo de documento
    const byDocumentType: Record<string, number> = {};
    // Contagem por extensão de arquivo
    const byFileExtension: Record<string, number> = {};
    // Contagem por tipo MIME
    const byMimeType: Record<string, number> = {};
    // Contagem por pasta
    const byFolder: Record<string, number> = {};

    documents.forEach((doc) => {
      // Tipo de documento (invoice, contract, etc)
      if (doc.documentType) {
        byDocumentType[doc.documentType] = (byDocumentType[doc.documentType] || 0) + 1;
      }

      // Extensão do arquivo
      if (doc.fileExtension) {
        const ext = doc.fileExtension.toLowerCase();
        byFileExtension[ext] = (byFileExtension[ext] || 0) + 1;
      }

      // Tipo MIME
      if (doc.mimeType) {
        byMimeType[doc.mimeType] = (byMimeType[doc.mimeType] || 0) + 1;
      }

      // Pasta
      const folderKey = doc.folderId || 'without-folder';
      byFolder[folderKey] = (byFolder[folderKey] || 0) + 1;
    });

    // Uploads recentes (últimos 7 dias)
    const recentUploads = documents.filter((doc) => {
      const daysDiff =
        (Date.now() - doc.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 7;
    }).length;

    // Quantidade de tipos diferentes
    const differentFileTypes = Object.keys(byFileExtension).length;
    const differentMimeTypes = Object.keys(byMimeType).length;
    const differentDocumentTypes = Object.keys(byDocumentType).length;

    return {
      // Contadores gerais
      total,
      totalSize,
      totalSizeFormatted: this.formatFileSize(totalSize),
      
      // Uploads do mês atual
      uploadsThisMonth,
      
      // Quantidade de tipos diferentes
      differentFileTypes,
      differentMimeTypes,
      differentDocumentTypes,
      
      // Distribuição por tipo de documento (invoice, contract, etc)
      byDocumentType,
      
      // Distribuição por extensão (.pdf, .jpg, etc)
      byFileExtension,
      
      // Distribuição por tipo MIME
      byMimeType,
      
      // Distribuição por pasta
      byFolder,
      
      // Validade
      expired,
      expiringSoon,
      
      // Uploads recentes
      recentUploads,
    };
  }

  // ==================== CRON JOBS ====================

  @Cron('0 0 * * *') // Meia-noite todos os dias
  async markExpiredDocuments() {
    const now = new Date();

    const result = await this.prisma.document.updateMany({
      where: {
        expiresAt: {
          lt: now,
        },
        isExpired: false,
      },
      data: {
        isExpired: true,
      },
    });

    if (result.count > 0) {
      console.log(`✅ Marcados ${result.count} documentos como vencidos`);
    }
  }

  // ==================== HELPERS ====================

  private deletePhysicalFile(filePath: string) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error(`Erro ao deletar arquivo físico: ${filePath}`, error);
    }
  }

  private formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024)
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  }
}
