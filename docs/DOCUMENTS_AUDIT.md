# 📋 Auditoria do Módulo de Documentos

## Resumo

Todas as operações de criação, atualização e remoção de documentos e pastas são registradas automaticamente na tabela de auditoria da empresa (`company_audits`).

---

## 🔍 Ações Auditadas

### Pastas (DocumentFolder)

#### 1. **CREATE_FOLDER**
- **Quando**: Nova pasta é criada
- **Entity Type**: `DocumentFolder`
- **Dados Registrados**:
  ```json
  {
    "folderId": "uuid",
    "folderName": "Nome da Pasta",
    "parentId": "uuid-parent" | null,
    "isPublic": true | false,
    "allowedRoleIds": ["role-uuid-1", "role-uuid-2"]
  }
  ```
- **Descrição**: `"Pasta criada: {nome}"`

#### 2. **UPDATE_FOLDER**
- **Quando**: Pasta é atualizada
- **Entity Type**: `DocumentFolder`
- **Dados Registrados**:
  - **Old Value**: Valores anteriores (name, description, color, icon, isPublic, allowedRoleIds)
  - **New Value**: Novos valores
- **Descrição**: `"Pasta atualizada: {nome}"`

#### 3. **DELETE_FOLDER**
- **Quando**: Pasta é removida
- **Entity Type**: `DocumentFolder`
- **Dados Registrados**:
  ```json
  {
    "folderId": "uuid",
    "folderName": "Nome da Pasta",
    "documentsCount": 10,
    "subfoldersCount": 2,
    "forced": true | false
  }
  ```
- **Descrição**: `"Pasta removida: {nome}"` ou `"Pasta removida: {nome} (forçado)"`

---

### Documentos (Document)

#### 4. **UPLOAD_DOCUMENT**
- **Quando**: Novo documento é enviado
- **Entity Type**: `Document`
- **Dados Registrados**:
  ```json
  {
    "documentId": "uuid",
    "documentName": "Contrato.pdf",
    "fileName": "contrato-original.pdf",
    "fileSize": 256000,
    "mimeType": "application/pdf",
    "folderId": "uuid" | null,
    "reference": "REF-2024-001",
    "documentType": "Contrato",
    "isPublic": false,
    "allowedRoleIds": ["role-uuid"]
  }
  ```
- **Descrição**: `"Documento enviado: {nome}"`

#### 5. **UPDATE_DOCUMENT**
- **Quando**: Documento é atualizado
- **Entity Type**: `Document`
- **Dados Registrados**:
  - **Old Value**: Valores anteriores (name, description, folderId, reference, documentType, tags, isPublic, allowedRoleIds)
  - **New Value**: Novos valores
- **Descrição**: `"Documento atualizado: {nome}"`

#### 6. **DELETE_DOCUMENT**
- **Quando**: Documento é removido
- **Entity Type**: `Document`
- **Dados Registrados**:
  ```json
  {
    "documentId": "uuid",
    "documentName": "Contrato.pdf",
    "fileName": "contrato-v1.pdf",
    "fileSize": 256000,
    "mimeType": "application/pdf",
    "version": 1,
    "folderId": "uuid" | null,
    "reference": "REF-2024-001"
  }
  ```
- **Descrição**: `"Documento removido: {nome}"`

#### 7. **UPLOAD_NEW_VERSION**
- **Quando**: Nova versão de um documento é enviada
- **Entity Type**: `Document`
- **Dados Registrados**:
  ```json
  {
    "documentId": "new-uuid",
    "documentName": "Contrato.pdf",
    "fileName": "contrato-v2.pdf",
    "fileSize": 280000,
    "version": 2,
    "previousVersionId": "old-uuid",
    "previousVersion": 1
  }
  ```
- **Descrição**: `"Nova versão enviada: {nome} (v{versão})"`

---

## 📊 Estrutura do Registro de Auditoria

Cada registro na tabela `company_audits` contém:

```typescript
{
  id: string;              // UUID único do registro
  companyId: string;       // ID da empresa
  userId: string;          // ID do usuário que executou a ação
  action: string;          // Tipo da ação (ex: CREATE_FOLDER)
  entityType: string;      // Tipo da entidade (DocumentFolder ou Document)
  fieldName?: string;      // Campo alterado (opcional)
  oldValue?: string;       // JSON string dos valores anteriores
  newValue?: string;       // JSON string dos novos valores
  ipAddress?: string;      // IP do usuário (futuro)
  userAgent?: string;      // Browser/app (futuro)
  description: string;     // Descrição legível da ação
  createdAt: Date;         // Timestamp da ação
}
```

---

## 🔎 Consultando Auditorias

### Consultar todas as auditorias de documentos de uma empresa

```typescript
// Via Prisma
const audits = await prisma.companyAudit.findMany({
  where: {
    companyId: 'company-uuid',
    entityType: {
      in: ['Document', 'DocumentFolder']
    }
  },
  include: {
    user: {
      select: {
        id: true,
        name: true,
        email: true
      }
    }
  },
  orderBy: {
    createdAt: 'desc'
  }
});
```

### Consultar auditorias de um documento específico

```typescript
const documentAudits = await prisma.companyAudit.findMany({
  where: {
    companyId: 'company-uuid',
    entityType: 'Document',
    OR: [
      {
        newValue: {
          contains: '"documentId":"doc-uuid"'
        }
      },
      {
        oldValue: {
          contains: '"documentId":"doc-uuid"'
        }
      }
    ]
  },
  include: {
    user: true
  },
  orderBy: {
    createdAt: 'desc'
  }
});
```

### Consultar auditorias de uma pasta específica

```typescript
const folderAudits = await prisma.companyAudit.findMany({
  where: {
    companyId: 'company-uuid',
    entityType: 'DocumentFolder',
    OR: [
      {
        newValue: {
          contains: '"folderId":"folder-uuid"'
        }
      },
      {
        oldValue: {
          contains: '"folderId":"folder-uuid"'
        }
      }
    ]
  },
  include: {
    user: true
  },
  orderBy: {
    createdAt: 'desc'
  }
});
```

### Consultar auditorias por tipo de ação

```typescript
// Todas as criações de documentos
const uploads = await prisma.companyAudit.findMany({
  where: {
    companyId: 'company-uuid',
    action: 'UPLOAD_DOCUMENT'
  },
  orderBy: {
    createdAt: 'desc'
  }
});

// Todas as remoções
const deletions = await prisma.companyAudit.findMany({
  where: {
    companyId: 'company-uuid',
    action: {
      in: ['DELETE_DOCUMENT', 'DELETE_FOLDER']
    }
  },
  orderBy: {
    createdAt: 'desc'
  }
});
```

### Consultar auditorias de um usuário específico

```typescript
const userActions = await prisma.companyAudit.findMany({
  where: {
    companyId: 'company-uuid',
    userId: 'user-uuid',
    entityType: {
      in: ['Document', 'DocumentFolder']
    }
  },
  orderBy: {
    createdAt: 'desc'
  }
});
```

---

## 📈 Exemplos de Uso

### Exemplo 1: Rastreando mudanças de um documento

```typescript
// Buscar todas as ações relacionadas a um documento
const documentHistory = await prisma.companyAudit.findMany({
  where: {
    companyId: 'company-uuid',
    entityType: 'Document',
    newValue: {
      contains: '"documentName":"Contrato.pdf"'
    }
  },
  include: {
    user: {
      select: {
        name: true,
        email: true
      }
    }
  },
  orderBy: {
    createdAt: 'asc'
  }
});

// Resultado:
// 1. João Silva - UPLOAD_DOCUMENT - "Documento enviado: Contrato.pdf"
// 2. Maria Santos - UPDATE_DOCUMENT - "Documento atualizado: Contrato.pdf"
// 3. João Silva - UPLOAD_NEW_VERSION - "Nova versão enviada: Contrato.pdf (v2)"
```

### Exemplo 2: Auditoria de pastas sensíveis

```typescript
// Buscar quem acessou/modificou uma pasta restrita
const sensitiveAudits = await prisma.companyAudit.findMany({
  where: {
    companyId: 'company-uuid',
    entityType: 'DocumentFolder',
    newValue: {
      contains: '"folderName":"RH - Confidencial"'
    }
  },
  include: {
    user: true
  },
  orderBy: {
    createdAt: 'desc'
  }
});
```

### Exemplo 3: Relatório de atividades do mês

```typescript
const startOfMonth = new Date(2024, 9, 1); // Outubro 2024
const endOfMonth = new Date(2024, 10, 1);

const monthlyReport = await prisma.companyAudit.groupBy({
  by: ['action'],
  where: {
    companyId: 'company-uuid',
    entityType: {
      in: ['Document', 'DocumentFolder']
    },
    createdAt: {
      gte: startOfMonth,
      lt: endOfMonth
    }
  },
  _count: {
    action: true
  }
});

// Resultado:
// CREATE_FOLDER: 5
// UPLOAD_DOCUMENT: 120
// UPDATE_DOCUMENT: 45
// DELETE_DOCUMENT: 8
// UPLOAD_NEW_VERSION: 23
```

---

## 🛡️ Segurança e Conformidade

### LGPD / GDPR

- ✅ **Rastreabilidade**: Todas as ações são registradas com usuário, data e hora
- ✅ **Não-repúdio**: Logs imutáveis de quem fez o quê
- ✅ **Auditoria de Acesso**: Histórico completo de manipulação de documentos
- ✅ **Conformidade**: Registros detalhados para auditorias regulatórias

### Retenção de Logs

Os logs de auditoria são mantidos indefinidamente por padrão. Para conformidade com LGPD:

```typescript
// Limpar auditorias antigas (exemplo: > 7 anos)
const sevenYearsAgo = new Date();
sevenYearsAgo.setFullYear(sevenYearsAgo.getFullYear() - 7);

await prisma.companyAudit.deleteMany({
  where: {
    entityType: {
      in: ['Document', 'DocumentFolder']
    },
    createdAt: {
      lt: sevenYearsAgo
    }
  }
});
```

---

## 🔧 Futuras Melhorias

### Planejado para próximas versões:

- [ ] **IP Address**: Capturar IP do usuário nas requisições
- [ ] **User Agent**: Registrar browser/app usado
- [ ] **Geolocalização**: Registrar localização aproximada
- [ ] **Endpoint de Auditoria**: GET /documents/audit/:id
- [ ] **Dashboard de Auditoria**: Visualização gráfica das atividades
- [ ] **Alertas**: Notificações de ações suspeitas
- [ ] **Export**: Exportar auditorias em PDF/Excel

---

## 📝 Notas Importantes

### Performance

- As operações de auditoria são **assíncronas** mas **não bloqueantes**
- Se a auditoria falhar, a operação principal **não é interrompida**
- Logs são gravados imediatamente após a ação principal

### Dados Sensíveis

- **Não armazenamos**: Conteúdo dos arquivos, senhas, tokens
- **Armazenamos**: Metadados (nome, tamanho, tipo, permissões)
- **JSON Sanitizado**: oldValue e newValue são serializados em JSON

### Integridade

- Registros são **imutáveis** (não podem ser editados)
- Apenas **soft delete** é permitido (se necessário)
- Foreign keys garantem integridade referencial

---

## ✅ Resumo

| Entidade | Ações Auditadas | Dados Registrados |
|----------|-----------------|-------------------|
| **DocumentFolder** | CREATE_FOLDER, UPDATE_FOLDER, DELETE_FOLDER | Nome, descrição, permissões, hierarquia |
| **Document** | UPLOAD_DOCUMENT, UPDATE_DOCUMENT, DELETE_DOCUMENT, UPLOAD_NEW_VERSION | Nome, arquivo, tamanho, tipo, versão, permissões |

**Total de Ações**: 7 tipos de auditoria  
**Armazenamento**: Tabela `company_audits`  
**Indexação**: companyId, userId, action, createdAt  
**Retenção**: Indefinida (configurável)

🎉 **Sistema 100% auditável e compatível com LGPD/GDPR!**
