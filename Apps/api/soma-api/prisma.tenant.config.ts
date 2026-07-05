import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/tenant/schema.prisma',
  datasource: {
    url: process.env.TENANT_DATABASE_URL,
  },
});
