import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import mongoose from 'mongoose';
import { SaasPlanFeatureRepository } from '@Data/saasPlanFeature/repository/saasPlanFeature.repository';
import { SaasPlanRepository } from '@Data/saasPlan/repository/saasPlan.repository';
import { SaasFeatureRepository } from '@Data/saasFeature/repository/saasFeature.repository';
import {
  CreatePlanFeatureDTO,
  UpdatePlanFeatureDTO,
  PlanFeatureConfigurationDTO,
  PlanFeatureLimitsDTO,
} from '@Services/dto/planFeature/planFeature.dto';
import { SaasPlanFeaturePOJO } from '@Data/models/saasPlanFeature/saasPlanFeature.pojo.model';

@Injectable()
export class PlanFeatureService {
  constructor(
    private readonly planFeatureRepository: SaasPlanFeatureRepository,
    private readonly planRepository: SaasPlanRepository,
    private readonly featureRepository: SaasFeatureRepository,
  ) {}

  async createPlanFeature(createDto: CreatePlanFeatureDTO): Promise<SaasPlanFeaturePOJO> {
    // Vérifier que le plan existe
    const plan = await this.planRepository.findById(createDto.planId);
    if (!plan) {
      throw new NotFoundException(`Plan with ID ${createDto.planId} not found`);
    }

    // Vérifier que la feature existe
    const feature = await this.featureRepository.findById(createDto.featureId);
    if (!feature) {
      throw new NotFoundException(`Feature with ID ${createDto.featureId} not found`);
    }

    // Vérifier qu'il n'existe pas déjà une relation
    const existingRelation = await this.planFeatureRepository.getPlanFeature(
      createDto.planId,
      createDto.featureId,
    );
    if (existingRelation) {
      throw new ConflictException(
        `Plan feature relation already exists for plan ${createDto.planId} and feature ${createDto.featureId}`,
      );
    }

    return this.planFeatureRepository.createPlanFeature(
      createDto.planId,
      createDto.featureId,
      createDto.configuration || {},
      createDto.limits || {},
      createDto.enabled ?? true,
    );
  }

  async getPlanFeatures(planId: mongoose.Types.ObjectId): Promise<SaasPlanFeaturePOJO[]> {
    return this.planFeatureRepository.getPlanFeatures(planId);
  }

  async getFeaturePlans(featureId: mongoose.Types.ObjectId): Promise<SaasPlanFeaturePOJO[]> {
    return this.planFeatureRepository.getFeaturePlans(featureId);
  }

  async getPlanFeature(
    planId: mongoose.Types.ObjectId,
    featureId: mongoose.Types.ObjectId,
  ): Promise<SaasPlanFeaturePOJO> {
    const planFeature = await this.planFeatureRepository.getPlanFeature(planId, featureId);
    if (!planFeature) {
      throw new NotFoundException(
        `Plan feature relation not found for plan ${planId} and feature ${featureId}`,
      );
    }
    return planFeature;
  }

  async updatePlanFeature(
    planId: mongoose.Types.ObjectId,
    featureId: mongoose.Types.ObjectId,
    updateDto: UpdatePlanFeatureDTO,
  ): Promise<SaasPlanFeaturePOJO> {
    const updatedPlanFeature = await this.planFeatureRepository.updatePlanFeature(
      planId,
      featureId,
      updateDto,
    );
    if (!updatedPlanFeature) {
      throw new NotFoundException(
        `Plan feature relation not found for plan ${planId} and feature ${featureId}`,
      );
    }
    return updatedPlanFeature;
  }

  async updateConfiguration(configDto: PlanFeatureConfigurationDTO): Promise<SaasPlanFeaturePOJO> {
    const updatedPlanFeature = await this.planFeatureRepository.updateFeatureConfiguration(
      configDto.planId,
      configDto.featureId,
      configDto.configuration,
    );
    if (!updatedPlanFeature) {
      throw new NotFoundException(
        `Plan feature relation not found for plan ${configDto.planId} and feature ${configDto.featureId}`,
      );
    }
    return updatedPlanFeature;
  }

  async updateLimits(limitsDto: PlanFeatureLimitsDTO): Promise<SaasPlanFeaturePOJO> {
    const updatedPlanFeature = await this.planFeatureRepository.updateFeatureLimits(
      limitsDto.planId,
      limitsDto.featureId,
      limitsDto.limits,
    );
    if (!updatedPlanFeature) {
      throw new NotFoundException(
        `Plan feature relation not found for plan ${limitsDto.planId} and feature ${limitsDto.featureId}`,
      );
    }
    return updatedPlanFeature;
  }

  async enableFeature(
    planId: mongoose.Types.ObjectId,
    featureId: mongoose.Types.ObjectId,
  ): Promise<SaasPlanFeaturePOJO> {
    const enabledFeature = await this.planFeatureRepository.enableFeature(planId, featureId);
    if (!enabledFeature) {
      throw new NotFoundException(
        `Plan feature relation not found for plan ${planId} and feature ${featureId}`,
      );
    }
    return enabledFeature;
  }

  async disableFeature(
    planId: mongoose.Types.ObjectId,
    featureId: mongoose.Types.ObjectId,
  ): Promise<SaasPlanFeaturePOJO> {
    const disabledFeature = await this.planFeatureRepository.disableFeature(planId, featureId);
    if (!disabledFeature) {
      throw new NotFoundException(
        `Plan feature relation not found for plan ${planId} and feature ${featureId}`,
      );
    }
    return disabledFeature;
  }

  async toggleFeature(
    planId: mongoose.Types.ObjectId,
    featureId: mongoose.Types.ObjectId,
  ): Promise<SaasPlanFeaturePOJO> {
    const toggledFeature = await this.planFeatureRepository.toggleFeature(planId, featureId);
    if (!toggledFeature) {
      throw new NotFoundException(
        `Plan feature relation not found for plan ${planId} and feature ${featureId}`,
      );
    }
    return toggledFeature;
  }

  async removePlanFeature(
    planId: mongoose.Types.ObjectId,
    featureId: mongoose.Types.ObjectId,
  ): Promise<void> {
    const removed = await this.planFeatureRepository.removePlanFeature(planId, featureId);
    if (!removed) {
      throw new NotFoundException(
        `Plan feature relation not found for plan ${planId} and feature ${featureId}`,
      );
    }
  }

  async removeAllPlanFeatures(planId: mongoose.Types.ObjectId): Promise<number> {
    return this.planFeatureRepository.removeAllPlanFeatures(planId);
  }

  async getPlanFeaturesByApplication(
    applicationId: mongoose.Types.ObjectId,
  ): Promise<SaasPlanFeaturePOJO[]> {
    return this.planFeatureRepository.getPlanFeaturesByApplication(applicationId);
  }

  async validateUserAccess(userId: mongoose.Types.ObjectId, featureKey: string): Promise<boolean> {
    // TODO: Implémenter la logique de validation d'accès utilisateur
    // Ceci nécessiterait de récupérer l'abonnement actuel de l'utilisateur
    // et vérifier si la feature est activée dans son plan
    return false;
  }

  async getFeatureUsageLimit(
    planId: mongoose.Types.ObjectId,
    featureKey: string,
  ): Promise<number | string | null> {
    const planFeatures = await this.getPlanFeatures(planId);
    const planFeature = planFeatures.find(
      (pf) => pf.feature.name === featureKey || pf.feature.roleId === featureKey,
    );

    if (!planFeature || !planFeature.enabled) {
      return null;
    }

    return planFeature.limits[featureKey] || null;
  }
}
