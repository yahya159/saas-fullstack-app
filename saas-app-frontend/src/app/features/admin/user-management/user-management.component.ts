import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-management',
  template: `
    <div class="user-management">
      <h1>User Management</h1>
      <p>User management features coming soon.</p>
    </div>
  `,
  styles: [`
    .user-management {
      padding: 2rem;
      text-align: center;
    }
  `],
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class UserManagementComponent {
  // Component logic here
}
