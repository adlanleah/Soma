import { MasterPrismaService } from '../../database/master-prisma/master-prisma.service';
import { JwtPayload } from '../../common/interfaces/jwt-payload';
import { CreateSuperAdminDto } from './dto/create-super-admin.dto';
export declare class SuperAdminService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: MasterPrismaService);
    private requirePrimary;
    create(caller: JwtPayload, dto: CreateSuperAdminDto): Promise<{
        id: string;
        name: string;
        email: string;
        tempPassword: string;
    }>;
    list(caller: JwtPayload): Promise<{
        name: string;
        id: string;
        email: string;
        status: import(".prisma/master-client").$Enums.SuperAdminStatus;
        createdAt: Date;
        isPrimary: boolean;
        mustChangePassword: boolean;
    }[]>;
    setStatus(caller: JwtPayload, id: string, action: 'deactivate' | 'reactivate' | 'delete'): Promise<{
        id: string;
        action: "delete" | "deactivate" | "reactivate";
    }>;
}
