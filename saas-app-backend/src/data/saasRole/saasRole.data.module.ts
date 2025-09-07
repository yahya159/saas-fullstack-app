import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SaasRolePOJO, SaasRoleSchema } from '../models/saasRole/saasRole.pojo.model';

@Module({
  imports: [MongooseModule.forFeature([{ name: SaasRolePOJO.name, schema: SaasRoleSchema }])],
  exports: [MongooseModule],
})
export class SaasRoleDataModule {}
