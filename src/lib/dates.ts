import type { DateFormat } from '@/types';

export function formatDate(date: Date | string, format: DateFormat): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(d.getTime())) {
    return 'Invalid date';
  }

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  switch (format) {
    case 'DD_MM_YYYY':
      return `${day}/${month}/${year}`;
    case 'MM_DD_YYYY':
      return `${month}/${day}/${year}`;
    default:
      return `${day}/${month}/${year}`;
  }
}

export function parseDate(dateStr: string, format: DateFormat): Date | null {
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;

  let day: number;
  let month: number;
  const year = parseInt(parts[2], 10);

  switch (format) {
    case 'DD_MM_YYYY':
      day = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10);
      break;
    case 'MM_DD_YYYY':
      month = parseInt(parts[0], 10);
      day = parseInt(parts[1], 10);
      break;
    default:
      return null;
  }

  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;

  const date = new Date(year, month - 1, day);

  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }

  return date;
}
