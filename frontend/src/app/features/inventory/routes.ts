import { Routes } from '@angular/router';

export const INVENTORY_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./inventory-list.component').then(m => m.InventoryListComponent) },
  { path: 'new', loadComponent: () => import('./inventory-form.component').then(m => m.InventoryFormComponent) },
  { path: ':id/edit', loadComponent: () => import('./inventory-form.component').then(m => m.InventoryFormComponent) },
];
