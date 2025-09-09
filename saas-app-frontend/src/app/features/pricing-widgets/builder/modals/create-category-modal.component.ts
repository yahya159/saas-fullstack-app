import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, takeUntil, Subject } from 'rxjs';
import { FeatureCategory } from '../../../../core/models/pricing.models';
import { FeatureManagementService, CreateCategoryRequest } from '../../../../core/services/feature-management.service';

@Component({
  selector: 'app-create-category-modal',
  templateUrl: './create-category-modal.component.html',
  styleUrls: ['./create-category-modal.component.css'],
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class CreateCategoryModalComponent implements OnInit {
  private fb = inject(FormBuilder);
  private featureManagementService = inject(FeatureManagementService);
  private destroy$ = new Subject<void>();

  // Component state
  readonly isOpen = signal(false);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  // Form
  categoryForm!: FormGroup;

  // Service observables
  readonly categories$ = this.featureManagementService.categories$;

  // Computed properties
  readonly isFormValid = computed(() => {
    return this.categoryForm?.valid || false;
  });

  readonly availableColors = computed(() => [
    { value: '#3b82f6', name: 'Blue', class: 'bg-blue-500' },
    { value: '#10b981', name: 'Green', class: 'bg-green-500' },
    { value: '#f59e0b', name: 'Yellow', class: 'bg-yellow-500' },
    { value: '#ef4444', name: 'Red', class: 'bg-red-500' },
    { value: '#8b5cf6', name: 'Purple', class: 'bg-purple-500' },
    { value: '#06b6d4', name: 'Cyan', class: 'bg-cyan-500' },
    { value: '#f97316', name: 'Orange', class: 'bg-orange-500' },
    { value: '#84cc16', name: 'Lime', class: 'bg-lime-500' }
  ]);

  readonly availableIcons = computed(() => [
    { value: '⚡', name: 'Lightning' },
    { value: '🔒', name: 'Security' },
    { value: '📊', name: 'Analytics' },
    { value: '🌐', name: 'Web' },
    { value: '🔧', name: 'Tools' },
    { value: '📱', name: 'Mobile' },
    { value: '☁️', name: 'Cloud' },
    { value: '🎨', name: 'Design' },
    { value: '🚀', name: 'Performance' },
    { value: '💡', name: 'Innovation' }
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

  createCategory(): void {
    if (!this.categoryForm.valid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    const formValue = this.categoryForm.value;
    const categoryData: CreateCategoryRequest = {
      name: formValue.name,
      description: formValue.description,
      color: formValue.color,
      icon: formValue.icon,
      order: this.getNextOrder(),
      isCustom: true
    };

    this.featureManagementService.createCategory(categoryData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (newCategory) => {
          this.isLoading.set(false);
          this.close();
          // Emit success event or handle success
          console.log('Category created successfully:', newCategory);
        },
        error: (error) => {
          this.isLoading.set(false);
          this.error.set(error.message || 'Failed to create category');
        }
      });
  }

  // Form methods
  private initializeForm(): void {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      color: ['#3b82f6'],
      icon: ['⚡']
    });
  }

  private resetForm(): void {
    if (this.categoryForm) {
      this.categoryForm.reset({
        color: '#3b82f6',
        icon: '⚡'
      });
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.categoryForm.controls).forEach(key => {
      const control = this.categoryForm.get(key);
      control?.markAsTouched();
    });
  }

  private loadData(): void {
    this.featureManagementService.loadCategories();
  }

  private getNextOrder(): number {
    let maxOrder = 0;
    this.categories$.pipe(takeUntil(this.destroy$)).subscribe(categories => {
      maxOrder = Math.max(...categories.map(c => c.order || 0), 0);
    });
    return maxOrder + 1;
  }

  // Template helpers
  getFieldError(fieldName: string): string | null {
    const field = this.categoryForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['minlength']) return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
    }
    return null;
  }

  selectColor(color: string): void {
    this.categoryForm.get('color')?.setValue(color);
  }

  selectIcon(icon: string): void {
    this.categoryForm.get('icon')?.setValue(icon);
  }

  getSelectedColor(): string {
    return this.categoryForm.get('color')?.value || '#3b82f6';
  }

  getSelectedIcon(): string {
    return this.categoryForm.get('icon')?.value || '⚡';
  }

  // Keyboard shortcuts
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.close();
    } else if (event.key === 'Enter' && event.ctrlKey) {
      event.preventDefault();
      this.createCategory();
    }
  }
}
