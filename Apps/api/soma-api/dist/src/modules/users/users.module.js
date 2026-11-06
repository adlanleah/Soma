"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersModule = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("./users.service");
const users_controller_1 = require("./users.controller");
const bulk_import_service_1 = require("./bulk-import/bulk-import.service");
const master_prisma_service_1 = require("../../database/master-prisma/master-prisma.service");
const tenant_connection_service_1 = require("../../database/tenant-connection/tenant-connection.service");
const email_service_1 = require("../notifications/email/email.service");
let UsersModule = class UsersModule {
};
exports.UsersModule = UsersModule;
exports.UsersModule = UsersModule = __decorate([
    (0, common_1.Module)({
        controllers: [users_controller_1.UsersController],
        providers: [
            users_service_1.UsersService,
            bulk_import_service_1.BulkImportService,
            master_prisma_service_1.MasterPrismaService,
            tenant_connection_service_1.TenantConnectionService,
            email_service_1.EmailService,
        ],
    })
], UsersModule);
//# sourceMappingURL=users.module.js.map