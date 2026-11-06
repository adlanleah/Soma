import * as jwtPayload from '../../common/interfaces/jwt-payload';
import { SuperAdminService } from './superadmin.service';
import { CreateSuperAdminDto } from './dto/create-super-admin.dto';
export declare class SuperAdminController {
    private readonly service;
    constructor(service: SuperAdminService);
    create(caller: jwtPayload.JwtPayload, dto: CreateSuperAdminDto): Promise<{
        id: string;
        name: string;
        email: string;
        tempPassword: string;
    }>;
    list(caller: jwtPayload.JwtPayload): Promise<{
        name: string;
        id: string;
        email: string;
        status: import(".prisma/master-client/client").$Enums.SuperAdminStatus;
        createdAt: Date;
        isPrimary: boolean;
        mustChangePassword: boolean;
    }[]>;
    deactivate(caller: jwtPayload.JwtPayload, id: string): Promise<{
        id: string;
        action: "delete" | "deactivate" | "reactivate";
    }>;
    reactivate(caller: jwtPayload.JwtPayload, id: string): Promise<{
        id: string;
        action: "delete" | "deactivate" | "reactivate";
    }>;
    remove(caller: jwtPayload.JwtPayload, id: string): Promise<{
        id: string;
        action: "delete" | "deactivate" | "reactivate";
    }>;
}
