import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { AuthCustomerService } from '@Services/security/auth/customer/auth-customer.service';
import { AuthTokenService } from '@app/common/services/auth-token.service';
import { IS_PUBLIC_KEY } from '@app/common/decorators/public.decorator';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  applicationId?: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private authCustomerService: AuthCustomerService,
    private authTokenService: AuthTokenService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Access token is required');
    }

    try {
      // Verify JWT token
      const payload: JwtPayload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET || 'yOUjr4bRjjDrakKrCpO74IWX5DT348Jf',
      });

      // Additional token validation
      const isValidToken = await this.authCustomerService.verifyToken(token);
      if (!isValidToken) {
        throw new UnauthorizedException('Invalid or expired token');
      }

      // Check if token is blacklisted (for logout functionality)
      if (await this.authTokenService.isTokenBlacklisted(token)) {
        throw new UnauthorizedException('Token has been revoked');
      }

      // Attach user information to request
      request.user = {
        id: payload.userId,
        sub: payload.userId, // For compatibility with existing RoleGuard
        email: payload.email,
        role: payload.role,
        applicationId: payload.applicationId,
      };

      // Log security event for audit trail
      this.logSecurityEvent(request, payload);

      return true;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token has expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token format');
      } else if (error instanceof UnauthorizedException) {
        throw error;
      } else {
        throw new UnauthorizedException('Token validation failed');
      }
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return undefined;
    }

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }

  private async isTokenBlacklisted(token: string): Promise<boolean> {
    // Use the AuthTokenService for blacklist checking
    return await this.authTokenService.isTokenBlacklisted(token);
  }

  private logSecurityEvent(request: any, payload: JwtPayload): void {
    // Log authentication events for security monitoring
    const securityEvent = {
      timestamp: new Date().toISOString(),
      userId: payload.userId,
      email: payload.email,
      ip: request.ip || request.connection.remoteAddress,
      userAgent: request.headers['user-agent'],
      endpoint: `${request.method} ${request.url}`,
      success: true,
    };

    // TODO: Send to security monitoring service or log file
    console.log('Security Event:', JSON.stringify(securityEvent));
  }
}
