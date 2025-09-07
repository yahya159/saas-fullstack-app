import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SaasApplicationRepository } from '@Data/saasApplication/repository/saasApplication.repository';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const mockSaasApplicationRepository = {
      // Mock any methods that are used
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: SaasApplicationRepository,
          useValue: mockSaasApplicationRepository,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', async () => {
      const result = await appController.getHello();
      expect(result).toBe('Hello World!');
    });
  });
});
