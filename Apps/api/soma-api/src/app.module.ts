import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { SchoolsModule } from './modules/schools/schools.module';
import { UsersModule } from './modules/users/users.module';
import { TeachersModule } from './modules/teachers/teachers.module';
import { StudentsModule } from './modules/students/students.module';
import { ParentsModule } from './modules/parents/parents.module';
import { CohortsModule } from './modules/cohorts/cohorts.module';
import { CoursesModule } from './modules/courses/courses.module';
import { CurriculumModule } from './modules/curriculum/curriculum.module';
import { ContentModule } from './modules/content/content.module';
import { QuizzesModule } from './modules/quizzes/quizzes.module';
import { ProgressModule } from './modules/progress/progress.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { FlagsModule } from './modules/flags/flags.module';
import { AiModule } from './modules/ai/ai.module';
import { HealthModule } from './modules/health/health.module';
import { MasterPrismaService } from './database/master-prisma/master-prisma.service';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    AuthModule,
    SchoolsModule,
    UsersModule,
    TeachersModule,
    StudentsModule,
    ParentsModule,
    CohortsModule,
    CoursesModule,
    CurriculumModule,
    ContentModule,
    QuizzesModule,
    ProgressModule,
    NotificationsModule,
    FlagsModule,
    AiModule,
    HealthModule,
    DatabaseModule,
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    MasterPrismaService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // runs first — populates request.user
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard, // runs second — reads request.user safely
    },
  ],
})
export class AppModule {}
