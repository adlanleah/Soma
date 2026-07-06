import { IsNotEmpty, IsString } from 'class-validator';

export class CreateParentDto {
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsString()
  @IsNotEmpty()
  studentId!: string; // the User.id of the student to link
}
