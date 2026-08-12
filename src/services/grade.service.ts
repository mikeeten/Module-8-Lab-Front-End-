import { Injectable,inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface GradePayload {
  studentId: number;
  courseId: number;
  score: number;
}

@Injectable({ providedIn: 'root' })

export class GradeService {
  private http = inject(HttpClient);

  postGrade(payload: GradePayload): Observable<{ id: string; success: boolean }> {
    return this.http.post<{ id: string; success: boolean }>('/api/grades', payload);
  }
}
// function Service(): (target: typeof GradeService) => void | typeof GradeService {
//   // Simple class decorator that returns the original constructor unchanged.
//   // Keeps compatibility with the @Service() usage in this file.
//   return function (target: typeof GradeService): typeof GradeService {
//     return target;
//   };
// }

