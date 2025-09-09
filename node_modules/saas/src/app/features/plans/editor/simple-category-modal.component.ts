import { Component, ChangeDetectionStrategy, inject, signal, output, input, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MockApiService } from '../../../core/services/mock-api.service';
import { FeatureCategory } from '../../../core/models/pricing.models';

@Component({
  selector: 'app-simple-category-modal',
  templateUrl: './simple-category-modal.component.html',
  styleUrls: ['./simple-category-modal.component.css'],
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class SimpleCategoryModalComponent {
  private fb = inject(FormBuilder);
  private mockApi = inject(MockApiService);

  // Inputs
  isOpen = input<boolean>(false);

  // Outputs
  categoryCreated = output<FeatureCategory>();
  modalClosed = output<void>();

  // Component state
  readonly isModalOpen = signal(false);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  // Form
  categoryForm: FormGroup;

  constructor() {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['']
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
    this.categoryForm.reset();
  }

  close(): void {
    this.isModalOpen.set(false);
    this.error.set(null);
    this.categoryForm.reset();
    this.modalClosed.emit();
  }

  createCategory(): void {
    console.log('Simple category creation called');
    
    if (!this.categoryForm.valid) {
      console.log('Form is invalid');
      this.markFormGroupTouched();
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    const formValue = this.categoryForm.value;
    console.log('Form value:', formValue);

    try {
      const newCategory = this.mockApi.addCategory({
        name: formValue.name,
        description: formValue.description || undefined,
        isCustom: true
      });

      console.log('Category created successfully:', newCategory);
      this.isLoading.set(false);
      this.categoryCreated.emit(newCategory);
      this.close();
    } catch (error) {
      console.error('Error creating category:', error);
      this.isLoading.set(false);
      this.error.set(`Failed to create category: ${error}`);
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.categoryForm.controls).forEach(key => {
      const control = this.categoryForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string | null {
    const field = this.categoryForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['minlength']) return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
    }
    return null;
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.close();
    }
  }
}
