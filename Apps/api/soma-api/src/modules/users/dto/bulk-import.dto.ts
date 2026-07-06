import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class BulkUserRow {
  firstName!: string;
  lastName!: string;
  role!: 'TEACHER' | 'STUDENT' | 'PARENT';
  grade?: string;
  ageGroup?: string;
  parentOfStudentEmail?: string; // used only for PARENT rows
}

export class BulkImportDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkUserRow)
  users!: BulkUserRow[];
}
