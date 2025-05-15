import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formata uma data para o formato aceito pela API (YYYY-MM-DDT00:00:00Z)
 */
export function formatDateForApi(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}T00:00:00Z`;
}

/**
 * Adiciona dias a uma data e retorna a nova data
 */
export function addDaysToDate(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Retorna a data atual adicionada de uma quantidade de dias, formatada para a API
 */
export function getDatePlusDaysForApi(days: number): string {
  const today = new Date();
  const targetDate = addDaysToDate(today, days);
  return formatDateForApi(targetDate);
}
