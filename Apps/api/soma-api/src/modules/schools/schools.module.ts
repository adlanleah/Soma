import { Module } from '@nestjs/common';
import { SchoolsService } from './schools.service';
import { SchoolsController } from './schools.controller';
import { SchoolProvisionerService } from './school-provisioner/school-provisioner.service';

@Module({
  controllers: [SchoolsController],
  providers: [SchoolsService, SchoolProvisionerService],
})
export class SchoolsModule {}
