import { AutoMap } from '@automapper/classes';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { SaasWorkspacePOJO } from '@Data/models/saasworkspace/saasWorkspace.pojo.model'
import { SaasApplicationConfigurationPOJO } from '../saasApplicationConfiguration/saasApplicationConfiguration.pojo.model';
import { SaasOfferPOJO } from '../saasOffer/saasOffer.pojo.model';
import { SaasPlanPOJO } from '../saasPlan/saasPlan.pojo.model';
import { SaasFeaturePOJO } from '../saasFeature/saasFeature.pojo.model';




export type SaasApplicationDocument = SaasApplicationPOJO & Document;

@Schema()
export class SaasApplicationPOJO {
  @AutoMap()
  _id: mongoose.Types.ObjectId;

  @AutoMap()
  @Prop()
  realmClientId: string;

  @Prop()
  @AutoMap()
  realmClientSecret: string;

  @Prop()
  @AutoMap()
  saasClientSecret: string;

  @Prop()
  @AutoMap()
  applicationName: string;

  @Prop()
  @AutoMap()
  createdAt: Date;

  @AutoMap(() => SaasWorkspacePOJO)
  @Prop({
    required: false,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SaasWorkspacePOJO',
  })
  workspace?: SaasWorkspacePOJO;

  @AutoMap(() => SaasApplicationConfigurationPOJO)
  @Prop({
    required: false,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SaasApplicationConfigurationPOJO',
  })
  applicationConfiguration?: SaasApplicationConfigurationPOJO;

  @AutoMap(() => [SaasOfferPOJO])
  @Prop({
    required: false,
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'SaasOfferPOJO',
  })
  offers?: SaasOfferPOJO[];

  @AutoMap(() => [SaasPlanPOJO])
  @Prop({
    required: false,
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'SaasPlanPOJO',
  })
  plans?: SaasPlanPOJO[];

  @AutoMap(() => [SaasFeaturePOJO])
  @Prop({
    required: false,
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'SaasFeaturePOJO',
  })
  features?: SaasFeaturePOJO[];
}

export const SaasApplicationSchema = SchemaFactory.createForClass(SaasApplicationPOJO);
