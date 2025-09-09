import { Injectable } from '@nestjs/common';
import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { SaasPlanDocument, SaasPlanPOJO } from '@Data/models/saasPlan/saasPlan.pojo.model';

@Injectable()
export class SaasPlanRepository {
  constructor(
    @InjectModel(SaasPlanPOJO.name)
    private saasPlanModel: Model<SaasPlanDocument>,
  ) {}

  async findById(id: mongoose.Types.ObjectId): Promise<SaasPlanPOJO | null> {
    return this.saasPlanModel.findById(id).exec();
  }

  async findAll(): Promise<SaasPlanPOJO[]> {
    return this.saasPlanModel.find().exec();
  }

  async findByGroupId(groupId: string): Promise<SaasPlanPOJO[]> {
    return this.saasPlanModel.find({ groupId }).exec();
  }

  async findByApplication(applicationId: mongoose.Types.ObjectId): Promise<SaasPlanPOJO[]> {
    return this.saasPlanModel.find({ appliation: applicationId }).exec();
  }

  async create(planData: Partial<SaasPlanPOJO>): Promise<SaasPlanPOJO> {
    const plan = new this.saasPlanModel(planData);
    return plan.save();
  }

  async update(
    id: mongoose.Types.ObjectId,
    updates: Partial<SaasPlanPOJO>,
  ): Promise<SaasPlanPOJO | null> {
    return this.saasPlanModel.findByIdAndUpdate(id, updates, { new: true }).exec();
  }

  async delete(id: mongoose.Types.ObjectId): Promise<boolean> {
    const result = await this.saasPlanModel.deleteOne({ _id: id }).exec();
    return result.deletedCount > 0;
  }
}
