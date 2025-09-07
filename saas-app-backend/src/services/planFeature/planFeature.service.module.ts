import { Module } from '@nestjs/common';
import { SaasPlanFeatureDataModule } from '@Data/saasPlanFeature/saasPlanFeature.data.module';
import { SaasPlanDataModule } from '@Data/saasPlan/saasPlan.data.module';
import { SaasFeatureDataModule } from '@Data/saasFeature/saasFeature.data.module';
import { PlanFeatureService } from './planFeature.service';

@Module({
  imports: [SaasPlanFeatureDataModule, SaasPlanDataModule, SaasFeatureDataModule],
  providers: [PlanFeatureService],
  exports: [PlanFeatureService],
})
export class PlanFeatureServiceModule {}
