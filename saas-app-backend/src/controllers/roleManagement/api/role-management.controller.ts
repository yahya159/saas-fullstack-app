import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpException,
  UseGuards,
} from '@nestjs/common';
import {
  RoleManagementService,
  CreateRoleDto,
  AssignUserRoleDto,
} from '@Services/roleManagement/roleManagement.service';
import { ParseObjectIdPipe } from '@app/common/pipes/parse-object-id.pipe';
import { RoleGuard } from '@app/common/guards/role.guard';
import { Roles, RequirePermission } from '@app/common/decorators/auth.decorator';
import { RoleType, AccessLevel } from '@Data/models/saasRole/saasRole.pojo.model';
import * as mongoose from 'mongoose';

export const ROLE_MANAGEMENT_API_PATHS = {
  // Role Management
  CREATE_ROLE: '/create',
  GET_ALL_ROLES: '/roles',
  GET_ROLE: '/roles/:roleId',
  UPDATE_ROLE: '/roles/:roleId',

  // User Role Assignment
  ASSIGN_USER_ROLE: '/assign',
  GET_USER_ROLES: '/users/:userId/roles',
  GET_USER_PERMISSIONS: '/users/:userId/permissions',
  REVOKE_USER_ROLE: '/users/:userId/applications/:applicationId/revoke',
  UPDATE_USER_ROLE: '/users/:userId/applications/:applicationId/role',

  // Permission Checks
  CHECK_PERMISSION: '/users/:userId/check-permission',

  // Team Management
  GET_TEAM_MEMBERS: '/applications/:applicationId/team',
  GET_ROLE_ASSIGNMENTS: '/applications/:applicationId/assignments',
} as const;

@Controller('/role-management')
@UseGuards(RoleGuard)
export class RoleManagementController {
  constructor(private readonly roleManagementService: RoleManagementService) {}

  // Role Management Endpoints
  @Post(ROLE_MANAGEMENT_API_PATHS.CREATE_ROLE)
  @Roles(RoleType.SAAS_PLATFORM_ADMIN)
  async createRole(@Body() createRoleDto: CreateRoleDto) {
    try {
      const role = await this.roleManagementService.createRole(createRoleDto);
      return {
        success: true,
        data: role,
        message: 'Role created successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
          error: 'Role Creation Failed',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get(ROLE_MANAGEMENT_API_PATHS.GET_ALL_ROLES)
  @RequirePermission('teamManagement', AccessLevel.READ)
  async getAllRoles() {
    try {
      const roles = await this.roleManagementService.getAllRoles();
      return {
        success: true,
        data: roles,
        count: roles.length,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
          error: 'Failed to retrieve roles',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(ROLE_MANAGEMENT_API_PATHS.GET_ROLE)
  @RequirePermission('teamManagement', AccessLevel.READ)
  async getRoleById(@Param('roleId', ParseObjectIdPipe) roleId: mongoose.Types.ObjectId) {
    try {
      const role = await this.roleManagementService.getRoleById(roleId);
      return {
        success: true,
        data: role,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
          error: 'Role not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Put(ROLE_MANAGEMENT_API_PATHS.UPDATE_ROLE)
  @Roles(RoleType.SAAS_PLATFORM_ADMIN, RoleType.CUSTOMER_ADMIN)
  async updateRole(
    @Param('roleId', ParseObjectIdPipe) roleId: mongoose.Types.ObjectId,
    @Body() updateData: any,
  ) {
    try {
      const role = await this.roleManagementService.updateRole(roleId, updateData);
      return {
        success: true,
        data: role,
        message: 'Role updated successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
          error: 'Role update failed',
        },
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  // User Role Assignment Endpoints
  @Post(ROLE_MANAGEMENT_API_PATHS.ASSIGN_USER_ROLE)
  @RequirePermission('teamManagement', AccessLevel.ADMIN)
  async assignUserRole(@Body() assignDto: AssignUserRoleDto) {
    try {
      const userRole = await this.roleManagementService.assignUserRole(assignDto);
      return {
        success: true,
        data: userRole,
        message: 'User role assigned successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
          error: 'Role assignment failed',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get(ROLE_MANAGEMENT_API_PATHS.GET_USER_ROLES)
  @RequirePermission('teamManagement', AccessLevel.READ)
  async getUserRoles(
    @Param('userId', ParseObjectIdPipe) userId: mongoose.Types.ObjectId,
    @Query('applicationId') applicationId?: string,
  ) {
    try {
      const appId = applicationId ? new mongoose.Types.ObjectId(applicationId) : undefined;
      const userRoles = await this.roleManagementService.getUserRoles(userId, appId);
      return {
        success: true,
        data: userRoles,
        count: userRoles.length,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
          error: 'Failed to retrieve user roles',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(ROLE_MANAGEMENT_API_PATHS.GET_USER_PERMISSIONS)
  @RequirePermission('teamManagement', AccessLevel.READ)
  async getUserPermissions(
    @Param('userId', ParseObjectIdPipe) userId: mongoose.Types.ObjectId,
    @Query('applicationId', ParseObjectIdPipe) applicationId: mongoose.Types.ObjectId,
  ) {
    try {
      const permissions = await this.roleManagementService.getUserPermissions(
        userId,
        applicationId,
      );
      return {
        success: true,
        data: permissions,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
          error: 'Failed to retrieve user permissions',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(ROLE_MANAGEMENT_API_PATHS.REVOKE_USER_ROLE)
  @RequirePermission('teamManagement', AccessLevel.ADMIN)
  async revokeUserRole(
    @Param('userId', ParseObjectIdPipe) userId: mongoose.Types.ObjectId,
    @Param('applicationId', ParseObjectIdPipe) applicationId: mongoose.Types.ObjectId,
  ) {
    try {
      await this.roleManagementService.revokeUserRole(userId, applicationId);
      return {
        success: true,
        message: 'User role revoked successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
          error: 'Role revocation failed',
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(ROLE_MANAGEMENT_API_PATHS.UPDATE_USER_ROLE)
  @RequirePermission('teamManagement', AccessLevel.ADMIN)
  async updateUserRole(
    @Param('userId', ParseObjectIdPipe) userId: mongoose.Types.ObjectId,
    @Param('applicationId', ParseObjectIdPipe) applicationId: mongoose.Types.ObjectId,
    @Body('roleId', ParseObjectIdPipe) newRoleId: mongoose.Types.ObjectId,
  ) {
    try {
      const userRole = await this.roleManagementService.updateUserRole(
        userId,
        applicationId,
        newRoleId,
      );
      return {
        success: true,
        data: userRole,
        message: 'User role updated successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
          error: 'Role update failed',
        },
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Permission Check Endpoints
  @Post(ROLE_MANAGEMENT_API_PATHS.CHECK_PERMISSION)
  async checkUserPermission(
    @Param('userId', ParseObjectIdPipe) userId: mongoose.Types.ObjectId,
    @Body()
    checkDto: {
      applicationId: string;
      permission: string;
      level: AccessLevel;
    },
  ) {
    try {
      const applicationId = new mongoose.Types.ObjectId(checkDto.applicationId);
      const hasPermission = await this.roleManagementService.checkUserPermission(
        userId,
        applicationId,
        checkDto.permission,
        checkDto.level,
      );

      return {
        success: true,
        data: {
          hasPermission,
          permission: checkDto.permission,
          level: checkDto.level,
        },
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
          error: 'Permission check failed',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Team Management Endpoints
  @Get(ROLE_MANAGEMENT_API_PATHS.GET_TEAM_MEMBERS)
  @RequirePermission('teamManagement', AccessLevel.READ)
  async getTeamMembers(
    @Param('applicationId', ParseObjectIdPipe) applicationId: mongoose.Types.ObjectId,
  ) {
    try {
      // This would require joining with user data
      // For now, return a placeholder
      return {
        success: true,
        data: [],
        message: 'Team members endpoint - to be implemented with user data',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
          error: 'Failed to retrieve team members',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Quick Permission Helpers
  @Get('/check/marketing-dashboard/:userId/:applicationId')
  async canAccessMarketingDashboard(
    @Param('userId', ParseObjectIdPipe) userId: mongoose.Types.ObjectId,
    @Param('applicationId', ParseObjectIdPipe) applicationId: mongoose.Types.ObjectId,
  ) {
    const canAccess = await this.roleManagementService.canAccessMarketingDashboard(
      userId,
      applicationId,
    );
    return { success: true, data: { canAccess } };
  }

  @Get('/check/ab-tests/:userId/:applicationId')
  async canConfigureABTests(
    @Param('userId', ParseObjectIdPipe) userId: mongoose.Types.ObjectId,
    @Param('applicationId', ParseObjectIdPipe) applicationId: mongoose.Types.ObjectId,
  ) {
    const canConfigure = await this.roleManagementService.canConfigureABTests(
      userId,
      applicationId,
    );
    return { success: true, data: { canConfigure } };
  }

  @Get('/check/api-docs/:userId/:applicationId')
  async canAccessAPIDocumentation(
    @Param('userId', ParseObjectIdPipe) userId: mongoose.Types.ObjectId,
    @Param('applicationId', ParseObjectIdPipe) applicationId: mongoose.Types.ObjectId,
  ) {
    const canAccess = await this.roleManagementService.canAccessAPIDocumentation(
      userId,
      applicationId,
    );
    return { success: true, data: { canAccess } };
  }
}
