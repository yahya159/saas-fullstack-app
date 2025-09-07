import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  SaasAnalyticsEventPOJO,
  SaasAnalyticsEventSchema,
} from '../models/saasAnalyticsEvent/saasAnalyticsEvent.pojo.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SaasAnalyticsEventPOJO.name, schema: SaasAnalyticsEventSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class SaasAnalyticsEventDataModule {}
