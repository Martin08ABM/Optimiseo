import { describe, it, expect, vi } from 'vitest';

// Define a common mock for the query builder
const mockFrom = vi.fn().mockImplementation(() => ({
  select: vi.fn().mockImplementation(() => ({
    limit: vi.fn().mockResolvedValue({ error: null }),
  })),
}));

// Mock supabaseAdmin and createAdminClient
vi.mock('@/src/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: mockFrom,
  })),
  supabaseAdmin: {
    from: mockFrom,
  },
}));

// Mock stripe
vi.mock('@/src/lib/stripe/config', () => ({
  stripe: {
    products: {
      list: vi.fn().mockResolvedValue({ data: [] }),
    },
  },
}));

describe('GET /api/health', () => {
  it('returns healthy status when all checks pass', async () => {
    const { GET } = await import('@/src/app/api/health/route');
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('healthy');
    expect(data.checks.supabase.status).toBe('healthy');
    expect(data.checks.stripe.status).toBe('healthy');
    expect(data.timestamp).toBeDefined();
  });

  it('returns degraded status when Supabase fails', async () => {
    // Re-mock with error
    mockFrom.mockImplementationOnce(() => ({
      select: vi.fn(() => ({
        limit: vi.fn().mockResolvedValue({ error: new Error('Connection failed') }),
      })),
    }));

    const { GET } = await import('@/src/app/api/health/route');
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.status).toBe('degraded');
    expect(data.checks.supabase.status).toBe('unhealthy');
  });
});
