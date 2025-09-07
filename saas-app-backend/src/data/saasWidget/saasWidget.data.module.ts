import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SaasWidgetPOJO, SaasWidgetSchema } from '@Data/models/saasWidget/saasWidget.pojo.model';
import { SaasWidgetRepository } from './repository/saasWidget.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: SaasWidgetPOJO.name,
        schema: SaasWidgetSchema,
        collection: 'SaasWidgets',
      },
    ]),
  ],
  providers: [SaasWidgetRepository],
  exports: [SaasWidgetRepository],
})
export class SaasWidgetDataModule {}
