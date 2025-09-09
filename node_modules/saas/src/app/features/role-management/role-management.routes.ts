import { Routes } from '@angular/router';

export const roleManagementRoutes: Routes = [
  {
    path: '',
    redirectTo: 'team',
    pathMatch: 'full'
  },
  {
    path: 'team',
    loadComponent: () => import('./team-management/team-management.component').then(m => m.TeamManagementComponent)
  }
];
