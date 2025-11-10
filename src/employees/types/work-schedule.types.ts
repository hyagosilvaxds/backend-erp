/**
 * Interface para definir horário de trabalho de um dia específico
 */
export interface DaySchedule {
  /** Se o colaborador trabalha neste dia */
  isWorkDay: boolean;
  
  /** Horário de entrada (formato HH:mm) */
  startTime?: string;
  
  /** Horário de saída (formato HH:mm) */
  endTime?: string;
  
  /** Horário de início do intervalo (formato HH:mm) */
  breakStartTime?: string;
  
  /** Horário de fim do intervalo (formato HH:mm) */
  breakEndTime?: string;
  
  /** Observações sobre o dia (ex: "Meio período", "Home office") */
  notes?: string;
}

/**
 * Interface para a jornada de trabalho completa (semana)
 */
export interface WorkSchedule {
  /** Segunda-feira */
  monday: DaySchedule;
  
  /** Terça-feira */
  tuesday: DaySchedule;
  
  /** Quarta-feira */
  wednesday: DaySchedule;
  
  /** Quinta-feira */
  thursday: DaySchedule;
  
  /** Sexta-feira */
  friday: DaySchedule;
  
  /** Sábado */
  saturday: DaySchedule;
  
  /** Domingo */
  sunday: DaySchedule;
  
  /** Total de horas semanais (calculado automaticamente) */
  weeklyHours?: number;
  
  /** Observações gerais sobre a jornada */
  generalNotes?: string;
}

/**
 * Exemplo de jornada comercial (Seg-Sex 08:00-18:00 com 1h de almoço)
 */
export const COMMERCIAL_SCHEDULE: WorkSchedule = {
  monday: {
    isWorkDay: true,
    startTime: '08:00',
    endTime: '18:00',
    breakStartTime: '12:00',
    breakEndTime: '13:00',
  },
  tuesday: {
    isWorkDay: true,
    startTime: '08:00',
    endTime: '18:00',
    breakStartTime: '12:00',
    breakEndTime: '13:00',
  },
  wednesday: {
    isWorkDay: true,
    startTime: '08:00',
    endTime: '18:00',
    breakStartTime: '12:00',
    breakEndTime: '13:00',
  },
  thursday: {
    isWorkDay: true,
    startTime: '08:00',
    endTime: '18:00',
    breakStartTime: '12:00',
    breakEndTime: '13:00',
  },
  friday: {
    isWorkDay: true,
    startTime: '08:00',
    endTime: '18:00',
    breakStartTime: '12:00',
    breakEndTime: '13:00',
  },
  saturday: {
    isWorkDay: false,
  },
  sunday: {
    isWorkDay: false,
  },
  weeklyHours: 44,
  generalNotes: 'Jornada comercial padrão - 44h semanais',
};

/**
 * Exemplo de jornada 6x1 (Seg-Sáb com folga rotativa)
 */
export const SIX_BY_ONE_SCHEDULE: WorkSchedule = {
  monday: {
    isWorkDay: true,
    startTime: '08:00',
    endTime: '17:00',
    breakStartTime: '12:00',
    breakEndTime: '13:00',
  },
  tuesday: {
    isWorkDay: true,
    startTime: '08:00',
    endTime: '17:00',
    breakStartTime: '12:00',
    breakEndTime: '13:00',
  },
  wednesday: {
    isWorkDay: true,
    startTime: '08:00',
    endTime: '17:00',
    breakStartTime: '12:00',
    breakEndTime: '13:00',
  },
  thursday: {
    isWorkDay: true,
    startTime: '08:00',
    endTime: '17:00',
    breakStartTime: '12:00',
    breakEndTime: '13:00',
  },
  friday: {
    isWorkDay: true,
    startTime: '08:00',
    endTime: '17:00',
    breakStartTime: '12:00',
    breakEndTime: '13:00',
  },
  saturday: {
    isWorkDay: true,
    startTime: '08:00',
    endTime: '14:00',
  },
  sunday: {
    isWorkDay: false,
  },
  weeklyHours: 44,
  generalNotes: 'Escala 6x1 - trabalha sábado com folga rotativa no domingo',
};

/**
 * Utilitário para calcular horas trabalhadas em um dia
 */
export function calculateDayHours(day: DaySchedule): number {
  if (!day.isWorkDay || !day.startTime || !day.endTime) {
    return 0;
  }

  const [startHour, startMinute] = day.startTime.split(':').map(Number);
  const [endHour, endMinute] = day.endTime.split(':').map(Number);

  let totalMinutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);

  // Subtrair intervalo se existir
  if (day.breakStartTime && day.breakEndTime) {
    const [breakStartHour, breakStartMinute] = day.breakStartTime.split(':').map(Number);
    const [breakEndHour, breakEndMinute] = day.breakEndTime.split(':').map(Number);
    const breakMinutes = (breakEndHour * 60 + breakEndMinute) - (breakStartHour * 60 + breakStartMinute);
    totalMinutes -= breakMinutes;
  }

  return totalMinutes / 60; // Retorna em horas
}

/**
 * Utilitário para calcular total de horas semanais
 */
export function calculateWeeklyHours(schedule: WorkSchedule): number {
  return (
    calculateDayHours(schedule.monday) +
    calculateDayHours(schedule.tuesday) +
    calculateDayHours(schedule.wednesday) +
    calculateDayHours(schedule.thursday) +
    calculateDayHours(schedule.friday) +
    calculateDayHours(schedule.saturday) +
    calculateDayHours(schedule.sunday)
  );
}

/**
 * Valida se o horário de trabalho está correto
 */
export function validateWorkSchedule(schedule: WorkSchedule): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  const days = [
    { name: 'Segunda-feira', day: schedule.monday },
    { name: 'Terça-feira', day: schedule.tuesday },
    { name: 'Quarta-feira', day: schedule.wednesday },
    { name: 'Quinta-feira', day: schedule.thursday },
    { name: 'Sexta-feira', day: schedule.friday },
    { name: 'Sábado', day: schedule.saturday },
    { name: 'Domingo', day: schedule.sunday },
  ];

  for (const { name, day } of days) {
    if (day.isWorkDay) {
      if (!day.startTime) {
        errors.push(`${name}: Horário de entrada é obrigatório`);
      }
      if (!day.endTime) {
        errors.push(`${name}: Horário de saída é obrigatório`);
      }
      
      // Validar formato HH:mm
      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
      if (day.startTime && !timeRegex.test(day.startTime)) {
        errors.push(`${name}: Horário de entrada inválido (use formato HH:mm)`);
      }
      if (day.endTime && !timeRegex.test(day.endTime)) {
        errors.push(`${name}: Horário de saída inválido (use formato HH:mm)`);
      }
      
      // Validar se horário de saída é depois da entrada
      if (day.startTime && day.endTime) {
        const [startH, startM] = day.startTime.split(':').map(Number);
        const [endH, endM] = day.endTime.split(':').map(Number);
        if ((endH * 60 + endM) <= (startH * 60 + startM)) {
          errors.push(`${name}: Horário de saída deve ser depois do horário de entrada`);
        }
      }
      
      // Validar intervalo se existir
      if (day.breakStartTime && !day.breakEndTime) {
        errors.push(`${name}: Horário de fim do intervalo é obrigatório`);
      }
      if (!day.breakStartTime && day.breakEndTime) {
        errors.push(`${name}: Horário de início do intervalo é obrigatório`);
      }
      
      if (day.breakStartTime && day.breakEndTime && day.startTime && day.endTime) {
        const [breakStartH, breakStartM] = day.breakStartTime.split(':').map(Number);
        const [breakEndH, breakEndM] = day.breakEndTime.split(':').map(Number);
        const [startH, startM] = day.startTime.split(':').map(Number);
        const [endH, endM] = day.endTime.split(':').map(Number);
        
        // Intervalo deve estar entre entrada e saída
        const breakStart = breakStartH * 60 + breakStartM;
        const breakEnd = breakEndH * 60 + breakEndM;
        const start = startH * 60 + startM;
        const end = endH * 60 + endM;
        
        if (breakStart <= start || breakStart >= end) {
          errors.push(`${name}: Início do intervalo deve estar entre entrada e saída`);
        }
        if (breakEnd <= start || breakEnd >= end) {
          errors.push(`${name}: Fim do intervalo deve estar entre entrada e saída`);
        }
        if (breakEnd <= breakStart) {
          errors.push(`${name}: Fim do intervalo deve ser depois do início`);
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
