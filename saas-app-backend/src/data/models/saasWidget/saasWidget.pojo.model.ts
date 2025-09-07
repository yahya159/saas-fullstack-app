import { AutoMap } from '@automapper/classes';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export type SaasWidgetDocument = SaasWidgetPOJO & Document;

@Schema()
export class SaasWidgetPOJO {
  @AutoMap()
  _id: mongoose.Types.ObjectId;

  @AutoMap()
  @Prop({ required: true })
  name: string;

  @AutoMap()
  @Prop()
  description?: string;

  @AutoMap()
  @Prop({ type: Object, required: true })
  configuration: {
    columns: Array<{
      id: string;
      order: number;
      widthFraction: number;
      blocks: Array<{
        id: string;
        type: string;
        text?: string;
        order: number;
        planTierId?: string;
        style?: Record<string, any>;
      }>;
    }>;
    style?: {
      gap?: number;
      maxWidth?: number;
      background?: string;
    };
  };

  @AutoMap()
  @Prop()
  templateId?: string;

  @AutoMap()
  @Prop()
  attachedPlanId?: string;

  @AutoMap()
  @Prop({ default: true })
  isPublic: boolean;

  @AutoMap()
  @Prop({ default: true })
  isActive: boolean;

  @AutoMap()
  @Prop()
  applicationId?: mongoose.Types.ObjectId;

  @AutoMap()
  @Prop({ default: Date.now })
  createdAt: Date;

  @AutoMap()
  @Prop({ default: Date.now })
  updatedAt: Date;

  @AutoMap()
  @Prop()
  createdBy?: mongoose.Types.ObjectId;
}

export const SaasWidgetSchema = SchemaFactory.createForClass(SaasWidgetPOJO);
