import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-oauth-callback',
  template: `
    <div class="oauth-callback">
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p>Completing authentication...</p>
      </div>
    </div>
  `,
  styles: [`
    .oauth-callback {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: linear-gradient(135deg, var(--color-primary-50) 0%, var(--color-accent-50) 100%);
    }

    .loading-container {
      text-align: center;
      padding: var(--spacing-8);
      background: var(--bg-elevated);
      border-radius: var(--radius-2xl);
      box-shadow: var(--shadow-lg);
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      margin: 0 auto var(--spacing-4);
      border: 4px solid var(--color-primary-200);
      border-top: 4px solid var(--color-primary-600);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    p {
      color: var(--text-secondary);
      font-size: var(--font-size-sm);
      margin: 0;
    }
  `],
  standalone: true
})
export class OAuthCallbackComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit() {
    // Handle OAuth2 callback
    this.authService.handleOAuth2Callback();

    // Check if user is authenticated after handling callback
    setTimeout(() => {
      if (this.authService.isAuthenticated()) {
        this.router.navigate(['/dashboard']);
      } else {
        this.router.navigate(['/login'], {
          queryParams: { error: 'oauth_failed' }
        });
      }
    }, 1000);
  }
}
