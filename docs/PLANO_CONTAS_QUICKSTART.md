# 🚀 Guia Rápido - Plano de Contas

## 📋 Pré-requisitos

1. Ter um usuário com permissão `accounting.*` (ou role `admin`)
2. Estar autenticado (Bearer token)

## 🎯 Fluxo Básico

### 1. Criar um Plano de Contas

```bash
curl -X POST http://localhost:4000/plano-contas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "nome": "Plano de Contas da Minha Empresa",
    "descricao": "Plano de contas gerencial",
    "tipo": "Gerencial",
    "padrao": false
  }'
```

**Resposta:**
```json
{
  "id": "abc-123-def",
  "nome": "Plano de Contas da Minha Empresa",
  ...
}
```

Guarde o `id` retornado!

---

### 2. Criar Contas de Nível 1 (Grupos Principais)

```bash
# ATIVO
curl -X POST http://localhost:4000/plano-contas/abc-123-def/contas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "codigo": "1",
    "nome": "ATIVO",
    "tipo": "Ativo",
    "natureza": "Devedora",
    "nivel": 1,
    "aceitaLancamento": false
  }'
```

```bash
# PASSIVO
curl -X POST http://localhost:4000/plano-contas/abc-123-def/contas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "codigo": "2",
    "nome": "PASSIVO",
    "tipo": "Passivo",
    "natureza": "Credora",
    "nivel": 1,
    "aceitaLancamento": false
  }'
```

```bash
# RECEITAS
curl -X POST http://localhost:4000/plano-contas/abc-123-def/contas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "codigo": "4",
    "nome": "RECEITAS",
    "tipo": "Receita",
    "natureza": "Credora",
    "nivel": 1,
    "aceitaLancamento": false
  }'
```

```bash
# DESPESAS
curl -X POST http://localhost:4000/plano-contas/abc-123-def/contas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "codigo": "5",
    "nome": "DESPESAS",
    "tipo": "Despesa",
    "natureza": "Devedora",
    "nivel": 1,
    "aceitaLancamento": false
  }'
```

---

### 3. Criar Contas de Nível 2 (Subgrupos)

```bash
# Ativo Circulante (filho de ATIVO)
curl -X POST http://localhost:4000/plano-contas/abc-123-def/contas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "codigo": "1.1",
    "nome": "Ativo Circulante",
    "tipo": "Ativo",
    "natureza": "Devedora",
    "nivel": 2,
    "contaPaiId": "ID_DA_CONTA_ATIVO",
    "aceitaLancamento": false
  }'
```

---

### 4. Criar Contas de Nível 3 (Grupos Específicos)

```bash
# Disponível (filho de Ativo Circulante)
curl -X POST http://localhost:4000/plano-contas/abc-123-def/contas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "codigo": "1.1.01",
    "nome": "Disponível",
    "tipo": "Ativo",
    "natureza": "Devedora",
    "nivel": 3,
    "contaPaiId": "ID_DA_CONTA_ATIVO_CIRCULANTE",
    "aceitaLancamento": false
  }'
```

---

### 5. Criar Contas de Nível 4 (Contas Analíticas - Recebem Lançamentos)

```bash
# Caixa Geral (filho de Disponível)
curl -X POST http://localhost:4000/plano-contas/abc-123-def/contas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "codigo": "1.1.01.001",
    "nome": "Caixa Geral",
    "tipo": "Ativo",
    "natureza": "Devedora",
    "nivel": 4,
    "contaPaiId": "ID_DA_CONTA_DISPONIVEL",
    "aceitaLancamento": true
  }'
```

```bash
# Bancos Conta Movimento
curl -X POST http://localhost:4000/plano-contas/abc-123-def/contas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "codigo": "1.1.01.002",
    "nome": "Bancos Conta Movimento",
    "tipo": "Ativo",
    "natureza": "Devedora",
    "nivel": 4,
    "contaPaiId": "ID_DA_CONTA_DISPONIVEL",
    "aceitaLancamento": true
  }'
```

---

### 6. Visualizar a Hierarquia Completa

```bash
curl http://localhost:4000/plano-contas/abc-123-def/hierarquia \
  -H "Authorization: Bearer SEU_TOKEN"
```

**Resposta:**
```json
{
  "planoContas": {
    "id": "abc-123-def",
    "nome": "Plano de Contas da Minha Empresa",
    "tipo": "Gerencial"
  },
  "contas": [
    {
      "codigo": "1",
      "nome": "ATIVO",
      "nivel": 1,
      "subContas": [
        {
          "codigo": "1.1",
          "nome": "Ativo Circulante",
          "nivel": 2,
          "subContas": [
            {
              "codigo": "1.1.01",
              "nome": "Disponível",
              "nivel": 3,
              "subContas": [
                {
                  "codigo": "1.1.01.001",
                  "nome": "Caixa Geral",
                  "nivel": 4,
                  "aceitaLancamento": true
                },
                {
                  "codigo": "1.1.01.002",
                  "nome": "Bancos Conta Movimento",
                  "nivel": 4,
                  "aceitaLancamento": true
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

---

## 🔄 Atalho: Usar o Plano Padrão

Se você não quiser criar tudo do zero, pode usar o plano padrão do seed:

### 1. Buscar o plano padrão

```bash
curl http://localhost:4000/plano-contas/padrao \
  -H "Authorization: Bearer SEU_TOKEN"
```

### 2. Duplicar o plano padrão

```bash
curl -X POST http://localhost:4000/plano-contas/ID_DO_PLANO_PADRAO/duplicar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "nome": "Plano de Contas da Empresa XYZ",
    "descricao": "Cópia do plano padrão personalizado"
  }'
```

**Pronto!** Você terá um plano de contas completo com todas as contas do padrão.

---

## 📊 Listar Contas de um Plano

```bash
# Todas as contas
curl "http://localhost:4000/plano-contas/abc-123-def/contas" \
  -H "Authorization: Bearer SEU_TOKEN"

# Apenas contas de Ativo
curl "http://localhost:4000/plano-contas/abc-123-def/contas?tipo=Ativo" \
  -H "Authorization: Bearer SEU_TOKEN"

# Apenas contas de nível 4
curl "http://localhost:4000/plano-contas/abc-123-def/contas?nivel=4" \
  -H "Authorization: Bearer SEU_TOKEN"

# Buscar por nome ou código
curl "http://localhost:4000/plano-contas/abc-123-def/contas?search=caixa" \
  -H "Authorization: Bearer SEU_TOKEN"
```

---

## ✏️ Atualizar uma Conta

```bash
curl -X PATCH http://localhost:4000/plano-contas/contas/ID_DA_CONTA \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "nome": "Caixa Matriz",
    "ativo": true
  }'
```

---

## 🗑️ Excluir uma Conta

```bash
curl -X DELETE http://localhost:4000/plano-contas/contas/ID_DA_CONTA \
  -H "Authorization: Bearer SEU_TOKEN"
```

**Importante:** Só pode excluir contas que **não têm subcontas**.

---

## 💡 Dicas

### ✅ Boas Práticas

1. **Contas Sintéticas (Níveis 1-3):**
   - Defina `aceitaLancamento: false`
   - Use para agrupar contas

2. **Contas Analíticas (Níveis 4+):**
   - Defina `aceitaLancamento: true`
   - São as contas que receberão lançamentos reais

3. **Códigos:**
   - Use estrutura hierárquica: `1`, `1.1`, `1.1.01`, `1.1.01.001`
   - Mantenha consistência no padrão

4. **Tipos e Natureza:**
   - **Ativo e Despesa** = Natureza `Devedora`
   - **Passivo, Receita, Patrimônio Líquido** = Natureza `Credora`

### ❌ Erros Comuns

1. **Código duplicado:**
   - Cada código deve ser único dentro do plano de contas

2. **Nível incorreto:**
   - Se a conta pai é nível 2, a filha deve ser nível 3

3. **Excluir conta com filhos:**
   - Exclua primeiro as contas filhas, depois a conta pai

4. **Conta pai de outro plano:**
   - A conta pai deve pertencer ao mesmo plano de contas

---

## 🎯 Estrutura Mínima Recomendada

```
1 - ATIVO
  1.1 - Ativo Circulante
    1.1.01 - Disponível
      1.1.01.001 - Caixa Geral ✓
      1.1.01.002 - Bancos ✓

2 - PASSIVO
  2.1 - Passivo Circulante
    2.1.01 - Contas a Pagar
      2.1.01.001 - Fornecedores ✓

3 - PATRIMÔNIO LÍQUIDO
  3.1 - Capital Social
    3.1.01.001 - Capital Integralizado ✓

4 - RECEITAS
  4.1 - Receitas Operacionais
    4.1.01 - Vendas
      4.1.01.001 - Vendas de Mercadorias ✓

5 - DESPESAS
  5.1 - Despesas Operacionais
    5.1.01 - Despesas Administrativas
      5.1.01.001 - Salários ✓
      5.1.01.002 - Aluguel ✓
```

*Contas marcadas com ✓ são as que aceitam lançamentos.*

---

## 📱 Integração com Empresa

Para vincular um plano de contas a uma empresa:

```bash
curl -X PATCH http://localhost:4000/companies/admin/ID_DA_EMPRESA \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "planoContasId": "ID_DO_PLANO_DE_CONTAS"
  }'
```

---

## 📚 Mais Informações

- [Documentação Completa](./PLANO_CONTAS.md)
- [Sistema de Autenticação](./AUTH_SYSTEM.md)
- [Permissões e Roles](./PERMISSIONS.md)
