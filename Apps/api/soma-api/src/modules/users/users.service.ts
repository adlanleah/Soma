import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { MasterPrismaService } from '../../database/master-prisma/master-prisma.service';
import { TenantConnectionService } from '../../database/tenant-connection/tenant-connection.service';
import { EmailService } from '../../modules/notifications/email/email.service';
import { JwtPayload } from '../../common/interfaces/jwt-payload';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { CreateStudentDto } from './dto/create-student.dto';
import { CreateParentDto } from './dto/create-parent.dto';
import { BulkImportDto } from './dto/bulk-import.dto';
import {
  generateUserEmail,
  generateStudentCode,
  generateTempPassword,
} from '../../shared/utils/generate-email';

@Injectable()
export class UsersService {
  constructor(
    private masterPrisma: MasterPrismaService,
    private tenantConnection: TenantConnectionService,
    private emailService: EmailService,
  ) {}

  private async getSchool(schoolCode: string) {
    const school = await this.masterPrisma.school.findUnique({
      where: { schoolCode },
    });
    if (!school) throw new NotFoundException('School not found');
    return school;
  }

  async createTeacher(admin: JwtPayload, dto: CreateTeacherDto) {
    const school = await this.getSchool(admin.schoolCode);
    const tenantClient = this.tenantConnection.getClient({
      dbName: admin.dbName!,
    });

    const email = generateUserEmail(
      dto.firstName,
      dto.lastName,
      school.emailPrefix,
    );
    const tempPassword = generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const existing = await tenantClient.user.findUnique({ where: { email } });
    if (existing) {
      throw new BadRequestException(
        'A user with this generated email already exists',
      );
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

  async createStudent(admin: JwtPayload, dto: CreateStudentDto) {
    const school = await this.getSchool(admin.schoolCode);
    const tenantClient = this.tenantConnection.getClient({
      dbName: admin.dbName!,
    });

    const email = generateUserEmail(
      dto.firstName,
      dto.lastName,
      school.emailPrefix,
    );
    const tempPassword = generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 10);
    const studentCode = generateStudentCode(school.emailPrefix);

    const existing = await tenantClient.user.findUnique({ where: { email } });
    if (existing) {
      throw new BadRequestException(
        'A user with this generated email already exists',
      );
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

  async createParent(admin: JwtPayload, dto: CreateParentDto) {
    const school = await this.getSchool(admin.schoolCode);
    const tenantClient = this.tenantConnection.getClient({
      dbName: admin.dbName!,
    });

    const student = await tenantClient.user.findUnique({
      where: { id: dto.studentId },
      include: { studentProfile: true },
    });
    if (!student || student.role !== 'STUDENT') {
      throw new BadRequestException('Linked student not found');
    }

    const email = generateUserEmail(
      dto.firstName,
      dto.lastName,
      school.emailPrefix,
    );
    const tempPassword = generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const existing = await tenantClient.user.findUnique({ where: { email } });
    if (existing) {
      throw new BadRequestException(
        'A user with this generated email already exists',
      );
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

  async bulkImport(admin: JwtPayload, dto: BulkImportDto) {
    const school = await this.getSchool(admin.schoolCode);
    const tenantClient = this.tenantConnection.getClient({
      dbName: admin.dbName!,
    });

    const results: Array<{
      row: number;
      status: 'created' | 'failed';
      email?: string;
      error?: string;
    }> = [];

    const emailToUserId = new Map<string, string>();

    for (let i = 0; i < dto.users.length; i++) {
      const row = dto.users[i];

      try {
        const email = generateUserEmail(
          row.firstName,
          row.lastName,
          school.emailPrefix,
        );
        const tempPassword = generateTempPassword();
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

          const studentCode = generateStudentCode(school.emailPrefix);
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
      } catch (err) {
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

  async findAll(admin: JwtPayload) {
    const tenantClient = this.tenantConnection.getClient({
      dbName: admin.dbName!,
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
}
