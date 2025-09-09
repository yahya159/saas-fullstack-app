import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-widget-menu',
  template: `
    <div class="widget-menu">
      <nav class="widget-nav">
        <a routerLink="./" routerLinkActive="active" class="nav-item">
          <svg class="nav-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
          </svg>
          <span>Manage Widgets</span>
        </a>
        <a routerLink="export" routerLinkActive="active" class="nav-item">
          <svg class="nav-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd"/>
          </svg>
          <span>Export Widgets</span>
        </a>
      </nav>
    </div>
  `,
  styles: [`
    .widget-menu {
      padding: 1rem 0;
      border-bottom: 1px solid var(--border-color, #e1e5e9);
      background: var(--bg-primary, #ffffff);
    }

    .widget-nav {
      display: flex;
      gap: 1rem;
      padding: 0 1.5rem;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      border-radius: var(--radius-md, 6px);
      text-decoration: none;
      color: var(--text-secondary, #666);
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .nav-item:hover {
      color: var(--text-primary, #333);
      background: var(--bg-secondary, #f8f9fa);
    }

    .nav-item.active {
      color: var(--accent-color, #007bff);
      background: var(--accent-color-light, #e6f0ff);
    }

    .nav-icon {
      flex-shrink: 0;
    }

    @media (max-width: 768px) {
      .widget-nav {
        flex-direction: column;
      }
    }
  `],
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class WidgetMenuComponent {}
