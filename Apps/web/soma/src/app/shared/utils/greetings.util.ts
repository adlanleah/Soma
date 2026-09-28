export function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function getStudentGreeting(firstName: string, streak: number): string {
  const timeGreeting = getTimeBasedGreeting();
  if (streak >= 7) {
    return `${timeGreeting}, ${firstName}! You're on a ${streak}-day streak — keep it going.`;
  }
  if (streak >= 1) {
    return `${timeGreeting}, ${firstName}! Ready to continue where you left off?`;
  }
  return `${timeGreeting}, ${firstName}! Let's get started today.`;
}

export function getTeacherGreeting(firstName: string, pendingReviews: number): string {
  const timeGreeting = getTimeBasedGreeting();
  if (pendingReviews > 0) {
    return `${timeGreeting}, ${firstName}. You have ${pendingReviews} lesson${pendingReviews > 1 ? 's' : ''} waiting for review.`;
  }
  return `${timeGreeting}, ${firstName}. Your classes are all caught up.`;
}

export function getParentGreeting(firstName: string, childName: string): string {
  const timeGreeting = getTimeBasedGreeting();
  return `${timeGreeting}, ${firstName}. Here's how ${childName} is doing.`;
}

export function getAdminGreeting(firstName: string, schoolName: string): string {
  const timeGreeting = getTimeBasedGreeting();
  return `${timeGreeting}, ${firstName}. Here's what's happening at ${schoolName} today.`;
}