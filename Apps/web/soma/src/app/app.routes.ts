import { Routes } from '@angular/router';

import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/landing/landing').then((m) => m.Landing),
  },

  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login').then((m) => m.Login),
  },

  {
    path: 'signup',
    loadComponent: () =>
      import('./features/auth/signup/signup').then((m) => m.Signup),
  },

  // Student paths
  {
    path: 'student',
    canActivate: [roleGuard('STUDENT')],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/student/dashboard/dashboard').then(
            (m) => m.Dashboard,
          ),
      },
      {
        path: 'ai-tutor',
        loadComponent: () =>
          import('./features/student/ai-tutor/chat/chat').then(
            (m) => m.Chat,
          ),
      },
    ],
  },

  // Teacher paths
  {
    path: 'teacher',
    canActivate: [roleGuard('TEACHER')],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/teacher/dashboard/dashboard').then(
            (m) => m.Dashboard,
          ),
      },
      {
        path: 'content',
        loadComponent: () =>
          import('./features/teacher/content/upload/upload').then(
            (m) => m.Upload,
          ),
      },
    ],
  },

  // Parent paths
  {
    path: 'parent',
    canActivate: [roleGuard('PARENT')],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/parents/dashboard/dashboard').then(
            (m) => m.Dashboard,
          ),
      },
    ],
  },

  // Admin paths
  {
    path: 'admin',
    canActivate: [roleGuard('ADMIN')],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/admin/dashboard/dashboard').then(
            (m) => m.Dashboard,
          ),
      },
      {
        path: 'onboard',
        loadComponent: () =>
          import('./features/admin/onboarding/onboarding').then(
            (m) => m.Onboarding,
          ),
      },
    ],
  },

  // Super Admin paths
  {
    path: 'superadmin',
    canActivate: [roleGuard('SUPER_ADMIN')],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/superAdmin/dashboard/dashboard').then(
            (m) => m.Dashboard,
          ),
      },
      {
        path: 'schools/onboard',
        loadComponent: () =>
          import(
            './features/superAdmin/school-onboarding/school-onboarding'
          ).then((m) => m.SchoolOnboarding),
      },
    ],
  },

  // Platform Super Admin sign-in
  {
    path: 'platform-admin',
    data: {
      superAdmin: true,
    },
    loadComponent: () =>
      import('./features/auth/login/login').then((m) => m.Login),
  },

  // Fallback
  {
    path: '**',
    redirectTo: '',
  },
];