import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';import { firstValueFrom } from 'rxjs';
import { environment } from '../environments/environment.development';


export interface TmsUser {
  displayName: string;
  role: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  currentUser = signal<TmsUser | null>(null);

  hasRole(role: string): boolean {
    const user = this.currentUser();
    return user?.role === role || user?.role === 'Admin';
  }

  async login(credentials: LoginRequest) {
    // HttpOnly cookie set by server
  await firstValueFrom(
  this.http.post<void>(`${environment.apiUrl}/v1/auth/login`, credentials)
);

    // Fetch authenticated profile (cookie sent automatically)
    const user = await firstValueFrom(
      this.http.get<TmsUser>(`${environment.apiUrl}/v1/auth/me`)
    );
    this.currentUser.set(user);
  }
}


