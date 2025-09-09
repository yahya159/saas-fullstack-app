import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { AutomapperModule } from '@automapper/nestjs';
import { classes } from '@automapper/classes';
import { CommonModule } from './common/common.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthTokenService } from './common/services/auth-token.service';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RoleGuard } from './common/guards/role.guard';
import { APP_GUARD } from '@nestjs/core';
import { SecurityMiddleware } from './common/middleware/security.middleware';
import { MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Mock controllers
import { MockPlanFeatureController } from './mock-controllers/mock-plan-feature.controller';

const envFilePath = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
const envPath = process.env.NODE_ENV === 'production' ? '.env' : '.env.local';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [envFilePath, envPath],
      isGlobal: true,
    }),
    HttpModule,
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
    AutomapperModule.forRoot({ strategyInitializer: classes() }),
    CommonModule,
  ],
  controllers: [AppController, MockPlanFeatureController],
  providers: [
    AppService,
    AuthTokenService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
  ],
})
export class MockAppModule implements NestModule {
  constructor() {
    const config: ConfigService = new ConfigService();
    console.log('Mock App Module - No MongoDB required');
    console.log('JWT Secret configured:', !!config.get('JWT_SECRET'));
  }

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SecurityMiddleware).forRoutes('*');
  }
}
