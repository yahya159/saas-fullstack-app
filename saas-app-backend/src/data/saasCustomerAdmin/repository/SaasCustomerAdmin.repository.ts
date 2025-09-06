import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  SaasCustomerAdminDocument,
  SaasCustomerAdminPOJO,
} from '@Data/models/saasCustomerAdmin/saasCustomerAdmin.pojo.model';

@Injectable()
export class SaasCustomerAdminRepository {
  constructor(
    @InjectModel(SaasCustomerAdminPOJO.name)
    private saasCustomerAdminmodel: Model<SaasCustomerAdminDocument>,
  ) {}

  async createCustomerAdmin(saasCustomerAdminPOJO: SaasCustomerAdminPOJO) {
    try {
      await this.saasCustomerAdminmodel.create(saasCustomerAdminPOJO);
    } catch (e) {
      throw new HttpException('creating user failed', HttpStatus.BAD_REQUEST);
    }
  }
}
