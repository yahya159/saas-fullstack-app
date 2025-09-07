import { SaasCustomerAdminRepository } from '@Data/saasCustomerAdmin/repository/SaasCustomerAdmin.repository';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserServiceMapper } from '@Services/mappers/user/user-service.mapper';
import { AuthCryptageHelper } from '../helpers/auth.cryptage';
import { CustomerAdminServiceMapper } from '@Services/mappers/customer-admin/customer-admin-service.mapper';
import { CustomerSignUpDTO } from '@Services/dto/user/customer.dto';
import { JwtService } from '@nestjs/jwt';

export interface LoginResult {
  success: boolean;
  user?: any;
  token?: string;
  refreshToken?: string;
  message?: string;
}

export interface RefreshResult {
  success: boolean;
  token?: string;
  refreshToken?: string;
  message?: string;
}

export interface OAuth2User {
  email: string;
  firstName: string;
  lastName: string;
  provider: 'google' | 'microsoft';
  providerId: string;
  picture?: string;
  accessToken?: string;
  refreshToken?: string;
}

@Injectable()
export class AuthCustomerService {
  HOST: string;

  constructor(
    private readonly customerAdminServiceMapper: CustomerAdminServiceMapper,
    private readonly saasCustomerAdminRepository: SaasCustomerAdminRepository,
    private readonly jwtService: JwtService,
  ) {}

  async signup(customerSignUpDTO: CustomerSignUpDTO): Promise<void> {
    try {
      // Check if user already exists
      const existingUser = await this.saasCustomerAdminRepository.findByEmail(
        customerSignUpDTO.email,
      );
      if (existingUser) {
        throw new HttpException('User with this email already exists', HttpStatus.CONFLICT);
      }

      // Encrypt password
      customerSignUpDTO.password = AuthCryptageHelper.encryptWithAES(customerSignUpDTO.password);

      // Create user
      await this.saasCustomerAdminRepository.createCustomerAdmin(
        this.customerAdminServiceMapper.mapcustomerSignUpDTOToSaasCustomerAdminPOJO(
          customerSignUpDTO,
        ),
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Failed to create user account', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async login(email: string, password: string, rememberMe: boolean = false): Promise<LoginResult> {
    try {
      // Find user by email
      const user = await this.saasCustomerAdminRepository.findByEmail(email);
      if (!user) {
        return {
          success: false,
          message: 'Invalid email or password',
        };
      }

      // Verify password
      const decryptedPassword = AuthCryptageHelper.decryptWithAES(user.password);
      if (decryptedPassword !== password) {
        return {
          success: false,
          message: 'Invalid email or password',
        };
      }

      // Generate JWT tokens
      const payload = {
        userId: user._id,
        email: user.email,
        role: 'CUSTOMER_ADMIN', // Default role for customer admin
        userRole: user.userRole || 'CUSTOMER_ADMIN',
      };

      const token = this.jwtService.sign(payload, {
        expiresIn: rememberMe ? '30d' : '24h',
      });

      const refreshToken = this.jwtService.sign(
        { userId: user._id, type: 'refresh' },
        { expiresIn: '90d' },
      );

      // Prepare user data (exclude sensitive information)
      const userData = {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        role: 'CUSTOMER_ADMIN',
        userRole: user.userRole || 'CUSTOMER_ADMIN',
        phoneNumber: user.phoneNumber,
        activated: user.activated,
        createdAt: user.createdAt,
        permissions: this.getUserPermissions('CUSTOMER_ADMIN'),
      };

      return {
        success: true,
        user: userData,
        token,
        refreshToken,
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Login failed. Please try again.',
      };
    }
  }

  /**
   * Handle OAuth2 authentication (Google, Microsoft)
   */
  async authenticateOAuth2(oauth2User: OAuth2User): Promise<LoginResult> {
    try {
      // Check if user already exists by email
      let user = await this.saasCustomerAdminRepository.findByEmail(oauth2User.email);
      
      if (!user) {
        // Create new user from OAuth2 data
        const newUser = {
          email: oauth2User.email,
          firstName: oauth2User.firstName,
          lastName: oauth2User.lastName,
          username: oauth2User.email, // Use email as username for OAuth users
          password: AuthCryptageHelper.encryptWithAES(
            Math.random().toString(36).substring(2, 15) // Generate random password
          ),
          phoneNumber: `oauth_${oauth2User.provider}_${oauth2User.providerId}`, // Unique phone number for OAuth users
          streetAddress: '',
          streetAddressTwo: '',
          city: '',
          state: '',
          zipCode: '',
          activated: true, // OAuth users are automatically activated
          userRole: 'CUSTOMER_ADMIN',
          oauthProvider: oauth2User.provider,
          oauthProviderId: oauth2User.providerId,
        };
        
        user = await this.saasCustomerAdminRepository.createCustomerAdmin(
          this.customerAdminServiceMapper.mapcustomerSignUpDTOToSaasCustomerAdminPOJO(newUser as any)
        );
      } else {
        // Update OAuth provider info if not set
        if (!user.oauthProvider) {
          user.oauthProvider = oauth2User.provider;
          user.oauthProviderId = oauth2User.providerId;
          // Update user in database
          await this.saasCustomerAdminRepository.updateUser(user._id.toString(), {
            oauthProvider: oauth2User.provider,
            oauthProviderId: oauth2User.providerId,
          });
        }
      }

      // Generate JWT tokens
      const payload = {
        userId: user._id,
        email: user.email,
        role: 'CUSTOMER_ADMIN',
        userRole: user.userRole || 'CUSTOMER_ADMIN',
        provider: oauth2User.provider,
      };

      const token = this.jwtService.sign(payload, {
        expiresIn: '24h', // OAuth sessions are shorter by default
      });

      const refreshToken = this.jwtService.sign(
        { userId: user._id, type: 'refresh' },
        { expiresIn: '90d' }
      );

      // Prepare user data
      const userData = {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        role: 'CUSTOMER_ADMIN',
        userRole: user.userRole || 'CUSTOMER_ADMIN',
        phoneNumber: user.phoneNumber,
        activated: user.activated,
        createdAt: user.createdAt,
        oauthProvider: oauth2User.provider,
        permissions: this.getUserPermissions('CUSTOMER_ADMIN'),
      };

      return {
        success: true,
        user: userData,
        token,
        refreshToken,
      };
    } catch (error) {
      console.error('OAuth2 authentication error:', error);
      return {
        success: false,
        message: 'OAuth2 authentication failed. Please try again.',
      };
    }
  }

  async verifyToken(token: string): Promise<boolean> {
    try {
      const decoded = this.jwtService.verify(token);

      // Optionally check if user still exists and is active
      const user = await this.saasCustomerAdminRepository.findById(decoded.userId);
      return !!user;
    } catch (error) {
      return false;
    }
  }

  async refreshToken(refreshToken: string): Promise<RefreshResult> {
    try {
      const decoded = this.jwtService.verify(refreshToken);

      if (decoded.type !== 'refresh') {
        return {
          success: false,
          message: 'Invalid refresh token',
        };
      }

      // Get user data
      const user = await this.saasCustomerAdminRepository.findById(decoded.userId);
      if (!user) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      // Generate new tokens
      const payload = {
        userId: user._id,
        email: user.email,
        role: 'CUSTOMER_ADMIN',
        userRole: user.userRole || 'CUSTOMER_ADMIN',
      };

      const newToken = this.jwtService.sign(payload, { expiresIn: '24h' });
      const newRefreshToken = this.jwtService.sign(
        { userId: user._id, type: 'refresh' },
        { expiresIn: '90d' },
      );

      return {
        success: true,
        token: newToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Invalid or expired refresh token',
      };
    }
  }

  private getUserPermissions(role: string): string[] {
    const permissions: Record<string, string[]> = {
      CUSTOMER_ADMIN: [
        'technicalConfiguration',
        'securityValidation',
        'teamManagement',
        'apiDocumentation',
        'planManagement',
        'billing',
      ],
      CUSTOMER_MANAGER: [
        'marketingDashboard',
        'abTestConfiguration',
        'userAnalytics',
        'campaignManagement',
        'planManagement',
      ],
      CUSTOMER_DEVELOPER: [
        'apiDocumentation',
        'sandboxAccess',
        'debuggingTools',
        'technicalIntegration',
        'widgetManagement',
      ],
      SAAS_ADMIN: [
        'platformAdministration',
        'systemConfiguration',
        'userManagement',
        'analyticsOverview',
      ],
      SAAS_MANAGER: ['platformManagement', 'customerSupport', 'businessAnalytics'],
    };

    return permissions[role] || [];
  }
}
