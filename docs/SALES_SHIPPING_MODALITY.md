# Modalidade de Frete em Vendas - Implementação Frontend

## 📋 Visão Geral

Este documento descreve como implementar a seleção de modalidade de frete ao criar ou editar vendas no sistema. A modalidade de frete é um campo obrigatório para emissão de NFe e define quem é responsável pelo transporte da mercadoria.

---

## 🎯 Códigos SEFAZ de Modalidade de Frete

A SEFAZ define os seguintes códigos para modalidade de frete:

| Código | Descrição | Uso Comum |
|--------|-----------|-----------|
| **0** | Por conta do Emitente | Vendedor responsável pelo frete (CIF) |
| **1** | Por conta do Destinatário | Comprador responsável pelo frete (FOB) |
| **2** | Por conta de Terceiros | Transportadora contratada por terceiros |
| **3** | Transporte Próprio por conta do Emitente | Frota própria do vendedor |
| **4** | Transporte Próprio por conta do Destinatário | Frota própria do comprador |
| **9** | Sem Frete | Venda sem transporte (ex: retirada no local) |

### 📝 Observações Importantes

- **Código 9 (Sem Frete)**: Use quando não houver transporte de mercadoria (ex: venda para retirada no local, produtos digitais)
- **Códigos 3 e 4**: Use apenas quando houver transporte com veículo próprio (não transportadora)
- **Valor Padrão**: Se não informado, o sistema usa código **9** (Sem Frete)

---

## 🔌 Endpoints da API

### 1. Criar Venda com Modalidade de Frete

**Endpoint**: `POST /api/sales`

**Headers**:
```http
Authorization: Bearer {token}
Content-Type: application/json
```

**Body**:
```json
{
  "customerId": "uuid-do-cliente",
  "status": "QUOTE",
  "shippingCost": 50.00,
  "shippingModality": 0,
  "items": [
    {
      "productId": "uuid-do-produto",
      "quantity": 2,
      "unitPrice": 100.00,
      "discount": 0
    }
  ]
}
```

**Resposta (201 Created)**:
```json
{
  "id": "sale-uuid",
  "code": "VND-00001",
  "companyId": "company-uuid",
  "customerId": "customer-uuid",
  "status": "QUOTE",
  "subtotal": 200.00,
  "discountAmount": 0,
  "discountPercent": 0,
  "shippingCost": 50.00,
  "shippingModality": 0,
  "otherCharges": 0,
  "totalAmount": 250.00,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

---

### 2. Atualizar Modalidade de Frete

**Endpoint**: `PATCH /api/sales/{id}`

**Body**:
```json
{
  "shippingModality": 1
}
```

**Resposta (200 OK)**:
```json
{
  "id": "sale-uuid",
  "shippingModality": 1,
  "updatedAt": "2024-01-15T11:00:00Z"
}
```

---

### 3. Criar NFe a partir da Venda

**Endpoint**: `POST /api/nfe/from-sale`

Quando você cria uma NFe a partir de uma venda, a modalidade de frete é automaticamente copiada da venda. Você pode sobrescrevê-la se necessário:

**Body**:
```json
{
  "saleId": "sale-uuid",
  "serie": "1",
  "naturezaOperacao": "Venda de mercadoria",
  "modalidadeFrete": 0  // Opcional: sobrescreve a modalidade da venda
}
```

---

## 💻 Implementação Frontend

### React/Next.js - Componente de Seleção

```typescript
import React from 'react';

// Constante com as opções de modalidade de frete
export const SHIPPING_MODALITY_OPTIONS = [
  { value: 0, label: 'Por conta do Emitente (CIF)', icon: '🏢' },
  { value: 1, label: 'Por conta do Destinatário (FOB)', icon: '👤' },
  { value: 2, label: 'Por conta de Terceiros', icon: '🚛' },
  { value: 3, label: 'Transporte Próprio - Emitente', icon: '🚚' },
  { value: 4, label: 'Transporte Próprio - Destinatário', icon: '🚙' },
  { value: 9, label: 'Sem Frete', icon: '🏪' },
];

interface ShippingModalitySelectProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export const ShippingModalitySelect: React.FC<ShippingModalitySelectProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="form-group">
      <label htmlFor="shippingModality" className="form-label">
        Modalidade de Frete *
      </label>
      <select
        id="shippingModality"
        className="form-select"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
      >
        {SHIPPING_MODALITY_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.icon} {option.label}
          </option>
        ))}
      </select>
      <small className="form-text text-muted">
        Define quem é responsável pelo transporte da mercadoria
      </small>
    </div>
  );
};
```

---

### Integração no Formulário de Venda

```typescript
import { useState } from 'react';
import { ShippingModalitySelect, SHIPPING_MODALITY_OPTIONS } from './ShippingModalitySelect';

interface SaleFormData {
  customerId: string;
  shippingCost: number;
  shippingModality: number;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
  }>;
}

export const SaleForm: React.FC = () => {
  const [formData, setFormData] = useState<SaleFormData>({
    customerId: '',
    shippingCost: 0,
    shippingModality: 9, // Padrão: Sem frete
    items: [],
  });

  const handleShippingModalityChange = (value: number) => {
    setFormData((prev) => ({
      ...prev,
      shippingModality: value,
      // Se mudar para "Sem Frete", zerar o valor do frete
      shippingCost: value === 9 ? 0 : prev.shippingCost,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar venda');
      }

      const sale = await response.json();
      console.log('Venda criada:', sale);
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Outros campos do formulário */}
      
      <div className="row">
        <div className="col-md-6">
          <div className="form-group">
            <label htmlFor="shippingCost">Valor do Frete</label>
            <input
              type="number"
              id="shippingCost"
              className="form-control"
              value={formData.shippingCost}
              onChange={(e) => setFormData({ ...formData, shippingCost: parseFloat(e.target.value) || 0 })}
              min="0"
              step="0.01"
              disabled={formData.shippingModality === 9}
            />
          </div>
        </div>

        <div className="col-md-6">
          <ShippingModalitySelect
            value={formData.shippingModality}
            onChange={handleShippingModalityChange}
          />
        </div>
      </div>

      <button type="submit" className="btn btn-primary">
        Criar Venda
      </button>
    </form>
  );
};
```

---

### Vue.js 3 - Composable

```typescript
// composables/useShippingModality.ts
import { ref, computed } from 'vue';

export interface ShippingModalityOption {
  value: number;
  label: string;
  icon: string;
  description: string;
}

export const SHIPPING_MODALITY_OPTIONS: ShippingModalityOption[] = [
  {
    value: 0,
    label: 'Por conta do Emitente',
    icon: '🏢',
    description: 'Vendedor paga o frete (CIF)',
  },
  {
    value: 1,
    label: 'Por conta do Destinatário',
    icon: '👤',
    description: 'Comprador paga o frete (FOB)',
  },
  {
    value: 2,
    label: 'Por conta de Terceiros',
    icon: '🚛',
    description: 'Transportadora contratada por terceiros',
  },
  {
    value: 3,
    label: 'Transporte Próprio - Emitente',
    icon: '🚚',
    description: 'Frota própria do vendedor',
  },
  {
    value: 4,
    label: 'Transporte Próprio - Destinatário',
    icon: '🚙',
    description: 'Frota própria do comprador',
  },
  {
    value: 9,
    label: 'Sem Frete',
    icon: '🏪',
    description: 'Retirada no local ou sem transporte',
  },
];

export function useShippingModality() {
  const shippingModality = ref(9); // Padrão: Sem frete
  
  const selectedOption = computed(() => 
    SHIPPING_MODALITY_OPTIONS.find(opt => opt.value === shippingModality.value)
  );

  const shouldDisableShippingCost = computed(() => 
    shippingModality.value === 9
  );

  return {
    shippingModality,
    selectedOption,
    shouldDisableShippingCost,
    SHIPPING_MODALITY_OPTIONS,
  };
}
```

```vue
<!-- components/ShippingModalitySelect.vue -->
<template>
  <div class="form-group">
    <label for="shippingModality" class="form-label">
      Modalidade de Frete *
    </label>
    <select
      id="shippingModality"
      v-model="modelValue"
      class="form-select"
      :disabled="disabled"
      @change="$emit('update:modelValue', Number($event.target.value))"
    >
      <option
        v-for="option in SHIPPING_MODALITY_OPTIONS"
        :key="option.value"
        :value="option.value"
      >
        {{ option.icon }} {{ option.label }}
      </option>
    </select>
    <small v-if="selectedOption" class="form-text text-muted">
      {{ selectedOption.description }}
    </small>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { SHIPPING_MODALITY_OPTIONS } from '@/composables/useShippingModality';

interface Props {
  modelValue: number;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
});

defineEmits<{
  'update:modelValue': [value: number];
}>();

const selectedOption = computed(() => 
  SHIPPING_MODALITY_OPTIONS.find(opt => opt.value === props.modelValue)
);
</script>
```

---

### Angular - Component

```typescript
// shipping-modality.constants.ts
export interface ShippingModalityOption {
  value: number;
  label: string;
  icon: string;
  description: string;
}

export const SHIPPING_MODALITY_OPTIONS: ShippingModalityOption[] = [
  {
    value: 0,
    label: 'Por conta do Emitente',
    icon: '🏢',
    description: 'Vendedor paga o frete (CIF)',
  },
  {
    value: 1,
    label: 'Por conta do Destinatário',
    icon: '👤',
    description: 'Comprador paga o frete (FOB)',
  },
  {
    value: 2,
    label: 'Por conta de Terceiros',
    icon: '🚛',
    description: 'Transportadora contratada por terceiros',
  },
  {
    value: 3,
    label: 'Transporte Próprio - Emitente',
    icon: '🚚',
    description: 'Frota própria do vendedor',
  },
  {
    value: 4,
    label: 'Transporte Próprio - Destinatário',
    icon: '🚙',
    description: 'Frota própria do comprador',
  },
  {
    value: 9,
    label: 'Sem Frete',
    icon: '🏪',
    description: 'Retirada no local ou sem transporte',
  },
];
```

```typescript
// shipping-modality-select.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { SHIPPING_MODALITY_OPTIONS, ShippingModalityOption } from './shipping-modality.constants';

@Component({
  selector: 'app-shipping-modality-select',
  template: `
    <div class="form-group">
      <label for="shippingModality" class="form-label">
        Modalidade de Frete *
      </label>
      <select
        id="shippingModality"
        class="form-select"
        [value]="value"
        [disabled]="disabled"
        (change)="onModalityChange($event)"
      >
        <option *ngFor="let option of options" [value]="option.value">
          {{ option.icon }} {{ option.label }}
        </option>
      </select>
      <small *ngIf="selectedOption" class="form-text text-muted">
        {{ selectedOption.description }}
      </small>
    </div>
  `,
})
export class ShippingModalitySelectComponent {
  @Input() value: number = 9;
  @Input() disabled: boolean = false;
  @Output() valueChange = new EventEmitter<number>();

  options = SHIPPING_MODALITY_OPTIONS;

  get selectedOption(): ShippingModalityOption | undefined {
    return this.options.find(opt => opt.value === this.value);
  }

  onModalityChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const value = Number(target.value);
    this.valueChange.emit(value);
  }
}
```

---

## 🎨 Boas Práticas de UX

### 1. Valor Padrão Inteligente

```typescript
// Sugerir modalidade baseado no contexto
function getDefaultShippingModality(
  hasShippingCost: boolean,
  customerType: 'local' | 'remote'
): number {
  if (!hasShippingCost) return 9; // Sem frete
  if (customerType === 'local') return 9; // Cliente local = retirada
  return 1; // Cliente distante = destinatário paga
}
```

### 2. Validação Condicional

```typescript
// Validar consistência entre valor do frete e modalidade
function validateShipping(shippingCost: number, modality: number): string | null {
  // Se modalidade for "Sem Frete", valor deve ser 0
  if (modality === 9 && shippingCost > 0) {
    return 'Valor do frete deve ser R$ 0,00 quando modalidade é "Sem Frete"';
  }

  // Se modalidade for diferente de "Sem Frete" e valor > 0, avisar que destinatário pode pagar
  if (modality === 1 && shippingCost > 0) {
    return 'Atenção: O valor do frete será pago pelo destinatário';
  }

  return null;
}
```

### 3. Feedback Visual

```typescript
// Mostrar alertas baseado na modalidade selecionada
const getModalityAlert = (modality: number) => {
  switch (modality) {
    case 0:
      return {
        type: 'info',
        message: '💡 Sua empresa será responsável pelo pagamento do frete',
      };
    case 1:
      return {
        type: 'warning',
        message: '⚠️ O cliente pagará o frete diretamente à transportadora',
      };
    case 9:
      return {
        type: 'success',
        message: '✅ Produto será retirado no local, sem custo de frete',
      };
    default:
      return null;
  }
};
```

---

## 📊 Exemplo Completo: Fluxo de Venda

### 1. Criar Venda com Frete

```bash
curl -X POST https://api.seudominio.com.br/api/sales \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "customer-uuid",
    "status": "QUOTE",
    "shippingCost": 85.50,
    "shippingModality": 0,
    "items": [
      {
        "productId": "product-uuid",
        "quantity": 5,
        "unitPrice": 129.90
      }
    ]
  }'
```

### 2. Converter Orçamento em Venda

```bash
curl -X PATCH https://api.seudominio.com.br/api/sales/{id} \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "CONFIRMED"
  }'
```

### 3. Emitir NFe da Venda

```bash
curl -X POST https://api.seudominio.com.br/api/nfe/from-sale \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "saleId": "sale-uuid",
    "serie": "1",
    "naturezaOperacao": "Venda de mercadoria"
  }'
```

> **Nota**: A modalidade de frete será automaticamente copiada da venda para a NFe.

---

## 🔍 Cenários de Uso

### Cenário 1: Venda com Frete CIF (Emitente Paga)

```json
{
  "customerId": "customer-uuid",
  "shippingCost": 50.00,
  "shippingModality": 0,  // Por conta do Emitente
  "items": [...]
}
```

**Resultado**: 
- Frete de R$ 50,00 é pago pela empresa vendedora
- NFe emitida com modalidade de frete = 0
- Total da venda inclui o valor do frete

---

### Cenário 2: Venda com Frete FOB (Destinatário Paga)

```json
{
  "customerId": "customer-uuid",
  "shippingCost": 75.00,
  "shippingModality": 1,  // Por conta do Destinatário
  "items": [...]
}
```

**Resultado**: 
- Cliente pagará R$ 75,00 diretamente à transportadora
- NFe emitida com modalidade de frete = 1
- Total da venda pode ou não incluir o valor (depende da negociação)

---

### Cenário 3: Venda para Retirada (Sem Frete)

```json
{
  "customerId": "customer-uuid",
  "shippingCost": 0,
  "shippingModality": 9,  // Sem Frete
  "items": [...]
}
```

**Resultado**: 
- Não há cobrança de frete
- NFe emitida com modalidade de frete = 9
- Cliente retira pessoalmente na loja/empresa

---

## ⚠️ Validações e Erros

### Erros Comuns

**1. Modalidade inválida**
```json
{
  "statusCode": 400,
  "message": "shippingModality deve ser um número entre 0-4 ou 9"
}
```

**2. Inconsistência entre frete e modalidade**
```json
{
  "statusCode": 400,
  "message": "Valor do frete deve ser 0 quando modalidade é 'Sem Frete'"
}
```

---

## 🧪 Testes

### Teste 1: Criar Venda com Modalidade Padrão

```typescript
describe('ShippingModality', () => {
  it('should use default modality 9 when not specified', async () => {
    const sale = await createSale({
      customerId: 'customer-uuid',
      items: [{ productId: 'product-uuid', quantity: 1, unitPrice: 100 }],
    });

    expect(sale.shippingModality).toBe(9);
  });
});
```

### Teste 2: Validar Consistência

```typescript
it('should validate shipping cost matches modality', async () => {
  const result = await createSale({
    customerId: 'customer-uuid',
    shippingCost: 50,
    shippingModality: 9, // Sem frete
    items: [{ productId: 'product-uuid', quantity: 1, unitPrice: 100 }],
  });

  // Deve permitir mas pode gerar warning
  expect(result).toBeDefined();
});
```

### Teste 3: Propagar para NFe

```typescript
it('should copy shippingModality from sale to NFe', async () => {
  const sale = await createSale({
    customerId: 'customer-uuid',
    shippingModality: 0,
    items: [{ productId: 'product-uuid', quantity: 1, unitPrice: 100 }],
  });

  const nfe = await createNfeFromSale({ saleId: sale.id, serie: '1' });

  expect(nfe.modalidadeFrete).toBe(0);
});
```

---

## 📚 Referências

- [Manual de Orientação do Contribuinte - NFe SEFAZ](http://www.nfe.fazenda.gov.br/portal/principal.aspx)
- [Modalidades de Frete - Documentação SEFAZ](http://www.nfe.fazenda.gov.br/portal/exibirArquivo.aspx?conteudo=4fXqvVrjBz8=)

---

## 🆘 Suporte

Se você encontrar problemas ou tiver dúvidas sobre a implementação:

1. Verifique se o campo `shippingModality` está sendo enviado corretamente na requisição
2. Confirme que o valor é um número (não string) entre 0-4 ou 9
3. Valide que o valor do frete (`shippingCost`) é consistente com a modalidade escolhida
4. Consulte os logs do backend para detalhes de erros de validação

---

**Última atualização**: 16 de novembro de 2024  
**Versão da API**: 1.0  
**Status**: ✅ Implementado e Testado
