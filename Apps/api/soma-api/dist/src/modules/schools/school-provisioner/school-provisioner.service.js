"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SchoolProvisionerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchoolProvisionerService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const pg_1 = require("pg");
const child_process_1 = require("child_process");
const path = __importStar(require("path"));
let SchoolProvisionerService = SchoolProvisionerService_1 = class SchoolProvisionerService {
    config;
    logger = new common_1.Logger(SchoolProvisionerService_1.name);
    constructor(config) {
        this.config = config;
    }
    assertSafeIdentifier(name) {
        if (!/^[a-z0-9_]+$/.test(name)) {
            throw new Error(`Unsafe database identifier: ${name}`);
        }
    }
    async provisionDatabase(dbName) {
        this.assertSafeIdentifier(dbName);
        const client = new pg_1.Client({
            connectionString: this.config.get('POSTGRES_ADMIN_URL'),
        });
        await client.connect();
        try {
            const exists = await client.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]);
            if (exists.rowCount === 0) {
                await client.query(`CREATE DATABASE "${dbName}"`);
                this.logger.log(`Database "${dbName}" created`);
            }
            else {
                this.logger.log(`Database "${dbName}" already exists`);
            }
        }
        finally {
            await client.end();
        }
        this.runTenantMigrations(dbName);
    }
    runTenantMigrations(dbName) {
        const host = this.config.get('POSTGRES_HOST');
        const port = this.config.get('POSTGRES_PORT');
        const user = this.config.get('POSTGRES_USER');
        const pass = this.config.get('POSTGRES_PASSWORD');
        const tenantUrl = `postgresql://${user}:${pass}@${host}:${port}/${dbName}`;
        const schemaPath = path.join(process.cwd(), 'prisma/tenant/schema.prisma');
        const configPath = path.join(process.cwd(), 'prisma.tenant.config.ts');
        this.logger.log(`Running tenant migrations for ${dbName}`);
        (0, child_process_1.execSync)(`npx prisma db push --schema="${schemaPath}" --config="${configPath}"`, {
            env: {
                ...process.env,
                TENANT_DATABASE_URL: tenantUrl,
            },
            stdio: 'inherit',
        });
    }
};
exports.SchoolProvisionerService = SchoolProvisionerService;
exports.SchoolProvisionerService = SchoolProvisionerService = SchoolProvisionerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], SchoolProvisionerService);
//# sourceMappingURL=school-provisioner.service.js.map