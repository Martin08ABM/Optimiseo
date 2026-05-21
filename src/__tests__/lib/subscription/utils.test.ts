import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock state variables that can be customized per test
let mockSubscriptionData: any = { plan_id: 'free', plans: { daily_analysis_limit: 5 } };
let mockSubscriptionError: any = null;
let mockRegularCount = 3;
let mockRewriteCount = 2;
let mockInsertData: any = { id: 'test-analysis-id' };
let mockInsertError: any = null;
let analysesGteCallCount = 0;

vi.mock('@/src/lib/supabase/server', () => {
  return {
    createServerSupabaseClient: vi.fn(() => ({
      from: vi.fn((table) => {
        if (table === 'subscriptions') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockImplementation(async () => {
              if (!mockSubscriptionData) {
                return { data: null, error: mockSubscriptionError || { message: 'Not found' } };
              }
              return {
                data: {
                  ...mockSubscriptionData,
                  status: 'active',
                  plans: mockSubscriptionData.plans || { daily_analysis_limit: 5 }
                },
                error: null
              };
            })
          };
        }
        if (table === 'analyses') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            neq: vi.fn().mockReturnThis(),
            gte: vi.fn().mockImplementation(async () => {
              analysesGteCallCount++;
              if (analysesGteCallCount === 1) {
                return { count: mockRegularCount, error: null };
              }
              return { count: mockRewriteCount, error: null };
            }),
            insert: vi.fn().mockReturnThis(),
            single: vi.fn().mockImplementation(async () => {
              if (mockInsertError) {
                return { data: null, error: mockInsertError };
              }
              return { data: mockInsertData, error: null };
            })
          };
        }
        return {};
      })
    }))
  };
});

describe('subscription/utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock states before each test
    mockSubscriptionData = { plan_id: 'free', plans: { daily_analysis_limit: 5 } };
    mockSubscriptionError = null;
    mockRegularCount = 3;
    mockRewriteCount = 2;
    mockInsertData = { id: 'test-analysis-id' };
    mockInsertError = null;
    analysesGteCallCount = 0;
  });

  describe('requiresPro', () => {
    it('returns true for non-pro plans', async () => {
      const { requiresPro } = await import('@/src/lib/subscription/utils');
      expect(requiresPro('free')).toBe(true);
    });

    it('returns false for pro plan', async () => {
      const { requiresPro } = await import('@/src/lib/subscription/utils');
      expect(requiresPro('pro')).toBe(false);
    });
  });

  describe('getDailyUsage', () => {
    it('returns usage stats with correct calculations', async () => {
      const { getDailyUsage } = await import('@/src/lib/subscription/utils');
      const result = await getDailyUsage('test-user-id');

      expect(result).toHaveProperty('used');
      expect(result).toHaveProperty('limit');
      expect(result).toHaveProperty('remaining');
      expect(result).toHaveProperty('resetAt');
      expect(result.resetAt).toBeInstanceOf(Date);
      // 3 regular count + 2 rewrite count (2 * 0.5 = 1) = 4 used
      expect(result.used).toBe(4);
      expect(result.limit).toBe(5);
      expect(result.remaining).toBe(1);
    });
  });

  describe('canPerformAnalysis', () => {
    it('returns not allowed when no subscription found', async () => {
      mockSubscriptionData = null;
      mockSubscriptionError = { message: 'Not found' };

      const { canPerformAnalysis } = await import('@/src/lib/subscription/utils');
      const result = await canPerformAnalysis('non-existent-user');

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('No subscription');
    });
  });

  describe('trackAnalysis', () => {
    it('returns error when no subscription found', async () => {
      mockSubscriptionData = null;

      const { trackAnalysis } = await import('@/src/lib/subscription/utils');
      const result = await trackAnalysis('test-user', 'https://example.com', 'readability-analyzer');

      expect(result.success).toBe(false);
      expect(result.error).toContain('No subscription');
    });
  });
});
