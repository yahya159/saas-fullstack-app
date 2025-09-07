import { AutoMap } from '@automapper/classes';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';

export type SaasMarketingCampaignDocument = SaasMarketingCampaign & Document;

export enum CampaignStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
}

export enum CampaignType {
  AB_TEST = 'AB_TEST',
  PRICING_TEST = 'PRICING_TEST',
  LANDING_PAGE = 'LANDING_PAGE',
  EMAIL_CAMPAIGN = 'EMAIL_CAMPAIGN',
  CONVERSION_OPTIMIZATION = 'CONVERSION_OPTIMIZATION',
}

@Schema()
export class SaasMarketingCampaignPOJO {
  @AutoMap()
  _id: mongoose.Types.ObjectId;

  @AutoMap()
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'SaasApplicationPOJO' })
  application: mongoose.Types.ObjectId;

  @AutoMap()
  @Prop({ required: true })
  name: string;

  @AutoMap()
  @Prop({ required: false })
  description?: string;

  @AutoMap()
  @Prop({ required: true, enum: CampaignType })
  type: CampaignType;

  @AutoMap()
  @Prop({ required: true, enum: CampaignStatus, default: CampaignStatus.DRAFT })
  status: CampaignStatus;

  @AutoMap()
  @Prop({ type: Object, default: {} })
  configuration: Record<string, any>;

  @AutoMap()
  @Prop({ type: Object, default: {} })
  targetAudience: Record<string, any>;

  @AutoMap()
  @Prop({ type: Date })
  startDate?: Date;

  @AutoMap()
  @Prop({ type: Date })
  endDate?: Date;

  @AutoMap()
  @Prop({ type: Object, default: {} })
  variants: Record<string, any>;

  @AutoMap()
  @Prop({ type: Object, default: {} })
  metrics: Record<string, any>;

  @AutoMap()
  @Prop({ default: Date.now })
  createdAt: Date;

  @AutoMap()
  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const SaasMarketingCampaignSchema = SchemaFactory.createForClass(SaasMarketingCampaignPOJO);
export class SaasMarketingCampaign extends SaasMarketingCampaignPOJO {}
