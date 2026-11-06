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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CohortsService = void 0;
const common_1 = require("@nestjs/common");
const tenant_connection_service_1 = require("../../database/tenant-connection/tenant-connection.service");
let CohortsService = class CohortsService {
    tenantConnection;
    constructor(tenantConnection) {
        this.tenantConnection = tenantConnection;
    }
    async create(admin, dto) {
        const tenantClient = this.tenantConnection.getClient({
            dbName: admin.dbName,
        });
        return tenantClient.cohort.create({
            data: { name: dto.name, endDate: new Date(dto.endDate) },
        });
    }
    async findAll(admin) {
        const tenantClient = this.tenantConnection.getClient({
            dbName: admin.dbName,
        });
        return tenantClient.cohort.findMany({
            include: { students: true, courses: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(admin, id) {
        const tenantClient = this.tenantConnection.getClient({
            dbName: admin.dbName,
        });
        const cohort = await tenantClient.cohort.findUnique({
            where: { id },
            include: { students: { include: { user: true } }, courses: true },
        });
        if (!cohort)
            throw new common_1.NotFoundException('Cohort not found');
        return cohort;
    }
};
exports.CohortsService = CohortsService;
exports.CohortsService = CohortsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [tenant_connection_service_1.TenantConnectionService])
], CohortsService);
//# sourceMappingURL=cohorts.service.js.map