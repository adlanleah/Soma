import { Injectable, NotFoundException } from '@nestjs/common';
import { TenantConnectionService } from '../../database/tenant-connection/tenant-connection.service';
import { JwtPayload } from '../../common/interfaces/jwt-payload';
import { CreateCohortDto } from './dto/create-cohort.dto';

@Injectable()
export class CohortsService {
  constructor(private tenantConnection: TenantConnectionService) {}

  async create(admin: JwtPayload, dto: CreateCohortDto) {
    const tenantClient = this.tenantConnection.getClient({
      dbName: admin.dbName!,
    });
    return tenantClient.cohort.create({
      data: { name: dto.name, endDate: new Date(dto.endDate) },
    });
  }

  async findAll(admin: JwtPayload) {
    const tenantClient = this.tenantConnection.getClient({
      dbName: admin.dbName!,
    });
    return tenantClient.cohort.findMany({
      include: { students: true, courses: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(admin: JwtPayload, id: string) {
    const tenantClient = this.tenantConnection.getClient({
      dbName: admin.dbName!,
    });
    const cohort = await tenantClient.cohort.findUnique({
      where: { id },
      include: { students: { include: { user: true } }, courses: true },
    });
    if (!cohort) throw new NotFoundException('Cohort not found');
    return cohort;
  }
}
