import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface SecurityConfig {
  jwt: {
    secret: string;
    expiresIn: string;
    refreshExpiresIn: string;
  };
  cors: {
    origin: string[];
    credentials: boolean;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  encryption: {
    algorithm: string;
    keyLength: number;
  };
  security: {
    bcryptRounds: number;
    maxLoginAttempts: number;
    lockoutDuration: number;
  };
}

@Injectable()
export class SecurityConfigService {
  constructor(private configService: ConfigService) {}

  getConfig(): SecurityConfig {
    return {
      jwt: {
        secret: this.configService.get<string>('JWT_SECRET') || 'yOUjr4bRjjDrakKrCpO74IWX5DT348Jf',
        expiresIn: this.configService.get<string>('JWT_EXPIRATION') || '24h',
        refreshExpiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '90d',
      },
      cors: {
        origin: this.configService.get<string>('CORS_ORIGIN')?.split(',') || [
          'http://localhost:4200',
        ],
        credentials: true,
      },
      rateLimit: {
        windowMs: parseInt(this.configService.get<string>('RATE_LIMIT_TTL') || '60') * 1000,
        maxRequests: parseInt(this.configService.get<string>('RATE_LIMIT_LIMIT') || '100'),
      },
      encryption: {
        algorithm: 'aes-256-gcm',
        keyLength: 32,
      },
      security: {
        bcryptRounds: 12,
        maxLoginAttempts: 5,
        lockoutDuration: 15 * 60 * 1000, // 15 minutes
      },
    };
  }

  getJwtSecret(): string {
    return this.getConfig().jwt.secret;
  }

  getCorsOrigins(): string[] {
    return this.getConfig().cors.origin;
  }

  getRateLimitConfig() {
    return this.getConfig().rateLimit;
  }

  isProduction(): boolean {
    return this.configService.get<string>('NODE_ENV') === 'production';
  }

  isDevelopment(): boolean {
    return this.configService.get<string>('NODE_ENV') === 'development';
  }
}
