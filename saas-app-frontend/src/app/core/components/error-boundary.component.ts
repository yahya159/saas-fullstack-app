import { Component, ChangeDetectionStrategy, input, output, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrorHandler } from '@angular/core';

@Component({
  selector: 'app-error-boundary',
  templateUrl: './error-boundary.component.html',
  styleUrls: ['./error-boundary.component.css'],
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class ErrorBoundaryComponent {
  private errorHandler = inject(ErrorHandler);
  
  // Inputs
  error = input<Error | null>(null);
  fallbackMessage = input<string>('Something went wrong. Please try again.');
  showRetry = input<boolean>(true);
  showDetails = input<boolean>(false);

  // Outputs
  retry = output<void>();

  // Component state
  readonly isRetrying = signal(false);
  readonly showErrorDetails = signal(false);

  // Computed properties
  readonly errorClasses = computed(() => ({
    'error-boundary': true,
    'error-boundary--retrying': this.isRetrying()
  }));

  readonly errorMessage = computed(() => {
    const error = this.error();
    if (!error) return this.fallbackMessage();
    
    // User-friendly error messages
    if (error.message.includes('Network')) {
      return 'Network error. Please check your connection and try again.';
    }
    if (error.message.includes('404')) {
      return 'The requested resource was not found.';
    }
    if (error.message.includes('500')) {
      return 'Server error. Please try again later.';
    }
    if (error.message.includes('Unauthorized')) {
      return 'You are not authorized to perform this action.';
    }
    
    return error.message || this.fallbackMessage();
  });

  readonly errorDetails = computed(() => {
    const error = this.error();
    if (!error) return null;
    
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    };
  });

  // Event handlers
  onRetry(): void {
    this.isRetrying.set(true);
    this.retry.emit();
    
    // Reset retrying state after a delay
    setTimeout(() => {
      this.isRetrying.set(false);
    }, 1000);
  }

  onToggleDetails(): void {
    this.showErrorDetails.update(show => !show);
  }

  onReportError(): void {
    const error = this.error();
    if (error) {
      // In a real app, you would send this to an error reporting service
      console.error('Error reported:', this.errorDetails());
      
      // For now, just log to console
      this.errorHandler.handleError(error);
    }
  }

  onCopyError(): void {
    const details = this.errorDetails();
    if (details) {
      navigator.clipboard.writeText(JSON.stringify(details, null, 2))
        .then(() => {
          // Could show a toast notification here
          console.log('Error details copied to clipboard');
        })
        .catch(err => {
          console.error('Failed to copy error details:', err);
        });
    }
  }
}
