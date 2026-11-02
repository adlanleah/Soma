import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { SuperAdminStatus } from '.prisma/master-client';
import { MasterPrismaService } from '../../database/master-prisma/master-prisma.service';
import { JwtPayload } from '../../common/interfaces/jwt-payload';
import { generateTempPassword } from '../../shared/utils/generate-email';
import { CreateSuperAdminDto } from './dto/create-super-admin.dto';

const MAX_SUPER_ADMINS = 3;

@Injectable()
export class SuperAdminService {
  private readonly logger = new Logger(SuperAdminService.name);

  constructor(private readonly prisma: MasterPrismaService) {}

  /**
   * Checks the database, never the token,
   * so a revoked primary loses power immediately.
   */
  private async requirePrimary(caller: JwtPayload) {
    const me = await this.prisma.superAdmin.findUnique({
      where: { id: caller.sub },
    });

    if (!me || me.status !== SuperAdminStatus.ACTIVE || !me.isPrimary) {
      throw new ForbiddenException(
        'Only the primary super admin can manage other super admins',
      );
    }

    return me;
  }

  async create(caller: JwtPayload, dto: CreateSuperAdminDto) {
    const primary = await this.requirePrimary(caller);

    const count = await this.prisma.superAdmin.count();

    if (count >= MAX_SUPER_ADMINS) {
      throw new BadRequestException(
        `A maximum of ${MAX_SUPER_ADMINS} super admin accounts is allowed`,
      );
    }

    const email = dto.email.trim().toLowerCase();

    if (await this.prisma.superAdmin.findUnique({ where: { email } })) {
      throw new ConflictException(
        'A super admin with that email already exists',
      );
    }

    const tempPassword = generateTempPassword(12);

    const created = await this.prisma.superAdmin.create({
      data: {
        name: dto.name,
        email,
        passwordHash: await bcrypt.hash(tempPassword, 12),
        mustChangePassword: true,
        createdBy: primary.id,
        status: SuperAdminStatus.ACTIVE,
      },
    });

    this.logger.log(
      `AUDIT create-super-admin id=${created.id} by=${primary.id}`,
    );

    // Shown once, to the authenticated primary, to pass on privately.
    return {
      id: created.id,
      name: created.name,
      email,
      tempPassword,
    };
  }

  async list(caller: JwtPayload) {
    await this.requirePrimary(caller);

    return this.prisma.superAdmin.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        isPrimary: true,
        status: true,
        mustChangePassword: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async setStatus(
    caller: JwtPayload,
    id: string,
    action: 'deactivate' | 'reactivate' | 'delete',
  ) {
    const primary = await this.requirePrimary(caller);

    if (id === primary.id) {
      throw new BadRequestException('You cannot change your own account');
    }

    const target = await this.prisma.superAdmin.findUnique({
      where: { id },
    });

    if (!target) {
      throw new NotFoundException('Super admin not found');
    }

    if (target.isPrimary) {
      throw new ForbiddenException(
        'The primary account cannot be changed here',
      );
    }

    if (action === 'delete') {
      await this.prisma.superAdmin.delete({
        where: { id },
      });
    } else {
      await this.prisma.superAdmin.update({
        where: { id },
        data: {
          status:
            action === 'deactivate'
              ? SuperAdminStatus.DEACTIVATED
              : SuperAdminStatus.ACTIVE,
        },
      });
    }

    this.logger.log(`AUDIT super-admin-${action} id=${id} by=${primary.id}`);

    return { id, action };
  }
}
