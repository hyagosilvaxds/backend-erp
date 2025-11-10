# 🔐 Alteração de Senha - Resumo da Implementação

## ✅ O Que Foi Criado

### 1. **Endpoint Principal**
```
PATCH /auth/change-password
```

**Funcionalidade**: Permite que o usuário autenticado altere sua própria senha

**Segurança**:
- ✅ Requer token JWT válido
- ✅ Valida senha antiga
- ✅ Nova senha deve ter ≥ 6 caracteres
- ✅ Nova senha deve ser diferente da antiga
- ✅ Hash bcrypt (10 rounds)

---

## 📁 Arquivos Criados/Modificados

### Criados

1. **`src/auth/dto/change-password.dto.ts`**
   - DTO com validações para `oldPassword` e `newPassword`

2. **`docs/AUTH_CHANGE_PASSWORD.md`**
   - Documentação completa (800+ linhas)
   - Exemplos em cURL, JavaScript, React, etc.
   - Fluxos de segurança
   - Boas práticas

3. **`auth-change-password-tests.http`**
   - Arquivo de testes HTTP (VS Code REST Client)
   - 11 cenários de teste (sucesso + erros)

4. **`docs/AUTH_CHANGE_PASSWORD_SUMMARY.md`** (este arquivo)
   - Resumo rápido da implementação

### Modificados

1. **`src/auth/auth.controller.ts`**
   - Adicionado endpoint `@Patch('change-password')`
   - Usa `@CurrentUser()` para extrair userId do token
   - Chama `authService.changePassword()`

2. **`src/auth/auth.service.ts`**
   - Adicionado método `changePassword()`
   - Valida senha antiga com bcrypt.compare()
   - Valida nova senha (tamanho, diferente da antiga)
   - Atualiza senha com novo hash

3. **`docs/INDEX.md`**
   - Adicionada referência ao novo endpoint na seção de Autenticação

---

## 🎯 Como Usar

### Frontend (Fetch API)

```javascript
async function changePassword(oldPassword, newPassword) {
  const token = localStorage.getItem('access_token');

  const response = await fetch('/auth/change-password', {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ oldPassword, newPassword }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return await response.json();
}
```

### cURL

```bash
curl -X PATCH http://localhost:4000/auth/change-password \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "oldPassword": "senhaAntiga123",
    "newPassword": "novaSenhaSegura456"
  }'
```

**Resposta de Sucesso**:
```json
{
  "message": "Senha alterada com sucesso"
}
```

---

## 🔒 Validações Implementadas

### 1. Token JWT
- ❌ Se ausente ou inválido → 401 Unauthorized

### 2. Senha Antiga
- ❌ Se incorreta → 401 "Senha antiga incorreta"

### 3. Nova Senha
- ❌ Se < 6 caracteres → 400 "Nova senha deve ter no mínimo 6 caracteres"
- ❌ Se igual à antiga → 400 "Nova senha deve ser diferente da senha antiga"

### 4. Campos Obrigatórios
- ❌ Se ausentes → 400 com lista de erros

---

## 🧪 Testar a Implementação

### Opção 1: VS Code REST Client

1. Abrir arquivo `auth-change-password-tests.http`
2. Clicar em "Send Request" acima de cada request

### Opção 2: Terminal (cURL)

```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"senha123"}' | jq -r '.access_token')

# 2. Alterar senha
curl -X PATCH http://localhost:4000/auth/change-password \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"oldPassword":"senha123","newPassword":"novaSenha456"}'

# 3. Login com nova senha
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"novaSenha456"}'
```

### Opção 3: Postman

Importar estas configurações:

**Request 1 - Login**:
- Method: POST
- URL: `http://localhost:4000/auth/login`
- Body (JSON):
```json
{
  "email": "user@example.com",
  "password": "senha123"
}
```

**Request 2 - Change Password**:
- Method: PATCH
- URL: `http://localhost:4000/auth/change-password`
- Headers:
  - `Authorization: Bearer {{token}}` (colar token do login)
- Body (JSON):
```json
{
  "oldPassword": "senha123",
  "newPassword": "novaSenha456"
}
```

---

## 🔄 Comparação de Endpoints

### Novo: `/auth/change-password`

**Para**: Usuário alterar sua própria senha

**Características**:
- ✅ userId extraído automaticamente do token JWT
- ✅ Sempre valida senha antiga
- ✅ Rota intuitiva dentro do módulo de autenticação
- ✅ Mais simples para o frontend

**Exemplo**:
```javascript
// Frontend não precisa passar userId
changePassword(oldPassword, newPassword);
```

---

### Existente: `/users/:id/password`

**Para**: Admin alterar senha de qualquer usuário

**Características**:
- ⚙️ userId no parâmetro da URL
- ⚙️ Admin pode alterar sem senha antiga
- ⚙️ Usuário comum deve fornecer senha antiga
- ⚙️ Rota administrativa dentro do módulo de usuários

**Exemplo**:
```javascript
// Frontend precisa passar userId
changeUserPassword(userId, oldPassword, newPassword);
```

---

## 📊 Fluxo de Execução

```
┌─────────────────────────────────────────────────────────┐
│  1. Cliente envia PATCH /auth/change-password           │
│     Headers: Authorization: Bearer <token>              │
│     Body: { oldPassword, newPassword }                  │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│  2. NestJS - JwtAuthGuard valida token                  │
│     - Token presente?                                   │
│     - Token válido?                                     │
│     - Token não expirado?                               │
└────────────────────┬────────────────────────────────────┘
                     ↓ (se válido)
┌─────────────────────────────────────────────────────────┐
│  3. Token decodificado → request.user.userId            │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│  4. Controller extrai userId com @CurrentUser()         │
│     Chama: authService.changePassword(userId, ...)      │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│  5. AuthService.changePassword()                        │
│     a. Buscar usuário no banco                          │
│     b. Validar senha antiga (bcrypt.compare)            │
│     c. Validar nova senha (≥ 6 caracteres)              │
│     d. Validar: nova ≠ antiga                           │
│     e. Hash nova senha (bcrypt.hash, 10 rounds)         │
│     f. Atualizar no banco                               │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│  6. Retorno ao cliente                                  │
│     { message: "Senha alterada com sucesso" }           │
└─────────────────────────────────────────────────────────┘
```

---

## 🛡️ Boas Práticas Implementadas

### ✅ Já Implementado

1. **Validação de Senha Antiga**
   - Previne alterações não autorizadas

2. **Validação de Tamanho**
   - Mínimo 6 caracteres

3. **Validação de Unicidade**
   - Nova senha ≠ senha antiga

4. **Criptografia Forte**
   - bcrypt com 10 rounds

5. **Extração Automática de userId**
   - Usuário não pode alterar senha de outros

### 🔮 Recomendações Futuras

1. **Rate Limiting**
```typescript
@Throttle(3, 15 * 60) // 3 tentativas a cada 15 min
@Patch('change-password')
```

2. **Email de Notificação**
```typescript
await emailService.send({
  to: user.email,
  subject: 'Senha alterada',
  template: 'password-changed',
});
```

3. **Logout em Todos os Dispositivos**
```typescript
// Invalidar todos os tokens JWT antigos
// Adicionar campo passwordChangedAt no User
```

4. **Histórico de Senhas**
```typescript
// Prevenir reutilização das últimas 5 senhas
const lastPasswords = await prisma.passwordHistory.findMany({...});
```

5. **Política de Senha Forte**
```typescript
// Exigir: maiúscula, minúscula, número, caractere especial
function validatePasswordStrength(password) { ... }
```

---

## 📚 Documentação Relacionada

| Documento | Descrição |
|-----------|-----------|
| [AUTH_CHANGE_PASSWORD.md](./AUTH_CHANGE_PASSWORD.md) | Documentação completa (800+ linhas) |
| [AUTHENTICATION_DOCS.md](../AUTHENTICATION_DOCS.md) | Sistema de autenticação geral |
| [USER_PROFILE_MANAGEMENT.md](./USER_PROFILE_MANAGEMENT.md) | Gestão de perfil de usuário |
| [INDEX.md](./INDEX.md) | Índice geral da documentação |

---

## 🎓 Exemplo de Componente React

```tsx
import { useState } from 'react';
import axios from 'axios';

export function ChangePasswordForm() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('access_token');

      await axios.patch(
        '/auth/change-password',
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess(true);
      setOldPassword('');
      setNewPassword('');
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao alterar senha');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">Senha alterada!</div>}

      <input
        type="password"
        value={oldPassword}
        onChange={(e) => setOldPassword(e.target.value)}
        placeholder="Senha atual"
        required
      />

      <input
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        placeholder="Nova senha (mín. 6 caracteres)"
        required
        minLength={6}
      />

      <button type="submit" disabled={loading}>
        {loading ? 'Alterando...' : 'Alterar Senha'}
      </button>
    </form>
  );
}
```

---

## ✅ Checklist de Implementação

- [x] DTO criado e validado
- [x] Método no AuthService
- [x] Endpoint no AuthController
- [x] Proteção com JWT Guard
- [x] Validação de senha antiga
- [x] Validação de nova senha
- [x] Hash com bcrypt
- [x] Tratamento de erros
- [x] Documentação completa
- [x] Arquivo de testes HTTP
- [x] Exemplos de frontend
- [x] Atualização do INDEX.md
- [x] Zero erros de compilação

---

## 🎯 Status

✅ **Implementação 100% Completa**

- Endpoint funcional e testado
- Documentação extensa
- Exemplos de uso
- Testes prontos
- Zero erros

**Pronto para uso em produção!**

---

## 📞 Suporte

Para dúvidas ou problemas:

1. Consultar [AUTH_CHANGE_PASSWORD.md](./AUTH_CHANGE_PASSWORD.md)
2. Testar com `auth-change-password-tests.http`
3. Verificar logs do backend
4. Checar se token JWT é válido
