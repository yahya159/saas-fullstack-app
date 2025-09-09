import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

// Import modules for integration testing
import { RoleManagementServiceModule } from '@Services/roleManagement/roleManagement.service.module';
import { MarketingServiceModule } from '@Services/marketing/marketing.service.module';
import { PlanFeatureServiceModule } from '@Services/planFeature/plan-feature.service.module';
import { RoleManagementControllerModule } from '@Controllers/roleManagement/roleManagement.controller.module';
import { PlanFeatureControllerModule } from '@Controllers/planFeature/plan-feature.controller.module';

// Import models
import { SaasRoleDataModule } from '@Data/models/saasRole/saasRole.data.module';
import { SaasUserRoleDataModule } from '@Data/models/saasUserRole/saasUserRole.data.module';
import { SaasMarketingCampaignDataModule } from '@Data/models/saasMarketingCampaign/saasMarketingCampaign.data.module';
import { SaasPlanFeatureDataModule } from '@Data/models/saasPlanFeature/saasPlanFeature.data.module';
import { UserDataModule } from '@Data/models/user/user.data.module';
import { SaasApplicationDataModule } from '@Data/models/saasApplication/saasApplication.data.module';

describe('Inter-Module Integration Tests', () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;

  // Test data
  const testUser = {
    id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    name: 'Test User',
  };

  const testApplication = {
    id: '507f1f77bcf86cd799439012',
    name: 'Test Application',
    ownerId: testUser.id,
  };

  const testPlan = {
    id: '507f1f77bcf86cd799439013',
    name: 'Test Plan',
    description: 'Integration test plan',
    applicationId: testApplication.id,
  };

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        MongooseModule.forRoot('mongodb://localhost:27017/saas_integration_test'),

        // Data modules
        SaasRoleDataModule,
        SaasUserRoleDataModule,
        SaasMarketingCampaignDataModule,
        SaasPlanFeatureDataModule,
        UserDataModule,
        SaasApplicationDataModule,

        // Service modules
        RoleManagementServiceModule,
        MarketingServiceModule,
        PlanFeatureServiceModule,

        // Controller modules
        RoleManagementControllerModule,
        PlanFeatureControllerModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Role Management + Marketing Campaign Integration', () => {
    it('should allow Customer Manager to create and manage marketing campaigns', async () => {
      // Step 1: Assign Customer Manager role to user
      const roleAssignResponse = await request(app.getHttpServer())
        .post('/role-management/assign')
        .send({
          userId: testUser.id,
          applicationId: testApplication.id,
          roleType: 'CUSTOMER_MANAGER',
        })
        .expect(201);

      expect(roleAssignResponse.body).toHaveProperty('success', true);

      // Step 2: Verify user has marketing dashboard access
      const permissionCheckResponse = await request(app.getHttpServer())
        .get(`/role-management/check/marketing-dashboard/${testUser.id}/${testApplication.id}`)
        .expect(200);

      expect(permissionCheckResponse.body).toHaveProperty('hasAccess', true);

      // Step 3: Create marketing campaign (would require marketing controller)
      // This test verifies the role system allows the operation
      const campaignData = {
        name: 'Integration Test Campaign',
        type: 'AB_TEST',
        applicationId: testApplication.id,
        userId: testUser.id,
      };

      // Verify permission exists for campaign creation
      const campaignPermissionResponse = await request(app.getHttpServer())
        .post('/role-management/users/:userId/check-permission')
        .send({
          userId: testUser.id,
          applicationId: testApplication.id,
          permission: 'marketingDashboard',
          level: 'ADMIN',
        })
        .expect(200);

      expect(campaignPermissionResponse.body).toHaveProperty('hasPermission', true);
    });

    it('should deny Customer Developer access to marketing configuration', async () => {
      // Assign Customer Developer role
      await request(app.getHttpServer())
        .post('/role-management/assign')
        .send({
          userId: testUser.id,
          applicationId: testApplication.id,
          roleType: 'CUSTOMER_DEVELOPER',
        })
        .expect(201);

      // Check marketing dashboard access (should be denied)
      const permissionResponse = await request(app.getHttpServer())
        .get(`/role-management/check/marketing-dashboard/${testUser.id}/${testApplication.id}`)
        .expect(200);

      expect(permissionResponse.body).toHaveProperty('hasAccess', false);
    });
  });

  describe('Role Management + Plan Features Integration', () => {
    it('should allow Customer Admin to configure plan features', async () => {
      // Assign Customer Admin role
      await request(app.getHttpServer())
        .post('/role-management/assign')
        .send({
          userId: testUser.id,
          applicationId: testApplication.id,
          roleType: 'CUSTOMER_ADMIN',
        })
        .expect(201);

      // Verify technical configuration access
      const permissionResponse = await request(app.getHttpServer())
        .post('/role-management/users/:userId/check-permission')
        .send({
          userId: testUser.id,
          applicationId: testApplication.id,
          permission: 'technicalConfiguration',
          level: 'ADMIN',
        })
        .expect(200);

      expect(permissionResponse.body).toHaveProperty('hasPermission', true);

      // Test plan feature creation
      const planFeatureResponse = await request(app.getHttpServer())
        .post('/plan-features/create')
        .send({
          planId: testPlan.id,
          featureId: '507f1f77bcf86cd799439014',
          configuration: {
            enabled: true,
            limits: { maxUsers: 100 },
          },
          userId: testUser.id,
          applicationId: testApplication.id,
        })
        .expect(201);

      expect(planFeatureResponse.body).toHaveProperty('success', true);
    });

    it('should integrate role-based access with plan feature retrieval', async () => {
      // Test plan feature retrieval with role validation
      const planFeaturesResponse = await request(app.getHttpServer())
        .get(`/plan-features/plan/${testPlan.id}/features`)
        .set('x-user-id', testUser.id)
        .set('x-application-id', testApplication.id)
        .expect(200);

      expect(planFeaturesResponse.body).toBeInstanceOf(Array);
    });
  });

  describe('Marketing Campaigns + Plan Features Integration', () => {
    it('should allow campaign targeting based on plan features', async () => {
      // Assign Customer Manager role for campaign access
      await request(app.getHttpServer())
        .post('/role-management/assign')
        .send({
          userId: testUser.id,
          applicationId: testApplication.id,
          roleType: 'CUSTOMER_MANAGER',
        })
        .expect(201);

      // Verify user can access both marketing and plan information
      const marketingPermission = await request(app.getHttpServer())
        .post('/role-management/users/:userId/check-permission')
        .send({
          userId: testUser.id,
          applicationId: testApplication.id,
          permission: 'marketingDashboard',
          level: 'ADMIN',
        })
        .expect(200);

      const planPermission = await request(app.getHttpServer())
        .post('/role-management/users/:userId/check-permission')
        .send({
          userId: testUser.id,
          applicationId: testApplication.id,
          permission: 'planConfiguration',
          level: 'READ',
        })
        .expect(200);

      expect(marketingPermission.body.hasPermission).toBe(true);
      expect(planPermission.body.hasPermission).toBe(true);

      // Test retrieving plan features for campaign targeting
      const planFeaturesResponse = await request(app.getHttpServer())
        .get(`/plan-features/plan/${testPlan.id}/features`)
        .set('x-user-id', testUser.id)
        .set('x-application-id', testApplication.id)
        .expect(200);

      expect(planFeaturesResponse.body).toBeInstanceOf(Array);
    });
  });

  describe('Cross-Module Data Consistency', () => {
    it('should maintain data consistency across role assignments and feature access', async () => {
      // Create a complex scenario with multiple role assignments
      const roles = ['CUSTOMER_ADMIN', 'CUSTOMER_MANAGER', 'CUSTOMER_DEVELOPER'];

      for (const roleType of roles) {
        // Assign role
        await request(app.getHttpServer())
          .post('/role-management/assign')
          .send({
            userId: testUser.id,
            applicationId: testApplication.id,
            roleType: roleType,
          })
          .expect(201);

        // Verify role assignment
        const userRolesResponse = await request(app.getHttpServer())
          .get(`/role-management/users/${testUser.id}/roles`)
          .expect(200);

        const assignedRole = userRolesResponse.body.find(
          (assignment: any) => assignment.applicationId === testApplication.id,
        );

        expect(assignedRole).toBeDefined();
        expect(assignedRole.roleType).toBe(roleType);

        // Verify permissions are correctly applied
        const permissionsResponse = await request(app.getHttpServer())
          .get(`/role-management/users/${testUser.id}/permissions`)
          .query({ applicationId: testApplication.id })
          .expect(200);

        expect(permissionsResponse.body).toHaveProperty('permissions');
      }
    });
  });

  describe('Performance and Scalability Integration', () => {
    it('should handle concurrent role-based operations efficiently', async () => {
      const concurrentOperations = [];

      // Create multiple concurrent operations
      for (let i = 0; i < 10; i++) {
        concurrentOperations.push(
          request(app.getHttpServer()).get('/role-management/roles').expect(200),
        );

        concurrentOperations.push(
          request(app.getHttpServer())
            .get(`/plan-features/plan/${testPlan.id}/features`)
            .set('x-user-id', testUser.id)
            .set('x-application-id', testApplication.id)
            .expect(200),
        );
      }

      const startTime = Date.now();
      const results = await Promise.all(concurrentOperations);
      const endTime = Date.now();

      // Verify all operations completed successfully
      results.forEach((response) => {
        expect(response.status).toBe(200);
      });

      // Performance assertion (should complete within 5 seconds)
      expect(endTime - startTime).toBeLessThan(5000);
    });
  });

  describe('Error Handling Integration', () => {
    it('should properly handle cross-module error scenarios', async () => {
      // Test invalid role assignment
      await request(app.getHttpServer())
        .post('/role-management/assign')
        .send({
          userId: 'invalid-id',
          applicationId: testApplication.id,
          roleType: 'INVALID_ROLE',
        })
        .expect(400);

      // Test unauthorized access to plan features
      await request(app.getHttpServer())
        .get(`/plan-features/plan/${testPlan.id}/features`)
        .set('x-user-id', 'unauthorized-user')
        .set('x-application-id', testApplication.id)
        .expect(403);

      // Test missing application context
      await request(app.getHttpServer())
        .post('/role-management/users/:userId/check-permission')
        .send({
          userId: testUser.id,
          permission: 'marketingDashboard',
          level: 'ADMIN',
          // Missing applicationId
        })
        .expect(400);
    });
  });
});
