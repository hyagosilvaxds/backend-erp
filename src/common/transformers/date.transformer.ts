/**
 * Transforma datas do formato YYYY-MM-DD ou YYYY-MM para objeto Date
 * Aceita também datas já no formato ISO-8601
 * 
 * @param value - Data no formato YYYY-MM-DD, YYYY-MM ou ISO-8601
 * @returns Objeto Date
 * 
 * @example
 * ```typescript
 * import { Transform } from 'class-transformer';
 * import { transformToISODate } from '@/common/transformers/date.transformer';
 * 
 * @IsDateString()
 * @Transform(transformToISODate)
 * birthDate: string;
 * 
 * // Aceita:
 * // "2024-11-10" -> Date object
 * // "2024-11" -> Date object (dia 01)
 * // "2024-11-10T10:30:00.000Z" -> Date object
 * ```
 */
export function transformToISODate({ value }: { value: any }): any {
  if (!value) return value;
  
  // Se já é um objeto Date, retorna como está
  if (value instanceof Date) {
    return value;
  }
  
  // Se já está em formato ISO completo, converte para Date
  if (typeof value === 'string' && value.includes('T')) {
    return new Date(value);
  }
  
  // Se está em formato YYYY-MM-DD, converte para Date
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T00:00:00.000Z`);
  }
  
  // Se está em formato YYYY-MM (apenas ano e mês), adiciona dia 01 e converte
  if (typeof value === 'string' && /^\d{4}-\d{2}$/.test(value)) {
    return new Date(`${value}-01T00:00:00.000Z`);
  }
  
  return value;
}
