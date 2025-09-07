import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-campaign-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="campaign-list">
      <div class="header">
        <h1>Marketing Campaigns</h1>
        <button class="btn btn-primary" routerLink="/marketing/campaigns/new">
          Create New Campaign
        </button>
      </div>

      <div class="content">
        <p>Campaign list implementation coming soon...</p>
        <p>Navigate back to <a routerLink="/marketing/dashboard">Marketing Dashboard</a></p>
      </div>
    </div>
  `,
  styles: [`
    .campaign-list {
      padding: 2rem;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      background: #3182ce;
      color: white;
      border: none;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
    }

    .content {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
  `]
})
export class CampaignListComponent {
}
