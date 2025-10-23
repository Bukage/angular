import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InventoryService } from './inventory.service';

@Component({
  selector: 'app-inventory-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container mt-4" style="max-width: 800px;">
      <h3 class="mb-3">{{ isEdit ? 'Edit Item' : 'New Item' }}</h3>
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="row g-3">
          <div class="col-12 col-md-6">
            <label class="form-label">Ingredient Name</label>
            <input class="form-control" formControlName="ingredientName" />
          </div>
          <div class="col-6 col-md-3">
            <label class="form-label">Quantity</label>
            <input type="number" class="form-control" formControlName="quantity" />
          </div>
          <div class="col-6 col-md-3">
            <label class="form-label">Unit</label>
            <select class="form-select" formControlName="unit">
              <option>pieces</option>
              <option>kg</option>
              <option>g</option>
              <option>liters</option>
              <option>ml</option>
              <option>cups</option>
              <option>tbsp</option>
              <option>tsp</option>
              <option>dozen</option>
            </select>
          </div>
          <div class="col-12 col-md-6">
            <label class="form-label">Category</label>
            <select class="form-select" formControlName="category">
              <option>Vegetables</option>
              <option>Fruits</option>
              <option>Meat</option>
              <option>Dairy</option>
              <option>Grains</option>
              <option>Spices</option>
              <option>Beverages</option>
              <option>Frozen</option>
              <option>Canned</option>
              <option>Other</option>
            </select>
          </div>
          <div class="col-6 col-md-3">
            <label class="form-label">Purchase Date</label>
            <input type="date" class="form-control" formControlName="purchaseDate" />
          </div>
          <div class="col-6 col-md-3">
            <label class="form-label">Expiration Date</label>
            <input type="date" class="form-control" formControlName="expirationDate" />
          </div>
          <div class="col-6 col-md-3">
            <label class="form-label">Location</label>
            <select class="form-select" formControlName="location">
              <option>Fridge</option>
              <option>Freezer</option>
              <option>Pantry</option>
              <option>Counter</option>
              <option>Cupboard</option>
            </select>
          </div>
          <div class="col-6 col-md-3">
            <label class="form-label">Cost</label>
            <input type="number" step="0.01" class="form-control" formControlName="cost" />
          </div>
          <div class="col-12">
            <label class="form-label">Created Date</label>
            <input type="date" class="form-control" formControlName="createdDate" />
          </div>
        </div>
        <div class="mt-3 d-flex gap-2">
          <button class="btn btn-primary" [disabled]="form.invalid">{{ isEdit ? 'Save' : 'Create' }}</button>
          <a routerLink="/inventory" class="btn btn-outline-secondary">Cancel</a>
        </div>
      </form>
    </div>
  `,
})
export class InventoryFormComponent implements OnInit {
  isEdit = false;
  id: string | null = null;

  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private api: InventoryService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      ingredientName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      quantity: [1, [Validators.required, Validators.min(0.01), Validators.max(9999)]],
      unit: ['pieces', Validators.required],
      category: ['Vegetables', Validators.required],
      purchaseDate: [new Date().toISOString().slice(0, 10), Validators.required],
      expirationDate: [new Date().toISOString().slice(0, 10), Validators.required],
      location: ['Fridge', Validators.required],
      cost: [1, [Validators.required, Validators.min(0.01), Validators.max(999.99)]],
      createdDate: [new Date().toISOString().slice(0, 10), Validators.required],
    });
  }

  async ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.id;
    if (this.isEdit && this.id) {
      const it = await this.api.get(this.id);
      this.form.patchValue({
        ingredientName: it.ingredientName,
        quantity: it.quantity,
        unit: it.unit,
        category: it.category,
        purchaseDate: (it.purchaseDate as any)?.toString()?.slice(0, 10),
        expirationDate: (it.expirationDate as any)?.toString()?.slice(0, 10),
        location: it.location,
        cost: it.cost,
        createdDate: (it.createdDate as any)?.toString()?.slice(0, 10),
      });
    }
  }

  async onSubmit() {
    const val = this.form.value as any;
    if (this.isEdit && this.id) {
      await this.api.update(this.id, val);
    } else {
      await this.api.create(val);
    }
    await this.router.navigate(['/inventory']);
  }
}
