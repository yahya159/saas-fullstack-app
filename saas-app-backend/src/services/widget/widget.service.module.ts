import { Module } from '@nestjs/common';
import { SaasWidgetDataModule } from '@Data/saasWidget/saasWidget.data.module';
import { WidgetService } from './widget.service';
import { WidgetPreviewPaymentModule } from './widget-preview-payment.module';

@Module({
  imports: [SaasWidgetDataModule, WidgetPreviewPaymentModule],
  providers: [WidgetService],
  exports: [WidgetService, WidgetPreviewPaymentModule],
})
export class WidgetServiceModule {}