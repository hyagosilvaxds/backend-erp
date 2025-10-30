# 👤 Gestão de Perfil de Usuário - API Documentation

## 🎯 Visão Geral

Endpoints para gerenciamento de perfil dos usuários, incluindo:
- 📷 Upload e remoção de foto
- 📧 Alteração de email (apenas admin)
- 🔐 Alteração de senha (com validação)

**🔒 PERMISSÕES E ACESSO:**
- ✅ **Foto**: Admin, usuário com permissão `users.update` OU próprio usuário
- ✅ **Email**: Apenas admin ou usuário com permissão `users.update`
- ✅ **Senha**: Admin, usuário com permissão `users.update` OU próprio usuário

---

## 📡 Endpoints

### 1. Upload de Foto do Usuário

```
POST /users/:id/photo
```

**Autenticação:** JWT (Bearer Token)

**Permissões:**
- Admin com `users.update` ✅
- Usuário com permissão `users.update` ✅
- Próprio usuário ✅

**Content-Type:** `multipart/form-data`

**Form Data:**
- `photo` (file, **OBRIGATÓRIO**) - Arquivo de imagem

**Validações:**
- ✅ Formatos aceitos: JPG, JPEG, PNG, GIF
- ✅ Tamanho máximo: 5MB
- ✅ Substitui foto anterior automaticamente

**Exemplo com curl:**
```bash
# Upload de foto
curl -X POST http://localhost:4000/users/user-uuid/photo \
  -H "Authorization: Bearer $TOKEN" \
  -F "photo=@/caminho/para/foto.jpg"
```

**Exemplo com FormData (JavaScript):**
```javascript
const formData = new FormData();
formData.append('photo', fileInput.files[0]);

const response = await fetch(`/api/users/${userId}/photo`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
  body: formData,
});
```

**Resposta:**
```json
{
  "id": "uuid",
  "email": "usuario@example.com",
  "name": "Nome do Usuário",
  "photoUrl": "/uploads/users/user-photo-1761402345678-123456789.jpg",
  "active": true,
  "updatedAt": "2025-10-25T19:00:00.000Z"
}
```

---

### 2. Remover Foto do Usuário

```
DELETE /users/:id/photo
```

**Autenticação:** JWT (Bearer Token)

**Permissões:**
- Admin com `users.update` ✅
- Usuário com permissão `users.update` ✅
- Próprio usuário ✅

**Exemplo:**
```bash
curl -X DELETE http://localhost:4000/users/user-uuid/photo \
  -H "Authorization: Bearer $TOKEN"
```

**Resposta:**
```json
{
  "id": "uuid",
  "email": "usuario@example.com",
  "name": "Nome do Usuário",
  "photoUrl": null,
  "active": true,
  "updatedAt": "2025-10-25T19:05:00.000Z"
}
```

---

### 3. Alterar Email do Usuário

```
PATCH /users/:id/email
```

**Permissão:** `users.update` (apenas admin)

**⚠️ IMPORTANTE:** Apenas administradores podem alterar o email de outros usuários.

**Body:**
```json
{
  "email": "novo.email@example.com"
}
```

**Campos:**
- `email` (string, **OBRIGATÓRIO**) - Novo endereço de email

**Validações:**
- ✅ Email deve ser válido
- ✅ Email não pode estar em uso por outro usuário

**Exemplo:**
```bash
curl -X PATCH http://localhost:4000/users/user-uuid/email \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "novo.email@example.com"
  }'
```

**Resposta:**
```json
{
  "id": "uuid",
  "email": "novo.email@example.com",
  "name": "Nome do Usuário",
  "photoUrl": "/uploads/users/user-photo-123.jpg",
  "active": true,
  "updatedAt": "2025-10-25T19:10:00.000Z"
}
```

---

### 4. Alterar Senha do Usuário

```
PATCH /users/:id/password
```

**Autenticação:** JWT (Bearer Token)

**Permissões:**
- Admin com `users.update` ✅ (não precisa informar senha antiga)
- Usuário com permissão `users.update` ✅ (não precisa informar senha antiga)
- Próprio usuário ✅ (DEVE informar senha antiga)

**Body:**
```json
{
  "oldPassword": "senhaAntiga123",
  "newPassword": "novaSenha123"
}
```

**Campos:**
- `oldPassword` (string, **OBRIGATÓRIO**) - Senha atual do usuário
- `newPassword` (string, **OBRIGATÓRIO**) - Nova senha (mínimo 6 caracteres)

**Validações:**
- ✅ Se próprio usuário: senha antiga deve estar correta
- ✅ Se admin: não valida senha antiga
- ✅ Nova senha deve ter no mínimo 6 caracteres
- ✅ Nova senha é armazenada com hash bcrypt

**Exemplo - Próprio Usuário:**
```bash
# Usuário alterando sua própria senha (precisa da senha antiga)
curl -X PATCH http://localhost:4000/users/meu-uuid/password \
  -H "Authorization: Bearer $MEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "oldPassword": "senhaAntiga123",
    "newPassword": "novaSenha123"
  }'
```

**Exemplo - Admin:**
```bash
# Admin alterando senha de outro usuário (não precisa da senha antiga)
curl -X PATCH http://localhost:4000/users/outro-usuario-uuid/password \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "oldPassword": "qualquerCoisa",
    "newPassword": "novaSenha123"
  }'
```

**Resposta:**
```json
{
  "id": "uuid",
  "email": "usuario@example.com",
  "name": "Nome do Usuário",
  "photoUrl": "/uploads/users/user-photo-123.jpg",
  "active": true,
  "updatedAt": "2025-10-25T19:15:00.000Z",
  "message": "Senha alterada com sucesso"
}
```

---

## 💡 Casos de Uso

### 1. Usuário Alterando Próprio Perfil

```typescript
// 1. Upload de foto
const formData = new FormData();
formData.append('photo', photoFile);

await api.post(`/users/${currentUserId}/photo`, formData, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'multipart/form-data',
  },
});

// 2. Alterar senha (precisa da senha antiga)
await api.patch(`/users/${currentUserId}/password`, {
  oldPassword: 'senhaAtual',
  newPassword: 'novaSenha123',
}, {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});
```

### 2. Admin Gerenciando Usuário

```typescript
// 1. Alterar email
await api.patch(`/users/${userId}/email`, {
  email: 'novo.email@example.com',
}, {
  headers: {
    'Authorization': `Bearer ${adminToken}`,
  },
});

// 2. Resetar senha (não precisa da senha antiga)
await api.patch(`/users/${userId}/password`, {
  oldPassword: '', // Ignorado para admin
  newPassword: 'senhaTemporaria123',
}, {
  headers: {
    'Authorization': `Bearer ${adminToken}`,
  },
});

// 3. Remover foto
await api.delete(`/users/${userId}/photo`, {
  headers: {
    'Authorization': `Bearer ${adminToken}`,
  },
});
```

---

## 🎨 Exemplo Frontend - React Component

### Componente de Upload de Foto

```tsx
import { useState } from 'react';

interface PhotoUploadProps {
  userId: string;
  currentPhotoUrl?: string;
  onPhotoUpdated: (newPhotoUrl: string) => void;
}

export function PhotoUpload({ userId, currentPhotoUrl, onPhotoUpdated }: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentPhotoUrl || null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamanho
    if (file.size > 5 * 1024 * 1024) {
      alert('Arquivo muito grande! Máximo 5MB');
      return;
    }

    // Validar tipo
    if (!file.type.match(/image\/(jpg|jpeg|png|gif)/)) {
      alert('Apenas imagens JPG, PNG ou GIF são permitidas');
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);

      const response = await fetch(`/api/users/${userId}/photo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Erro ao fazer upload');

      const data = await response.json();
      onPhotoUpdated(data.photoUrl);
      alert('Foto atualizada com sucesso!');
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao fazer upload da foto');
      setPreview(currentPhotoUrl || null);
    } finally {
      setUploading(false);
    }
  }

  async function handleRemovePhoto() {
    if (!confirm('Deseja remover sua foto?')) return;

    setUploading(true);
    try {
      const response = await fetch(`/api/users/${userId}/photo`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Erro ao remover foto');

      setPreview(null);
      onPhotoUpdated('');
      alert('Foto removida com sucesso!');
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao remover foto');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="photo-upload">
      <div className="photo-preview">
        {preview ? (
          <img src={preview} alt="Foto do usuário" />
        ) : (
          <div className="no-photo">Sem foto</div>
        )}
      </div>

      <div className="photo-actions">
        <label className="upload-button" disabled={uploading}>
          {uploading ? 'Enviando...' : 'Alterar Foto'}
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif"
            onChange={handleFileChange}
            disabled={uploading}
            style={{ display: 'none' }}
          />
        </label>

        {preview && (
          <button
            onClick={handleRemovePhoto}
            disabled={uploading}
            className="remove-button"
          >
            Remover Foto
          </button>
        )}
      </div>

      <p className="photo-info">
        Formatos: JPG, PNG, GIF. Máximo: 5MB
      </p>
    </div>
  );
}
```

### Componente de Alteração de Senha

```tsx
import { useState } from 'react';

interface ChangePasswordProps {
  userId: string;
  isOwnProfile: boolean;
}

export function ChangePassword({ userId, isOwnProfile }: ChangePasswordProps) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert('As senhas não coincidem');
      return;
    }

    if (newPassword.length < 6) {
      alert('A nova senha deve ter no mínimo 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/users/${userId}/password`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          oldPassword,
          newPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao alterar senha');
      }

      alert('Senha alterada com sucesso!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Erro:', error);
      alert(error.message || 'Erro ao alterar senha');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="change-password-form">
      <h3>Alterar Senha</h3>

      {isOwnProfile && (
        <div className="form-field">
          <label>Senha Atual:</label>
          <input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
      )}

      <div className="form-field">
        <label>Nova Senha:</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          minLength={6}
        />
        <small>Mínimo 6 caracteres</small>
      </div>

      <div className="form-field">
        <label>Confirmar Nova Senha:</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={6}
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Alterando...' : 'Alterar Senha'}
      </button>
    </form>
  );
}
```

### Componente de Alteração de Email (Admin)

```tsx
import { useState } from 'react';

interface ChangeEmailProps {
  userId: string;
  currentEmail: string;
  onEmailChanged: (newEmail: string) => void;
}

export function ChangeEmail({ userId, currentEmail, onEmailChanged }: ChangeEmailProps) {
  const [newEmail, setNewEmail] = useState(currentEmail);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (newEmail === currentEmail) {
      alert('O email não foi alterado');
      return;
    }

    if (!newEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      alert('Email inválido');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/users/${userId}/email`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: newEmail,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao alterar email');
      }

      const data = await response.json();
      onEmailChanged(data.email);
      alert('Email alterado com sucesso!');
    } catch (error: any) {
      console.error('Erro:', error);
      alert(error.message || 'Erro ao alterar email');
      setNewEmail(currentEmail); // Reverter
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="change-email-form">
      <h3>Alterar Email</h3>

      <div className="form-field">
        <label>Novo Email:</label>
        <input
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          required
        />
      </div>

      <button type="submit" disabled={loading || newEmail === currentEmail}>
        {loading ? 'Alterando...' : 'Alterar Email'}
      </button>

      <p className="warning">
        ⚠️ O usuário precisará fazer login com o novo email
      </p>
    </form>
  );
}
```

---

## ⚠️ Erros Comuns

### 403 - Sem permissão
```json
{
  "statusCode": 403,
  "message": "Você não tem permissão para alterar a foto deste usuário",
  "error": "Forbidden"
}
```

### 401 - Senha antiga incorreta
```json
{
  "statusCode": 401,
  "message": "Senha antiga incorreta",
  "error": "Unauthorized"
}
```

### 400 - Nova senha muito curta
```json
{
  "statusCode": 400,
  "message": "Nova senha deve ter no mínimo 6 caracteres",
  "error": "Bad Request"
}
```

### 409 - Email já em uso
```json
{
  "statusCode": 409,
  "message": "Email já está em uso",
  "error": "Conflict"
}
```

### 400 - Usuário não possui foto
```json
{
  "statusCode": 400,
  "message": "Usuário não possui foto",
  "error": "Bad Request"
}
```

### 400 - Arquivo muito grande
```json
{
  "statusCode": 400,
  "message": "Arquivo muito grande. Máximo: 5MB",
  "error": "Bad Request"
}
```

### 400 - Formato inválido
```json
{
  "statusCode": 400,
  "message": "Apenas imagens são permitidas!",
  "error": "Bad Request"
}
```

---

## 🔒 Segurança

### Controle de Acesso

**Upload/Remoção de Foto:**
```typescript
// Usuário pode alterar própria foto
if (currentUser.userId === userId) {
  // ✅ Permitido
}

// Admin pode alterar foto de qualquer usuário
if (currentUser.permissions.includes('users.update')) {
  // ✅ Permitido
}

// Outros casos
// ❌ Negado (403 Forbidden)
```

**Alteração de Email:**
```typescript
// Apenas admin ou usuário com permissão
if (currentUser.permissions.includes('users.update')) {
  // ✅ Permitido
}

// Outros casos
// ❌ Negado (403 Forbidden)
```

**Alteração de Senha:**
```typescript
// Usuário alterando própria senha
if (currentUser.userId === userId) {
  // ✅ Permitido (COM validação de senha antiga)
}

// Admin alterando senha de outro usuário
if (currentUser.permissions.includes('users.update')) {
  // ✅ Permitido (SEM validação de senha antiga)
}

// Outros casos
// ❌ Negado (403 Forbidden)
```

### Boas Práticas

1. **Validação de Arquivos:**
   - ✅ Valide formato no cliente E no servidor
   - ✅ Limite tamanho máximo (5MB)
   - ✅ Sanitize nome do arquivo

2. **Senhas:**
   - ✅ Hash bcrypt com 10 rounds
   - ✅ Mínimo 6 caracteres
   - ✅ Validar senha antiga para usuário comum
   - ✅ Admin não precisa validar senha antiga

3. **Email:**
   - ✅ Validar formato
   - ✅ Verificar duplicação
   - ✅ Apenas admin pode alterar

4. **Fotos:**
   - ✅ Deletar foto anterior ao fazer upload
   - ✅ Armazenar em diretório separado
   - ✅ Servir via arquivos estáticos

---

## 📚 Referências

- [Gerenciamento de Usuários](./USERS_MANAGEMENT.md)
- [Sistema de Autenticação](./AUTH.md)
- [Permissões e Roles](./AUTH_PERMISSIONS.md)
- [Upload de Arquivos - Empresas](./COMPANIES.md#upload-de-logo)
