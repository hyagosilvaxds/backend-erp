import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { AuthenticatedUser, JwtPayload } from './interfaces/auth.interface';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    if (!user.active) {
      throw new UnauthorizedException('Usuário inativo');
    }

    const { password: _, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Buscar as empresas, roles e permissões do usuário
    const userCompanies = await this.prisma.userCompany.findMany({
      where: {
        userId: user.id,
        active: true,
      },
      include: {
        company: true,
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

    const companies = userCompanies.map((uc) => ({
      companyId: uc.company.id,
      companyName: uc.company.nomeFantasia || uc.company.razaoSocial,
      companyCnpj: uc.company.cnpj,
      role: {
        id: uc.role.id,
        name: uc.role.name,
        description: uc.role.description,
      },
      permissions: uc.role.rolePermissions.map((rp) => ({
        id: rp.permission.id,
        name: rp.permission.name,
        resource: rp.permission.resource,
        action: rp.permission.action,
      })),
    }));

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
    };

    const authenticatedUser: AuthenticatedUser = {
      userId: user.id,
      email: user.email,
      name: user.name,
      companies,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: authenticatedUser,
    };
  }

  async getProfile(userId: string): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        companies: {
          where: { active: true },
          include: {
            company: true,
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
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    const companies = user.companies.map((uc) => ({
      companyId: uc.company.id,
      companyName: uc.company.nomeFantasia || uc.company.razaoSocial,
      companyCnpj: uc.company.cnpj,
      role: {
        id: uc.role.id,
        name: uc.role.name,
        description: uc.role.description,
      },
      permissions: uc.role.rolePermissions.map((rp) => ({
        id: rp.permission.id,
        name: rp.permission.name,
        resource: rp.permission.resource,
        action: rp.permission.action,
      })),
    }));

    return {
      userId: user.id,
      email: user.email,
      name: user.name,
      companies,
    };
  }

  async validateToken(token: string): Promise<JwtPayload> {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Token inválido');
    }
  }
}
