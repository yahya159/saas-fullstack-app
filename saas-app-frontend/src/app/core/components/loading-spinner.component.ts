import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  templateUrl: './loading-spinner.component.html',
  styleUrls: ['./loading-spinner.component.css'],
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class LoadingSpinnerComponent {
  // Inputs
  size = input<'sm' | 'md' | 'lg'>('md');
  color = input<'primary' | 'secondary' | 'accent'>('primary');
  text = input<string>('');
  overlay = input<boolean>(false);

  // Computed properties
  readonly spinnerClasses = computed(() => ({
    'loading-spinner': true,
    [`loading-spinner--${this.size()}`]: true,
    [`loading-spinner--${this.color()}`]: true,
    'loading-spinner--overlay': this.overlay()
  }));

  readonly textClasses = computed(() => ({
    'loading-text': true,
    [`loading-text--${this.size()}`]: true
  }));
}
