import { Component, OnInit, inject } from '@angular/core';
import { EnrollmentStore } from './store/enrollment.store';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>',
  standalone: true,
  imports: [RouterOutlet]
})
export class AppComponent {
  private store = inject(EnrollmentStore);

  ngOnInit() {
    this.store.loadEnrollments();
    this.store.listenForLiveUpdates();
  }
}