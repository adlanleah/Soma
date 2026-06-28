import { Component, signal, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import {
  LucideDynamicIcon,
  LucideBookOpen,
  LucideGraduationCap,
  LucideUsers,
  LucideShield,
  LucideBuilding2,
  LucideEye,
  LucideEyeOff,
  type LucideIconInput,
} from '@lucide/angular';

type UserRole = 'teacher' | 'student' | 'parent' | 'admin' | 'superadmin';

interface RoleConfig {
  label: string;
  icon: LucideIconInput;
  description: string;
}


@Component({
  selector: 'app-login',
  imports: [RouterLink, ReactiveFormsModule, LucideDynamicIcon],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
   private router = inject(Router);

  // Icons
  readonly BookOpenIcon = LucideBookOpen;
  readonly GraduationCapIcon = LucideGraduationCap;
  readonly UsersIcon = LucideUsers;
  readonly ShieldIcon = LucideShield;
  readonly Building2Icon = LucideBuilding2;
  readonly EyeIcon = LucideEye;
  readonly EyeOffIcon = LucideEyeOff;

  // State signals
  selectedRole = signal<UserRole>('student');
  showPassword = signal(false);
  isLoading = signal(false);
  showAdminOptions = signal(false);

  // Data
  readonly mainRoles: UserRole[] = ['teacher', 'student', 'parent', 'admin'];
  readonly adminRoles: UserRole[] = ['admin', 'superadmin'];

  readonly roleConfig: Record<UserRole, RoleConfig> = {
    teacher: {
      label: 'Teacher',
      icon: LucideBookOpen,
      description: 'Create and manage lessons',
    },
    student: {
      label: 'Student',
      icon: LucideGraduationCap,
      description: 'Access your learning portal',
    },
    parent: {
      label: 'Parent',
      icon: LucideUsers,
      description: "Monitor your child's progress",
    },
    admin: {
      label: 'Admin',
      icon: LucideShield,
      description: 'Manage school operations',
    },
    superadmin: {
      label: 'Super Admin',
      icon: LucideBuilding2,
      description: 'Platform administration',
    },
  };

  readonly roleRoutes: Record<UserRole, string> = {
    teacher: '/teacher',
    student: '/student',
    parent: '/parent',
    admin: '/admin',
    superadmin: '/superadmin',
  };

  readonly stats = [
    { value: '500+', label: 'Schools' },
    { value: '50K+', label: 'Students' },
    { value: '10K+', label: 'Lessons Created' },
  ];

  // Reactive Form
  loginForm = new FormGroup({
    email: new FormControl('demo@uglearner.app', [Validators.required, Validators.email]),
    password: new FormControl('password123', [Validators.required]),
    rememberMe: new FormControl(false),
  });

  // Getters
  get emailInvalid(): boolean {
    const c = this.loginForm.get('email');
    return !!(c?.invalid && c?.touched);
  }

  get passwordInvalid(): boolean {
    const c = this.loginForm.get('password');
    return !!(c?.invalid && c?.touched);
  }

  // Methods
  selectRole(role: UserRole): void {
    this.selectedRole.set(role);
  }

  toggleAdminOptions(): void {
    const isAdminSelected = this.selectedRole() === 'admin' || this.selectedRole() === 'superadmin';
    if (isAdminSelected) {
      this.selectedRole.set('student');
      this.showAdminOptions.set(false);
    } else {
      this.showAdminOptions.set(!this.showAdminOptions());
    }
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.isLoading.set(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    this.isLoading.set(false);
    this.router.navigate([this.roleRoutes[this.selectedRole()]]);
  }
}
