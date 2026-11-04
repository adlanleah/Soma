import {
  Component,
  inject,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { environment } from '../../../../environments/environment';

type SchoolPlan = 'STARTER' | 'GROWTH' | 'ENTERPRISE';

interface CreateSchoolPayload {
  name: string;
  country: string;
  city: string;
  address: string;
  phone: string;
  website?: string;
  plan: SchoolPlan;
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  adminPhone: string;
}

interface SchoolOnboardingResponse {
  id: string;
  name: string;
  schoolCode: string;
  plan: SchoolPlan;
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED';
  tenancyMode?: string;
  admin?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

@Component({
  selector: 'app-school-onboarding',
  imports: [FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './school-onboarding.html',
  styleUrl: './school-onboarding.css',
})
export class SchoolOnboarding {
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  readonly step = signal<1 | 2 | 3>(1);
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal('');
  readonly result = signal<SchoolOnboardingResponse | null>(null);
  readonly copiedCode = signal(false);

  readonly plans: {
    value: SchoolPlan;
    name: string;
    description: string;
    features: string[];
  }[] = [
    {
      value: 'STARTER',
      name: 'Starter',
      description: 'Essential tools for schools getting started.',
      features: [
        'Core school management',
        'AI learning assistance',
        'Basic reporting',
      ],
    },
    {
      value: 'GROWTH',
      name: 'Growth',
      description: 'More tools for growing learning communities.',
      features: [
        'Everything in Starter',
        'Advanced learning analytics',
        'Expanded platform capabilities',
      ],
    },
    {
      value: 'ENTERPRISE',
      name: 'Enterprise',
      description: 'A comprehensive platform for larger institutions.',
      features: [
        'Everything in Growth',
        'Advanced administration',
        'Enterprise-level support',
      ],
    },
  ];

  readonly countries = [
    'Uganda',
    'Kenya',
    'Tanzania',
    'Rwanda',
    'Nigeria',
    'Ghana',
    'South Africa',
    'United Kingdom',
    'United States',
    'Other',
  ];

  readonly form = this.fb.nonNullable.group({
    name: ['', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(150),
    ]],
    country: ['Uganda', Validators.required],
    city: ['', Validators.required],
    address: ['', Validators.required],
    phone: ['', Validators.required],
    website: [''],
    plan: ['GROWTH' as SchoolPlan, Validators.required],

    adminFirstName: ['', Validators.required],
    adminLastName: ['', Validators.required],
    adminEmail: ['', [
      Validators.required,
      Validators.email,
    ]],
    adminPhone: ['', Validators.required],
  });

  get selectedPlan() {
    return this.plans.find(
      plan => plan.value === this.form.controls.plan.value,
    ) ?? this.plans[1];
  }

  get schoolName() {
    return this.form.controls.name.value;
  }

  get adminFullName() {
    const firstName = this.form.controls.adminFirstName.value;
    const lastName = this.form.controls.adminLastName.value;

    return `${firstName} ${lastName}`.trim();
  }

  nextStep(): void {
    this.errorMessage.set('');

    if (this.step() === 1) {
      const controls = [
        this.form.controls.name,
        this.form.controls.country,
        this.form.controls.city,
        this.form.controls.address,
        this.form.controls.phone,
      ];

      controls.forEach(control => control.markAsTouched());

      if (controls.some(control => control.invalid)) {
        return;
      }

      this.step.set(2);
      return;
    }

    if (this.step() === 2) {
      const controls = [
        this.form.controls.adminFirstName,
        this.form.controls.adminLastName,
        this.form.controls.adminEmail,
        this.form.controls.adminPhone,
      ];

      controls.forEach(control => control.markAsTouched());

      if (controls.some(control => control.invalid)) {
        return;
      }

      this.step.set(3);
    }
  }

  previousStep(): void {
    this.errorMessage.set('');

    if (this.step() === 3) {
      this.step.set(2);
    } else if (this.step() === 2) {
      this.step.set(1);
    }
  }

  selectPlan(plan: SchoolPlan): void {
    this.form.controls.plan.setValue(plan);
  }

  submitOnboarding(): void {
    if (this.form.invalid || this.isSubmitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    const values = this.form.getRawValue();

    const payload: CreateSchoolPayload = {
      name: values.name.trim(),
      country: values.country.trim(),
      city: values.city.trim(),
      address: values.address.trim(),
      phone: values.phone.trim(),
      website: values.website.trim() || undefined,
      plan: values.plan,

      adminFirstName: values.adminFirstName.trim(),
      adminLastName: values.adminLastName.trim(),
      adminEmail: values.adminEmail.trim().toLowerCase(),
      adminPhone: values.adminPhone.trim(),
    };

    const apiUrl = `${environment.apiUrl.replace(/\/+$/, '')}/schools`;

    this.http.post<SchoolOnboardingResponse>(
      apiUrl,
      payload,
    ).subscribe({
      next: response => {
        this.result.set(response);
        this.isSubmitting.set(false);
      },
      
error: error => {
  this.isSubmitting.set(false);

  console.error('School registration failed:', error);

  const message = error?.error?.message;

  this.errorMessage.set(
    error.status === 0
      ? 'Cannot connect to Soma API. Check that the backend is running and CORS is configured.'
      : Array.isArray(message)
        ? message.join(', ')
        : message || `School registration failed (HTTP ${error.status}).`,
  );
},

    });
  }

  async copySchoolCode(): Promise<void> {
    const code = this.result()?.schoolCode;

    if (!code) {
      return;
    }

    try {
      await navigator.clipboard.writeText(code);
      this.copiedCode.set(true);

      // Reset the visual feedback without using a timer.
      // The button will return to its normal state on the next interaction.
    } catch {
      this.errorMessage.set(
        'Unable to copy the school code. Please copy it manually.',
      );
    }
  }

  goToDashboard(): void {
    this.router.navigate(['/superadmin']);
  }

  startAnotherRegistration(): void {
    this.form.reset({
      name: '',
      country: 'Uganda',
      city: '',
      address: '',
      phone: '',
      website: '',
      plan: 'GROWTH',
      adminFirstName: '',
      adminLastName: '',
      adminEmail: '',
      adminPhone: '',
    });

    this.step.set(1);
    this.result.set(null);
    this.errorMessage.set('');
    this.copiedCode.set(false);
  }
}
