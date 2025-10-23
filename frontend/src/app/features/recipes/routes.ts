import { Routes } from '@angular/router';

export const RECIPE_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./recipes-list.component').then(m => m.RecipesListComponent) },
  { path: 'new', loadComponent: () => import('./recipe-form.component').then(m => m.RecipeFormComponent) },
  { path: ':id', loadComponent: () => import('./recipe-detail.component').then(m => m.RecipeDetailComponent) },
  { path: ':id/edit', loadComponent: () => import('./recipe-form.component').then(m => m.RecipeFormComponent) },
];
