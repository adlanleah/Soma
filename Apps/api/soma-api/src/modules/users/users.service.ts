import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { MasterPrismaService } from '../../database/master-prisma/master-prisma.service';
import { TenantConnectionService } from '../../database/tenant-connection/tenant-connection.service';
import { JwtPayload } from '../../common/interfaces/jwt-payload';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { CreateStudentDto } from './dto/create-student.dto';
import { CreateParentDto } from './dto/create-parent.dto';
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
  ) {}

  private async getSchoolEmailPrefix(schoolCode: string): Promise<string> {
    const school = await this.masterPrisma.school.findUnique({
      where: { schoolCode },
    });
    if (!school) throw new NotFoundException('School not found');
    return school.emailPrefix;
  }

  async createTeacher(admin: JwtPayload, dto: CreateTeacherDto) {
    const tenantClient = this.tenantConnection.getClient({
      dbName: admin.dbName!,
    });
    const emailPrefix = await this.getSchoolEmailPrefix(admin.schoolCode);

    const email = generateUserEmail(dto.firstName, dto.lastName, emailPrefix);
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

    // TODO: dispatch invite email with tempPassword to the teacher

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      status: user.status,
      tempPassword, // shown once for now — replace with email dispatch later
    };
  }

  async createStudent(admin: JwtPayload, dto: CreateStudentDto) {
    const tenantClient = this.tenantConnection.getClient({
      dbName: admin.dbName!,
    });
    const emailPrefix = await this.getSchoolEmailPrefix(admin.schoolCode);

    const email = generateUserEmail(dto.firstName, dto.lastName, emailPrefix);
    const tempPassword = generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 10);
    const studentCode = generateStudentCode(emailPrefix);

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

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      status: user.status,
      studentCode,
      tempPassword,
    };
  }

  async createParent(admin: JwtPayload, dto: CreateParentDto) {
    const tenantClient = this.tenantConnection.getClient({
      dbName: admin.dbName!,
    });
    const emailPrefix = await this.getSchoolEmailPrefix(admin.schoolCode);

    // Verify the student exists
    const student = await tenantClient.user.findUnique({
      where: { id: dto.studentId },
      include: { studentProfile: true },
    });
    if (!student || student.role !== 'STUDENT') {
      throw new BadRequestException('Linked student not found');
    }

    const email = generateUserEmail(dto.firstName, dto.lastName, emailPrefix);
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
        parentLinks: {
          create: { studentId: dto.studentId },
        },
      },
      include: { parentLinks: true },
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
      tempPassword,
    };
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
