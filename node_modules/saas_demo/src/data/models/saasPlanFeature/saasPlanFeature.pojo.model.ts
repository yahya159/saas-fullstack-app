import { AutoMap } from '@automapper/classes';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { SaasPlanPOJO } from '../saasPlan/saasPlan.pojo.model';
import { SaasFeaturePOJO } from '../saasFeature/saasFeature.pojo.model';

export type SaasPlanFeatureDocument = SaasPlanFeaturePOJO & Document;

@Schema()
export class SaasPlanFeaturePOJO {
  @AutoMap()
  _id: mongoose.Types.ObjectId;

  @AutoMap(() => SaasPlanPOJO)
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SaasPlanPOJO',
  })
  plan: SaasPlanPOJO;

  @AutoMap(() => SaasFeaturePOJO)
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SaasFeaturePOJO',
  })
  feature: SaasFeaturePOJO;

  @AutoMap()
  @Prop({ default: true })
  enabled: boolean;

  @AutoMap()
  @Prop({ type: Object, default: {} })
  configuration: Record<string, any>;

  @AutoMap()
  @Prop({ type: Object, default: {} })
  limits: Record<string, number | string>;

  @AutoMap()
  @Prop({ default: Date.now })
  createdAt: Date;

  @AutoMap()
  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const SaasPlanFeatureSchema = SchemaFactory.createForClass(SaasPlanFeaturePOJO);

// Index pour améliorer les performances des requêtes
SaasPlanFeatureSchema.index({ plan: 1, feature: 1 }, { unique: true });
