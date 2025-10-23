import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const userIdQueryInterceptor: HttpInterceptorFn = (req, next) => {
  // Only append to our API routes
  if (!req.url.startsWith('/api/')) {
    return next(req);
  }
  const auth = inject(AuthService);
  const user = auth.user();
  if (!user) {
    return next(req);
  }
  const url = new URL(req.url, window.location.origin);
  url.searchParams.set('userId', user.userId);
  return next(req.clone({ url: url.pathname + url.search }));
};
