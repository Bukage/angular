import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container text-center" style="padding: 80px 0;">
      <h1 class="display-4">404</h1>
      <p class="lead">The page you are looking for was not found.</p>
      <a routerLink="/" class="btn btn-primary mt-3">Go Home</a>
    </div>
  `,
})
export class NotFoundComponent {}
