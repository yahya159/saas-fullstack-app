import { Injectable, NestMiddleware, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum number of requests per window
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

interface ClientInfo {
  requests: number;
  windowStart: number;
  blocked: boolean;
  blockedUntil?: number;
}

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  private readonly logger = new Logger(SecurityMiddleware.name);
  private readonly clients = new Map<string, ClientInfo>();

  // Different rate limits for different endpoint types
  private readonly rateLimits: Record<string, RateLimitConfig> = {
    auth: { windowMs: 15 * 60 * 1000, maxRequests: 5 }, // 5 requests per 15 minutes for auth
    api: { windowMs: 60 * 1000, maxRequests: 100 }, // 100 requests per minute for regular API
    upload: { windowMs: 60 * 1000, maxRequests: 10 }, // 10 requests per minute for uploads
    admin: { windowMs: 60 * 1000, maxRequests: 200 }, // 200 requests per minute for admin users
  };

  // Suspicious patterns to monitor
  private readonly suspiciousPatterns = [
    /\.\.\//, // Path traversal
    /<script/i, // XSS attempts
    /union.*select/i, // SQL injection
    /javascript:/i, // JavaScript injection
    /eval\(/i, // Code evaluation attempts
  ];

  use(req: Request, res: Response, next: NextFunction) {
    try {
      // Security headers
      this.setSecurityHeaders(res);

      // Get client identifier
      const clientId = this.getClientId(req);

      // Apply rate limiting
      if (!this.checkRateLimit(req, clientId)) {
        this.logger.warn(`Rate limit exceeded for client: ${clientId}`);
        throw new HttpException(
          {
            statusCode: HttpStatus.TOO_MANY_REQUESTS,
            message: 'Too many requests. Please try again later.',
            error: 'Too Many Requests',
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      // Check for suspicious patterns
      this.checkSuspiciousActivity(req, clientId);

      // Validate request size
      this.validateRequestSize(req);

      // Log security event
      this.logSecurityEvent(req, clientId);

      // Clean up old entries periodically
      if (Math.random() < 0.01) {
        // 1% chance to clean up
        this.cleanupOldEntries();
      }

      next();
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Security middleware error: ${error.message}`);
      next(error);
    }
  }

  private setSecurityHeaders(res: Response): void {
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');

    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Enable XSS protection
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Strict transport security (HTTPS only)
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

    // Content Security Policy
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;",
    );

    // Referrer policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Hide server information
    res.removeHeader('X-Powered-By');
  }

  private getClientId(req: Request): string {
    // Use multiple factors to identify clients
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    const authHeader = req.headers.authorization;

    if (authHeader) {
      // For authenticated requests, use user info from token
      try {
        const token = authHeader.split(' ')[1];
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        return `user:${payload.userId}`;
      } catch {
        // Fallback to IP-based identification
      }
    }

    // For unauthenticated requests, use IP + User Agent hash
    return `ip:${ip}:${this.hashString(userAgent)}`;
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  private checkRateLimit(req: Request, clientId: string): boolean {
    const now = Date.now();
    const rateLimitType = this.getRateLimitType(req);
    const config = this.rateLimits[rateLimitType];

    let clientInfo = this.clients.get(clientId);

    if (!clientInfo) {
      clientInfo = {
        requests: 0,
        windowStart: now,
        blocked: false,
      };
      this.clients.set(clientId, clientInfo);
    }

    // Check if client is currently blocked
    if (clientInfo.blocked && clientInfo.blockedUntil && now < clientInfo.blockedUntil) {
      return false;
    }

    // Reset window if needed
    if (now - clientInfo.windowStart > config.windowMs) {
      clientInfo.requests = 0;
      clientInfo.windowStart = now;
      clientInfo.blocked = false;
      clientInfo.blockedUntil = undefined;
    }

    // Increment request count
    clientInfo.requests++;

    // Check if limit exceeded
    if (clientInfo.requests > config.maxRequests) {
      clientInfo.blocked = true;
      clientInfo.blockedUntil = now + config.windowMs;
      return false;
    }

    return true;
  }

  private getRateLimitType(req: Request): string {
    const path = req.path.toLowerCase();
    const userRole = (req as any).user?.role;

    if (path.includes('/auth/')) {
      return 'auth';
    } else if (path.includes('/upload')) {
      return 'upload';
    } else if (userRole === 'CUSTOMER_ADMIN' || userRole === 'ADMIN') {
      return 'admin';
    } else {
      return 'api';
    }
  }

  private checkSuspiciousActivity(req: Request, clientId: string): void {
    const suspicious = this.detectSuspiciousPatterns(req);

    if (suspicious.length > 0) {
      this.logger.warn(`Suspicious activity detected from ${clientId}: ${suspicious.join(', ')}`, {
        url: req.url,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        body: req.body,
        query: req.query,
      });

      // Block client for suspicious activity
      const clientInfo = this.clients.get(clientId);
      if (clientInfo) {
        clientInfo.blocked = true;
        clientInfo.blockedUntil = Date.now() + 30 * 60 * 1000; // Block for 30 minutes
      }

      throw new HttpException(
        {
          statusCode: HttpStatus.FORBIDDEN,
          message: 'Suspicious activity detected',
          error: 'Forbidden',
        },
        HttpStatus.FORBIDDEN,
      );
    }
  }

  private detectSuspiciousPatterns(req: Request): string[] {
    const suspicious: string[] = [];
    const checkData = JSON.stringify({
      url: req.url,
      query: req.query,
      body: req.body,
      headers: req.headers,
    });

    for (const pattern of this.suspiciousPatterns) {
      if (pattern.test(checkData)) {
        suspicious.push(pattern.toString());
      }
    }

    return suspicious;
  }

  private validateRequestSize(req: Request): void {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);
    const maxSize = 50 * 1024 * 1024; // 50MB max request size

    if (contentLength > maxSize) {
      throw new HttpException(
        {
          statusCode: HttpStatus.PAYLOAD_TOO_LARGE,
          message: 'Request payload too large',
          error: 'Payload Too Large',
        },
        HttpStatus.PAYLOAD_TOO_LARGE,
      );
    }
  }

  private logSecurityEvent(req: Request, clientId: string): void {
    const event = {
      timestamp: new Date().toISOString(),
      clientId,
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      authenticated: !!(req as any).user,
      userId: (req as any).user?.id,
    };

    // Only log for monitoring, avoid flooding logs
    if (Math.random() < 0.1) {
      // 10% sampling rate
      this.logger.debug('Security event', event);
    }
  }

  private cleanupOldEntries(): void {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    for (const [clientId, clientInfo] of this.clients.entries()) {
      if (now - clientInfo.windowStart > maxAge) {
        this.clients.delete(clientId);
      }
    }
  }
}
