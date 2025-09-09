import { Module } from '@nestjs/common';
import { RoleManagementService } from './roleManagement.service';
import { SaasRoleDataModule } from '@Data/saasRole/saasRole.data.module';
import { SaasUserRoleDataModule } from '@Data/saasUserRole/saasUserRole.data.module';

@Module({
  imports: [SaasRoleDataModule, SaasUserRoleDataModule],
  providers: [RoleManagementService],
  exports: [RoleManagementService],
})
export class RoleManagementServiceModule {}
