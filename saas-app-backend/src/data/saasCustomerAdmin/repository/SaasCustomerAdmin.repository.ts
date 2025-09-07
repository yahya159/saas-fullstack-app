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

  async createCustomerAdmin(saasCustomerAdminPOJO: SaasCustomerAdminPOJO): Promise<SaasCustomerAdminDocument> {
    try {
      return await this.saasCustomerAdminmodel.create(saasCustomerAdminPOJO);
    } catch (e) {
      console.error('Error creating customer admin:', e);
      if (e.code === 11000) {
        // Duplicate key error
        const field = Object.keys(e.keyPattern || {})[0] || 'field';
        throw new HttpException(`User with this ${field} already exists`, HttpStatus.CONFLICT);
      }
      throw new HttpException(`Creating user failed: ${e.message || 'Unknown error'}`, HttpStatus.BAD_REQUEST);
    }
  }

  async findByEmail(email: string): Promise<SaasCustomerAdminDocument | null> {
    try {
      return await this.saasCustomerAdminmodel.findOne({ email }).exec();
    } catch (e) {
      throw new HttpException('finding user by email failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findById(id: string): Promise<SaasCustomerAdminDocument | null> {
    try {
      return await this.saasCustomerAdminmodel.findById(id).exec();
    } catch (e) {
      throw new HttpException('finding user by id failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateUser(id: string, updateData: Partial<SaasCustomerAdminPOJO>): Promise<SaasCustomerAdminDocument | null> {
    try {
      return await this.saasCustomerAdminmodel.findByIdAndUpdate(id, updateData, { new: true }).exec();
    } catch (e) {
      throw new HttpException('updating user failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      const result = await this.saasCustomerAdminmodel.findByIdAndDelete(id).exec();
      return !!result;
    } catch (e) {
      throw new HttpException('deleting user failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll(): Promise<SaasCustomerAdminDocument[]> {
    try {
      return await this.saasCustomerAdminmodel.find().exec();
    } catch (e) {
      throw new HttpException('finding all users failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
