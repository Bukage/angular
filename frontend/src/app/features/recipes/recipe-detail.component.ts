import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RecipesService, Recipe } from './recipes.service';

@Component({
  selector: 'app-recipe-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container mt-4" *ngIf="recipe">
      <a routerLink="/recipes" class="btn btn-link p-0">← Back</a>
      <h2 class="mt-2">{{ recipe.title }}</h2>
      <div class="text-muted">By {{ recipe.chef }}</div>

      <div class="row mt-3">
        <div class="col-6 col-md-3"><b>Prep:</b> {{ recipe.prepTime }} min</div>
        <div class="col-6 col-md-3"><b>Difficulty:</b> {{ recipe.difficulty }}</div>
        <div class="col-6 col-md-3"><b>Servings:</b> {{ recipe.servings }}</div>
        <div class="col-6 col-md-3"><b>Meal:</b> {{ recipe.mealType }}</div>
      </div>

      <hr class="rounded my-4" />

      <div class="row">
        <div class="col-md-6">
          <h4>Ingredients</h4>
          <ul>
            <li *ngFor="let i of recipe.ingredients">{{ i }}</li>
          </ul>
        </div>
        <div class="col-md-6">
          <h4>Instructions</h4>
          <ol>
            <li *ngFor="let s of recipe.instructions">{{ s }}</li>
          </ol>
        </div>
      </div>
    </div>
  `,
})
export class RecipeDetailComponent implements OnInit {
  recipe: Recipe | null = null;
  constructor(private route: ActivatedRoute, private api: RecipesService) {}
  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.recipe = await this.api.get(id);
  }
}
