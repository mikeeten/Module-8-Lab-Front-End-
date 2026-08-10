import { Component, signal, computed, inject } from "@angular/core";
import { CourseCardComponent } from "../../ui/course-card/course-card.component";
import { rxResource } from "@angular/core/rxjs-interop";
import { CourseService } from "../../services/course.service";
import { Course } from "../../models/course.model";

@Component({
  selector: "app-student-dashboard",
  standalone: true,
  imports: [CourseCardComponent],
  templateUrl: "./student-dashboard.component.html",
  styleUrls: ["./student-dashboard.component.scss"],   // ✅ plural
})
export class StudentDashboardComponent {
  private api = inject(CourseService);

  studentName = signal("Liya Kebede");
  earnedCredits = signal(45);

  graduationStatus = computed(() =>
    this.earnedCredits() >= 120 ? "Eligible for Graduation" : "In Progress"
  );

  // ✅ use stream (supported in your Angular version)
  coursesResource = rxResource({
    stream: () => this.api.getAll(),
  });

  selectedCourse = signal<Course | null>(null);

  handleEnroll(course: Course) {
    this.selectedCourse.set(course);
    console.log("Enrollment requested for:", course.title);
  }
}
