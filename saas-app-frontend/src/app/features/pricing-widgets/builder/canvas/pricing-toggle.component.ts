import { Component, ChangeDetectionStrategy, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pricing-toggle',
  templateUrl: './pricing-toggle.component.html',
  styleUrls: ['./pricing-toggle.component.css'],
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class PricingToggleComponent {
  // Inputs
  isYearly = input<boolean>(false);
  monthlyLabel = input<string>('Monthly');
  yearlyLabel = input<string>('Yearly');
  showSavings = input<boolean>(true);
  savingsText = input<string>('Save up to 20%');

  // Outputs
  toggleChange = output<boolean>();

  // Component state
  readonly isAnimating = signal(false);

  // Computed properties
  readonly toggleClasses = computed(() => ({
    'pricing-toggle': true,
    'pricing-toggle--yearly': this.isYearly(),
    'pricing-toggle--animating': this.isAnimating()
  }));

  readonly sliderClasses = computed(() => ({
    'toggle-slider': true,
    'toggle-slider--yearly': this.isYearly()
  }));

  readonly monthlyClasses = computed(() => ({
    'toggle-option': true,
    'toggle-option--active': !this.isYearly(),
    'toggle-option--inactive': this.isYearly()
  }));

  readonly yearlyClasses = computed(() => ({
    'toggle-option': true,
    'toggle-option--active': this.isYearly(),
    'toggle-option--inactive': !this.isYearly()
  }));

  // Event handlers
  onToggleClick(): void {
    if (this.isAnimating()) return;
    
    this.isAnimating.set(true);
    this.toggleChange.emit(!this.isYearly());
    
    // Reset animation state after transition
    setTimeout(() => {
      this.isAnimating.set(false);
    }, 300);
  }

  onMonthlyClick(): void {
    if (!this.isYearly()) return;
    this.onToggleClick();
  }

  onYearlyClick(): void {
    if (this.isYearly()) return;
    this.onToggleClick();
  }

  // Keyboard support
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onToggleClick();
    } else if (event.key === 'ArrowLeft' && this.isYearly()) {
      event.preventDefault();
      this.onToggleClick();
    } else if (event.key === 'ArrowRight' && !this.isYearly()) {
      event.preventDefault();
      this.onToggleClick();
    }
  }
}
