import { Module } from '@nestjs/common';
import { MarketingService } from './marketing.service';
import { SaasMarketingCampaignDataModule } from '@Data/saasMarketingCampaign/saasMarketingCampaign.data.module';
import { SaasAnalyticsEventDataModule } from '@Data/saasAnalyticsEvent/saasAnalyticsEvent.data.module';

@Module({
  imports: [SaasMarketingCampaignDataModule, SaasAnalyticsEventDataModule],
  providers: [MarketingService],
  exports: [MarketingService],
})
export class MarketingServiceModule {}
