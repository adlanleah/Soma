"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var TenantConnectionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantConnectionService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const tenant_client_1 = require(".prisma/tenant-client");
const adapter_pg_1 = require("@prisma/adapter-pg");
let TenantConnectionService = TenantConnectionService_1 = class TenantConnectionService {
    config;
    logger = new common_1.Logger(TenantConnectionService_1.name);
    clients = new Map();
    constructor(config) {
        this.config = config;
    }
    getClient(ctx) {
        const dbName = ctx.dbName.trim();
        if (!/^[a-z0-9_]+$/.test(dbName)) {
            throw new Error('Invalid tenant database name');
        }
        const existingClient = this.clients.get(dbName);
        if (existingClient) {
            return existingClient;
        }
        const host = this.config.get('POSTGRES_HOST');
        const port = Number(this.config.get('POSTGRES_PORT'));
        const user = this.config.get('POSTGRES_USER');
        const password = this.config.get('POSTGRES_PASSWORD');
        if (!host || !port || !user || !password) {
            throw new Error('PostgreSQL connection configuration is incomplete');
        }
        const adapter = new adapter_pg_1.PrismaPg({
            host,
            port,
            user,
            password,
            database: dbName,
        });
        const client = new tenant_client_1.PrismaClient({ adapter });
        this.clients.set(dbName, client);
        this.logger.log(`Tenant connection initialized: ${dbName}`);
        return client;
    }
    async disconnectTenant(dbName) {
        const client = this.clients.get(dbName);
        if (!client) {
            return;
        }
        await client.$disconnect();
        this.clients.delete(dbName);
        this.logger.log(`Tenant connection closed: ${dbName}`);
    }
    async onModuleDestroy() {
        await Promise.all([...this.clients.entries()].map(async ([dbName, client]) => {
            try {
                await client.$disconnect();
                this.logger.log(`Disconnected tenant: ${dbName}`);
            }
            catch (error) {
                this.logger.error(`Failed to disconnect tenant: ${dbName}`, error instanceof Error ? error.stack : String(error));
            }
        }));
        this.clients.clear();
    }
};
exports.TenantConnectionService = TenantConnectionService;
exports.TenantConnectionService = TenantConnectionService = TenantConnectionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], TenantConnectionService);
//# sourceMappingURL=tenant-connection.service.js.map