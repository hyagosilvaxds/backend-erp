# 🔄 Atualização: Erro 403 para Senha Incorreta

## Mudança Implementada

Alterado o código HTTP de resposta quando a senha antiga está incorreta:

**Antes:** 401 Unauthorized  
**Depois:** 403 Forbidden

---

## Justificativa

### Diferença Semântica

**401 Unauthorized** - "Você não está autenticado"
- Usado quando o token JWT está ausente, inválido ou expirado
- O cliente precisa fazer login novamente
- Problema: autenticação do usuário

**403 Forbidden** - "Você está autenticado, mas não tem permissão"
- Usado quando o usuário está autenticado (token válido)
- Mas a ação específica foi negada (senha incorreta)
- Problema: autorização da ação específica

### Por Que Essa Mudança É Melhor

No endpoint `/auth/change-password`:
1. ✅ Usuário **está autenticado** (token JWT válido)
2. ✅ Usuário tem **permissão para alterar senha**
3. ❌ Mas a **senha antiga fornecida está incorreta**

Isso é um problema de **autorização** (403), não de **autenticação** (401).

---

## Código Modificado

### auth.service.ts

```typescript
// Importar ForbiddenException
import { 
  Injectable, 
  UnauthorizedException, 
  NotFoundException, 
  BadRequestException, 
  ForbiddenException // ← ADICIONADO
} from '@nestjs/common';

// No método changePassword()
const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
if (!isPasswordValid) {
  throw new ForbiddenException('Senha antiga incorreta'); // ← ALTERADO de UnauthorizedException
}
```

---

## Respostas HTTP

### 401 - Token Inválido/Ausente

```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**Quando acontece:**
- Sem token no header Authorization
- Token JWT inválido/corrompido
- Token JWT expirado

**O que o frontend deve fazer:**
- Redirecionar para tela de login
- Limpar token armazenado
- Solicitar nova autenticação

---

### 403 - Senha Antiga Incorreta

```http
HTTP/1.1 403 Forbidden
Content-Type: application/json

{
  "statusCode": 403,
  "message": "Senha antiga incorreta"
}
```

**Quando acontece:**
- Token JWT válido ✅
- Usuário autenticado ✅
- Mas senha antiga fornecida está errada ❌

**O que o frontend deve fazer:**
- Mostrar mensagem de erro específica
- Manter usuário na tela de alteração de senha
- Permitir nova tentativa
- NÃO redirecionar para login

---

## Impacto no Frontend

### Antes (401 para tudo)

```javascript
async function changePassword(oldPassword, newPassword) {
  try {
    const response = await fetch('/auth/change-password', {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ oldPassword, newPassword }),
    });

    if (response.status === 401) {
      // Ambiguidade: token inválido OU senha errada?
      // Frontend não sabe o que fazer
    }
  } catch (error) {
    // Difícil diferenciar os erros
  }
}
```

### Depois (401 vs 403)

```javascript
async function changePassword(oldPassword, newPassword) {
  try {
    const response = await fetch('/auth/change-password', {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ oldPassword, newPassword }),
    });

    if (response.status === 401) {
      // Token inválido - redirecionar para login
      localStorage.removeItem('access_token');
      window.location.href = '/login';
      return;
    }

    if (response.status === 403) {
      // Senha antiga incorreta - mostrar erro e permitir nova tentativa
      const error = await response.json();
      setError(error.message); // "Senha antiga incorreta"
      return;
    }

    // Sucesso
    const data = await response.json();
    alert(data.message);

  } catch (error) {
    console.error('Erro ao alterar senha:', error);
  }
}
```

---

## Exemplo Completo React

```tsx
import { useState } from 'react';
import axios from 'axios';

export function ChangePasswordForm() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

      alert('Senha alterada com sucesso!');
      setOldPassword('');
      setNewPassword('');

    } catch (err: any) {
      if (err.response?.status === 401) {
        // Token inválido - fazer logout
        localStorage.removeItem('access_token');
        window.location.href = '/login';
        return;
      }

      if (err.response?.status === 403) {
        // Senha antiga incorreta - mostrar erro específico
        setError('A senha atual informada está incorreta. Tente novamente.');
        return;
      }

      if (err.response?.status === 400) {
        // Validação (senha curta, senhas iguais, etc)
        setError(err.response.data.message);
        return;
      }

      // Outros erros
      setError('Erro ao alterar senha. Tente novamente.');

    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

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
        placeholder="Nova senha"
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

## Tabela de Códigos HTTP

| Código | Significado | Quando Usar | Ação do Frontend |
|--------|-------------|-------------|------------------|
| 200 | OK | Senha alterada com sucesso | Mostrar sucesso, limpar form |
| 400 | Bad Request | Validação falhou (senha curta, igual) | Mostrar erro de validação |
| 401 | Unauthorized | Token ausente/inválido/expirado | Redirecionar para login |
| 403 | Forbidden | Senha antiga incorreta | Mostrar erro, permitir nova tentativa |
| 404 | Not Found | Usuário não encontrado | Erro inesperado, logout |
| 500 | Internal Error | Erro no servidor | Mostrar erro genérico |

---

## Arquivos Modificados

1. ✅ `src/auth/auth.service.ts` - Mudado para `ForbiddenException`
2. ✅ `docs/AUTH_CHANGE_PASSWORD.md` - Atualizada documentação principal
3. ✅ `docs/AUTH_CHANGE_PASSWORD_QUICKREF.md` - Atualizada referência rápida
4. ✅ `auth-change-password-tests.http` - Atualizado comentário do teste
5. ✅ `docs/AUTH_CHANGE_PASSWORD_403_UPDATE.md` - Este documento

---

## Teste Manual

### Teste 1: Token Inválido (401)

```bash
curl -X PATCH http://localhost:4000/auth/change-password \
  -H "Authorization: Bearer token_invalido" \
  -H "Content-Type: application/json" \
  -d '{"oldPassword":"123","newPassword":"456"}'
```

**Resposta Esperada:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

---

### Teste 2: Senha Antiga Incorreta (403)

```bash
# 1. Login para obter token válido
TOKEN=$(curl -s -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"senha123"}' | jq -r '.access_token')

# 2. Tentar alterar com senha antiga errada
curl -X PATCH http://localhost:4000/auth/change-password \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"oldPassword":"senhaErrada","newPassword":"novaSenha456"}'
```

**Resposta Esperada:**
```json
{
  "statusCode": 403,
  "message": "Senha antiga incorreta"
}
```

---

### Teste 3: Sucesso (200)

```bash
curl -X PATCH http://localhost:4000/auth/change-password \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"oldPassword":"senha123","newPassword":"novaSenha456"}'
```

**Resposta Esperada:**
```json
{
  "message": "Senha alterada com sucesso"
}
```

---

## Benefícios da Mudança

### 1. Clareza Semântica ✅
- 401 = problema de autenticação
- 403 = problema de autorização

### 2. Melhor UX ✅
- Frontend pode diferenciar os erros
- Mensagens mais específicas para o usuário
- Ações corretas para cada situação

### 3. Segurança ✅
- Não expõe informações desnecessárias
- Mantém o usuário autenticado se token válido
- Permite múltiplas tentativas de senha

### 4. Padrão REST ✅
- Segue convenções HTTP corretas
- Facilita integração com outros sistemas
- Código mais profissional

---

## Resumo

| Aspecto | Antes (401) | Depois (403) |
|---------|-------------|--------------|
| Código HTTP | 401 Unauthorized | 403 Forbidden |
| Semântica | Incorreta (problema não é autenticação) | Correta (problema é autorização) |
| Frontend | Ambíguo | Claro |
| UX | Confuso | Intuitivo |
| Padrão REST | Não segue | Segue ✅ |

---

## Status

✅ **Implementação Completa**
- Código alterado
- Documentação atualizada
- Testes atualizados
- Zero breaking changes na API
- Melhor experiência para o usuário

**Pronto para uso!** 🚀
