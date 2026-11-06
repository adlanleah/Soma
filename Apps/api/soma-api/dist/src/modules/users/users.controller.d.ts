import * as jwtPayload from '../../common/interfaces/jwt-payload';
import { UsersService } from './users.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { CreateStudentDto } from './dto/create-student.dto';
import { CreateParentDto } from './dto/create-parent.dto';
import { BulkImportDto } from './dto/bulk-import.dto';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    createTeacher(admin: jwtPayload.JwtPayload, dto: CreateTeacherDto): Promise<{
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        role: import(".prisma/tenant-client/client").$Enums.UserRole;
        status: string;
    }>;
    createStudent(admin: jwtPayload.JwtPayload, dto: CreateStudentDto): Promise<{
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        role: import(".prisma/tenant-client/client").$Enums.UserRole;
        status: string;
        studentCode: string;
    }>;
    createParent(admin: jwtPayload.JwtPayload, dto: CreateParentDto): Promise<{
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
    findAll(admin: jwtPayload.JwtPayload): Promise<{
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
    bulkImport(admin: jwtPayload.JwtPayload, dto: BulkImportDto): Promise<{
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
}
