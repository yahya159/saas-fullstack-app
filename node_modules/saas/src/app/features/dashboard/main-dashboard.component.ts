import { Component, OnInit, signal, inject, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { MockApiService } from '../../core/services/mock-api.service';

interface DashboardStats {
  totalPlans: number;
  activeWidgets: number;
  marketingCampaigns: number;
  teamMembers: number;
}

interface RecentActivity {
  id: string;
  type: 'plan' | 'widget' | 'campaign' | 'team';
  title: string;
  description: string;
  timestamp: Date;
  status: 'success' | 'pending' | 'warning' | 'error';
}

@Component({
  selector: 'app-main-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './main-dashboard.component.html',
  styleUrls: ['./main-dashboard.component.css']
})
export class MainDashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private mockApi = inject(MockApiService);

  // Signals for reactive state management
  currentUser = this.authService.currentUser;
  currentTime = signal(new Date());
  dashboardStats = signal<DashboardStats>({
    totalPlans: 0,
    activeWidgets: 0,
    marketingCampaigns: 0,
    teamMembers: 0
  });

  recentActivities = signal<RecentActivity[]>([]);
  isLoading = signal(false);

  // Computed values
  welcomeMessage = computed(() => {
    const user = this.currentUser();
    const timeOfDay = this.getTimeOfDay();
    return user ? `${timeOfDay}, ${user.firstName}!` : `${timeOfDay}!`;
  });

  userRoleDisplay = computed(() => {
    const user = this.currentUser();
    if (!user) return '';

    const roleMap: Record<string, string> = {
      'CUSTOMER_ADMIN': 'Technical Administrator',
      'CUSTOMER_MANAGER': 'Product Manager',
      'CUSTOMER_DEVELOPER': 'Developer',
      'SAAS_ADMIN': 'Platform Administrator',
      'SAAS_MANAGER': 'Platform Manager'
    };

    return roleMap[user.role] || user.role;
  });

  quickActions = computed(() => {
    const user = this.currentUser();
    if (!user) return [];

    const actions = [];

    // Role-based quick actions
    if (user.role === 'CUSTOMER_ADMIN') {
      actions.push(
        { icon: 'users', label: 'Manage Team', route: '/role-management', color: 'blue' },
        { icon: 'settings', label: 'System Settings', route: '/settings', color: 'gray' },
        { icon: 'shield', label: 'Security', route: '/security', color: 'red' }
      );
    }

    if (user.role === 'CUSTOMER_MANAGER') {
      actions.push(
        { icon: 'trending-up', label: 'Marketing Dashboard', route: '/marketing', color: 'green' },
        { icon: 'bar-chart', label: 'Analytics', route: '/marketing/analytics', color: 'purple' },
        { icon: 'target', label: 'New Campaign', route: '/marketing/campaigns/new', color: 'orange' }
      );
    }

    if (user.role === 'CUSTOMER_DEVELOPER') {
      actions.push(
        { icon: 'code', label: 'API Documentation', route: '/docs', color: 'blue' },
        { icon: 'package', label: 'Widgets', route: '/pricing-widgets', color: 'green' },
        { icon: 'terminal', label: 'Sandbox', route: '/sandbox', color: 'gray' }
      );
    }

    // Common actions for all roles
    actions.push(
      { icon: 'layout', label: 'Plans & Features', route: '/plans', color: 'indigo' },
      { icon: 'help-circle', label: 'Help Center', route: '/help', color: 'gray' }
    );

    return actions;
  });

  ngOnInit() {
    this.loadDashboardData();
    this.setupTimeUpdater();
  }

  private setupTimeUpdater() {
    // Update the current time every minute to ensure greetings update
    setInterval(() => {
      this.currentTime.set(new Date());
    }, 60000); // Update every minute
  }

  private loadDashboardData() {
    this.isLoading.set(true);

    try {
      // Load stats from mock API
      const plans = this.mockApi.plans();
      const widgets = this.mockApi.widgets();
      const features = this.mockApi.features();

      this.dashboardStats.set({
        totalPlans: plans.length,
        activeWidgets: widgets.length,
        marketingCampaigns: 3, // Mock data
        teamMembers: 5 // Mock data
      });

      // Generate mock recent activities
      this.recentActivities.set(this.generateMockActivities());

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  private generateMockActivities(): RecentActivity[] {
    return [
      {
        id: '1',
        type: 'plan',
        title: 'New Premium Plan Created',
        description: 'Premium enterprise plan with advanced features',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        status: 'success'
      },
      {
        id: '2',
        type: 'widget',
        title: 'Pricing Widget Updated',
        description: 'Modern pricing widget design deployed',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        status: 'success'
      },
      {
        id: '3',
        type: 'campaign',
        title: 'A/B Test Campaign Started',
        description: 'Testing new onboarding flow variations',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
        status: 'pending'
      },
      {
        id: '4',
        type: 'team',
        title: 'New Team Member Invited',
        description: 'Developer role assigned to john.doe@company.com',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        status: 'success'
      }
    ];
  }

  private getTimeOfDay(): string {
    const hour = this.currentTime().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  getStatIcon(statType: keyof DashboardStats): string {
    const icons = {
      totalPlans: 'layers',
      activeWidgets: 'grid',
      marketingCampaigns: 'trending-up',
      teamMembers: 'users'
    };
    return icons[statType];
  }

  getActivityIcon(type: RecentActivity['type']): string {
    const icons = {
      plan: 'layers',
      widget: 'grid',
      campaign: 'trending-up',
      team: 'users'
    };
    return icons[type];
  }

  getActivityColor(status: RecentActivity['status']): string {
    const colors = {
      success: 'green',
      pending: 'yellow',
      warning: 'orange',
      error: 'red'
    };
    return colors[status];
  }

  formatTimeAgo(timestamp: Date): string {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  }

  onQuickActionClick(action: any) {
    // Analytics tracking could be added here
    console.log('Quick action clicked:', action.label);
  }

  onRefreshData() {
    this.loadDashboardData();
  }
}
