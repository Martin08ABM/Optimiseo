import { describe, it, expect, beforeEach } from 'vitest';
import { checkRateLimit, getRateLimitIdentifier } from '@/src/lib/rateLimit';

describe('checkRateLimit', () => {
  it('allows first request', () => {
    const id = `test-${Date.now()}-${Math.random()}`;
    const result = checkRateLimit(id);
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it('decrements remaining on subsequent calls', () => {
    const id = `test-dec-${Date.now()}`;
    checkRateLimit(id); // 1st
    const result = checkRateLimit(id); // 2nd
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(3);
  });

  it('blocks after max attempts', () => {
    const id = `test-block-${Date.now()}`;
    for (let i = 0; i < 5; i++) {
      checkRateLimit(id);
    }
    const result = checkRateLimit(id);
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('returns resetIn > 0 when blocked', () => {
    const id = `test-reset-${Date.now()}`;
    for (let i = 0; i < 5; i++) {
      checkRateLimit(id);
    }
    const result = checkRateLimit(id);
    expect(result.resetIn).toBeGreaterThan(0);
  });
});

describe('getRateLimitIdentifier', () => {
  it('prepends auth: and lowercases', () => {
    expect(getRateLimitIdentifier('Test@Example.COM')).toBe('auth:test@example.com');
  });
});
