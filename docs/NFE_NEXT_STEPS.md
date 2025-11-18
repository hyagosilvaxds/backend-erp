# 🚀 NF-e - Próximos Passos de Implementação

## ✅ FASE 1: Correções Imediatas (CRÍTICO)

### 1.1 Adicionar Módulo ao App Module
```typescript
// src/app.module.ts
import { FiscalModule } from './fiscal/fiscal.module';

@Module({
  imports: [
    // ... outros módulos
    FiscalModule, // ← ADICIONAR
  ],
})
export class AppModule {}
```

### 1.2 Criar Migration do Prisma

```bash
# Editar prisma/schema.prisma e adicionar campos:
npx prisma migrate dev --name add_fiscal_fields_to_company_and_product
```

Campos a adicionar:

**Company**:
```prisma
certificateA1Path       String?
certificateA1Password   String?
certificateA1ValidUntil DateTime?
nfeAmbiente            String @default("2")
nfeSerie               String @default("1")
nfeProximoNumero       Int    @default(1)
responsibleName        String?
responsibleEmail       String?
responsiblePhone       String?
```

**Product**:
```prisma
ncm        String?
cfop       String?
origem     String  @default("0")
unit       String  @default("UNID")
csosn      String?
cstIcms    String?
modBcIcms  String?
aliqIcms   Float   @default(0)
cstPis     String  @default("49")
bcPis      Float   @default(0)
aliqPis    Float   @default(0)
cstCofins  String  @default("49")
bcCofins   Float   @default(0)
aliqCofins Float   @default(0)
```

---

## ✅ FASE 2: Correções do Código (ALTA PRIORIDADE)

### 2.1 Corrigir nfe-sefaz.service.ts

Ajustar inicialização do Tools conforme documentação real:

```typescript
const tools = new Tools(
  {
    mod: '55',
    tpAmb: company.nfeAmbiente === '1' ? 1 : 2,
    UF: endereco.state,
    versao: '4.00',
    timeout: 30,
    xmllint: '', // Opcional
    CSC: '', // Para NFC-e
    CSCid: '', // Para NFC-e
    openssl: null,
    CPF: '',
    CNPJ: company.cnpj?.replace(/\D/g, '') || '',
  },
  {
    pfx: certificatePath,
    senha: company.certificateA1Password,
  },
);
```

### 2.2 Corrigir Nomes de Campos no nfe.service.ts

```typescript
// ANTES
resultado.danfe = danfePath;
resultado.xmlProcessamento = xmlProcPath;

// DEPOIS
resultado.danfePdfPath = danfePath;
resultado.xmlAutorizado = xmlProcPath;
```

### 2.3 Corrigir Status Enum

```typescript
// ANTES
status: 'AUTORIZADA'

// DEPOIS
status: 'AUTHORIZED'

// ANTES
status: 'CANCELADA'

// DEPOIS
status: 'CANCELED'
```

### 2.4 Corrigir nfe.controller.ts

```typescript
// ANTES
import { Response } from 'express';

// DEPOIS
import type { Response } from 'express';

// ANTES
nfe.danfePath

// DEPOIS
nfe.danfePdfPath

// ANTES
nfe.xmlPath

// DEPOIS
nfe.xmlAutorizado
```

---

## ✅ FASE 3: Funcionalidades Adicionais

### 3.1 Endpoint de Upload de Certificado

```typescript
// src/companies/companies.controller.ts

import { FileInterceptor } from '@nestjs/platform-express';
import { UploadedFile } from '@nestjs/common';

@Post('certificate')
@UseInterceptors(FileInterceptor('certificate'))
async uploadCertificate(
  @CompanyId() companyId: string,
  @UploadedFile() file: Express.Multer.File,
  @Body('password') password: string,
) {
  const uploadsDir = path.resolve('uploads', 'certificates', companyId);
  
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const fileName = `certificate_${Date.now()}.pfx`;
  const filePath = path.join(uploadsDir, fileName);
  fs.writeFileSync(filePath, file.buffer);

  // Validar certificado
  try {
    const tools = new Tools(
      { mod: '55', tpAmb: 2, UF: 'SP', versao: '4.00', timeout: 10 },
      { pfx: filePath, senha: password },
    );
    // Se não der erro, certificado é válido
  } catch (error) {
    fs.unlinkSync(filePath);
    throw new BadRequestException('Certificado inválido ou senha incorreta');
  }

  await this.prisma.company.update({
    where: { id: companyId },
    data: {
      certificateA1Path: filePath,
      certificateA1Password: password,
      certificateA1ValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 ano
    },
  });

  return { message: 'Certificado enviado com sucesso' };
}
```

### 3.2 Adicionar Validação de Certificado Expirado

```typescript
// src/fiscal/services/nfe-sefaz.service.ts

private async inicializarTools(company: any): Promise<Tools> {
  // ... validações existentes ...

  if (company.certificateA1ValidUntil && new Date(company.certificateA1ValidUntil) < new Date()) {
    throw new BadRequestException('Certificado A1 expirado. Faça upload de um novo certificado.');
  }

  // ... resto do código ...
}
```

---

## ✅ FASE 4: Testes

### 4.1 Criar Arquivo de Testes HTTP

```http
### Upload de Certificado
POST http://localhost:4000/companies/certificate
Authorization: Bearer {{token}}
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW

------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="certificate"; filename="certificado.pfx"
Content-Type: application/x-pkcs12

< /path/to/certificado.pfx
------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="password"

senha_do_certificado
------WebKitFormBoundary7MA4YWxkTrZu0gW--

###

### Consultar Status SEFAZ
GET http://localhost:4000/fiscal/nfe/sefaz/status
Authorization: Bearer {{token}}

###

### Emitir NF-e (Apenas XML - Não enviar para SEFAZ)
POST http://localhost:4000/fiscal/nfe/emitir
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "saleId": "{{saleId}}",
  "modelo": "55",
  "serie": "1",
  "naturezaOperacao": "VENDA",
  "modalidadeFrete": "9",
  "enviarSefaz": false
}

###

### Emitir NF-e (COM envio para SEFAZ)
POST http://localhost:4000/fiscal/nfe/emitir
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "saleId": "{{saleId}}",
  "modelo": "55",
  "serie": "1",
  "naturezaOperacao": "VENDA",
  "modalidadeFrete": "9",
  "enviarSefaz": true
}

###

### Listar NF-e
GET http://localhost:4000/fiscal/nfe?status=AUTHORIZED
Authorization: Bearer {{token}}

###

### Buscar NF-e Específica
GET http://localhost:4000/fiscal/nfe/{{nfeId}}
Authorization: Bearer {{token}}

###

### Baixar DANFE
GET http://localhost:4000/fiscal/nfe/{{nfeId}}/danfe
Authorization: Bearer {{token}}

###

### Baixar XML
GET http://localhost:4000/fiscal/nfe/{{nfeId}}/xml
Authorization: Bearer {{token}}

###

### Cancelar NF-e
POST http://localhost:4000/fiscal/nfe/{{nfeId}}/cancelar
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "justificativa": "Cliente solicitou cancelamento devido a erro no pedido - teste de homologacao"
}
```

---

## ✅ FASE 5: Checklist de Dados

### Empresa DEVE ter:
- [x] CNPJ
- [x] Razão Social (companyName)
- [x] Nome Fantasia (tradeName)
- [x] Inscrição Estadual (stateRegistration)
- [x] Regime Tributário (taxRegime)
- [x] Endereço completo com código IBGE
- [x] Certificado A1 (.pfx)
- [x] Senha do certificado
- [x] Ambiente (1=Produção, 2=Homologação)

### Cliente DEVE ter:
- [x] CPF ou CNPJ
- [x] Nome/Razão Social
- [x] Endereço completo com código IBGE
- [x] Telefone ou email

### Produto DEVE ter:
- [x] NCM (8 dígitos)
- [x] CFOP (4 dígitos)
- [x] Origem (0-8)
- [x] Unidade (UNID, KG, CX, etc)
- [x] CSOSN (Simples Nacional) ou CST (Regime Normal)
- [x] CST PIS
- [x] CST COFINS

### Venda DEVE ter:
- [x] Status = APPROVED
- [x] Cliente vinculado
- [x] Itens com produtos válidos
- [x] Método de pagamento

---

## ✅ FASE 6: Comandos de Execução

```bash
# 1. Instalar dependências (já feito)
npm install node-sped-nfe node-sped-pdf

# 2. Adicionar campos ao schema
# Editar prisma/schema.prisma

# 3. Criar migration
npx prisma migrate dev --name add_nfe_fields

# 4. Gerar Prisma Client
npx prisma generate

# 5. Reiniciar servidor
npm run start:dev

# 6. Testar status da SEFAZ
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:4000/fiscal/nfe/sefaz/status

# 7. Upload de certificado
# Use Postman ou Insomnia para enviar arquivo

# 8. Configurar produtos
# Via interface ou SQL direto

# 9. Emitir primeira NF-e de teste
# Via HTTP client ou Postman
```

---

## 🎯 ORDEM RECOMENDADA DE IMPLEMENTAÇÃO

1. ✅ **Dia 1: Correções críticas**
   - Adicionar FiscalModule ao AppModule
   - Criar migration dos campos
   - Corrigir erros de compilação TypeScript
   - Testar se o servidor sobe

2. ✅ **Dia 2: Upload e configuração**
   - Implementar endpoint de upload de certificado
   - Criar tela de configuração fiscal no frontend
   - Testar upload e validação do certificado

3. ✅ **Dia 3: Cadastro de produtos**
   - Adicionar campos fiscais na tela de produtos
   - Importar tabela NCM (opcional)
   - Cadastrar CFOPs comuns

4. ✅ **Dia 4: Testes em homologação**
   - Configurar ambiente de homologação
   - Criar venda de teste
   - Emitir primeira NF-e de teste
   - Verificar XML gerado
   - Validar DANFE

5. ✅ **Dia 5: Ajustes finais**
   - Corrigir problemas encontrados
   - Adicionar validações extras
   - Testar cancelamento
   - Documentar processo

---

## 🔍 Como Debugar

### Ver XML Gerado:
```typescript
// No nfe-generator.service.ts
const xml = NFe.xml();
console.log('XML GERADO:', xml);
fs.writeFileSync('/tmp/nfe_debug.xml', xml);
```

### Ver Resposta da SEFAZ:
```typescript
// No nfe-sefaz.service.ts
const resposta = await tools.sefazEnviaLote(xmlAssinado, { indSinc: 1 });
console.log('RESPOSTA SEFAZ:', JSON.stringify(resposta, null, 2));
fs.writeFileSync('/tmp/resposta_sefaz.json', JSON.stringify(resposta, null, 2));
```

### Validar Certificado:
```bash
# Verificar validade do certificado
openssl pkcs12 -in certificado.pfx -noout -info
```

---

## ⚠️ AVISOS IMPORTANTES

1. **NUNCA** use certificado de produção em homologação
2. **SEMPRE** teste em homologação antes de produção
3. **BACKUP** do certificado em local seguro
4. **CUIDADO** com senha do certificado (não commitar)
5. **ATENÇÃO** aos prazos de cancelamento (24h)
6. **IMPORTANTE** guardar XMLs autorizados por 5 anos

---

**Última atualização**: 16 de novembro de 2024  
**Próxima revisão**: Após implementação da Fase 1
