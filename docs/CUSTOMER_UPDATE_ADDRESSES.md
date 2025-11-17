# 📝 Atualização de Clientes - Endereços e Contatos

## 📋 Visão Geral

A partir desta atualização, o endpoint `PATCH /customers/:id` permite atualizar **endereços e contatos em massa**, substituindo completamente os existentes.

---

## 🔄 Comportamento de Atualização

### 🎯 Regras Importantes

1. **Se `addresses` for enviado**:
   - ✅ Todos os endereços **anteriores são deletados**
   - ✅ Novos endereços são criados com os dados enviados
   - ✅ Se array vazio `[]`: remove todos os endereços
   - ✅ Operação executada em **transação atômica**

2. **Se `addresses` NÃO for enviado**:
   - ✅ Endereços **existentes permanecem intocados**
   - ✅ Apenas os campos do cliente são atualizados

3. **Mesmo comportamento para `contacts`**:
   - ✅ Substituição completa se enviado
   - ✅ Mantém existentes se não enviado

---

## 🚀 Exemplos de Uso

### Exemplo 1: Atualizar Cliente com 1 Endereço

```http
PATCH /customers/30e6c969-d7b3-48a2-a5e3-a75bc0e235cc
Content-Type: application/json

{
  "personType": "JURIDICA",
  "companyName": "Olimpus Solucoes Empresariais LTDA",
  "tradeName": "Olimpus Solucoes Empresariais",
  "cnpj": "57953546000184",
  "addresses": [
    {
      "type": "MAIN",
      "zipCode": "39404076",
      "street": "Rua Marmelo",
      "number": "140",
      "neighborhood": "Alto Floresta",
      "city": "Montes Claros",
      "state": "MG",
      "ibgeCode": "3143302"
    }
  ]
}
```

**Resultado**: Cliente atualizado + 1 endereço criado (anteriores deletados)

---

### Exemplo 2: Atualizar Cliente com Múltiplos Endereços

```http
PATCH /customers/30e6c969-d7b3-48a2-a5e3-a75bc0e235cc
Content-Type: application/json

{
  "personType": "JURIDICA",
  "companyName": "Olimpus Solucoes Empresariais LTDA",
  "addresses": [
    {
      "type": "MAIN",
      "zipCode": "39404076",
      "street": "Rua Marmelo",
      "number": "140",
      "neighborhood": "Alto Floresta",
      "city": "Montes Claros",
      "state": "MG"
    },
    {
      "type": "BILLING",
      "zipCode": "39400001",
      "street": "Av. Coronel Prates",
      "number": "500",
      "complement": "Sala 201",
      "neighborhood": "Centro",
      "city": "Montes Claros",
      "state": "MG"
    },
    {
      "type": "DELIVERY",
      "zipCode": "39402123",
      "street": "Rua das Flores",
      "number": "789",
      "neighborhood": "Jardim América",
      "city": "Montes Claros",
      "state": "MG"
    }
  ]
}
```

**Resultado**: Cliente atualizado + 3 endereços criados (anteriores deletados)

---

### Exemplo 3: Atualizar Cliente com Endereços e Contatos

```http
PATCH /customers/30e6c969-d7b3-48a2-a5e3-a75bc0e235cc
Content-Type: application/json

{
  "personType": "JURIDICA",
  "companyName": "Olimpus Solucoes Empresariais LTDA",
  "email": "contato@olimpus.com.br",
  "phone": "38991234567",
  "addresses": [
    {
      "type": "MAIN",
      "zipCode": "39404076",
      "street": "Rua Marmelo",
      "number": "140",
      "neighborhood": "Alto Floresta",
      "city": "Montes Claros",
      "state": "MG"
    }
  ],
  "contacts": [
    {
      "name": "João Silva",
      "role": "Gerente Comercial",
      "email": "joao.silva@olimpus.com.br",
      "phone": "38991234567",
      "isPrimary": true
    },
    {
      "name": "Maria Santos",
      "role": "Financeiro",
      "email": "maria.santos@olimpus.com.br",
      "phone": "38997654321",
      "isPrimary": false
    }
  ]
}
```

**Resultado**: Cliente + 1 endereço + 2 contatos (todos os anteriores deletados)

---

### Exemplo 4: Remover Todos os Endereços

```http
PATCH /customers/30e6c969-d7b3-48a2-a5e3-a75bc0e235cc
Content-Type: application/json

{
  "personType": "JURIDICA",
  "companyName": "Olimpus Solucoes Empresariais LTDA",
  "addresses": []
}
```

**Resultado**: Cliente atualizado + todos os endereços deletados

---

### Exemplo 5: Atualizar SEM Tocar nos Endereços

```http
PATCH /customers/30e6c969-d7b3-48a2-a5e3-a75bc0e235cc
Content-Type: application/json

{
  "personType": "JURIDICA",
  "companyName": "Olimpus Solucoes Empresariais LTDA",
  "taxRegime": "LUCRO_PRESUMIDO"
}
```

**Resultado**: Cliente atualizado + endereços e contatos **mantidos sem alteração**

---

## 📦 Estrutura da Resposta

```json
{
  "id": "30e6c969-d7b3-48a2-a5e3-a75bc0e235cc",
  "companyId": "db0019dd-4dcd-46c3-aaef-66b87a58c5c2",
  "personType": "JURIDICA",
  "companyName": "Olimpus Solucoes Empresariais LTDA",
  "tradeName": "Olimpus Solucoes Empresariais",
  "cnpj": "57953546000184",
  "stateRegistration": "0050328560022",
  "taxRegime": "SIMPLES_NACIONAL",
  "active": true,
  "createdAt": "2025-11-16T22:39:33.985Z",
  "updatedAt": "2025-11-16T23:30:00.000Z",
  "addresses": [
    {
      "id": "address-uuid",
      "customerId": "30e6c969-d7b3-48a2-a5e3-a75bc0e235cc",
      "type": "MAIN",
      "zipCode": "39404076",
      "street": "Rua Marmelo",
      "number": "140",
      "neighborhood": "Alto Floresta",
      "city": "Montes Claros",
      "state": "MG",
      "ibgeCode": "3143302",
      "country": "Brasil",
      "isDefault": false,
      "active": true,
      "createdAt": "2025-11-16T23:30:00.000Z",
      "updatedAt": "2025-11-16T23:30:00.000Z"
    }
  ],
  "contacts": []
}
```

---

## 🔍 Tipos de Endereço Disponíveis

```typescript
enum AddressType {
  MAIN = 'MAIN',           // Principal
  BILLING = 'BILLING',     // Cobrança
  DELIVERY = 'DELIVERY',   // Entrega
  OTHER = 'OTHER'          // Outro
}
```

---

## 🛡️ Validações

### Duplicidade
- ✅ CPF: Não pode existir outro cliente com mesmo CPF na empresa
- ✅ CNPJ: Não pode existir outro cliente com mesmo CNPJ na empresa

### Campos Obrigatórios do Endereço
- ✅ `type`: Tipo do endereço (MAIN, BILLING, DELIVERY, OTHER)
- ✅ `zipCode`: CEP
- ✅ `street`: Logradouro
- ✅ `number`: Número
- ✅ `neighborhood`: Bairro
- ✅ `city`: Cidade
- ✅ `state`: UF (2 caracteres)

### Campos Opcionais do Endereço
- `complement`: Complemento
- `reference`: Ponto de referência
- `ibgeCode`: Código IBGE do município

---

## ⚙️ Implementação Técnica

### Transação Atômica

O método `update` utiliza **transação Prisma** para garantir consistência:

```typescript
return this.prisma.$transaction(async (prisma) => {
  // 1. Atualizar dados do cliente
  const updatedCustomer = await prisma.customer.update({
    where: { id },
    data: customerData,
  });

  // 2. Processar endereços se fornecidos
  if (addresses && Array.isArray(addresses)) {
    await prisma.customerAddress.deleteMany({
      where: { customerId: id },
    });
    
    if (addresses.length > 0) {
      await prisma.customerAddress.createMany({
        data: addresses.map(addr => ({
          ...addr,
          customerId: id,
        })),
      });
    }
  }

  // 3. Processar contatos se fornecidos
  if (contacts && Array.isArray(contacts)) {
    await prisma.customerContact.deleteMany({
      where: { customerId: id },
    });
    
    if (contacts.length > 0) {
      await prisma.customerContact.createMany({
        data: contacts.map(contact => ({
          ...contact,
          customerId: id,
        })),
      });
    }
  }

  // 4. Retornar cliente atualizado com relações
  return prisma.customer.findUnique({
    where: { id },
    include: {
      addresses: true,
      contacts: true,
    },
  });
});
```

### Benefícios da Transação:
- ✅ **Atomicidade**: Ou todas as operações têm sucesso, ou nenhuma
- ✅ **Consistência**: Dados sempre em estado válido
- ✅ **Rollback automático**: Em caso de erro, nada é salvo

---

## 🎯 Cenários de Uso

### Frontend: Formulário de Edição

```typescript
// Carregar cliente com endereços
const customer = await api.get(`/customers/${id}`);

// Usuário edita tudo no formulário (dados + endereços)
const formData = {
  personType: 'JURIDICA',
  companyName: 'Nova Razão Social',
  addresses: [
    { type: 'MAIN', street: '...', ... },
    { type: 'BILLING', street: '...', ... }
  ]
};

// Enviar tudo de uma vez
await api.patch(`/customers/${id}`, formData);
// ✅ Cliente atualizado + endereços substituídos
```

### Frontend: Atualizar Apenas Nome

```typescript
// Usuário quer mudar apenas o nome da empresa
const formData = {
  companyName: 'Novo Nome LTDA'
};

// Não envia 'addresses'
await api.patch(`/customers/${id}`, formData);
// ✅ Cliente atualizado + endereços mantidos
```

---

## 🚨 Avisos Importantes

### ⚠️ Substituição Completa
- Enviar `addresses: []` **remove TODOS** os endereços
- Para manter endereços existentes, **não envie** o campo `addresses`
- Mesmo comportamento para `contacts`

### ⚠️ IDs não são Necessários
- Não envie `id` nos objetos de endereço/contato
- Novos IDs são gerados automaticamente
- IDs antigos são descartados (delete + create)

### ⚠️ CompanyId **NÃO** é Necessário
- O `companyId` **não faz parte** dos modelos `CustomerAddress` e `CustomerContact`
- Apenas `customerId` é necessário (preenchido automaticamente)
- A multi-tenancy é garantida através do `Customer` que possui `companyId`

---

## 🔄 Endpoints Alternativos (Ainda Disponíveis)

Se preferir atualizar endereços/contatos **individualmente**:

### Gerenciar Endereços Individualmente

```http
# Criar novo endereço
POST /customers/:customerId/addresses

# Atualizar endereço específico
PATCH /customers/:customerId/addresses/:addressId

# Deletar endereço específico
DELETE /customers/:customerId/addresses/:addressId
```

### Gerenciar Contatos Individualmente

```http
# Criar novo contato
POST /customers/:customerId/contacts

# Atualizar contato específico
PATCH /customers/:customerId/contacts/:contactId

# Deletar contato específico
DELETE /customers/:customerId/contacts/:contactId
```

---

## 📊 Comparação: Antes vs Depois

### ❌ ANTES (Comportamento Antigo)

```http
PATCH /customers/xxx
{
  "companyName": "Novo Nome",
  "addresses": [...]  # ❌ ERA IGNORADO
}

# Resultado: Apenas companyName atualizado
# addresses não eram processados
```

### ✅ AGORA (Comportamento Novo)

```http
PATCH /customers/xxx
{
  "companyName": "Novo Nome",
  "addresses": [...]  # ✅ PROCESSADO
}

# Resultado: companyName + addresses atualizados
# Operação atômica com transação
```

---

## 🧪 Testes

Utilize o arquivo `customer-update-addresses-tests.http` para testar todos os cenários:

1. ✅ Atualizar com 1 endereço
2. ✅ Atualizar com múltiplos endereços
3. ✅ Atualizar com endereços + contatos
4. ✅ Remover todos os endereços
5. ✅ Atualizar sem tocar nos endereços
6. ✅ Pessoa física com endereços

---

## 📝 Changelog

### v1.1.0 - 16/11/2024
- ✅ Implementada atualização em massa de endereços
- ✅ Implementada atualização em massa de contatos
- ✅ Adicionada transação atômica para consistência
- ✅ Comportamento: enviar array substitui completamente
- ✅ Comportamento: não enviar mantém existentes
- ✅ Compatível com endpoints individuais

---

**Versão**: 1.1.0  
**Data**: 16 de novembro de 2024  
**Status**: ✅ Implementado e Testado
