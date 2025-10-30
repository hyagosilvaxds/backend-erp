# 🔄 Changelog: Campo hasCertificadoA1

**Data:** 25 de outubro de 2025  
**Tipo:** Feature/Enhancement  
**Versão:** 1.1.0

## 📋 Resumo

Adicionado campo `hasCertificadoA1` (boolean) em todas as respostas de endpoints que retornam dados de empresa. Este campo indica se a empresa possui certificado digital A1 cadastrado, sem expor informações sensíveis.

## 🎯 Motivação

Permitir que o frontend:
- Mostre visualmente se a empresa tem certificado configurado
- Habilite/desabilite funcionalidades de emissão de NF-e
- Exiba alertas quando certificado não estiver configurado
- Filtre empresas por status do certificado
- Exiba estatísticas de certificados cadastrados

## 🔧 Implementação

### Backend (companies.service.ts)

Método `removeSensitiveData()` atualizado:

```typescript
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
```

### Métodos Afetados

Todos os métodos que retornam empresa agora incluem `hasCertificadoA1`:

1. ✅ `create()` - Criar empresa
2. ✅ `findAll()` - Listar empresas do usuário
3. ✅ `findOne()` - Buscar empresa por ID
4. ✅ `update()` - Atualizar empresa própria
5. ✅ `remove()` - Deletar empresa
6. ✅ `toggleActive()` - Ativar/desativar
7. ✅ `findCompanyById()` - Buscar por ID (admin)
8. ✅ `updateCompanyAsAdmin()` - Atualizar como admin
9. ✅ `uploadLogo()` - Upload de logo
10. ✅ `uploadCertificate()` - Upload de certificado
11. ✅ `removeLogo()` - Remover logo
12. ✅ `removeCertificate()` - Remover certificado

## 📊 Exemplos de Resposta

### Antes (sem campo indicador)

```json
{
  "id": "123",
  "razaoSocial": "Empresa LTDA",
  "cnpj": "12345678000190"
}
```

### Depois (com campo indicador)

```json
{
  "id": "123",
  "razaoSocial": "Empresa LTDA",
  "cnpj": "12345678000190",
  "hasCertificadoA1": true
}
```

## 🔒 Segurança

**O que NÃO mudou:**
- ✅ Senha do certificado continua criptografada com bcrypt
- ✅ Path do certificado nunca é exposto
- ✅ Campos sensíveis continuam sendo removidos

**O que foi adicionado:**
- ✅ Campo boolean seguro indicando presença do certificado
- ✅ Não expõe nenhuma informação sensível
- ✅ Útil para lógica do frontend

## 📝 Uso no Frontend

### Interface TypeScript

```typescript
interface Company {
  id: string;
  razaoSocial: string;
  cnpj: string;
  hasCertificadoA1: boolean; // 👈 Novo campo
  // ... outros campos
}
```

### Exemplo de Uso

```tsx
function EmitirNfeButton({ company }: { company: Company }) {
  return (
    <button 
      disabled={!company.hasCertificadoA1}
      onClick={() => emitirNfe(company.id)}
    >
      {company.hasCertificadoA1 
        ? 'Emitir NF-e' 
        : 'Configure o certificado A1'
      }
    </button>
  );
}
```

## 📚 Documentação Atualizada

- ✅ `/docs/CERTIFICATE_A1_UPLOAD.md` - Respostas dos endpoints atualizadas
- ✅ `/docs/ADMIN_EDIT_COMPANIES.md` - Todas as respostas incluem o novo campo
- ✅ `/docs/SECURITY_SENSITIVE_DATA.md` - Exemplo de resposta segura atualizado
- ✅ `/docs/FRONTEND_CERTIFICATE_EXAMPLE.md` - Exemplos práticos criados (NOVO)

## ✅ Testes

### Teste Manual

```bash
# 1. Buscar empresa sem certificado
curl http://localhost:4000/companies/{id} \
  -H "Authorization: Bearer {token}"
# Esperado: "hasCertificadoA1": false

# 2. Upload de certificado
curl -X POST http://localhost:4000/companies/admin/{id}/certificate \
  -H "Authorization: Bearer {token}" \
  -F "certificate=@cert.pfx" \
  -F "senha=senha123"
# Esperado: "hasCertificadoA1": true

# 3. Buscar empresa novamente
curl http://localhost:4000/companies/{id} \
  -H "Authorization: Bearer {token}"
# Esperado: "hasCertificadoA1": true

# 4. Remover certificado
curl -X DELETE http://localhost:4000/companies/admin/{id}/certificate \
  -H "Authorization: Bearer {token}"
# Esperado: "hasCertificadoA1": false
```

## 🚀 Breaking Changes

**Nenhum!** 

Esta é uma mudança **backward compatible**:
- Apenas adiciona um novo campo
- Não remove ou renomeia campos existentes
- Não altera comportamento de endpoints
- Frontend antigo continuará funcionando (apenas não verá o novo campo)

## 🔄 Migration

Não é necessária migração de banco de dados. O campo é calculado dinamicamente baseado na existência de `certificadoDigitalPath`.

## 📈 Benefícios

1. **UX Melhorada**: Frontend pode mostrar status visual claro
2. **Validação Preventiva**: Desabilitar ações que requerem certificado
3. **Estatísticas**: Dashboard pode mostrar quantas empresas têm certificado
4. **Filtros**: Listar empresas com/sem certificado
5. **Segurança Mantida**: Nenhum dado sensível é exposto

## 🎯 Casos de Uso Frontend

1. **Badge de Status**
   ```tsx
   {company.hasCertificadoA1 ? '✓ Certificado OK' : '✗ Sem certificado'}
   ```

2. **Validação antes de Emitir NF-e**
   ```tsx
   if (!company.hasCertificadoA1) {
     alert('Configure o certificado A1 primeiro!');
     return;
   }
   ```

3. **Filtro em Lista**
   ```tsx
   companies.filter(c => c.hasCertificadoA1) // Apenas com certificado
   ```

4. **Alerta Condicional**
   ```tsx
   {!company.hasCertificadoA1 && (
     <Alert>Faça upload do certificado A1</Alert>
   )}
   ```

## 👥 Autores

- Backend: Implementação do campo `hasCertificadoA1`
- Documentação: Atualização completa + exemplos frontend

## 🔗 Referências

- Issue: #N/A
- PR: #N/A
- Docs: `/docs/FRONTEND_CERTIFICATE_EXAMPLE.md`

---

**Status:** ✅ Concluído e Documentado
