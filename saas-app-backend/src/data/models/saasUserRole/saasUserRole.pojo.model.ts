import { AutoMap } from '@automapper/classes';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';

export type SaasUserRoleDocument = SaasUserRole & Document;

@Schema()
export class SaasUserRolePOJO {
  @AutoMap()
  _id: mongoose.Types.ObjectId;

  @AutoMap()
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'UserPOJO' })
  user: mongoose.Types.ObjectId;

  @AutoMap()
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'SaasRolePOJO' })
  role: mongoose.Types.ObjectId;

  @AutoMap()
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'SaasApplicationPOJO' })
  application: mongoose.Types.ObjectId;

  @AutoMap()
  @Prop({ required: false, type: mongoose.Schema.Types.ObjectId, ref: 'SaasWorkspacePOJO' })
  workspace?: mongoose.Types.ObjectId;

  @AutoMap()
  @Prop({ default: true })
  isActive: boolean;

  @AutoMap()
  @Prop({ type: Date })
  expiresAt?: Date;

  @AutoMap()
  @Prop({ type: Object, default: {} })
  customPermissions: Record<string, any>;

  @AutoMap()
  @Prop({ default: Date.now })
  assignedAt: Date;

  @AutoMap()
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'UserPOJO' })
  assignedBy?: mongoose.Types.ObjectId;
}

export const SaasUserRoleSchema = SchemaFactory.createForClass(SaasUserRolePOJO);
export class SaasUserRole extends SaasUserRolePOJO {}
