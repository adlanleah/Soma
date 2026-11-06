import {
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class BulkUserRow {
  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsIn(['TEACHER', 'STUDENT', 'PARENT'])
  role!: 'TEACHER' | 'STUDENT' | 'PARENT';

  @IsOptional()
  @IsString()
  grade?: string;

  @IsOptional()
  @IsIn(['6-10', '11-13', '14-16', '17-18'])
  ageGroup?: string;

  @IsOptional()
  @IsString()
  linkedStudentEmail?: string; // used only for PARENT rows — matches an already-created student's generated email
}

export class BulkImportDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkUserRow)
  users!: BulkUserRow[];
}

export { BulkUserRow };
