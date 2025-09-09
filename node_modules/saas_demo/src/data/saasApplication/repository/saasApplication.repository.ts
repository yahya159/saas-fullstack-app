import { Injectable } from '@nestjs/common';
import mongoose, { Model, ObjectId } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  SaasApplicationDocument,
  SaasApplicationPOJO,
} from '@Data/models/saasApplication/saasApplication.pojo.model';
import { SaasWorkspacePOJO } from '@Data/models/saasworkspace/saasWorkspace.pojo.model';
import { SaasOfferPOJO } from '@Data/models/saasOffer/saasOffer.pojo.model';
import { GetOfferDTO } from '@Services/dto/offer/get-offer.dto';

@Injectable()
export class SaasApplicationRepository {
  constructor(
    @InjectModel(SaasApplicationPOJO.name)
    private saasApplicationModel: Model<SaasApplicationDocument>,
  ) {}

  async createSaasApplication(
    saasApplicationPOJO: SaasApplicationPOJO,
  ): Promise<SaasApplicationPOJO> {
    const newApplication = new this.saasApplicationModel(saasApplicationPOJO);
    return await newApplication.save();
  }
  async getAllSaasApplications(): Promise<SaasApplicationPOJO[]> {
    return await this.saasApplicationModel.find();
  }
}
