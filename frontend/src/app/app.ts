import { Component, signal } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, NgIf],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('frontend');
  showChrome = true;

  constructor(private router: Router) {
    this.showChrome = !this.isAuthPath(this.router.url);
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        const url = e.urlAfterRedirects || e.url;
        this.showChrome = !this.isAuthPath(url);
      });
  }

  private isAuthPath(url: string): boolean {
    return url.startsWith('/login') || url.startsWith('/register');
  }
}
