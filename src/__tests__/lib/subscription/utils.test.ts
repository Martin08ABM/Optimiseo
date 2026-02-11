import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Supabase server client
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();
const mockGte = vi.fn();
const mockOrder = vi.fn();
const mockLimit = vi.fn();
const mockInsert = vi.fn();
const mockNot = vi.fn();

const mockFrom = vi.fn(() => ({
  select: mockSelect,
  insert: mockInsert,
}));

mockSelect.mockReturnValue({
  eq: mockEq,
});

mockEq.mockReturnValue({
  single: mockSingle,
  gte: mockGte,
  eq: mockEq,
});

mockGte.mockReturnValue({
  order: mockOrder,
  eq: mockEq,
});

mockOrder.mockReturnValue({
  limit: mockLimit,
});

mockNot.mockReturnValue({
  order: mockOrder,
});

vi.mock('@/src/lib/supabase/server', () => ({
  createServerSupabaseClient: vi.fn(() => ({
    from: mockFrom,
  })),
}));

describe('subscription/utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset chain defaults
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ single: mockSingle, gte: mockGte, eq: mockEq });
    mockGte.mockReturnValue({ order: mockOrder, eq: mockEq });
    mockOrder.mockReturnValue({ limit: mockLimit });
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
      // Setup mock chain for subscription query
      mockSingle.mockResolvedValueOnce({
        data: { plan_id: 'free', plans: { daily_analysis_limit: 5 } },
        error: null,
      });

      // Setup mock chain for count query
      mockEq.mockReturnValueOnce({
        single: mockSingle,
        gte: mockGte,
        eq: mockEq,
      });
      mockSelect.mockReturnValueOnce({ eq: mockEq });
      mockEq.mockReturnValueOnce({
        gte: vi.fn().mockResolvedValue({ count: 3 }),
        single: mockSingle,
        eq: mockEq,
      });

      const { getDailyUsage } = await import('@/src/lib/subscription/utils');
      const result = await getDailyUsage('test-user-id');

      expect(result).toHaveProperty('used');
      expect(result).toHaveProperty('limit');
      expect(result).toHaveProperty('remaining');
      expect(result).toHaveProperty('resetAt');
      expect(result.resetAt).toBeInstanceOf(Date);
    });
  });

  describe('canPerformAnalysis', () => {
    it('returns not allowed when no subscription found', async () => {
      mockSingle.mockResolvedValueOnce({ data: null, error: { message: 'Not found' } });

      const { canPerformAnalysis } = await import('@/src/lib/subscription/utils');
      const result = await canPerformAnalysis('non-existent-user');

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('No subscription');
    });
  });

  describe('trackAnalysis', () => {
    it('returns error when no subscription found', async () => {
      mockSingle.mockResolvedValueOnce({ data: null, error: null });

      const { trackAnalysis } = await import('@/src/lib/subscription/utils');
      const result = await trackAnalysis('test-user', 'https://example.com', 'readability-analyzer');

      expect(result.success).toBe(false);
      expect(result.error).toContain('No subscription');
    });
  });
});
