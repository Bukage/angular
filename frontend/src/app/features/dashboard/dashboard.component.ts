import { Component, OnDestroy, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { interval, Subject, switchMap, takeUntil, startWith } from 'rxjs';
import { AuthService } from '../../core/auth.service';

interface DashboardResponse {
  user: { userId: string; email: string; fullname: string; role: string };
  recipeCount: number;
  userCount: number;
  inventoryCount: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  user = computed(() => this.auth.user());
  stats: { userCount: number; recipeCount: number; inventoryCount: number } | null = null;

  ngOnInit(): void {
    interval(30000)
      .pipe(
        startWith(0),
        switchMap(() => this.http.get<DashboardResponse>(`/api/dashboard-33968748`)),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (res) => {
          this.stats = {
            userCount: res.userCount,
            recipeCount: res.recipeCount,
            inventoryCount: res.inventoryCount,
          };
        },
        error: () => {},
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
