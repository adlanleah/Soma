import { Component, signal, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { LucideDynamicIcon, 
  LucideBookOpen, 
  LucideGraduationCap,
  LucideUsers, 
  LucideArrowLeft, 
  LucideCheck, 
  LucideBuilding2, 
  LucideEye, 
  LucideEyeOff,
   type LucideIconInput, } from '@lucide/angular';

type UserRole = 'teacher' | 'student' | 'parent';

interface RoleConfig {
  label: string;
  icon: LucideIconInput;
  description: string;
}

@Component({
  selector: 'app-signup',
  imports: [LucideDynamicIcon, RouterLink, ReactiveFormsModule],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class Signup {
  private router = inject(Router);

  // Icons
  readonly BookOpenIcon = LucideBookOpen;
  readonly GraduationCapIcon = LucideGraduationCap;
  readonly UsersIcon = LucideUsers;
  readonly ArrowLeftIcon = LucideArrowLeft;
  readonly CheckIcon = LucideCheck;
  readonly Building2Icon = LucideBuilding2;
  readonly EyeIcon = LucideEye;
  readonly EyeOffIcon = LucideEyeOff;

  // State signals
  step = signal<1 | 2>(1);
  selectedRole = signal<UserRole | null>(null);
  showPassword = signal(false);
  isLoading = signal(false);

  // Data
  readonly roles: UserRole[] = ['teacher', 'student', 'parent'];

  readonly roleConfig: Record<UserRole, RoleConfig> = {
    teacher: {
      label: 'Teacher',
      icon: LucideBookOpen,
      description: 'Create visual lessons and assessments',
    },
    student: {
      label: 'Student',
      icon: LucideGraduationCap,
      description: 'Learn with AI-powered visual content',
    },
    parent: {
      label: 'Parent',
      icon: LucideUsers,
      description: "Track your child's learning progress",
    },
  };

  readonly ageGroups = [
    { value: '6-10', label: 'Ages 6-10 (Primary)' },
    { value: '11-13', label: 'Ages 11-13 (Middle School)' },
    { value: '14-16', label: 'Ages 14-16 (High School)' },
    { value: '17-18', label: 'Ages 17-18 (Senior)' },
  ];

  readonly grades = [
    { value: '1', label: 'Grade 1' },
    { value: '2', label: 'Grade 2' },
    { value: '3', label: 'Grade 3' },
    { value: '4', label: 'Grade 4' },
    { value: '5', label: 'Grade 5' },
    { value: '6', label: 'Grade 6' },
    { value: '7', label: 'Grade 7' },
    { value: '8', label: 'Grade 8' },
    { value: '9', label: 'Grade 9' },
    { value: '10', label: 'Grade 10' },
    { value: '11', label: 'Grade 11' },
    { value: '12', label: 'Grade 12' },
  ];

  readonly subjects = ['Mathematics', 'Science', 'English', 'History', 'Geography', 'Art'];

  readonly features = [
    'AI-generated visual explanations',
    'Age-appropriate content adaptation',
    'Interactive quizzes and assessments',
    'Real-time progress tracking',
  ];

  readonly strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];
  readonly strengthColors = ['bg-error', 'bg-warning', 'bg-warning', 'bg-success'];

  signUpForm = new FormGroup({
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
    schoolCode: new FormControl('', [Validators.required]),
    grade: new FormControl(''),
    ageGroup: new FormControl(''),
    childCode: new FormControl(''),
    subjects: new FormGroup(
      this.subjects.reduce((acc, subject) => ({
        ...acc,
        [subject]: new FormControl(false),
      }), {} as Record<string, FormControl>)
    ),
    agreeTerms: new FormControl(false, [Validators.requiredTrue]),
  });

  // Computed getters
  get passwordStrength(): number {
    const password = this.signUpForm.get('password')?.value ?? '';
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  }

  get passwordValue(): string {
    return this.signUpForm.get('password')?.value ?? '';
  }

  get agreeTermsValue(): boolean {
    return this.signUpForm.get('agreeTerms')?.value ?? false;
  }

  isSubjectSelected(subject: string): boolean {
    return this.signUpForm.get('subjects')?.get(subject)?.value ?? false;
  }

  selectRole(role: UserRole): void {
    this.selectedRole.set(role);
    this.clearRoleValidators();
    if (role === 'student') {
      this.signUpForm.get('grade')?.setValidators(Validators.required);
      this.signUpForm.get('ageGroup')?.setValidators(Validators.required);
    } else if (role === 'parent') {
      this.signUpForm.get('childCode')?.setValidators(Validators.required);
    }
    this.signUpForm.get('grade')?.updateValueAndValidity();
    this.signUpForm.get('ageGroup')?.updateValueAndValidity();
    this.signUpForm.get('childCode')?.updateValueAndValidity();
    this.step.set(2);
  }

  goBack(): void {
    this.step.set(1);
    this.clearRoleValidators();
  }

  private clearRoleValidators(): void {
    ['grade', 'ageGroup', 'childCode'].forEach(field => {
      this.signUpForm.get(field)?.clearValidators();
      this.signUpForm.get(field)?.updateValueAndValidity();
    });
  }

  async onSubmit(): Promise<void> {
    if (this.signUpForm.invalid) {
      this.signUpForm.markAllAsTouched();
      return;
    }
    this.isLoading.set(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    this.isLoading.set(false);
    this.router.navigate(['/login']);
  }

  isFieldInvalid(field: string): boolean {
    const control = this.signUpForm.get(field);
    return !!(control?.invalid && control?.touched);
  }

  strengthBarColor(index: number): string {
    return index < this.passwordStrength
      ? this.strengthColors[this.passwordStrength - 1]
      : 'bg-base-300';
  }
}
