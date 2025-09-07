import { ApplicationContextModule } from '@app/application-context/application-context.module';
import { GuardsModule } from '@Controllers/guards/guards.module';
import { MapperControllersModule } from '@Controllers/mappers/mapper-controllers.module';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ApplicationModule } from '@Services/application/application-service.module';
import { SecurityServiceModule } from '@Services/security/security-service.module';
import { AuthCustomerController } from './customer/api/auth.customer.controller';
import { AuthTokenService } from '@app/common/services/auth-token.service';
import { CacheService } from '@app/common/services/cache.service';
import { OAuth2Module } from './oauth2/oauth2.module';

@Module({
  imports: [
    ApplicationContextModule,
    SecurityServiceModule,
    ApplicationModule,
    GuardsModule,
    MapperControllersModule,
    OAuth2Module,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'yOUjr4bRjjDrakKrCpO74IWX5DT348Jf',
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION') || '24h',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthCustomerController],
  providers: [AuthTokenService, CacheService],
})
export class AuthControllerModule {}
