import { Routes } from '@angular/router';

export const plansRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/plans-list.component').then(m => m.PlansListComponent)
  },
  {
    path: 'new',
    loadComponent: () => import('./editor/plan-editor.component').then(m => m.PlanEditorComponent)
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./editor/plan-editor.component').then(m => m.PlanEditorComponent)
  },
  {
    path: ':planId/features',
    loadComponent: () => import('./plan-features/plan-features.component').then(m => m.PlanFeaturesComponent)
  },
  {
    path: ':planId/add-features',
    loadComponent: () => import('./add-features/add-features.component').then(m => m.AddFeaturesComponent)
  },
  {
    path: ':planId/feature-assignment',
    loadComponent: () => import('./feature-assignment/feature-assignment.component').then(m => m.FeatureAssignmentComponent)
  }
];
