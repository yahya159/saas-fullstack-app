import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-marketing-menu',
  template: `
    <nav class="marketing-menu" role="navigation" aria-label="Marketing navigation">
      <div class="menu-container">
        <ul class="menu-items" role="menubar">
          <li class="menu-item" role="none">
            <a routerLink="/marketing/dashboard"
               routerLinkActive="active"
               class="menu-link"
               role="menuitem"
               [attr.aria-current]="isCurrentRoute('/marketing/dashboard') ? 'page' : null">
              <svg class="menu-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
              </svg>
              <span>Dashboard</span>
            </a>
          </li>

          <li class="menu-item" role="none">
            <a routerLink="/marketing/campaigns"
               routerLinkActive="active"
               class="menu-link"
               role="menuitem"
               [attr.aria-current]="isCurrentRoute('/marketing/campaigns') ? 'page' : null">
              <svg class="menu-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
              </svg>
              <span>Campaigns</span>
            </a>
          </li>

          <li class="menu-item" role="none">
            <a routerLink="/marketing/analytics"
               routerLinkActive="active"
               class="menu-link"
               role="menuitem"
               [attr.aria-current]="isCurrentRoute('/marketing/analytics') ? 'page' : null">
              <svg class="menu-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
              </svg>
              <span>Analytics</span>
            </a>
          </li>
        </ul>
      </div>
    </nav>
  `,
  styles: [`
    .marketing-menu {
      background: var(--bg-primary, #ffffff);
      border-bottom: 1px solid var(--border-color, #e2e8f0);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .menu-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 1.5rem;
    }

    .menu-items {
      display: flex;
      list-style: none;
      margin: 0;
      padding: 0;
      gap: 0.5rem;
    }

    .menu-item {
      margin: 0;
    }

    .menu-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem 1.25rem;
      text-decoration: none;
      color: var(--text-secondary, #718096);
      font-weight: 500;
      border-radius: var(--radius-md, 6px);
      transition: all 0.2s ease;
      position: relative;
    }

    .menu-link:hover {
      color: var(--text-primary, #1a202c);
      background: var(--bg-secondary, #f7fafc);
    }

    .menu-link.active {
      color: var(--accent-primary, #3182ce);
      background: var(--accent-primary-soft, #ebf8ff);
    }

    .menu-link.active::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: var(--accent-primary, #3182ce);
      border-radius: 3px 3px 0 0;
    }

    .menu-icon {
      flex-shrink: 0;
    }

    @media (max-width: 768px) {
      .menu-container {
        padding: 0 1rem;
      }

      .menu-items {
        gap: 0.25rem;
      }

      .menu-link {
        padding: 0.75rem 1rem;
        font-size: 0.875rem;
      }

      .menu-link span {
        display: none;
      }

      .menu-link svg {
        margin-right: 0;
      }
    }
  `],
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class MarketingMenuComponent {
  constructor(private router: Router) {}

  isCurrentRoute(route: string): boolean {
    return this.router.url === route;
  }
}
