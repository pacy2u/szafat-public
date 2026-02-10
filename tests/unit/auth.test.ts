import { describe, it, expect } from 'vitest';
import { validateEmail, validatePassword, validateName } from '@/lib/validation';

describe('Registration validation', () => {
  describe('email validation', () => {
    it('accepts valid email', () => {
      expect(validateEmail('user@example.com')).toBe(true);
    });

    it('rejects email without @', () => {
      expect(validateEmail('userexample.com')).toBe(false);
    });

    it('rejects email without domain', () => {
      expect(validateEmail('user@')).toBe(false);
    });

    it('rejects empty email', () => {
      expect(validateEmail('')).toBe(false);
    });

    it('rejects email with spaces', () => {
      expect(validateEmail('user @example.com')).toBe(false);
    });
  });

  describe('password validation', () => {
    it('accepts password of 8 characters', () => {
      expect(validatePassword('12345678')).toEqual({ valid: true });
    });

    it('rejects password shorter than 8 characters', () => {
      expect(validatePassword('1234567')).toEqual({
        valid: false,
        error: 'Password must be at least 8 characters',
      });
    });

    it('accepts long passwords', () => {
      expect(validatePassword('a'.repeat(100))).toEqual({ valid: true });
    });
  });

  describe('name validation', () => {
    it('accepts valid name', () => {
      expect(validateName('John Doe')).toEqual({ valid: true });
    });

    it('rejects empty name', () => {
      expect(validateName('')).toEqual({ valid: false, error: 'Name is required' });
    });

    it('rejects whitespace-only name', () => {
      expect(validateName('   ')).toEqual({ valid: false, error: 'Name is required' });
    });

    it('rejects name longer than max', () => {
      expect(validateName('a'.repeat(101))).toEqual({
        valid: false,
        error: 'Name must be at most 100 characters',
      });
    });
  });
});
