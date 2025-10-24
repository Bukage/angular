import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RecipesService, Recipe } from './recipes.service';

@Component({
  selector: 'app-recipes-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './recipes-list.component.html',
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
