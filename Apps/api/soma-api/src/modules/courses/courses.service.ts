import { Injectable, NotFoundException } from '@nestjs/common';
import { TenantConnectionService } from '../../database/tenant-connection/tenant-connection.service';
import { JwtPayload } from '../../common/interfaces/jwt-payload';
import { CreateCourseDto } from './dto/create-course.dto';

@Injectable()
export class CoursesService {
  constructor(private tenantConnection: TenantConnectionService) {}

  async create(admin: JwtPayload, dto: CreateCourseDto) {
    const tenantClient = this.tenantConnection.getClient({
      dbName: admin.dbName!,
    });

    if (dto.cohortId) {
      const cohort = await tenantClient.cohort.findUnique({
        where: { id: dto.cohortId },
      });
      if (!cohort) throw new NotFoundException('Cohort not found');
    }

    return tenantClient.course.create({
      data: {
        name: dto.name,
        description: dto.description,
        cohortId: dto.cohortId,
      },
    });
  }

  async findAll(admin: JwtPayload) {
    const tenantClient = this.tenantConnection.getClient({
      dbName: admin.dbName!,
    });
    return tenantClient.course.findMany({
      include: { cohort: true },
      orderBy: { name: 'asc' },
    });
  }
}
