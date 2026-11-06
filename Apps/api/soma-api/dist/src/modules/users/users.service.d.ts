import { MasterPrismaService } from '../../database/master-prisma/master-prisma.service';
import { TenantConnectionService } from '../../database/tenant-connection/tenant-connection.service';
import { EmailService } from '../../modules/notifications/email/email.service';
import { JwtPayload } from '../../common/interfaces/jwt-payload';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { CreateStudentDto } from './dto/create-student.dto';
import { CreateParentDto } from './dto/create-parent.dto';
import { BulkImportDto } from './dto/bulk-import.dto';
export declare class UsersService {
    private masterPrisma;
    private tenantConnection;
    private emailService;
    constructor(masterPrisma: MasterPrismaService, tenantConnection: TenantConnectionService, emailService: EmailService);
    private getSchool;
    createTeacher(admin: JwtPayload, dto: CreateTeacherDto): Promise<{
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        role: import(".prisma/tenant-client/client").$Enums.UserRole;
        status: string;
    }>;
    createStudent(admin: JwtPayload, dto: CreateStudentDto): Promise<{
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        role: import(".prisma/tenant-client/client").$Enums.UserRole;
        status: string;
        studentCode: string;
    }>;
    createParent(admin: JwtPayload, dto: CreateParentDto): Promise<{
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        role: import(".prisma/tenant-client/client").$Enums.UserRole;
        status: string;
        linkedStudent: {
            id: string;
            name: string;
            studentCode: string | undefined;
        };
    }>;
    bulkImport(admin: JwtPayload, dto: BulkImportDto): Promise<{
        total: number;
        created: number;
        failed: number;
        results: {
            row: number;
            status: "created" | "failed";
            email?: string;
            error?: string;
        }[];
    }>;
    findAll(admin: JwtPayload): Promise<{
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        role: import(".prisma/tenant-client/client").$Enums.UserRole;
        status: string;
        createdAt: Date;
        adminProfile: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            adminLevel: import(".prisma/tenant-client/client").$Enums.AdminLevel;
            title: string | null;
        } | null;
        studentProfile: {
            id: string;
            userId: string;
            grade: string;
            ageGroup: string;
            studentCode: string;
            classId: string | null;
        } | null;
        teacherProfile: {
            id: string;
            userId: string;
        } | null;
    }[]>;
}
