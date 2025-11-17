# 🔐 Sistema de Criptografia para Senha de Certificado Digital

## Mudança Implementada

O sistema foi atualizado para usar **criptografia reversível (AES-256-CBC)** na senha do certificado digital A1, substituindo o antigo sistema de hash bcrypt.

## Por que a mudança?

### Antes (bcrypt):
- ❌ Hash **unidirecional** - não permite recuperar a senha original
- ❌ Impossível usar a senha para assinar NF-e
- ❌ Não atende aos requisitos de emissão fiscal

### Agora (AES-256-CBC):
- ✅ Criptografia **reversível** - permite descriptografar quando necessário
- ✅ Segura - usa chave de 256 bits com IV aleatório
- ✅ Permite usar a senha real para operações com certificado A1
- ✅ Compatível com bibliotecas fiscais (node-sped-nfe)

## Arquivos Criados/Modificados

### 1. **EncryptionService** (`src/common/services/encryption.service.ts`)
```typescript
encrypt(text: string): string     // Criptografa usando AES-256-CBC
decrypt(text: string): string     // Descriptografa usando AES-256-CBC
isEncrypted(text: string): boolean // Verifica formato
```

### 2. **CompaniesService** (modificado)
- Usa `EncryptionService` para criptografar senha no upload
- Novos métodos:
  - `validateCertificatePassword()` - Valida senha fornecida
  - `getDecryptedCertificatePassword()` - Retorna senha real (uso interno)

### 3. **NFeSefazService** (modificado)
- Usa `CompaniesService.getDecryptedCertificatePassword()`
- Passa senha descriptografada para biblioteca node-sped-nfe

## Configuração

### Variável de Ambiente (IMPORTANTE!)

Adicione ao seu `.env`:

```env
# Chave de criptografia para senhas de certificados (mínimo 32 caracteres)
ENCRYPTION_KEY=sua-chave-secreta-muito-forte-aqui-min-32-chars
```

⚠️ **ATENÇÃO**: 
- Use uma chave **forte e única** para produção
- **NUNCA** commite a chave real no Git
- Se perder a chave, as senhas não poderão ser recuperadas

### Gerador de Chave Segura

```bash
# Linux/Mac
openssl rand -base64 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Migração de Dados

### Certificados Existentes

Se você já tem certificados cadastrados com o sistema antigo (bcrypt):

1. **Execute o script de migração**:
```bash
npm run ts-node scripts/migrate-certificate-passwords.ts
```

2. **O script irá**:
   - Listar todas as empresas com certificado
   - Oferecer opção de limpar as senhas antigas
   - Instruir sobre o re-upload necessário

3. **Re-faça o upload** dos certificados:
```bash
POST /companies/{id}/certificate
Content-Type: multipart/form-data

certificate: <arquivo.pfx>
senha: <senha-do-certificado>
```

## Como Funciona

### Upload de Certificado
```typescript
// 1. Upload via CompaniesController
POST /companies/{id}/certificate
{ certificate: file, senha: "123456" }

// 2. CompaniesService criptografa
const encrypted = encryptionService.encrypt("123456");
// Resultado: "a1b2c3d4...IV...e5f6g7h8...encrypted"

// 3. Salva no banco
certificadoDigitalSenha: "a1b2c3d4...IV...e5f6g7h8...encrypted"
```

### Uso na Emissão de NF-e
```typescript
// 1. NFeSefazService busca senha
const senha = await companiesService.getDecryptedCertificatePassword(companyId);
// Resultado: "123456" (senha original)

// 2. Usa senha com certificado
new Tools(config, {
  pfx: certificatePath,
  senha: senha // Senha real descriptografada
});
```

## Segurança

### Formato de Armazenamento
```
IV:ENCRYPTED_TEXT
```
- `IV` (16 bytes em hex): Initialization Vector aleatório
- `ENCRYPTED_TEXT`: Texto criptografado com AES-256-CBC

### Pontos de Segurança
- ✅ Chave nunca exposta no código
- ✅ IV único para cada criptografia
- ✅ Algoritmo AES-256 (padrão militar)
- ✅ Senha descriptografada apenas em memória (nunca retornada ao cliente)
- ✅ Método de descriptografia é privado/interno
- ✅ Logs não expõem senhas

### Boas Práticas
1. **Nunca** retorne `certificadoDigitalSenha` em APIs públicas
2. **Nunca** logue senhas descriptografadas
3. **Sempre** use `getDecryptedCertificatePassword()` apenas em serviços backend
4. **Rotacione** a `ENCRYPTION_KEY` periodicamente (requer re-upload de certificados)
5. **Monitore** acessos aos métodos de descriptografia

## API Endpoints Afetados

### Upload de Certificado
```http
POST /companies/{id}/certificate
Authorization: Bearer {admin-token}
Content-Type: multipart/form-data

certificate: <arquivo.pfx>
senha: senha-do-certificado
```

### Remover Certificado
```http
DELETE /companies/{id}/certificate
Authorization: Bearer {admin-token}
```

### Emissão de NF-e (usa senha automaticamente)
```http
POST /fiscal/nfe/emitir
Authorization: Bearer {token}
Content-Type: application/json

{
  "saleId": "uuid-da-venda",
  "enviarSefaz": true
}
```

## Troubleshooting

### Erro: "Erro ao descriptografar"
- ✅ Verifique se `ENCRYPTION_KEY` está configurada
- ✅ Verifique se a chave não mudou desde o upload
- ✅ Re-faça upload do certificado

### Erro: "Certificado digital não encontrado"
- ✅ Verifique se o certificado foi cadastrado
- ✅ Use `GET /companies/{id}` e procure `hasCertificate: true`

### Erro: "Senha do certificado não cadastrada"
- ✅ A senha foi removida/limpada
- ✅ Re-faça upload do certificado com a senha

### Erro: "Arquivo do certificado não encontrado"
- ✅ Verifique se o arquivo .pfx existe no path
- ✅ Verifique permissões de leitura
- ✅ Re-faça upload do certificado

## Checklist de Implementação

### Backend
- [x] Criar `EncryptionService`
- [x] Atualizar `CompaniesService` para usar criptografia AES
- [x] Atualizar `NFeSefazService` para descriptografar senha
- [x] Adicionar `ENCRYPTION_KEY` ao `.env.example`
- [x] Criar script de migração
- [x] Adicionar `CompaniesModule` ao `FiscalModule`

### Deploy
- [ ] Configurar `ENCRYPTION_KEY` no servidor de produção
- [ ] Executar script de migração
- [ ] Instruir administradores sobre re-upload de certificados
- [ ] Testar emissão de NF-e em homologação
- [ ] Documentar para equipe de suporte

### Testes
- [ ] Testar upload de certificado
- [ ] Testar validação de senha
- [ ] Testar emissão de NF-e
- [ ] Testar remoção de certificado
- [ ] Testar com certificado expirado

## Próximos Passos

1. ✅ Configure `ENCRYPTION_KEY` no `.env`
2. ✅ Execute migração de certificados existentes
3. ✅ Teste upload de certificado
4. ✅ Teste emissão de NF-e em homologação
5. ✅ Documente processo para equipe

---

**Data de Implementação**: 16/11/2025  
**Versão**: 1.0.0  
**Impacto**: ALTO - Requer re-upload de certificados digitais
