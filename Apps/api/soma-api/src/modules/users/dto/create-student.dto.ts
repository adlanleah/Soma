import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateStudentDto {
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsString()
  @IsNotEmpty()
  grade!: string;

  @IsIn(['6-10', '11-13', '14-16', '17-18'])
  ageGroup!: string;

  @IsOptional()
  @IsString()
  classId?: string;
}
