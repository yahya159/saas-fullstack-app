import { Injectable, signal, computed } from '@angular/core';
import { 
  Catalog, 
  Feature, 
  FeatureCategory,
  Plan, 
  WidgetTemplate, 
  WidgetInstance
} from '../models/pricing.models';

@Injectable({
  providedIn: 'root'
})
export class MockApiService {
  private readonly STORAGE_KEY = 'saas-pricing-catalog';
  
  // Main catalog signal
  private catalogSignal = signal<Catalog>(this.getInitialCatalog());
  
  // Computed signals for easy access
  readonly features = computed(() => this.catalogSignal().features);
  readonly categories = computed(() => this.catalogSignal().categories);
  readonly plans = computed(() => this.catalogSignal().plans);
  readonly templates = computed(() => this.catalogSignal().templates);
  readonly widgets = computed(() => this.catalogSignal().widgets);
  readonly catalog = computed(() => this.catalogSignal());

  constructor() {
    this.loadFromStorage();
  }

  // Features CRUD
  getFeatures(): Feature[] {
    return this.features();
  }

  getFeature(id: string): Feature | undefined {
    return this.features().find(f => f.id === id);
  }

  addFeature(feature: Omit<Feature, 'id'>): Feature {
    const newFeature: Feature = {
      ...feature,
      id: this.generateId()
    };
    
    const currentCatalog = this.catalogSignal();
    this.updateCatalog({
      ...currentCatalog,
      features: [...currentCatalog.features, newFeature]
    });
    
    return newFeature;
  }

  updateFeature(id: string, updates: Partial<Feature>): Feature | undefined {
    const currentCatalog = this.catalogSignal();
    const features = currentCatalog.features.map(f => 
      f.id === id ? { ...f, ...updates } : f
    );
    
    this.updateCatalog({
      ...currentCatalog,
      features
    });
    
    return features.find(f => f.id === id);
  }

  deleteFeature(id: string): boolean {
    const currentCatalog = this.catalogSignal();
    const features = currentCatalog.features.filter(f => f.id !== id);
    this.updateCatalog({
      ...currentCatalog,
      features
    });
    return true;
  }

  // Categories CRUD
  getCategories(): FeatureCategory[] {
    return this.categories();
  }

  getCategory(id: string): FeatureCategory | undefined {
    return this.categories().find(c => c.id === id);
  }

  addCategory(category: Omit<FeatureCategory, 'id'>): FeatureCategory {
    const newCategory: FeatureCategory = {
      ...category,
      id: this.generateId()
    };
    
    const currentCatalog = this.catalogSignal();
    
    this.updateCatalog({
      ...currentCatalog,
      categories: [...currentCatalog.categories, newCategory]
    });
    
    return newCategory;
  }

  updateCategory(id: string, updates: Partial<FeatureCategory>): FeatureCategory | undefined {
    const currentCatalog = this.catalogSignal();
    const categories = currentCatalog.categories.map(c => 
      c.id === id ? { ...c, ...updates } : c
    );
    
    this.updateCatalog({
      ...currentCatalog,
      categories
    });
    
    return categories.find(c => c.id === id);
  }

  deleteCategory(id: string): boolean {
    const currentCatalog = this.catalogSignal();
    const categories = currentCatalog.categories.filter(c => c.id !== id);
    this.updateCatalog({
      ...currentCatalog,
      categories
    });
    return true;
  }

  // Plans CRUD
  getPlans(): Plan[] {
    return this.plans();
  }

  getPlan(id: string): Plan | undefined {
    return this.plans().find(p => p.id === id);
  }

  // Plan Features CRUD
  getPlanFeatures(planId: string): any[] {
    // Mock plan features data - using actual feature IDs from the features list
    return [
      {
        _id: '1',
        plan: { _id: planId, name: 'Basic Plan' },
        feature: { _id: '1', name: 'API Requests', roleId: 'api.limit' },
        enabled: true,
        configuration: { endpoint: '/api/v1', version: '1.0' },
        limits: { requests_per_hour: 1000 },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: '2',
        plan: { _id: planId, name: 'Basic Plan' },
        feature: { _id: '11', name: 'Storage', roleId: 'storage.gb' },
        enabled: true,
        configuration: {},
        limits: { gb: 10 },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  addPlanFeature(planFeature: any): any {
    // Mock implementation - in real app, this would save to backend
    console.log('Adding plan feature:', planFeature);
    return planFeature;
  }

  updatePlanFeature(planFeatureId: string, updates: any): any {
    // Mock implementation - in real app, this would update in backend
    console.log('Updating plan feature:', planFeatureId, updates);
    return { _id: planFeatureId, ...updates };
  }

  deletePlanFeature(planFeatureId: string): void {
    // Mock implementation - in real app, this would delete from backend
    console.log('Deleting plan feature:', planFeatureId);
  }

  addPlan(plan: Omit<Plan, 'id'>): Plan {
    const newPlan: Plan = {
      ...plan,
      id: this.generateId(),
      tiers: plan.tiers.map(tier => ({
        ...tier,
        id: this.generateId()
      }))
    };
    
    this.updateCatalog({
      ...this.catalogSignal(),
      plans: [...this.plans(), newPlan]
    });
    
    return newPlan;
  }

  updatePlan(id: string, updates: Partial<Plan>): Plan | undefined {
    const plans = this.plans().map(p => 
      p.id === id ? { ...p, ...updates } : p
    );
    
    this.updateCatalog({
      ...this.catalogSignal(),
      plans
    });
    
    return plans.find(p => p.id === id);
  }

  deletePlan(id: string): boolean {
    const plans = this.plans().filter(p => p.id !== id);
    this.updateCatalog({
      ...this.catalogSignal(),
      plans
    });
    return true;
  }

  // Templates CRUD
  getTemplates(): WidgetTemplate[] {
    return this.templates();
  }

  getTemplate(id: string): WidgetTemplate | undefined {
    return this.templates().find(t => t.id === id);
  }

  addTemplate(template: Omit<WidgetTemplate, 'id'>): WidgetTemplate {
    const newTemplate: WidgetTemplate = {
      ...template,
      id: this.generateId(),
      columns: template.columns.map(col => ({
        ...col,
        id: this.generateId(),
        blocks: col.blocks.map(block => ({
          ...block,
          id: this.generateId()
        }))
      }))
    };
    
    this.updateCatalog({
      ...this.catalogSignal(),
      templates: [...this.templates(), newTemplate]
    });
    
    return newTemplate;
  }

  // Widgets CRUD
  getWidgets(): WidgetInstance[] {
    return this.widgets();
  }

  getWidget(id: string): WidgetInstance | undefined {
    return this.widgets().find(w => w.id === id);
  }

  addWidget(widget: Omit<WidgetInstance, 'id'>): WidgetInstance {
    const newWidget: WidgetInstance = {
      ...widget,
      id: this.generateId(),
      columns: widget.columns.map(col => ({
        ...col,
        id: this.generateId(),
        blocks: col.blocks.map(block => ({
          ...block,
          id: this.generateId()
        }))
      }))
    };
    
    this.updateCatalog({
      ...this.catalogSignal(),
      widgets: [...this.widgets(), newWidget]
    });
    
    return newWidget;
  }

  updateWidget(id: string, updates: Partial<WidgetInstance>): WidgetInstance | undefined {
    console.log('=== MOCK API: updateWidget ===');
    console.log('Parameters:', { id, updates });
    
    const widgets = this.widgets().map(w => 
      w.id === id ? { ...w, ...updates } : w
    );
    
    console.log('Updated widgets array:', widgets);
    
    this.updateCatalog({
      ...this.catalogSignal(),
      widgets
    });
    
    const updatedWidget = widgets.find(w => w.id === id);
    console.log('Updated widget:', updatedWidget);
    return updatedWidget;
  }

  deleteWidget(id: string): boolean {
    const widgets = this.widgets().filter(w => w.id !== id);
    this.updateCatalog({
      ...this.catalogSignal(),
      widgets
    });
    return true;
  }

  // Private methods
  private updateCatalog(newCatalog: Catalog): void {
    this.catalogSignal.set(newCatalog);
    this.saveToStorage();
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.catalogSignal()));
    } catch (error) {
      console.warn('Failed to save catalog to localStorage:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const catalog = JSON.parse(stored) as Catalog;
        // Ensure the loaded catalog has all required properties with proper structure
        const initialCatalog = this.getInitialCatalog();
        const mergedCatalog: Catalog = {
          features: catalog.features || initialCatalog.features,
          categories: Array.isArray(catalog.categories) ? catalog.categories : initialCatalog.categories,
          plans: catalog.plans || initialCatalog.plans,
          templates: catalog.templates || initialCatalog.templates,
          widgets: catalog.widgets || initialCatalog.widgets
        };
        this.catalogSignal.set(mergedCatalog);
      }
    } catch (error) {
      console.warn('Failed to load catalog from localStorage:', error);
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // Utility method to clear localStorage and reset to initial data
  clearStorage(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.catalogSignal.set(this.getInitialCatalog());
  }

  private getInitialCatalog(): Catalog {
    const features: Feature[] = [
      { id: '1', key: 'api.limit', name: 'API Requests', description: 'Monthly API request limit', enabledByDefault: true },
      { id: '2', key: 'custom.domain', name: 'Custom Domain', description: 'Use your own domain name', enabledByDefault: false },
      { id: '3', key: 'sso.saml', name: 'SAML SSO', description: 'Single Sign-On with SAML', enabledByDefault: false },
      { id: '4', key: 'audit.logs', name: 'Audit Logs', description: 'Detailed activity logs', enabledByDefault: false },
      { id: '5', key: 'branding.remove', name: 'Remove Branding', description: 'Remove platform branding', enabledByDefault: false },
      { id: '6', key: 'support.priority', name: 'Priority Support', description: '24/7 priority support', enabledByDefault: false },
      { id: '7', key: 'webhooks', name: 'Webhooks', description: 'Real-time webhook notifications', enabledByDefault: true },
      { id: '8', key: 'rate.limit', name: 'Rate Limiting', description: 'Advanced rate limiting', enabledByDefault: true },
      { id: '9', key: 'seats', name: 'Team Seats', description: 'Number of team members', enabledByDefault: true },
      { id: '10', key: 'projects.max', name: 'Max Projects', description: 'Maximum number of projects', enabledByDefault: true },
      { id: '11', key: 'storage.gb', name: 'Storage', description: 'Storage space in GB', enabledByDefault: true }
    ];

    const plans: Plan[] = [
      {
        id: 'plan-1',
        name: 'Starter Suite',
        description: 'Perfect for small teams getting started',
        public: true,
        tiers: [
          {
            id: 'tier-1',
            name: 'Basic',
            monthlyPrice: 99,
            yearlyPrice: 990,
            currency: 'MAD',
            features: ['api.limit', 'webhooks', 'rate.limit', 'seats', 'projects.max', 'storage.gb'],
            limits: { 'api.limit': 10000, 'seats': 5, 'projects.max': 3, 'storage.gb': 10 },
            ctaLabel: 'Get Started'
          },
          {
            id: 'tier-2',
            name: 'Pro',
            monthlyPrice: 249,
            yearlyPrice: 2490,
            currency: 'MAD',
            features: ['api.limit', 'webhooks', 'rate.limit', 'seats', 'projects.max', 'storage.gb', 'custom.domain'],
            limits: { 'api.limit': 100000, 'seats': 25, 'projects.max': 15, 'storage.gb': 100 },
            highlight: true,
            ctaLabel: 'Start Pro'
          },
          {
            id: 'tier-3',
            name: 'Enterprise',
            monthlyPrice: 0,
            yearlyPrice: 0,
            currency: 'MAD',
            features: ['api.limit', 'webhooks', 'rate.limit', 'seats', 'projects.max', 'storage.gb', 'custom.domain', 'sso.saml', 'audit.logs', 'branding.remove', 'support.priority'],
            limits: { 'api.limit': 1000000, 'seats': 100, 'projects.max': 100, 'storage.gb': 1000 },
            ctaLabel: 'Contact'
          }
        ]
      }
    ];

    const templates: WidgetTemplate[] = [
      {
        id: 'template-1',
        name: '3-column classic',
        columns: [
          {
            id: 'col-1',
            order: 0,
            widthFraction: 4,
            blocks: [
              { id: 'block-1', type: 'headline', text: 'Basic', order: 0, style: { textAlign: 'center' } },
              { id: 'block-2', type: 'price-card', planTierId: 'tier-1', order: 1 },
              { id: 'block-3', type: 'feature-list', order: 2 },
              { id: 'block-4', type: 'badge', text: 'Most Popular', order: 3, style: { textAlign: 'center' } }
            ]
          },
          {
            id: 'col-2',
            order: 1,
            widthFraction: 4,
            blocks: [
              { id: 'block-5', type: 'headline', text: 'Pro', order: 0, style: { textAlign: 'center' } },
              { id: 'block-6', type: 'price-card', planTierId: 'tier-2', order: 1 },
              { id: 'block-7', type: 'feature-list', order: 2 },
              { id: 'block-8', type: 'badge', text: 'Recommended', order: 3, style: { textAlign: 'center' } }
            ]
          },
          {
            id: 'col-3',
            order: 2,
            widthFraction: 4,
            blocks: [
              { id: 'block-9', type: 'headline', text: 'Enterprise', order: 0, style: { textAlign: 'center' } },
              { id: 'block-10', type: 'price-card', planTierId: 'tier-3', order: 1 },
              { id: 'block-11', type: 'feature-list', order: 2 },
              { id: 'block-12', type: 'badge', text: 'Full Features', order: 3, style: { textAlign: 'center' } }
            ]
          }
        ],
        style: { gap: 24, maxWidth: 1200 }
      },
      {
        id: 'template-2',
        name: '2-column spotlight',
        columns: [
          {
            id: 'col-4',
            order: 0,
            widthFraction: 6,
            blocks: [
              { id: 'block-13', type: 'headline', text: 'Basic', order: 0, style: { textAlign: 'center' } },
              { id: 'block-14', type: 'price-card', planTierId: 'tier-1', order: 1 },
              { id: 'block-15', type: 'feature-list', order: 2 }
            ]
          },
          {
            id: 'col-5',
            order: 1,
            widthFraction: 6,
            blocks: [
              { id: 'block-16', type: 'headline', text: 'Pro', order: 0, style: { textAlign: 'center' } },
              { id: 'block-17', type: 'price-card', planTierId: 'tier-2', order: 1 },
              { id: 'block-18', type: 'feature-list', order: 2 },
              { id: 'block-19', type: 'badge', text: 'Most Popular', order: 3, style: { textAlign: 'center' } }
            ]
          }
        ],
        style: { gap: 32, maxWidth: 800 }
      },
      {
        id: 'template-3',
        name: 'Comparison matrix',
        columns: [
          {
            id: 'col-6',
            order: 0,
            widthFraction: 3,
            blocks: [
              { id: 'block-20', type: 'headline', text: 'Features', order: 0, style: { textAlign: 'left' } },
              { id: 'block-21', type: 'feature-list', order: 1 }
            ]
          },
          {
            id: 'col-7',
            order: 1,
            widthFraction: 3,
            blocks: [
              { id: 'block-22', type: 'headline', text: 'Basic', order: 0, style: { textAlign: 'center' } },
              { id: 'block-23', type: 'price-card', planTierId: 'tier-1', order: 1 }
            ]
          },
          {
            id: 'col-8',
            order: 2,
            widthFraction: 3,
            blocks: [
              { id: 'block-24', type: 'headline', text: 'Pro', order: 0, style: { textAlign: 'center' } },
              { id: 'block-25', type: 'price-card', planTierId: 'tier-2', order: 1 },
              { id: 'block-26', type: 'badge', text: 'Popular', order: 2, style: { textAlign: 'center' } }
            ]
          },
          {
            id: 'col-9',
            order: 3,
            widthFraction: 3,
            blocks: [
              { id: 'block-27', type: 'headline', text: 'Enterprise', order: 0, style: { textAlign: 'center' } },
              { id: 'block-28', type: 'price-card', planTierId: 'tier-3', order: 1 }
            ]
          }
        ],
        style: { gap: 16, maxWidth: 1000 }
      }
    ];

    const widgets: WidgetInstance[] = [
      {
        id: 'widget-1',
        name: 'Main Pricing Widget',
        templateId: 'template-1',
        attachedPlanId: 'plan-1',
        columns: templates[0].columns,
        style: templates[0].style
      }
    ];

    const categories: FeatureCategory[] = [
      { id: 'core', name: 'Core Features', description: 'Essential features for all plans' },
      { id: 'premium', name: 'Premium Features', description: 'Advanced features for professional plans' },
      { id: 'enterprise', name: 'Enterprise Features', description: 'Enterprise-grade features' },
      { id: 'security', name: 'Security Features', description: 'Security and compliance features' },
      { id: 'integration', name: 'Integration Features', description: 'Third-party integrations and APIs' }
    ];

    return {
      features,
      categories,
      plans,
      templates,
      widgets
    };
  }
}
