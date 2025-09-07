import { Module } from '@nestjs/common';
import { PlanFeatureServiceModule } from '@Services/planFeature/planFeature.service.module';
import { PlanFeatureController } from './api/plan-feature.controller';

@Module({
  imports: [PlanFeatureServiceModule],
  controllers: [PlanFeatureController],
  providers: [],
})
export class PlanFeatureControllerModule {}
