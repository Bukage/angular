import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from './api.tokens';
import { firstValueFrom, tap } from 'rxjs';

export interface AuthUser {
  userId: string;
  email: string;
  fullname: string;
  role: 'admin' | 'chef' | 'manager';
  phone: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storageKey = 'auth_user_33968748';
  private readonly _user = signal<AuthUser | null>(this.readFromStorage());

  readonly user = computed(() => this._user());
  readonly isAuthenticated = computed(() => !!this._user());

  constructor(private http: HttpClient) {}

  private readFromStorage(): AuthUser | null {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  }

  private writeToStorage(user: AuthUser | null): void {
    if (user) localStorage.setItem(this.storageKey, JSON.stringify(user));
    else localStorage.removeItem(this.storageKey);
  }

  async login(email: string, password: string): Promise<AuthUser> {
    const resp = await firstValueFrom(
      this.http.post<{ user: AuthUser }>(`/api/auth/login-33968748`, { email, password })
    );
    this._user.set(resp.user);
    this.writeToStorage(resp.user);
    return resp.user;
  }

  async register(payload: {
    email: string;
    password: string;
    fullname: string;
    role: 'admin' | 'chef' | 'manager';
    phone: string;
  }): Promise<AuthUser> {
    const resp = await firstValueFrom(
      this.http.post<{ user: AuthUser }>(`/api/auth/register-33968748`, payload)
    );
    this._user.set(resp.user);
    this.writeToStorage(resp.user);
    return resp.user;
  }

  logout(): void {
    this._user.set(null);
    this.writeToStorage(null);
  }
}
