import { describe, it, expect } from 'vitest';
import { validatePassword, validateEmail, sanitizeInput } from '@/src/utils/validation';

describe('validatePassword', () => {
  it('rejects passwords shorter than 8 characters', () => {
    const result = validatePassword('Ab1@');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('8 caracteres');
  });

  it('rejects passwords without lowercase', () => {
    const result = validatePassword('ABCDEFG1@');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('minúscula');
  });

  it('rejects passwords without uppercase', () => {
    const result = validatePassword('abcdefg1@');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('mayúscula');
  });

  it('rejects passwords without digits', () => {
    const result = validatePassword('Abcdefgh@');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('número');
  });

  it('rejects passwords without special characters', () => {
    const result = validatePassword('Abcdefg1');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('símbolo');
  });

  it('accepts valid passwords', () => {
    const result = validatePassword('Abcdefg1@');
    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
  });
});

describe('validateEmail', () => {
  it('accepts valid emails', () => {
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('user.name@domain.co')).toBe(true);
  });

  it('rejects invalid emails', () => {
    expect(validateEmail('notanemail')).toBe(false);
    expect(validateEmail('@domain.com')).toBe(false);
    expect(validateEmail('user@')).toBe(false);
    expect(validateEmail('')).toBe(false);
  });
});

describe('sanitizeInput', () => {
  it('escapes HTML entities', () => {
    expect(sanitizeInput('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
    );
  });

  it('trims whitespace', () => {
    expect(sanitizeInput('  hello  ')).toBe('hello');
  });

  it('truncates to max length', () => {
    expect(sanitizeInput('abcdefghij', 5)).toBe('abcde');
  });

  it('returns empty string for falsy input', () => {
    expect(sanitizeInput('')).toBe('');
  });

  it('escapes ampersands', () => {
    expect(sanitizeInput('a&b')).toBe('a&amp;b');
  });

  it('escapes single quotes', () => {
    expect(sanitizeInput("it's")).toBe("it&#x27;s");
  });
});
