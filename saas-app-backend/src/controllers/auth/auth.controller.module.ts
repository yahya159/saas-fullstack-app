import { ApplicationContextModule } from '@app/application-context/application-context.module';
import { GuardsModule } from '@Controllers/guards/guards.module';
import { MapperControllersModule } from '@Controllers/mappers/mapper-controllers.module';
import { Module } from '@nestjs/common';
import { ApplicationModule } from '@Services/application/application-service.module';
import { SecurityServiceModule } from '@Services/security/security-service.module';
import { AuthCustomerController } from './customer/api/auth.customer.controller';

@Module({
  imports: [
    ApplicationContextModule,
    SecurityServiceModule,
    ApplicationModule,
    GuardsModule,
    MapperControllersModule,
  ],
  controllers: [AuthCustomerController],
  providers: [],
})
export class AuthControllerModule {}
