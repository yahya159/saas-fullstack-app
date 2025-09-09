import { Routes } from '@angular/router';

export const profileRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./user-profile.component').then(m => m.UserProfileComponent)
  }
];
