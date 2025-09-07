import { Routes } from '@angular/router';

export const marketingRoutes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/marketing-dashboard.component').then(m => m.MarketingDashboardComponent)
  },
  {
    path: 'campaigns',
    loadComponent: () => import('./campaigns/index').then(m => m.CampaignListComponent)
  },
  {
    path: 'campaigns/new',
    loadComponent: () => import('./campaign-editor/campaign-editor.component').then(m => m.CampaignEditorComponent)
  },
  {
    path: 'campaigns/:id',
    loadComponent: () => import('./campaign-editor/campaign-editor.component').then(m => m.CampaignEditorComponent)
  },
  {
    path: 'analytics',
    loadComponent: () => import('./analytics/analytics-dashboard.component').then(m => m.AnalyticsDashboardComponent)
  }
];
