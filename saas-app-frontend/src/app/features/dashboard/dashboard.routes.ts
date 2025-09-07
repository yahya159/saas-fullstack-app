import { Routes } from '@angular/router';

export const dashboardRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./main-dashboard.component').then(m => m.MainDashboardComponent)
  }
];
