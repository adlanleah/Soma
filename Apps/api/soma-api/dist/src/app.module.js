"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const auth_module_1 = require("./modules/auth/auth.module");
const schools_module_1 = require("./modules/schools/schools.module");
const users_module_1 = require("./modules/users/users.module");
const teachers_module_1 = require("./modules/teachers/teachers.module");
const students_module_1 = require("./modules/students/students.module");
const parents_module_1 = require("./modules/parents/parents.module");
const cohorts_module_1 = require("./modules/cohorts/cohorts.module");
const courses_module_1 = require("./modules/courses/courses.module");
const curriculum_module_1 = require("./modules/curriculum/curriculum.module");
const content_module_1 = require("./modules/content/content.module");
const quizzes_module_1 = require("./modules/quizzes/quizzes.module");
const progress_module_1 = require("./modules/progress/progress.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const flags_module_1 = require("./modules/flags/flags.module");
const ai_module_1 = require("./modules/ai/ai.module");
const health_module_1 = require("./modules/health/health.module");
const database_module_1 = require("./database/database.module");
const master_prisma_service_1 = require("./database/master-prisma/master-prisma.service");
const jwt_auth_guard_1 = require("./common/guards/jwt-auth.guard");
const roles_guard_1 = require("./common/guards/roles.guard");
const superadmin_module_1 = require("./modules/super-admin/superadmin.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            throttler_1.ThrottlerModule.forRoot([
                {
                    ttl: 60000,
                    limit: 100,
                },
            ]),
            database_module_1.DatabaseModule,
            auth_module_1.AuthModule,
            schools_module_1.SchoolsModule,
            users_module_1.UsersModule,
            teachers_module_1.TeachersModule,
            students_module_1.StudentsModule,
            parents_module_1.ParentsModule,
            cohorts_module_1.CohortsModule,
            courses_module_1.CoursesModule,
            curriculum_module_1.CurriculumModule,
            content_module_1.ContentModule,
            quizzes_module_1.QuizzesModule,
            progress_module_1.ProgressModule,
            notifications_module_1.NotificationsModule,
            flags_module_1.FlagsModule,
            ai_module_1.AiModule,
            health_module_1.HealthModule,
            superadmin_module_1.SuperAdminModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            master_prisma_service_1.MasterPrismaService,
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_auth_guard_1.JwtAuthGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: roles_guard_1.RolesGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map