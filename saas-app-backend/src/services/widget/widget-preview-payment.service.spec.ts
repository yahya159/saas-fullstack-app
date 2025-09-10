import { Test, TestingModule } from '@nestjs/testing';
import { WidgetPreviewPaymentService } from './widget-preview-payment.service';
import { ConfigService } from '@nestjs/config';

describe('WidgetPreviewPaymentService', () => {
  let service: WidgetPreviewPaymentService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WidgetPreviewPaymentService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              if (key === 'STRIPE_SECRET_KEY') {
                return 'sk_test_fake_stripe_key';
              }
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<WidgetPreviewPaymentService>(WidgetPreviewPaymentService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have stripe initialized', () => {
    expect(service).toHaveProperty('stripe');
  });
});