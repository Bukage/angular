import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RecipesService } from './recipes.service';

@Component({
  selector: 'app-recipe-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './recipe-form.component.html',
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
