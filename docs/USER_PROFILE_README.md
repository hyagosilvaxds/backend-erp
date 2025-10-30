# 👤 Gestão de Perfil de Usuário - Resumo

## 📋 Índice
- [📸 Upload de Foto](#-upload-de-foto)
- [📧 Alterar Email](#-alterar-email)
- [🔐 Alterar Senha](#-alterar-senha)
- [🔒 Controle de Acesso](#-controle-de-acesso)

---

## 📸 Upload de Foto

### Endpoint
```
POST /users/:id/photo
DELETE /users/:id/photo
```

### Permissões
- ✅ Próprio usuário
- ✅ Admin com `users.update`

### Validações
- Formatos: JPG, JPEG, PNG, GIF
- Tamanho máximo: 5MB
- Foto anterior deletada automaticamente

### Exemplo
```bash
# Upload
curl -X POST http://localhost:4000/users/$USER_ID/photo \
  -H "Authorization: Bearer $TOKEN" \
  -F "photo=@foto.jpg"

# Remover
curl -X DELETE http://localhost:4000/users/$USER_ID/photo \
  -H "Authorization: Bearer $TOKEN"
```

### Resposta
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "Nome",
  "photoUrl": "/uploads/users/user-photo-1761402345678-123456789.jpg",
  "active": true
}
```

---

## 📧 Alterar Email

### Endpoint
```
PATCH /users/:id/email
```

### Permissões
- ✅ Apenas Admin com `users.update`

### Validações
- Email válido
- Email único no sistema

### Exemplo
```bash
curl -X PATCH http://localhost:4000/users/$USER_ID/email \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email": "novo@example.com"}'
```

### Resposta
```json
{
  "id": "uuid",
  "email": "novo@example.com",
  "name": "Nome",
  "photoUrl": "/uploads/users/photo.jpg",
  "active": true
}
```

---

## 🔐 Alterar Senha

### Endpoint
```
PATCH /users/:id/password
```

### Permissões
- ✅ Próprio usuário (COM validação de senha antiga)
- ✅ Admin com `users.update` (SEM validação de senha antiga)

### Validações
- Nova senha: mínimo 6 caracteres
- Senha antiga: obrigatória para próprio usuário

### Exemplo - Próprio Usuário
```bash
curl -X PATCH http://localhost:4000/users/$USER_ID/password \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "oldPassword": "senhaAntiga123",
    "newPassword": "novaSenha123"
  }'
```

### Exemplo - Admin (Reset de Senha)
```bash
curl -X PATCH http://localhost:4000/users/$OTHER_USER_ID/password \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "oldPassword": "",
    "newPassword": "senhaTemporaria123"
  }'
```

### Resposta
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "Nome",
  "photoUrl": "/uploads/users/photo.jpg",
  "active": true,
  "message": "Senha alterada com sucesso"
}
```

---

## 🔒 Controle de Acesso

### Matriz de Permissões

| Ação | Próprio Usuário | Admin | Usuário com `users.update` |
|------|----------------|-------|---------------------------|
| **Upload de Foto** | ✅ | ✅ | ✅ |
| **Remover Foto** | ✅ | ✅ | ✅ |
| **Alterar Email** | ❌ | ✅ | ✅ |
| **Alterar Senha** | ✅ (com senha antiga) | ✅ (sem senha antiga) | ✅ (sem senha antiga) |

### Regras de Negócio

1. **Foto:**
   - Usuário pode gerenciar própria foto
   - Admin pode gerenciar foto de qualquer usuário
   - Foto anterior é deletada ao fazer upload de nova
   - Arquivos salvos em `/uploads/users/`

2. **Email:**
   - Apenas admin pode alterar email
   - Email deve ser único
   - Usuário precisará fazer login com novo email
   - **Não** pode alterar próprio email (apenas admin)

3. **Senha:**
   - Usuário pode alterar própria senha (COM senha antiga)
   - Admin pode resetar senha de qualquer usuário (SEM senha antiga)
   - Nova senha: mínimo 6 caracteres
   - Hash bcrypt com 10 rounds

---

## 🎯 Fluxos Comuns

### Usuário Atualizando Perfil

```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"senha123"}' \
  | jq -r '.access_token')

# 2. Obter próprio ID
USER_ID=$(curl -s http://localhost:4000/users/me \
  -H "Authorization: Bearer $TOKEN" | jq -r '.id')

# 3. Upload de foto
curl -X POST http://localhost:4000/users/$USER_ID/photo \
  -H "Authorization: Bearer $TOKEN" \
  -F "photo=@minha-foto.jpg"

# 4. Alterar senha
curl -X PATCH http://localhost:4000/users/$USER_ID/password \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"oldPassword":"senha123","newPassword":"novaSenha456"}'
```

### Admin Gerenciando Usuário

```bash
# 1. Login como admin
ADMIN_TOKEN=$(curl -s -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' \
  | jq -r '.access_token')

# 2. Buscar usuário
USER_ID=$(curl -s "http://localhost:4000/users?search=maria" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq -r '.users[0].id')

# 3. Alterar email
curl -X PATCH http://localhost:4000/users/$USER_ID/email \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"novo.email@example.com"}'

# 4. Resetar senha (sem validar senha antiga)
curl -X PATCH http://localhost:4000/users/$USER_ID/password \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"oldPassword":"","newPassword":"senhaTemporaria123"}'

# 5. Upload de foto
curl -X POST http://localhost:4000/users/$USER_ID/photo \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -F "photo=@foto-usuario.jpg"
```

---

## ⚠️ Erros Comuns

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Você não tem permissão para alterar a foto deste usuário",
  "error": "Forbidden"
}
```
**Solução:** Verifique se está alterando próprio perfil OU tem permissão `users.update`

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Senha antiga incorreta",
  "error": "Unauthorized"
}
```
**Solução:** Verifique a senha antiga ao alterar própria senha

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "Email já está em uso",
  "error": "Conflict"
}
```
**Solução:** Escolha um email diferente

### 400 Bad Request (Arquivo)
```json
{
  "statusCode": 400,
  "message": "Arquivo muito grande. Máximo: 5MB",
  "error": "Bad Request"
}
```
**Solução:** Reduza o tamanho da imagem

### 400 Bad Request (Formato)
```json
{
  "statusCode": 400,
  "message": "Apenas imagens são permitidas!",
  "error": "Bad Request"
}
```
**Solução:** Use JPG, PNG ou GIF

---

## 📚 Documentação Completa

Para mais detalhes, exemplos de frontend (React) e informações completas:

- 📄 **Documentação Detalhada:** [`USER_PROFILE_MANAGEMENT.md`](./USER_PROFILE_MANAGEMENT.md)
- 🚀 **Guia Rápido:** [`USERS_QUICKSTART.md`](./USERS_QUICKSTART.md)
- 📖 **Gerenciamento de Usuários:** [`USERS_MANAGEMENT.md`](./USERS_MANAGEMENT.md)
- 🔐 **Sistema de Autenticação:** [`AUTH.md`](./AUTH.md)

---

## 🔧 Configuração Técnica

### Armazenamento de Fotos
```typescript
// Multer configuration
storage: diskStorage({
  destination: './uploads/users',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `user-photo-${uniqueSuffix}${extname(file.originalname)}`);
  }
})
```

### Validação de Arquivos
```typescript
// File filter
fileFilter: (req, file, cb) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return cb(new Error('Apenas imagens são permitidas!'), false);
  }
  cb(null, true);
}

// Size limit
limits: { fileSize: 5 * 1024 * 1024 } // 5MB
```

### Hash de Senha
```typescript
// Bcrypt with 10 rounds
const hashedPassword = await bcrypt.hash(newPassword, 10);
```

---

## ✅ Checklist de Implementação

### Backend
- [x] Schema Prisma atualizado (campo `photoUrl`)
- [x] DTOs criados (`ChangePasswordDto`, `ChangeEmailDto`)
- [x] Controller com 4 endpoints
- [x] Service com 4 métodos
- [x] Multer configurado
- [x] Validação de permissões
- [x] Upload directory criado
- [x] Testes de compilação

### Frontend (A fazer)
- [ ] Componente de upload de foto
- [ ] Componente de alteração de senha
- [ ] Componente de alteração de email (admin)
- [ ] Preview de imagem
- [ ] Validação de formato/tamanho no cliente
- [ ] Tratamento de erros
- [ ] Loading states

### Testes (A fazer)
- [ ] Upload de foto válida
- [ ] Upload com arquivo muito grande
- [ ] Upload com formato inválido
- [ ] Alteração de senha com senha antiga correta
- [ ] Alteração de senha com senha antiga incorreta
- [ ] Admin resetando senha
- [ ] Alteração de email com email duplicado
- [ ] Alteração de email com email válido
- [ ] Testes de permissão (403)

---

**Última atualização:** 2025-01-25
**Versão da API:** 1.0.0
