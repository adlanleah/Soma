import { JwtService } from '@nestjs/jwt';
import { MasterPrismaService } from '../../database/master-prisma/master-prisma.service';
import { TenantConnectionService } from '../../database/tenant-connection/tenant-connection.service';
import { LoginDto } from './dto/login.dto';
import { SuperAdminLoginDto } from './dto/super-admin-login.dto';
import { JwtPayload } from '../../common/interfaces/jwt-payload';
export declare class AuthService {
    private masterPrisma;
    private tenantConnection;
    private jwtService;
    constructor(masterPrisma: MasterPrismaService, tenantConnection: TenantConnectionService, jwtService: JwtService);
    login(dto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            firstName: string;
            lastName: string;
            email: string;
            role: import(".prisma/tenant-client/client").$Enums.UserRole;
            adminLevel: import(".prisma/tenant-client/client").$Enums.AdminLevel | null;
        };
        school: {
            name: string;
            schoolCode: string;
        };
    }>;
    validateUserFromPayload(payload: JwtPayload): Promise<JwtPayload>;
    getProfile(payload: JwtPayload): Promise<{
        user: {
            id: string;
            firstName: string;
            lastName: string;
            email: string;
            role: "SUPER_ADMIN";
            adminLevel: null;
        };
        school: null;
    } | {
        user: {
            id: string;
            firstName: string;
            lastName: string;
            email: string;
            role: import(".prisma/tenant-client/client").$Enums.UserRole;
            adminLevel: import(".prisma/tenant-client/client").$Enums.AdminLevel | null;
        };
        school: {
            name: string;
            schoolCode: string;
        };
    }>;
    superAdminLogin(dto: SuperAdminLoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            name: string;
            email: string;
            role: string;
        };
    }>;
}
