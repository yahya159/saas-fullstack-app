import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

// Import all necessary modules
import { RoleManagementServiceModule } from '@Services/roleManagement/roleManagement.service.module';
import { MarketingServiceModule } from '@Services/marketing/marketing.service.module';
import { PlanFeatureServiceModule } from '@Services/planFeature/plan-feature.service.module';
import { RoleManagementControllerModule } from '@Controllers/roleManagement/roleManagement.controller.module';
import { PlanFeatureControllerModule } from '@Controllers/planFeature/plan-feature.controller.module';

describe('End-to-End Workflow Tests', () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;

  // Scenario test data
  const organizationScenario = {
    cto: {
      id: '507f1f77bcf86cd799439021',
      email: 'cto@company.com',
      name: 'Chief Technology Officer',
      role: 'CUSTOMER_ADMIN',
    },
    productManager: {
      id: '507f1f77bcf86cd799439022',
      email: 'pm@company.com',
      name: 'Product Manager',
      role: 'CUSTOMER_MANAGER',
    },
    developer: {
      id: '507f1f77bcf86cd799439023',
      email: 'dev@company.com',
      name: 'Senior Developer',
      role: 'CUSTOMER_DEVELOPER',
    },
    application: {
      id: '507f1f77bcf86cd799439024',
      name: 'Company SaaS Product',
    },
  };

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        MongooseModule.forRoot('mongodb://localhost:27017/saas_e2e_test'),
        RoleManagementServiceModule,
        MarketingServiceModule,
        PlanFeatureServiceModule,
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

  describe('Complete Organization Setup Workflow', () => {
    it('should complete full organization role setup according to French specification', async () => {
      // Phase 1: CTO (Customer Admin) sets up the organization
      console.log('Phase 1: CTO Organization Setup');

      // Assign CTO as Customer Admin
      const ctoRoleAssignment = await request(app.getHttpServer())
        .post('/role-management/assign')
        .send({
          userId: organizationScenario.cto.id,
          applicationId: organizationScenario.application.id,
          roleType: organizationScenario.cto.role,
        })
        .expect(201);

      expect(ctoRoleAssignment.body.success).toBe(true);

      // Verify CTO has full technical governance access
      const ctoPermissions = await request(app.getHttpServer())
        .get(`/role-management/users/${organizationScenario.cto.id}/permissions`)
        .query({ applicationId: organizationScenario.application.id })
        .expect(200);

      expect(ctoPermissions.body.permissions).toMatchObject({
        technicalConfiguration: 'ADMIN',
        securityValidation: 'FULL_CONTROL',
        teamManagement: 'FULL_CONTROL',
      });

      // Phase 2: CTO assigns Product Manager role
      console.log('Phase 2: Product Manager Assignment');

      const pmRoleAssignment = await request(app.getHttpServer())
        .post('/role-management/assign')
        .send({
          userId: organizationScenario.productManager.id,
          applicationId: organizationScenario.application.id,
          roleType: organizationScenario.productManager.role,
        })
        .expect(201);

      expect(pmRoleAssignment.body.success).toBe(true);

      // Verify PM has marketing and operational access
      const pmPermissions = await request(app.getHttpServer())
        .get(`/role-management/users/${organizationScenario.productManager.id}/permissions`)
        .query({ applicationId: organizationScenario.application.id })
        .expect(200);

      expect(pmPermissions.body.permissions).toMatchObject({
        marketingDashboard: 'ADMIN',
        abTestConfiguration: 'ADMIN',
        userAnalytics: 'ADMIN',
      });

      // Phase 3: PM assigns Developer for technical integration
      console.log('Phase 3: Developer Assignment');

      const devRoleAssignment = await request(app.getHttpServer())
        .post('/role-management/assign')
        .send({
          userId: organizationScenario.developer.id,
          applicationId: organizationScenario.application.id,
          roleType: organizationScenario.developer.role,
        })
        .expect(201);

      expect(devRoleAssignment.body.success).toBe(true);

      // Verify Developer has API and integration access
      const devPermissions = await request(app.getHttpServer())
        .get(`/role-management/users/${organizationScenario.developer.id}/permissions`)
        .query({ applicationId: organizationScenario.application.id })
        .expect(200);

      expect(devPermissions.body.permissions).toMatchObject({
        apiDocumentation: 'ADMIN',
        sandboxTesting: 'ADMIN',
        debuggingTools: 'ADMIN',
      });

      // Phase 4: Verify team overview
      console.log('Phase 4: Team Overview Verification');

      const teamOverview = await request(app.getHttpServer())
        .get(`/role-management/applications/${organizationScenario.application.id}/team`)
        .expect(200);

      expect(teamOverview.body).toHaveLength(3);
      expect(teamOverview.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            userId: organizationScenario.cto.id,
            roleType: 'CUSTOMER_ADMIN',
          }),
          expect.objectContaining({
            userId: organizationScenario.productManager.id,
            roleType: 'CUSTOMER_MANAGER',
          }),
          expect.objectContaining({
            userId: organizationScenario.developer.id,
            roleType: 'CUSTOMER_DEVELOPER',
          }),
        ]),
      );
    });
  });

  describe('Marketing Campaign Creation Workflow', () => {
    it('should complete marketing campaign lifecycle with proper role validation', async () => {
      // Setup: Ensure Product Manager role is assigned
      await request(app.getHttpServer()).post('/role-management/assign').send({
        userId: organizationScenario.productManager.id,
        applicationId: organizationScenario.application.id,
        roleType: 'CUSTOMER_MANAGER',
      });

      // Phase 1: Product Manager validates marketing dashboard access
      console.log('Phase 1: Marketing Access Validation');

      const marketingAccess = await request(app.getHttpServer())
        .get(
          `/role-management/check/marketing-dashboard/${organizationScenario.productManager.id}/${organizationScenario.application.id}`,
        )
        .expect(200);

      expect(marketingAccess.body.hasAccess).toBe(true);

      // Phase 2: A/B Test Configuration Access
      console.log('Phase 2: A/B Test Configuration');

      const abTestAccess = await request(app.getHttpServer())
        .get(
          `/role-management/check/ab-tests/${organizationScenario.productManager.id}/${organizationScenario.application.id}`,
        )
        .expect(200);

      expect(abTestAccess.body.hasAccess).toBe(true);

      // Phase 3: Verify Developer cannot access marketing configuration
      console.log('Phase 3: Developer Access Restriction');

      const devMarketingAccess = await request(app.getHttpServer())
        .get(
          `/role-management/check/marketing-dashboard/${organizationScenario.developer.id}/${organizationScenario.application.id}`,
        )
        .expect(200);

      expect(devMarketingAccess.body.hasAccess).toBe(false);

      // Phase 4: CTO can access marketing for oversight
      console.log('Phase 4: CTO Marketing Oversight');

      const ctoMarketingAccess = await request(app.getHttpServer())
        .get(
          `/role-management/check/marketing-dashboard/${organizationScenario.cto.id}/${organizationScenario.application.id}`,
        )
        .expect(200);

      expect(ctoMarketingAccess.body.hasAccess).toBe(true);
    });
  });

  describe('Plan Feature Management Workflow', () => {
    it('should complete plan feature configuration with proper technical governance', async () => {
      const testPlanId = '507f1f77bcf86cd799439025';
      const testFeatureId = '507f1f77bcf86cd799439026';

      // Phase 1: CTO configures plan features (Technical Governance)
      console.log('Phase 1: CTO Technical Configuration');

      const planFeatureCreation = await request(app.getHttpServer())
        .post('/plan-features/create')
        .send({
          planId: testPlanId,
          featureId: testFeatureId,
          configuration: {
            enabled: true,
            limits: {
              maxUsers: 1000,
              apiCalls: 10000,
              storage: '100GB',
            },
          },
          userId: organizationScenario.cto.id,
          applicationId: organizationScenario.application.id,
        })
        .expect(201);

      expect(planFeatureCreation.body.success).toBe(true);

      // Phase 2: Product Manager can read plan configuration for marketing
      console.log('Phase 2: Product Manager Plan Access');

      const planFeaturesRead = await request(app.getHttpServer())
        .get(`/plan-features/plan/${testPlanId}/features`)
        .set('x-user-id', organizationScenario.productManager.id)
        .set('x-application-id', organizationScenario.application.id)
        .expect(200);

      expect(planFeaturesRead.body).toBeInstanceOf(Array);

      // Phase 3: Developer accesses API documentation
      console.log('Phase 3: Developer API Documentation Access');

      const apiAccess = await request(app.getHttpServer())
        .get(
          `/role-management/check/api-docs/${organizationScenario.developer.id}/${organizationScenario.application.id}`,
        )
        .expect(200);

      expect(apiAccess.body.hasAccess).toBe(true);

      // Phase 4: Verify feature configuration details
      console.log('Phase 4: Feature Configuration Verification');

      const featureDetails = await request(app.getHttpServer())
        .get(`/plan-features/plan/${testPlanId}/feature/${testFeatureId}`)
        .set('x-user-id', organizationScenario.cto.id)
        .set('x-application-id', organizationScenario.application.id)
        .expect(200);

      expect(featureDetails.body.configuration.limits).toMatchObject({
        maxUsers: 1000,
        apiCalls: 10000,
        storage: '100GB',
      });
    });
  });

  describe('Cross-Module Collaboration Workflow', () => {
    it('should simulate real-world collaboration between roles', async () => {
      const collaborationPlanId = '507f1f77bcf86cd799439027';

      // Scenario: Launch new feature with A/B testing
      console.log('Collaboration Scenario: New Feature Launch with A/B Testing');

      // Step 1: CTO approves new feature for testing
      console.log('Step 1: CTO Technical Approval');

      await request(app.getHttpServer())
        .post('/plan-features/create')
        .send({
          planId: collaborationPlanId,
          featureId: '507f1f77bcf86cd799439028',
          configuration: {
            enabled: true,
            beta: true,
            rolloutPercentage: 10,
          },
          userId: organizationScenario.cto.id,
          applicationId: organizationScenario.application.id,
        })
        .expect(201);

      // Step 2: Product Manager sets up A/B test campaign
      console.log('Step 2: Product Manager A/B Test Setup');

      const abTestPermission = await request(app.getHttpServer())
        .post('/role-management/users/:userId/check-permission')
        .send({
          userId: organizationScenario.productManager.id,
          applicationId: organizationScenario.application.id,
          permission: 'abTestConfiguration',
          level: 'ADMIN',
        })
        .expect(200);

      expect(abTestPermission.body.hasPermission).toBe(true);

      // Step 3: Developer implements technical integration
      console.log('Step 3: Developer Technical Integration');

      const sandboxAccess = await request(app.getHttpServer())
        .post('/role-management/users/:userId/check-permission')
        .send({
          userId: organizationScenario.developer.id,
          applicationId: organizationScenario.application.id,
          permission: 'sandboxTesting',
          level: 'ADMIN',
        })
        .expect(200);

      expect(sandboxAccess.body.hasPermission).toBe(true);

      // Step 4: Verify all roles can access their respective data
      console.log('Step 4: Cross-Role Data Access Verification');

      // CTO can access all configuration
      const ctoFullAccess = await request(app.getHttpServer())
        .get(`/plan-features/plan/${collaborationPlanId}/features`)
        .set('x-user-id', organizationScenario.cto.id)
        .set('x-application-id', organizationScenario.application.id)
        .expect(200);

      // PM can read plan data for marketing insights
      const pmPlanAccess = await request(app.getHttpServer())
        .get(`/plan-features/plan/${collaborationPlanId}/features`)
        .set('x-user-id', organizationScenario.productManager.id)
        .set('x-application-id', organizationScenario.application.id)
        .expect(200);

      // Developer can access API documentation
      const devApiAccess = await request(app.getHttpServer())
        .get(
          `/role-management/check/api-docs/${organizationScenario.developer.id}/${organizationScenario.application.id}`,
        )
        .expect(200);

      expect(ctoFullAccess.status).toBe(200);
      expect(pmPlanAccess.status).toBe(200);
      expect(devApiAccess.body.hasAccess).toBe(true);
    });
  });

  describe('Security and Validation Workflow', () => {
    it('should enforce proper security validation across all interactions', async () => {
      console.log('Security Validation: Testing Access Control Enforcement');

      // Test 1: Unauthorized access attempts
      await request(app.getHttpServer())
        .post('/role-management/assign')
        .send({
          userId: 'unauthorized-user',
          applicationId: organizationScenario.application.id,
          roleType: 'CUSTOMER_ADMIN',
        })
        .expect(403);

      // Test 2: Role escalation prevention
      await request(app.getHttpServer())
        .post('/role-management/users/:userId/check-permission')
        .send({
          userId: organizationScenario.developer.id,
          applicationId: organizationScenario.application.id,
          permission: 'securityValidation',
          level: 'FULL_CONTROL',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.hasPermission).toBe(false);
        });

      // Test 3: Cross-application isolation
      const otherApplicationId = '507f1f77bcf86cd799439029';

      await request(app.getHttpServer())
        .get(`/plan-features/plan/some-plan-id/features`)
        .set('x-user-id', organizationScenario.cto.id)
        .set('x-application-id', otherApplicationId)
        .expect(403);

      // Test 4: Valid access confirmation
      const validAccess = await request(app.getHttpServer())
        .get(`/role-management/users/${organizationScenario.cto.id}/permissions`)
        .query({ applicationId: organizationScenario.application.id })
        .expect(200);

      expect(validAccess.body.permissions).toBeDefined();
    });
  });
});
