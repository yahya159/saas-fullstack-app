/**
 * Standardized API Response Interface
 * Used across all modules to ensure consistent response format
 */

export interface StandardResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
  path?: string;
}

export interface StandardError {
  statusCode: number;
  message: string;
  error: string;
  details?: any;
  timestamp: string;
  path: string;
}

export interface PaginatedResponse<T = any> extends StandardResponse<T[]> {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PermissionCheck {
  hasAccess: boolean;
  hasPermission?: boolean;
  permission?: string;
  level?: string;
  reason?: string;
}

/**
 * Event interfaces for inter-module communication
 */
export interface RoleAssignedEvent {
  userId: string;
  applicationId: string;
  roleType: string;
  permissions: Record<string, string>;
  timestamp: string;
}

export interface MarketingPermissionUpdatedEvent {
  userId: string;
  applicationId: string;
  canAccessDashboard: boolean;
  canConfigureTests: boolean;
  timestamp: string;
}

export interface PlanFeatureUpdatedEvent {
  planId: string;
  featureId: string;
  applicationId: string;
  configuration: Record<string, any>;
  timestamp: string;
}
