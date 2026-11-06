import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminLevels } from '../../common/decorators/admin-levels.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import * as jwtPayload from '../../common/interfaces/jwt-payload';
import { CohortsService } from './cohorts.service';
import { CreateCohortDto } from './dto/create-cohort.dto';

@Controller('cohorts')
export class CohortsController {
  constructor(private cohortsService: CohortsService) {}

  @Roles('ADMIN')
  @AdminLevels('PRINCIPAL', 'STAFF', 'ACADEMIC')
  @Post()
  create(
    @CurrentUser() admin: jwtPayload.JwtPayload,
    @Body() dto: CreateCohortDto,
  ) {
    return this.cohortsService.create(admin, dto);
  }

  @Roles('ADMIN', 'TEACHER')
  @Get()
  findAll(@CurrentUser() user: jwtPayload.JwtPayload) {
    return this.cohortsService.findAll(user);
  }

  @Roles('ADMIN', 'TEACHER')
  @Get(':id')
  findOne(@CurrentUser() user: jwtPayload.JwtPayload, @Param('id') id: string) {
    return this.cohortsService.findOne(user, id);
  }
}
