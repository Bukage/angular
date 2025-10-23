import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container" style="max-width: 480px; margin-top: 60px;">
      <div class="card p-4">
        <h2 class="mb-3">Login</h2>
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="mb-3">
            <label class="form-label">Email</label>
            <input type="email" class="form-control" formControlName="email" />
            <div class="text-danger small" *ngIf="form.get('email')?.touched && form.get('email')?.invalid">
              Enter a valid email
            </div>
          </div>
          <div class="mb-3">
            <label class="form-label">Password</label>
            <input type="password" class="form-control" formControlName="password" />
          </div>
          <div class="d-flex gap-2">
            <button class="btn btn-primary" [disabled]="form.invalid || loading">Login</button>
            <a routerLink="/register" class="btn btn-outline-secondary">Register</a>
          </div>
          <div class="text-danger mt-2" *ngIf="error">{{ error }}</div>
        </form>
      </div>
    </div>
  `,
})
export class LoginComponent {
  loading = false;
  error = '';

  form!: FormGroup;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  async onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';
    try {
      const { email, password } = this.form.value as { email: string; password: string };
      await this.auth.login(email, password);
      await this.router.navigate(['/dashboard']);
    } catch (e: any) {
      this.error = e?.error?.error || 'Login failed';
    } finally {
      this.loading = false;
    }
  }
}
