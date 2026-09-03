import { Component, inject } from '@angular/core';
import { AuthService } from '../app/services/auth.service';

@Component({
  selector: 'app-admin-course-list',
  standalone: true,
  imports: [],
  templateUrl: './admin-course-list.html',
  styleUrl: './admin-course-list.scss',
})
export class AdminCourseListComponent {
  auth = inject(AuthService);

  course = { id: 1, title: 'Sample Course' };

  deleteCourse(id: number | string) {
    console.log('Deleting course ID:', id);
  }
}

export { AdminCourseListComponent as AdminCourseList };
