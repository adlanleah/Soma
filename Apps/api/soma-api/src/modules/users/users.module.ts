import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { BulkImportService } from './bulk-import/bulk-import.service';
import { MasterPrismaService } from '../../database/master-prisma/master-prisma.service';
import { TenantConnectionService } from '../../database/tenant-connection/tenant-connection.service';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    BulkImportService,
    MasterPrismaService,
    TenantConnectionService,
  ],
})
export class UsersModule {}
