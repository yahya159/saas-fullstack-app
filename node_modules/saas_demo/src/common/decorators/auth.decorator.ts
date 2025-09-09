import { SetMetadata } from '@nestjs/common';
import { RoleType, AccessLevel } from '@Data/models/saasRole/saasRole.pojo.model';

export const ROLES_KEY = 'roles';
export const PERMISSIONS_KEY = 'permissions';

// Role-based decorator
export const Roles = (...roles: RoleType[]) => SetMetadata(ROLES_KEY, roles);

// Permission-based decorator
export const RequirePermission = (permission: string, level: AccessLevel = AccessLevel.READ) =>
  SetMetadata(PERMISSIONS_KEY, { permission, level });

// Combined decorator for complex authorization
export const Authorization = (options: {
  roles?: RoleType[];
  permission?: string;
  level?: AccessLevel;
  requireAll?: boolean; // If true, user must have ALL specified roles/permissions
}) => {
  return (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => {
    if (options.roles) {
      SetMetadata(ROLES_KEY, options.roles)(target, propertyKey, descriptor);
    }
    if (options.permission) {
      SetMetadata(PERMISSIONS_KEY, {
        permission: options.permission,
        level: options.level || AccessLevel.READ,
        requireAll: options.requireAll || false,
      })(target, propertyKey, descriptor);
    }
  };
};
