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
   * Creates isolation for a new school.
   * SCHEMA mode (default/Starter plan): creates a Postgres schema inside
   *   the master database — cheap, fast, good up to ~100 students.
   * DATABASE mode (Growth/Enterprise): creates a fully separate database
   *   — full isolation, used for bigger schools.
   */
  async provisionSchema(schemaName: string): Promise<void> {
    const client = new Client({
      connectionString: this.config.get('DATABASE_URL'),
    });
    await client.connect();
    try {
      await client.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);
      this.logger.log(`Schema "${schemaName}" created`);
    } finally {
      await client.end();
    }

    await this.runTenantMigrations(schemaName, 'schema');
  }

  async provisionDatabase(dbName: string): Promise<void> {
    const client = new Client({
      connectionString: this.config.get('POSTGRES_ADMIN_URL'),
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
      }
    } finally {
      await client.end();
    }

    await this.runTenantMigrations(dbName, 'database');
  }

  private async runTenantMigrations(
    name: string,
    mode: 'schema' | 'database',
  ): Promise<void> {
    const host = this.config.get<string>('POSTGRES_HOST');
    const port = this.config.get<string>('POSTGRES_PORT');
    const user = this.config.get<string>('POSTGRES_USER');
    const pass = this.config.get<string>('POSTGRES_PASSWORD');

    const tenantUrl =
      mode === 'database'
        ? `postgresql://${user}:${pass}@${host}:${port}/${name}`
        : `postgresql://${user}:${pass}@${host}:${port}/soma_master?schema=${name}`;

    const schemaPath = path.join(process.cwd(), 'prisma/tenant/schema.prisma');

    this.logger.log(`Running tenant migrations for ${name} (${mode})`);

    await new Promise<void>((resolve, reject) => {
      try {
        execSync(`npx prisma db push --schema=${schemaPath} --skip-generate`, {
          env: { ...process.env, TENANT_DATABASE_URL: tenantUrl },
          stdio: 'inherit',
        });
        resolve();
      } catch (error) {
        // Ensure we reject with an Error object to satisfy lint rules
        if (error instanceof Error) {
          reject(error);
        } else {
          reject(new Error(String(error)));
        }
      }
    });
  }
}
