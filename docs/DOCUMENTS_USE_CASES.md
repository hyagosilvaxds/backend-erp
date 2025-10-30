# 📁 Documentos - Casos de Uso e Exemplos Práticos

## 📋 Índice de Casos de Uso

1. [Organização de Notas Fiscais](#1-organização-de-notas-fiscais)
2. [Gestão de Contratos](#2-gestão-de-contratos)
3. [Certificados com Validade](#3-certificados-com-validade)
4. [Documentação de Projetos](#4-documentação-de-projetos)
5. [Arquivos de RH](#5-arquivos-de-rh)
6. [Relatórios Financeiros](#6-relatórios-financeiros)
7. [Versionamento de Documentos](#7-versionamento-de-documentos)
8. [Monitoramento de Vencimentos](#8-monitoramento-de-vencimentos)

---

## 1. Organização de Notas Fiscais

### Cenário
Empresa precisa organizar notas fiscais por ano e mês, com controle de validade fiscal.

### Estrutura de Pastas
```
📁 Notas Fiscais
  └─ 📁 2024
      ├─ 📁 Janeiro
      ├─ 📁 Fevereiro
      └─ 📁 Março
```

### Implementação

#### Passo 1: Criar estrutura de pastas
```bash
# Pasta raiz
curl -X POST http://localhost:3000/documents/folders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Notas Fiscais",
    "description": "Notas fiscais da empresa",
    "color": "#4CAF50",
    "icon": "receipt",
    "isPublic": false
  }'

# Salvar o ID retornado: NF_ROOT_ID

# Pasta 2024
curl -X POST http://localhost:3000/documents/folders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "2024",
    "parentId": "'$NF_ROOT_ID'",
    "color": "#4CAF50",
    "isPublic": false
  }'

# Salvar o ID: NF_2024_ID

# Pasta Janeiro
curl -X POST http://localhost:3000/documents/folders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Janeiro",
    "parentId": "'$NF_2024_ID'",
    "color": "#4CAF50",
    "isPublic": false
  }'

# Salvar o ID: NF_JAN_ID
```

#### Passo 2: Upload de nota fiscal
```bash
curl -X POST http://localhost:3000/documents/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/nota-fiscal-001.pdf" \
  -F "name=Nota Fiscal 001 - Fornecedor XYZ" \
  -F "description=Compra de materiais de escritório" \
  -F "folderId=$NF_JAN_ID" \
  -F "reference=NF-2024-001" \
  -F "documentType=invoice" \
  -F "tags=nota-fiscal,fornecedor-xyz,escritorio" \
  -F "expiresAt=2029-01-31" \
  -F "isPublic=false"
```

#### Passo 3: Buscar todas as notas de janeiro
```bash
curl -X GET "http://localhost:3000/documents?folderId=$NF_JAN_ID&documentType=invoice" \
  -H "Authorization: Bearer $TOKEN"
```

#### Passo 4: Buscar por referência
```bash
curl -X GET "http://localhost:3000/documents?search=NF-2024-001" \
  -H "Authorization: Bearer $TOKEN"
```

### Benefícios
- ✅ Organização hierárquica clara
- ✅ Busca rápida por referência única
- ✅ Controle de validade fiscal (5 anos)
- ✅ Tags para categorização adicional

---

## 2. Gestão de Contratos

### Cenário
Gerenciar contratos de clientes e fornecedores com alertas de vencimento.

### Estrutura
```
📁 Contratos
  ├─ 📁 Clientes
  └─ 📁 Fornecedores
```

### Implementação

#### Criar pastas
```bash
# Pasta raiz
curl -X POST http://localhost:3000/documents/folders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Contratos",
    "description": "Contratos da empresa",
    "color": "#2196F3",
    "icon": "description",
    "isPublic": false
  }'

# Subpastas
curl -X POST http://localhost:3000/documents/folders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Clientes",
    "parentId": "'$CONTRATOS_ID'",
    "color": "#2196F3",
    "isPublic": false
  }'
```

#### Upload de contrato com validade
```bash
curl -X POST http://localhost:3000/documents/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@contrato-cliente-abc.pdf" \
  -F "name=Contrato Cliente ABC Ltda" \
  -F "description=Contrato de prestação de serviços anual" \
  -F "folderId=$CLIENTES_ID" \
  -F "reference=CT-CLI-2024-001" \
  -F "documentType=contract" \
  -F "tags=cliente,abc-ltda,servicos,anual" \
  -F "expiresAt=2025-12-31" \
  -F "isPublic=false"
```

#### Monitorar contratos vencendo em 30 dias
```bash
curl -X GET "http://localhost:3000/documents/expired?daysAhead=30" \
  -H "Authorization: Bearer $TOKEN"
```

#### Buscar contratos de um cliente específico
```bash
curl -X GET "http://localhost:3000/documents?search=abc-ltda&documentType=contract" \
  -H "Authorization: Bearer $TOKEN"
```

### Automação Sugerida
```javascript
// Script para enviar emails de alerta
async function checkExpiringContracts() {
  const response = await fetch('http://localhost:3000/documents/expired?daysAhead=15', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const { expiringSoon } = await response.json();
  
  expiringSoon.forEach(contract => {
    if (contract.daysUntilExpiration <= 15) {
      sendEmail({
        to: 'gerente@empresa.com',
        subject: `ALERTA: Contrato ${contract.reference} vence em ${contract.daysUntilExpiration} dias`,
        body: `O contrato "${contract.name}" expira em ${contract.expiresAt}`
      });
    }
  });
}
```

---

## 3. Certificados com Validade

### Cenário
Gerenciar certificados digitais, alvarás, licenças com controle rigoroso de vencimento.

### Implementação

#### Upload de certificado
```bash
curl -X POST http://localhost:3000/documents/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@certificado-digital.pfx" \
  -F "name=Certificado Digital A1 - Empresa XYZ" \
  -F "description=Certificado para emissão de NF-e" \
  -F "reference=CERT-A1-2024" \
  -F "documentType=certificate" \
  -F "tags=certificado,nfe,a1" \
  -F "expiresAt=2025-03-15" \
  -F "isPublic=false"
```

#### Dashboard de certificados
```bash
# Ver todos os certificados vencidos
curl -X GET "http://localhost:3000/documents?documentType=certificate&expired=true" \
  -H "Authorization: Bearer $TOKEN"

# Ver certificados vencendo em 7 dias
curl -X GET "http://localhost:3000/documents?documentType=certificate&expiresIn=7" \
  -H "Authorization: Bearer $TOKEN"
```

#### Renovar certificado (upload nova versão)
```bash
curl -X POST http://localhost:3000/documents/$CERT_ID/version \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@certificado-digital-renovado.pfx" \
  -F "description=Certificado renovado - válido até 2026"
```

---

## 4. Documentação de Projetos

### Cenário
Organizar documentação técnica de projetos com versionamento.

### Estrutura
```
📁 Projetos
  ├─ 📁 Sistema ERP
  │   ├─ 📁 Especificações
  │   ├─ 📁 Diagramas
  │   └─ 📁 Manuais
  └─ 📁 App Mobile
```

### Implementação

#### Upload de especificação
```bash
curl -X POST http://localhost:3000/documents/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@especificacao-modulo-vendas.docx" \
  -F "name=Especificação - Módulo de Vendas" \
  -F "description=Documento de requisitos do módulo de vendas" \
  -F "folderId=$SPECS_ID" \
  -F "reference=SPEC-VENDAS-001" \
  -F "documentType=specification" \
  -F "tags=especificacao,vendas,v1.0" \
  -F "isPublic=true"
```

#### Versionar especificação
```bash
# Versão 2.0
curl -X POST http://localhost:3000/documents/$SPEC_ID/version \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@especificacao-modulo-vendas-v2.docx" \
  -F "description=Versão 2.0 - Adicionado fluxo de descontos"

# Atualizar tags da nova versão
curl -X PATCH http://localhost:3000/documents/$NEW_VERSION_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tags":["especificacao","vendas","v2.0"]}'
```

#### Buscar todas as versões
```bash
curl -X GET "http://localhost:3000/documents?search=SPEC-VENDAS-001" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 5. Arquivos de RH

### Cenário
Gerenciar documentos de funcionários com privacidade.

### Estrutura
```
📁 RH
  ├─ 📁 Contratos de Trabalho
  ├─ 📁 Exames Médicos
  ├─ 📁 Documentos Pessoais
  └─ 📁 Certificações
```

### Implementação

#### Upload de contrato de trabalho
```bash
curl -X POST http://localhost:3000/documents/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@contrato-joao-silva.pdf" \
  -F "name=Contrato - João Silva" \
  -F "description=Contrato de trabalho CLT" \
  -F "folderId=$CONTRATOS_TRABALHO_ID" \
  -F "reference=RH-CT-2024-015" \
  -F "documentType=employment-contract" \
  -F "tags=contrato,joao-silva,clt,desenvolvedor" \
  -F "isPublic=false"
```

#### Upload de exame médico com validade
```bash
curl -X POST http://localhost:3000/documents/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@aso-joao-silva.pdf" \
  -F "name=ASO - João Silva" \
  -F "description=Atestado de Saúde Ocupacional" \
  -F "folderId=$EXAMES_ID" \
  -F "reference=RH-ASO-2024-015" \
  -F "documentType=medical-certificate" \
  -F "tags=aso,joao-silva,admissional" \
  -F "expiresAt=2025-10-27" \
  -F "isPublic=false"
```

#### Buscar documentos de um funcionário
```bash
curl -X GET "http://localhost:3000/documents?tags=joao-silva" \
  -H "Authorization: Bearer $TOKEN"
```

#### Alertar sobre exames vencendo
```bash
curl -X GET "http://localhost:3000/documents?documentType=medical-certificate&expiresIn=30" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 6. Relatórios Financeiros

### Cenário
Arquivar relatórios mensais e anuais com facilidade de busca.

### Estrutura
```
📁 Relatórios Financeiros
  ├─ 📁 2024
  │   ├─ 📁 Mensais
  │   └─ 📁 Trimestrais
  └─ 📁 2023
```

### Implementação

#### Upload de relatório mensal
```bash
curl -X POST http://localhost:3000/documents/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@relatorio-janeiro-2024.xlsx" \
  -F "name=Relatório Financeiro - Janeiro 2024" \
  -F "description=DRE, Balanço e Fluxo de Caixa" \
  -F "folderId=$MENSAIS_2024_ID" \
  -F "reference=RF-2024-01" \
  -F "documentType=financial-report" \
  -F "tags=relatorio,financeiro,janeiro,2024,dre" \
  -F "isPublic=true"
```

#### Buscar relatórios de um trimestre
```bash
curl -X GET "http://localhost:3000/documents?tags=2024&documentType=financial-report" \
  -H "Authorization: Bearer $TOKEN"
```

#### Ver estatísticas de arquivos financeiros
```bash
curl -X GET http://localhost:3000/documents/stats \
  -H "Authorization: Bearer $TOKEN"
```

---

## 7. Versionamento de Documentos

### Cenário Completo
Manual do usuário que passa por várias revisões.

### Fluxo de Trabalho

#### Versão 1.0 (Inicial)
```bash
curl -X POST http://localhost:3000/documents/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@manual-usuario-v1.0.pdf" \
  -F "name=Manual do Usuário" \
  -F "description=Versão inicial do manual" \
  -F "reference=MANUAL-USER-001" \
  -F "documentType=manual" \
  -F "tags=manual,usuario,v1.0" \
  -F "isPublic=true"

# Retorna: DOC_V1_ID
```

#### Versão 1.1 (Correções)
```bash
curl -X POST http://localhost:3000/documents/$DOC_V1_ID/version \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@manual-usuario-v1.1.pdf" \
  -F "description=Versão 1.1 - Correções de texto e imagens"

# Retorna: DOC_V1_1_ID

# Atualizar tags
curl -X PATCH http://localhost:3000/documents/$DOC_V1_1_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tags":["manual","usuario","v1.1"]}'
```

#### Versão 2.0 (Nova funcionalidade)
```bash
curl -X POST http://localhost:3000/documents/$DOC_V1_1_ID/version \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@manual-usuario-v2.0.pdf" \
  -F "description=Versão 2.0 - Adicionado capítulo sobre documentos"

# Atualizar para v2.0
curl -X PATCH http://localhost:3000/documents/$DOC_V2_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tags":["manual","usuario","v2.0"]}'
```

#### Listar todas as versões
```bash
curl -X GET "http://localhost:3000/documents?search=MANUAL-USER-001" \
  -H "Authorization: Bearer $TOKEN"
```

**Resposta:**
```json
{
  "documents": [
    {
      "id": "doc-v2-id",
      "name": "Manual do Usuário",
      "version": 3,
      "isLatest": true,
      "tags": ["manual", "usuario", "v2.0"],
      "previousVersionId": "doc-v1-1-id"
    },
    {
      "id": "doc-v1-1-id",
      "name": "Manual do Usuário",
      "version": 2,
      "isLatest": false,
      "tags": ["manual", "usuario", "v1.1"],
      "previousVersionId": "doc-v1-id"
    },
    {
      "id": "doc-v1-id",
      "name": "Manual do Usuário",
      "version": 1,
      "isLatest": false,
      "tags": ["manual", "usuario", "v1.0"],
      "previousVersionId": null
    }
  ]
}
```

---

## 8. Monitoramento de Vencimentos

### Dashboard de Alertas

#### Script para Dashboard Completo
```javascript
async function getDashboard(token) {
  // 1. Documentos vencidos
  const expired = await fetch('http://localhost:3000/documents/expired?daysAhead=0', {
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(r => r.json());

  // 2. Vencendo em 7 dias
  const week = await fetch('http://localhost:3000/documents/expired?daysAhead=7', {
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(r => r.json());

  // 3. Vencendo em 30 dias
  const month = await fetch('http://localhost:3000/documents/expired?daysAhead=30', {
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(r => r.json());

  // 4. Estatísticas gerais
  const stats = await fetch('http://localhost:3000/documents/stats', {
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(r => r.json());

  return {
    alerts: {
      expired: expired.expired.length,
      weekAlert: week.expiringSoon.filter(d => d.daysUntilExpiration <= 7).length,
      monthAlert: month.expiringSoon.filter(d => d.daysUntilExpiration <= 30).length
    },
    stats: {
      total: stats.total,
      size: stats.totalSizeFormatted,
      recentUploads: stats.recentUploads
    },
    documents: {
      expired: expired.expired,
      expiringSoon: month.expiringSoon
    }
  };
}

// Usar no frontend
const dashboard = await getDashboard(userToken);
console.log(`🚨 ${dashboard.alerts.expired} documentos vencidos`);
console.log(`⚠️ ${dashboard.alerts.weekAlert} vencendo esta semana`);
console.log(`📊 Total: ${dashboard.stats.total} documentos (${dashboard.stats.size})`);
```

#### Alerta por Email Automatizado
```javascript
// Executar diariamente via cron job
async function sendExpirationAlerts() {
  const { expiringSoon } = await fetch(
    'http://localhost:3000/documents/expired?daysAhead=15',
    { headers: { 'Authorization': `Bearer ${adminToken}` } }
  ).then(r => r.json());

  // Agrupar por responsável
  const byUser = expiringSoon.reduce((acc, doc) => {
    const userId = doc.uploadedBy.id;
    if (!acc[userId]) acc[userId] = [];
    acc[userId].push(doc);
    return acc;
  }, {});

  // Enviar emails
  for (const [userId, docs] of Object.entries(byUser)) {
    const user = docs[0].uploadedBy;
    
    await sendEmail({
      to: user.email,
      subject: `Alerta: ${docs.length} documento(s) vencendo em breve`,
      html: `
        <h2>Olá ${user.name},</h2>
        <p>Os seguintes documentos estão vencendo em breve:</p>
        <ul>
          ${docs.map(d => `
            <li>
              <strong>${d.name}</strong><br>
              Vence em: ${d.daysUntilExpiration} dias (${d.expiresAt})<br>
              Referência: ${d.reference}
            </li>
          `).join('')}
        </ul>
        <p>Acesse o sistema para renovar ou atualizar os documentos.</p>
      `
    });
  }
}
```

---

## 🎯 Boas Práticas

### 1. Nomenclatura de Referências
```
Padrão: {TIPO}-{ANO}-{NÚMERO}

Exemplos:
- NF-2024-001      (Nota Fiscal)
- CT-CLI-2024-015  (Contrato Cliente)
- CT-FOR-2024-008  (Contrato Fornecedor)
- CERT-A1-2024     (Certificado)
- RF-2024-01       (Relatório Financeiro)
- SPEC-VENDAS-001  (Especificação)
```

### 2. Uso de Tags
```javascript
// Sempre incluir:
tags: [
  'tipo-documento',     // Ex: nota-fiscal, contrato
  'entidade-relacionada', // Ex: cliente-abc, fornecedor-xyz
  'período',            // Ex: 2024, janeiro
  'status',             // Ex: ativo, renovado, cancelado
  'categoria'           // Ex: servicos, produtos, rh
]
```

### 3. Controle de Validade
```javascript
// Calcular data de expiração baseada em tipo
const expirationDates = {
  'invoice': 5 * 365,        // 5 anos (fiscal)
  'contract': 365,           // 1 ano
  'certificate': 365,        // 1 ano
  'medical-certificate': 365, // 1 ano (ASO)
  'license': 730             // 2 anos (alvarás)
};

const expiresAt = new Date();
expiresAt.setDate(expiresAt.getDate() + expirationDates[documentType]);
```

### 4. Estrutura de Pastas
```
✅ Boa organização:
📁 Tipo de Documento
  └─ 📁 Ano
      └─ 📁 Mês/Trimestre
          └─ Documentos

❌ Evitar:
📁 Pasta Genérica
  └─ Todos os documentos misturados
```

---

## 📱 Integração com Frontend

### React Example - Upload Component
```typescript
import { useState } from 'react';

function DocumentUpload({ folderId, onSuccess }) {
  const [file, setFile] = useState(null);
  const [metadata, setMetadata] = useState({
    name: '',
    description: '',
    reference: '',
    documentType: 'invoice',
    tags: [],
    expiresAt: '',
    isPublic: false
  });

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', metadata.name);
    formData.append('description', metadata.description);
    formData.append('folderId', folderId);
    formData.append('reference', metadata.reference);
    formData.append('documentType', metadata.documentType);
    formData.append('tags', metadata.tags.join(','));
    formData.append('expiresAt', metadata.expiresAt);
    formData.append('isPublic', metadata.isPublic);

    const response = await fetch('http://localhost:3000/documents/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const result = await response.json();
    onSuccess(result);
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleUpload(); }}>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} required />
      <input 
        placeholder="Nome do documento" 
        value={metadata.name}
        onChange={(e) => setMetadata({...metadata, name: e.target.value})}
      />
      <button type="submit">Upload</button>
    </form>
  );
}
```

---

**Documentação criada em:** 27/10/2024  
**Para dúvidas:** Consulte [API_DOCUMENTS.md](./API_DOCUMENTS.md)
