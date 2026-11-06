import { Module } from '@nestjs/common';
import { MasterPrismaService } from '../../database/master-prisma/master-prisma.service';
import { SuperAdminService } from './superadmin.service';
import { SuperAdminController } from './superadmin.controller';

@Module({
  controllers: [SuperAdminController],
  providers: [SuperAdminService, MasterPrismaService],
})
export class SuperAdminModule {}
