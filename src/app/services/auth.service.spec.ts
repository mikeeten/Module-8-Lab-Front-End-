import '@angular/compiler';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Injector, runInInjectionContext } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService, LoginRequest } from './auth.service';
import { of } from 'rxjs';

describe('AuthService', () => {
  let authService: AuthService;
  let mockHttpClient: { post: any };

  beforeEach(() => {
    mockHttpClient = {
      post: vi.fn()
    };

    const injector = Injector.create({
      providers: [
        { provide: HttpClient, useValue: mockHttpClient }
      ]
    });

    authService = runInInjectionContext(injector, () => new AuthService());
  });

  it('should initialize with null token and null user', () => {
    expect(authService.getAccessToken()).toBeNull();
    expect(authService.currentUser()).toBeNull();
  });

  it('should return true for hasRole if user matches required role', () => {
    authService.currentUser.set({
      email: 'instructor@tms.com',
      displayName: 'Instructor User',
      role: 'Instructor'
    });

    expect(authService.hasRole('Instructor')).toBe(true);
    expect(authService.hasRole('Student')).toBe(false);
  });

  it('should return true for hasRole for any required role if user is Admin', () => {
    authService.currentUser.set({
      email: 'admin@tms.com',
      displayName: 'Admin User',
      role: 'Admin'
    });

    expect(authService.hasRole('Instructor')).toBe(true);
    expect(authService.hasRole('Student')).toBe(true);
    expect(authService.hasRole('Admin')).toBe(true);
  });

  it('should login, set accessToken, and decode claims into currentUser', async () => {
    const payload = {
      email: 'john@tms.com',
      name: 'John Doe',
      'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': 'Instructor'
    };
    const base64Payload = btoa(JSON.stringify(payload));
    const fakeToken = `header.${base64Payload}.signature`;

    mockHttpClient.post.mockReturnValue(of({ accessToken: fakeToken, refreshToken: 'refresh-123' }));

    const credentials: LoginRequest = { email: 'john@tms.com', password: 'Password123!' };
    await authService.login(credentials);

    expect(authService.getAccessToken()).toBe(fakeToken);
    expect(authService.currentUser()).toEqual({
      email: 'john@tms.com',
      displayName: 'John Doe',
      role: 'Instructor'
    });
  });

  it('should clear token and user on logout', () => {
    authService.currentUser.set({
      email: 'user@tms.com',
      displayName: 'User',
      role: 'Student'
    });
    (authService as any).accessToken.set('token123');

    authService.logout();

    expect(authService.getAccessToken()).toBeNull();
    expect(authService.currentUser()).toBeNull();
  });
});

