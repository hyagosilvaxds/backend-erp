#!/bin/bash

# 🧪 Script de Testes - Gestão de Perfil de Usuário
# 
# Este script testa todos os endpoints de gestão de perfil:
# - Upload de foto
# - Remoção de foto
# - Alteração de email
# - Alteração de senha
#
# Uso: ./test-user-profile.sh

set -e  # Para execução em caso de erro

echo "🧪 Iniciando testes de Gestão de Perfil de Usuário"
echo "=================================================="
echo ""

# Configuração
API_URL="http://localhost:4000"
ADMIN_EMAIL="admin@system.com"
ADMIN_PASSWORD="Admin123!@#"
USER_EMAIL="maria.silva@techcorp.com"
USER_PASSWORD="senha123"

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para printar sucesso
success() {
  echo -e "${GREEN}✅ $1${NC}"
}

# Função para printar erro
error() {
  echo -e "${RED}❌ $1${NC}"
  exit 1
}

# Função para printar warning
warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

# Função para printar info
info() {
  echo -e "ℹ️  $1"
}

# Verificar se jq está instalado
if ! command -v jq &> /dev/null; then
  error "jq não está instalado. Instale com: brew install jq"
fi

# Verificar se o servidor está rodando
info "Verificando se o servidor está rodando..."
if ! curl -s "$API_URL" > /dev/null; then
  error "Servidor não está rodando em $API_URL"
fi
success "Servidor está rodando"
echo ""

# ===========================================
# 1. LOGIN COMO ADMIN
# ===========================================
echo "1️⃣  Login como Admin"
echo "-------------------"

ADMIN_LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$ADMIN_EMAIL\",
    \"password\": \"$ADMIN_PASSWORD\"
  }")

ADMIN_TOKEN=$(echo $ADMIN_LOGIN_RESPONSE | jq -r '.access_token')

if [ "$ADMIN_TOKEN" = "null" ] || [ -z "$ADMIN_TOKEN" ]; then
  error "Falha ao fazer login como admin"
fi

success "Login como admin realizado"
info "Token: ${ADMIN_TOKEN:0:20}..."
echo ""

# ===========================================
# 2. LOGIN COMO USUÁRIO
# ===========================================
echo "2️⃣  Login como Usuário"
echo "--------------------"

USER_LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$USER_EMAIL\",
    \"password\": \"$USER_PASSWORD\"
  }")

USER_TOKEN=$(echo $USER_LOGIN_RESPONSE | jq -r '.access_token')

if [ "$USER_TOKEN" = "null" ] || [ -z "$USER_TOKEN" ]; then
  error "Falha ao fazer login como usuário"
fi

USER_ID=$(curl -s "$API_URL/users/me" \
  -H "Authorization: Bearer $USER_TOKEN" | jq -r '.id')

success "Login como usuário realizado"
info "User ID: $USER_ID"
echo ""

# ===========================================
# 3. CRIAR IMAGEM DE TESTE
# ===========================================
echo "3️⃣  Criar imagem de teste"
echo "----------------------"

# Criar diretório temporário
mkdir -p /tmp/erp-test

# Criar imagem de teste (1x1 pixel PNG)
# Base64 de uma imagem PNG mínima válida
echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" | base64 -D > /tmp/erp-test/test-photo.png

if [ ! -f /tmp/erp-test/test-photo.png ]; then
  error "Falha ao criar imagem de teste"
fi

success "Imagem de teste criada"
info "Path: /tmp/erp-test/test-photo.png"
echo ""

# ===========================================
# 4. UPLOAD DE FOTO (PRÓPRIO USUÁRIO)
# ===========================================
echo "4️⃣  Upload de Foto - Próprio Usuário"
echo "----------------------------------"

UPLOAD_RESPONSE=$(curl -s -X POST "$API_URL/users/$USER_ID/photo" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -F "photo=@/tmp/erp-test/test-photo.png")

PHOTO_URL=$(echo $UPLOAD_RESPONSE | jq -r '.photoUrl')

if [ "$PHOTO_URL" = "null" ] || [ -z "$PHOTO_URL" ]; then
  error "Falha ao fazer upload de foto"
fi

success "Upload de foto realizado"
info "Photo URL: $PHOTO_URL"
echo ""

# ===========================================
# 5. VERIFICAR SE FOTO FOI SALVA
# ===========================================
echo "5️⃣  Verificar se Foto foi Salva"
echo "-----------------------------"

USER_DATA=$(curl -s "$API_URL/users/$USER_ID" \
  -H "Authorization: Bearer $USER_TOKEN")

SAVED_PHOTO_URL=$(echo $USER_DATA | jq -r '.photoUrl')

if [ "$SAVED_PHOTO_URL" != "$PHOTO_URL" ]; then
  error "Foto não foi salva corretamente"
fi

success "Foto verificada no perfil"
echo ""

# ===========================================
# 6. REMOVER FOTO (PRÓPRIO USUÁRIO)
# ===========================================
echo "6️⃣  Remover Foto - Próprio Usuário"
echo "--------------------------------"

DELETE_RESPONSE=$(curl -s -X DELETE "$API_URL/users/$USER_ID/photo" \
  -H "Authorization: Bearer $USER_TOKEN")

DELETED_PHOTO_URL=$(echo $DELETE_RESPONSE | jq -r '.photoUrl')

if [ "$DELETED_PHOTO_URL" != "null" ]; then
  error "Foto não foi removida"
fi

success "Foto removida com sucesso"
echo ""

# ===========================================
# 7. FAZER UPLOAD NOVAMENTE (PARA TESTES)
# ===========================================
echo "7️⃣  Upload de Foto Novamente"
echo "--------------------------"

UPLOAD2_RESPONSE=$(curl -s -X POST "$API_URL/users/$USER_ID/photo" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -F "photo=@/tmp/erp-test/test-photo.png")

PHOTO_URL2=$(echo $UPLOAD2_RESPONSE | jq -r '.photoUrl')

if [ "$PHOTO_URL2" = "null" ] || [ -z "$PHOTO_URL2" ]; then
  error "Falha ao fazer upload de foto novamente"
fi

success "Segundo upload realizado"
info "Photo URL: $PHOTO_URL2"
echo ""

# ===========================================
# 8. ALTERAR SENHA (PRÓPRIO USUÁRIO)
# ===========================================
echo "8️⃣  Alterar Senha - Próprio Usuário"
echo "---------------------------------"

CHANGE_PASSWORD_RESPONSE=$(curl -s -X PATCH "$API_URL/users/$USER_ID/password" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"oldPassword\": \"$USER_PASSWORD\",
    \"newPassword\": \"novaSenha123\"
  }")

PASSWORD_MESSAGE=$(echo $CHANGE_PASSWORD_RESPONSE | jq -r '.message // empty')

if [ -z "$PASSWORD_MESSAGE" ]; then
  error "Falha ao alterar senha"
fi

success "Senha alterada com sucesso"
info "Message: $PASSWORD_MESSAGE"
echo ""

# ===========================================
# 9. TESTAR LOGIN COM NOVA SENHA
# ===========================================
echo "9️⃣  Testar Login com Nova Senha"
echo "-----------------------------"

NEW_LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$USER_EMAIL\",
    \"password\": \"novaSenha123\"
  }")

NEW_TOKEN=$(echo $NEW_LOGIN_RESPONSE | jq -r '.access_token')

if [ "$NEW_TOKEN" = "null" ] || [ -z "$NEW_TOKEN" ]; then
  error "Falha ao fazer login com nova senha"
fi

success "Login com nova senha realizado"
USER_TOKEN=$NEW_TOKEN  # Atualizar token
echo ""

# ===========================================
# 10. ADMIN ALTERANDO EMAIL
# ===========================================
echo "🔟 Admin Alterando Email do Usuário"
echo "-----------------------------------"

NEW_EMAIL="maria.silva.new@techcorp.com"

CHANGE_EMAIL_RESPONSE=$(curl -s -X PATCH "$API_URL/users/$USER_ID/email" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$NEW_EMAIL\"
  }")

CHANGED_EMAIL=$(echo $CHANGE_EMAIL_RESPONSE | jq -r '.email')

if [ "$CHANGED_EMAIL" != "$NEW_EMAIL" ]; then
  error "Falha ao alterar email"
fi

success "Email alterado com sucesso"
info "Novo email: $CHANGED_EMAIL"
echo ""

# ===========================================
# 11. ADMIN RESETANDO SENHA
# ===========================================
echo "1️⃣1️⃣  Admin Resetando Senha do Usuário"
echo "------------------------------------"

RESET_PASSWORD_RESPONSE=$(curl -s -X PATCH "$API_URL/users/$USER_ID/password" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"oldPassword\": \"\",
    \"newPassword\": \"senhaResetada123\"
  }")

RESET_MESSAGE=$(echo $RESET_PASSWORD_RESPONSE | jq -r '.message // empty')

if [ -z "$RESET_MESSAGE" ]; then
  error "Falha ao resetar senha"
fi

success "Senha resetada pelo admin"
info "Message: $RESET_MESSAGE"
echo ""

# ===========================================
# 12. ADMIN FAZENDO UPLOAD DE FOTO
# ===========================================
echo "1️⃣2️⃣  Admin Fazendo Upload de Foto"
echo "--------------------------------"

ADMIN_UPLOAD_RESPONSE=$(curl -s -X POST "$API_URL/users/$USER_ID/photo" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -F "photo=@/tmp/erp-test/test-photo.png")

ADMIN_PHOTO_URL=$(echo $ADMIN_UPLOAD_RESPONSE | jq -r '.photoUrl')

if [ "$ADMIN_PHOTO_URL" = "null" ] || [ -z "$ADMIN_PHOTO_URL" ]; then
  error "Falha ao admin fazer upload de foto"
fi

success "Admin fez upload de foto"
info "Photo URL: $ADMIN_PHOTO_URL"
echo ""

# ===========================================
# 13. TESTAR ERRO: USUÁRIO ALTERANDO EMAIL
# ===========================================
echo "1️⃣3️⃣  Testar Erro - Usuário Tentando Alterar Próprio Email"
echo "--------------------------------------------------------"

ERROR_RESPONSE=$(curl -s -w "\n%{http_code}" -X PATCH "$API_URL/users/$USER_ID/email" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"tentando.alterar@email.com\"
  }")

HTTP_CODE=$(echo "$ERROR_RESPONSE" | tail -n 1)
ERROR_BODY=$(echo "$ERROR_RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "403" ]; then
  success "Erro 403 retornado corretamente (usuário não pode alterar próprio email)"
else
  error "Deveria retornar 403 Forbidden, retornou: $HTTP_CODE"
fi
echo ""

# ===========================================
# 14. TESTAR ERRO: SENHA ANTIGA INCORRETA
# ===========================================
echo "1️⃣4️⃣  Testar Erro - Senha Antiga Incorreta"
echo "---------------------------------------"

# Precisamos fazer login novamente com a senha resetada
RESET_LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$NEW_EMAIL\",
    \"password\": \"senhaResetada123\"
  }")

RESET_TOKEN=$(echo $RESET_LOGIN_RESPONSE | jq -r '.access_token')

ERROR_RESPONSE=$(curl -s -w "\n%{http_code}" -X PATCH "$API_URL/users/$USER_ID/password" \
  -H "Authorization: Bearer $RESET_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"oldPassword\": \"senhaErrada\",
    \"newPassword\": \"outraSenha123\"
  }")

HTTP_CODE=$(echo "$ERROR_RESPONSE" | tail -n 1)

if [ "$HTTP_CODE" = "401" ]; then
  success "Erro 401 retornado corretamente (senha antiga incorreta)"
else
  error "Deveria retornar 401 Unauthorized, retornou: $HTTP_CODE"
fi
echo ""

# ===========================================
# 15. LIMPAR ARQUIVOS TEMPORÁRIOS
# ===========================================
echo "1️⃣5️⃣  Limpar Arquivos Temporários"
echo "-------------------------------"

rm -rf /tmp/erp-test

success "Arquivos temporários removidos"
echo ""

# ===========================================
# RESUMO
# ===========================================
echo "=================================================="
echo "✅ TODOS OS TESTES PASSARAM COM SUCESSO!"
echo "=================================================="
echo ""
echo "Testes realizados:"
echo "  ✅ Login como admin e usuário"
echo "  ✅ Upload de foto (próprio usuário)"
echo "  ✅ Verificação de foto salva"
echo "  ✅ Remoção de foto (próprio usuário)"
echo "  ✅ Segundo upload de foto"
echo "  ✅ Alteração de senha (próprio usuário com validação)"
echo "  ✅ Login com nova senha"
echo "  ✅ Admin alterando email"
echo "  ✅ Admin resetando senha (sem validação)"
echo "  ✅ Admin fazendo upload de foto"
echo "  ✅ Erro 403 - Usuário tentando alterar próprio email"
echo "  ✅ Erro 401 - Senha antiga incorreta"
echo ""
echo "🎉 Sistema de Gestão de Perfil está funcionando perfeitamente!"
