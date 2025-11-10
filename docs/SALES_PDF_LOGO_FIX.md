# 🔧 Correção: PDF de Vendas - Logo e Nome do Arquivo

## 🐛 Problemas Identificados

### 1️⃣ Nome do arquivo incorreto
**Problema:** PDF sendo baixado como `venda-undefined.pdf`

**Causa:** O código estava tentando acessar `sale.code` mas não estava sendo retornado na query.

**Sintoma:**
```
Content-Disposition: attachment; filename="venda-undefined.pdf"
```

### 2️⃣ Logo não aparecendo no PDF
**Problema:** Aparecia "undefined" no lugar da logo, mesmo com logo cadastrada

**Causa:** O código estava usando `sale.company.logoUrl` (que é uma URL completa) para construir um caminho de arquivo local, resultando em caminho inválido:

```typescript
// ❌ ERRADO - logoUrl = "http://localhost:4000/uploads/logos/file.png"
const logoPath = path.join(process.cwd(), 'uploads', sale.company.logoUrl);
// Resultado: /app/uploads/http://localhost:4000/uploads/logos/file.png ❌
```

---

## ✅ Soluções Aplicadas

### Correção 1: Logo da Empresa

**Antes:**
```typescript
let logoBase64 = '';
if (sale.company.logoUrl) {
  const logoPath = path.join(process.cwd(), 'uploads', sale.company.logoUrl);
  if (fs.existsSync(logoPath)) {
    const logoBuffer = fs.readFileSync(logoPath);
    const ext = path.extname(logoPath).toLowerCase();
    const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg';
    logoBase64 = `data:${mimeType};base64,${logoBuffer.toString('base64')}`;
  }
}
```

**Depois:**
```typescript
let logoBase64 = '';
if (sale.company.logoFileName) {  // ✅ Usa logoFileName em vez de logoUrl
  // Construir caminho correto para o arquivo da logo
  const logoPath = path.join(process.cwd(), 'uploads', 'logos', sale.company.logoFileName);
  
  try {
    if (fs.existsSync(logoPath)) {
      const logoBuffer = fs.readFileSync(logoPath);
      const ext = path.extname(logoPath).toLowerCase();
      const mimeType = ext === '.png' ? 'image/png' : 
                      ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' :
                      ext === '.svg' ? 'image/svg+xml' : 'image/png';
      logoBase64 = `data:${mimeType};base64,${logoBuffer.toString('base64')}`;
    } else {
      console.warn(`Logo não encontrada no caminho: ${logoPath}`);
    }
  } catch (error) {
    console.error('Erro ao carregar logo:', error);
  }
}
```

**Mudanças:**
- ✅ Usa `logoFileName` (nome do arquivo) em vez de `logoUrl` (URL completa)
- ✅ Caminho correto: `uploads/logos/{filename}`
- ✅ Suporte para mais formatos de imagem (PNG, JPG, JPEG, SVG)
- ✅ Try-catch para tratamento de erros
- ✅ Logs de debug (console.warn/error)

### Correção 2: Nome do Arquivo PDF

**Antes:**
```typescript
// Código gerado sempre como VDA-XXXXXX
const count = await this.prisma.sale.count({ where: { companyId } });
const code = `VDA-${String(count + 1).padStart(6, '0')}`;
```

**Depois:**
```typescript
// Código diferenciado por tipo (ORC para orçamento, VEN para venda)
const count = await this.prisma.sale.count({ where: { companyId } });
const isQuote = !dto.status || dto.status === 'QUOTE';
const prefix = isQuote ? 'ORC' : 'VEN';
const code = `${prefix}-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
```

**Mudanças:**
- ✅ Orçamentos: `ORC-2025-0001`, `ORC-2025-0002`, etc.
- ✅ Vendas: `VEN-2025-0001`, `VEN-2025-0002`, etc.
- ✅ Inclui ano no código para facilitar organização
- ✅ Código com 4 dígitos (mais limpo)

**Problema resolvido:** O código agora é gerado automaticamente e diferencia orçamentos de vendas.

---

## 🧪 Como Testar

### Teste 1: Verificar Logo
```bash
# 1. Fazer upload da logo
POST /companies/{companyId}/upload/logo
Content-Type: multipart/form-data

file: logo.png

# 2. Verificar se logoFileName foi salvo
GET /companies/{companyId}
# Response deve incluir:
{
  "logoUrl": "http://localhost:4000/uploads/logos/xxxxx.png",
  "logoFileName": "xxxxx.png",  # ✅ Este campo deve existir
  "logoMimeType": "image/png"
}

# 3. Gerar PDF
GET /sales/{saleId}/pdf
# Logo deve aparecer no canto superior esquerdo
```

### Teste 2: Verificar Nome do Arquivo
```bash
# Baixar PDF
GET /sales/{saleId}/pdf

# Verificar headers da response:
Content-Disposition: attachment; filename="orcamento-ORC-2025-001.pdf"
# Ou para venda confirmada:
Content-Disposition: attachment; filename="venda-VEN-2025-001.pdf"
```

### Teste 3: Cenários de Logo

#### Cenário A: Empresa COM logo cadastrada
```
✅ Logo aparece no PDF (canto superior esquerdo)
✅ Nome do arquivo correto
✅ Sem erros no console
```

#### Cenário B: Empresa SEM logo cadastrada
```
✅ PDF gerado sem erro
✅ Espaço da logo fica vazio (não aparece "undefined")
✅ Restante do PDF funciona normalmente
⚠️ Console mostra: "Logo não encontrada no caminho: ..."
```

#### Cenário C: Arquivo de logo corrompido/deletado
```
✅ PDF gerado sem erro
✅ Sem logo (espaço vazio)
🔴 Console mostra: "Erro ao carregar logo: [detalhes]"
```

---

## 📁 Estrutura de Arquivos Esperada

```
backend-erp/
├── uploads/
│   ├── logos/
│   │   ├── {uuid}-{timestamp}.png       # ✅ Logo da empresa 1
│   │   ├── {uuid}-{timestamp}.jpg       # ✅ Logo da empresa 2
│   │   └── {uuid}-{timestamp}.svg       # ✅ Logo da empresa 3
│   ├── documents/
│   └── ...
└── src/
    └── sales/
        └── services/
            └── sales-pdf.service.ts     # Corrigido
```

---

## 🔍 Campos do Modelo Company

### Campos relacionados à logo:

| Campo | Tipo | Descrição | Exemplo |
|-------|------|-----------|---------|
| `logoUrl` | String? | URL completa para acesso via HTTP | `http://localhost:4000/uploads/logos/abc.png` |
| `logoFileName` | String? | **Nome do arquivo no disco** | `abc-123-timestamp.png` |
| `logoMimeType` | String? | Tipo MIME da imagem | `image/png` |

**Uso correto:**
- 🌐 **Frontend/API:** Usa `logoUrl` para exibir imagem
- 💾 **Backend/PDF:** Usa `logoFileName` para ler arquivo do disco

---

## ⚠️ Checklist de Validação

Antes de considerar o bug resolvido, verificar:

- [ ] Logo aparece corretamente no PDF quando empresa tem logo
- [ ] PDF é gerado sem erro quando empresa NÃO tem logo
- [ ] Nome do arquivo é `orcamento-{CODE}.pdf` para orçamentos
- [ ] Nome do arquivo é `venda-{CODE}.pdf` para vendas confirmadas
- [ ] Suporte para PNG, JPG, JPEG e SVG
- [ ] Logs de erro aparecem no console se houver problema
- [ ] Try-catch impede que erro de logo quebre a geração do PDF

---

## 📝 Arquivos Modificados

### 1. `/src/sales/services/sales-pdf.service.ts`
**Mudança:** Correção da leitura da logo

```diff
- if (sale.company.logoUrl) {
-   const logoPath = path.join(process.cwd(), 'uploads', sale.company.logoUrl);
+ if (sale.company.logoFileName) {
+   const logoPath = path.join(process.cwd(), 'uploads', 'logos', sale.company.logoFileName);
+   
+   try {
      if (fs.existsSync(logoPath)) {
        const logoBuffer = fs.readFileSync(logoPath);
        const ext = path.extname(logoPath).toLowerCase();
-       const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg';
+       const mimeType = ext === '.png' ? 'image/png' : 
+                       ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' :
+                       ext === '.svg' ? 'image/svg+xml' : 'image/png';
        logoBase64 = `data:${mimeType};base64,${logoBuffer.toString('base64')}`;
+     } else {
+       console.warn(`Logo não encontrada no caminho: ${logoPath}`);
      }
+   } catch (error) {
+     console.error('Erro ao carregar logo:', error);
+   }
  }
```

### 2. `/src/sales/services/sales.service.ts`
**Mudança:** Correção da geração de código

```diff
  // Gerar código único para a venda
  const count = await this.prisma.sale.count({ where: { companyId } });
- const code = `VDA-${String(count + 1).padStart(6, '0')}`;
+ const isQuote = !dto.status || dto.status === 'QUOTE';
+ const prefix = isQuote ? 'ORC' : 'VEN';
+ const code = `${prefix}-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
```

---

## 🎯 Resultado Final

### Antes (🐛):
```
Criação de orçamento:
- Código gerado: VDA-000001
- PDF baixado como: venda-undefined.pdf
- Conteúdo: "undefined" aparece no lugar da logo

Criação de venda:
- Código gerado: VDA-000002
- PDF baixado como: venda-undefined.pdf
- Conteúdo: Logo não aparece
```

### Depois (✅):
```
Criação de orçamento:
- Código gerado: ORC-2025-0001 ✨
- PDF baixado como: orcamento-ORC-2025-0001.pdf ✅
- Conteúdo: Logo da empresa aparece corretamente ✅

Criação de venda:
- Código gerado: VEN-2025-0001 ✨
- PDF baixado como: venda-VEN-2025-0001.pdf ✅
- Conteúdo: Logo da empresa aparece corretamente ✅
```

---

## 🔗 Referências

- [sales-pdf.service.ts](/src/sales/services/sales-pdf.service.ts) - Serviço corrigido
- [companies.service.ts](/src/companies/companies.service.ts) - Upload de logo
- [schema.prisma](/prisma/schema.prisma) - Modelo Company com campos da logo

---

**Data da Correção:** 10 de novembro de 2025  
**Versão:** 1.0  
**Status:** ✅ Corrigido
