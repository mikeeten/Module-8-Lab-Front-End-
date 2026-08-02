import { Component, signal } from "@angular/core";
import { NgFor, NgIf } from "@angular/common";
import { CourseCardComponent } from "../../ui/course-card/course-card.component";
import { Course } from "../../models/course.model";

@Component({
  selector: "app-student-dashboard",
  standalone: true,
  imports: [CourseCardComponent, NgFor, NgIf],
  templateUrl: "./student-dashboard.component.html",
  styleUrl: "./student-dashboard.component.scss",
})
export class StudentDashboardComponent {
  selectedCourse = signal<Course | null>(null);

  // Array of courses instead of a single one
  courses: Course[] = [
    {
      id: 1,
      title: "Advanced Java Services",
      code: "CSE-101",
      maxCapacity: 30,
      enrollmentCount: 12,
    },
    {
      id: 2,
      title: "Angular Fundamentals",
      code: "WEB-201",
      maxCapacity: 25,
      enrollmentCount: 25, // full
    },
    {
      id: 3,
      title: "Database Systems",
      code: "DB-301",
      maxCapacity: 40,
      enrollmentCount: 5,
    },
  ];

  handleEnroll(course: Course) {
    this.selectedCourse.set(course);
    console.log("Enrollment requested for:", course.title);
  }
}
