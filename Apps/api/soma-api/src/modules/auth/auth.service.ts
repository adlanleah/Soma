import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { MasterPrismaService } from '../../database/master-prisma/master-prisma.service';
import { TenantConnectionService } from '../../database/tenant-connection/tenant-connection.service';

import { LoginDto } from './dto/login.dto';
import { SuperAdminLoginDto } from './dto/super-admin-login.dto';
import { JwtPayload } from '../../common/interfaces/jwt-payload';

@Injectable()
export class AuthService {
  constructor(
    private masterPrisma: MasterPrismaService,
    private tenantConnection: TenantConnectionService,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    // 1. Find the school in the master DB
    const school = await this.masterPrisma.school.findUnique({
      where: { schoolCode: dto.schoolCode },
    });

    if (!school || school.status !== 'ACTIVE') {
      throw new UnauthorizedException(
        'Invalid school code or school is not active',
      );
    }

    // 2. Connect to that school's tenant schema/database
    const tenantClient = this.tenantConnection.getClient({
      dbName: school.dbName!,
    });

    // 3. Find the user inside that tenant
    const user = await tenantClient.user.findUnique({
      where: { email: dto.email },
      include: { adminProfile: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 4. Verify password
    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 5. Check account status
    if (user.status !== 'active') {
      throw new UnauthorizedException('Account is not active yet');
    }

    // 6. Build JWT payload
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      adminLevel: user.adminProfile?.adminLevel,
      schoolCode: school.schoolCode,
      schemaName: school.schemaName,
      dbName: school.dbName,
      tenancyMode: school.tenancyMode,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        adminLevel: user.adminProfile?.adminLevel ?? null,
      },
      school: {
        name: school.name,
        schoolCode: school.schoolCode,
      },
    };
  }

  async validateUserFromPayload(payload: JwtPayload) {
    // Super admins live in the master DB
    if (payload.role === 'SUPER_ADMIN') {
      const superAdmin = await this.masterPrisma.superAdmin.findUnique({
        where: { id: payload.sub },
      });

      // Reject deleted or deactivated super admins
      if (!superAdmin || superAdmin.status !== 'ACTIVE') {
        throw new UnauthorizedException('User no longer valid');
      }

      return payload;
    }

    // School users must have tenant information
    if (!payload.dbName) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const tenantClient = this.tenantConnection.getClient({
      dbName: payload.dbName,
    });

    const user = await tenantClient.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || user.status !== 'active') {
      throw new UnauthorizedException('User no longer valid');
    }

    return payload;
  }

  async getProfile(payload: JwtPayload) {
    // Super admin profile
    if (payload.role === 'SUPER_ADMIN') {
      const sa = await this.masterPrisma.superAdmin.findUnique({
        where: { id: payload.sub },
      });

      if (!sa || sa.status !== 'ACTIVE') {
        throw new UnauthorizedException('User no longer valid');
      }

      const [firstName, ...rest] = sa.name.split(' ');

      return {
        user: {
          id: sa.id,
          firstName,
          lastName: rest.join(' '),
          email: sa.email,
          role: 'SUPER_ADMIN' as const,
          adminLevel: null,
        },
        school: null,
      };
    }

    // School user profile
    const school = await this.masterPrisma.school.findUnique({
      where: { schoolCode: payload.schoolCode },
    });

    if (!school || school.status !== 'ACTIVE' || !school.dbName) {
      throw new UnauthorizedException('School no longer valid');
    }

    const tenantClient = this.tenantConnection.getClient({
      dbName: school.dbName,
    });

    const user = await tenantClient.user.findUnique({
      where: { id: payload.sub },
      include: { adminProfile: true },
    });

    if (!user || user.status !== 'active') {
      throw new UnauthorizedException('User no longer valid');
    }

    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        adminLevel: user.adminProfile?.adminLevel ?? null,
      },
      school: {
        name: school.name,
        schoolCode: school.schoolCode,
      },
    };
  }

  // =========================================================
  // SUPER ADMIN LOGIN
  // =========================================================

  async superAdminLogin(dto: SuperAdminLoginDto) {
    // 1. Find super admin in master DB
    const superAdmin = await this.masterPrisma.superAdmin.findUnique({
      where: {
        email: dto.email.trim().toLowerCase(),
      },
    });

    if (!superAdmin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 2. Verify password
    const passwordValid = await bcrypt.compare(
      dto.password,
      superAdmin.passwordHash,
    );

    if (!passwordValid || superAdmin.status !== 'ACTIVE') {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 3. Build super admin JWT payload
    const payload: JwtPayload = {
      sub: superAdmin.id,
      email: superAdmin.email,
      role: 'SUPER_ADMIN',
      schoolCode: '',
      schemaName: '',
      dbName: null,
      tenancyMode: 'DATABASE',
    };

    // 4. Generate tokens
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    // 5. Return authenticated super admin
    return {
      accessToken,
      refreshToken,
      user: {
        id: superAdmin.id,
        name: superAdmin.name,
        email: superAdmin.email,
        role: 'SUPER_ADMIN',
      },
    };
  }
}
