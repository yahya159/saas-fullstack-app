import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { SaasOfferPOJO } from '@Data/models/saasOffer/saasOffer.pojo.model';
import mongoose from 'mongoose';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getHello(): Promise<string> {
    return await this.appService.getHello();
  }

  @Post()
  async egetHello(): Promise<string> {
    return await this.appService.getHello();
  }
}
