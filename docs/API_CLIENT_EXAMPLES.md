# Exemplos de Integração - API Clientes

**Data**: 5 de novembro de 2025  
**Versão**: 1.0

## 📋 Índice

1. [JavaScript/TypeScript (Fetch)](#javascripttypescript-fetch)
2. [React Hooks](#react-hooks)
3. [Axios](#axios)
4. [Angular](#angular)
5. [Vue.js](#vuejs)
6. [React Native](#react-native)
7. [cURL (Testes)](#curl-testes)

---

## 🌐 JavaScript/TypeScript (Fetch)

### Setup Base

```typescript
// api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export class ApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    
    const headers: HeadersInit = {
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(options.body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro na requisição');
    }

    // Para DELETE sem conteúdo
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // GET
  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // POST
  post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data,
    });
  }

  // PATCH
  patch<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data,
    });
  }

  // DELETE
  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Upload de arquivo
  async upload<T>(endpoint: string, file: File, data?: Record<string, any>): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    if (data) {
      Object.entries(data).forEach(([key, value]) => {
        if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      });
    }

    return this.request<T>(endpoint, {
      method: 'POST',
      body: formData,
    });
  }
}

export const api = new ApiClient();
```

### Uso Básico

```typescript
// products.ts
import { api } from './api';

// Tipos
interface Product {
  id: string;
  name: string;
  sku: string;
  currentStock: number;
  salePrice: number;
  // ... outros campos
}

interface ProductListResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
}

// Listar produtos
export const getProducts = async (params?: {
  search?: string;
  page?: number;
  limit?: number;
}): Promise<ProductListResponse> => {
  const queryString = new URLSearchParams(params as any).toString();
  return api.get<ProductListResponse>(`/products?${queryString}`);
};

// Buscar produto por ID
export const getProduct = async (id: string): Promise<Product> => {
  return api.get<Product>(`/products/${id}`);
};

// Criar produto
export const createProduct = async (data: Partial<Product>): Promise<Product> => {
  return api.post<Product>('/products', data);
};

// Atualizar produto
export const updateProduct = async (id: string, data: Partial<Product>): Promise<Product> => {
  return api.patch<Product>(`/products/${id}`, data);
};

// Deletar produto
export const deleteProduct = async (id: string): Promise<void> => {
  await api.delete(`/products/${id}`);
};
```

### Movimentações com Upload

```typescript
// stock-movements.ts
interface StockMovementData {
  type: 'ENTRY' | 'EXIT' | 'ADJUSTMENT' | 'RETURN' | 'LOSS';
  quantity: number;
  locationId: string;
  reason?: string;
  notes?: string;
  documentId?: string;
}

interface StockMovement {
  id: string;
  type: string;
  quantity: number;
  // ... outros campos
}

// Criar movimentação
export const createStockMovement = async (
  productId: string,
  data: StockMovementData
): Promise<StockMovement> => {
  return api.post<StockMovement>(`/products/${productId}/stock-movement`, data);
};

// Criar movimentação com documento
export const createStockMovementWithDocument = async (
  productId: string,
  data: StockMovementData,
  file: File
): Promise<StockMovement> => {
  // 1. Upload do documento
  const document = await api.upload<{ id: string }>('/documents/upload', file, {
    title: `NF - ${data.reason}`,
    type: 'nota_fiscal_entrada',
    tags: ['nf', 'entrada']
  });

  // 2. Criar movimentação com documentId
  return api.post<StockMovement>(`/products/${productId}/stock-movement`, {
    ...data,
    documentId: document.id
  });
};
```

---

## ⚛️ React Hooks

### Hook Customizado para Produtos

```typescript
// hooks/useProducts.ts
import { useState, useEffect } from 'react';
import { getProducts, getProduct } from '../services/products';

export const useProducts = (filters?: any) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20
  });

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await getProducts(filters);
      setProducts(response.data);
      setPagination({
        total: response.total,
        page: response.page,
        limit: response.limit
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    products,
    loading,
    error,
    pagination,
    refetch: fetchProducts
  };
};

export const useProduct = (id: string) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const data = await getProduct(id);
      setProduct(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    product,
    loading,
    error,
    refetch: fetchProduct
  };
};
```

### Hook para Movimentações

```typescript
// hooks/useStockMovement.ts
import { useState } from 'react';
import { createStockMovementWithDocument } from '../services/stock-movements';

export const useStockMovement = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createMovement = async (
    productId: string,
    data: any,
    file?: File
  ) => {
    try {
      setLoading(true);
      setError(null);

      let movement;
      if (file) {
        movement = await createStockMovementWithDocument(productId, data, file);
      } else {
        movement = await createStockMovement(productId, data);
      }

      return movement;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createMovement,
    loading,
    error
  };
};
```

### Componente de Listagem

```typescript
// components/ProductList.tsx
import React from 'react';
import { useProducts } from '../hooks/useProducts';

export const ProductList: React.FC = () => {
  const { products, loading, error, pagination } = useProducts({ page: 1 });

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
    <div>
      <h1>Produtos</h1>
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>SKU</th>
            <th>Estoque</th>
            <th>Preço</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>{product.sku}</td>
              <td>{product.currentStock}</td>
              <td>R$ {product.salePrice?.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        Página {pagination.page} de {Math.ceil(pagination.total / pagination.limit)}
      </div>
    </div>
  );
};
```

### Componente de Entrada com Upload

```typescript
// components/StockEntryForm.tsx
import React, { useState } from 'react';
import { useStockMovement } from '../hooks/useStockMovement';

interface Props {
  productId: string;
  onSuccess: () => void;
}

export const StockEntryForm: React.FC<Props> = ({ productId, onSuccess }) => {
  const { createMovement, loading } = useStockMovement();
  const [formData, setFormData] = useState({
    quantity: 0,
    locationId: '',
    reason: '',
    notes: ''
  });
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createMovement(
        productId,
        {
          type: 'ENTRY',
          ...formData
        },
        file || undefined
      );

      alert('Entrada criada com sucesso!');
      onSuccess();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Quantidade</label>
        <input
          type="number"
          required
          value={formData.quantity}
          onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
        />
      </div>

      <div>
        <label>Local</label>
        <select
          required
          value={formData.locationId}
          onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
        >
          <option value="">Selecione...</option>
          {/* Carregar locais */}
        </select>
      </div>

      <div>
        <label>Motivo</label>
        <input
          type="text"
          required
          value={formData.reason}
          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
        />
      </div>

      <div>
        <label>Nota Fiscal (opcional)</label>
        <input
          type="file"
          accept=".pdf,.jpg,.png"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Processando...' : 'Criar Entrada'}
      </button>
    </form>
  );
};
```

---

## 📡 Axios

### Setup

```typescript
// api/axios.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  timeout: 30000,
});

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirecionar para login
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  }
);

export default api;
```

### Serviços

```typescript
// services/products.service.ts
import api from '../api/axios';

export const productsService = {
  // Listar
  getAll: (params?: any) => 
    api.get('/products', { params }).then(res => res.data),

  // Buscar por ID
  getById: (id: string) => 
    api.get(`/products/${id}`).then(res => res.data),

  // Criar
  create: (data: any) => 
    api.post('/products', data).then(res => res.data),

  // Atualizar
  update: (id: string, data: any) => 
    api.patch(`/products/${id}`, data).then(res => res.data),

  // Deletar
  delete: (id: string) => 
    api.delete(`/products/${id}`),

  // Estatísticas
  getStats: () => 
    api.get('/products/stats').then(res => res.data),

  // Estoque baixo
  getLowStock: () => 
    api.get('/products/low-stock').then(res => res.data),
};

export const stockService = {
  // Criar movimentação
  createMovement: (productId: string, data: any) =>
    api.post(`/products/${productId}/stock-movement`, data).then(res => res.data),

  // Listar movimentações
  getMovements: (productId: string, params?: any) =>
    api.get(`/products/${productId}/stock-movements`, { params }).then(res => res.data),
};

export const documentsService = {
  // Upload
  upload: (file: File, data?: any) => {
    const formData = new FormData();
    formData.append('file', file);
    
    if (data) {
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
      });
    }

    return api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data);
  },

  // Download
  download: (id: string) =>
    api.get(`/documents/${id}/download`, { responseType: 'blob' }),
};
```

### Hook com Axios

```typescript
// hooks/useProducts.ts (Axios)
import { useState, useEffect } from 'react';
import { productsService } from '../services/products.service';

export const useProducts = (filters?: any) => {
  const [data, setData] = useState({ products: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [JSON.stringify(filters)]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productsService.getAll(filters);
      setData({ products: response.data, total: response.total });
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  return { ...data, loading, error, refetch: fetchProducts };
};
```

---

## 🅰️ Angular

### Service

```typescript
// services/products.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

interface Product {
  id: string;
  name: string;
  sku: string;
  currentStock: number;
  // ...
}

interface ProductListResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  getProducts(filters?: any): Observable<ProductListResponse> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null) {
          params = params.append(key, filters[key]);
        }
      });
    }
    return this.http.get<ProductListResponse>(this.apiUrl, { params });
  }

  getProduct(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  createProduct(data: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, data);
  }

  updateProduct(id: string, data: Partial<Product>): Observable<Product> {
    return this.http.patch<Product>(`${this.apiUrl}/${id}`, data);
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats`);
  }
}
```

### Interceptor

```typescript
// interceptors/auth.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('auth_token');
    
    if (token) {
      const cloned = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
      return next.handle(cloned);
    }
    
    return next.handle(req);
  }
}
```

### Component

```typescript
// components/product-list/product-list.component.ts
import { Component, OnInit } from '@angular/core';
import { ProductsService } from '../../services/products.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  products: any[] = [];
  loading = true;
  error: string | null = null;

  constructor(private productsService: ProductsService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productsService.getProducts({ page: 1, limit: 20 }).subscribe({
      next: (response) => {
        this.products = response.data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message;
        this.loading = false;
      }
    });
  }
}
```

---

## 🟢 Vue.js

### Composable

```typescript
// composables/useProducts.ts
import { ref, Ref } from 'vue';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface Product {
  id: string;
  name: string;
  sku: string;
  currentStock: number;
}

export function useProducts() {
  const products: Ref<Product[]> = ref([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchProducts = async (filters?: any) => {
    try {
      loading.value = true;
      error.value = null;
      
      const response = await axios.get(`${API_URL}/products`, {
        params: filters,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      products.value = response.data.data;
    } catch (err: any) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  return {
    products,
    loading,
    error,
    fetchProducts
  };
}
```

### Component (Composition API)

```vue
<!-- components/ProductList.vue -->
<template>
  <div>
    <h1>Produtos</h1>
    
    <div v-if="loading">Carregando...</div>
    <div v-else-if="error">Erro: {{ error }}</div>
    
    <table v-else>
      <thead>
        <tr>
          <th>Nome</th>
          <th>SKU</th>
          <th>Estoque</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="product in products" :key="product.id">
          <td>{{ product.name }}</td>
          <td>{{ product.sku }}</td>
          <td>{{ product.currentStock }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useProducts } from '../composables/useProducts';

const { products, loading, error, fetchProducts } = useProducts();

onMounted(() => {
  fetchProducts();
});
</script>
```

---

## 📱 React Native

### API Client

```typescript
// api/client.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:3000/api'; // Ajustar para produção

class ApiClient {
  async getToken(): Promise<string | null> {
    return AsyncStorage.getItem('auth_token');
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = await this.getToken();
    
    const headers: HeadersInit = {
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (options.body && typeof options.body === 'string') {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro na requisição');
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiClient();
```

### Hook

```typescript
// hooks/useProducts.ts
import { useState, useEffect } from 'react';
import { api } from '../api/client';

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get<any>('/products');
      setProducts(response.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { products, loading, error, refetch: fetchProducts };
};
```

### Component

```typescript
// screens/ProductsScreen.tsx
import React from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { useProducts } from '../hooks/useProducts';

export const ProductsScreen: React.FC = () => {
  const { products, loading, error } = useProducts();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Erro: {error}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={{ padding: 16, borderBottomWidth: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{item.name}</Text>
          <Text>{item.sku}</Text>
          <Text>Estoque: {item.currentStock}</Text>
        </View>
      )}
    />
  );
};
```

---

## 🔧 cURL (Testes)

### Listar Produtos

```bash
curl -X GET "http://localhost:3000/api/products?page=1&limit=20" \
  -H "Authorization: Bearer SEU_TOKEN"
```

### Criar Produto

```bash
curl -X POST "http://localhost:3000/api/products" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Notebook Dell",
    "sku": "NB-DELL-001",
    "salePrice": 3500,
    "categoryId": "cat-123",
    "manageStock": true,
    "initialStockByLocations": [
      {"locationId": "loc-1", "quantity": 10}
    ]
  }'
```

### Upload de Documento

```bash
curl -X POST "http://localhost:3000/api/documents/upload" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -F "file=@/path/to/nota_fiscal.pdf" \
  -F "title=Nota Fiscal 12345" \
  -F "type=nota_fiscal_entrada" \
  -F 'tags=["nf","entrada"]'
```

### Criar Movimentação com Documento

```bash
# 1. Upload
DOC_ID=$(curl -s -X POST "http://localhost:3000/api/documents/upload" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -F "file=@nota_fiscal.pdf" \
  -F "title=NF 12345" \
  | jq -r '.id')

# 2. Movimentação
curl -X POST "http://localhost:3000/api/products/PRODUCT_ID/stock-movement" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"type\": \"ENTRY\",
    \"quantity\": 50,
    \"locationId\": \"loc-1\",
    \"documentId\": \"$DOC_ID\",
    \"reason\": \"Compra fornecedor X\"
  }"
```

### Criar Transferência

```bash
curl -X POST "http://localhost:3000/api/products/stock-transfers" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fromLocationId": "loc-1",
    "toLocationId": "loc-2",
    "items": [
      {"productId": "prod-1", "quantity": 5},
      {"productId": "prod-2", "quantity": 10}
    ],
    "notes": "Transferência para reposição"
  }'
```

### Aprovar Transferência

```bash
curl -X PATCH "http://localhost:3000/api/products/stock-transfers/TRANSFER_ID/approve" \
  -H "Authorization: Bearer SEU_TOKEN"
```

### Completar Transferência

```bash
curl -X PATCH "http://localhost:3000/api/products/stock-transfers/TRANSFER_ID/complete" \
  -H "Authorization: Bearer SEU_TOKEN"
```

---

## 📝 Notas Importantes

### CORS
Se estiver desenvolvendo localmente com frontend em porta diferente do backend, configure CORS no backend:

```typescript
// main.ts (NestJS)
app.enableCors({
  origin: ['http://localhost:3001', 'http://localhost:5173'], // Ajustar conforme necessário
  credentials: true,
});
```

### Variáveis de Ambiente

```env
# .env.local (Next.js/React)
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# .env (Vite)
VITE_API_URL=http://localhost:3000/api

# environment.ts (Angular)
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

### Tratamento de Erros Global

Sempre implemente tratamento de erros para:
- 401: Redirecionar para login
- 403: Mostrar mensagem de permissão negada
- 404: Recurso não encontrado
- 500: Erro do servidor

---

**Última Atualização**: 5 de novembro de 2025  
**Versão**: 1.0
