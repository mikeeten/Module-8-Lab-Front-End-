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
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'grade-submission',
    loadComponent: () =>
      import('./features/grade-submission/grade-submission.component')
        .then(m => m.GradeSubmissionComponent)
  },
  {
    path: 'student-dashboard',
    loadComponent: () =>
      import('./features/student-dashboard/student-dashboard.component')
        .then(m => m.StudentDashboardComponent)
  },
  {
    path: 'login',
    loadComponent: () =>
      import('../login/login/login.component')
        .then(m => m.LoginComponent)
  }
];

