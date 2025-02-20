import { IsEmail, IsString, IsStrongPassword } from 'class-validator';

// TODO: Revisar las validaciones de negocio
export class RegisterUserDto {
  @IsString()
  name: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @IsStrongPassword()
  password: string;
}
