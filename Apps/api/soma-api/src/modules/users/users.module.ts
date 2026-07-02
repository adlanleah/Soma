import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { BulkImportService } from './bulk-import/bulk-import.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, BulkImportService],
})
export class UsersModule {}
