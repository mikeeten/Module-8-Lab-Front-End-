import { Component, signal } from "@angular/core";
import { CourseCardComponent } from "../../ui/course-card/course-card.component";
import { Course } from "../../models/course.model";

@Component({
  selector: "app-student-dashboard",
  standalone: true,
  imports: [CourseCardComponent],
  templateUrl: "./student-dashboard.component.html",
  styleUrl: "./student-dashboard.component.scss",
})
export class StudentDashboardComponent {
  selectedCourse = signal<Course | null>(null);

  sampleCourse: Course = {
    id: 1,
    title: "Advanced Java Services",
    code: "CSE-101",
    maxCapacity: 30,
    enrollmentCount: 30,
  };

  handleEnroll(course: Course) {
    this.selectedCourse.set(course);
    console.log("Enrollment requested for:", course.title);
  }
}
