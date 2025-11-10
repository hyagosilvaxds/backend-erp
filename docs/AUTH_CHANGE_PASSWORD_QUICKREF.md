# 🔐 Alteração de Senha - Referência Rápida

## Endpoint

```
PATCH /auth/change-password
```

## Request

```http
PATCH /auth/change-password HTTP/1.1
Authorization: Bearer <token>
Content-Type: application/json

{
  "oldPassword": "senhaAntiga123",
  "newPassword": "novaSenhaSegura456"
}
```

## Response (200 OK)

```json
{
  "message": "Senha alterada com sucesso"
}
```

## Erros Comuns

| Status | Mensagem | Causa |
|--------|----------|-------|
| 401 | Unauthorized | Token ausente/inválido |
| 403 | Senha antiga incorreta | Senha antiga errada |
| 400 | Nova senha deve ter no mínimo 6 caracteres | Senha curta |
| 400 | Nova senha deve ser diferente da senha antiga | Senhas iguais |

## Frontend (JavaScript)

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

## cURL

```bash
curl -X PATCH http://localhost:4000/auth/change-password \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"oldPassword":"senha123","newPassword":"novaSenha456"}'
```

## Validações

- ✅ Token JWT obrigatório
- ✅ Senha antiga deve estar correta
- ✅ Nova senha ≥ 6 caracteres
- ✅ Nova senha ≠ senha antiga
- ✅ Hash bcrypt (10 rounds)

## Documentação Completa

📚 Ver: `docs/AUTH_CHANGE_PASSWORD.md`
