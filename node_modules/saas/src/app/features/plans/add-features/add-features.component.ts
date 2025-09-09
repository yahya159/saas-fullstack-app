import { Component, ChangeDetectionStrategy, input, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MockApiService } from '../../../core/services/mock-api.service';
import { PlanFeatureApiService } from '../../../core/services/plan-feature-api.service';
import { Feature, Plan } from '../../../core/models/pricing.models';
import { PlanFeature } from '../../../core/models/plan-feature.models';

@Component({
  selector: 'app-add-features',
  template: `
    <div class="add-features-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <button class="back-button" (click)="goBack()">
            <i class="pi pi-arrow-left"></i>
            Back to Plan
          </button>
          <h1>Add Features to {{ currentPlan()?.name || 'Plan' }}</h1>
          <p class="subtitle">Select features to add to your plan</p>
        </div>
      </div>

      <!-- Content -->
      <div class="page-content">
        <!-- Available Features Section -->
        <div class="features-section">
          <div class="section-header">
            <h2>Available Features</h2>
            <div class="header-actions">
              <div class="feature-count">
                {{ unassignedFeatures().length }} features available
              </div>
              <button class="btn btn-primary btn-sm" (click)="createNewFeature()">
                <i class="pi pi-plus"></i>
                Create New Feature
              </button>
            </div>
          </div>

          <!-- Search and Filter -->
          <div class="search-filter-bar">
            <div class="search-box">
              <i class="pi pi-search"></i>
              <input 
                type="text" 
                placeholder="Search features..." 
                [(ngModel)]="searchTerm"
                (input)="onSearchChange()">
            </div>
            <div class="filter-options">
              <select [(ngModel)]="selectedCategory" (change)="onCategoryChange()">
                <option value="">All Categories</option>
                <option *ngFor="let category of categories()" [value]="category.id">
                  {{ category.name }}
                </option>
              </select>
            </div>
          </div>

          <!-- Features List -->
          <div class="features-list" *ngIf="filteredFeatures().length > 0">
            <div 
              *ngFor="let feature of filteredFeatures(); trackBy: trackByFeatureId" 
              class="feature-card"
              [class.selected]="selectedFeatures().has(feature.id)"
              (click)="toggleFeatureSelection(feature)">
              
              <div class="feature-checkbox">
                <input 
                  type="checkbox" 
                  [checked]="selectedFeatures().has(feature.id)"
                  (change)="toggleFeatureSelection(feature)"
                  (click)="$event.stopPropagation()">
              </div>
              
              <div class="feature-content">
                <h3 class="feature-name">{{ feature.name }}</h3>
                <p class="feature-description">{{ feature.description || 'No description available' }}</p>
                <div class="feature-meta">
                  <span class="feature-key">Key: {{ feature.key }}</span>
                  <span class="feature-category" *ngIf="getCategoryName(feature.categoryId)">
                    Category: {{ getCategoryName(feature.categoryId) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div class="empty-state" *ngIf="filteredFeatures().length === 0">
            <i class="pi pi-info-circle"></i>
            <h3>No features available</h3>
            <p>All features are already assigned to this plan or no features match your search.</p>
            
            <!-- Debug Info -->
            <div class="debug-info" style="margin-top: 20px; padding: 15px; background: #f5f5f5; border-radius: 8px; font-family: monospace; font-size: 12px;">
              <h4>Debug Information:</h4>
              <p><strong>Available Features:</strong> {{ availableFeatures().length }}</p>
              <p><strong>Plan Features:</strong> {{ planFeatures().length }}</p>
              <p><strong>Unassigned Features:</strong> {{ unassignedFeatures().length }}</p>
              <p><strong>Filtered Features:</strong> {{ filteredFeatures().length }}</p>
              <p><strong>Search Term:</strong> "{{ searchTerm() }}"</p>
              <p><strong>Selected Category:</strong> "{{ selectedCategory() }}"</p>
              <button (click)="clearFilters()" style="margin-top: 10px; padding: 5px 10px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        <!-- Selected Features Summary -->
        <div class="selected-summary" *ngIf="selectedFeatures().size > 0">
          <h3>Selected Features ({{ selectedFeatures().size }})</h3>
          <div class="selected-list">
            <span 
              *ngFor="let featureId of selectedFeatures()" 
              class="selected-tag">
              {{ getFeatureName(featureId) }}
              <button (click)="removeFeature(featureId)">×</button>
            </span>
          </div>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="page-footer">
        <div class="footer-content">
          <div class="selection-info">
            <span *ngIf="selectedFeatures().size > 0">
              {{ selectedFeatures().size }} feature(s) selected
            </span>
            <span *ngIf="selectedFeatures().size === 0">
              No features selected
            </span>
          </div>
          <div class="action-buttons">
            <button 
              class="btn btn-secondary" 
              (click)="goBack()">
              Cancel
            </button>
            <button 
              class="btn btn-primary" 
              [disabled]="selectedFeatures().size === 0 || loading()"
              (click)="addSelectedFeatures()">
              <span *ngIf="loading()" class="loading-spinner"></span>
              {{ loading() ? 'Adding...' : 'Add Selected Features' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./add-features.component.css'],
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class AddFeaturesComponent implements OnInit, OnDestroy {
  // Accept planId as input (when loaded from plan editor) or get from route
  planIdInput = input<string>('');

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly mockApi = inject(MockApiService);
  private readonly planFeatureApi = inject(PlanFeatureApiService);

  // Get planId from input or route parameters
  planId = signal<string>('');

  // State
  currentPlan = signal<Plan | null>(null);
  availableFeatures = signal<Feature[]>([]);
  planFeatures = signal<PlanFeature[]>([]);
  categories = signal<any[]>([]);
  selectedFeatures = signal<Set<string>>(new Set());
  searchTerm = signal<string>('');
  selectedCategory = signal<string>('');
  loading = signal<boolean>(false);

  // Computed
  unassignedFeatures = computed(() => {
    const assignedFeatureIds = this.planFeatures().map(pf => pf.feature._id);
    const availableFeatures = this.availableFeatures();
    
    console.log('=== DEBUG UNASSIGNED FEATURES ===');
    console.log('Available features count:', availableFeatures.length);
    console.log('Available features:', availableFeatures.map(f => ({ id: f.id, name: f.name })));
    console.log('Plan features count:', this.planFeatures().length);
    console.log('Plan features:', this.planFeatures().map(pf => ({ _id: pf.feature._id, name: pf.feature.name })));
    console.log('Assigned feature IDs:', assignedFeatureIds);
    
    const unassigned = availableFeatures.filter(f => !assignedFeatureIds.includes(f.id));
    console.log('Unassigned features count:', unassigned.length);
    console.log('Unassigned features:', unassigned.map(f => ({ id: f.id, name: f.name })));
    console.log('=== END DEBUG ===');
    
    return unassigned;
  });

  filteredFeatures = computed(() => {
    let features = this.unassignedFeatures();
    
    console.log('=== DEBUG FILTERED FEATURES ===');
    console.log('Unassigned features before filtering:', features.length);
    console.log('Search term:', this.searchTerm());
    console.log('Selected category:', this.selectedCategory());
    
    // Filter by search term
    const search = this.searchTerm().toLowerCase();
    if (search) {
      features = features.filter(f => 
        f.name.toLowerCase().includes(search) || 
        f.description?.toLowerCase().includes(search) ||
        f.key.toLowerCase().includes(search)
      );
      console.log('After search filter:', features.length);
    }
    
    // Filter by category
    const category = this.selectedCategory();
    if (category) {
      features = features.filter(f => f.categoryId === category);
      console.log('After category filter:', features.length);
    }
    
    console.log('Final filtered features:', features.length);
    console.log('=== END DEBUG FILTERED ===');
    
    return features;
  });

  ngOnInit() {
    // Get planId from input or route parameters
    const inputPlanId = this.planIdInput();
    const routePlanId = this.route.snapshot.paramMap.get('planId');
    
    const planId = inputPlanId || routePlanId;
    
    if (planId) {
      this.planId.set(planId);
      this.loadData();
    } else {
      console.error('No planId found in input or route parameters');
      console.log('Input planId:', inputPlanId);
      console.log('Route planId:', routePlanId);
    }
  }

  ngOnDestroy() {
    // Cleanup if needed
  }

  private async loadData() {
    this.loading.set(true);
    try {
      const currentPlanId = this.planId();
      console.log('=== LOADING DATA ===');
      console.log('Loading data for plan:', currentPlanId);
      
      // Clear storage to ensure we get fresh data
      this.mockApi.clearStorage();
      
      // Load plan
      const plan = this.mockApi.getPlan(currentPlanId);
      console.log('Loaded plan:', plan);
      this.currentPlan.set(plan || null);

      // Load available features
      const features = this.mockApi.getFeatures();
      console.log('Loaded features count:', features.length);
      console.log('Loaded features:', features.map(f => ({ id: f.id, name: f.name })));
      this.availableFeatures.set(features);

      // Load plan features
      const planFeatures = this.mockApi.getPlanFeatures(currentPlanId);
      console.log('Loaded plan features count:', planFeatures.length);
      console.log('Loaded plan features:', planFeatures.map(pf => ({ _id: pf.feature._id, name: pf.feature.name })));
      this.planFeatures.set(planFeatures);

      // Load categories
      const categories = this.mockApi.getCategories();
      console.log('Loaded categories count:', categories.length);
      console.log('Loaded categories:', categories.map(c => ({ id: c.id, name: c.name })));
      this.categories.set(categories);

      console.log('=== DATA LOADING COMPLETE ===');
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      this.loading.set(false);
    }
  }

  // Event handlers
  onSearchChange() {
    // Search is handled by computed signal
  }

  onCategoryChange() {
    // Category filter is handled by computed signal
  }

  toggleFeatureSelection(feature: Feature) {
    const current = this.selectedFeatures();
    const newSet = new Set(current);
    
    if (newSet.has(feature.id)) {
      newSet.delete(feature.id);
    } else {
      newSet.add(feature.id);
    }
    
    this.selectedFeatures.set(newSet);
  }

  removeFeature(featureId: string) {
    const current = this.selectedFeatures();
    const newSet = new Set(current);
    newSet.delete(featureId);
    this.selectedFeatures.set(newSet);
  }

  async addSelectedFeatures() {
    if (this.selectedFeatures().size === 0) return;

    this.loading.set(true);
    try {
      const selectedFeatureIds = Array.from(this.selectedFeatures());
      
      const currentPlanId = this.planId();
      for (const featureId of selectedFeatureIds) {
        const feature = this.availableFeatures().find(f => f.id === featureId);
        if (feature) {
          const newPlanFeature: PlanFeature = {
            _id: Date.now().toString() + Math.random(),
            plan: { _id: currentPlanId, name: this.currentPlan()?.name || 'Plan' },
            feature: { _id: feature.id, name: feature.name, roleId: feature.key },
            enabled: feature.enabledByDefault || false,
            configuration: {},
            limits: {},
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          this.mockApi.addPlanFeature(newPlanFeature);
        }
      }

      // Navigate back to plan features
      this.router.navigate(['/plans', currentPlanId, 'features']);
      
    } catch (error) {
      console.error('Error adding features:', error);
    } finally {
      this.loading.set(false);
    }
  }

  goBack() {
    const currentPlanId = this.planId();
    this.router.navigate(['/plans', currentPlanId, 'features']);
  }

  createNewFeature() {
    // Navigate to a create feature page or open a modal
    // For now, let's navigate back to the plan features page where the create feature modal is available
    const currentPlanId = this.planId();
    this.router.navigate(['/plans', currentPlanId, 'features']);
  }

  clearFilters() {
    this.searchTerm.set('');
    this.selectedCategory.set('');
    console.log('Filters cleared');
  }

  // Utility methods
  trackByFeatureId(index: number, feature: Feature): string {
    return feature.id;
  }

  getFeatureName(featureId: string): string {
    const feature = this.availableFeatures().find(f => f.id === featureId);
    return feature?.name || 'Unknown Feature';
  }

  getCategoryName(categoryId?: string): string {
    if (!categoryId) return '';
    const category = this.categories().find(c => c.id === categoryId);
    return category?.name || '';
  }
}
