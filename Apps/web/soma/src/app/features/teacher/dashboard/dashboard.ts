import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideDynamicIcon,
  LucideUsers,
  LucideBookOpen,
  LucideFileText,
  LucideVideo,
  LucidePlus,
  LucideSparkles,
  LucideArrowUpRight,
  LucideCircleCheck,
  LucideClock,
} from '@lucide/angular';

@Component({
  selector: 'app-dashboard',
  imports: [
    RouterLink,
    LucideDynamicIcon,
    LucidePlus,
    LucideSparkles,
    LucideArrowUpRight,
    LucideBookOpen,
    LucideCircleCheck,
    LucideClock,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  stats = signal([
    { title: 'Total Students', value: '156', change: '+12 this month', icon: LucideUsers, color: 'text-primary', bgColor: 'bg-primary/10' },
    { title: 'Lessons Created', value: '42', change: '+5 this week', icon: LucideBookOpen, color: 'text-accent', bgColor: 'bg-accent/10' },
    { title: 'Assessments', value: '28', change: '89% completion', icon: LucideFileText, color: 'text-primary', bgColor: 'bg-primary/10' },
    { title: 'Video Lessons', value: '15', change: '2.4k views', icon: LucideVideo, color: 'text-accent', bgColor: 'bg-accent/10' },
  ]);

  recentLessons = signal([
    { id: 1, title: 'Introduction to Fractions', subject: 'Mathematics', grade: 'Grade 5', status: 'published', students: 32 },
    { id: 2, title: 'The Water Cycle', subject: 'Science', grade: 'Grade 4', status: 'published', students: 28 },
    { id: 3, title: 'Parts of Speech', subject: 'English', grade: 'Grade 6', status: 'draft', students: 0 },
  ]);

  recentActivity = signal([
    { id: 1, student: 'Emma Johnson', action: 'Quiz completed', lesson: 'Fractions', score: '92%', time: '2 mins ago' },
    { id: 2, student: 'James Wilson', action: 'Lesson viewed', lesson: 'Water Cycle', score: null, time: '15 mins ago' },
    { id: 3, student: 'Sarah Davis', action: 'Quiz completed', lesson: 'Grammar', score: '78%', time: '1 hour ago' },
  ]);
}