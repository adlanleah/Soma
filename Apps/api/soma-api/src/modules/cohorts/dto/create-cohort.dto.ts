import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CreateCohortDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsDateString()
  endDate!: string;
}
