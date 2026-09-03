import "@angular/compiler";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { Injector, runInInjectionContext } from "@angular/core";
import { AdminCourseListComponent } from "./admin-course-list";
import { AuthService } from "../app/services/auth.service";

describe("AdminCourseListComponent", () => {
  let component: AdminCourseListComponent;
  let mockAuth: any;

  beforeEach(() => {
    mockAuth = { hasRole: vi.fn() };
    const injector = Injector.create({
      providers: [{ provide: AuthService, useValue: mockAuth }]
    });
    component = runInInjectionContext(injector, () => new AdminCourseListComponent());
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
