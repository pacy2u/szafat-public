import { describe, it, expect } from 'vitest';
import { formatDate, parseDate } from '@/lib/dates';

describe('formatDate', () => {
  it('formats date as DD/MM/YYYY', () => {
    expect(formatDate(new Date(2025, 0, 15), 'DD_MM_YYYY')).toBe('15/01/2025');
  });

  it('formats date as MM/DD/YYYY', () => {
    expect(formatDate(new Date(2025, 0, 15), 'MM_DD_YYYY')).toBe('01/15/2025');
  });

  it('pads single-digit day and month', () => {
    expect(formatDate(new Date(2025, 2, 5), 'DD_MM_YYYY')).toBe('05/03/2025');
  });

  it('handles string date input', () => {
    expect(formatDate('2025-06-20', 'DD_MM_YYYY')).toBe('20/06/2025');
  });

  it('returns "Invalid date" for invalid input', () => {
    expect(formatDate('not-a-date', 'DD_MM_YYYY')).toBe('Invalid date');
  });

  it('handles December 31st correctly', () => {
    expect(formatDate(new Date(2025, 11, 31), 'DD_MM_YYYY')).toBe('31/12/2025');
    expect(formatDate(new Date(2025, 11, 31), 'MM_DD_YYYY')).toBe('12/31/2025');
  });

  it('handles January 1st correctly', () => {
    expect(formatDate(new Date(2025, 0, 1), 'DD_MM_YYYY')).toBe('01/01/2025');
  });
});

describe('parseDate', () => {
  it('parses DD/MM/YYYY format', () => {
    const result = parseDate('15/01/2025', 'DD_MM_YYYY');
    expect(result).toEqual(new Date(2025, 0, 15));
  });

  it('parses MM/DD/YYYY format', () => {
    const result = parseDate('01/15/2025', 'MM_DD_YYYY');
    expect(result).toEqual(new Date(2025, 0, 15));
  });

  it('returns null for invalid format', () => {
    expect(parseDate('2025-01-15', 'DD_MM_YYYY')).toBeNull();
  });

  it('returns null for invalid month', () => {
    expect(parseDate('15/13/2025', 'DD_MM_YYYY')).toBeNull();
  });

  it('returns null for invalid day', () => {
    expect(parseDate('32/01/2025', 'DD_MM_YYYY')).toBeNull();
  });

  it('returns null for Feb 30', () => {
    expect(parseDate('30/02/2025', 'DD_MM_YYYY')).toBeNull();
  });

  it('handles leap year Feb 29', () => {
    const result = parseDate('29/02/2024', 'DD_MM_YYYY');
    expect(result).toEqual(new Date(2024, 1, 29));
  });

  it('rejects non-leap year Feb 29', () => {
    expect(parseDate('29/02/2025', 'DD_MM_YYYY')).toBeNull();
  });
});
