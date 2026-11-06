export interface WelcomeEmailPayload {
    toEmail: string;
    firstName: string;
    role: 'TEACHER' | 'STUDENT' | 'PARENT' | 'ADMIN';
    tempPassword: string;
    schoolName: string;
    schoolCode: string;
}
export declare class EmailService {
    private readonly logger;
    sendWelcomeEmail(payload: WelcomeEmailPayload): Promise<void>;
}
