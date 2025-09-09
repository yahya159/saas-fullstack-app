import { Injectable } from '@nestjs/common';
import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  SaasPlanFeatureDocument,
  SaasPlanFeaturePOJO,
} from '@Data/models/saasPlanFeature/saasPlanFeature.pojo.model';

@Injectable()
export class SaasPlanFeatureRepository {
  constructor(
    @InjectModel(SaasPlanFeaturePOJO.name)
    private saasPlanFeatureModel: Model<SaasPlanFeatureDocument>,
  ) {}

  async createPlanFeature(
    planId: mongoose.Types.ObjectId,
    featureId: mongoose.Types.ObjectId,
    configuration: Record<string, any> = {},
    limits: Record<string, number | string> = {},
    enabled = true,
  ): Promise<SaasPlanFeaturePOJO> {
    const planFeature = new this.saasPlanFeatureModel({
      plan: planId,
      feature: featureId,
      enabled,
      configuration,
      limits,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return planFeature.save();
  }

  async getPlanFeatures(planId: mongoose.Types.ObjectId): Promise<SaasPlanFeaturePOJO[]> {
    return this.saasPlanFeatureModel.find({ plan: planId }).populate('feature').exec();
  }

  async getFeaturePlans(featureId: mongoose.Types.ObjectId): Promise<SaasPlanFeaturePOJO[]> {
    return this.saasPlanFeatureModel.find({ feature: featureId }).populate('plan').exec();
  }

  async getPlanFeature(
    planId: mongoose.Types.ObjectId,
    featureId: mongoose.Types.ObjectId,
  ): Promise<SaasPlanFeaturePOJO | null> {
    return this.saasPlanFeatureModel
      .findOne({ plan: planId, feature: featureId })
      .populate(['plan', 'feature'])
      .exec();
  }

  async updatePlanFeature(
    planId: mongoose.Types.ObjectId,
    featureId: mongoose.Types.ObjectId,
    updates: Partial<SaasPlanFeaturePOJO>,
  ): Promise<SaasPlanFeaturePOJO | null> {
    return this.saasPlanFeatureModel
      .findOneAndUpdate(
        { plan: planId, feature: featureId },
        { ...updates, updatedAt: new Date() },
        { new: true },
      )
      .populate(['plan', 'feature'])
      .exec();
  }

  async updateFeatureConfiguration(
    planId: mongoose.Types.ObjectId,
    featureId: mongoose.Types.ObjectId,
    configuration: Record<string, any>,
  ): Promise<SaasPlanFeaturePOJO | null> {
    return this.updatePlanFeature(planId, featureId, { configuration });
  }

  async updateFeatureLimits(
    planId: mongoose.Types.ObjectId,
    featureId: mongoose.Types.ObjectId,
    limits: Record<string, number | string>,
  ): Promise<SaasPlanFeaturePOJO | null> {
    return this.updatePlanFeature(planId, featureId, { limits });
  }

  async toggleFeature(
    planId: mongoose.Types.ObjectId,
    featureId: mongoose.Types.ObjectId,
  ): Promise<SaasPlanFeaturePOJO | null> {
    const planFeature = await this.getPlanFeature(planId, featureId);
    if (planFeature) {
      return this.updatePlanFeature(planId, featureId, {
        enabled: !planFeature.enabled,
      });
    }
    return null;
  }

  async enableFeature(
    planId: mongoose.Types.ObjectId,
    featureId: mongoose.Types.ObjectId,
  ): Promise<SaasPlanFeaturePOJO | null> {
    return this.updatePlanFeature(planId, featureId, { enabled: true });
  }

  async disableFeature(
    planId: mongoose.Types.ObjectId,
    featureId: mongoose.Types.ObjectId,
  ): Promise<SaasPlanFeaturePOJO | null> {
    return this.updatePlanFeature(planId, featureId, { enabled: false });
  }

  async removePlanFeature(
    planId: mongoose.Types.ObjectId,
    featureId: mongoose.Types.ObjectId,
  ): Promise<boolean> {
    const result = await this.saasPlanFeatureModel
      .deleteOne({ plan: planId, feature: featureId })
      .exec();
    return result.deletedCount > 0;
  }

  async removeAllPlanFeatures(planId: mongoose.Types.ObjectId): Promise<number> {
    const result = await this.saasPlanFeatureModel.deleteMany({ plan: planId }).exec();
    return result.deletedCount;
  }

  async getPlanFeaturesByApplication(
    applicationId: mongoose.Types.ObjectId,
  ): Promise<SaasPlanFeaturePOJO[]> {
    return this.saasPlanFeatureModel
      .find()
      .populate({
        path: 'plan',
        match: { application: applicationId },
      })
      .populate('feature')
      .exec()
      .then((results) => results.filter((item) => item.plan !== null));
  }

  async checkUserAccess(
    userId: mongoose.Types.ObjectId,
    featureId: mongoose.Types.ObjectId,
  ): Promise<SaasPlanFeaturePOJO | null> {
    // Cette méthode nécessiterait une jointure avec les abonnements utilisateur
    // Pour l'instant, on retourne null, à implémenter selon la logique métier
    return null;
  }
}
