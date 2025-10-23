import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RecipesService } from './recipes.service';

@Component({
  selector: 'app-recipe-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container mt-4" style="max-width: 800px;">
      <h3 class="mb-3">{{ isEdit ? 'Edit Recipe' : 'New Recipe' }}</h3>
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="row g-3">
          <div class="col-12">
            <label class="form-label">Title</label>
            <input class="form-control" formControlName="title" />
          </div>
          <div class="col-12 col-md-6">
            <label class="form-label">Cuisine Type</label>
            <select class="form-select" formControlName="cuisineType">
              <option>Italian</option>
              <option>Asian</option>
              <option>Mexican</option>
              <option>American</option>
              <option>French</option>
              <option>Indian</option>
              <option>Mediterranean</option>
              <option>Other</option>
            </select>
          </div>
          <div class="col-6 col-md-3">
            <label class="form-label">Prep Time (min)</label>
            <input type="number" class="form-control" formControlName="prepTime" />
          </div>
          <div class="col-6 col-md-3">
            <label class="form-label">Difficulty</label>
            <select class="form-select" formControlName="difficulty">
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </div>
          <div class="col-6 col-md-3">
            <label class="form-label">Servings</label>
            <input type="number" class="form-control" formControlName="servings" />
          </div>
          <div class="col-6 col-md-3">
            <label class="form-label">Meal Type</label>
            <select class="form-select" formControlName="mealType">
              <option>Breakfast</option>
              <option>Lunch</option>
              <option>Dinner</option>
              <option>Snack</option>
            </select>
          </div>
          <div class="col-12">
            <label class="form-label">Ingredients (one per line)</label>
            <textarea class="form-control" rows="5" formControlName="ingredients"></textarea>
          </div>
          <div class="col-12">
            <label class="form-label">Instructions (one step per line)</label>
            <textarea class="form-control" rows="5" formControlName="instructions"></textarea>
          </div>
        </div>
        <div class="mt-3 d-flex gap-2">
          <button class="btn btn-primary" [disabled]="form.invalid">{{ isEdit ? 'Save' : 'Create' }}</button>
          <a routerLink="/recipes" class="btn btn-outline-secondary">Cancel</a>
        </div>
      </form>
    </div>
  `,
})
export class RecipeFormComponent implements OnInit {
  isEdit = false;
  recipeId: string | null = null;

  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private api: RecipesService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      cuisineType: ['Italian', Validators.required],
      prepTime: [10, [Validators.required, Validators.min(1), Validators.max(480)]],
      difficulty: ['Easy', Validators.required],
      servings: [1, [Validators.required, Validators.min(1), Validators.max(20)]],
      ingredients: ['', [Validators.required]],
      instructions: ['', [Validators.required]],
      mealType: ['Dinner', Validators.required],
      createdDate: [new Date().toISOString().slice(0, 10), Validators.required],
    });
  }

  async ngOnInit() {
    this.recipeId = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.recipeId;
    if (this.isEdit && this.recipeId) {
      const r = await this.api.get(this.recipeId);
      this.form.patchValue({
        title: r.title,
        cuisineType: r.cuisineType,
        prepTime: r.prepTime,
        difficulty: r.difficulty,
        servings: r.servings,
        ingredients: r.ingredients.join('\n'),
        instructions: r.instructions.join('\n'),
        mealType: r.mealType,
        createdDate: (r.createdDate as any)?.toString()?.slice(0, 10),
      });
    }
  }

  async onSubmit() {
    const val = this.form.value as any;
    if (this.isEdit && this.recipeId) {
      await this.api.update(this.recipeId, val);
    } else {
      await this.api.create(val);
    }
    await this.router.navigate(['/recipes']);
  }
}
