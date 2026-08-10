import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { map } from "rxjs/operators";
import { Course, PagedResponse, CourseDetailDto } from "../models/course.model";

@Injectable({ providedIn: 'root' })   // ✅ globally available
export class CourseService {
  private http = inject(HttpClient);
  private baseUrl = "http://localhost:5159/api/courses";

  // Get all courses with paging
  getAll(page = 1, pageSize = 50) {
    return this.http
      .get<PagedResponse<Course>>(this.baseUrl, {
        params: { page: page.toString(), pageSize: pageSize.toString() },
      })
      .pipe(map((p) => p.items));
  }

  // Get course by ID
  getById(id: string) {
    return this.http.get<CourseDetailDto>(`${this.baseUrl}/${id}`);
  }
}
