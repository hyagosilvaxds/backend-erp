# Horário de Trabalho Estruturado

## Visão Geral

O sistema agora suporta horários de trabalho estruturados por dia da semana, permitindo definir:
- Horário de entrada e saída
- Intervalos de descanso/almoço
- Dias de trabalho e folgas
- Cálculo automático de horas semanais

## Estrutura do Horário de Trabalho

### Formato JSON

```typescript
interface DaySchedule {
  isWorkDay: boolean;        // Se trabalha neste dia
  startTime?: string;        // Horário entrada (HH:mm)
  endTime?: string;          // Horário saída (HH:mm)
  breakStartTime?: string;   // Início intervalo (HH:mm)
  breakEndTime?: string;     // Fim intervalo (HH:mm)
  notes?: string;            // Observações
}

interface WorkSchedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
  weeklyHours?: number;      // Total horas semanais
  generalNotes?: string;     // Observações gerais
}
```

## Exemplos de Uso

### 1. Jornada Comercial (44h - Seg a Sex)

```json
{
  "monday": {
    "isWorkDay": true,
    "startTime": "08:00",
    "endTime": "18:00",
    "breakStartTime": "12:00",
    "breakEndTime": "13:00"
  },
  "tuesday": {
    "isWorkDay": true,
    "startTime": "08:00",
    "endTime": "18:00",
    "breakStartTime": "12:00",
    "breakEndTime": "13:00"
  },
  "wednesday": {
    "isWorkDay": true,
    "startTime": "08:00",
    "endTime": "18:00",
    "breakStartTime": "12:00",
    "breakEndTime": "13:00"
  },
  "thursday": {
    "isWorkDay": true,
    "startTime": "08:00",
    "endTime": "18:00",
    "breakStartTime": "12:00",
    "breakEndTime": "13:00"
  },
  "friday": {
    "isWorkDay": true,
    "startTime": "08:00",
    "endTime": "18:00",
    "breakStartTime": "12:00",
    "breakEndTime": "13:00"
  },
  "saturday": {
    "isWorkDay": false
  },
  "sunday": {
    "isWorkDay": false
  },
  "weeklyHours": 44,
  "generalNotes": "Jornada comercial padrão - 44h semanais"
}
```

### 2. Escala 6x1 (Trabalha Sábado)

```json
{
  "monday": {
    "isWorkDay": true,
    "startTime": "08:00",
    "endTime": "17:00",
    "breakStartTime": "12:00",
    "breakEndTime": "13:00"
  },
  "tuesday": {
    "isWorkDay": true,
    "startTime": "08:00",
    "endTime": "17:00",
    "breakStartTime": "12:00",
    "breakEndTime": "13:00"
  },
  "wednesday": {
    "isWorkDay": true,
    "startTime": "08:00",
    "endTime": "17:00",
    "breakStartTime": "12:00",
    "breakEndTime": "13:00"
  },
  "thursday": {
    "isWorkDay": true,
    "startTime": "08:00",
    "endTime": "17:00",
    "breakStartTime": "12:00",
    "breakEndTime": "13:00"
  },
  "friday": {
    "isWorkDay": true,
    "startTime": "08:00",
    "endTime": "17:00",
    "breakStartTime": "12:00",
    "breakEndTime": "13:00"
  },
  "saturday": {
    "isWorkDay": true,
    "startTime": "08:00",
    "endTime": "14:00"
  },
  "sunday": {
    "isWorkDay": false
  },
  "weeklyHours": 44,
  "generalNotes": "Escala 6x1 - folga rotativa no domingo"
}
```

### 3. Horário Flexível/Home Office

```json
{
  "monday": {
    "isWorkDay": true,
    "startTime": "09:00",
    "endTime": "18:00",
    "breakStartTime": "12:00",
    "breakEndTime": "13:00",
    "notes": "Home office"
  },
  "tuesday": {
    "isWorkDay": true,
    "startTime": "09:00",
    "endTime": "18:00",
    "breakStartTime": "12:00",
    "breakEndTime": "13:00",
    "notes": "Presencial"
  },
  "wednesday": {
    "isWorkDay": true,
    "startTime": "09:00",
    "endTime": "18:00",
    "breakStartTime": "12:00",
    "breakEndTime": "13:00",
    "notes": "Home office"
  },
  "thursday": {
    "isWorkDay": true,
    "startTime": "09:00",
    "endTime": "18:00",
    "breakStartTime": "12:00",
    "breakEndTime": "13:00",
    "notes": "Presencial"
  },
  "friday": {
    "isWorkDay": true,
    "startTime": "09:00",
    "endTime": "18:00",
    "breakStartTime": "12:00",
    "breakEndTime": "13:00",
    "notes": "Home office"
  },
  "saturday": {
    "isWorkDay": false
  },
  "sunday": {
    "isWorkDay": false
  },
  "weeklyHours": 40,
  "generalNotes": "Regime híbrido - 3 dias home office, 2 dias presencial"
}
```

### 4. Meio Período (20h semanais)

```json
{
  "monday": {
    "isWorkDay": true,
    "startTime": "08:00",
    "endTime": "12:00"
  },
  "tuesday": {
    "isWorkDay": true,
    "startTime": "08:00",
    "endTime": "12:00"
  },
  "wednesday": {
    "isWorkDay": true,
    "startTime": "08:00",
    "endTime": "12:00"
  },
  "thursday": {
    "isWorkDay": true,
    "startTime": "08:00",
    "endTime": "12:00"
  },
  "friday": {
    "isWorkDay": true,
    "startTime": "08:00",
    "endTime": "12:00"
  },
  "saturday": {
    "isWorkDay": false
  },
  "sunday": {
    "isWorkDay": false
  },
  "weeklyHours": 20,
  "generalNotes": "Meio período - 4 horas diárias"
}
```

### 5. Jornada 12x36 (Plantão)

```json
{
  "monday": {
    "isWorkDay": true,
    "startTime": "07:00",
    "endTime": "19:00"
  },
  "tuesday": {
    "isWorkDay": false
  },
  "wednesday": {
    "isWorkDay": true,
    "startTime": "07:00",
    "endTime": "19:00"
  },
  "thursday": {
    "isWorkDay": false
  },
  "friday": {
    "isWorkDay": true,
    "startTime": "07:00",
    "endTime": "19:00"
  },
  "saturday": {
    "isWorkDay": false
  },
  "sunday": {
    "isWorkDay": true,
    "startTime": "07:00",
    "endTime": "19:00"
  },
  "weeklyHours": 48,
  "generalNotes": "Escala 12x36 - plantão de 12 horas com 36h de descanso"
}
```

## API - Criar Colaborador com Horário Estruturado

### Endpoint

```
POST /employees
```

### Request Body

```json
{
  "name": "João Silva",
  "cpf": "12345678900",
  "email": "joao@empresa.com",
  "positionId": "position-uuid",
  "departmentId": "department-uuid",
  "admissionDate": "2025-01-15",
  "contractType": "CLT",
  "salary": 5000.00,
  "workSchedule": {
    "monday": {
      "isWorkDay": true,
      "startTime": "08:00",
      "endTime": "18:00",
      "breakStartTime": "12:00",
      "breakEndTime": "13:00"
    },
    "tuesday": {
      "isWorkDay": true,
      "startTime": "08:00",
      "endTime": "18:00",
      "breakStartTime": "12:00",
      "breakEndTime": "13:00"
    },
    "wednesday": {
      "isWorkDay": true,
      "startTime": "08:00",
      "endTime": "18:00",
      "breakStartTime": "12:00",
      "breakEndTime": "13:00"
    },
    "thursday": {
      "isWorkDay": true,
      "startTime": "08:00",
      "endTime": "18:00",
      "breakStartTime": "12:00",
      "breakEndTime": "13:00"
    },
    "friday": {
      "isWorkDay": true,
      "startTime": "08:00",
      "endTime": "18:00",
      "breakStartTime": "12:00",
      "breakEndTime": "13:00"
    },
    "saturday": {
      "isWorkDay": false
    },
    "sunday": {
      "isWorkDay": false
    },
    "weeklyHours": 44,
    "generalNotes": "Jornada comercial padrão"
  }
}
```

## Validações

O sistema valida automaticamente:

1. **Formato de horário**: Deve estar no formato `HH:mm` (ex: "08:00", "18:30")
2. **Horário de saída**: Deve ser depois do horário de entrada
3. **Intervalo**: Se informado, deve estar entre entrada e saída
4. **Fim do intervalo**: Deve ser depois do início do intervalo
5. **Dias úteis**: Horários são obrigatórios apenas se `isWorkDay = true`

### Exemplo de Validação

```typescript
import { validateWorkSchedule } from './types/work-schedule.types';

const schedule = { /* ... */ };
const validation = validateWorkSchedule(schedule);

if (!validation.valid) {
  console.log('Erros encontrados:');
  validation.errors.forEach(error => console.log(error));
}
```

## Utilitários Disponíveis

### Calcular Horas de um Dia

```typescript
import { calculateDayHours } from './types/work-schedule.types';

const hours = calculateDayHours({
  isWorkDay: true,
  startTime: "08:00",
  endTime: "18:00",
  breakStartTime: "12:00",
  breakEndTime: "13:00"
});

console.log(hours); // 9 horas (10 - 1 de intervalo)
```

### Calcular Horas Semanais

```typescript
import { calculateWeeklyHours } from './types/work-schedule.types';

const weeklyHours = calculateWeeklyHours(schedule);
console.log(weeklyHours); // Ex: 44
```

### Horários Pré-definidos

```typescript
import { 
  COMMERCIAL_SCHEDULE, 
  SIX_BY_ONE_SCHEDULE 
} from './types/work-schedule.types';

// Usar horário comercial padrão
const employee = {
  // ...outros campos
  workSchedule: COMMERCIAL_SCHEDULE
};
```

## Migração de Dados Existentes

Colaboradores existentes com `workSchedule` em formato string terão o valor como `null` após a migração. Para migrar:

1. **Manualmente**: Editar cada colaborador e definir o horário estruturado
2. **Script**: Criar script de migração para converter strings antigas

### Exemplo de Script de Migração

```typescript
// Converter "08:00-17:00 (Seg-Sex)" para formato estruturado
const oldSchedule = "08:00-17:00 (Seg-Sex)";

const newSchedule = {
  monday: { isWorkDay: true, startTime: "08:00", endTime: "17:00" },
  tuesday: { isWorkDay: true, startTime: "08:00", endTime: "17:00" },
  wednesday: { isWorkDay: true, startTime: "08:00", endTime: "17:00" },
  thursday: { isWorkDay: true, startTime: "08:00", endTime: "17:00" },
  friday: { isWorkDay: true, startTime: "08:00", endTime: "17:00" },
  saturday: { isWorkDay: false },
  sunday: { isWorkDay: false },
  weeklyHours: 40,
};
```

## Frontend - Sugestões de Interface

### 1. Visualização Simplificada

Mostrar resumo do horário:
```
Segunda a Sexta: 08:00 - 18:00 (1h de intervalo)
Sábado e Domingo: Folga
Total: 44h semanais
```

### 2. Editor Detalhado

Grid com 7 linhas (dias da semana) e colunas:
- ✅ Trabalha neste dia?
- 🕐 Entrada
- 🕐 Saída
- ☕ Intervalo início
- ☕ Intervalo fim
- 📝 Observações

### 3. Templates Rápidos

Botões para aplicar horários pré-definidos:
- 📋 Comercial (44h)
- 📋 6x1 (44h)
- 📋 Meio período (20h)
- 📋 12x36 (Plantão)

## Benefícios

✅ **Precisão**: Horários exatos por dia  
✅ **Flexibilidade**: Suporta qualquer tipo de jornada  
✅ **Cálculos**: Total de horas calculado automaticamente  
✅ **Relatórios**: Fácil gerar relatórios de horas trabalhadas  
✅ **Ponto Eletrônico**: Integração futura com controle de ponto  
✅ **Horas Extras**: Base para cálculo de horas extras  
✅ **Conformidade**: Facilita compliance trabalhista  

---

**Atualizado em**: 8 de novembro de 2025  
**Versão**: 1.0
