"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const config_1 = require("prisma/config");
exports.default = (0, config_1.defineConfig)({
    schema: 'prisma/tenant/schema.prisma',
    datasource: {
        url: process.env.TENANT_DATABASE_URL,
    },
});
//# sourceMappingURL=prisma.tenant.config.js.map