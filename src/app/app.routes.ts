import { Routes } from "@angular/router";
import { StudentDashboardComponent } from "./features/student-dashboard/student-dashboard.component";

export const routes: Routes = [
  { path: "", component: StudentDashboardComponent },
  { path: "dashboard", component: StudentDashboardComponent }, // ✅ add this
  {
    path: "courses/:id",
    loadComponent: () =>
      import("./features/course-detail/course-detail.component").then(
        (m) => m.CourseDetailComponent
      ),
  },
];
