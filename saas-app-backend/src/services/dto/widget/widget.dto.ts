import { AutoMap } from '@automapper/classes';
import { IsNotEmpty, IsOptional, IsBoolean, IsString } from 'class-validator';
import mongoose from 'mongoose';

export class CreateWidgetDTO {
  @AutoMap()
  @IsNotEmpty()
  @IsString()
  name: string;

  @AutoMap()
  @IsOptional()
  @IsString()
  description?: string;

  @AutoMap()
  @IsNotEmpty()
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
  @IsOptional()
  @IsString()
  templateId?: string;

  @AutoMap()
  @IsOptional()
  @IsString()
  attachedPlanId?: string;

  @AutoMap()
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @AutoMap()
  @IsOptional()
  applicationId?: mongoose.Types.ObjectId;

  @AutoMap()
  @IsOptional()
  createdBy?: mongoose.Types.ObjectId;
}

export class UpdateWidgetDTO {
  @AutoMap()
  @IsOptional()
  @IsString()
  name?: string;

  @AutoMap()
  @IsOptional()
  @IsString()
  description?: string;

  @AutoMap()
  @IsOptional()
  configuration?: {
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
  @IsOptional()
  @IsString()
  templateId?: string;

  @AutoMap()
  @IsOptional()
  @IsString()
  attachedPlanId?: string;

  @AutoMap()
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @AutoMap()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
