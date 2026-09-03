import { Component, input, output, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import { Course } from "../../models/course.model";
import { AuthService } from "../../../services/auth.service";

@Component({
  selector: "tms-course-card",
  standalone: true,
  imports: [RouterLink],
  templateUrl: "./course-card.component.html",
  styleUrl: "./course-card.component.scss",
})
export class CourseCardComponent {
  auth = inject(AuthService);
  course = input.required<Course>();
  enrollClicked = output<Course>();
  deleteClicked = output<string | number>();

  deleteCourse(id: string | number): void {
    this.deleteClicked.emit(id);
  }
}

