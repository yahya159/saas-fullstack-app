import { Module } from '@nestjs/common';
import { WidgetPreviewPaymentService } from './widget-preview-payment.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [WidgetPreviewPaymentService],
  exports: [WidgetPreviewPaymentService],
})
export class WidgetPreviewPaymentModule {}