import { Module } from '@nestjs/common';
import { MarketingController } from './api/marketing.controller';
import { PublicAnalyticsController } from './api/public-analytics.controller';
import { MarketingServiceModule } from '@Services/marketing/marketing.service.module';

@Module({
  imports: [MarketingServiceModule],
  controllers: [MarketingController, PublicAnalyticsController],
})
export class MarketingControllerModule {}
