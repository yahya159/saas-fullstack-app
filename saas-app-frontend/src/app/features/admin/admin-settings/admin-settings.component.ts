import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-settings',
  template: `
    <div class="admin-settings">
      <h1>Admin Settings</h1>
      <p>Admin settings panel coming soon.</p>
    </div>
  `,
  styles: [`
    .admin-settings {
      padding: 2rem;
      text-align: center;
    }
  `],
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class AdminSettingsComponent {
  // Component logic here
}
