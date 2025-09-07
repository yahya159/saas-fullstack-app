import { AutoMap } from '@automapper/classes';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';

export type SaasAnalyticsEventDocument = SaasAnalyticsEvent & Document;

export enum EventType {
  PAGE_VIEW = 'PAGE_VIEW',
  WIDGET_VIEW = 'WIDGET_VIEW',
  BUTTON_CLICK = 'BUTTON_CLICK',
  FORM_SUBMIT = 'FORM_SUBMIT',
  SIGNUP = 'SIGNUP',
  CONVERSION = 'CONVERSION',
  PURCHASE = 'PURCHASE',
  TRIAL_START = 'TRIAL_START',
  SUBSCRIPTION = 'SUBSCRIPTION',
  CUSTOM = 'CUSTOM',
}

@Schema()
export class SaasAnalyticsEventPOJO {
  @AutoMap()
  _id: mongoose.Types.ObjectId;

  @AutoMap()
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'SaasApplicationPOJO' })
  application: mongoose.Types.ObjectId;

  @AutoMap()
  @Prop({ required: false, type: mongoose.Schema.Types.ObjectId, ref: 'SaasMarketingCampaignPOJO' })
  campaign?: mongoose.Types.ObjectId;

  @AutoMap()
  @Prop({ required: true, enum: EventType })
  eventType: EventType;

  @AutoMap()
  @Prop({ required: true })
  eventName: string;

  @AutoMap()
  @Prop({ type: Object, default: {} })
  properties: Record<string, any>;

  @AutoMap()
  @Prop({ required: false })
  userId?: string;

  @AutoMap()
  @Prop({ required: false })
  sessionId?: string;

  @AutoMap()
  @Prop({ required: false })
  visitorId?: string;

  @AutoMap()
  @Prop({ required: false })
  variantId?: string; // For A/B testing

  @AutoMap()
  @Prop({ type: Object, default: {} })
  userAgent: Record<string, any>;

  @AutoMap()
  @Prop({ type: Object, default: {} })
  location: Record<string, any>;

  @AutoMap()
  @Prop({ required: false })
  referrer?: string;

  @AutoMap()
  @Prop({ type: Object, required: false })
  utm?: Record<string, any>;

  @AutoMap()
  @Prop({ type: Number, default: 0 })
  revenue?: number;

  @AutoMap()
  @Prop({ default: Date.now })
  timestamp: Date;
}

export const SaasAnalyticsEventSchema = SchemaFactory.createForClass(SaasAnalyticsEventPOJO);
export class SaasAnalyticsEvent extends SaasAnalyticsEventPOJO {}
