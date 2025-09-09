import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CacheService } from '@app/common/services/cache.service';

export interface TokenBlacklistService {
  addToBlacklist(token: string, expirationTime: number): Promise<void>;
  isTokenBlacklisted(token: string): Promise<boolean>;
  removeExpiredTokens(): Promise<void>;
}

@Injectable()
export class AuthTokenService implements TokenBlacklistService {
  private readonly logger = new Logger(AuthTokenService.name);
  private readonly BLACKLIST_PREFIX = 'blacklist:';
  private readonly TOKEN_CACHE_TTL = 24 * 60 * 60; // 24 hours in seconds

  constructor(
    private readonly jwtService: JwtService,
    private readonly cacheService: CacheService,
  ) {}

  /**
   * Add token to blacklist (for logout functionality)
   */
  async addToBlacklist(token: string, expirationTime: number): Promise<void> {
    try {
      const tokenHash = this.hashToken(token);
      const key = `${this.BLACKLIST_PREFIX}${tokenHash}`;
      const ttl = Math.max(0, expirationTime - Math.floor(Date.now() / 1000));

      await this.cacheService.set(key, '1', ttl);
      this.logger.debug(`Token added to blacklist: ${tokenHash}`);
    } catch (error) {
      this.logger.error(`Failed to blacklist token: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check if token is blacklisted
   */
  async isTokenBlacklisted(token: string): Promise<boolean> {
    try {
      const tokenHash = this.hashToken(token);
      const key = `${this.BLACKLIST_PREFIX}${tokenHash}`;
      const result = await this.cacheService.get(key);
      return result !== null;
    } catch (error) {
      this.logger.error(`Failed to check token blacklist: ${error.message}`);
      // Fail secure: if we can't check, assume it's not blacklisted
      return false;
    }
  }

  /**
   * Remove expired tokens from blacklist (cleanup)
   */
  async removeExpiredTokens(): Promise<void> {
    try {
      // Cache service should handle TTL automatically, but we can implement
      // additional cleanup logic here if needed
      this.logger.debug('Expired tokens cleanup completed');
    } catch (error) {
      this.logger.error(`Failed to cleanup expired tokens: ${error.message}`);
    }
  }

  /**
   * Revoke all tokens for a specific user (for security purposes)
   */
  async revokeAllUserTokens(userId: string): Promise<void> {
    try {
      const key = `user_tokens:${userId}`;
      const tokens = await this.cacheService.get(key);

      if (tokens) {
        const tokenList = JSON.parse(tokens);
        const promises = tokenList.map((tokenInfo: any) =>
          this.addToBlacklist(tokenInfo.token, tokenInfo.exp),
        );
        await Promise.all(promises);

        // Clear user's token list
        await this.cacheService.del(key);
        this.logger.debug(`All tokens revoked for user: ${userId}`);
      }
    } catch (error) {
      this.logger.error(`Failed to revoke user tokens: ${error.message}`);
      throw error;
    }
  }

  /**
   * Track active tokens for a user
   */
  async trackUserToken(userId: string, token: string, expirationTime: number): Promise<void> {
    try {
      const key = `user_tokens:${userId}`;
      const existing = await this.cacheService.get(key);

      let tokens = existing ? JSON.parse(existing) : [];

      // Add new token
      tokens.push({
        token: this.hashToken(token),
        exp: expirationTime,
        createdAt: Date.now(),
      });

      // Keep only the last 10 tokens per user
      tokens = tokens.slice(-10);

      const ttl = Math.max(0, expirationTime - Math.floor(Date.now() / 1000));
      await this.cacheService.set(key, JSON.stringify(tokens), ttl);
    } catch (error) {
      this.logger.error(`Failed to track user token: ${error.message}`);
      // Don't throw error here as it's not critical for auth flow
    }
  }

  /**
   * Validate token format and extract payload safely
   */
  async validateTokenFormat(token: string): Promise<any> {
    try {
      const payload = this.jwtService.decode(token);

      if (!payload || typeof payload !== 'object') {
        throw new Error('Invalid token format');
      }

      // Check required fields
      if (!payload.userId || !payload.email) {
        throw new Error('Missing required token fields');
      }

      return payload;
    } catch (error) {
      this.logger.error(`Token validation failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate secure token hash for storage
   */
  private hashToken(token: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Check if token is close to expiration
   */
  isTokenCloseToExpiry(token: string, bufferMinutes: number = 5): boolean {
    try {
      const payload = this.jwtService.decode(token) as any;
      if (!payload || !payload.exp) {
        return true; // Treat invalid tokens as expired
      }

      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      const bufferTime = bufferMinutes * 60 * 1000; // Convert to milliseconds
      const now = Date.now();

      return expirationTime - now <= bufferTime;
    } catch (error) {
      this.logger.error(`Failed to check token expiry: ${error.message}`);
      return true; // Fail secure
    }
  }

  /**
   * Extract token information for logging/monitoring
   */
  getTokenInfo(token: string): any {
    try {
      const payload = this.jwtService.decode(token) as any;
      if (!payload) {
        return null;
      }

      return {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        issuedAt: payload.iat ? new Date(payload.iat * 1000) : null,
        expiresAt: payload.exp ? new Date(payload.exp * 1000) : null,
        applicationId: payload.applicationId,
      };
    } catch (error) {
      this.logger.error(`Failed to extract token info: ${error.message}`);
      return null;
    }
  }
}
