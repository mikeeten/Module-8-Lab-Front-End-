import '@angular/compiler';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Injector, runInInjectionContext } from '@angular/core';
import { HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { jwtInterceptor } from './jwt.interceptor';
import { of } from 'rxjs';

describe('jwtInterceptor', () => {
  let mockAuthService: { getAccessToken: any };
  let injector: Injector;

  beforeEach(() => {
    mockAuthService = {
      getAccessToken: vi.fn()
    };

    injector = Injector.create({
      providers: [
        { provide: AuthService, useValue: mockAuthService }
      ]
    });
  });

  it('should attach Authorization header when access token is present', () => {
    mockAuthService.getAccessToken.mockReturnValue('my-jwt-token');

    const req = new HttpRequest('GET', '/api/courses');
    const next: HttpHandlerFn = (clonedReq) => {
      expect(clonedReq.headers.get('Authorization')).toBe('Bearer my-jwt-token');
      return of({} as any);
    };

    runInInjectionContext(injector, () => {
      jwtInterceptor(req, next);
    });
  });

  it('should not attach Authorization header when access token is null', () => {
    mockAuthService.getAccessToken.mockReturnValue(null);

    const req = new HttpRequest('GET', '/api/courses');
    const next: HttpHandlerFn = (clonedReq) => {
      expect(clonedReq.headers.has('Authorization')).toBe(false);
      return of({} as any);
    };

    runInInjectionContext(injector, () => {
      jwtInterceptor(req, next);
    });
  });
});

