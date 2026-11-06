import { Module } from '@nestjs/common';
import { SchoolsService } from './schools.service';
import { SchoolsController } from './schools.controller';
import { SchoolProvisionerService } from './school-provisioner/school-provisioner.service';
import { MasterPrismaService } from '../../database/master-prisma/master-prisma.service';
import { TenantConnectionService } from '../../database/tenant-connection/tenant-connection.service';

@Module({
  controllers: [SchoolsController],
  providers: [
    SchoolsService,
    SchoolProvisionerService,
    MasterPrismaService,
    TenantConnectionService,
  ],
})
export class SchoolsModule {}
