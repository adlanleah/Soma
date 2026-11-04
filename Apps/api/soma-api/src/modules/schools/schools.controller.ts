import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { SchoolsService } from './schools.service';
import { CreateSchoolDto } from './dto/create-school.dto';

@Controller('schools')
export class SchoolsController {
  constructor(private readonly schoolsService: SchoolsService) {}

  @Roles('SUPER_ADMIN')
  @Post()
  create(@Body() dto: CreateSchoolDto) {
    return this.schoolsService.create(dto);
  }

  @Roles('SUPER_ADMIN')
  @Get()
  findAll() {
    return this.schoolsService.findAll();
  }

  @Get('dashboard/summary')
  @Roles('SUPER_ADMIN')
  getDashboardSummary() {
    return this.schoolsService.getDashboardSummary();
  }

  @Post(':id/retry-provisioning')
  @Roles('SUPER_ADMIN')
  retryProvisioning(@Param('id') id: string) {
    return this.schoolsService.retryProvisioning(id);
  }
}
