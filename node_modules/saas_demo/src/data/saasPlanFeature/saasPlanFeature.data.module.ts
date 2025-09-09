import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  SaasPlanFeaturePOJO,
  SaasPlanFeatureSchema,
} from '@Data/models/saasPlanFeature/saasPlanFeature.pojo.model';
import { SaasPlanFeatureRepository } from './repository/saasPlanFeature.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: SaasPlanFeaturePOJO.name,
        schema: SaasPlanFeatureSchema,
        collection: 'SaasPlanFeatures',
      },
    ]),
  ],
  providers: [SaasPlanFeatureRepository],
  exports: [SaasPlanFeatureRepository],
})
export class SaasPlanFeatureDataModule {}
