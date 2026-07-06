import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { TenantConnectionService } from '../../database/tenant-connection/tenant-connection.service';

@Module({
  controllers: [CoursesController],
  providers: [CoursesService, TenantConnectionService],
})
export class CoursesModule {}
