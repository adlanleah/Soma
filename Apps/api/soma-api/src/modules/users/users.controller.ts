import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminLevels } from '../../common/decorators/admin-levels.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import * as jwtPayload from '../../common/interfaces/jwt-payload';
import { UsersService } from './users.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { CreateStudentDto } from './dto/create-student.dto';
import { CreateParentDto } from './dto/create-parent.dto';

@UseGuards(JwtAuthGuard)
@Roles('ADMIN')
@AdminLevels('PRINCIPAL', 'STAFF')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('teachers')
  createTeacher(
    @CurrentUser() admin: jwtPayload.JwtPayload,
    @Body() dto: CreateTeacherDto,
  ) {
    return this.usersService.createTeacher(admin, dto);
  }

  @Post('students')
  createStudent(
    @CurrentUser() admin: jwtPayload.JwtPayload,
    @Body() dto: CreateStudentDto,
  ) {
    return this.usersService.createStudent(admin, dto);
  }

  @Post('parents')
  createParent(
    @CurrentUser() admin: jwtPayload.JwtPayload,
    @Body() dto: CreateParentDto,
  ) {
    return this.usersService.createParent(admin, dto);
  }

  @Get()
  findAll(@CurrentUser() admin: jwtPayload.JwtPayload) {
    return this.usersService.findAll(admin);
  }
}
