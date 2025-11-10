/**
 * Transforma datas do formato YYYY-MM-DD ou YYYY-MM para ISO-8601 completo
 * Aceita também datas já no formato ISO-8601
 * 
 * @param value - Data no formato YYYY-MM-DD, YYYY-MM ou ISO-8601
 * @returns Data no formato ISO-8601 (YYYY-MM-DDTHH:mm:ss.sssZ)
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
 * // "2024-11-10" -> "2024-11-10T00:00:00.000Z"
 * // "2024-11" -> "2024-11-01T00:00:00.000Z"
 * // "2024-11-10T10:30:00.000Z" -> "2024-11-10T10:30:00.000Z" (mantém)
 * ```
 */
export function transformToISODate({ value }: { value: any }): any {
  if (!value) return value;
  
  // Se já está em formato ISO completo, retorna como está
  if (typeof value === 'string' && value.includes('T')) {
    return value;
  }
  
  // Se está em formato YYYY-MM-DD, adiciona hora
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return `${value}T00:00:00.000Z`;
  }
  
  // Se está em formato YYYY-MM (apenas ano e mês), adiciona dia 01 e hora
  if (typeof value === 'string' && /^\d{4}-\d{2}$/.test(value)) {
    return `${value}-01T00:00:00.000Z`;
  }
  
  return value;
}
