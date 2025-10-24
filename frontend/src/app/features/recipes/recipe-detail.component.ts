import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RecipesService, Recipe } from './recipes.service';

@Component({
  selector: 'app-recipe-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './recipe-detail.component.html',
})
export class RecipeDetailComponent implements OnInit {
  recipe: Recipe | null = null;
  constructor(private route: ActivatedRoute, private api: RecipesService) {}
  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.recipe = await this.api.get(id);
  }
}
