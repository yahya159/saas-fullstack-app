import { Injectable } from '@nestjs/common';
import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { SaasWidgetDocument, SaasWidgetPOJO } from '@Data/models/saasWidget/saasWidget.pojo.model';

@Injectable()
export class SaasWidgetRepository {
  constructor(
    @InjectModel(SaasWidgetPOJO.name)
    private saasWidgetModel: Model<SaasWidgetDocument>,
  ) {}

  async create(widgetData: Partial<SaasWidgetPOJO>): Promise<SaasWidgetPOJO> {
    const widget = new this.saasWidgetModel({
      ...widgetData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return widget.save();
  }

  async findById(id: mongoose.Types.ObjectId): Promise<SaasWidgetPOJO | null> {
    return this.saasWidgetModel.findById(id).exec();
  }

  async findByIdPublic(id: mongoose.Types.ObjectId): Promise<SaasWidgetPOJO | null> {
    return this.saasWidgetModel.findOne({ _id: id, isPublic: true, isActive: true }).exec();
  }

  async findAll(): Promise<SaasWidgetPOJO[]> {
    return this.saasWidgetModel.find().exec();
  }

  async findByApplication(applicationId: mongoose.Types.ObjectId): Promise<SaasWidgetPOJO[]> {
    return this.saasWidgetModel.find({ applicationId }).exec();
  }

  async findPublicByApplication(applicationId: mongoose.Types.ObjectId): Promise<SaasWidgetPOJO[]> {
    return this.saasWidgetModel.find({ applicationId, isPublic: true, isActive: true }).exec();
  }

  async update(
    id: mongoose.Types.ObjectId,
    updates: Partial<SaasWidgetPOJO>,
  ): Promise<SaasWidgetPOJO | null> {
    return this.saasWidgetModel
      .findByIdAndUpdate(id, { ...updates, updatedAt: new Date() }, { new: true })
      .exec();
  }

  async delete(id: mongoose.Types.ObjectId): Promise<boolean> {
    const result = await this.saasWidgetModel.deleteOne({ _id: id }).exec();
    return result.deletedCount > 0;
  }

  async togglePublic(id: mongoose.Types.ObjectId): Promise<SaasWidgetPOJO | null> {
    const widget = await this.findById(id);
    if (widget) {
      return this.update(id, { isPublic: !widget.isPublic });
    }
    return null;
  }

  async toggleActive(id: mongoose.Types.ObjectId): Promise<SaasWidgetPOJO | null> {
    const widget = await this.findById(id);
    if (widget) {
      return this.update(id, { isActive: !widget.isActive });
    }
    return null;
  }

  async findByCreator(createdBy: mongoose.Types.ObjectId): Promise<SaasWidgetPOJO[]> {
    return this.saasWidgetModel.find({ createdBy }).exec();
  }

  async search(query: string): Promise<SaasWidgetPOJO[]> {
    return this.saasWidgetModel
      .find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
        ],
      })
      .exec();
  }
}
