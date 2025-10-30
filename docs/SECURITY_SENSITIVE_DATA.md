# Segurança: Dados Sensíveis

## 🔒 Proteção de Dados Sensíveis do Certificado Digital

Este documento descreve as medidas de segurança implementadas para proteger dados sensíveis relacionados ao certificado digital A1 das empresas.

## Campos Protegidos

Os seguintes campos **NUNCA** são retornados nas respostas da API:

- `certificadoDigitalSenha` - Senha do certificado (armazenada com hash bcrypt)
- `certificadoDigitalPath` - Caminho do arquivo do certificado no servidor

## Implementação

### Método de Sanitização

Foi criado um método privado `removeSensitiveData()` no `CompaniesService` que remove automaticamente os campos sensíveis:

```typescript
private removeSensitiveData(company: any) {
  if (company) {
    delete company.certificadoDigitalSenha;
    delete company.certificadoDigitalPath;
  }
  return company;
}
```

### Métodos Atualizados

Todos os métodos que retornam dados de empresa foram atualizados para chamar `removeSensitiveData()` antes de retornar:

#### Métodos Públicos (acessíveis por usuários)
- ✅ `findAll()` - Lista empresas do usuário
- ✅ `findOne()` - Busca uma empresa específica

#### Métodos Administrativos
- ✅ `create()` - Criar nova empresa
- ✅ `update()` - Atualizar empresa (própria)
- ✅ `remove()` - Deletar empresa
- ✅ `toggleActive()` - Ativar/desativar empresa
- ✅ `findCompanyById()` - Buscar empresa por ID (admin)
- ✅ `updateCompanyAsAdmin()` - Atualizar empresa como admin
- ✅ `uploadLogo()` - Upload de logo
- ✅ `uploadCertificate()` - Upload de certificado
- ✅ `removeLogo()` - Remover logo
- ✅ `removeCertificate()` - Remover certificado

#### Métodos com Select Explícito (Já Seguros)
- ✅ `findAllForAdmin()` - Lista paginada com select explícito (não inclui campos sensíveis)

## Validação de Senha

Para validar a senha do certificado (ex: ao emitir NF-e), use o método `validateCertificatePassword()`:

```typescript
const isValid = await this.companiesService.validateCertificatePassword(
  companyId,
  senhaFornecidaPeloUsuario
);

if (!isValid) {
  throw new UnauthorizedException('Senha do certificado incorreta');
}
```

## Exemplo de Resposta Segura

Antes (INSEGURO):
```json
{
  "id": "123",
  "razaoSocial": "Empresa LTDA",
  "certificadoDigitalPath": "/uploads/certificates/cert-123.pfx",
  "certificadoDigitalSenha": "$2b$10$hash..."
}
```

Depois (SEGURO):
```json
{
  "id": "123",
  "razaoSocial": "Empresa LTDA",
  "hasCertificadoA1": true
}
```

**Campo Seguro Adicionado:**
- `hasCertificadoA1` (boolean) - Indica se a empresa possui certificado A1 cadastrado
- Este campo é seguro pois não expõe nenhuma informação sensível
- Útil para o frontend mostrar status e habilitar/desabilitar funcionalidades

## Armazenamento Seguro

### Senha do Certificado
- ✅ Criptografada com bcrypt (10 salt rounds)
- ✅ Nunca retornada na API
- ✅ Validação disponível via método dedicado

### Arquivo do Certificado
- ✅ Armazenado em diretório protegido (`uploads/certificates/`)
- ✅ Path nunca retornado na API
- ✅ Acesso controlado apenas internamente

## Checklist de Segurança

Ao adicionar novos métodos que retornam empresas:

- [ ] Chamar `this.removeSensitiveData()` antes de retornar
- [ ] OU usar `select` explícito excluindo campos sensíveis
- [ ] Testar resposta da API para garantir que campos sensíveis não aparecem
- [ ] Documentar no código se há campos sensíveis sendo manipulados

## Teste Manual

Para verificar que nenhum endpoint retorna dados sensíveis:

```bash
# 1. Criar empresa
curl -X POST http://localhost:4000/companies \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"razaoSocial": "Test LTDA", "cnpj": "12345678901234", ...}'

# 2. Upload certificado
curl -X POST http://localhost:4000/companies/admin/123/certificate \
  -H "Authorization: Bearer $TOKEN" \
  -F "certificate=@cert.pfx" \
  -F "senha=minhaSenha"

# 3. Buscar empresa
curl http://localhost:4000/companies/123 \
  -H "Authorization: Bearer $TOKEN"

# Verificar que a resposta NÃO contém:
# - certificadoDigitalSenha
# - certificadoDigitalPath
```

## Referências

- [Documentação de Uso do Certificado](./CERTIFICATE_USAGE.md)
- [Endpoints de Administração](./ADMIN_EDIT_COMPANIES.md)
