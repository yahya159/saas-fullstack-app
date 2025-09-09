import { Component, ChangeDetectionStrategy, inject, signal, output, input, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MockApiService } from '../../../core/services/mock-api.service';
import { Feature, FeatureCategory } from '../../../core/models/pricing.models';

@Component({
  selector: 'app-simple-feature-modal',
  templateUrl: './simple-feature-modal.component.html',
  styleUrls: ['./simple-feature-modal.component.css'],
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class SimpleFeatureModalComponent {
  private fb = inject(FormBuilder);
  private mockApi = inject(MockApiService);

  // Inputs
  isOpen = input<boolean>(false);

  // Outputs
  featureCreated = output<Feature>();
  modalClosed = output<void>();

  // Component state
  readonly isModalOpen = signal(false);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  // Form
  featureForm: FormGroup;

  constructor() {
    this.featureForm = this.fb.group({
      key: ['', [Validators.required, Validators.pattern(/^[a-z0-9.]+$/)]],
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      categoryId: [''],
      enabledByDefault: [false]
    });

    // Watch for input changes
    effect(() => {
      const open = this.isOpen();
      if (open && !this.isModalOpen()) {
        this.open();
      } else if (!open && this.isModalOpen()) {
        this.close();
      }
    }, { allowSignalWrites: true });
  }

  open(): void {
    this.isModalOpen.set(true);
    this.error.set(null);
    this.featureForm.reset({
      key: '',
      name: '',
      description: '',
      categoryId: '',
      enabledByDefault: false
    });
  }

  close(): void {
    this.isModalOpen.set(false);
    this.error.set(null);
    this.featureForm.reset();
    this.modalClosed.emit();
  }

  createFeature(): void {
    console.log('Simple feature creation called');
    
    if (!this.featureForm.valid) {
      console.log('Form is invalid');
      this.markFormGroupTouched();
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    const formValue = this.featureForm.value;
    console.log('Form value:', formValue);

    try {
      const newFeature = this.mockApi.addFeature({
        key: formValue.key,
        name: formValue.name,
        description: formValue.description || undefined,
        categoryId: formValue.categoryId || undefined,
        enabledByDefault: formValue.enabledByDefault,
        isCustom: true
      });

      console.log('Feature created successfully:', newFeature);
      this.isLoading.set(false);
      this.featureCreated.emit(newFeature);
      this.close();
    } catch (error) {
      console.error('Error creating feature:', error);
      this.isLoading.set(false);
      this.error.set(`Failed to create feature: ${error}`);
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.featureForm.controls).forEach(key => {
      const control = this.featureForm.get(key);
      control?.markAsTouched();
    });
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

  getAvailableCategories(): FeatureCategory[] {
    return this.mockApi.getCategories();
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.close();
    }
  }
}
