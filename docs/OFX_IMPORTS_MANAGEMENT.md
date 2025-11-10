# Gerenciamento de Extratos OFX Importados

## 📋 Visão Geral

Foram adicionados novos endpoints para gerenciar o histórico de extratos OFX importados no sistema. Agora, além de importar e conciliar transações, você pode:

- ✅ Listar todos os extratos importados (com paginação)
- ✅ Visualizar detalhes completos de cada importação
- ✅ Deletar extratos antigos ou incorretos
- ✅ Filtrar por conta bancária e período

## 🗄️ Modelo de Dados

Foi criada a tabela `ofx_imports` que armazena:

```typescript
{
  id: string;                    // ID único do extrato
  companyId: string;             // Empresa
  bankAccountId: string;         // Conta bancária
  
  // Informações do arquivo
  fileName: string;              // Nome do arquivo OFX
  fileSize: number;              // Tamanho em bytes
  
  // Dados bancários
  bankId: string;                // Código do banco
  accountId: string;             // Número da conta
  accountType: string;           // Tipo da conta
  
  // Período do extrato
  startDate: Date;               // Data inicial
  endDate: Date;                 // Data final
  
  // Saldo
  balance: number;               // Saldo final
  balanceDate: Date;             // Data do saldo
  
  // Estatísticas da importação
  totalTransactions: number;     // Total de transações no arquivo
  importedCount: number;         // Transações novas
  duplicateCount: number;        // Transações duplicadas
  reconciledCount: number;       // Transações conciliadas
  
  // Transações originais do OFX (JSON)
  transactions: Json;            // Array de OFXTransactionDto
  
  // Status e controle
  status: string;                // COMPLETED, PROCESSING, ERROR
  errorMessage?: string;         // Mensagem de erro
  importedAt: Date;              // Data/hora da importação
  importedBy?: string;           // Usuário que importou
}
```

## 🔌 Novos Endpoints

### 1. Listar Extratos Importados

```http
GET /financial/ofx/imports?companyId={companyId}&bankAccountId={bankAccountId}&startDate={startDate}&endDate={endDate}&page={page}&limit={limit}
```

**Query Parameters:**
- `companyId` (obrigatório): ID da empresa
- `bankAccountId` (opcional): Filtrar por conta bancária
- `startDate` (opcional): Data inicial de importação (YYYY-MM-DD)
- `endDate` (opcional): Data final de importação (YYYY-MM-DD)
- `page` (opcional): Número da página (padrão: 1)
- `limit` (opcional): Itens por página (padrão: 20)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "fileName": "extrato-janeiro-2024.ofx",
      "fileSize": 15432,
      "bankId": "001",
      "accountId": "12345-6",
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-01-31T23:59:59.000Z",
      "balance": 15000.00,
      "totalTransactions": 45,
      "importedCount": 40,
      "duplicateCount": 5,
      "reconciledCount": 15,
      "status": "COMPLETED",
      "importedAt": "2024-02-01T10:30:00.000Z",
      "bankAccount": {
        "id": "uuid",
        "accountName": "Conta Principal",
        "bankName": "Banco do Brasil"
      }
    }
  ],
  "total": 10,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

### 2. Buscar Detalhes de um Extrato

```http
GET /financial/ofx/imports/:id?companyId={companyId}
```

Retorna todos os detalhes do extrato, incluindo todas as transações OFX originais.

### 3. Deletar Extrato

```http
DELETE /financial/ofx/imports/:id?companyId={companyId}
```

**⚠️ Importante**: 
- Deleta apenas o registro da importação
- **NÃO desfaz** as conciliações já realizadas
- As transações conciliadas permanecem no sistema
- Use para limpar importações antigas ou incorretas

## 💡 Casos de Uso

### Caso 1: Histórico de Importações

```typescript
// Buscar últimas 10 importações
const response = await fetch(
  `${API_URL}/financial/ofx/imports?companyId=${companyId}&page=1&limit=10`,
  {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  }
);

const { data, total, totalPages } = await response.json();

// Exibir tabela com:
// - Nome do arquivo
// - Data de importação
// - Período do extrato
// - Total de transações
// - Conciliadas / Não conciliadas
// - Botões: Ver Detalhes | Deletar
```

### Caso 2: Filtrar por Conta Bancária

```typescript
// Ver apenas extratos de uma conta específica
const response = await fetch(
  `${API_URL}/financial/ofx/imports?companyId=${companyId}&bankAccountId=${bankAccountId}`,
  {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  }
);
```

### Caso 3: Visualizar Transações do Extrato

```typescript
// Buscar detalhes completos de um extrato
const response = await fetch(
  `${API_URL}/financial/ofx/imports/${importId}?companyId=${companyId}`,
  {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  }
);

const extrato = await response.json();

// Exibir todas as transações originais do OFX
extrato.transactions.forEach(txn => {
  console.log(`${txn.fitId} - ${txn.name} - R$ ${txn.amount}`);
});
```

### Caso 4: Limpar Importações Antigas

```typescript
// Deletar um extrato antigo
const response = await fetch(
  `${API_URL}/financial/ofx/imports/${importId}?companyId=${companyId}`,
  {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  }
);

// Retorna: { message: 'Extrato OFX deletado com sucesso' }
```

## 🎯 Integração com Frontend

### Componente React - Lista de Extratos

```tsx
import React, { useState, useEffect } from 'react';

export function OFXImportHistory({ companyId, bankAccountId }) {
  const [imports, setImports] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadImports();
  }, [page, bankAccountId]);

  const loadImports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        companyId,
        page: page.toString(),
        limit: '20',
      });
      
      if (bankAccountId) {
        params.append('bankAccountId', bankAccountId);
      }

      const response = await fetch(
        `${API_URL}/financial/ofx/imports?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      const data = await response.json();
      setImports(data.data);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Erro ao carregar extratos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este extrato? As conciliações realizadas não serão desfeitas.')) {
      return;
    }

    try {
      await fetch(
        `${API_URL}/financial/ofx/imports/${id}?companyId=${companyId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      
      alert('Extrato deletado com sucesso!');
      loadImports();
    } catch (error) {
      console.error('Erro ao deletar extrato:', error);
      alert('Erro ao deletar extrato');
    }
  };

  const handleViewDetails = (id: string) => {
    // Navegar para página de detalhes
    window.location.href = `/financial/ofx/imports/${id}`;
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="ofx-import-history">
      <h2>Histórico de Importações OFX</h2>
      
      <table>
        <thead>
          <tr>
            <th>Arquivo</th>
            <th>Conta</th>
            <th>Período</th>
            <th>Transações</th>
            <th>Conciliadas</th>
            <th>Status</th>
            <th>Importado em</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {imports.map(imp => (
            <tr key={imp.id}>
              <td>{imp.fileName}</td>
              <td>{imp.bankAccount?.accountName}</td>
              <td>
                {new Date(imp.startDate).toLocaleDateString()} - 
                {new Date(imp.endDate).toLocaleDateString()}
              </td>
              <td>{imp.totalTransactions}</td>
              <td>
                {imp.reconciledCount} / {imp.importedCount}
                <span className="percentage">
                  ({((imp.reconciledCount / imp.importedCount) * 100).toFixed(0)}%)
                </span>
              </td>
              <td>
                <span className={`status ${imp.status.toLowerCase()}`}>
                  {imp.status}
                </span>
              </td>
              <td>{new Date(imp.importedAt).toLocaleString()}</td>
              <td>
                <button onClick={() => handleViewDetails(imp.id)}>
                  Ver Detalhes
                </button>
                <button 
                  onClick={() => handleDelete(imp.id)}
                  className="btn-danger"
                >
                  Deletar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Paginação */}
      <div className="pagination">
        <button 
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Anterior
        </button>
        <span>Página {page} de {totalPages}</span>
        <button 
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
        >
          Próxima
        </button>
      </div>
    </div>
  );
}
```

## 📊 Estatísticas Úteis

Cada registro de importação contém estatísticas valiosas:

- **totalTransactions**: Total de transações no arquivo OFX
- **importedCount**: Novas transações (não duplicadas)
- **duplicateCount**: Transações que já estavam no sistema (FITID duplicado)
- **reconciledCount**: Quantas foram conciliadas manualmente

Essas estatísticas permitem:
- Monitorar progresso de conciliação
- Identificar importações duplicadas
- Analisar histórico de movimentações

## 🔒 Segurança

- ✅ Todas as rotas requerem autenticação JWT
- ✅ Validação de `companyId` em todas as operações
- ✅ Isolamento de dados por empresa
- ✅ Permissões necessárias:
  - `financial.read` para listar e visualizar
  - `financial.delete` para deletar extratos

## 📝 Notas Importantes

1. **Deleção Segura**: Deletar um extrato NÃO desfaz conciliações. As transações conciliadas permanecem no sistema.

2. **Armazenamento**: As transações OFX originais são armazenadas como JSON no banco de dados.

3. **Paginação**: Use paginação para grandes volumes de importações.

4. **Filtros**: Combine filtros (conta, período) para buscas específicas.

5. **Status**: Atualmente apenas 'COMPLETED' é usado, mas a estrutura suporta 'PROCESSING' e 'ERROR' para implementações futuras.

## 🚀 Fluxo Completo

1. **Importar OFX**: `POST /ofx/import`
   - Sistema salva extrato na tabela `ofx_imports`
   - Retorna sugestões de match
   - Retorna `importId` no response

2. **Conciliar Manualmente**: `PATCH /ofx/reconcile/:id`
   - Usuário escolhe conciliações
   - Sistema atualiza `reconciledCount`

3. **Visualizar Histórico**: `GET /ofx/imports`
   - Ver todas as importações
   - Acompanhar progresso de conciliação

4. **Ver Detalhes**: `GET /ofx/imports/:id`
   - Revisar transações originais do OFX
   - Verificar estatísticas

5. **Limpar**: `DELETE /ofx/imports/:id`
   - Remover importações antigas
   - Manter banco de dados organizado

---

**Versão:** 1.1.0  
**Data:** Novembro 2024  
**Desenvolvido por:** Backend ERP Team
