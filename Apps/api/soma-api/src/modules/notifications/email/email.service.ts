import { Injectable, Logger } from '@nestjs/common';

export interface WelcomeEmailPayload {
  toEmail: string;
  firstName: string;
  role: 'TEACHER' | 'STUDENT' | 'PARENT' | 'ADMIN';
  tempPassword: string;
  schoolName: string;
  schoolCode: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  async sendWelcomeEmail(payload: WelcomeEmailPayload): Promise<void> {
    // TODO: replace with real SendGrid/SMTP dispatch.
    // Keeping this as a no-op console log lets the rest of the app
    // treat email sending as already "real" — swapping the internals
    // here later requires no changes anywhere else in the codebase.
    this.logger.log(
      `[DEV EMAIL] To: ${payload.toEmail} | Welcome ${payload.firstName} (${payload.role}) ` +
        `to ${payload.schoolName}. School code: ${payload.schoolCode}. Temp password: ${payload.tempPassword}`,
    );

    await Promise.resolve(); // keeps this a real async function for when we swap in a live provider
  }
}
