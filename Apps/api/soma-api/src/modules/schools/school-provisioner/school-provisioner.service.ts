import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'pg';
import { execSync } from 'child_process';
import * as path from 'path';

@Injectable()
export class SchoolProvisionerService {
  private readonly logger = new Logger(SchoolProvisionerService.name);

  constructor(private config: ConfigService) {}

  /**
   * Prevents unsafe characters from being used in a PostgreSQL
   * database identifier.
   */
  private assertSafeIdentifier(name: string): void {
    if (!/^[a-z0-9_]+$/.test(name)) {
      throw new Error(`Unsafe database identifier: ${name}`);
    }
  }

  /**
   * Creates a fully isolated PostgreSQL database for a new school
   * and synchronizes the tenant schema into it.
   */
  async provisionDatabase(dbName: string): Promise<void> {
    this.assertSafeIdentifier(dbName);

    const client = new Client({
      connectionString: this.config.get<string>('POSTGRES_ADMIN_URL'),
    });

    await client.connect();

    try {
      const exists = await client.query(
        `SELECT 1 FROM pg_database WHERE datname = $1`,
        [dbName],
      );

      if (exists.rowCount === 0) {
        await client.query(`CREATE DATABASE "${dbName}"`);

        this.logger.log(`Database "${dbName}" created`);
      } else {
        this.logger.log(`Database "${dbName}" already exists`);
      }
    } finally {
      await client.end();
    }

    this.runTenantMigrations(dbName);
  }

  /**
   * Synchronizes the Prisma tenant schema with the newly
   * provisioned school database.
   */
  private runTenantMigrations(dbName: string): void {
    const host = this.config.get<string>('POSTGRES_HOST');
    const port = this.config.get<string>('POSTGRES_PORT');
    const user = this.config.get<string>('POSTGRES_USER');
    const pass = this.config.get<string>('POSTGRES_PASSWORD');

    const tenantUrl = `postgresql://${user}:${pass}@${host}:${port}/${dbName}`;

    const schemaPath = path.join(process.cwd(), 'prisma/tenant/schema.prisma');

    const configPath = path.join(process.cwd(), 'prisma.tenant.config.ts');

    this.logger.log(`Running tenant migrations for ${dbName}`);

    execSync(
      `npx prisma db push --schema="${schemaPath}" --config="${configPath}"`,
      {
        env: {
          ...process.env,
          TENANT_DATABASE_URL: tenantUrl,
        },
        stdio: 'inherit',
      },
    );
  }
}
