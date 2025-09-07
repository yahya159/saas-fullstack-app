import { AuthControllerModule } from './auth/auth.controller.module';
import { PlanFeatureControllerModule } from './planFeature/plan-feature.controller.module';
import { WidgetControllerModule } from './widgets/widget.controller.module';
// import { MarketingControllerModule } from './marketing/marketing.controller.module';
import { RoleManagementControllerModule } from './roleManagement/roleManagement.controller.module';

const controllerModules = [
  AuthControllerModule,
  PlanFeatureControllerModule,
  WidgetControllerModule,
  RoleManagementControllerModule,
];
export { controllerModules };
