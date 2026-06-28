import { Component, signal } from '@angular/core';

interface RoleStat {
  label: string
  value: string
}

interface RolePreview {
  title: string
  stats: RoleStat[]
}

interface Role {
  id: string
  title: string
  subtitle: string
  description: string
  features: string[]
  preview: RolePreview
}

@Component({
  selector: 'app-roles',
  imports: [],
  templateUrl: './roles.html',
  styleUrl: './roles.css',
})
export class Roles {
  readonly roles = signal([
    {
      id: 'teacher',
      title: 'Teachers',
      subtitle: 'Create & Manage',
      description: 'Transform your curriculum into engaging visual content',
      features: [
        'Upload text-based learning materials',
        'Generate visual explanations and diagrams',
        'Create AI-powered video lessons',
        'Auto-generate quizzes and assessments',
        'Assign content to specific classes',
        'Track student progress and performance',
      ],
      preview: {
        title: 'Teacher Dashboard',
        stats: [
          { label: 'Active Students', value: '156' },
          { label: 'Lessons Created', value: '42' },
          { label: 'Avg. Score', value: '78%' },
        ],
      },
    },
    {
      id: 'student',
      title: 'Students',
      subtitle: 'Learn & Grow',
      description: 'Experience learning tailored to your age and style',
      features: [
        'Access visual lessons and video explanations',
        'Interactive AI tutor for personalized help',
        'Age-appropriate language and examples',
        'Complete quizzes and track progress',
        'Story-based learning for younger students',
        'Exam-oriented content for older students',
      ],
      preview: {
        title: 'Student Dashboard',
        stats: [
          { label: 'Lessons Done', value: '24' },
          { label: 'Quiz Score', value: '85%' },
          { label: 'Streak', value: '7 days' },
        ],
      },
    },
    {
      id: 'parent',
      title: 'Parents',
      subtitle: 'Monitor & Support',
      description: "Stay connected to your child's educational journey",
      features: [
        'View real-time learning progress',
        'Track curriculum coverage',
        'Monitor assessment performance',
        'See assigned tasks and deadlines',
        'Receive progress notifications',
        'Read-only access for transparency',
      ],
      preview: {
        title: 'Parent Dashboard',
        stats: [
          { label: 'Completion', value: '72%' },
          { label: 'This Week', value: '8 hrs' },
          { label: 'Rank', value: 'Top 15%' },
        ],
      },
    },
    {
      id: 'admin',
      title: 'Administrators',
      subtitle: 'Organize & Scale',
      description: "Manage your school's entire learning ecosystem",
      features: [
        'Manage teachers, students, and parents',
        'Configure curriculum structures',
        'Organize classes and groups',
        'Set permissions and access levels',
        'View school-wide analytics',
        'Multi-school platform governance',
      ],
      preview: {
        title: 'Admin Dashboard',
        stats: [
          { label: 'Total Users', value: '1,247' },
          { label: 'Schools', value: '12' },
          { label: 'Active', value: '98%' },
        ],
      },
    },
  ])

  activeRole = signal<Role>(this.roles()[0])

  setActiveRole(role: Role) {
    this.activeRole.set(role);
  }
}
