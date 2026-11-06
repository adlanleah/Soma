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
exports.CoursesService = void 0;
const common_1 = require("@nestjs/common");
const tenant_connection_service_1 = require("../../database/tenant-connection/tenant-connection.service");
let CoursesService = class CoursesService {
    tenantConnection;
    constructor(tenantConnection) {
        this.tenantConnection = tenantConnection;
    }
    async create(admin, dto) {
        const tenantClient = this.tenantConnection.getClient({
            dbName: admin.dbName,
        });
        if (dto.cohortId) {
            const cohort = await tenantClient.cohort.findUnique({
                where: { id: dto.cohortId },
            });
            if (!cohort)
                throw new common_1.NotFoundException('Cohort not found');
        }
        return tenantClient.course.create({
            data: {
                name: dto.name,
                description: dto.description,
                cohortId: dto.cohortId,
            },
        });
    }
    async findAll(admin) {
        const tenantClient = this.tenantConnection.getClient({
            dbName: admin.dbName,
        });
        return tenantClient.course.findMany({
            include: { cohort: true },
            orderBy: { name: 'asc' },
        });
    }
};
exports.CoursesService = CoursesService;
exports.CoursesService = CoursesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [tenant_connection_service_1.TenantConnectionService])
], CoursesService);
//# sourceMappingURL=courses.service.js.map