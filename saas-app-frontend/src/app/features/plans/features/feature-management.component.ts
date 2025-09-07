import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { PlansStoreService } from '../state/plans-store.service';
import { NotificationService } from '../../../@core/services/notification.service';

interface Feature {
  id: string;
  name: string;
  description: string;
  category: string;
  type: 'boolean' | 'number' | 'text' | 'select';
  defaultValue: any;
  options?: string[];
  required: boolean;
  displayOrder: number;
}

interface FeatureCategory {
  id: string;
  name: string;
  description: string;
  displayOrder: number;
  features: Feature[];
}

interface PlanFeature {
  featureId: string;
  value: any;
  enabled: boolean;
  displayOrder: number;
}

@Component({
  selector: 'app-feature-management',
  templateUrl: './feature-management.component.html',
  styleUrls: ['./feature-management.component.css'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class FeatureManagementComponent {
  private plansStore = inject(PlansStoreService);
  private notificationService = inject(NotificationService);
  private fb = inject(FormBuilder);

  readonly plans = this.plansStore.plans;
  readonly featureCategories = signal<FeatureCategory[]>([]);
  readonly planFeatures = signal<Map<string, PlanFeature[]>>(new Map());
  
  readonly showCreateFeatureModal = signal(false);
  readonly showCreateCategoryModal = signal(false);

  readonly featureForm: FormGroup;
  readonly categoryForm: FormGroup;

  constructor() {
    this.featureForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      category: ['', Validators.required],
      type: ['boolean', Validators.required],
      options: [''],
      defaultValue: [''],
      required: [false]
    });

    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required]
    });

    this.loadFeatureData();
  }

  private loadFeatureData(): void {
    // Load mock data for demonstration
    const mockCategories: FeatureCategory[] = [
      {
        id: 'api',
        name: 'API Features',
        description: 'API-related functionality',
        displayOrder: 1,
        features: [
          {
            id: 'api-calls',
            name: 'API Calls',
            description: 'Number of API calls per month',
            category: 'api',
            type: 'number',
            defaultValue: 1000,
            required: true,
            displayOrder: 1
          },
          {
            id: 'api-rate-limit',
            name: 'Rate Limit',
            description: 'API rate limit per minute',
            category: 'api',
            type: 'number',
            defaultValue: 100,
            required: false,
            displayOrder: 2
          }
        ]
      },
      {
        id: 'storage',
        name: 'Storage',
        description: 'Data storage features',
        displayOrder: 2,
        features: [
          {
            id: 'storage-size',
            name: 'Storage Size',
            description: 'Maximum storage size in GB',
            category: 'storage',
            type: 'number',
            defaultValue: 10,
            required: true,
            displayOrder: 1
          },
          {
            id: 'file-upload',
            name: 'File Upload',
            description: 'Enable file upload functionality',
            category: 'storage',
            type: 'boolean',
            defaultValue: true,
            required: false,
            displayOrder: 2
          }
        ]
      }
    ];

    this.featureCategories.set(mockCategories);
  }

  openCreateFeatureModal(): void {
    this.showCreateFeatureModal.set(true);
  }

  closeCreateFeatureModal(): void {
    this.showCreateFeatureModal.set(false);
    this.featureForm.reset();
  }

  openCreateCategoryModal(): void {
    this.showCreateCategoryModal.set(true);
  }

  closeCreateCategoryModal(): void {
    this.showCreateCategoryModal.set(false);
    this.categoryForm.reset();
  }

  onFeatureTypeChange(): void {
    const type = this.featureForm.get('type')?.value;
    if (type !== 'select') {
      this.featureForm.get('options')?.setValue('');
    }
  }

  createFeature(): void {
    if (this.featureForm.valid) {
      const formValue = this.featureForm.value;
      const newFeature: Feature = {
        id: this.generateId(),
        name: formValue.name,
        description: formValue.description,
        category: formValue.category,
        type: formValue.type,
        defaultValue: formValue.defaultValue,
        options: formValue.type === 'select' ? formValue.options.split('\n').filter((o: string) => o.trim()) : undefined,
        required: formValue.required,
        displayOrder: 999
      };

      // Add feature to category
      const categories = this.featureCategories();
      const categoryIndex = categories.findIndex(c => c.id === formValue.category);
      if (categoryIndex !== -1) {
        categories[categoryIndex].features.push(newFeature);
        this.featureCategories.set([...categories]);
      }

      this.notificationService.success('Feature Created', 'New feature has been created successfully.');
      this.closeCreateFeatureModal();
    }
  }

  createCategory(): void {
    if (this.categoryForm.valid) {
      const formValue = this.categoryForm.value;
      const newCategory: FeatureCategory = {
        id: this.generateId(),
        name: formValue.name,
        description: formValue.description,
        displayOrder: this.featureCategories().length + 1,
        features: []
      };

      this.featureCategories.update(categories => [...categories, newCategory]);
      this.notificationService.success('Category Created', 'New category has been created successfully.');
      this.closeCreateCategoryModal();
    }
  }

  editFeature(feature: Feature): void {
    // Implementation for editing feature
    this.notificationService.info('Edit Feature', 'Feature editing functionality will be implemented.');
  }

  deleteFeature(featureId: string): void {
    if (confirm('Are you sure you want to delete this feature?')) {
      const categories = this.featureCategories();
      categories.forEach(category => {
        category.features = category.features.filter(f => f.id !== featureId);
      });
      this.featureCategories.set([...categories]);
      this.notificationService.success('Feature Deleted', 'Feature has been deleted successfully.');
    }
  }

  editCategory(category: FeatureCategory): void {
    // Implementation for editing category
    this.notificationService.info('Edit Category', 'Category editing functionality will be implemented.');
  }

  deleteCategory(categoryId: string): void {
    if (confirm('Are you sure you want to delete this category and all its features?')) {
      const categories = this.featureCategories().filter(c => c.id !== categoryId);
      this.featureCategories.set(categories);
      this.notificationService.success('Category Deleted', 'Category has been deleted successfully.');
    }
  }

  isFeatureEnabled(planId: string, featureId: string): boolean {
    const planFeatures = this.planFeatures().get(planId) || [];
    const planFeature = planFeatures.find(pf => pf.featureId === featureId);
    return planFeature?.enabled || false;
  }

  getFeatureValue(planId: string, featureId: string): any {
    const planFeatures = this.planFeatures().get(planId) || [];
    const planFeature = planFeatures.find(pf => pf.featureId === featureId);
    return planFeature?.value || this.getDefaultFeatureValue(featureId);
  }

  private getDefaultFeatureValue(featureId: string): any {
    const categories = this.featureCategories();
    for (const category of categories) {
      const feature = category.features.find(f => f.id === featureId);
      if (feature) {
        return feature.defaultValue;
      }
    }
    return null;
  }

  toggleFeature(planId: string, featureId: string, enabled: boolean): void {
    const currentPlanFeatures = this.planFeatures().get(planId) || [];
    const existingIndex = currentPlanFeatures.findIndex(pf => pf.featureId === featureId);
    
    if (existingIndex !== -1) {
      currentPlanFeatures[existingIndex].enabled = enabled;
    } else {
      currentPlanFeatures.push({
        featureId,
        value: this.getDefaultFeatureValue(featureId),
        enabled,
        displayOrder: currentPlanFeatures.length
      });
    }

    this.planFeatures.update(map => {
      const newMap = new Map(map);
      newMap.set(planId, currentPlanFeatures);
      return newMap;
    });
  }

  setFeatureValue(planId: string, featureId: string, value: any): void {
    const currentPlanFeatures = this.planFeatures().get(planId) || [];
    const existingIndex = currentPlanFeatures.findIndex(pf => pf.featureId === featureId);
    
    if (existingIndex !== -1) {
      currentPlanFeatures[existingIndex].value = value;
    } else {
      currentPlanFeatures.push({
        featureId,
        value,
        enabled: true,
        displayOrder: currentPlanFeatures.length
      });
    }

    this.planFeatures.update(map => {
      const newMap = new Map(map);
      newMap.set(planId, currentPlanFeatures);
      return newMap;
    });
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  onFeatureToggle(planId: string, featureId: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    this.toggleFeature(planId, featureId, target.checked);
  }

  onFeatureValueChange(planId: string, featureId: string, event: Event, type: string): void {
    const target = event.target as HTMLInputElement | HTMLSelectElement;
    let value: any = target.value;
    
    if (type === 'number') {
      value = +value;
    } else if (type === 'boolean') {
      value = (target as HTMLInputElement).checked;
    }
    
    this.setFeatureValue(planId, featureId, value);
  }
}
