import { ConfigService } from '@nestjs/config';
export declare class SchoolProvisionerService {
    private config;
    private readonly logger;
    constructor(config: ConfigService);
    private assertSafeIdentifier;
    provisionDatabase(dbName: string): Promise<void>;
    private runTenantMigrations;
}
