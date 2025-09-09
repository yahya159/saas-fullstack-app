import { Injectable } from '@nestjs/common';
import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  SaasFeatureDocument,
  SaasFeaturePOJO,
} from '@Data/models/saasFeature/saasFeature.pojo.model';

@Injectable()
export class SaasFeatureRepository {
  constructor(
    @InjectModel(SaasFeaturePOJO.name)
    private saasFeatureModel: Model<SaasFeatureDocument>,
  ) {}

  async findById(id: mongoose.Types.ObjectId): Promise<SaasFeaturePOJO | null> {
    return this.saasFeatureModel.findById(id).exec();
  }

  async findAll(): Promise<SaasFeaturePOJO[]> {
    return this.saasFeatureModel.find().exec();
  }

  async findByName(name: string): Promise<SaasFeaturePOJO | null> {
    return this.saasFeatureModel.findOne({ name }).exec();
  }

  async findByRoleId(roleId: string): Promise<SaasFeaturePOJO | null> {
    return this.saasFeatureModel.findOne({ roleId }).exec();
  }

  async findByApplication(applicationId: mongoose.Types.ObjectId): Promise<SaasFeaturePOJO[]> {
    return this.saasFeatureModel.find({ application: applicationId }).exec();
  }

  async create(featureData: Partial<SaasFeaturePOJO>): Promise<SaasFeaturePOJO> {
    const feature = new this.saasFeatureModel(featureData);
    return feature.save();
  }

  async update(
    id: mongoose.Types.ObjectId,
    updates: Partial<SaasFeaturePOJO>,
  ): Promise<SaasFeaturePOJO | null> {
    return this.saasFeatureModel.findByIdAndUpdate(id, updates, { new: true }).exec();
  }

  async delete(id: mongoose.Types.ObjectId): Promise<boolean> {
    const result = await this.saasFeatureModel.deleteOne({ _id: id }).exec();
    return result.deletedCount > 0;
  }

  async findMultipleByIds(ids: mongoose.Types.ObjectId[]): Promise<SaasFeaturePOJO[]> {
    return this.saasFeatureModel.find({ _id: { $in: ids } }).exec();
  }

  async searchByName(searchTerm: string): Promise<SaasFeaturePOJO[]> {
    return this.saasFeatureModel.find({ name: { $regex: searchTerm, $options: 'i' } }).exec();
  }
}
