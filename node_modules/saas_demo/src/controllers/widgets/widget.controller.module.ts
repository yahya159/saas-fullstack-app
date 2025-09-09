import { Module } from '@nestjs/common';
import { WidgetServiceModule } from '@Services/widget/widget.service.module';
import { WidgetController } from './api/widget.controller';
import { PublicWidgetController } from './api/public-widget.controller';

@Module({
  imports: [WidgetServiceModule],
  controllers: [WidgetController, PublicWidgetController],
  providers: [],
})
export class WidgetControllerModule {}
