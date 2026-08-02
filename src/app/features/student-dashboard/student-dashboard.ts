import { Component, signal, computed } from "@angular/core";

@Component({
  selector: "app-student-dashboard",
  standalone: true,
  templateUrl: "./student-dashboard.component.html",
  styleUrl: "./student-dashboard.component.scss",
})
export class StudentDashboardComponent {
  // A reactive signal for the student’s name
  studentName = signal("Liya Kebede");

  // A reactive signal for earned credits
  earnedCredits = signal(45);

  // A computed signal that derives graduation status from earnedCredits
  graduationStatus = computed(() =>
    this.earnedCredits() >= 120 ? "Eligible for Graduation" : "In Progress"
  );

  // A method to increment credits by 3 when registering for a class
  registerForClass() {
    this.earnedCredits.update((c) => c + 3);
  }
}
