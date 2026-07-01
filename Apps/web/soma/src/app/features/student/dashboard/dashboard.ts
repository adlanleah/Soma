import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideDynamicIcon,
  LucideBookOpen,
  LucideFileText,
  LucideMessageSquare,
  LucideVideo,
  LucideTrophy,
  LucideFlame,
  LucideTarget,
  LucideArrowRight,
  LucideClock,
} from '@lucide/angular';

@Component({
  selector: 'app-dashboard',
  imports: [
    RouterLink,
    LucideDynamicIcon,
    LucideBookOpen,
    LucideFileText,
    LucideMessageSquare,
    LucideVideo,
    LucideArrowRight,
    LucideClock,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  stats = signal([
    { title: 'Lessons Completed', value: '24', icon: LucideBookOpen, color: 'text-primary', bgColor: 'bg-primary/10' },
    { title: 'Quiz Average', value: '85%', icon: LucideTarget, color: 'text-accent', bgColor: 'bg-accent/10' },
    { title: 'Learning Streak', value: '7 days', icon: LucideFlame, color: 'text-orange-400', bgColor: 'bg-orange-400/10' },
    { title: 'Achievements', value: '12', icon: LucideTrophy, color: 'text-yellow-400', bgColor: 'bg-yellow-400/10' },
  ]);

  assignedLessons = signal([
    { id: 1, title: 'Introduction to Fractions', subject: 'Mathematics', type: 'visual', progress: 75, dueDate: 'Tomorrow' },
    { id: 2, title: 'The Water Cycle', subject: 'Science', type: 'video', progress: 0, dueDate: 'In 3 days' },
    { id: 3, title: 'Parts of Speech Quiz', subject: 'English', type: 'quiz', progress: 0, dueDate: 'In 5 days' },
  ]);

  recentActivity = signal([
    { id: 1, title: 'Completed quiz: Basic Algebra', score: '92%', time: '2 hours ago' },
    { id: 2, title: 'Watched video: Photosynthesis', score: null, time: 'Yesterday' },
  ]);
}