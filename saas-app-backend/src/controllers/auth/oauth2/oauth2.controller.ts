import {
  Controller,
  Get,
  Req,
  Res,
  Query,
  HttpException,
  HttpStatus,
  Inject,
  Optional,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthCustomerService, OAuth2User } from '@Services/security/auth/customer/auth-customer.service';
import { OAuth2ConfigService } from '@app/common/config/oauth.config';
import { Public } from '@app/common/decorators/public.decorator';
import { GoogleStrategy } from '@Services/security/auth/strategies/google.strategy';
import { MicrosoftStrategy } from '@Services/security/auth/strategies/microsoft.strategy';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

interface OAuth2Request extends Request {
  user?: any;
}

@Controller('auth')
export class OAuth2Controller {
  constructor(
    private authCustomerService: AuthCustomerService,
    private oauth2ConfigService: OAuth2ConfigService,
    private httpService: HttpService,
    @Optional() @Inject(GoogleStrategy) private googleStrategy: GoogleStrategy,
    @Optional() @Inject(MicrosoftStrategy) private microsoftStrategy: MicrosoftStrategy,
    @Inject('GOOGLE_STRATEGY_AVAILABLE') private hasGoogleStrategy: boolean,
    @Inject('MICROSOFT_STRATEGY_AVAILABLE') private hasMicrosoftStrategy: boolean,
  ) {}

  // Google OAuth2 routes
  @Public()
  @Get('google')
  async googleAuth(@Req() req: Request, @Res() res: Response) {
    if (!this.hasGoogleStrategy) {
      const config = this.oauth2ConfigService.getConfig();
      const redirectUrl = `${config.frontend.baseUrl}${config.frontend.failureRedirect}&error=oauth_not_configured&provider=google`;
      return res.redirect(redirectUrl);
    }
    
    const config = this.oauth2ConfigService.getConfig();
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${config.google.clientID}&` +
      `redirect_uri=${encodeURIComponent(config.google.callbackURL)}&` +
      `scope=${encodeURIComponent('email profile')}&` +
      `response_type=code&` +
      `access_type=offline`;
    
    return res.redirect(authUrl);
  }

  @Public()
  @Get('google/callback')
  async googleAuthCallback(@Query('code') code: string, @Query('error') error: string, @Res() res: Response) {
    const config = this.oauth2ConfigService.getConfig();
    
    if (error || !code) {
      const redirectUrl = `${config.frontend.baseUrl}${config.frontend.failureRedirect}&error=oauth_denied&provider=google`;
      return res.redirect(redirectUrl);
    }

    if (!this.hasGoogleStrategy) {
      const redirectUrl = `${config.frontend.baseUrl}${config.frontend.failureRedirect}&error=oauth_not_configured&provider=google`;
      return res.redirect(redirectUrl);
    }
    
    try {
      // Exchange code for access token
      const tokenResponse = await firstValueFrom(
        this.httpService.post('https://oauth2.googleapis.com/token', {
          client_id: config.google.clientID,
          client_secret: config.google.clientSecret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: config.google.callbackURL,
        })
      );

      const { access_token } = tokenResponse.data;

      // Get user profile
      const profileResponse = await firstValueFrom(
        this.httpService.get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${access_token}`)
      );

      const profile = profileResponse.data;
      
      // Create user object for authentication
      const userData: OAuth2User = {
        email: profile.email,
        firstName: profile.given_name,
        lastName: profile.family_name,
        provider: 'google',
        providerId: profile.id,
        picture: profile.picture,
        accessToken: access_token,
      };

      // Authenticate user using the auth service
      const authResult = await this.authCustomerService.authenticateOAuth2(userData);
      
      if (!authResult.success) {
        const redirectUrl = `${config.frontend.baseUrl}${config.frontend.failureRedirect}&error=oauth_authentication_failed&provider=google`;
        return res.redirect(redirectUrl);
      }
      
      // Redirect to frontend with success
      const redirectUrl = `${config.frontend.baseUrl}${config.frontend.successRedirect}?token=${authResult.token}&refreshToken=${authResult.refreshToken || authResult.token}`;
      return res.redirect(redirectUrl);
      
    } catch (error) {
      console.error('Google OAuth2 callback error:', error);
      const redirectUrl = `${config.frontend.baseUrl}${config.frontend.failureRedirect}&error=oauth_callback_failed&provider=google`;
      return res.redirect(redirectUrl);
    }
  }

  // Microsoft OAuth2 routes
  @Public()
  @Get('microsoft')
  async microsoftAuth(@Req() req: Request, @Res() res: Response) {
    if (!this.hasMicrosoftStrategy) {
      const config = this.oauth2ConfigService.getConfig();
      const redirectUrl = `${config.frontend.baseUrl}${config.frontend.failureRedirect}&error=oauth_not_configured&provider=microsoft`;
      return res.redirect(redirectUrl);
    }
    
    const config = this.oauth2ConfigService.getConfig();
    const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
      `client_id=${config.microsoft.clientID}&` +
      `redirect_uri=${encodeURIComponent(config.microsoft.callbackURL)}&` +
      `scope=${encodeURIComponent('openid profile email')}&` +
      `response_type=code&` +
      `response_mode=query`;
    
    return res.redirect(authUrl);
  }

  @Public()
  @Get('microsoft/callback')
  async microsoftAuthCallback(@Query('code') code: string, @Query('error') error: string, @Res() res: Response) {
    const config = this.oauth2ConfigService.getConfig();
    
    if (error || !code) {
      const redirectUrl = `${config.frontend.baseUrl}${config.frontend.failureRedirect}&error=oauth_denied&provider=microsoft`;
      return res.redirect(redirectUrl);
    }

    if (!this.hasMicrosoftStrategy) {
      const redirectUrl = `${config.frontend.baseUrl}${config.frontend.failureRedirect}&error=oauth_not_configured&provider=microsoft`;
      return res.redirect(redirectUrl);
    }
    
    try {
      // Exchange code for access token
      const tokenResponse = await firstValueFrom(
        this.httpService.post('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
          client_id: config.microsoft.clientID,
          client_secret: config.microsoft.clientSecret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: config.microsoft.callbackURL,
        }, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        })
      );

      const { access_token } = tokenResponse.data;

      // Get user profile from Microsoft Graph API
      const profileResponse = await firstValueFrom(
        this.httpService.get('https://graph.microsoft.com/v1.0/me', {
          headers: {
            'Authorization': `Bearer ${access_token}`,
          },
        })
      );

      const profile = profileResponse.data;
      
      // Create user object for authentication
      const userData: OAuth2User = {
        email: profile.mail || profile.userPrincipalName,
        firstName: profile.givenName,
        lastName: profile.surname,
        provider: 'microsoft',
        providerId: profile.id,
        accessToken: access_token,
      };

      // Authenticate user using the auth service
      const authResult = await this.authCustomerService.authenticateOAuth2(userData);
      
      if (!authResult.success) {
        const redirectUrl = `${config.frontend.baseUrl}${config.frontend.failureRedirect}&error=oauth_authentication_failed&provider=microsoft`;
        return res.redirect(redirectUrl);
      }
      
      // Redirect to frontend with success
      const redirectUrl = `${config.frontend.baseUrl}${config.frontend.successRedirect}?token=${authResult.token}&refreshToken=${authResult.refreshToken || authResult.token}`;
      return res.redirect(redirectUrl);
      
    } catch (error) {
      console.error('Microsoft OAuth2 callback error:', error);
      const redirectUrl = `${config.frontend.baseUrl}${config.frontend.failureRedirect}&error=oauth_callback_failed&provider=microsoft`;
      return res.redirect(redirectUrl);
    }
  }

  // OAuth2 status endpoint for debugging
  @Public()
  @Get('oauth2/status')
  async getOAuth2Status() {
    return {
      configured: this.oauth2ConfigService.isConfigured(),
      providers: {
        google: {
          available: this.hasGoogleStrategy,
          configured: this.oauth2ConfigService.getConfig().google.clientID !== 'your_google_client_id_here'
        },
        microsoft: {
          available: this.hasMicrosoftStrategy,
          configured: this.oauth2ConfigService.getConfig().microsoft.clientID !== 'your_microsoft_client_id_here'
        }
      },
      message: (this.hasGoogleStrategy || this.hasMicrosoftStrategy)
        ? 'OAuth2 strategies are initialized and ready'
        : 'OAuth2 requires valid credentials to initialize strategies',
    };
  }
}