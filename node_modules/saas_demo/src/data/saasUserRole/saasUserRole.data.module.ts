import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  SaasUserRolePOJO,
  SaasUserRoleSchema,
} from '../models/saasUserRole/saasUserRole.pojo.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: SaasUserRolePOJO.name, schema: SaasUserRoleSchema }]),
  ],
  exports: [MongooseModule],
})
export class SaasUserRoleDataModule {}
