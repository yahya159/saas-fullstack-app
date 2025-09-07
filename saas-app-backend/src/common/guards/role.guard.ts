import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleManagementService } from '@Services/roleManagement/roleManagement.service';
import { RoleType, AccessLevel } from '@Data/models/saasRole/saasRole.pojo.model';
import { ROLES_KEY, PERMISSIONS_KEY } from '@app/common/decorators/auth.decorator';
import { IS_PUBLIC_KEY } from '@app/common/decorators/public.decorator';
import * as mongoose from 'mongoose';

@Injectable()
export class RoleGuard implements CanActivate {
  private readonly logger = new Logger(RoleGuard.name);

  constructor(private reflector: Reflector, private roleManagementService: RoleManagementService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<RoleType[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const requiredPermissions = this.reflector.getAllAndOverride<{
      permission: string;
      level: AccessLevel;
      requireAll?: boolean;
    }>(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);

    // If no specific roles or permissions are required, allow access for authenticated users
    if (!requiredRoles && !requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // Set by JWT guard

    if (!user) {
      throw new ForbiddenException('User authentication required');
    }

    const applicationId = this.extractApplicationId(request);

    // Log authorization attempt for audit
    this.logger.debug(
      `Authorization check for user ${user.id} on ${request.method} ${request.url}`,
    );

    const userId = new mongoose.Types.ObjectId(user.sub || user.id);
    let appId: mongoose.Types.ObjectId | null = null;

    if (applicationId) {
      appId = new mongoose.Types.ObjectId(applicationId);
    }

    // Check role requirements
    if (requiredRoles && requiredRoles.length > 0) {
      if (!appId) {
        throw new ForbiddenException('Application context required for role-based access');
      }

      try {
        const userRoles = await this.roleManagementService.getUserRoles(userId, appId);
        const userRoleTypes = userRoles.map((ur) => (ur.role as any).roleType);

        const hasRequiredRole = requiredRoles.some((role) => userRoleTypes.includes(role));

        if (!hasRequiredRole) {
          this.logger.warn(
            `Access denied for user ${user.id}: insufficient role. Required: ${requiredRoles.join(
              ', ',
            )}, Has: ${userRoleTypes.join(', ')}`,
          );
          throw new ForbiddenException(
            `Insufficient role privileges. Required: ${requiredRoles.join(', ')}`,
          );
        }

        this.logger.debug(`Role check passed for user ${user.id}: ${userRoleTypes.join(', ')}`);
      } catch (error) {
        if (error instanceof ForbiddenException) {
          throw error;
        }
        this.logger.error(`Role check failed for user ${user.id}: ${error.message}`);
        throw new ForbiddenException('Role validation failed');
      }
    }

    // Check permission requirements
    if (requiredPermissions) {
      if (!appId) {
        throw new ForbiddenException('Application context required for permission-based access');
      }

      try {
        const hasPermission = await this.roleManagementService.checkUserPermission(
          userId,
          appId,
          requiredPermissions.permission,
          requiredPermissions.level,
        );

        if (!hasPermission) {
          this.logger.warn(
            `Access denied for user ${user.id}: insufficient permission ${requiredPermissions.permission}:${requiredPermissions.level}`,
          );
          throw new ForbiddenException(
            `Insufficient permissions for ${requiredPermissions.permission} (${requiredPermissions.level})`,
          );
        }

        this.logger.debug(
          `Permission check passed for user ${user.id}: ${requiredPermissions.permission}:${requiredPermissions.level}`,
        );
      } catch (error) {
        if (error instanceof ForbiddenException) {
          throw error;
        }
        this.logger.error(`Permission check failed for user ${user.id}: ${error.message}`);
        throw new ForbiddenException('Permission validation failed');
      }
    }

    return true;
  }

  private extractApplicationId(request: any): string | null {
    // Try multiple ways to extract application ID
    const appId =
      request.params?.applicationId ||
      request.query?.applicationId ||
      request.body?.applicationId ||
      request.headers?.['x-application-id'] ||
      request.user?.applicationId || // From JWT payload
      null;

    if (appId) {
      this.logger.debug(`Application ID extracted: ${appId}`);
    }

    return appId;
  }
}
