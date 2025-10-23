import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login.component';
import { RegisterComponent } from './features/auth/register.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  {
    path: 'recipes',
    canActivate: [authGuard],
    loadChildren: () => import('./features/recipes/routes').then((m) => m.RECIPE_ROUTES),
  },
  {
    path: 'inventory',
    canActivate: [authGuard],
    loadChildren: () => import('./features/inventory/routes').then((m) => m.INVENTORY_ROUTES),
  },
  { path: '**', loadComponent: () => import('./shared/not-found.component').then(m => m.NotFoundComponent) },
];
