import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InventoryService } from './inventory.service';

@Component({
  selector: 'app-inventory-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './inventory-form.component.html',
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
