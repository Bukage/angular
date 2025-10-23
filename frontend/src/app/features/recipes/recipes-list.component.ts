import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RecipesService, Recipe } from './recipes.service';

@Component({
  selector: 'app-recipes-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container mt-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h3>All Recipes</h3>
        <a routerLink="/recipes/new" class="btn btn-primary">New Recipe</a>
      </div>

      <div class="table-responsive">
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Recipe ID</th>
              <th>Title</th>
              <th>Chef</th>
              <th>Prep Time</th>
              <th>Difficulty</th>
              <th>Servings</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let r of recipes">
              <td>{{ r.recipeId }}</td>
              <td><a [routerLink]="['/recipes', r.recipeId]">{{ r.title }}</a></td>
              <td>{{ r.chef }}</td>
              <td>{{ r.prepTime }} min</td>
              <td>{{ r.difficulty }}</td>
              <td>{{ r.servings }}</td>
              <td class="text-end d-flex gap-2 justify-content-end">
                <a [routerLink]="['/recipes', r.recipeId, 'edit']" class="btn btn-sm btn-outline-secondary">Edit</a>
                <button class="btn btn-sm btn-outline-danger" (click)="onDelete(r.recipeId)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class RecipesListComponent implements OnInit {
  recipes: Recipe[] = [];
  constructor(private api: RecipesService) {}
  async ngOnInit() {
    this.recipes = await this.api.list();
  }

  async onDelete(recipeId: string) {
    if (!confirm('Delete this recipe?')) return;
    await this.api.remove(recipeId);
    this.recipes = this.recipes.filter((r) => r.recipeId !== recipeId);
  }
}
