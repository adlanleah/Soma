import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import {
  LucideBookOpen,
  LucideEye,
  LucideEyeOff,
} from '@lucide/angular';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    LucideEye,
    LucideEyeOff
],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // Platform Super Admin login
  readonly isSuperAdmin =
    this.route.snapshot.data['superAdmin'] === true;

  readonly sessionExpired =
    this.route.snapshot.queryParamMap.get('expired') === '1';

  // Icons
  readonly BookOpenIcon = LucideBookOpen;
  readonly EyeIcon = LucideEye;
  readonly EyeOffIcon = LucideEyeOff;

  // UI state
  showPassword = signal(false);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  // Statistics displayed on the branding panel
  readonly stats = [
    { value: '500+', label: 'Schools' },
    { value: '50K+', label: 'Students' },
    { value: '10K+', label: 'Lessons Created' },
  ];

  // Login form
  loginForm = new FormGroup({
    schoolCode: new FormControl(
      '',
      this.isSuperAdmin ? [] : [Validators.required],
    ),

    email: new FormControl('', [
      Validators.required,
      Validators.email,
    ]),

    password: new FormControl('', [
      Validators.required,
    ]),
  });

  // Validation helpers
  get schoolCodeInvalid(): boolean {
    const control = this.loginForm.get('schoolCode');

    return !!(
      control?.invalid &&
      control?.touched
    );
  }

  get emailInvalid(): boolean {
    const control = this.loginForm.get('email');

    return !!(
      control?.invalid &&
      control?.touched
    );
  }

  get passwordInvalid(): boolean {
    const control = this.loginForm.get('password');

    return !!(
      control?.invalid &&
      control?.touched
    );
  }

  // Login
  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const {
      schoolCode,
      email,
      password,
    } = this.loginForm.getRawValue();

    try {
      if (this.isSuperAdmin) {
        // Super Admin does NOT use a school code.
        await this.auth.superAdminLogin(
          email!.trim().toLowerCase(),
          password!,
        );
      } else {
        // Normal school users must provide a school code.
        await this.auth.login(
          schoolCode!.trim().toUpperCase(),
          email!.trim().toLowerCase(),
          password!,
        );
      }

      // AuthService determines the destination from
      // the authenticated user's actual backend role.
      await this.router.navigateByUrl(
        this.auth.homeRoute(),
      );
    } catch (err: unknown) {
      this.errorMessage.set(
        this.toMessage(err),
      );
    } finally {
      this.isLoading.set(false);
    }
  }

  private toMessage(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      if (err.status === 429) {
        return 'Too many attempts. Please wait a minute and try again.';
      }

      if (err.status === 401) {
        if (this.isSuperAdmin) {
          return 'The email or password is incorrect. Please check your details and try again.';
        }

        return "That school code, email or password isn't right. Please check them and try again.";
      }

      if (err.status === 0) {
        return "We can't reach Soma right now. Check your internet connection and try again.";
      }
    }

    return 'Something went wrong on our side. Please try again in a moment.';
  }
}