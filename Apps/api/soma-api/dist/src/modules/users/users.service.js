"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcrypt"));
const master_prisma_service_1 = require("../../database/master-prisma/master-prisma.service");
const tenant_connection_service_1 = require("../../database/tenant-connection/tenant-connection.service");
const email_service_1 = require("../../modules/notifications/email/email.service");
const generate_email_1 = require("../../shared/utils/generate-email");
let UsersService = class UsersService {
    masterPrisma;
    tenantConnection;
    emailService;
    constructor(masterPrisma, tenantConnection, emailService) {
        this.masterPrisma = masterPrisma;
        this.tenantConnection = tenantConnection;
        this.emailService = emailService;
    }
    async getSchool(schoolCode) {
        const school = await this.masterPrisma.school.findUnique({
            where: { schoolCode },
        });
        if (!school)
            throw new common_1.NotFoundException('School not found');
        return school;
    }
    async createTeacher(admin, dto) {
        const school = await this.getSchool(admin.schoolCode);
        const tenantClient = this.tenantConnection.getClient({
            dbName: admin.dbName,
        });
        const email = (0, generate_email_1.generateUserEmail)(dto.firstName, dto.lastName, school.emailPrefix);
        const tempPassword = (0, generate_email_1.generateTempPassword)();
        const passwordHash = await bcrypt.hash(tempPassword, 10);
        const existing = await tenantClient.user.findUnique({ where: { email } });
        if (existing) {
            throw new common_1.BadRequestException('A user with this generated email already exists');
        }
        const user = await tenantClient.user.create({
            data: {
                firstName: dto.firstName,
                lastName: dto.lastName,
                email,
                passwordHash,
                role: 'TEACHER',
                status: 'pending',
                teacherProfile: { create: {} },
            },
            include: { teacherProfile: true },
        });
        await this.emailService.sendWelcomeEmail({
            toEmail: email,
            firstName: dto.firstName,
            role: 'TEACHER',
            tempPassword,
            schoolName: school.name,
            schoolCode: school.schoolCode,
        });
        return {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            status: user.status,
        };
    }
    async createStudent(admin, dto) {
        const school = await this.getSchool(admin.schoolCode);
        const tenantClient = this.tenantConnection.getClient({
            dbName: admin.dbName,
        });
        const email = (0, generate_email_1.generateUserEmail)(dto.firstName, dto.lastName, school.emailPrefix);
        const tempPassword = (0, generate_email_1.generateTempPassword)();
        const passwordHash = await bcrypt.hash(tempPassword, 10);
        const studentCode = (0, generate_email_1.generateStudentCode)(school.emailPrefix);
        const existing = await tenantClient.user.findUnique({ where: { email } });
        if (existing) {
            throw new common_1.BadRequestException('A user with this generated email already exists');
        }
        const user = await tenantClient.user.create({
            data: {
                firstName: dto.firstName,
                lastName: dto.lastName,
                email,
                passwordHash,
                role: 'STUDENT',
                status: 'pending',
                studentProfile: {
                    create: {
                        grade: dto.grade,
                        ageGroup: dto.ageGroup,
                        studentCode,
                        classId: dto.classId,
                    },
                },
            },
            include: { studentProfile: true },
        });
        await this.emailService.sendWelcomeEmail({
            toEmail: email,
            firstName: dto.firstName,
            role: 'STUDENT',
            tempPassword,
            schoolName: school.name,
            schoolCode: school.schoolCode,
        });
        return {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            status: user.status,
            studentCode,
        };
    }
    async createParent(admin, dto) {
        const school = await this.getSchool(admin.schoolCode);
        const tenantClient = this.tenantConnection.getClient({
            dbName: admin.dbName,
        });
        const student = await tenantClient.user.findUnique({
            where: { id: dto.studentId },
            include: { studentProfile: true },
        });
        if (!student || student.role !== 'STUDENT') {
            throw new common_1.BadRequestException('Linked student not found');
        }
        const email = (0, generate_email_1.generateUserEmail)(dto.firstName, dto.lastName, school.emailPrefix);
        const tempPassword = (0, generate_email_1.generateTempPassword)();
        const passwordHash = await bcrypt.hash(tempPassword, 10);
        const existing = await tenantClient.user.findUnique({ where: { email } });
        if (existing) {
            throw new common_1.BadRequestException('A user with this generated email already exists');
        }
        const user = await tenantClient.user.create({
            data: {
                firstName: dto.firstName,
                lastName: dto.lastName,
                email,
                passwordHash,
                role: 'PARENT',
                status: 'pending',
                parentLinks: { create: { studentId: dto.studentId } },
            },
            include: { parentLinks: true },
        });
        await this.emailService.sendWelcomeEmail({
            toEmail: email,
            firstName: dto.firstName,
            role: 'PARENT',
            tempPassword,
            schoolName: school.name,
            schoolCode: school.schoolCode,
        });
        return {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            status: user.status,
            linkedStudent: {
                id: student.id,
                name: `${student.firstName} ${student.lastName}`,
                studentCode: student.studentProfile?.studentCode,
            },
        };
    }
    async bulkImport(admin, dto) {
        const school = await this.getSchool(admin.schoolCode);
        const tenantClient = this.tenantConnection.getClient({
            dbName: admin.dbName,
        });
        const results = [];
        const emailToUserId = new Map();
        for (let i = 0; i < dto.users.length; i++) {
            const row = dto.users[i];
            try {
                const email = (0, generate_email_1.generateUserEmail)(row.firstName, row.lastName, school.emailPrefix);
                const tempPassword = (0, generate_email_1.generateTempPassword)();
                const passwordHash = await bcrypt.hash(tempPassword, 10);
                const existing = await tenantClient.user.findUnique({
                    where: { email },
                });
                if (existing) {
                    results.push({
                        row: i,
                        status: 'failed',
                        email,
                        error: 'Email already exists',
                    });
                    continue;
                }
                if (row.role === 'TEACHER') {
                    const user = await tenantClient.user.create({
                        data: {
                            firstName: row.firstName,
                            lastName: row.lastName,
                            email,
                            passwordHash,
                            role: 'TEACHER',
                            status: 'pending',
                            teacherProfile: { create: {} },
                        },
                    });
                    emailToUserId.set(email, user.id);
                    await this.emailService.sendWelcomeEmail({
                        toEmail: email,
                        firstName: row.firstName,
                        role: 'TEACHER',
                        tempPassword,
                        schoolName: school.name,
                        schoolCode: school.schoolCode,
                    });
                    results.push({ row: i, status: 'created', email });
                    continue;
                }
                if (row.role === 'STUDENT') {
                    if (!row.grade || !row.ageGroup) {
                        results.push({
                            row: i,
                            status: 'failed',
                            error: 'grade and ageGroup are required for students',
                        });
                        continue;
                    }
                    const studentCode = (0, generate_email_1.generateStudentCode)(school.emailPrefix);
                    const user = await tenantClient.user.create({
                        data: {
                            firstName: row.firstName,
                            lastName: row.lastName,
                            email,
                            passwordHash,
                            role: 'STUDENT',
                            status: 'pending',
                            studentProfile: {
                                create: {
                                    grade: row.grade,
                                    ageGroup: row.ageGroup,
                                    studentCode,
                                },
                            },
                        },
                    });
                    emailToUserId.set(email, user.id);
                    await this.emailService.sendWelcomeEmail({
                        toEmail: email,
                        firstName: row.firstName,
                        role: 'STUDENT',
                        tempPassword,
                        schoolName: school.name,
                        schoolCode: school.schoolCode,
                    });
                    results.push({ row: i, status: 'created', email });
                    continue;
                }
                if (row.role === 'PARENT') {
                    if (!row.linkedStudentEmail) {
                        results.push({
                            row: i,
                            status: 'failed',
                            error: 'linkedStudentEmail is required for parents',
                        });
                        continue;
                    }
                    const studentId = emailToUserId.get(row.linkedStudentEmail);
                    if (!studentId) {
                        results.push({
                            row: i,
                            status: 'failed',
                            error: `Student with email ${row.linkedStudentEmail} was not found in this import batch`,
                        });
                        continue;
                    }
                    const user = await tenantClient.user.create({
                        data: {
                            firstName: row.firstName,
                            lastName: row.lastName,
                            email,
                            passwordHash,
                            role: 'PARENT',
                            status: 'pending',
                            parentLinks: { create: { studentId } },
                        },
                    });
                    emailToUserId.set(email, user.id);
                    await this.emailService.sendWelcomeEmail({
                        toEmail: email,
                        firstName: row.firstName,
                        role: 'PARENT',
                        tempPassword,
                        schoolName: school.name,
                        schoolCode: school.schoolCode,
                    });
                    results.push({ row: i, status: 'created', email });
                }
            }
            catch (err) {
                results.push({
                    row: i,
                    status: 'failed',
                    error: err instanceof Error ? err.message : 'Unknown error',
                });
            }
        }
        const created = results.filter((r) => r.status === 'created').length;
        const failed = results.filter((r) => r.status === 'failed').length;
        return { total: dto.users.length, created, failed, results };
    }
    async findAll(admin) {
        const tenantClient = this.tenantConnection.getClient({
            dbName: admin.dbName,
        });
        return tenantClient.user.findMany({
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
                status: true,
                createdAt: true,
                studentProfile: true,
                teacherProfile: true,
                adminProfile: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [master_prisma_service_1.MasterPrismaService,
        tenant_connection_service_1.TenantConnectionService,
        email_service_1.EmailService])
], UsersService);
//# sourceMappingURL=users.service.js.map