import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '.prisma/tenant-client';
import { PrismaPg } from '@prisma/adapter-pg';

export interface TenantContext {
  dbName: string;
}

@Injectable()
export class TenantConnectionService implements OnModuleDestroy {
  private readonly logger = new Logger(TenantConnectionService.name);

  private readonly clients = new Map<string, PrismaClient>();

  constructor(private readonly config: ConfigService) {}

  getClient(ctx: TenantContext): PrismaClient {
    const dbName = ctx.dbName.trim();

    if (!/^[a-z0-9_]+$/.test(dbName)) {
      throw new Error('Invalid tenant database name');
    }

    const existingClient = this.clients.get(dbName);

    if (existingClient) {
      return existingClient;
    }

    const host = this.config.get<string>('POSTGRES_HOST');
    const port = Number(this.config.get<string>('POSTGRES_PORT'));
    const user = this.config.get<string>('POSTGRES_USER');
    const password = this.config.get<string>('POSTGRES_PASSWORD');

    if (!host || !port || !user || !password) {
      throw new Error('PostgreSQL connection configuration is incomplete');
    }

    const adapter = new PrismaPg({
      host,
      port,
      user,
      password,
      database: dbName,
    });

    const client = new PrismaClient({ adapter });

    this.clients.set(dbName, client);

    this.logger.log(`Tenant connection initialized: ${dbName}`);

    return client;
  }

  async disconnectTenant(dbName: string): Promise<void> {
    const client = this.clients.get(dbName);

    if (!client) {
      return;
    }

    await client.$disconnect();
    this.clients.delete(dbName);

    this.logger.log(`Tenant connection closed: ${dbName}`);
  }

  async onModuleDestroy(): Promise<void> {
    await Promise.all(
      [...this.clients.entries()].map(async ([dbName, client]) => {
        try {
          await client.$disconnect();
          this.logger.log(`Disconnected tenant: ${dbName}`);
        } catch (error) {
          this.logger.error(
            `Failed to disconnect tenant: ${dbName}`,
            error instanceof Error ? error.stack : String(error),
          );
        }
      }),
    );

    this.clients.clear();
  }
}
