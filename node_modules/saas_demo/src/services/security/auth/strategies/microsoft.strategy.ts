import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import { OAuth2ConfigService } from '@app/common/config/oauth.config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface MicrosoftProfile {
  id: string;
  displayName: string;
  givenName: string;
  surname: string;
  mail: string;
  userPrincipalName: string;
  provider: 'microsoft';
}

@Injectable()
export class MicrosoftStrategy extends PassportStrategy(Strategy, 'microsoft') {
  constructor(
    private oauth2ConfigService: OAuth2ConfigService,
    private httpService: HttpService,
  ) {
    const config = oauth2ConfigService.getConfig();

    super({
      authorizationURL: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
      tokenURL: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
      clientID: config.microsoft.clientID,
      clientSecret: config.microsoft.clientSecret,
      callbackURL: config.microsoft.callbackURL,
      scope: ['openid', 'profile', 'email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: (error: any, user?: any) => void,
  ): Promise<any> {
    try {
      // Get user profile from Microsoft Graph API
      const response = await firstValueFrom(
        this.httpService.get('https://graph.microsoft.com/v1.0/me', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }),
      );

      const userProfile = response.data;

      const user = {
        microsoftId: userProfile.id,
        email: userProfile.mail || userProfile.userPrincipalName,
        firstName: userProfile.givenName,
        lastName: userProfile.surname,
        displayName: userProfile.displayName,
        accessToken,
        refreshToken,
        provider: 'microsoft',
      };

      done(null, user);
    } catch (error) {
      console.error('Microsoft OAuth validation error:', error);
      done(error, null);
    }
  }
}