import "@angular/compiler";
import { describe, it, expect } from "vitest";
import { UnauthorizedComponent } from "./unauthorized";

describe("UnauthorizedComponent", () => {
  it("should create", () => {
    const component = new UnauthorizedComponent();
    expect(component).toBeTruthy();
  });
});
