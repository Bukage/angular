import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
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
