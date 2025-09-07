import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  SaasMarketingCampaignPOJO,
  SaasMarketingCampaignSchema,
} from '../models/saasMarketingCampaign/saasMarketingCampaign.pojo.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SaasMarketingCampaignPOJO.name, schema: SaasMarketingCampaignSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class SaasMarketingCampaignDataModule {}
