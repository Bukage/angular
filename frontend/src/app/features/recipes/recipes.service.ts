import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface Recipe {
  _id?: string;
  recipeId: string;
  userId: string;
  title: string;
  chef: string;
  ingredients: string[];
  instructions: string[];
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  cuisineType:
    | 'Italian'
    | 'Asian'
    | 'Mexican'
    | 'American'
    | 'French'
    | 'Indian'
    | 'Mediterranean'
    | 'Other';
  prepTime: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  servings: number;
  createdDate: string | Date;
}

@Injectable({ providedIn: 'root' })
export class RecipesService {
  constructor(private http: HttpClient) {}

  async list(): Promise<Recipe[]> {
    const res = await firstValueFrom(this.http.get<{ recipes: Recipe[] }>(`/api/recipes-33968748`));
    return res.recipes;
  }

  async get(recipeId: string): Promise<Recipe> {
    const res = await firstValueFrom(
      this.http.get<{ recipe: Recipe }>(`/api/recipes-33968748/${encodeURIComponent(recipeId)}`)
    );
    return res.recipe;
  }

  async create(payload: Omit<Recipe, 'recipeId' | 'userId' | 'chef'>): Promise<Recipe> {
    const res = await firstValueFrom(
      this.http.post<{ recipe: Recipe }>(`/api/recipes-33968748`, payload as any)
    );
    return res.recipe;
  }

  async update(recipeId: string, payload: Partial<Recipe>): Promise<Recipe> {
    const res = await firstValueFrom(
      this.http.put<{ recipe: Recipe }>(`/api/recipes-33968748/${encodeURIComponent(recipeId)}`, payload)
    );
    return res.recipe;
  }

  async remove(recipeId: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(`/api/recipes-33968748/${encodeURIComponent(recipeId)}`)
    );
  }
}
