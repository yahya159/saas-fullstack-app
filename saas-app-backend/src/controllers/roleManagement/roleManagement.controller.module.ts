import { Module } from '@nestjs/common';
import { RoleManagementController } from './api/role-management.controller';
import { RoleManagementServiceModule } from '@Services/roleManagement/roleManagement.service.module';

@Module({
  imports: [RoleManagementServiceModule],
  controllers: [RoleManagementController],
})
export class RoleManagementControllerModule {}
