import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserRole {
  _id: string;
  user: string;
  role: SaasRole;
  application: string;
  workspace?: string;
  isActive: boolean;
  expiresAt?: Date;
  customPermissions: Record<string, any>;
  assignedAt: Date;
  assignedBy?: string;
}

export interface SaasRole {
  _id: string;
  roleType: 'SAAS_PLATFORM_ADMIN' | 'SAAS_PLATFORM_MANAGER' | 'CUSTOMER_ADMIN' | 'CUSTOMER_MANAGER' | 'CUSTOMER_DEVELOPER';
  name: string;
  description: string;
  responsibilities: string[];
  permissions: Record<string, 'READ' | 'WRITE' | 'ADMIN' | 'FULL_CONTROL'>;
  restrictions: Record<string, any>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRoleDto {
  roleType: string;
  name: string;
  description: string;
  responsibilities?: string[];
  permissions?: Record<string, string>;
  restrictions?: Record<string, any>;
}

export interface AssignUserRoleDto {
  userId: string;
  roleId: string;
  applicationId: string;
  workspaceId?: string;
  expiresAt?: Date;
  customPermissions?: Record<string, any>;
}

@Injectable({
  providedIn: 'root'
})
export class RoleManagementService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000';

  // Role Management
  createRole(role: CreateRoleDto): Observable<{ success: boolean; data: SaasRole; message: string }> {
    return this.http.post<{ success: boolean; data: SaasRole; message: string }>(
      `${this.baseUrl}/role-management/create`,
      role
    );
  }

  getAllRoles(): Observable<{ success: boolean; data: SaasRole[]; count: number }> {
    return this.http.get<{ success: boolean; data: SaasRole[]; count: number }>(
      `${this.baseUrl}/role-management/roles`
    );
  }

  getRoleById(roleId: string): Observable<{ success: boolean; data: SaasRole }> {
    return this.http.get<{ success: boolean; data: SaasRole }>(
      `${this.baseUrl}/role-management/roles/${roleId}`
    );
  }

  updateRole(roleId: string, updateData: Partial<SaasRole>): Observable<{ success: boolean; data: SaasRole; message: string }> {
    return this.http.put<{ success: boolean; data: SaasRole; message: string }>(
      `${this.baseUrl}/role-management/roles/${roleId}`,
      updateData
    );
  }

  // User Role Assignment
  assignUserRole(assignment: AssignUserRoleDto): Observable<{ success: boolean; data: UserRole; message: string }> {
    return this.http.post<{ success: boolean; data: UserRole; message: string }>(
      `${this.baseUrl}/role-management/assign`,
      assignment
    );
  }

  getUserRoles(userId: string, applicationId?: string): Observable<{ success: boolean; data: UserRole[]; count: number }> {
    const params = applicationId ? `?applicationId=${applicationId}` : '';
    return this.http.get<{ success: boolean; data: UserRole[]; count: number }>(
      `${this.baseUrl}/role-management/users/${userId}/roles${params}`
    );
  }

  getUserPermissions(userId: string, applicationId: string): Observable<{ success: boolean; data: Record<string, string> }> {
    return this.http.get<{ success: boolean; data: Record<string, string> }>(
      `${this.baseUrl}/role-management/users/${userId}/permissions?applicationId=${applicationId}`
    );
  }

  revokeUserRole(userId: string, applicationId: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.baseUrl}/role-management/users/${userId}/applications/${applicationId}/revoke`
    );
  }

  updateUserRole(userId: string, applicationId: string, roleId: string): Observable<{ success: boolean; data: UserRole; message: string }> {
    return this.http.put<{ success: boolean; data: UserRole; message: string }>(
      `${this.baseUrl}/role-management/users/${userId}/applications/${applicationId}/role`,
      { roleId }
    );
  }

  // Permission Checks
  checkUserPermission(userId: string, applicationId: string, permission: string, level: string): Observable<{ success: boolean; data: { hasPermission: boolean } }> {
    return this.http.post<{ success: boolean; data: { hasPermission: boolean } }>(
      `${this.baseUrl}/role-management/users/${userId}/check-permission`,
      { applicationId, permission, level }
    );
  }

  // Quick Permission Helpers
  canAccessMarketingDashboard(userId: string, applicationId: string): Observable<{ success: boolean; data: { canAccess: boolean } }> {
    return this.http.get<{ success: boolean; data: { canAccess: boolean } }>(
      `${this.baseUrl}/role-management/check/marketing-dashboard/${userId}/${applicationId}`
    );
  }

  canConfigureABTests(userId: string, applicationId: string): Observable<{ success: boolean; data: { canConfigure: boolean } }> {
    return this.http.get<{ success: boolean; data: { canConfigure: boolean } }>(
      `${this.baseUrl}/role-management/check/ab-tests/${userId}/${applicationId}`
    );
  }

  canAccessAPIDocumentation(userId: string, applicationId: string): Observable<{ success: boolean; data: { canAccess: boolean } }> {
    return this.http.get<{ success: boolean; data: { canAccess: boolean } }>(
      `${this.baseUrl}/role-management/check/api-docs/${userId}/${applicationId}`
    );
  }

  // Utility Methods
  getRoleDisplayInfo(roleType: string): { icon: string; color: string; displayName: string; profileSuggestion: string } {
    const roleInfo = {
      'SAAS_PLATFORM_ADMIN': {
        icon: '🛠️',
        color: '#e53e3e',
        displayName: 'Platform Admin',
        profileSuggestion: 'System Administrator'
      },
      'SAAS_PLATFORM_MANAGER': {
        icon: '💼',
        color: '#3182ce',
        displayName: 'Platform Manager',
        profileSuggestion: 'Commercial Manager'
      },
      'CUSTOMER_ADMIN': {
        icon: '👨‍💼',
        color: '#805ad5',
        displayName: 'Customer Admin',
        profileSuggestion: 'CTO, Technical Director, Senior Architect'
      },
      'CUSTOMER_MANAGER': {
        icon: '📊',
        color: '#38a169',
        displayName: 'Customer Manager',
        profileSuggestion: 'Product Manager, Technical Project Manager'
      },
      'CUSTOMER_DEVELOPER': {
        icon: '👨‍💻',
        color: '#d69e2e',
        displayName: 'Customer Developer',
        profileSuggestion: 'Senior Developer, Full-Stack Engineer'
      }
    };

    return roleInfo[roleType as keyof typeof roleInfo] || {
      icon: '👤',
      color: '#718096',
      displayName: 'Unknown Role',
      profileSuggestion: 'N/A'
    };
  }

  getPermissionLevel(level: string): { displayName: string; color: string; description: string } {
    const levels = {
      'READ': {
        displayName: 'Read',
        color: '#4299e1',
        description: 'View and read access only'
      },
      'write': {
        displayName: 'Write',
        color: '#38a169',
        description: 'Create and modify access'
      },
      'admin': {
        displayName: 'Admin',
        color: '#ed8936',
        description: 'Administrative access with management capabilities'
      },
      'full_control': {
        displayName: 'Full Control',
        color: '#e53e3e',
        description: 'Complete control including deletion and system access'
      }
    };

    return levels[level.toLowerCase() as keyof typeof levels] || {
      displayName: 'Unknown',
      color: '#718096',
      description: 'Unknown permission level'
    };
  }
}
