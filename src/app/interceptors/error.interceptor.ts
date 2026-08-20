import { HttpErrorResponse } from '@angular/common/http';
import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      // Extract ProblemDetails "detail" property
      const detailMessage = err.error?.detail ?? 'A system error occurred. Please try again.';

      if (err.status === 401) {
        // Redirect expired/unauthenticated sessions
        router.navigate(['/login']);
      } else {
        // Log structured error
        console.error('API Error Response:', detailMessage);
      }

      return throwError(() => err);
    })
  );
};
