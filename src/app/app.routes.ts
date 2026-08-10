import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/instructor-dashboard/instructor-dashboard.component')
        .then(m => m.InstructorDashboardComponent)
  },
  {
    path: 'enrollments',
    loadComponent: () =>
      import('./features/enrollment-list/enrollment-list.component')
        .then(m => m.EnrollmentListComponent)
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];

