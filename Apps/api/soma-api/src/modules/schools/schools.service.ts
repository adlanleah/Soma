import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';

import { randomBytes, createHash } from 'crypto';
import * as bcrypt from 'bcrypt';

import { MasterPrismaService } from '../../database/master-prisma/master-prisma.service';
import { TenantConnectionService } from '../../database/tenant-connection/tenant-connection.service';
import { SchoolProvisionerService } from '../schools/school-provisioner/school-provisioner.service';
import { CreateSchoolDto } from './dto/create-school.dto';

@Injectable()
export class SchoolsService {
  private readonly logger = new Logger(SchoolsService.name);

  constructor(
    private readonly prisma: MasterPrismaService,
    private readonly provisioner: SchoolProvisionerService,
    private readonly tenantConnection: TenantConnectionService,
  ) {}

  private get masterPrisma(): MasterPrismaService {
    return this.prisma;
  }

  private slugify(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private generateDatabaseName(slug: string): string {
    // PostgreSQL identifiers are limited to 63 bytes.
    const safeSlug = slug.replace(/-/g, '_').slice(0, 58);

    return `soma_${safeSlug}`;
  }

  private getFrontendUrl(): string {
    return (process.env.FRONTEND_URL || 'http://localhost:4200').replace(
      /\/+$/,
      '',
    );
  }

  private createActivationUrl(schoolCode: string, rawToken: string): string {
    return (
      `${this.getFrontendUrl()}/activate-account` +
      `?schoolCode=${encodeURIComponent(schoolCode)}` +
      `&token=${encodeURIComponent(rawToken)}`
    );
  }

  private async generateUniqueSchoolCode(name: string): Promise<string> {
    const prefix =
      name
        .toUpperCase()
        .replace(/[^A-Z]/g, '')
        .slice(0, 4) || 'SOMA';

    for (let attempt = 0; attempt < 20; attempt++) {
      const number = Math.floor(1000 + Math.random() * 9000);
      const schoolCode = `${prefix}-${number}`;

      const existing = await this.masterPrisma.school.findUnique({
        where: { schoolCode },
      });

      if (!existing) {
        return schoolCode;
      }
    }

    throw new BadRequestException(
      'Unable to generate a unique school code. Please try again.',
    );
  }

  // PRINCIPAL INVITATION

  private async createPrincipalInvitation(
    dbName: string,
    schoolCode: string,
    adminFirstName: string,
    adminLastName: string,
    adminEmail: string,
  ) {
    const tenant = this.tenantConnection.getClient({ dbName });

    // Generate a cryptographically secure activation token.
    const rawToken = randomBytes(32).toString('hex');

    // Only the token hash is stored in the database.
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');

    // Generate a random initial password.
    // The principal must replace it during account activation.
    const initialPassword = randomBytes(32).toString('hex');

    const passwordHash = await bcrypt.hash(initialPassword, 12);

    // Invitation expires after 48 hours.
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

    await tenant.user.create({
      data: {
        firstName: adminFirstName,
        lastName: adminLastName,
        email: adminEmail.trim().toLowerCase(),
        passwordHash,
        role: 'ADMIN',
        status: 'pending',

        adminProfile: {
          create: {
            adminLevel: 'PRINCIPAL',
            title: 'Principal',
          },
        },

        invitations: {
          create: {
            tokenHash,
            expiresAt,
          },
        },
      },
    });

    return {
      activationUrl: this.createActivationUrl(schoolCode, rawToken),
      expiresAt,
    };
  }

  // ENSURE PRINCIPAL ACCOUNT EXISTS

  private async ensurePrincipalAccount(
    dbName: string,
    schoolCode: string,
    adminFirstName: string,
    adminLastName: string,
    adminEmail: string,
  ) {
    const tenant = this.tenantConnection.getClient({ dbName });

    const normalizedEmail = adminEmail.trim().toLowerCase();

    // Find the existing principal account, if any.
    const existingPrincipal = await tenant.user.findUnique({
      where: {
        email: normalizedEmail,
      },
      include: {
        adminProfile: true,
      },
    });

    // CASE 1: No principal exists.
    // Create the account and its first invitation.
    if (!existingPrincipal) {
      const invitation = await this.createPrincipalInvitation(
        dbName,
        schoolCode,
        adminFirstName,
        adminLastName,
        normalizedEmail,
      );

      return {
        accountStatus: 'pending',
        invitation,
      };
    }

    // CASE 2: Email belongs to a different role.
    // Never take over another user's account.
    if (existingPrincipal.role !== 'ADMIN') {
      throw new ConflictException(
        'The principal email already belongs to a non-administrator account. Manual review is required.',
      );
    }

    // CASE 3: Administrator exists but is not a principal.
    if (
      !existingPrincipal.adminProfile ||
      existingPrincipal.adminProfile.adminLevel !== 'PRINCIPAL'
    ) {
      throw new ConflictException(
        'An administrator account exists for this email, but it is not configured as a principal. Manual review is required.',
      );
    }

    // CASE 4: Principal has already activated their account.
    // Preserve the account and do not issue another invitation.
    if (existingPrincipal.status === 'active') {
      return {
        accountStatus: 'active',
        invitation: null,
      };
    }

    // Only pending principals can receive a replacement invitation.
    if (existingPrincipal.status !== 'pending') {
      throw new ConflictException(
        `The existing principal account has status "${existingPrincipal.status}". Manual review is required.`,
      );
    }

    // CASE 5: Existing principal is pending.
    // Generate a fresh activation token.
    const rawToken = randomBytes(32).toString('hex');

    const tokenHash = createHash('sha256').update(rawToken).digest('hex');

    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

    // Replace outstanding invitations atomically.
    // Replace outstanding invitations atomically using a nested Prisma write.
    await tenant.user.update({
      where: {
        id: existingPrincipal.id,
      },
      data: {
        invitations: {
          updateMany: {
            where: {
              usedAt: null,
            },
            data: {
              usedAt: new Date(),
            },
          },
          create: {
            tokenHash,
            expiresAt,
          },
        },
      },
    });
    return {
      accountStatus: 'pending',
      invitation: {
        activationUrl: this.createActivationUrl(schoolCode, rawToken),
        expiresAt,
      },
    };
  }

  // CREATE SCHOOL

  async create(dto: CreateSchoolDto) {
    const name = dto.name.trim();
    const country = dto.country.trim();
    const city = dto.city.trim();
    const address = dto.address.trim();
    const phone = dto.phone.trim();

    const adminFirstName = dto.adminFirstName.trim();
    const adminLastName = dto.adminLastName.trim();
    const adminEmail = dto.adminEmail.trim().toLowerCase();
    const adminPhone = dto.adminPhone.trim();

    const slug = this.slugify(name);

    if (!slug) {
      throw new BadRequestException('Please provide a valid school name.');
    }

    const emailPrefix = slug.replace(/-/g, '').slice(0, 20);
    const dbName = this.generateDatabaseName(slug);

    // Check for existing school records.
    const existing = await this.masterPrisma.school.findFirst({
      where: {
        OR: [
          {
            name: {
              equals: name,
              mode: 'insensitive',
            },
          },
          { slug },
          { emailPrefix },
          { dbName },
        ],
      },
    });

    if (existing) {
      throw new BadRequestException(
        'A school with this name or identifier already exists.',
      );
    }

    const schoolCode = await this.generateUniqueSchoolCode(name);

    // Save the master school record before provisioning.
    const school = await this.masterPrisma.school.create({
      data: {
        name,
        slug,
        schoolCode,
        emailPrefix,

        country,
        city,
        address,
        phone,
        website: dto.website?.trim() || null,

        plan: dto.plan,
        status: 'PENDING',

        tenancyMode: 'DATABASE',
        dbName,
        schemaName: 'public',

        adminFirstName,
        adminLastName,
        adminEmail,
        adminPhone,
      },
    });

    try {
      // 1. Provision the isolated school database.
      await this.provisioner.provisionDatabase(dbName);

      this.logger.log(`Database provisioned for ${school.name}`);

      // 2. Ensure the principal account and invitation exist.
      const principal = await this.ensurePrincipalAccount(
        dbName,
        schoolCode,
        adminFirstName,
        adminLastName,
        adminEmail,
      );

      // 3. Activate the school after successful provisioning.
      const activated = await this.masterPrisma.school.update({
        where: {
          id: school.id,
        },
        data: {
          status: 'ACTIVE',
        },
      });

      this.logger.log(
        `School ${activated.name} successfully provisioned (${activated.schoolCode})`,
      );

      return {
        id: activated.id,
        name: activated.name,
        schoolCode: activated.schoolCode,
        plan: activated.plan,
        status: activated.status,
        tenancyMode: activated.tenancyMode,

        admin: {
          firstName: activated.adminFirstName,
          lastName: activated.adminLastName,
          email: activated.adminEmail,
          role: 'ADMIN',
          adminLevel: 'PRINCIPAL',
          accountStatus: principal.accountStatus,
        },

        invitation: principal.invitation
          ? {
              activationUrl: principal.invitation.activationUrl,
              expiresAt: principal.invitation.expiresAt,
              status: 'PENDING',
            }
          : null,
      };
    } catch (error) {
      this.logger.error(
        `School setup failed for ${school.name}`,
        error instanceof Error ? error.stack : String(error),
      );

      await this.masterPrisma.school.update({
        where: {
          id: school.id,
        },
        data: {
          status: 'SUSPENDED',
        },
      });

      if (error instanceof ConflictException) {
        throw error;
      }

      throw new ServiceUnavailableException(
        'The school record was saved, but its database or principal account setup failed. Please retry provisioning.',
      );
    }
  }

  // RETRY SCHOOL PROVISIONING

  async retryProvisioning(schoolId: string) {
    const school = await this.masterPrisma.school.findUnique({
      where: {
        id: schoolId,
      },
    });

    if (!school) {
      throw new NotFoundException('School not found.');
    }

    if (school.status === 'ACTIVE') {
      throw new BadRequestException('This school is already active.');
    }

    if (!school.dbName || !school.adminEmail) {
      throw new BadRequestException(
        'School database or principal details are missing.',
      );
    }

    try {
      // 1. Provision or verify the existing tenant database.
      await this.provisioner.provisionDatabase(school.dbName);

      this.logger.log(`Database verified for ${school.name}`);

      // 2. Create or recover the principal account.
      const principal = await this.ensurePrincipalAccount(
        school.dbName,
        school.schoolCode,
        school.adminFirstName,
        school.adminLastName,
        school.adminEmail,
      );

      // 3. Activate the school after successful recovery.
      const activated = await this.masterPrisma.school.update({
        where: {
          id: school.id,
        },
        data: {
          status: 'ACTIVE',
        },
      });

      this.logger.log(`School recovery completed: ${activated.name}`);

      return {
        id: activated.id,
        name: activated.name,
        schoolCode: activated.schoolCode,
        status: activated.status,
        plan: activated.plan,
        tenancyMode: activated.tenancyMode,

        admin: {
          firstName: activated.adminFirstName,
          lastName: activated.adminLastName,
          email: activated.adminEmail,
          role: 'ADMIN',
          adminLevel: 'PRINCIPAL',
          accountStatus: principal.accountStatus,
        },

        invitation: principal.invitation
          ? {
              activationUrl: principal.invitation.activationUrl,
              expiresAt: principal.invitation.expiresAt,
              status: 'PENDING',
            }
          : null,
      };
    } catch (error) {
      // Do not suspend a school merely because an account conflict
      // requires manual investigation.
      if (error instanceof ConflictException) {
        throw error;
      }

      this.logger.error(
        `School recovery failed for ${school.name}`,
        error instanceof Error ? error.stack : String(error),
      );

      await this.masterPrisma.school.update({
        where: {
          id: school.id,
        },
        data: {
          status: 'SUSPENDED',
        },
      });

      throw new ServiceUnavailableException(
        'School recovery failed. The existing school and tenant data have been preserved.',
      );
    }
  }

  // GET ALL SCHOOLS

  async findAll() {
    return this.masterPrisma.school.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
  // FIND SCHOOL BY CODE

  async findByCode(schoolCode: string) {
    return this.masterPrisma.school.findUnique({
      where: {
        schoolCode: schoolCode.trim().toUpperCase(),
      },
    });
  }

  // SUPER ADMIN DASHBOARD SUMMARY

  async getDashboardSummary() {
    const schools = await this.masterPrisma.school.findMany({
      select: {
        id: true,
        dbName: true,
      },
    });

    const provisionedSchools = schools.filter((school) =>
      Boolean(school.dbName),
    );

    const results = await Promise.allSettled(
      provisionedSchools.map(async (school) => {
        const tenant = this.tenantConnection.getClient({
          dbName: school.dbName!,
        });

        const [students, teachers, parents, admins] = await Promise.all([
          tenant.user.count({
            where: {
              role: 'STUDENT',
            },
          }),

          tenant.user.count({
            where: {
              role: 'TEACHER',
            },
          }),

          tenant.user.count({
            where: {
              role: 'PARENT',
            },
          }),

          tenant.user.count({
            where: {
              role: 'ADMIN',
            },
          }),
        ]);

        return {
          students,
          teachers,
          parents,
          admins,
        };
      }),
    );

    const totals = {
      students: 0,
      teachers: 0,
      parents: 0,
      admins: 0,
    };

    let successfulSchoolDatabases = 0;
    let unavailableSchoolDatabases = 0;

    for (const result of results) {
      if (result.status === 'fulfilled') {
        successfulSchoolDatabases++;

        totals.students += result.value.students;
        totals.teachers += result.value.teachers;
        totals.parents += result.value.parents;
        totals.admins += result.value.admins;
      } else {
        unavailableSchoolDatabases++;

        this.logger.error(
          'Unable to retrieve user counts from a school database.',
          result.reason instanceof Error
            ? result.reason.stack
            : String(result.reason),
        );
      }
    }

    const [activeSchools, pendingSchools, suspendedSchools] = await Promise.all(
      [
        this.masterPrisma.school.count({
          where: {
            status: 'ACTIVE',
          },
        }),

        this.masterPrisma.school.count({
          where: {
            status: 'PENDING',
          },
        }),

        this.masterPrisma.school.count({
          where: {
            status: 'SUSPENDED',
          },
        }),
      ],
    );

    return {
      schoolsSigned: schools.length,

      activeSchools,
      pendingSchools,
      suspendedSchools,

      ...totals,

      provisionedSchoolDatabases: provisionedSchools.length,
      successfulSchoolDatabases,
      unavailableSchoolDatabases,

      isUserCountComplete: unavailableSchoolDatabases === 0,
    };
  }
}
