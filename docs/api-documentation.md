# API Documentation - SaaS Platform MVP

## Overview
This document provides comprehensive API documentation for the SaaS Platform MVP, including all endpoints for role management, marketing campaigns, and plan features.

## Base Configuration
- **Base URL**: `http://localhost:3000/api`
- **Authentication**: Bearer Token (JWT)
- **Content-Type**: `application/json`

## Role Management API

### Endpoints

#### 1. Get All Roles
```http
GET /role-management/roles
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "CUSTOMER_ADMIN",
      "description": "CTO, Directeur Technique, Architecte Senior",
      "permissions": ["technicalConfiguration", "marketingDashboard", "planConfiguration"]
    }
  ]
}
```

#### 2. Assign Role to User
```http
POST /role-management/assign
```

**Request Body:**
```json
{
  "userId": "string",
  "applicationId": "string", 
  "roleType": "CUSTOMER_ADMIN | CUSTOMER_MANAGER | CUSTOMER_DEVELOPER"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Role assigned successfully",
  "data": {
    "assignmentId": "string",
    "userId": "string",
    "roleType": "string",
    "applicationId": "string",
    "assignedAt": "2024-01-01T00:00:00Z"
  }
}
```

#### 3. Check User Permissions
```http
POST /role-management/users/:userId/check-permission
```

**Request Body:**
```json
{
  "userId": "string",
  "applicationId": "string",
  "permission": "marketingDashboard | technicalConfiguration | planConfiguration",
  "level": "READ | ADMIN"
}
```

**Response:**
```json
{
  "hasPermission": true,
  "roleType": "CUSTOMER_ADMIN",
  "permissionLevel": "ADMIN"
}
```

#### 4. Get User Roles
```http
GET /role-management/users/:userId/roles
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "applicationId": "string",
      "roleType": "CUSTOMER_ADMIN",
      "assignedAt": "2024-01-01T00:00:00Z",
      "permissions": ["technicalConfiguration", "marketingDashboard"]
    }
  ]
}
```

#### 5. Get User Permissions
```http
GET /role-management/users/:userId/permissions?applicationId=string
```

**Response:**
```json
{
  "success": true,
  "data": {
    "permissions": {
      "marketingDashboard": "ADMIN",
      "technicalConfiguration": "ADMIN",
      "planConfiguration": "ADMIN"
    },
    "roleType": "CUSTOMER_ADMIN"
  }
}
```

## Marketing Campaign API

### Endpoints

#### 1. Create Marketing Campaign
```http
POST /marketing/campaigns
```

**Request Body:**
```json
{
  "name": "string",
  "type": "AB_TEST | LANDING_PAGE | EMAIL_CAMPAIGN",
  "description": "string",
  "applicationId": "string",
  "userId": "string",
  "configuration": {
    "targetAudience": "BASIC_PLAN_USERS | PREMIUM_USERS",
    "conversionGoal": "PLAN_UPGRADE | FEATURE_ADOPTION"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "type": "AB_TEST",
    "status": "DRAFT",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### 2. Get Campaign List
```http
GET /marketing/campaigns?applicationId=string
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "Prix Premium Test A/B",
      "type": "AB_TEST",
      "status": "ACTIVE",
      "createdAt": "2024-01-01T00:00:00Z",
      "metrics": {
        "views": 1000,
        "conversions": 50,
        "conversionRate": 5.0
      }
    }
  ]
}
```

#### 3. Get Campaign Analytics
```http
GET /marketing/campaigns/:id/analytics
```

**Response:**
```json
{
  "success": true,
  "data": {
    "campaignId": "string",
    "metrics": {
      "totalViews": 5000,
      "uniqueViews": 3000,
      "conversions": 150,
      "conversionRate": 5.0,
      "revenue": 4500.00
    },
    "timeline": [
      {
        "date": "2024-01-01",
        "views": 100,
        "conversions": 5
      }
    ]
  }
}
```

## Plan Features API

### Endpoints

#### 1. Create Plan Feature
```http
POST /plan-features/create
```

**Request Body:**
```json
{
  "planId": "string",
  "featureId": "string",
  "configuration": {
    "enabled": true,
    "limits": {
      "maxUsers": 100,
      "maxApiRequests": 10000,
      "retentionDays": 365
    }
  },
  "userId": "string",
  "applicationId": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "planId": "string",
    "featureType": "API_ACCESS",
    "configuration": {
      "enabled": true,
      "limits": {
        "maxApiRequests": 10000,
        "rateLimit": 1000
      }
    }
  }
}
```

#### 2. Get Plan Features
```http
GET /plan-features/plan/:planId/features
Headers:
x-user-id: string
x-application-id: string
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "featureType": "API_ACCESS",
      "configuration": {
        "enabled": true,
        "limits": {
          "maxApiRequests": 10000,
          "rateLimit": 1000
        }
      }
    },
    {
      "id": "string", 
      "featureType": "ADVANCED_ANALYTICS",
      "configuration": {
        "enabled": true,
        "limits": {
          "retentionDays": 365
        }
      }
    }
  ]
}
```

#### 3. Update Plan Feature
```http
PUT /plan-features/:id
```

**Request Body:**
```json
{
  "configuration": {
    "enabled": false,
    "limits": {
      "maxApiRequests": 5000
    }
  }
}
```

## Authentication & Authorization

### JWT Token Structure
```json
{
  "userId": "string",
  "email": "string",
  "roles": [
    {
      "applicationId": "string",
      "roleType": "CUSTOMER_ADMIN"
    }
  ],
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Permission Levels
- **READ**: View-only access
- **ADMIN**: Full administrative access including create, update, delete

### Role-Based Access Matrix
| Role | Technical Config | Marketing Dashboard | Plan Configuration | API Documentation |
|------|-----------------|---------------------|-------------------|-------------------|
| CUSTOMER_ADMIN | ADMIN | ADMIN | ADMIN | ADMIN |
| CUSTOMER_MANAGER | READ | ADMIN | READ | ADMIN |  
| CUSTOMER_DEVELOPER | - | - | - | READ |

## Error Handling

### Standard Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

### Common Error Codes
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `VALIDATION_ERROR`: Invalid request data
- `NOT_FOUND`: Resource not found
- `CONFLICT`: Resource already exists
- `RATE_LIMIT_EXCEEDED`: Too many requests

## Rate Limiting
- **Default**: 100 requests per minute per user
- **Authentication endpoints**: 5 requests per minute
- **Bulk operations**: 10 requests per minute

## Webhooks (Future Implementation)
```http
POST /webhooks/campaign-events
POST /webhooks/role-assignments
POST /webhooks/plan-updates
```

## SDK Examples

### JavaScript/TypeScript
```typescript
import { SaasPlatformAPI } from '@saas-platform/sdk';

const api = new SaasPlatformAPI({
  baseURL: 'http://localhost:3000/api',
  token: 'your-jwt-token'
});

// Assign role
const assignment = await api.roleManagement.assignRole({
  userId: 'user-123',
  applicationId: 'app-456', 
  roleType: 'CUSTOMER_MANAGER'
});

// Create campaign
const campaign = await api.marketing.createCampaign({
  name: 'Premium Upgrade Campaign',
  type: 'AB_TEST',
  applicationId: 'app-456'
});
```

## Testing
### Integration Test Examples
```bash
# Run integration tests
npm run test:integration

# Run specific module tests  
npm run test:integration -- --grep "Role Management"
npm run test:integration -- --grep "Marketing Campaigns"
npm run test:integration -- --grep "Plan Features"
```

## Monitoring & Logging
- All API calls are logged with request/response details
- Performance metrics tracked for response times
- Error rates monitored per endpoint
- Usage analytics available in admin dashboard