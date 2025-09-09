import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, takeUntil, Subject } from 'rxjs';
import { Feature, FeatureCategory, TierVisibility } from '../../../../core/models/pricing.models';
import { FeatureManagementService, CreateFeatureRequest } from '../../../../core/services/feature-management.service';

@Component({
  selector: 'app-create-feature-modal',
  templateUrl: './create-feature-modal.component.html',
  styleUrls: ['./create-feature-modal.component.css'],
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class CreateFeatureModalComponent implements OnInit {
  private fb = inject(FormBuilder);
  private featureManagementService = inject(FeatureManagementService);
  private destroy$ = new Subject<void>();

  // Component state
  readonly isOpen = signal(false);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  // Form
  featureForm!: FormGroup;

  // Service observables
  readonly categories$ = this.featureManagementService.categories$;
  readonly features$ = this.featureManagementService.features$;
  readonly isLoadingCategories$ = this.featureManagementService.isLoadingCategories$;

  // Computed properties
  readonly isFormValid = computed(() => {
    return this.featureForm?.valid || false;
  });

  readonly availableTiers = computed(() => [
    { key: 'basic', label: 'Basic', description: 'Basic tier features' },
    { key: 'pro', label: 'Pro', description: 'Professional tier features' },
    { key: 'enterprise', label: 'Enterprise', description: 'Enterprise tier features' },
    { key: 'custom', label: 'Custom', description: 'Custom tier features' }
  ]);

  ngOnInit(): void {
    this.initializeForm();
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Actions
  open(): void {
    this.isOpen.set(true);
    this.resetForm();
    this.loadData();
  }

  close(): void {
    this.isOpen.set(false);
    this.resetForm();
    this.error.set(null);
  }

  createFeature(): void {
    if (!this.featureForm.valid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    const formValue = this.featureForm.value;
    const featureData: CreateFeatureRequest = {
      key: formValue.key,
      name: formValue.name,
      description: formValue.description,
      enabledByDefault: formValue.enabledByDefault || false,
      categoryId: formValue.categoryId || undefined,
      tierVisibility: this.getTierVisibilityFromForm(formValue),
      isCustom: true
    };

    this.featureManagementService.createFeature(featureData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (newFeature) => {
          this.isLoading.set(false);
          this.close();
          // Emit success event or handle success
          console.log('Feature created successfully:', newFeature);
        },
        error: (error) => {
          this.isLoading.set(false);
          this.error.set(error.message || 'Failed to create feature');
        }
      });
  }

  // Form methods
  private initializeForm(): void {
    this.featureForm = this.fb.group({
      key: ['', [Validators.required, Validators.pattern(/^[a-z0-9.]+$/)]],
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      enabledByDefault: [false],
      categoryId: [''],
      // Tier visibility checkboxes
      tierBasic: [true],
      tierPro: [true],
      tierEnterprise: [true],
      tierCustom: [true]
    });

    // Auto-generate key from name
    this.featureForm.get('name')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(name => {
        if (name && !this.featureForm.get('key')?.touched) {
          const generatedKey = this.featureManagementService.generateFeatureKey(name);
          this.featureForm.get('key')?.setValue(generatedKey);
        }
      });

    // Validate key uniqueness
    this.featureForm.get('key')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(key => {
        if (key) {
          this.features$.pipe(takeUntil(this.destroy$)).subscribe(features => {
            const isUnique = this.featureManagementService.validateFeatureKey(key, features);
            if (!isUnique) {
              this.featureForm.get('key')?.setErrors({ notUnique: true });
            }
          });
        }
      });
  }

  private resetForm(): void {
    if (this.featureForm) {
      this.featureForm.reset({
        enabledByDefault: false,
        tierBasic: true,
        tierPro: true,
        tierEnterprise: true,
        tierCustom: true
      });
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.featureForm.controls).forEach(key => {
      const control = this.featureForm.get(key);
      control?.markAsTouched();
    });
  }

  private loadData(): void {
    this.featureManagementService.loadCategories();
    this.featureManagementService.loadFeatures();
  }

  private getTierVisibilityFromForm(formValue: any): TierVisibility {
    return {
      basic: formValue.tierBasic,
      pro: formValue.tierPro,
      enterprise: formValue.tierEnterprise,
      custom: formValue.tierCustom
    };
  }

  // Template helpers
  getFieldError(fieldName: string): string | null {
    const field = this.featureForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['minlength']) return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      if (field.errors['pattern']) return `${fieldName} must contain only lowercase letters, numbers, and dots`;
      if (field.errors['notUnique']) return `${fieldName} already exists`;
    }
    return null;
  }

  getCategoryName(categoryId: string): string {
    let categoryName = 'Select Category';
    this.categories$.pipe(takeUntil(this.destroy$)).subscribe(categories => {
      const category = categories.find(c => c.id === categoryId);
      if (category) {
        categoryName = category.name;
      }
    });
    return categoryName;
  }

  // Keyboard shortcuts
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.close();
    } else if (event.key === 'Enter' && event.ctrlKey) {
      event.preventDefault();
      this.createFeature();
    }
  }
}
