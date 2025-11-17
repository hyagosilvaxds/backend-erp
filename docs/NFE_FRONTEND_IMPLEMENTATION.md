# 📱 Implementação do Módulo NFe no Frontend

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Estrutura de Páginas](#estrutura-de-páginas)
- [Componentes](#componentes)
- [Serviços e API](#serviços-e-api)
- [Tipos e Interfaces](#tipos-e-interfaces)
- [Fluxos de Tela](#fluxos-de-tela)
- [Validações](#validações)
- [Exemplos de Código](#exemplos-de-código)

---

## 🎯 Visão Geral

O módulo de NFe no frontend deve permitir:

- ✅ Visualizar lista de NFes
- ✅ Filtrar NFes por status, período, cliente
- ✅ Criar NFe manualmente
- ✅ Gerar NFe a partir de uma venda
- ✅ Visualizar detalhes da NFe
- ✅ Editar NFe em rascunho
- ✅ Emitir NFe (enviar para SEFAZ)
- ✅ Cancelar NFe
- ✅ Baixar DANFE (PDF)
- ✅ Baixar XML
- ✅ Visualizar estatísticas

---

## 🗂️ Estrutura de Páginas

### Estrutura de Diretórios Sugerida

```
src/
├── pages/
│   └── nfe/
│       ├── index.tsx              # Lista de NFes
│       ├── [id]/
│       │   ├── index.tsx          # Detalhes da NFe
│       │   └── edit.tsx           # Editar NFe
│       ├── new.tsx                # Nova NFe manual
│       └── from-sale/
│           └── [saleId].tsx       # Gerar NFe da venda
├── components/
│   └── nfe/
│       ├── NFeList.tsx            # Tabela de NFes
│       ├── NFeCard.tsx            # Card de NFe
│       ├── NFeFilters.tsx         # Filtros
│       ├── NFeForm.tsx            # Formulário de NFe
│       ├── NFeItemsForm.tsx       # Formulário de itens
│       ├── NFeStatusBadge.tsx     # Badge de status
│       ├── NFeStats.tsx           # Estatísticas
│       ├── NFeActions.tsx         # Ações (emitir, cancelar)
│       └── NFePreview.tsx         # Preview da NFe
├── services/
│   └── nfe.service.ts             # API calls
├── types/
│   └── nfe.types.ts               # Tipos TypeScript
└── hooks/
    ├── useNFe.ts                  # Hook para NFe
    └── useNFeList.ts              # Hook para lista

```

---

## 📄 Páginas Detalhadas

### 1. Lista de NFes (`/nfe`)

**Funcionalidades:**
- Tabela com paginação
- Filtros por status, data, cliente, venda
- Busca por número, chave, destinatário
- Ações rápidas (visualizar, editar, emitir, cancelar)
- Botão "Nova NFe" e "Gerar da Venda"
- Estatísticas no topo

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  📊 Estatísticas                                    │
│  Total: 150 | Emitidas: 120 | Canceladas: 5        │
│  Valor Total: R$ 150.000,00                        │
├─────────────────────────────────────────────────────┤
│  🔍 Filtros                                         │
│  [Status▼] [Período] [Cliente] [Buscar...]        │
│  [Nova NFe] [Gerar da Venda]                       │
├─────────────────────────────────────────────────────┤
│  📋 Lista de NFes                                   │
│  ┌───────┬────────┬─────────┬────────┬─────────┐  │
│  │ Nº    │ Série  │ Data    │ Cliente │ Status  │  │
│  ├───────┼────────┼─────────┼────────┼─────────┤  │
│  │ 252   │ 1      │ 16/11   │ Cliente │ 🟢 Auto │  │
│  │ 251   │ 1      │ 15/11   │ Empresa │ 🔵 Rasc │  │
│  └───────┴────────┴─────────┴────────┴─────────┘  │
│  [← Anterior] Página 1 de 8 [Próxima →]           │
└─────────────────────────────────────────────────────┘
```

### 2. Detalhes da NFe (`/nfe/[id]`)

**Funcionalidades:**
- Informações completas da NFe
- Dados do emitente e destinatário
- Lista de itens com tributos
- Valores e totais
- Linha do tempo de eventos
- Ações: Emitir, Cancelar, Editar, Baixar DANFE, Baixar XML

**Seções:**
1. **Cabeçalho**: Número, série, status, chave de acesso
2. **Emitente**: Dados da empresa
3. **Destinatário**: Dados do cliente
4. **Itens**: Tabela com produtos e tributos
5. **Totais**: Valores consolidados
6. **Transporte**: Dados do frete e volumes
7. **Pagamento**: Forma e valores
8. **Informações Adicionais**: Observações
9. **Eventos**: Histórico (emissão, cancelamento, etc)

### 3. Nova NFe (`/nfe/new`)

**Funcionalidades:**
- Formulário em etapas (wizard)
- Validação em tempo real
- Auto-complete de clientes
- Seleção de produtos
- Cálculo automático de tributos
- Preview antes de salvar

**Etapas:**
1. **Dados Gerais**: Série, natureza, tipo, finalidade
2. **Destinatário**: Cliente ou dados manuais
3. **Produtos**: Adicionar itens com tributos
4. **Transporte**: Frete, transportadora, volumes
5. **Pagamento**: Forma e valores
6. **Revisão**: Preview completo

### 4. Gerar da Venda (`/nfe/from-sale/[saleId]`)

**Funcionalidades:**
- Pré-preenche dados da venda
- Permite editar informações fiscais
- Configura tributos dos produtos
- Gera NFe com um clique

---

## 🧩 Componentes Principais

### NFeList.tsx

```tsx
interface NFeListProps {
  nfes: NFe[];
  loading: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onEmit: (id: string) => void;
  onCancel: (id: string) => void;
}

export function NFeList({ nfes, loading, pagination, ... }: NFeListProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Número</TableHead>
          <TableHead>Série</TableHead>
          <TableHead>Data Emissão</TableHead>
          <TableHead>Destinatário</TableHead>
          <TableHead>Valor Total</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {nfes.map((nfe) => (
          <TableRow key={nfe.id}>
            <TableCell>{nfe.numero}</TableCell>
            <TableCell>{nfe.serie}</TableCell>
            <TableCell>{formatDate(nfe.dataEmissao)}</TableCell>
            <TableCell>{nfe.destinatarioNome}</TableCell>
            <TableCell>{formatCurrency(nfe.valorTotal)}</TableCell>
            <TableCell>
              <NFeStatusBadge status={nfe.status} />
            </TableCell>
            <TableCell>
              <NFeActions nfe={nfe} onView={onView} onEdit={onEdit} ... />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

### NFeFilters.tsx

```tsx
interface NFeFiltersProps {
  filters: NFeFilters;
  onChange: (filters: NFeFilters) => void;
}

export function NFeFilters({ filters, onChange }: NFeFiltersProps) {
  return (
    <div className="grid grid-cols-4 gap-4">
      {/* Status */}
      <Select
        value={filters.status}
        onValueChange={(status) => onChange({ ...filters, status })}
      >
        <SelectTrigger>
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="DRAFT">Rascunho</SelectItem>
          <SelectItem value="AUTHORIZED">Autorizada</SelectItem>
          <SelectItem value="CANCELED">Cancelada</SelectItem>
        </SelectContent>
      </Select>

      {/* Período */}
      <DateRangePicker
        from={filters.startDate}
        to={filters.endDate}
        onSelect={({ from, to }) =>
          onChange({ ...filters, startDate: from, endDate: to })
        }
      />

      {/* Cliente */}
      <CustomerSelect
        value={filters.destinatarioId}
        onChange={(destinatarioId) =>
          onChange({ ...filters, destinatarioId })
        }
      />

      {/* Busca */}
      <Input
        placeholder="Buscar por número, chave..."
        value={filters.search}
        onChange={(e) => onChange({ ...filters, search: e.target.value })}
      />
    </div>
  );
}
```

### NFeStatusBadge.tsx

```tsx
interface NFeStatusBadgeProps {
  status: NFeStatus;
}

export function NFeStatusBadge({ status }: NFeStatusBadgeProps) {
  const statusConfig = {
    DRAFT: { label: 'Rascunho', color: 'gray' },
    IN_PROCESS: { label: 'Processando', color: 'blue' },
    AUTHORIZED: { label: 'Autorizada', color: 'green' },
    REJECTED: { label: 'Rejeitada', color: 'red' },
    CANCELED: { label: 'Cancelada', color: 'orange' },
    DENIED: { label: 'Denegada', color: 'red' },
  };

  const config = statusConfig[status];

  return (
    <Badge variant={config.color}>
      {config.label}
    </Badge>
  );
}
```

### NFeForm.tsx

```tsx
interface NFeFormProps {
  initialData?: Partial<NFe>;
  onSubmit: (data: CreateNFeDto) => Promise<void>;
  onCancel: () => void;
}

export function NFeForm({ initialData, onSubmit, onCancel }: NFeFormProps) {
  const form = useForm<CreateNFeDto>({
    defaultValues: initialData,
    resolver: zodResolver(createNFeSchema),
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Tabs defaultValue="geral">
          <TabsList>
            <TabsTrigger value="geral">Dados Gerais</TabsTrigger>
            <TabsTrigger value="destinatario">Destinatário</TabsTrigger>
            <TabsTrigger value="itens">Itens</TabsTrigger>
            <TabsTrigger value="transporte">Transporte</TabsTrigger>
            <TabsTrigger value="pagamento">Pagamento</TabsTrigger>
          </TabsList>

          <TabsContent value="geral">
            <FormField
              control={form.control}
              name="serie"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Série</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            {/* ... mais campos */}
          </TabsContent>

          {/* ... outras abas */}
        </Tabs>

        <div className="flex justify-end gap-4 mt-6">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            Salvar NFe
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

### NFeItemsForm.tsx

```tsx
interface NFeItemsFormProps {
  items: NFeItem[];
  onChange: (items: NFeItem[]) => void;
}

export function NFeItemsForm({ items, onChange }: NFeItemsFormProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const addItem = (product: Product) => {
    const newItem: NFeItem = {
      productId: product.id,
      codigoProduto: product.sku,
      descricao: product.name,
      ncm: product.ncm || '',
      cfop: product.cfopEstadual || '',
      unidade: product.unit?.abbreviation || 'UN',
      quantidade: 1,
      valorUnitario: Number(product.salePrice),
      valorTotal: Number(product.salePrice),
      // ... tributos do produto
    };
    onChange([...items, newItem]);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, item: Partial<NFeItem>) => {
    const updated = [...items];
    updated[index] = { ...updated[index], ...item };
    onChange(updated);
  };

  return (
    <div>
      {/* Seletor de Produto */}
      <ProductSelect onSelect={addItem} />

      {/* Lista de Itens */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Produto</TableHead>
            <TableHead>Qtd</TableHead>
            <TableHead>Valor Unit.</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, index) => (
            <TableRow key={index}>
              <TableCell>{item.descricao}</TableCell>
              <TableCell>
                <Input
                  type="number"
                  value={item.quantidade}
                  onChange={(e) =>
                    updateItem(index, {
                      quantidade: Number(e.target.value),
                      valorTotal:
                        Number(e.target.value) * item.valorUnitario,
                    })
                  }
                />
              </TableCell>
              <TableCell>{formatCurrency(item.valorUnitario)}</TableCell>
              <TableCell>{formatCurrency(item.valorTotal)}</TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(index)}
                >
                  🗑️
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Totais */}
      <div className="mt-4 text-right">
        <p>Subtotal: {formatCurrency(calcSubtotal(items))}</p>
        <p className="font-bold text-lg">
          Total: {formatCurrency(calcTotal(items))}
        </p>
      </div>
    </div>
  );
}
```

---

## 🔌 Serviços e API

### nfe.service.ts

```typescript
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface CreateNFeDto {
  serie: string;
  modelo?: string;
  naturezaOperacao: string;
  destinatarioNome: string;
  destinatarioCnpjCpf: string;
  destLogradouro: string;
  destNumero: string;
  destBairro: string;
  destCidade: string;
  destEstado: string;
  destCep: string;
  destCodigoMunicipio: string;
  valorProdutos: number;
  valorTotal: number;
  items: CreateNFeItemDto[];
  // ... outros campos
}

export interface CreateNFeFromSaleDto {
  saleId: string;
  serie: string;
  naturezaOperacao: string;
  modalidadeFrete?: number;
  informacoesComplementares?: string;
}

export interface NFeFilters {
  status?: string;
  saleId?: string;
  destinatarioId?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
  page?: number;
  limit?: number;
}

class NFeService {
  private getHeaders() {
    const token = localStorage.getItem('token');
    const companyId = localStorage.getItem('companyId');
    return {
      Authorization: `Bearer ${token}`,
      'X-Company-Id': companyId,
    };
  }

  async create(data: CreateNFeDto): Promise<NFe> {
    const response = await axios.post(`${API_URL}/nfe`, data, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async createFromSale(data: CreateNFeFromSaleDto): Promise<NFe> {
    const response = await axios.post(`${API_URL}/nfe/from-sale`, data, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async findAll(filters?: NFeFilters): Promise<{
    data: NFe[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const response = await axios.get(`${API_URL}/nfe`, {
      headers: this.getHeaders(),
      params: filters,
    });
    return response.data;
  }

  async findOne(id: string): Promise<NFe> {
    const response = await axios.get(`${API_URL}/nfe/${id}`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async update(id: string, data: Partial<CreateNFeDto>): Promise<NFe> {
    const response = await axios.put(`${API_URL}/nfe/${id}`, data, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await axios.delete(`${API_URL}/nfe/${id}`, {
      headers: this.getHeaders(),
    });
  }

  async emitir(id: string): Promise<NFe> {
    const response = await axios.post(
      `${API_URL}/nfe/${id}/emitir`,
      {},
      {
        headers: this.getHeaders(),
      }
    );
    return response.data;
  }

  async cancelar(id: string, motivo: string): Promise<NFe> {
    const response = await axios.post(
      `${API_URL}/nfe/${id}/cancelar`,
      { motivoCancelamento: motivo },
      {
        headers: this.getHeaders(),
      }
    );
    return response.data;
  }

  async downloadDanfe(id: string): Promise<Blob> {
    const response = await axios.get(`${API_URL}/nfe/${id}/danfe`, {
      headers: this.getHeaders(),
      responseType: 'blob',
    });
    return response.data;
  }

  async downloadXml(id: string): Promise<Blob> {
    const response = await axios.get(`${API_URL}/nfe/${id}/xml`, {
      headers: this.getHeaders(),
      responseType: 'blob',
    });
    return response.data;
  }

  async getStats(): Promise<{
    total: number;
    emitidas: number;
    canceladas: number;
    rascunhos: number;
    valorTotalEmitidas: number;
  }> {
    const response = await axios.get(`${API_URL}/nfe/stats`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }
}

export const nfeService = new NFeService();
```

---

## 📝 Tipos e Interfaces

### nfe.types.ts

```typescript
export type NFeStatus =
  | 'DRAFT'
  | 'IN_PROCESS'
  | 'AUTHORIZED'
  | 'REJECTED'
  | 'CANCELED'
  | 'DENIED'
  | 'CONTINGENCY';

export interface NFe {
  id: string;
  companyId: string;
  saleId?: string;

  // Identificação
  numero: number;
  serie: string;
  modelo: string;
  chaveAcesso?: string;
  status: NFeStatus;

  // Operação
  naturezaOperacao: string;
  tipoOperacao: number;
  finalidade: number;

  // Destinatário
  destinatarioId?: string;
  destinatarioNome: string;
  destinatarioCnpjCpf: string;
  destinatarioIe?: string;

  // Endereço
  destLogradouro: string;
  destNumero: string;
  destBairro: string;
  destCidade: string;
  destEstado: string;
  destCep: string;

  // Valores
  valorProdutos: number;
  valorFrete: number;
  valorDesconto: number;
  valorTotal: number;
  valorIPI: number;
  valorICMS: number;
  valorPIS: number;
  valorCOFINS: number;

  // Transporte
  modalidadeFrete: number;
  transportadoraNome?: string;

  // Pagamento
  meioPagamento?: string;
  valorPagamento?: number;

  // Informações adicionais
  informacoesComplementares?: string;
  observacoes?: string;

  // Datas
  dataEmissao?: Date;
  dataSaida?: Date;
  dataAutorizacao?: Date;
  canceladaEm?: Date;

  // Protocolo
  protocoloAutorizacao?: string;
  motivoCancelamento?: string;

  // Relacionamentos
  items: NFeItem[];
  events: NFeEvent[];
  sale?: Sale;
  customer?: Customer;

  createdAt: Date;
  updatedAt: Date;
}

export interface NFeItem {
  id: string;
  nfeId: string;
  numero: number;

  // Produto
  productId?: string;
  codigoProduto: string;
  codigoEAN: string;
  descricao: string;
  ncm: string;
  cest?: string;
  cfop: string;

  // Unidade e quantidades
  unidade: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  valorDesconto: number;

  // Tributos
  icmsCst?: string;
  icmsOrigem?: number;
  icmsAliquota?: number;
  icmsValor?: number;

  ipiCst?: string;
  ipiAliquota?: number;
  ipiValor?: number;

  pisCst?: string;
  pisAliquota?: number;
  pisValor?: number;

  cofinsCst?: string;
  cofinsAliquota?: number;
  cofinsValor?: number;
}

export interface NFeEvent {
  id: string;
  nfeId: string;
  tipo: 'CANCELAMENTO' | 'CARTA_CORRECAO' | 'CONFIRMACAO_OPERACAO';
  sequencia: number;
  descricao: string;
  justificativa?: string;
  protocolo?: string;
  dataEvento: Date;
  status: string;
}
```

---

## 🎨 Hooks Customizados

### useNFeList.ts

```typescript
import { useState, useEffect } from 'react';
import { nfeService, NFeFilters } from '@/services/nfe.service';
import { NFe } from '@/types/nfe.types';

export function useNFeList() {
  const [nfes, setNfes] = useState<NFe[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<NFeFilters>({
    page: 1,
    limit: 20,
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });

  const fetchNFes = async () => {
    setLoading(true);
    try {
      const response = await nfeService.findAll(filters);
      setNfes(response.data);
      setPagination(response.meta);
    } catch (error) {
      console.error('Erro ao buscar NFes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNFes();
  }, [filters]);

  const refresh = () => fetchNFes();

  const updateFilters = (newFilters: Partial<NFeFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  return {
    nfes,
    loading,
    filters,
    pagination,
    updateFilters,
    refresh,
  };
}
```

### useNFe.ts

```typescript
import { useState, useEffect } from 'react';
import { nfeService } from '@/services/nfe.service';
import { NFe } from '@/types/nfe.types';

export function useNFe(id: string) {
  const [nfe, setNfe] = useState<NFe | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNFe = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await nfeService.findOne(id);
      setNfe(data);
    } catch (err) {
      setError('Erro ao carregar NFe');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchNFe();
    }
  }, [id]);

  const emitir = async () => {
    try {
      const updated = await nfeService.emitir(id);
      setNfe(updated);
      return updated;
    } catch (err) {
      throw new Error('Erro ao emitir NFe');
    }
  };

  const cancelar = async (motivo: string) => {
    try {
      const updated = await nfeService.cancelar(id, motivo);
      setNfe(updated);
      return updated;
    } catch (err) {
      throw new Error('Erro ao cancelar NFe');
    }
  };

  const downloadDanfe = async () => {
    try {
      const blob = await nfeService.downloadDanfe(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `DANFE-${nfe?.numero}-${nfe?.serie}.pdf`;
      a.click();
    } catch (err) {
      throw new Error('Erro ao baixar DANFE');
    }
  };

  const downloadXml = async () => {
    try {
      const blob = await nfeService.downloadXml(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `NFe-${nfe?.chaveAcesso}.xml`;
      a.click();
    } catch (err) {
      throw new Error('Erro ao baixar XML');
    }
  };

  return {
    nfe,
    loading,
    error,
    refresh: fetchNFe,
    emitir,
    cancelar,
    downloadDanfe,
    downloadXml,
  };
}
```

---

## 🔄 Fluxos de Tela

### Fluxo 1: Criar NFe da Venda

```
1. Usuário acessa página de vendas
2. Clica em "Gerar NFe" na venda
3. Sistema carrega página /nfe/from-sale/[saleId]
4. Dados da venda são pré-preenchidos
5. Usuário revisa e ajusta informações fiscais
6. Clica em "Gerar NFe"
7. Sistema cria NFe com status DRAFT
8. Redireciona para página de detalhes da NFe
```

### Fluxo 2: Emitir NFe

```
1. Usuário acessa detalhes da NFe (status DRAFT)
2. Revisa todas as informações
3. Clica em "Emitir NFe"
4. Modal de confirmação aparece
5. Usuário confirma
6. Sistema envia para SEFAZ (quando implementado)
7. Status muda para IN_PROCESS → AUTHORIZED
8. Botão "Baixar DANFE" aparece
9. Notificação de sucesso
```

### Fluxo 3: Cancelar NFe

```
1. Usuário acessa detalhes da NFe (status AUTHORIZED)
2. Clica em "Cancelar NFe"
3. Modal solicita motivo do cancelamento (mín. 15 caracteres)
4. Usuário digita motivo e confirma
5. Sistema envia cancelamento para SEFAZ
6. Status muda para CANCELED
7. Evento de cancelamento é registrado
8. Notificação de sucesso
```

---

## ✅ Validações

### Validação de Formulário com Zod

```typescript
import { z } from 'zod';

export const createNFeSchema = z.object({
  serie: z.string().min(1, 'Série é obrigatória'),
  modelo: z.enum(['55', '65']),
  naturezaOperacao: z.string().min(1, 'Natureza da operação é obrigatória'),
  
  destinatarioNome: z.string().min(1, 'Nome do destinatário é obrigatório'),
  destinatarioCnpjCpf: z
    .string()
    .refine((val) => validarCPFCNPJ(val), 'CPF/CNPJ inválido'),
  
  destLogradouro: z.string().min(1, 'Logradouro é obrigatório'),
  destNumero: z.string().min(1, 'Número é obrigatório'),
  destBairro: z.string().min(1, 'Bairro é obrigatório'),
  destCidade: z.string().min(1, 'Cidade é obrigatória'),
  destEstado: z.string().length(2, 'UF deve ter 2 caracteres'),
  destCep: z.string().regex(/^\d{8}$/, 'CEP inválido'),
  
  valorProdutos: z.number().min(0),
  valorTotal: z.number().min(0),
  
  items: z
    .array(
      z.object({
        codigoProduto: z.string().min(1),
        descricao: z.string().min(1),
        ncm: z.string().length(8, 'NCM deve ter 8 dígitos'),
        cfop: z.string().length(4, 'CFOP deve ter 4 dígitos'),
        unidade: z.string().min(1),
        quantidade: z.number().min(0.01),
        valorUnitario: z.number().min(0),
        valorTotal: z.number().min(0),
      })
    )
    .min(1, 'Adicione pelo menos 1 item'),
});
```

---

## 📱 Responsividade

### Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Adaptações Mobile

1. **Lista de NFes**: Cards empilhados ao invés de tabela
2. **Filtros**: Drawer lateral ao invés de inline
3. **Formulário**: Uma coluna ao invés de duas
4. **Detalhes**: Seções colapsáveis (accordion)

---

## 🎨 Sugestões de UI/UX

### Cores por Status

```css
.status-draft { background: #6B7280; }      /* Cinza */
.status-in-process { background: #3B82F6; } /* Azul */
.status-authorized { background: #10B981; } /* Verde */
.status-rejected { background: #EF4444; }   /* Vermelho */
.status-canceled { background: #F59E0B; }   /* Laranja */
```

### Ícones

- 📄 NFe em geral
- ✅ Autorizada
- ⏳ Em processamento
- ❌ Cancelada/Rejeitada
- ✏️ Rascunho
- 📥 Download
- 🖨️ Imprimir

### Animações

- Loading skeleton durante carregamento
- Transição suave entre status
- Feedback visual em ações (emitir, cancelar)
- Toast notifications para sucesso/erro

---

## 🔐 Permissões

### Roles e Permissões

```typescript
const permissions = {
  'nfe:view': ['admin', 'manager', 'sales', 'viewer'],
  'nfe:create': ['admin', 'manager', 'sales'],
  'nfe:edit': ['admin', 'manager'],
  'nfe:delete': ['admin'],
  'nfe:emit': ['admin', 'manager'],
  'nfe:cancel': ['admin', 'manager'],
};

// Verificar permissão
function hasPermission(user: User, permission: string): boolean {
  return permissions[permission]?.includes(user.role) ?? false;
}

// Uso no componente
{hasPermission(user, 'nfe:emit') && (
  <Button onClick={emitir}>Emitir NFe</Button>
)}
```

---

## 📊 Estatísticas e Dashboard

### Widget de Estatísticas

```tsx
export function NFeStats() {
  const { data: stats } = useQuery('nfe-stats', () =>
    nfeService.getStats()
  );

  return (
    <div className="grid grid-cols-4 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Total</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{stats?.total}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Emitidas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-green-600">
            {stats?.emitidas}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Canceladas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-orange-600">
            {stats?.canceladas}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Valor Total</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">
            {formatCurrency(stats?.valorTotalEmitidas || 0)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## 🧪 Testes

### Testes de Componentes

```typescript
import { render, screen } from '@testing-library/react';
import { NFeStatusBadge } from '@/components/nfe/NFeStatusBadge';

describe('NFeStatusBadge', () => {
  it('deve renderizar status AUTHORIZED', () => {
    render(<NFeStatusBadge status="AUTHORIZED" />);
    expect(screen.getByText('Autorizada')).toBeInTheDocument();
  });

  it('deve aplicar cor verde para AUTHORIZED', () => {
    const { container } = render(<NFeStatusBadge status="AUTHORIZED" />);
    expect(container.firstChild).toHaveClass('bg-green-600');
  });
});
```

---

## 📦 Bibliotecas Recomendadas

### Frontend

- **React Query**: Gerenciamento de estado assíncrono
- **React Hook Form**: Formulários
- **Zod**: Validação de schemas
- **Axios**: HTTP client
- **date-fns**: Manipulação de datas
- **Tailwind CSS**: Estilização
- **shadcn/ui**: Componentes
- **React Icons**: Ícones

### Instalação

```bash
npm install @tanstack/react-query react-hook-form zod axios date-fns
npm install -D @tailwindcss/forms
```

---

## 🚀 Próximos Passos

1. ✅ Implementar lista de NFes
2. ✅ Implementar detalhes da NFe
3. ✅ Implementar formulário de criação
4. ✅ Implementar geração a partir de venda
5. ⏳ Implementar visualização de DANFE
6. ⏳ Implementar histórico de eventos
7. ⏳ Implementar relatórios de NFe
8. ⏳ Implementar dashboard com gráficos

---

## 📞 Suporte

Para dúvidas sobre a implementação:
- Documentação Backend: `docs/NFE_MODULE.md`
- Testes HTTP: `nfe-tests.http`
- Tipos TypeScript: Gerados a partir do schema Prisma

---

**Versão:** 1.0  
**Data:** 16/11/2025  
**Framework:** Next.js / React  
**UI Library:** shadcn/ui + Tailwind CSS
