import { BadRequestException, Injectable } from '@nestjs/common';
import { MasterPrismaService } from '../../database/master-prisma/master-prisma.service';
import { SchoolProvisionerService } from '../schools/school-provisioner/school-provisioner.service';
import { CreateSchoolDto } from './dto/create-school.dto';

@Injectable()
export class SchoolsService {
  constructor(
    private prisma: MasterPrismaService,
    private provisioner: SchoolProvisionerService,
  ) {}

  private get masterPrisma(): MasterPrismaService {
    return this.prisma;
  }

  private slugify(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  private generateSchoolCode(name: string): string {
    const prefix =
      name
        .toUpperCase()
        .replace(/[^A-Z]/g, '')
        .slice(0, 4) || 'SOMA';
    const num = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${num}`;
  }

  async create(dto: CreateSchoolDto) {
    const slug = this.slugify(dto.name);
    const emailPrefix = slug.replace(/-/g, '').slice(0, 20);
    const dbName = `soma_${slug.replace(/-/g, '_')}`;

    const existing = await this.masterPrisma.school.findFirst({
      where: { OR: [{ name: dto.name }, { slug }, { emailPrefix }] },
    });
    if (existing) {
      throw new BadRequestException('A school with this name already exists');
    }

    const schoolCode = this.generateSchoolCode(dto.name);

    const school = await this.masterPrisma.school.create({
      data: {
        name: dto.name,
        slug,
        schoolCode,
        emailPrefix,
        country: dto.country,
        city: dto.city,
        address: dto.address,
        phone: dto.phone,
        website: dto.website,
        plan: dto.plan,
        status: 'PENDING',
        tenancyMode: 'DATABASE',
        dbName,
        schemaName: 'public', // always public now — the DB itself is the isolation boundary
        adminFirstName: dto.adminFirstName,
        adminLastName: dto.adminLastName,
        adminEmail: dto.adminEmail,
        adminPhone: dto.adminPhone,
      },
    });

    try {
      await this.provisioner.provisionDatabase(dbName);
    } catch (err) {
      await this.masterPrisma.school.update({
        where: { id: school.id },
        data: { status: 'SUSPENDED' },
      });
      throw new BadRequestException(
        `School record created but provisioning failed: ${err instanceof Error ? err.message : 'unknown error'}`,
      );
    }

    const activated = await this.masterPrisma.school.update({
      where: { id: school.id },
      data: { status: 'ACTIVE' },
    });

    return {
      id: activated.id,
      name: activated.name,
      schoolCode: activated.schoolCode,
      schoolEmail: `${activated.emailPrefix}.soma@gmail.com`,
      plan: activated.plan,
      status: activated.status,
    };
  }

  async findAll() {
    return this.masterPrisma.school.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByCode(schoolCode: string) {
    return this.masterPrisma.school.findUnique({ where: { schoolCode } });
  }
}
