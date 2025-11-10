# 🔐 Alteração de Senha - Endpoint de Autenticação

## Visão Geral

Endpoint para o usuário autenticado alterar sua própria senha. Requer a senha antiga para validação de segurança.

## 📍 Endpoint

```
PATCH /auth/change-password
```

**Requer:** Token JWT válido (usuário autenticado)

---

## 🔒 Segurança

### Validações Implementadas

1. ✅ **Token JWT obrigatório** - Usuário deve estar autenticado
2. ✅ **Senha antiga obrigatória** - Validação de segurança
3. ✅ **Senha antiga correta** - Verifica hash no banco com bcrypt
4. ✅ **Nova senha ≥ 6 caracteres** - Política de senha mínima
5. ✅ **Nova senha ≠ senha antiga** - Previne reutilização imediata
6. ✅ **Nova senha criptografada** - Hash bcrypt com 10 rounds

### Fluxo de Segurança

```
1. Cliente envia request com token JWT
   ↓
2. JwtAuthGuard valida token
   ↓
3. Extrai userId do token decodificado
   ↓
4. Busca usuário no banco
   ↓
5. Valida senha antiga com bcrypt.compare()
   ↓
6. Valida nova senha (≥ 6 caracteres)
   ↓
7. Verifica se nova senha ≠ senha antiga
   ↓
8. Gera hash da nova senha (bcrypt, 10 rounds)
   ↓
9. Atualiza registro no banco
   ↓
10. Retorna sucesso
```

---

## 📤 Request

### Headers

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

### Body

```json
{
  "oldPassword": "senhaAntiga123",
  "newPassword": "novaSenhaSegura456"
}
```

### Validações do DTO

```typescript
class ChangePasswordDto {
  oldPassword: string;  // ✅ Obrigatório, string
  newPassword: string;  // ✅ Obrigatório, string, ≥ 6 caracteres
}
```

---

## 📥 Response

### ✅ Sucesso (200 OK)

```json
{
  "message": "Senha alterada com sucesso"
}
```

### ❌ Erros Possíveis

#### 1. Token JWT Inválido/Ausente (401)

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**Causa:** Token não enviado, inválido ou expirado

**Solução:** Fazer login novamente para obter novo token

---

#### 2. Senha Antiga Incorreta (403)

```json
{
  "statusCode": 403,
  "message": "Senha antiga incorreta"
}
```

**Causa:** Senha antiga fornecida não corresponde à senha atual

**Solução:** Verificar e enviar a senha correta

---

#### 3. Nova Senha Muito Curta (400)

```json
{
  "statusCode": 400,
  "message": "Nova senha deve ter no mínimo 6 caracteres"
}
```

**Causa:** Nova senha tem menos de 6 caracteres

**Solução:** Usar senha com 6+ caracteres

---

#### 4. Nova Senha Igual à Antiga (400)

```json
{
  "statusCode": 400,
  "message": "Nova senha deve ser diferente da senha antiga"
}
```

**Causa:** Nova senha é idêntica à senha antiga

**Solução:** Escolher uma senha diferente

---

#### 5. Usuário Não Encontrado (404)

```json
{
  "statusCode": 404,
  "message": "Usuário não encontrado"
}
```

**Causa:** userId extraído do token não existe no banco

**Solução:** Token inválido ou usuário foi deletado - fazer login novamente

---

#### 6. Validação de Campos (400)

```json
{
  "statusCode": 400,
  "message": [
    "Senha antiga é obrigatória",
    "Nova senha é obrigatória",
    "Nova senha deve ter no mínimo 6 caracteres"
  ],
  "error": "Bad Request"
}
```

**Causa:** Campos ausentes ou inválidos no body

**Solução:** Enviar todos os campos obrigatórios

---

## 🧪 Exemplos de Uso

### Exemplo 1: cURL

```bash
# 1. Fazer login primeiro
TOKEN=$(curl -s -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@example.com",
    "password": "senhaAtual123"
  }' | jq -r '.access_token')

# 2. Alterar senha
curl -X PATCH http://localhost:4000/auth/change-password \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "oldPassword": "senhaAtual123",
    "newPassword": "novaSenhaSegura456"
  }'
```

**Resposta:**
```json
{
  "message": "Senha alterada com sucesso"
}
```

---

### Exemplo 2: JavaScript/TypeScript (Axios)

```typescript
import axios from 'axios';

async function changePassword(oldPassword: string, newPassword: string) {
  try {
    // Token JWT armazenado (ex: localStorage, cookie, etc)
    const token = localStorage.getItem('access_token');

    const response = await axios.patch(
      'http://localhost:4000/auth/change-password',
      {
        oldPassword,
        newPassword,
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log(response.data.message);
    // "Senha alterada com sucesso"
    
    // Opcional: Fazer logout após trocar senha
    // localStorage.removeItem('access_token');
    // window.location.href = '/login';
    
  } catch (error) {
    if (error.response) {
      console.error(error.response.data.message);
      // "Senha antiga incorreta"
    }
  }
}

// Uso
await changePassword('senhaAntiga123', 'novaSenhaSegura456');
```

---

### Exemplo 3: Fetch API

```javascript
async function changePassword(oldPassword, newPassword) {
  const token = localStorage.getItem('access_token');

  const response = await fetch('http://localhost:4000/auth/change-password', {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      oldPassword,
      newPassword,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  const data = await response.json();
  return data.message; // "Senha alterada com sucesso"
}
```

---

### Exemplo 4: React Component

```tsx
import { useState } from 'react';
import axios from 'axios';

export function ChangePasswordForm() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validações frontend
    if (newPassword.length < 6) {
      setError('Nova senha deve ter no mínimo 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (oldPassword === newPassword) {
      setError('Nova senha deve ser diferente da senha antiga');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('access_token');

      await axios.patch(
        '/auth/change-password',
        {
          oldPassword,
          newPassword,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      setSuccess(true);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Opcional: logout após 2 segundos
      setTimeout(() => {
        localStorage.removeItem('access_token');
        window.location.href = '/login';
      }, 2000);

    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao alterar senha');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold">Alterar Senha</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          Senha alterada com sucesso! Redirecionando...
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">
          Senha Atual
        </label>
        <input
          type="password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          required
          className="w-full border rounded px-3 py-2"
          autoComplete="current-password"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Nova Senha
        </label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          minLength={6}
          className="w-full border rounded px-3 py-2"
          autoComplete="new-password"
        />
        <p className="text-xs text-gray-500 mt-1">
          Mínimo 6 caracteres
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Confirmar Nova Senha
        </label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={6}
          className="w-full border rounded px-3 py-2"
          autoComplete="new-password"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? 'Alterando...' : 'Alterar Senha'}
      </button>
    </form>
  );
}
```

---

## 🔄 Comparação com Endpoint Existente

### Endpoint Novo (Recomendado para usuários)

```
PATCH /auth/change-password
```

- ✅ **userId automático** (extraído do token JWT)
- ✅ **Mais simples** para o usuário alterar sua própria senha
- ✅ **Rota intuitiva** dentro do módulo de autenticação
- ✅ **Sempre valida senha antiga**

### Endpoint Existente (Para admins)

```
PATCH /users/:id/password
```

- ⚙️ **userId manual** (no parâmetro da URL)
- ⚙️ **Admin pode alterar senha de outros** sem senha antiga
- ⚙️ **Rota administrativa** dentro do módulo de usuários
- ⚙️ **Valida senha antiga apenas se for próprio usuário**

**Recomendação:**
- Use `/auth/change-password` para **perfil do usuário**
- Use `/users/:id/password` para **gestão administrativa**

---

## 📊 Fluxo UX Recomendado

### 1. Página de Perfil

```
┌─────────────────────────────────────┐
│  👤 Meu Perfil                       │
├─────────────────────────────────────┤
│  Nome: João Silva                   │
│  Email: joao@example.com            │
│                                     │
│  [Editar Perfil]  [Alterar Senha]  │
└─────────────────────────────────────┘
```

### 2. Modal de Alteração de Senha

```
┌─────────────────────────────────────┐
│  🔒 Alterar Senha                    │
├─────────────────────────────────────┤
│  Senha Atual                        │
│  [••••••••••]                       │
│                                     │
│  Nova Senha (mín. 6 caracteres)    │
│  [••••••••••]                       │
│                                     │
│  Confirmar Nova Senha              │
│  [••••••••••]                       │
│                                     │
│       [Cancelar]  [Salvar]         │
└─────────────────────────────────────┘
```

### 3. Feedback de Sucesso

```
┌─────────────────────────────────────┐
│  ✅ Senha alterada com sucesso!      │
│                                     │
│  Por segurança, você será           │
│  redirecionado para o login.        │
│                                     │
│  Redirecionando em 3 segundos...   │
└─────────────────────────────────────┘
```

---

## 🛡️ Boas Práticas de Segurança

### 1. **Política de Senha Forte** (Opcional - Implementação Futura)

```typescript
function validatePasswordStrength(password: string): boolean {
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isLongEnough = password.length >= 8;

  return (
    hasUpperCase &&
    hasLowerCase &&
    hasNumber &&
    hasSpecialChar &&
    isLongEnough
  );
}
```

### 2. **Rate Limiting** (Recomendado)

```typescript
// Limitar tentativas de alteração de senha
// Ex: 3 tentativas a cada 15 minutos
@Throttle(3, 15 * 60)
@Patch('change-password')
async changePassword(...) { }
```

### 3. **Logout em Todos os Dispositivos**

```typescript
// Após alterar senha, invalidar todos os tokens JWT
// Implementação: adicionar campo `passwordChangedAt` no User
// e validar no JwtStrategy se token foi emitido antes desta data
```

### 4. **Email de Notificação**

```typescript
// Enviar email notificando alteração de senha
await emailService.send({
  to: user.email,
  subject: 'Senha alterada com sucesso',
  template: 'password-changed',
  data: {
    userName: user.name,
    changedAt: new Date(),
    ipAddress: req.ip,
  },
});
```

### 5. **Histórico de Senhas** (Prevenir Reutilização)

```typescript
// Armazenar hash das últimas 5 senhas
// Não permitir reutilização
const lastPasswords = await prisma.passwordHistory.findMany({
  where: { userId },
  orderBy: { createdAt: 'desc' },
  take: 5,
});

for (const oldPass of lastPasswords) {
  if (await bcrypt.compare(newPassword, oldPass.hash)) {
    throw new BadRequestException(
      'Nova senha não pode ser uma das últimas 5 senhas utilizadas'
    );
  }
}
```

---

## 🧪 Testes

### Script de Teste Completo

```bash
#!/bin/bash

API_URL="http://localhost:4000"

echo "🧪 Testando Endpoint de Alteração de Senha"
echo "=========================================="

# 1. Login
echo "1️⃣  Login..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "senha123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.access_token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Falha no login"
  exit 1
fi

echo "✅ Login bem-sucedido"
echo ""

# 2. Alterar senha
echo "2️⃣  Alterando senha..."
CHANGE_RESPONSE=$(curl -s -X PATCH "$API_URL/auth/change-password" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "oldPassword": "senha123",
    "newPassword": "novaSenha456"
  }')

MESSAGE=$(echo $CHANGE_RESPONSE | jq -r '.message')

if [ "$MESSAGE" = "Senha alterada com sucesso" ]; then
  echo "✅ Senha alterada com sucesso"
else
  echo "❌ Falha ao alterar senha"
  echo $CHANGE_RESPONSE | jq
  exit 1
fi

echo ""

# 3. Tentar login com senha antiga (deve falhar)
echo "3️⃣  Testando login com senha antiga (deve falhar)..."
OLD_LOGIN=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "senha123"
  }')

OLD_TOKEN=$(echo $OLD_LOGIN | jq -r '.access_token')

if [ "$OLD_TOKEN" = "null" ]; then
  echo "✅ Login com senha antiga bloqueado corretamente"
else
  echo "❌ Login com senha antiga deveria ter falhado"
  exit 1
fi

echo ""

# 4. Login com nova senha (deve funcionar)
echo "4️⃣  Login com nova senha..."
NEW_LOGIN=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "novaSenha456"
  }')

NEW_TOKEN=$(echo $NEW_LOGIN | jq -r '.access_token')

if [ "$NEW_TOKEN" = "null" ] || [ -z "$NEW_TOKEN" ]; then
  echo "❌ Login com nova senha falhou"
  exit 1
fi

echo "✅ Login com nova senha bem-sucedido"
echo ""

# 5. Restaurar senha original
echo "5️⃣  Restaurando senha original..."
curl -s -X PATCH "$API_URL/auth/change-password" \
  -H "Authorization: Bearer $NEW_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "oldPassword": "novaSenha456",
    "newPassword": "senha123"
  }' > /dev/null

echo "✅ Senha restaurada para testes futuros"
echo ""

echo "=========================================="
echo "✅ TODOS OS TESTES PASSARAM!"
```

---

## 📋 Checklist de Implementação

- [x] DTO criado (`ChangePasswordDto`)
- [x] Método no service (`AuthService.changePassword()`)
- [x] Endpoint no controller (`PATCH /auth/change-password`)
- [x] Validação de senha antiga
- [x] Validação de tamanho de nova senha
- [x] Validação: nova senha ≠ senha antiga
- [x] Hash com bcrypt (10 rounds)
- [x] Proteção com JWT Guard
- [x] Documentação completa
- [x] Exemplos de uso
- [ ] Testes automatizados (opcional)
- [ ] Rate limiting (recomendado)
- [ ] Email de notificação (recomendado)

---

## 🎯 Conclusão

O endpoint `/auth/change-password` fornece uma maneira **simples e segura** para usuários alterarem suas próprias senhas. A implementação inclui:

✅ Múltiplas camadas de validação  
✅ Criptografia bcrypt  
✅ Tratamento robusto de erros  
✅ Documentação completa  
✅ Exemplos de frontend  

**Próximos Passos:**
1. Implementar rate limiting
2. Adicionar notificação por email
3. Considerar logout em todos os dispositivos
4. Adicionar histórico de senhas
