import { Injectable, Logger } from '@nestjs/common';

/**
 * Cache Service for Performance Optimization
 * Implements in-memory caching with TTL support
 * TODO: Replace with Redis in production for distributed caching
 */
@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private cache = new Map<string, CacheItem>();
  private readonly DEFAULT_TTL = 5 * 60; // 5 minutes in seconds
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Schedule periodic cleanup every 5 minutes
    this.cleanupInterval = setInterval(() => {
      const cleaned = this.cleanup();
      if (cleaned > 0) {
        this.logger.debug(`Cleaned up ${cleaned} expired cache entries`);
      }
    }, 5 * 60 * 1000);
  }

  onModuleDestroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }

  /**
   * Set a value in cache with TTL (seconds)
   */
  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    const ttl = (ttlSeconds || this.DEFAULT_TTL) * 1000; // Convert to milliseconds
    const expiresAt = Date.now() + ttl;
    this.cache.set(key, { value, expiresAt });
    this.logger.debug(`Cache SET: ${key} (TTL: ${ttlSeconds || this.DEFAULT_TTL}s)`);
  }

  /**
   * Get a value from cache
   */
  async get<T = any>(key: string): Promise<T | null> {
    const item = this.cache.get(key);

    if (!item) {
      this.logger.debug(`Cache MISS: ${key}`);
      return null;
    }

    // Check if expired
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      this.logger.debug(`Cache EXPIRED: ${key}`);
      return null;
    }

    this.logger.debug(`Cache HIT: ${key}`);
    return item.value;
  }

  /**
   * Delete a value from cache
   */
  async del(key: string): Promise<boolean> {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.logger.debug(`Cache DELETE: ${key}`);
    }
    return deleted;
  }

  /**
   * Delete a value from cache (alias for del)
   */
  async delete(key: string): Promise<boolean> {
    return this.del(key);
  }

  /**
   * Clear all cached values
   */
  async clear(): Promise<void> {
    const size = this.cache.size;
    this.cache.clear();
    this.logger.debug(`Cache CLEAR: Removed ${size} entries`);
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now();
    let validItems = 0;
    let expiredItems = 0;
    let totalMemory = 0;

    for (const [key, item] of this.cache.entries()) {
      // Rough memory calculation
      totalMemory += key.length + JSON.stringify(item.value).length;

      if (now > item.expiresAt) {
        expiredItems++;
      } else {
        validItems++;
      }
    }

    return {
      totalItems: this.cache.size,
      validItems,
      expiredItems,
      estimatedMemoryBytes: totalMemory,
      memoryUsage: process.memoryUsage(),
      hitRate: this.getHitRate(),
    };
  }

  private hitCount = 0;
  private missCount = 0;

  private getHitRate(): number {
    const total = this.hitCount + this.missCount;
    return total > 0 ? this.hitCount / total : 0;
  }

  /**
   * Clean up expired items
   */
  cleanup(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.logger.debug(`Cleaned up ${cleaned} expired cache entries`);
    }
    return cleaned;
  }

  /**
   * Generate cache key for authentication tokens
   */
  static getTokenBlacklistKey(tokenHash: string): string {
    return `blacklist:${tokenHash}`;
  }

  /**
   * Generate cache key for user active tokens
   */
  static getUserTokensKey(userId: string): string {
    return `user_tokens:${userId}`;
  }

  /**
   * Generate cache key for role permissions
   */
  static getRolePermissionKey(userId: string, applicationId: string): string {
    return `role:permissions:${userId}:${applicationId}`;
  }

  /**
   * Generate cache key for plan features
   */
  static getPlanFeatureKey(planId: string): string {
    return `plan:features:${planId}`;
  }

  /**
   * Generate cache key for marketing campaigns
   */
  static getMarketingCampaignKey(applicationId: string): string {
    return `marketing:campaigns:${applicationId}`;
  }

  /**
   * Generate cache key for user roles
   */
  static getUserRoleKey(userId: string, applicationId: string): string {
    return `user:roles:${userId}:${applicationId}`;
  }
}

interface CacheItem {
  value: any;
  expiresAt: number;
}
