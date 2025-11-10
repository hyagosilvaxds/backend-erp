# 🚀 Exemplos Práticos - Integração Payroll API

> Exemplos de integração para diferentes frameworks e bibliotecas

---

## 📋 Índice

- [React + TypeScript](#react--typescript)
- [Next.js](#nextjs)
- [Vue.js](#vuejs)
- [Angular](#angular)
- [React Native](#react-native)
- [Node.js Backend](#nodejs-backend)

---

## React + TypeScript

### Setup Inicial

```bash
npm install axios
```

### Configuração do Axios

```typescript
// src/config/api.ts

import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 30000,
});

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Service Completo

```typescript
// src/services/payroll.service.ts

import api from '../config/api';

export interface PayrollCreateDto {
  referenceMonth: number;
  referenceYear: number;
  type: 'MONTHLY' | 'WEEKLY' | 'DAILY' | 'ADVANCE';
  startDate: string;
  endDate: string;
  paymentDate: string;
}

export interface PayrollItem {
  id: string;
  payrollId: string;
  employeeId: string;
  workDays: number;
  totalEarnings: string;
  totalDeductions: string;
  netAmount: string;
  earnings: Array<{ name: string; value: string }>;
  deductions: Array<{ name: string; value: string }>;
  notes?: string;
  employee: {
    id: string;
    name: string;
    cpf: string;
    admissionDate: string;
    position?: {
      id: string;
      name: string;
    };
  };
}

export interface Payroll {
  id: string;
  companyId: string;
  referenceMonth: number;
  referenceYear: number;
  type: string;
  status: 'DRAFT' | 'CALCULATED' | 'APPROVED' | 'PAID';
  startDate: string;
  endDate: string;
  paymentDate: string;
  totalEarnings: string;
  totalDeductions: string;
  netAmount: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  approvedById?: string;
  approvedAt?: string;
  items?: PayrollItem[];
}

class PayrollService {
  async list(params?: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
    referenceMonth?: number;
    referenceYear?: number;
  }) {
    const response = await api.get<{
      data: Payroll[];
      meta: { total: number; page: number; limit: number; totalPages: number };
    }>('/payroll', { params });
    return response.data;
  }

  async getById(id: string) {
    const response = await api.get<Payroll>(`/payroll/${id}`);
    return response.data;
  }

  async create(data: PayrollCreateDto) {
    const response = await api.post<Payroll>('/payroll', data);
    return response.data;
  }

  async update(id: string, data: Partial<PayrollCreateDto>) {
    const response = await api.patch<Payroll>(`/payroll/${id}`, data);
    return response.data;
  }

  async calculate(id: string) {
    const response = await api.post<Payroll>(`/payroll/${id}/calculate`);
    return response.data;
  }

  async addItem(id: string, data: {
    employeeId: string;
    workDays: number;
    earnings?: Array<{ name: string; value: number }>;
    deductions?: Array<{ name: string; value: number }>;
    notes?: string;
  }) {
    const response = await api.post<PayrollItem>(`/payroll/${id}/items`, data);
    return response.data;
  }

  async approve(id: string) {
    const response = await api.post<Payroll>(`/payroll/${id}/approve`);
    return response.data;
  }

  async markAsPaid(id: string) {
    const response = await api.post<Payroll>(`/payroll/${id}/pay`);
    return response.data;
  }

  async delete(id: string) {
    await api.delete(`/payroll/${id}`);
  }

  async getStats(referenceMonth?: number, referenceYear?: number) {
    const response = await api.get('/payroll/stats', {
      params: { referenceMonth, referenceYear }
    });
    return response.data;
  }

  async downloadPayslip(payrollId: string, itemId: string, filename?: string) {
    const response = await api.get(
      `/payroll/${payrollId}/items/${itemId}/payslip`,
      { responseType: 'blob' }
    );

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename || `holerite-${itemId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  async downloadPayrollPDF(payrollId: string, filename?: string) {
    const response = await api.get(`/payroll/${payrollId}/pdf`, {
      responseType: 'blob'
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename || `folha-pagamento-${payrollId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
}

export default new PayrollService();
```

### Custom Hook

```typescript
// src/hooks/usePayroll.ts

import { useState, useEffect, useCallback } from 'react';
import payrollService, { Payroll } from '../services/payroll.service';

export const usePayroll = (payrollId?: string) => {
  const [payroll, setPayroll] = useState<Payroll | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPayroll = useCallback(async () => {
    if (!payrollId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await payrollService.getById(payrollId);
      setPayroll(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao buscar folha');
    } finally {
      setLoading(false);
    }
  }, [payrollId]);

  useEffect(() => {
    fetchPayroll();
  }, [fetchPayroll]);

  const calculate = async () => {
    if (!payrollId) return;
    setLoading(true);
    setError(null);

    try {
      await payrollService.calculate(payrollId);
      await fetchPayroll();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao calcular');
    } finally {
      setLoading(false);
    }
  };

  const approve = async () => {
    if (!payrollId) return;
    setLoading(true);
    setError(null);

    try {
      await payrollService.approve(payrollId);
      await fetchPayroll();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao aprovar');
    } finally {
      setLoading(false);
    }
  };

  const markAsPaid = async () => {
    if (!payrollId) return;
    setLoading(true);
    setError(null);

    try {
      await payrollService.markAsPaid(payrollId);
      await fetchPayroll();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao marcar como paga');
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    if (!payrollId || !payroll) return;

    try {
      const filename = `folha-${payroll.referenceMonth}-${payroll.referenceYear}.pdf`;
      await payrollService.downloadPayrollPDF(payrollId, filename);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao baixar PDF');
    }
  };

  return {
    payroll,
    loading,
    error,
    calculate,
    approve,
    markAsPaid,
    downloadPDF,
    refresh: fetchPayroll
  };
};

export const usePayrollList = () => {
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPayrolls = async (filters?: any) => {
    setLoading(true);
    setError(null);

    try {
      const data = await payrollService.list({ ...filters, page });
      setPayrolls(data.data);
      setTotalPages(data.meta.totalPages);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao buscar folhas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrolls();
  }, [page]);

  return {
    payrolls,
    loading,
    error,
    page,
    totalPages,
    setPage,
    refresh: fetchPayrolls
  };
};
```

### Componentes

```tsx
// src/components/PayrollCard.tsx

import React from 'react';
import { Payroll } from '../services/payroll.service';

interface Props {
  payroll: Payroll;
  onView: (id: string) => void;
  onDownload: (id: string) => void;
}

const PayrollCard: React.FC<Props> = ({ payroll, onView, onDownload }) => {
  const getStatusColor = (status: string) => {
    const colors = {
      DRAFT: 'bg-gray-100 text-gray-800',
      CALCULATED: 'bg-blue-100 text-blue-800',
      APPROVED: 'bg-green-100 text-green-800',
      PAID: 'bg-purple-100 text-purple-800'
    };
    return colors[status] || 'bg-gray-100';
  };

  const getStatusText = (status: string) => {
    const texts = {
      DRAFT: 'Rascunho',
      CALCULATED: 'Calculada',
      APPROVED: 'Aprovada',
      PAID: 'Paga'
    };
    return texts[status] || status;
  };

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(parseFloat(value));
  };

  const getMonthName = (month: number) => {
    const months = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ];
    return months[month - 1];
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold">
            {getMonthName(payroll.referenceMonth)}/{payroll.referenceYear}
          </h3>
          <p className="text-gray-600 text-sm">{payroll.type}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(payroll.status)}`}>
          {getStatusText(payroll.status)}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <span className="text-gray-600">Valor Líquido:</span>
          <span className="font-bold text-blue-600">
            {formatCurrency(payroll.netAmount)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Colaboradores:</span>
          <span className="font-semibold">{payroll.items?.length || 0}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onView(payroll.id)}
          className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
        >
          Ver Detalhes
        </button>
        <button
          onClick={() => onDownload(payroll.id)}
          className="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600 transition"
        >
          Baixar PDF
        </button>
      </div>
    </div>
  );
};

export default PayrollCard;
```

```tsx
// src/components/PayrollDetails.tsx

import React from 'react';
import { usePayroll } from '../hooks/usePayroll';
import payrollService from '../services/payroll.service';

interface Props {
  payrollId: string;
}

const PayrollDetails: React.FC<Props> = ({ payrollId }) => {
  const { payroll, loading, error, calculate, approve, markAsPaid, downloadPDF } = usePayroll(payrollId);

  if (loading) return <div className="p-8 text-center">Carregando...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!payroll) return null;

  const handleDownloadPayslip = async (itemId: string, employeeName: string) => {
    try {
      await payrollService.downloadPayslip(
        payrollId,
        itemId,
        `holerite-${employeeName}.pdf`
      );
    } catch (err) {
      alert('Erro ao baixar holerite');
    }
  };

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(parseFloat(value));
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Folha de Pagamento - {payroll.referenceMonth}/{payroll.referenceYear}
            </h1>
            <p className="text-gray-600">Tipo: {payroll.type}</p>
          </div>
          <span className={`px-4 py-2 rounded-full text-lg font-semibold ${
            payroll.status === 'PAID' ? 'bg-purple-100 text-purple-800' :
            payroll.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
            payroll.status === 'CALCULATED' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {payroll.status}
          </span>
        </div>

        {/* Totalizadores */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-green-50 p-4 rounded">
            <p className="text-sm text-gray-600">Total Proventos</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(payroll.totalEarnings)}
            </p>
          </div>
          <div className="bg-red-50 p-4 rounded">
            <p className="text-sm text-gray-600">Total Descontos</p>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(payroll.totalDeductions)}
            </p>
          </div>
          <div className="bg-blue-50 p-4 rounded">
            <p className="text-sm text-gray-600">Valor Líquido</p>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(payroll.netAmount)}
            </p>
          </div>
        </div>

        {/* Ações */}
        <div className="flex gap-3 mt-6">
          {payroll.status === 'DRAFT' && (
            <button
              onClick={calculate}
              className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Calcular Folha
            </button>
          )}
          {payroll.status === 'CALCULATED' && (
            <button
              onClick={approve}
              className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Aprovar Folha
            </button>
          )}
          {payroll.status === 'APPROVED' && (
            <button
              onClick={markAsPaid}
              className="px-6 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              Marcar como Paga
            </button>
          )}
          <button
            onClick={downloadPDF}
            className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Baixar PDF Consolidado
          </button>
        </div>
      </div>

      {/* Lista de Colaboradores */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Colaboradores</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Colaborador</th>
                <th className="px-4 py-2 text-left">Cargo</th>
                <th className="px-4 py-2 text-center">Dias</th>
                <th className="px-4 py-2 text-right">Proventos</th>
                <th className="px-4 py-2 text-right">Descontos</th>
                <th className="px-4 py-2 text-right">Líquido</th>
                <th className="px-4 py-2 text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {payroll.items?.map((item) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{item.employee.name}</td>
                  <td className="px-4 py-3">{item.employee.position?.name || '-'}</td>
                  <td className="px-4 py-3 text-center">{item.workDays}</td>
                  <td className="px-4 py-3 text-right text-green-600">
                    {formatCurrency(item.totalEarnings)}
                  </td>
                  <td className="px-4 py-3 text-right text-red-600">
                    {formatCurrency(item.totalDeductions)}
                  </td>
                  <td className="px-4 py-3 text-right font-bold">
                    {formatCurrency(item.netAmount)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleDownloadPayslip(item.id, item.employee.name)}
                      className="text-blue-600 hover:underline"
                    >
                      Holerite
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PayrollDetails;
```

---

## Next.js

### API Routes (Server-Side)

```typescript
// pages/api/payroll/[id].ts

import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Não autenticado' });
  }

  try {
    const response = await axios.get(
      `http://localhost:3000/payroll/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    res.status(200).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.message || 'Erro ao buscar folha'
    });
  }
}
```

### Server Component (App Router)

```typescript
// app/payroll/[id]/page.tsx

import { Suspense } from 'react';
import PayrollDetails from '@/components/PayrollDetails';

async function getPayroll(id: string) {
  const res = await fetch(`http://localhost:3000/payroll/${id}`, {
    headers: {
      Authorization: `Bearer ${process.env.API_TOKEN}`
    },
    cache: 'no-store'
  });

  if (!res.ok) throw new Error('Failed to fetch payroll');
  return res.json();
}

export default async function PayrollPage({ params }: { params: { id: string } }) {
  const payroll = await getPayroll(params.id);

  return (
    <div>
      <Suspense fallback={<div>Carregando...</div>}>
        <PayrollDetails payroll={payroll} />
      </Suspense>
    </div>
  );
}
```

---

## Vue.js

### Composable

```typescript
// composables/usePayroll.ts

import { ref, onMounted } from 'vue';
import axios from 'axios';

export const usePayroll = (payrollId?: string) => {
  const payroll = ref(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchPayroll = async () => {
    if (!payrollId) return;

    loading.value = true;
    error.value = null;

    try {
      const response = await axios.get(`/payroll/${payrollId}`);
      payroll.value = response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao buscar folha';
    } finally {
      loading.value = false;
    }
  };

  const calculate = async () => {
    if (!payrollId) return;

    loading.value = true;
    error.value = null;

    try {
      await axios.post(`/payroll/${payrollId}/calculate`);
      await fetchPayroll();
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao calcular';
    } finally {
      loading.value = false;
    }
  };

  const downloadPDF = async () => {
    if (!payrollId) return;

    try {
      const response = await axios.get(`/payroll/${payrollId}/pdf`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `folha-${payrollId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
      error.value = 'Erro ao baixar PDF';
    }
  };

  onMounted(() => {
    fetchPayroll();
  });

  return {
    payroll,
    loading,
    error,
    calculate,
    downloadPDF,
    refresh: fetchPayroll
  };
};
```

### Component

```vue
<!-- components/PayrollCard.vue -->

<template>
  <div class="payroll-card">
    <div class="header">
      <h3>{{ monthName }}/{{ payroll.referenceYear }}</h3>
      <span :class="['status-badge', statusClass]">
        {{ statusText }}
      </span>
    </div>

    <div class="details">
      <div class="detail-row">
        <span>Valor Líquido:</span>
        <strong>{{ formatCurrency(payroll.netAmount) }}</strong>
      </div>
      <div class="detail-row">
        <span>Colaboradores:</span>
        <strong>{{ payroll.items?.length || 0 }}</strong>
      </div>
    </div>

    <div class="actions">
      <button @click="$emit('view', payroll.id)" class="btn btn-primary">
        Ver Detalhes
      </button>
      <button @click="$emit('download', payroll.id)" class="btn btn-success">
        Baixar PDF
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  payroll: any;
}

const props = defineProps<Props>();
const emit = defineEmits(['view', 'download']);

const monthName = computed(() => {
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return months[props.payroll.referenceMonth - 1];
});

const statusClass = computed(() => {
  const classes = {
    DRAFT: 'status-draft',
    CALCULATED: 'status-calculated',
    APPROVED: 'status-approved',
    PAID: 'status-paid'
  };
  return classes[props.payroll.status] || 'status-draft';
});

const statusText = computed(() => {
  const texts = {
    DRAFT: 'Rascunho',
    CALCULATED: 'Calculada',
    APPROVED: 'Aprovada',
    PAID: 'Paga'
  };
  return texts[props.payroll.status] || props.payroll.status;
});

const formatCurrency = (value: string) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(parseFloat(value));
};
</script>
```

---

## Angular

### Service

```typescript
// services/payroll.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Payroll {
  id: string;
  referenceMonth: number;
  referenceYear: number;
  status: string;
  totalEarnings: string;
  totalDeductions: string;
  netAmount: string;
}

@Injectable({
  providedIn: 'root'
})
export class PayrollService {
  private apiUrl = 'http://localhost:3000/payroll';

  constructor(private http: HttpClient) {}

  list(filters?: any): Observable<any> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined) {
          params = params.set(key, filters[key].toString());
        }
      });
    }
    return this.http.get(this.apiUrl, { params });
  }

  getById(id: string): Observable<Payroll> {
    return this.http.get<Payroll>(`${this.apiUrl}/${id}`);
  }

  create(data: any): Observable<Payroll> {
    return this.http.post<Payroll>(this.apiUrl, data);
  }

  calculate(id: string): Observable<Payroll> {
    return this.http.post<Payroll>(`${this.apiUrl}/${id}/calculate`, {});
  }

  approve(id: string): Observable<Payroll> {
    return this.http.post<Payroll>(`${this.apiUrl}/${id}/approve`, {});
  }

  downloadPayslip(payrollId: string, itemId: string): void {
    this.http.get(`${this.apiUrl}/${payrollId}/items/${itemId}/payslip`, {
      responseType: 'blob'
    }).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `holerite-${itemId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    });
  }

  downloadPayrollPDF(payrollId: string): void {
    this.http.get(`${this.apiUrl}/${payrollId}/pdf`, {
      responseType: 'blob'
    }).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `folha-${payrollId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    });
  }
}
```

### Component

```typescript
// components/payroll-list/payroll-list.component.ts

import { Component, OnInit } from '@angular/core';
import { PayrollService, Payroll } from '../../services/payroll.service';

@Component({
  selector: 'app-payroll-list',
  templateUrl: './payroll-list.component.html',
  styleUrls: ['./payroll-list.component.css']
})
export class PayrollListComponent implements OnInit {
  payrolls: Payroll[] = [];
  loading = false;
  error: string | null = null;

  constructor(private payrollService: PayrollService) {}

  ngOnInit(): void {
    this.loadPayrolls();
  }

  loadPayrolls(): void {
    this.loading = true;
    this.payrollService.list().subscribe({
      next: (response) => {
        this.payrolls = response.data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message;
        this.loading = false;
      }
    });
  }

  downloadPDF(payrollId: string): void {
    this.payrollService.downloadPayrollPDF(payrollId);
  }
}
```

---

## React Native

```typescript
// services/payroll.service.ts

import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

class PayrollService {
  private baseUrl = 'http://localhost:3000/payroll';

  async downloadPayslip(payrollId: string, itemId: string, token: string) {
    try {
      const fileUri = `${FileSystem.documentDirectory}holerite-${itemId}.pdf`;
      
      const downloadResult = await FileSystem.downloadAsync(
        `${this.baseUrl}/${payrollId}/items/${itemId}/payslip`,
        fileUri,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (downloadResult.status === 200) {
        await Sharing.shareAsync(downloadResult.uri);
      }
    } catch (error) {
      console.error('Erro ao baixar holerite:', error);
      throw error;
    }
  }
}

export default new PayrollService();
```

---

## Node.js Backend

```typescript
// Proxy/Gateway para frontend

import express from 'express';
import axios from 'axios';

const app = express();

app.get('/api/payroll/:id/pdf', async (req, res) => {
  try {
    const { id } = req.params;
    const token = req.headers.authorization;

    const response = await axios.get(
      `http://localhost:3000/payroll/${id}/pdf`,
      {
        headers: { Authorization: token },
        responseType: 'stream'
      }
    );

    response.data.pipe(res);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao baixar PDF' });
  }
});
```

---

**Documentação criada em:** 09 de novembro de 2024
