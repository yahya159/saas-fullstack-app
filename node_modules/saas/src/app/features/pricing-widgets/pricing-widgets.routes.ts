import { Routes } from '@angular/router';

export const pricingWidgetsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./builder/widget-builder.component').then(m => m.WidgetBuilderComponent)
  },
  {
    path: 'export',
    loadComponent: () => import('../widgets/widgets-export/widgets-export.component').then(m => m.WidgetsExportComponent)
  },
  {
    path: 'test',
    loadComponent: () => import('./test-images.component').then(m => m.TestImagesComponent)
  }
];
