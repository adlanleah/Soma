import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';

import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import * as jwtPayload from '../../common/interfaces/jwt-payload';

import { SuperAdminService } from './superadmin.service';
import { CreateSuperAdminDto } from './dto/create-super-admin.dto';

@Roles('SUPER_ADMIN')
@Controller('super-admins')
export class SuperAdminController {
  constructor(private readonly service: SuperAdminService) {}

  @Post()
  create(
    @CurrentUser() caller: jwtPayload.JwtPayload,
    @Body() dto: CreateSuperAdminDto,
  ) {
    return this.service.create(caller, dto);
  }

  @Get()
  list(@CurrentUser() caller: jwtPayload.JwtPayload) {
    return this.service.list(caller);
  }

  @Patch(':id/deactivate')
  deactivate(
    @CurrentUser() caller: jwtPayload.JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.setStatus(caller, id, 'deactivate');
  }

  @Patch(':id/reactivate')
  reactivate(
    @CurrentUser() caller: jwtPayload.JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.setStatus(caller, id, 'reactivate');
  }

  @Delete(':id')
  remove(
    @CurrentUser() caller: jwtPayload.JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.setStatus(caller, id, 'delete');
  }
}
