import { Component, ChangeDetectionStrategy, input, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MockApiService } from '../../../core/services/mock-api.service';
import { PlanFeature } from '../../../core/models/plan-feature.models';
import { Plan, Feature, FeatureCategory } from '../../../core/models/pricing.models';

@Component({
  selector: 'app-feature-assignment',
  template: `
    <div class="feature-assignment-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <button class="back-button" (click)="goBack()">
            <i class="pi pi-arrow-left"></i>
            Back to Plan
          </button>
          <h1>Feature Assignment - {{ currentPlan()?.name || 'Plan' }}</h1>
          <p class="subtitle">Manage features for your pricing plan</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-primary" (click)="openAddFeaturesModal()">
            <i class="pi pi-plus"></i>
            Add Features
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="page-content">
        <!-- Plan Features Overview -->
        <div class="features-overview">
          <div class="overview-stats">
            <div class="stat-card">
              <div class="stat-number">{{ assignedFeatures().length }}</div>
              <div class="stat-label">Assigned Features</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ availableFeatures().length }}</div>
              <div class="stat-label">Available Features</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ categories().length }}</div>
              <div class="stat-label">Categories</div>
            </div>
          </div>
        </div>

        <!-- Assigned Features Section -->
        <div class="assigned-features-section">
          <div class="section-header">
            <h2>Assigned Features</h2>
            <div class="section-actions">
              <div class="search-box">
                <i class="pi pi-search"></i>
                <input 
                  type="text" 
                  placeholder="Search assigned features..." 
                  [(ngModel)]="searchTerm"
                  (input)="onSearchChange()">
              </div>
              <select [(ngModel)]="selectedCategory" (change)="onCategoryChange()">
                <option value="">All Categories</option>
                <option *ngFor="let category of categories()" [value]="category.id">
                  {{ category.name }}
                </option>
              </select>
            </div>
          </div>

          <!-- Assigned Features List -->
          <div class="assigned-features-list" *ngIf="filteredAssignedFeatures().length > 0">
            <div 
              *ngFor="let planFeature of filteredAssignedFeatures(); trackBy: trackByPlanFeatureId" 
              class="assigned-feature-card"
              [class.editing]="editingFeatureId() === planFeature._id">
              
              <div class="feature-header">
                <div class="feature-info">
                  <h3 class="feature-name">{{ planFeature.feature.name }}</h3>
                  <p class="feature-description">{{ getFeatureDescription(planFeature.feature._id) }}</p>
                  <div class="feature-meta">
                    <span class="feature-key">Key: {{ planFeature.feature.roleId }}</span>
                    <span class="feature-category" *ngIf="getCategoryName(getFeatureCategoryId(planFeature.feature._id))">
                      Category: {{ getCategoryName(getFeatureCategoryId(planFeature.feature._id)) }}
                    </span>
                  </div>
                </div>
                <div class="feature-status">
                  <label class="toggle-switch">
                    <input 
                      type="checkbox" 
                      [checked]="planFeature.enabled"
                      (change)="toggleFeatureEnabled(planFeature._id, $event)">
                    <span class="toggle-slider"></span>
                  </label>
                  <span class="status-label" [class.enabled]="planFeature.enabled">
                    {{ planFeature.enabled ? 'Enabled' : 'Disabled' }}
                  </span>
                </div>
              </div>

              <!-- Feature Configuration -->
              <div class="feature-config" *ngIf="editingFeatureId() === planFeature._id">
                <div class="config-section">
                  <h4>Configuration</h4>
                  <div class="config-fields">
                    <div class="field-group">
                      <label>Default Value</label>
                      <input 
                        type="text" 
                        [ngModel]="getFeatureConfigValue(planFeature._id, 'defaultValue')"
                        (ngModelChange)="setFeatureConfigValue(planFeature._id, 'defaultValue', $event)"
                        placeholder="Default configuration value">
                    </div>
                    <div class="field-group">
                      <label>Description</label>
                      <textarea 
                        [ngModel]="getFeatureConfigValue(planFeature._id, 'description')"
                        (ngModelChange)="setFeatureConfigValue(planFeature._id, 'description', $event)"
                        placeholder="Feature configuration description"></textarea>
                    </div>
                  </div>
                </div>

                <div class="config-section">
                  <h4>Limits</h4>
                  <div class="config-fields">
                    <div class="field-group">
                      <label>Max Usage</label>
                      <input 
                        type="number" 
                        [ngModel]="getFeatureConfigValue(planFeature._id, 'maxUsage')"
                        (ngModelChange)="setFeatureConfigValue(planFeature._id, 'maxUsage', $event)"
                        placeholder="Maximum usage limit">
                    </div>
                    <div class="field-group">
                      <label>Rate Limit</label>
                      <input 
                        type="number" 
                        [ngModel]="getFeatureConfigValue(planFeature._id, 'rateLimit')"
                        (ngModelChange)="setFeatureConfigValue(planFeature._id, 'rateLimit', $event)"
                        placeholder="Rate limit per hour">
                    </div>
                  </div>
                </div>

                <div class="config-actions">
                  <button class="btn btn-secondary" (click)="cancelEdit(planFeature._id)">
                    Cancel
                  </button>
                  <button class="btn btn-primary" (click)="saveFeatureConfig(planFeature._id)">
                    Save Configuration
                  </button>
                </div>
              </div>

              <!-- Feature Actions -->
              <div class="feature-actions">
                <button 
                  class="btn btn-sm btn-outline" 
                  (click)="editFeature(planFeature._id)"
                  [class.active]="editingFeatureId() === planFeature._id">
                  <i class="pi pi-cog"></i>
                  {{ editingFeatureId() === planFeature._id ? 'Cancel Edit' : 'Configure' }}
                </button>
                <button 
                  class="btn btn-sm btn-danger" 
                  (click)="removeFeature(planFeature._id)">
                  <i class="pi pi-trash"></i>
                  Remove
                </button>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div class="empty-state" *ngIf="filteredAssignedFeatures().length === 0">
            <i class="pi pi-info-circle"></i>
            <h3>No features assigned</h3>
            <p>This plan doesn't have any features assigned yet. Click "Add Features" to get started.</p>
            <button class="btn btn-primary" (click)="openAddFeaturesModal()">
              <i class="pi pi-plus"></i>
              Add Features
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./feature-assignment.component.css'],
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class FeatureAssignmentComponent implements OnInit, OnDestroy {
  // Accept planId as input (when loaded from plan editor) or get from route
  planIdInput = input<string>('');

  private readonly mockApi = inject(MockApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // Get planId from input or route parameters
  planId = signal<string>('');

  // Data signals
  planFeatures = signal<PlanFeature[]>([]);
  allFeatures = signal<Feature[]>([]);
  currentPlan = signal<Plan | null>(null);
  categories = signal<FeatureCategory[]>([]);

  // UI state
  loading = signal(false);
  searchTerm = signal('');
  selectedCategory = signal('');
  editingFeatureId = signal<string | null>(null);
  featureConfig = signal<Record<string, any>>({});

  // Computed properties
  readonly assignedFeatures = computed(() => this.planFeatures());
  
  readonly availableFeatures = computed(() => {
    const assignedFeatureIds = this.planFeatures().map(pf => pf.feature._id);
    return this.allFeatures().filter(f => !assignedFeatureIds.includes(f.id));
  });

  readonly filteredAssignedFeatures = computed(() => {
    let features = this.assignedFeatures();
    
    // Filter by search term
    const search = this.searchTerm().toLowerCase();
    if (search) {
      features = features.filter(pf => 
        pf.feature.name.toLowerCase().includes(search) ||
        pf.feature.roleId.toLowerCase().includes(search)
      );
    }
    
    // Filter by category
    const categoryId = this.selectedCategory();
    if (categoryId) {
      features = features.filter(pf => {
        const feature = this.allFeatures().find(f => f.id === pf.feature._id);
        return feature?.categoryId === categoryId;
      });
    }
    
    return features;
  });

  ngOnInit() {
    const inputPlanId = this.planIdInput();
    const routePlanId = this.route.snapshot.paramMap.get('planId');
    const planId = inputPlanId || routePlanId;

    if (planId) {
      this.planId.set(planId);
      this.loadData();
    } else {
      console.error('No planId found in input or route parameters');
    }
  }

  ngOnDestroy() {
    // Cleanup if needed
  }

  private async loadData() {
    this.loading.set(true);
    try {
      // Load plan features
      const planFeatures = this.mockApi.getPlanFeatures(this.planId());
      this.planFeatures.set(planFeatures);

      // Load available features
      const features = this.mockApi.features();
      this.allFeatures.set(features);

      // Load categories
      const categories = this.mockApi.categories();
      this.categories.set(categories);

      // Load current plan
      const plan = this.mockApi.getPlan(this.planId());
      this.currentPlan.set(plan || null);

      console.log('Feature assignment data loaded:', {
        planFeatures: planFeatures.length,
        availableFeatures: features.length,
        categories: categories.length,
        plan: plan?.name
      });

    } catch (error) {
      console.error('Error loading feature assignment data:', error);
    } finally {
      this.loading.set(false);
    }
  }

  onSearchChange() {
    // Search is handled by computed property
  }

  onCategoryChange() {
    // Category filtering is handled by computed property
  }

  toggleFeatureEnabled(planFeatureId: string, event: Event) {
    const target = event.target as HTMLInputElement;
    const enabled = target.checked;
    
    // Update the plan feature
    const updatedFeatures = this.planFeatures().map(pf => 
      pf._id === planFeatureId ? { ...pf, enabled, updatedAt: new Date() } : pf
    );
    this.planFeatures.set(updatedFeatures);
    
    // Update in mock API
    this.mockApi.updatePlanFeature(planFeatureId, { enabled });
    
    console.log(`Feature ${planFeatureId} ${enabled ? 'enabled' : 'disabled'}`);
  }

  editFeature(planFeatureId: string) {
    if (this.editingFeatureId() === planFeatureId) {
      this.editingFeatureId.set(null);
    } else {
      this.editingFeatureId.set(planFeatureId);
      
      // Initialize config if not exists
      if (!this.featureConfig()[planFeatureId]) {
        const planFeature = this.planFeatures().find(pf => pf._id === planFeatureId);
        this.featureConfig.update(config => ({
          ...config,
          [planFeatureId]: {
            defaultValue: planFeature?.configuration?.['defaultValue'] || '',
            description: planFeature?.configuration?.['description'] || '',
            maxUsage: planFeature?.limits?.['maxUsage'] || '',
            rateLimit: planFeature?.limits?.['rateLimit'] || ''
          }
        }));
      }
    }
  }

  cancelEdit(planFeatureId: string) {
    this.editingFeatureId.set(null);
    // Reset config to original values
    const planFeature = this.planFeatures().find(pf => pf._id === planFeatureId);
    if (planFeature) {
      this.featureConfig.update(config => ({
        ...config,
        [planFeatureId]: {
          defaultValue: planFeature.configuration?.['defaultValue'] || '',
          description: planFeature.configuration?.['description'] || '',
          maxUsage: planFeature.limits?.['maxUsage'] || '',
          rateLimit: planFeature.limits?.['rateLimit'] || ''
        }
      }));
    }
  }

  saveFeatureConfig(planFeatureId: string) {
    const config = this.featureConfig()[planFeatureId];
    if (!config) return;

    // Update the plan feature
    const updatedFeatures = this.planFeatures().map(pf => 
      pf._id === planFeatureId ? {
        ...pf,
        configuration: {
          defaultValue: config.defaultValue,
          description: config.description
        },
        limits: {
          maxUsage: config.maxUsage,
          rateLimit: config.rateLimit
        },
        updatedAt: new Date()
      } : pf
    );
    this.planFeatures.set(updatedFeatures);

    // Update in mock API
    this.mockApi.updatePlanFeature(planFeatureId, {
      configuration: {
        defaultValue: config.defaultValue,
        description: config.description
      },
      limits: {
        maxUsage: config.maxUsage,
        rateLimit: config.rateLimit
      }
    });

    this.editingFeatureId.set(null);
    console.log('Feature configuration saved:', planFeatureId, config);
  }

  removeFeature(planFeatureId: string) {
    if (confirm('Are you sure you want to remove this feature from the plan?')) {
      // Remove from plan features
      const updatedFeatures = this.planFeatures().filter(pf => pf._id !== planFeatureId);
      this.planFeatures.set(updatedFeatures);
      
      // Remove from mock API
      this.mockApi.deletePlanFeature(planFeatureId);
      
      console.log('Feature removed from plan:', planFeatureId);
    }
  }

  openAddFeaturesModal() {
    // Navigate to add features page
    this.router.navigate(['/plans', this.planId(), 'add-features']);
  }

  goBack() {
    const currentPlanId = this.planId();
    this.router.navigate(['/plans', currentPlanId, 'features']);
  }

  // Helper methods for two-way binding
  getFeatureConfigValue(planFeatureId: string, key: string): any {
    return this.featureConfig()[planFeatureId]?.[key] || '';
  }

  setFeatureConfigValue(planFeatureId: string, key: string, value: any): void {
    const currentConfig = this.featureConfig();
    const featureConfig = currentConfig[planFeatureId] || {};
    this.featureConfig.set({
      ...currentConfig,
      [planFeatureId]: {
        ...featureConfig,
        [key]: value
      }
    });
  }

  getFeatureDescription(featureId: string): string {
    const feature = this.allFeatures().find(f => f.id === featureId);
    return feature?.description || 'No description available';
  }

  getFeatureCategoryId(featureId: string): string {
    const feature = this.allFeatures().find(f => f.id === featureId);
    return feature?.categoryId || '';
  }

  getCategoryName(categoryId: string): string {
    const category = this.categories().find(c => c.id === categoryId);
    return category?.name || '';
  }

  trackByPlanFeatureId(index: number, planFeature: PlanFeature): string {
    return planFeature._id;
  }
}
