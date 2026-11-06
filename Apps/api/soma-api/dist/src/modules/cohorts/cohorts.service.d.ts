import { TenantConnectionService } from '../../database/tenant-connection/tenant-connection.service';
import { JwtPayload } from '../../common/interfaces/jwt-payload';
import { CreateCohortDto } from './dto/create-cohort.dto';
export declare class CohortsService {
    private tenantConnection;
    constructor(tenantConnection: TenantConnectionService);
    create(admin: JwtPayload, dto: CreateCohortDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        endDate: Date;
    }>;
    findAll(admin: JwtPayload): Promise<({
        students: {
            id: string;
            userId: string;
            grade: string;
            ageGroup: string;
            studentCode: string;
            classId: string | null;
        }[];
        courses: {
            name: string;
            id: string;
            description: string | null;
            cohortId: string | null;
        }[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        endDate: Date;
    })[]>;
    findOne(admin: JwtPayload, id: string): Promise<{
        students: ({
            user: {
                id: string;
                firstName: string;
                lastName: string;
                email: string;
                passwordHash: string;
                role: import(".prisma/tenant-client/client").$Enums.UserRole;
                status: string;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: string;
            userId: string;
            grade: string;
            ageGroup: string;
            studentCode: string;
            classId: string | null;
        })[];
        courses: {
            name: string;
            id: string;
            description: string | null;
            cohortId: string | null;
        }[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        endDate: Date;
    }>;
}
