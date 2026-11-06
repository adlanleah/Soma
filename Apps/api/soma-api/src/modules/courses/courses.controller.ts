import { Body, Controller, Get, Post } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminLevels } from '../../common/decorators/admin-levels.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import * as jwtPayload from '../../common/interfaces/jwt-payload';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';

@Controller('courses')
export class CoursesController {
  constructor(private coursesService: CoursesService) {}

  @Roles('ADMIN')
  @AdminLevels('PRINCIPAL', 'STAFF', 'ACADEMIC')
  @Post()
  create(
    @CurrentUser() admin: jwtPayload.JwtPayload,
    @Body() dto: CreateCourseDto,
  ) {
    return this.coursesService.create(admin, dto);
  }

  @Roles('ADMIN', 'TEACHER')
  @Get()
  findAll(@CurrentUser() user: jwtPayload.JwtPayload) {
    return this.coursesService.findAll(user);
  }
}
