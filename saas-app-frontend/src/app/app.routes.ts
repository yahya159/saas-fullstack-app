import { Routes } from '@angular/router';
import { SignupComponent } from './@shared/signup/components/signup.component';

export const routes: Routes = [
  { 
    path: 'signup', 
    component: SignupComponent
  },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  { 
    path: 'plans', 
    loadChildren: () => import('./features/plans/plans.routes').then(m => m.plansRoutes)
  },
  { 
    path: 'pricing-widgets', 
    loadChildren: () => import('./features/pricing-widgets/pricing-widgets.routes').then(m => m.pricingWidgetsRoutes)
  },
  { 
    path: 'profile', 
    loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent)
  },
  { 
    path: 'admin', 
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.adminRoutes)
  },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { 
    path: '404', 
    loadComponent: () => import('./@shared/components/not-found/not-found.component').then(m => m.NotFoundComponent)
  },
  { path: '**', redirectTo: '/404' }
];
