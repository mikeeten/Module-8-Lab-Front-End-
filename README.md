### Exercise 2: Breaking the Monolith: Component Communication

**Context:** Your dashboard should not contain 500 lines of HTML for every feature. You need a modular `CourseCardComponent` that knows how to display exactly one course and securely notify the parent component whenever a user executes an enrollment command.

> [!NOTE]
> **Step 1: Generate the Card Component**
> 
> Execute the Angular CLI schematic tool to scaffold a reusable UI component:
> ```bash
> ng generate component ui/course-card
> ```

> [!NOTE]
> **Step 2: Define the Component Contract**
> 
> Open `src/app/ui/course-card/course-card.component.ts`. Establish your inputs and outputs using modern Signal-based API contracts:
> ```typescript
> import { Component, input, output } from "@angular/core";
> import { Course } from "../../models/course.model";
> 
> @Component({
>   selector: "tms-course-card",
>   standalone: true,
>   imports: [],
>   templateUrl: "./course-card.component.html",
>   styleUrl: "./course-card.component.scss",
> })
> export class CourseCardComponent {
>   course = input.required<Course>();
>   enrollClicked = output<Course>();
> }
> ```
> *Component Interface Architecture:*
> * `input.required<Course>()`: Declares a mandatory boundary parameter. If a parent template omits this property, the compiler throws an error immediately rather than risking a runtime crash.
> * `output<Course>()`: Declares an event stream. The parent template listens to this outbound signal exactly like a native DOM click event.
> * `selector: "tms-course-card"`: The custom HTML tag name utilized in parent templates (`<tms-course-card>`). The `tms-` prefix prevents collisions with native elements.

> [!NOTE]
> **Step 3: Build the Card Template**
> 
> Open `src/app/ui/course-card/course-card.component.html`. Declare structural elements and property bindings to reflect your API's capacity fields:
> ```html
> <div class="card">
>   <h3>{{ course().title }} ({{ course().code }})</h3>
>   <p>
>     Enrolled {{ course().enrollmentCount }} of {{ course().maxCapacity }} seats
>   </p>
>   <span 
>     class="badge" 
>     [class.closed]="course().enrollmentCount >= course().maxCapacity">
>     {{ course().enrollmentCount >= course().maxCapacity ? "Full" : "Accepting enrollments" }}
>   </span>
>   <button 
>     (click)="enrollClicked.emit(course())" 
>     [disabled]="course().enrollmentCount >= course().maxCapacity">
>     Enroll
>   </button>
> </div>
> ```
> *Template Compilation Features:*
> * `course().title`: Because the input is a signal, you evaluate it using `()` to unpack the current immutable state before accessing fields.
> * `[class.closed]`: Square brackets denote a property binding. When the capacity limit is breached, the class is added dynamically.
> * `enrollClicked.emit(course())`: Intercepts the native click and dispatches the reactive object back up the component graph.

> [!NOTE]
> **Step 4: Use the Card in the Dashboard**
> 
> Open `src/app/features/student-dashboard/student-dashboard.component.ts`. Update your standalone imports array, seed mock metrics, and declare an enrollment event receiver method:
> ```typescript
> import { Component, signal, computed } from "@angular/core";
> import { CourseCardComponent } from "../../ui/course-card/course-card.component";
> import { Course } from "../../models/course.model";
> 
> @Component({
>   selector: "app-student-dashboard",
>   standalone: true,
>   imports: [CourseCardComponent], // Registers the child dependency explicitly
>   templateUrl: "./student-dashboard.component.html",
>   styleUrl: "./student-dashboard.component.scss"
> })
> export class StudentDashboardComponent {
>   studentName = signal("Liya Kebede");
>   earnedCredits = signal(45);
>   
>   selectedCourse = signal<Course | null>(null);
>   
>   sampleCourse: Course = {
>     id: 1,
>     title: "Advanced Java Services",
>     code: "CSE-101",
>     maxCapacity: 30,
>     enrollmentCount: 12,
>   };
> 
>   graduationStatus = computed(() =>
>     this.earnedCredits() >= 120 ? "Eligible for Graduation" : "In Progress",
>   );
> 
>   registerForClass() {
>     this.earnedCredits.update((c) => c + 3);
>   }
> 
>   handleEnroll(course: Course) {
>     this.selectedCourse.set(course);
>     console.log("Enrollment requested for:", course.title);
>   }
> }
> ```
> *Warning: If you utilize `<tms-course-card>` in an HTML template without adding `CourseCardComponent` to the standalone `imports` array, Angular cannot resolve the node and will treat it as a dead text node without generating an exception.*
> 
> Open `src/app/features/student-dashboard/student-dashboard.component.html` and append the card below your existing content:
> ```html
> <h2>Available Courses</h2>
> <tms-course-card 
>   [course]="sampleCourse" 
>   (enrollClicked)="handleEnroll(\$event)" />
> ```
> *Template Integration Plumbing:*
> * `[course]="sampleCourse"`: Property binding maps data from the parent down into the child's required input parameter.
> * `(enrollClicked)="handleEnroll(\$event)"`: Event binding hooks the child's emitter into the parent handler logic. The special `$event` variable captures the exact payload data dispatched from the card component.
