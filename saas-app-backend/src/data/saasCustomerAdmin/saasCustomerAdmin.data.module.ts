import {
  SaasCustomerAdminPOJO,
  SaasCustomerAdminSchema,
} from '@Data/models/saasCustomerAdmin/saasCustomerAdmin.pojo.model';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SaasCustomerAdminRepository } from './repository/SaasCustomerAdmin.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: SaasCustomerAdminPOJO.name,
        schema: SaasCustomerAdminSchema,
        collection: 'SaasCustomerAdmin',
      },
    ]),
  ],
  providers: [SaasCustomerAdminRepository],
  exports: [SaasCustomerAdminRepository],
})
export class SaasCustomerAdminModule {}
