import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { MasterPrismaService } from '../../database/master-prisma/master-prisma.service';
import { TenantConnectionService } from '../../database/tenant-connection/tenant-connection.service';
import { LoginDto } from './dto/login.dto';
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

    if (user.status !== 'active') {
      throw new UnauthorizedException('Account is not active yet');
    }

    // 5. Build JWT payload
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

    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

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
}
