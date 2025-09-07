import { ApplicationModule } from './application/application-service.module';
import { PaymentServiceModule } from './payment/payment-service.module';
import { SecurityServiceModule } from './security/security-service.module';
import { UserServiceModule } from './user/user-service.module';
import { PlanFeatureServiceModule } from './planFeature/planFeature.service.module';
import { WidgetServiceModule } from './widget/widget.service.module';
import { MarketingServiceModule } from './marketing/marketing.service.module';
import { RoleManagementServiceModule } from './roleManagement/roleManagement.service.module';

const servicesModules = [
  ApplicationModule,
  SecurityServiceModule,
  UserServiceModule,
  PaymentServiceModule,
  PlanFeatureServiceModule,
  WidgetServiceModule,
  MarketingServiceModule,
  RoleManagementServiceModule,
];
export { servicesModules };
