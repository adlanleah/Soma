import { Body, Controller, Get, Post } from '@nestjs/common';
import { SchoolsService } from './schools.service';
import { CreateSchoolDto } from './dto/create-school.dto';
import { Public } from '../../common/decorators/public.decorator';

@Controller('schools')
export class SchoolsController {
  constructor(private readonly schoolsService: SchoolsService) {}

  @Public()
  @Post()
  create(@Body() dto: CreateSchoolDto) {
    return this.schoolsService.create(dto);
  }

  @Public()
  @Get()
  findAll() {
    return this.schoolsService.findAll();
  }
}
