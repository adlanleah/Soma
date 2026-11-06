import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RouterLink } from '@angular/router';

import {
  LucideBuilding,
  LucideActivity,
  LucideGlobe,
  LucideArrowRight,
  LucidePlus,
  LucideMoreHorizontal,
  LucideCircleAlert,
  LucideCircleCheck,
  LucideUsers,
  LucideGraduationCap,
  LucideServer,
} from '@lucide/angular';

import { environment } from '../../../../environments/environment';

interface Stat {
  title: string;
  value: string;
  change: string;
  icon: any;
  color: string;
  bgColor: string;
}

type SchoolStatus = 'ACTIVE' | 'PENDING' | 'SUSPENDED';

interface SchoolApi {
  id: string;
  name: string;
  schoolCode: string;
  country: string;
  city: string;
  address: string;
  plan: string;
  status: SchoolStatus;
  createdAt: string;
}

interface School {
  id: string;
  name: string;
  schoolCode: string;
  location: string;
  plan: string;
  status: SchoolStatus;
  registeredAt: string;
}

type SchoolsResponse =
  | SchoolApi[]
  | { data: SchoolApi[] }
  | { schools: SchoolApi[] };

interface SystemService {
  name: string;
  status: 'operational' | 'degraded';
  latency: string;
}

interface AnalyticItem {
  metric: string;
  value: string;
  trend: string;
}


interface DashboardSummary {
  schoolsSigned: number;
  activeSchools: number;
  pendingSchools: number;
  suspendedSchools: number;
  students: number;
  teachers: number;
  parents: number;
  admins: number;
  unavailableSchoolDatabases: number;
}


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private readonly http = inject(HttpClient);

  readonly PlusIcon = LucidePlus;
  readonly ActivityIcon = LucideActivity;
  readonly GlobeIcon = LucideGlobe;
  readonly BuildingIcon = LucideBuilding;
  readonly ArrowRightIcon = LucideArrowRight;
  readonly MoreHorizontalIcon = LucideMoreHorizontal;
  readonly CheckCircleIcon = LucideCircleCheck;
  readonly AlertCircleIcon = LucideCircleAlert;

  readonly schools = signal<School[]>([]);
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  readonly totalSchools = computed(() => this.schools().length);

  readonly activeSchools = computed(
    () => this.schools().filter(school => school.status === 'ACTIVE').length
  );

  readonly pendingSchools = computed(
    () => this.schools().filter(school => school.status === 'PENDING').length
  );

  readonly suspendedSchools = computed(
    () => this.schools().filter(school => school.status === 'SUSPENDED').length
  );

  readonly stats = computed<Stat[]>(() => [
    {
      title: 'Total Schools',
      value: this.totalSchools().toString(),
      change: 'Registered on Soma',
      icon: LucideBuilding,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Active Schools',
      value: this.activeSchools().toString(),
      change: 'Currently active',
      icon: LucideCircleCheck,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Pending Schools',
      value: this.pendingSchools().toString(),
      change: 'Awaiting activation',
      icon: LucideUsers,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: 'Suspended Schools',
      value: this.suspendedSchools().toString(),
      change: 'Require attention',
      icon: LucideCircleAlert,
      color: 'text-error',
      bgColor: 'bg-error/10',
    },
  ]);

  // These are demonstration values until their monitoring
  // and analytics endpoints are implemented.
  readonly systemHealth: SystemService[] = [
    {
      name: 'API Gateway',
      status: 'operational',
      latency: 'Not connected',
    },
    {
      name: 'Database',
      status: 'operational',
      latency: 'Not connected',
    },
    {
      name: 'AI Processing',
      status: 'operational',
      latency: 'Not connected',
    },
    {
      name: 'File Storage',
      status: 'operational',
      latency: 'Not connected',
    },
  ];

  readonly analytics: AnalyticItem[] = [];

  ngOnInit(): void {
    this.loadSchools();
  }

  loadSchools(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    const apiUrl = environment.apiUrl.replace(/\/+$/, '');

    const token = localStorage.getItem('soma_access_token');

    const headers = token
      ? new HttpHeaders({
          Authorization: `Bearer ${token}`,
        })
      : new HttpHeaders();

    this.http.get<SchoolsResponse>(
      `${apiUrl}/schools`,
      { headers }
    ).subscribe({
      next: response => {
        let records: SchoolApi[];

        if (Array.isArray(response)) {
          records = response;
        } else if ('schools' in response) {
          records = response.schools;
        } else {
          records = response.data;
        }

        const mappedSchools: School[] = records.map(school => ({
          id: school.id,
          name: school.name,
          schoolCode: school.schoolCode,
          location: [school.city, school.country]
            .filter(Boolean)
            .join(', '),
          plan: school.plan,
          status: school.status,
          registeredAt: school.createdAt
            ? new Date(school.createdAt).toLocaleDateString()
            : 'Not available',
        }));

        this.schools.set(mappedSchools);
        this.isLoading.set(false);
      },

      error: error => {
        console.error('Dashboard school retrieval failed:', error);

        this.isLoading.set(false);

        this.errorMessage.set(
          error.status === 0
            ? 'Cannot connect to the Soma API.'
            : error.status === 401
              ? 'Your session has expired. Please sign in again.'
              : error.status === 403
                ? 'You do not have permission to view registered schools.'
                : error.error?.message || 'Failed to retrieve registered schools.'
        );
      },
    });
  }

  
readonly summary = signal<DashboardSummary | null>(null);

readonly stat = computed<Stat[]>(() => {
  const data = this.summary();

  return [
    {
      title: 'Total Schools Signed',
      value: (data?.schoolsSigned ?? 0).toLocaleString(),
      change: `${data?.activeSchools ?? 0} active schools`,
      icon: LucideBuilding,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Total Students',
      value: (data?.students ?? 0).toLocaleString(),
      change: 'Across all schools',
      icon: LucideGraduationCap,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      title: 'Total Teachers',
      value: (data?.teachers ?? 0).toLocaleString(),
      change: 'Across all schools',
      icon: LucideUsers,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Total Parents',
      value: (data?.parents ?? 0).toLocaleString(),
      change: 'Across all schools',
      icon: LucideUsers,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      title: 'Total Administrators',
      value: (data?.admins ?? 0).toLocaleString(),
      change: 'School administrators',
      icon: LucideServer,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
  ];
});


loadDashboardSummary(): void {
  const apiUrl = environment.apiUrl.replace(/\/+$/, '');
  const token = localStorage.getItem('soma_access_token');

  const headers = token
    ? new HttpHeaders({
        Authorization: `Bearer ${token}`,
      })
    : new HttpHeaders();

  this.http
    .get<DashboardSummary>(
      `${apiUrl}/schools/dashboard/summary`,
      { headers },
    )
    .subscribe({
      next: response => {
        this.summary.set(response);
      },
      error: error => {
        console.error('Dashboard summary retrieval failed:', error);
      },
    });
}


}
