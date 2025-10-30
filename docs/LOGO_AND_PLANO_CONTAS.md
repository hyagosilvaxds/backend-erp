# 🎨 Logo e 📊 Plano de Contas

## 🎨 Logo da Empresa

### Campos de Logo

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `logoUrl` | String | URL ou caminho do arquivo de logo |
| `logoFileName` | String | Nome do arquivo original |
| `logoMimeType` | String | Tipo MIME (image/png, image/jpeg, image/svg+xml) |

### Formatos Recomendados

**Para documentos fiscais e impressos:**
- **PNG** com fundo transparente
- Dimensões: 300x300px a 800x800px
- Resolução: 300 DPI
- Tamanho máximo: 2MB

**Para sistema web:**
- **SVG** (vetorial, escalável)
- **PNG** ou **JPEG**
- Dimensões: 200x200px a 400x400px
- Tamanho máximo: 500KB

### Tipos MIME Aceitos

```typescript
const ALLOWED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/svg+xml',
  'image/webp'
];
```

### Upload de Logo

#### Endpoint Sugerido

```http
POST /companies/:id/logo
Content-Type: multipart/form-data
Authorization: Bearer {token}
x-company-id: {companyId}

file: [arquivo de imagem]
```

#### Implementação Recomendada

```typescript
import { diskStorage } from 'multer';
import { extname } from 'path';

// Configuração do multer para upload
const storage = diskStorage({
  destination: './uploads/logos',
  filename: (req, file, callback) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = extname(file.originalname);
    callback(null, `logo-${uniqueSuffix}${ext}`);
  },
});

// Validação
const fileFilter = (req, file, callback) => {
  const allowedMimes = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/svg+xml',
    'image/webp'
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(new Error('Formato de imagem não permitido'), false);
  }
};

// Uso no controller
@Post(':id/logo')
@UseInterceptors(FileInterceptor('file', {
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB
}))
async uploadLogo(
  @Param('id') id: string,
  @UploadedFile() file: Express.Multer.File,
  @CurrentUser() user: any
) {
  return this.companiesService.updateLogo(id, file, user.userId);
}
```

### Armazenamento

**Opções:**

1. **Sistema de arquivos local**
   - Pasta: `/uploads/logos/`
   - URL: `http://api.com/uploads/logos/logo-123.png`

2. **Cloud Storage (Recomendado)**
   - AWS S3
   - Google Cloud Storage
   - Azure Blob Storage
   - Cloudinary

3. **CDN**
   - CloudFlare
   - Amazon CloudFront

### Uso da Logo

A logo deve ser exibida em:
- ✅ Cabeçalho de documentos fiscais (NF-e, NFC-e, NFS-e)
- ✅ Relatórios gerenciais
- ✅ Boletos bancários
- ✅ Orçamentos e propostas
- ✅ Interface do sistema (header)
- ✅ E-mails transacionais

---

## 📊 Plano de Contas

### O que é?

O Plano de Contas é uma estrutura hierárquica que organiza todas as contas contábeis da empresa, permitindo classificar e registrar as movimentações financeiras.

### Estrutura do Plano de Contas

#### Modelo PlanoContas

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador único |
| `nome` | String | Nome do plano de contas |
| `descricao` | String | Descrição detalhada |
| `tipo` | String | Gerencial, Fiscal ou Contábil |
| `ativo` | Boolean | Se está ativo |
| `padrao` | Boolean | Se é o plano padrão do sistema |

#### Modelo ContaContabil

| Campo | Tipo | Descrição | Exemplo |
|-------|------|-----------|---------|
| `id` | UUID | Identificador único | - |
| `planoContasId` | UUID | ID do plano de contas | - |
| `codigo` | String | Código da conta | "1.1.01.001" |
| `nome` | String | Nome da conta | "Caixa Geral" |
| `tipo` | String | Ativo, Passivo, Receita, Despesa, PL | "Ativo" |
| `natureza` | String | Devedora ou Credora | "Devedora" |
| `nivel` | Integer | Nível hierárquico | 4 |
| `contaPaiId` | UUID | ID da conta pai | - |
| `aceitaLancamento` | Boolean | Se aceita lançamentos diretos | true |
| `ativo` | Boolean | Se está ativa | true |

### Tipos de Conta

#### 1. ATIVO
**Natureza:** Devedora  
**Descrição:** Bens e direitos da empresa

Exemplos:
- `1.1.01.001` - Caixa Geral
- `1.1.01.002` - Bancos Conta Movimento
- `1.1.02.001` - Clientes (Contas a Receber)
- `1.1.03.001` - Mercadorias para Revenda

#### 2. PASSIVO
**Natureza:** Credora  
**Descrição:** Obrigações da empresa

Exemplos:
- `2.1.01.001` - Fornecedores Nacionais
- `2.1.02.001` - Empréstimos e Financiamentos
- `2.1.03.001` - Impostos a Pagar

#### 3. RECEITAS
**Natureza:** Credora  
**Descrição:** Entrada de recursos

Exemplos:
- `3.1.01.001` - Vendas de Mercadorias
- `3.1.02.001` - Prestação de Serviços
- `3.2.01.001` - Juros Recebidos

#### 4. DESPESAS
**Natureza:** Devedora  
**Descrição:** Saída de recursos

Exemplos:
- `4.1.01.001` - Salários e Ordenados
- `4.1.01.002` - Encargos Sociais
- `4.1.01.003` - Aluguel
- `4.1.02.001` - Energia Elétrica

#### 5. PATRIMÔNIO LÍQUIDO
**Natureza:** Credora  
**Descrição:** Capital próprio da empresa

Exemplos:
- `5.1.01.001` - Capital Social
- `5.1.02.001` - Lucros Acumulados

### Hierarquia de Níveis

```
1           - ATIVO (Nível 1)
1.1         - Ativo Circulante (Nível 2)
1.1.01      - Disponibilidades (Nível 3)
1.1.01.001  - Caixa Geral (Nível 4)
```

**Regras:**
- Contas de **nível maior** (4+) aceitam lançamentos
- Contas de **nível menor** (1-3) são apenas para organização
- A soma dos níveis inferiores = saldo do nível superior

### Plano de Contas Padrão

O sistema cria automaticamente um **Plano de Contas Gerencial Padrão** com 21 contas básicas:

#### Estrutura Criada no Seed

```
1 - ATIVO
  1.1 - Ativo Circulante
    1.1.01 - Disponibilidades
      1.1.01.001 - Caixa Geral ✅
      1.1.01.002 - Bancos Conta Movimento ✅
    1.1.02 - Contas a Receber
      1.1.02.001 - Clientes ✅
    1.1.03 - Estoques
      1.1.03.001 - Mercadorias para Revenda ✅

2 - PASSIVO
  2.1 - Passivo Circulante
    2.1.01 - Fornecedores
      2.1.01.001 - Fornecedores Nacionais ✅

3 - RECEITAS
  3.1 - Receitas Operacionais
    3.1.01.001 - Vendas de Mercadorias ✅

4 - DESPESAS
  4.1 - Despesas Operacionais
    4.1.01.001 - Salários e Ordenados ✅
    4.1.01.002 - Encargos Sociais ✅
    4.1.01.003 - Aluguel ✅
```

✅ = Aceita lançamentos

### Endpoints de Plano de Contas

#### Listar Planos de Contas

```http
GET /plano-contas
Authorization: Bearer {token}
```

#### Buscar Plano de Contas Específico

```http
GET /plano-contas/:id
Authorization: Bearer {token}
```

**Response:**
```json
{
  "id": "uuid",
  "nome": "Plano de Contas Padrão Gerencial",
  "descricao": "Plano de contas gerencial padrão para empresas comerciais",
  "tipo": "Gerencial",
  "padrao": true,
  "ativo": true,
  "contas": [
    {
      "id": "uuid",
      "codigo": "1.1.01.001",
      "nome": "Caixa Geral",
      "tipo": "Ativo",
      "natureza": "Devedora",
      "nivel": 4,
      "aceitaLancamento": true
    }
  ]
}
```

#### Listar Contas de um Plano

```http
GET /plano-contas/:id/contas
Authorization: Bearer {token}

Query params:
- nivel: filtrar por nível
- tipo: filtrar por tipo (Ativo, Passivo, etc.)
- aceitaLancamento: true/false
```

#### Criar Nova Conta

```http
POST /plano-contas/:id/contas
Authorization: Bearer {token}
Content-Type: application/json

{
  "codigo": "4.1.01.004",
  "nome": "Telefone e Internet",
  "tipo": "Despesa",
  "natureza": "Devedora",
  "nivel": 4,
  "contaPaiId": "uuid-da-conta-pai",
  "aceitaLancamento": true
}
```

### Validações

**Código da Conta:**
```typescript
// Validação do formato do código
const codigoRegex = /^\d+(\.\d+)*$/;
// Exemplos válidos: "1", "1.1", "1.1.01", "1.1.01.001"

// Validação de duplicidade
const existingConta = await prisma.contaContabil.findUnique({
  where: {
    planoContasId_codigo: {
      planoContasId: planoContasId,
      codigo: codigo
    }
  }
});
```

**Nível:**
```typescript
// Calcular nível automaticamente baseado no código
function calcularNivel(codigo: string): number {
  return codigo.split('.').length;
}
```

**Natureza:**
```typescript
const naturezaPorTipo = {
  'Ativo': 'Devedora',
  'Despesa': 'Devedora',
  'Passivo': 'Credora',
  'Receita': 'Credora',
  'Patrimônio Líquido': 'Credora'
};
```

### Vinculação com a Empresa

Cada empresa pode ter um plano de contas específico:

```typescript
// Atualizar plano de contas da empresa
await prisma.company.update({
  where: { id: companyId },
  data: { planoContasId: novoplanoContasId }
});
```

### Uso do Plano de Contas

O plano de contas é utilizado em:
- ✅ Lançamentos contábeis manuais
- ✅ Lançamentos automáticos (vendas, compras, pagamentos)
- ✅ Relatórios contábeis (DRE, Balanço Patrimonial)
- ✅ Fluxo de caixa
- ✅ Conciliação bancária
- ✅ Apuração de impostos
- ✅ Integração contábil

### Boas Práticas

1. **Não deletar contas com lançamentos**
   - Marcar como inativa se não for mais utilizar

2. **Manter hierarquia coerente**
   - Respeitar a estrutura de níveis
   - Contas filhas devem ter mesmo tipo que a pai

3. **Documentar personalizações**
   - Manter descrição clara em contas customizadas

4. **Backup antes de grandes mudanças**
   - Plano de contas é crítico para a contabilidade

5. **Consultar contador**
   - Para adequações específicas ao negócio
   - Para conformidade com legislação

---

## 🔄 Migração de Plano de Contas

### Importar de outro sistema

```typescript
interface ContaImportacao {
  codigo: string;
  nome: string;
  tipo: string;
  natureza: string;
}

async function importarPlanoContas(
  empresaId: string,
  contas: ContaImportacao[]
) {
  // 1. Criar novo plano
  const plano = await prisma.planoContas.create({
    data: {
      nome: `Plano Importado - ${new Date().toISOString()}`,
      tipo: 'Gerencial',
    }
  });

  // 2. Ordenar contas por nível (mais alto primeiro)
  const contasOrdenadas = contas.sort((a, b) => 
    a.codigo.split('.').length - b.codigo.split('.').length
  );

  // 3. Criar contas
  for (const conta of contasOrdenadas) {
    await criarContaComPai(plano.id, conta);
  }

  // 4. Vincular à empresa
  await prisma.company.update({
    where: { id: empresaId },
    data: { planoContasId: plano.id }
  });
}
```

---

**Nota:** O plano de contas é a base da contabilidade da empresa. Mudanças devem ser feitas com cuidado e preferencialmente com orientação contábil.
