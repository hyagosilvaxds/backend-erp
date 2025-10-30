# 🛠️ Guia de Implementação - Hub de Documentos

## 📋 Checklist de Implementação

### ✅ Fase 1: Preparação do Banco de Dados

#### 1.1 Aplicar Migration
```bash
cd /Users/hyago/Documents/ERP/backend-erp

# Gerar e aplicar migration
npx prisma migrate dev --name add_documents_system

# Verificar schema
npx prisma format

# Gerar Prisma Client atualizado
npx prisma generate
```

**Resultado Esperado:**
- ✅ Tabelas `document_folders` e `documents` criadas
- ✅ Índices aplicados
- ✅ Relacionamentos configurados
- ✅ Prisma Client atualizado

---

#### 1.2 Criar Seed de Permissões

**Arquivo:** `prisma/seeds/documents-permissions.seed.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedDocumentPermissions() {
  console.log('🔑 Criando permissões de documentos...');

  const permissions = [
    {
      name: 'documents.read',
      description: 'Visualizar documentos e pastas',
      resource: 'documents',
      action: 'read',
    },
    {
      name: 'documents.create',
      description: 'Fazer upload de documentos e criar pastas',
      resource: 'documents',
      action: 'create',
    },
    {
      name: 'documents.update',
      description: 'Editar metadados e mover documentos',
      resource: 'documents',
      action: 'update',
    },
    {
      name: 'documents.delete',
      description: 'Deletar documentos e pastas',
      resource: 'documents',
      action: 'delete',
    },
  ];

  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { name: permission.name },
      update: permission,
      create: permission,
    });
  }

  console.log('✅ Permissões de documentos criadas!');
}

// Se executar direto
if (require.main === module) {
  seedDocumentPermissions()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
```

**Executar:**
```bash
npx ts-node prisma/seeds/documents-permissions.seed.ts
```

---

#### 1.3 Adicionar Permissões à Role Admin

```bash
# Via Prisma Studio ou SQL
npx prisma studio

# Ou via SQL:
psql $DATABASE_URL

INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  r.id,
  p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'admin'
  AND p.resource = 'documents';
```

---

### ✅ Fase 2: Criar Módulo Documents

#### 2.1 Gerar Estrutura do Módulo

```bash
cd src

# Gerar módulo, controller e service
nest g module documents
nest g controller documents
nest g service documents

# Criar diretório para DTOs
mkdir -p documents/dto
mkdir -p documents/interfaces
```

---

#### 2.2 Instalar Dependências

```bash
npm install --save @nestjs/platform-express multer
npm install --save-dev @types/multer
```

---

#### 2.3 Criar DTOs

**Arquivo:** `src/documents/dto/create-folder.dto.ts`

```typescript
import { IsString, IsOptional, IsBoolean, Length, MaxLength, IsUUID, Matches } from 'class-validator';

export class CreateFolderDto {
  @IsString()
  @Length(3, 100)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsString()
  @IsOptional()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'Cor deve ser um código hex válido (#RRGGBB)' })
  color?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsUUID()
  @IsOptional()
  parentId?: string;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}
```

**Arquivo:** `src/documents/dto/update-folder.dto.ts`

```typescript
import { PartialType } from '@nestjs/mapped-types';
import { CreateFolderDto } from './create-folder.dto';

export class UpdateFolderDto extends PartialType(CreateFolderDto) {}
```

**Arquivo:** `src/documents/dto/upload-document.dto.ts`

```typescript
import { IsString, IsOptional, IsArray, IsBoolean, IsDateString, IsUUID, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class UploadDocumentDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @IsUUID()
  @IsOptional()
  folderId?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  reference?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  documentType?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map(tag => tag.trim());
    }
    return value;
  })
  tags?: string[];

  @IsDateString()
  @IsOptional()
  expiresAt?: string;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  isPublic?: boolean;
}
```

**Arquivo:** `src/documents/dto/update-document.dto.ts`

```typescript
import { IsString, IsOptional, IsArray, IsBoolean, IsDateString, IsUUID, MaxLength } from 'class-validator';

export class UpdateDocumentDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @IsUUID()
  @IsOptional()
  folderId?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  reference?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  documentType?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsDateString()
  @IsOptional()
  expiresAt?: string;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}
```

**Arquivo:** `src/documents/dto/query-documents.dto.ts`

```typescript
import { IsOptional, IsString, IsBoolean, IsArray, IsNumber, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class QueryDocumentsDto {
  @IsString()
  @IsOptional()
  folderId?: string;

  @IsString()
  @IsOptional()
  documentType?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map(tag => tag.trim());
    }
    return value;
  })
  tags?: string[];

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  expired?: boolean;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  expiresIn?: number;

  @IsString()
  @IsOptional()
  search?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  limit?: number;
}
```

---

#### 2.4 Configurar Multer

**Arquivo:** `src/documents/config/multer.config.ts`

```typescript
import { diskStorage } from 'multer';
import { Request } from 'express';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import { mkdirSync, existsSync } from 'fs';
import { BadRequestException } from '@nestjs/common';

// Tipos MIME permitidos
const ALLOWED_MIMETYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'application/zip',
  'application/x-zip-compressed',
];

// Tamanho máximo: 50 MB
const MAX_FILE_SIZE = 50 * 1024 * 1024;

export const multerConfig = {
  storage: diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb) => {
      const companyId = req.headers['x-company-id'] as string;
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      
      const path = `./uploads/documents/${companyId}/${year}/${month}`;
      
      // Criar diretório se não existir
      if (!existsSync(path)) {
        mkdirSync(path, { recursive: true });
      }
      
      cb(null, path);
    },
    filename: (req: Request, file: Express.Multer.File, cb) => {
      const uuid = randomUUID();
      const ext = extname(file.originalname);
      cb(null, `${uuid}${ext}`);
    },
  }),
  
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  
  fileFilter: (req: Request, file: Express.Multer.File, cb: any) => {
    if (!ALLOWED_MIMETYPES.includes(file.mimetype)) {
      return cb(
        new BadRequestException(
          `Tipo de arquivo não permitido. Aceitos: PDF, imagens, Word, Excel, ZIP`
        ),
        false
      );
    }
    cb(null, true);
  },
};
```

---

#### 2.5 Implementar Service

**Arquivo:** `src/documents/documents.service.ts`

```typescript
import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
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
  constructor(private prisma: PrismaService) {}

  // ==================== PASTAS ====================

  async findAllFolders(companyId: string, parentId?: string) {
    const folders = await this.prisma.documentFolder.findMany({
      where: {
        companyId,
        parentId: parentId === 'null' ? null : parentId,
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

    return folders.map(folder => ({
      ...folder,
      documentsCount: folder._count.documents,
      subfoldersCount: folder._count.subfolders,
    }));
  }

  async createFolder(
    dto: CreateFolderDto,
    companyId: string,
    userId: string,
  ) {
    // Verificar se pasta pai existe (se fornecida)
    if (dto.parentId) {
      const parent = await this.prisma.documentFolder.findUnique({
        where: { id: dto.parentId },
      });

      if (!parent || parent.companyId !== companyId) {
        throw new NotFoundException('Pasta pai não encontrada');
      }
    }

    return this.prisma.documentFolder.create({
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
  }

  async updateFolder(id: string, dto: UpdateFolderDto, companyId: string) {
    const folder = await this.prisma.documentFolder.findUnique({
      where: { id },
    });

    if (!folder || folder.companyId !== companyId) {
      throw new NotFoundException('Pasta não encontrada');
    }

    return this.prisma.documentFolder.update({
      where: { id },
      data: dto,
    });
  }

  async deleteFolder(id: string, companyId: string, force: boolean = false) {
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

    if (!force && (folder._count.documents > 0 || folder._count.subfolders > 0)) {
      throw new BadRequestException(
        `Não é possível deletar pasta com ${folder._count.documents} documentos e ${folder._count.subfolders} subpastas. Use force=true para forçar.`
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
  }

  // ==================== DOCUMENTOS ====================

  async findDocuments(companyId: string, query: QueryDocumentsDto) {
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

    const [total, documents] = await Promise.all([
      this.prisma.document.count({ where }),
      this.prisma.document.findMany({
        where,
        include: {
          folder: {
            select: {
              id: true,
              name: true,
              color: true,
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
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const documentsWithExpiration = documents.map(doc => {
      let daysUntilExpiration = null;

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

  // Continua no próximo bloco...
}
```

**(Continua na próxima parte devido ao tamanho)**

---

### ✅ Fase 3: Implementar Controller

**Arquivo:** `src/documents/documents.controller.ts`

```typescript
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Res,
  StreamableFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser, CurrentCompany } from '../auth/decorators/current-user.decorator';
import { DocumentsService } from './documents.service';
import { multerConfig } from './config/multer.config';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { QueryDocumentsDto } from './dto/query-documents.dto';
import { createReadStream } from 'fs';

@Controller('documents')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  // ==================== PASTAS ====================

  @Get('folders')
  @RequirePermissions('documents.read')
  async findAllFolders(
    @CurrentCompany() company: any,
    @Query('parentId') parentId?: string,
  ) {
    return this.documentsService.findAllFolders(company.id, parentId);
  }

  @Post('folders')
  @RequirePermissions('documents.create')
  async createFolder(
    @Body() dto: CreateFolderDto,
    @CurrentCompany() company: any,
    @CurrentUser() user: any,
  ) {
    return this.documentsService.createFolder(dto, company.id, user.userId);
  }

  @Patch('folders/:id')
  @RequirePermissions('documents.update')
  async updateFolder(
    @Param('id') id: string,
    @Body() dto: UpdateFolderDto,
    @CurrentCompany() company: any,
  ) {
    return this.documentsService.updateFolder(id, dto, company.id);
  }

  @Delete('folders/:id')
  @RequirePermissions('documents.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteFolder(
    @Param('id') id: string,
    @CurrentCompany() company: any,
    @Query('force') force?: string,
  ) {
    await this.documentsService.deleteFolder(id, company.id, force === 'true');
  }

  // ==================== DOCUMENTOS ====================

  @Get()
  @RequirePermissions('documents.read')
  async findDocuments(
    @CurrentCompany() company: any,
    @Query() query: QueryDocumentsDto,
  ) {
    return this.documentsService.findDocuments(company.id, query);
  }

  @Post('upload')
  @RequirePermissions('documents.create')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadDocumentDto,
    @CurrentCompany() company: any,
    @CurrentUser() user: any,
  ) {
    return this.documentsService.uploadDocument(
      file,
      dto,
      company.id,
      user.userId,
    );
  }

  @Get(':id/download')
  @RequirePermissions('documents.read')
  async downloadDocument(
    @Param('id') id: string,
    @CurrentCompany() company: any,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const document = await this.documentsService.findOneDocument(id, company.id);
    
    const file = createReadStream(document.filePath);
    
    res.set({
      'Content-Type': document.mimeType,
      'Content-Disposition': `attachment; filename="${document.fileName}"`,
      'Content-Length': document.fileSize,
    });

    return new StreamableFile(file);
  }

  // Mais endpoints...
}
```

---

## 🎯 Próximos Passos

1. ✅ Aplicar migration do Prisma
2. ✅ Criar seed de permissões
3. ✅ Implementar service completo
4. ✅ Implementar controller
5. ✅ Testar endpoints
6. ✅ Criar frontend

**Tempo Estimado Total:** 2-3 semanas

**Documentação:** ✅ Completa e pronta para uso
