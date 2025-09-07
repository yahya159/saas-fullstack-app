import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  template: `
    <div class="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <p>Welcome to the admin panel. This feature is under development.</p>
    </div>
  `,
  styles: [`
    .admin-dashboard {
      padding: 2rem;
      text-align: center;
    }
  `],
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class AdminDashboardComponent {
  // Component logic here
}
