import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '.prisma/tenant-client';
import { PrismaPg } from '@prisma/adapter-pg';

export interface TenantContext {
  dbName: string;
}

@Injectable()
export class TenantConnectionService {
  private clients = new Map<string, PrismaClient>();

  constructor(private config: ConfigService) {}

  getClient(ctx: TenantContext): PrismaClient {
    if (this.clients.has(ctx.dbName)) {
      return this.clients.get(ctx.dbName)!;
    }

    const host = this.config.get<string>('POSTGRES_HOST');
    const port = Number(this.config.get<string>('POSTGRES_PORT'));
    const user = this.config.get<string>('POSTGRES_USER');
    const password = this.config.get<string>('POSTGRES_PASSWORD');

    const adapter = new PrismaPg({
      host,
      port,
      user,
      password,
      database: ctx.dbName,
    });
    const client = new PrismaClient({ adapter });

    this.clients.set(ctx.dbName, client);
    return client;
  }
}
