import { createAdminClient } from '@/src/lib/supabase/admin';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
}

export class AnalysisCache {
  private defaultTtl = 3600; // 1 hour default

  /**
   * Generate cache key for analysis
   */
  private generateKey(type: string, identifier: string): string {
    return `analysis:${type}:${this.hash(identifier)}`;
  }

  /**
   * Simple hash function for cache keys
   */
  private hash(input: string): string {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Get cached analysis
   */
  async get<T>(type: string, identifier: string): Promise<T | null> {
    try {
      const supabaseAdmin = createAdminClient();
      const key = this.generateKey(type, identifier);
      
      const { data, error } = await supabaseAdmin
        .from('cache')
        .select('data, expires_at')
        .eq('key', key)
        .single();

      if (error || !data) {
        return null;
      }

      // Check if cache has expired
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        // Delete expired cache
        await this.delete(type, identifier);
        return null;
      }

      return data.data as T;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set cached analysis
   */
  async set(
    type: string, 
    identifier: string, 
    data: any, 
    options: CacheOptions = {}
  ): Promise<void> {
    try {
      const supabaseAdmin = createAdminClient();
      const key = this.generateKey(type, identifier);
      const ttl = options.ttl || this.defaultTtl;
      const expiresAt = new Date(Date.now() + ttl * 1000);

      await supabaseAdmin
        .from('cache')
        .upsert({
          key,
          data,
          expires_at: expiresAt.toISOString(),
          type,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'key'
        });
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  /**
   * Delete cached analysis
   */
  async delete(type: string, identifier: string): Promise<void> {
    try {
      const supabaseAdmin = createAdminClient();
      const key = this.generateKey(type, identifier);
      await supabaseAdmin
        .from('cache')
        .delete()
        .eq('key', key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  /**
   * Clear all expired cache entries
   */
  async cleanup(): Promise<void> {
    try {
      const supabaseAdmin = createAdminClient();
      await supabaseAdmin
        .from('cache')
        .delete()
        .lt('expires_at', new Date().toISOString());
    } catch (error) {
      console.error('Cache cleanup error:', error);
    }
  }

  /**
   * Cache analysis by URL
   */
  async getByUrl(url: string): Promise<any | null> {
    return this.get('url', url);
  }

  async setByUrl(url: string, data: any, options?: CacheOptions): Promise<void> {
    return this.set('url', url, data, options);
  }

  /**
   * Cache analysis by content hash
   */
  async getByContent(content: string): Promise<any | null> {
    return this.get('content', content);
  }

  async setByContent(content: string, data: any, options?: CacheOptions): Promise<void> {
    return this.set('content', content, data, options);
  }
}

// Singleton instance
export const analysisCache = new AnalysisCache();