import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NotificationService } from '../../@core/services/notification.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class DashboardComponent {
  private notificationService = inject(NotificationService);
  
  // Mock user data for demo purposes
  readonly currentUser = signal({
    username: 'demo-user',
    email: 'demo@example.com',
    firstName: 'Demo',
    lastName: 'User',
    plan: 'Pro Plan'
  });
  readonly isAuthenticated = signal(true);
  readonly isEmailVerified = signal(true);

  logout(): void {
    this.notificationService.info('Demo Mode', 'Authentication is disabled for demo purposes.');
  }

  resendVerification(): void {
    this.notificationService.info(
      'Demo Mode',
      'Email verification is disabled for demo purposes.'
    );
  }
}
