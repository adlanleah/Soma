import { Component, signal } from '@angular/core';
import {
  LucideDynamicIcon,
  LucideSparkles,
  LucideVideo,
  LucideFileText,
  LucideMessageSquare,
  LucideBookOpen,
  LucideChartLine,
  LucideShield,
  LucideBrain,
  type LucideIconInput,
} from '@lucide/angular';

interface Feature {
  icon: LucideIconInput; 
  title: string;
  description: string;
  color: string;
  bgColor: string;
}

@Component({
  selector: 'app-features',
  imports: [LucideDynamicIcon],
  templateUrl: './features.html',
  styleUrl: './features.css',
})
export class FeaturesComponent {
  readonly features = signal<Feature[]>([
    {
      icon: LucideSparkles,
      title: 'Visual Explanations',
      description:
        'AI generates diagrams, concept illustrations, and visual representations of complex topics automatically.',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      icon: LucideVideo,
      title: 'AI Video Lessons',
      description:
        "Create short, engaging video-style explanations tailored to each learner's age group.",
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      icon: LucideFileText,
      title: 'Auto-Generated Quizzes',
      description: 'Automatically create assessments based on uploaded curriculum.',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      icon: LucideMessageSquare,
      title: 'Age-Adaptive AI Tutor',
      description: 'Students interact with an AI adapted to their age.',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      icon: LucideBookOpen,
      title: 'Curriculum Control',
      description: 'Teachers maintain full control over uploaded learning materials.',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      icon: LucideChartLine,
      title: 'Progress Analytics',
      description: 'Track student performance and engagement.',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      icon: LucideShield,
      title: 'Child-Safe AI',
      description: 'Curriculum-bound, age-appropriate AI interactions.',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      icon: LucideBrain,
      title: 'Multi-School Support',
      description: 'Manage multiple schools, teachers, and curricula.',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
  ]);
}