### Exercise 3: Loops, Conditionals, and the Empty State

**Context:** You have a single card working. Now you need a catalog of courses, and you must explicitly handle the case where there are no courses available using Angular's modern built-in control flow blocks.

> [!NOTE]
> **Step 1: Create the Catalog Dataset**
> 
> Open `src/app/features/student-dashboard/student-dashboard.component.ts`. Replace your singular `sampleCourse` property with a reactive array signal:
> ```typescript
> availableCourses = signal<Course[]>([
>   {
>     id: 1,
>     title: "Advanced Java Services",
>     code: "CSE-101",
>     maxCapacity: 30,
>     enrollmentCount: 10,
>   },
>   {
>     id: 2,
>     title: "Angular UI Lab",
>     code: "CSE-210",
>     maxCapacity: 25,
>     enrollmentCount: 25,
>   },
>   {
>     id: 3,
>     title: "Database Design",
>     code: "CSE-305",
>     maxCapacity: 20,
>     enrollmentCount: 18,
>   },
>   {
>     id: 4,
>     title: "API Security Workshop",
>     code: "CSE-420",
>     maxCapacity: 40,
>     enrollmentCount: 15,
>   },
> ]);
> ```

> [!NOTE]
> **Step 2: Render the Control Flow Template Loop**
> 
> *Required Cleanup:* Exercise 2 left a single `<tms-course-card>` bound to `sampleCourse`. Remove that extra `<h2>` and the single `<tms-course-card [course]="sampleCourse" .../>` from your HTML file to prevent redundant rendering. You can safely delete the unused `sampleCourse` property from your TypeScript class once no code references it.
> 
> Open `src/app/features/student-dashboard/student-dashboard.component.html`. Replace the old catalog markup with Angular's modern structural control blocks:
> ```html
> <h2>Course Catalog</h2>
> 
> @if (availableCourses().length === 0) {
>   <div class="empty-state">
>     <p>No courses are available this term. Check back during registration.</p>
>   </div>
> } @else {
>   <div class="grid">
>     @for (course of availableCourses(); track course.id) {
>       <tms-course-card [course]="course" (enrollClicked)="handleEnroll(\$event)" />
>     } @empty {
>       <p>No results match your search.</p>
>     }
>   </div>
> }
> 
> @if (selectedCourse(); as picked) {
>   <p class="selection-hint" role="status">
>     Last enrollment request: <strong>{{ picked.title }}</strong> ({{ picked.code }})
>   </p>
> }
> ```
> 
> **Core Declarative Syntax Rules Explained:**
> * `track course.id`: This statement is **mandatory** inside the `@for` block. It establishes a unique identity anchor for every item, allowing Angular to track DOM nodes efficiently during list modifications. Omitting the `track` parameter causes a compilation error.
> * `@empty`: A built-in sub-block that renders automatically if the collection array evaluated by the `@for` loop contains zero elements.
> * `selectedCourse(); as picked`: Evaluates the signal and assigns its current non-null value to a local template variable (`picked`). This visual feedback explicitly proves the parent component successfully caught the emitted child event.
