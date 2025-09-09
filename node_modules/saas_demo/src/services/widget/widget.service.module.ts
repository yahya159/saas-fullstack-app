import { Module } from '@nestjs/common';
import { SaasWidgetDataModule } from '@Data/saasWidget/saasWidget.data.module';
import { WidgetService } from './widget.service';

@Module({
  imports: [SaasWidgetDataModule],
  providers: [WidgetService],
  exports: [WidgetService],
})
export class WidgetServiceModule {}
