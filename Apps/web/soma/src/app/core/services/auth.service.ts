import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../environments/environment';

export type UserRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'TEACHER'
  | 'STUDENT'
  | 'PARENT';

export interface SessionUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  adminLevel: 'PRINCIPAL' | 'STAFF' | 'ACADEMIC' | null;
}

export interface SessionSchool {
  name: string;
  schoolCode: string;
}

const TOKEN_KEY = 'soma_access_token';

const HOME_ROUTES: Record<UserRole, string> = {
  SUPER_ADMIN: '/superadmin',
  ADMIN: '/admin',
  TEACHER: '/teacher',
  STUDENT: '/student',
  PARENT: '/parent',
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly api = environment.apiUrl;

  readonly currentUser = signal<SessionUser | null>(null);
  readonly currentSchool = signal<SessionSchool | null>(null);

  readonly isAuthenticated = computed(
    () => this.currentUser() !== null,
  );

  readonly role = computed(
    () => this.currentUser()?.role ?? null,
  );

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  homeRoute(): string {
    const role = this.role();

    return role ? HOME_ROUTES[role] : '/login';
  }

  async login(
    schoolCode: string,
    email: string,
    password: string,
  ): Promise<void> {
    const res = await firstValueFrom(
      this.http.post<{ accessToken: string }>(
        `${this.api}/auth/login`,
        {
          schoolCode,
          email,
          password,
        },
      ),
    );

    localStorage.setItem(TOKEN_KEY, res.accessToken);

    await this.loadProfile();
  }

  async superAdminLogin(
    email: string,
    password: string,
  ): Promise<void> {
    const res = await firstValueFrom(
      this.http.post<{ accessToken: string }>(
        `${this.api}/auth/super-admin/login`,
        {
          email,
          password,
        },
      ),
    );

    localStorage.setItem(TOKEN_KEY, res.accessToken);

    await this.loadProfile();
  }

  /**
   * Called once at app startup so a page refresh
   * doesn't log the user out.
   */
  async restoreSession(): Promise<void> {
    if (!this.getToken()) {
      return;
    }

    try {
      await this.loadProfile();
    } catch {
      this.clearSession();
    }
  }

  logout(): void {
    this.clearSession();
    void this.router.navigate(['/login']);
  }

  clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.currentUser.set(null);
    this.currentSchool.set(null);
  }

  private async loadProfile(): Promise<void> {
    const profile = await firstValueFrom(
      this.http.get<{
        user: SessionUser;
        school: SessionSchool | null;
      }>(`${this.api}/auth/me`),
    );

    this.currentUser.set(profile.user);
    this.currentSchool.set(profile.school);
  }
}