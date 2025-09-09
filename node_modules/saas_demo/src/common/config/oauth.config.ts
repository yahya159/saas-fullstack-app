import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface OAuth2Config {
  google: {
    clientID: string;
    clientSecret: string;
    callbackURL: string;
  };
  microsoft: {
    clientID: string;
    clientSecret: string;
    callbackURL: string;
  };
  frontend: {
    baseUrl: string;
    successRedirect: string;
    failureRedirect: string;
  };
}

@Injectable()
export class OAuth2ConfigService {
  constructor(private configService: ConfigService) {}

  getConfig(): OAuth2Config {
    return {
      google: {
        clientID: this.configService.get<string>('GOOGLE_CLIENT_ID') || '',
        clientSecret: this.configService.get<string>('GOOGLE_CLIENT_SECRET') || '',
        callbackURL: this.configService.get<string>('GOOGLE_CALLBACK_URL') || 'http://localhost:4000/api/auth/google/callback',
      },
      microsoft: {
        clientID: this.configService.get<string>('MICROSOFT_CLIENT_ID') || '',
        clientSecret: this.configService.get<string>('MICROSOFT_CLIENT_SECRET') || '',
        callbackURL: this.configService.get<string>('MICROSOFT_CALLBACK_URL') || 'http://localhost:4000/api/auth/microsoft/callback',
      },
      frontend: {
        baseUrl: this.configService.get<string>('FRONTEND_URL') || 'http://localhost:4200',
        successRedirect: this.configService.get<string>('OAUTH_SUCCESS_REDIRECT') || '/dashboard',
        failureRedirect: this.configService.get<string>('OAUTH_FAILURE_REDIRECT') || '/login?error=oauth_failed',
      },
    };
  }

  isConfigured(): boolean {
    const config = this.getConfig();
    return !!(
      config.google.clientID && 
      config.google.clientSecret &&
      config.microsoft.clientID && 
      config.microsoft.clientSecret
    );
  }
}