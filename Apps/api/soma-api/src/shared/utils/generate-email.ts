export function generateUserEmail(
  firstName: string,
  lastName: string,
  schoolEmailPrefix: string,
): string {
  const first = firstName.toLowerCase().replace(/[^a-z]/g, '');
  const last = lastName.toLowerCase().replace(/[^a-z]/g, '');
  return `${first}.${last}@${schoolEmailPrefix}.soma.com`;
}

export function generateStudentCode(schoolEmailPrefix: string): string {
  const prefix = schoolEmailPrefix.toUpperCase().slice(0, 4);
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-STU-${num}`;
}

export function generateTempPassword(length: number = 12): string {
  // Temporary password shown once — user resets it on first login
  return Math.random().toString(36).slice(-length) + '!A1';
}
