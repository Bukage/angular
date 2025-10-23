import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container" style="max-width: 560px; margin-top: 60px;">
      <div class="card p-4">
        <h2 class="mb-3">Register</h2>
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="row g-3">
            <div class="col-12">
              <label class="form-label">Full name</label>
              <input class="form-control" formControlName="fullname" />
            </div>
            <div class="col-12">
              <label class="form-label">Email</label>
              <input type="email" class="form-control" formControlName="email" />
            </div>
            <div class="col-12 col-md-6">
              <label class="form-label">Password</label>
              <input type="password" class="form-control" formControlName="password" />
              <div class="form-text">Must include upper, lower, number, special. Min 8.</div>
            </div>
            <div class="col-12 col-md-6">
              <label class="form-label">Phone</label>
              <input class="form-control" placeholder="+61 4xx xxx xxx" formControlName="phone" />
            </div>
            <div class="col-12">
              <label class="form-label">Role</label>
              <select class="form-select" formControlName="role">
                <option value="chef">Chef</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div class="mt-3 d-flex gap-2">
            <button class="btn btn-primary" [disabled]="form.invalid || loading">Create account</button>
            <a routerLink="/login" class="btn btn-outline-secondary">Back to login</a>
          </div>
          <div class="text-danger mt-2" *ngIf="error">{{ error }}</div>
        </form>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  loading = false;
  error = '';

  form!: FormGroup;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      fullname: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])[\S]+$/),
        ],
      ],
      role: ['chef', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^\+61\s?4\d{2}\s?\d{3}\s?\d{3}$/)]],
    });
  }

  async onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';
    try {
      await this.auth.register(this.form.value as any);
      await this.router.navigate(['/dashboard']);
    } catch (e: any) {
      const errors = e?.error?.errors;
      this.error = Array.isArray(errors) ? errors.join(', ') : e?.error?.error || 'Register failed';
    } finally {
      this.loading = false;
    }
  }
}
