import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MarketingService, MarketingCampaign } from '../services/marketing.service';
import { MarketingMenuComponent } from '../marketing-menu.component';

@Component({
  selector: 'app-marketing-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MarketingMenuComponent],
  template: `
    <app-marketing-menu></app-marketing-menu>

    <div class="marketing-dashboard">
      <div class="dashboard-header">
        <h1>Marketing & Analytics Dashboard</h1>
        <p class="subtitle">Advanced marketing tools for A/B testing and market analysis</p>

        <div class="action-buttons">
          <button class="btn btn-primary" routerLink="/marketing/campaigns/new">
            <i class="icon-plus"></i>
            Create Campaign
          </button>
          <button class="btn btn-outline" routerLink="/marketing/analytics">
            <i class="icon-chart"></i>
            View Analytics
          </button>
        </div>
      </div>

      <div class="dashboard-stats">
        <div class="stat-card">
          <div class="stat-header">
            <h3>Active Campaigns</h3>
            <i class="icon-campaign"></i>
          </div>
          <div class="stat-value">{{ dashboardStats().activeCampaigns }}</div>
          <div class="stat-change positive">
            <i class="icon-arrow-up"></i>
            +12% from last month
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-header">
            <h3>Total Conversions</h3>
            <i class="icon-target"></i>
          </div>
          <div class="stat-value">{{ dashboardStats().totalConversions }}</div>
          <div class="stat-change positive">
            <i class="icon-arrow-up"></i>
            +28% from last month
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-header">
            <h3>Average CVR</h3>
            <i class="icon-percentage"></i>
          </div>
          <div class="stat-value">{{ dashboardStats().avgConversionRate }}%</div>
          <div class="stat-change positive">
            <i class="icon-arrow-up"></i>
            +5.2% from last month
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-header">
            <h3>Total Revenue</h3>
            <i class="icon-dollar"></i>
          </div>
          <div class="stat-value">{{ dashboardStats().totalRevenue | currency }}</div>
          <div class="stat-change positive">
            <i class="icon-arrow-up"></i>
            +15% from last month
          </div>
        </div>
      </div>

      <div class="dashboard-content">
        <div class="recent-campaigns">
          <div class="section-header">
            <h2>Recent Campaigns</h2>
            <a routerLink="/marketing/campaigns" class="view-all">View All</a>
          </div>

          <div class="campaigns-grid" *ngIf="recentCampaigns().length > 0; else noCampaigns">
            <div class="campaign-card" *ngFor="let campaign of recentCampaigns()">
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
              <h3>No Campaigns Yet</h3>
              <p>Create your first marketing campaign to start testing and optimizing your SaaS conversions.</p>
              <button class="btn btn-primary" routerLink="/marketing/campaigns/new">
                Create Your First Campaign
              </button>
            </div>
          </ng-template>
        </div>

        <div class="marketing-tools">
          <div class="section-header">
            <h2>Marketing Tools</h2>
          </div>

          <div class="tools-grid">
            <div class="tool-card">
              <div class="tool-icon">🧪</div>
              <h3>A/B Testing</h3>
              <p>Test different pricing strategies, landing pages, and widget variants to optimize conversions.</p>
              <button class="btn btn-outline" routerLink="/marketing/campaigns/new"
                      [queryParams]="{type: 'AB_TEST'}">
                Start A/B Test
              </button>
            </div>

            <div class="tool-card">
              <div class="tool-icon">💰</div>
              <h3>Pricing Tests</h3>
              <p>Experiment with different pricing models and find the optimal price points for your SaaS.</p>
              <button class="btn btn-outline" routerLink="/marketing/campaigns/new"
                      [queryParams]="{type: 'PRICING_TEST'}">
                Test Pricing
              </button>
            </div>

            <div class="tool-card">
              <div class="tool-icon">🎯</div>
              <h3>Landing Page Optimization</h3>
              <p>Create and test different landing page variations to maximize conversion rates.</p>
              <button class="btn btn-outline" routerLink="/marketing/campaigns/new"
                      [queryParams]="{type: 'LANDING_PAGE'}">
                Optimize Pages
              </button>
            </div>

            <div class="tool-card">
              <div class="tool-icon">📧</div>
              <h3>Email Campaigns</h3>
              <p>Design and track email marketing campaigns with detailed analytics and conversion tracking.</p>
              <button class="btn btn-outline" routerLink="/marketing/campaigns/new"
                      [queryParams]="{type: 'EMAIL_CAMPAIGN'}">
                Create Email Campaign
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .marketing-dashboard {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .dashboard-header {
      margin-bottom: 3rem;
      text-align: center;
    }

    .dashboard-header h1 {
      font-size: 2.5rem;
      font-weight: 700;
      color: #1a202c;
      margin-bottom: 0.5rem;
    }

    .subtitle {
      font-size: 1.125rem;
      color: #718096;
      margin-bottom: 2rem;
    }

    .action-buttons {
      display: flex;
      gap: 1rem;
      justify-content: center;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      text-decoration: none;
      border: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s;
    }

    .btn-primary {
      background: #3182ce;
      color: white;
    }

    .btn-primary:hover {
      background: #2c5282;
    }

    .btn-outline {
      background: transparent;
      color: #3182ce;
      border: 1px solid #3182ce;
    }

    .btn-outline:hover {
      background: #3182ce;
      color: white;
    }

    .btn-sm {
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
    }

    .btn-success {
      background: #38a169;
      color: white;
    }

    .btn-warning {
      background: #ed8936;
      color: white;
    }

    .dashboard-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
    }

    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
    }

    .stat-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .stat-header h3 {
      font-size: 0.875rem;
      font-weight: 600;
      color: #718096;
      margin: 0;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      color: #1a202c;
      margin-bottom: 0.5rem;
    }

    .stat-change {
      font-size: 0.875rem;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .stat-change.positive {
      color: #38a169;
    }

    .dashboard-content {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 3rem;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .section-header h2 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #1a202c;
      margin: 0;
    }

    .view-all {
      color: #3182ce;
      text-decoration: none;
      font-weight: 500;
    }

    .campaigns-grid {
      display: grid;
      gap: 1.5rem;
    }

    .campaign-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
    }

    .campaign-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .campaign-header h3 {
      font-size: 1.125rem;
      font-weight: 600;
      color: #1a202c;
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
      background: #c6f6d5;
      color: #2f855a;
    }

    .status-paused {
      background: #fed7d7;
      color: #c53030;
    }

    .status-draft {
      background: #e2e8f0;
      color: #718096;
    }

    .status-completed {
      background: #bee3f8;
      color: #2b6cb0;
    }

    .campaign-description {
      color: #718096;
      margin-bottom: 1rem;
      font-size: 0.875rem;
    }

    .type-badge {
      padding: 0.25rem 0.5rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 500;
      background: #edf2f7;
      color: #4a5568;
    }

    .campaign-metrics {
      display: flex;
      gap: 1rem;
      margin: 1rem 0;
    }

    .metric {
      text-align: center;
    }

    .metric-label {
      display: block;
      font-size: 0.75rem;
      color: #718096;
      margin-bottom: 0.25rem;
    }

    .metric-value {
      display: block;
      font-weight: 600;
      color: #1a202c;
    }

    .campaign-actions {
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
    }

    .empty-state {
      text-align: center;
      padding: 3rem 2rem;
      background: white;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .empty-state h3 {
      font-size: 1.5rem;
      color: #1a202c;
      margin-bottom: 0.5rem;
    }

    .empty-state p {
      color: #718096;
      margin-bottom: 2rem;
    }

    .tools-grid {
      display: grid;
      gap: 1.5rem;
    }

    .tool-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
      text-align: center;
    }

    .tool-icon {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }

    .tool-card h3 {
      font-size: 1.125rem;
      font-weight: 600;
      color: #1a202c;
      margin-bottom: 0.5rem;
    }

    .tool-card p {
      color: #718096;
      font-size: 0.875rem;
      margin-bottom: 1.5rem;
    }

    @media (max-width: 768px) {
      .marketing-dashboard {
        padding: 1rem;
      }

      .dashboard-content {
        grid-template-columns: 1fr;
        gap: 2rem;
      }

      .action-buttons {
        flex-direction: column;
        align-items: center;
      }

      .dashboard-stats {
        grid-template-columns: 1fr 1fr;
      }
    }

    @media (max-width: 480px) {
      .dashboard-stats {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class MarketingDashboardComponent implements OnInit {
  private readonly marketingService = inject(MarketingService);

  recentCampaigns = signal<MarketingCampaign[]>([]);
  dashboardStats = signal({
    activeCampaigns: 0,
    totalConversions: 0,
    avgConversionRate: 0,
    totalRevenue: 0
  });

  ngOnInit() {
    this.loadDashboardData();
  }

  private loadDashboardData() {
    // Mock application ID - in real app, get from auth service
    const applicationId = '507f1f77bcf86cd799439011';

    this.marketingService.getCampaignsByApplication(applicationId).subscribe({
      next: (response) => {
        if (response.success) {
          this.recentCampaigns.set(response.data.slice(0, 5));
          this.calculateStats(response.data);
        }
      },
      error: (error) => {
        console.error('Failed to load campaigns:', error);
      }
    });
  }

  private calculateStats(campaigns: MarketingCampaign[]) {
    const activeCampaigns = campaigns.filter(c => c.status === 'ACTIVE').length;
    const totalConversions = campaigns.reduce((sum, c) => sum + (c.metrics.conversions || 0), 0);
    const avgConversionRate = campaigns.length > 0
      ? campaigns.reduce((sum, c) => sum + (c.metrics.conversionRate || 0), 0) / campaigns.length
      : 0;
    const totalRevenue = campaigns.reduce((sum, c) => sum + (c.metrics.revenue || 0), 0);

    this.dashboardStats.set({
      activeCampaigns,
      totalConversions,
      avgConversionRate,
      totalRevenue
    });
  }

  formatCampaignType(type: string): string {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  toggleCampaign(campaign: MarketingCampaign) {
    if (campaign.status === 'ACTIVE') {
      this.marketingService.pauseCampaign(campaign._id).subscribe({
        next: () => {
          campaign.status = 'PAUSED';
        },
        error: (error) => {
          console.error('Failed to pause campaign:', error);
        }
      });
    } else {
      this.marketingService.startCampaign(campaign._id).subscribe({
        next: () => {
          campaign.status = 'ACTIVE';
        },
        error: (error) => {
          console.error('Failed to start campaign:', error);
        }
      });
    }
  }
}
