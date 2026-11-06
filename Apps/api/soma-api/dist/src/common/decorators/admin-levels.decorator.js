"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminLevels = exports.ADMIN_LEVELS_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.ADMIN_LEVELS_KEY = 'adminLevels';
const AdminLevels = (...levels) => (0, common_1.SetMetadata)(exports.ADMIN_LEVELS_KEY, levels);
exports.AdminLevels = AdminLevels;
//# sourceMappingURL=admin-levels.decorator.js.map