import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  SaasFeaturePOJO,
  SaasFeatureSchema,
} from '@Data/models/saasFeature/saasFeature.pojo.model';
import { SaasFeatureRepository } from './repository/saasFeature.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: SaasFeaturePOJO.name,
        schema: SaasFeatureSchema,
        collection: 'SaasFeatures',
      },
    ]),
  ],
  providers: [SaasFeatureRepository],
  exports: [SaasFeatureRepository],
})
export class SaasFeatureDataModule {}
