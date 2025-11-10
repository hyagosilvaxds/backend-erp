import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DocumentsService } from '../documents/documents.service';
import { AuditService } from '../audit/audit.service';
import { CreateLegalCategoryDto } from './dto/create-legal-category.dto';
import { UpdateLegalCategoryDto } from './dto/update-legal-category.dto';
import { CreateLegalDocumentDto } from './dto/create-legal-document.dto';
import { UpdateLegalDocumentDto } from './dto/update-legal-document.dto';
import { QueryLegalDocumentsDto } from './dto/query-legal-documents.dto';

@Injectable()
export class LegalService {
  constructor(
    private prisma: PrismaService,
    private documentsService: DocumentsService,
    private auditService: AuditService,
  ) {}

  // ==================== CATEGORIAS ====================

  async createCategory(
    companyId: string,
    userId: string,
    dto: CreateLegalCategoryDto,
  ) {
    // Verificar se já existe categoria com este nome
    const existing = await this.prisma.legalDocumentCategory.findFirst({
      where: {
        companyId,
        name: dto.name,
      },
    });

    if (existing) {
      throw new BadRequestException('Já existe uma categoria com este nome');
    }

    const category = await this.prisma.legalDocumentCategory.create({
      data: {
        companyId,
        ...dto,
      },
    });

    await this.auditService.log({
      companyId,
      userId,
      action: 'CREATE',
      entityType: 'LegalDocumentCategory',
      description: `Categoria jurídica criada: ${category.name}`,
    });

    return category;
  }

  async findAllCategories(companyId: string) {
    return this.prisma.legalDocumentCategory.findMany({
      where: { companyId },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            legalDocuments: true,
          },
        },
      },
    });
  }

  async findCategoryById(id: string, companyId: string) {
    const category = await this.prisma.legalDocumentCategory.findFirst({
      where: { id, companyId },
      include: {
        _count: {
          select: {
            legalDocuments: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    return category;
  }

  async updateCategory(
    id: string,
    companyId: string,
    userId: string,
    dto: UpdateLegalCategoryDto,
  ) {
    const category = await this.findCategoryById(id, companyId);

    // Se está alterando o nome, verificar duplicação
    if (dto.name && dto.name !== category.name) {
      const existing = await this.prisma.legalDocumentCategory.findFirst({
        where: {
          companyId,
          name: dto.name,
          id: { not: id },
        },
      });

      if (existing) {
        throw new BadRequestException('Já existe uma categoria com este nome');
      }
    }

    const updated = await this.prisma.legalDocumentCategory.update({
      where: { id },
      data: dto,
    });

    await this.auditService.log({
      companyId,
      userId,
      action: 'UPDATE',
      entityType: 'LegalDocumentCategory',
      description: `Categoria jurídica atualizada: ${updated.name}`,
    });

    return updated;
  }

  async deleteCategory(id: string, companyId: string, userId: string) {
    const category = await this.findCategoryById(id, companyId);

    // Verificar se há documentos vinculados
    const documentsCount = await this.prisma.legalDocument.count({
      where: { categoryId: id },
    });

    if (documentsCount > 0) {
      throw new BadRequestException(
        `Não é possível excluir categoria com ${documentsCount} documento(s) vinculado(s)`,
      );
    }

    await this.prisma.legalDocumentCategory.delete({ where: { id } });

    await this.auditService.log({
      companyId,
      userId,
      action: 'DELETE',
      entityType: 'LegalDocumentCategory',
      description: `Categoria jurídica excluída: ${category.name}`,
    });

    return { message: 'Categoria excluída com sucesso' };
  }

  // ==================== DOCUMENTOS JURÍDICOS ====================

  /**
   * Cria estrutura de pastas para documentos jurídicos
   * Estrutura: Jurídico / [Contratos ou Processos] / YYYY
   */
  private async ensureLegalFolder(
    companyId: string,
    type: string,
    userId: string,
  ): Promise<string> {
    // 1. Pasta raiz: Jurídico
    const juridicoFolder = await this.documentsService.findOrCreateFolder(
      'Jurídico',
      companyId,
      undefined,
      userId,
    );

    // 2. Subpasta por tipo: Contratos, Processos, etc
    let subfolder = 'Contratos';
    if (type.includes('PROCESSO')) {
      subfolder = 'Processos';
    }

    const typeFolder = await this.documentsService.findOrCreateFolder(
      subfolder,
      companyId,
      juridicoFolder.id,
      userId,
    );

    // 3. Subpasta por ano
    const year = new Date().getFullYear().toString();
    const yearFolder = await this.documentsService.findOrCreateFolder(
      year,
      companyId,
      typeFolder.id,
      userId,
    );

    return yearFolder.id;
  }

  async createDocument(
    companyId: string,
    userId: string,
    file: Express.Multer.File,
    dto: CreateLegalDocumentDto,
  ) {
    // Validar categoria se fornecida
    if (dto.categoryId) {
      await this.findCategoryById(dto.categoryId, companyId);
    }

    // Criar estrutura de pastas automaticamente
    const folderId = await this.ensureLegalFolder(
      companyId,
      dto.type,
      userId,
    );

    // Upload do documento no hub de documentos
    const document = await this.documentsService.uploadDocument(
      file,
      {
        name: dto.documentName || dto.title,
        description: dto.documentDescription || dto.description,
        folderId,
        documentType: 'juridico',
        reference: dto.reference,
        tags: ['juridico', dto.type.toLowerCase(), ...(dto.tags || [])],
        expiresAt: dto.dueDate,
        isPublic: false, // Documentos jurídicos não são públicos
        allowedRoleIds: [], // Será controlado por permissões do módulo jurídico
      },
      companyId,
      userId,
    );

    // Criar registro do documento jurídico
    const legalDocument = await this.prisma.legalDocument.create({
      data: {
        companyId,
        categoryId: dto.categoryId,
        documentId: document.id,
        type: dto.type,
        title: dto.title,
        description: dto.description,
        reference: dto.reference,
        parties: dto.parties || null,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        status: dto.status || 'ATIVO',
        value: dto.value,
        currency: dto.currency || 'BRL',
        notes: dto.notes,
        tags: dto.tags || [],
        alertDays: dto.alertDays || 30,
        createdById: userId,
      },
      include: {
        document: true,
        category: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    await this.auditService.log({
      companyId,
      userId,
      action: 'CREATE',
      entityType: 'LegalDocument',
      description: `Documento jurídico criado: ${legalDocument.title}`,
    });

    return legalDocument;
  }

  async findAllDocuments(companyId: string, query: QueryLegalDocumentsDto) {
    const {
      categoryId,
      type,
      status,
      search,
      reference,
      startDateFrom,
      startDateTo,
      dueDateFrom,
      dueDateTo,
      tags,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const where: any = { companyId, active: true };

    if (categoryId) where.categoryId = categoryId;
    if (type) where.type = type;
    if (status) where.status = status;
    if (reference) where.reference = { contains: reference, mode: 'insensitive' };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { reference: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (startDateFrom || startDateTo) {
      where.startDate = {};
      if (startDateFrom) where.startDate.gte = new Date(startDateFrom);
      if (startDateTo) where.startDate.lte = new Date(startDateTo);
    }

    if (dueDateFrom || dueDateTo) {
      where.dueDate = {};
      if (dueDateFrom) where.dueDate.gte = new Date(dueDateFrom);
      if (dueDateTo) where.dueDate.lte = new Date(dueDateTo);
    }

    if (tags && tags.length > 0) {
      where.tags = { hasSome: tags };
    }

    const [documents, total] = await Promise.all([
      this.prisma.legalDocument.findMany({
        where,
        include: {
          document: true,
          category: true,
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.legalDocument.count({ where }),
    ]);

    return {
      documents,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findDocumentById(id: string, companyId: string) {
    const document = await this.prisma.legalDocument.findFirst({
      where: { id, companyId, active: true },
      include: {
        document: true,
        category: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!document) {
      throw new NotFoundException('Documento jurídico não encontrado');
    }

    return document;
  }

  async updateDocument(
    id: string,
    companyId: string,
    userId: string,
    dto: UpdateLegalDocumentDto,
  ) {
    const document = await this.findDocumentById(id, companyId);

    // Validar categoria se fornecida
    if (dto.categoryId) {
      await this.findCategoryById(dto.categoryId, companyId);
    }

    const updated = await this.prisma.legalDocument.update({
      where: { id },
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
      include: {
        document: true,
        category: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    await this.auditService.log({
      companyId,
      userId,
      action: 'UPDATE',
      entityType: 'LegalDocument',
      description: `Documento jurídico atualizado: ${updated.title}`,
    });

    return updated;
  }

  async deleteDocument(id: string, companyId: string, userId: string) {
    const document = await this.findDocumentById(id, companyId);

    // Marcar como inativo (soft delete)
    await this.prisma.legalDocument.update({
      where: { id },
      data: { active: false },
    });

    await this.auditService.log({
      companyId,
      userId,
      action: 'DELETE',
      entityType: 'LegalDocument',
      description: `Documento jurídico excluído: ${document.title}`,
    });

    return { message: 'Documento excluído com sucesso' };
  }

  async getStatistics(companyId: string) {
    const [
      total,
      byType,
      byStatus,
      expiringSoon,
    ] = await Promise.all([
      this.prisma.legalDocument.count({
        where: { companyId, active: true },
      }),
      this.prisma.legalDocument.groupBy({
        by: ['type'],
        where: { companyId, active: true },
        _count: true,
      }),
      this.prisma.legalDocument.groupBy({
        by: ['status'],
        where: { companyId, active: true },
        _count: true,
      }),
      this.prisma.legalDocument.findMany({
        where: {
          companyId,
          active: true,
          dueDate: {
            gte: new Date(),
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
          },
        },
        select: {
          id: true,
          title: true,
          reference: true,
          dueDate: true,
          type: true,
        },
        orderBy: { dueDate: 'asc' },
      }),
    ]);

    return {
      total,
      byType,
      byStatus,
      expiringSoon,
    };
  }

  async getDashboard(companyId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysFromNow = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);

    const [
      // Totais gerais
      totalDocuments,
      totalContracts,
      totalProcesses,
      totalActive,
      
      // Por status
      byStatus,
      
      // Por tipo
      byType,
      
      // Por categoria
      byCategory,
      
      // Valores
      totalValue,
      totalContractValue,
      totalProcessValue,
      
      // Vencimentos
      expiredDocuments,
      expiringSoon30Days,
      expiringSoon60Days,
      
      // Recentes
      recentDocuments,
      
      // Documentos por mês (últimos 6 meses)
      documentsThisMonth,
      documentsThisYear,
    ] = await Promise.all([
      // Totais gerais
      this.prisma.legalDocument.count({ where: { companyId, active: true } }),
      this.prisma.legalDocument.count({ 
        where: { companyId, active: true, type: 'CONTRATO' } 
      }),
      this.prisma.legalDocument.count({ 
        where: { 
          companyId, 
          active: true, 
          type: { in: ['PROCESSO_TRABALHISTA', 'PROCESSO_CIVIL', 'PROCESSO_CRIMINAL'] } 
        } 
      }),
      this.prisma.legalDocument.count({ 
        where: { companyId, active: true, status: 'ATIVO' } 
      }),
      
      // Por status
      this.prisma.legalDocument.groupBy({
        by: ['status'],
        where: { companyId, active: true },
        _count: { _all: true },
      }),
      
      // Por tipo
      this.prisma.legalDocument.groupBy({
        by: ['type'],
        where: { companyId, active: true },
        _count: { _all: true },
      }),
      
      // Por categoria
      this.prisma.legalDocument.groupBy({
        by: ['categoryId'],
        where: { companyId, active: true, categoryId: { not: null } },
        _count: { _all: true },
      }),
      
      // Valores totais
      this.prisma.legalDocument.aggregate({
        where: { companyId, active: true, value: { not: null } },
        _sum: { value: true },
      }),
      this.prisma.legalDocument.aggregate({
        where: { companyId, active: true, type: 'CONTRATO', value: { not: null } },
        _sum: { value: true },
      }),
      this.prisma.legalDocument.aggregate({
        where: { 
          companyId, 
          active: true, 
          type: { in: ['PROCESSO_TRABALHISTA', 'PROCESSO_CIVIL', 'PROCESSO_CRIMINAL'] },
          value: { not: null } 
        },
        _sum: { value: true },
      }),
      
      // Vencidos
      this.prisma.legalDocument.findMany({
        where: {
          companyId,
          active: true,
          status: 'ATIVO',
          dueDate: { lt: now },
        },
        select: {
          id: true,
          title: true,
          reference: true,
          type: true,
          dueDate: true,
          value: true,
        },
        orderBy: { dueDate: 'asc' },
        take: 10,
      }),
      
      // Vencendo em 30 dias
      this.prisma.legalDocument.findMany({
        where: {
          companyId,
          active: true,
          status: 'ATIVO',
          dueDate: {
            gte: now,
            lte: thirtyDaysFromNow,
          },
        },
        select: {
          id: true,
          title: true,
          reference: true,
          type: true,
          dueDate: true,
          value: true,
        },
        orderBy: { dueDate: 'asc' },
      }),
      
      // Vencendo em 60 dias
      this.prisma.legalDocument.findMany({
        where: {
          companyId,
          active: true,
          status: 'ATIVO',
          dueDate: {
            gte: thirtyDaysFromNow,
            lte: sixtyDaysFromNow,
          },
        },
        select: {
          id: true,
          title: true,
          reference: true,
          type: true,
          dueDate: true,
        },
        orderBy: { dueDate: 'asc' },
        take: 10,
      }),
      
      // Documentos recentes
      this.prisma.legalDocument.findMany({
        where: { companyId, active: true },
        include: {
          category: true,
          createdBy: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      
      // Documentos deste mês
      this.prisma.legalDocument.count({
        where: {
          companyId,
          active: true,
          createdAt: { gte: startOfMonth },
        },
      }),
      
      // Documentos deste ano
      this.prisma.legalDocument.count({
        where: {
          companyId,
          active: true,
          createdAt: { gte: startOfYear },
        },
      }),
    ]);

    // Buscar nomes das categorias
    const categoryIds = byCategory.map(c => c.categoryId).filter(Boolean) as string[];
    const categories = await this.prisma.legalDocumentCategory.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true },
    });

    const categoryMap = new Map(categories.map(c => [c.id, c.name]));
    const byCategoryWithNames = byCategory.map(c => ({
      categoryId: c.categoryId,
      categoryName: c.categoryId ? categoryMap.get(c.categoryId) || 'Sem nome' : null,
      count: c._count._all,
    }));

    // Calcular documentos por mês (últimos 6 meses)
    const monthlyData: Array<{ month: string; count: number }> = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      const count = await this.prisma.legalDocument.count({
        where: {
          companyId,
          active: true,
          createdAt: {
            gte: date,
            lt: nextMonth,
          },
        },
      });

      monthlyData.push({
        month: date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
        count,
      });
    }

    return {
      overview: {
        total: totalDocuments,
        contracts: totalContracts,
        processes: totalProcesses,
        active: totalActive,
        thisMonth: documentsThisMonth,
        thisYear: documentsThisYear,
      },
      values: {
        total: totalValue._sum.value || 0,
        contracts: totalContractValue._sum.value || 0,
        processes: totalProcessValue._sum.value || 0,
      },
      byStatus: byStatus.map(s => ({
        status: s.status,
        count: s._count._all,
      })),
      byType: byType.map(t => ({
        type: t.type,
        count: t._count._all,
      })),
      byCategory: byCategoryWithNames,
      alerts: {
        expired: expiredDocuments,
        expiringSoon30: expiringSoon30Days,
        expiringSoon60: expiringSoon60Days,
      },
      recentDocuments,
      monthlyData,
    };
  }

  async getExpiring(companyId: string, days: number = 30) {
    const now = new Date();
    const futureDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    const documents = await this.prisma.legalDocument.findMany({
      where: {
        companyId,
        active: true,
        status: 'ATIVO',
        dueDate: {
          gte: now,
          lte: futureDate,
        },
      },
      include: {
        document: true,
        category: true,
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { dueDate: 'asc' },
    });

    return documents.map(doc => ({
      ...doc,
      daysUntilExpiration: Math.ceil(
        (doc.dueDate!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      ),
    }));
  }

  async getExpired(companyId: string) {
    const now = new Date();

    return this.prisma.legalDocument.findMany({
      where: {
        companyId,
        active: true,
        status: 'ATIVO',
        dueDate: { lt: now },
      },
      include: {
        document: true,
        category: true,
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { dueDate: 'desc' },
    });
  }

  async getByValue(companyId: string, minValue?: number, maxValue?: number) {
    const where: any = {
      companyId,
      active: true,
      value: { not: null },
    };

    if (minValue !== undefined) {
      where.value.gte = minValue;
    }
    if (maxValue !== undefined) {
      where.value.lte = maxValue;
    }

    return this.prisma.legalDocument.findMany({
      where,
      include: {
        document: true,
        category: true,
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { value: 'desc' },
    });
  }

  async getTimeline(companyId: string, year?: number) {
    const targetYear = year || new Date().getFullYear();
    const startDate = new Date(targetYear, 0, 1);
    const endDate = new Date(targetYear, 11, 31, 23, 59, 59);

    const documents = await this.prisma.legalDocument.findMany({
      where: {
        companyId,
        active: true,
        OR: [
          {
            startDate: {
              gte: startDate,
              lte: endDate,
            },
          },
          {
            endDate: {
              gte: startDate,
              lte: endDate,
            },
          },
          {
            dueDate: {
              gte: startDate,
              lte: endDate,
            },
          },
        ],
      },
      select: {
        id: true,
        title: true,
        type: true,
        status: true,
        reference: true,
        startDate: true,
        endDate: true,
        dueDate: true,
        value: true,
      },
      orderBy: { startDate: 'asc' },
    });

    return documents;
  }

  async downloadDocument(id: string, companyId: string) {
    const legalDoc = await this.findDocumentById(id, companyId);
    return legalDoc.document;
  }
}
