import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SuperAdminLoginDto } from './dto/super-admin-login.dto';
import * as jwtPayload from '../../common/interfaces/jwt-payload';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
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
    me(user: jwtPayload.JwtPayload): Promise<{
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
}
