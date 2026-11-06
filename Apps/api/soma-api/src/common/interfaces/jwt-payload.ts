export interface JwtPayload {
  sub: string; // userId
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';
  adminLevel?: 'PRINCIPAL' | 'STAFF' | 'ACADEMIC';
  schoolCode: string;
  schemaName: string;
  dbName: string | null;
  tenancyMode: 'SCHEMA' | 'DATABASE';
}
