import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateSuperAdminDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @IsEmail()
  @MaxLength(254)
  email!: string;
}
