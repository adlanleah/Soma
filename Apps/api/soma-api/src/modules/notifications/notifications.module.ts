import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { EmailService } from './email/email.service';
import { WhatsappService } from './whatsapp/whatsapp.service';
import { WeeklySummaryService } from './weekly-summary/weekly-summary.service';

@Module({
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    EmailService,
    WhatsappService,
    WeeklySummaryService,
  ],
})
export class NotificationsModule {}
