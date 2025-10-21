import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { of } from 'rxjs';
import { finalize, switchMap, take, tap } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';

export const ordersGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const loading = inject(LoadingService);

  loading.show();

  return authService.user$.pipe(
    take(1),
    switchMap(user => {
      if (user?.token) {
        return authService.validateToken().pipe(
          tap(isValid => {
            if (!isValid) {
              router.navigate(['/login']);
            }
          }),
          finalize(() => loading.hide())
        );
      } else {
        loading.hide();
        router.navigate(['/login']);
        return of(false);
      }
    })
  );
};