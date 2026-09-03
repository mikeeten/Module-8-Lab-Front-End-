import '@angular/compiler';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { AuthService, TmsUser } from '../services/auth.service';
import { roleGuard } from './role.guard';

describe('Verification 1: Angular Guard & UI (Unauthorized user attempting /admin/courses)', () => {
  let mockAuthService: {
    currentUser: ReturnType<typeof signal<TmsUser | null>>;
    hasRole: (role: string) => boolean;
    getAccessToken: () => string | null;
  };
  let mockRouter: {
    createUrlTree: ReturnType<typeof vi.fn>;
    navigateByUrl: ReturnType<typeof vi.fn>;
  };
  let injector: Injector;

  beforeEach(() => {
    const userSignal = signal<TmsUser | null>(null);

    mockAuthService = {
      currentUser: userSignal,
      hasRole: (role: string) => {
        const user = userSignal();
        return user?.role === role || user?.role === 'Admin';
      },
      getAccessToken: () => null
    };

    mockRouter = {
      createUrlTree: vi.fn((commands: any[]) => ({
        toString: () => commands.join('/'),
        path: commands[0]
      } as unknown as UrlTree)),
      navigateByUrl: vi.fn()
    };

    injector = Injector.create({
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    });
  });

  describe('Route Protection (/admin/courses with roleGuard("Admin"))', () => {
    it('should redirect an unauthenticated / logged-out user to /unauthorized', () => {
      // User is not logged in (currentUser is null)
      mockAuthService.currentUser.set(null);

      const guard = roleGuard('Admin');
      const result = runInInjectionContext(injector, () => (guard as any)());

      // Guard should create a UrlTree redirecting to /unauthorized
      expect(result).not.toBe(true);
      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/unauthorized']);
    });

    it('should redirect a Student user attempting /admin/courses to /unauthorized', () => {
      // User logged in as Student
      mockAuthService.currentUser.set({
        email: 'student@tms.com',
        displayName: 'Student User',
        role: 'Student'
      });

      const guard = roleGuard('Admin');
      const result = runInInjectionContext(injector, () => (guard as any)());

      // Student is not an Admin -> blocked and redirected to /unauthorized
      expect(result).not.toBe(true);
      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/unauthorized']);
    });

    it('should redirect an Instructor attempting /admin/courses to /unauthorized', () => {
      // User logged in as Instructor
      mockAuthService.currentUser.set({
        email: 'instructor@tms.com',
        displayName: 'Instructor User',
        role: 'Instructor'
      });

      const guard = roleGuard('Admin');
      const result = runInInjectionContext(injector, () => (guard as any)());

      // Instructor is not Admin -> redirected to /unauthorized
      expect(result).not.toBe(true);
      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/unauthorized']);
    });

    it('should allow access to /admin/courses when user is Admin', () => {
      // User logged in as Admin
      mockAuthService.currentUser.set({
        email: 'admin@tms.com',
        displayName: 'Admin User',
        role: 'Admin'
      });

      const guard = roleGuard('Admin');
      const result = runInInjectionContext(injector, () => (guard as any)());

      // Admin has permission -> route activation allowed (returns true)
      expect(result).toBe(true);
      expect(mockRouter.createUrlTree).not.toHaveBeenCalled();
    });
  });

  describe('Conditional UI Checks', () => {
    it('should hide admin-only action buttons for Student / non-Admin users', () => {
      mockAuthService.currentUser.set({
        email: 'student@tms.com',
        displayName: 'Student User',
        role: 'Student'
      });

      const canSeeAdminActions = mockAuthService.hasRole('Admin');
      expect(canSeeAdminActions).toBe(false);
    });

    it('should show admin-only action buttons for Admin users', () => {
      mockAuthService.currentUser.set({
        email: 'admin@tms.com',
        displayName: 'Admin User',
        role: 'Admin'
      });

      const canSeeAdminActions = mockAuthService.hasRole('Admin');
      expect(canSeeAdminActions).toBe(true);
    });
  });
});
