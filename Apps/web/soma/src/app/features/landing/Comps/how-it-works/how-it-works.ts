import { Component, signal } from '@angular/core';

interface AgeTier {
  range: string
  style: string
  description: string
  color: string
}

interface Step {
  number: string
  title: string
  description: string
}

@Component({
  selector: 'app-how-it-works',
  imports: [],
  templateUrl: './how-it-works.html',
  styleUrl: './how-it-works.css',
})
export class HowItWorks {
   readonly ageTiers = signal( [
    {
      range: 'Ages 6-10',
      style: 'Stories & Cartoons',
      description: 'Learning through animated stories, colorful visuals, and simple analogies that make concepts fun and memorable.',
      color: 'bg-accent',
    },
    {
      range: 'Ages 11-13',
      style: 'Visuals + Theory',
      description: 'Balanced approach with engaging visuals accompanied by foundational theory and structured explanations.',
      color: 'bg-primary',
    },
    {
      range: 'Ages 14-16',
      style: 'Structured Learning',
      description: 'Detailed explanations with examples, diagrams, and practice problems for deeper understanding.',
      color: 'bg-accent',
    },
    {
      range: 'Ages 17-18',
      style: 'Exam-Focused',
      description: 'Comprehensive reasoning, exam-oriented content, and advanced explanations for academic excellence.',
      color: 'bg-primary',
    },
  ])

  readonly steps = signal([
    {
      number: '01',
      title: 'Teacher Uploads Content',
      description: 'Teachers upload approved curriculum materials - textbooks, notes, or lesson plans - into the platform.',
    },
    {
      number: '02',
      title: 'AI Processes & Generates',
      description: 'Our AI analyzes the content and creates visual explanations, video lessons, and assessments.',
    },
    {
      number: '03',
      title: 'Students Learn Visually',
      description: 'Students access age-appropriate content through their dashboard with AI tutor support.',
    },
    {
      number: '04',
      title: 'Everyone Stays Informed',
      description: 'Parents and administrators track progress through real-time analytics and reports.',
    },
  ])
}
