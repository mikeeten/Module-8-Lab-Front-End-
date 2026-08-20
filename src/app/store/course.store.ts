import { inject } from '@angular/core';
import { signalStore, patchState, withMethods } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import { CourseService } from '../services/course.service';
import { Course } from '../models/course.model';

export interface CourseState {
  entities: Record<string, Course>;
  ids: string[];
}

export const CourseStore = signalStore(
  // Use withMethods only — initial state is set via patchState
  withMethods((store, svc = inject(CourseService)) => ({
    async init() {
      // initialize empty state
      patchState(store, { entities: {}, ids: [] });
    },

    async loadCourses() {
      const courses = await firstValueFrom(svc.getAll());

      patchState(store, {
        entities: courses.reduce((acc, c) => ({ ...acc, [c.id]: c }), {}),
        ids: courses.map(c => c.id)
      });
    },

    async deleteCourse(id: string) {
      // Snapshot current state for rollback
      const previousEntities = { ...(store as any)['entities'] };
      const previousIds = [ ...(store as any)['ids'] ];

      // Optimistically remove entity
      patchState(store, (state: any) => {
        const { [id]: removed, ...remaining } = state['entities'];
        return {
          entities: remaining,
          ids: state['ids'].filter((existingId: string) => existingId !== id)
        };
      });

      try {
        await firstValueFrom(svc.delete(id));
        console.log(`Course ${id} deleted successfully`);
      } catch (err) {
        // Rollback on error
        patchState(store, {
          entities: previousEntities,
          ids: previousIds
        });
        console.error(`Delete failed for course ${id}, rolled back`, err);
      }
    }
  }))
);
