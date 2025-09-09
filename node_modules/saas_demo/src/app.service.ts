import { SaasApplicationRepository } from '@Data/saasApplication/repository/saasApplication.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  constructor(private readonly saasAppRepo: SaasApplicationRepository) {}
  async getHello(): Promise<string> {
    return 'Hello World!';
  }
}
