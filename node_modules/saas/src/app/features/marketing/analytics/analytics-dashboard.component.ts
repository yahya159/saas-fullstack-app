import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MarketingMenuComponent } from '../marketing-menu.component';
import { MarketingService } from '../services/marketing.service';

@Component({
  selector: 'app-analytics-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MarketingMenuComponent],
  template: `
    <app-marketing-menu></app-marketing-menu>

    <div class="analytics-dashboard">
      <div class="header">
        <h1>Analytics Dashboard</h1>
        <div class="date-filters">
          <label for="date-range">Date Range:</label>
          <select id="date-range" class="date-select" (change)="onDateRangeChange($event)">
            <option value="7">Last 7 Days</option>
            <option value="30" selected>Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="365">Last Year</option>
          </select>
        </div>
      </div>

      <div class="content">
        <div class="dashboard-stats">
          <div class="stat-card">
            <div class="stat-header">
              <h3>Total Events</h3>
              <i class="icon-events"></i>
            </div>
            <div class="stat-value">{{ analyticsData().totalEvents | number }}</div>
            <div class="stat-change positive">
              <i class="icon-arrow-up"></i>
              +12% from last period
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-header">
              <h3>Total Conversions</h3>
              <i class="icon-conversions"></i>
            </div>
            <div class="stat-value">{{ analyticsData().totalConversions | number }}</div>
            <div class="stat-change positive">
              <i class="icon-arrow-up"></i>
              +28% from last period
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-header">
              <h3>Average CVR</h3>
              <i class="icon-percentage"></i>
            </div>
            <div class="stat-value">{{ analyticsData().avgConversionRate | number:'1.2-2' }}%</div>
            <div class="stat-change positive">
              <i class="icon-arrow-up"></i>
              +5.2% from last period
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-header">
              <h3>Total Revenue</h3>
              <i class="icon-revenue"></i>
            </div>
            <div class="stat-value">\${{ analyticsData().totalRevenue | number }}</div>
            <div class="stat-change positive">
              <i class="icon-arrow-up"></i>
              +15% from last period
            </div>
          </div>
        </div>

        <div class="analytics-sections">
          <div class="section">
            <div class="section-header">
              <h2>Event Types</h2>
            </div>
            <div class="chart-container">
              <div class="chart-placeholder">
                <div class="chart-icon">📊</div>
                <p>Event Types Distribution Chart</p>
                <p class="chart-data">Page Views: 45%, Button Clicks: 30%, Conversions: 15%, Others: 10%</p>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-header">
              <h2>Top Campaigns</h2>
            </div>
            <div class="campaigns-table">
              <div class="table-header">
                <div class="table-cell">Campaign</div>
                <div class="table-cell">Impressions</div>
                <div class="table-cell">Conversions</div>
                <div class="table-cell">CVR</div>
                <div class="table-cell">Revenue</div>
              </div>
              <div class="table-row" *ngFor="let campaign of topCampaigns()">
                <div class="table-cell">{{ campaign.name }}</div>
                <div class="table-cell">{{ campaign.metrics.impressions | number }}</div>
                <div class="table-cell">{{ campaign.metrics.conversions | number }}</div>
                <div class="table-cell">{{ campaign.metrics.conversionRate | number:'1.2-2' }}%</div>
                <div class="table-cell">\${{ campaign.metrics.revenue | number }}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-header">
              <h2>Tracking Code</h2>
              <p>Implement tracking on your website to collect analytics data</p>
            </div>
            <div class="tracking-code">
              <h3>JavaScript Snippet</h3>
              <pre class="code-block">{{ trackingScript() }}</pre>
              <button class="btn btn-outline" (click)="copyToClipboard(trackingScript())">
                Copy to Clipboard
              </button>

              <h3>Tracking Pixel</h3>
              <pre class="code-block">{{ trackingPixel() }}</pre>
              <button class="btn btn-outline" (click)="copyToClipboard(trackingPixel())">
                Copy to Clipboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .analytics-dashboard {
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

    .date-filters {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .date-filters label {
      font-weight: 500;
      color: var(--text-secondary, #718096);
    }

    .date-select {
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

    .btn-outline {
      background: transparent;
      color: var(--accent-primary, #3182ce);
      border: 1px solid var(--accent-primary, #3182ce);
    }

    .btn-outline:hover {
      background: var(--accent-primary, #3182ce);
      color: white;
    }

    .dashboard-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
    }

    .stat-card {
      background: var(--bg-primary, #ffffff);
      border-radius: var(--radius-lg, 12px);
      padding: 1.5rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      border: 1px solid var(--border-color, #e2e8f0);
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
      color: var(--text-secondary, #718096);
      margin: 0;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      color: var(--text-primary, #1a202c);
      margin-bottom: 0.5rem;
    }

    .stat-change {
      font-size: 0.875rem;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .stat-change.positive {
      color: var(--success, #38a169);
    }

    .analytics-sections {
      display: grid;
      grid-template-columns: 1fr;
      gap: 2rem;
    }

    .section {
      background: var(--bg-primary, #ffffff);
      border-radius: var(--radius-lg, 12px);
      padding: 1.5rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      border: 1px solid var(--border-color, #e2e8f0);
    }

    .section-header {
      margin-bottom: 1.5rem;
    }

    .section-header h2 {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-primary, #1a202c);
      margin: 0 0 0.5rem 0;
    }

    .section-header p {
      color: var(--text-secondary, #718096);
      margin: 0;
    }

    .chart-container {
      height: 300px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .chart-placeholder {
      text-align: center;
      color: var(--text-secondary, #718096);
    }

    .chart-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .chart-data {
      font-size: 0.875rem;
      margin-top: 0.5rem;
    }

    .campaigns-table {
      width: 100%;
      border-collapse: collapse;
    }

    .table-header {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
      background: var(--bg-secondary, #f7fafc);
      font-weight: 600;
      color: var(--text-primary, #1a202c);
      border-radius: var(--radius-md, 6px) var(--radius-md, 6px) 0 0;
    }

    .table-row {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
      border-bottom: 1px solid var(--border-color, #e2e8f0);
      padding: 0.75rem 0;
    }

    .table-row:last-child {
      border-bottom: none;
    }

    .table-cell {
      padding: 0.5rem;
      display: flex;
      align-items: center;
    }

    .tracking-code {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .tracking-code h3 {
      margin: 0 0 0.5rem 0;
      color: var(--text-primary, #1a202c);
    }

    .code-block {
      background: var(--bg-secondary, #f7fafc);
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: var(--radius-md, 6px);
      padding: 1rem;
      font-family: var(--font-family-mono, 'Courier New', monospace);
      font-size: 0.875rem;
      overflow-x: auto;
      white-space: pre-wrap;
    }

    @media (max-width: 768px) {
      .analytics-dashboard {
        padding: 1rem;
      }

      .header {
        flex-direction: column;
        gap: 1rem;
        align-items: flex-start;
      }

      .dashboard-stats {
        grid-template-columns: 1fr 1fr;
      }

      .table-header,
      .table-row {
        grid-template-columns: 1fr 1fr;
      }

      .table-cell:nth-child(n+3) {
        display: none;
      }
    }

    @media (max-width: 480px) {
      .dashboard-stats {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AnalyticsDashboardComponent implements OnInit {
  private readonly marketingService = inject(MarketingService);

  analyticsData = signal({
    totalEvents: 12543,
    totalConversions: 876,
    avgConversionRate: 6.98,
    totalRevenue: 42500
  });

  topCampaigns = signal([
    {
      name: 'Summer Sale A/B Test',
      metrics: {
        impressions: 12500,
        conversions: 342,
        conversionRate: 2.74,
        revenue: 15600
      }
    },
    {
      name: 'Homepage Redesign',
      metrics: {
        impressions: 9800,
        conversions: 298,
        conversionRate: 3.04,
        revenue: 12800
      }
    },
    {
      name: 'Email Campaign Q2',
      metrics: {
        impressions: 7600,
        conversions: 187,
        conversionRate: 2.46,
        revenue: 8900
      }
    },
    {
      name: 'Pricing Page Test',
      metrics: {
        impressions: 5400,
        conversions: 149,
        conversionRate: 2.76,
        revenue: 5200
      }
    }
  ]);

  trackingScript = signal('');
  trackingPixel = signal('');

  ngOnInit() {
    this.generateTrackingCode();
  }

  private generateTrackingCode() {
    const applicationId = '507f1f77bcf86cd799439011'; // Mock application ID
    this.trackingScript.set(this.marketingService.generateTrackingScript(applicationId));
    this.trackingPixel.set(this.marketingService.generateTrackingPixel(applicationId));
  }

  onDateRangeChange(event: any) {
    const days = event.target.value;
    console.log(`Date range changed to last ${days} days`);
    // In a real implementation, this would fetch new data
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  }
}
