# 📥 Importação e Conciliação OFX - Documentação Técnica

## 📋 Visão Geral

O módulo de importação OFX permite que o sistema importe extratos bancários no formato OFX (Open Financial Exchange) e **sugira lançamentos similares** para conciliação. **Toda conciliação é manual** - o usuário sempre decide qual lançamento conciliar.

> 📖 **Documentação Complementar**: 
> - [Gerenciamento de Extratos OFX](./OFX_IMPORTS_MANAGEMENT.md) - Como listar, visualizar e deletar extratos importados

## 🎯 Funcionalidades

### 1. **Importação de Arquivos OFX**
- Upload de arquivos .ofx
- Parsing automático do formato OFX
- Extração de transações bancárias
- Atualização do saldo da conta bancária
- **Armazenamento do histórico de importações**

### 2. **Sugestões de Conciliação Inteligente**
- Algoritmo de matching baseado em múltiplos critérios
- Score de similaridade de 0 a 100 pontos
- Sugestões ordenadas por relevância
- **Usuário sempre decide se aceita ou não a sugestão**

### 3. **Busca de Transações Similares**
- Endpoint dedicado para buscar lançamentos similares
- Exibe score e motivos do match
- Permite conciliação manual escolhida pelo usuário

### 4. **Gerenciamento de Histórico**
- Listar todos os extratos importados
- Visualizar detalhes de cada importação
- Estatísticas de conciliação
- Deletar importações antigas ou incorretas

## 🧮 Algoritmo de Matching

O algoritmo compara as transações OFX com os lançamentos do sistema usando três critérios principais:

### 1. **Valor (Peso: 40 pontos)**
```
- Valor exato (0% diferença)           → 40 pontos
- Diferença < 1%                        → 35 pontos
- Diferença < 5%                        → 25 pontos
- Diferença < 10%                       → 15 pontos
- Diferença ≥ 10%                       → 0 pontos
```

### 2. **Data (Peso: 30 pontos)**
```
- Mesma data                            → 30 pontos
- Diferença de 1 dia                    → 25 pontos
- Diferença de 2-3 dias                 → 20 pontos
- Diferença de 4-7 dias                 → 10 pontos
- Diferença > 7 dias                    → 0 pontos
```

### 3. **Descrição (Peso: 30 pontos)**
```
- Similaridade ≥ 80%                    → 30 pontos
- Similaridade ≥ 60%                    → 20 pontos
- Similaridade ≥ 40%                    → 10 pontos
- Similaridade < 40%                    → 0 pontos
```

### 4. **Bônus por Palavras em Comum**
```
- 1 palavra em comum                    → +5 pontos
- 2 palavras em comum                   → +10 pontos
- 3+ palavras em comum                  → +15 pontos
```

### **Score Final**
```
Total: 0 a 100 pontos

Interpretação (apenas para orientar o usuário):
🟢 85-100: Alta confiança - muito provável que seja a mesma transação
🟡 60-84:  Média confiança - possível match, revisar com atenção
🟠 30-59:  Baixa confiança - pode não ser a mesma transação
🔴 0-29:   Sem match - provavelmente não relacionadas

⚠️ IMPORTANTE: O sistema NUNCA concilia automaticamente.
   O score é apenas uma sugestão para ajudar o usuário a decidir.
```

## 🔧 Componentes Implementados

### 1. **DTOs**
- `OFXTransactionDto`: Representa uma transação OFX
- `OFXAccountDto`: Dados da conta bancária no OFX
- `OFXStatementDto`: Extrato completo OFX
- `MatchTransactionDto`: Resultado de um match
- `SimilarTransactionDto`: Transação similar encontrada
- `OFXImportResultDto`: Resultado da importação

### 2. **Services**

#### `OFXParserService`
- **Responsabilidade**: Parse de arquivos OFX
- **Método principal**: `parseOFXFile(ofxContent: string)`
- **Retorna**: `OFXStatementDto`
- **Funcionalidades**:
  - Parse do formato OFX XML
  - Conversão de datas OFX (YYYYMMDDHHMMSS)
  - Extração de transações e saldo
  - Identificação de débitos e créditos

#### `TransactionMatchingService`
- **Responsabilidade**: Lógica de matching e conciliação
- **Métodos principais**:
  - `findSimilarTransactions()`: Busca transações similares
  - `calculateMatchScore()`: Calcula score de similaridade
  - `isTransactionAlreadyImported()`: Verifica duplicatas
  - `autoReconcile()`: Concilia automaticamente

#### `OFXImportService`
- **Responsabilidade**: Orquestração da importação
- **Métodos principais**:
  - `importOFXFile()`: Importa e processa OFX
  - `findSimilarForOFXTransaction()`: Busca similares
  - `manualReconcile()`: Conciliação manual

### 3. **Controller**

#### `OFXController`
- **Base URL**: `/financial/ofx`
- **Endpoints**:
  - `POST /import`: Upload e importação OFX
  - `POST /find-similar`: Buscar transações similares
  - `PATCH /reconcile/:id`: Conciliar manualmente

## 📊 Fluxo de Importação

```
1. Upload do arquivo OFX
   ↓
2. Parse do conteúdo OFX
   ↓
3. Para cada transação OFX:
   ├─ Verificar se já foi importada/conciliada (FITID)
   │  ├─ Sim → Pular (já conciliada)
   │  └─ Não → Continuar
   │
   ├─ Buscar transações similares no sistema
   │  └─ Busca em janela de ±7 dias
   │     └─ Apenas transações não conciliadas
   │
   ├─ Calcular score de match
   │  └─ Comparar valor, data e descrição
   │
   └─ Adicionar à lista de sugestões
      └─ Ordenar por score (melhores primeiro)
   
4. Atualizar saldo da conta bancária
   ↓
5. Retornar resultado com todas as sugestões
   ↓
6. Usuário revisa CADA transação e decide:
   ├─ Aceitar sugestão (conciliar)
   ├─ Buscar outro lançamento
   ├─ Criar novo lançamento
   └─ Ignorar (não conciliar agora)
```

## 🔒 Segurança

- ✅ Autenticação JWT obrigatória
- ✅ Validação de permissões (`financial.create`, `financial.update`)
- ✅ Isolamento por empresa (companyId)
- ✅ Validação de propriedade da conta bancária
- ✅ Prevenção de importações duplicadas (FITID)

## 💾 Dados Armazenados

### Campo `referenceNumber` na Transação
```typescript
// Ao conciliar, o FITID do OFX é armazenado
transaction.referenceNumber = ofxTransaction.fitId;

// Isso permite:
// 1. Evitar reimportações
// 2. Rastreabilidade da origem
// 3. Auditoria de conciliações
```

## 📝 Exemplos de Uso

### 1. Importação Básica
```typescript
const formData = new FormData();
formData.append('file', ofxFile);

const response = await fetch(
  `/financial/ofx/import?companyId=${companyId}&bankAccountId=${bankAccountId}`,
  {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData,
  }
);

const result = await response.json();
// {
//   totalTransactions: 25,
//   autoMatched: 18,
//   needsReview: 5,
//   alreadyImported: 2,
//   matches: [...]
// }
```

### 2. Buscar Similares
```typescript
const ofxTransaction = {
  fitId: "20240105001",
  type: "CREDIT",
  datePosted: "2024-01-05T12:00:00.000Z",
  amount: 1500.00,
  name: "PAGAMENTO CLIENTE ABC",
};

const similar = await fetch(
  `/financial/ofx/find-similar?companyId=${companyId}&bankAccountId=${bankAccountId}`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(ofxTransaction),
  }
);

const transactions = await similar.json();
// [
//   {
//     transactionId: "uuid",
//     matchScore: 92,
//     matchReasons: ["Valor exato", "Mesma data", ...]
//   }
// ]
```

### 3. Conciliação Manual
```typescript
await fetch(
  `/financial/ofx/reconcile/${systemTransactionId}?companyId=${companyId}`,
  {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ofxFitId: "20240105001" }),
  }
);
```

## 🧪 Testes

Um arquivo de testes HTTP foi criado: `ofx-import-tests.http`

Contém exemplos de:
- Upload de arquivo OFX
- Busca de similares
- Conciliação manual
- Estrutura de arquivo OFX válido

## 📦 Dependências Adicionadas

```json
{
  "ofx-js": "^0.x.x",           // Parse de arquivos OFX
  "date-fns": "^2.x.x",         // Manipulação de datas
  "string-similarity": "^4.x.x"  // Comparação de strings
}
```

## 🔄 Integração com Módulo Existente

O módulo OFX foi integrado ao módulo financeiro existente:

```typescript
// financial.module.ts
@Module({
  imports: [PrismaModule],
  controllers: [
    // ... controllers existentes
    OFXController,
  ],
  providers: [
    // ... services existentes
    OFXParserService,
    TransactionMatchingService,
    OFXImportService,
  ],
})
```

## 🎨 UI/UX Recomendações

### Tela de Importação
1. **Upload de arquivo**
   - Drag & drop
   - Botão "Escolher arquivo"
   - Aceitar apenas .ofx

2. **Configurações**
   - Selector de conta bancária
   - Threshold de conciliação automática (default: 85)

3. **Resultado da Importação**
   - Cards com estatísticas:
     - Total importado
     - Conciliadas automaticamente ✅
     - Precisam revisão ⚠️
     - Já importadas 🔄

4. **Lista de Revisão**
   - Para cada match não automático:
     - Dados da transação OFX
     - Transação sugerida do sistema
     - Score e motivos
     - Botões: "Conciliar" | "Ignorar" | "Criar Nova"

### Exemplo de Card de Revisão
```
┌─────────────────────────────────────────────────┐
│ Score: 78% ⚠️                                   │
├─────────────────────────────────────────────────┤
│ OFX:                                            │
│ 📅 05/01/2024 | 💰 R$ 1.500,00                 │
│ 📝 PAGAMENTO CLIENTE ABC                        │
│                                                 │
│ Sugestão do Sistema:                            │
│ 📅 04/01/2024 | 💰 R$ 1.500,00                 │
│ 📝 Recebimento Cliente ABC - PIX                │
│                                                 │
│ Motivos do Match:                               │
│ ✓ Valor exato                                   │
│ ✓ Diferença de 1 dia                            │
│ ✓ Descrição similar (70%)                       │
│                                                 │
│ [Conciliar] [Ignorar] [Criar Nova Transação]   │
└─────────────────────────────────────────────────┘
```

## 🚀 Melhorias Futuras

1. **Machine Learning**
   - Aprender com conciliações manuais
   - Ajustar pesos do algoritmo automaticamente

2. **Suporte a Mais Formatos**
   - CSV bancário
   - Formato CNAB
   - API bancária direta

3. **Regras Customizáveis**
   - Permitir que usuário ajuste o threshold
   - Regras específicas por categoria
   - Palavras-chave prioritárias

4. **Histórico de Conciliações**
   - Auditar todas as conciliações
   - Reverter conciliações incorretas
   - Relatório de acurácia do algoritmo

5. **Notificações**
   - Alertar sobre transações não reconhecidas
   - Sugerir conciliações pendentes
   - Lembretes de importação periódica

## 📚 Referências

- [OFX Specification](https://www.ofx.net/)
- [Banking Class - ofx-js](https://www.npmjs.com/package/ofx-js)
- [String Similarity Algorithm](https://en.wikipedia.org/wiki/S%C3%B8rensen%E2%80%93Dice_coefficient)

---

**Desenvolvido por:** Backend ERP Team  
**Versão:** 1.0.0  
**Data:** Novembro 2024
