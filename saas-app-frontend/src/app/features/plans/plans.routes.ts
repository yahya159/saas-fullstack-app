import { Routes } from '@angular/router';

export const plansRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/plans-list.component').then(m => m.PlansListComponent)
  },
  {
    path: 'features',
    loadComponent: () => import('./features/feature-management.component').then(m => m.FeatureManagementComponent)
  }
];