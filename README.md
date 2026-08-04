### Exercise 5: The Enrollment Form

**Context:** Liya wants to enroll. She needs a form that captures her Student ID, the term, and optional backup course choices. The form must validate inputs before they reach the .NET API.

> [!NOTE]
> **Step 1: Generate the Form Component**
> 
> Scaffold the form feature within your project structure:
> ```bash
> ng generate component features/enrollment-form
> ```

> [!NOTE]
> **Step 2: Build the Form Model**
> 
> Open `src/app/features/enrollment-form/enrollment-form.component.ts`. Construct the reactive form layout utilizing strongly-typed validation controls:
> 
> ```typescript
> import { Component, inject, signal } from "@angular/core";
> import {
>   FormBuilder,
>   FormControl,
>   Validators,
>   ReactiveFormsModule,
>   FormArray,
> } from "@angular/forms";
> 
> @Component({
>   selector: "app-enrollment-form",
>   standalone: true,
>   imports: [ReactiveFormsModule], // Required without this, Angular does not recognize form directives
>   templateUrl: "./enrollment-form.component.html",
> })
> export class EnrollmentFormComponent {
>   // inject(FormBuilder) is Angular's way of requesting a service.
>   private fb = inject(FormBuilder);
>   
>   // A signal to track whether the form was submitted (for showing a success message)
>   submitted = signal(false);
> 
>   // fb.nonNullable.group({...}) ensures that all values are typed as 'string' instead of 'string | null'
>   form = this.fb.nonNullable.group({
>     studentId: [
>       "",
>       [Validators.required, Validators.pattern("^STU-[0-9]{4}\$")],
>     ],
>     courseId: ["", Validators.required],
>     term: ["Fall 2026", Validators.required], // Pre-filled with a default term
>     notes: [""], // No validators this field is optional
>     backupCourses: this.fb.array<FormControl<string>>([]), // Starts empty, user adds rows dynamically
>   });
> 
>   // A shortcut so you can write "this.backups" instead of "this.form.controls.backupCourses"
>   get backups() {
>     return this.form.controls.backupCourses;
>   }
> 
>   // Adds a new empty text input to the backup courses array
>   addBackup() {
>     this.backups.push(
>       this.fb.control("", {
>         nonNullable: true,
>         validators: Validators.required,
>       }),
>     );
>   }
> 
>   // Removes a specific backup course row by its position in the array
>   removeBackup(index: number) {
>     this.backups.removeAt(index);
>   }
> 
>   submit() {
>     if (this.form.valid) {
>       // getRawValue() extracts the full form data as a JSON object, preserving disabled fields.
>       const payload = this.form.getRawValue();
>       console.log("Enrollment payload:", payload);
>       this.submitted.set(true);
>     } else {
>       // markAllAsTouched() forces Angular to show validation errors on every field.
>       this.form.markAllAsTouched();
>     }
>   }
> }
> ```

> [!NOTE]
> **Step 3: Build the Form Template**
> 
> Open `src/app/features/enrollment-form/enrollment-form.component.html`. Implement control flow logic and attach form controls:
> 
> ```html
> <h2>Course Enrollment</h2>
> @if (submitted()) {
>   <div class="success">
>     Enrollment submitted. Check the console for the payload.
>   </div>
> } @else {
>   <!-- [formGroup]="form" connects this <form> tag to the TypeScript form object you built above. -->
>   <form [formGroup]="form" (ngSubmit)="submit()">
>     <label for="studentId">Student ID</label>
>     <input
>       id="studentId"
>       formControlName="studentId"
>       placeholder="e.g. STU-1234"
>     />
>     <!-- Show the error ONLY when the user has clicked into and out of the field (.touched) AND it is invalid -->
>     @if (form.controls.studentId.touched && form.controls.studentId.invalid) {
>       <span class="error">Enter a valid Student ID (format: STU-0000)</span>
>     }
> 
>     <label for="courseId">Course ID</label>
>     <input
>       id="courseId"
>       formControlName="courseId"
>       placeholder="e.g. 1 (TMS course primary key)"
>     />
>     @if (form.controls.courseId.touched && form.controls.courseId.invalid){
>       <span class="error">Course ID is required</span>
>     }
> 
>     <label for="term">Term</label>
>     <input id="term" formControlName="term" />
> 
>     <label for="notes">Notes (optional)</label>
>     <textarea id="notes" formControlName="notes"></textarea>
> 
>     <h3>Backup Courses</h3>
>     <!-- \$index is a built-in variable inside @for loops indicating the current position (0, 1, 2...) -->
>     @for (backup of backups.controls; track \$index) {
>       <div class="backup-row">
>         <!-- [formControl] binds directly to the control object in the array. -->
>         <input
>           [formControl]="backup"
>           [placeholder]="'Backup course ' + (\$index + 1)"
>         />
>         <!-- type="button" prevents this from submitting the form. -->
>         <button type="button" (click)="removeBackup(\$index)">Remove</button>
>       </div>
>     }
>     <button type="button" (click)="addBackup()">Add Backup Course</button>
>     <hr />
>     
>     <!-- Disables the button when ANY field fails validation. -->
>     <button type="submit" [disabled]="form.invalid">Confirm Enrollment</button>
> </form>
> }
> ```

> [!NOTE]
> **Step 4: Route to the Form**
> 
> Open `src/app/app.routes.ts`. Append the enrollment path to your routes configuration array:
> ```typescript
> {
>   path: 'enroll',
>   loadComponent: () => import('./features/enrollment-form/enrollment-form.component')
>     .then(m => m.EnrollmentFormComponent)
> }
> ```
> *Note: Open the form at `http://localhost:4200/enroll`. You can also add a `routerLink="/enroll"` onto the dashboard page layout to make it easy to find.*

#### Troubleshooting & Common Edge Cases
* **Validation messages do not appear:** You are likely checking `.invalid` without checking `.touched`. Angular intentionally skips highlighting pristine (unclicked) fields as errors. Call `.markAllAsTouched()` on form submission.
* **`formGroup` directive not recognized:** Ensure you have added `ReactiveFormsModule` directly into the component class's standalone `imports` array.
* **Template errors when mixing form styles:** Attempting to use two-way syntax `[(ngModel)]` alongside `[formGroup]` triggers explicit framework exceptions. Commit to a single strategy; for this structure, use only Reactive Forms directives (`formControlName`, `[formControl]`).

---

#### Checkpoint 5 Verification Checklist
* [ ] The form renders with Student ID, Course ID, Term, and Notes fields
* [ ] Clicking “Add Backup Course” adds a new dynamic input row
* [ ] Clicking “Remove” drops that specific row from the layout array
* [ ] Submitting with an empty or mistyped Student ID triggers the verification error text block
* [ ] A valid submission packages data and logs the JSON payload to the browser console
