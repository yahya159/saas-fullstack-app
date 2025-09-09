import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import mongoose from 'mongoose';
import { ParseObjectIdPipe } from '@app/common/pipes/parse-object-id.pipe';
import { PlanFeatureService } from '@Services/planFeature/planFeature.service';
import {
  CreatePlanFeatureDTO,
  UpdatePlanFeatureDTO,
  PlanFeatureConfigurationDTO,
  PlanFeatureLimitsDTO,
} from '@Services/dto/planFeature/planFeature.dto';
import { SaasPlanFeaturePOJO } from '@Data/models/saasPlanFeature/saasPlanFeature.pojo.model';
import { PLAN_FEATURE_API_PATHS } from '../api-paths/plan-feature-api-paths';

@Controller(PLAN_FEATURE_API_PATHS.ROOT_PATH)
export class PlanFeatureController {
  constructor(private readonly planFeatureService: PlanFeatureService) {}

  @Post(PLAN_FEATURE_API_PATHS.CREATE_PATH)
  @HttpCode(HttpStatus.CREATED)
  async createPlanFeature(@Body() createDto: CreatePlanFeatureDTO): Promise<SaasPlanFeaturePOJO> {
    return this.planFeatureService.createPlanFeature(createDto);
  }

  @Get(PLAN_FEATURE_API_PATHS.GET_PLAN_FEATURES_PATH)
  async getPlanFeatures(
    @Param('planId', ParseObjectIdPipe) planId: mongoose.Types.ObjectId,
  ): Promise<SaasPlanFeaturePOJO[]> {
    return this.planFeatureService.getPlanFeatures(planId);
  }

  @Get(PLAN_FEATURE_API_PATHS.GET_FEATURE_PLANS_PATH)
  async getFeaturePlans(
    @Param('featureId', ParseObjectIdPipe) featureId: mongoose.Types.ObjectId,
  ): Promise<SaasPlanFeaturePOJO[]> {
    return this.planFeatureService.getFeaturePlans(featureId);
  }

  @Get(PLAN_FEATURE_API_PATHS.GET_PLAN_FEATURE_PATH)
  async getPlanFeature(
    @Param('planId', ParseObjectIdPipe) planId: mongoose.Types.ObjectId,
    @Param('featureId', ParseObjectIdPipe) featureId: mongoose.Types.ObjectId,
  ): Promise<SaasPlanFeaturePOJO> {
    return this.planFeatureService.getPlanFeature(planId, featureId);
  }

  @Put(PLAN_FEATURE_API_PATHS.UPDATE_PATH)
  async updatePlanFeature(
    @Param('planId', ParseObjectIdPipe) planId: mongoose.Types.ObjectId,
    @Param('featureId', ParseObjectIdPipe) featureId: mongoose.Types.ObjectId,
    @Body() updateDto: UpdatePlanFeatureDTO,
  ): Promise<SaasPlanFeaturePOJO> {
    return this.planFeatureService.updatePlanFeature(planId, featureId, updateDto);
  }

  @Put(PLAN_FEATURE_API_PATHS.UPDATE_CONFIG_PATH)
  async updateConfiguration(
    @Param('planId', ParseObjectIdPipe) planId: mongoose.Types.ObjectId,
    @Param('featureId', ParseObjectIdPipe) featureId: mongoose.Types.ObjectId,
    @Body() configuration: Record<string, any>,
  ): Promise<SaasPlanFeaturePOJO> {
    const configDto: PlanFeatureConfigurationDTO = {
      planId,
      featureId,
      configuration,
    };
    return this.planFeatureService.updateConfiguration(configDto);
  }

  @Put(PLAN_FEATURE_API_PATHS.UPDATE_LIMITS_PATH)
  async updateLimits(
    @Param('planId', ParseObjectIdPipe) planId: mongoose.Types.ObjectId,
    @Param('featureId', ParseObjectIdPipe) featureId: mongoose.Types.ObjectId,
    @Body() limits: Record<string, number | string>,
  ): Promise<SaasPlanFeaturePOJO> {
    const limitsDto: PlanFeatureLimitsDTO = {
      planId,
      featureId,
      limits,
    };
    return this.planFeatureService.updateLimits(limitsDto);
  }

  @Put(PLAN_FEATURE_API_PATHS.ENABLE_PATH)
  async enableFeature(
    @Param('planId', ParseObjectIdPipe) planId: mongoose.Types.ObjectId,
    @Param('featureId', ParseObjectIdPipe) featureId: mongoose.Types.ObjectId,
  ): Promise<SaasPlanFeaturePOJO> {
    return this.planFeatureService.enableFeature(planId, featureId);
  }

  @Put(PLAN_FEATURE_API_PATHS.DISABLE_PATH)
  async disableFeature(
    @Param('planId', ParseObjectIdPipe) planId: mongoose.Types.ObjectId,
    @Param('featureId', ParseObjectIdPipe) featureId: mongoose.Types.ObjectId,
  ): Promise<SaasPlanFeaturePOJO> {
    return this.planFeatureService.disableFeature(planId, featureId);
  }

  @Put(PLAN_FEATURE_API_PATHS.TOGGLE_PATH)
  async toggleFeature(
    @Param('planId', ParseObjectIdPipe) planId: mongoose.Types.ObjectId,
    @Param('featureId', ParseObjectIdPipe) featureId: mongoose.Types.ObjectId,
  ): Promise<SaasPlanFeaturePOJO> {
    return this.planFeatureService.toggleFeature(planId, featureId);
  }

  @Delete(PLAN_FEATURE_API_PATHS.DELETE_PATH)
  @HttpCode(HttpStatus.NO_CONTENT)
  async removePlanFeature(
    @Param('planId', ParseObjectIdPipe) planId: mongoose.Types.ObjectId,
    @Param('featureId', ParseObjectIdPipe) featureId: mongoose.Types.ObjectId,
  ): Promise<void> {
    return this.planFeatureService.removePlanFeature(planId, featureId);
  }

  @Delete(PLAN_FEATURE_API_PATHS.DELETE_ALL_PATH)
  async removeAllPlanFeatures(
    @Param('planId', ParseObjectIdPipe) planId: mongoose.Types.ObjectId,
  ): Promise<{ deletedCount: number }> {
    const deletedCount = await this.planFeatureService.removeAllPlanFeatures(planId);
    return { deletedCount };
  }
}
