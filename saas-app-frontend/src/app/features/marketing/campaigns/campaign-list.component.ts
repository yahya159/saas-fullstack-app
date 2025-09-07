import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MarketingMenuComponent } from '../marketing-menu.component';
import { MarketingService, MarketingCampaign } from '../services/marketing.service';

@Component({
  selector: 'app-campaign-list',
  standalone: true,
  imports: [CommonModule, RouterModule, MarketingMenuComponent],
  template: `
    <app-marketing-menu></app-marketing-menu>
    
    <div class="campaign-list">
      <div class="header">
        <h1>Marketing Campaigns</h1>
        <button class="btn btn-primary" routerLink="/marketing/campaigns/new">
          Create New Campaign
        </button>
      </div>

      <div class="filters">
        <div class="filter-group">
          <label for="status-filter">Status:</label>
          <select id="status-filter" class="filter-select" (change)="filterByStatus($event)">
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Active</option>
            <option value="PAUSED">Paused</option>
            <option value="COMPLETED">Completed</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label for="type-filter">Type:</label>
          <select id="type-filter" class="filter-select" (change)="filterByType($event)">
            <option value="">All Types</option>
            <option value="AB_TEST">A/B Test</option>
            <option value="PRICING_TEST">Pricing Test</option>
            <option value="LANDING_PAGE">Landing Page</option>
            <option value="EMAIL_CAMPAIGN">Email Campaign</option>
            <option value="CONVERSION_OPTIMIZATION">Conversion Optimization</option>
          </select>
        </div>
      </div>

      <div class="content">
        <div class="campaigns-grid" *ngIf="filteredCampaigns().length > 0; else noCampaigns">
          <div class="campaign-card" *ngFor="let campaign of filteredCampaigns()">
            <div class="campaign-header">
              <h3>{{ campaign.name }}</h3>
              <span class="campaign-status" [class]="'status-' + campaign.status.toLowerCase()">
                {{ campaign.status }}
              </span>
            </div>

            <p class="campaign-description">{{ campaign.description || 'No description' }}</p>

            <div class="campaign-type">
              <span class="type-badge" [class]="'type-' + campaign.type.toLowerCase().replace('_', '-')">
                {{ formatCampaignType(campaign.type) }}
              </span>
            </div>

            <div class="campaign-metrics">
              <div class="metric">
                <span class="metric-label">Impressions</span>
                <span class="metric-value">{{ campaign.metrics.impressions || 0 | number }}</span>
              </div>
              <div class="metric">
                <span class="metric-label">Conversions</span>
                <span class="metric-value">{{ campaign.metrics.conversions || 0 | number }}</span>
              </div>
              <div class="metric">
                <span class="metric-label">CVR</span>
                <span class="metric-value">{{ (campaign.metrics.conversionRate || 0) | number:'1.1-2' }}%</span>
              </div>
            </div>

            <div class="campaign-actions">
              <button class="btn btn-sm btn-outline" [routerLink]="['/marketing/campaigns', campaign._id]">
                View Details
              </button>
              <button
                class="btn btn-sm"
                [class.btn-success]="campaign.status === 'DRAFT' || campaign.status === 'PAUSED'"
                [class.btn-warning]="campaign.status === 'ACTIVE'"
                (click)="toggleCampaign(campaign)">
                {{ campaign.status === 'ACTIVE' ? 'Pause' : 'Start' }}
              </button>
            </div>
          </div>
        </div>

        <ng-template #noCampaigns>
          <div class="empty-state">
            <div class="empty-icon">📊</div>
            <h3>No Campaigns Found</h3>
            <p>Create your first marketing campaign to start testing and optimizing your SaaS conversions.</p>
            <button class="btn btn-primary" routerLink="/marketing/campaigns/new">
              Create Your First Campaign
            </button>
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .campaign-list {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .header h1 {
      font-size: 2rem;
      font-weight: 700;
      color: var(--text-primary, #1a202c);
      margin: 0;
    }

    .filters {
      display: flex;
      gap: 1.5rem;
      margin-bottom: 2rem;
      padding: 1.5rem;
      background: var(--bg-secondary, #f7fafc);
      border-radius: var(--radius-lg, 12px);
      border: 1px solid var(--border-color, #e2e8f0);
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .filter-group label {
      font-weight: 500;
      color: var(--text-secondary, #718096);
      font-size: 0.875rem;
    }

    .filter-select {
      padding: 0.5rem;
      border-radius: var(--radius-md, 6px);
      border: 1px solid var(--border-color, #e2e8f0);
      background: var(--bg-primary, #ffffff);
      color: var(--text-primary, #1a202c);
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border-radius: var(--radius-md, 6px);
      font-weight: 600;
      text-decoration: none;
      border: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s ease;
    }

    .btn-primary {
      background: var(--accent-primary, #3182ce);
      color: white;
    }

    .btn-primary:hover {
      background: var(--accent-primary-hover, #2c5282);
    }

    .btn-outline {
      background: transparent;
      color: var(--accent-primary, #3182ce);
      border: 1px solid var(--accent-primary, #3182ce);
    }

    .btn-outline:hover {
      background: var(--accent-primary, #3182ce);
      color: white;
    }

    .btn-sm {
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
    }

    .btn-success {
      background: var(--success, #38a169);
      color: white;
    }

    .btn-warning {
      background: var(--warning, #ed8936);
      color: white;
    }

    .campaigns-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1.5rem;
    }

    .campaign-card {
      background: var(--bg-primary, #ffffff);
      border-radius: var(--radius-lg, 12px);
      padding: 1.5rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      border: 1px solid var(--border-color, #e2e8f0);
      transition: all 0.2s ease;
    }

    .campaign-card:hover {
      box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }

    .campaign-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .campaign-header h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-primary, #1a202c);
      margin: 0;
    }

    .campaign-status {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-active {
      background: var(--success-soft, #c6f6d5);
      color: var(--success, #2f855a);
    }

    .status-paused {
      background: var(--error-soft, #fed7d7);
      color: var(--error, #c53030);
    }

    .status-draft {
      background: var(--bg-tertiary, #e2e8f0);
      color: var(--text-secondary, #718096);
    }

    .status-completed {
      background: var(--accent-primary-soft, #bee3f8);
      color: var(--accent-primary, #2b6cb0);
    }

    .status-archived {
      background: var(--text-muted, #cbd5e0);
      color: var(--text-secondary, #4a5568);
    }

    .campaign-description {
      color: var(--text-secondary, #718096);
      margin-bottom: 1rem;
      font-size: 0.875rem;
    }

    .type-badge {
      padding: 0.25rem 0.5rem;
      border-radius: var(--radius-md, 6px);
      font-size: 0.75rem;
      font-weight: 500;
      background: var(--bg-secondary, #edf2f7);
      color: var(--text-secondary, #4a5568);
    }

    .campaign-metrics {
      display: flex;
      gap: 1rem;
      margin: 1rem 0;
      padding: 1rem 0;
      border-top: 1px solid var(--border-color, #e2e8f0);
      border-bottom: 1px solid var(--border-color, #e2e8f0);
    }

    .metric {
      text-align: center;
      flex: 1;
    }

    .metric-label {
      display: block;
      font-size: 0.75rem;
      color: var(--text-secondary, #718096);
      margin-bottom: 0.25rem;
    }

    .metric-value {
      display: block;
      font-weight: 600;
      color: var(--text-primary, #1a202c);
    }

    .campaign-actions {
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
    }

    .empty-state {
      text-align: center;
      padding: 3rem 2rem;
      background: var(--bg-primary, #ffffff);
      border-radius: var(--radius-lg, 12px);
      border: 1px solid var(--border-color, #e2e8f0);
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .empty-state h3 {
      font-size: 1.5rem;
      color: var(--text-primary, #1a202c);
      margin-bottom: 0.5rem;
    }

    .empty-state p {
      color: var(--text-secondary, #718096);
      margin-bottom: 2rem;
    }

    @media (max-width: 768px) {
      .campaign-list {
        padding: 1rem;
      }
      
      .header {
        flex-direction: column;
        gap: 1rem;
        align-items: flex-start;
      }
      
      .filters {
        flex-direction: column;
        gap: 1rem;
      }
      
      .campaigns-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class CampaignListComponent implements OnInit {
  private readonly marketingService = inject(MarketingService);
  
  allCampaigns = signal<MarketingCampaign[]>([]);
  filteredCampaigns = signal<MarketingCampaign[]>([]);
  currentStatusFilter = signal<string>('');
  currentTypeFilter = signal<string>('');

  ngOnInit() {
    this.loadCampaigns();
  }

  private loadCampaigns() {
    // Mock application ID - in real app, get from auth service
    const applicationId = '507f1f77bcf86cd799439011';

    this.marketingService.getCampaignsByApplication(applicationId).subscribe({
      next: (response) => {
        if (response.success) {
          this.allCampaigns.set(response.data);
          this.filteredCampaigns.set(response.data);
        }
      },
      error: (error) => {
        console.error('Failed to load campaigns:', error);
      }
    });
  }

  filterByStatus(event: any) {
    const status = event.target.value;
    this.currentStatusFilter.set(status);
    this.applyFilters();
  }

  filterByType(event: any) {
    const type = event.target.value;
    this.currentTypeFilter.set(type);
    this.applyFilters();
  }

  private applyFilters() {
    let filtered = this.allCampaigns();
    
    if (this.currentStatusFilter()) {
      filtered = filtered.filter(campaign => campaign.status === this.currentStatusFilter());
    }
    
    if (this.currentTypeFilter()) {
      filtered = filtered.filter(campaign => campaign.type === this.currentTypeFilter());
    }
    
    this.filteredCampaigns.set(filtered);
  }

  formatCampaignType(type: string): string {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  toggleCampaign(campaign: MarketingCampaign) {
    if (campaign.status === 'ACTIVE') {
      this.marketingService.pauseCampaign(campaign._id).subscribe({
        next: (response) => {
          if (response.success) {
            // Update the campaign in our list
            const updatedCampaigns = this.allCampaigns().map(c => 
              c._id === campaign._id ? response.data : c
            );
            this.allCampaigns.set(updatedCampaigns);
            this.applyFilters();
          }
        },
        error: (error) => {
          console.error('Failed to pause campaign:', error);
        }
      });
    } else {
      this.marketingService.startCampaign(campaign._id).subscribe({
        next: (response) => {
          if (response.success) {
            // Update the campaign in our list
            const updatedCampaigns = this.allCampaigns().map(c => 
              c._id === campaign._id ? response.data : c
            );
            this.allCampaigns.set(updatedCampaigns);
            this.applyFilters();
          }
        },
        error: (error) => {
          console.error('Failed to start campaign:', error);
        }
      });
    }
  }
}