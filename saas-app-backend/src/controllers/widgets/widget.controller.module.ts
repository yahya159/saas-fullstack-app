import { Module } from '@nestjs/common';
import { WidgetServiceModule } from '@Services/widget/widget.service.module';
import { WidgetController } from './api/widget.controller';
import { PublicWidgetController } from './api/public-widget.controller';
import { WidgetPreviewPaymentController } from './api/widget-preview-payment.controller';

@Module({
  imports: [WidgetServiceModule],
  controllers: [WidgetController, PublicWidgetController, WidgetPreviewPaymentController],
  providers: [],
})
export class WidgetControllerModule {}