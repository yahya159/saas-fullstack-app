import { SaasApplicationDataModule } from '@Data/saasApplication/saasApplication.data.module';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MapperServiceModule } from '@Services/mappers/mapper-service.module';
import { UserServiceModule } from '@Services/user/user-service.module';
import { SaasSubscriberDataModule } from '@Data/saasSubscriber/saasSubsriber.data.module';
import { AuthCustomerService } from './auth/customer/auth-customer.service';
import { SaasCustomerAdminModule } from '@Data/saasCustomerAdmin/saasCustomerAdmin.data.module';

@Module({
  imports: [
    UserServiceModule,
    SaasApplicationDataModule,
    SaasSubscriberDataModule,
    MapperServiceModule,
    SaasCustomerAdminModule,
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
  providers: [AuthCustomerService],
  exports: [AuthCustomerService],
})
export class SecurityServiceModule {}
