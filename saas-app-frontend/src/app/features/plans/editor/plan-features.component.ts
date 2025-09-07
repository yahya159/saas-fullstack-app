import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-plan-features',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="plan-features">
      <h3>Plan Features</h3>
      <p>Plan ID: {{ planId }}</p>
      <p>Feature management implementation coming soon...</p>
    </div>
  `,
  styles: [`
    .plan-features {
      padding: 1rem;
      background: #f7fafc;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }
  `]
})
export class PlanFeaturesComponent {
  @Input() planId: string = '';
}
