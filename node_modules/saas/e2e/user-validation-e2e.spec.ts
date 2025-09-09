import { browser, by, element, ElementFinder } from 'protractor';

/**
 * SaaS Platform - Complete User Validation E2E Tests
 * Following French 'Architecture des Personnage' specification
 * Tests role-based access control and cross-module integration
 */

interface TestUser {
  name: string;
  email: string;
  role: string;
  profile: string;
}

interface TestScenarios {
  organization: {
    name: string;
    domain: string;
  };
  users: {
    cto: TestUser;
    productManager: TestUser;
    developer: TestUser;
  };
}

describe('SaaS Platform - Complete User Validation E2E Tests', () => {
  // Test data matching French specification personas
  const testScenarios: TestScenarios = {
    organization: {
      name: 'TechCorp Innovation',
      domain: 'techcorp.fr'
    },
    users: {
      cto: {
        name: 'Sophie Martin',
        email: 'sophie.martin@techcorp.fr',
        role: 'CUSTOMER_ADMIN',
        profile: 'CTO, Directeur Technique, Architecte Senior'
      },
      productManager: {
        name: 'Marc Dubois',
        email: 'marc.dubois@techcorp.fr',
        role: 'CUSTOMER_MANAGER',
        profile: 'Product Manager, Chef de projet technique'
      },
      developer: {
        name: 'Julien Lefebvre',
        email: 'julien.lefebvre@techcorp.fr',
        role: 'CUSTOMER_DEVELOPER',
        profile: 'Développeur Senior, Ingénieur Full-Stack'
      }
    }
  };

  // Helper functions for modern design system elements
  const getBySelector = (selector: string): ElementFinder => {
    return element(by.css(`[data-cy="${selector}"]`));
  };

  const getByClass = (className: string): ElementFinder => {
    return element(by.css(`.${className}`));
  };

  const waitForElement = async (selector: string, timeout: number = 10000): Promise<ElementFinder> => {
    const elem = getBySelector(selector);
    await browser.wait(() => elem.isPresent(), timeout);
    return elem;
  };

  const navigateToRoute = async (route: string): Promise<void> => {
    await browser.get(route);
    await browser.sleep(1000); // Wait for route transition
  };

  beforeEach(async () => {
    // Navigate to the application root
    await browser.get('/plans'); // Default route as per specification

    // Wait for application to load completely
    await waitForElement('app-root');

    // Wait for navigation to be ready
    await browser.sleep(2000);
  });

  describe('Complete Organization Onboarding Journey', () => {
    it('should complete full organization setup according to French specification', async () => {
      console.log('🏢 Starting Complete Organization Onboarding');

      // Step 1: Navigate to Role Management
      console.log('📋 Step 1: Navigate to Role Management');
      await navigateToRoute('/role-management');

      // Wait for role management page to load
      const roleManagementPage = await waitForElement('team-management');
      expect(await roleManagementPage.isDisplayed()).toBe(true);

      // Verify role architecture is displayed
      const roleArchitecture = getByClass('role-categories');
      expect(await roleArchitecture.isDisplayed()).toBe(true);

      // Check French role descriptions are present
      const pageText = await element(by.css('body')).getText();
      expect(pageText).toContain('CTO, Directeur Technique, Architecte Senior');
      expect(pageText).toContain('Product Manager, Chef de projet technique');
      expect(pageText).toContain('Développeur Senior, Ingénieur Full-Stack');

      // Step 2: CTO Sophie sets up the team
      console.log('👩‍💼 Step 2: CTO Sophie adds team members');

      // Add Product Manager Marc
      const addTeamMemberBtn = getByClass('btn-primary');
      await addTeamMemberBtn.click();

      // Wait for modal to appear
      await browser.sleep(1000);

      const emailInput = element(by.css('input[formControlName="userId"]'));
      await emailInput.sendKeys(testScenarios.users.productManager.email);

      const roleSelect = element(by.css('select[formControlName="roleId"]'));
      await roleSelect.click();

      // Select the CUSTOMER_MANAGER role option
      const managerOption = element(by.css('option'));
      await managerOption.click();

      const applicationInput = element(by.css('input[formControlName="applicationId"]'));
      await applicationInput.sendKeys('techcorp-app');

      const confirmBtn = element(by.css('.modal-footer .btn-primary'));
      await confirmBtn.click();

      // Wait for success message or modal close
      await browser.sleep(2000);

      // Step 3: Verify team overview
      console.log('✅ Step 3: Verify complete team setup');

      // Check that team assignment section is visible
      const teamAssignments = getByClass('team-assignments');
      const isTeamSectionVisible = await teamAssignments.isPresent();

      if (isTeamSectionVisible) {
        expect(await teamAssignments.isDisplayed()).toBe(true);
      }

      // Verify role cards are displayed
      const roleCards = element.all(by.css('.role-card'));
      const roleCardCount = await roleCards.count();
      expect(roleCardCount).toBeGreaterThan(0);
    });
  });

  describe('Marketing Campaign Creation Workflow', () => {
    beforeEach(async () => {
      // Setup: Simulate Product Manager Marc logged in
      await browser.executeScript(`
        window.localStorage.setItem('currentUser', JSON.stringify({
          id: 'marc-id',
          role: 'CUSTOMER_MANAGER',
          name: '${testScenarios.users.productManager.name}'
        }));
      `);
    });

    it('should complete marketing campaign creation with proper role validation', async () => {
      console.log('🎯 Starting Marketing Campaign Creation Workflow');

      // Step 1: Navigate to Marketing Dashboard
      console.log('📊 Step 1: Access Marketing Dashboard');
      await navigateToRoute('/marketing');

      // Verify dashboard loads
      const marketingDashboard = getByClass('marketing-dashboard');
      expect(await marketingDashboard.isDisplayed()).toBe(true);

      // Step 2: Create A/B Test Campaign
      console.log('🧪 Step 2: Create A/B Test Campaign');
      const createCampaignBtn = getByClass('btn-primary');
      await createCampaignBtn.click();

      // Wait for campaign editor to load
      await browser.sleep(1000);

      // Navigate to campaign editor route
      await navigateToRoute('/marketing/campaigns/new');

      // Verify campaign editor loads
      const campaignEditor = getByClass('campaign-editor');
      expect(await campaignEditor.isDisplayed()).toBe(true);

      // Step 3: Test analytics access
      console.log('📈 Step 3: Access campaign analytics');
      await navigateToRoute('/marketing/analytics');

      // Verify analytics dashboard loads
      const analyticsDashboard = getByClass('analytics-dashboard');
      expect(await analyticsDashboard.isDisplayed()).toBe(true);
    });

    it('should prevent unauthorized access to marketing features', async () => {
      console.log('🔒 Testing access restrictions for developers');

      // Simulate Developer Julien trying to access marketing
      await browser.executeScript(`
        window.localStorage.setItem('currentUser', JSON.stringify({
          id: 'julien-id',
          role: 'CUSTOMER_DEVELOPER',
          name: '${testScenarios.users.developer.name}'
        }));
      `);

      // Try to access marketing directly
      await navigateToRoute('/marketing/dashboard');

      // Should either redirect or show access denied
      const currentUrl = await browser.getCurrentUrl();
      expect(currentUrl).not.toContain('/marketing/dashboard');
    });
  });

  describe('Plan Feature Configuration Workflow', () => {
    beforeEach(async () => {
      // Setup: Simulate CTO Sophie logged in
      await browser.executeScript(`
        window.localStorage.setItem('currentUser', JSON.stringify({
          id: 'sophie-id',
          role: 'CUSTOMER_ADMIN',
          name: '${testScenarios.users.cto.name}'
        }));
      `);
    });

    it('should complete plan feature configuration with technical governance', async () => {
      console.log('⚙️ Starting Plan Feature Configuration Workflow');

      // Step 1: Navigate to Plans Management
      console.log('📋 Step 1: Access Plans Management');
      await navigateToRoute('/plans');

      // Verify plans page loads
      const plansPage = getByClass('plans-list');
      expect(await plansPage.isDisplayed()).toBe(true);

      // Step 2: Verify plan cards are displayed
      console.log('📊 Step 2: Verify plan features display');

      const planCards = element.all(by.css('.plan-card'));
      const planCardCount = await planCards.count();
      expect(planCardCount).toBeGreaterThan(0);

      // Step 3: Test plan navigation
      console.log('✅ Step 3: Test plan interaction');

      // Click on a plan card if available
      if (planCardCount > 0) {
        await planCards.first().click();
        await browser.sleep(1000);
      }
    });
  });

  describe('Cross-Module Integration Workflow', () => {
    it('should demonstrate seamless integration between marketing and plan features', async () => {
      console.log('🔄 Starting Cross-Module Integration Workflow');
      console.log('📝 Scenario: Campaign targeting based on plan features');

      // Setup: Product Manager creating targeted campaign
      await browser.executeScript(`
        window.localStorage.setItem('currentUser', JSON.stringify({
          id: 'marc-id',
          role: 'CUSTOMER_MANAGER',
          name: '${testScenarios.users.productManager.name}'
        }));
      `);

      // Step 1: Create plan-specific campaign
      console.log('🎯 Step 1: Create plan-targeted campaign');

      const navMarketing = getBySelector('nav-marketing');
      await navMarketing.click();

      const createCampaignBtn = getBySelector('create-campaign-btn');
      await createCampaignBtn.click();

      // Configure campaign with plan targeting
      const campaignNameInput = getBySelector('campaign-name');
      await campaignNameInput.sendKeys('Premium Feature Promotion');

      const campaignTypeSelect = getBySelector('campaign-type');
      await campaignTypeSelect.click();
      const landingPageOption = element(by.css('option[value="LANDING_PAGE"]'));
      await landingPageOption.click();

      const targetPlanSelect = getBySelector('target-plan');
      await targetPlanSelect.click();
      const premiumOption = element(by.css('option[value="Premium Enterprise"]'));
      await premiumOption.click();

      // Set campaign goals
      const conversionGoalSelect = getBySelector('conversion-goal');
      await conversionGoalSelect.click();
      const planUpgradeOption = element(by.css('option[value="PLAN_UPGRADE"]'));
      await planUpgradeOption.click();

      const targetAudienceSelect = getBySelector('target-audience');
      await targetAudienceSelect.click();
      const basicUsersOption = element(by.css('option[value="BASIC_PLAN_USERS"]'));
      await basicUsersOption.click();

      const saveCampaignBtn = getBySelector('save-campaign-btn');
      await saveCampaignBtn.click();

      // Step 2: Verify plan integration data
      console.log('📊 Step 2: Verify plan data integration');

      const campaignCard = getBySelector('campaign-card');
      const campaignText = await campaignCard.getText();
      expect(campaignText).toContain('Premium Feature Promotion');
      expect(campaignText).toContain('Premium Enterprise');

      // Step 3: Test analytics integration
      console.log('📈 Step 3: Test cross-module analytics');

      const navAnalytics = getBySelector('nav-analytics');
      await navAnalytics.click();

      // Verify plan-campaign correlation data
      const planConversionMetrics = getBySelector('plan-conversion-metrics');
      expect(await planConversionMetrics.isDisplayed()).toBe(true);

      const featureUsageAnalytics = getBySelector('feature-usage-analytics');
      expect(await featureUsageAnalytics.isDisplayed()).toBe(true);

      // Step 4: Test role-based data access
      console.log('🔐 Step 4: Verify role-based data access');

      // Product Manager should see marketing + plan data
      const marketingMetrics = getBySelector('marketing-metrics');
      expect(await marketingMetrics.isDisplayed()).toBe(true);

      const planMetrics = getBySelector('plan-metrics');
      expect(await planMetrics.isDisplayed()).toBe(true);

      // But not detailed technical configuration
      const technicalConfigPanel = getBySelector('technical-config-panel');
      const isConfigPanelPresent = await technicalConfigPanel.isPresent();
      expect(isConfigPanelPresent).toBe(false);
    });
  });

  describe('Mobile Responsiveness Validation', () => {
    it('should work correctly on mobile devices', async () => {
      console.log('📱 Testing mobile responsiveness');

      // Set mobile viewport (simulating mobile view)
      await browser.manage().window().setSize(375, 812); // iPhone X dimensions

      // Test navigation menu
      const mobileMenuToggle = getBySelector('mobile-menu-toggle');
      await mobileMenuToggle.click();

      const mobileNavMenu = getBySelector('mobile-nav-menu');
      expect(await mobileNavMenu.isDisplayed()).toBe(true);

      // Test role management on mobile
      const mobileNavRoles = getBySelector('mobile-nav-roles');
      await mobileNavRoles.click();

      const roleCardsMobile = getBySelector('role-cards-mobile');
      expect(await roleCardsMobile.isDisplayed()).toBe(true);

      // Test adding team member on mobile
      const mobileAddMember = getBySelector('mobile-add-member');
      await mobileAddMember.click();

      const mobileMemberForm = getBySelector('mobile-member-form');
      expect(await mobileMemberForm.isDisplayed()).toBe(true);

      // Verify form is mobile-friendly
      const memberEmailInput = getBySelector('member-email');
      expect(await memberEmailInput.isDisplayed()).toBe(true);

      const memberRoleSelect = getBySelector('member-role');
      expect(await memberRoleSelect.isDisplayed()).toBe(true);

      // Reset to desktop viewport
      await browser.manage().window().setSize(1920, 1080);
    });
  });

  describe('Performance and User Experience', () => {
    it('should load quickly and provide smooth interactions', async () => {
      console.log('⚡ Testing performance and UX');

      // Test page load performance
      await navigateToRoute('/role-management');
      const roleArchitectureOverview = await waitForElement('role-architecture-overview', 3000);
      expect(await roleArchitectureOverview.isDisplayed()).toBe(true);

      // Test smooth transitions
      const navMarketing = getBySelector('nav-marketing');
      await navMarketing.click();

      const marketingDashboard = await waitForElement('marketing-dashboard', 2000);
      expect(await marketingDashboard.isDisplayed()).toBe(true);

      // Test loading states
      const createCampaignBtn = getBySelector('create-campaign-btn');
      await createCampaignBtn.click();

      const campaignFormLoading = getBySelector('campaign-form-loading');
      const isLoadingPresent = await campaignFormLoading.isPresent();
      expect(isLoadingPresent).toBe(false);

      // Test form validation feedback
      const campaignNameInput = getBySelector('campaign-name');
      await campaignNameInput.sendKeys('Test');
      await campaignNameInput.clear();

      // Wait for validation error to appear
      await browser.sleep(500);
      const validationError = getBySelector('validation-error');
      expect(await validationError.isDisplayed()).toBe(true);
    });
  });

  describe('Accessibility Validation', () => {
    it('should be accessible to users with disabilities', async () => {
      console.log('♿ Testing accessibility compliance');

      // Test keyboard navigation
      await browser.actions().sendKeys(browser.Key.TAB).perform();
      const focusedElement = await browser.driver.switchTo().activeElement();
      const focusedTestId = await focusedElement.getAttribute('data-testid');
      expect(focusedTestId).toBe('skip-to-content');

      // Test ARIA labels and roles
      const roleArchitectureOverview = getBySelector('role-architecture-overview');
      const ariaRole = await roleArchitectureOverview.getAttribute('role');
      expect(ariaRole).toBe('region');

      const ariaLabel = await roleArchitectureOverview.getAttribute('aria-label');
      expect(ariaLabel).toBeTruthy();

      // Test form accessibility
      const addTeamMemberBtn = getBySelector('add-team-member-btn');
      await addTeamMemberBtn.click();

      const memberEmailInput = getBySelector('member-email');
      const ariaDescribedBy = await memberEmailInput.getAttribute('aria-describedby');
      expect(ariaDescribedBy).toBeTruthy();

      const ariaRequired = await memberEmailInput.getAttribute('aria-required');
      expect(ariaRequired).toBe('true');

      // Test error announcements
      await memberEmailInput.sendKeys('invalid');

      // Wait for validation to trigger
      await browser.sleep(1000);

      const emailError = getBySelector('email-error');
      const errorRole = await emailError.getAttribute('role');
      expect(errorRole).toBe('alert');
      expect(await emailError.isDisplayed()).toBe(true);
    });
  });

  describe('Data Persistence and State Management', () => {
    it('should maintain state across page refreshes and navigation', async () => {
      console.log('💾 Testing data persistence');

      // Add team member
      const navRoleManagement = getBySelector('nav-role-management');
      await navRoleManagement.click();

      const addTeamMemberBtn = getBySelector('add-team-member-btn');
      await addTeamMemberBtn.click();

      const memberEmailInput = getBySelector('member-email');
      await memberEmailInput.sendKeys(testScenarios.users.productManager.email);

      const memberRoleSelect = getBySelector('member-role');
      await memberRoleSelect.click();
      const managerOption = element(by.css('option[value="CUSTOMER_MANAGER"]'));
      await managerOption.click();

      const confirmAddMemberBtn = getBySelector('confirm-add-member');
      await confirmAddMemberBtn.click();

      // Wait for member to be added
      await browser.sleep(2000);

      // Navigate away and back
      const navMarketing = getBySelector('nav-marketing');
      await navMarketing.click();
      await browser.sleep(1000);

      await navRoleManagement.click();
      await browser.sleep(1000);

      // Verify team member is still there
      const teamMemberCard = getBySelector('team-member-card');
      const memberCardText = await teamMemberCard.getText();
      expect(memberCardText).toContain(testScenarios.users.productManager.email);

      // Test page refresh
      await browser.refresh();
      await browser.sleep(2000);

      const refreshedTeamMemberCard = getBySelector('team-member-card');
      const refreshedMemberCardText = await refreshedTeamMemberCard.getText();
      expect(refreshedMemberCardText).toContain(testScenarios.users.productManager.email);
    });
  });
});
