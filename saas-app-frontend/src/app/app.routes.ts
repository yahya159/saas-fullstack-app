import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { OAuthCallbackComponent } from './features/auth/oauth-callback/oauth-callback.component';

export const routes: Routes = [
  {
    path: 'oauth/callback',
    component: OAuthCallbackComponent
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes)
  },
  {
    path: 'login',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },
  {
    path: 'signup',
    redirectTo: '/auth/signup',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.dashboardRoutes),
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    loadChildren: () => import('./features/profile/profile.routes').then(m => m.profileRoutes),
    canActivate: [AuthGuard]
  },
  {
    path: 'plans',
    loadChildren: () => import('./features/plans/plans.routes').then(m => m.plansRoutes),
    canActivate: [AuthGuard]
  },
  {
    path: 'pricing-widgets',
    loadChildren: () => import('./features/pricing-widgets/pricing-widgets.routes').then(m => m.pricingWidgetsRoutes),
    canActivate: [AuthGuard]
  },
  {
    path: 'marketing',
    loadChildren: () => import('./features/marketing/marketing.routes').then(m => m.marketingRoutes),
    canActivate: [AuthGuard]
  },
  {
    path: 'role-management',
    loadChildren: () => import('./features/role-management/role-management.routes').then(m => m.roleManagementRoutes),
    canActivate: [AuthGuard]
  },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/auth/login' }
];
