import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { HttpModule, HttpService } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { SecurityServiceModule } from '@Services/security/security-service.module';
import { OAuth2Controller } from './oauth2.controller';
import { GoogleStrategy } from '@Services/security/auth/strategies/google.strategy';
import { MicrosoftStrategy } from '@Services/security/auth/strategies/microsoft.strategy';
import { OAuth2ConfigService } from '@app/common/config/oauth.config';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    SecurityServiceModule,
  ],
  controllers: [OAuth2Controller],
  providers: [
    OAuth2ConfigService,
    // Check if Google OAuth2 credentials are available
    {
      provide: 'GOOGLE_STRATEGY_AVAILABLE',
      useFactory: (oauth2ConfigService: OAuth2ConfigService) => {
        const config = oauth2ConfigService.getConfig();
        return config.google.clientID && config.google.clientSecret &&
               config.google.clientID !== 'your_google_client_id_here' &&
               config.google.clientSecret !== 'your_google_client_secret_here';
      },
      inject: [OAuth2ConfigService],
    },
    // Check if Microsoft OAuth2 credentials are available
    {
      provide: 'MICROSOFT_STRATEGY_AVAILABLE',
      useFactory: (oauth2ConfigService: OAuth2ConfigService) => {
        const config = oauth2ConfigService.getConfig();
        return config.microsoft.clientID && config.microsoft.clientSecret &&
               config.microsoft.clientID !== 'your_microsoft_client_id_here' &&
               config.microsoft.clientSecret !== 'your_microsoft_client_secret_here';
      },
      inject: [OAuth2ConfigService],
    },
    // Optionally provide null strategies for compatibility
    {
      provide: GoogleStrategy,
      useValue: null,
    },
    {
      provide: MicrosoftStrategy,
      useValue: null,
    },
  ],
  exports: [
    OAuth2ConfigService,
  ],
})
export class OAuth2Module {}