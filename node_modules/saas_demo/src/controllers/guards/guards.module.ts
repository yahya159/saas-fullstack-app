import { ApplicationContextModule } from '@app/application-context/application-context.module';
import { Module } from '@nestjs/common';
import { ApplicationModule } from '@Services/application/application-service.module';
import { RoleManagementServiceModule } from '@Services/roleManagement/roleManagement.service.module';
import { SecurityServiceModule } from '@Services/security/security-service.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Guards
import { JwtAuthGuard } from '@app/common/guards/jwt-auth.guard';
import { RoleGuard } from '@app/common/guards/role.guard';

// Services
import { AuthTokenService } from '@app/common/services/auth-token.service';
import { CacheService } from '@app/common/services/cache.service';

@Module({
  imports: [
    ApplicationModule,
    ApplicationContextModule,
    RoleManagementServiceModule,
    SecurityServiceModule,
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
  controllers: [],
  providers: [JwtAuthGuard, RoleGuard, AuthTokenService, CacheService],
  exports: [JwtAuthGuard, RoleGuard, AuthTokenService],
})
export class GuardsModule {}
