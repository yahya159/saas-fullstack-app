import { AutoMap } from '@automapper/classes';
import { IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import mongoose from 'mongoose';

export class CreatePlanFeatureDTO {
  @AutoMap()
  @IsNotEmpty()
  planId: mongoose.Types.ObjectId;

  @AutoMap()
  @IsNotEmpty()
  featureId: mongoose.Types.ObjectId;

  @AutoMap()
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @AutoMap()
  @IsOptional()
  configuration?: Record<string, any>;

  @AutoMap()
  @IsOptional()
  limits?: Record<string, number | string>;
}

export class UpdatePlanFeatureDTO {
  @AutoMap()
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @AutoMap()
  @IsOptional()
  configuration?: Record<string, any>;

  @AutoMap()
  @IsOptional()
  limits?: Record<string, number | string>;
}

export class PlanFeatureConfigurationDTO {
  @AutoMap()
  @IsNotEmpty()
  planId: mongoose.Types.ObjectId;

  @AutoMap()
  @IsNotEmpty()
  featureId: mongoose.Types.ObjectId;

  @AutoMap()
  configuration: Record<string, any>;
}

export class PlanFeatureLimitsDTO {
  @AutoMap()
  @IsNotEmpty()
  planId: mongoose.Types.ObjectId;

  @AutoMap()
  @IsNotEmpty()
  featureId: mongoose.Types.ObjectId;

  @AutoMap()
  limits: Record<string, number | string>;
}
