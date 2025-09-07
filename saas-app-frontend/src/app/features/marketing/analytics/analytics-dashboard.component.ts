import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-analytics-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="analytics-dashboard">
      <div class="header">
        <h1>Analytics Dashboard</h1>
      </div>

      <div class="content">
        <p>Analytics dashboard implementation coming soon...</p>
        <p>Navigate back to <a routerLink="/marketing/dashboard">Marketing Dashboard</a></p>
      </div>
    </div>
  `,
  styles: [`
    .analytics-dashboard {
      padding: 2rem;
    }

    .header {
      margin-bottom: 2rem;
    }

    .content {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
  `]
})
export class AnalyticsDashboardComponent {
}
