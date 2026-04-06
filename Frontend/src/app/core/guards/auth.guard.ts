import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  if (auth.hasToken()) return true;
  inject(Router).navigate(['/auth/login']);
  return false;
};

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  if (auth.hasToken() && auth.isAdmin()) return true;
  inject(Router).navigate(['/products']);
  return false;
};

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  if (!auth.hasToken()) return true;
  inject(Router).navigate([auth.isAdmin() ? '/admin' : '/products']);
  return false;
};
