import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getExpirationStatus, groupByExpiration } from '../../src/lib/expiration';

describe('getExpirationStatus', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-15'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "no-date" for null', () => {
    expect(getExpirationStatus(null)).toBe('no-date');
  });

  it('returns "expired" for past dates', () => {
    expect(getExpirationStatus('2025-06-10')).toBe('expired');
  });

  it('returns "expired" for yesterday', () => {
    expect(getExpirationStatus('2025-06-14')).toBe('expired');
  });

  it('returns "expiring-soon" for today', () => {
    expect(getExpirationStatus('2025-06-15')).toBe('expiring-soon');
  });

  it('returns "expiring-soon" for within 3 days', () => {
    expect(getExpirationStatus('2025-06-17')).toBe('expiring-soon');
    expect(getExpirationStatus('2025-06-18')).toBe('expiring-soon');
  });

  it('returns "normal" for more than 3 days', () => {
    expect(getExpirationStatus('2025-06-19')).toBe('normal');
    expect(getExpirationStatus('2025-07-01')).toBe('normal');
  });

  it('accepts Date objects', () => {
    expect(getExpirationStatus(new Date('2025-06-10'))).toBe('expired');
  });
});

describe('groupByExpiration', () => {
  it('groups items by date', () => {
    const items = [
      { expirationDate: '2025-06-10', name: 'a' },
      { expirationDate: '2025-06-10', name: 'b' },
      { expirationDate: '2025-06-15', name: 'c' },
      { expirationDate: null, name: 'd' },
    ];

    const groups = groupByExpiration(items);
    expect(groups.size).toBe(3);
    expect(groups.get('2025-06-10')?.length).toBe(2);
    expect(groups.get('2025-06-15')?.length).toBe(1);
    expect(groups.get('no-date')?.length).toBe(1);
  });

  it('sorts by expiration date with no-date last', () => {
    const items = [
      { expirationDate: null, name: 'no-date' },
      { expirationDate: '2025-06-20', name: 'later' },
      { expirationDate: '2025-06-10', name: 'earlier' },
    ];

    const keys = Array.from(groupByExpiration(items).keys());
    expect(keys).toEqual(['2025-06-10', '2025-06-20', 'no-date']);
  });

  it('handles empty array', () => {
    const groups = groupByExpiration([]);
    expect(groups.size).toBe(0);
  });
});
