import { Module } from '@nestjs/common';
import { CohortsService } from './cohorts.service';
import { CohortsController } from './cohorts.controller';
import { TenantConnectionService } from '../../database/tenant-connection/tenant-connection.service';

@Module({
  controllers: [CohortsController],
  providers: [CohortsService, TenantConnectionService],
})
export class CohortsModule {}
