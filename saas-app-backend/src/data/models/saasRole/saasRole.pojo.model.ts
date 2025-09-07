import { AutoMap } from '@automapper/classes';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';

export type SaasRoleDocument = SaasRole & Document;

export enum RoleType {
  // Provider Side (Our Organization)
  SAAS_PLATFORM_ADMIN = 'SAAS_PLATFORM_ADMIN',
  SAAS_PLATFORM_MANAGER = 'SAAS_PLATFORM_MANAGER',

  // Client Side (User Organizations)
  CUSTOMER_ADMIN = 'CUSTOMER_ADMIN',
  CUSTOMER_MANAGER = 'CUSTOMER_MANAGER',
  CUSTOMER_DEVELOPER = 'CUSTOMER_DEVELOPER',
}

export enum AccessLevel {
  READ = 'READ',
  WRITE = 'WRITE',
  ADMIN = 'ADMIN',
  FULL_CONTROL = 'FULL_CONTROL',
}

@Schema()
export class SaasRolePOJO {
  @AutoMap()
  _id: mongoose.Types.ObjectId;

  @AutoMap()
  @Prop({ required: true, enum: RoleType })
  roleType: RoleType;

  @AutoMap()
  @Prop({ required: true })
  name: string;

  @AutoMap()
  @Prop({ required: true })
  description: string;

  @AutoMap()
  @Prop({ type: [String], default: [] })
  responsibilities: string[];

  @AutoMap()
  @Prop({ type: Object, default: {} })
  permissions: {
    // System Access
    systemConfiguration?: AccessLevel;
    platformMetrics?: AccessLevel;
    infrastructureManagement?: AccessLevel;

    // Commercial Access
    clientRelations?: AccessLevel;
    commercialMetrics?: AccessLevel;
    customerSupport?: AccessLevel;

    // Technical Access
    technicalConfiguration?: AccessLevel;
    securityValidation?: AccessLevel;
    teamManagement?: AccessLevel;

    // Marketing Access
    marketingDashboard?: AccessLevel;
    abTestConfiguration?: AccessLevel;
    userAnalytics?: AccessLevel;

    // Developer Access
    apiDocumentation?: AccessLevel;
    sandboxAccess?: AccessLevel;
    debuggingTools?: AccessLevel;
  };

  @AutoMap()
  @Prop({ type: Object, default: {} })
  restrictions: {
    maxApplications?: number;
    maxCampaigns?: number;
    maxApiCalls?: number;
    features?: string[];
  };

  @AutoMap()
  @Prop({ default: true })
  isActive: boolean;

  @AutoMap()
  @Prop({ default: Date.now })
  createdAt: Date;

  @AutoMap()
  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const SaasRoleSchema = SchemaFactory.createForClass(SaasRolePOJO);
export class SaasRole extends SaasRolePOJO {}
