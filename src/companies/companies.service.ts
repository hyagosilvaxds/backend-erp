import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { AuditService } from '../audit/audit.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CompaniesService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  // Método privado para remover campos sensíveis
  private removeSensitiveData(company: any) {
    if (company) {
      // Adicionar indicador se tem certificado cadastrado
      const hasCertificate = !!company.certificadoDigitalPath;
      
      // Remover campos sensíveis
      delete company.certificadoDigitalSenha;
      delete company.certificadoDigitalPath;
      
      // Adicionar campo seguro indicando se há certificado
      company.hasCertificadoA1 = hasCertificate;
    }
    return company;
  }

  async create(createCompanyDto: CreateCompanyDto, userId: string) {
    // Verificar se CNPJ já existe
    const existingCompany = await this.prisma.company.findUnique({
      where: { cnpj: createCompanyDto.cnpj },
    });

    if (existingCompany) {
      throw new ConflictException('CNPJ já cadastrado');
    }

    // Converter dataAbertura de string para Date se fornecida
    const dataAbertura = createCompanyDto.dataAbertura
      ? new Date(createCompanyDto.dataAbertura)
      : undefined;

    // Criar empresa
    const company = await this.prisma.company.create({
      data: {
        ...createCompanyDto,
        dataAbertura,
        active: createCompanyDto.active ?? true,
        situacaoCadastral: createCompanyDto.situacaoCadastral ?? 'Ativa',
        pais: createCompanyDto.pais ?? 'Brasil',
      },
    });

    // Registrar auditoria
    await this.auditService.logCreate(company.id, userId, {
      razaoSocial: company.razaoSocial,
      cnpj: company.cnpj,
    });

    // Remove dados sensíveis antes de retornar
    return this.removeSensitiveData(company);
  }

  async findAll(userId: string, isSuperAdmin: boolean) {
    if (isSuperAdmin) {
      // SuperAdmin vê todas as empresas
      const companies = await this.prisma.company.findMany({
        orderBy: { razaoSocial: 'asc' },
        include: {
          _count: {
            select: { users: true },
          },
        },
      });
      
      // Remove dados sensíveis de todas as empresas
      return companies.map(company => this.removeSensitiveData(company));
    }

    // Usuários comuns veem apenas suas empresas
    const userCompanies = await this.prisma.userCompany.findMany({
      where: { userId, active: true },
      include: {
        company: {
          include: {
            _count: {
              select: { users: true },
            },
          },
        },
        role: true,
      },
    });

    return userCompanies.map((uc) => {
      const companyData = this.removeSensitiveData(uc.company);
      return {
        ...companyData,
        userRole: uc.role.name,
      };
    });
  }

  async findOne(id: string, userId: string, isSuperAdmin: boolean) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: {
        users: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                active: true,
              },
            },
            role: true,
          },
        },
      },
    });

    if (!company) {
      throw new NotFoundException('Empresa não encontrada');
    }

    // SuperAdmin pode ver qualquer empresa
    if (isSuperAdmin) {
      return this.removeSensitiveData(company);
    }

    // Verificar se usuário tem acesso à empresa
    const hasAccess = await this.prisma.userCompany.findFirst({
      where: {
        userId,
        companyId: id,
        active: true,
      },
    });

    if (!hasAccess) {
      throw new ForbiddenException('Você não tem acesso a esta empresa');
    }

    return this.removeSensitiveData(company);
  }

  async update(
    id: string,
    updateCompanyDto: UpdateCompanyDto,
    userId: string,
    isSuperAdmin: boolean,
  ) {
    // Verificar se empresa existe
    const company = await this.prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      throw new NotFoundException('Empresa não encontrada');
    }

    // Verificar permissão (SuperAdmin ou usuário com acesso)
    if (!isSuperAdmin) {
      const hasAccess = await this.prisma.userCompany.findFirst({
        where: {
          userId,
          companyId: id,
          active: true,
        },
      });

      if (!hasAccess) {
        throw new ForbiddenException('Você não tem acesso a esta empresa');
      }
    }

    // Verificar CNPJ duplicado se estiver sendo alterado
    if (updateCompanyDto.cnpj && updateCompanyDto.cnpj !== company.cnpj) {
      const existingCompany = await this.prisma.company.findUnique({
        where: { cnpj: updateCompanyDto.cnpj },
      });

      if (existingCompany) {
        throw new ConflictException('CNPJ já cadastrado');
      }
    }

    const updatedCompany = await this.prisma.company.update({
      where: { id },
      data: updateCompanyDto,
    });

    // Registrar auditoria
    await this.auditService.logUpdate(id, userId, company, updatedCompany);

    // Remove dados sensíveis antes de retornar
    return this.removeSensitiveData(updatedCompany);
  }

  async remove(id: string, userId: string, isSuperAdmin: boolean) {
    // Verificar se empresa existe
    const company = await this.prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      throw new NotFoundException('Empresa não encontrada');
    }

    // Apenas SuperAdmin pode deletar empresas
    if (!isSuperAdmin) {
      throw new ForbiddenException('Apenas SuperAdmin pode deletar empresas');
    }

    const deletedCompany = await this.prisma.company.delete({
      where: { id },
    });

    // Registrar auditoria
    await this.auditService.logDelete(id, userId, company);

    // Remove dados sensíveis antes de retornar
    return this.removeSensitiveData(deletedCompany);
  }

  async toggleActive(id: string, userId: string, isSuperAdmin: boolean) {
    const company = await this.prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      throw new NotFoundException('Empresa não encontrada');
    }

    // Apenas SuperAdmin pode ativar/desativar empresas
    if (!isSuperAdmin) {
      throw new ForbiddenException(
        'Apenas SuperAdmin pode ativar/desativar empresas',
      );
    }

    const newActiveState = !company.active;

    const updatedCompany = await this.prisma.company.update({
      where: { id },
      data: { active: newActiveState },
    });

    // Registrar auditoria
    await this.auditService.logToggleActive(id, userId, newActiveState);

    // Remove dados sensíveis antes de retornar
    return this.removeSensitiveData(updatedCompany);
  }

  // Método exclusivo para admin: listar TODAS as empresas com busca e paginação
  async findAllForAdmin(params?: {
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { search, page = 1, limit = 10 } = params || {};
    const skip = (page - 1) * limit;

    // Construir filtro de busca
    const where = search
      ? {
          OR: [
            { razaoSocial: { contains: search, mode: 'insensitive' as const } },
            { nomeFantasia: { contains: search, mode: 'insensitive' as const } },
            { cnpj: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
            { cidade: { contains: search, mode: 'insensitive' as const } },
            { estado: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    // Buscar total de registros
    const total = await this.prisma.company.count({ where });

    // Buscar empresas com paginação
    const companies = await this.prisma.company.findMany({
      where,
      select: {
        id: true,
        razaoSocial: true,
        nomeFantasia: true,
        cnpj: true,
        inscricaoEstadual: true,
        inscricaoMunicipal: true,
        regimeTributario: true,
        email: true,
        telefone: true,
        celular: true,
        cidade: true,
        estado: true,
        cep: true,
        active: true,
        situacaoCadastral: true,
        logoUrl: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            users: true,
          },
        },
      },
      orderBy: {
        razaoSocial: 'asc',
      },
      skip,
      take: limit,
    });

    return {
      data: companies,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findCompanyById(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: {
        users: {
          where: { active: true },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                active: true,
              },
            },
            role: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
      },
    });

    if (!company) {
      throw new NotFoundException('Empresa não encontrada');
    }

    // Remove dados sensíveis antes de retornar
    return this.removeSensitiveData(company);
  }

  // Método exclusivo para admin: atualizar qualquer empresa
  async updateCompanyAsAdmin(
    id: string,
    updateCompanyDto: UpdateCompanyDto,
    userId: string,
  ) {
    // Verificar se empresa existe
    const company = await this.prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      throw new NotFoundException('Empresa não encontrada');
    }

    // Verificar CNPJ duplicado se estiver sendo alterado
    if (updateCompanyDto.cnpj && updateCompanyDto.cnpj !== company.cnpj) {
      const existingCompany = await this.prisma.company.findUnique({
        where: { cnpj: updateCompanyDto.cnpj },
      });

      if (existingCompany) {
        throw new ConflictException('CNPJ já cadastrado');
      }
    }

    const updatedCompany = await this.prisma.company.update({
      where: { id },
      data: updateCompanyDto,
    });

    // Registrar auditoria
    await this.auditService.logUpdate(id, userId, company, updatedCompany);

    // Remove dados sensíveis antes de retornar
    return this.removeSensitiveData(updatedCompany);
  }

  // Método exclusivo para admin: upload de logo
  async uploadLogo(
    id: string,
    file: Express.Multer.File,
    baseUrl: string,
    userId: string,
  ) {
    // Verificar se empresa existe
    const company = await this.prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      throw new NotFoundException('Empresa não encontrada');
    }

    // Construir URL da logo
    const logoUrl = `${baseUrl}/uploads/logos/${file.filename}`;

    // Atualizar empresa com informações da logo
    const updatedCompany = await this.prisma.company.update({
      where: { id },
      data: {
        logoUrl,
        logoFileName: file.filename,
        logoMimeType: file.mimetype,
      },
    });

    // Registrar auditoria
    await this.auditService.logUploadLogo(id, userId, logoUrl);

    // Remove dados sensíveis antes de retornar
    return this.removeSensitiveData(updatedCompany);
  }

  // Método exclusivo para admin: upload de certificado A1
  async uploadCertificate(
    id: string,
    file: Express.Multer.File,
    senha: string,
    userId: string,
  ) {
    // Verificar se empresa existe
    const company = await this.prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      throw new NotFoundException('Empresa não encontrada');
    }

    // Criptografar senha do certificado antes de salvar
    const hashedSenha = await bcrypt.hash(senha, 10);

    // Salvar path do certificado e senha criptografada
    const updatedCompany = await this.prisma.company.update({
      where: { id },
      data: {
        certificadoDigitalPath: file.path,
        certificadoDigitalSenha: hashedSenha,
      },
    });

    // Registrar auditoria
    await this.auditService.logUploadCertificate(id, userId);

    // Remove dados sensíveis antes de retornar
    return this.removeSensitiveData(updatedCompany);
  }

  // Método exclusivo para admin: remover logo
  async removeLogo(id: string, userId: string) {
    // Verificar se empresa existe
    const company = await this.prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      throw new NotFoundException('Empresa não encontrada');
    }

    const updatedCompany = await this.prisma.company.update({
      where: { id },
      data: {
        logoUrl: null,
        logoFileName: null,
        logoMimeType: null,
      },
    });

    // Registrar auditoria
    await this.auditService.logRemoveLogo(id, userId);

    // Remove dados sensíveis antes de retornar
    return this.removeSensitiveData(updatedCompany);
  }

  // Método exclusivo para admin: remover certificado
  async removeCertificate(id: string, userId: string) {
    // Verificar se empresa existe
    const company = await this.prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      throw new NotFoundException('Empresa não encontrada');
    }

    const updatedCompany = await this.prisma.company.update({
      where: { id },
      data: {
        certificadoDigitalPath: null,
        certificadoDigitalSenha: null,
      },
    });

    // Registrar auditoria
    await this.auditService.logRemoveCertificate(id, userId);

    // Remove dados sensíveis antes de retornar
    return this.removeSensitiveData(updatedCompany);
  }

  // Método auxiliar: Validar senha do certificado digital
  // Use este método quando for necessário usar o certificado (ex: emitir NF-e)
  async validateCertificatePassword(
    companyId: string,
    senha: string,
  ): Promise<boolean> {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: {
        certificadoDigitalSenha: true,
      },
    });

    if (!company || !company.certificadoDigitalSenha) {
      throw new NotFoundException('Certificado digital não encontrado');
    }

    // Comparar senha fornecida com hash armazenado
    return bcrypt.compare(senha, company.certificadoDigitalSenha);
  }

  // Método para buscar histórico de auditoria da empresa
  async getCompanyAuditHistory(companyId: string, options?: {
    page?: number;
    limit?: number;
    action?: string;
  }) {
    return this.auditService.getCompanyAuditHistory(companyId, options);
  }
}
