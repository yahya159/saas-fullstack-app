import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { HttpModule } from '@nestjs/axios';
import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { controllerModules } from '@Controllers/index';
import { servicesModules } from '@Services/index';
import { MongooseModule } from '@nestjs/mongoose';
import { dataModules } from './data';
import { getEnvPath } from './common/helper/env.helper';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common/common.module';
import { SecurityMiddleware } from './common/middleware/security.middleware';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RoleGuard } from './common/guards/role.guard';
import { AuthTokenService } from './common/services/auth-token.service';

const envFilePath: string = getEnvPath(`${__dirname.split('dist')[0]}src/common/envs`);
const envPath = `${__dirname.split('dist')[0]}src/common/envs` + '/.env';
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [envFilePath, envPath],
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI') || 'mongodb://127.0.0.1:27017/saas_db',
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }),
      inject: [ConfigService],
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
    ...controllerModules,
    ...servicesModules,
    ...dataModules,
  ],
  controllers: [AppController],
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
export class AppModule implements NestModule {
  constructor() {
    const config: ConfigService = new ConfigService();
    console.log('Database:', config.get('MONGODB_URI') || 'mongodb://127.0.0.1:27017/saas_db');
    console.log('JWT Secret configured:', !!config.get('JWT_SECRET'));
  }

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SecurityMiddleware).forRoutes('*'); // Apply security middleware to all routes
  }
}
