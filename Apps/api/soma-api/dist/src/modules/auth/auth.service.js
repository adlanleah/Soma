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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const master_prisma_service_1 = require("../../database/master-prisma/master-prisma.service");
const tenant_connection_service_1 = require("../../database/tenant-connection/tenant-connection.service");
let AuthService = class AuthService {
    masterPrisma;
    tenantConnection;
    jwtService;
    constructor(masterPrisma, tenantConnection, jwtService) {
        this.masterPrisma = masterPrisma;
        this.tenantConnection = tenantConnection;
        this.jwtService = jwtService;
    }
    async login(dto) {
        const school = await this.masterPrisma.school.findUnique({
            where: { schoolCode: dto.schoolCode },
        });
        if (!school || school.status !== 'ACTIVE') {
            throw new common_1.UnauthorizedException('Invalid school code or school is not active');
        }
        const tenantClient = this.tenantConnection.getClient({
            dbName: school.dbName,
        });
        const user = await tenantClient.user.findUnique({
            where: { email: dto.email },
            include: { adminProfile: true },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!passwordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (user.status !== 'active') {
            throw new common_1.UnauthorizedException('Account is not active yet');
        }
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            adminLevel: user.adminProfile?.adminLevel,
            schoolCode: school.schoolCode,
            schemaName: school.schemaName,
            dbName: school.dbName,
            tenancyMode: school.tenancyMode,
        };
        const accessToken = this.jwtService.sign(payload, {
            expiresIn: '15m',
        });
        const refreshToken = this.jwtService.sign(payload, {
            expiresIn: '7d',
        });
        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                adminLevel: user.adminProfile?.adminLevel ?? null,
            },
            school: {
                name: school.name,
                schoolCode: school.schoolCode,
            },
        };
    }
    async validateUserFromPayload(payload) {
        if (payload.role === 'SUPER_ADMIN') {
            const superAdmin = await this.masterPrisma.superAdmin.findUnique({
                where: { id: payload.sub },
            });
            if (!superAdmin || superAdmin.status !== 'ACTIVE') {
                throw new common_1.UnauthorizedException('User no longer valid');
            }
            return payload;
        }
        if (!payload.dbName) {
            throw new common_1.UnauthorizedException('Invalid token payload');
        }
        const tenantClient = this.tenantConnection.getClient({
            dbName: payload.dbName,
        });
        const user = await tenantClient.user.findUnique({
            where: { id: payload.sub },
        });
        if (!user || user.status !== 'active') {
            throw new common_1.UnauthorizedException('User no longer valid');
        }
        return payload;
    }
    async getProfile(payload) {
        if (payload.role === 'SUPER_ADMIN') {
            const sa = await this.masterPrisma.superAdmin.findUnique({
                where: { id: payload.sub },
            });
            if (!sa || sa.status !== 'ACTIVE') {
                throw new common_1.UnauthorizedException('User no longer valid');
            }
            const [firstName, ...rest] = sa.name.split(' ');
            return {
                user: {
                    id: sa.id,
                    firstName,
                    lastName: rest.join(' '),
                    email: sa.email,
                    role: 'SUPER_ADMIN',
                    adminLevel: null,
                },
                school: null,
            };
        }
        const school = await this.masterPrisma.school.findUnique({
            where: { schoolCode: payload.schoolCode },
        });
        if (!school || school.status !== 'ACTIVE' || !school.dbName) {
            throw new common_1.UnauthorizedException('School no longer valid');
        }
        const tenantClient = this.tenantConnection.getClient({
            dbName: school.dbName,
        });
        const user = await tenantClient.user.findUnique({
            where: { id: payload.sub },
            include: { adminProfile: true },
        });
        if (!user || user.status !== 'active') {
            throw new common_1.UnauthorizedException('User no longer valid');
        }
        return {
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                adminLevel: user.adminProfile?.adminLevel ?? null,
            },
            school: {
                name: school.name,
                schoolCode: school.schoolCode,
            },
        };
    }
    async superAdminLogin(dto) {
        const superAdmin = await this.masterPrisma.superAdmin.findUnique({
            where: {
                email: dto.email.trim().toLowerCase(),
            },
        });
        if (!superAdmin) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const passwordValid = await bcrypt.compare(dto.password, superAdmin.passwordHash);
        if (!passwordValid || superAdmin.status !== 'ACTIVE') {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const payload = {
            sub: superAdmin.id,
            email: superAdmin.email,
            role: 'SUPER_ADMIN',
            schoolCode: '',
            schemaName: '',
            dbName: null,
            tenancyMode: 'DATABASE',
        };
        const accessToken = this.jwtService.sign(payload, {
            expiresIn: '15m',
        });
        const refreshToken = this.jwtService.sign(payload, {
            expiresIn: '7d',
        });
        return {
            accessToken,
            refreshToken,
            user: {
                id: superAdmin.id,
                name: superAdmin.name,
                email: superAdmin.email,
                role: 'SUPER_ADMIN',
            },
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [master_prisma_service_1.MasterPrismaService,
        tenant_connection_service_1.TenantConnectionService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map