import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService, UserRole } from '../services/auth.service';

export const roleGuard = (...allowed: UserRole[]): CanActivateFn => () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const role = auth.role();
  if (!role) return router.createUrlTree(['/login']);
  return allowed.includes(role) ? true : router.createUrlTree([auth.homeRoute()]);
};