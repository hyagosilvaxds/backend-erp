# Upload de Certificado Digital A1

## 📋 Visão Geral

Este documento descreve o processo completo de upload, armazenamento e uso do certificado digital A1 para empresas no sistema ERP.

## 🔐 Sobre Certificado A1

O certificado digital A1 é um arquivo eletrônico que comprova a identidade da empresa e é **obrigatório** para:

- Emissão de NF-e (Nota Fiscal Eletrônica)
- Emissão de NFS-e (Nota Fiscal de Serviço Eletrônica)
- Emissão de CT-e (Conhecimento de Transporte Eletrônico)
- Comunicação com sistemas da SEFAZ

### Características do A1

- **Formato**: Arquivo .pfx ou .p12
- **Proteção**: Protegido por senha
- **Validade**: Geralmente 1 ano
- **Armazenamento**: Em disco (não em hardware como A3)
- **Tamanho típico**: 2KB a 10KB

## 📤 Upload do Certificado

### Endpoint

```
POST /companies/admin/:id/certificate
```

**Permissões**: Apenas usuários com permissão `MANAGE_COMPANIES`

### Requisição

**Headers:**
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Body (form-data):**
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| certificate | File | Sim | Arquivo .pfx ou .p12 |
| senha | String | Sim | Senha do certificado |

### Exemplo com cURL

```bash
curl -X POST http://localhost:4000/companies/admin/123e4567-e89b-12d3-a456-426614174000/certificate \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -F "certificate=@/caminho/para/certificado.pfx" \
  -F "senha=minhaSenhaDoCertificado123"
```

### Exemplo com Axios/JavaScript

```javascript
const formData = new FormData();
formData.append('certificate', certificateFile); // File object do input
formData.append('senha', 'minhaSenhaDoCertificado123');

const response = await axios.post(
  `${API_URL}/companies/admin/${companyId}/certificate`,
  formData,
  {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  }
);
```

### Exemplo com React

```typescript
import { useState } from 'react';

function CertificateUpload({ companyId }: { companyId: string }) {
  const [certificate, setCertificate] = useState<File | null>(null);
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!certificate) {
      alert('Selecione um certificado');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('certificate', certificate);
    formData.append('senha', senha);

    try {
      const response = await fetch(
        `${API_URL}/companies/admin/${companyId}/certificate`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        }
      );

      if (!response.ok) throw new Error('Erro no upload');
      
      const data = await response.json();
      alert('Certificado enviado com sucesso!');
      setSenha(''); // Limpa a senha por segurança
      
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao enviar certificado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleUpload}>
      <div>
        <label>Certificado A1 (.pfx ou .p12):</label>
        <input
          type="file"
          accept=".pfx,.p12"
          onChange={(e) => setCertificate(e.target.files?.[0] || null)}
          required
        />
      </div>
      
      <div>
        <label>Senha do Certificado:</label>
        <input
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          placeholder="Digite a senha do certificado"
          required
        />
      </div>
      
      <button type="submit" disabled={loading}>
        {loading ? 'Enviando...' : 'Enviar Certificado'}
      </button>
    </form>
  );
}
```

### Resposta de Sucesso (200)

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "razaoSocial": "Empresa LTDA",
  "cnpj": "12345678901234",
  "email": "contato@empresa.com",
  "active": true,
  "hasCertificadoA1": true,
  "createdAt": "2025-10-25T10:30:00.000Z",
  "updatedAt": "2025-10-25T12:45:00.000Z"
}
```

**⚠️ Nota de Segurança:** Os campos `certificadoDigitalPath` e `certificadoDigitalSenha` **NUNCA** são retornados na resposta.

**✅ Campo Seguro:** O campo `hasCertificadoA1` (boolean) indica se a empresa possui certificado A1 cadastrado, sem expor dados sensíveis.

### Respostas de Erro

#### 404 - Empresa não encontrada
```json
{
  "statusCode": 404,
  "message": "Empresa não encontrada",
  "error": "Not Found"
}
```

#### 400 - Arquivo inválido
```json
{
  "statusCode": 400,
  "message": "Apenas arquivos .pfx ou .p12 são permitidos",
  "error": "Bad Request"
}
```

#### 413 - Arquivo muito grande
```json
{
  "statusCode": 413,
  "message": "Arquivo muito grande. Tamanho máximo: 10MB",
  "error": "Payload Too Large"
}
```

#### 403 - Sem permissão
```json
{
  "statusCode": 403,
  "message": "Você não tem permissão para gerenciar empresas",
  "error": "Forbidden"
}
```

## 🗑️ Remover Certificado

### Endpoint

```
DELETE /companies/admin/:id/certificate
```

### Exemplo

```bash
curl -X DELETE http://localhost:4000/companies/admin/123e4567-e89b-12d3-a456-426614174000/certificate \
  -H "Authorization: Bearer {token}"
```

### Resposta (200)

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "razaoSocial": "Empresa LTDA",
  "cnpj": "12345678901234",
  "hasCertificadoA1": false
}
```

**Nota:** Após remover o certificado, o campo `hasCertificadoA1` retorna `false`.

## 💾 Armazenamento

### Estrutura de Diretórios

```
backend-erp/
└── uploads/
    └── certificates/
        ├── cert-1234567890123-987654321.pfx
        ├── cert-1234567890456-123456789.pfx
        └── ...
```

### Nome do Arquivo

O arquivo é renomeado automaticamente para evitar conflitos:

**Formato:** `cert-{timestamp}-{random}.{ext}`

**Exemplo:** `cert-1761401734047-373139390.pfx`

### Segurança do Arquivo

- ✅ Armazenado em diretório protegido
- ✅ Nome gerado automaticamente (não expõe informações)
- ✅ Path NUNCA retornado na API
- ✅ Acesso apenas via código do servidor
- ❌ **NÃO acessível via URL pública**

### Banco de Dados

Na tabela `Company`:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| certificadoDigitalPath | String | Path do arquivo no servidor |
| certificadoDigitalSenha | String | Senha criptografada (bcrypt) |

**Ambos os campos são protegidos e nunca retornados na API.**

## 🔒 Segurança

### Senha do Certificado

1. **Entrada:** Usuário fornece senha em texto plano no upload
2. **Processamento:** Senha é criptografada com bcrypt (10 salt rounds)
3. **Armazenamento:** Apenas o hash é salvo no banco
4. **Uso:** Validação via método `validateCertificatePassword()`

```typescript
// Criptografia no upload
const hashedSenha = await bcrypt.hash(senha, 10);

// Validação posterior
const isValid = await bcrypt.compare(senhaFornecida, hashedSenha);
```

### Validação da Senha

Para validar a senha ao usar o certificado (ex: emitir NF-e):

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CompaniesService } from './companies/companies.service';

@Injectable()
export class NfeService {
  constructor(private companiesService: CompaniesService) {}

  async emitirNfe(companyId: string, senha: string, dados: any) {
    // Validar senha do certificado
    const senhaValida = await this.companiesService.validateCertificatePassword(
      companyId,
      senha
    );

    if (!senhaValida) {
      throw new UnauthorizedException('Senha do certificado incorreta');
    }

    // Obter o path do certificado (uso interno, não exposto)
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: { certificadoDigitalPath: true }
    });

    // Usar certificado para assinar NF-e
    // ... lógica de emissão
  }
}
```

### Boas Práticas

✅ **Fazer:**
- Pedir senha novamente ao emitir NF-e (não armazenar em sessão)
- Validar formato do arquivo antes do upload
- Limpar campo de senha no frontend após upload
- Notificar usuário sobre validade do certificado
- Manter backup dos certificados em local seguro

❌ **Não Fazer:**
- Enviar senha do certificado em logs
- Armazenar senha em texto plano
- Expor path do certificado via API
- Permitir download público do certificado
- Reutilizar certificados vencidos

## 📝 Validações

### No Upload

1. ✅ Empresa existe
2. ✅ Usuário tem permissão `MANAGE_COMPANIES`
3. ✅ Arquivo tem extensão .pfx ou .p12
4. ✅ Arquivo tem tamanho máximo de 10MB
5. ✅ Senha foi fornecida
6. ✅ Senha tem comprimento mínimo (implementar se necessário)

### Configuração Multer

```typescript
// src/companies/companies.controller.ts
@UseInterceptors(
  FileInterceptor('certificate', {
    storage: diskStorage({
      destination: './uploads/certificates',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        cb(null, `cert-${uniqueSuffix}${ext}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (file.mimetype === 'application/x-pkcs12' || 
          file.originalname.match(/\.(pfx|p12)$/)) {
        cb(null, true);
      } else {
        cb(new Error('Apenas arquivos .pfx ou .p12 são permitidos'), false);
      }
    },
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
    },
  }),
)
```

## 🔄 Fluxo Completo

### 1. Upload do Certificado

```
Cliente → Backend → Salvar arquivo → Criptografar senha → Salvar no BD
```

### 2. Emissão de NF-e

```
Cliente fornece senha → Backend valida senha → 
Backend lê certificado do disco → Assina XML → 
Envia para SEFAZ → Retorna resultado
```

### 3. Renovação do Certificado

```
Upload novo certificado → Substitui arquivo antigo → 
Atualiza hash da senha (se mudou) → Mantém histórico
```

## ⚠️ Avisos Importantes

### Validade

- Certificados A1 geralmente têm validade de **1 ano**
- Implementar notificação de vencimento próximo
- Bloquear emissão de NF-e com certificado vencido

### Backup

- Manter backup dos certificados em local seguro
- Considerar criptografar backups
- Testar restauração de backups periodicamente

### Conformidade

- Seguir normas da ICP-Brasil
- Manter registros de uso do certificado
- Auditar acessos ao certificado

## 📚 Referências

- [Documentação de Segurança](./SECURITY_SENSITIVE_DATA.md)
- [Uso do Certificado](./CERTIFICATE_USAGE.md)
- [Endpoints Admin](./ADMIN_EDIT_COMPANIES.md)
- [ICP-Brasil](https://www.gov.br/iti/pt-br/assuntos/icp-brasil)

## 🧪 Testes

### Teste Manual

```bash
# 1. Preparar certificado de teste
# Baixe um certificado de homologação da SEFAZ

# 2. Upload
curl -X POST http://localhost:4000/companies/admin/{companyId}/certificate \
  -H "Authorization: Bearer {token}" \
  -F "certificate=@certificado-teste.pfx" \
  -F "senha=senha123"

# 3. Verificar que dados sensíveis não aparecem
# Buscar empresa e confirmar que certificadoDigitalPath e 
# certificadoDigitalSenha não estão na resposta
curl http://localhost:4000/companies/{companyId} \
  -H "Authorization: Bearer {token}"

# 4. Tentar validar senha (criar endpoint de teste se necessário)

# 5. Remover certificado
curl -X DELETE http://localhost:4000/companies/admin/{companyId}/certificate \
  -H "Authorization: Bearer {token}"
```

### Teste Unitário

```typescript
describe('Certificate Upload', () => {
  it('should upload certificate and hash password', async () => {
    const file = {
      path: '/tmp/cert.pfx',
      filename: 'cert-123.pfx',
    };
    
    const result = await service.uploadCertificate(
      companyId,
      file as any,
      'senha123'
    );
    
    expect(result.certificadoDigitalSenha).toBeUndefined();
    expect(result.certificadoDigitalPath).toBeUndefined();
  });

  it('should validate certificate password', async () => {
    // Upload com senha conhecida
    await service.uploadCertificate(companyId, file, 'senha123');
    
    // Validar senha correta
    const isValid = await service.validateCertificatePassword(
      companyId,
      'senha123'
    );
    expect(isValid).toBe(true);
    
    // Validar senha incorreta
    const isInvalid = await service.validateCertificatePassword(
      companyId,
      'senhaErrada'
    );
    expect(isInvalid).toBe(false);
  });
});
```

## 💡 Melhorias Futuras

- [ ] Verificar validade do certificado ao fazer upload
- [ ] Extrair informações do certificado (CNPJ, validade, etc)
- [ ] Notificar automaticamente sobre vencimento próximo
- [ ] Implementar rotação automática de certificados
- [ ] Adicionar auditoria de uso do certificado
- [ ] Suporte para múltiplos certificados (histórico)
- [ ] Validar se CNPJ do certificado corresponde ao da empresa
