import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { of } from 'rxjs';
import { switchMap, take, tap } from 'rxjs/operators';

export const ordersGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.user$.pipe(
    take(1),
    switchMap(user => {
      if (user?.token) {
        return authService.validateToken().pipe(
          tap(isValid => {
            if (!isValid) {
              router.navigate(['/login']);
            }
          })
        );
      } else {
        router.navigate(['/login']);
        return of(false);
      }
    })
  );
};