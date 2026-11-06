import { Component, signal, computed } from '@angular/core';
import {
  LucideBookOpen,
  LucideTrendingUp,
  LucideTarget,
} from '@lucide/angular';

@Component({
  selector: 'app-dashboard',
  imports: [LucideBookOpen, LucideTrendingUp, LucideTarget],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  children = signal([
    {
      id: 1,
      name: 'Emma Johnson',
      grade: 'Grade 5',
      avatar: 'E',
      stats: { completion: 72, avgScore: 85, streak: 7, lessonsThisWeek: 8 },
      recentActivity: [
        { subject: 'Mathematics', topic: 'Fractions', score: '92%', date: 'Today' },
        { subject: 'Science', topic: 'Water Cycle', score: '88%', date: 'Yesterday' },
        { subject: 'English', topic: 'Grammar', score: '78%', date: '2 days ago' },
      ],
      upcomingTasks: [
        { title: 'Fractions Quiz', subject: 'Mathematics', dueDate: 'Tomorrow' },
        { title: 'Science Project', subject: 'Science', dueDate: 'In 3 days' },
      ],
    },
    {
      id: 2,
      name: 'James Johnson',
      grade: 'Grade 8',
      avatar: 'J',
      stats: { completion: 68, avgScore: 79, streak: 4, lessonsThisWeek: 6 },
      recentActivity: [
        { subject: 'History', topic: 'World War II', score: '82%', date: 'Today' },
        { subject: 'Mathematics', topic: 'Algebra', score: '75%', date: 'Today' },
      ],
      upcomingTasks: [
        { title: 'Algebra Test', subject: 'Mathematics', dueDate: 'In 2 days' },
      ],
    },
  ]);

  selectedChildId = signal(1);

  activeChild = computed(() =>
    this.children().find(c => c.id === this.selectedChildId())!
  );

  selectChild(id: number) {
    this.selectedChildId.set(id);
  }
}