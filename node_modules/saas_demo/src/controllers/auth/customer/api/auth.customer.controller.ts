import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Get,
  UseGuards,
  Request,
  Headers,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthCustomerService } from '@Services/security/auth/customer/auth-customer.service';
import { AuthTokenService } from '@app/common/services/auth-token.service';
import { JwtAuthGuard } from '@app/common/guards/jwt-auth.guard';
import { Public } from '@app/common/decorators/public.decorator';
import { AUTH_CUSTOMER_API_PATHS } from '../api-paths/auth-customer-api-paths';
import { CustomerControllerMapper } from '@Controllers/mappers/user/customer/customer.mapper';
import { CustomerSignUpWO } from '@Controllers/wo/customer-signup.wo';

interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface TokenRequest {
  token: string;
}

interface RefreshRequest {
  refreshToken: string;
}

@Controller(AUTH_CUSTOMER_API_PATHS.ROOT_PATH)
@UseGuards(JwtAuthGuard) // Apply JWT guard to all routes by default
export class AuthCustomerController {
  constructor(
    private readonly authCustomerService: AuthCustomerService,
    private readonly authTokenService: AuthTokenService,
    private readonly customerControllerMapper: CustomerControllerMapper,
  ) {}

  @Public() // Mark as public since it's registration
  @Post(AUTH_CUSTOMER_API_PATHS.SIGNUP_PATH)
  async signupCustomer(@Body() customerSignUpWO: CustomerSignUpWO) {
    try {
      await this.authCustomerService.signup(
        this.customerControllerMapper.mapFromCustomerSignUpWOTOCustomerSignUpDTO(customerSignUpWO),
      );
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Account created successfully',
        success: true,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to create account', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Public() // Mark as public since it's login
  @Post(AUTH_CUSTOMER_API_PATHS.LOGIN_PATH)
  async login(@Body() loginRequest: LoginRequest) {
    try {
      const { email, password, rememberMe = false } = loginRequest;

      if (!email || !password) {
        throw new BadRequestException('Email and password are required');
      }

      const result = await this.authCustomerService.login(email, password, rememberMe);

      if (!result.success) {
        throw new UnauthorizedException(result.message || 'Login failed');
      }

      // Track the token for this user
      if (result.token && result.user) {
        const tokenInfo = this.authTokenService.getTokenInfo(result.token);
        if (tokenInfo?.expiresAt) {
          await this.authTokenService.trackUserToken(
            result.user.id,
            result.token,
            Math.floor(tokenInfo.expiresAt.getTime() / 1000),
          );
        }
      }

      return {
        statusCode: HttpStatus.OK,
        message: 'Login successful',
        data: {
          user: result.user,
          token: result.token,
          refreshToken: result.refreshToken,
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw new HttpException('Login failed. Please try again.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Public() // Mark as public for token verification
  @Post(AUTH_CUSTOMER_API_PATHS.VERIFY_TOKEN_PATH)
  async verifyToken(@Body() tokenRequest: TokenRequest) {
    try {
      const { token } = tokenRequest;

      if (!token) {
        throw new BadRequestException('Token is required');
      }

      const isValid = await this.authCustomerService.verifyToken(token);
      const isBlacklisted = await this.authTokenService.isTokenBlacklisted(token);

      if (!isValid || isBlacklisted) {
        return {
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'Token is invalid or expired',
          valid: false,
        };
      }

      const tokenInfo = this.authTokenService.getTokenInfo(token);
      const isCloseToExpiry = this.authTokenService.isTokenCloseToExpiry(token);

      return {
        statusCode: HttpStatus.OK,
        message: 'Token is valid',
        valid: true,
        tokenInfo: {
          userId: tokenInfo?.userId,
          email: tokenInfo?.email,
          role: tokenInfo?.role,
          expiresAt: tokenInfo?.expiresAt,
          isCloseToExpiry,
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      return {
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Token validation failed',
        valid: false,
      };
    }
  }

  @Public() // Mark as public for refresh token
  @Post('refresh')
  async refreshToken(@Body() refreshRequest: RefreshRequest) {
    try {
      const { refreshToken } = refreshRequest;

      if (!refreshToken) {
        throw new BadRequestException('Refresh token is required');
      }

      const result = await this.authCustomerService.refreshToken(refreshToken);

      if (!result.success) {
        throw new UnauthorizedException(result.message || 'Token refresh failed');
      }

      return {
        statusCode: HttpStatus.OK,
        message: 'Token refreshed successfully',
        data: {
          token: result.token,
          refreshToken: result.refreshToken,
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw new HttpException('Token refresh failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('logout')
  async logout(@Request() req, @Headers('authorization') authHeader: string) {
    try {
      if (!authHeader) {
        throw new BadRequestException('Authorization header is required');
      }

      const token = authHeader.split(' ')[1];
      if (!token) {
        throw new BadRequestException('Invalid authorization header format');
      }

      const tokenInfo = this.authTokenService.getTokenInfo(token);
      if (tokenInfo?.expiresAt) {
        await this.authTokenService.addToBlacklist(
          token,
          Math.floor(tokenInfo.expiresAt.getTime() / 1000),
        );
      }

      return {
        statusCode: HttpStatus.OK,
        message: 'Logged out successfully',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new HttpException('Logout failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('logout-all')
  async logoutAll(@Request() req) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new BadRequestException('User context is required');
      }

      await this.authTokenService.revokeAllUserTokens(userId);

      return {
        statusCode: HttpStatus.OK,
        message: 'All sessions logged out successfully',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new HttpException('Logout all failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('profile')
  async getProfile(@Request() req) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new BadRequestException('User context is required');
      }

      // Get user profile from auth service
      // This would typically fetch from database
      return {
        statusCode: HttpStatus.OK,
        message: 'Profile retrieved successfully',
        data: {
          id: req.user.id,
          email: req.user.email,
          role: req.user.role,
          applicationId: req.user.applicationId,
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new HttpException('Failed to get profile', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
