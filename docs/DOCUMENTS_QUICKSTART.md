# 🚀 Hub de Documentos - Guia Rápido

## ⚡ Quick Start - 5 Minutos

### 1. Criar Primeira Pasta
```bash
curl -X POST http://localhost:4000/documents/folders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-company-id: $COMPANY_ID" \
  -d '{
    "name": "Documentos Fiscais",
    "description": "Notas fiscais e documentos contábeis",
    "color": "#3B82F6",
    "icon": "file-text",
    "isPublic": true
  }'

# Salve o ID retornado
FOLDER_ID="..."
```

### 2. Fazer Primeiro Upload
```bash
curl -X POST http://localhost:4000/documents/upload \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-company-id: $COMPANY_ID" \
  -F "file=@/path/to/documento.pdf" \
  -F "name=Nota Fiscal Janeiro" \
  -F "folderId=$FOLDER_ID" \
  -F "reference=NF-2025-001" \
  -F "documentType=nota_fiscal" \
  -F "tags=fiscal,janeiro,2025"

# Salve o ID do documento
DOC_ID="..."
```

### 3. Listar Documentos
```bash
curl http://localhost:4000/documents?folderId=$FOLDER_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-company-id: $COMPANY_ID"
```

### 4. Download de Documento
```bash
curl http://localhost:4000/documents/$DOC_ID/download \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-company-id: $COMPANY_ID" \
  -o documento_baixado.pdf
```

---

## 📁 Estrutura Recomendada de Pastas

### Organização por Departamento

```
📁 Raiz da Empresa
├── 📂 Fiscal
│   ├── 📂 Notas Fiscais
│   │   ├── 📂 2025
│   │   ├── 📂 2024
│   │   └── 📂 2023
│   ├── 📂 Certificados Digitais
│   └── 📂 Declarações
├── 📂 Jurídico
│   ├── 📂 Contratos
│   │   ├── 📂 Ativos
│   │   ├── 📂 Encerrados
│   │   └── 📂 Em Negociação
│   ├── 📂 Procurações
│   └── 📂 Atas
├── 📂 RH
│   ├── 📂 Contratos de Trabalho
│   ├── 📂 Exames Médicos
│   └── 📂 Férias
├── 📂 Financeiro
│   ├── 📂 Boletos
│   ├── 📂 Comprovantes
│   └── 📂 Extratos
└── 📂 Operacional
    ├── 📂 Fornecedores
    ├── 📂 Clientes
    └── 📂 Estoque
```

### Script de Criação Automática

```bash
#!/bin/bash

# Variáveis
TOKEN="seu-token-aqui"
COMPANY_ID="company-uuid-aqui"
API_URL="http://localhost:4000"

# Função para criar pasta
create_folder() {
  local name=$1
  local parent_id=$2
  local color=$3
  
  curl -X POST "$API_URL/documents/folders" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -H "x-company-id: $COMPANY_ID" \
    -d "{
      \"name\": \"$name\",
      \"parentId\": $parent_id,
      \"color\": \"$color\",
      \"isPublic\": true
    }" | jq -r '.id'
}

# Criar pastas principais
FISCAL_ID=$(create_folder "Fiscal" "null" "#3B82F6")
JURIDICO_ID=$(create_folder "Jurídico" "null" "#10B981")
RH_ID=$(create_folder "RH" "null" "#F59E0B")
FINANCEIRO_ID=$(create_folder "Financeiro" "null" "#EF4444")

# Subpastas Fiscal
create_folder "Notas Fiscais" "\"$FISCAL_ID\"" "#60A5FA"
create_folder "Certificados Digitais" "\"$FISCAL_ID\"" "#60A5FA"
create_folder "Declarações" "\"$FISCAL_ID\"" "#60A5FA"

# Subpastas Jurídico
create_folder "Contratos" "\"$JURIDICO_ID\"" "#34D399"
create_folder "Procurações" "\"$JURIDICO_ID\"" "#34D399"

echo "✅ Estrutura de pastas criada com sucesso!"
```

---

## 💡 Exemplos Práticos

### Exemplo 1: Upload de Certificado Digital (com validade)

```bash
# Upload do certificado A1 que vence em 1 ano
curl -X POST http://localhost:4000/documents/upload \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-company-id: $COMPANY_ID" \
  -F "file=@certificado-a1.pfx" \
  -F "name=Certificado Digital A1 - 2025" \
  -F "description=Certificado para emissão de NF-e" \
  -F "folderId=$CERTIFICADOS_FOLDER_ID" \
  -F "reference=CERT-A1-2025" \
  -F "documentType=certificado_digital" \
  -F "tags=fiscal,nfe,certificado" \
  -F "expiresAt=2026-10-27T23:59:59.000Z"

# ✅ Sistema enviará alerta quando estiver próximo do vencimento
```

### Exemplo 2: Upload de Contrato com Múltiplas Tags

```bash
curl -X POST http://localhost:4000/documents/upload \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-company-id: $COMPANY_ID" \
  -F "file=@contrato-fornecedor.pdf" \
  -F "name=Contrato Fornecedor ABC Ltda" \
  -F "description=Contrato de fornecimento de matéria-prima válido por 12 meses" \
  -F "folderId=$CONTRATOS_FOLDER_ID" \
  -F "reference=CONT-2025-042" \
  -F "documentType=contrato" \
  -F "tags=fornecedor,materia-prima,ativo,2025" \
  -F "expiresAt=2026-10-27T23:59:59.000Z"
```

### Exemplo 3: Upload em Lote com Script

```bash
#!/bin/bash

# Upload de múltiplas notas fiscais
for file in /path/to/notas-fiscais/*.pdf; do
  filename=$(basename "$file")
  number=$(echo "$filename" | grep -oP '\d+')
  
  curl -X POST http://localhost:4000/documents/upload \
    -H "Authorization: Bearer $TOKEN" \
    -H "x-company-id: $COMPANY_ID" \
    -F "file=@$file" \
    -F "name=Nota Fiscal $number" \
    -F "folderId=$NF_FOLDER_ID" \
    -F "reference=NF-2025-$number" \
    -F "documentType=nota_fiscal" \
    -F "tags=fiscal,venda,2025"
  
  echo "✅ Upload: $filename"
  sleep 1
done
```

### Exemplo 4: Nova Versão de Documento

```bash
# Upload de versão atualizada do contrato
curl -X POST http://localhost:4000/documents/$DOC_ID/new-version \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-company-id: $COMPANY_ID" \
  -F "file=@contrato-v2.pdf" \
  -F "description=Adicionada cláusula 5.3 sobre prazo de entrega"

# ✅ Versão anterior é mantida para histórico
# ✅ Nova versão é marcada como 'latest'
```

### Exemplo 5: Buscar Documentos Vencendo

```bash
# Verificar documentos que vencem nos próximos 30 dias
curl "http://localhost:4000/documents/expired?daysAhead=30" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-company-id: $COMPANY_ID" | jq

# Resposta mostra:
# - expired: documentos já vencidos
# - expiringSoon: documentos vencendo em breve
```

---

## 🔍 Buscas Avançadas

### Buscar por Tag
```bash
# Todos os documentos com tag "urgente"
curl "http://localhost:4000/documents?tags=urgente" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-company-id: $COMPANY_ID"
```

### Buscar por Tipo
```bash
# Todos os contratos
curl "http://localhost:4000/documents?documentType=contrato" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-company-id: $COMPANY_ID"
```

### Busca Textual
```bash
# Buscar por termo em nome, descrição ou referência
curl "http://localhost:4000/documents?search=fornecedor" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-company-id: $COMPANY_ID"
```

### Combinar Filtros
```bash
# Contratos ativos de 2025 na pasta específica
curl "http://localhost:4000/documents?folderId=$FOLDER_ID&documentType=contrato&tags=ativo,2025" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-company-id: $COMPANY_ID"
```

---

## 📊 Monitoramento e Alertas

### Dashboard de Vencimentos

```typescript
// Criar componente React para alertas
function ExpirationAlerts() {
  const [alerts, setAlerts] = useState({ expired: [], expiringSoon: [] });

  useEffect(() => {
    fetch('/api/documents/expired?daysAhead=15', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-company-id': companyId,
      },
    })
      .then(res => res.json())
      .then(data => setAlerts(data));
  }, []);

  return (
    <div className="alerts-dashboard">
      {/* Documentos Vencidos */}
      {alerts.expired.length > 0 && (
        <div className="alert alert-danger">
          <h3>⚠️ {alerts.expired.length} Documentos Vencidos</h3>
          {alerts.expired.map(doc => (
            <div key={doc.id} className="alert-item">
              {doc.name} - Vencido há {doc.daysExpired} dias
            </div>
          ))}
        </div>
      )}

      {/* Documentos Vencendo em Breve */}
      {alerts.expiringSoon.length > 0 && (
        <div className="alert alert-warning">
          <h3>⏰ {alerts.expiringSoon.length} Documentos Vencendo</h3>
          {alerts.expiringSoon.map(doc => (
            <div key={doc.id} className="alert-item">
              {doc.name} - Vence em {doc.daysUntilExpiration} dias
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Estatísticas em Tempo Real

```bash
# Obter estatísticas completas
curl http://localhost:4000/documents/stats \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-company-id: $COMPANY_ID" | jq

# Exemplo de resposta:
{
  "total": 342,
  "totalSize": 5368709120,
  "totalSizeFormatted": "5.0 GB",
  "byType": {
    "contrato": 45,
    "nota_fiscal": 234,
    "certificado": 12
  },
  "expired": 8,
  "expiringSoon": 15
}
```

---

## 🎯 Casos de Uso Reais

### Caso 1: Empresa de Comércio

**Necessidade:** Organizar notas fiscais de venda e compra

```bash
# 1. Criar estrutura
create_folder "Notas Fiscais" "$FISCAL_ID" "#3B82F6"
create_folder "NF-e Saída" "$NF_FOLDER_ID" "#60A5FA"
create_folder "NF-e Entrada" "$NF_FOLDER_ID" "#60A5FA"

# 2. Upload automático de NF-e XML
for xml in /path/to/nfe/*.xml; do
  curl -X POST /documents/upload \
    -F "file=@$xml" \
    -F "folderId=$NF_SAIDA_ID" \
    -F "documentType=nota_fiscal" \
    -F "tags=venda,emitida,$(date +%Y)"
done
```

### Caso 2: Escritório de Advocacia

**Necessidade:** Controlar validade de procurações e contratos

```bash
# Upload de procuração com validade
curl -X POST /documents/upload \
  -F "file=@procuracao-cliente-x.pdf" \
  -F "name=Procuração - Cliente X" \
  -F "folderId=$PROCURACOES_ID" \
  -F "reference=PROC-2025-089" \
  -F "documentType=procuracao" \
  -F "expiresAt=2026-12-31T23:59:59.000Z" \
  -F "tags=cliente-x,ativo,judicial"

# Verificar procurações vencendo
curl "/documents/expired?daysAhead=60" | jq '.expiringSoon[] | select(.documentType == "procuracao")'
```

### Caso 3: Departamento de RH

**Necessidade:** Armazenar documentos de funcionários

```bash
# Criar pasta por funcionário
FUNCIONARIO_ID=$(create_folder "João Silva - CPF 123.456.789-00" "$RH_ID" "#F59E0B")

# Upload de documentos
curl -X POST /documents/upload \
  -F "file=@contrato-trabalho.pdf" \
  -F "name=Contrato de Trabalho" \
  -F "folderId=$FUNCIONARIO_ID" \
  -F "documentType=contrato_trabalho" \
  -F "tags=admissao,clt,2025"

curl -X POST /documents/upload \
  -F "file=@exame-admissional.pdf" \
  -F "name=Exame Médico Admissional" \
  -F "folderId=$FUNCIONARIO_ID" \
  -F "documentType=exame_medico" \
  -F "expiresAt=2026-10-27T23:59:59.000Z" \
  -F "tags=saude,admissao"
```

---

## 🔧 Manutenção e Limpeza

### Identificar Documentos sem Pasta
```bash
curl "http://localhost:4000/documents?folderId=null" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-company-id: $COMPANY_ID"
```

### Mover Documentos para Pasta
```bash
# Atualizar folderId do documento
curl -X PATCH "http://localhost:4000/documents/$DOC_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-company-id: $COMPANY_ID" \
  -d '{
    "folderId": "new-folder-uuid"
  }'
```

### Arquivar Documentos Antigos
```bash
# 1. Criar pasta "Arquivados"
ARQUIVADOS_ID=$(create_folder "Arquivados 2023" "null" "#6B7280")

# 2. Mover documentos de 2023
# (implementar script para buscar e mover em lote)
```

### Deletar Documentos Vencidos
```bash
# ⚠️ CUIDADO: Use apenas em ambiente de teste
curl -X DELETE "http://localhost:4000/documents/$DOC_ID?deleteAllVersions=true" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-company-id: $COMPANY_ID"
```

---

## 📱 Integração com Frontend

### Upload com Progress Bar

```typescript
async function uploadWithProgress(file: File, onProgress: (percent: number) => void) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('name', file.name);

  const xhr = new XMLHttpRequest();

  return new Promise((resolve, reject) => {
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percent = (e.loaded / e.total) * 100;
        onProgress(percent);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error(xhr.statusText));
      }
    });

    xhr.addEventListener('error', () => reject(new Error('Upload failed')));

    xhr.open('POST', '/api/documents/upload');
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.setRequestHeader('x-company-id', companyId);
    xhr.send(formData);
  });
}

// Uso
const [uploadProgress, setUploadProgress] = useState(0);

await uploadWithProgress(file, (percent) => {
  setUploadProgress(percent);
});
```

### Drag & Drop

```typescript
function DropZone({ folderId }: { folderId: string }) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);

    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folderId', folderId);

      await fetch('/api/documents/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-company-id': companyId,
        },
        body: formData,
      });
    }
  };

  return (
    <div
      className={`drop-zone ${isDragging ? 'dragging' : ''}`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <p>Arraste arquivos aqui ou clique para selecionar</p>
    </div>
  );
}
```

---

## 🎓 Dicas e Truques

### 1. Nomenclatura Consistente
```
✅ BOM:
- "Contrato Fornecedor ABC - Jan 2025.pdf"
- "NF-e 123456 - Cliente XYZ.pdf"
- "Certidão Negativa - Jun 2025.pdf"

❌ RUIM:
- "documento1.pdf"
- "arquivo.pdf"
- "scan001.pdf"
```

### 2. Tags Inteligentes
```typescript
// Use tags hierárquicas
tags: ["fiscal", "fiscal:nfe", "fiscal:nfe:saida"]

// Tags de status
tags: ["status:ativo", "status:pendente", "status:cancelado"]

// Tags de prioridade
tags: ["prioridade:alta", "prioridade:media", "prioridade:baixa"]
```

### 3. Automação de Alertas
```bash
# Cron job diário para checar vencimentos
0 9 * * * curl "/api/documents/expired?daysAhead=15" | \
          jq '.expiringSoon[] | "\(.name) vence em \(.daysUntilExpiration) dias"' | \
          mail -s "Alerta: Documentos Vencendo" admin@empresa.com
```

---

## ⚠️ Troubleshooting

### Erro: "Arquivo muito grande"
```bash
# Solução: Comprimir PDF antes do upload
gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/ebook \
   -dNOPAUSE -dQUIET -dBATCH \
   -sOutputFile=output-compressed.pdf input.pdf
```

### Erro: "Tipo de arquivo não permitido"
```bash
# Verificar tipo MIME real do arquivo
file --mime-type arquivo.pdf

# Se necessário, converter para PDF
libreoffice --headless --convert-to pdf documento.docx
```

### Erro: "Pasta não encontrada"
```bash
# Listar todas as pastas para encontrar ID correto
curl /documents/folders | jq '.[] | {id, name}'
```

---

## 📚 Recursos Adicionais

- [Documentação Completa](./DOCUMENTS_HUB.md)
- [Sistema de Permissões](./AUTH_PERMISSIONS.md)
- [Auditoria](./AUDIT_SYSTEM.md)

---

**Status:** 🟢 **PRODUCTION READY**
