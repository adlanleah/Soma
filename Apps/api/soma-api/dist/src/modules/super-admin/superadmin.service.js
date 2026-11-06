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
var SuperAdminService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuperAdminService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcrypt"));
const master_client_1 = require(".prisma/master-client");
const master_prisma_service_1 = require("../../database/master-prisma/master-prisma.service");
const generate_email_1 = require("../../shared/utils/generate-email");
const MAX_SUPER_ADMINS = 3;
let SuperAdminService = SuperAdminService_1 = class SuperAdminService {
    prisma;
    logger = new common_1.Logger(SuperAdminService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async requirePrimary(caller) {
        const me = await this.prisma.superAdmin.findUnique({
            where: { id: caller.sub },
        });
        if (!me || me.status !== master_client_1.SuperAdminStatus.ACTIVE || !me.isPrimary) {
            throw new common_1.ForbiddenException('Only the primary super admin can manage other super admins');
        }
        return me;
    }
    async create(caller, dto) {
        const primary = await this.requirePrimary(caller);
        const count = await this.prisma.superAdmin.count();
        if (count >= MAX_SUPER_ADMINS) {
            throw new common_1.BadRequestException(`A maximum of ${MAX_SUPER_ADMINS} super admin accounts is allowed`);
        }
        const email = dto.email.trim().toLowerCase();
        if (await this.prisma.superAdmin.findUnique({ where: { email } })) {
            throw new common_1.ConflictException('A super admin with that email already exists');
        }
        const tempPassword = (0, generate_email_1.generateTempPassword)(12);
        const created = await this.prisma.superAdmin.create({
            data: {
                name: dto.name,
                email,
                passwordHash: await bcrypt.hash(tempPassword, 12),
                mustChangePassword: true,
                createdBy: primary.id,
                status: master_client_1.SuperAdminStatus.ACTIVE,
            },
        });
        this.logger.log(`AUDIT create-super-admin id=${created.id} by=${primary.id}`);
        return {
            id: created.id,
            name: created.name,
            email,
            tempPassword,
        };
    }
    async list(caller) {
        await this.requirePrimary(caller);
        return this.prisma.superAdmin.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                isPrimary: true,
                status: true,
                mustChangePassword: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'asc' },
        });
    }
    async setStatus(caller, id, action) {
        const primary = await this.requirePrimary(caller);
        if (id === primary.id) {
            throw new common_1.BadRequestException('You cannot change your own account');
        }
        const target = await this.prisma.superAdmin.findUnique({
            where: { id },
        });
        if (!target) {
            throw new common_1.NotFoundException('Super admin not found');
        }
        if (target.isPrimary) {
            throw new common_1.ForbiddenException('The primary account cannot be changed here');
        }
        if (action === 'delete') {
            await this.prisma.superAdmin.delete({
                where: { id },
            });
        }
        else {
            await this.prisma.superAdmin.update({
                where: { id },
                data: {
                    status: action === 'deactivate'
                        ? master_client_1.SuperAdminStatus.DEACTIVATED
                        : master_client_1.SuperAdminStatus.ACTIVE,
                },
            });
        }
        this.logger.log(`AUDIT super-admin-${action} id=${id} by=${primary.id}`);
        return { id, action };
    }
};
exports.SuperAdminService = SuperAdminService;
exports.SuperAdminService = SuperAdminService = SuperAdminService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [master_prisma_service_1.MasterPrismaService])
], SuperAdminService);
//# sourceMappingURL=superadmin.service.js.map