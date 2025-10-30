# 🔐 Uso de Certificado Digital - Validação de Senha

## Visão Geral

Este documento explica como validar a senha do certificado digital quando for necessário usá-lo (por exemplo, para emitir notas fiscais eletrônicas).

## Segurança Implementada

### Criptografia com bcrypt

- ✅ Senhas são **automaticamente criptografadas** com bcrypt ao fazer upload
- ✅ Hash usa **10 rounds** de salt para máxima segurança
- ✅ Senhas **nunca são armazenadas em texto plano**
- ✅ Impossível recuperar senha original do hash

### Exemplo de Hash Armazenado

```
Senha original: minhaSenhaSecreta123
Hash no banco:  $2b$10$N9qo8uLOickgx2ZMRZoMye.IjefO9Z6jHMXvTqP8B8qGauud6R/C6
```

---

## Validação de Senha

### Método no Service

O `CompaniesService` possui um método `validateCertificatePassword()` para validar senhas:

```typescript
// src/companies/companies.service.ts

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
```

### Como Usar

#### Exemplo 1: Emissão de NF-e

```typescript
// src/nfe/nfe.service.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CompaniesService } from '../companies/companies.service';
import * as fs from 'fs';

@Injectable()
export class NFeService {
  constructor(private companiesService: CompaniesService) {}

  async emitirNFe(companyId: string, senhaCertificado: string, dados: any) {
    // 1. Validar senha do certificado
    const senhaValida = await this.companiesService.validateCertificatePassword(
      companyId,
      senhaCertificado,
    );

    if (!senhaValida) {
      throw new UnauthorizedException('Senha do certificado inválida');
    }

    // 2. Buscar dados da empresa e caminho do certificado
    const company = await this.companiesService.findOne(companyId);
    
    if (!company.certificadoDigitalPath) {
      throw new Error('Certificado digital não encontrado');
    }

    // 3. Ler arquivo do certificado
    const certificadoBuffer = fs.readFileSync(company.certificadoDigitalPath);

    // 4. Processar emissão da NF-e
    // ... lógica de emissão usando o certificado
    
    return {
      message: 'NF-e emitida com sucesso',
      numero: '123456',
      chaveAcesso: 'xxxx-xxxx-xxxx-xxxx',
    };
  }
}
```

#### Exemplo 2: Endpoint de Emissão

```typescript
// src/nfe/nfe.controller.ts

import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { NFeService } from './nfe.service';

class EmitirNFeDto {
  companyId: string;
  senhaCertificado: string;
  destinatario: {
    nome: string;
    cnpj: string;
    // ... outros campos
  };
  itens: Array<{
    descricao: string;
    quantidade: number;
    valorUnitario: number;
    // ... outros campos
  }>;
}

@Controller('nfe')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class NFeController {
  constructor(private nfeService: NFeService) {}

  @Post('emitir')
  @RequirePermissions('nfe.create')
  async emitirNFe(@Body() dto: EmitirNFeDto) {
    return this.nfeService.emitirNFe(
      dto.companyId,
      dto.senhaCertificado,
      dto,
    );
  }
}
```

#### Exemplo 3: Validação Simples

```typescript
// Validar senha antes de qualquer operação sensível

const senhaCorreta = await companiesService.validateCertificatePassword(
  'company-id-aqui',
  'senha-fornecida-pelo-usuario',
);

if (!senhaCorreta) {
  throw new UnauthorizedException('Senha incorreta');
}

// Continuar com a operação...
```

---

## Fluxo de Uso do Certificado

```
1. Admin faz upload do certificado + senha
   ↓
2. Sistema criptografa senha com bcrypt
   ↓
3. Salva arquivo .pfx e hash da senha no banco
   ↓
4. Quando for emitir NF-e:
   a. Usuário envia senha do certificado
   b. Sistema valida com validateCertificatePassword()
   c. Se válida, lê arquivo .pfx
   d. Usa certificado para assinar NF-e
```

---

## ⚠️ Importante: Nunca Retorne a Senha

### ❌ ERRADO

```typescript
// NÃO faça isso!
async getCompany(id: string) {
  return this.prisma.company.findUnique({
    where: { id },
    select: {
      id: true,
      razaoSocial: true,
      certificadoDigitalSenha: true, // ❌ NUNCA retornar senha!
    },
  });
}
```

### ✅ CORRETO

```typescript
// Sempre exclua a senha dos selects
async getCompany(id: string) {
  return this.prisma.company.findUnique({
    where: { id },
    select: {
      id: true,
      razaoSocial: true,
      certificadoDigitalPath: true, // ✅ Path é OK
      // certificadoDigitalSenha: NUNCA incluir!
    },
  });
}

// Ou use omit
async getCompany(id: string) {
  const company = await this.prisma.company.findUnique({
    where: { id },
  });
  
  // Remove senha antes de retornar
  delete company.certificadoDigitalSenha;
  return company;
}
```

---

## Boas Práticas

### 1. Sempre Valide a Senha

```typescript
// Antes de qualquer operação com certificado
const senhaValida = await this.validateCertificatePassword(companyId, senha);
if (!senhaValida) {
  throw new UnauthorizedException('Senha inválida');
}
```

### 2. Use Try-Catch

```typescript
try {
  const senhaValida = await this.validateCertificatePassword(companyId, senha);
  if (!senhaValida) {
    // Log de tentativa inválida
    this.logger.warn(`Tentativa de acesso com senha inválida: ${companyId}`);
    throw new UnauthorizedException('Senha inválida');
  }
} catch (error) {
  if (error instanceof NotFoundException) {
    throw new NotFoundException('Certificado não encontrado');
  }
  throw error;
}
```

### 3. Implemente Rate Limiting

```typescript
// Limite tentativas de validação de senha
import { Throttle } from '@nestjs/throttler';

@Post('emitir-nfe')
@Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 tentativas por minuto
async emitirNFe(@Body() dto: EmitirNFeDto) {
  // ... código
}
```

### 4. Registre Logs de Auditoria

```typescript
// Registre todas as operações com certificado
async emitirNFe(companyId: string, senha: string) {
  this.logger.log(`Tentativa de emissão NF-e - Empresa: ${companyId}`);
  
  const senhaValida = await this.validateCertificatePassword(companyId, senha);
  
  if (!senhaValida) {
    this.logger.warn(`Senha inválida - Empresa: ${companyId}`);
    throw new UnauthorizedException('Senha inválida');
  }
  
  this.logger.log(`Senha validada - Empresa: ${companyId}`);
  // ... continuar com emissão
}
```

---

## Troubleshooting

### Erro: "Certificado digital não encontrado"

**Causa:** Empresa não possui certificado cadastrado

**Solução:** Fazer upload do certificado via endpoint `POST /companies/admin/:id/certificate`

### Erro: "Senha inválida"

**Causa:** Senha fornecida não corresponde ao hash armazenado

**Solução:** 
1. Verificar se a senha está correta
2. Verificar se não há espaços em branco
3. Se necessário, fazer novo upload do certificado

### Senha foi perdida/esquecida

**Não há como recuperar:** Bcrypt é criptografia unidirecional (one-way hash)

**Solução:** Fazer novo upload do certificado com a senha correta

---

## Segurança Avançada (Opcional)

### 1. Usar Variáveis de Ambiente para Salt Rounds

```typescript
// src/companies/companies.service.ts

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);

async uploadCertificate(id: string, file: Express.Multer.File, senha: string) {
  const hashedSenha = await bcrypt.hash(senha, SALT_ROUNDS);
  // ...
}
```

### 2. Implementar 2FA para Operações Críticas

```typescript
// Exigir 2FA além da senha do certificado
async emitirNFe(companyId: string, senha: string, codigo2FA: string) {
  // 1. Validar 2FA
  const twoFAValido = await this.authService.validate2FA(codigo2FA);
  if (!twoFAValido) {
    throw new UnauthorizedException('Código 2FA inválido');
  }
  
  // 2. Validar senha do certificado
  const senhaValida = await this.validateCertificatePassword(companyId, senha);
  if (!senhaValida) {
    throw new UnauthorizedException('Senha do certificado inválida');
  }
  
  // 3. Continuar com emissão
  // ...
}
```

### 3. Armazenar Certificados Criptografados

```typescript
// Criptografar o arquivo .pfx antes de salvar
import { createCipheriv, randomBytes } from 'crypto';

async uploadCertificate(id: string, file: Express.Multer.File, senha: string) {
  // 1. Gerar chave de criptografia única
  const key = randomBytes(32);
  const iv = randomBytes(16);
  
  // 2. Criptografar arquivo do certificado
  const cipher = createCipheriv('aes-256-cbc', key, iv);
  const encryptedFile = Buffer.concat([
    cipher.update(file.buffer),
    cipher.final(),
  ]);
  
  // 3. Salvar arquivo criptografado
  fs.writeFileSync(file.path, encryptedFile);
  
  // 4. Armazenar chave de forma segura (ex: AWS KMS, Azure Key Vault)
  await this.keyManagementService.storeKey(id, key, iv);
  
  // 5. Hash da senha
  const hashedSenha = await bcrypt.hash(senha, 10);
  
  // 6. Salvar no banco
  return this.prisma.company.update({
    where: { id },
    data: {
      certificadoDigitalPath: file.path,
      certificadoDigitalSenha: hashedSenha,
    },
  });
}
```

---

## Checklist de Segurança

- [x] ✅ Senha criptografada com bcrypt
- [x] ✅ Senha nunca retornada em APIs
- [x] ✅ Validação de senha antes de usar certificado
- [ ] ⚠️ Rate limiting em endpoints sensíveis
- [ ] ⚠️ Logs de auditoria
- [ ] ⚠️ Alertas de tentativas inválidas
- [ ] ⚠️ 2FA para operações críticas
- [ ] ⚠️ Criptografia do arquivo .pfx
- [ ] ⚠️ Backup seguro dos certificados
- [ ] ⚠️ Monitoramento de expiração

---

## Referências

- [Bcrypt Documentation](https://github.com/kelektiv/node.bcrypt.js)
- [NestJS Security Best Practices](https://docs.nestjs.com/security/encryption-and-hashing)
- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
