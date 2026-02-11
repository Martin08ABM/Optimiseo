import { describe, it, expect, vi } from 'vitest';

// Mock supabaseAdmin
vi.mock('@/src/lib/supabase/admin', () => ({
  supabaseAdmin: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        limit: vi.fn().mockResolvedValue({ error: null }),
      })),
    })),
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
    const { supabaseAdmin } = await import('@/src/lib/supabase/admin');
    vi.mocked(supabaseAdmin.from).mockReturnValueOnce({
      select: vi.fn(() => ({
        limit: vi.fn().mockResolvedValue({ error: new Error('Connection failed') }),
      })),
    } as any);

    // Re-import to get fresh module
    vi.resetModules();

    // Re-mock with error
    vi.doMock('@/src/lib/supabase/admin', () => ({
      supabaseAdmin: {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            limit: vi.fn().mockResolvedValue({ error: new Error('fail') }),
          })),
        })),
      },
    }));

    vi.doMock('@/src/lib/stripe/config', () => ({
      stripe: {
        products: {
          list: vi.fn().mockResolvedValue({ data: [] }),
        },
      },
    }));

    const { GET } = await import('@/src/app/api/health/route');
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.status).toBe('degraded');
  });
});
