import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'signup',
    loadComponent: () => import('../../@shared/signup/components/signup.component').then(m => m.SignupComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent) // Temporary placeholder
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent) // Temporary placeholder
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];
