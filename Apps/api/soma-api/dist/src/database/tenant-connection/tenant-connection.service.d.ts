import { OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '.prisma/tenant-client';
export interface TenantContext {
    dbName: string;
}
export declare class TenantConnectionService implements OnModuleDestroy {
    private readonly config;
    private readonly logger;
    private readonly clients;
    constructor(config: ConfigService);
    getClient(ctx: TenantContext): PrismaClient;
    disconnectTenant(dbName: string): Promise<void>;
    onModuleDestroy(): Promise<void>;
}
