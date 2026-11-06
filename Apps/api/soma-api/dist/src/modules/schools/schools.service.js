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
var SchoolsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchoolsService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const bcrypt = __importStar(require("bcrypt"));
const master_prisma_service_1 = require("../../database/master-prisma/master-prisma.service");
const tenant_connection_service_1 = require("../../database/tenant-connection/tenant-connection.service");
const school_provisioner_service_1 = require("../schools/school-provisioner/school-provisioner.service");
let SchoolsService = SchoolsService_1 = class SchoolsService {
    prisma;
    provisioner;
    tenantConnection;
    logger = new common_1.Logger(SchoolsService_1.name);
    constructor(prisma, provisioner, tenantConnection) {
        this.prisma = prisma;
        this.provisioner = provisioner;
        this.tenantConnection = tenantConnection;
    }
    get masterPrisma() {
        return this.prisma;
    }
    slugify(name) {
        return name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
    generateDatabaseName(slug) {
        const safeSlug = slug.replace(/-/g, '_').slice(0, 58);
        return `soma_${safeSlug}`;
    }
    getFrontendUrl() {
        return (process.env.FRONTEND_URL || 'http://localhost:4200').replace(/\/+$/, '');
    }
    createActivationUrl(schoolCode, rawToken) {
        return (`${this.getFrontendUrl()}/activate-account` +
            `?schoolCode=${encodeURIComponent(schoolCode)}` +
            `&token=${encodeURIComponent(rawToken)}`);
    }
    async generateUniqueSchoolCode(name) {
        const prefix = name
            .toUpperCase()
            .replace(/[^A-Z]/g, '')
            .slice(0, 4) || 'SOMA';
        for (let attempt = 0; attempt < 20; attempt++) {
            const number = Math.floor(1000 + Math.random() * 9000);
            const schoolCode = `${prefix}-${number}`;
            const existing = await this.masterPrisma.school.findUnique({
                where: { schoolCode },
            });
            if (!existing) {
                return schoolCode;
            }
        }
        throw new common_1.BadRequestException('Unable to generate a unique school code. Please try again.');
    }
    async createPrincipalInvitation(dbName, schoolCode, adminFirstName, adminLastName, adminEmail) {
        const tenant = this.tenantConnection.getClient({ dbName });
        const rawToken = (0, crypto_1.randomBytes)(32).toString('hex');
        const tokenHash = (0, crypto_1.createHash)('sha256').update(rawToken).digest('hex');
        const initialPassword = (0, crypto_1.randomBytes)(32).toString('hex');
        const passwordHash = await bcrypt.hash(initialPassword, 12);
        const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
        await tenant.user.create({
            data: {
                firstName: adminFirstName,
                lastName: adminLastName,
                email: adminEmail.trim().toLowerCase(),
                passwordHash,
                role: 'ADMIN',
                status: 'pending',
                adminProfile: {
                    create: {
                        adminLevel: 'PRINCIPAL',
                        title: 'Principal',
                    },
                },
                invitations: {
                    create: {
                        tokenHash,
                        expiresAt,
                    },
                },
            },
        });
        return {
            activationUrl: this.createActivationUrl(schoolCode, rawToken),
            expiresAt,
        };
    }
    async ensurePrincipalAccount(dbName, schoolCode, adminFirstName, adminLastName, adminEmail) {
        const tenant = this.tenantConnection.getClient({ dbName });
        const normalizedEmail = adminEmail.trim().toLowerCase();
        const existingPrincipal = await tenant.user.findUnique({
            where: {
                email: normalizedEmail,
            },
            include: {
                adminProfile: true,
            },
        });
        if (!existingPrincipal) {
            const invitation = await this.createPrincipalInvitation(dbName, schoolCode, adminFirstName, adminLastName, normalizedEmail);
            return {
                accountStatus: 'pending',
                invitation,
            };
        }
        if (existingPrincipal.role !== 'ADMIN') {
            throw new common_1.ConflictException('The principal email already belongs to a non-administrator account. Manual review is required.');
        }
        if (!existingPrincipal.adminProfile ||
            existingPrincipal.adminProfile.adminLevel !== 'PRINCIPAL') {
            throw new common_1.ConflictException('An administrator account exists for this email, but it is not configured as a principal. Manual review is required.');
        }
        if (existingPrincipal.status === 'active') {
            return {
                accountStatus: 'active',
                invitation: null,
            };
        }
        if (existingPrincipal.status !== 'pending') {
            throw new common_1.ConflictException(`The existing principal account has status "${existingPrincipal.status}". Manual review is required.`);
        }
        const rawToken = (0, crypto_1.randomBytes)(32).toString('hex');
        const tokenHash = (0, crypto_1.createHash)('sha256').update(rawToken).digest('hex');
        const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
        await tenant.user.update({
            where: {
                id: existingPrincipal.id,
            },
            data: {
                invitations: {
                    updateMany: {
                        where: {
                            usedAt: null,
                        },
                        data: {
                            usedAt: new Date(),
                        },
                    },
                    create: {
                        tokenHash,
                        expiresAt,
                    },
                },
            },
        });
        return {
            accountStatus: 'pending',
            invitation: {
                activationUrl: this.createActivationUrl(schoolCode, rawToken),
                expiresAt,
            },
        };
    }
    async create(dto) {
        const name = dto.name.trim();
        const country = dto.country.trim();
        const city = dto.city.trim();
        const address = dto.address.trim();
        const phone = dto.phone.trim();
        const adminFirstName = dto.adminFirstName.trim();
        const adminLastName = dto.adminLastName.trim();
        const adminEmail = dto.adminEmail.trim().toLowerCase();
        const adminPhone = dto.adminPhone.trim();
        const slug = this.slugify(name);
        if (!slug) {
            throw new common_1.BadRequestException('Please provide a valid school name.');
        }
        const emailPrefix = slug.replace(/-/g, '').slice(0, 20);
        const dbName = this.generateDatabaseName(slug);
        const existing = await this.masterPrisma.school.findFirst({
            where: {
                OR: [
                    {
                        name: {
                            equals: name,
                            mode: 'insensitive',
                        },
                    },
                    { slug },
                    { emailPrefix },
                    { dbName },
                ],
            },
        });
        if (existing) {
            throw new common_1.BadRequestException('A school with this name or identifier already exists.');
        }
        const schoolCode = await this.generateUniqueSchoolCode(name);
        const school = await this.masterPrisma.school.create({
            data: {
                name,
                slug,
                schoolCode,
                emailPrefix,
                country,
                city,
                address,
                phone,
                website: dto.website?.trim() || null,
                plan: dto.plan,
                status: 'PENDING',
                tenancyMode: 'DATABASE',
                dbName,
                schemaName: 'public',
                adminFirstName,
                adminLastName,
                adminEmail,
                adminPhone,
            },
        });
        try {
            await this.provisioner.provisionDatabase(dbName);
            this.logger.log(`Database provisioned for ${school.name}`);
            const principal = await this.ensurePrincipalAccount(dbName, schoolCode, adminFirstName, adminLastName, adminEmail);
            const activated = await this.masterPrisma.school.update({
                where: {
                    id: school.id,
                },
                data: {
                    status: 'ACTIVE',
                },
            });
            this.logger.log(`School ${activated.name} successfully provisioned (${activated.schoolCode})`);
            return {
                id: activated.id,
                name: activated.name,
                schoolCode: activated.schoolCode,
                plan: activated.plan,
                status: activated.status,
                tenancyMode: activated.tenancyMode,
                admin: {
                    firstName: activated.adminFirstName,
                    lastName: activated.adminLastName,
                    email: activated.adminEmail,
                    role: 'ADMIN',
                    adminLevel: 'PRINCIPAL',
                    accountStatus: principal.accountStatus,
                },
                invitation: principal.invitation
                    ? {
                        activationUrl: principal.invitation.activationUrl,
                        expiresAt: principal.invitation.expiresAt,
                        status: 'PENDING',
                    }
                    : null,
            };
        }
        catch (error) {
            this.logger.error(`School setup failed for ${school.name}`, error instanceof Error ? error.stack : String(error));
            await this.masterPrisma.school.update({
                where: {
                    id: school.id,
                },
                data: {
                    status: 'SUSPENDED',
                },
            });
            if (error instanceof common_1.ConflictException) {
                throw error;
            }
            throw new common_1.ServiceUnavailableException('The school record was saved, but its database or principal account setup failed. Please retry provisioning.');
        }
    }
    async retryProvisioning(schoolId) {
        const school = await this.masterPrisma.school.findUnique({
            where: {
                id: schoolId,
            },
        });
        if (!school) {
            throw new common_1.NotFoundException('School not found.');
        }
        if (school.status === 'ACTIVE') {
            throw new common_1.BadRequestException('This school is already active.');
        }
        if (!school.dbName || !school.adminEmail) {
            throw new common_1.BadRequestException('School database or principal details are missing.');
        }
        try {
            await this.provisioner.provisionDatabase(school.dbName);
            this.logger.log(`Database verified for ${school.name}`);
            const principal = await this.ensurePrincipalAccount(school.dbName, school.schoolCode, school.adminFirstName, school.adminLastName, school.adminEmail);
            const activated = await this.masterPrisma.school.update({
                where: {
                    id: school.id,
                },
                data: {
                    status: 'ACTIVE',
                },
            });
            this.logger.log(`School recovery completed: ${activated.name}`);
            return {
                id: activated.id,
                name: activated.name,
                schoolCode: activated.schoolCode,
                status: activated.status,
                plan: activated.plan,
                tenancyMode: activated.tenancyMode,
                admin: {
                    firstName: activated.adminFirstName,
                    lastName: activated.adminLastName,
                    email: activated.adminEmail,
                    role: 'ADMIN',
                    adminLevel: 'PRINCIPAL',
                    accountStatus: principal.accountStatus,
                },
                invitation: principal.invitation
                    ? {
                        activationUrl: principal.invitation.activationUrl,
                        expiresAt: principal.invitation.expiresAt,
                        status: 'PENDING',
                    }
                    : null,
            };
        }
        catch (error) {
            if (error instanceof common_1.ConflictException) {
                throw error;
            }
            this.logger.error(`School recovery failed for ${school.name}`, error instanceof Error ? error.stack : String(error));
            await this.masterPrisma.school.update({
                where: {
                    id: school.id,
                },
                data: {
                    status: 'SUSPENDED',
                },
            });
            throw new common_1.ServiceUnavailableException('School recovery failed. The existing school and tenant data have been preserved.');
        }
    }
    async findAll() {
        return this.masterPrisma.school.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async findByCode(schoolCode) {
        return this.masterPrisma.school.findUnique({
            where: {
                schoolCode: schoolCode.trim().toUpperCase(),
            },
        });
    }
    async getDashboardSummary() {
        const schools = await this.masterPrisma.school.findMany({
            select: {
                id: true,
                dbName: true,
            },
        });
        const provisionedSchools = schools.filter((school) => Boolean(school.dbName));
        const results = await Promise.allSettled(provisionedSchools.map(async (school) => {
            const tenant = this.tenantConnection.getClient({
                dbName: school.dbName,
            });
            const [students, teachers, parents, admins] = await Promise.all([
                tenant.user.count({
                    where: {
                        role: 'STUDENT',
                    },
                }),
                tenant.user.count({
                    where: {
                        role: 'TEACHER',
                    },
                }),
                tenant.user.count({
                    where: {
                        role: 'PARENT',
                    },
                }),
                tenant.user.count({
                    where: {
                        role: 'ADMIN',
                    },
                }),
            ]);
            return {
                students,
                teachers,
                parents,
                admins,
            };
        }));
        const totals = {
            students: 0,
            teachers: 0,
            parents: 0,
            admins: 0,
        };
        let successfulSchoolDatabases = 0;
        let unavailableSchoolDatabases = 0;
        for (const result of results) {
            if (result.status === 'fulfilled') {
                successfulSchoolDatabases++;
                totals.students += result.value.students;
                totals.teachers += result.value.teachers;
                totals.parents += result.value.parents;
                totals.admins += result.value.admins;
            }
            else {
                unavailableSchoolDatabases++;
                this.logger.error('Unable to retrieve user counts from a school database.', result.reason instanceof Error
                    ? result.reason.stack
                    : String(result.reason));
            }
        }
        const [activeSchools, pendingSchools, suspendedSchools] = await Promise.all([
            this.masterPrisma.school.count({
                where: {
                    status: 'ACTIVE',
                },
            }),
            this.masterPrisma.school.count({
                where: {
                    status: 'PENDING',
                },
            }),
            this.masterPrisma.school.count({
                where: {
                    status: 'SUSPENDED',
                },
            }),
        ]);
        return {
            schoolsSigned: schools.length,
            activeSchools,
            pendingSchools,
            suspendedSchools,
            ...totals,
            provisionedSchoolDatabases: provisionedSchools.length,
            successfulSchoolDatabases,
            unavailableSchoolDatabases,
            isUserCountComplete: unavailableSchoolDatabases === 0,
        };
    }
};
exports.SchoolsService = SchoolsService;
exports.SchoolsService = SchoolsService = SchoolsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [master_prisma_service_1.MasterPrismaService,
        school_provisioner_service_1.SchoolProvisionerService,
        tenant_connection_service_1.TenantConnectionService])
], SchoolsService);
//# sourceMappingURL=schools.service.js.map