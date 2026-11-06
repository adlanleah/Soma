import { SchoolsService } from './schools.service';
import { CreateSchoolDto } from './dto/create-school.dto';
export declare class SchoolsController {
    private readonly schoolsService;
    constructor(schoolsService: SchoolsService);
    create(dto: CreateSchoolDto): Promise<{
        id: string;
        name: string;
        schoolCode: string;
        plan: import(".prisma/master-client/client").$Enums.SchoolPlan;
        status: import(".prisma/master-client/client").$Enums.SchoolStatus;
        tenancyMode: import(".prisma/master-client/client").$Enums.TenancyMode;
        admin: {
            firstName: string;
            lastName: string;
            email: string;
            role: string;
            adminLevel: string;
            accountStatus: string;
        };
        invitation: {
            activationUrl: string;
            expiresAt: Date;
            status: string;
        } | null;
    }>;
    findAll(): Promise<{
        id: string;
        name: string;
        slug: string;
        schoolCode: string;
        emailPrefix: string;
        country: string;
        city: string;
        address: string;
        phone: string;
        website: string | null;
        plan: import(".prisma/master-client/client").$Enums.SchoolPlan;
        status: import(".prisma/master-client/client").$Enums.SchoolStatus;
        tenancyMode: import(".prisma/master-client/client").$Enums.TenancyMode;
        dbName: string | null;
        schemaName: string;
        adminFirstName: string;
        adminLastName: string;
        adminEmail: string;
        adminPhone: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getDashboardSummary(): Promise<{
        provisionedSchoolDatabases: number;
        successfulSchoolDatabases: number;
        unavailableSchoolDatabases: number;
        isUserCountComplete: boolean;
        students: number;
        teachers: number;
        parents: number;
        admins: number;
        schoolsSigned: number;
        activeSchools: number;
        pendingSchools: number;
        suspendedSchools: number;
    }>;
    retryProvisioning(id: string): Promise<{
        id: string;
        name: string;
        schoolCode: string;
        status: import(".prisma/master-client/client").$Enums.SchoolStatus;
        plan: import(".prisma/master-client/client").$Enums.SchoolPlan;
        tenancyMode: import(".prisma/master-client/client").$Enums.TenancyMode;
        admin: {
            firstName: string;
            lastName: string;
            email: string;
            role: string;
            adminLevel: string;
            accountStatus: string;
        };
        invitation: {
            activationUrl: string;
            expiresAt: Date;
            status: string;
        } | null;
    }>;
}
