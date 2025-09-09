import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit, output, input, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, takeUntil, Subject } from 'rxjs';
import { Feature, FeatureCategory } from '../../../core/models/pricing.models';
import { FeatureManagementService, CreateFeatureRequest, CreateCategoryRequest } from '../../../core/services/feature-management.service';
import { MockApiService } from '../../../core/services/mock-api.service';

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
  private mockApi = inject(MockApiService);
  private destroy$ = new Subject<void>();

  // Inputs
  isOpen = input<boolean>(false);

  // Outputs
  featureCreated = output<Feature>();
  categoryCreated = output<FeatureCategory>();

  // Component state
  readonly isModalOpen = signal(false);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly showCreateCategory = signal(false);

  // Form
  featureForm!: FormGroup;
  categoryForm!: FormGroup;

  // Service observables
  readonly categories$ = this.featureManagementService.categories$;
  readonly features$ = this.featureManagementService.features$;
  readonly isLoadingCategories$ = this.featureManagementService.isLoadingCategories$;

  // Computed properties
  readonly isFormValid = computed(() => {
    return this.featureForm?.valid || false;
  });

  readonly isCategoryFormValid = computed(() => {
    return this.categoryForm?.valid || false;
  });

  readonly availableCategories = computed(() => {
    return this.mockApi.getCategories();
  });

  // Watch for input changes using effect in field initializer
  private inputWatcher = effect(() => {
    const open = this.isOpen();
    if (open) {
      this.open();
    } else {
      this.close();
    }
  }, { allowSignalWrites: true });

  ngOnInit(): void {
    this.initializeForms();
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForms(): void {
    this.featureForm = this.fb.group({
      key: ['', [Validators.required, Validators.pattern(/^[a-z0-9.]+$/)]],
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      categoryId: [''],
      enabledByDefault: [false]
    });

    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['']
    });
  }

  private loadData(): void {
    // Data is already loaded in MockApiService, no need to make HTTP requests
    // this.featureManagementService.loadCategories();
    // this.featureManagementService.loadFeatures();
  }

  open(): void {
    this.isModalOpen.set(true);
    this.error.set(null);
    this.showCreateCategory.set(false);
    this.resetForms();
  }

  close(): void {
    this.isModalOpen.set(false);
    this.error.set(null);
    this.showCreateCategory.set(false);
    this.resetForms();
  }

  private resetForms(): void {
    this.featureForm.reset({
      key: '',
      name: '',
      description: '',
      categoryId: '',
      enabledByDefault: false
    });

    this.categoryForm.reset({
      name: '',
      description: ''
    });
  }

  createFeature(): void {
    if (!this.featureForm.valid) {
      this.markFormGroupTouched(this.featureForm);
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    const formValue = this.featureForm.value;
    const featureData: CreateFeatureRequest = {
      key: formValue.key,
      name: formValue.name,
      description: formValue.description || undefined,
      categoryId: formValue.categoryId || undefined,
      enabledByDefault: formValue.enabledByDefault,
      isCustom: true
    };

    try {
      // Use mock API directly
      const newFeature = this.mockApi.addFeature(featureData);
      this.isLoading.set(false);
      this.featureCreated.emit(newFeature);
      this.close();
    } catch (error) {
      this.isLoading.set(false);
      this.error.set(`Failed to create feature: ${error}`);
    }
  }

  createCategory(): void {
    console.log('createCategory called');
    console.log('Form valid:', this.categoryForm.valid);
    console.log('Form value:', this.categoryForm.value);
    
    if (!this.categoryForm.valid) {
      console.log('Form is invalid, marking as touched');
      this.markFormGroupTouched(this.categoryForm);
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    const formValue = this.categoryForm.value;
    const categoryData: CreateCategoryRequest = {
      name: formValue.name,
      description: formValue.description || undefined,
      isCustom: true
    };

    console.log('Creating category with data:', categoryData);

    try {
      // Use mock API directly
      const newCategory = this.mockApi.addCategory(categoryData);
      console.log('Category created successfully:', newCategory);
      this.isLoading.set(false);
      this.categoryCreated.emit(newCategory);
      this.showCreateCategory.set(false);
      this.categoryForm.reset();
    } catch (error) {
      console.error('Error creating category:', error);
      this.isLoading.set(false);
      this.error.set(`Failed to create category: ${error}`);
    }
  }

  toggleCreateCategory(): void {
    this.showCreateCategory.set(!this.showCreateCategory());
    if (this.showCreateCategory()) {
      this.categoryForm.reset();
    }
  }

  getFieldError(fieldName: string): string | null {
    const field = this.featureForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['minlength']) return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      if (field.errors['pattern']) return `${fieldName} must contain only lowercase letters, numbers, and dots`;
    }
    return null;
  }

  getCategoryFieldError(fieldName: string): string | null {
    const field = this.categoryForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['minlength']) return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
    }
    return null;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.close();
    }
  }
}
